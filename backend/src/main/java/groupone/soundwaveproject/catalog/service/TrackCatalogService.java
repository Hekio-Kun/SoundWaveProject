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

/**
 * Core business service handling public track catalog queries, streaming metadata resolution,
 * recommendations, and playback play-count tracking.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TrackCatalogService {
    private final TrackRepository trackRepository;
    private final UserAccountPublicService userAccountPublicService;
    private final ListeningHistoryPublicService listeningHistoryPublicService;

    /**
     * Retrieves published track metadata and CDN streaming audio URL (Stream Music Phase 1).
     * <p>
     * Enforces business rule BR-09: Only tracks with publication status 'PUBLISHED'
     * can be accessed for audio streaming.
     *
     * @param idOrSlug Numeric ID or unique URL slug of the track.
     * @return {@link TrackResponse} containing playback details and metadata.
     * @throws ResourceNotFoundException if the track does not exist or is not published.
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
     * Retrieves a paginated and filtered list of published tracks for public exploration,
     * keyword search, and playlist curation.
     *
     * @param genre Genre slug filter, or null/empty/all to ignore genre restriction.
     * @param search Query keyword matching title, slug, description, or album title.
     * @param sort Sort option ('trending' for play count, 'title' for alphabetical, or latest).
     * @param pageable Pagination settings.
     * @return Paginated {@link Page} of {@link TrackResponse}.
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
     * Alias method corresponding to Step 18 in Sequence Diagram [UC-8] Filter Public Catalog:
     * {@code getFilteredTracks(genre, search, sort, page, size)}.
     *
     * @param genre Genre slug filter.
     * @param search Query keyword filter.
     * @param sort Sort option.
     * @param pageable Pagination configuration.
     * @return Paginated {@link Page} of {@link TrackResponse}.
     */
    @Transactional(readOnly = true)
    public Page<TrackResponse> getFilteredTracks(String genre, String search, String sort, Pageable pageable) {
        return getPublishedTracks(genre, search, sort, pageable);
    }

    /**
     * Records a valid stream playback event, incrementing play count and persisting listening history.
     * <p>
     * Enforces business rule BR.13:
     * 1. Atomically increments track play count cache within the database transaction.
     * 2. If the user is authenticated, saves a record to listening history.
     *
     * @param trackId ID of the track played.
     * @param request Listening metrics submitted by client.
     * @param userEmail Email of the authenticated user, or null if guest.
     * @return {@link RecordPlayResponse} containing updated play count and history status.
     * @throws ResourceNotFoundException if the track does not exist or is not published.
     */
    @Transactional
    public RecordPlayResponse recordTrackPlay(Long trackId, RecordPlayRequest request, String userEmail) {
        Track track = trackRepository.findById(trackId)
                .filter(t -> t.getPublicationStatus() == TrackPublicationStatus.PUBLISHED)
                .orElseThrow(() -> new ResourceNotFoundException("TRACK_UNAVAILABLE", "Track unavailable"));

        // 1. Increment play count in database transaction
        trackRepository.incrementPlayCount(trackId);
        long updatedPlayCount = (track.getPlayCountCache() != null ? track.getPlayCountCache() : 0L) + 1;

        // 2. Persist listening history if user is authenticated
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

    /**
     * Retrieves track recommendations matching the same genre as the current track,
     * falling back to other published tracks if needed.
     *
     * @param idOrSlug Current track ID or slug to exclude from results.
     * @param limit Maximum number of recommended tracks to return.
     * @return List of recommended {@link TrackResponse} items.
     */
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

    /**
     * Maps a {@link Track} entity to its corresponding public {@link TrackResponse} DTO.
     *
     * @param track Track entity to map.
     * @return Populated {@link TrackResponse} containing audio URL, genre, album, and creator summaries.
     */
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
