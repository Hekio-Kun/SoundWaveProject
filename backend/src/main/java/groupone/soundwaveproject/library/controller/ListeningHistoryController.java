package groupone.soundwaveproject.library.controller;

import groupone.soundwaveproject.library.dto.response.ListeningHistoryResponse;
import groupone.soundwaveproject.library.service.ListeningHistoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST Controller cho tính năng Xem lịch sử nghe nhạc (UC-13: View Listening History).
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/library/history")
@PreAuthorize("isAuthenticated()")
public class ListeningHistoryController {

    private final ListeningHistoryService listeningHistoryService;

    public ListeningHistoryController(ListeningHistoryService listeningHistoryService) {
        this.listeningHistoryService = listeningHistoryService;
    }

    /**
     * Lấy danh sách lịch sử nghe nhạc của người dùng hiện tại (có phân trang, sắp xếp mới nhất).
     */
    @GetMapping
    public ResponseEntity<Page<ListeningHistoryResponse>> getMyListeningHistory(
            Authentication authentication,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        log.info("Fetching listening history for user={}, page={}, size={}",
                authentication.getName(), pageable.getPageNumber(), pageable.getPageSize());
        Page<ListeningHistoryResponse> history = listeningHistoryService.getListeningHistory(authentication.getName(), pageable);
        return ResponseEntity.ok(history);
    }

    /**
     * Xóa 1 bản ghi lịch sử nghe nhạc theo ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteHistoryItem(
            @PathVariable Long id,
            Authentication authentication
    ) {
        log.info("User {} requested to delete history item {}", authentication.getName(), id);
        listeningHistoryService.deleteHistoryItem(authentication.getName(), id);
        return ResponseEntity.ok(Map.of("message", "History record deleted successfully."));
    }

    /**
     * Xóa toàn bộ lịch sử nghe nhạc của người dùng hiện tại.
     */
    @DeleteMapping
    public ResponseEntity<Map<String, String>> clearHistory(
            Authentication authentication
    ) {
        log.info("User {} requested to clear all listening history", authentication.getName());
        listeningHistoryService.clearHistory(authentication.getName());
        return ResponseEntity.ok(Map.of("message", "All listening history cleared successfully."));
    }
}
