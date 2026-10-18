package groupone.soundwaveproject.notification;

import groupone.soundwaveproject.notification.dto.response.NotificationResponse;
import groupone.soundwaveproject.notification.dto.response.UnreadCountResponse;
import groupone.soundwaveproject.notification.entity.Notification;
import groupone.soundwaveproject.notification.entity.NotificationType;
import groupone.soundwaveproject.notification.repository.NotificationRepository;
import groupone.soundwaveproject.notification.service.NotificationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class CheckNotificationSchemaTest {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void testNotificationLifecycle() {
        Long adminId = jdbcTemplate.queryForObject("SELECT id FROM app_users WHERE email = 'admin@soundwave.com'", Long.class);
        assertNotNull(adminId);

        // 1. Tạo notification
        Notification notif = notificationService.createNotification(
                adminId,
                null,
                NotificationType.SYSTEM_NOTICE,
                "Welcome to SoundWave",
                "Your account is set up.",
                "USER",
                String.valueOf(adminId)
        );
        assertNotNull(notif.getId());

        // 2. Kiểm tra get unread count
        UnreadCountResponse unreadCount = notificationService.getMyUnreadCount("admin@soundwave.com");
        assertTrue(unreadCount.unreadCount() >= 1);

        // 3. Lấy danh sách notifications
        List<NotificationResponse> list = notificationService.getMyNotifications("admin@soundwave.com");
        assertFalse(list.isEmpty());

        // 4. Mark as read
        NotificationResponse read = notificationService.markMyNotificationAsRead(notif.getId(), "admin@soundwave.com");
        assertTrue(read.isRead());

        // 5. Cleanup
        notificationRepository.deleteById(notif.getId());
    }
}
