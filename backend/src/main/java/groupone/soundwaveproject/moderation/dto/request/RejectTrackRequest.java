package groupone.soundwaveproject.moderation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO chứa dữ liệu yêu cầu gửi lên khi nhân viên kiểm duyệt từ chối bài hát (UC-24.2 Reject Track).
 *
 * @param rejectionReason Lý do từ chối bài hát (bắt buộc, tối đa 1000 ký tự, tối thiểu 10 ký tự)
 * @param reviewerNote    Ghi chú nội bộ tùy chọn của người kiểm duyệt (tối đa 2000 ký tự)
 */
public record RejectTrackRequest(
        @NotBlank(message = "Rejection reason is required")
        @Size(max = 1000, message = "Rejection reason cannot exceed 1000 characters")
        String rejectionReason,

        @Size(max = 2000, message = "Reviewer note cannot exceed 2000 characters")
        String reviewerNote
) {}
