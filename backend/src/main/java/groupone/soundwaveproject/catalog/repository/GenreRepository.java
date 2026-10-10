package groupone.soundwaveproject.catalog.repository;

import groupone.soundwaveproject.catalog.entity.Genre;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Locale;
import java.util.Optional;

/**
 * Repository truy vấn dữ liệu cho bảng thể loại nhạc (genres).
 * Phục vụ danh mục công khai [UC-8] và chức năng Quản lý thể loại của Admin [UC-26: Manage Genres].
 */
public interface GenreRepository extends JpaRepository<Genre, Long> {
    Optional<Genre> findBySlug(String slug);
    List<Genre> findByIsActiveTrue();
    List<Genre> findByIsActiveTrueOrderByNameAsc();

    /**
     * Tìm thể loại theo ID nếu thể loại đang ở trạng thái hoạt động.
     *
     * @param id ID của thể loại
     * @return Optional chứa thể loại nếu tìm thấy và đang hoạt động
     */
    Optional<Genre> findByIdAndIsActiveTrue(Long id);

    /**
     * Tìm thể loại theo slug không phân biệt hoa thường.
     *
     * @param slug Slug của thể loại
     * @return Optional chứa thể loại nếu tồn tại
     */
    Optional<Genre> findBySlugIgnoreCase(String slug);

    /**
     * Tìm thể loại theo slug không phân biệt hoa thường và đang kích hoạt.
     *
     * @param slug Slug của thể loại
     * @return Optional chứa thể loại nếu tồn tại và đang hoạt động
     */
    Optional<Genre> findBySlugIgnoreCaseAndIsActiveTrue(String slug);

    /**
     * Kiểm tra sự tồn tại của tên thể loại (không phân biệt hoa thường) để chống trùng lặp (EX01).
     *
     * @param name Tên thể loại cần kiểm tra
     * @return true nếu tên đã tồn tại trong hệ thống
     */
    boolean existsByNameIgnoreCase(String name);

    /**
     * Kiểm tra sự tồn tại của slug thể loại (không phân biệt hoa thường) để chống trùng lặp (EX01).
     *
     * @param slug Slug thể loại cần kiểm tra
     * @return true nếu slug đã tồn tại trong hệ thống
     */
    boolean existsBySlugIgnoreCase(String slug);

    /**
     * Kiểm tra tên thể loại đã tồn tại ở bản ghi khác (ngoại trừ ID hiện tại khi cập nhật) (EX01).
     *
     * @param name Tên thể loại cần kiểm tra
     * @param id   ID của thể loại đang được cập nhật
     * @return true nếu tên bị trùng với thể loại khác
     */
    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);

    /**
     * Kiểm tra slug thể loại đã tồn tại ở bản ghi khác (ngoại trừ ID hiện tại khi cập nhật) (EX01).
     *
     * @param slug Slug thể loại cần kiểm tra
     * @param id   ID của thể loại đang được cập nhật
     * @return true nếu slug bị trùng với thể loại khác
     */
    boolean existsBySlugIgnoreCaseAndIdNot(String slug, Long id);

    /**
     * Lọc danh sách thể loại theo trạng thái kích hoạt có phân trang (UC-26).
     *
     * @param active   Trạng thái kích hoạt (true hoặc false)
     * @param pageable Cấu hình phân trang và sắp xếp
     * @return Trang danh sách thể loại tương ứng
     */
    Page<Genre> findByIsActive(Boolean active, Pageable pageable);

    /**
     * Tìm kiếm thể loại theo từ khóa trong tên hoặc slug có phân trang (UC-26).
     *
     * @param search   Từ khóa tìm kiếm
     * @param pageable Cấu hình phân trang và sắp xếp
     * @return Trang danh sách thể loại khớp từ khóa
     */
    @Query("SELECT g FROM Genre g WHERE LOWER(g.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(g.slug) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Genre> searchByKeyword(@Param("search") String search, Pageable pageable);

    /**
     * Tìm kiếm thể loại kết hợp từ khóa và trạng thái kích hoạt có phân trang (UC-26).
     *
     * @param active   Trạng thái kích hoạt
     * @param search   Từ khóa tìm kiếm
     * @param pageable Cấu hình phân trang và sắp xếp
     * @return Trang danh sách thể loại khớp điều kiện
     */
    @Query("SELECT g FROM Genre g WHERE g.isActive = :active AND (LOWER(g.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(g.slug) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Genre> searchByActiveAndKeyword(@Param("active") Boolean active, @Param("search") String search, Pageable pageable);

    /**
     * Điều phối tìm kiếm và phân trang thể loại tối ưu cho PostgreSQL (UC-26: Manage Genres).
     * Tránh lỗi `function lower(bytea) does not exist` khi tham số null trên PostgreSQL.
     *
     * @param search   Từ khóa tìm kiếm (có thể null hoặc rỗng)
     * @param active   Trạng thái kích hoạt (có thể null nếu chọn ALL)
     * @param pageable Cấu hình phân trang và sắp xếp
     * @return Trang danh sách thể loại quản trị
     */
    default Page<Genre> searchForAdmin(String search, Boolean active, Pageable pageable) {
        boolean hasSearch = search != null && !search.trim().isBlank();
        String keyword = hasSearch ? search.trim().toLowerCase(Locale.ROOT) : null;
        if (hasSearch && active != null) {
            return searchByActiveAndKeyword(active, keyword, pageable);
        } else if (hasSearch) {
            return searchByKeyword(keyword, pageable);
        } else if (active != null) {
            return findByIsActive(active, pageable);
        } else {
            return findAll(pageable);
        }
    }
}
