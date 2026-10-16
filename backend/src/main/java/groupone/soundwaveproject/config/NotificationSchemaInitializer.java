package groupone.soundwaveproject.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Initializer tự động kiểm tra và đồng bộ hóa check constraints của bảng notifications
 * nhằm đảm bảo hỗ trợ đầy đủ các loại thông báo (NotificationType) trong hệ thống SoundWave.
 */
@Slf4j
@Component
@Order(1)
@RequiredArgsConstructor
public class NotificationSchemaInitializer implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        try {
            jdbcTemplate.execute("ALTER TABLE notifications DROP CONSTRAINT IF EXISTS ck_notifications_type");
            jdbcTemplate.execute("ALTER TABLE notifications ADD CONSTRAINT ck_notifications_type CHECK (" +
                    "type IN ('TRACK_APPROVED', 'TRACK_REJECTED', 'TRACK_TAKEN_DOWN', 'TRACK_SUBMISSION', " +
                    "'REPORT_RESOLVED', 'REPORT_REJECTED', 'CONTENT_REPORT', 'ACCOUNT_STATUS_CHANGED', " +
                    "'ROLE_CHANGED', 'SYSTEM', 'SYSTEM_NOTICE'))");
            log.info("Notification table constraints verified and updated successfully.");
        } catch (Exception e) {
            log.warn("Could not update notifications table constraint: {}", e.getMessage());
        }
    }
}
