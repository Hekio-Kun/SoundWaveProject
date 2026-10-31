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

import groupone.soundwaveproject.moderation.dto.request.ApproveTrackRequest;
import groupone.soundwaveproject.moderation.dto.request.RejectTrackRequest;
import groupone.soundwaveproject.moderation.dto.response.SubmissionDetailResponse;
import groupone.soundwaveproject.moderation.dto.response.SubmissionQueueItemResponse;
import groupone.soundwaveproject.moderation.dto.response.SubmissionStatsResponse;
import groupone.soundwaveproject.moderation.entity.SubmissionStatus;
import groupone.soundwaveproject.moderation.entity.SubmissionType;
import groupone.soundwaveproject.moderation.service.ModerationService;

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
    private final ModerationService moderationService;

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

    /**
     * Lấy danh sách yêu cầu cập nhật lời bài hát cần kiểm duyệt (UC-24.6).
     */
    @GetMapping("/submissions")
    public ResponseEntity<Page<SubmissionQueueItemResponse>> getLyricSubmissions(
            @RequestParam(required = false) SubmissionStatus status,
            @RequestParam(required = false) String search,
            @PageableDefault(sort = "submittedAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(moderationService.getQueue(status, SubmissionType.LYRIC_UPDATE, search, pageable));
    }

    /**
     * Lấy thống kê số lượng yêu cầu cập nhật lời bài hát.
     */
    @GetMapping("/submissions/stats")
    public ResponseEntity<SubmissionStatsResponse> getLyricSubmissionStats() {
        return ResponseEntity.ok(moderationService.getQueueStats(SubmissionType.LYRIC_UPDATE));
    }

    /**
     * Xem chi tiết yêu cầu cập nhật lời bài hát (kèm lời mới đề xuất, lời hiện tại, âm thanh).
     */
    @GetMapping("/submissions/{id}")
    public ResponseEntity<SubmissionDetailResponse> getLyricSubmissionDetail(@PathVariable Long id) {
        return ResponseEntity.ok(moderationService.getSubmissionDetail(id));
    }

    /**
     * Phê duyệt lời bài hát đề xuất (UC-24.6).
     */
    @PostMapping("/submissions/{id}/approve")
    public ResponseEntity<SubmissionDetailResponse> approveLyricSubmission(
            @PathVariable Long id,
            @Valid @RequestBody(required = false) ApproveTrackRequest request,
            Principal principal
    ) {
        return ResponseEntity.ok(moderationService.approveSubmission(id, request, principal.getName()));
    }

    /**
     * Từ chối lời bài hát đề xuất (UC-24.6).
     */
    @PostMapping("/submissions/{id}/reject")
    public ResponseEntity<SubmissionDetailResponse> rejectLyricSubmission(
            @PathVariable Long id,
            @Valid @RequestBody RejectTrackRequest request,
            Principal principal
    ) {
        return ResponseEntity.ok(moderationService.rejectSubmission(id, request, principal.getName()));
    }
}
