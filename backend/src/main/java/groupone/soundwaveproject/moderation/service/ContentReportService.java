package groupone.soundwaveproject.moderation.service;

import groupone.soundwaveproject.authentication.entity.User;
import groupone.soundwaveproject.authentication.repository.UserRepository;
import groupone.soundwaveproject.catalog.entity.Track;
import groupone.soundwaveproject.catalog.repository.TrackRepository;
import groupone.soundwaveproject.exception.BadRequestOperationException;
import groupone.soundwaveproject.exception.ResourceNotFoundException;
import groupone.soundwaveproject.moderation.dto.request.CreateContentReportRequest;
import groupone.soundwaveproject.moderation.dto.response.ContentReportResponse;
import groupone.soundwaveproject.moderation.entity.ContentReport;
import groupone.soundwaveproject.moderation.repository.ContentReportRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service xử lý các nghiệp vụ liên quan đến báo cáo nội dung và lỗi lời bài hát (UC-31.1).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ContentReportService {

    private final ContentReportRepository contentReportRepository;
    private final UserRepository userRepository;
    private final TrackRepository trackRepository;

    /**
     * Tiếp nhận báo cáo lỗi lời bài hát từ người nghe đã đăng nhập.
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
