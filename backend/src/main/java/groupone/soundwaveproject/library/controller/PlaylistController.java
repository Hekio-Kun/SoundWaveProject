package groupone.soundwaveproject.library.controller;

import groupone.soundwaveproject.library.dto.request.AddTrackToPlaylistRequest;
import groupone.soundwaveproject.library.dto.request.PlaylistRequest;
import groupone.soundwaveproject.library.dto.request.ReorderPlaylistTracksRequest;
import groupone.soundwaveproject.library.dto.response.PlaylistResponse;
import groupone.soundwaveproject.library.service.PlaylistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * REST Controller cho tính năng Quản lý Playlist cá nhân (UC-15: Manage My Playlist).
 */
@RestController
@RequestMapping("/api/v1/playlists")
@RequiredArgsConstructor
public class PlaylistController {

    private final PlaylistService playlistService;

    /**
     * Lấy danh sách Playlist của người dùng hiện tại (Sequence: View).
     */
    @GetMapping("/me")
    public List<PlaylistResponse> getMyPlaylists(Authentication authentication) {
        return playlistService.getMyPlaylists(authentication.getName());
    }

    /**
     * Lấy danh sách Playlist công khai (Public Playlists).
     */
    @GetMapping
    public List<PlaylistResponse> getPublicPlaylists() {
        return playlistService.getPublicPlaylists();
    }

    /**
     * Xem thông tin chi tiết một Playlist kèm danh sách bài hát có thứ tự (Sequence: View).
     */
    @GetMapping("/{id}")
    public PlaylistResponse getPlaylistById(@PathVariable Long id, Authentication authentication) {
        String email = authentication != null ? authentication.getName() : null;
        return playlistService.getPlaylistById(id, email);
    }

    /**
     * Tạo Playlist mới (Sequence: Create).
     */
    @PostMapping
    public ResponseEntity<PlaylistResponse> createPlaylist(
            @Valid @RequestBody PlaylistRequest request,
            Authentication authentication
    ) {
        PlaylistResponse response = playlistService.createPlaylist(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Cập nhật thông tin Playlist (Sequence: Update).
     */
    @PutMapping("/{id}")
    public PlaylistResponse updatePlaylist(
            @PathVariable Long id,
            @Valid @RequestBody PlaylistRequest request,
            Authentication authentication
    ) {
        return playlistService.updatePlaylist(id, request, authentication.getName());
    }

    /**
     * Xóa Playlist (Sequence: Delete).
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlaylist(@PathVariable Long id, Authentication authentication) {
        playlistService.deletePlaylist(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    /**
     * Tải ảnh bìa playlist lên Cloudinary (UC-20 / Sequence: Create/Update).
     */
    @PostMapping(value = "/upload-cover", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, String> uploadCover(
            @RequestParam("cover") MultipartFile cover,
            Authentication authentication
    ) {
        String coverUrl = playlistService.uploadCover(cover, authentication.getName());
        return Map.of("coverUrl", coverUrl);
    }

    /**
     * Thêm bài hát vào Playlist.
     */
    @PostMapping("/{id}/tracks")
    public PlaylistResponse addTrackToPlaylist(
            @PathVariable Long id,
            @Valid @RequestBody AddTrackToPlaylistRequest request,
            Authentication authentication
    ) {
        return playlistService.addTrackToPlaylist(id, request.trackId(), authentication.getName());
    }

    /**
     * Xóa bài hát khỏi Playlist.
     */
    @DeleteMapping("/{id}/tracks/{trackId}")
    public PlaylistResponse removeTrackFromPlaylist(
            @PathVariable Long id,
            @PathVariable Long trackId,
            Authentication authentication
    ) {
        return playlistService.removeTrackFromPlaylist(id, trackId, authentication.getName());
    }

    /**
     * Đổi thứ tự bài hát trong Playlist.
     */
    @PutMapping("/{id}/tracks/reorder")
    public PlaylistResponse reorderPlaylistTracks(
            @PathVariable Long id,
            @RequestBody ReorderPlaylistTracksRequest request,
            Authentication authentication
    ) {
        return playlistService.reorderPlaylistTracks(id, request, authentication.getName());
    }
}
