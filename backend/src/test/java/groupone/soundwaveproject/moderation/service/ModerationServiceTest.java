package groupone.soundwaveproject.moderation.service;

import groupone.soundwaveproject.authentication.entity.AppUser;
import groupone.soundwaveproject.authentication.entity.Role;
import groupone.soundwaveproject.authentication.repository.AppUserRepository;
import groupone.soundwaveproject.authentication.repository.UserProfileRepository;
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
import groupone.soundwaveproject.moderation.dto.response.TrackDetailResponse;
import groupone.soundwaveproject.moderation.entity.SubmissionStatus;
import groupone.soundwaveproject.moderation.entity.TrackSubmission;
import groupone.soundwaveproject.moderation.exception.InvalidSubmissionStateException;
import groupone.soundwaveproject.moderation.exception.SubmissionNotFoundException;
import groupone.soundwaveproject.moderation.mapper.TrackSubmissionMapper;
import groupone.soundwaveproject.moderation.repository.TrackSubmissionRepository;
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
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ModerationServiceTest {

    @Mock private TrackSubmissionRepository submissionRepository;
    @Mock private TrackRepository trackRepository;
    @Mock private AlbumRepository albumRepository;
    @Mock private ModerationMailService mailService;
    @Mock private TrackSubmissionMapper mapper;
    @Mock private AppUserRepository userRepository;
    @Mock private UserProfileRepository profileRepository;

    private ModerationService moderationService;
    private AppUser staffUser;
    private Track testTrack;

    @BeforeEach
    void setUp() {
        moderationService = new ModerationService(
                submissionRepository,
                trackRepository,
                albumRepository,
                mailService,
                mapper,
                userRepository,
                profileRepository
        );

        staffUser = new AppUser(
                new Role("STAFF", "Staff", "Staff role"),
                "staff@soundwave.com",
                "hashedpwd"
        );
        ReflectionTestUtils.setField(staffUser, "id", 99L);

        Genre genre = Genre.builder().name("Rock").slug("rock").build();
        ReflectionTestUtils.setField(genre, "id", 1L);

        testTrack = Track.builder()
                .uploaderUserId(10L)
                .title("Echoes of Summer")
                .slug("echoes-of-summer")
                .genre(genre)
                .publicationStatus(TrackPublicationStatus.PENDING)
                .lyrics("[00:01.00]Hello world\n[00:05.00]Echoes of summer")
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
        when(userRepository.findByEmailIgnoreCase("staff@soundwave.com")).thenReturn(Optional.of(staffUser));
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
        when(userRepository.findByEmailIgnoreCase("staff@soundwave.com")).thenReturn(Optional.of(staffUser));
        when(trackRepository.findById(100L)).thenReturn(Optional.of(testTrack));
        when(trackRepository.save(any(Track.class))).thenAnswer(i -> i.getArgument(0));
        when(submissionRepository.save(any(TrackSubmission.class))).thenAnswer(i -> i.getArgument(0));

        RejectTrackRequest request = new RejectTrackRequest("Audio clipping detected", "Please re-export in WAV");
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
        when(userRepository.findByEmailIgnoreCase("staff@soundwave.com")).thenReturn(Optional.of(staffUser));
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

        moderationService.getSubmissionDetail(1L);

        verify(mapper).toDetailResponse(
                eq(submission),
                eq(testTrack),
                any(),
                any(),
                any(),
                any(),
                eq("[00:01.00]Hello world\n[00:05.00]Echoes of summer")
        );
    }
}
