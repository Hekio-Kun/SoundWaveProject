package groupone.soundwaveproject.moderation.dto.response;

import groupone.soundwaveproject.moderation.entity.SubmissionStatus;

import java.time.Instant;

/**
 * DTO phản hồi một mục tóm tắt trong danh sách hàng đợi kiểm duyệt bài hát (UC-24.1 View Moderation Queue).
 *
 * @param id                   ID của bản ghi yêu cầu kiểm duyệt
 * @param trackId              ID của bài hát
 * @param trackTitle           Tựa đề bài hát
 * @param genreName            Tên thể loại âm nhạc
 * @param albumTitle           Tên album chứa bài hát (nếu có)
 * @param coverUrl             Đường dẫn ảnh bìa bài hát
 * @param durationMs           Thời lượng bài hát tính theo mili-giây
 * @param submitterId          ID tài khoản người gửi bài
 * @param submitterDisplayName Tên hiển thị của người gửi bài
 * @param submitterEmail       Email của người gửi bài
 * @param status               Trạng thái kiểm duyệt hiện tại
 * @param submittedAt          Thời điểm nộp bài vào hàng đợi
 * @param reviewedAt           Thời điểm kiểm duyệt (nếu đã xử lý)
 * @param reviewerDisplayName  Tên hiển thị của nhân viên kiểm duyệt đã xử lý
 */
public record SubmissionQueueItemResponse(
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
) {}
