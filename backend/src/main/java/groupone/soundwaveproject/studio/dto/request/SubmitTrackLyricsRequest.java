package groupone.soundwaveproject.studio.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO yêu cầu gửi đề xuất cập nhật lời bài hát chính thức cho bài hát đã xuất bản (UC-16.2 Update Synchronous Lyric).
 */
public record SubmitTrackLyricsRequest(
        @NotBlank(message = "Lyrics content cannot be blank.")
        @Size(max = 50000, message = "Lyrics cannot exceed 50,000 characters.")
        String lyrics,

        @Size(max = 2000, message = "Submitter note cannot exceed 2000 characters.")
        String submitterNote
) {
    public SubmitTrackLyricsRequest(String lyrics) {
        this(lyrics, null);
    }
}
