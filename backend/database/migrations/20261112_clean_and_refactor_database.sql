-- ==============================================================================
-- SoundWave Database Refactor & Data Cleanup Migration
-- Target: ep-broad-truth-b337hf2b-pooler.c-4.ap-southeast-1.aws.neon.tech/SoundWave
-- Date: 2026-11-12
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. Xóa các ràng buộc Khóa ngoại cũ trỏ sai sang app_users
-- ------------------------------------------------------------------------------
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS fk_user_profiles_app_users;
ALTER TABLE email_verification_tokens DROP CONSTRAINT IF EXISTS fk3p1m42k50qhjbo815nl38nfby;
ALTER TABLE password_reset_tokens DROP CONSTRAINT IF EXISTS fkk4vaguhrxs5jl3lqtshglaxo8;
ALTER TABLE refresh_tokens DROP CONSTRAINT IF EXISTS fkt72gijoak5yufxws745gwflis;

-- ------------------------------------------------------------------------------
-- 2. Sửa đổi dữ liệu User Profiles bị gán nhầm
-- ------------------------------------------------------------------------------
-- User 4: tuantace201233@gmail.com (Trương Anh Tuấn)
UPDATE user_profiles
SET username = 'tuanta', display_name = 'Trương Anh Tuấn'
WHERE user_id = 4;

-- User 5: listener.test@gmail.com (Test Listener)
UPDATE user_profiles
SET username = 'listenertest', display_name = 'Test Listener'
WHERE user_id = 5;

-- ------------------------------------------------------------------------------
-- 3. Thêm mới bản ghi User Profiles cho 6 tài khoản còn thiếu
-- ------------------------------------------------------------------------------
INSERT INTO user_profiles (user_id, username, display_name, bio, country_code, created_at, updated_at)
VALUES
    (6, 'haotnt', 'Trần Nguyễn Thái Hào', 'Thành viên nhóm phát triển SoundWave', 'VN', timezone('UTC'::text, CURRENT_TIMESTAMP(3)), timezone('UTC'::text, CURRENT_TIMESTAMP(3)))
ON CONFLICT (user_id) DO UPDATE 
SET username = EXCLUDED.username, display_name = EXCLUDED.display_name;

INSERT INTO user_profiles (user_id, username, display_name, bio, country_code, created_at, updated_at)
VALUES
    (21, 'lananh', 'Lan Anh', 'Người yêu âm nhạc V-Pop', 'VN', timezone('UTC'::text, CURRENT_TIMESTAMP(3)), timezone('UTC'::text, CURRENT_TIMESTAMP(3)))
ON CONFLICT (user_id) DO UPDATE 
SET username = EXCLUDED.username, display_name = EXCLUDED.display_name;

INSERT INTO user_profiles (user_id, username, display_name, bio, country_code, created_at, updated_at)
VALUES
    (22, 'quanghuy', 'Quang Huy', 'Đam mê dòng nhạc Rap & Hip-hop', 'VN', timezone('UTC'::text, CURRENT_TIMESTAMP(3)), timezone('UTC'::text, CURRENT_TIMESTAMP(3)))
ON CONFLICT (user_id) DO UPDATE 
SET username = EXCLUDED.username, display_name = EXCLUDED.display_name;

INSERT INTO user_profiles (user_id, username, display_name, bio, country_code, created_at, updated_at)
VALUES
    (23, 'yuki', 'Yuki Mori', 'Fan Anime OST & J-Pop', 'JP', timezone('UTC'::text, CURRENT_TIMESTAMP(3)), timezone('UTC'::text, CURRENT_TIMESTAMP(3)))
ON CONFLICT (user_id) DO UPDATE 
SET username = EXCLUDED.username, display_name = EXCLUDED.display_name;

INSERT INTO user_profiles (user_id, username, display_name, bio, country_code, created_at, updated_at)
VALUES
    (24, 'minhduc', 'Minh Đức', 'Giai điệu Acoustic thư giãn', 'VN', timezone('UTC'::text, CURRENT_TIMESTAMP(3)), timezone('UTC'::text, CURRENT_TIMESTAMP(3)))
ON CONFLICT (user_id) DO UPDATE 
SET username = EXCLUDED.username, display_name = EXCLUDED.display_name;

INSERT INTO user_profiles (user_id, username, display_name, bio, country_code, created_at, updated_at)
VALUES
    (25, 'baotram', 'Bảo Trâm', 'Cập nhật bảng xếp hạng Hot Trends', 'VN', timezone('UTC'::text, CURRENT_TIMESTAMP(3)), timezone('UTC'::text, CURRENT_TIMESTAMP(3)))
ON CONFLICT (user_id) DO UPDATE 
SET username = EXCLUDED.username, display_name = EXCLUDED.display_name;

-- ------------------------------------------------------------------------------
-- 4. Thêm khóa ngoại chuẩn từ user_profiles sang users(user_id)
-- ------------------------------------------------------------------------------
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS fk_user_profiles_users;
ALTER TABLE user_profiles 
  ADD CONSTRAINT fk_user_profiles_users 
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;

-- ------------------------------------------------------------------------------
-- 5. Bổ sung các cột còn thiếu trong track_submissions
-- ------------------------------------------------------------------------------
ALTER TABLE track_submissions 
  ADD COLUMN IF NOT EXISTS submission_type VARCHAR(30) DEFAULT 'TRACK_RELEASE' NOT NULL,
  ADD COLUMN IF NOT EXISTS proposed_lyrics TEXT;

-- Xóa constraint cũ nếu đã có rồi add lại
ALTER TABLE track_submissions DROP CONSTRAINT IF EXISTS ck_track_submissions_type;
ALTER TABLE track_submissions 
  ADD CONSTRAINT ck_track_submissions_type 
  CHECK (submission_type IN ('TRACK_RELEASE', 'LYRIC_UPDATE'));

-- ------------------------------------------------------------------------------
-- 6. Sửa tính bất nhất của trạng thái bài hát & kiểm duyệt
-- ------------------------------------------------------------------------------
-- Tracks 38 ("3017-2") và 58 ("Raindance") đang PUBLISHED nhưng kiểm duyệt lại là REJECTED
UPDATE track_submissions 
SET status = 'APPROVED', reviewer_user_id = 2, reviewed_at = submitted_at + INTERVAL '1 hour'
WHERE track_id IN (38, 58) AND status = 'REJECTED';

-- ------------------------------------------------------------------------------
-- 7. Xóa các bảng thừa / rác của hệ thống cũ
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS system_reviews CASCADE;
DROP TABLE IF EXISTS app_users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- ------------------------------------------------------------------------------
-- 8. Đồng bộ các Sequence ID (tránh Duplicate Key khi insert mới)
-- ------------------------------------------------------------------------------
SELECT setval(pg_get_serial_sequence('users', 'user_id'), COALESCE(MAX(user_id), 1)) FROM users;
SELECT setval(pg_get_serial_sequence('tracks', 'track_id'), COALESCE(MAX(track_id), 1)) FROM tracks;
SELECT setval(pg_get_serial_sequence('albums', 'album_id'), COALESCE(MAX(album_id), 1)) FROM albums;
SELECT setval(pg_get_serial_sequence('playlists', 'playlist_id'), COALESCE(MAX(playlist_id), 1)) FROM playlists;
SELECT setval(pg_get_serial_sequence('track_submissions', 'submission_id'), COALESCE(MAX(submission_id), 1)) FROM track_submissions;
SELECT setval(pg_get_serial_sequence('official_lyrics', 'official_lyric_id'), COALESCE(MAX(official_lyric_id), 1)) FROM official_lyrics;
SELECT setval(pg_get_serial_sequence('personal_lyrics', 'personal_lyric_id'), COALESCE(MAX(personal_lyric_id), 1)) FROM personal_lyrics;
SELECT setval(pg_get_serial_sequence('notifications', 'notification_id'), COALESCE(MAX(notification_id), 1)) FROM notifications;
SELECT setval(pg_get_serial_sequence('listening_history', 'history_id'), COALESCE(MAX(history_id), 1)) FROM listening_history;
SELECT setval(pg_get_serial_sequence('content_reports', 'report_id'), COALESCE(MAX(report_id), 1)) FROM content_reports;
SELECT setval(pg_get_serial_sequence('refresh_tokens', 'refresh_token_id'), COALESCE(MAX(refresh_token_id), 1)) FROM refresh_tokens;
SELECT setval(pg_get_serial_sequence('email_verification_tokens', 'verification_token_id'), COALESCE(MAX(verification_token_id), 1)) FROM email_verification_tokens;
SELECT setval(pg_get_serial_sequence('password_reset_tokens', 'reset_token_id'), COALESCE(MAX(reset_token_id), 1)) FROM password_reset_tokens;

COMMIT;
