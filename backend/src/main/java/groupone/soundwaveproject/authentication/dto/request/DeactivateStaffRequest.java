package groupone.soundwaveproject.authentication.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO yêu cầu vô hiệu hóa tài khoản nhân viên kiểm duyệt (UC-27.3: Deactivate Staff Account).
 * <p>
 * Theo ngoại lệ EX01 trong RDS v1.9, lý do vô hiệu hóa là bắt buộc (mandatory).
 *
 * @param reason Lý do vô hiệu hóa tài khoản (5 - 500 ký tự)
 */
public record DeactivateStaffRequest(
        @NotBlank(message = "Deactivation reason is mandatory")
        @Size(min = 5, max = 500, message = "Deactivation reason must be between 5 and 500 characters")
        String reason
) {}

