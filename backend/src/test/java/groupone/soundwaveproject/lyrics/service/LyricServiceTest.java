package groupone.soundwaveproject.lyrics.service;

import groupone.soundwaveproject.authentication.entity.User;
import groupone.soundwaveproject.authentication.repository.UserRepository;
import groupone.soundwaveproject.catalog.entity.Track;
import groupone.soundwaveproject.catalog.repository.TrackRepository;
import groupone.soundwaveproject.lyrics.dto.response.CustomLyricResponse;
import groupone.soundwaveproject.lyrics.dto.response.TrackLyricsBundleResponse;
import groupone.soundwaveproject.lyrics.entity.OfficialLyric;
import groupone.soundwaveproject.lyrics.entity.PersonalLyric;
import groupone.soundwaveproject.lyrics.repository.OfficialLyricRepository;
import groupone.soundwaveproject.lyrics.repository.PersonalLyricRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LyricServiceTest {

    @Mock
    private OfficialLyricRepository officialLyricRepository;

    @Mock
    private PersonalLyricRepository personalLyricRepository;

    @Mock
    private TrackRepository trackRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private LyricService lyricService;

    private Track testTrack;
    private User testUser;

    @BeforeEach
    void setUp() {
        testTrack = Track.builder()
                .id(100L)
                .title("Ocean Melody")
                .lyrics("Sample track lyrics")
                .build();

        testUser = new User("listener@soundwave.com", "hashed_pwd");
        org.springframework.test.util.ReflectionTestUtils.setField(testUser, "id", 10L);
    }

    @Test
    @DisplayName("saveOrUpdateOfficialLyric: Creates new OfficialLyric when none exists")
    void saveOrUpdateOfficialLyric_createsNew() {
        when(trackRepository.findById(100L)).thenReturn(Optional.of(testTrack));
        when(officialLyricRepository.findByTrackId(100L)).thenReturn(Optional.empty());
        when(officialLyricRepository.save(any(OfficialLyric.class))).thenAnswer(invocation -> {
            OfficialLyric l = invocation.getArgument(0);
            l.setId(1L);
            return l;
        });

        OfficialLyric saved = lyricService.saveOrUpdateOfficialLyric(100L, "[00:12.00] New Official Lyric", "DRAFT", 10L);

        assertThat(saved).isNotNull();
        assertThat(saved.getLyricContent()).isEqualTo("[00:12.00] New Official Lyric");
        assertThat(saved.getStatus()).isEqualTo("DRAFT");
        assertThat(saved.getTrackId()).isEqualTo(100L);
        verify(trackRepository).save(testTrack);
        assertThat(testTrack.getLyrics()).isEqualTo("[00:12.00] New Official Lyric");
    }

    @Test
    @DisplayName("saveOrUpdateOfficialLyric: Updates existing OfficialLyric")
    void saveOrUpdateOfficialLyric_updatesExisting() {
        OfficialLyric existing = OfficialLyric.builder()
                .id(1L)
                .trackId(100L)
                .lyricContent("Old lyrics")
                .status("DRAFT")
                .createdByUserId(10L)
                .createdAt(LocalDateTime.now().minusDays(1))
                .build();

        when(trackRepository.findById(100L)).thenReturn(Optional.of(testTrack));
        when(officialLyricRepository.findByTrackId(100L)).thenReturn(Optional.of(existing));
        when(officialLyricRepository.save(any(OfficialLyric.class))).thenAnswer(invocation -> invocation.getArgument(0));

        OfficialLyric updated = lyricService.saveOrUpdateOfficialLyric(100L, "Updated lyrics", "PUBLISHED", 10L);

        assertThat(updated.getLyricContent()).isEqualTo("Updated lyrics");
        assertThat(updated.getStatus()).isEqualTo("PUBLISHED");
        verify(officialLyricRepository).save(existing);
    }

    @Test
    @DisplayName("saveOrUpdateOfficialLyric: Deletes OfficialLyric when content is blank")
    void saveOrUpdateOfficialLyric_deletesWhenBlank() {
        OfficialLyric existing = OfficialLyric.builder().id(1L).trackId(100L).lyricContent("Some lyrics").build();
        when(trackRepository.findById(100L)).thenReturn(Optional.of(testTrack));
        when(officialLyricRepository.findByTrackId(100L)).thenReturn(Optional.of(existing));

        OfficialLyric result = lyricService.saveOrUpdateOfficialLyric(100L, "   ", "DRAFT", 10L);

        assertThat(result).isNull();
        verify(officialLyricRepository).delete(existing);
        assertThat(testTrack.getLyrics()).isNull();
    }

    @Test
    @DisplayName("getOfficialLyricContent: Returns official lyric if present")
    void getOfficialLyricContent_returnsContent() {
        OfficialLyric existing = OfficialLyric.builder().id(1L).trackId(100L).lyricContent("Official lyrics").build();
        when(officialLyricRepository.findByTrackId(100L)).thenReturn(Optional.of(existing));

        Optional<String> content = lyricService.getOfficialLyricContent(100L);

        assertThat(content).isPresent();
        assertThat(content.get()).isEqualTo("Official lyrics");
    }

    @Test
    @DisplayName("publishOfficialLyric: Updates status to PUBLISHED")
    void publishOfficialLyric_setsStatusPublished() {
        OfficialLyric existing = OfficialLyric.builder().id(1L).trackId(100L).status("DRAFT").build();
        when(officialLyricRepository.findByTrackId(100L)).thenReturn(Optional.of(existing));

        lyricService.publishOfficialLyric(100L);

        assertThat(existing.getStatus()).isEqualTo("PUBLISHED");
        verify(officialLyricRepository).save(existing);
    }

    @Test
    @DisplayName("getSynchronousLyrics: Returns bundle with LRC sync format and personal lyrics")
    void getSynchronousLyrics_success() {
        when(trackRepository.findById(100L)).thenReturn(Optional.of(testTrack));
        OfficialLyric official = OfficialLyric.builder().id(1L).trackId(100L).lyricContent("[00:15.00] First line").build();
        when(officialLyricRepository.findByTrackId(100L)).thenReturn(Optional.of(official));
        when(userRepository.findByEmailIgnoreCase("listener@soundwave.com")).thenReturn(Optional.of(testUser));

        PersonalLyric custom = PersonalLyric.builder()
                .id(5L)
                .userId(10L)
                .trackId(100L)
                .lyricType("CUSTOM")
                .lyricContent("My personal translated lyrics")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        when(personalLyricRepository.findByUserIdAndTrackIdOrderByCreatedAtAsc(10L, 100L)).thenReturn(List.of(custom));

        TrackLyricsBundleResponse bundle = lyricService.getSynchronousLyrics(100L, "listener@soundwave.com");

        assertThat(bundle.trackId()).isEqualTo(100L);
        assertThat(bundle.officialLyrics()).isEqualTo("[00:15.00] First line");
        assertThat(bundle.syncType()).isEqualTo("LRC");
        assertThat(bundle.customLyrics()).hasSize(1);
        assertThat(bundle.customLyrics().get(0).lyricContent()).isEqualTo("My personal translated lyrics");
    }

    @Test
    @DisplayName("saveOrUpdatePersonalLyric: Persists custom lyric for current user")
    void saveOrUpdatePersonalLyric_createsCustomLyric() {
        when(userRepository.findByEmailIgnoreCase("listener@soundwave.com")).thenReturn(Optional.of(testUser));
        when(trackRepository.findById(100L)).thenReturn(Optional.of(testTrack));
        when(personalLyricRepository.findByUserIdAndTrackIdAndLyricType(10L, 100L, "CUSTOM")).thenReturn(Optional.empty());
        when(personalLyricRepository.save(any(PersonalLyric.class))).thenAnswer(invocation -> {
            PersonalLyric pl = invocation.getArgument(0);
            pl.setId(88L);
            return pl;
        });

        CustomLyricResponse response = lyricService.saveOrUpdatePersonalLyric(100L, "CUSTOM", "My custom lyric text", "listener@soundwave.com");

        assertThat(response.id()).isEqualTo(88L);
        assertThat(response.trackId()).isEqualTo(100L);
        assertThat(response.userId()).isEqualTo(10L);
        assertThat(response.lyricContent()).isEqualTo("My custom lyric text");
        assertThat(response.lyricType()).isEqualTo("CUSTOM");
    }

    @Test
    @DisplayName("deletePersonalLyric: Deletes custom lyric")
    void deletePersonalLyric_success() {
        when(userRepository.findByEmailIgnoreCase("listener@soundwave.com")).thenReturn(Optional.of(testUser));

        lyricService.deletePersonalLyric(100L, "listener@soundwave.com", "CUSTOM");

        verify(personalLyricRepository).deleteByUserIdAndTrackIdAndLyricType(10L, 100L, "CUSTOM");
    }
}
