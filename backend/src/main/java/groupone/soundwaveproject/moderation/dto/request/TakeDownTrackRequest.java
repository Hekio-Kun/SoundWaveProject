package groupone.soundwaveproject.moderation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TakeDownTrackRequest(
        @NotBlank(message = "Takedown reason is required")
        @Size(max = 1000, message = "Takedown reason cannot exceed 1000 characters")
        String takedownReason,

        @Size(max = 2000, message = "Reviewer note cannot exceed 2000 characters")
        String reviewerNote
) {}
