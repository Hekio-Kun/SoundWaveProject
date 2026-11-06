package groupone.soundwaveproject.moderation.repository;

import groupone.soundwaveproject.moderation.entity.ContentReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContentReportRepository extends JpaRepository<ContentReport, Long> {

    List<ContentReport> findByReporterIdAndTargetTypeAndTargetId(Long reporterId, String targetType, Long targetId);

    Page<ContentReport> findByTargetTypeAndStatus(String targetType, String status, Pageable pageable);

    /**
     * Lấy danh sách các báo cáo vi phạm do nhân viên xử lý (UC-27.4).
     */
    List<ContentReport> findByReviewerIdOrderByResolvedAtDesc(Long reviewerId);

    long countByStatus(String status);

    List<ContentReport> findBySubmittedByUserIdOrderByCreatedAtDesc(Long submittedByUserId);

    List<ContentReport> findByTrackIdAndStatusIgnoreCase(Long trackId, String status);

    /**
     * Kiểm tra xem người dùng đã có báo cáo đang chờ xử lý (PENDING) cho bài hát này hay chưa (EX01).
     * Hỗ trợ cả schema mới (track_id, submitted_by_user_id) và tương thích legacy (target_id, reporter_id).
     */
    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END FROM ContentReport c " +
           "WHERE (c.trackId = :trackId OR (c.targetType = 'TRACK' AND c.targetId = :trackId)) " +
           "AND (c.submittedByUserId = :userId OR c.reporterId = :userId) " +
           "AND UPPER(c.status) = UPPER(:status)")
    boolean hasPendingReportForTrack(
            @Param("trackId") Long trackId,
            @Param("userId") Long userId,
            @Param("status") String status
    );
}
