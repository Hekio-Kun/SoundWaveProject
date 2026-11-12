-- ==============================================================================
-- SoundWave: Standardize Primary Keys, Foreign Keys, and Staff Columns to Specification
-- Date: 2026-11-12
-- ==============================================================================

DO $$
BEGIN
    -- 1. genres: created_by_user_id -> created_by_staff_id references staffs(staff_id)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'genres' AND column_name = 'created_by_user_id'
    ) THEN
        ALTER TABLE genres DROP CONSTRAINT IF EXISTS fk_genres_created_by_app_users;
        ALTER TABLE genres RENAME COLUMN created_by_user_id TO created_by_staff_id;
    END IF;

    -- Thêm foreign key cho genres.created_by_staff_id -> staffs(staff_id)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public' AND table_name = 'genres' AND constraint_name = 'fk_genres_created_by_staffs'
    ) THEN
        ALTER TABLE genres 
          ADD CONSTRAINT fk_genres_created_by_staffs 
          FOREIGN KEY (created_by_staff_id) REFERENCES staffs(staff_id);
    END IF;

    -- 2. track_submissions: reviewer_user_id -> reviewer_staff_id references staffs(staff_id)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'track_submissions' AND column_name = 'reviewer_user_id'
    ) THEN
        ALTER TABLE track_submissions RENAME COLUMN reviewer_user_id TO reviewer_staff_id;
    END IF;

    -- 3. official_lyrics: created_by_user_id -> created_by_staff_id references staffs(staff_id)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'official_lyrics' AND column_name = 'created_by_user_id'
    ) THEN
        ALTER TABLE official_lyrics DROP CONSTRAINT IF EXISTS fkaapwxgur5skqdrnov9ldxgq9o;
        ALTER TABLE official_lyrics RENAME COLUMN created_by_user_id TO created_by_staff_id;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public' AND table_name = 'official_lyrics' AND constraint_name = 'fk_official_lyrics_created_by_staffs'
    ) THEN
        ALTER TABLE official_lyrics 
          ADD CONSTRAINT fk_official_lyrics_created_by_staffs 
          FOREIGN KEY (created_by_staff_id) REFERENCES staffs(staff_id);
    END IF;

    -- Bổ sung language_code cho official_lyrics
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'official_lyrics' AND column_name = 'language_code'
    ) THEN
        ALTER TABLE official_lyrics ADD COLUMN language_code VARCHAR(10) DEFAULT 'vi' NOT NULL;
    END IF;

    -- 4. personal_lyrics: bổ sung language_code
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'personal_lyrics' AND column_name = 'language_code'
    ) THEN
        ALTER TABLE personal_lyrics ADD COLUMN language_code VARCHAR(10) DEFAULT 'vi' NOT NULL;
    END IF;

    -- 5. content_reports: handled_by_user_id -> handled_by_staff_id references staffs(staff_id)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'content_reports' AND column_name = 'handled_by_user_id'
    ) THEN
        ALTER TABLE content_reports RENAME COLUMN handled_by_user_id TO handled_by_staff_id;
    END IF;

END $$;
