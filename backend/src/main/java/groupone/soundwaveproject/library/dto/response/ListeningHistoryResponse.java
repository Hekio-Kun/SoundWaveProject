package groupone.soundwaveproject.library.dto.response;

import java.time.Instant;

/**
 * DTO đại diện cho một bản ghi lịch sử nghe nhạc của người dùng (UC-13 View Listening History).
 * Sử dụng Instant cho playedAt để tự động serialize kèm timezone offset chuẩn ISO-8601 (UTC 'Z').
 */
public record ListeningHistoryResponse(
        Long id,
        Long trackId,
        String title,
        String slug,
        String artistName,
        Integer durationMs,
        String coverUrl,
        String audioUrl,
        Instant playedAt,
        Integer listenedDurationMs,
        Boolean completed
) {}
