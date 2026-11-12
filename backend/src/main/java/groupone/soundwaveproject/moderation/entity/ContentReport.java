package groupone.soundwaveproject.moderation.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

/**
 * Thực thể lưu trữ các báo cáo vi phạm nội dung đối với bài hát đã phát hành (UC-22.1)
 * hoặc lỗi lời bài hát do người nghe gửi lên.
 * Bảng cơ sở dữ liệu: content_reports
 */
@Entity
@Table(name = "content_reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContentReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "report_id")
    private Long id;

    /**
     * ID của bài hát bị báo cáo (Khóa ngoại logic trỏ tới tracks.id).
     */
    @Column(name = "track_id")
    private Long trackId;

    /**
     * ID của người dùng gửi báo cáo (Khóa ngoại logic trỏ tới users.id).
     */
    @Column(name = "submitted_by_user_id")
    private Long submittedByUserId;

    /**
     * ID nhân viên xử lý báo cáo (Khóa ngoại logic trỏ tới users.id / staffs.id).
     */
    @Column(name = "handled_by_user_id")
    private Long handledByUserId;

    /**
     * Danh mục báo cáo vi phạm (COPYRIGHT, INAPPROPRIATE_CONTENT, INCORRECT_METADATA, OTHER).
     */
    @Column(name = "category", length = 50)
    private String category;

    /**
     * Mô tả chi tiết lý do hoặc bằng chứng vi phạm từ người nghe.
     */
    @Column(name = "description", length = 2000)
    private String description;

    /**
     * Trạng thái xử lý báo cáo (PENDING, RESOLVED, REJECTED, WITHDRAWN).
     */
    @Column(name = "status", nullable = false, length = 50)
    @Builder.Default
    private String status = "PENDING";

    /**
     * Ghi chú xử lý / phản hồi của nhân viên kiểm duyệt.
     */
    @Column(name = "resolution_note", length = 2000)
    private String resolutionNote;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "handled_at")
    private Instant handledAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    // --- Legacy / Compatibility fields for lyric reporting (UC-31.1) ---
    @Column(name = "reporter_id")
    private Long reporterId;

    @Column(name = "target_type", length = 50)
    @Builder.Default
    private String targetType = "TRACK";

    @Column(name = "target_id")
    private Long targetId;

    @Column(name = "reason", length = 100)
    private String reason;

    @Column(name = "reviewer_id")
    private Long reviewerId;

    @Column(name = "reviewer_note", columnDefinition = "TEXT")
    private String reviewerNote;

    @Column(name = "resolved_at")
    private Instant resolvedAt;
}
