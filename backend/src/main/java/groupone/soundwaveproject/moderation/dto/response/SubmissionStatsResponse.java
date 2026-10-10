package groupone.soundwaveproject.moderation.dto.response;

/**
 * DTO phản hồi số liệu thống kê tổng hợp của hàng đợi kiểm duyệt bài hát (UC-24.1 View Moderation Queue Stats).
 *
 * @param pendingCount  Số lượng bài hát đang chờ duyệt (PENDING)
 * @param approvedCount Số lượng bài hát đã được phê duyệt (APPROVED)
 * @param rejectedCount Số lượng bài hát đã bị từ chối (REJECTED)
 * @param totalCount    Tổng số bài hát từng được nộp vào hàng đợi
 */
public record SubmissionStatsResponse(
        long pendingCount,
        long approvedCount,
        long rejectedCount,
        long totalCount
) {}
