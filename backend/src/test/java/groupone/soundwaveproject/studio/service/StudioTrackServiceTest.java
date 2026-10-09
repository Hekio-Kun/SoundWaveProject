package groupone.soundwaveproject.studio.service;

import groupone.soundwaveproject.authentication.entity.AppUser;
import groupone.soundwaveproject.authentication.entity.Role;
import groupone.soundwaveproject.authentication.entity.UserStatus;
import groupone.soundwaveproject.authentication.repository.AppUserRepository;
import groupone.soundwaveproject.catalog.entity.Genre;
import groupone.soundwaveproject.catalog.entity.Track;
import groupone.soundwaveproject.catalog.entity.TrackPublicationStatus;
import groupone.soundwaveproject.catalog.repository.AlbumRepository;
import groupone.soundwaveproject.catalog.repository.GenreRepository;
import groupone.soundwaveproject.catalog.repository.TrackRepository;
import groupone.soundwaveproject.exception.ConflictOperationException;
import groupone.soundwaveproject.exception.ForbiddenOperationException;
import groupone.soundwaveproject.media.dto.response.StoredAudioResponse;
import groupone.soundwaveproject.media.service.CloudMediaService;
import groupone.soundwaveproject.moderation.entity.TrackSubmission;
import groupone.soundwaveproject.moderation.repository.TrackSubmissionRepository;
import groupone.soundwaveproject.studio.dto.request.CreateTrackRequest;
import groupone.soundwaveproject.studio.dto.request.UpdateTrackRequest;
import groupone.soundwaveproject.studio.dto.response.StudioStatsResponse;
import groupone.soundwaveproject.studio.dto.response.StudioTrackResponse;
import groupone.soundwaveproject.studio.mapper.StudioTrackMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudioTrackServiceTest {

    @Mock
    private TrackRepository trackRepository;
    @Mock
    private GenreRepository genreRepository;
    @Mock
    private AlbumRepository albumRepository;
    @Mock
    private TrackSubmissionRepository trackSubmissionRepository;
    @Mock
    private AppUserRepository appUserRepository;
    @Mock
    private CloudMediaService cloudMediaService;
    @Spy
    private StudioTrackMapper studioTrackMapper;

    @InjectMocks
    private StudioTrackService studioTrackService;

    private AppUser activeUser;
    private Genre activeGenre;

    @BeforeEach
    void setUp() {
        Role role = new Role("LISTENER", "Listener", "Listener account");
        activeUser = new AppUser(role, "creator@soundwave.com", "hashed");
        activeUser.verifyEmail(java.time.LocalDateTime.now());
        org.springframework.test.util.ReflectionTestUtils.setField(activeUser, "id", 10L);

        activeGenre = Genre.builder()
                .id(1L)
                .name("Acoustic")
                .slug("acoustic")
                .isActive(true)
                .build();
    }

    @Test
    @DisplayName("getMyTracks returns list of tracks belonging to active user")
    void getMyTracks_Success() {
        when(appUserRepository.findByEmailIgnoreCase("creator@soundwave.com"))
                .thenReturn(Optional.of(activeUser));

        Track track = Track.builder()
                .id(100L)
                .uploaderUserId(10L)
                .genre(activeGenre)
                .title("Sunny Morning")
                .slug("sunny-morning-123")
                .publicationStatus(TrackPublicationStatus.DRAFT)
                .audioPublicId("audio-123")
                .audioUrl("https://cloudinary.com/audio.mp3")
                .audioFormat("mp3")
                .durationMs(180000)
                .playCountCache(0L)
                .build();

        when(trackRepository.findByUploaderUserIdOrderByCreatedAtDesc(10L))
                .thenReturn(List.of(track));
        when(genreRepository.findById(1L)).thenReturn(Optional.of(activeGenre));
        when(trackSubmissionRepository.findFirstByTrackIdOrderBySubmittedAtDesc(100L)).thenReturn(Optional.empty());

        List<StudioTrackResponse> result = studioTrackService.getMyTracks("creator@soundwave.com", "ALL");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).title()).isEqualTo("Sunny Morning");
        assertThat(result.get(0).status()).isEqualTo("DRAFT");
    }

    @Test
    @DisplayName("createDraft uploads media and persists track in DRAFT status")
    void createDraft_Success() {
        when(appUserRepository.findByEmailIgnoreCase("creator@soundwave.com"))
                .thenReturn(Optional.of(activeUser));
        when(genreRepository.findById(1L)).thenReturn(Optional.of(activeGenre));

        MockMultipartFile audioFile = new MockMultipartFile(
                "audio", "song.mp3", "audio/mpeg", new byte[]{1, 2, 3});
        StoredAudioResponse audioResponse = new StoredAudioResponse(
                "public-audio-id", "https://cloud.com/song.mp3", "mp3", 185000);
        when(cloudMediaService.uploadTrackAudio(audioFile, 10L)).thenReturn(audioResponse);

        when(trackRepository.save(any(Track.class))).thenAnswer(invocation -> {
            Track t = invocation.getArgument(0);
            t.setId(101L);
            return t;
        });

        CreateTrackRequest request = new CreateTrackRequest(
                "My New Track", 1L, null, null, "Description", 185000, null);

        StudioTrackResponse response = studioTrackService.createDraft(request, audioFile, null, "creator@soundwave.com");

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(101L);
        assertThat(response.title()).isEqualTo("My New Track");
        assertThat(response.status()).isEqualTo("DRAFT");
        verify(trackRepository).save(any(Track.class));
    }

    @Test
    @DisplayName("updateTrack throws ForbiddenOperationException when track is PUBLISHED")
    void updateTrack_ThrowsWhenPublished() {
        when(appUserRepository.findByEmailIgnoreCase("creator@soundwave.com"))
                .thenReturn(Optional.of(activeUser));

        Track publishedTrack = Track.builder()
                .id(200L)
                .uploaderUserId(10L)
                .genre(activeGenre)
                .title("Published Song")
                .publicationStatus(TrackPublicationStatus.PUBLISHED)
                .audioPublicId("audio-pub")
                .build();
        when(trackRepository.findByIdAndUploaderUserId(200L, 10L))
                .thenReturn(Optional.of(publishedTrack));

        UpdateTrackRequest request = new UpdateTrackRequest(
                "New Title", 1L, null, null, null, null, null);

        assertThatThrownBy(() -> studioTrackService.updateTrack(200L, request, null, null, "creator@soundwave.com"))
                .isInstanceOf(ForbiddenOperationException.class)
                .hasMessageContaining("Only DRAFT or REJECTED tracks can be modified");
    }

    @Test
    @DisplayName("deleteTrack successfully removes draft and purges Cloudinary media")
    void deleteTrack_Success() {
        when(appUserRepository.findByEmailIgnoreCase("creator@soundwave.com"))
                .thenReturn(Optional.of(activeUser));

        Track draftTrack = Track.builder()
                .id(300L)
                .uploaderUserId(10L)
                .genre(activeGenre)
                .title("Draft Song")
                .publicationStatus(TrackPublicationStatus.DRAFT)
                .audioPublicId("audio-draft-public-id")
                .coverPublicId("cover-draft-public-id")
                .build();
        when(trackRepository.findByIdAndUploaderUserId(300L, 10L))
                .thenReturn(Optional.of(draftTrack));

        studioTrackService.deleteTrack(300L, "creator@soundwave.com");

        verify(trackSubmissionRepository).deleteByTrackId(300L);
        verify(cloudMediaService).deleteTrackAudioQuietly("audio-draft-public-id");
        verify(cloudMediaService).deleteImageQuietly("cover-draft-public-id");
        verify(trackRepository).delete(draftTrack);
    }

    @Test
    @DisplayName("deleteTrack throws ConflictOperationException when track is PUBLISHED")
    void deleteTrack_ThrowsWhenPublished() {
        when(appUserRepository.findByEmailIgnoreCase("creator@soundwave.com"))
                .thenReturn(Optional.of(activeUser));

        Track publishedTrack = Track.builder()
                .id(301L)
                .uploaderUserId(10L)
                .genre(activeGenre)
                .title("Published Song")
                .publicationStatus(TrackPublicationStatus.PUBLISHED)
                .build();
        when(trackRepository.findByIdAndUploaderUserId(301L, 10L))
                .thenReturn(Optional.of(publishedTrack));

        assertThatThrownBy(() -> studioTrackService.deleteTrack(301L, "creator@soundwave.com"))
                .isInstanceOf(ConflictOperationException.class)
                .hasMessageContaining("Cannot delete a published or pending track directly");
    }

    @Test
    @DisplayName("submitForReview updates status to PENDING and creates submission record")
    void submitForReview_Success() {
        when(appUserRepository.findByEmailIgnoreCase("creator@soundwave.com"))
                .thenReturn(Optional.of(activeUser));

        Track draftTrack = Track.builder()
                .id(400L)
                .uploaderUserId(10L)
                .genre(activeGenre)
                .title("Song For Review")
                .publicationStatus(TrackPublicationStatus.DRAFT)
                .audioPublicId("aud-400")
                .audioUrl("url")
                .audioFormat("mp3")
                .durationMs(120000)
                .playCountCache(0L)
                .build();
        when(trackRepository.findByIdAndUploaderUserId(400L, 10L))
                .thenReturn(Optional.of(draftTrack));
        when(genreRepository.findById(1L)).thenReturn(Optional.of(activeGenre));
        when(trackSubmissionRepository.save(any(TrackSubmission.class))).thenAnswer(i -> i.getArgument(0));

        StudioTrackResponse response = studioTrackService.submitForReview(400L, "Please review my song", "creator@soundwave.com");

        assertThat(response.status()).isEqualTo("PENDING");
        assertThat(draftTrack.getPublicationStatus()).isEqualTo(TrackPublicationStatus.PENDING);
        verify(trackSubmissionRepository).save(any(TrackSubmission.class));
    }

    @Test
    @DisplayName("getStats calculates correct count breakdown")
    void getStats_Success() {
        when(appUserRepository.findByEmailIgnoreCase("creator@soundwave.com"))
                .thenReturn(Optional.of(activeUser));

        when(trackRepository.countByUploaderUserId(10L)).thenReturn(5L);
        when(trackRepository.countByUploaderUserIdAndPublicationStatus(10L, TrackPublicationStatus.DRAFT)).thenReturn(2L);
        when(trackRepository.countByUploaderUserIdAndPublicationStatus(10L, TrackPublicationStatus.PENDING)).thenReturn(1L);
        when(trackRepository.countByUploaderUserIdAndPublicationStatus(10L, TrackPublicationStatus.PUBLISHED)).thenReturn(1L);
        when(trackRepository.countByUploaderUserIdAndPublicationStatus(10L, TrackPublicationStatus.REJECTED)).thenReturn(1L);

        StudioStatsResponse stats = studioTrackService.getStats("creator@soundwave.com");

        assertThat(stats.total()).isEqualTo(5);
        assertThat(stats.draft()).isEqualTo(2);
        assertThat(stats.pending()).isEqualTo(1);
        assertThat(stats.approved()).isEqualTo(1);
        assertThat(stats.rejected()).isEqualTo(1);
    }
}
