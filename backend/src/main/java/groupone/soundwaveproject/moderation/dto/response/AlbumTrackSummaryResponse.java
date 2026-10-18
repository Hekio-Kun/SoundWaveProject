package groupone.soundwaveproject.moderation.dto.response;

import groupone.soundwaveproject.moderation.entity.SubmissionStatus;

/**
 * DTO tóm tắt một bài hát trong Album phục vụ điều hướng duyệt danh sách bài hát (UC-24: Content Moderation).
 *
 * @param submissionId ID bản ghi yêu cầu kiểm duyệt (nếu đã nộp duyệt)
 * @param trackId      ID bài hát
 * @param title        Tựa đề bài hát
 * @param trackNumber  Số thứ tự bài hát trong Album
 * @param durationMs   Thời lượng bài hát (mili-giây)
 * @param status       Trạng thái kiểm duyệt (PENDING, APPROVED, REJECTED)
 */
public record AlbumTrackSummaryResponse(
        Long submissionId,
        Long trackId,
        String title,
        Integer trackNumber,
        Integer durationMs,
        SubmissionStatus status
) {}
