package groupone.soundwaveproject.notification.controller;

import groupone.soundwaveproject.notification.dto.response.NotificationResponse;
import groupone.soundwaveproject.notification.dto.response.UnreadCountResponse;
import groupone.soundwaveproject.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller cho tính năng Xem và quản lý thông báo cá nhân (UC-17 & UC-33: View My Notification).
 */
@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * Lấy số lượng thông báo chưa đọc của người dùng hiện tại (UC-17 Phase 1).
     */
    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    public UnreadCountResponse getUnreadCount(Authentication authentication) {
        return notificationService.getMyUnreadCount(authentication.getName());
    }

    /**
     * Lấy danh sách 30 thông báo gần đây nhất của người dùng hiện tại (UC-17 Phase 2).
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public List<NotificationResponse> getMyNotifications(Authentication authentication) {
        return notificationService.getMyNotifications(authentication.getName());
    }

    /**
     * Đánh dấu một thông báo cụ thể là đã đọc khi người dùng click xem (UC-17 Phase 4).
     */
    @PatchMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public NotificationResponse markAsRead(@PathVariable Long id, Authentication authentication) {
        return notificationService.markMyNotificationAsRead(id, authentication.getName());
    }

    /**
     * Đánh dấu tất cả thông báo của người dùng là đã đọc (UC-17 Phase 4).
     */
    @PatchMapping("/read-all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> markAllAsRead(Authentication authentication) {
        notificationService.markAllMyNotificationsAsRead(authentication.getName());
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }
}
