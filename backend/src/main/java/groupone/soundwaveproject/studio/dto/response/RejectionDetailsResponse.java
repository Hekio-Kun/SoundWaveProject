package groupone.soundwaveproject.studio.dto.response;

import java.time.Instant;

public record RejectionDetailsResponse(
        Long trackId,
        String trackTitle,
        String status,
        String rejectionReason,
        String reviewerNote,
        Instant reviewedAt
) {
}
