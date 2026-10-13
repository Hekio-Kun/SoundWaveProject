package groupone.soundwaveproject.moderation.dto.response;

import java.time.LocalDateTime;

/**
 * DTO phản hồi thông tin chi tiết bài hát trong màn hình kiểm duyệt (UC-24.1 View Track Details).
 * Cung cấp đầy đủ đường dẫn phát nhạc, ảnh bìa, trạng thái và lời bài hát (lyrics) để thẩm định.
 *
 * @param id                    ID của bài hát
 * @param title                 Tựa đề bài hát
 * @param slug                  Đường dẫn thân thiện (slug) của bài hát
 * @param description           Mô tả bài hát do tác giả nhập
 * @param trackNumber           Thứ tự bài hát trong Album (nếu có)
 * @param publicationStatus     Trạng thái phát hành của bài hát (DRAFT, PENDING, PUBLISHED, REJECTED, TAKEN_DOWN)
 * @param audioUrl              Đường dẫn tệp âm thanh (streaming audio)
 * @param audioFormat           Định dạng tệp âm thanh (mp3, wav, flac, v.v.)
 * @param durationMs            Thời lượng bài hát tính theo mili-giây
 * @param coverUrl              Đường dẫn ảnh bìa bài hát
 * @param playCount             Số lượt nghe của bài hát
 * @param approvedAt            Thời điểm bài hát được phê duyệt xuất bản
 * @param latestRejectionReason Lý do bị từ chối gần nhất (nếu có)
 * @param createdAt             Thời điểm bài hát được tạo
 * @param genre                 Thông tin tóm tắt thể loại âm nhạc
 * @param album                 Thông tin tóm tắt album
 * @param lyrics                Lời bài hát (nội dung text/lrc)
 */
public record TrackDetailResponse(
        Long id,
        String title,
        String slug,
        String description,
        Integer trackNumber,
        String publicationStatus,
        String audioUrl,
        String audioFormat,
        Integer durationMs,
        String coverUrl,
        Long playCount,
        LocalDateTime approvedAt,
        String latestRejectionReason,
        LocalDateTime createdAt,
        GenreSummaryResponse genre,
        AlbumSummaryResponse album,
        String lyrics
) {}
