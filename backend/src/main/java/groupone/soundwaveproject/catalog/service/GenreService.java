package groupone.soundwaveproject.catalog.service;

import groupone.soundwaveproject.catalog.dto.response.GenreResponse;
import groupone.soundwaveproject.catalog.entity.Genre;
import groupone.soundwaveproject.catalog.repository.GenreRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service xử lý nghiệp vụ thể loại phục vụ Public Catalog (UC-8 Phase 1).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GenreService {

    private final GenreRepository genreRepository;

    /**
     * Lấy danh sách thể loại đang hoạt động (is_active = true) sắp xếp theo tên tăng dần.
     */
    @Transactional(readOnly = true)
    public List<GenreResponse> getActiveGenres() {
        log.info("Fetching active genres for public catalog filter.");
        return genreRepository.findByIsActiveTrueOrderByNameAsc().stream()
                .map(this::mapToResponse)
                .toList();
    }

    /**
     * Tìm kiếm thể loại theo slug nếu đang hoạt động.
     */
    @Transactional(readOnly = true)
    public Optional<Genre> findActiveGenreBySlug(String slug) {
        if (slug == null || slug.isBlank() || "all".equalsIgnoreCase(slug)) {
            return Optional.empty();
        }
        return genreRepository.findBySlug(slug)
                .filter(g -> Boolean.TRUE.equals(g.getIsActive()));
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
