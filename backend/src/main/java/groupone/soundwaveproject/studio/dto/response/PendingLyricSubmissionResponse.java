package groupone.soundwaveproject.studio.dto.response;

import groupone.soundwaveproject.moderation.entity.SubmissionStatus;
import groupone.soundwaveproject.moderation.entity.SubmissionType;

import java.time.Instant;

/**
 * DTO phản hồi thông tin yêu cầu cập nhật lời bài hát đang chờ Staff phê duyệt (UC-16.2).
 */
public record PendingLyricSubmissionResponse(
        Long submissionId,
        Long trackId,
        String proposedLyrics,
        String submitterNote,
        SubmissionStatus status,
        SubmissionType submissionType,
        Instant submittedAt
) {}
