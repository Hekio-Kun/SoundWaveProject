package groupone.soundwaveproject.moderation.service;

import groupone.soundwaveproject.authentication.entity.User;
import groupone.soundwaveproject.authentication.repository.UserRepository;
import groupone.soundwaveproject.catalog.entity.Track;
import groupone.soundwaveproject.catalog.entity.TrackPublicationStatus;
import groupone.soundwaveproject.catalog.repository.TrackRepository;
import groupone.soundwaveproject.exception.BadRequestOperationException;
import groupone.soundwaveproject.exception.ResourceNotFoundException;
import groupone.soundwaveproject.moderation.dto.request.CreateContentReportRequest;
import groupone.soundwaveproject.moderation.dto.request.CreateTrackReportRequest;
import groupone.soundwaveproject.moderation.dto.response.ContentReportResponse;
import groupone.soundwaveproject.moderation.dto.response.TrackReportResponse;
import groupone.soundwaveproject.moderation.entity.ContentReport;
import groupone.soundwaveproject.moderation.entity.ReportCategory;
import groupone.soundwaveproject.moderation.repository.ContentReportRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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

    /**
     * Tiếp nhận báo cáo vi phạm nội dung đối với bài hát đã phát hành từ người nghe (UC-22.1).
     *
     * @param userEmail Email của người dùng đăng nhập gửi báo cáo
     * @param request DTO chứa trackId, danh mục báo cáo và mô tả chi tiết
     * @return Thông tin báo cáo đã tạo thành công
     */
    @Transactional
    public TrackReportResponse submitTrackReport(String userEmail, CreateTrackReportRequest request) {
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

        // 3. Kiểm tra danh mục vi phạm hợp lệ (BR-31)
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

        // 5. Lưu báo cáo vào cơ sở dữ liệu với trạng thái PENDING (BR-32)
        ContentReport report = ContentReport.builder()
                .trackId(track.getId())
                .submittedByUserId(user.getId())
                .category(category.name())
                .description(description)
                .status("PENDING")
                // Đồng bộ tương thích cho các cột legacy
                .reporterId(user.getId())
                .targetType("TRACK")
                .targetId(track.getId())
                .reason(category.name())
                .build();

        ContentReport saved = contentReportRepository.save(report);
        log.info("Content report #{} submitted for trackId: {} ('{}') by user: {}",
                saved.getId(), track.getId(), track.getTitle(), user.getEmail());

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
                saved.getCreatedAt()
        );
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
