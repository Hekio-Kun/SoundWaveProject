package groupone.soundwaveproject.catalog.service;

import groupone.soundwaveproject.authentication.dto.response.UserProfileSummary;
import groupone.soundwaveproject.authentication.service.UserAccountPublicService;
import groupone.soundwaveproject.catalog.dto.request.RecordPlayRequest;
import groupone.soundwaveproject.catalog.dto.response.RecordPlayResponse;
import groupone.soundwaveproject.catalog.dto.response.TrackResponse;
import groupone.soundwaveproject.catalog.entity.Genre;
import groupone.soundwaveproject.catalog.entity.Track;
import groupone.soundwaveproject.catalog.entity.TrackPublicationStatus;
import groupone.soundwaveproject.catalog.repository.GenreRepository;
import groupone.soundwaveproject.catalog.repository.TrackRepository;
import groupone.soundwaveproject.exception.ResourceNotFoundException;
import groupone.soundwaveproject.library.service.ListeningHistoryPublicService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TrackCatalogServiceTest {
    @Mock private TrackRepository trackRepository;
    @Mock private GenreRepository genreRepository;
    @Mock private UserAccountPublicService userAccountPublicService;
    @Mock private ListeningHistoryPublicService listeningHistoryPublicService;

    private TrackCatalogService trackCatalogService;

    @BeforeEach
    void setUp() {
        trackCatalogService = new TrackCatalogService(
                trackRepository,
                genreRepository,
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

    @Test
    void getRankingBoard_ordersByPlayCountDescAndRecency() {
        Track t1 = createMockTrack(1L, "track-1", TrackPublicationStatus.PUBLISHED);
        ReflectionTestUtils.setField(t1, "playCountCache", 100L);
        ReflectionTestUtils.setField(t1, "createdAt", java.time.LocalDateTime.now().minusDays(5));

        Track t2 = createMockTrack(2L, "track-2", TrackPublicationStatus.PUBLISHED);
        ReflectionTestUtils.setField(t2, "playCountCache", 500L);
        ReflectionTestUtils.setField(t2, "createdAt", java.time.LocalDateTime.now().minusDays(10));

        Track t3 = createMockTrack(3L, "track-3", TrackPublicationStatus.PUBLISHED);
        ReflectionTestUtils.setField(t3, "playCountCache", 100L);
        ReflectionTestUtils.setField(t3, "createdAt", java.time.LocalDateTime.now().minusDays(1)); // Newer than t1 with same playCount

        when(trackRepository.findAll()).thenReturn(java.util.List.of(t1, t2, t3));
        when(userAccountPublicService.findUserSummaryById(anyLong())).thenReturn(Optional.empty());

        java.util.List<TrackResponse> ranking = trackCatalogService.getRankingBoard(null, 10);

        assertEquals(3, ranking.size());
        assertEquals(2L, ranking.get(0).id()); // #1: 500 plays
        assertEquals(3L, ranking.get(1).id()); // #2: 100 plays (newer)
        assertEquals(1L, ranking.get(2).id()); // #3: 100 plays (older)
    }

    @Test
    void getRankingBoard_filtersByGenre() {
        Track t1 = createMockTrack(1L, "track-1", TrackPublicationStatus.PUBLISHED);
        Genre rock = new Genre("Rock", "rock", "Rock music", 1L);
        Track t2 = createMockTrack(2L, "track-2", TrackPublicationStatus.PUBLISHED);
        ReflectionTestUtils.setField(t2, "genre", rock);

        when(genreRepository.findBySlugIgnoreCaseAndIsActiveTrue("rock")).thenReturn(Optional.of(rock));
        when(trackRepository.findAll()).thenReturn(java.util.List.of(t1, t2));
        when(userAccountPublicService.findUserSummaryById(anyLong())).thenReturn(Optional.empty());

        java.util.List<TrackResponse> ranking = trackCatalogService.getRankingBoard("rock", 10);

        assertEquals(1, ranking.size());
        assertEquals(2L, ranking.get(0).id());
    }

    @Test
    void getPublishedTracks_sortByTitleAsc_andDesc() {
        Track t1 = createMockTrack(1L, "track-a", TrackPublicationStatus.PUBLISHED);
        ReflectionTestUtils.setField(t1, "title", "Alpha Song");

        Track t2 = createMockTrack(2L, "track-z", TrackPublicationStatus.PUBLISHED);
        ReflectionTestUtils.setField(t2, "title", "Zeta Song");

        Track t3 = createMockTrack(3L, "track-m", TrackPublicationStatus.PUBLISHED);
        ReflectionTestUtils.setField(t3, "title", "Moonlight");

        when(trackRepository.findAll()).thenReturn(java.util.List.of(t1, t2, t3));
        when(userAccountPublicService.findUserSummaryById(anyLong())).thenReturn(Optional.empty());

        // A - Z
        Page<TrackResponse> ascPage = trackCatalogService.getPublishedTracks(null, null, "title", PageRequest.of(0, 20));
        assertEquals(3, ascPage.getContent().size());
        assertEquals("Alpha Song", ascPage.getContent().get(0).title());
        assertEquals("Moonlight", ascPage.getContent().get(1).title());
        assertEquals("Zeta Song", ascPage.getContent().get(2).title());

        // Z - A (User request: thêm option từ Z đến A)
        Page<TrackResponse> descPage = trackCatalogService.getPublishedTracks(null, null, "title_desc", PageRequest.of(0, 20));
        assertEquals(3, descPage.getContent().size());
        assertEquals("Zeta Song", descPage.getContent().get(0).title());
        assertEquals("Moonlight", descPage.getContent().get(1).title());
        assertEquals("Alpha Song", descPage.getContent().get(2).title());
    }

    @Test
    void getPublishedTracks_pagination_20PerPage() {
        java.util.List<Track> mockList = new java.util.ArrayList<>();
        for (int i = 1; i <= 25; i++) {
            Track t = createMockTrack((long) i, "track-" + i, TrackPublicationStatus.PUBLISHED);
            ReflectionTestUtils.setField(t, "title", "Song " + String.format("%02d", i));
            mockList.add(t);
        }

        when(trackRepository.findAll()).thenReturn(mockList);
        when(userAccountPublicService.findUserSummaryById(anyLong())).thenReturn(Optional.empty());

        // Page 0 (First page, size 20)
        Page<TrackResponse> page1 = trackCatalogService.getPublishedTracks(null, null, "newest", PageRequest.of(0, 20));
        assertEquals(20, page1.getContent().size());
        assertEquals(25, page1.getTotalElements());
        assertEquals(2, page1.getTotalPages());
        assertEquals(0, page1.getNumber());

        // Page 1 (Second page, size 20 -> 5 items remaining)
        Page<TrackResponse> page2 = trackCatalogService.getPublishedTracks(null, null, "newest", PageRequest.of(1, 20));
        assertEquals(5, page2.getContent().size());
        assertEquals(1, page2.getNumber());
    }

    @Test
    void getPublishedTracks_invalidOrInactiveGenre_resetsToAllGenres_EX01() {
        Track t1 = createMockTrack(1L, "track-1", TrackPublicationStatus.PUBLISHED);
        Track t2 = createMockTrack(2L, "track-2", TrackPublicationStatus.PUBLISHED);

        // Given stale or inactive genre slug 'deleted-genre'
        when(genreRepository.findBySlugIgnoreCaseAndIsActiveTrue("deleted-genre")).thenReturn(Optional.empty());
        when(trackRepository.findAll()).thenReturn(java.util.List.of(t1, t2));
        when(userAccountPublicService.findUserSummaryById(anyLong())).thenReturn(Optional.empty());

        // When requesting tracks with stale genre
        Page<TrackResponse> result = trackCatalogService.getPublishedTracks("deleted-genre", null, "newest", PageRequest.of(0, 20));

        // Then fallback to all active tracks (EX01)
        assertEquals(2, result.getTotalElements());
        assertEquals(2, result.getContent().size());
    }
}

