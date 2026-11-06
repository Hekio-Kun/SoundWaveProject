package groupone.soundwaveproject.authentication.dto.response;

import java.util.List;

/**
 * DTO tổng hợp lịch sử hoạt động kiểm duyệt của một nhân viên (UC-27.4: View Staff Moderation Activity).
 *
 * @param staffId              ID nhân viên
 * @param fullName             Họ và tên nhân viên
 * @param email                Email nhân viên
 * @param roleCode             Mã vai trò
 * @param roleName             Tên vai trò
 * @param status               Trạng thái tài khoản (ACTIVE, INACTIVE)
 * @param totalTracksModerated Tổng số bài nhạc đã kiểm duyệt (APPROVED, REJECTED)
 * @param totalReportsResolved Tổng số báo cáo vi phạm đã xử lý
 * @param trackReviews         Danh sách chi tiết các bài hát đã kiểm duyệt
 * @param reportResolutions    Danh sách chi tiết các báo cáo vi phạm đã xử lý
 */
public record StaffModerationActivityResponse(
        Long staffId,
        String fullName,
        String email,
        String roleCode,
        String roleName,
        String status,
        long totalTracksModerated,
        long totalReportsResolved,
        List<TrackModerationActivityResponse> trackReviews,
        List<ReportResolutionActivityResponse> reportResolutions
) {}

