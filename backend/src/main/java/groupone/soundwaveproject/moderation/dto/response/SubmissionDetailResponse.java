package groupone.soundwaveproject.moderation.dto.response;

import groupone.soundwaveproject.moderation.entity.SubmissionStatus;

import java.time.Instant;

public record SubmissionDetailResponse(
        Long id,
        SubmissionStatus status,
        String submitterNote,
        String reviewerNote,
        String rejectionReason,
        Instant submittedAt,
        Instant reviewedAt,
        TrackDetailResponse track,
        UserSummaryResponse submitter,
        UserSummaryResponse reviewer
) {}
