-- ==============================================================================
-- Migration: 20261022_update_staff_role_moderator_to_staff.sql
-- Purpose: Đổi tên role MODERATOR thành STAFF trong bảng staff_roles
-- Database: PostgreSQL 18 (Neon DB)
-- ==============================================================================

BEGIN;

UPDATE staff_roles 
SET code = 'STAFF', 
    name = 'Staff', 
    description = 'Nhân viên vận hành và kiểm duyệt nội dung SoundWave'
WHERE code = 'MODERATOR';

COMMIT;
