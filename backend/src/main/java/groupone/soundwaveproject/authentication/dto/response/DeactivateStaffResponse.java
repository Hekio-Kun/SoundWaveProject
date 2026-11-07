package groupone.soundwaveproject.authentication.dto.response;

import java.time.LocalDateTime;

/**
 * DTO phản hồi kết quả sau khi vô hiệu hóa tài khoản nhân viên kiểm duyệt (UC-27.3).
 *
 * @param id            ID của nhân viên
 * @param email         Địa chỉ email của nhân viên
 * @param fullName      Họ và tên của nhân viên
 * @param roleCode      Mã vai trò (STAFF)
 * @param status        Trạng thái mới (INACTIVE)
 * @param reason        Lý do vô hiệu hóa đã ghi nhận
 * @param deactivatedAt Thời điểm thực hiện vô hiệu hóa (UTC)
 */
public record DeactivateStaffResponse(
        Long id,
        String email,
        String fullName,
        String roleCode,
        String status,
        String reason,
        LocalDateTime deactivatedAt
) {}

