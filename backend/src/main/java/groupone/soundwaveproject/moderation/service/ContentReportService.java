package groupone.soundwaveproject.moderation.service;

import groupone.soundwaveproject.authentication.entity.User;
import groupone.soundwaveproject.authentication.repository.UserRepository;
import groupone.soundwaveproject.catalog.entity.Track;
import groupone.soundwaveproject.catalog.entity.TrackPublicationStatus;
import groupone.soundwaveproject.catalog.repository.TrackRepository;
import groupone.soundwaveproject.exception.BadRequestOperationException;
import groupone.soundwaveproject.exception.ForbiddenOperationException;
import groupone.soundwaveproject.exception.ResourceNotFoundException;
import groupone.soundwaveproject.media.dto.response.StoredMediaResponse;
import groupone.soundwaveproject.media.service.CloudMediaService;
import groupone.soundwaveproject.moderation.dto.request.CreateContentReportRequest;
import groupone.soundwaveproject.moderation.dto.request.CreateTrackReportRequest;
import groupone.soundwaveproject.moderation.dto.request.UpdateTrackReportRequest;
import groupone.soundwaveproject.moderation.dto.response.ContentReportResponse;
import groupone.soundwaveproject.moderation.dto.response.MyReportHistoryResponse;
import groupone.soundwaveproject.moderation.dto.response.TrackReportResponse;
import groupone.soundwaveproject.moderation.entity.ContentReport;
import groupone.soundwaveproject.moderation.entity.ReportCategory;
import groupone.soundwaveproject.moderation.repository.ContentReportRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Service xử lý các nghiệp vụ liên quan đến báo cáo nội dung (UC-22.1)
 * và báo cáo lỗi lời bài hát (UC-31.1).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ContentReportService {

    private final ContentReportRepository contentReportRepository;
    private final UserRepository userRepository;
    private final TrackRepository trackRepository;
    private final CloudMediaService cloudMediaService;

    /**
     * Tiếp nhận báo cáo vi phạm nội dung đối với bài hát đã phát hành từ người nghe (UC-22.1).
     *
     * @param userEmail Email của người dùng đăng nhập gửi báo cáo
     * @param request DTO chứa trackId, danh mục báo cáo và mô tả chi tiết
     * @param evidenceFile Tệp tài liệu chứng nhận bản quyền đính kèm (nếu có)
     * @return Thông tin báo cáo đã tạo thành công
     */
    @Transactional
    public TrackReportResponse submitTrackReport(
            String userEmail,
            CreateTrackReportRequest request,
            MultipartFile evidenceFile
    ) {
        // 1. Xác thực người dùng gửi báo cáo (BR-36)
        User user = userRepository.findByEmailIgnoreCase(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "User account not found"));

        // 2. Kiểm tra tính tồn tại và hợp lệ của bài hát (BR-30, EX02)
        Track track = trackRepository.findById(request.trackId())
                .orElseThrow(() -> new ResourceNotFoundException("TRACK_NOT_FOUND", "Track not found with id: " + request.trackId()));

        if (track.getPublicationStatus() != TrackPublicationStatus.PUBLISHED) {
            throw new BadRequestOperationException(
                    "TRACK_NOT_ELIGIBLE",
                    "This track is no longer available for reporting"
            );
        }

        // 3. Kiểm tra tác giả bài hát: Người up nhạc lên không thể tự báo cáo bài hát của chính mình
        if (track.getUploaderUserId() != null && track.getUploaderUserId().equals(user.getId())) {
            throw new BadRequestOperationException(
                    "CANNOT_REPORT_OWN_TRACK",
                    "You cannot report your own track"
            );
        }

        // 4. Kiểm tra danh mục vi phạm hợp lệ (BR-31)
        if (!ReportCategory.isValid(request.category())) {
            throw new BadRequestOperationException(
                    "INVALID_REPORT_CATEGORY",
                    "Invalid report category. Must be one of COPYRIGHT, INAPPROPRIATE_CONTENT, INCORRECT_METADATA, OTHER."
            );
        }
        ReportCategory category = ReportCategory.fromString(request.category());

        // Gán tự động mô tả lý do từ option được chọn nếu người dùng không nhập tay (theo đặc tả UC-22.1)
        String description = (request.description() != null && !request.description().isBlank())
                ? request.description().trim()
                : category.getDisplayName();

        // 4. Kiểm tra trùng lặp (EX01): Listener không được gửi tiếp nếu đã có báo cáo PENDING trên bài hát này
        boolean alreadyPending = contentReportRepository.hasPendingReportForTrack(
                track.getId(),
                user.getId(),
                "PENDING"
        );
        if (alreadyPending) {
            throw new BadRequestOperationException(
                    "REPORT_ALREADY_EXISTS",
                    "You have already submitted a pending report for this track. Our moderation team is reviewing it."
            );
        }

        // Xử lý tệp bằng chứng sở hữu bản quyền nếu người dùng cung cấp (UC-22.1)
        String evidenceUrl = request.evidenceUrl();
        String evidencePublicId = null;
        if (evidenceFile != null && !evidenceFile.isEmpty()) {
            StoredMediaResponse stored = cloudMediaService.uploadReportEvidence(evidenceFile, user.getId());
            evidenceUrl = stored.secureUrl();
            evidencePublicId = stored.publicId();
        }

        // 5. Lưu báo cáo vào cơ sở dữ liệu với trạng thái PENDING (BR-32)
        ContentReport report = ContentReport.builder()
                .trackId(track.getId())
                .submittedByUserId(user.getId())
                .category(category.name())
                .description(description)
                .evidenceUrl(evidenceUrl)
                .evidencePublicId(evidencePublicId)
                .status("PENDING")
                // Đồng bộ tương thích cho các cột legacy
                .reporterId(user.getId())
                .targetType("TRACK")
                .targetId(track.getId())
                .reason(category.getDisplayName())
                .build();

        ContentReport saved = contentReportRepository.save(report);
        log.info("Content report #{} submitted for trackId: {} ('{}') by user: {} with evidence: {}",
                saved.getId(), track.getId(), track.getTitle(), user.getEmail(), evidenceUrl);

        return new TrackReportResponse(
                saved.getId(),
                track.getId(),
                track.getTitle(),
                track.getCoverUrl(),
                user.getId(),
                category.name(),
                category.getDisplayName(),
                saved.getDescription(),
                saved.getStatus(),
                saved.getCreatedAt(),
                saved.getEvidenceUrl()
        );
    }

    @Transactional
    public TrackReportResponse submitTrackReport(String userEmail, CreateTrackReportRequest request) {
        return submitTrackReport(userEmail, request, null);
    }

    /**
     * Cập nhật danh mục lý do vi phạm của báo cáo vi phạm bài hát đang PENDING (UC-22.3).
     *
     * @param reportId ID của báo cáo cần cập nhật
     * @param userEmail Email của người dùng đăng nhập
     * @param request DTO chứa danh mục vi phạm mới
     * @return Thông tin báo cáo sau khi cập nhật
     */
    @Transactional
    public TrackReportResponse updateTrackReport(Long reportId, String userEmail, UpdateTrackReportRequest request) {
        // 1. Xác thực người dùng (PRE-1, BR-36)
        User user = userRepository.findByEmailIgnoreCase(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "User account not found"));

        // 2. Tìm kiếm báo cáo vi phạm
        ContentReport report = contentReportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("REPORT_NOT_FOUND", "Content report not found with id: " + reportId));

        // 3. Kiểm tra quyền sở hữu (PRE-2): Báo cáo phải thuộc về người dùng hiện tại
        Long ownerId = report.getSubmittedByUserId() != null ? report.getSubmittedByUserId() : report.getReporterId();
        if (ownerId == null || !ownerId.equals(user.getId())) {
            throw new ForbiddenOperationException(
                    "UNAUTHORIZED_REPORT_ACCESS",
                    "You do not have permission to modify this report."
            );
        }

        // 4. Kiểm tra trạng thái báo cáo:
        // - Đã được duyệt (RESOLVED): Không cho sửa (Read-only)
        // - Đang chờ duyệt (PENDING): Không cho sửa nữa (đã vào pending thì chờ staff duyệt)
        // - Bị từ chối (DISMISSED / REJECTED): Được phép chỉnh sửa lý do và gửi lại (chuyển về PENDING)
        String currentStatus = report.getStatus() != null ? report.getStatus().toUpperCase() : "";
        if ("RESOLVED".equals(currentStatus)) {
            throw new BadRequestOperationException(
                    "REPORT_RESOLVED",
                    "This report has already been resolved and cannot be modified."
            );
        }
        if ("PENDING".equals(currentStatus)) {
            throw new BadRequestOperationException(
                    "REPORT_PENDING",
                    "This report is currently pending review and cannot be modified."
            );
        }
        if (!"DISMISSED".equals(currentStatus) && !"REJECTED".equals(currentStatus)) {
            throw new BadRequestOperationException(
                    "REPORT_NOT_MODIFIABLE",
                    "Only rejected or dismissed reports can be modified and resubmitted."
            );
        }

        // 5. Kiểm tra tính hợp lệ của danh mục vi phạm (BR-31)
        if (!ReportCategory.isValid(request.category())) {
            throw new BadRequestOperationException(
                    "INVALID_REPORT_CATEGORY",
                    "Invalid report category. Must be one of COPYRIGHT, INAPPROPRIATE_CONTENT, INCORRECT_METADATA, OTHER."
            );
        }
        ReportCategory newCategory = ReportCategory.fromString(request.category());

        // 6. Cập nhật reason, category, description và chuyển trạng thái về PENDING
        String description = (request.description() != null && !request.description().isBlank())
                ? request.description().trim()
                : newCategory.getDisplayName();

        report.setCategory(newCategory.name());
        report.setReason(newCategory.getDisplayName());
        report.setDescription(description);
        report.setStatus("PENDING");
        report.setResolutionNote(null);
        report.setReviewerNote(null);

        ContentReport updated = contentReportRepository.save(report);
        log.info("Content report #{} updated with new category: {} and resubmitted as PENDING by user: {}",
                updated.getId(), newCategory.name(), user.getEmail());

        Long trackId = updated.getTrackId() != null ? updated.getTrackId() : updated.getTargetId();
        Track track = trackId != null ? trackRepository.findById(trackId).orElse(null) : null;
        return mapToTrackReportResponse(updated, track);
    }

    private TrackReportResponse mapToTrackReportResponse(ContentReport report, Track track) {
        Long trackId = report.getTrackId() != null ? report.getTrackId() : report.getTargetId();
        String trackTitle = track != null ? track.getTitle() : "Track #" + trackId;
        String coverUrl = track != null ? track.getCoverUrl() : null;
        String cat = report.getCategory() != null ? report.getCategory() : report.getReason();
        String catLabel = ReportCategory.isValid(cat)
                ? ReportCategory.fromString(cat).getDisplayName()
                : (cat != null ? cat : "Other");

        Long ownerId = report.getSubmittedByUserId() != null ? report.getSubmittedByUserId() : report.getReporterId();

        return new TrackReportResponse(
                report.getId(),
                trackId,
                trackTitle,
                coverUrl,
                ownerId,
                cat,
                catLabel,
                report.getDescription(),
                report.getStatus(),
                report.getCreatedAt(),
                report.getEvidenceUrl()
        );
    }

    /**
     * Rút lại (hủy và xóa) báo cáo vi phạm nội dung đang ở trạng thái PENDING (UC-22.4).
     *
     * @param reportId ID của báo cáo cần rút
     * @param userEmail Email của người nghe đăng nhập
     */
    @Transactional
    public void withdrawTrackReport(Long reportId, String userEmail) {
        // 1. Xác thực người dùng (PRE-1, BR-36)
        User user = userRepository.findByEmailIgnoreCase(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "User account not found"));

        // 2. Tìm kiếm báo cáo vi phạm
        ContentReport report = contentReportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("REPORT_NOT_FOUND", "Content report not found with id: " + reportId));

        // 3. Kiểm tra quyền sở hữu (PRE-2): Báo cáo phải thuộc về người dùng hiện tại
        Long ownerId = report.getSubmittedByUserId() != null ? report.getSubmittedByUserId() : report.getReporterId();
        if (ownerId == null || !ownerId.equals(user.getId())) {
            throw new ForbiddenOperationException(
                    "UNAUTHORIZED_REPORT_ACCESS",
                    "You do not have permission to withdraw this report."
            );
        }

        // 4. Kiểm tra trạng thái báo cáo (PRE-2, EX01): Chỉ cho phép rút khi còn PENDING
        if (!"PENDING".equalsIgnoreCase(report.getStatus())) {
            throw new BadRequestOperationException(
                    "REPORT_ALREADY_REVIEWED",
                    "This report has already been reviewed and cannot be withdrawn"
            );
        }

        // 5. Dọn dẹp tệp chứng minh đính kèm trên Cloudinary (nếu có)
        if (report.getEvidencePublicId() != null && !report.getEvidencePublicId().isBlank()) {
            cloudMediaService.deleteReportEvidenceQuietly(report.getEvidencePublicId());
        }

        // 6. Xóa bản ghi báo cáo khỏi cơ sở dữ liệu (NF01 Step 5, POST-1)
        contentReportRepository.delete(report);
        log.info("Content report #{} on trackId {} successfully withdrawn and deleted by user {}",
                reportId, report.getTrackId() != null ? report.getTrackId() : report.getTargetId(), user.getEmail());
    }

    /**
     * Lấy toàn bộ lịch sử báo cáo vi phạm nội dung do người nghe hiện tại đã gửi (UC-22.2).
     * Sắp xếp theo ngày tạo mới nhất lên trước.
     */
    @Transactional(readOnly = true)
    public List<MyReportHistoryResponse> getMyReports(String userEmail) {
        User user = userRepository.findByEmailIgnoreCase(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "User account not found"));

        List<ContentReport> reports = contentReportRepository.findMyReports(user.getId());
        if (reports.isEmpty()) {
            return Collections.emptyList();
        }

        // Lấy thông tin chi tiết bài hát tương ứng
        Set<Long> trackIds = reports.stream()
                .map(r -> r.getTrackId() != null ? r.getTrackId() : r.getTargetId())
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<Long, Track> trackMap = trackRepository.findAllById(trackIds).stream()
                .collect(Collectors.toMap(Track::getId, Function.identity()));

        return reports.stream().map(r -> {
            Long trackId = r.getTrackId() != null ? r.getTrackId() : r.getTargetId();
            Track track = trackId != null ? trackMap.get(trackId) : null;
            String trackTitle = track != null ? track.getTitle() : "Track #" + trackId;
            String coverUrl = track != null ? track.getCoverUrl() : null;

            String cat = r.getCategory() != null ? r.getCategory() : r.getReason();
            String catLabel = ReportCategory.isValid(cat)
                    ? ReportCategory.fromString(cat).getDisplayName()
                    : (cat != null ? cat : "Other");

            return new MyReportHistoryResponse(
                    r.getId(),
                    trackId,
                    trackTitle,
                    coverUrl,
                    cat,
                    catLabel,
                    r.getStatus(),
                    r.getResolutionNote() != null ? r.getResolutionNote() : r.getReviewerNote(),
                    r.getCreatedAt(),
                    r.getHandledAt() != null ? r.getHandledAt() : r.getResolvedAt(),
                    r.getEvidenceUrl()
            );
        }).toList();
    }

    /**
     * Kiểm tra nhanh xem người nghe đã có báo cáo đang chờ xử lý (PENDING) cho bài hát hay chưa.
     */
    @Transactional(readOnly = true)
    public boolean checkPendingReport(String userEmail, Long trackId) {
        User user = userRepository.findByEmailIgnoreCase(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "User account not found"));

        return contentReportRepository.hasPendingReportForTrack(trackId, user.getId(), "PENDING");
    }

    /**
     * Tiếp nhận báo cáo lỗi lời bài hát từ người nghe đã đăng nhập (UC-31.1).
     */
    @Transactional
    public ContentReportResponse submitLyricReport(String userEmail, CreateContentReportRequest request) {
        User user = userRepository.findByEmailIgnoreCase(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "User account not found"));

        Track track = trackRepository.findById(request.trackId())
                .orElseThrow(() -> new ResourceNotFoundException("TRACK_NOT_FOUND", "Track not found with id: " + request.trackId()));

        // Chặn tác giả tự báo cáo lời bài hát của chính mình
        if (track.getUploaderUserId() != null && track.getUploaderUserId().equals(user.getId())) {
            throw new BadRequestOperationException(
                    "CANNOT_REPORT_OWN_TRACK",
                    "You cannot report lyrics of your own track"
            );
        }

        String reason = request.reason().trim();
        String description = request.description() != null ? request.description().trim() : null;

        // Chặn gửi trùng lặp nếu người dùng đã có báo cáo đang PENDING cho cùng bài hát
        List<ContentReport> existing = contentReportRepository.findByReporterIdAndTargetTypeAndTargetId(
                user.getId(), "LYRICS", track.getId()
        );
        boolean hasPending = existing.stream().anyMatch(r -> "PENDING".equalsIgnoreCase(r.getStatus()));
        if (hasPending) {
            throw new BadRequestOperationException(
                    "REPORT_ALREADY_EXISTS",
                    "You have already submitted a pending report for this song's lyrics. Our moderation team is reviewing it."
            );
        }

        ContentReport report = ContentReport.builder()
                .trackId(track.getId())
                .submittedByUserId(user.getId())
                .category(reason)
                .reporterId(user.getId())
                .targetType("LYRICS")
                .targetId(track.getId())
                .reason(reason)
                .description(description)
                .status("PENDING")
                .build();

        ContentReport saved = contentReportRepository.save(report);
        log.info("Content report #{} created for LYRICS on trackId: {} by user: {}", saved.getId(), track.getId(), user.getEmail());

        return new ContentReportResponse(
                saved.getId(),
                saved.getReporterId(),
                saved.getTargetType(),
                saved.getTargetId(),
                saved.getReason(),
                saved.getDescription(),
                saved.getStatus(),
                saved.getCreatedAt()
        );
    }
}
