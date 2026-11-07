package groupone.soundwaveproject.moderation.dto.response;

import java.util.List;

/**
 * DTO tổng hợp lịch sử hoạt động kiểm duyệt từ module moderation để cung cấp cho module administration/authentication (UC-27.4).
 *
 * @param totalTracksModerated Tổng số bài nhạc đã kiểm duyệt (APPROVED, REJECTED)
 * @param totalReportsResolved Tổng số báo cáo vi phạm đã xử lý
 * @param trackReviews         Danh sách chi tiết các bài hát đã kiểm duyệt
 * @param reportResolutions    Danh sách chi tiết các báo cáo vi phạm đã xử lý
 */
public record ModerationActivityBundleResponse(
        long totalTracksModerated,
        long totalReportsResolved,
        List<TrackModerationActivityResponse> trackReviews,
        List<ReportResolutionActivityResponse> reportResolutions
) {}

