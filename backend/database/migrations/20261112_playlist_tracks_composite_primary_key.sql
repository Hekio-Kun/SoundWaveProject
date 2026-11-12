-- ==============================================================================
-- SoundWave Database Migration: Chuyển playlist_tracks thành thực thể yếu (Weak Entity)
-- Thay thế khóa chính đơn (playlist_track_id) bằng khóa chính tổng hợp (playlist_id, track_id)
-- Ngày thực thi: 12/11/2026
-- ==============================================================================

DO $$
BEGIN
    -- 1. Xóa các constraint khóa chính cũ nếu đang dùng playlist_track_id
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public' 
          AND table_name = 'playlist_tracks' 
          AND constraint_name = 'playlist_tracks_pkey'
    ) THEN
        ALTER TABLE playlist_tracks DROP CONSTRAINT playlist_tracks_pkey;
    END IF;

    -- 2. Xóa unique constraint cũ (uk_playlist_track) nếu có vì PK tổng hợp đã bao hàm unique
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public' 
          AND table_name = 'playlist_tracks' 
          AND constraint_name = 'uk_playlist_track'
    ) THEN
        ALTER TABLE playlist_tracks DROP CONSTRAINT uk_playlist_track;
    END IF;

    -- 3. Xóa cột playlist_track_id và id (nếu còn)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' 
          AND table_name = 'playlist_tracks' 
          AND column_name = 'playlist_track_id'
    ) THEN
        ALTER TABLE playlist_tracks DROP COLUMN playlist_track_id CASCADE;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' 
          AND table_name = 'playlist_tracks' 
          AND column_name = 'id'
    ) THEN
        ALTER TABLE playlist_tracks DROP COLUMN id CASCADE;
    END IF;

    -- 4. Thêm khóa chính tổng hợp (playlist_id, track_id) cho thực thể yếu
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public' 
          AND table_name = 'playlist_tracks' 
          AND constraint_type = 'PRIMARY KEY'
    ) THEN
        ALTER TABLE playlist_tracks ADD CONSTRAINT pk_playlist_tracks PRIMARY KEY (playlist_id, track_id);
    END IF;
END $$;
