package groupone.soundwaveproject.catalog.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import groupone.soundwaveproject.authentication.service.UserAccountPublicService;
import groupone.soundwaveproject.catalog.dto.response.PublicAlbumDetailsResponse;
import groupone.soundwaveproject.catalog.dto.response.PublicAlbumResponse;
import groupone.soundwaveproject.catalog.dto.response.TrackResponse;
import groupone.soundwaveproject.catalog.entity.Album;
import groupone.soundwaveproject.catalog.entity.Track;
import groupone.soundwaveproject.catalog.entity.TrackPublicationStatus;
import groupone.soundwaveproject.catalog.repository.AlbumRepository;
import groupone.soundwaveproject.catalog.repository.TrackRepository;
import groupone.soundwaveproject.exception.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Service xử lý nghiệp vụ danh mục Album công khai (Public Album Catalog).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AlbumCatalogService {

    private final AlbumRepository albumRepository;
    private final TrackRepository trackRepository;
    private final UserAccountPublicService userAccountPublicService;

    /**
     * Lấy danh sách các Album đã xuất bản (PUBLISHED) có hỗ trợ tìm kiếm, sắp xếp và phân trang.
     */
    @Transactional(readOnly = true)
    public Page<PublicAlbumResponse> getPublishedAlbums(String search, String sort, Pageable pageable) {
        List<Album> publishedAlbums = albumRepository.findByStatusIgnoreCaseOrderByCreatedAtDesc("PUBLISHED");

        // Chuyển đổi sang danh sách PublicAlbumResponse
        List<PublicAlbumResponse> responses = new ArrayList<>();
        for (Album album : publishedAlbums) {
            int trackCount = (int) trackRepository.countByAlbum_IdAndPublicationStatus(
                    album.getId(), TrackPublicationStatus.PUBLISHED
            );
            PublicAlbumResponse.AlbumCreatorSummary creator = resolveCreatorSummary(album.getCreatedByUserId());

            responses.add(PublicAlbumResponse.builder()
                    .id(album.getId())
                    .title(album.getTitle())
                    .slug(album.getSlug())
                    .description(album.getDescription())
                    .coverUrl(album.getCoverUrl())
                    .releaseDate(album.getReleaseDate())
                    .publishedAt(album.getPublishedAt())
                    .createdAt(album.getCreatedAt())
                    .trackCount(trackCount)
                    .creator(creator)
                    .build());
        }

        // Lọc theo từ khóa tìm kiếm (tiêu đề album, mô tả, tên nghệ sĩ/người tạo)
        if (search != null && !search.isBlank()) {
            String lowerSearch = search.trim().toLowerCase();
            responses = responses.stream()
                    .filter(a -> (a.getTitle() != null && a.getTitle().toLowerCase().contains(lowerSearch))
                            || (a.getDescription() != null && a.getDescription().toLowerCase().contains(lowerSearch))
                            || (a.getCreator() != null && a.getCreator().getDisplayName() != null
                            && a.getCreator().getDisplayName().toLowerCase().contains(lowerSearch)))
                    .toList();
        }

        // Sắp xếp
        if ("title".equalsIgnoreCase(sort)) {
            responses = responses.stream()
                    .sorted(Comparator.comparing(PublicAlbumResponse::getTitle, String.CASE_INSENSITIVE_ORDER))
                    .toList();
        } else if ("tracks".equalsIgnoreCase(sort)) {
            responses = responses.stream()
                    .sorted(Comparator.comparingInt(PublicAlbumResponse::getTrackCount).reversed())
                    .toList();
        } else if ("oldest".equalsIgnoreCase(sort)) {
            responses = responses.stream()
                    .sorted(Comparator.comparing(PublicAlbumResponse::getCreatedAt))
                    .toList();
        } else {
            // Mặc định: Mới nhất trước (publishedAt hoặc createdAt)
            responses = responses.stream()
                    .sorted(Comparator.comparing(
                            (PublicAlbumResponse a) -> a.getPublishedAt() != null ? a.getPublishedAt() : a.getCreatedAt(),
                            Comparator.nullsLast(Comparator.reverseOrder())
                    ))
                    .toList();
        }

        // Phân trang
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), responses.size());
        List<PublicAlbumResponse> pageContent = (start <= end && start < responses.size())
                ? responses.subList(start, end)
                : List.of();

        return new PageImpl<>(pageContent, pageable, responses.size());
    }

    /**
     * Lấy thông tin chi tiết một Album công khai theo ID hoặc slug kèm toàn bộ bài hát đã PUBLISHED.
     */
    @Transactional(readOnly = true)
    public PublicAlbumDetailsResponse getPublishedAlbumByIdOrSlug(String idOrSlug) {
        if (idOrSlug == null || idOrSlug.isBlank()) {
            throw new ResourceNotFoundException("ALBUM_UNAVAILABLE", "Album identifier is required.");
        }

        Album album;
        if (idOrSlug.matches("\\d+")) {
            Long id = Long.valueOf(idOrSlug);
            album = albumRepository.findByIdAndStatusIgnoreCase(id, "PUBLISHED")
                    .orElseThrow(() -> new ResourceNotFoundException("ALBUM_NOT_FOUND", "Album not found or not published."));
        } else {
            album = albumRepository.findBySlugAndStatusIgnoreCase(idOrSlug, "PUBLISHED")
                    .orElseThrow(() -> new ResourceNotFoundException("ALBUM_NOT_FOUND", "Album not found or not published."));
        }

        List<Track> constituentTracks = trackRepository.findByAlbum_IdAndPublicationStatusOrderByTrackNumberAsc(
                album.getId(), TrackPublicationStatus.PUBLISHED
        );

        List<TrackResponse> trackResponses = constituentTracks.stream()
                .map(this::mapToTrackResponse)
                .toList();

        PublicAlbumResponse.AlbumCreatorSummary creator = resolveCreatorSummary(album.getCreatedByUserId());

        return PublicAlbumDetailsResponse.builder()
                .id(album.getId())
                .title(album.getTitle())
                .slug(album.getSlug())
                .description(album.getDescription())
                .coverUrl(album.getCoverUrl())
                .releaseDate(album.getReleaseDate())
                .publishedAt(album.getPublishedAt())
                .createdAt(album.getCreatedAt())
                .trackCount(constituentTracks.size())
                .creator(creator)
                .tracks(trackResponses)
                .build();
    }

    private PublicAlbumResponse.AlbumCreatorSummary resolveCreatorSummary(Long userId) {
        return userAccountPublicService.findUserSummaryById(userId)
                .map(u -> PublicAlbumResponse.AlbumCreatorSummary.builder()
                        .userId(u.userId())
                        .displayName(u.displayName())
                        .avatarUrl(u.avatarUrl())
                        .build())
                .orElseGet(() -> PublicAlbumResponse.AlbumCreatorSummary.builder()
                        .userId(userId)
                        .displayName("SoundWave Artist")
                        .avatarUrl(null)
                        .build());
    }

    private TrackResponse mapToTrackResponse(Track track) {
        TrackResponse.TrackAlbumSummary albumSummary = null;
        if (track.getAlbum() != null) {
            albumSummary = new TrackResponse.TrackAlbumSummary(
                    track.getAlbum().getId(),
                    track.getAlbum().getTitle()
            );
        }

        TrackResponse.TrackCreatorSummary creatorSummary = userAccountPublicService
                .findUserSummaryById(track.getUploaderUserId())
                .map(user -> new TrackResponse.TrackCreatorSummary(
                        user.userId(),
                        user.displayName(),
                        user.avatarUrl()
                ))
                .orElseGet(() -> new TrackResponse.TrackCreatorSummary(
                        track.getUploaderUserId(),
                        "Unknown Artist",
                        null
                ));

        return new TrackResponse(
                track.getId(),
                track.getTitle(),
                track.getSlug(),
                track.getDescription(),
                track.getAudioUrl(),
                track.getCoverUrl(),
                track.getDurationMs(),
                track.getPlayCountCache() != null ? track.getPlayCountCache() : 0L,
                track.getPublicationStatus().name(),
                track.getGenre() != null ? track.getGenre().getSlug() : null,
                track.getGenre() != null ? track.getGenre().getName() : null,
                albumSummary,
                creatorSummary,
                track.getCreatedAt()
        );
    }
}
