package groupone.soundwaveproject.moderation.dto.response;

import java.util.List;

/**
 * DTO điều hướng danh sách các bài hát trong Album dành cho nhân viên kiểm duyệt (UC-24: Content Moderation).
 * Cho phép nhân viên kiểm duyệt chuyển nhanh sang bài hát tiếp theo hoặc bất kỳ bài nào trong Album.
 *
 * @param albumId                 ID Album
 * @param albumTitle              Tựa đề Album
 * @param currentSubmissionId     ID bản ghi kiểm duyệt bài hát hiện tại
 * @param prevSubmissionId        ID bản ghi kiểm duyệt bài hát liền trước trong Album
 * @param nextSubmissionId        ID bản ghi kiểm duyệt bài hát tiếp theo trong Album
 * @param nextPendingSubmissionId ID bản ghi kiểm duyệt tiếp theo đang chờ duyệt (PENDING) trong Album
 * @param currentIndex            Vị trí thứ tự bài hát hiện tại trong Album (bắt đầu từ 1)
 * @param totalTracks             Tổng số lượng bài hát trong Album
 * @param tracks                  Danh sách toàn bộ các bài hát trong Album kèm trạng thái kiểm duyệt
 */
public record AlbumTrackNavigationResponse(
        Long albumId,
        String albumTitle,
        Long currentSubmissionId,
        Long prevSubmissionId,
        Long nextSubmissionId,
        Long nextPendingSubmissionId,
        int currentIndex,
        int totalTracks,
        List<AlbumTrackSummaryResponse> tracks
) {}
