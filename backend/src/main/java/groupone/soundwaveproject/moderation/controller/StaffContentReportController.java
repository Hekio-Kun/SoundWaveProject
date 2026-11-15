package groupone.soundwaveproject.moderation.controller;

import groupone.soundwaveproject.moderation.dto.request.ResolveContentReportRequest;
import groupone.soundwaveproject.moderation.dto.request.TakeDownTrackRequest;
import groupone.soundwaveproject.moderation.dto.response.EvidenceDownloadResponse;
import groupone.soundwaveproject.moderation.dto.response.StaffContentReportResponse;
import groupone.soundwaveproject.moderation.service.StaffContentReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.InvalidMediaTypeException;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/staff")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STAFF')")
public class StaffContentReportController {

    private final StaffContentReportService staffContentReportService;

    @GetMapping("/reports")
    public ResponseEntity<List<StaffContentReportResponse>> getReportsQueue() {
        return ResponseEntity.ok(staffContentReportService.getReportsQueue());
    }

    @GetMapping("/reports/{id}")
    public ResponseEntity<StaffContentReportResponse> getReportById(@PathVariable Long id) {
        return ResponseEntity.ok(staffContentReportService.getReportById(id));
    }

    /**
     * Tải xuống tệp tài liệu chứng minh bản quyền từ Cloud Storage về máy của Staff.
     */
    @GetMapping("/reports/{id}/evidence/download")
    public ResponseEntity<byte[]> downloadEvidence(@PathVariable Long id) {
        EvidenceDownloadResponse file = staffContentReportService.downloadEvidence(id);
        ContentDisposition disposition = ContentDisposition.attachment()
                .filename(file.fileName(), StandardCharsets.UTF_8)
                .build();
        MediaType mediaType;
        try {
            mediaType = MediaType.parseMediaType(file.contentType());
        } catch (InvalidMediaTypeException ex) {
            mediaType = MediaType.APPLICATION_OCTET_STREAM;
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .contentType(mediaType)
                .contentLength(file.bytes().length)
                .body(file.bytes());
    }

    @PostMapping("/reports/{id}/resolve")
    public ResponseEntity<StaffContentReportResponse> resolveReport(
            @PathVariable Long id,
            @Valid @RequestBody ResolveContentReportRequest request,
            Principal principal
    ) {
        return ResponseEntity.ok(staffContentReportService.resolveReport(id, request, principal.getName()));
    }

    @PostMapping("/tracks/{trackId}/takedown")
    public ResponseEntity<Void> takeDownTrack(
            @PathVariable Long trackId,
            @Valid @RequestBody TakeDownTrackRequest request,
            Principal principal
    ) {
        staffContentReportService.takeDownPublishedTrack(trackId, request, principal.getName());
        return ResponseEntity.noContent().build();
    }
}

