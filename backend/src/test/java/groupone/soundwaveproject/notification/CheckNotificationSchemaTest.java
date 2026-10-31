package groupone.soundwaveproject.notification;

import groupone.soundwaveproject.authentication.dto.request.LoginRequest;
import groupone.soundwaveproject.authentication.service.AuthenticationService;
import groupone.soundwaveproject.moderation.entity.SubmissionStatus;
import groupone.soundwaveproject.moderation.service.ModerationService;
import groupone.soundwaveproject.notification.service.NotificationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootTest
public class CheckNotificationSchemaTest {

    @Autowired
    private AuthenticationService authenticationService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private ModerationService moderationService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void inspectDatabaseAndLogin() {
        System.out.println("=== 1. TEST LISTENER NOTIFICATIONS ===");
        var notifs = notificationService.getMyNotifications("staff@soundwave.com");
        System.out.println("STAFF NOTIFS FOUND: " + notifs.size());

        System.out.println("=== 2. CHECK STAFFS ===");
        var staffs = jdbcTemplate.queryForList("SELECT id, email, status, role_id FROM staffs");
        staffs.forEach(System.out::println);

        System.out.println("=== 3. CHECK STAFF ROLES ===");
        var roles = jdbcTemplate.queryForList("SELECT * FROM staff_roles");
        roles.forEach(System.out::println);

        System.out.println("=== 4. TEST STAFF LOGIN IN SERVICE ===");
        try {
            var res = authenticationService.login(new LoginRequest("staff@soundwave.com", "Staff@123456", false));
            System.out.println("STAFF LOGIN SUCCESS: " + res.response().user());
        } catch (Throwable t) {
            System.out.println("STAFF LOGIN FAILED:");
            t.printStackTrace(System.out);
        }

        System.out.println("=== 5. TEST NOTIFICATION UNREAD COUNT ===");
        try {
            var unread = notificationService.getMyUnreadCount("staff@soundwave.com");
            System.out.println("UNREAD COUNT SUCCESS: " + unread.unreadCount());
        } catch (Throwable t) {
            System.out.println("UNREAD COUNT FAILED:");
            t.printStackTrace(System.out);
        }

        System.out.println("=== 6. TEST MODERATION QUEUE STATS ===");
        try {
            var stats = moderationService.getQueueStats();
            System.out.println("QUEUE STATS SUCCESS: " + stats);
        } catch (Throwable t) {
            System.out.println("QUEUE STATS FAILED:");
            t.printStackTrace(System.out);
        }

        System.out.println("=== 7. TEST MODERATION GET QUEUE PENDING ===");
        try {
            var queue = moderationService.getQueue(SubmissionStatus.PENDING, null, PageRequest.of(0, 10));
            System.out.println("GET QUEUE SUCCESS: totalElements=" + queue.getTotalElements());
        } catch (Throwable t) {
            System.out.println("GET QUEUE FAILED:");
            t.printStackTrace(System.out);
        }
    }
}
