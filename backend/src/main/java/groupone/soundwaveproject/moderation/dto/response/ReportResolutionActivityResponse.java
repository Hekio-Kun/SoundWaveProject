package groupone.soundwaveproject.moderation.dto.response;

import java.time.Instant;

/**
 * DTO đại diện cho một bản ghi xử lý báo cáo vi phạm trong lịch sử hoạt động của nhân viên (UC-27.4).
 *
 * @param reportId       Mã định danh báo cáo
 * @param category       Thể loại vi phạm (reason)
 * @param targetType     Loại đối tượng bị báo cáo (LYRICS, TRACK)
 * @param targetId       ID đối tượng bị báo cáo
 * @param targetTitle    Tiêu đề đối tượng bị báo cáo (ví dụ tên bài hát)
 * @param decision       Quyết định xử lý (RESOLVED, DISMISSED)
 * @param resolutionNote Ghi chú giải quyết của nhân viên
 * @param resolvedAt     Thời điểm xử lý báo cáo
 */
public record ReportResolutionActivityResponse(
        Long reportId,
        String category,
        String targetType,
        Long targetId,
        String targetTitle,
        String decision,
        String resolutionNote,
        Instant resolvedAt
) {}

