package groupone.soundwaveproject.moderation.dto.request;

import jakarta.validation.constraints.Size;

/**
 * DTO chứa dữ liệu yêu cầu gửi lên khi nhân viên kiểm duyệt phê duyệt bài hát (UC-24.2 Approve Track).
 *
 * @param reviewerNote Ghi chú nội bộ tùy chọn của người kiểm duyệt (tối đa 2000 ký tự)
 */
public record ApproveTrackRequest(
        @Size(max = 2000, message = "Reviewer note cannot exceed 2000 characters")
        String reviewerNote
) {}
