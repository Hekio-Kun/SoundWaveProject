package groupone.soundwaveproject.catalog.controller;

import groupone.soundwaveproject.catalog.dto.request.CreateGenreRequest;
import groupone.soundwaveproject.catalog.dto.request.UpdateGenreRequest;
import groupone.soundwaveproject.catalog.dto.request.UpdateGenreStatusRequest;
import groupone.soundwaveproject.catalog.dto.response.AdminGenrePageResponse;
import groupone.soundwaveproject.catalog.dto.response.AdminGenreResponse;
import groupone.soundwaveproject.catalog.service.GenreService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

/**
 * Controller tiếp nhận và xử lý các yêu cầu HTTP quản trị thể loại âm nhạc dành cho Admin.
 * Phân quyền yêu cầu vai trò ADMIN.
 */
@RestController
@RequestMapping("/api/v1/admin/genres")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminGenreController {

    private final GenreService genreService;

    /**
     * Lấy danh sách thể loại có tìm kiếm và phân trang.
     *
     * @param search   Từ khóa tìm kiếm theo tên hoặc slug thể loại
     * @param pageable Thông tin phân trang và sắp xếp (mặc định sắp xếp theo tên tăng dần)
     * @return Phản hồi chứa danh sách phân trang các thể loại
     */
    @GetMapping
    public ResponseEntity<AdminGenrePageResponse> getGenres(
            @RequestParam(required = false) String search,
            @PageableDefault(sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {
        return ResponseEntity.ok(genreService.getGenres(search, pageable));
    }

    /**
     * Lấy thông tin chi tiết một thể loại theo ID.
     *
     * @param id ID của thể loại cần xem
     * @return DTO chi tiết thể loại
     */
    @GetMapping("/{id}")
    public ResponseEntity<AdminGenreResponse> getGenre(@PathVariable Long id) {
        return ResponseEntity.ok(genreService.getGenre(id));
    }

    /**
     * Tạo mới một thể loại âm nhạc.
     *
     * @param request   Dữ liệu tạo thể loại bao gồm tên, slug và mô tả
     * @param principal Thông tin tài khoản Admin đang thực hiện thao tác
     * @return DTO thể loại vừa được tạo thành công kèm mã trạng thái 201 Created
     */
    @PostMapping
    public ResponseEntity<AdminGenreResponse> createGenre(
            @Valid @RequestBody CreateGenreRequest request,
            Principal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(genreService.createGenre(request, principal.getName()));
    }

    /**
     * Cập nhật thông tin thể loại âm nhạc.
     *
     * @param id      ID của thể loại cần cập nhật
     * @param request Dữ liệu cập nhật mới
     * @return DTO thể loại sau khi cập nhật thành công
     */
    @PutMapping("/{id}")
    public ResponseEntity<AdminGenreResponse> updateGenre(
            @PathVariable Long id,
            @Valid @RequestBody UpdateGenreRequest request) {
        return ResponseEntity.ok(genreService.updateGenre(id, request));
    }

    /**
     * Thay đổi trạng thái kích hoạt hoặc vô hiệu hóa của một thể loại.
     *
     * @param id      ID của thể loại cần đổi trạng thái
     * @param request DTO chứa trạng thái kích hoạt mới
     * @return DTO thể loại với trạng thái đã được cập nhật
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<AdminGenreResponse> updateGenreStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateGenreStatusRequest request) {
        return ResponseEntity.ok(genreService.updateActiveState(id, request.active()));
    }
}
