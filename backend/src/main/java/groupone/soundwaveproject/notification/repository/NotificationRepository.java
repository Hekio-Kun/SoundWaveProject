package groupone.soundwaveproject.notification.repository;

import groupone.soundwaveproject.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository truy xuất dữ liệu thông báo người dùng và nhân viên (UC-17: View My Notification).
 */
@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /**
     * Lấy danh sách 30 thông báo gần đây nhất của người dùng theo thứ tự thời gian giảm dần.
     */
    List<Notification> findTop30ByUserIdOrderByCreatedAtDesc(Long userId);

    /**
     * Lấy danh sách 30 thông báo gần đây nhất của nhân viên theo thứ tự thời gian giảm dần.
     */
    List<Notification> findTop30ByStaffIdOrderByCreatedAtDesc(Long staffId);

    /**
     * Đếm số lượng thông báo chưa đọc của người dùng.
     */
    long countByUserIdAndIsReadFalse(Long userId);

    /**
     * Đếm số lượng thông báo chưa đọc của nhân viên.
     */
    long countByStaffIdAndIsReadFalse(Long staffId);

    /**
     * Tìm thông báo theo ID và thuộc về đúng tài khoản người nhận.
     */
    Optional<Notification> findByIdAndUserId(Long id, Long userId);

    /**
     * Tìm thông báo theo ID và thuộc về đúng tài khoản nhân viên.
     */
    Optional<Notification> findByIdAndStaffId(Long id, Long staffId);

    /**
     * Cập nhật tất cả thông báo chưa đọc của người dùng thành đã đọc.
     */
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.userId = :userId AND n.isRead = false")
    int markAllAsReadByUserId(@Param("userId") Long userId);

    /**
     * Cập nhật tất cả thông báo chưa đọc của nhân viên thành đã đọc.
     */
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.staffId = :staffId AND n.isRead = false")
    int markAllAsReadByStaffId(@Param("staffId") Long staffId);

    /**
     * Cập nhật một thông báo cụ thể của người dùng thành đã đọc.
     */
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.id = :id AND n.userId = :userId")
    int markAsReadByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);
}
