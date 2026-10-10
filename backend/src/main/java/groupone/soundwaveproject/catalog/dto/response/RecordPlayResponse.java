package groupone.soundwaveproject.catalog.dto.response;

/**
 * Response payload returned after a listening event has been successfully processed.
 *
 * @param trackId ID of the played track.
 * @param playCount Updated play count cache for the track.
 * @param recordedHistory Indicates whether listening history was recorded for an authenticated user.
 */
public record RecordPlayResponse(
        Long trackId,
        Long playCount,
        boolean recordedHistory
) {}
