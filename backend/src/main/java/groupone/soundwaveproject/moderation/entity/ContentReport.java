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
     * ID nhân viên xử lý báo cáo (Khóa ngoại logic trỏ tới staffs.staff_id).
     */
    @Column(name = "handled_by_staff_id")
    private Long handledByStaffId;

    public Long getHandledByStaffId() {
        return handledByStaffId != null ? handledByStaffId : reviewerId;
    }

    public void setHandledByStaffId(Long handledByStaffId) {
        this.handledByStaffId = handledByStaffId;
        this.reviewerId = handledByStaffId;
    }

    public Long getHandledByUserId() {
        return getHandledByStaffId();
    }

    public void setHandledByUserId(Long handledByUserId) {
        setHandledByStaffId(handledByUserId);
    }

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

    /**
     * Đường dẫn tài liệu / hình ảnh chứng minh sở hữu bản quyền từ người báo cáo (UC-22.1).
     */
    @Column(name = "evidence_url", length = 500)
    private String evidenceUrl;

    /**
     * Mã định danh tài liệu chứng minh trên Cloudinary.
     */
    @Column(name = "evidence_public_id", length = 200)
    private String evidencePublicId;

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

    @PrePersist
    void syncFieldsOnPersist() {
        if (handledByStaffId == null && reviewerId != null) handledByStaffId = reviewerId;
        if (reviewerId == null && handledByStaffId != null) reviewerId = handledByStaffId;
        if (handledAt == null && resolvedAt != null) handledAt = resolvedAt;
        if (resolvedAt == null && handledAt != null) resolvedAt = handledAt;
        if (submittedByUserId == null && reporterId != null) submittedByUserId = reporterId;
        if (reporterId == null && submittedByUserId != null) reporterId = submittedByUserId;
        if (trackId == null && targetId != null) trackId = targetId;
        if (targetId == null && trackId != null) targetId = trackId;
        if (resolutionNote == null && reviewerNote != null) resolutionNote = reviewerNote;
        if (reviewerNote == null && resolutionNote != null) reviewerNote = resolutionNote;
    }

    @PreUpdate
    void syncFieldsOnUpdate() {
        if (handledByStaffId == null && reviewerId != null) handledByStaffId = reviewerId;
        if (reviewerId == null && handledByStaffId != null) reviewerId = handledByStaffId;
        if (handledAt == null && resolvedAt != null) handledAt = resolvedAt;
        if (resolvedAt == null && handledAt != null) resolvedAt = handledAt;
        if (resolutionNote == null && reviewerNote != null) resolutionNote = reviewerNote;
        if (reviewerNote == null && resolutionNote != null) reviewerNote = resolutionNote;
    }
}
