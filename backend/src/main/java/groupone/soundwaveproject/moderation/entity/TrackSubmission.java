package groupone.soundwaveproject.moderation.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

/**
 * Thực thể lưu trữ các bản ghi yêu cầu kiểm duyệt bài hát trong hệ thống (UC-24: Manage Track Moderation).
 * Ánh xạ với bảng cơ sở dữ liệu: track_submissions
 */
@Entity
@Table(name = "track_submissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrackSubmission {

    /**
     * Mã định danh duy nhất của bản ghi yêu cầu kiểm duyệt (Khóa chính).
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * ID của bài hát liên kết cần kiểm duyệt (Khóa ngoại trỏ tới bảng tracks).
     */
    @Column(name = "track_id", nullable = false)
    private Long trackId;

    /**
     * ID của người dùng/nghệ sĩ nộp bài hát kiểm duyệt (Khóa ngoại trỏ tới bảng users).
     */
    @Column(name = "submitted_by_user_id", nullable = false)
    private Long submittedByUserId;

    /**
     * ID của nhân viên kiểm duyệt đã thẩm định bài hát (Khóa ngoại trỏ tới bảng users, null khi đang chờ duyệt).
     */
    @Column(name = "reviewer_user_id")
    private Long reviewerUserId;

    /**
     * Trạng thái kiểm duyệt hiện tại của bài hát (PENDING, APPROVED, REJECTED).
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private SubmissionStatus status = SubmissionStatus.PENDING;

    /**
     * Ghi chú hoặc lời nhắn từ tác giả khi nộp bài hát tới ban kiểm duyệt.
     */
    @Column(name = "submitter_note", length = 2000)
    private String submitterNote;

    /**
     * Ghi chú nội bộ của nhân viên kiểm duyệt lưu lại trong quá trình thẩm định.
     */
    @Column(name = "reviewer_note", length = 2000)
    private String reviewerNote;

    /**
     * Lý do từ chối bài hát hoặc lý do gỡ bài nếu không đạt tiêu chuẩn (bắt buộc khi REJECT hoặc TAKEN_DOWN).
     */
    @Column(name = "rejection_reason", length = 1000)
    private String rejectionReason;

    /**
     * Thời điểm bài hát được gửi vào hàng đợi kiểm duyệt (tự động tạo khi lưu bản ghi).
     */
    @CreationTimestamp
    @Column(name = "submitted_at", nullable = false, updatable = false)
    private Instant submittedAt;

    /**
     * Thời điểm nhân viên kiểm duyệt hoàn tất thẩm định (duyệt, từ chối hoặc gỡ bài).
     */
    @Column(name = "reviewed_at")
    private Instant reviewedAt;
}
