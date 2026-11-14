-- =====================================================================================
-- Migration: Clean all data across SoundWave Host Database
-- Description:
--   1. Truncate all business data tables and reset auto-increment ID sequences to 1.
--   2. Preserve essential administrative roles in `staff_roles` (ADMIN, STAFF).
-- =====================================================================================

BEGIN;

TRUNCATE TABLE
    public.content_reports,
    public.playlist_tracks,
    public.favorites,
    public.listening_history,
    public.personal_lyrics,
    public.official_lyrics,
    public.track_submissions,
    public.tracks,
    public.playlists,
    public.albums,
    public.genres,
    public.notifications,
    public.refresh_tokens,
    public.account_unlock_tokens,
    public.password_reset_tokens,
    public.email_verification_tokens,
    public.user_profiles,
    public.users,
    public.staffs
RESTART IDENTITY CASCADE;

-- Ensure default staff_roles exist
INSERT INTO public.staff_roles (role_id, code, name, description, created_at)
VALUES 
    (1, 'ADMIN', 'Administrator', 'Quản trị viên toàn quyền hệ thống SoundWave', NOW()),
    (2, 'STAFF', 'Staff', 'Nhân viên vận hành và kiểm duyệt nội dung SoundWave', NOW())
ON CONFLICT (role_id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    description = EXCLUDED.description;

COMMIT;
