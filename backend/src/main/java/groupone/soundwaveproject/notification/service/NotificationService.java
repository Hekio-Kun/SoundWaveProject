package groupone.soundwaveproject.notification.service;

import groupone.soundwaveproject.authentication.entity.AppUser;
import groupone.soundwaveproject.authentication.repository.AppUserRepository;
import groupone.soundwaveproject.exception.ResourceNotFoundException;
import groupone.soundwaveproject.notification.dto.response.NotificationResponse;
import groupone.soundwaveproject.notification.dto.response.UnreadCountResponse;
import groupone.soundwaveproject.notification.entity.Notification;
import groupone.soundwaveproject.notification.entity.NotificationType;
import groupone.soundwaveproject.notification.mapper.NotificationMapper;
import groupone.soundwaveproject.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service xử lý toàn bộ nghiệp vụ Thông báo người dùng (UC-17: View My Notification).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;
    private final AppUserRepository userRepository;

    /**
     * Lấy danh sách thông báo gần đây nhất của người dùng hiện tại (UC-17 Phase 2).
     */
    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyNotifications(String userEmail) {
        AppUser user = getUserByEmail(userEmail);
        return notificationRepository.findTop30ByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(notificationMapper::toResponse)
                .toList();
    }

    /**
     * Lấy số lượng thông báo chưa đọc của người dùng để hiển thị huy hiệu trên Chuông (UC-17 Phase 1).
     */
    @Transactional(readOnly = true)
    public UnreadCountResponse getMyUnreadCount(String userEmail) {
        AppUser user = getUserByEmail(userEmail);
        long unreadCount = notificationRepository.countByUserIdAndIsReadFalse(user.getId());
        return new UnreadCountResponse(unreadCount);
    }

    /**
     * Đánh dấu một thông báo cụ thể là đã đọc khi người dùng click xem (UC-17 Phase 4).
     */
    @Transactional
    public NotificationResponse markMyNotificationAsRead(Long notificationId, String userEmail) {
        AppUser user = getUserByEmail(userEmail);
        Notification notification = notificationRepository.findByIdAndUserId(notificationId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("NOTIFICATION_NOT_FOUND", "Notification not found with id: " + notificationId));

        if (!notification.isRead()) {
            notification.markAsRead();
            notification = notificationRepository.save(notification);
        }

        return notificationMapper.toResponse(notification);
    }

    /**
     * Đánh dấu toàn bộ thông báo của người dùng là đã đọc (UC-17 Phase 4).
     */
    @Transactional
    public void markAllMyNotificationsAsRead(String userEmail) {
        AppUser user = getUserByEmail(userEmail);
        notificationRepository.markAllAsReadByUserId(user.getId());
    }

    /**
     * Tạo thông báo mới và lưu vào cơ sở dữ liệu (được gọi từ các sự kiện nghiệp vụ kiểm duyệt, tải bài hát).
     */
    @Transactional
    public Notification createNotification(
            Long recipientUserId,
            Long actorId,
            NotificationType type,
            String title,
            String message,
            String referenceType,
            String referenceId
    ) {
        Notification notification = Notification.builder()
                .userId(recipientUserId)
                .actorId(actorId)
                .type(type)
                .title(title)
                .message(message)
                .referenceType(referenceType)
                .referenceId(referenceId)
                .isRead(false)
                .build();

        Notification saved = notificationRepository.save(notification);
        log.info("Created notification id={} type={} for user={}", saved.getId(), type, recipientUserId);
        return saved;
    }

    private AppUser getUserByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "User not found with email: " + email));
    }
}
