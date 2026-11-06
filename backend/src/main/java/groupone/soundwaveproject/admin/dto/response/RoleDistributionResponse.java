package groupone.soundwaveproject.admin.dto.response;

/**
 * DTO thể hiện cơ cấu và tỷ lệ phân bố người dùng theo vai trò (UC-29).
 */
public record RoleDistributionResponse(
        long listeners,
        long creators,
        long staffs,
        long admins,
        double listenerPercentage,
        double creatorPercentage
) {}

