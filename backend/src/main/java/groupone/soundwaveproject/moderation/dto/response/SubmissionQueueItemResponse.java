package groupone.soundwaveproject.moderation.dto.response;

import groupone.soundwaveproject.moderation.entity.SubmissionStatus;
import groupone.soundwaveproject.moderation.entity.SubmissionType;

import java.time.Instant;
import java.util.List;

/**
 * DTO phản hồi một mục tóm tắt trong danh sách hàng đợi kiểm duyệt (UC-24.1 View Moderation Queue).
 * Có thể là Track đơn (itemType = "SINGLE"), Album (itemType = "ALBUM"), hoặc Cập nhật Lời bài hát (submissionType = "LYRIC_UPDATE").
 */
public record SubmissionQueueItemResponse(
        Long id,
        String itemType,
        Long trackId,
        String trackTitle,
        Integer trackNumber,
        Long albumId,
        String albumTitle,
        String genreName,
        String coverUrl,
        Integer durationMs,
        Long submitterId,
        String submitterDisplayName,
        String submitterEmail,
        SubmissionStatus status,
        SubmissionType submissionType,
        String proposedLyrics,
        Instant submittedAt,
        Instant reviewedAt,
        String reviewerDisplayName,
        Integer trackCount,
        List<SubmissionQueueItemResponse> albumTracks
) {
    /**
     * Constructor tương thích ngược 19 tham số.
     */
    public SubmissionQueueItemResponse(
            Long id,
            String itemType,
            Long trackId,
            String trackTitle,
            Integer trackNumber,
            Long albumId,
            String albumTitle,
            String genreName,
            String coverUrl,
            Integer durationMs,
            Long submitterId,
            String submitterDisplayName,
            String submitterEmail,
            SubmissionStatus status,
            Instant submittedAt,
            Instant reviewedAt,
            String reviewerDisplayName,
            Integer trackCount,
            List<SubmissionQueueItemResponse> albumTracks
    ) {
        this(
                id,
                itemType,
                trackId,
                trackTitle,
                trackNumber,
                albumId,
                albumTitle,
                genreName,
                coverUrl,
                durationMs,
                submitterId,
                submitterDisplayName,
                submitterEmail,
                status,
                SubmissionType.TRACK_RELEASE,
                null,
                submittedAt,
                reviewedAt,
                reviewerDisplayName,
                trackCount,
                albumTracks
        );
    }

    /**
     * Constructor tương thích ngược 14 tham số ban đầu.
     */
    public SubmissionQueueItemResponse(
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
    ) {
        this(
                id,
                "SINGLE",
                trackId,
                trackTitle,
                null,
                null,
                albumTitle,
                genreName,
                coverUrl,
                durationMs,
                submitterId,
                submitterDisplayName,
                submitterEmail,
                status,
                SubmissionType.TRACK_RELEASE,
                null,
                submittedAt,
                reviewedAt,
                reviewerDisplayName,
                1,
                null
        );
    }

    /**
     * Creates a copy of this queue item response with an updated status.
     */
    public SubmissionQueueItemResponse withStatus(SubmissionStatus newStatus) {
        return new SubmissionQueueItemResponse(
                id,
                itemType,
                trackId,
                trackTitle,
                trackNumber,
                albumId,
                albumTitle,
                genreName,
                coverUrl,
                durationMs,
                submitterId,
                submitterDisplayName,
                submitterEmail,
                newStatus,
                submissionType,
                proposedLyrics,
                submittedAt,
                reviewedAt,
                reviewerDisplayName,
                trackCount,
                albumTracks
        );
    }
}
