package groupone.soundwaveproject.moderation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * DTO yêu cầu gửi báo cáo lỗi nội dung hoặc lời bài hát.
 */
public record CreateContentReportRequest(
        @NotNull(message = "Track ID is required")
        Long trackId,

        @NotBlank(message = "Reason is required")
        @Size(max = 100, message = "Reason cannot exceed 100 characters")
        String reason,

        @Size(max = 500, message = "Description cannot exceed 500 characters")
        String description
) {}
