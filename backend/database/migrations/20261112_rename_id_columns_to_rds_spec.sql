-- ==============================================================================
-- SoundWave - Rename Primary Key Columns to Match RDS Specification
-- Purpose: Standardize ID columns to <entity>_id for all tables:
--          users(user_id), tracks(track_id), albums(album_id), genres(genre_id), staffs(staff_id)...
-- Date: 2026-11-12
-- ==============================================================================

DO $$
BEGIN
  -- 1. users
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='id') THEN
    ALTER TABLE users RENAME COLUMN id TO user_id;
  END IF;

  -- 2. staffs
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='staffs' AND column_name='id') THEN
    ALTER TABLE staffs RENAME COLUMN id TO staff_id;
  END IF;

  -- 3. staff_roles
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='staff_roles' AND column_name='id') THEN
    ALTER TABLE staff_roles RENAME COLUMN id TO role_id;
  END IF;

  -- 4. genres
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='genres' AND column_name='id') THEN
    ALTER TABLE genres RENAME COLUMN id TO genre_id;
  END IF;

  -- 5. albums
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='albums' AND column_name='id') THEN
    ALTER TABLE albums RENAME COLUMN id TO album_id;
  END IF;

  -- 6. tracks
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='tracks' AND column_name='id') THEN
    ALTER TABLE tracks RENAME COLUMN id TO track_id;
  END IF;

  -- 7. playlists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='playlists' AND column_name='id') THEN
    ALTER TABLE playlists RENAME COLUMN id TO playlist_id;
  END IF;

  -- 8. playlist_tracks
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='playlist_tracks' AND column_name='id') THEN
    ALTER TABLE playlist_tracks RENAME COLUMN id TO playlist_track_id;
  END IF;

  -- 9. track_submissions
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='track_submissions' AND column_name='id') THEN
    ALTER TABLE track_submissions RENAME COLUMN id TO submission_id;
  END IF;

  -- 10. content_reports
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='content_reports' AND column_name='id') THEN
    ALTER TABLE content_reports RENAME COLUMN id TO report_id;
  END IF;

  -- 11. notifications
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notifications' AND column_name='id') THEN
    ALTER TABLE notifications RENAME COLUMN id TO notification_id;
  END IF;

  -- 12. listening_history
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='listening_history' AND column_name='id') THEN
    ALTER TABLE listening_history RENAME COLUMN id TO history_id;
  END IF;

  -- 13. official_lyrics
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='official_lyrics' AND column_name='id') THEN
    ALTER TABLE official_lyrics RENAME COLUMN id TO official_lyric_id;
  END IF;

  -- 14. personal_lyrics
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='personal_lyrics' AND column_name='id') THEN
    ALTER TABLE personal_lyrics RENAME COLUMN id TO personal_lyric_id;
  END IF;

  -- 15. refresh_tokens
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='refresh_tokens' AND column_name='id') THEN
    ALTER TABLE refresh_tokens RENAME COLUMN id TO refresh_token_id;
  END IF;

  -- 16. email_verification_tokens
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='email_verification_tokens' AND column_name='id') THEN
    ALTER TABLE email_verification_tokens RENAME COLUMN id TO verification_token_id;
  END IF;

  -- 17. password_reset_tokens
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='password_reset_tokens' AND column_name='id') THEN
    ALTER TABLE password_reset_tokens RENAME COLUMN id TO reset_token_id;
  END IF;

  -- 18. account_unlock_tokens
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='account_unlock_tokens' AND column_name='id') THEN
    ALTER TABLE account_unlock_tokens RENAME COLUMN id TO unlock_token_id;
  END IF;

END $$;
