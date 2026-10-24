package groupone.soundwaveproject.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Initializer tự động kiểm tra và đồng bộ hóa cấu trúc bảng tracks
 * nhằm hỗ trợ chiến lược xóa mềm (Soft Delete / TAKEN_DOWN) của UC-19 Delete An Owned Track.
 * Khi bài hát đã phát hành bị gỡ xuống, tài nguyên media trên Cloudinary được thanh lọc,
 * do đó các cột audio_public_id và audio_url cần cho phép NULL.
 */
@Slf4j
@Component
@Order(2)
@RequiredArgsConstructor
public class TrackSchemaInitializer implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        try {
            // Cho phép NULL đối với audio_public_id và audio_url khi bài hát bị gỡ xuống (TAKEN_DOWN)
            jdbcTemplate.execute("ALTER TABLE tracks ALTER COLUMN audio_public_id DROP NOT NULL");
            jdbcTemplate.execute("ALTER TABLE tracks ALTER COLUMN audio_url DROP NOT NULL");
            log.info("Track table schema verified and updated for soft delete support.");
        } catch (Exception e) {
            log.warn("Could not update tracks table constraints: {}", e.getMessage());
        }
    }
}
