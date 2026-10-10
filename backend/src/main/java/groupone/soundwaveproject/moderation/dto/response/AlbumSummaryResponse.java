package groupone.soundwaveproject.moderation.dto.response;

public record AlbumSummaryResponse(
        Long id,
        String title,
        String slug,
        String status
) {}
