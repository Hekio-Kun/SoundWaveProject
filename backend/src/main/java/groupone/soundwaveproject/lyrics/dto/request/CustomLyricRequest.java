package groupone.soundwaveproject.lyrics.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Payload yêu cầu tạo mới hoặc cập nhật lời bài hát tùy chỉnh (Custom/Personal Lyric).
 */
public record CustomLyricRequest(
        @NotBlank(message = "Lyric content cannot be blank")
        @Size(max = 1048576, message = "Lyric content exceeds 1MB limit")
        String lyricContent,

        String lyricType
) {
    public CustomLyricRequest(String lyricContent) {
        this(lyricContent, "CUSTOM");
    }
}
