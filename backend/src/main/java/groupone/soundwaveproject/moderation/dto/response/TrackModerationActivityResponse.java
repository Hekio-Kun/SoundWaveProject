package groupone.soundwaveproject.moderation.dto.response;

import java.time.Instant;

/**
 * DTO đại diện cho một bản ghi kiểm duyệt bài hát trong lịch sử hoạt động của nhân viên (UC-27.4).
 *
 * @param submissionId    Mã định danh bản ghi kiểm duyệt
 * @param trackId         ID bài hát
 * @param trackTitle      Tiêu đề bài hát
 * @param artistName      Tên nghệ sĩ / người đăng bài
 * @param action          Hành động kiểm duyệt (APPROVED, REJECTED, TAKEN_DOWN)
 * @param rejectionReason Lý do từ chối (nếu bị reject)
 * @param reviewerNote    Ghi chú kiểm duyệt của nhân viên
 * @param reviewedAt      Thời điểm hoàn tất kiểm duyệt
 */
public record TrackModerationActivityResponse(
        Long submissionId,
        Long trackId,
        String trackTitle,
        String artistName,
        String action,
        String rejectionReason,
        String reviewerNote,
        Instant reviewedAt
) {}

