-- Migration: Thêm các cột evidence_url và evidence_public_id vào bảng content_reports
-- Phục vụ lưu trữ tệp chứng minh sở hữu bản quyền bài hát (UC-22.1 Create Content Report)

ALTER TABLE content_reports ADD COLUMN IF NOT EXISTS evidence_url VARCHAR(500);
ALTER TABLE content_reports ADD COLUMN IF NOT EXISTS evidence_public_id VARCHAR(200);

