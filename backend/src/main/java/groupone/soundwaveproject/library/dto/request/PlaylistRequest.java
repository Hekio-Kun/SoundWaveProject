package groupone.soundwaveproject.library.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PlaylistRequest(
        @NotBlank(message = "Playlist title cannot be blank.")
        @Size(max = 150, message = "Playlist title cannot exceed 150 characters.")
        String title,

        @Size(max = 2000, message = "Description cannot exceed 2000 characters.")
        String description,

        Boolean isPrivate,

        @Size(max = 2048, message = "Cover URL cannot exceed 2048 characters.")
        String coverUrl
) {}
