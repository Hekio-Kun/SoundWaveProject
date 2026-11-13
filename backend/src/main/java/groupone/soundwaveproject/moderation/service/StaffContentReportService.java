package groupone.soundwaveproject.moderation.service;

import groupone.soundwaveproject.authentication.entity.Staff;
import groupone.soundwaveproject.authentication.entity.User;
import groupone.soundwaveproject.authentication.entity.UserProfile;
import groupone.soundwaveproject.authentication.repository.StaffRepository;
import groupone.soundwaveproject.authentication.repository.UserProfileRepository;
import groupone.soundwaveproject.authentication.repository.UserRepository;
import groupone.soundwaveproject.catalog.entity.Album;
import groupone.soundwaveproject.catalog.entity.Track;
import groupone.soundwaveproject.catalog.entity.TrackPublicationStatus;
import groupone.soundwaveproject.catalog.repository.AlbumRepository;
import groupone.soundwaveproject.catalog.repository.TrackRepository;
import groupone.soundwaveproject.exception.BadRequestOperationException;
import groupone.soundwaveproject.exception.ResourceNotFoundException;
import groupone.soundwaveproject.lyrics.entity.OfficialLyric;
import groupone.soundwaveproject.lyrics.repository.OfficialLyricRepository;
import groupone.soundwaveproject.moderation.dto.request.ResolveContentReportRequest;
import groupone.soundwaveproject.moderation.dto.request.TakeDownTrackRequest;
import groupone.soundwaveproject.moderation.dto.response.StaffContentReportResponse;
import groupone.soundwaveproject.moderation.entity.ContentReport;
import groupone.soundwaveproject.moderation.entity.ReportCategory;
import groupone.soundwaveproject.moderation.entity.SubmissionStatus;
import groupone.soundwaveproject.moderation.entity.TrackSubmission;
import groupone.soundwaveproject.moderation.repository.ContentReportRepository;
import groupone.soundwaveproject.moderation.repository.TrackSubmissionRepository;
import groupone.soundwaveproject.notification.entity.NotificationType;
import groupone.soundwaveproject.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class StaffContentReportService {

    private final ContentReportRepository contentReportRepository;
    private final TrackRepository trackRepository;
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final StaffRepository staffRepository;
    private final TrackSubmissionRepository submissionRepository;
    private final NotificationService notificationService;
    private final OfficialLyricRepository officialLyricRepository;
    private final AlbumRepository albumRepository;

    @Transactional(readOnly = true)
    public List<StaffContentReportResponse> getReportsQueue() {
        List<ContentReport> allReports = contentReportRepository.findAllByOrderByCreatedAtDesc();

        // Group by Target Track + Violation Reason, EXCEPT Copyright Infringement which is kept standalone
        Map<String, List<ContentReport>> groupedMap = new LinkedHashMap<>();
        for (ContentReport report : allReports) {
            if (isCopyrightReport(report)) {
                // Individual unmerged group per copyright report
                String uniqueKey = "COPYRIGHT::" + report.getId();
                groupedMap.computeIfAbsent(uniqueKey, k -> new ArrayList<>()).add(report);
            } else {
                String reasonLabel = resolveReasonLabel(report);
                String targetKey = (report.getTargetId() != null ? report.getTargetId().toString() : "0") + "::"
                        + reasonLabel.trim().toLowerCase(Locale.ROOT);
                groupedMap.computeIfAbsent(targetKey, k -> new ArrayList<>()).add(report);
            }
        }

        List<StaffContentReportResponse> responses = new ArrayList<>();
        for (List<ContentReport> group : groupedMap.values()) {
            if (!group.isEmpty()) {
                responses.add(mapGroupToResponse(group));
            }
        }
        return responses;
    }

    @Transactional(readOnly = true)
    public StaffContentReportResponse getReportById(Long id) {
        ContentReport target = contentReportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("REPORT_NOT_FOUND", "Content report not found with id: " + id));

        List<ContentReport> group;
        if (isCopyrightReport(target)) {
            // Copyright reports are never grouped with other reports
            group = List.of(target);
        } else {
            // Find all reports in the same track + reason group
            String targetReasonLabel = resolveReasonLabel(target);
            List<ContentReport> allSameTrack = contentReportRepository.findByTargetIdAndStatus(target.getTargetId(), "PENDING");
            group = allSameTrack.stream()
                    .filter(r -> !isCopyrightReport(r) && resolveReasonLabel(r).equalsIgnoreCase(targetReasonLabel))
                    .sorted(Comparator.comparing(ContentReport::getCreatedAt).reversed())
                    .toList();

            if (group.isEmpty()) {
                group = List.of(target);
            }
        }

        return mapGroupToResponse(group);
    }

    @Transactional
    public StaffContentReportResponse resolveReport(Long reportId, ResolveContentReportRequest request, String staffEmail) {
        ContentReport primaryReport = contentReportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("REPORT_NOT_FOUND", "Content report not found with id: " + reportId));

        if (request.staffNote() == null || request.staffNote().trim().isBlank()) {
            throw new BadRequestOperationException("MISSING_STAFF_NOTE", "Staff Note is required");
        }

        Staff staff = staffRepository.findByEmailIgnoreCase(staffEmail)
                .orElseThrow(() -> new ResourceNotFoundException("STAFF_NOT_FOUND", "Staff account not found with email: " + staffEmail));

        String decisionInput = request.decision() != null ? request.decision().trim().toUpperCase(Locale.ROOT) : "";
        String finalStatus;
        if (decisionInput.contains("CONFIRM") || "RESOLVED".equals(decisionInput)) {
            finalStatus = "RESOLVED";
        } else if (decisionInput.contains("DISMISS") || "DISMISSED".equals(decisionInput)) {
            finalStatus = "DISMISSED";
        } else {
            throw new BadRequestOperationException("INVALID_DECISION", "Resolution decision must be either Confirm Violation or Dismiss Report");
        }

        String staffNote = request.staffNote().trim();
        Instant now = Instant.now();

        List<ContentReport> pendingGroup;
        if (isCopyrightReport(primaryReport)) {
            if (!"PENDING".equalsIgnoreCase(primaryReport.getStatus())) {
                throw new BadRequestOperationException("REPORT_ALREADY_ADJUDICATED", "This report has already been adjudicated");
            }
            pendingGroup = List.of(primaryReport);
        } else {
            // Find ALL pending non-copyright reports for this track and reason
            String primaryReasonLabel = resolveReasonLabel(primaryReport);
            pendingGroup = contentReportRepository.findByTargetIdAndStatus(primaryReport.getTargetId(), "PENDING")
                    .stream()
                    .filter(r -> !isCopyrightReport(r) && resolveReasonLabel(r).equalsIgnoreCase(primaryReasonLabel))
                    .toList();

            if (pendingGroup.isEmpty()) {
                if (!"PENDING".equalsIgnoreCase(primaryReport.getStatus())) {
                    throw new BadRequestOperationException("REPORT_ALREADY_ADJUDICATED", "This report has already been adjudicated");
                }
                pendingGroup = List.of(primaryReport);
            }
        }

        List<ContentReport> resolvedGroup = new ArrayList<>();
        for (ContentReport r : pendingGroup) {
            r.setStatus(finalStatus);
            r.setHandledByStaffId(staff.getId());
            r.setResolutionNote(staffNote);
            r.setHandledAt(now);
            r.setReviewerId(staff.getId());
            r.setReviewerNote(staffNote);
            r.setResolvedAt(now);
            resolvedGroup.add(contentReportRepository.save(r));

            // Send in-app notification to each reporting listener
            if (r.getReporterId() != null) {
                String title = "RESOLVED".equals(finalStatus) ? "Content Report Resolved" : "Content Report Dismissed";
                String message = ("RESOLVED".equals(finalStatus) ? "Violation confirmed: " : "Report dismissed: ") + staffNote;
                notificationService.createNotification(
                        r.getReporterId(),
                        staff.getId(),
                        NotificationType.CONTENT_REPORT,
                        title,
                        message,
                        "TRACK",
                        String.valueOf(r.getTargetId())
                );
            }
        }

        return mapGroupToResponse(resolvedGroup);
    }

    @Transactional
    public void takeDownPublishedTrack(Long trackId, TakeDownTrackRequest request, String staffEmail) {
        Track track = trackRepository.findById(trackId)
                .orElseThrow(() -> new ResourceNotFoundException("TRACK_NOT_FOUND", "Track not found with id: " + trackId));

        if (track.getPublicationStatus() != TrackPublicationStatus.PUBLISHED) {
            throw new BadRequestOperationException("TRACK_NOT_PUBLISHED", "Track is not in an active published state");
        }

        if (request.takedownReason() == null || request.takedownReason().trim().isBlank()) {
            throw new BadRequestOperationException("MISSING_TAKEDOWN_REASON", "Takedown reason is required");
        }

        Staff staff = staffRepository.findByEmailIgnoreCase(staffEmail)
                .orElseThrow(() -> new ResourceNotFoundException("STAFF_NOT_FOUND", "Staff account not found with email: " + staffEmail));

        String takedownReason = request.takedownReason().trim();
        Instant now = Instant.now();

        track.setPublicationStatus(TrackPublicationStatus.TAKEN_DOWN);
        track.setLatestRejectionReason(takedownReason);
        trackRepository.save(track);

        // If track belongs to an album, check whether the album has any remaining PUBLISHED tracks.
        // If this track was the last published track (remaining published count is 0), take down the album as well (BR-18).
        Album album = track.getAlbum();
        if (album == null && track.getAlbumId() != null) {
            album = albumRepository.findById(track.getAlbumId()).orElse(null);
        }
        if (album != null) {
            long remainingPublished = trackRepository.countByAlbum_IdAndPublicationStatus(
                    album.getId(), TrackPublicationStatus.PUBLISHED
            );
            if (remainingPublished == 0) {
                album.setStatus("REJECTED");
                albumRepository.save(album);

                if (album.getCreatedByUserId() != null) {
                    notificationService.createNotification(
                            album.getCreatedByUserId(),
                            staff.getId(),
                            NotificationType.TRACK_REJECTED,
                            "Album taken down",
                            "Album \"" + album.getTitle() + "\" has been taken down because its remaining published track was removed.",
                            "ALBUM",
                            String.valueOf(album.getId())
                    );
                }
            }
        }

        // Update submission status if associated submission exists
        Optional<TrackSubmission> submissionOpt = submissionRepository.findFirstByTrackIdOrderBySubmittedAtDesc(track.getId());
        if (submissionOpt.isPresent()) {
            TrackSubmission submission = submissionOpt.get();
            submission.setStatus(SubmissionStatus.REJECTED);
            submission.setReviewerUserId(staff.getId());
            submission.setRejectionReason(takedownReason);
            submission.setReviewerNote(request.reviewerNote() != null ? request.reviewerNote().trim() : null);
            submission.setReviewedAt(now);
            submissionRepository.save(submission);
        }

        // Send notification to track creator
        if (track.getUploaderUserId() != null) {
            notificationService.createNotification(
                    track.getUploaderUserId(),
                    staff.getId(),
                    NotificationType.TRACK_REJECTED,
                    "Track taken down",
                    "\"" + track.getTitle() + "\" has been taken down: " + takedownReason,
                    "TRACK",
                    String.valueOf(track.getId())
            );
        }

        // Mark all associated pending reports against this track as RESOLVED
        List<ContentReport> pendingReports = contentReportRepository.findByTargetIdAndStatus(track.getId(), "PENDING");
        for (ContentReport pendingReport : pendingReports) {
            pendingReport.setStatus("RESOLVED");
            pendingReport.setReviewerId(staff.getId());
            pendingReport.setReviewerNote("Track taken down due to policy violation: " + takedownReason);
            pendingReport.setResolvedAt(now);
            contentReportRepository.save(pendingReport);

            if (pendingReport.getReporterId() != null) {
                notificationService.createNotification(
                        pendingReport.getReporterId(),
                        staff.getId(),
                        NotificationType.CONTENT_REPORT,
                        "Content Report Resolved",
                        "The reported track \"" + track.getTitle() + "\" has been taken down: " + takedownReason,
                        "TRACK",
                        String.valueOf(track.getId())
                );
            }
        }
    }

    private StaffContentReportResponse mapGroupToResponse(List<ContentReport> group) {
        // If any report is PENDING, prioritize the latest PENDING report as primary
        ContentReport primary = group.stream()
                .filter(r -> "PENDING".equalsIgnoreCase(r.getStatus()))
                .findFirst()
                .orElse(group.get(0));

        boolean hasPending = group.stream().anyMatch(r -> "PENDING".equalsIgnoreCase(r.getStatus()));
        String groupStatus = hasPending ? "PENDING" : primary.getStatus();

        List<Long> reportIds = group.stream().map(ContentReport::getId).toList();
        int reporterCount = group.size();

        List<StaffContentReportResponse.ReporterSummary> reporters = new ArrayList<>();
        for (ContentReport r : group) {
            String name = "Unknown Reporter";
            String username = null;
            String email = null;
            String avatarUrl = null;
            Long uid = r.getSubmittedByUserId() != null ? r.getSubmittedByUserId() : r.getReporterId();
            if (uid != null) {
                Optional<User> uOpt = userRepository.findById(uid);
                if (uOpt.isPresent()) {
                    email = uOpt.get().getEmail();
                }
                Optional<UserProfile> pOpt = userProfileRepository.findByUserId(uid);
                if (pOpt.isPresent()) {
                    UserProfile profile = pOpt.get();
                    username = profile.getUsername();
                    avatarUrl = profile.getAvatarUrl();
                    name = profile.getDisplayName() != null && !profile.getDisplayName().isBlank()
                            ? profile.getDisplayName()
                            : (username != null ? username : (email != null ? email : "User #" + uid));
                } else if (email != null) {
                    name = email;
                    username = email.split("@")[0];
                }
            }
            reporters.add(new StaffContentReportResponse.ReporterSummary(
                    uid,
                    name,
                    username,
                    email,
                    avatarUrl,
                    r.getCreatedAt(),
                    r.getEvidenceUrl(),
                    r.getDescription()
            ));
        }

        StaffContentReportResponse.ReporterSummary primaryReporter = reporters.get(0);

        Long trackId = primary.getTargetId() != null ? primary.getTargetId() : primary.getTrackId();
        String trackTitle = "Unknown Track";
        String artistName = "Unknown Artist";
        String coverUrl = null;
        String audioUrl = null;
        String trackPublicationStatus = null;
        String lyrics = null;

        if (trackId != null) {
            Optional<Track> trackOpt = trackRepository.findById(trackId);
            if (trackOpt.isPresent()) {
                Track track = trackOpt.get();
                trackTitle = track.getTitle();
                coverUrl = track.getCoverUrl();
                audioUrl = track.getAudioUrl();
                trackPublicationStatus = track.getPublicationStatus() != null ? track.getPublicationStatus().name() : null;

                if (track.getUploaderUserId() != null) {
                    Optional<UserProfile> artistProfileOpt = userProfileRepository.findByUserId(track.getUploaderUserId());
                    if (artistProfileOpt.isPresent() && artistProfileOpt.get().getDisplayName() != null) {
                        artistName = artistProfileOpt.get().getDisplayName();
                    }
                }
            }

            lyrics = officialLyricRepository.findByTrackId(trackId)
                    .map(OfficialLyric::getLyricContent)
                    .orElse(null);
            if (lyrics == null) {
                lyrics = submissionRepository.findFirstByTrackIdOrderBySubmittedAtDesc(trackId)
                        .map(TrackSubmission::getProposedLyrics)
                        .orElse(null);
            }
        }

        String reviewerName = null;
        if (primary.getReviewerId() != null) {
            Optional<Staff> reviewerOpt = staffRepository.findById(primary.getReviewerId());
            if (reviewerOpt.isPresent()) {
                reviewerName = reviewerOpt.get().getFullName() != null ? reviewerOpt.get().getFullName() : reviewerOpt.get().getEmail();
            }
        }

        String displayReason = resolveReasonLabel(primary);
        String category = primary.getCategory() != null ? primary.getCategory() : (isCopyrightReport(primary) ? "COPYRIGHT" : "OTHER");

        return new StaffContentReportResponse(
                primary.getId(),
                reportIds,
                reporterCount,
                primaryReporter.reporterId(),
                primaryReporter.reporterName(),
                primaryReporter.reporterUsername(),
                primaryReporter.reporterEmail(),
                primaryReporter.avatarUrl(),
                primary.getDescription(),
                category,
                reporters,
                primary.getTargetType(),
                primary.getTargetId(),
                trackId,
                trackTitle,
                artistName,
                coverUrl,
                audioUrl,
                trackPublicationStatus,
                lyrics,
                displayReason,
                groupStatus,
                primary.getReviewerId(),
                reviewerName,
                primary.getReviewerNote(),
                primary.getCreatedAt(),
                primary.getResolvedAt(),
                primary.getEvidenceUrl()
        );
    }

    private boolean isCopyrightReport(ContentReport report) {
        if (report == null) return false;
        if ("COPYRIGHT".equalsIgnoreCase(report.getCategory())) return true;
        if (report.getReason() != null) {
            String r = report.getReason().trim().toLowerCase(Locale.ROOT);
            if (r.contains("copyright") || r.contains("bản quyền")) {
                return true;
            }
        }
        if (report.getCategory() != null) {
            String c = report.getCategory().trim().toLowerCase(Locale.ROOT);
            if (c.contains("copyright") || c.contains("bản quyền")) {
                return true;
            }
        }
        return false;
    }

    private String resolveReasonLabel(ContentReport report) {
        if (report == null) return "Violation Report";
        String r = report.getReason();
        if (r == null || r.isBlank()) {
            r = report.getCategory();
        }
        if (ReportCategory.isValid(r)) {
            return ReportCategory.fromString(r).getDisplayName();
        }
        return (r != null && !r.isBlank()) ? r : "Violation Report";
    }
}
