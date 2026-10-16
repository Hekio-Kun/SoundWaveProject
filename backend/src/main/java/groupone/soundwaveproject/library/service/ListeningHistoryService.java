package groupone.soundwaveproject.library.service;

import groupone.soundwaveproject.authentication.dto.response.UserProfileSummary;
import groupone.soundwaveproject.authentication.service.UserAccountPublicService;
import groupone.soundwaveproject.catalog.entity.Track;
import groupone.soundwaveproject.exception.ResourceNotFoundException;
import groupone.soundwaveproject.library.dto.response.ListeningHistoryResponse;
import groupone.soundwaveproject.library.entity.ListeningHistory;
import groupone.soundwaveproject.library.repository.ListeningHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service xử lý nghiệp vụ Lịch sử nghe nhạc (UC-13: View Listening History).
 */
@Slf4j
@Service
public class ListeningHistoryService {

    private final ListeningHistoryRepository listeningHistoryRepository;
    private final UserAccountPublicService userAccountPublicService;

    public ListeningHistoryService(ListeningHistoryRepository listeningHistoryRepository,
                                  UserAccountPublicService userAccountPublicService) {
        this.listeningHistoryRepository = listeningHistoryRepository;
        this.userAccountPublicService = userAccountPublicService;
    }

    /**
     * Lấy danh sách lịch sử nghe nhạc của người dùng hiện tại có phân trang.
     * Chỉ trả về các bản ghi liên kết với bài hát đang ở trạng thái PUBLISHED.
     */
    @Transactional(readOnly = true)
    public Page<ListeningHistoryResponse> getListeningHistory(String currentUserEmail, Pageable pageable) {
        Long userId = userAccountPublicService.getUserIdByEmail(currentUserEmail);
        Page<ListeningHistory> historyPage = listeningHistoryRepository.findPublishedHistoryByUserId(userId, pageable);

        // Thu thập các uploaderUserId để resolve tên nghệ sĩ theo batch, tránh N+1 calls
        Set<Long> creatorIds = historyPage.getContent().stream()
                .map(ListeningHistory::getTrack)
                .filter(Objects::nonNull)
                .map(Track::getUploaderUserId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<Long, String> creatorNames = creatorIds.stream()
                .collect(Collectors.toMap(
                        id -> id,
                        id -> userAccountPublicService.findUserSummaryById(id)
                                .map(u -> (u.displayName() != null && !u.displayName().isBlank()) ? u.displayName() : u.email())
                                .filter(name -> name != null && !name.isBlank())
                                .orElse("Unknown Artist")
                ));

        return historyPage.map(lh -> {
            Track track = lh.getTrack();
            String artistName = track != null && track.getUploaderUserId() != null
                    ? creatorNames.getOrDefault(track.getUploaderUserId(), "Unknown Artist")
                    : "Unknown Artist";

            return new ListeningHistoryResponse(
                    lh.getId(),
                    lh.getTrackId(),
                    track != null ? track.getTitle() : "Unknown Title",
                    track != null ? track.getSlug() : "",
                    artistName,
                    track != null ? track.getDurationMs() : 0,
                    track != null ? track.getCoverUrl() : null,
                    track != null ? track.getAudioUrl() : null,
                    lh.getPlayedAt() != null ? lh.getPlayedAt().toInstant(ZoneOffset.UTC) : Instant.now(),
                    lh.getListenedDurationMs(),
                    lh.getCompleted()
            );
        });
    }

    /**
     * Xóa 1 bản ghi lịch sử cụ thể của người dùng.
     */
    @Transactional
    public void deleteHistoryItem(String currentUserEmail, Long historyId) {
        Long userId = userAccountPublicService.getUserIdByEmail(currentUserEmail);
        int deletedCount = listeningHistoryRepository.deleteByIdAndUserId(historyId, userId);
        if (deletedCount == 0) {
            throw new ResourceNotFoundException("HISTORY_NOT_FOUND", "History record was not found or does not belong to you.");
        }
        log.info("Deleted listening history item id={} for userId={}", historyId, userId);
    }

    /**
     * Xóa toàn bộ lịch sử nghe nhạc của người dùng.
     */
    @Transactional
    public void clearHistory(String currentUserEmail) {
        Long userId = userAccountPublicService.getUserIdByEmail(currentUserEmail);
        listeningHistoryRepository.deleteByUserId(userId);
        log.info("Cleared all listening history for userId={}", userId);
    }
}
