package groupone.soundwaveproject.moderation.dto.response;

import groupone.soundwaveproject.moderation.entity.SubmissionStatus;

import java.time.Instant;
import java.util.List;

/**
 * DTO phản hồi một mục tóm tắt trong danh sách hàng đợi kiểm duyệt (UC-24.1 View Moderation Queue).
 * Có thể là Track đơn (itemType = "SINGLE") hoặc Album (itemType = "ALBUM").
 *
 * @param id                   ID của bản ghi yêu cầu kiểm duyệt (hoặc ID Album nếu là mục Album)
 * @param itemType             Loại mục: "SINGLE" (Track đơn) hoặc "ALBUM" (Bộ sưu tập album)
 * @param trackId              ID của bài hát (null nếu là Album container)
 * @param trackTitle           Tựa đề bài hát (hoặc tựa đề Album nếu là Album container)
 * @param trackNumber          Thứ tự bài hát trong album (nếu có)
 * @param albumId              ID album chứa bài hát (nếu có)
 * @param albumTitle           Tên album chứa bài hát (nếu có)
 * @param genreName            Tên thể loại âm nhạc
 * @param coverUrl             Đường dẫn ảnh bìa
 * @param durationMs           Thời lượng tính theo mili-giây (tổng thời lượng nếu là Album)
 * @param submitterId          ID tài khoản người gửi
 * @param submitterDisplayName Tên hiển thị của người gửi
 * @param submitterEmail       Email của người gửi
 * @param status               Trạng thái kiểm duyệt
 * @param submittedAt          Thời điểm nộp vào hàng đợi
 * @param reviewedAt           Thời điểm kiểm duyệt (nếu đã xử lý)
 * @param reviewerDisplayName  Tên hiển thị của nhân viên kiểm duyệt đã xử lý
 * @param trackCount           Số lượng bài hát (nếu là Album)
 * @param albumTracks          Danh sách các bài hát trong album (nếu là Album)
 */
public record SubmissionQueueItemResponse(
        Long id,
        String itemType,
        Long trackId,
        String trackTitle,
        Integer trackNumber,
        Long albumId,
        String albumTitle,
        String genreName,
        String coverUrl,
        Integer durationMs,
        Long submitterId,
        String submitterDisplayName,
        String submitterEmail,
        SubmissionStatus status,
        Instant submittedAt,
        Instant reviewedAt,
        String reviewerDisplayName,
        Integer trackCount,
        List<SubmissionQueueItemResponse> albumTracks
) {
    /**
     * Constructor tương thích ngược 14 tham số ban đầu.
     */
    public SubmissionQueueItemResponse(
            Long id,
            Long trackId,
            String trackTitle,
            String genreName,
            String albumTitle,
            String coverUrl,
            Integer durationMs,
            Long submitterId,
            String submitterDisplayName,
            String submitterEmail,
            SubmissionStatus status,
            Instant submittedAt,
            Instant reviewedAt,
            String reviewerDisplayName
    ) {
        this(
                id,
                "SINGLE",
                trackId,
                trackTitle,
                null,
                null,
                albumTitle,
                genreName,
                coverUrl,
                durationMs,
                submitterId,
                submitterDisplayName,
                submitterEmail,
                status,
                submittedAt,
                reviewedAt,
                reviewerDisplayName,
                1,
                null
        );
    }
}
