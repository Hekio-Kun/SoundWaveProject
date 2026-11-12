-- =================================================================================================
-- Migration: 20261113_allow_null_created_by_staff_id_for_draft_lyrics.sql
-- Description: Cho phép NULL cho cột created_by_staff_id trong bảng official_lyrics
--              khi Creator tải lên bài hát ở trạng thái DRAFT (chưa qua kiểm duyệt Staff).
-- =================================================================================================

ALTER TABLE IF EXISTS public.official_lyrics
    ALTER COLUMN created_by_staff_id DROP NOT NULL;

ALTER TABLE IF EXISTS public.official_lyrics
    DROP CONSTRAINT IF EXISTS official_lyrics_created_by_user_id_not_null;
