package groupone.soundwaveproject.moderation.dto.response;

/**
 * DTO tóm tắt thông tin Thể loại âm nhạc của bài hát đang kiểm duyệt (UC-24: Manage Track Moderation).
 *
 * @param id   ID của Thể loại
 * @param name Tên Thể loại âm nhạc
 * @param slug Đường dẫn thân thiện (slug) của Thể loại
 */
public record GenreSummaryResponse(
        Long id,
        String name,
        String slug
) {}
