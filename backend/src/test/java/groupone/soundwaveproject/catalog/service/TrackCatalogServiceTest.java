package groupone.soundwaveproject.catalog.service;

import groupone.soundwaveproject.authentication.dto.response.UserProfileSummary;
import groupone.soundwaveproject.authentication.service.UserAccountPublicService;
import groupone.soundwaveproject.catalog.dto.request.RecordPlayRequest;
import groupone.soundwaveproject.catalog.dto.response.RecordPlayResponse;
import groupone.soundwaveproject.catalog.dto.response.TrackResponse;
import groupone.soundwaveproject.catalog.entity.Genre;
import groupone.soundwaveproject.catalog.entity.Track;
import groupone.soundwaveproject.catalog.entity.TrackPublicationStatus;
import groupone.soundwaveproject.catalog.repository.TrackRepository;
import groupone.soundwaveproject.exception.ResourceNotFoundException;
import groupone.soundwaveproject.library.service.ListeningHistoryPublicService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TrackCatalogServiceTest {
    @Mock private TrackRepository trackRepository;
    @Mock private UserAccountPublicService userAccountPublicService;
    @Mock private ListeningHistoryPublicService listeningHistoryPublicService;

    private TrackCatalogService trackCatalogService;

    @BeforeEach
    void setUp() {
        trackCatalogService = new TrackCatalogService(
                trackRepository,
                userAccountPublicService,
                listeningHistoryPublicService
        );
    }

    private Track createMockTrack(Long id, String slug, TrackPublicationStatus status) {
        Genre genre = new Genre("Pop", "pop", "Pop music", 1L);
        ReflectionTestUtils.setField(genre, "id", 10L);

        Track track = new Track(
                100L,
                genre,
                null,
                "Test Song",
                slug,
                "Description",
                "audio_pub_123",
                "https://res.cloudinary.com/demo/video/upload/song.mp3",
                "mp3",
                180000,
                "cover_pub_123",
                "https://res.cloudinary.com/demo/image/upload/cover.jpg",
                status
        );
        ReflectionTestUtils.setField(track, "id", id);
        ReflectionTestUtils.setField(track, "playCountCache", 15L);
        return track;
    }

    @Test
    void getTrackByIdOrSlug_success_whenNumericId() {
        Track track = createMockTrack(1L, "test-song", TrackPublicationStatus.PUBLISHED);
        when(trackRepository.findByIdAndPublicationStatus(1L, TrackPublicationStatus.PUBLISHED))
                .thenReturn(Optional.of(track));
        when(userAccountPublicService.findUserSummaryById(100L))
                .thenReturn(Optional.of(new UserProfileSummary(100L, "creator@test.com", "Minh An", "avatar.jpg", "LISTENER")));

        TrackResponse response = trackCatalogService.getTrackByIdOrSlug("1");

        assertNotNull(response);
        assertEquals(1L, response.id());
        assertEquals("Test Song", response.title());
        assertEquals("https://res.cloudinary.com/demo/video/upload/song.mp3", response.audioUrl());
        assertEquals("Minh An", response.creator().displayName());
        assertEquals(15L, response.playCount());
    }

    @Test
    void getTrackByIdOrSlug_success_whenSlug() {
        Track track = createMockTrack(2L, "chill-vibes", TrackPublicationStatus.PUBLISHED);
        when(trackRepository.findBySlugAndPublicationStatus("chill-vibes", TrackPublicationStatus.PUBLISHED))
                .thenReturn(Optional.of(track));
        when(userAccountPublicService.findUserSummaryById(100L))
                .thenReturn(Optional.empty());

        TrackResponse response = trackCatalogService.getTrackByIdOrSlug("chill-vibes");

        assertNotNull(response);
        assertEquals(2L, response.id());
        assertEquals("Unknown Artist", response.creator().displayName());
    }

    @Test
    void getTrackByIdOrSlug_notFound_throwsResourceNotFoundException() {
        when(trackRepository.findByIdAndPublicationStatus(999L, TrackPublicationStatus.PUBLISHED))
                .thenReturn(Optional.empty());

        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> trackCatalogService.getTrackByIdOrSlug("999")
        );

        assertEquals("TRACK_UNAVAILABLE", exception.getCode());
        assertEquals("Track unavailable", exception.getMessage());
    }

    @Test
    void recordTrackPlay_guest_incrementsPlayCount_withoutListeningHistory() {
        Track track = createMockTrack(1L, "test-song", TrackPublicationStatus.PUBLISHED);
        when(trackRepository.findById(1L)).thenReturn(Optional.of(track));

        RecordPlayRequest request = new RecordPlayRequest(30000, false);
        RecordPlayResponse response = trackCatalogService.recordTrackPlay(1L, request, null);

        assertNotNull(response);
        assertEquals(1L, response.trackId());
        assertEquals(16L, response.playCount());
        assertFalse(response.recordedHistory());

        verify(trackRepository).incrementPlayCount(1L);
        verifyNoInteractions(listeningHistoryPublicService);
    }

    @Test
    void recordTrackPlay_authenticatedListener_incrementsPlayCount_andRecordsListeningHistory() {
        Track track = createMockTrack(1L, "test-song", TrackPublicationStatus.PUBLISHED);
        when(trackRepository.findById(1L)).thenReturn(Optional.of(track));
        when(userAccountPublicService.findUserIdByEmail("listener@test.com")).thenReturn(Optional.of(55L));

        RecordPlayRequest request = new RecordPlayRequest(45000, true);
        RecordPlayResponse response = trackCatalogService.recordTrackPlay(1L, request, "listener@test.com");

        assertNotNull(response);
        assertEquals(1L, response.trackId());
        assertEquals(16L, response.playCount());
        assertTrue(response.recordedHistory());

        verify(trackRepository).incrementPlayCount(1L);
        verify(listeningHistoryPublicService).recordListeningHistory(55L, 1L, 45000, true);
    }

    @Test
    void recordTrackPlay_draftTrack_throwsResourceNotFoundException() {
        Track track = createMockTrack(1L, "draft-song", TrackPublicationStatus.DRAFT);
        when(trackRepository.findById(1L)).thenReturn(Optional.of(track));

        RecordPlayRequest request = new RecordPlayRequest(30000, false);
        assertThrows(
                ResourceNotFoundException.class,
                () -> trackCatalogService.recordTrackPlay(1L, request, null)
        );

        verify(trackRepository, never()).incrementPlayCount(anyLong());
    }
}
