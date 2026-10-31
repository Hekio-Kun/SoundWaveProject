package groupone.soundwaveproject.lyrics.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record SaveOfficialLyricRequest(
    @NotNull(message = "Track ID is required")
    Long trackId,
    @NotBlank(message = "Lyrics content cannot be blank")
    @Size(max = 1048576, message = "Lyrics content exceeds 1MB limit")
    String lyricContent,
    @NotBlank(message = "Status is required")
    @Pattern(regexp = "DRAFT|PUBLISHED", message = "Status must be either DRAFT or PUBLISHED")
    String status // "DRAFT" or "PUBLISHED"
) {}
