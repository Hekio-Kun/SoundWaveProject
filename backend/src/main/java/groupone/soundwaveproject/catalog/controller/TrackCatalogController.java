package groupone.soundwaveproject.catalog.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import groupone.soundwaveproject.catalog.dto.request.RecordPlayRequest;
import groupone.soundwaveproject.catalog.dto.response.RecordPlayResponse;
import groupone.soundwaveproject.catalog.dto.response.TrackResponse;
import groupone.soundwaveproject.catalog.service.TrackCatalogService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for public track discovery, streaming playback metadata retrieval,
 * track recommendations, and playback play-count tracking.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/tracks")
@RequiredArgsConstructor
public class TrackCatalogController {
    private final TrackCatalogService trackCatalogService;

    /**
     * Retrieves a paginated list of published tracks for public browsing, search, and playlist curation.
     *
     * @param genre Optional genre slug filter.
     * @param search Optional search term matching title, description, or album.
     * @param sort Sorting criteria ('trending', 'title', or default newest).
     * @param pageable Pagination configuration.
     * @return {@link ResponseEntity} containing a paginated {@link Page} of {@link TrackResponse}.
     */
    @GetMapping
    public ResponseEntity<Page<TrackResponse>> getTracks(
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String sort,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        log.info("Fetching public track catalog: genre={}, search={}, sort={}, page={}",
                genre, search, sort, pageable.getPageNumber());
        return ResponseEntity.ok(trackCatalogService.getFilteredTracks(genre, search, sort, pageable));
    }

    /**
     * Retrieves track playback metadata and audio streaming URL (Stream Music Phase 1).
     * <p>
     * Enforces business rule BR-09: Returns 404 NOT_FOUND if the track does not exist
     * or is not in PUBLISHED status.
     *
     * @param idOrSlug Numeric ID or unique slug of the requested track.
     * @return {@link ResponseEntity} containing {@link TrackResponse} with CDN audio URL.
     */
    @GetMapping("/{idOrSlug}")
    public ResponseEntity<TrackResponse> getTrack(@PathVariable String idOrSlug) {
        log.info("Fetching playback metadata for track identifier: {}", idOrSlug);
        TrackResponse response = trackCatalogService.getTrackByIdOrSlug(idOrSlug);
        return ResponseEntity.ok(response);
    }

    /**
     * Retrieves recommended tracks related to the specified track based on genre.
     *
     * @param idOrSlug Numeric ID or unique slug of the currently played track.
     * @param limit Maximum number of recommended tracks to return (default: 5).
     * @return {@link ResponseEntity} containing a list of recommended {@link TrackResponse} objects.
     */
    @GetMapping("/{idOrSlug}/recommendations")
    public ResponseEntity<java.util.List<TrackResponse>> getRecommendations(
            @PathVariable String idOrSlug,
            @org.springframework.web.bind.annotation.RequestParam(defaultValue = "5") int limit
    ) {
        log.info("Fetching recommendations for track identifier: {}, limit: {}", idOrSlug, limit);
        return ResponseEntity.ok(trackCatalogService.getRecommendations(idOrSlug, limit));
    }

    /**
     * Records a track playback event when client reaches the valid listening threshold (Phase 3 - BR.13).
     * Permits access by both guest listeners and authenticated users.
     *
     * @param id Identifier of the played track.
     * @param request Listening metrics including duration listened and completed status.
     * @param authentication Current user authentication context (nullable for guests).
     * @return {@link ResponseEntity} containing {@link RecordPlayResponse} with updated play count.
     */
    @PostMapping("/{id}/play")
    public ResponseEntity<RecordPlayResponse> recordPlay(
            @PathVariable Long id,
            @Valid @RequestBody RecordPlayRequest request,
            Authentication authentication
    ) {
        String userEmail = extractUserEmail(authentication);
        log.info("Recording playback for trackId={}, userEmail={}, listenedDurationMs={}, completed={}",
                id, userEmail != null ? userEmail : "guest", request.listenedDurationMs(), request.completed());

        RecordPlayResponse response = trackCatalogService.recordTrackPlay(id, request, userEmail);
        return ResponseEntity.ok(response);
    }

    /**
     * Helper to extract the user email from the authentication principal.
     *
     * @param authentication Current security authentication context.
     * @return The user's email if authenticated; null if anonymous or unauthenticated.
     */
    private String extractUserEmail(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        Object principal = authentication.getPrincipal();
        if ("anonymousUser".equals(principal) || "anonymousUser".equals(authentication.getName())) {
            return null;
        }
        return authentication.getName();
    }
}
