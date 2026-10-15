package groupone.soundwaveproject.notification.dto.response;

import lombok.Builder;

import java.time.Instant;

/**
 * DTO dữ liệu trả về của thông báo gửi tới client (UC-17: View My Notification).
 */
@Builder
public record NotificationResponse(
        Long id,
        String type,
        String title,
        String message,
        String referenceType,
        String referenceId,
        boolean isRead,
        Instant createdAt,
        String navigationUrl
) {
}
