package groupone.soundwaveproject.moderation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO chứa dữ liệu yêu cầu gửi lên khi gỡ bỏ bài hát đã xuất bản trước đó (UC-24.2 Take Down Track).
 *
 * @param takedownReason Lý do gỡ bỏ bài hát khỏi hệ thống (bắt buộc, tối đa 1000 ký tự)
 * @param reviewerNote   Ghi chú nội bộ tùy chọn của người kiểm duyệt (tối đa 2000 ký tự)
 */
public record TakeDownTrackRequest(
        @NotBlank(message = "Takedown reason is required")
        @Size(max = 1000, message = "Takedown reason cannot exceed 1000 characters")
        String takedownReason,

        @Size(max = 2000, message = "Reviewer note cannot exceed 2000 characters")
        String reviewerNote
) {}
