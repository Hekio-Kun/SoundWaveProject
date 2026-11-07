package groupone.soundwaveproject.authentication.dto.response;

import java.time.LocalDateTime;

/**
 * DTO tóm tắt thông tin tài khoản nhân viên kiểm duyệt cho giao diện quản trị Admin (UC-27.1: View Staff Directory).
 *
 * @param id                    ID định danh của nhân viên
 * @param email                 Email của nhân viên
 * @param fullName              Họ tên hiển thị của nhân viên
 * @param roleCode              Mã vai trò (STAFF / ADMIN)
 * @param roleName              Tên vai trò hiển thị
 * @param status                Trạng thái hoạt động (ACTIVE / INACTIVE)
 * @param avatarUrl             Đường dẫn ảnh đại diện
 * @param lastLoginAt           Thời điểm đăng nhập gần nhất
 * @param createdAt             Thời điểm khởi tạo tài khoản
 * @param totalTracksModerated  Tổng số bài hát đã kiểm duyệt (Approved hoặc Rejected)
 * @param totalReportsResolved  Tổng số báo cáo vi phạm đã giải quyết
 */
public record StaffSummaryResponse(
        Long id,
        String email,
        String fullName,
        String roleCode,
        String roleName,
        String status,
        String avatarUrl,
        LocalDateTime lastLoginAt,
        LocalDateTime createdAt,
        long totalTracksModerated,
        long totalReportsResolved
) {}

