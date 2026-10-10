package groupone.soundwaveproject.catalog.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import groupone.soundwaveproject.authentication.dto.response.UserProfileSummary;
import groupone.soundwaveproject.authentication.service.UserAccountPublicService;
import groupone.soundwaveproject.catalog.dto.request.RecordPlayRequest;
import groupone.soundwaveproject.catalog.dto.response.RecordPlayResponse;
import groupone.soundwaveproject.catalog.dto.response.TrackResponse;
import groupone.soundwaveproject.catalog.entity.Track;
import groupone.soundwaveproject.catalog.entity.TrackPublicationStatus;
import groupone.soundwaveproject.exception.ResourceNotFoundException;
import groupone.soundwaveproject.catalog.repository.TrackRepository;
import groupone.soundwaveproject.library.service.ListeningHistoryPublicService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class TrackCatalogService {
    private final TrackRepository trackRepository;
    private final UserAccountPublicService userAccountPublicService;
    private final ListeningHistoryPublicService listeningHistoryPublicService;

    /**
     * Lấy thông tin bài hát và URL streaming trực tiếp từ CDN (Phase 1).
     * Áp dụng quy tắc BR-09: Chỉ bài hát có publication_status = 'PUBLISHED' mới có thể truy cập để nghe.
     */
    @Transactional(readOnly = true)
    public TrackResponse getTrackByIdOrSlug(String idOrSlug) {
        if (idOrSlug == null || idOrSlug.isBlank()) {
            throw new ResourceNotFoundException("TRACK_UNAVAILABLE", "Track unavailable");
        }

        Track track;
        if (idOrSlug.matches("\\d+")) {
            Long trackId = Long.valueOf(idOrSlug);
            track = trackRepository.findByIdAndPublicationStatus(trackId, TrackPublicationStatus.PUBLISHED)
                    .orElseThrow(() -> new ResourceNotFoundException("TRACK_UNAVAILABLE", "Track unavailable"));
        } else {
            track = trackRepository.findBySlugAndPublicationStatus(idOrSlug, TrackPublicationStatus.PUBLISHED)
                    .orElseThrow(() -> new ResourceNotFoundException("TRACK_UNAVAILABLE", "Track unavailable"));
        }

        return mapToTrackResponse(track);
    }

    /**
     * Lấy danh sách các bài hát đã xuất bản (PUBLISHED) phục vụ hiển thị catalog công khai, tìm kiếm và thêm vào playlist.
     */
    @Transactional(readOnly = true)
    public Page<TrackResponse> getPublishedTracks(String genre, String search, String sort, Pageable pageable) {
        List<Track> allPublished = trackRepository.findAll().stream()
                .filter(t -> t.getPublicationStatus() == TrackPublicationStatus.PUBLISHED)
                .toList();

        if (genre != null && !genre.isBlank() && !"all".equalsIgnoreCase(genre)) {
            allPublished = allPublished.stream()
                    .filter(t -> t.getGenre() != null && genre.equalsIgnoreCase(t.getGenre().getSlug()))
                    .toList();
        }

        if (search != null && !search.isBlank()) {
            String lowerSearch = search.trim().toLowerCase();
            allPublished = allPublished.stream()
                    .filter(t -> (t.getTitle() != null && t.getTitle().toLowerCase().contains(lowerSearch))
                            || (t.getSlug() != null && t.getSlug().toLowerCase().contains(lowerSearch))
                            || (t.getDescription() != null && t.getDescription().toLowerCase().contains(lowerSearch))
                            || (t.getAlbum() != null && t.getAlbum().getTitle() != null && t.getAlbum().getTitle().toLowerCase().contains(lowerSearch)))
                    .toList();
        }

        Comparator<Track> comparator;
        if ("trending".equalsIgnoreCase(sort)) {
            comparator = Comparator.comparing(
                    (Track t) -> t.getPlayCountCache() != null ? t.getPlayCountCache() : 0L
            ).reversed();
        } else if ("title".equalsIgnoreCase(sort)) {
            comparator = Comparator.comparing(
                    Track::getTitle, String.CASE_INSENSITIVE_ORDER
            );
        } else {
            comparator = Comparator.comparing(
                    Track::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())
            );
        }

        List<Track> sortedList = allPublished.stream().sorted(comparator).toList();

        int pageNumber = pageable.getPageNumber();
        int pageSize = pageable.getPageSize() > 0 ? pageable.getPageSize() : 20;
        int fromIndex = Math.min(pageNumber * pageSize, sortedList.size());
        int toIndex = Math.min(fromIndex + pageSize, sortedList.size());

        List<TrackResponse> pagedResponses = sortedList.subList(fromIndex, toIndex).stream()
                .map(this::mapToTrackResponse)
                .toList();

        return new PageImpl<>(pagedResponses, pageable, sortedList.size());
    }

    /**
     * Alias method tương ứng với Step 18 trong Sequence Diagram [UC-8] Filter Public Catalog:
     * 18. getFilteredTracks(genre, search, sort, page, size)
     */
    @Transactional(readOnly = true)
    public Page<TrackResponse> getFilteredTracks(String genre, String search, String sort, Pageable pageable) {
        return getPublishedTracks(genre, search, sort, pageable);
    }

    /**
     * Ghi nhận lượt nghe và lịch sử nghe nhạc khi người dùng đạt ngưỡng hợp lệ (Phase 3 - BR.13).
     */
    @Transactional
    public RecordPlayResponse recordTrackPlay(Long trackId, RecordPlayRequest request, String userEmail) {
        Track track = trackRepository.findById(trackId)
                .filter(t -> t.getPublicationStatus() == TrackPublicationStatus.PUBLISHED)
                .orElseThrow(() -> new ResourceNotFoundException("TRACK_UNAVAILABLE", "Track unavailable"));

        // 1. Tăng play count trong database transaction
        trackRepository.incrementPlayCount(trackId);
        long updatedPlayCount = (track.getPlayCountCache() != null ? track.getPlayCountCache() : 0L) + 1;

        // 2. Ghi nhận lịch sử nghe nhạc nếu đã đăng nhập (Authenticated Listener)
        boolean recordedHistory = false;
        if (userEmail != null && !userEmail.isBlank()) {
            Optional<Long> userIdOpt = userAccountPublicService.findUserIdByEmail(userEmail);
            if (userIdOpt.isPresent()) {
                listeningHistoryPublicService.recordListeningHistory(
                        userIdOpt.get(),
                        trackId,
                        request.listenedDurationMs(),
                        Boolean.TRUE.equals(request.completed())
                );
                recordedHistory = true;
            }
        }

        log.info("Play recorded for trackId={}, playCount={}, recordedHistory={}",
                trackId, updatedPlayCount, recordedHistory);

        return new RecordPlayResponse(trackId, updatedPlayCount, recordedHistory);
    }

    @Transactional(readOnly = true)
    public java.util.List<TrackResponse> getRecommendations(String idOrSlug, int limit) {
        Track currentTrack = null;
        try {
            if (idOrSlug != null && !idOrSlug.isBlank()) {
                if (idOrSlug.matches("\\d+")) {
                    currentTrack = trackRepository.findByIdAndPublicationStatus(Long.valueOf(idOrSlug), TrackPublicationStatus.PUBLISHED).orElse(null);
                } else {
                    currentTrack = trackRepository.findBySlugAndPublicationStatus(idOrSlug, TrackPublicationStatus.PUBLISHED).orElse(null);
                }
            }
        } catch (Exception ignored) {}

        Long genreId = (currentTrack != null && currentTrack.getGenre() != null) ? currentTrack.getGenre().getId() : null;
        Long excludeId = currentTrack != null ? currentTrack.getId() : -1L;

        java.util.List<Track> allPublished = trackRepository.findAll().stream()
                .filter(t -> t.getPublicationStatus() == TrackPublicationStatus.PUBLISHED)
                .filter(t -> !t.getId().equals(excludeId))
                .toList();

        java.util.List<Track> filtered = allPublished.stream()
                .filter(t -> genreId != null && t.getGenre() != null && genreId.equals(t.getGenre().getId()))
                .limit(limit)
                .toList();

        if (filtered.isEmpty()) {
            filtered = allPublished.stream().limit(limit).toList();
        }

        return filtered.stream().map(this::mapToTrackResponse).toList();
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
