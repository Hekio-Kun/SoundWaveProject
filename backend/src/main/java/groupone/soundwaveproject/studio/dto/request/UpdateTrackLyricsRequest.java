package groupone.soundwaveproject.studio.dto.request;

import jakarta.validation.constraints.Size;

public record UpdateTrackLyricsRequest(
        @Size(max = 20000, message = "Lyrics cannot exceed 20,000 characters.")
        String lyrics
) {
}
