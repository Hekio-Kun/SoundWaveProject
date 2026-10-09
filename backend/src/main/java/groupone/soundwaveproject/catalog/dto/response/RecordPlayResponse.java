package groupone.soundwaveproject.catalog.dto.response;

/**
 * Response payload sau khi ghi nhận lượt nghe thành công.
 */
public record RecordPlayResponse(
        Long trackId,
        Long playCount,
        boolean recordedHistory
) {}
