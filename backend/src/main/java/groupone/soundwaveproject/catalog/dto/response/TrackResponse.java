package groupone.soundwaveproject.catalog.dto.response;

import java.time.LocalDateTime;

/**
 * Metadata bài hát và URL streaming phục vụ phát nhạc (Phase 1 trong Sequence Diagram).
 */
public record TrackResponse(
        Long id,
        String title,
        String slug,
        String description,
        String audioUrl,
        String coverUrl,
        Integer durationMs,
        Long playCount,
        String publicationStatus,
        String genreSlug,
        String genreName,
        TrackAlbumSummary album,
        TrackCreatorSummary creator,
        LocalDateTime createdAt,
        String lyrics
) {
    public TrackResponse(
            Long id,
            String title,
            String slug,
            String description,
            String audioUrl,
            String coverUrl,
            Integer durationMs,
            Long playCount,
            String publicationStatus,
            String genreSlug,
            String genreName,
            TrackAlbumSummary album,
            TrackCreatorSummary creator,
            LocalDateTime createdAt
    ) {
        this(id, title, slug, description, audioUrl, coverUrl, durationMs, playCount,
                publicationStatus, genreSlug, genreName, album, creator, createdAt, null);
    }

    public record TrackAlbumSummary(
            Long id,
            String title
    ) {}

    public record TrackCreatorSummary(
            Long userId,
            String displayName,
            String avatarUrl
    ) {}
}
