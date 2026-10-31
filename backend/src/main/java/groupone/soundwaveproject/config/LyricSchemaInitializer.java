package groupone.soundwaveproject.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Initializer tự động kiểm tra và đồng bộ hóa cấu trúc bảng official_lyrics và personal_lyrics:
 * 1. Gỡ bỏ ràng buộc foreign key fk_official_lyrics_created_by_staffs để cho phép uploader (User)
 *    và Staff đều có thể là tác giả khởi tạo lời bài hát chính thức.
 * 2. Tự động đồng bộ (backfill) dữ liệu lời bài hát hiện có từ bảng tracks sang bảng official_lyrics
 *    nếu bài hát đó chưa có bản ghi trong official_lyrics.
 */
@Slf4j
@Component
@Order(3)
@RequiredArgsConstructor
public class LyricSchemaInitializer implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        try {
            jdbcTemplate.execute("ALTER TABLE official_lyrics DROP CONSTRAINT IF EXISTS fk_official_lyrics_created_by_staffs");
            jdbcTemplate.execute("ALTER TABLE official_lyrics DROP CONSTRAINT IF EXISTS fk_official_lyrics_created_by_app_users");
            log.info("Official lyrics foreign key constraints updated successfully.");
        } catch (Exception e) {
            log.warn("Could not update official_lyrics table foreign key constraints: {}", e.getMessage());
        }

        try {
            int backfilled = jdbcTemplate.update(
                    "INSERT INTO official_lyrics (track_id, lyric_content, status, created_by_user_id, created_at, updated_at) " +
                            "SELECT t.id, t.lyrics, 'PUBLISHED', COALESCE(t.uploader_user_id, 1), " +
                            "COALESCE(t.created_at, timezone('UTC', CURRENT_TIMESTAMP)), " +
                            "COALESCE(t.updated_at, timezone('UTC', CURRENT_TIMESTAMP)) " +
                            "FROM tracks t " +
                            "WHERE t.lyrics IS NOT NULL AND TRIM(t.lyrics) != '' " +
                            "  AND NOT EXISTS (SELECT 1 FROM official_lyrics ol WHERE ol.track_id = t.id)"
            );
            if (backfilled > 0) {
                log.info("Backfilled {} track lyrics from tracks into official_lyrics table.", backfilled);
            }
        } catch (Exception e) {
            log.warn("Could not backfill lyrics into official_lyrics table: {}", e.getMessage());
        }
    }
}
