package groupone.soundwaveproject.catalog.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

/**
 * Request payload khi client đạt ngưỡng nghe hợp lệ (Phase 3 trong Sequence Diagram).
 */
public record RecordPlayRequest(
        @NotNull(message = "Listened duration cannot be null")
        @PositiveOrZero(message = "Listened duration must be non-negative")
        Integer listenedDurationMs,

        Boolean completed
) {}
