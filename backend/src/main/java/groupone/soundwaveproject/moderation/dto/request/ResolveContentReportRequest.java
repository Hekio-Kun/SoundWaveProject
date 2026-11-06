package groupone.soundwaveproject.moderation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO yeu cau giai quyet bao cao noi dung tu nhan vien kiem duyet.
 */
public record ResolveContentReportRequest(
        @NotBlank(message = "Resolution decision is required")
        String decision,

        @NotBlank(message = "Staff Note is required")
        @Size(max = 2000, message = "Staff Note cannot exceed 2000 characters")
        String staffNote
) {}

