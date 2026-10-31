package groupone.soundwaveproject.lyrics.controller;

import groupone.soundwaveproject.lyrics.dto.request.CustomLyricRequest;
import groupone.soundwaveproject.lyrics.dto.response.CustomLyricResponse;
import groupone.soundwaveproject.lyrics.dto.response.TrackLyricsBundleResponse;
import groupone.soundwaveproject.lyrics.service.LyricService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller xử lý các tác vụ liên quan đến lời bài hát:
 * - Lấy gói lời bài hát (Official Lyrics + Custom Lyrics) (UC-18.1)
 * - Tạo/Cập nhật lời bài hát tùy chỉnh của cá nhân (UC-18.2, UC-18.3, UC-31.1)
 * - Xóa lời bài hát tùy chỉnh của cá nhân (UC-18.4)
 */
@RestController
@RequestMapping("/api/v1/tracks/{trackId}/lyrics")
@RequiredArgsConstructor
public class PersonalLyricController {

    private final LyricService lyricService;

    /**
     * Lấy toàn bộ lời bài hát của bài hát (Official Lyrics kèm Custom Lyrics của Listener nếu đã đăng nhập).
     */
    @GetMapping
    public ResponseEntity<TrackLyricsBundleResponse> getLyrics(
            @PathVariable Long trackId,
            Authentication authentication
    ) {
        String email = authentication != null ? authentication.getName() : null;
        TrackLyricsBundleResponse response = lyricService.getSynchronousLyrics(trackId, email);
        return ResponseEntity.ok(response);
    }

    /**
     * Tạo mới hoặc cập nhật lời bài hát cá nhân (Custom Lyric) của người dùng hiện tại (UC-18.2 & UC-18.3).
     */
    @PostMapping(path = {"/personal", "/custom"})
    public ResponseEntity<CustomLyricResponse> saveOrUpdateCustomLyric(
            @PathVariable Long trackId,
            @Valid @RequestBody CustomLyricRequest request,
            Authentication authentication
    ) {
        CustomLyricResponse response = lyricService.saveOrUpdatePersonalLyric(
                trackId,
                request.lyricType(),
                request.lyricContent(),
                authentication.getName()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Lấy danh sách lời bài hát cá nhân (Custom Lyrics) của người dùng hiện tại đối với bài hát.
     */
    @GetMapping(path = {"/personal", "/custom"})
    public ResponseEntity<List<CustomLyricResponse>> getMyCustomLyrics(
            @PathVariable Long trackId,
            Authentication authentication
    ) {
        List<CustomLyricResponse> responses = lyricService.getPersonalLyrics(trackId, authentication.getName());
        return ResponseEntity.ok(responses);
    }

    /**
     * Xóa lời bài hát cá nhân (Custom Lyric) của người dùng hiện tại (UC-18.4).
     */
    @DeleteMapping(path = {"/personal", "/custom"})
    public ResponseEntity<Void> deleteCustomLyric(
            @PathVariable Long trackId,
            @RequestParam(defaultValue = "CUSTOM") String lyricType,
            Authentication authentication
    ) {
        lyricService.deletePersonalLyric(trackId, authentication.getName(), lyricType);
        return ResponseEntity.noContent().build();
    }
}
