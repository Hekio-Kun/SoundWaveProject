package groupone.soundwaveproject.catalog.dto.response;

import org.springframework.data.domain.Page;

import java.util.List;

/**
 * DTO phản hồi danh sách phân trang các thể loại cho màn hình quản trị Admin (UC-26: Manage Genres).
 *
 * @param content       Danh sách các thể loại trên trang hiện tại
 * @param totalElements Tổng số lượng thể loại thỏa mãn điều kiện lọc
 * @param totalPages    Tổng số trang
 * @param size          Kích thước mỗi trang
 * @param number        Số thứ tự trang hiện tại (0-indexed)
 * @param first         Đánh dấu có phải trang đầu tiên không
 * @param last          Đánh dấu có phải trang cuối cùng không
 */
public record AdminGenrePageResponse(
        List<AdminGenreResponse> content,
        long totalElements,
        int totalPages,
        int size,
        int number,
        boolean first,
        boolean last
) {
    /**
     * Chuyển đổi từ đối tượng Page của Spring Data JPA sang DTO AdminGenrePageResponse.
     *
     * @param page Đối tượng phân trang của Spring Data
     * @return DTO AdminGenrePageResponse tương ứng
     */
    public static AdminGenrePageResponse from(Page<AdminGenreResponse> page) {
        return new AdminGenrePageResponse(
                List.copyOf(page.getContent()),
                page.getTotalElements(),
                page.getTotalPages(),
                page.getSize(),
                page.getNumber(),
                page.isFirst(),
                page.isLast()
        );
    }
}
