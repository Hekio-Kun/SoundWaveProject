package groupone.soundwaveproject.studio.dto.response;

import java.time.Instant;

public record StudioTrackResponse(
        Long id,
        String title,
        String slug,
        String description,
        Long genreId,
        String genreName,
        String genreSlug,
        Long albumId,
        String albumTitle,
        Integer trackNumber,
        String status,
        String audioUrl,
        String audioFormat,
        Integer durationMs,
        String coverUrl,
        Long playCount,
        String latestRejectionReason,
        String reviewerNote,
        String submitterNote,
        Instant submittedAt,
        Instant reviewedAt,
        Instant createdAt,
        Instant updatedAt,
        String lyrics
) {
}
