package groupone.soundwaveproject.lyrics.service;

import groupone.soundwaveproject.authentication.entity.Staff;
import groupone.soundwaveproject.authentication.entity.StaffRole;
import groupone.soundwaveproject.authentication.repository.StaffRepository;
import groupone.soundwaveproject.authentication.repository.UserProfileRepository;
import groupone.soundwaveproject.catalog.entity.Genre;
import groupone.soundwaveproject.catalog.entity.Track;
import groupone.soundwaveproject.catalog.entity.TrackPublicationStatus;
import groupone.soundwaveproject.catalog.repository.TrackRepository;
import groupone.soundwaveproject.lyrics.dto.request.SaveOfficialLyricRequest;
import groupone.soundwaveproject.lyrics.dto.response.LyricDetailResponse;
import groupone.soundwaveproject.lyrics.dto.response.StaffTrackLyricSummaryResponse;
import groupone.soundwaveproject.lyrics.entity.OfficialLyric;
import groupone.soundwaveproject.lyrics.repository.OfficialLyricRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StaffOfficialLyricServiceTest {

    @Mock private OfficialLyricRepository officialLyricRepository;
    @Mock private TrackRepository trackRepository;
    @Mock private StaffRepository staffRepository;
    @Mock private UserProfileRepository profileRepository;

    private StaffOfficialLyricService staffOfficialLyricService;

    @BeforeEach
    void setUp() {
        staffOfficialLyricService = new StaffOfficialLyricService(
                officialLyricRepository,
                trackRepository,
                staffRepository,
                profileRepository
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

    private Staff createStaff(Long id, String email) {
        StaffRole role = new StaffRole("STAFF", "Staff", "Staff role");
        ReflectionTestUtils.setField(role, "id", (short) 1);
        Staff staff = new Staff(role, email, "hash", "Staff Member");
        ReflectionTestUtils.setField(staff, "id", id);
        return staff;
    }

    @Test
    @DisplayName("searchTracksForLyrics - returns page of track summaries with lyric status")
    void searchTracksForLyrics_Success() {
        Track track1 = createTrack(1L, "Song One");
        Track track2 = createTrack(2L, "Song Two");
        Pageable pageable = PageRequest.of(0, 10);
        Page<Track> trackPage = new PageImpl<>(List.of(track1, track2), pageable, 2);

        when(trackRepository.findByPublicationStatus(TrackPublicationStatus.PUBLISHED, pageable)).thenReturn(trackPage);

        OfficialLyric lyric1 = OfficialLyric.builder()
                .id(101L)
                .track(track1)
                .lyricContent("Official 1")
                .status("PUBLISHED")
                .build();
        when(officialLyricRepository.findByTrackIdIn(anyCollection())).thenReturn(List.of(lyric1));

        Page<StaffTrackLyricSummaryResponse> result = staffOfficialLyricService.searchTracksForLyrics(null, null, pageable);

        assertNotNull(result);
        assertEquals(2, result.getContent().size());
        assertTrue(result.getContent().get(0).hasOfficialLyric());
        assertEquals("PUBLISHED", result.getContent().get(0).lyricStatus());
        assertFalse(result.getContent().get(1).hasOfficialLyric());
    }

    @Test
    @DisplayName("saveOrUpdateOfficialLyric - creates new official lyric and syncs with track if PUBLISHED")
    void saveOrUpdateOfficialLyric_CreateNewPublished() {
        Track track = createTrack(1L, "Song One");
        Staff staff = createStaff(10L, "staff@soundwave.com");

        when(staffRepository.findByEmailIgnoreCase("staff@soundwave.com")).thenReturn(Optional.of(staff));
        when(trackRepository.findById(1L)).thenReturn(Optional.of(track));
        when(officialLyricRepository.findByTrackId(1L)).thenReturn(Optional.empty());

        when(officialLyricRepository.save(any(OfficialLyric.class))).thenAnswer(inv -> {
            OfficialLyric l = inv.getArgument(0);
            ReflectionTestUtils.setField(l, "id", 200L);
            ReflectionTestUtils.setField(l, "createdAt", Instant.now());
            ReflectionTestUtils.setField(l, "updatedAt", Instant.now());
            return l;
        });

        SaveOfficialLyricRequest request = new SaveOfficialLyricRequest(
                1L,
                "[00:01.00]Song lyrics",
                "PUBLISHED"
        );

        LyricDetailResponse response = staffOfficialLyricService.saveOrUpdateOfficialLyric("staff@soundwave.com", request);

        assertNotNull(response);
        assertEquals(200L, response.id());
        assertEquals("PUBLISHED", response.status());
        assertEquals("[00:01.00]Song lyrics", track.getLyrics());
        verify(trackRepository, times(1)).save(track);
    }

    @Test
    @DisplayName("updateStatus - updates status between DRAFT and PUBLISHED")
    void updateStatus_Success() {
        Track track = createTrack(1L, "Song One");
        Staff staff = createStaff(10L, "staff@soundwave.com");

        OfficialLyric lyric = OfficialLyric.builder()
                .id(101L)
                .track(track)
                .lyricContent("Song lyrics")
                .status("DRAFT")
                .build();

        when(staffRepository.findByEmailIgnoreCase("staff@soundwave.com")).thenReturn(Optional.of(staff));
        when(officialLyricRepository.findByTrackId(1L)).thenReturn(Optional.of(lyric));
        when(officialLyricRepository.save(any(OfficialLyric.class))).thenReturn(lyric);

        LyricDetailResponse response = staffOfficialLyricService.updateStatus("staff@soundwave.com", 1L, "PUBLISHED");

        assertNotNull(response);
        assertEquals("PUBLISHED", lyric.getStatus());
        assertEquals("Song lyrics", track.getLyrics());
        verify(trackRepository, times(1)).save(track);
    }

    @Test
    @DisplayName("deleteOfficialLyric - deletes lyric and clears track.lyrics")
    void deleteOfficialLyric_Success() {
        Track track = createTrack(1L, "Song One");
        track.setLyrics("Existing lyrics");
        Staff staff = createStaff(10L, "staff@soundwave.com");

        OfficialLyric lyric = OfficialLyric.builder()
                .id(101L)
                .track(track)
                .lyricContent("Song lyrics")
                .status("PUBLISHED")
                .build();

        when(staffRepository.findByEmailIgnoreCase("staff@soundwave.com")).thenReturn(Optional.of(staff));
        when(trackRepository.findById(1L)).thenReturn(Optional.of(track));
        when(officialLyricRepository.findByTrackId(1L)).thenReturn(Optional.of(lyric));

        staffOfficialLyricService.deleteOfficialLyric("staff@soundwave.com", 1L);

        verify(officialLyricRepository, times(1)).delete(lyric);
        assertNull(track.getLyrics());
        verify(trackRepository, times(1)).save(track);
    }
}
