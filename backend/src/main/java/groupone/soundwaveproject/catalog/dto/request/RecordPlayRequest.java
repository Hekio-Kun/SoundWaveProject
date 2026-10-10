package groupone.soundwaveproject.catalog.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

/**
 * Request payload sent by the client when a valid listening threshold is reached
 * in accordance with business rule BR.13 (Stream Music Phase 3).
 *
 * @param listenedDurationMs Total duration listened in milliseconds.
 * @param completed Whether the track was played through to the end (or reached &gt;= 90% completion).
 */
public record RecordPlayRequest(
        @NotNull(message = "Listened duration cannot be null")
        @PositiveOrZero(message = "Listened duration must be non-negative")
        Integer listenedDurationMs,

        Boolean completed
) {}
