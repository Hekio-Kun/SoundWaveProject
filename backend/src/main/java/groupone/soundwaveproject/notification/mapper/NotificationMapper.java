package groupone.soundwaveproject.notification.mapper;

import groupone.soundwaveproject.notification.dto.response.NotificationResponse;
import groupone.soundwaveproject.notification.entity.Notification;
import org.springframework.stereotype.Component;

/**
 * Mapper chuyển đổi giữa Entity Notification và Response DTO.
 */
@Component
public class NotificationMapper {

    /**
     * Chuyển đổi Entity sang Response DTO và sinh đường dẫn điều hướng tương ứng.
     */
    public NotificationResponse toResponse(Notification entity) {
        if (entity == null) {
            return null;
        }

        String navigationUrl = resolveNavigationUrl(entity);

        return NotificationResponse.builder()
                .id(entity.getId())
                .type(entity.getType() != null ? entity.getType().name() : null)
                .title(entity.getTitle())
                .message(entity.getMessage())
                .referenceType(entity.getReferenceType())
                .referenceId(entity.getReferenceId())
                .isRead(entity.isRead())
                .createdAt(entity.getCreatedAt())
                .navigationUrl(navigationUrl)
                .build();
    }

    /**
     * Xác định URL điều hướng đích khi người dùng click vào thông báo (UC-17 Phase 4).
     */
    private String resolveNavigationUrl(Notification entity) {
        if (entity.getType() == null) {
            return "/studio";
        }

        return switch (entity.getType()) {
            case TRACK_APPROVED -> entity.getReferenceId() != null
                    ? "/tracks/" + entity.getReferenceId()
                    : "/studio";
            case TRACK_REJECTED -> entity.getReferenceId() != null
                    ? "/studio/tracks/" + entity.getReferenceId()
                    : "/studio";
            case TRACK_SUBMISSION -> "/staff/dashboard";
            case CONTENT_REPORT -> "/admin/dashboard";
            default -> "/studio";
        };
    }
}
