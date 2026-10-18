package groupone.soundwaveproject.catalog.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import groupone.soundwaveproject.catalog.dto.response.PublicAlbumDetailsResponse;
import groupone.soundwaveproject.catalog.dto.response.PublicAlbumResponse;
import groupone.soundwaveproject.catalog.service.AlbumCatalogService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller cung cấp API danh mục Album công khai (Public Albums) dành cho người nghe và khách truy cập.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/albums")
@RequiredArgsConstructor
public class AlbumCatalogController {

    private final AlbumCatalogService albumCatalogService;

    /**
     * Lấy danh sách Album đã xuất bản, hỗ trợ tìm kiếm và sắp xếp.
     *
     * @param search   Từ khóa tìm kiếm theo tên album, mô tả hoặc nghệ sĩ.
     * @param sort     Tiêu chí sắp xếp: 'newest' (mặc định), 'title', 'tracks', 'oldest'.
     * @param pageable Cấu hình phân trang (mặc định 20 album/trang).
     * @return Trang danh sách {@link PublicAlbumResponse}.
     */
    @GetMapping
    public ResponseEntity<Page<PublicAlbumResponse>> getAlbums(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String sort,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        log.info("Fetching public album catalog: search={}, sort={}, page={}", search, sort, pageable.getPageNumber());
        return ResponseEntity.ok(albumCatalogService.getPublishedAlbums(search, sort, pageable));
    }

    /**
     * Lấy chi tiết thông tin một Album công khai theo ID hoặc slug kèm toàn bộ bài hát cấu thành.
     *
     * @param idOrSlug Mã định danh (ID số) hoặc slug của Album.
     * @return Chi tiết {@link PublicAlbumDetailsResponse}.
     */
    @GetMapping("/{idOrSlug}")
    public ResponseEntity<PublicAlbumDetailsResponse> getAlbum(@PathVariable String idOrSlug) {
        log.info("Fetching public album details for identifier: {}", idOrSlug);
        return ResponseEntity.ok(albumCatalogService.getPublishedAlbumByIdOrSlug(idOrSlug));
    }
}
