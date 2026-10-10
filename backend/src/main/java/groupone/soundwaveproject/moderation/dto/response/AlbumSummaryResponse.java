package groupone.soundwaveproject.moderation.dto.response;

/**
 * DTO tóm tắt thông tin Album liên kết với bài hát đang kiểm duyệt (UC-24: Manage Track Moderation).
 *
 * @param id     ID của Album
 * @param title  Tựa đề Album
 * @param slug   Đường dẫn thân thiện (slug) của Album
 * @param status Trạng thái xuất bản của Album (DRAFT hoặc PUBLISHED)
 */
public record AlbumSummaryResponse(
        Long id,
        String title,
        String slug,
        String status
) {}
