package groupone.soundwaveproject.lyrics.controller;

import groupone.soundwaveproject.lyrics.dto.request.SaveOfficialLyricRequest;
import groupone.soundwaveproject.lyrics.dto.request.UpdateOfficialLyricStatusRequest;
import groupone.soundwaveproject.lyrics.dto.response.LyricDetailResponse;
import groupone.soundwaveproject.lyrics.dto.response.StaffTrackLyricSummaryResponse;
import groupone.soundwaveproject.lyrics.service.StaffOfficialLyricService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

/**
 * Controller quản lý lời bài hát chính thức dành riêng cho Staff và Admin (UC-26 / Section 6.4).
 */
@RestController
@RequestMapping("/api/v1/staff/lyrics")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
public class StaffOfficialLyricController {

    private final StaffOfficialLyricService staffOfficialLyricService;

    /**
     * Tìm kiếm và xem danh sách bài hát cùng trạng thái lời bài hát chính thức.
     */
    @GetMapping("/tracks")
    public ResponseEntity<Page<StaffTrackLyricSummaryResponse>> searchTracks(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @PageableDefault(sort = "id", direction = Sort.Direction.DESC, size = 15) Pageable pageable
    ) {
        return ResponseEntity.ok(staffOfficialLyricService.searchTracksForLyrics(search, status, pageable));
    }

    /**
     * Xem lời bài hát chính thức theo Track ID (kể cả bản DRAFT).
     */
    @GetMapping("/tracks/{trackId}")
    public ResponseEntity<LyricDetailResponse> getOfficialLyric(@PathVariable Long trackId) {
        LyricDetailResponse response = staffOfficialLyricService.getOfficialLyric(trackId);
        return ResponseEntity.ok(response);
    }

    /**
     * Tạo mới hoặc cập nhật lời bài hát chính thức.
     */
    @PostMapping
    public ResponseEntity<LyricDetailResponse> saveOfficialLyric(
            @Valid @RequestBody SaveOfficialLyricRequest request,
            Principal principal
    ) {
        return ResponseEntity.ok(staffOfficialLyricService.saveOrUpdateOfficialLyric(principal.getName(), request));
    }

    /**
     * Đổi trạng thái DRAFT / PUBLISHED của lời bài hát chính thức.
     */
    @PatchMapping("/tracks/{trackId}/status")
    public ResponseEntity<LyricDetailResponse> updateStatus(
            @PathVariable Long trackId,
            @Valid @RequestBody UpdateOfficialLyricStatusRequest request,
            Principal principal
    ) {
        return ResponseEntity.ok(staffOfficialLyricService.updateStatus(principal.getName(), trackId, request.status()));
    }

    /**
     * Xóa lời bài hát chính thức của bài hát.
     */
    @DeleteMapping("/tracks/{trackId}")
    public ResponseEntity<Map<String, String>> deleteOfficialLyric(
            @PathVariable Long trackId,
            Principal principal
    ) {
        staffOfficialLyricService.deleteOfficialLyric(principal.getName(), trackId);
        return ResponseEntity.ok(Map.of("message", "Official lyric deleted successfully."));
    }
}
