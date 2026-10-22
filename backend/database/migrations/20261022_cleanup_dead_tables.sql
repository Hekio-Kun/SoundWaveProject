-- ==============================================================================
-- Migration: 20261022_cleanup_dead_tables.sql
-- Purpose: Xóa các bảng rác (app_users, roles) và bảng lyric_languages không còn sử dụng
-- Database: PostgreSQL 18 (Neon DB)
-- ==============================================================================

BEGIN;

-- 1. Xóa ràng buộc khóa ngoại từ official_lyrics và personal_lyrics tới lyric_languages (nếu có)
ALTER TABLE IF EXISTS official_lyrics 
    DROP CONSTRAINT IF EXISTS fk_official_lyrics_languages;

ALTER TABLE IF EXISTS personal_lyrics 
    DROP CONSTRAINT IF EXISTS fk_personal_lyrics_languages;

-- 2. Xóa bảng lyric_languages
DROP TABLE IF EXISTS lyric_languages CASCADE;

-- 3. Xóa bảng app_users (bảng user cũ, đã được chuyển toàn bộ sang users và staffs)
DROP TABLE IF EXISTS app_users CASCADE;

-- 4. Xóa bảng roles (bảng role cũ, đã được chuyển sang staff_roles)
DROP TABLE IF EXISTS roles CASCADE;

COMMIT;
