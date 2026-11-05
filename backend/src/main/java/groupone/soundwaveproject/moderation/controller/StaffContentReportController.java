package groupone.soundwaveproject.moderation.controller;

import groupone.soundwaveproject.moderation.dto.request.ResolveContentReportRequest;
import groupone.soundwaveproject.moderation.dto.request.TakeDownTrackRequest;
import groupone.soundwaveproject.moderation.dto.response.StaffContentReportResponse;
import groupone.soundwaveproject.moderation.service.StaffContentReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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
        return ResponseEntity.ok().build();
    }
}

