package groupone.soundwaveproject.lyrics.controller;

import groupone.soundwaveproject.lyrics.dto.request.SavePersonalLyricRequest;
import groupone.soundwaveproject.lyrics.dto.response.LyricDetailResponse;
import groupone.soundwaveproject.lyrics.dto.response.TrackLyricsBundleResponse;
import groupone.soundwaveproject.lyrics.service.LyricService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST Controller cho tính năng Lời bài hát người nghe (UC-16 & UC-18).
 */
@RestController
@RequestMapping("/api/v1/tracks/{trackId}/lyrics")
@RequiredArgsConstructor
public class LyricController {

    private final LyricService lyricService;

    /**
     * Lấy bundle lời bài hát của track (Official Lyrics và Personal Lyrics nếu đã đăng nhập) (UC-16).
     */
    @GetMapping
    public ResponseEntity<TrackLyricsBundleResponse> getTrackLyrics(
            @PathVariable Long trackId,
            Authentication authentication
    ) {
        String userEmail = authentication != null ? authentication.getName() : null;
        return ResponseEntity.ok(lyricService.getTrackLyrics(trackId, userEmail));
    }

    /**
     * Lưu hoặc cập nhật lời bài hát cá nhân của người nghe (UC-18).
     */
    @PostMapping("/personal")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<LyricDetailResponse> savePersonalLyric(
            @PathVariable Long trackId,
            @Valid @RequestBody SavePersonalLyricRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(lyricService.savePersonalLyric(authentication.getName(), trackId, request));
    }

    /**
     * Xóa lời bài hát cá nhân của người nghe (UC-18).
     */
    @DeleteMapping("/personal")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> deletePersonalLyric(
            @PathVariable Long trackId,
            @RequestParam(required = false, defaultValue = "CUSTOM") String lyricType,
            Authentication authentication
    ) {
        lyricService.deletePersonalLyric(authentication.getName(), trackId, lyricType);
        return ResponseEntity.ok(Map.of("message", "Personal lyric deleted successfully."));
    }
}
