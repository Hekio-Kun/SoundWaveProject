package groupone.soundwaveproject.library.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import groupone.soundwaveproject.library.entity.ListeningHistory;
import groupone.soundwaveproject.library.repository.ListeningHistoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ListeningHistoryPublicService {
    private final ListeningHistoryRepository listeningHistoryRepository;

    /**
     * Ghi nhận lịch sử nghe nhạc cho người dùng đã đăng nhập khi đạt ngưỡng phát hợp lệ.
     */
    @Transactional
    public void recordListeningHistory(Long userId, Long trackId, Integer listenedDurationMs, boolean completed) {
        if (userId == null || trackId == null) {
            log.warn("Cannot record listening history with null userId or trackId");
            return;
        }

        ListeningHistory history = new ListeningHistory(
                userId,
                trackId,
                listenedDurationMs != null ? listenedDurationMs : 0,
                completed
        );
        listeningHistoryRepository.save(history);
        log.info("Recorded listening history for userId={}, trackId={}, durationMs={}, completed={}",
                userId, trackId, listenedDurationMs, completed);
    }
}
