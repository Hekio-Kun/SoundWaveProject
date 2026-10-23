package groupone.soundwaveproject.studio.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * Data Transfer Object yêu cầu truy vấn thông tin lý do từ chối kiểm duyệt của bài hát.
 * Phục vụ Use Case UC-20 (View Rejection Reason) theo đúng biểu đồ Sequence Diagram:
 *
 *   3: new GetRejectionDetailsRequest(trackId)
 *   4: rejectionRequestDTO
 *   5: getRejectionDetails(rejectionRequestDTO, currentUserEmail)
 *
 * @param trackId Mã định danh bài hát cần xem phản hồi từ chối kiểm duyệt
 */
public record GetRejectionDetailsRequest(
        @NotNull(message = "Track ID is required.")
        @Positive(message = "Track ID must be positive.")
        Long trackId
) {
}