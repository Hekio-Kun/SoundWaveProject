package groupone.soundwaveproject.studio.controller;

import groupone.soundwaveproject.studio.dto.request.CreateAlbumRequest;
import groupone.soundwaveproject.studio.dto.request.UpdateAlbumRequest;
import groupone.soundwaveproject.studio.dto.response.StudioAlbumResponse;
import groupone.soundwaveproject.studio.dto.response.StudioTrackResponse;
import groupone.soundwaveproject.studio.service.StudioAlbumService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Controller xử lý các yêu cầu HTTP cho tính năng Quản lý Album cá nhân (Manage My Album - UC-21.1 đến UC-21.4).
 */
@Validated
@RestController
@RequestMapping("/api/v1/studio/albums")
@RequiredArgsConstructor
public class StudioAlbumController {

    private final StudioAlbumService studioAlbumService;

    /**
     * Lấy danh sách toàn bộ Album của người dùng hiện tại (UC-21.4 View Albums).
     * Sequence Diagram Steps:
     * 1.1: GET /api/v1/studio/albums
     * 1.2: getMyAlbums(authentication.getName())
     * 1.14 - 1.15: return studioAlbumListResponse
     */
    @GetMapping
    public List<StudioAlbumResponse> getMyAlbums(Authentication authentication) {
        return studioAlbumService.getMyAlbums(authentication.getName());
    }

    /**
     * Xem thông tin chi tiết một Album cụ thể kèm danh sách bài hát (UC-21.3 View Album Details).
     */
    @GetMapping("/{id}")
    public StudioAlbumResponse getAlbumById(
            @PathVariable @Positive(message = "Album ID must be positive.") Long id,
            Authentication authentication
    ) {
        return studioAlbumService.getAlbumById(id, authentication.getName());
    }

    /**
     * Lấy danh sách các bài hát cá nhân chưa thuộc album nào để chọn đưa vào album.
     */
    @GetMapping("/available-tracks")
    public List<StudioTrackResponse> getAvailableTracks(
            @RequestParam(required = false) @Positive(message = "Album ID must be positive.") Long albumId,
            Authentication authentication
    ) {
        return studioAlbumService.getAvailableTracksForAlbum(albumId, authentication.getName());
    }

    /**
     * Tạo Album mới kèm tải lên một lượt toàn bộ bài hát cấu thành hoặc lưu bản nháp (UC-21.1 Create Album).
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<StudioAlbumResponse> createAlbum(
            @RequestPart("album") @Valid CreateAlbumRequest request,
            @RequestPart(value = "cover", required = false) MultipartFile cover,
            @RequestPart(value = "audioFiles", required = false) List<MultipartFile> audioFiles,
            Authentication authentication
    ) {
        StudioAlbumResponse response = studioAlbumService.createAlbum(request, cover, audioFiles, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Nộp toàn bộ bài hát trong album nháp lên cho Staff kiểm duyệt (UC-21.2 Submit Album For Review).
     */
    @PostMapping("/{id}/submit")
    public ResponseEntity<StudioAlbumResponse> submitAlbumForReview(
            @PathVariable @Positive(message = "Album ID must be positive.") Long id,
            Authentication authentication
    ) {
        StudioAlbumResponse response = studioAlbumService.submitAlbumForReview(id, authentication.getName());
        return ResponseEntity.ok(response);
    }

    /**
     * Cập nhật thông tin Album, thay ảnh bìa hoặc sắp xếp lại danh sách bài hát (UC-21.3 Update Album).
     */
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public StudioAlbumResponse updateAlbum(
            @PathVariable @Positive(message = "Album ID must be positive.") Long id,
            @RequestPart("album") @Valid UpdateAlbumRequest request,
            @RequestPart(value = "cover", required = false) MultipartFile cover,
            Authentication authentication
    ) {
        return studioAlbumService.updateAlbum(id, request, cover, authentication.getName());
    }

    /**
     * Xóa Album cá nhân, gỡ liên kết các bài hát chuyển thành độc lập và xóa ảnh Cloudinary (UC-21.4 Delete Album).
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAlbum(
            @PathVariable @Positive(message = "Album ID must be positive.") Long id,
            Authentication authentication
    ) {
        studioAlbumService.deleteAlbum(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
