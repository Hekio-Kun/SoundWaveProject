package groupone.soundwaveproject.media.dto.response;

public record StoredAudioResponse(
        String publicId,
        String secureUrl,
        String format,
        Integer durationMs
) {}
