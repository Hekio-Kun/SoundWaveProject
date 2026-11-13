package groupone.soundwaveproject.moderation.dto.response;

import java.time.Instant;
import java.util.List;

public record StaffContentReportResponse(
        Long id,
        List<Long> reportIds,
        int reporterCount,
        Long reporterId,
        String reporterName,
        String reporterUsername,
        String reporterEmail,
        String reporterAvatarUrl,
        String description,
        String category,
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
        Instant resolvedAt,
        String evidenceUrl
) {
    public StaffContentReportResponse(
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
            Instant resolvedAt,
            String evidenceUrl
    ) {
        this(id, reportIds, reporterCount, reporterId, reporterName, null, reporterEmail, null, null, null,
                reporters, targetType, targetId, trackId, trackTitle, artistName, coverUrl, audioUrl,
                trackPublicationStatus, lyrics, reason, status, reviewerId, reviewerName, staffNote,
                createdAt, resolvedAt, evidenceUrl);
    }

    public record ReporterSummary(
            Long reporterId,
            String reporterName,
            String reporterUsername,
            String reporterEmail,
            String avatarUrl,
            Instant submittedAt,
            String evidenceUrl,
            String description
    ) {
        public ReporterSummary(Long reporterId, String reporterName, String reporterEmail, Instant submittedAt, String evidenceUrl) {
            this(reporterId, reporterName, null, reporterEmail, null, submittedAt, evidenceUrl, null);
        }

        public ReporterSummary(Long reporterId, String reporterName, String reporterEmail, Instant submittedAt) {
            this(reporterId, reporterName, null, reporterEmail, null, submittedAt, null, null);
        }
    }
}
