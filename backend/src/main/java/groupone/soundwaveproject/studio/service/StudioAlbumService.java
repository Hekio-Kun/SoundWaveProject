package groupone.soundwaveproject.studio.service;

import groupone.soundwaveproject.authentication.entity.AppUser;
import groupone.soundwaveproject.authentication.entity.UserStatus;
import groupone.soundwaveproject.authentication.exception.AccountBannedException;
import groupone.soundwaveproject.authentication.exception.AccountUnavailableException;
import groupone.soundwaveproject.authentication.exception.AuthenticationException;
import groupone.soundwaveproject.authentication.repository.AppUserRepository;
import groupone.soundwaveproject.catalog.entity.Album;
import groupone.soundwaveproject.catalog.entity.Track;
import groupone.soundwaveproject.catalog.entity.TrackPublicationStatus;
import groupone.soundwaveproject.catalog.repository.AlbumRepository;
import groupone.soundwaveproject.catalog.repository.TrackRepository;
import groupone.soundwaveproject.exception.BadRequestOperationException;
import groupone.soundwaveproject.exception.ConflictOperationException;
import groupone.soundwaveproject.exception.ResourceNotFoundException;
import groupone.soundwaveproject.media.dto.response.StoredMediaResponse;
import groupone.soundwaveproject.media.service.CloudMediaService;
import groupone.soundwaveproject.studio.dto.request.CreateAlbumRequest;
import groupone.soundwaveproject.studio.dto.request.UpdateAlbumRequest;
import groupone.soundwaveproject.studio.dto.response.StudioAlbumResponse;
import groupone.soundwaveproject.studio.dto.response.StudioTrackResponse;
import groupone.soundwaveproject.studio.mapper.StudioAlbumMapper;
import groupone.soundwaveproject.studio.mapper.StudioTrackMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.text.Normalizer;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.*;
import java.util.regex.Pattern;

/**
 * Service xử lý nghiệp vụ quản lý Album của nghệ sĩ/Listener (UC-21.1 đến UC-21.4).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class StudioAlbumService {

    private final AlbumRepository albumRepository;
    private final TrackRepository trackRepository;
    private final AppUserRepository appUserRepository;
    private final CloudMediaService cloudMediaService;
    private final StudioAlbumMapper studioAlbumMapper;
    private final StudioTrackMapper studioTrackMapper;

    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    /**
     * Lấy danh sách toàn bộ Album do người dùng hiện tại tạo ra (UC-21.2 View Albums).
     *
     * @param currentUserEmail Email của tài khoản đang đăng nhập
     * @return Danh sách DTO Album kèm số lượng bài hát và thông tin tóm tắt
     */
    @Transactional(readOnly = true)
    public List<StudioAlbumResponse> getMyAlbums(String currentUserEmail) {
        AppUser user = getAuthenticatedUser(currentUserEmail);
        List<Album> albums = albumRepository.findByCreatedByUserIdOrderByCreatedAtDesc(user.getId());

        return albums.stream()
                .map(album -> {
                    long trackCount = trackRepository.countByAlbum_Id(album.getId());
                    return studioAlbumMapper.toStudioAlbumResponse(album, (int) trackCount, Collections.emptyList());
                })
                .toList();
    }

    /**
     * Xem thông tin chi tiết một Album cụ thể cùng danh sách bài hát bên trong (UC-21.2 View Albums).
     *
     * @param id               ID của Album cần xem
     * @param currentUserEmail Email của tài khoản đang đăng nhập
     * @return DTO chi tiết Album kèm danh sách bài hát theo thứ tự trackNumber
     */
    @Transactional(readOnly = true)
    public StudioAlbumResponse getAlbumById(Long id, String currentUserEmail) {
        AppUser user = getAuthenticatedUser(currentUserEmail);
        Album album = albumRepository.findByIdAndCreatedByUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Album not found or access denied."));

        List<Track> tracks = trackRepository.findByAlbum_IdOrderByTrackNumberAsc(album.getId());
        return studioAlbumMapper.toStudioAlbumResponse(album, tracks.size(), tracks);
    }

    /**
     * Tạo mới một Album cá nhân ở trạng thái DRAFT và upload ảnh bìa nếu có (UC-21.1 Create Album).
     * Bám sát quy tắc BR-18: Album mới tạo luôn mặc định DRAFT, nếu có bài hát PUBLISHED thì tự động kích hoạt.
     *
     * @param request          Dữ liệu tạo album
     * @param cover            File ảnh bìa album (tùy chọn)
     * @param currentUserEmail Email của tài khoản đang đăng nhập
     * @return DTO Album vừa được tạo
     */
    @Transactional
    public StudioAlbumResponse createAlbum(CreateAlbumRequest request, MultipartFile cover, String currentUserEmail) {
        AppUser user = getAuthenticatedUser(currentUserEmail);
        String cleanTitle = request.getTitle().trim();

        // Kiểm tra tính duy nhất của tên Album theo từng tài khoản (EX01)
        if (albumRepository.existsByCreatedByUserIdAndTitleIgnoreCase(user.getId(), cleanTitle)) {
            throw new ConflictOperationException("An album with the title '" + cleanTitle + "' already exists in your library.");
        }

        // Tải ảnh bìa album lên Cloudinary nếu có (UC-30)
        StoredMediaResponse storedCover = null;
        if (cover != null && !cover.isEmpty()) {
            storedCover = cloudMediaService.uploadAlbumCover(cover, user.getId());
        }

        String uniqueSlug = generateUniqueSlug(cleanTitle);

        Album album = Album.builder()
                .createdByUserId(user.getId())
                .title(cleanTitle)
                .slug(uniqueSlug)
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .releaseDate(request.getReleaseDate())
                .status("DRAFT")
                .coverPublicId(storedCover != null ? storedCover.publicId() : null)
                .coverUrl(storedCover != null ? storedCover.secureUrl() : null)
                .build();

        Album savedAlbum = albumRepository.save(album);

        // Gán các bài hát được chọn vào Album và đánh số thứ tự track_number (BR-23)
        List<Track> assignedTracks = new ArrayList<>();
        if (request.getTrackIds() != null && !request.getTrackIds().isEmpty()) {
            assignedTracks = assignTracksToAlbum(savedAlbum, request.getTrackIds(), user.getId());
        }

        // Đánh giá lại trạng thái xuất bản của Album theo BR-18 và BR-22
        recalculateAndSaveAlbumStatus(savedAlbum);

        log.info("Album '{}' (ID: {}) created by user ID {}", savedAlbum.getTitle(), savedAlbum.getId(), user.getId());
        return studioAlbumMapper.toStudioAlbumResponse(savedAlbum, assignedTracks.size(), assignedTracks);
    }

    /**
     * Cập nhật thông tin Album, thay thế ảnh bìa và sắp xếp lại danh sách bài hát (UC-21.3 Update Album).
     *
     * @param id               ID của Album cần cập nhật
     * @param request          Dữ liệu cập nhật album
     * @param cover            File ảnh bìa mới (tùy chọn)
     * @param currentUserEmail Email của tài khoản đang đăng nhập
     * @return DTO Album sau khi cập nhật
     */
    @Transactional
    public StudioAlbumResponse updateAlbum(Long id, UpdateAlbumRequest request, MultipartFile cover, String currentUserEmail) {
        AppUser user = getAuthenticatedUser(currentUserEmail);
        Album album = albumRepository.findByIdAndCreatedByUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Album not found or access denied."));

        String cleanTitle = request.getTitle().trim();

        // Kiểm tra trùng tên album khác cùng tài khoản (EX01)
        if (albumRepository.existsByCreatedByUserIdAndTitleIgnoreCaseAndIdNot(user.getId(), cleanTitle, id)) {
            throw new ConflictOperationException("Another album with the title '" + cleanTitle + "' already exists.");
        }

        // Nếu đổi tiêu đề thì cập nhật lại slug duy nhất
        if (!album.getTitle().equalsIgnoreCase(cleanTitle)) {
            album.setTitle(cleanTitle);
            album.setSlug(generateUniqueSlug(cleanTitle));
        }

        album.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        album.setReleaseDate(request.getReleaseDate());

        // Nếu tải ảnh bìa mới: upload ảnh mới lên Cloudinary và xóa ảnh cũ
        if (cover != null && !cover.isEmpty()) {
            StoredMediaResponse newCover = cloudMediaService.uploadAlbumCover(cover, user.getId());
            String oldCoverPublicId = album.getCoverPublicId();

            album.setCoverPublicId(newCover.publicId());
            album.setCoverUrl(newCover.secureUrl());

            if (oldCoverPublicId != null && !oldCoverPublicId.isBlank()) {
                cloudMediaService.deleteImageQuietly(oldCoverPublicId);
            }
        }

        // Đồng bộ danh sách bài hát thuộc Album
        List<Track> updatedTracks = syncAlbumTracks(album, request.getTrackIds(), user.getId());

        // Đánh giá lại trạng thái xuất bản theo BR-18 & BR-22
        recalculateAndSaveAlbumStatus(album);

        Album updatedAlbum = albumRepository.save(album);
        log.info("Album '{}' (ID: {}) updated by user ID {}", updatedAlbum.getTitle(), updatedAlbum.getId(), user.getId());

        return studioAlbumMapper.toStudioAlbumResponse(updatedAlbum, updatedTracks.size(), updatedTracks);
    }

    /**
     * Xóa Album cá nhân, gỡ liên kết các bài hát chuyển về bài đơn lẻ và dọn dẹp ảnh Cloudinary (UC-21.4 Delete Album).
     * Bám sát tuyệt đối quy tắc BR-23 & BR-24: KHÔNG xóa bài hát, chỉ gỡ album_id = NULL và track_number = NULL.
     *
     * @param id               ID của Album cần xóa
     * @param currentUserEmail Email của tài khoản đang đăng nhập
     */
    @Transactional
    public void deleteAlbum(Long id, String currentUserEmail) {
        AppUser user = getAuthenticatedUser(currentUserEmail);
        Album album = albumRepository.findByIdAndCreatedByUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Album not found or access denied."));

        // 1. Unlink toàn bộ bài hát trong album: chuyển thành bài hát độc lập (tracks.album_id = NULL)
        trackRepository.unlinkAlbumFromTracks(album.getId(), user.getId());

        // 2. Dọn dẹp ảnh bìa album trên Cloudinary nếu có (POST-3 của UC-21.4)
        if (album.getCoverPublicId() != null && !album.getCoverPublicId().isBlank()) {
            cloudMediaService.deleteImageQuietly(album.getCoverPublicId());
        }

        // 3. Xóa bản ghi Album khỏi database
        albumRepository.delete(album);
        log.info("Album ID {} successfully deleted by user ID {}. Component tracks were unlinked safely.", id, user.getId());
    }

    /**
     * Lấy danh sách các bài hát khả dụng của người dùng để chọn đưa vào Album (chưa thuộc album nào hoặc đang thuộc album này).
     *
     * @param currentAlbumId   ID album hiện tại (nếu đang ở màn hình Edit), có thể null
     * @param currentUserEmail Email người dùng
     * @return Danh sách bài hát khả dụng
     */
    @Transactional(readOnly = true)
    public List<StudioTrackResponse> getAvailableTracksForAlbum(Long currentAlbumId, String currentUserEmail) {
        AppUser user = getAuthenticatedUser(currentUserEmail);
        List<Track> allUserTracks = trackRepository.findByUploaderUserIdOrderByCreatedAtDesc(user.getId());

        return allUserTracks.stream()
                .filter(track -> track.getAlbum() == null || (currentAlbumId != null && track.getAlbum().getId().equals(currentAlbumId)))
                .map(track -> studioTrackMapper.toStudioTrackResponse(track, track.getGenre(), track.getAlbum(), null))
                .toList();
    }

    // ==========================================
    // CÁC HÀM TIỆN ÍCH NỘI BỘ (PRIVATE HELPERS)
    // ==========================================

    /**
     * Gán danh sách bài hát vào Album và đánh số thứ tự track_number.
     */
    private List<Track> assignTracksToAlbum(Album album, List<Long> trackIds, Long currentUserId) {
        List<Track> assigned = new ArrayList<>();
        int trackNumber = 1;

        for (Long trackId : trackIds) {
            Track track = trackRepository.findByIdAndUploaderUserId(trackId, currentUserId)
                    .orElseThrow(() -> new BadRequestOperationException("Track ID " + trackId + " not found or does not belong to you."));

            track.setAlbum(album);
            track.setTrackNumber(trackNumber++);
            assigned.add(trackRepository.save(track));
        }

        return assigned;
    }

    /**
     * Đồng bộ bài hát trong Album: gỡ những bài không còn trong danh sách và cập nhật thứ tự các bài được chọn.
     */
    private List<Track> syncAlbumTracks(Album album, List<Long> trackIds, Long currentUserId) {
        List<Track> currentAlbumTracks = trackRepository.findByAlbum_IdOrderByTrackNumberAsc(album.getId());

        if (trackIds == null || trackIds.isEmpty()) {
            // Gỡ tất cả bài hát nếu danh sách gửi lên là rỗng
            for (Track t : currentAlbumTracks) {
                t.setAlbum(null);
                t.setTrackNumber(null);
                trackRepository.save(t);
            }
            return Collections.emptyList();
        }

        Set<Long> newTrackIdSet = new HashSet<>(trackIds);

        // Gỡ những bài không còn được chọn
        for (Track t : currentAlbumTracks) {
            if (!newTrackIdSet.contains(t.getId())) {
                t.setAlbum(null);
                t.setTrackNumber(null);
                trackRepository.save(t);
            }
        }

        // Cập nhật album và thứ tự bài hát mới
        List<Track> resultTracks = new ArrayList<>();
        int order = 1;
        for (Long trackId : trackIds) {
            Track track = trackRepository.findByIdAndUploaderUserId(trackId, currentUserId)
                    .orElseThrow(() -> new BadRequestOperationException("Track ID " + trackId + " not found or does not belong to you."));

            track.setAlbum(album);
            track.setTrackNumber(order++);
            resultTracks.add(trackRepository.save(track));
        }

        return resultTracks;
    }

    /**
     * Đánh giá lại trạng thái của Album theo Business Rules BR-18 & BR-22:
     * Album chỉ có trạng thái PUBLISHED khi có ít nhất 1 bài hát đã được phê duyệt PUBLISHED.
     */
    private void recalculateAndSaveAlbumStatus(Album album) {
        boolean hasPublishedTrack = trackRepository.existsByAlbum_IdAndPublicationStatus(
                album.getId(), TrackPublicationStatus.PUBLISHED
        );

        if (hasPublishedTrack) {
            album.setStatus("PUBLISHED");
            if (album.getPublishedAt() == null) {
                album.setPublishedAt(LocalDateTime.now(ZoneOffset.UTC));
            }
        } else {
            album.setStatus("DRAFT");
        }
    }

    /**
     * Lấy thông tin tài khoản đã xác thực và kiểm tra tính hợp lệ.
     */
    private AppUser getAuthenticatedUser(String email) {
        if (email == null || email.isBlank()) {
            throw new AuthenticationException("UNAUTHORIZED", "Authentication required.");
        }
        AppUser user = appUserRepository.findByEmailIgnoreCase(email.trim().toLowerCase(Locale.ROOT))
                .filter(u -> u.getDeletedAt() == null)
                .orElseThrow(() -> new AuthenticationException("USER_NOT_FOUND", "Account not found."));

        if (user.getStatus() == UserStatus.BANNED) {
            throw new AccountBannedException();
        }
        if (user.getStatus() == UserStatus.PENDING) {
            throw new AccountUnavailableException("ACCOUNT_PENDING", "Account email has not been verified yet.");
        }
        return user;
    }

    /**
     * Tạo slug thân thiện với URL và tránh trùng lặp.
     */
    private String generateUniqueSlug(String input) {
        String baseSlug = toSlug(input);
        if (baseSlug.isBlank()) baseSlug = "album";
        String candidate = baseSlug + "-" + System.currentTimeMillis();
        return candidate.length() > 220 ? candidate.substring(0, 220) : candidate;
    }

    private String toSlug(String input) {
        String nowhitespace = WHITESPACE.matcher(input).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = NONLATIN.matcher(normalized).replaceAll("");
        return slug.toLowerCase(Locale.ENGLISH);
    }
}
