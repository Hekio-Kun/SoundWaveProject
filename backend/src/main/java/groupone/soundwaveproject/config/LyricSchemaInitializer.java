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
 * 2. Đảm bảo các bảng tương thích official_lyric và custom_lyric tồn tại.
 * 3. Tự động chuyển đổi (backfill) dữ liệu lời bài hát hiện có từ tracks.lyrics sang cả
 *    bảng Official Lyrics (PUBLISHED) và Custom Lyrics (CUSTOM).
 * 4. Đồng bộ dữ liệu tương thích hai chiều giữa các bảng số ít và số nhiều.
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
                            "    id BIGSERIAL PRIMARY KEY," +
                            "    track_id BIGINT NOT NULL UNIQUE," +
                            "    lyric_content TEXT NOT NULL," +
                            "    status VARCHAR(30) NOT NULL DEFAULT 'PUBLISHED'," +
                            "    created_by_user_id BIGINT," +
                            "    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP," +
                            "    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP" +
                            ")"
            );
            log.info("Table official_lyrics verified/created successfully.");
        } catch (Exception e) {
            log.warn("Could not verify/create table official_lyrics: {}", e.getMessage());
        }

        try {
            jdbcTemplate.execute("ALTER TABLE IF EXISTS official_lyrics DROP CONSTRAINT IF EXISTS fk_official_lyrics_created_by_staffs");
            jdbcTemplate.execute("ALTER TABLE IF EXISTS official_lyrics DROP CONSTRAINT IF EXISTS fk_official_lyrics_created_by_app_users");
            jdbcTemplate.execute("ALTER TABLE IF EXISTS official_lyrics DROP CONSTRAINT IF EXISTS fk_official_lyrics_languages");
        } catch (Exception ignored) {
        }

        // 2. Đảm bảo bảng personal_lyrics (JPA Entity: PersonalLyric) tồn tại
        try {
            jdbcTemplate.execute(
                    "CREATE TABLE IF NOT EXISTS personal_lyrics (" +
                            "    id BIGSERIAL PRIMARY KEY," +
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
        } catch (Exception ignored) {
        }

        // 3. Đảm bảo các bảng tương thích alias (official_lyric, custom_lyric) tồn tại
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
        } catch (Exception e) {
            log.warn("Could not verify/create alias tables official_lyric/custom_lyric: {}", e.getMessage());
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
                        "INSERT INTO official_lyrics (track_id, lyric_content, status, created_by_user_id, created_at, updated_at) " +
                                "SELECT t.id, t.lyrics, 'PUBLISHED', COALESCE(t.uploader_user_id, 1), " +
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
                                "SELECT COALESCE(t.uploader_user_id, 1), t.id, 'CUSTOM', t.lyrics, " +
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
                            "JOIN tracks t ON t.id = ol.track_id " +
                            "WHERE ol.lyric_content IS NOT NULL AND TRIM(ol.lyric_content) != '' " +
                            "ON CONFLICT (user_id, track_id, lyric_type) DO NOTHING"
            );
            if (autoCustomCount > 0) {
                log.info("Created {} custom lyrics from official_lyrics for track uploaders.", autoCustomCount);
            }
        } catch (Exception e) {
            log.warn("Could not copy official_lyrics to personal_lyrics: {}", e.getMessage());
        }

        // 6. Đồng bộ hóa sang các bảng tương thích (official_lyric & custom_lyric)
        try {
            jdbcTemplate.execute(
                    "INSERT INTO official_lyric (track_id, lyric_content, status, created_by_user_id, created_at, updated_at) " +
                            "SELECT ol.track_id, ol.lyric_content, ol.status, COALESCE(ol.created_by_user_id, 1), " +
                            "CAST(ol.created_at AS timestamp without time zone), CAST(ol.updated_at AS timestamp without time zone) " +
                            "FROM official_lyrics ol " +
                            "ON CONFLICT (track_id) DO UPDATE SET lyric_content = EXCLUDED.lyric_content, status = EXCLUDED.status"
            );
            jdbcTemplate.execute(
                    "INSERT INTO custom_lyric (user_id, track_id, lyric_type, lyric_content, created_at, updated_at) " +
                            "SELECT pl.user_id, pl.track_id, pl.lyric_type, pl.lyric_content, " +
                            "CAST(pl.created_at AS timestamp without time zone), CAST(pl.updated_at AS timestamp without time zone) " +
                            "FROM personal_lyrics pl " +
                            "WHERE pl.lyric_type = 'CUSTOM' " +
                            "ON CONFLICT (user_id, track_id) DO UPDATE SET lyric_content = EXCLUDED.lyric_content"
            );
        } catch (Exception ignored) {
        }

        // 7. Cập nhật sequence cho các bảng
        try {
            jdbcTemplate.execute("SELECT setval(pg_get_serial_sequence('official_lyrics', 'id'), COALESCE(MAX(id), 1)) FROM official_lyrics");
            jdbcTemplate.execute("SELECT setval(pg_get_serial_sequence('personal_lyrics', 'id'), COALESCE(MAX(id), 1)) FROM personal_lyrics");
        } catch (Exception ignored) {
        }

        log.info("LyricSchemaInitializer completed successfully.");
    }
}
