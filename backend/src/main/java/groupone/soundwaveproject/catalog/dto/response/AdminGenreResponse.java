package groupone.soundwaveproject.catalog.dto.response;

import java.time.LocalDateTime;

/**
 * DTO phản hồi thông tin chi tiết một thể loại âm nhạc cho giao diện quản trị Admin (UC-26: Manage Genres).
 *
 * @param id              ID định danh của thể loại
 * @param name            Tên thể loại âm nhạc
 * @param slug            Đường dẫn thân thiện (slug) của thể loại
 * @param description     Mô tả chi tiết thể loại
 * @param active          Trạng thái đang kích hoạt (true) hoặc vô hiệu hóa (false)
 * @param createdByUserId ID của người dùng Admin đã tạo thể loại
 * @param createdAt       Thời điểm tạo bản ghi thể loại
 * @param updatedAt       Thời điểm cập nhật bản ghi gần nhất
 */
public record AdminGenreResponse(
        Long id,
        String name,
        String slug,
        String description,
        boolean active,
        Long createdByUserId,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
