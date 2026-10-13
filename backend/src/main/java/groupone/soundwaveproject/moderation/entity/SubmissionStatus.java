package groupone.soundwaveproject.moderation.entity;

/**
 * Liệt kê các trạng thái của một yêu cầu kiểm duyệt bài hát (UC-24: Manage Track Moderation).
 */
public enum SubmissionStatus {
    /**
     * Bài hát đang trong hàng đợi chờ nhân viên kiểm duyệt xử lý.
     */
    PENDING,

    /**
     * Bài hát đã được kiểm duyệt viên phê duyệt và đủ điều kiện phát hành công khai.
     */
    APPROVED,

    /**
     * Bài hát đã bị kiểm duyệt viên từ chối hoặc bị gỡ bỏ do vi phạm tiêu chuẩn.
     */
    REJECTED
}
