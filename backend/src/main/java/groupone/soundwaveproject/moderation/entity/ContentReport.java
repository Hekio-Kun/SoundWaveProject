package groupone.soundwaveproject.moderation.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

/**
 * Thực thể lưu trữ các báo cáo nội dung hoặc lỗi lời bài hát do người nghe gửi lên (UC-31.1).
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
    private Long id;

    /**
     * ID của người dùng gửi báo cáo (Khóa ngoại logic trỏ tới users.id).
     */
    @Column(name = "reporter_id", nullable = false)
    private Long reporterId;

    /**
     * Loại đối tượng bị báo cáo (Mặc định "LYRICS", có thể là "TRACK").
     */
    @Column(name = "target_type", nullable = false, length = 50)
    @Builder.Default
    private String targetType = "LYRICS";

    /**
     * ID của đối tượng bị báo cáo (ví dụ: track_id khi targetType là LYRICS).
     */
    @Column(name = "target_id", nullable = false)
    private Long targetId;

    /**
     * Lý do báo cáo (OUT_OF_SYNC, INCORRECT_TEXT, OFFENSIVE_CONTENT, OTHER).
     */
    @Column(name = "reason", nullable = false, length = 100)
    private String reason;

    /**
     * Mô tả chi tiết lỗi từ người nghe.
     */
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    /**
     * Trạng thái xử lý báo cáo (PENDING, RESOLVED, DISMISSED).
     */
    @Column(name = "status", nullable = false, length = 50)
    @Builder.Default
    private String status = "PENDING";

    /**
     * ID nhân viên xử lý báo cáo (nếu đã xử lý).
     */
    @Column(name = "reviewer_id")
    private Long reviewerId;

    /**
     * Ghi chú xử lý của nhân viên.
     */
    @Column(name = "reviewer_note", columnDefinition = "TEXT")
    private String reviewerNote;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "resolved_at")
    private Instant resolvedAt;
}
