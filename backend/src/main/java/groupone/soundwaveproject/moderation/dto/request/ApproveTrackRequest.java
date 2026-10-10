package groupone.soundwaveproject.moderation.dto.request;

import jakarta.validation.constraints.Size;

public record ApproveTrackRequest(
        @Size(max = 2000, message = "Reviewer note cannot exceed 2000 characters")
        String reviewerNote
) {}
