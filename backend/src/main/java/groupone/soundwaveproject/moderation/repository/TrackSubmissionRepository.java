package groupone.soundwaveproject.moderation.repository;

import groupone.soundwaveproject.moderation.entity.SubmissionStatus;
import groupone.soundwaveproject.moderation.entity.TrackSubmission;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.Optional;

/**
 * Repository truy vấn dữ liệu cho bảng yêu cầu kiểm duyệt bài hát (track_submissions).
 * Phục vụ các nghiệp vụ tra cứu và cập nhật trạng thái kiểm duyệt [UC-24: Manage Track Moderation].
 */
@Repository
public interface TrackSubmissionRepository extends JpaRepository<TrackSubmission, Long> {

    /**
     * Lấy bản ghi yêu cầu kiểm duyệt mới nhất của một bài hát theo thời gian gửi (submittedAt) giảm dần.
     *
     * @param trackId ID của bài hát
     * @return Optional chứa yêu cầu kiểm duyệt mới nhất nếu tồn tại
     */
    Optional<TrackSubmission> findFirstByTrackIdOrderBySubmittedAtDesc(Long trackId);

    /**
     * Xóa toàn bộ các bản ghi yêu cầu kiểm duyệt gắn với một bài hát (dùng khi xóa bài hát).
     *
     * @param trackId ID của bài hát
     */
    void deleteByTrackId(Long trackId);

    /**
     * Đếm số lượng yêu cầu kiểm duyệt theo trạng thái (PENDING, APPROVED, REJECTED).
     *
     * @param status Trạng thái kiểm duyệt cần đếm
     * @return Số lượng bản ghi thỏa mãn
     */
    long countByStatus(SubmissionStatus status);

    /**
     * Lấy danh sách yêu cầu kiểm duyệt theo trạng thái có phân trang (UC-24.1 View Moderation Queue).
     *
     * @param status   Trạng thái kiểm duyệt cần lọc
     * @param pageable Cấu hình phân trang và sắp xếp
     * @return Trang danh sách các yêu cầu kiểm duyệt thỏa mãn
     */
    Page<TrackSubmission> findByStatus(SubmissionStatus status, Pageable pageable);

    /**
     * Tìm kiếm và phân trang các yêu cầu kiểm duyệt kết hợp trạng thái và danh sách ID bài hát hoặc ID tác giả khớp từ khóa.
     *
     * @param status   Trạng thái cần lọc (hoặc null nếu lấy tất cả)
     * @param trackIds Tập hợp ID bài hát khớp tên tìm kiếm
     * @param userIds  Tập hợp ID người dùng khớp email tìm kiếm
     * @param pageable Cấu hình phân trang và sắp xếp
     * @return Trang danh sách các yêu cầu kiểm duyệt khớp điều kiện
     */
    @Query("SELECT s FROM TrackSubmission s WHERE (:status IS NULL OR s.status = :status) " +
           "AND (s.trackId IN :trackIds OR s.submittedByUserId IN :userIds)")
    Page<TrackSubmission> findByStatusAndMatchingIds(
            @Param("status") SubmissionStatus status,
            @Param("trackIds") Collection<Long> trackIds,
            @Param("userIds") Collection<Long> userIds,
            Pageable pageable);
}
