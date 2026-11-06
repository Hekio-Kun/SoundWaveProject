package groupone.soundwaveproject.moderation.dto.response;

import java.time.Instant;
import java.util.List;

public record StaffContentReportResponse(
        Long id,
        List<Long> reportIds,
        int reporterCount,
        Long reporterId,
        String reporterName,
        String reporterEmail,
        List<ReporterSummary> reporters,
        String targetType,
        Long targetId,
        Long trackId,
        String trackTitle,
        String artistName,
        String coverUrl,
        String audioUrl,
        String trackPublicationStatus,
        String lyrics,
        String reason,
        String status,
        Long reviewerId,
        String reviewerName,
        String staffNote,
        Instant createdAt,
        Instant resolvedAt
) {
    public record ReporterSummary(
            Long reporterId,
            String reporterName,
            String reporterEmail,
            Instant submittedAt
    ) {}
}
