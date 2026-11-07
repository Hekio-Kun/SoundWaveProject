package groupone.soundwaveproject.authentication.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO yêu cầu khởi tạo tài khoản nhân viên kiểm duyệt mới từ Admin (UC-27.2: Create Staff Account).
 * <p>
 * Theo Business Rule BR-Staff-01: Quản trị viên chỉ cung cấp Họ tên và Email làm việc.
 * Mật khẩu được hệ thống tự động sinh 100% theo chuẩn định dạng bảo mật SoundWave (BR-Staff-02),
 * mã hóa lưu trữ bằng BCrypt và gửi qua email cho nhân viên (UC-23).
 *
 * @param fullName             Họ và tên hiển thị của nhân viên
 * @param email                Địa chỉ email nhân viên
 * @param password             (Deprecated) Giữ để tương thích ngược, hệ thống luôn tự sinh mật khẩu chuẩn
 * @param autoGeneratePassword (Deprecated) Giữ để tương thích ngược, mặc định luôn true
 */
public record CreateStaffRequest(
        @NotBlank(message = "Full name is required")
        @Size(min = 2, max = 120, message = "Full name must be between 2 and 120 characters")
        String fullName,

        @NotBlank(message = "Email is required")
        @Email(message = "Email must be a valid email address")
        @Size(max = 320, message = "Email must not exceed 320 characters")
        String email,

        String password,

        Boolean autoGeneratePassword
) {
    public CreateStaffRequest(String fullName, String email) {
        this(fullName, email, null, true);
    }
}
