package groupone.soundwaveproject.moderation.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import groupone.soundwaveproject.moderation.dto.request.ApproveTrackRequest;
import groupone.soundwaveproject.moderation.dto.request.RejectTrackRequest;
import groupone.soundwaveproject.moderation.dto.request.TakeDownTrackRequest;
import groupone.soundwaveproject.moderation.dto.response.SubmissionDetailResponse;
import groupone.soundwaveproject.moderation.dto.response.SubmissionQueueItemResponse;
import groupone.soundwaveproject.moderation.dto.response.SubmissionStatsResponse;
import groupone.soundwaveproject.moderation.entity.SubmissionStatus;
import groupone.soundwaveproject.moderation.entity.SubmissionType;
import groupone.soundwaveproject.moderation.service.ModerationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

/**
 * Controller quản lý toàn bộ chức năng kiểm duyệt bài hát và album (UC-24: Manage Content Moderation).
 * Dành riêng cho nhân viên kiểm duyệt (STAFF).
 */
@RestController
@RequestMapping({"/api/v1/moderation/submissions", "/api/v1/admin/moderation/tracks", "/api/v1/moderation"})
@RequiredArgsConstructor
@PreAuthorize("hasRole('STAFF')")
public class ModerationController {
    private final ModerationService moderationService;

    /**
     * Lấy danh sách hàng đợi các bài hát và album cần kiểm duyệt (UC-24.1 View Moderation Queue).
     *
     * @param status   Trạng thái kiểm duyệt cần lọc (PENDING, APPROVED, REJECTED)
     * @param search   Từ khóa tìm kiếm theo tiêu đề bài hát, tên album hoặc email người gửi
     * @param pageable Cấu hình phân trang và sắp xếp (mặc định sắp xếp theo submittedAt tăng dần)
     * @return Trang danh sách các mục (Track đơn hoặc Album) trong hàng đợi kiểm duyệt
     */
    @GetMapping
    public ResponseEntity<Page<SubmissionQueueItemResponse>> getQueue(
            @RequestParam(required = false) SubmissionStatus status,
            @RequestParam(required = false) SubmissionType type,
            @RequestParam(required = false) String search,
            @PageableDefault(sort = "submittedAt", direction = Sort.Direction.ASC) Pageable pageable) {
        return ResponseEntity.ok(moderationService.getQueue(status, type, search, pageable));
    }

    /**
     * Lấy số liệu thống kê tổng quan của hàng đợi kiểm duyệt (UC-24.1 View Moderation Queue Stats).
     *
     * @return DTO thống kê số lượng bài hát/album chờ duyệt, đã duyệt, bị từ chối và tổng số
     */
    @GetMapping("/stats")
    public ResponseEntity<SubmissionStatsResponse> getQueueStats(
            @RequestParam(required = false) SubmissionType type) {
        return ResponseEntity.ok(moderationService.getQueueStats(type));
    }

    /**
     * Xem thông tin chi tiết bài hát đang kiểm duyệt kèm tệp âm thanh và lời bài hát (UC-24.1 View Track Details).
     *
     * @param id ID của bản ghi yêu cầu kiểm duyệt (TrackSubmission ID)
     * @return DTO chi tiết bài hát cùng thông tin gửi duyệt
     */
    @GetMapping("/{id}")
    public ResponseEntity<SubmissionDetailResponse> getSubmissionDetail(@PathVariable Long id) {
        return ResponseEntity.ok(moderationService.getSubmissionDetail(id));
    }

    /**
     * Phê duyệt bài hát để xuất bản lên hệ thống công khai (UC-24.2 Approve Track).
     * Áp dụng quy tắc BR-18: Tự động chuyển trạng thái Album sang PUBLISHED nếu Album đang ở DRAFT.
     *
     * @param id        ID của bản ghi yêu cầu kiểm duyệt
     * @param request   DTO chứa ghi chú nội bộ của người kiểm duyệt (tùy chọn)
     * @param principal Thông tin tài khoản người thực hiện duyệt bài
     * @return DTO thông tin chi tiết bài hát sau khi đã phê duyệt
     */
    @PostMapping("/{id}/approve")
    public ResponseEntity<SubmissionDetailResponse> approveSubmission(
            @PathVariable Long id,
            @Valid @RequestBody(required = false) ApproveTrackRequest request,
            Principal principal) {
        return ResponseEntity.ok(moderationService.approveSubmission(id, request, principal.getName()));
    }

    /**
     * Từ chối bài hát không đạt chuẩn nội dung kèm lý do cụ thể (UC-24.2 Reject Track).
     *
     * @param id        ID của bản ghi yêu cầu kiểm duyệt
     * @param request   DTO chứa lý do từ chối (bắt buộc, tối thiểu 10 ký tự) và ghi chú
     * @param principal Thông tin tài khoản người thực hiện từ chối bài
     * @return DTO thông tin chi tiết bài hát sau khi bị từ chối
     */
    @PostMapping("/{id}/reject")
    public ResponseEntity<SubmissionDetailResponse> rejectSubmission(
            @PathVariable Long id,
            @Valid @RequestBody RejectTrackRequest request,
            Principal principal) {
        return ResponseEntity.ok(moderationService.rejectSubmission(id, request, principal.getName()));
    }

    /**
     * Gỡ bỏ bài hát đã phát hành công khai trước đó do phát hiện vi phạm bản quyền hoặc tiêu chuẩn (UC-24.2 Take Down Track).
     *
     * @param id        ID của bản ghi yêu cầu kiểm duyệt
     * @param request   DTO chứa lý do gỡ bài bắt buộc và ghi chú
     * @param principal Thông tin tài khoản người thực hiện gỡ bài
     * @return DTO thông tin chi tiết bài hát sau khi gỡ bỏ
     */
    @PostMapping("/{id}/takedown")
    public ResponseEntity<SubmissionDetailResponse> takeDownSubmission(
            @PathVariable Long id,
            @Valid @RequestBody TakeDownTrackRequest request,
            Principal principal) {
        return ResponseEntity.ok(moderationService.takeDownSubmission(id, request, principal.getName()));
    }
}
