package groupone.soundwaveproject.moderation.dto.response;

import groupone.soundwaveproject.moderation.entity.SubmissionStatus;

import java.time.Instant;

public record SubmissionQueueItemResponse(
        Long id,
        Long trackId,
        String trackTitle,
        String genreName,
        String albumTitle,
        String coverUrl,
        Integer durationMs,
        Long submitterId,
        String submitterDisplayName,
        String submitterEmail,
        SubmissionStatus status,
        Instant submittedAt,
        Instant reviewedAt,
        String reviewerDisplayName
) {}
