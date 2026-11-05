package groupone.soundwaveproject.authentication.dto.response;

import java.time.LocalDateTime;

/**
 * DTO phản hồi sau khi khởi tạo tài khoản nhân viên kiểm duyệt thành công (UC-27.2).
 *
 * @param id                ID định danh của nhân viên vừa tạo
 * @param email             Email tài khoản nhân viên
 * @param fullName          Họ tên hiển thị
 * @param roleCode          Mã vai trò (STAFF)
 * @param roleName          Tên vai trò hiển thị
 * @param status            Trạng thái kích hoạt (ACTIVE)
 * @param temporaryPassword Mật khẩu tạm thời ban đầu (phục vụ hiển thị / bàn giao thủ công nếu cần)
 * @param emailDispatched   Trạng thái gửi email thông tin tài khoản qua UC-23 (true: thành công, false: SMTP lỗi)
 * @param createdAt         Thời điểm tạo tài khoản
 */
public record CreateStaffResponse(
        Long id,
        String email,
        String fullName,
        String roleCode,
        String roleName,
        String status,
        String temporaryPassword,
        boolean emailDispatched,
        LocalDateTime createdAt
) {}

