package groupone.soundwaveproject.moderation.repository;

import groupone.soundwaveproject.moderation.entity.ContentReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
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

    List<ContentReport> findAllByOrderByCreatedAtDesc();

    List<ContentReport> findByTargetIdAndStatus(Long targetId, String status);

    List<ContentReport> findByTargetTypeAndTargetIdAndStatus(String targetType, Long targetId, String status);
}
