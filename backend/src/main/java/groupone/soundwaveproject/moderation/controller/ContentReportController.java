package groupone.soundwaveproject.moderation.controller;

import groupone.soundwaveproject.moderation.dto.request.CreateContentReportRequest;
import groupone.soundwaveproject.moderation.dto.response.ContentReportResponse;
import groupone.soundwaveproject.moderation.service.ContentReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Controller tiếp nhận các báo cáo vi phạm nội dung hoặc lỗi lời bài hát từ người dùng (UC-31.1).
 */
@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ContentReportController {

    private final ContentReportService contentReportService;

    /**
     * Báo cáo lỗi lời bài hát (Lệch thời gian, sai lời, nội dung không phù hợp).
     */
    @PostMapping("/lyrics")
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
