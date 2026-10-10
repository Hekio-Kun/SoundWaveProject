package groupone.soundwaveproject.studio.dto.response;

import java.time.Instant;
import java.util.List;

/**
 * Data Transfer Object trả về thông tin chi tiết lý do từ chối bài hát theo tài liệu đặc tả RDS:
 * - Use Case: UC-20 (View Rejection Reason)
 * - Actor: Listener (Nghệ sĩ / Uploader sở hữu bài hát)
 * - Quy tắc nghiệp vụ BR-20 (Lý do từ chối bắt buộc) và BR-24 (Được phép sửa đổi và nộp lại)
 *
 * @param trackId          Mã bài hát bị từ chối
 * @param trackTitle       Tiêu đề bài hát
 * @param status           Trạng thái bài hát (REJECTED)
 * @param rejectionReason  Lý do từ chối kiểm duyệt (EX01: có fallback mặc định nếu trống)
 * @param reviewerNote     Ghi chú bổ sung từ kiểm duyệt viên
 * @param reviewedAt       Thời gian ghi nhận quyết định từ chối
 * @param history          Danh sách lịch sử các lần nộp duyệt và phản hồi (AF01: Prior submission feedback)
 */
public record RejectionDetailsResponse(
        Long trackId,
        String trackTitle,
        String status,
        String rejectionReason,
        String reviewerNote,
        Instant reviewedAt,
        List<RejectionHistoryItemResponse> history
) {
}
