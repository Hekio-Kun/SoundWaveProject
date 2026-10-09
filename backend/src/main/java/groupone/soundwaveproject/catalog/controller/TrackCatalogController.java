package groupone.soundwaveproject.catalog.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import groupone.soundwaveproject.catalog.dto.request.RecordPlayRequest;
import groupone.soundwaveproject.catalog.dto.response.RecordPlayResponse;
import groupone.soundwaveproject.catalog.dto.response.TrackResponse;
import groupone.soundwaveproject.catalog.service.TrackCatalogService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/v1/tracks")
@RequiredArgsConstructor
public class TrackCatalogController {
    private final TrackCatalogService trackCatalogService;

    /**
     * Lấy metadata bài hát và URL streaming phục vụ phát nhạc trực tuyến (Phase 1).
     * Áp dụng quy tắc BR-09: Trả về 404 nếu không tìm thấy hoặc bài hát chưa ở trạng thái PUBLISHED.
     */
    @GetMapping("/{idOrSlug}")
    public ResponseEntity<TrackResponse> getTrack(@PathVariable String idOrSlug) {
        log.info("Fetching playback metadata for track identifier: {}", idOrSlug);
        TrackResponse response = trackCatalogService.getTrackByIdOrSlug(idOrSlug);
        return ResponseEntity.ok(response);
    }

    /**
     * Ghi nhận lượt nghe khi client đạt ngưỡng phát hợp lệ (Phase 3 - BR.13).
     * Cho phép cả Guest lẫn Authenticated User gọi.
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
