package groupone.soundwaveproject.studio.controller;

import groupone.soundwaveproject.studio.dto.request.CreateTrackRequest;
import groupone.soundwaveproject.studio.dto.request.SubmitTrackRequest;
import groupone.soundwaveproject.studio.dto.request.UpdateTrackRequest;
import groupone.soundwaveproject.studio.dto.response.AlbumOptionResponse;
import groupone.soundwaveproject.studio.dto.response.GenreOptionResponse;
import groupone.soundwaveproject.studio.dto.response.RejectionDetailsResponse;
import groupone.soundwaveproject.studio.dto.response.StudioStatsResponse;
import groupone.soundwaveproject.studio.dto.response.StudioTrackResponse;
import groupone.soundwaveproject.studio.service.StudioTrackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/studio")
@RequiredArgsConstructor
public class StudioTrackController {

    private final StudioTrackService studioTrackService;

    @GetMapping("/tracks")
    public List<StudioTrackResponse> getMyTracks(
            @RequestParam(required = false) String status,
            Authentication authentication
    ) {
        return studioTrackService.getMyTracks(authentication.getName(), status);
    }

    @GetMapping("/tracks/{id}")
    public StudioTrackResponse getTrackById(
            @PathVariable Long id,
            Authentication authentication
    ) {
        return studioTrackService.getTrackById(id, authentication.getName());
    }

    @PostMapping(value = "/tracks", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<StudioTrackResponse> createDraft(
            @RequestPart("track") @Valid CreateTrackRequest request,
            @RequestPart("audio") MultipartFile audio,
            @RequestPart(value = "cover", required = false) MultipartFile cover,
            Authentication authentication
    ) {
        StudioTrackResponse response = studioTrackService.createDraft(
                request, audio, cover, authentication.getName()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping(value = "/tracks/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public StudioTrackResponse updateTrack(
            @PathVariable Long id,
            @RequestPart("track") @Valid UpdateTrackRequest request,
            @RequestPart(value = "audio", required = false) MultipartFile audio,
            @RequestPart(value = "cover", required = false) MultipartFile cover,
            Authentication authentication
    ) {
        return studioTrackService.updateTrack(id, request, audio, cover, authentication.getName());
    }

    @DeleteMapping("/tracks/{id}")
    public ResponseEntity<Void> deleteTrack(
            @PathVariable Long id,
            Authentication authentication
    ) {
        studioTrackService.deleteTrack(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/tracks/{id}/submit")
    public StudioTrackResponse submitForReview(
            @PathVariable Long id,
            @RequestBody(required = false) SubmitTrackRequest request,
            Authentication authentication
    ) {
        String submitterNote = request != null ? request.submitterNote() : null;
        return studioTrackService.submitForReview(id, submitterNote, authentication.getName());
    }

    @PostMapping("/tracks/{id}/withdraw")
    public StudioTrackResponse withdrawSubmission(
            @PathVariable Long id,
            Authentication authentication
    ) {
        return studioTrackService.withdrawSubmission(id, authentication.getName());
    }

    /**
     * Endpoint API cho chức năng View Rejection Reason (UC-20 theo đặc tả RDS).
     *
     * Cho phép nghệ sĩ/người tải nhạc xem lý do và phản hồi kiểm duyệt của bài hát bị REJECTED.
     *
     * @param id             ID của bài hát
     * @param authentication Đối tượng xác thực chứa email người dùng hiện tại
     * @return RejectionDetailsResponse chi tiết lý do và lịch sử kiểm duyệt
     */
    @GetMapping("/tracks/{id}/rejection")
    public RejectionDetailsResponse getRejectionDetails(
            @PathVariable Long id,
            Authentication authentication
    ) {
        return studioTrackService.getRejectionDetails(id, authentication.getName());
    }

    @GetMapping("/stats")
    public StudioStatsResponse getStats(Authentication authentication) {
        return studioTrackService.getStats(authentication.getName());
    }

    @GetMapping("/genres")
    public List<GenreOptionResponse> getGenres() {
        return studioTrackService.getActiveGenres();
    }
}
