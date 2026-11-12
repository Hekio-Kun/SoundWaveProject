package groupone.soundwaveproject.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Initializer chạy đầu tiên (@Order(1)) nhằm đảm bảo tên các cột khóa chính (PK)
 * trong cơ sở dữ liệu đồng bộ 100% với tài liệu RDS và JPA Entities:
 * users(user_id), tracks(track_id), albums(album_id), genres(genre_id), staffs(staff_id)...
 * Đồng thời chuẩn hóa bảng playlist_tracks thành thực thể yếu với khóa chính tổng hợp (playlist_id, track_id).
 */
@Slf4j
@Component
@Order(1)
@RequiredArgsConstructor
public class DatabaseColumnRenameInitializer implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        Map<String, String> columnRenames = new LinkedHashMap<>();
        columnRenames.put("users", "user_id");
        columnRenames.put("staffs", "staff_id");
        columnRenames.put("staff_roles", "role_id");
        columnRenames.put("genres", "genre_id");
        columnRenames.put("albums", "album_id");
        columnRenames.put("tracks", "track_id");
        columnRenames.put("playlists", "playlist_id");
        columnRenames.put("track_submissions", "submission_id");
        columnRenames.put("content_reports", "report_id");
        columnRenames.put("notifications", "notification_id");
        columnRenames.put("listening_history", "history_id");
        columnRenames.put("official_lyrics", "official_lyric_id");
        columnRenames.put("personal_lyrics", "personal_lyric_id");
        columnRenames.put("refresh_tokens", "refresh_token_id");
        columnRenames.put("email_verification_tokens", "verification_token_id");
        columnRenames.put("password_reset_tokens", "reset_token_id");
        columnRenames.put("account_unlock_tokens", "unlock_token_id");

        for (Map.Entry<String, String> entry : columnRenames.entrySet()) {
            String table = entry.getKey();
            String newCol = entry.getValue();

            try {
                Boolean tableExists = jdbcTemplate.queryForObject(
                        "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = ?)",
                        Boolean.class, table
                );
                if (!Boolean.TRUE.equals(tableExists)) {
                    continue;
                }

                Boolean idExists = jdbcTemplate.queryForObject(
                        "SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = ? AND column_name = 'id')",
                        Boolean.class, table
                );

                Boolean newColExists = jdbcTemplate.queryForObject(
                        "SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = ? AND column_name = ?)",
                        Boolean.class, table, newCol
                );

                if (Boolean.TRUE.equals(idExists) && !Boolean.TRUE.equals(newColExists)) {
                    jdbcTemplate.execute("ALTER TABLE " + table + " RENAME COLUMN id TO " + newCol);
                    log.info("Renamed primary key column in table '{}': id -> {}", table, newCol);
                }
            } catch (Exception e) {
                log.warn("DatabaseColumnRenameInitializer notice for table '{}': {}", table, e.getMessage());
            }
        }

        // Chuẩn hóa bảng playlist_tracks thành thực thể yếu (Weak Entity) với khóa chính (playlist_id, track_id)
        try {
            Boolean ptExists = jdbcTemplate.queryForObject(
                    "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'playlist_tracks')",
                    Boolean.class
            );
            if (Boolean.TRUE.equals(ptExists)) {
                Boolean ptIdExists = jdbcTemplate.queryForObject(
                        "SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'playlist_tracks' AND column_name = 'playlist_track_id')",
                        Boolean.class
                );
                Boolean rawIdExists = jdbcTemplate.queryForObject(
                        "SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'playlist_tracks' AND column_name = 'id')",
                        Boolean.class
                );

                if (Boolean.TRUE.equals(ptIdExists) || Boolean.TRUE.equals(rawIdExists)) {
                    jdbcTemplate.execute("ALTER TABLE playlist_tracks DROP CONSTRAINT IF EXISTS playlist_tracks_pkey");
                    jdbcTemplate.execute("ALTER TABLE playlist_tracks DROP CONSTRAINT IF EXISTS uk_playlist_track");
                    if (Boolean.TRUE.equals(ptIdExists)) {
                        jdbcTemplate.execute("ALTER TABLE playlist_tracks DROP COLUMN IF EXISTS playlist_track_id CASCADE");
                    }
                    if (Boolean.TRUE.equals(rawIdExists)) {
                        jdbcTemplate.execute("ALTER TABLE playlist_tracks DROP COLUMN IF EXISTS id CASCADE");
                    }
                    jdbcTemplate.execute("ALTER TABLE playlist_tracks DROP CONSTRAINT IF EXISTS pk_playlist_tracks");
                    jdbcTemplate.execute("ALTER TABLE playlist_tracks ADD CONSTRAINT pk_playlist_tracks PRIMARY KEY (playlist_id, track_id)");
                    log.info("Migrated 'playlist_tracks' to weak entity with composite PRIMARY KEY (playlist_id, track_id)");
                }
            }
        } catch (Exception e) {
            log.warn("DatabaseColumnRenameInitializer notice for 'playlist_tracks': {}", e.getMessage());
        }
    }
}
