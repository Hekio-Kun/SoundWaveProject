package groupone.soundwaveproject.admin.dto.response;

import java.time.LocalDateTime;

/**
 * DTO đại diện cho tài khoản vừa đăng ký/xác thực trong danh sách gần đây (UC-29).
 */
public record RecentAccountStatisticResponse(
        Long id,
        String email,
        String displayName,
        String role,
        String status,
        LocalDateTime joinedAt,
        String initials,
        String avatarUrl
) {}

