package groupone.soundwaveproject.catalog.dto;

import java.time.Instant;

public record PublicTrackResponse(
        Long id,
        String title,
        String slug,
        String description,
        String coverUrl,
        String audioUrl,
        String audioFormat,
        Integer durationMs,
        Long playCount,
        String publicationStatus,
        String genreSlug,
        String genreName,
        CreatorSummaryResponse creator,
        AlbumSummaryResponse album,
        Instant createdAt
) {}
