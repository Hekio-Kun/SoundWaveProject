package groupone.soundwaveproject.catalog.controller;

import groupone.soundwaveproject.catalog.dto.response.GenreResponse;
import groupone.soundwaveproject.catalog.service.GenreService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Controller cung cấp API lấy danh mục thể loại công khai (UC-8 Phase 1).
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/genres")
@RequiredArgsConstructor
public class GenreController {

    private final GenreService genreService;

    /**
     * Endpoint lấy toàn bộ thể loại đang kích hoạt phục vụ bộ lọc danh mục bài hát.
     */
    @GetMapping
    public ResponseEntity<List<GenreResponse>> getActiveGenres() {
        log.info("Public API request: GET /api/v1/genres");
        List<GenreResponse> genres = genreService.getActiveGenres();
        return ResponseEntity.ok(genres);
    }
}
