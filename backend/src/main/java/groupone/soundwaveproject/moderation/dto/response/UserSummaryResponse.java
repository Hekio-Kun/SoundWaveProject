package groupone.soundwaveproject.moderation.dto.response;

/**
 * DTO tóm tắt thông tin tài khoản người dùng liên quan đến yêu cầu kiểm duyệt (UC-24: Manage Track Moderation).
 *
 * @param id          ID của tài khoản người dùng
 * @param email       Địa chỉ email tài khoản
 * @param username    Tên định danh (username) trong hồ sơ cá nhân
 * @param displayName Tên hiển thị công khai (display name)
 */
public record UserSummaryResponse(
        Long id,
        String email,
        String username,
        String displayName
) {}
