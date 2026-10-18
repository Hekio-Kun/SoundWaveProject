package groupone.soundwaveproject.library.service;

import groupone.soundwaveproject.authentication.dto.response.UserProfileSummary;
import groupone.soundwaveproject.authentication.service.UserAccountPublicService;
import groupone.soundwaveproject.catalog.entity.Track;
import groupone.soundwaveproject.exception.ResourceNotFoundException;
import groupone.soundwaveproject.library.dto.response.ListeningHistoryResponse;
import groupone.soundwaveproject.library.entity.ListeningHistory;
import groupone.soundwaveproject.library.repository.ListeningHistoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ListeningHistoryServiceTest {

    @Mock
    private ListeningHistoryRepository listeningHistoryRepository;

    @Mock
    private UserAccountPublicService userAccountPublicService;

    @InjectMocks
    private ListeningHistoryService listeningHistoryService;

    private final String userEmail = "listener@soundwave.com";
    private final Long userId = 10L;

    @BeforeEach
    void setUp() {
        lenient().when(userAccountPublicService.getUserIdByEmail(userEmail)).thenReturn(userId);
    }

    @Test
    @DisplayName("getListeningHistory should return paginated mapped history records")
    void getListeningHistory_Success() {
        Track track = Track.builder()
                .title("Ocean Waves")
                .slug("ocean-waves")
                .uploaderUserId(99L)
                .durationMs(210000)
                .coverUrl("https://cloudinary.com/cover.jpg")
                .audioUrl("https://cloudinary.com/audio.mp3")
                .build();
        ReflectionTestUtils.setField(track, "id", 100L);

        ListeningHistory history = new ListeningHistory(userId, 100L, 120000, true);
        ReflectionTestUtils.setField(history, "id", 1L);
        ReflectionTestUtils.setField(history, "track", track);
        ReflectionTestUtils.setField(history, "playedAt", LocalDateTime.now());

        Pageable pageable = PageRequest.of(0, 20);
        Page<ListeningHistory> historyPage = new PageImpl<>(List.of(history), pageable, 1);

        when(listeningHistoryRepository.findPublishedHistoryByUserId(eq(userId), any(Pageable.class)))
                .thenReturn(historyPage);
        when(userAccountPublicService.findUserSummaryById(99L))
                .thenReturn(Optional.of(new UserProfileSummary(99L, "artist@soundwave.com", "Artist One", null, "CREATOR")));

        Page<ListeningHistoryResponse> result = listeningHistoryService.getListeningHistory(userEmail, pageable);

        assertThat(result).isNotNull();
        assertThat(result.getTotalElements()).isEqualTo(1);
        ListeningHistoryResponse item = result.getContent().get(0);
        assertThat(item.id()).isEqualTo(1L);
        assertThat(item.trackId()).isEqualTo(100L);
        assertThat(item.title()).isEqualTo("Ocean Waves");
        assertThat(item.artistName()).isEqualTo("Artist One");
        assertThat(item.completed()).isTrue();
    }

    @Test
    @DisplayName("deleteHistoryItem should successfully delete when item belongs to user")
    void deleteHistoryItem_Success() {
        when(listeningHistoryRepository.deleteByIdAndUserId(1L, userId)).thenReturn(1);

        listeningHistoryService.deleteHistoryItem(userEmail, 1L);

        verify(listeningHistoryRepository).deleteByIdAndUserId(1L, userId);
    }

    @Test
    @DisplayName("deleteHistoryItem should throw ResourceNotFoundException when item does not exist")
    void deleteHistoryItem_NotFound() {
        when(listeningHistoryRepository.deleteByIdAndUserId(999L, userId)).thenReturn(0);

        assertThatThrownBy(() -> listeningHistoryService.deleteHistoryItem(userEmail, 999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("History record was not found");
    }

    @Test
    @DisplayName("clearHistory should delete all history records for the user")
    void clearHistory_Success() {
        listeningHistoryService.clearHistory(userEmail);

        verify(listeningHistoryRepository).deleteByUserId(userId);
    }
}
