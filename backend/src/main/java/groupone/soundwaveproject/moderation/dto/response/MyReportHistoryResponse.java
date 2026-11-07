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
        Instant handledAt
) {}

