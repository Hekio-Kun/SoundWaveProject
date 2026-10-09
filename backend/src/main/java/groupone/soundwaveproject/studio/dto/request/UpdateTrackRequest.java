package groupone.soundwaveproject.studio.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateTrackRequest(
        @NotBlank(message = "Track title is required")
        @Size(max = 200, message = "Track title cannot exceed 200 characters")
        String title,

        @NotNull(message = "Genre is required")
        Long genreId,

        Long albumId,

        Integer trackNumber,

        @Size(max = 2000, message = "Description cannot exceed 2000 characters")
        String description,

        Integer durationMs,

        String lyrics
) {
}
