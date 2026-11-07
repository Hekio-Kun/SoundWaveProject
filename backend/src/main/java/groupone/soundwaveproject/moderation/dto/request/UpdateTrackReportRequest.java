package groupone.soundwaveproject.moderation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO yêu cầu cập nhật danh mục lý do vi phạm của báo cáo đang PENDING (UC-22.3).
 * Người nghe chỉ cần chọn một trong các option lý do định sẵn (radio button).
 */
public record UpdateTrackReportRequest(
        @NotBlank(message = "Report reason option is required")
        String category,

        @Size(max = 2000, message = "Description cannot exceed 2000 characters")
        String description
) {
    public UpdateTrackReportRequest(String category) {
        this(category, null);
    }
}

