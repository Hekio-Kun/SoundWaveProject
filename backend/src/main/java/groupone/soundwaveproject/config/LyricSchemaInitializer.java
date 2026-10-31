package groupone.soundwaveproject.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Initializer tự động kiểm tra, khởi tạo và đồng bộ hóa cấu trúc bảng official_lyric và custom_lyric:
 * 1. Đảm bảo bảng official_lyric và custom_lyric tồn tại trong PostgreSQL.
 * 2. Tự động đồng bộ (backfill) dữ liệu lời bài hát hiện có từ bảng tracks sang bảng official_lyric.
 * 3. Hỗ trợ di chuyển dữ liệu tương thích nếu đã có dữ liệu trong official_lyrics hoặc personal_lyrics.
 */
@Slf4j
@Component
@Order(3)
@RequiredArgsConstructor
public class LyricSchemaInitializer implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        // 1. Tạo bảng official_lyric nếu chưa tồn tại
        try {
            jdbcTemplate.execute(
                    "CREATE TABLE IF NOT EXISTS official_lyric (" +
                            "    id BIGSERIAL PRIMARY KEY," +
                            "    track_id BIGINT NOT NULL UNIQUE," +
                            "    lyric_content TEXT NOT NULL," +
                            "    status VARCHAR(20) NOT NULL DEFAULT 'PUBLISHED'," +
                            "    created_by_user_id BIGINT NOT NULL," +
                            "    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP," +
                            "    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP" +
                            ")"
            );
            log.info("Table official_lyric checked/created successfully.");
        } catch (Exception e) {
            log.warn("Could not verify/create table official_lyric: {}", e.getMessage());
        }

        try {
            jdbcTemplate.execute("ALTER TABLE IF EXISTS official_lyrics DROP CONSTRAINT IF EXISTS fk_official_lyrics_created_by_staffs");
            jdbcTemplate.execute("ALTER TABLE IF EXISTS official_lyrics DROP CONSTRAINT IF EXISTS fk_official_lyrics_created_by_app_users");
        } catch (Exception ignored) {
        }

        // 2. Tạo bảng custom_lyric nếu chưa tồn tại
        try {
            jdbcTemplate.execute(
                    "CREATE TABLE IF NOT EXISTS custom_lyric (" +
                            "    id BIGSERIAL PRIMARY KEY," +
                            "    user_id BIGINT NOT NULL," +
                            "    track_id BIGINT NOT NULL," +
                            "    lyric_type VARCHAR(20) NOT NULL DEFAULT 'CUSTOM'," +
                            "    lyric_content TEXT NOT NULL," +
                            "    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP," +
                            "    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP," +
                            "    CONSTRAINT uq_custom_lyric_user_track UNIQUE (user_id, track_id)" +
                            ")"
            );
            log.info("Table custom_lyric checked/created successfully.");
        } catch (Exception e) {
            log.warn("Could not verify/create table custom_lyric: {}", e.getMessage());
        }

        // 3. Đồng bộ từ official_lyrics cũ (nếu có) sang official_lyric
        try {
            jdbcTemplate.execute(
                    "INSERT INTO official_lyric (track_id, lyric_content, status, created_by_user_id, created_at, updated_at) " +
                            "SELECT ol.track_id, ol.lyric_content, ol.status, ol.created_by_user_id, ol.created_at, ol.updated_at " +
                            "FROM official_lyrics ol " +
                            "WHERE NOT EXISTS (SELECT 1 FROM official_lyric o WHERE o.track_id = ol.track_id) " +
                            "ON CONFLICT (track_id) DO NOTHING"
            );
        } catch (Exception ignored) {
        }

        // 4. Đồng bộ từ personal_lyrics cũ (nếu có) sang custom_lyric
        try {
            jdbcTemplate.execute(
                    "INSERT INTO custom_lyric (user_id, track_id, lyric_type, lyric_content, created_at, updated_at) " +
                            "SELECT pl.user_id, pl.track_id, COALESCE(pl.lyric_type, 'CUSTOM'), pl.lyric_content, pl.created_at, pl.updated_at " +
                            "FROM personal_lyrics pl " +
                            "WHERE NOT EXISTS (SELECT 1 FROM custom_lyric cl WHERE cl.user_id = pl.user_id AND cl.track_id = pl.track_id) " +
                            "ON CONFLICT (user_id, track_id) DO NOTHING"
            );
        } catch (Exception ignored) {
        }

        // 5. Backfill dữ liệu lời bài hát hiện có từ tracks sang official_lyric
        try {
            int backfilled = jdbcTemplate.update(
                    "INSERT INTO official_lyric (track_id, lyric_content, status, created_by_user_id, created_at, updated_at) " +
                            "SELECT t.id, t.lyrics, 'PUBLISHED', COALESCE(t.uploader_user_id, 1), " +
                            "COALESCE(t.created_at, timezone('UTC', CURRENT_TIMESTAMP)), " +
                            "COALESCE(t.updated_at, timezone('UTC', CURRENT_TIMESTAMP)) " +
                            "FROM tracks t " +
                            "WHERE t.lyrics IS NOT NULL AND TRIM(t.lyrics) != '' " +
                            "  AND NOT EXISTS (SELECT 1 FROM official_lyric ol WHERE ol.track_id = t.id) " +
                            "ON CONFLICT (track_id) DO NOTHING"
            );
            if (backfilled > 0) {
                log.info("Backfilled {} track lyrics from tracks into official_lyric table.", backfilled);
            }
        } catch (Exception e) {
            log.warn("Could not backfill lyrics into official_lyric table: {}", e.getMessage());
        }
    }
}
