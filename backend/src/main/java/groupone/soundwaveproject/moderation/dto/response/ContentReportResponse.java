package groupone.soundwaveproject.moderation.dto.response;

import java.time.Instant;

/**
 * DTO phản hồi thông tin báo cáo lỗi nội dung đã được ghi nhận.
 */
public record ContentReportResponse(
        Long id,
        Long reporterId,
        String targetType,
        Long targetId,
        String reason,
        String description,
        String status,
        Instant createdAt
) {}
