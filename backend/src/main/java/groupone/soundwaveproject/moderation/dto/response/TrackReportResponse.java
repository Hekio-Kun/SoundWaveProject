package groupone.soundwaveproject.moderation.dto.response;

import java.time.Instant;

/**
 * DTO phản hồi thông tin báo cáo vi phạm bài hát sau khi được ghi nhận vào hệ thống (UC-22.1).
 */
public record TrackReportResponse(
        Long id,
        Long trackId,
        String trackTitle,
        String trackCoverUrl,
        Long submittedByUserId,
        String category,
        String categoryLabel,
        String description,
        String status,
        Instant createdAt,
        String evidenceUrl
) {
        public TrackReportResponse(
                Long id,
                Long trackId,
                String trackTitle,
                String trackCoverUrl,
                Long submittedByUserId,
                String category,
                String categoryLabel,
                String description,
                String status,
                Instant createdAt
        ) {
                this(id, trackId, trackTitle, trackCoverUrl, submittedByUserId, category, categoryLabel, description, status, createdAt, null);
        }
}

