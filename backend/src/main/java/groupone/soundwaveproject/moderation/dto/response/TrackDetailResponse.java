package groupone.soundwaveproject.moderation.dto.response;

import java.time.LocalDateTime;

public record TrackDetailResponse(
        Long id,
        String title,
        String slug,
        String description,
        Integer trackNumber,
        String publicationStatus,
        String audioUrl,
        String audioFormat,
        Integer durationMs,
        String coverUrl,
        Long playCount,
        LocalDateTime approvedAt,
        String latestRejectionReason,
        LocalDateTime createdAt,
        GenreSummaryResponse genre,
        AlbumSummaryResponse album,
        String lyrics
) {}
