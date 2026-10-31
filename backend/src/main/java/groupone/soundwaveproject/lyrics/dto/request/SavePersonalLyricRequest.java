package groupone.soundwaveproject.lyrics.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SavePersonalLyricRequest(
    String lyricType, // "CUSTOM" or "TRANSLATION", default "CUSTOM"
    @NotBlank(message = "Lyrics content cannot be blank")
    @Size(max = 1048576, message = "Lyrics content exceeds 1MB limit")
    String lyricContent
) {}
