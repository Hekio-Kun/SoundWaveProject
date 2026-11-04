package groupone.soundwaveproject.authentication.repository;

import groupone.soundwaveproject.authentication.entity.Staff;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Locale;
import java.util.Optional;

public interface StaffRepository extends JpaRepository<Staff, Long> {
    Optional<Staff> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);

    /**
     * Lấy toàn bộ nhân viên có vai trò STAFF (loại trừ ADMIN) theo phân trang.
     */
    @Query("SELECT s FROM Staff s WHERE UPPER(s.role.code) = 'STAFF'")
    Page<Staff> findAllStaffs(Pageable pageable);

    /**
     * Lấy nhân viên vai trò STAFF theo trạng thái (ACTIVE / INACTIVE).
     */
    @Query("SELECT s FROM Staff s WHERE UPPER(s.role.code) = 'STAFF' AND UPPER(s.status) = UPPER(:status)")
    Page<Staff> findStaffsByStatus(@Param("status") String status, Pageable pageable);

    /**
     * Tìm kiếm nhân viên vai trò STAFF theo từ khóa (họ tên hoặc email).
     */
    @Query("SELECT s FROM Staff s WHERE UPPER(s.role.code) = 'STAFF' AND (LOWER(s.email) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(s.fullName) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Staff> searchStaffsByKeyword(@Param("search") String search, Pageable pageable);

    /**
     * Tìm kiếm nhân viên vai trò STAFF theo cả trạng thái và từ khóa.
     */
    @Query("SELECT s FROM Staff s WHERE UPPER(s.role.code) = 'STAFF' AND UPPER(s.status) = UPPER(:status) AND (LOWER(s.email) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(s.fullName) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Staff> searchStaffsByStatusAndKeyword(
            @Param("status") String status,
            @Param("search") String search,
            Pageable pageable
    );

    /**
     * Phân luồng truy vấn tối ưu cho PostgreSQL (UC-27.1: Chỉ hiển thị tài khoản vai trò Moderator Staff).
     */
    default Page<Staff> findByFilter(String search, String status, Pageable pageable) {
        boolean hasSearch = search != null && !search.trim().isBlank();
        boolean hasStatus = status != null && !status.trim().isBlank() && !"ALL".equalsIgnoreCase(status.trim());
        String keyword = hasSearch ? search.trim() : null;
        String statusVal = hasStatus ? status.trim().toUpperCase(Locale.ROOT) : null;

        if (hasSearch && hasStatus) {
            return searchStaffsByStatusAndKeyword(statusVal, keyword, pageable);
        } else if (hasSearch) {
            return searchStaffsByKeyword(keyword, pageable);
        } else if (hasStatus) {
            return findStaffsByStatus(statusVal, pageable);
        } else {
            return findAllStaffs(pageable);
        }
    }
}
