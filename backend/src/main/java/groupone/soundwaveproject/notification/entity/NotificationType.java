package groupone.soundwaveproject.notification.entity;

/**
 * Phân loại các thông báo trong hệ thống SoundWave (UC-17 & UC-33: Notifications).
 */
public enum NotificationType {
    /**
     * Bài hát được Staff phê duyệt thành công và xuất bản lên catalog công khai.
     */
    TRACK_APPROVED,

    /**
     * Bài hát bị Staff từ chối kiểm duyệt kèm theo lý do cụ thể.
     */
    TRACK_REJECTED,

    /**
     * Có bài hát mới được tải lên và gửi vào hàng đợi kiểm duyệt (dành cho Staff).
     */
    TRACK_SUBMISSION,

    /**
     * Thông báo liên quan đến báo cáo vi phạm nội dung.
     */
    CONTENT_REPORT,

    /**
     * Thông báo chung từ nền tảng / ban quản trị.
     */
    SYSTEM_NOTICE
}
