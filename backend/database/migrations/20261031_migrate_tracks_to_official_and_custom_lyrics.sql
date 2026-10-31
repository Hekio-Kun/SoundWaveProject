-- ==============================================================================
-- SoundWave Schema Migration: 20261031_migrate_tracks_to_official_and_custom_lyrics.sql
-- Mục đích:
-- 1. Đảm bảo cấu trúc bảng official_lyrics và personal_lyrics (Dual-tier Lyrics)
-- 2. Di chuyển dữ liệu lyrics từ bảng tracks sang bảng official_lyrics (PUBLISHED)
-- 3. Di chuyển dữ liệu lyrics từ bảng tracks sang bảng personal_lyrics (CUSTOM)
-- 4. Đồng bộ hóa hai chiều với các bảng tương thích official_lyric và custom_lyric
-- ==============================================================================

BEGIN;

-- 1. Đảm bảo bảng official_lyrics tồn tại và chuẩn hóa
CREATE TABLE IF NOT EXISTS official_lyrics (
    id BIGSERIAL PRIMARY KEY,
    track_id BIGINT NOT NULL UNIQUE,
    lyric_content TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PUBLISHED',
    created_by_user_id BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bỏ các ràng buộc khóa ngoại cũ nếu có để tránh xung đột
ALTER TABLE IF EXISTS official_lyrics DROP CONSTRAINT IF EXISTS fk_official_lyrics_created_by_staffs;
ALTER TABLE IF EXISTS official_lyrics DROP CONSTRAINT IF EXISTS fk_official_lyrics_created_by_app_users;
ALTER TABLE IF EXISTS official_lyrics DROP CONSTRAINT IF EXISTS fk_official_lyrics_languages;
ALTER TABLE IF EXISTS official_lyrics DROP COLUMN IF EXISTS language_id;

-- 2. Đảm bảo bảng personal_lyrics tồn tại và chuẩn hóa
CREATE TABLE IF NOT EXISTS personal_lyrics (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    track_id BIGINT NOT NULL,
    lyric_type VARCHAR(20) NOT NULL DEFAULT 'CUSTOM',
    lyric_content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_personal_lyrics_user_track_type UNIQUE (user_id, track_id, lyric_type)
);

ALTER TABLE IF EXISTS personal_lyrics DROP CONSTRAINT IF EXISTS fk_personal_lyrics_languages;
ALTER TABLE IF EXISTS personal_lyrics DROP COLUMN IF EXISTS language_id;

-- 3. Đảm bảo các bảng alias tương thích (official_lyric, custom_lyric) tồn tại
CREATE TABLE IF NOT EXISTS official_lyric (
    id BIGSERIAL PRIMARY KEY,
    track_id BIGINT NOT NULL UNIQUE,
    lyric_content TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PUBLISHED',
    created_by_user_id BIGINT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS custom_lyric (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    track_id BIGINT NOT NULL,
    lyric_type VARCHAR(20) NOT NULL DEFAULT 'CUSTOM',
    lyric_content TEXT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_custom_lyric_user_track UNIQUE (user_id, track_id)
);

-- 4. Chuyển dữ liệu từ tracks sang official_lyrics (nếu có cột lyrics)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tracks' AND column_name = 'lyrics'
    ) THEN
        -- Chèn hoặc cập nhật sang official_lyrics
        INSERT INTO official_lyrics (track_id, lyric_content, status, created_by_user_id, created_at, updated_at)
        SELECT 
            t.id, 
            t.lyrics, 
            'PUBLISHED', 
            COALESCE(
                (SELECT s.id FROM staffs s ORDER BY s.id ASC LIMIT 1),
                (SELECT u.id FROM users u WHERE u.role IN ('ADMIN', 'STAFF') ORDER BY u.id ASC LIMIT 1),
                t.uploader_user_id
            ),
            COALESCE(t.created_at, now() AT TIME ZONE 'UTC'), 
            COALESCE(t.updated_at, now() AT TIME ZONE 'UTC')
        FROM tracks t
        WHERE t.lyrics IS NOT NULL AND TRIM(t.lyrics) != ''
        ON CONFLICT (track_id) DO UPDATE 
        SET lyric_content = EXCLUDED.lyric_content, 
            status = 'PUBLISHED', 
            updated_at = EXCLUDED.updated_at;

        -- Chèn hoặc cập nhật sang personal_lyrics (cho uploader)
        INSERT INTO personal_lyrics (user_id, track_id, lyric_type, lyric_content, created_at, updated_at)
        SELECT 
            COALESCE(t.uploader_user_id, 1), 
            t.id, 
            'CUSTOM', 
            t.lyrics, 
            COALESCE(t.created_at, now() AT TIME ZONE 'UTC'), 
            COALESCE(t.updated_at, now() AT TIME ZONE 'UTC')
        FROM tracks t
        WHERE t.lyrics IS NOT NULL AND TRIM(t.lyrics) != ''
        ON CONFLICT (user_id, track_id, lyric_type) DO UPDATE 
        SET lyric_content = EXCLUDED.lyric_content, 
            updated_at = EXCLUDED.updated_at;
    END IF;
END $$;

-- 5. Đồng bộ từ official_lyrics sang personal_lyrics (đảm bảo mọi track đã có official lyric đều có thêm custom lyric)
INSERT INTO personal_lyrics (user_id, track_id, lyric_type, lyric_content, created_at, updated_at)
SELECT 
    COALESCE(t.uploader_user_id, 1), 
    ol.track_id, 
    'CUSTOM', 
    ol.lyric_content, 
    ol.created_at, 
    ol.updated_at
FROM official_lyrics ol
JOIN tracks t ON t.id = ol.track_id
WHERE ol.lyric_content IS NOT NULL AND TRIM(ol.lyric_content) != ''
ON CONFLICT (user_id, track_id, lyric_type) DO UPDATE 
SET lyric_content = EXCLUDED.lyric_content, 
    updated_at = EXCLUDED.updated_at;

-- 6. Đồng bộ sang các bảng alias official_lyric và custom_lyric
INSERT INTO official_lyric (track_id, lyric_content, status, created_by_user_id, created_at, updated_at)
SELECT ol.track_id, ol.lyric_content, ol.status, COALESCE(ol.created_by_user_id, 1), 
       CAST(ol.created_at AS timestamp without time zone), 
       CAST(ol.updated_at AS timestamp without time zone)
FROM official_lyrics ol
ON CONFLICT (track_id) DO UPDATE 
SET lyric_content = EXCLUDED.lyric_content, status = EXCLUDED.status;

INSERT INTO custom_lyric (user_id, track_id, lyric_type, lyric_content, created_at, updated_at)
SELECT pl.user_id, pl.track_id, pl.lyric_type, pl.lyric_content, 
       CAST(pl.created_at AS timestamp without time zone), 
       CAST(pl.updated_at AS timestamp without time zone)
FROM personal_lyrics pl
WHERE pl.lyric_type = 'CUSTOM'
ON CONFLICT (user_id, track_id) DO UPDATE 
SET lyric_content = EXCLUDED.lyric_content;

-- 7. Reset sequences
SELECT setval(pg_get_serial_sequence('official_lyrics', 'id'), COALESCE(MAX(id), 1)) FROM official_lyrics;
SELECT setval(pg_get_serial_sequence('personal_lyrics', 'id'), COALESCE(MAX(id), 1)) FROM personal_lyrics;
SELECT setval(pg_get_serial_sequence('official_lyric', 'id'), COALESCE(MAX(id), 1)) FROM official_lyric;
SELECT setval(pg_get_serial_sequence('custom_lyric', 'id'), COALESCE(MAX(id), 1)) FROM custom_lyric;

COMMIT;

