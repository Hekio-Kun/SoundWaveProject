package groupone.soundwaveproject.library.dto.response;

import java.time.LocalDateTime;

public record PlaylistTrackResponse(
        Long id,
        Long trackId,
        String title,
        String slug,
        String artistName,
        Integer durationMs,
        String coverUrl,
        String audioUrl,
        Integer position,
        LocalDateTime addedAt
) {}
