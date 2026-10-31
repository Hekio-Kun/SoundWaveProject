package groupone.soundwaveproject.moderation.service;

import groupone.soundwaveproject.authentication.entity.Staff;
import groupone.soundwaveproject.authentication.entity.StaffRole;
import groupone.soundwaveproject.authentication.entity.User;
import groupone.soundwaveproject.authentication.repository.StaffRepository;
import groupone.soundwaveproject.authentication.repository.UserProfileRepository;
import groupone.soundwaveproject.authentication.repository.UserRepository;
import groupone.soundwaveproject.catalog.entity.Album;
import groupone.soundwaveproject.catalog.entity.Genre;
import groupone.soundwaveproject.catalog.entity.Track;
import groupone.soundwaveproject.catalog.entity.TrackPublicationStatus;
import groupone.soundwaveproject.catalog.repository.AlbumRepository;
import groupone.soundwaveproject.catalog.repository.TrackRepository;
import groupone.soundwaveproject.moderation.dto.request.ApproveTrackRequest;
import groupone.soundwaveproject.moderation.dto.request.RejectTrackRequest;
import groupone.soundwaveproject.moderation.dto.request.TakeDownTrackRequest;
import groupone.soundwaveproject.moderation.dto.response.SubmissionDetailResponse;
import groupone.soundwaveproject.moderation.entity.SubmissionStatus;
import groupone.soundwaveproject.moderation.entity.TrackSubmission;
import groupone.soundwaveproject.moderation.exception.InvalidSubmissionStateException;
import groupone.soundwaveproject.moderation.exception.SubmissionNotFoundException;
import groupone.soundwaveproject.moderation.mapper.TrackSubmissionMapper;
import groupone.soundwaveproject.moderation.repository.TrackSubmissionRepository;
import groupone.soundwaveproject.lyrics.entity.OfficialLyric;
import groupone.soundwaveproject.lyrics.repository.OfficialLyricRepository;
import groupone.soundwaveproject.notification.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ModerationServiceTest {

    @Mock private TrackSubmissionRepository submissionRepository;
    @Mock private TrackRepository trackRepository;
    @Mock private AlbumRepository albumRepository;
    @Mock private TrackSubmissionMapper mapper;
    @Mock private UserRepository userRepository;
    @Mock private StaffRepository staffRepository;
    @Mock private UserProfileRepository profileRepository;
    @Mock private NotificationService notificationService;
    @Mock private groupone.soundwaveproject.lyrics.service.LyricService lyricService;

    private ModerationService moderationService;
    private Staff staffUser;
    private Track testTrack;

    @BeforeEach
    void setUp() {
        moderationService = new ModerationService(
                submissionRepository,
                trackRepository,
                albumRepository,
                mapper,
                userRepository,
                staffRepository,
                profileRepository,
                notificationService,
                lyricService
        );

        StaffRole staffRole = new StaffRole("STAFF", "Staff", "Staff role");
        staffUser = new Staff(staffRole, "staff@soundwave.com", "hashedpwd", "Moderator Staff");
        ReflectionTestUtils.setField(staffUser, "id", 99L);

        Genre genre = Genre.builder().name("Rock").slug("rock").build();
        ReflectionTestUtils.setField(genre, "id", 1L);

        testTrack = Track.builder()
                .uploaderUserId(10L)
                .title("Echoes of Summer")
                .slug("echoes-of-summer")
                .genre(genre)
                .publicationStatus(TrackPublicationStatus.PENDING)
                .build();
        ReflectionTestUtils.setField(testTrack, "id", 100L);
    }

    @Test
    void approveSubmission_Success_And_AutoPublishAlbum() {
        Album draftAlbum = Album.builder()
                .createdByUserId(10L)
                .title("Summer Album")
                .slug("summer-album")
                .status("DRAFT")
                .build();
        ReflectionTestUtils.setField(draftAlbum, "id", 20L);
        testTrack.setAlbum(draftAlbum);

        TrackSubmission submission = TrackSubmission.builder()
                .trackId(100L)
                .submittedByUserId(10L)
                .status(SubmissionStatus.PENDING)
                .submittedAt(Instant.now())
                .build();
        ReflectionTestUtils.setField(submission, "id", 1L);

        when(submissionRepository.findById(1L)).thenReturn(Optional.of(submission));
        when(staffRepository.findByEmailIgnoreCase("staff@soundwave.com")).thenReturn(Optional.of(staffUser));
        when(trackRepository.findById(100L)).thenReturn(Optional.of(testTrack));
        when(trackRepository.save(any(Track.class))).thenAnswer(i -> i.getArgument(0));
        when(submissionRepository.save(any(TrackSubmission.class))).thenAnswer(i -> i.getArgument(0));

        ApproveTrackRequest request = new ApproveTrackRequest("Great track!");
        moderationService.approveSubmission(1L, request, "staff@soundwave.com");

        assertEquals(SubmissionStatus.APPROVED, submission.getStatus());
        assertEquals(99L, submission.getReviewerUserId());
        assertEquals("Great track!", submission.getReviewerNote());
        assertEquals(TrackPublicationStatus.PUBLISHED, testTrack.getPublicationStatus());
        assertNotNull(testTrack.getApprovedAt());
        assertEquals("PUBLISHED", draftAlbum.getStatus());
        assertNotNull(draftAlbum.getPublishedAt());

        verify(albumRepository).save(draftAlbum);
        verify(trackRepository).save(testTrack);
        verify(submissionRepository).save(submission);
    }

    @Test
    void approveSubmission_WhenNotPending_ThrowsInvalidStateException() {
        TrackSubmission submission = TrackSubmission.builder()
                .trackId(100L)
                .submittedByUserId(10L)
                .status(SubmissionStatus.APPROVED)
                .build();
        ReflectionTestUtils.setField(submission, "id", 1L);

        when(submissionRepository.findById(1L)).thenReturn(Optional.of(submission));

        ApproveTrackRequest request = new ApproveTrackRequest("Note");
        assertThrows(InvalidSubmissionStateException.class,
                () -> moderationService.approveSubmission(1L, request, "staff@soundwave.com"));
    }

    @Test
    void rejectSubmission_Success() {
        TrackSubmission submission = TrackSubmission.builder()
                .trackId(100L)
                .submittedByUserId(10L)
                .status(SubmissionStatus.PENDING)
                .submittedAt(Instant.now())
                .build();
        ReflectionTestUtils.setField(submission, "id", 1L);

        when(submissionRepository.findById(1L)).thenReturn(Optional.of(submission));
        when(staffRepository.findByEmailIgnoreCase("staff@soundwave.com")).thenReturn(Optional.of(staffUser));
        when(trackRepository.findById(100L)).thenReturn(Optional.of(testTrack));
        when(trackRepository.save(any(Track.class))).thenAnswer(i -> i.getArgument(0));
        when(submissionRepository.save(any(TrackSubmission.class))).thenAnswer(i -> i.getArgument(0));

        RejectTrackRequest request = new RejectTrackRequest("Audio clipping detected");
        moderationService.rejectSubmission(1L, request, "staff@soundwave.com");

        assertEquals(SubmissionStatus.REJECTED, submission.getStatus());
        assertEquals("Audio clipping detected", submission.getRejectionReason());
        assertEquals(TrackPublicationStatus.REJECTED, testTrack.getPublicationStatus());
        assertEquals("Audio clipping detected", testTrack.getLatestRejectionReason());

        verify(trackRepository).save(testTrack);
        verify(submissionRepository).save(submission);
    }

    @Test
    void takeDownSubmission_Success() {
        TrackSubmission submission = TrackSubmission.builder()
                .trackId(100L)
                .submittedByUserId(10L)
                .status(SubmissionStatus.APPROVED)
                .build();
        ReflectionTestUtils.setField(submission, "id", 1L);

        when(submissionRepository.findById(1L)).thenReturn(Optional.of(submission));
        when(staffRepository.findByEmailIgnoreCase("staff@soundwave.com")).thenReturn(Optional.of(staffUser));
        when(trackRepository.findById(100L)).thenReturn(Optional.of(testTrack));
        when(trackRepository.save(any(Track.class))).thenAnswer(i -> i.getArgument(0));
        when(submissionRepository.save(any(TrackSubmission.class))).thenAnswer(i -> i.getArgument(0));

        TakeDownTrackRequest request = new TakeDownTrackRequest("Copyright infringement claim confirmed", "Removed by DMCA");
        moderationService.takeDownSubmission(1L, request, "staff@soundwave.com");

        assertEquals(SubmissionStatus.REJECTED, submission.getStatus());
        assertEquals("Copyright infringement claim confirmed", submission.getRejectionReason());
        assertEquals(TrackPublicationStatus.TAKEN_DOWN, testTrack.getPublicationStatus());
        assertEquals("Copyright infringement claim confirmed", testTrack.getLatestRejectionReason());

        verify(trackRepository).save(testTrack);
    }

    @Test
    void getSubmissionDetail_NotFound_ThrowsException() {
        when(submissionRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(SubmissionNotFoundException.class,
                () -> moderationService.getSubmissionDetail(999L));
    }

    @Test
    void getSubmissionDetail_PassesLyricsFromTrackToMapper() {
        TrackSubmission submission = TrackSubmission.builder()
                .trackId(100L)
                .submittedByUserId(10L)
                .status(SubmissionStatus.PENDING)
                .submittedAt(Instant.now())
                .build();
        ReflectionTestUtils.setField(submission, "id", 1L);

        when(submissionRepository.findById(1L)).thenReturn(Optional.of(submission));
        when(trackRepository.findById(100L)).thenReturn(Optional.of(testTrack));
        when(lyricService.getOfficialLyrics(100L)).thenReturn("[00:01.00]Hello world\n[00:05.00]Echoes of summer");

        moderationService.getSubmissionDetail(1L);

        verify(mapper).toDetailResponse(
                eq(submission),
                eq(testTrack),
                any(),
                any(),
                any(),
                eq("[00:01.00]Hello world\n[00:05.00]Echoes of summer"),
                isNull()
        );
    }

    @Test
    void buildAlbumNavigation_WhenTrackHasAlbum_ReturnsOrderedNavigationWithNextTrack() {
        Album album = Album.builder()
                .title("Skyward")
                .slug("skyward")
                .status("DRAFT")
                .build();
        ReflectionTestUtils.setField(album, "id", 50L);

        Track track1 = Track.builder().title("Track 1").trackNumber(1).album(album).build();
        ReflectionTestUtils.setField(track1, "id", 101L);

        Track track2 = Track.builder().title("Track 2").trackNumber(2).album(album).build();
        ReflectionTestUtils.setField(track2, "id", 102L);

        TrackSubmission sub1 = TrackSubmission.builder().trackId(101L).status(SubmissionStatus.APPROVED).build();
        ReflectionTestUtils.setField(sub1, "id", 11L);

        TrackSubmission sub2 = TrackSubmission.builder().trackId(102L).status(SubmissionStatus.PENDING).build();
        ReflectionTestUtils.setField(sub2, "id", 12L);

        when(trackRepository.findByAlbum_IdOrderByTrackNumberAsc(50L)).thenReturn(java.util.List.of(track1, track2));
        when(submissionRepository.findByTrackIdInOrderBySubmittedAtDesc(java.util.List.of(101L, 102L)))
                .thenReturn(java.util.List.of(sub1, sub2));

        var nav = moderationService.buildAlbumNavigation(sub1, track1);

        assertNotNull(nav);
        assertEquals(50L, nav.albumId());
        assertEquals("Skyward", nav.albumTitle());
        assertEquals(11L, nav.currentSubmissionId());
        assertNull(nav.prevSubmissionId());
        assertEquals(12L, nav.nextSubmissionId());
        assertEquals(12L, nav.nextPendingSubmissionId());
        assertEquals(1, nav.currentIndex());
        assertEquals(2, nav.totalTracks());
        assertEquals(2, nav.tracks().size());
    }

    @Test
    void approveSubmission_LyricUpdate_KeepsTrackPublishedAndUpdatesOfficialLyric() {
        Track publishedTrack = Track.builder()
                .title("Echoes of Silence")
                .publicationStatus(TrackPublicationStatus.PUBLISHED)
                .build();
        ReflectionTestUtils.setField(publishedTrack, "id", 200L);

        TrackSubmission submission = TrackSubmission.builder()
                .trackId(200L)
                .submittedByUserId(10L)
                .submissionType(groupone.soundwaveproject.moderation.entity.SubmissionType.LYRIC_UPDATE)
                .proposedLyrics("[00:01.00]First line\n[00:04.00]Second line")
                .status(SubmissionStatus.PENDING)
                .build();
        ReflectionTestUtils.setField(submission, "id", 2L);

        when(submissionRepository.findById(2L)).thenReturn(Optional.of(submission));
        when(staffRepository.findByEmailIgnoreCase("staff@soundwave.com")).thenReturn(Optional.of(staffUser));
        when(trackRepository.findById(200L)).thenReturn(Optional.of(publishedTrack));
        when(submissionRepository.save(any(TrackSubmission.class))).thenAnswer(i -> i.getArgument(0));

        ApproveTrackRequest request = new ApproveTrackRequest("Lyrics look great");
        moderationService.approveSubmission(2L, request, "staff@soundwave.com");

        assertEquals(SubmissionStatus.APPROVED, submission.getStatus());
        assertEquals(TrackPublicationStatus.PUBLISHED, publishedTrack.getPublicationStatus());
        verify(lyricService).saveOrUpdateOfficialLyric(200L, "[00:01.00]First line\n[00:04.00]Second line", "PUBLISHED", 99L);
    }

    @Test
    void rejectSubmission_LyricUpdate_KeepsTrackPublishedWithoutChangingTrackStatus() {
        Track publishedTrack = Track.builder()
                .title("Echoes of Silence")
                .publicationStatus(TrackPublicationStatus.PUBLISHED)
                .build();
        ReflectionTestUtils.setField(publishedTrack, "id", 200L);

        TrackSubmission submission = TrackSubmission.builder()
                .trackId(200L)
                .submittedByUserId(10L)
                .submissionType(groupone.soundwaveproject.moderation.entity.SubmissionType.LYRIC_UPDATE)
                .proposedLyrics("[00:01.00]Desynced line")
                .status(SubmissionStatus.PENDING)
                .build();
        ReflectionTestUtils.setField(submission, "id", 3L);

        when(submissionRepository.findById(3L)).thenReturn(Optional.of(submission));
        when(staffRepository.findByEmailIgnoreCase("staff@soundwave.com")).thenReturn(Optional.of(staffUser));
        when(trackRepository.findById(200L)).thenReturn(Optional.of(publishedTrack));
        when(submissionRepository.save(any(TrackSubmission.class))).thenAnswer(i -> i.getArgument(0));

        RejectTrackRequest request = new RejectTrackRequest("Lyrics desynchronized after 00:30");
        moderationService.rejectSubmission(3L, request, "staff@soundwave.com");

        assertEquals(SubmissionStatus.REJECTED, submission.getStatus());
        assertEquals("Lyrics desynchronized after 00:30", submission.getRejectionReason());
        // Track must remain PUBLISHED!
        assertEquals(TrackPublicationStatus.PUBLISHED, publishedTrack.getPublicationStatus());
        verify(trackRepository, org.mockito.Mockito.never()).save(publishedTrack);
    }
}
