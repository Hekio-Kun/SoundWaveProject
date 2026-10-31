package groupone.soundwaveproject.lyrics.dto.response;

import java.util.List;

/**
 * Gói dữ liệu lời bài hát của bài hát (Official Lyrics kèm Custom Lyrics của Listener hiện tại nếu có).
 * Phục vụ trình phát nhạc và trang chi tiết (UC-18.1).
 */
public record TrackLyricsBundleResponse(
        Long trackId,
        String officialLyrics,
        String syncType, // "LRC", "PLAIN", "NONE"
        List<CustomLyricResponse> customLyrics
) {}
