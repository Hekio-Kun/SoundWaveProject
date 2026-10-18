package groupone.soundwaveproject.library.service;

import groupone.soundwaveproject.library.entity.ListeningHistory;
import groupone.soundwaveproject.library.repository.ListeningHistoryRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ListeningHistoryPublicServiceTest {

    @Mock
    private ListeningHistoryRepository listeningHistoryRepository;

    @InjectMocks
    private ListeningHistoryPublicService listeningHistoryPublicService;

    private final Long userId = 10L;
    private final Long trackId = 100L;

    @Test
    @DisplayName("recordListeningHistory should insert new record when track has not been listened before")
    void recordListeningHistory_FirstTime_InsertsNewRecord() {
        when(listeningHistoryRepository.findByUserIdAndTrackIdOrderByPlayedAtDesc(userId, trackId))
                .thenReturn(Collections.emptyList());

        listeningHistoryPublicService.recordListeningHistory(userId, trackId, 45000, true);

        ArgumentCaptor<ListeningHistory> captor = ArgumentCaptor.forClass(ListeningHistory.class);
        verify(listeningHistoryRepository).save(captor.capture());

        ListeningHistory saved = captor.getValue();
        assertThat(saved.getUserId()).isEqualTo(userId);
        assertThat(saved.getTrackId()).isEqualTo(trackId);
        assertThat(saved.getListenedDurationMs()).isEqualTo(45000);
        assertThat(saved.getCompleted()).isTrue();
    }

    @Test
    @DisplayName("recordListeningHistory should update existing record (deduplicated) when track is listened again")
    void recordListeningHistory_RepeatPlay_UpdatesExistingRecord() {
        ListeningHistory existing = new ListeningHistory(userId, trackId, 30000, false);
        LocalDateTime oldPlayedAt = LocalDateTime.now(ZoneOffset.UTC).minusHours(2);
        ReflectionTestUtils.setField(existing, "id", 1L);
        ReflectionTestUtils.setField(existing, "playedAt", oldPlayedAt);

        when(listeningHistoryRepository.findByUserIdAndTrackIdOrderByPlayedAtDesc(userId, trackId))
                .thenReturn(List.of(existing));

        listeningHistoryPublicService.recordListeningHistory(userId, trackId, 60000, true);

        verify(listeningHistoryRepository).save(existing);
        assertThat(existing.getListenedDurationMs()).isEqualTo(60000);
        assertThat(existing.getCompleted()).isTrue();
        assertThat(existing.getPlayedAt()).isAfter(oldPlayedAt);
        verify(listeningHistoryRepository, never()).deleteAll(any());
    }

    @Test
    @DisplayName("recordListeningHistory should clean up older duplicate records if multiple exist")
    void recordListeningHistory_MultipleDuplicates_CleansUpOlderDuplicates() {
        ListeningHistory latest = new ListeningHistory(userId, trackId, 30000, false);
        ReflectionTestUtils.setField(latest, "id", 2L);
        ReflectionTestUtils.setField(latest, "playedAt", LocalDateTime.now(ZoneOffset.UTC).minusMinutes(10));

        ListeningHistory older = new ListeningHistory(userId, trackId, 30000, false);
        ReflectionTestUtils.setField(older, "id", 1L);
        ReflectionTestUtils.setField(older, "playedAt", LocalDateTime.now(ZoneOffset.UTC).minusDays(1));

        when(listeningHistoryRepository.findByUserIdAndTrackIdOrderByPlayedAtDesc(userId, trackId))
                .thenReturn(List.of(latest, older));

        listeningHistoryPublicService.recordListeningHistory(userId, trackId, 50000, true);

        verify(listeningHistoryRepository).save(latest);
        verify(listeningHistoryRepository).deleteAll(List.of(older));
    }

    @Test
    @DisplayName("recordListeningHistory should ignore null userId or trackId")
    void recordListeningHistory_NullInputs_NoOp() {
        listeningHistoryPublicService.recordListeningHistory(null, trackId, 30000, true);
        listeningHistoryPublicService.recordListeningHistory(userId, null, 30000, true);

        verifyNoInteractions(listeningHistoryRepository);
    }
}
