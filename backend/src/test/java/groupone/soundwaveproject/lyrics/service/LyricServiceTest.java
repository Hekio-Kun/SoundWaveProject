package groupone.soundwaveproject.lyrics.service;

import groupone.soundwaveproject.authentication.entity.User;
import groupone.soundwaveproject.authentication.repository.UserRepository;
import groupone.soundwaveproject.catalog.entity.Genre;
import groupone.soundwaveproject.catalog.entity.Track;
import groupone.soundwaveproject.catalog.entity.TrackPublicationStatus;
import groupone.soundwaveproject.catalog.repository.TrackRepository;
import groupone.soundwaveproject.exception.BadRequestOperationException;
import groupone.soundwaveproject.exception.ResourceNotFoundException;
import groupone.soundwaveproject.lyrics.dto.request.SavePersonalLyricRequest;
import groupone.soundwaveproject.lyrics.dto.response.LyricDetailResponse;
import groupone.soundwaveproject.lyrics.dto.response.TrackLyricsBundleResponse;
import groupone.soundwaveproject.lyrics.entity.OfficialLyric;
import groupone.soundwaveproject.lyrics.entity.PersonalLyric;
import groupone.soundwaveproject.lyrics.repository.OfficialLyricRepository;
import groupone.soundwaveproject.lyrics.repository.PersonalLyricRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LyricServiceTest {

    @Mock private OfficialLyricRepository officialLyricRepository;
    @Mock private PersonalLyricRepository personalLyricRepository;
    @Mock private TrackRepository trackRepository;
    @Mock private UserRepository userRepository;

    private LyricService lyricService;

    @BeforeEach
    void setUp() {
        lyricService = new LyricService(
                officialLyricRepository,
                personalLyricRepository,
                trackRepository,
                userRepository
        );
    }

    private Track createTrack(Long id, String title) {
        Genre genre = new Genre("Pop", "pop", "Pop music", 1L);
        ReflectionTestUtils.setField(genre, "id", 10L);
        Track track = new Track(
                100L,
                genre,
                null,
                title,
                "title-slug",
                "Description",
                "pub_1",
                "https://example.com/audio.mp3",
                "mp3",
                180000,
                "cover_1",
                "https://example.com/cover.jpg",
                TrackPublicationStatus.PUBLISHED
        );
        ReflectionTestUtils.setField(track, "id", id);
        return track;
    }

    private User createUser(Long id, String email) {
        User user = new User(email, "hashed_password");
        ReflectionTestUtils.setField(user, "id", id);
        return user;
    }

    @Test
    @DisplayName("getTrackLyrics - throws ResourceNotFoundException if track not found")
    void getTrackLyrics_TrackNotFound() {
        when(trackRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                lyricService.getTrackLyrics(999L, null)
        );
    }

    @Test
    @DisplayName("getTrackLyrics - unauthenticated returns official lyrics if published")
    void getTrackLyrics_Unauthenticated_PublishedOfficial() {
        Track track = createTrack(1L, "Ocean Waves");
        when(trackRepository.findById(1L)).thenReturn(Optional.of(track));

        OfficialLyric official = OfficialLyric.builder()
                .id(10L)
                .track(track)
                .lyricContent("[00:01.00]Hello sea")
                .status("PUBLISHED")
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
        when(officialLyricRepository.findByTrackIdAndStatus(1L, "PUBLISHED"))
                .thenReturn(Optional.of(official));

        TrackLyricsBundleResponse response = lyricService.getTrackLyrics(1L, null);

        assertNotNull(response);
        assertNotNull(response.officialLyric());
        assertEquals("[00:01.00]Hello sea", response.officialLyric().lyricContent());
        assertTrue(response.officialLyric().isOfficial());
        assertNull(response.userPersonalLyric());
    }

    @Test
    @DisplayName("getTrackLyrics - authenticated returns both official and personal lyrics")
    void getTrackLyrics_Authenticated_BothLyrics() {
        Track track = createTrack(1L, "Ocean Waves");
        User user = createUser(5L, "listener@example.com");

        when(trackRepository.findById(1L)).thenReturn(Optional.of(track));
        when(userRepository.findByEmailIgnoreCase("listener@example.com")).thenReturn(Optional.of(user));

        OfficialLyric official = OfficialLyric.builder()
                .id(10L)
                .track(track)
                .lyricContent("Official lyrics")
                .status("PUBLISHED")
                .build();
        when(officialLyricRepository.findByTrackIdAndStatus(1L, "PUBLISHED"))
                .thenReturn(Optional.of(official));

        PersonalLyric personal = PersonalLyric.builder()
                .id(20L)
                .user(user)
                .track(track)
                .lyricContent("My custom personal lyric")
                .lyricType("CUSTOM")
                .build();
        when(personalLyricRepository.findByUserIdAndTrackIdAndLyricType(5L, 1L, "CUSTOM"))
                .thenReturn(Optional.of(personal));

        TrackLyricsBundleResponse response = lyricService.getTrackLyrics(1L, "listener@example.com");

        assertNotNull(response);
        assertNotNull(response.officialLyric());
        assertNotNull(response.userPersonalLyric());
        assertEquals("My custom personal lyric", response.userPersonalLyric().lyricContent());
    }

    @Test
    @DisplayName("savePersonalLyric - creates or updates personal lyrics")
    void savePersonalLyric_Success() {
        Track track = createTrack(1L, "Ocean Waves");
        User user = createUser(5L, "listener@example.com");

        when(trackRepository.findById(1L)).thenReturn(Optional.of(track));
        when(userRepository.findByEmailIgnoreCase("listener@example.com")).thenReturn(Optional.of(user));
        when(personalLyricRepository.findByUserIdAndTrackIdAndLyricType(5L, 1L, "CUSTOM"))
                .thenReturn(Optional.empty());

        when(personalLyricRepository.save(any(PersonalLyric.class))).thenAnswer(invocation -> {
            PersonalLyric p = invocation.getArgument(0);
            ReflectionTestUtils.setField(p, "id", 101L);
            ReflectionTestUtils.setField(p, "createdAt", Instant.now());
            ReflectionTestUtils.setField(p, "updatedAt", Instant.now());
            return p;
        });

        SavePersonalLyricRequest request = new SavePersonalLyricRequest(
                "CUSTOM",
                "[00:05.00]Custom line"
        );

        LyricDetailResponse response = lyricService.savePersonalLyric("listener@example.com", 1L, request);

        assertNotNull(response);
        assertEquals(101L, response.id());
        assertEquals("[00:05.00]Custom line", response.lyricContent());
        assertEquals("CUSTOM", response.lyricType());
        assertFalse(response.isOfficial());
        verify(personalLyricRepository, times(1)).save(any(PersonalLyric.class));
    }

    @Test
    @DisplayName("deletePersonalLyric - deletes user lyric")
    void deletePersonalLyric_Success() {
        User user = createUser(5L, "listener@example.com");
        when(userRepository.findByEmailIgnoreCase("listener@example.com")).thenReturn(Optional.of(user));

        lyricService.deletePersonalLyric("listener@example.com", 1L, "CUSTOM");

        verify(personalLyricRepository, times(1))
                .deleteByUserIdAndTrackIdAndLyricType(5L, 1L, "CUSTOM");
    }
}
