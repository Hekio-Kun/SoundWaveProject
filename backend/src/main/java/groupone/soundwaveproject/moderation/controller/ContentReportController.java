package groupone.soundwaveproject.moderation.controller;

import groupone.soundwaveproject.moderation.dto.request.CreateContentReportRequest;
import groupone.soundwaveproject.moderation.dto.request.CreateTrackReportRequest;
import groupone.soundwaveproject.moderation.dto.response.ContentReportResponse;
import groupone.soundwaveproject.moderation.dto.response.MyReportHistoryResponse;
import groupone.soundwaveproject.moderation.dto.response.TrackReportResponse;
import groupone.soundwaveproject.moderation.service.ContentReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller tiếp nhận các báo cáo vi phạm nội dung (UC-22.1)
 * hoặc lỗi lời bài hát (UC-31.1) từ người nghe đã đăng nhập.
 */
@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ContentReportController {

    private final ContentReportService contentReportService;

    /**
     * Báo cáo vi phạm nội dung đối với bài hát đã phát hành (UC-22.1).
     * Yêu cầu người nghe đã đăng nhập (BR-36).
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TrackReportResponse> reportTrack(
            @Valid @RequestBody CreateTrackReportRequest request,
            Authentication authentication
    ) {
        TrackReportResponse response = contentReportService.submitTrackReport(
                authentication.getName(),
                request
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Lấy toàn bộ lịch sử các báo cáo vi phạm nội dung do người nghe gửi (UC-22.2).
     */
    @GetMapping("/my-reports")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<MyReportHistoryResponse>> getMyReports(Authentication authentication) {
        List<MyReportHistoryResponse> response = contentReportService.getMyReports(authentication.getName());
        return ResponseEntity.ok(response);
    }

    /**
     * Kiểm tra xem người dùng hiện tại đã có báo cáo PENDING cho bài hát hay chưa.
     */
    @GetMapping("/check")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> checkPendingReport(
            @RequestParam("trackId") Long trackId,
            Authentication authentication
    ) {
        boolean hasPending = contentReportService.checkPendingReport(
                authentication.getName(),
                trackId
        );
        return ResponseEntity.ok(Map.of(
                "trackId", trackId,
                "hasPendingReport", hasPending
        ));
    }

    /**
     * Báo cáo lỗi lời bài hát (Lệch thời gian, sai lời, nội dung không phù hợp) (UC-31.1).
     */
    @PostMapping("/lyrics")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ContentReportResponse> reportLyric(
            @Valid @RequestBody CreateContentReportRequest request,
            Authentication authentication
    ) {
        ContentReportResponse response = contentReportService.submitLyricReport(
                authentication.getName(),
                request
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
