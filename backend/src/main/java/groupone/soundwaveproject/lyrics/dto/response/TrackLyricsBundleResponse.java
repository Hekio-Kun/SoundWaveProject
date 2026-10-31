package groupone.soundwaveproject.lyrics.dto.response;

public record TrackLyricsBundleResponse(
    LyricDetailResponse officialLyric,
    LyricDetailResponse userPersonalLyric
) {}
