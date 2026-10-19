package groupone.soundwaveproject.library.controller;

import groupone.soundwaveproject.library.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST Controller cho tính năng Quản lý bài hát yêu thích (UC-14: Favorite Tracks Management).
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/favorites")
@PreAuthorize("hasRole('LISTENER')")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    /**
     * Thêm một bài hát vào danh sách yêu thích của người dùng (UC-14.1: Add Track to Favorites).
     */
    @PostMapping("/{trackId}")
    public ResponseEntity<Map<String, Object>> addFavorite(
            @PathVariable Long trackId,
            Authentication authentication
    ) {
        log.info("User {} requested to add track ID {} to favorites", authentication.getName(), trackId);
        favoriteService.addFavorite(authentication.getName(), trackId);
        return ResponseEntity.ok(Map.of(
                "message", "Track added to favorites successfully.",
                "trackId", trackId
        ));
    }
}
