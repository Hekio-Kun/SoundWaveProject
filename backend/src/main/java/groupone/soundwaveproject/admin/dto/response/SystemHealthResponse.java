package groupone.soundwaveproject.admin.dto.response;

/**
 * DTO chứa thông tin trạng thái hoạt động của các dịch vụ hệ thống (UC-29).
 */
public record SystemHealthResponse(
        String restApiStatus,
        String databaseStatus,
        String cloudStorageStatus,
        String emailServiceStatus,
        int restApiLatencyMs,
        int databaseLatencyMs,
        int cloudStorageLatencyMs,
        String uptime
) {}

