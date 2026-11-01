package groupone.soundwaveproject.catalog.controller;

import groupone.soundwaveproject.catalog.dto.response.UnifiedSearchResponse;
import groupone.soundwaveproject.catalog.service.PublicSearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for UC-9: Search Public Catalog.
 * Provides unified keyword search across published tracks, albums, active creators,
 * and officially approved lyrics.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/search")
@RequiredArgsConstructor
public class PublicSearchController {

    private final PublicSearchService publicSearchService;

    /**
     * Executes public catalog search.
     *
     * @param query Search keyword (must be >= 2 characters).
     * @param type Search category ('ALL', 'SONGS', 'ALBUMS', 'CREATORS', 'LYRICS'). Default is 'ALL'.
     * @param pageable Pagination configuration.
     * @return {@link ResponseEntity} containing {@link UnifiedSearchResponse}.
     */
    @GetMapping
    public ResponseEntity<UnifiedSearchResponse> search(
            @RequestParam(name = "q") String query,
            @RequestParam(name = "type", required = false, defaultValue = "ALL") String type,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        log.info("Public search requested: query='{}', type='{}', page={}", query, type, pageable.getPageNumber());
        return ResponseEntity.ok(publicSearchService.search(query, type, pageable));
    }
}

