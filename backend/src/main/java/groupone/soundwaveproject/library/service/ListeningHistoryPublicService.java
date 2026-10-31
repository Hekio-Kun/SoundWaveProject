package groupone.soundwaveproject.library.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import groupone.soundwaveproject.library.entity.ListeningHistory;
import groupone.soundwaveproject.library.repository.ListeningHistoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ListeningHistoryPublicService {
    private final ListeningHistoryRepository listeningHistoryRepository;

    /**
     * Ghi nhận lịch sử nghe nhạc cho người dùng đã đăng nhập khi đạt ngưỡng phát hợp lệ.
     * Áp dụng cơ chế Upsert (Deduplication): Mỗi bài hát chỉ hiển thị một lần duy nhất cho mỗi user;
     * nếu nghe lại (ví dụ chế độ repeat hoặc nghe lại sau đó), cập nhật lại mốc playedAt và thời lượng nghe.
     */
    @Transactional
    public void recordListeningHistory(Long userId, Long trackId, Integer listenedDurationMs, boolean completed) {
        if (userId == null || trackId == null) {
            log.warn("Cannot record listening history with null userId or trackId");
            return;
        }

        List<ListeningHistory> existingRecords = listeningHistoryRepository.findByUserIdAndTrackIdOrderByPlayedAtDesc(userId, trackId);
        if (!existingRecords.isEmpty()) {
            ListeningHistory latest = existingRecords.get(0);
            latest.updatePlayback(listenedDurationMs, completed);
            listeningHistoryRepository.save(latest);

            // Dọn dẹp các bản ghi trùng lặp cũ (nếu có trước đây) để đảm bảo mỗi bài xuất hiện duy nhất 1 lần
            if (existingRecords.size() > 1) {
                listeningHistoryRepository.deleteAll(existingRecords.subList(1, existingRecords.size()));
            }

            log.info("Updated existing listening history (deduplicated) for userId={}, trackId={}, durationMs={}, completed={}",
                    userId, trackId, listenedDurationMs, completed);
        } else {
            ListeningHistory history = new ListeningHistory(
                    userId,
                    trackId,
                    listenedDurationMs != null ? listenedDurationMs : 0,
                    completed
            );
            listeningHistoryRepository.save(history);
            log.info("Recorded new listening history for userId={}, trackId={}, durationMs={}, completed={}",
                    userId, trackId, listenedDurationMs, completed);
        }
    }

    /**
     * Lấy danh sách ID các bài hát người dùng đã nghe gần đây nhất (hỗ trợ đề xuất âm nhạc theo sở thích cá nhân).
     *
     * @param userId ID người dùng.
     * @param limit Số lượng bản ghi tối đa cần lấy.
     * @return Danh sách trackId đã nghe.
     */
    @Transactional(readOnly = true)
    public List<Long> getRecentListenedTrackIds(Long userId, int limit) {
        if (userId == null) {
            return List.of();
        }
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(0, Math.max(1, limit));
        return listeningHistoryRepository.findByUserIdOrderByPlayedAtDesc(userId, pageable).stream()
                .map(ListeningHistory::getTrackId)
                .toList();
    }
}

