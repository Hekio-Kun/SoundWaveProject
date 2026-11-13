package groupone.soundwaveproject.moderation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * DTO yêu cầu gửi báo cáo vi phạm nội dung bài hát đã phát hành (UC-22.1).
 * Người dùng chỉ cần chọn một trong các option lý do định sẵn (radio button),
 * không bắt buộc tự nhập nội dung text.
 */
public record CreateTrackReportRequest(
        @NotNull(message = "Track ID is required")
        Long trackId,

        @NotBlank(message = "Report reason option is required")
        String category,

        @Size(max = 2000, message = "Description cannot exceed 2000 characters")
        String description,

        @Size(max = 500, message = "Evidence URL cannot exceed 500 characters")
        String evidenceUrl
) {
        public CreateTrackReportRequest(Long trackId, String category) {
                this(trackId, category, null, null);
        }

        public CreateTrackReportRequest(Long trackId, String category, String description) {
                this(trackId, category, description, null);
        }
}
