package groupone.soundwaveproject.studio.service;

import groupone.soundwaveproject.authentication.entity.Staff;
import groupone.soundwaveproject.authentication.entity.User;
import groupone.soundwaveproject.authentication.entity.UserStatus;
import groupone.soundwaveproject.authentication.repository.StaffRepository;
import groupone.soundwaveproject.authentication.repository.UserRepository;
import groupone.soundwaveproject.catalog.entity.Genre;
import groupone.soundwaveproject.catalog.entity.Track;
import groupone.soundwaveproject.catalog.entity.TrackPublicationStatus;
import groupone.soundwaveproject.catalog.repository.AlbumRepository;
import groupone.soundwaveproject.catalog.repository.GenreRepository;
import groupone.soundwaveproject.catalog.repository.TrackRepository;
import groupone.soundwaveproject.exception.ConflictOperationException;
import groupone.soundwaveproject.exception.ForbiddenOperationException;
import groupone.soundwaveproject.library.repository.ListeningHistoryRepository;
import groupone.soundwaveproject.library.repository.PlaylistTrackRepository;
import groupone.soundwaveproject.media.dto.response.StoredAudioResponse;
import groupone.soundwaveproject.media.service.CloudMediaService;
import groupone.soundwaveproject.moderation.entity.TrackSubmission;
import groupone.soundwaveproject.moderation.repository.TrackSubmissionRepository;
import groupone.soundwaveproject.notification.entity.NotificationType;
import groupone.soundwaveproject.notification.service.NotificationService;
import groupone.soundwaveproject.exception.ResourceNotFoundException;
import groupone.soundwaveproject.moderation.entity.SubmissionStatus;
import groupone.soundwaveproject.studio.dto.request.CreateTrackRequest;
import groupone.soundwaveproject.studio.dto.request.GetRejectionDetailsRequest;
import groupone.soundwaveproject.studio.dto.response.RejectionDetailsResponse;
import groupone.soundwaveproject.studio.dto.request.UpdateTrackRequest;
import groupone.soundwaveproject.studio.dto.response.StudioStatsResponse;
import groupone.soundwaveproject.studio.dto.response.StudioTrackResponse;
import groupone.soundwaveproject.lyrics.repository.OfficialLyricRepository;
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
    private PlaylistTrackRepository playlistTrackRepository;
    @Mock
    private ListeningHistoryRepository listeningHistoryRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private StaffRepository staffRepository;
    @Mock
    private CloudMediaService cloudMediaService;
    @Mock
    private NotificationService notificationService;
    @Mock
    private OfficialLyricRepository officialLyricRepository;
    @Spy
    private StudioTrackMapper studioTrackMapper;

    @InjectMocks
    private StudioTrackService studioTrackService;

    private User activeUser;
    private Genre activeGenre;

    @BeforeEach
    void setUp() {
        activeUser = new User("creator@soundwave.com", "hashed");
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
        when(userRepository.findByEmailIgnoreCase("creator@soundwave.com"))
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

        when(trackRepository.findByUploaderUserIdAndPublicationStatusNotOrderByCreatedAtDesc(10L, TrackPublicationStatus.TAKEN_DOWN))
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
        when(userRepository.findByEmailIgnoreCase("creator@soundwave.com"))
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
                "My New Track", 1L, null, null, "Description", 185000, "[00:10.00]Hello world");

        StudioTrackResponse response = studioTrackService.createDraft(request, audioFile, null, "creator@soundwave.com");

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(101L);
        assertThat(response.title()).isEqualTo("My New Track");
        assertThat(response.status()).isEqualTo("DRAFT");
        assertThat(response.lyrics()).isEqualTo("[00:10.00]Hello world");
        verify(trackRepository).save(any(Track.class));
    }

    @Test
    @DisplayName("createDraft links album and calculates sequential trackNumber (AF01)")
    void createDraft_WithAlbum_Success() {
        when(userRepository.findByEmailIgnoreCase("creator@soundwave.com"))
                .thenReturn(Optional.of(activeUser));
        when(genreRepository.findById(1L)).thenReturn(Optional.of(activeGenre));

        groupone.soundwaveproject.catalog.entity.Album album = groupone.soundwaveproject.catalog.entity.Album.builder()
                .id(50L)
                .createdByUserId(10L)
                .title("Summer Album")
                .slug("summer-album")
                .status("DRAFT")
                .build();
        when(albumRepository.findByIdAndCreatedByUserId(50L, 10L)).thenReturn(Optional.of(album));
        when(trackRepository.countByAlbum_Id(50L)).thenReturn(3L);

        MockMultipartFile audioFile = new MockMultipartFile(
                "audio", "song.mp3", "audio/mpeg", new byte[]{1, 2, 3});
        StoredAudioResponse audioResponse = new StoredAudioResponse(
                "audio-50", "https://cloud.com/album-song.mp3", "mp3", 200000);
        when(cloudMediaService.uploadTrackAudio(audioFile, 10L)).thenReturn(audioResponse);

        when(trackRepository.save(any(Track.class))).thenAnswer(invocation -> {
            Track t = invocation.getArgument(0);
            t.setId(102L);
            return t;
        });

        CreateTrackRequest request = new CreateTrackRequest(
                "Album Track", 1L, 50L, null, "Desc", 200000, null);

        StudioTrackResponse response = studioTrackService.createDraft(request, audioFile, null, "creator@soundwave.com");

        assertThat(response).isNotNull();
        assertThat(response.albumId()).isEqualTo(50L);
        verify(trackRepository).save(argThat(t -> t.getTrackNumber() == 4));
    }

    @Test
    @DisplayName("createDraft purges uploaded Cloudinary media when database persistence fails (EX05)")
    void createDraft_DatabaseFailure_PurgesCloudinaryMedia() {
        when(userRepository.findByEmailIgnoreCase("creator@soundwave.com"))
                .thenReturn(Optional.of(activeUser));
        when(genreRepository.findById(1L)).thenReturn(Optional.of(activeGenre));

        MockMultipartFile audioFile = new MockMultipartFile(
                "audio", "song.mp3", "audio/mpeg", new byte[]{1, 2, 3});
        StoredAudioResponse audioResponse = new StoredAudioResponse(
                "orphan-audio-id", "https://cloud.com/orphan.mp3", "mp3", 150000);
        when(cloudMediaService.uploadTrackAudio(audioFile, 10L)).thenReturn(audioResponse);

        MockMultipartFile coverFile = new MockMultipartFile(
                "cover", "art.jpg", "image/jpeg", new byte[]{4, 5, 6});
        groupone.soundwaveproject.media.dto.response.StoredMediaResponse coverResponse =
                new groupone.soundwaveproject.media.dto.response.StoredMediaResponse(
                        "orphan-cover-id", "https://cloud.com/cover.jpg");
        when(cloudMediaService.uploadTrackCover(coverFile, 10L)).thenReturn(coverResponse);

        when(trackRepository.save(any(Track.class))).thenThrow(new RuntimeException("DB Connection Timeout"));

        CreateTrackRequest request = new CreateTrackRequest(
                "Orphan Track", 1L, null, null, null, 150000, null);

        assertThatThrownBy(() -> studioTrackService.createDraft(request, audioFile, coverFile, "creator@soundwave.com"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("DB Connection Timeout");

        verify(cloudMediaService).deleteTrackAudioQuietly("orphan-audio-id");
        verify(cloudMediaService).deleteImageQuietly("orphan-cover-id");
    }

    @Test
    @DisplayName("createDraft fails and prevents database persistence when Cloudinary is unavailable (EX04)")
    void createDraft_CloudStorageFailure_ThrowsException() {
        when(userRepository.findByEmailIgnoreCase("creator@soundwave.com"))
                .thenReturn(Optional.of(activeUser));
        when(genreRepository.findById(1L)).thenReturn(Optional.of(activeGenre));

        MockMultipartFile audioFile = new MockMultipartFile(
                "audio", "song.mp3", "audio/mpeg", new byte[]{1, 2, 3});
        when(cloudMediaService.uploadTrackAudio(audioFile, 10L))
                .thenThrow(new groupone.soundwaveproject.media.exception.CloudStorageUnavailableException());

        CreateTrackRequest request = new CreateTrackRequest(
                "Failing Track", 1L, null, null, null, 150000, null);

        assertThatThrownBy(() -> studioTrackService.createDraft(request, audioFile, null, "creator@soundwave.com"))
                .isInstanceOf(groupone.soundwaveproject.media.exception.CloudStorageUnavailableException.class)
                .hasMessageContaining("Failed to upload media to cloud storage");

        verify(trackRepository, never()).save(any(Track.class));
    }

    @Test
    @DisplayName("updateTrack throws ForbiddenOperationException when track is PENDING")
    void updateTrack_ThrowsWhenPending() {
        when(userRepository.findByEmailIgnoreCase("creator@soundwave.com"))
                .thenReturn(Optional.of(activeUser));

        Track pendingTrack = Track.builder()
                .id(200L)
                .uploaderUserId(10L)
                .genre(activeGenre)
                .title("Pending Song")
                .publicationStatus(TrackPublicationStatus.PENDING)
                .audioPublicId("audio-pending")
                .build();
        when(trackRepository.findByIdAndUploaderUserId(200L, 10L))
                .thenReturn(Optional.of(pendingTrack));

        UpdateTrackRequest request = new UpdateTrackRequest(
                "New Title", 1L, null, null, null, null, null);

        assertThatThrownBy(() -> studioTrackService.updateTrack(200L, request, null, null, "creator@soundwave.com"))
                .isInstanceOf(ForbiddenOperationException.class)
                .hasMessageContaining("Tracks currently pending review cannot be modified");
    }

    @Test
    @DisplayName("updateTrack transitions PUBLISHED track to PENDING, creates submission, and notifies staff (UC-19.3 POST-4)")
    void updateTrack_SuccessWhenPublished() {
        when(userRepository.findByEmailIgnoreCase("creator@soundwave.com"))
                .thenReturn(Optional.of(activeUser));

        Track publishedTrack = Track.builder()
                .id(200L)
                .uploaderUserId(10L)
                .genre(activeGenre)
                .title("Published Song")
                .slug("published-song-old")
                .publicationStatus(TrackPublicationStatus.PUBLISHED)
                .audioPublicId("audio-pub")
                .audioUrl("https://cloudinary.com/audio-pub.mp3")
                .build();
        when(trackRepository.findByIdAndUploaderUserId(200L, 10L))
                .thenReturn(Optional.of(publishedTrack));
        when(genreRepository.findById(1L)).thenReturn(Optional.of(activeGenre));
        when(trackRepository.save(any(Track.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(trackSubmissionRepository.save(any(TrackSubmission.class))).thenAnswer(invocation -> {
            TrackSubmission sub = invocation.getArgument(0);
            org.springframework.test.util.ReflectionTestUtils.setField(sub, "id", 999L);
            return sub;
        });
        Staff mockStaff = org.mockito.Mockito.mock(Staff.class);
        when(mockStaff.getId()).thenReturn(1L);
        when(staffRepository.findAll()).thenReturn(List.of(mockStaff));

        UpdateTrackRequest request = new UpdateTrackRequest(
                "Updated Published Title", 1L, null, null, "Updated description", null, null, false, "Updated artwork and lyrics");

        StudioTrackResponse response = studioTrackService.updateTrack(200L, request, null, null, "creator@soundwave.com");

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(200L);
        assertThat(response.title()).isEqualTo("Updated Published Title");
        // [FEATURE]: UC-19.3 POST-4 - Bài hát PUBLISHED chuyển sang PENDING để kiểm duyệt lại
        assertThat(response.status()).isEqualTo("PENDING");
        assertThat(publishedTrack.getPublicationStatus()).isEqualTo(TrackPublicationStatus.PENDING);
        verify(trackRepository).save(publishedTrack);
        verify(trackSubmissionRepository).save(any(TrackSubmission.class));
        verify(notificationService).createStaffNotification(
                eq(1L),
                eq(10L),
                eq(NotificationType.TRACK_SUBMISSION),
                eq("Track re-moderation required"),
                contains("Updated Published Title"),
                eq("SUBMISSION"),
                eq("999")
        );
    }

    @Test
    @DisplayName("updateTrack with resubmit on REJECTED track transitions to PENDING and notifies staff (UC-19.3 AF02)")
    void updateTrack_SuccessWhenRejectedAndResubmitted() {
        when(userRepository.findByEmailIgnoreCase("creator@soundwave.com"))
                .thenReturn(Optional.of(activeUser));

        Track rejectedTrack = Track.builder()
                .id(205L)
                .uploaderUserId(10L)
                .genre(activeGenre)
                .title("Rejected Song")
                .slug("rejected-song-old")
                .publicationStatus(TrackPublicationStatus.REJECTED)
                .audioPublicId("audio-rej")
                .audioUrl("https://cloudinary.com/audio-rej.mp3")
                .build();
        when(trackRepository.findByIdAndUploaderUserId(205L, 10L))
                .thenReturn(Optional.of(rejectedTrack));
        when(genreRepository.findById(1L)).thenReturn(Optional.of(activeGenre));
        when(trackRepository.save(any(Track.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(trackSubmissionRepository.save(any(TrackSubmission.class))).thenAnswer(invocation -> {
            TrackSubmission sub = invocation.getArgument(0);
            org.springframework.test.util.ReflectionTestUtils.setField(sub, "id", 1000L);
            return sub;
        });
        Staff mockStaff = org.mockito.Mockito.mock(Staff.class);
        when(mockStaff.getId()).thenReturn(2L);
        when(staffRepository.findAll()).thenReturn(List.of(mockStaff));

        UpdateTrackRequest request = new UpdateTrackRequest(
                "Fixed Rejected Song", 1L, null, null, "Fixed issues", null, null, true, "Fixed copyright notice");

        StudioTrackResponse response = studioTrackService.updateTrack(205L, request, null, null, "creator@soundwave.com");

        assertThat(response).isNotNull();
        assertThat(response.status()).isEqualTo("PENDING");
        assertThat(rejectedTrack.getPublicationStatus()).isEqualTo(TrackPublicationStatus.PENDING);
        verify(trackRepository).save(rejectedTrack);
        verify(trackSubmissionRepository).save(any(TrackSubmission.class));
        verify(notificationService).createStaffNotification(
                eq(2L),
                eq(10L),
                eq(NotificationType.TRACK_SUBMISSION),
                eq("New submission for review"),
                contains("Fixed Rejected Song"),
                eq("SUBMISSION"),
                eq("1000")
        );
    }


    @Test
    @DisplayName("deleteTrack successfully removes draft and purges Cloudinary media")
    void deleteTrack_Success() {
        when(userRepository.findByEmailIgnoreCase("creator@soundwave.com"))
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
    @DisplayName("deleteTrack applies soft delete (TAKEN_DOWN) to PUBLISHED tracks, purges Cloudinary media, and preserves history (POST-1, POST-3)")
    void deleteTrack_PublishedSoftDeleteSuccess() {
        when(userRepository.findByEmailIgnoreCase("creator@soundwave.com"))
                .thenReturn(Optional.of(activeUser));

        Track publishedTrack = Track.builder()
                .id(301L)
                .uploaderUserId(10L)
                .genre(activeGenre)
                .title("Published Song")
                .publicationStatus(TrackPublicationStatus.PUBLISHED)
                .audioPublicId("audio-pub-id")
                .audioUrl("https://cloudinary.com/audio-pub.mp3")
                .coverPublicId("cover-pub-id")
                .coverUrl("https://cloudinary.com/cover-pub.jpg")
                .build();
        when(trackRepository.findByIdAndUploaderUserId(301L, 10L))
                .thenReturn(Optional.of(publishedTrack));

        studioTrackService.deleteTrack(301L, "creator@soundwave.com");

        // [FEATURE]: POST-1 & EX03 - Xóa media trên Cloudinary
        verify(cloudMediaService).deleteTrackAudioQuietly("audio-pub-id");
        verify(cloudMediaService).deleteImageQuietly("cover-pub-id");

        // [FEATURE]: POST-3 - Cập nhật trạng thái sang TAKEN_DOWN, xóa URLs, bảo toàn lịch sử nghe & analytics
        assertThat(publishedTrack.getPublicationStatus()).isEqualTo(TrackPublicationStatus.TAKEN_DOWN);
        assertThat(publishedTrack.getAudioUrl()).isNull();
        assertThat(publishedTrack.getAudioPublicId()).isNull();
        assertThat(publishedTrack.getCoverUrl()).isNull();
        assertThat(publishedTrack.getCoverPublicId()).isNull();
        verify(trackRepository).save(publishedTrack);
        verify(trackRepository, org.mockito.Mockito.never()).delete(any(Track.class));
        verify(playlistTrackRepository, org.mockito.Mockito.never()).deleteByTrack_Id(anyLong());
        verify(listeningHistoryRepository, org.mockito.Mockito.never()).deleteByTrackId(anyLong());
        verify(trackSubmissionRepository, org.mockito.Mockito.never()).deleteByTrackId(anyLong());
    }

    @Test
    @DisplayName("deleteTrack downgrades parent album to DRAFT if no other published tracks remain (POST-4, AF02)")
    void deleteTrack_DowngradesAlbumToDraftWhenNoPublishedTracksRemain() {
        when(userRepository.findByEmailIgnoreCase("creator@soundwave.com"))
                .thenReturn(Optional.of(activeUser));

        groupone.soundwaveproject.catalog.entity.Album album = groupone.soundwaveproject.catalog.entity.Album.builder()
                .id(50L)
                .title("Single Track Album")
                .status("PUBLISHED")
                .build();

        Track publishedTrack = Track.builder()
                .id(305L)
                .uploaderUserId(10L)
                .album(album)
                .genre(activeGenre)
                .title("Sole Published Song")
                .publicationStatus(TrackPublicationStatus.PUBLISHED)
                .audioPublicId("audio-sole-id")
                .build();
        when(trackRepository.findByIdAndUploaderUserId(305L, 10L))
                .thenReturn(Optional.of(publishedTrack));
        when(trackRepository.existsByAlbum_IdAndPublicationStatus(50L, TrackPublicationStatus.PUBLISHED))
                .thenReturn(false);

        studioTrackService.deleteTrack(305L, "creator@soundwave.com");

        assertThat(publishedTrack.getPublicationStatus()).isEqualTo(TrackPublicationStatus.TAKEN_DOWN);
        assertThat(album.getStatus()).isEqualTo("DRAFT");
        verify(albumRepository).save(album);
    }

    @Test
    @DisplayName("deleteTrack throws ForbiddenOperationException when track is PENDING")
    void deleteTrack_Pending_ThrowsForbiddenException() {
        when(userRepository.findByEmailIgnoreCase("creator@soundwave.com"))
                .thenReturn(Optional.of(activeUser));

        Track pendingTrack = Track.builder()
                .id(302L)
                .uploaderUserId(10L)
                .genre(activeGenre)
                .title("Pending Song")
                .publicationStatus(TrackPublicationStatus.PENDING)
                .audioPublicId("audio-pending-id")
                .build();
        when(trackRepository.findByIdAndUploaderUserId(302L, 10L))
                .thenReturn(Optional.of(pendingTrack));

        org.assertj.core.api.Assertions.assertThatThrownBy(() ->
                studioTrackService.deleteTrack(302L, "creator@soundwave.com")
        ).isInstanceOf(groupone.soundwaveproject.exception.ForbiddenOperationException.class)
         .hasMessageContaining("pending review");
    }


    @Test
    @DisplayName("submitForReview updates status to PENDING and creates submission record")
    void submitForReview_Success() {
        when(userRepository.findByEmailIgnoreCase("creator@soundwave.com"))
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
        when(userRepository.findByEmailIgnoreCase("creator@soundwave.com"))
                .thenReturn(Optional.of(activeUser));

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
    @Test
    @DisplayName("UC-20 NF01 & AF01: getRejectionDetails successfully returns rejection details with submission history")
    void getRejectionDetails_Success_ReturnsRejectionDetailsWithHistory() {
        when(userRepository.findByEmailIgnoreCase("creator@soundwave.com"))
                .thenReturn(Optional.of(activeUser));

        Track rejectedTrack = Track.builder()
                .id(501L)
                .uploaderUserId(10L)
                .title("My Rejected Song")
                .slug("my-rejected-song-501")
                .publicationStatus(TrackPublicationStatus.REJECTED)
                .latestRejectionReason("Explicit lyrics not labeled")
                .audioUrl("https://cloudinary.com/audio.mp3")
                .durationMs(210000)
                .build();

        when(trackRepository.findByIdAndUploaderUserId(501L, 10L))
                .thenReturn(Optional.of(rejectedTrack));

        TrackSubmission subLatest = TrackSubmission.builder()
                .id(1002L)
                .trackId(501L)
                .status(SubmissionStatus.REJECTED)
                .rejectionReason("Explicit lyrics not labeled")
                .reviewerNote("Please add an explicit tag or upload a clean version.")
                .submittedAt(java.time.Instant.now().minusSeconds(3600))
                .reviewedAt(java.time.Instant.now())
                .build();

        TrackSubmission subOld = TrackSubmission.builder()
                .id(1001L)
                .trackId(501L)
                .status(SubmissionStatus.REJECTED)
                .rejectionReason("Audio distorted")
                .reviewerNote("High distortion detected.")
                .submittedAt(java.time.Instant.now().minusSeconds(86400))
                .reviewedAt(java.time.Instant.now().minusSeconds(80000))
                .build();

        when(trackSubmissionRepository.findByTrackIdOrderBySubmittedAtDesc(501L))
                .thenReturn(List.of(subLatest, subOld));

        RejectionDetailsResponse response = studioTrackService.getRejectionDetails(501L, "creator@soundwave.com");

        assertThat(response).isNotNull();
        assertThat(response.trackId()).isEqualTo(501L);
        assertThat(response.trackTitle()).isEqualTo("My Rejected Song");
        assertThat(response.status()).isEqualTo("REJECTED");
        assertThat(response.rejectionReason()).isEqualTo("Explicit lyrics not labeled");
        assertThat(response.reviewerNote()).isEqualTo("Please add an explicit tag or upload a clean version.");
        assertThat(response.history()).hasSize(2);
        assertThat(response.history().get(0).submissionId()).isEqualTo(1002L);
        assertThat(response.history().get(1).submissionId()).isEqualTo(1001L);
    }

    @Test
    @DisplayName("UC-20 Sequence Diagram: getRejectionDetails using GetRejectionDetailsRequest DTO")
    void getRejectionDetails_UsingRequestDto_Success() {
        when(userRepository.findByEmailIgnoreCase("creator@soundwave.com"))
                .thenReturn(Optional.of(activeUser));

        Track rejectedTrack = Track.builder()
                .id(501L)
                .uploaderUserId(10L)
                .title("My Rejected Song")
                .publicationStatus(TrackPublicationStatus.REJECTED)
                .latestRejectionReason("Audio copyright conflict")
                .build();

        when(trackRepository.findByIdAndUploaderUserId(501L, 10L))
                .thenReturn(Optional.of(rejectedTrack));
        when(trackSubmissionRepository.findByTrackIdOrderBySubmittedAtDesc(501L))
                .thenReturn(List.of());

        GetRejectionDetailsRequest request = new GetRejectionDetailsRequest(501L);
        RejectionDetailsResponse response = studioTrackService.getRejectionDetails(request, "creator@soundwave.com");

        assertThat(response).isNotNull();
        assertThat(response.trackId()).isEqualTo(501L);
        assertThat(response.rejectionReason()).isEqualTo("Audio copyright conflict");
    }

    @Test
    @DisplayName("UC-20 EX01: getRejectionDetails assigns fallback reason when rejection reason is null or blank")
    void getRejectionDetails_FallbackReason_WhenBlankOrNull() {
        when(userRepository.findByEmailIgnoreCase("creator@soundwave.com"))
                .thenReturn(Optional.of(activeUser));

        Track trackWithoutReason = Track.builder()
                .id(502L)
                .uploaderUserId(10L)
                .title("Song Without Reason")
                .publicationStatus(TrackPublicationStatus.REJECTED)
                .latestRejectionReason(null)
                .build();

        when(trackRepository.findByIdAndUploaderUserId(502L, 10L))
                .thenReturn(Optional.of(trackWithoutReason));
        when(trackSubmissionRepository.findByTrackIdOrderBySubmittedAtDesc(502L))
                .thenReturn(List.of());

        RejectionDetailsResponse response = studioTrackService.getRejectionDetails(502L, "creator@soundwave.com");

        assertThat(response).isNotNull();
        assertThat(response.rejectionReason()).isEqualTo(StudioTrackMapper.FALLBACK_REJECTION_REASON);
    }

    @Test
    @DisplayName("UC-20 EX02: getRejectionDetails throws ResourceNotFoundException when track not found or access denied")
    void getRejectionDetails_TrackNotFoundOrNotOwned_ThrowsResourceNotFoundException() {
        when(userRepository.findByEmailIgnoreCase("creator@soundwave.com"))
                .thenReturn(Optional.of(activeUser));

        when(trackRepository.findByIdAndUploaderUserId(999L, 10L))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> studioTrackService.getRejectionDetails(999L, "creator@soundwave.com"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Track not found or access denied");
    }
}