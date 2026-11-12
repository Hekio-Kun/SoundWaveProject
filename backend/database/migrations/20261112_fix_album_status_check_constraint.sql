-- ==============================================================================
-- SoundWave: Fix ck_albums_status to support PENDING and REJECTED statuses
-- Date: 2026-11-12
-- ==============================================================================

ALTER TABLE albums DROP CONSTRAINT IF EXISTS ck_albums_status;
ALTER TABLE albums ADD CONSTRAINT ck_albums_status 
  CHECK (status IN ('DRAFT', 'PENDING', 'PUBLISHED', 'REJECTED'));
