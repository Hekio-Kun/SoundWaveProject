package groupone.soundwaveproject.authentication.dto.response;

import org.springframework.data.domain.Page;

import java.util.List;

/**
 * DTO phản hồi phân trang danh bạ nhân viên kiểm duyệt cho Admin (UC-27.1: View Staff Directory).
 *
 * @param content       Danh sách tóm tắt thông tin nhân viên trong trang hiện tại
 * @param totalElements Tổng số lượng nhân viên thỏa mãn điều kiện lọc
 * @param totalPages    Tổng số trang
 * @param size          Kích thước trang (số phần tử trên mỗi trang)
 * @param number        Số thứ tự trang hiện tại (0-indexed)
 * @param first         Có phải trang đầu tiên không
 * @param last          Có phải trang cuối cùng không
 */
public record StaffDirectoryPageResponse(
        List<StaffSummaryResponse> content,
        long totalElements,
        int totalPages,
        int size,
        int number,
        boolean first,
        boolean last
) {
    /**
     * Chuyển đổi đối tượng phân trang của Spring Data sang StaffDirectoryPageResponse DTO.
     *
     * @param page Đối tượng Page từ Spring Data JPA
     * @return DTO phân trang tương ứng
     */
    public static StaffDirectoryPageResponse of(Page<StaffSummaryResponse> page) {
        return new StaffDirectoryPageResponse(
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

