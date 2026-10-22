package groupone.soundwaveproject.notification.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

/**
 * Thực thể lưu trữ các thông báo hệ thống gửi tới người dùng hoặc nhân viên (UC-17 / UC-33: View My Notification).
 * Ánh xạ với bảng cơ sở dữ liệu: notifications
 */
@Entity
@Table(name = "notifications", indexes = {
        @Index(name = "idx_notifications_user_created", columnList = "user_id, created_at DESC"),
        @Index(name = "idx_notifications_staff_created", columnList = "staff_id, created_at DESC")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Notification {

    /**
     * Mã định danh duy nhất của thông báo (Khóa chính).
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * ID của người dùng nhận thông báo (Khóa ngoại logic trỏ tới users.id, null nếu gửi tới Staff).
     */
    @Column(name = "user_id")
    private Long userId;

    /**
     * ID của nhân viên nhận thông báo (Khóa ngoại logic trỏ tới staffs.id, null nếu gửi tới User).
     */
    @Column(name = "staff_id")
    private Long staffId;

    /**
     * ID của người thực hiện hành động tạo thông báo (Ví dụ: Staff duyệt, có thể null nếu do hệ thống).
     */
    @Column(name = "actor_id")
    private Long actorId;

    /**
     * Loại thông báo (TRACK_APPROVED, TRACK_REJECTED, TRACK_SUBMISSION, v.v.).
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private NotificationType type;

    /**
     * Tiêu đề ngắn gọn của thông báo.
     */
    @Column(nullable = false, length = 150)
    private String title;

    /**
     * Nội dung chi tiết hoặc tóm tắt thông điệp.
     */
    @Column(nullable = false, length = 500)
    private String message;

    /**
     * Loại thực thể tham chiếu dùng để điều hướng (TRACK, ALBUM, SUBMISSION, v.v.).
     */
    @Column(name = "reference_type", length = 50)
    private String referenceType;

    /**
     * Mã định danh thực thể tham chiếu (Ví dụ: ID bài hát hoặc slug).
     */
    @Column(name = "reference_id", length = 100)
    private String referenceId;

    /**
     * Trạng thái đã xem / đã đọc của thông báo (false: chưa đọc, true: đã đọc).
     */
    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private boolean isRead = false;

    /**
     * Thời điểm tạo thông báo theo UTC.
     */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    /**
     * Đánh dấu thông báo là đã đọc.
     */
    public void markAsRead() {
        this.isRead = true;
    }
}
