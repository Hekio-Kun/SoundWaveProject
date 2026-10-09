package groupone.soundwaveproject.catalog.dto;

public record CreatorSummaryResponse(
        Long userId,
        String displayName,
        String avatarUrl
) {}
