package groupone.soundwaveproject.catalog.service;

import groupone.soundwaveproject.authentication.service.UserAccountPublicService;
import groupone.soundwaveproject.catalog.dto.request.CreateGenreRequest;
import groupone.soundwaveproject.catalog.dto.request.UpdateGenreRequest;
import groupone.soundwaveproject.catalog.dto.response.AdminGenrePageResponse;
import groupone.soundwaveproject.catalog.dto.response.AdminGenreResponse;
import groupone.soundwaveproject.catalog.dto.response.GenreResponse;
import groupone.soundwaveproject.catalog.entity.Genre;
import groupone.soundwaveproject.catalog.repository.GenreRepository;
import groupone.soundwaveproject.catalog.repository.TrackRepository;
import groupone.soundwaveproject.exception.BadRequestOperationException;
import groupone.soundwaveproject.exception.ConflictOperationException;
import groupone.soundwaveproject.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

/**
 * Service xử lý các nghiệp vụ liên quan đến Thể loại âm nhạc (Genre).
 * Bao gồm danh mục công khai cho người nghe (UC-8) và quản lý thể loại của Quản trị viên (UC-26: Manage Genres).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GenreService {

    private final GenreRepository genreRepository;
    private final TrackRepository trackRepository;
    private final UserAccountPublicService userAccountPublicService;

    /**
     * Lấy danh sách thể loại đang hoạt động (is_active = true) sắp xếp theo tên tăng dần (UC-8 Phase 1).
     */
    @Transactional(readOnly = true)
    public List<GenreResponse> getActiveGenres() {
        log.info("Fetching active genres for public catalog filter.");
        return genreRepository.findByIsActiveTrueOrderByNameAsc().stream()
                .map(this::mapToResponse)
                .toList();
    }

    /**
     * Tìm kiếm thể loại theo slug nếu đang hoạt động (UC-8 Phase 1).
     */
    @Transactional(readOnly = true)
    public Optional<Genre> findActiveGenreBySlug(String slug) {
        if (slug == null || slug.isBlank() || "all".equalsIgnoreCase(slug)) {
            return Optional.empty();
        }
        return genreRepository.findBySlug(slug)
                .filter(g -> Boolean.TRUE.equals(g.getIsActive()));
    }

    /**
     * Tìm kiếm và lọc danh sách thể loại phục vụ màn hình quản trị của Admin (UC-26: Manage Genres).
     *
     * @param search   Từ khóa tìm kiếm theo tên hoặc slug
     * @param active   Bộ lọc trạng thái kích hoạt (null để lấy tất cả)
     * @param pageable Cấu hình phân trang và sắp xếp
     * @return DTO trang danh sách thể loại quản trị
     */
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public AdminGenrePageResponse getGenres(String search, Boolean active, Pageable pageable) {
        String normalizedSearch = (search == null || search.isBlank()) ? null : search.trim();
        Page<AdminGenreResponse> genres = genreRepository.searchForAdmin(normalizedSearch, active, pageable)
                .map(this::toAdminGenreResponse);
        return AdminGenrePageResponse.from(genres);
    }

    /**
     * Xem thông tin chi tiết một thể loại theo ID dành cho Admin (UC-26 View Genre Detail).
     *
     * @param id ID của thể loại cần tra cứu
     * @return DTO chi tiết thể loại quản trị
     * @throws ResourceNotFoundException nếu không tìm thấy thể loại
     */
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public AdminGenreResponse getGenre(Long id) {
        return toAdminGenreResponse(findGenre(id));
    }

    /**
     * Tạo mới thể loại âm nhạc và ghi nhận ID của Admin tạo (UC-26.1 Create Genre).
     * Kiểm tra tính duy nhất của tên và slug theo ngoại lệ 26.0.E1.
     *
     * @param request          Dữ liệu tạo thể loại (tên, slug, mô tả)
     * @param currentUserEmail Email của Admin đang thực hiện tạo
     * @return DTO thể loại vừa được tạo
     * @throws ConflictOperationException nếu tên hoặc slug đã tồn tại trong hệ thống
     */
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public AdminGenreResponse createGenre(CreateGenreRequest request, String currentUserEmail) {
        // 1. Chuẩn hóa tên và tạo slug tự động nếu chưa có
        String name = request.name().trim();
        String slug = resolveSlug(request.slug(), name);

        // 2. Kiểm tra trùng lặp tên và slug theo quy tắc duy nhất (26.0.E1)
        validateUniqueValues(name, slug, null);

        // 3. Lấy ID của Admin thực hiện từ email đăng nhập
        Long creatorId = userAccountPublicService.getUserIdByEmail(currentUserEmail);

        // 4. Khởi tạo và lưu thực thể thể loại mới vào cơ sở dữ liệu
        Genre genre = new Genre(name, slug, normalizeDescription(request.description()), creatorId);
        return toAdminGenreResponse(genreRepository.save(genre));
    }

    /**
     * Cập nhật thông tin tên, slug và mô tả của thể loại (UC-26.3 Update Genre).
     *
     * @param id      ID của thể loại cần cập nhật
     * @param request Dữ liệu cập nhật mới
     * @return DTO thể loại sau khi cập nhật
     * @throws ResourceNotFoundException  nếu không tìm thấy thể loại
     * @throws ConflictOperationException nếu tên hoặc slug bị trùng với thể loại khác
     */
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public AdminGenreResponse updateGenre(Long id, UpdateGenreRequest request) {
        // 1. Tìm thể loại theo ID
        Genre genre = findGenre(id);

        // 2. Chuẩn hóa dữ liệu cập nhật
        String name = request.name().trim();
        String slug = resolveSlug(request.slug(), name);

        // 3. Kiểm tra tính duy nhất không trùng với các thể loại khác
        validateUniqueValues(name, slug, id);

        // 4. Cập nhật và lưu thay đổi
        genre.update(name, slug, normalizeDescription(request.description()), LocalDateTime.now(ZoneOffset.UTC));
        return toAdminGenreResponse(genreRepository.save(genre));
    }

    /**
     * Kích hoạt hoặc vô hiệu hóa thể loại âm nhạc theo quy tắc bảo toàn toàn vẹn dữ liệu (UC-26.4 / BR-23 Update Genre Status).
     *
     * @param id     ID của thể loại cần thay đổi trạng thái
     * @param active Trạng thái mới (true: kích hoạt, false: vô hiệu hóa)
     * @return DTO thể loại sau khi cập nhật trạng thái
     * @throws ResourceNotFoundException nếu không tìm thấy thể loại
     */
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public AdminGenreResponse updateActiveState(Long id, boolean active) {
        // 1. Tìm thể loại cần thay đổi trạng thái
        Genre genre = findGenre(id);

        // 2. Cập nhật trạng thái nếu có sự thay đổi
        if (genre.isActive() != active) {
            genre.changeActiveState(active, LocalDateTime.now(ZoneOffset.UTC));
            genreRepository.save(genre);
        }
        return toAdminGenreResponse(genre);
    }

    /**
     * Xóa vĩnh viễn thể loại âm nhạc nếu thể loại đó chưa từng được liên kết với bài hát nào (UC-26.2 / BR-23 Delete Genre).
     * Áp dụng quy tắc BR-23: Nếu thể loại đã có bài hát sử dụng, cấm xóa và yêu cầu chuyển sang vô hiệu hóa.
     *
     * @param id ID của thể loại cần xóa
     * @throws ResourceNotFoundException  nếu không tìm thấy thể loại
     * @throws ConflictOperationException nếu thể loại đang được tham chiếu bởi dữ liệu bài hát (BR-23 / 26.0.E2)
     */
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void deleteGenre(Long id) {
        // 1. Tìm thể loại theo ID
        Genre genre = findGenre(id);

        // 2. Kiểm tra ràng buộc BR-23: Không được xóa vật lý nếu đang được bài hát tham chiếu
        if (trackRepository.existsByGenre_Id(id)) {
            throw new ConflictOperationException("GENRE_IN_USE",
                    "Thể loại này đang được bài hát sử dụng, không thể xóa theo quy tắc toàn vẹn BR-23. Vui lòng vô hiệu hóa thể loại thay thế.");
        }

        // 3. Xóa thể loại khỏi cơ sở dữ liệu
        genreRepository.delete(genre);
    }

    /**
     * Chuyển đổi thực thể Genre sang DTO AdminGenreResponse.
     *
     * @param genre Thực thể Genre
     * @return DTO AdminGenreResponse
     */
    public AdminGenreResponse toAdminGenreResponse(Genre genre) {
        if (genre == null) {
            return null;
        }
        return new AdminGenreResponse(
                genre.getId(),
                genre.getName(),
                genre.getSlug(),
                genre.getDescription(),
                genre.isActive(),
                genre.getCreatedByUserId(),
                genre.getCreatedAt(),
                genre.getUpdatedAt()
        );
    }

    private Genre findGenre(Long id) {
        return genreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "GENRE_NOT_FOUND", "Genre was not found with ID: " + id));
    }

    private void validateUniqueValues(String name, String slug, Long excludedId) {
        boolean duplicateName = (excludedId == null)
                ? genreRepository.existsByNameIgnoreCase(name)
                : genreRepository.existsByNameIgnoreCaseAndIdNot(name, excludedId);
        if (duplicateName) {
            throw new ConflictOperationException("GENRE_NAME_EXISTS", "A genre with this name already exists.");
        }

        boolean duplicateSlug = (excludedId == null)
                ? genreRepository.existsBySlugIgnoreCase(slug)
                : genreRepository.existsBySlugIgnoreCaseAndIdNot(slug, excludedId);
        if (duplicateSlug) {
            throw new ConflictOperationException("GENRE_SLUG_EXISTS", "A genre with this slug already exists.");
        }
    }

    private String resolveSlug(String requestedSlug, String name) {
        String source = (requestedSlug == null || requestedSlug.isBlank()) ? name : requestedSlug;
        String slug = Normalizer.normalize(source.replace('đ', 'd').replace('Đ', 'D'), Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .toLowerCase(Locale.ROOT)
                .trim()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+|-+$", "");
        if (slug.isBlank()) {
            throw new BadRequestOperationException("INVALID_GENRE_SLUG", "Genre slug could not be generated from the provided value.");
        }
        if (slug.length() > 100) {
            throw new BadRequestOperationException("INVALID_GENRE_SLUG", "Genre slug must not exceed 100 characters.");
        }
        return slug;
    }

    private String normalizeDescription(String description) {
        return (description == null || description.isBlank()) ? null : description.trim();
    }

    private GenreResponse mapToResponse(Genre genre) {
        return new GenreResponse(
                genre.getId(),
                genre.getName(),
                genre.getSlug(),
                genre.getDescription()
        );
    }
}
