package groupone.soundwaveproject.studio.dto.response;

import java.time.Instant;

/**
 * Data Transfer Object đại diện cho một bản ghi trong lịch sử phản hồi kiểm duyệt của bài hát.
 *
 * Phục vụ luồng Alternative Flow AF01 trong tài liệu đặc tả RDS UC-20 (View Rejection Reason):
 * Cho phép Listener xem lại phản hồi kiểm duyệt của các lần nộp duyệt trước đó.
 *
 * @param submissionId     Mã định danh đợt nộp duyệt
 * @param status           Trạng thái duyệt của đợt nộp (ví dụ: REJECTED, APPROVED, PENDING)
 * @param rejectionReason  Lý do từ chối kiểm duyệt (nếu có)
 * @param reviewerNote     Ghi chú bổ sung từ kiểm duyệt viên
 * @param submittedAt      Thời điểm bài hát được gửi nộp
 * @param reviewedAt       Thời điểm kiểm duyệt viên đưa ra quyết định
 */
public record RejectionHistoryItemResponse(
        Long submissionId,
        String status,
        String rejectionReason,
        String reviewerNote,
        Instant submittedAt,
        Instant reviewedAt
) {
}
