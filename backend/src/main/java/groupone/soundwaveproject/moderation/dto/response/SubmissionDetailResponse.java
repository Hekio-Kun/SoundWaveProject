package groupone.soundwaveproject.moderation.dto.response;

import groupone.soundwaveproject.moderation.entity.SubmissionStatus;

import java.time.Instant;

/**
 * DTO phản hồi thông tin chi tiết một yêu cầu kiểm duyệt bài hát (UC-24.1 View Track Details).
 * Cung cấp đầy đủ thông tin bài hát, tệp âm thanh, lời bài hát (lyrics), thông tin tác giả và người kiểm duyệt.
 *
 * @param id              ID bản ghi yêu cầu kiểm duyệt
 * @param status          Trạng thái kiểm duyệt hiện tại (PENDING, APPROVED, REJECTED)
 * @param submitterNote   Lời nhắn/ghi chú từ tác giả khi nộp bài
 * @param reviewerNote    Ghi chú nội bộ của kiểm duyệt viên
 * @param rejectionReason Lý do từ chối bài hát (nếu bị từ chối)
 * @param submittedAt     Thời điểm gửi yêu cầu kiểm duyệt
 * @param reviewedAt      Thời điểm hoàn tất kiểm duyệt
 * @param track           Thông tin chi tiết bài hát cùng lời bài hát (lyrics)
 * @param submitter       Thông tin tóm tắt tài khoản tác giả
 * @param reviewer        Thông tin tóm tắt tài khoản kiểm duyệt viên
 */
public record SubmissionDetailResponse(
        Long id,
        SubmissionStatus status,
        String submitterNote,
        String reviewerNote,
        String rejectionReason,
        Instant submittedAt,
        Instant reviewedAt,
        TrackDetailResponse track,
        UserSummaryResponse submitter,
        UserSummaryResponse reviewer
) {}
