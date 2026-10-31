package groupone.soundwaveproject.lyrics.dto.response;

import java.time.LocalDateTime;

/**
 * Phản hồi chi tiết lời bài hát tùy chỉnh của người dùng (Custom/Personal Lyric).
 */
public record CustomLyricResponse(
        Long id,
        Long trackId,
        Long userId,
        String lyricType,
        String lyricContent,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
