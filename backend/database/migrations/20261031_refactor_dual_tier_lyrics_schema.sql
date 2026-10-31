-- ==============================================================================
-- SoundWave Schema Migration: 20261031_refactor_dual_tier_lyrics_schema.sql
-- Mục đích:
-- 1. Làm sạch và tái cấu trúc bảng official_lyrics (Bỏ hoàn toàn language_id)
-- 2. Làm sạch và tái cấu trúc bảng personal_lyrics (Bỏ hoàn toàn language_id)
-- 3. Di chuyển dữ liệu hiện có từ tracks.lyrics sang official_lyrics (PUBLISHED)
-- ==============================================================================

BEGIN;

-- 1. Làm sạch và tái cấu trúc bảng official_lyrics (Bỏ hoàn toàn language_id)
ALTER TABLE IF EXISTS official_lyrics DROP CONSTRAINT IF EXISTS uq_official_lyrics_track_language;
ALTER TABLE IF EXISTS official_lyrics DROP CONSTRAINT IF EXISTS ix_official_lyrics_public;
ALTER TABLE IF EXISTS official_lyrics DROP CONSTRAINT IF EXISTS fk_official_lyrics_languages;
ALTER TABLE IF EXISTS official_lyrics DROP COLUMN IF EXISTS language_id;

-- Đảm bảo mỗi track chỉ có DUY NHẤT 1 bản Official Lyric chính thức
ALTER TABLE official_lyrics DROP CONSTRAINT IF EXISTS uq_official_lyrics_track;
ALTER TABLE official_lyrics ADD CONSTRAINT uq_official_lyrics_track UNIQUE (track_id);

-- Đảm bảo trạng thái chỉ gồm DRAFT hoặc PUBLISHED
ALTER TABLE official_lyrics DROP CONSTRAINT IF EXISTS ck_official_lyrics_status;
ALTER TABLE official_lyrics ADD CONSTRAINT ck_official_lyrics_status CHECK (status IN ('DRAFT', 'PUBLISHED'));

-- 2. Làm sạch và tái cấu trúc bảng personal_lyrics (Bỏ hoàn toàn language_id)
ALTER TABLE IF EXISTS personal_lyrics DROP CONSTRAINT IF EXISTS uq_personal_lyrics_user_track_lang_type;
ALTER TABLE IF EXISTS personal_lyrics DROP CONSTRAINT IF EXISTS fk_personal_lyrics_languages;
ALTER TABLE IF EXISTS personal_lyrics DROP COLUMN IF EXISTS language_id;

-- Đảm bảo mỗi user với mỗi bài hát có 1 bản lời cá nhân (theo lyric_type: 'CUSTOM', 'TRANSLATION')
ALTER TABLE personal_lyrics DROP CONSTRAINT IF EXISTS uq_personal_lyrics_user_track_type;
ALTER TABLE personal_lyrics ADD CONSTRAINT uq_personal_lyrics_user_track_type UNIQUE (user_id, track_id, lyric_type);

-- Đảm bảo loại lời bài hát hợp lệ
ALTER TABLE personal_lyrics DROP CONSTRAINT IF EXISTS ck_personal_lyrics_type;
ALTER TABLE personal_lyrics ADD CONSTRAINT ck_personal_lyrics_type CHECK (lyric_type IN ('CUSTOM', 'TRANSLATION'));

-- 3. Di chuyển toàn bộ dữ liệu hiện có từ tracks.lyrics sang official_lyrics
INSERT INTO official_lyrics (track_id, lyric_content, status, created_by_user_id, created_at, updated_at)
SELECT 
    t.id, 
    t.lyrics, 
    'PUBLISHED', 
    (SELECT id FROM staffs ORDER BY id ASC LIMIT 1), 
    now() AT TIME ZONE 'UTC', 
    now() AT TIME ZONE 'UTC'
FROM tracks t
WHERE t.lyrics IS NOT NULL AND TRIM(t.lyrics) != ''
ON CONFLICT (track_id) DO UPDATE 
SET lyric_content = EXCLUDED.lyric_content, status = 'PUBLISHED', updated_at = now() AT TIME ZONE 'UTC';

COMMIT;
