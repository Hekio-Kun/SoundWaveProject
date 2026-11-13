package groupone.soundwaveproject.moderation.dto.response;

import java.time.Instant;

/**
 * DTO phản hồi lịch sử báo cáo vi phạm nội dung do người nghe đã gửi (UC-22.2).
 */
public record MyReportHistoryResponse(
        Long id,
        Long trackId,
        String trackTitle,
        String trackCoverUrl,
        String category,
        String categoryLabel,
        String status,
        String resolutionNote,
        Instant createdAt,
        Instant handledAt,
        String evidenceUrl
) {
        public MyReportHistoryResponse(
                Long id,
                Long trackId,
                String trackTitle,
                String trackCoverUrl,
                String category,
                String categoryLabel,
                String status,
                String resolutionNote,
                Instant createdAt,
                Instant handledAt
        ) {
                this(id, trackId, trackTitle, trackCoverUrl, category, categoryLabel, status, resolutionNote, createdAt, handledAt, null);
        }
}

