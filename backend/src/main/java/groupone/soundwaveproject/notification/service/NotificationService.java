package groupone.soundwaveproject.notification.service;

import groupone.soundwaveproject.authentication.entity.Staff;
import groupone.soundwaveproject.authentication.entity.User;
import groupone.soundwaveproject.authentication.repository.StaffRepository;
import groupone.soundwaveproject.authentication.repository.UserRepository;
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
import java.util.Optional;

/**
 * Service xử lý toàn bộ nghiệp vụ Thông báo người dùng và nhân viên (UC-17: View My Notification).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;
    private final UserRepository userRepository;
    private final StaffRepository staffRepository;

    /**
     * Lấy danh sách thông báo gần đây nhất của người dùng hoặc nhân viên hiện tại (UC-17 Phase 2).
     */
    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyNotifications(String email) {
        Optional<Staff> staffOpt = staffRepository.findByEmailIgnoreCase(email);
        if (staffOpt.isPresent()) {
            return notificationRepository.findTop30ByStaffIdOrderByCreatedAtDesc(staffOpt.get().getId()).stream()
                    .map(notificationMapper::toResponse)
                    .toList();
        }

        User user = getUserByEmail(email);
        return notificationRepository.findTop30ByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(notificationMapper::toResponse)
                .toList();
    }

    /**
     * Lấy số lượng thông báo chưa đọc của người dùng hoặc nhân viên để hiển thị huy hiệu trên Chuông (UC-17 Phase 1).
     */
    @Transactional(readOnly = true)
    public UnreadCountResponse getMyUnreadCount(String email) {
        Optional<Staff> staffOpt = staffRepository.findByEmailIgnoreCase(email);
        if (staffOpt.isPresent()) {
            long count = notificationRepository.countByStaffIdAndIsReadFalse(staffOpt.get().getId());
            return new UnreadCountResponse(count);
        }

        User user = getUserByEmail(email);
        long unreadCount = notificationRepository.countByUserIdAndIsReadFalse(user.getId());
        return new UnreadCountResponse(unreadCount);
    }

    /**
     * Đánh dấu một thông báo cụ thể là đã đọc khi người dùng click xem (UC-17 Phase 4).
     */
    @Transactional
    public NotificationResponse markMyNotificationAsRead(Long notificationId, String email) {
        Optional<Staff> staffOpt = staffRepository.findByEmailIgnoreCase(email);
        Notification notification;

        if (staffOpt.isPresent()) {
            notification = notificationRepository.findByIdAndStaffId(notificationId, staffOpt.get().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("NOTIFICATION_NOT_FOUND", "Notification not found with id: " + notificationId));
        } else {
            User user = getUserByEmail(email);
            notification = notificationRepository.findByIdAndUserId(notificationId, user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("NOTIFICATION_NOT_FOUND", "Notification not found with id: " + notificationId));
        }

        if (!notification.isRead()) {
            notification.markAsRead();
            notification = notificationRepository.save(notification);
        }

        return notificationMapper.toResponse(notification);
    }

    /**
     * Đánh dấu toàn bộ thông báo của người dùng hoặc nhân viên là đã đọc (UC-17 Phase 4).
     */
    @Transactional
    public void markAllMyNotificationsAsRead(String email) {
        Optional<Staff> staffOpt = staffRepository.findByEmailIgnoreCase(email);
        if (staffOpt.isPresent()) {
            notificationRepository.markAllAsReadByStaffId(staffOpt.get().getId());
        } else {
            User user = getUserByEmail(email);
            notificationRepository.markAllAsReadByUserId(user.getId());
        }
    }

    /**
     * Tạo thông báo mới cho User và lưu vào cơ sở dữ liệu.
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

    /**
     * Tạo thông báo mới cho Staff và lưu vào cơ sở dữ liệu.
     */
    @Transactional
    public Notification createStaffNotification(
            Long recipientStaffId,
            Long actorId,
            NotificationType type,
            String title,
            String message,
            String referenceType,
            String referenceId
    ) {
        Notification notification = Notification.builder()
                .staffId(recipientStaffId)
                .actorId(actorId)
                .type(type)
                .title(title)
                .message(message)
                .referenceType(referenceType)
                .referenceId(referenceId)
                .isRead(false)
                .build();

        Notification saved = notificationRepository.save(notification);
        log.info("Created notification id={} type={} for staff={}", saved.getId(), type, recipientStaffId);
        return saved;
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "User not found with email: " + email));
    }
}
