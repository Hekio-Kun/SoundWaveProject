package groupone.soundwaveproject.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Initializer tự động kiểm tra, khởi tạo và đồng bộ hóa cấu trúc Dual-Tier Lyrics:
 * 1. Đảm bảo các bảng official_lyrics (JPA) và personal_lyrics (JPA) luôn tồn tại.
 * 2. Đảm bảo bảng content_reports (JPA) luôn tồn tại cho phân hệ kiểm duyệt.
 * 3. Tự động chuyển đổi (backfill) dữ liệu lời bài hát hiện có từ tracks.lyrics sang
 *    bảng Official Lyrics (PUBLISHED) và Personal Lyrics (CUSTOM).
 * 4. Dọn dẹp sạch sẽ các bảng tàn dư cũ (official_lyric, custom_lyric).
 */
@Slf4j
@Component
@Order(3)
@RequiredArgsConstructor
public class LyricSchemaInitializer implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        log.info("Starting LyricSchemaInitializer: ensuring dual-tier lyric schema and data sync...");

        // 1. Đảm bảo bảng official_lyrics (JPA Entity: OfficialLyric) tồn tại
        try {
            jdbcTemplate.execute(
                    "CREATE TABLE IF NOT EXISTS official_lyrics (" +
                            "    official_lyric_id BIGSERIAL PRIMARY KEY," +
                            "    track_id BIGINT NOT NULL UNIQUE," +
                            "    lyric_content TEXT NOT NULL," +
                            "    status VARCHAR(30) NOT NULL DEFAULT 'PUBLISHED'," +
                            "    created_by_staff_id BIGINT," +
                            "    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP," +
                            "    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP" +
                            ")"
            );
            jdbcTemplate.execute("ALTER TABLE official_lyrics ADD COLUMN IF NOT EXISTS created_by_staff_id BIGINT");
            log.info("Table official_lyrics verified/created successfully.");
        } catch (Exception e) {
            log.warn("Could not verify/create table official_lyrics: {}", e.getMessage());
        }

        try {
            jdbcTemplate.execute("ALTER TABLE IF EXISTS official_lyrics ALTER COLUMN created_by_staff_id DROP NOT NULL");
            jdbcTemplate.execute("ALTER TABLE IF EXISTS official_lyrics DROP CONSTRAINT IF EXISTS official_lyrics_created_by_user_id_not_null");
            jdbcTemplate.execute("ALTER TABLE IF EXISTS official_lyrics DROP CONSTRAINT IF EXISTS fk_official_lyrics_created_by_staffs");
            jdbcTemplate.execute("ALTER TABLE IF EXISTS official_lyrics DROP CONSTRAINT IF EXISTS fk_official_lyrics_created_by_app_users");
            jdbcTemplate.execute("ALTER TABLE IF EXISTS official_lyrics DROP CONSTRAINT IF EXISTS fk_official_lyrics_languages");
        } catch (Exception ignored) {
        }

        // 2. Đảm bảo bảng personal_lyrics (JPA Entity: PersonalLyric) tồn tại
        try {
            jdbcTemplate.execute(
                    "CREATE TABLE IF NOT EXISTS personal_lyrics (" +
                            "    personal_lyric_id BIGSERIAL PRIMARY KEY," +
                            "    user_id BIGINT NOT NULL," +
                            "    track_id BIGINT NOT NULL," +
                            "    lyric_type VARCHAR(20) NOT NULL DEFAULT 'CUSTOM'," +
                            "    lyric_content TEXT NOT NULL," +
                            "    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP," +
                            "    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP," +
                            "    CONSTRAINT uq_personal_lyrics_user_track_type UNIQUE (user_id, track_id, lyric_type)" +
                            ")"
            );
            log.info("Table personal_lyrics verified/created successfully.");
        } catch (Exception e) {
            log.warn("Could not verify/create table personal_lyrics: {}", e.getMessage());
        }

        try {
            jdbcTemplate.execute("ALTER TABLE IF EXISTS personal_lyrics DROP CONSTRAINT IF EXISTS fk_personal_lyrics_languages");
            jdbcTemplate.execute("ALTER TABLE personal_lyrics ADD COLUMN IF NOT EXISTS lyric_type VARCHAR(20) NOT NULL DEFAULT 'CUSTOM'");
            jdbcTemplate.execute("CREATE UNIQUE INDEX IF NOT EXISTS uq_personal_lyrics_user_track_type ON personal_lyrics (user_id, track_id, lyric_type)");
        } catch (Exception ignored) {
        }

        // Đảm bảo bảng content_reports (JPA Entity: ContentReport) tồn tại
        try {
            jdbcTemplate.execute(
                    "CREATE TABLE IF NOT EXISTS content_reports (" +
                            "    report_id BIGSERIAL PRIMARY KEY," +
                            "    track_id BIGINT," +
                            "    submitted_by_user_id BIGINT," +
                            "    handled_by_user_id BIGINT," +
                            "    category VARCHAR(50)," +
                            "    description TEXT," +
                            "    status VARCHAR(50) NOT NULL DEFAULT 'PENDING'," +
                            "    resolution_note TEXT," +
                            "    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP," +
                            "    handled_at TIMESTAMP WITH TIME ZONE," +
                            "    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP," +
                            "    reporter_id BIGINT," +
                            "    target_type VARCHAR(50) NOT NULL DEFAULT 'TRACK'," +
                            "    target_id BIGINT," +
                            "    reason VARCHAR(100)," +
                            "    reviewer_id BIGINT," +
                            "    reviewer_note TEXT," +
                            "    resolved_at TIMESTAMP WITH TIME ZONE" +
                            ")"
            );
            // Đảm bảo các cột mới và cũ đều tồn tại đầy đủ bất kể bảng được tạo từ kịch bản nào
            jdbcTemplate.execute("ALTER TABLE content_reports ADD COLUMN IF NOT EXISTS track_id BIGINT");
            jdbcTemplate.execute("ALTER TABLE content_reports ADD COLUMN IF NOT EXISTS submitted_by_user_id BIGINT");
            jdbcTemplate.execute("ALTER TABLE content_reports ADD COLUMN IF NOT EXISTS handled_by_staff_id BIGINT");
            jdbcTemplate.execute("ALTER TABLE content_reports ADD COLUMN IF NOT EXISTS handled_by_user_id BIGINT");
            jdbcTemplate.execute("ALTER TABLE content_reports ADD COLUMN IF NOT EXISTS category VARCHAR(50)");
            jdbcTemplate.execute("ALTER TABLE content_reports ADD COLUMN IF NOT EXISTS resolution_note TEXT");
            jdbcTemplate.execute("ALTER TABLE content_reports ADD COLUMN IF NOT EXISTS handled_at TIMESTAMP WITH TIME ZONE");
            jdbcTemplate.execute("ALTER TABLE content_reports ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP");
            jdbcTemplate.execute("ALTER TABLE content_reports ADD COLUMN IF NOT EXISTS reporter_id BIGINT");
            jdbcTemplate.execute("ALTER TABLE content_reports ADD COLUMN IF NOT EXISTS target_type VARCHAR(50) DEFAULT 'TRACK'");
            jdbcTemplate.execute("ALTER TABLE content_reports ADD COLUMN IF NOT EXISTS target_id BIGINT");
            jdbcTemplate.execute("ALTER TABLE content_reports ADD COLUMN IF NOT EXISTS reason VARCHAR(100)");
            jdbcTemplate.execute("ALTER TABLE content_reports ADD COLUMN IF NOT EXISTS reviewer_id BIGINT");
            jdbcTemplate.execute("ALTER TABLE content_reports ADD COLUMN IF NOT EXISTS reviewer_note TEXT");
            jdbcTemplate.execute("ALTER TABLE content_reports ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP WITH TIME ZONE");
            log.info("Table content_reports verified/created successfully with full schema compatibility.");
        } catch (Exception e) {
            log.warn("Could not verify/create table content_reports: {}", e.getMessage());
        }

        // 3. Dọn dẹp sạch sẽ các bảng tàn dư cũ (official_lyric, custom_lyric) nếu còn tồn tại
        try {
            jdbcTemplate.execute("DROP TABLE IF EXISTS official_lyric CASCADE");
            jdbcTemplate.execute("DROP TABLE IF EXISTS custom_lyric CASCADE");
            log.info("Cleaned up legacy redundant tables (official_lyric, custom_lyric) successfully.");
        } catch (Exception e) {
            log.warn("Could not drop legacy redundant tables: {}", e.getMessage());
        }

        // 4. Backfill dữ liệu từ cột tracks.lyrics sang cả Official Lyrics và Custom Lyrics
        try {
            Boolean hasTracksLyricsColumn = jdbcTemplate.queryForObject(
                    "SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tracks' AND column_name = 'lyrics')",
                    Boolean.class
            );

            if (Boolean.TRUE.equals(hasTracksLyricsColumn)) {
                // 4.1. Chuyển tracks.lyrics -> official_lyrics
                int officialCount = jdbcTemplate.update(
                        "INSERT INTO official_lyrics (track_id, lyric_content, status, created_by_staff_id, created_at, updated_at) " +
                                "SELECT t.track_id, t.lyrics, 'PUBLISHED', COALESCE((SELECT staff_id FROM staffs ORDER BY staff_id ASC LIMIT 1), 1), " +
                                "COALESCE(t.created_at, timezone('UTC', CURRENT_TIMESTAMP)), " +
                                "COALESCE(t.updated_at, timezone('UTC', CURRENT_TIMESTAMP)) " +
                                "FROM tracks t " +
                                "WHERE t.lyrics IS NOT NULL AND TRIM(t.lyrics) != '' " +
                                "ON CONFLICT (track_id) DO UPDATE " +
                                "SET lyric_content = EXCLUDED.lyric_content, status = 'PUBLISHED', updated_at = EXCLUDED.updated_at"
                );
                log.info("Migrated/synced {} lyrics from tracks to official_lyrics.", officialCount);

                // 4.2. Chuyển tracks.lyrics -> personal_lyrics (Custom Lyric)
                int personalCount = jdbcTemplate.update(
                        "INSERT INTO personal_lyrics (user_id, track_id, lyric_type, lyric_content, created_at, updated_at) " +
                                "SELECT COALESCE(t.uploader_user_id, 1), t.track_id, 'CUSTOM', t.lyrics, " +
                                "COALESCE(t.created_at, timezone('UTC', CURRENT_TIMESTAMP)), " +
                                "COALESCE(t.updated_at, timezone('UTC', CURRENT_TIMESTAMP)) " +
                                "FROM tracks t " +
                                "WHERE t.lyrics IS NOT NULL AND TRIM(t.lyrics) != '' " +
                                "ON CONFLICT (user_id, track_id, lyric_type) DO UPDATE " +
                                "SET lyric_content = EXCLUDED.lyric_content, updated_at = EXCLUDED.updated_at"
                );
                log.info("Migrated/synced {} lyrics from tracks to personal_lyrics.", personalCount);
            }
        } catch (Exception e) {
            log.warn("Could not backfill lyrics from tracks table: {}", e.getMessage());
        }

        // 5. Đồng bộ bổ sung: Nếu track đã có trong official_lyrics mà chưa có trong personal_lyrics, tạo custom lyric cho tác giả
        try {
            int autoCustomCount = jdbcTemplate.update(
                    "INSERT INTO personal_lyrics (user_id, track_id, lyric_type, lyric_content, created_at, updated_at) " +
                            "SELECT COALESCE(t.uploader_user_id, 1), ol.track_id, 'CUSTOM', ol.lyric_content, ol.created_at, ol.updated_at " +
                            "FROM official_lyrics ol " +
                            "JOIN tracks t ON t.track_id = ol.track_id " +
                            "WHERE ol.lyric_content IS NOT NULL AND TRIM(ol.lyric_content) != '' " +
                            "ON CONFLICT (user_id, track_id, lyric_type) DO NOTHING"
            );
            if (autoCustomCount > 0) {
                log.info("Created {} custom lyrics from official_lyrics for track uploaders.", autoCustomCount);
            }
        } catch (Exception e) {
            log.warn("Could not copy official_lyrics to personal_lyrics: {}", e.getMessage());
        }


        // 7. Cập nhật sequence cho các bảng
        try {
            jdbcTemplate.execute("SELECT setval(pg_get_serial_sequence('official_lyrics', 'official_lyric_id'), COALESCE(MAX(official_lyric_id), 1)) FROM official_lyrics");
            jdbcTemplate.execute("SELECT setval(pg_get_serial_sequence('personal_lyrics', 'personal_lyric_id'), COALESCE(MAX(personal_lyric_id), 1)) FROM personal_lyrics");
        } catch (Exception ignored) {
        }

        log.info("LyricSchemaInitializer completed successfully.");
    }
}
