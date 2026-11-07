package groupone.soundwaveproject.moderation.service;

import groupone.soundwaveproject.authentication.entity.User;
import groupone.soundwaveproject.authentication.repository.UserRepository;
import groupone.soundwaveproject.catalog.entity.Genre;
import groupone.soundwaveproject.catalog.entity.Track;
import groupone.soundwaveproject.catalog.entity.TrackPublicationStatus;
import groupone.soundwaveproject.catalog.repository.TrackRepository;
import groupone.soundwaveproject.exception.BadRequestOperationException;
import groupone.soundwaveproject.exception.ForbiddenOperationException;
import groupone.soundwaveproject.exception.ResourceNotFoundException;
import groupone.soundwaveproject.moderation.dto.request.CreateContentReportRequest;
import groupone.soundwaveproject.moderation.dto.request.CreateTrackReportRequest;
import groupone.soundwaveproject.moderation.dto.request.UpdateTrackReportRequest;
import groupone.soundwaveproject.moderation.dto.response.ContentReportResponse;
import groupone.soundwaveproject.moderation.dto.response.MyReportHistoryResponse;
import groupone.soundwaveproject.moderation.dto.response.TrackReportResponse;
import groupone.soundwaveproject.moderation.entity.ContentReport;
import groupone.soundwaveproject.moderation.repository.ContentReportRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ContentReportServiceTest {

    @Mock
    private ContentReportRepository contentReportRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TrackRepository trackRepository;

    @InjectMocks
    private ContentReportService contentReportService;

    private User mockUser;
    private Track mockTrack;

    @BeforeEach
    void setUp() {
        mockUser = new User("listener@example.com", "hashed_password");
        ReflectionTestUtils.setField(mockUser, "id", 10L);

        Genre genre = new Genre("Pop", "pop", "Pop music", 1L);
        ReflectionTestUtils.setField(genre, "id", 10L);

        mockTrack = new Track(
                100L,
                genre,
                null,
                "Test Song",
                "test-song",
                "Description",
                "pub_1",
                "https://example.com/audio.mp3",
                "mp3",
                180000,
                "cover_1",
                "https://example.com/cover.jpg",
                TrackPublicationStatus.PUBLISHED
        );
        ReflectionTestUtils.setField(mockTrack, "id", 100L);
    }

    // =========================================================================
    // UC-22.1: submitTrackReport Tests
    // =========================================================================

    @Test
    @DisplayName("submitTrackReport - Successfully creates track report when valid (UC-22.1)")
    void submitTrackReport_Success() {
        when(userRepository.findByEmailIgnoreCase("listener@example.com")).thenReturn(Optional.of(mockUser));
        when(trackRepository.findById(100L)).thenReturn(Optional.of(mockTrack));
        when(contentReportRepository.hasPendingReportForTrack(100L, 10L, "PENDING")).thenReturn(false);

        when(contentReportRepository.save(any(ContentReport.class))).thenAnswer(invocation -> {
            ContentReport report = invocation.getArgument(0);
            report.setId(1L);
            report.setCreatedAt(Instant.now());
            return report;
        });

        CreateTrackReportRequest request = new CreateTrackReportRequest(
                100L,
                "COPYRIGHT"
        );

        TrackReportResponse response = contentReportService.submitTrackReport("listener@example.com", request);

        assertNotNull(response);
        assertEquals(1L, response.id());
        assertEquals(100L, response.trackId());
        assertEquals("Test Song", response.trackTitle());
        assertEquals("COPYRIGHT", response.category());
        assertEquals("Copyright Infringement", response.categoryLabel());
        assertEquals("Copyright Infringement", response.description());
        assertEquals("PENDING", response.status());

        verify(contentReportRepository, times(1)).save(any(ContentReport.class));
    }

    @Test
    @DisplayName("submitTrackReport - Throws exception when track is not PUBLISHED (BR-30, EX02)")
    void submitTrackReport_TrackNotPublished() {
        mockTrack.setPublicationStatus(TrackPublicationStatus.REJECTED);
        when(userRepository.findByEmailIgnoreCase("listener@example.com")).thenReturn(Optional.of(mockUser));
        when(trackRepository.findById(100L)).thenReturn(Optional.of(mockTrack));

        CreateTrackReportRequest request = new CreateTrackReportRequest(
                100L,
                "COPYRIGHT",
                "Infringement description"
        );

        BadRequestOperationException ex = assertThrows(BadRequestOperationException.class, () ->
                contentReportService.submitTrackReport("listener@example.com", request)
        );

        assertEquals("TRACK_NOT_ELIGIBLE", ex.getCode());
        verify(contentReportRepository, never()).save(any(ContentReport.class));
    }

    @Test
    @DisplayName("submitTrackReport - Throws exception when duplicate PENDING report exists (EX01)")
    void submitTrackReport_DuplicatePendingReport() {
        when(userRepository.findByEmailIgnoreCase("listener@example.com")).thenReturn(Optional.of(mockUser));
        when(trackRepository.findById(100L)).thenReturn(Optional.of(mockTrack));
        when(contentReportRepository.hasPendingReportForTrack(100L, 10L, "PENDING")).thenReturn(true);

        CreateTrackReportRequest request = new CreateTrackReportRequest(
                100L,
                "INAPPROPRIATE_CONTENT",
                "Offensive lyrics"
        );

        BadRequestOperationException ex = assertThrows(BadRequestOperationException.class, () ->
                contentReportService.submitTrackReport("listener@example.com", request)
        );

        assertEquals("REPORT_ALREADY_EXISTS", ex.getCode());
        verify(contentReportRepository, never()).save(any(ContentReport.class));
    }

    @Test
    @DisplayName("submitTrackReport - Throws exception when category is invalid (BR-31)")
    void submitTrackReport_InvalidCategory() {
        when(userRepository.findByEmailIgnoreCase("listener@example.com")).thenReturn(Optional.of(mockUser));
        when(trackRepository.findById(100L)).thenReturn(Optional.of(mockTrack));

        CreateTrackReportRequest request = new CreateTrackReportRequest(
                100L,
                "UNKNOWN_CATEGORY",
                "Description"
        );

        BadRequestOperationException ex = assertThrows(BadRequestOperationException.class, () ->
                contentReportService.submitTrackReport("listener@example.com", request)
        );

        assertEquals("INVALID_REPORT_CATEGORY", ex.getCode());
    }

    @Test
    @DisplayName("submitTrackReport - Throws exception when track is not found")
    void submitTrackReport_TrackNotFound() {
        when(userRepository.findByEmailIgnoreCase("listener@example.com")).thenReturn(Optional.of(mockUser));
        when(trackRepository.findById(999L)).thenReturn(Optional.empty());

        CreateTrackReportRequest request = new CreateTrackReportRequest(
                999L,
                "COPYRIGHT",
                "Description"
        );

        assertThrows(ResourceNotFoundException.class, () ->
                contentReportService.submitTrackReport("listener@example.com", request)
        );
    }

    @Test
    @DisplayName("checkPendingReport - Returns true when pending report exists")
    void checkPendingReport_True() {
        when(userRepository.findByEmailIgnoreCase("listener@example.com")).thenReturn(Optional.of(mockUser));
        when(contentReportRepository.hasPendingReportForTrack(100L, 10L, "PENDING")).thenReturn(true);

        boolean result = contentReportService.checkPendingReport("listener@example.com", 100L);
        assertTrue(result);
    }

    // =========================================================================
    // UC-22.2: getMyReports Tests
    // =========================================================================

    @Test
    @DisplayName("getMyReports - Successfully retrieves list of reports for authenticated listener (UC-22.2)")
    void getMyReports_Success() {
        when(userRepository.findByEmailIgnoreCase("listener@example.com")).thenReturn(Optional.of(mockUser));

        ContentReport report1 = ContentReport.builder()
                .id(1L)
                .trackId(100L)
                .submittedByUserId(10L)
                .category("COPYRIGHT")
                .description("Copyright Infringement")
                .status("PENDING")
                .createdAt(Instant.now())
                .build();

        ContentReport report2 = ContentReport.builder()
                .id(2L)
                .trackId(100L)
                .submittedByUserId(10L)
                .category("INAPPROPRIATE_CONTENT")
                .description("Inappropriate or Offensive Content")
                .status("RESOLVED")
                .resolutionNote("Track taken down by moderation team.")
                .createdAt(Instant.now().minusSeconds(3600))
                .handledAt(Instant.now())
                .build();

        when(contentReportRepository.findMyReports(10L)).thenReturn(List.of(report1, report2));
        when(trackRepository.findAllById(any())).thenReturn(List.of(mockTrack));

        List<MyReportHistoryResponse> reports = contentReportService.getMyReports("listener@example.com");

        assertNotNull(reports);
        assertEquals(2, reports.size());
        assertEquals("Test Song", reports.get(0).trackTitle());
        assertEquals("Copyright Infringement", reports.get(0).categoryLabel());
        assertEquals("PENDING", reports.get(0).status());
        assertEquals("RESOLVED", reports.get(1).status());
        assertEquals("Track taken down by moderation team.", reports.get(1).resolutionNote());
    }

    @Test
    @DisplayName("getMyReports - Returns empty list when user has submitted no reports (AF01)")
    void getMyReports_Empty() {
        when(userRepository.findByEmailIgnoreCase("listener@example.com")).thenReturn(Optional.of(mockUser));
        when(contentReportRepository.findMyReports(10L)).thenReturn(Collections.emptyList());

        List<MyReportHistoryResponse> reports = contentReportService.getMyReports("listener@example.com");

        assertNotNull(reports);
        assertTrue(reports.isEmpty());
    }

    // =========================================================================
    // UC-31.1: submitLyricReport Tests (Legacy / Existing)
    // =========================================================================

    @Test
    @DisplayName("submitLyricReport - Successfully creates report when valid")
    void submitLyricReport_Success() {
        when(userRepository.findByEmailIgnoreCase("listener@example.com")).thenReturn(Optional.of(mockUser));
        when(trackRepository.findById(100L)).thenReturn(Optional.of(mockTrack));
        when(contentReportRepository.findByReporterIdAndTargetTypeAndTargetId(10L, "LYRICS", 100L))
                .thenReturn(Collections.emptyList());

        when(contentReportRepository.save(any(ContentReport.class))).thenAnswer(invocation -> {
            ContentReport entity = invocation.getArgument(0);
            entity.setId(1L);
            entity.setCreatedAt(Instant.now());
            return entity;
        });

        CreateContentReportRequest request = new CreateContentReportRequest(
                100L,
                "OUT_OF_SYNC",
                "Lyrics are 2 seconds ahead of audio stream"
        );

        ContentReportResponse response = contentReportService.submitLyricReport("listener@example.com", request);

        assertNotNull(response);
        assertEquals(1L, response.id());
        assertEquals(10L, response.reporterId());
        assertEquals("LYRICS", response.targetType());
        assertEquals(100L, response.targetId());
        assertEquals("OUT_OF_SYNC", response.reason());
        assertEquals("PENDING", response.status());

        verify(contentReportRepository, times(1)).save(any(ContentReport.class));
    }

    @Test
    @DisplayName("submitLyricReport - Throws exception when user not found")
    void submitLyricReport_UserNotFound() {
        when(userRepository.findByEmailIgnoreCase("unknown@example.com")).thenReturn(Optional.empty());

        CreateContentReportRequest request = new CreateContentReportRequest(100L, "OUT_OF_SYNC", "Test");

        assertThrows(ResourceNotFoundException.class, () ->
                contentReportService.submitLyricReport("unknown@example.com", request)
        );
    }

    @Test
    @DisplayName("submitLyricReport - Throws exception when track not found")
    void submitLyricReport_TrackNotFound() {
        when(userRepository.findByEmailIgnoreCase("listener@example.com")).thenReturn(Optional.of(mockUser));
        when(trackRepository.findById(999L)).thenReturn(Optional.empty());

        CreateContentReportRequest request = new CreateContentReportRequest(999L, "OUT_OF_SYNC", "Test");

        assertThrows(ResourceNotFoundException.class, () ->
                contentReportService.submitLyricReport("listener@example.com", request)
        );
    }

    @Test
    @DisplayName("submitLyricReport - Throws BadRequestOperationException when user already has pending report")
    void submitLyricReport_PendingReportExists() {
        when(userRepository.findByEmailIgnoreCase("listener@example.com")).thenReturn(Optional.of(mockUser));
        when(trackRepository.findById(100L)).thenReturn(Optional.of(mockTrack));

        ContentReport existingReport = ContentReport.builder()
                .id(5L)
                .reporterId(10L)
                .targetType("LYRICS")
                .targetId(100L)
                .status("PENDING")
                .build();

        when(contentReportRepository.findByReporterIdAndTargetTypeAndTargetId(10L, "LYRICS", 100L))
                .thenReturn(List.of(existingReport));

        CreateContentReportRequest request = new CreateContentReportRequest(100L, "OUT_OF_SYNC", "Duplicate report");

        assertThrows(BadRequestOperationException.class, () ->
                contentReportService.submitLyricReport("listener@example.com", request)
        );

        verify(contentReportRepository, never()).save(any(ContentReport.class));
    }

    // =========================================================================
    // UC-22.3: updateTrackReport Tests
    // =========================================================================

    @Test
    @DisplayName("updateTrackReport - Successfully updates rejected report and resubmits as PENDING")
    void updateTrackReport_Success() {
        when(userRepository.findByEmailIgnoreCase("listener@example.com")).thenReturn(Optional.of(mockUser));

        ContentReport existing = ContentReport.builder()
                .id(1L)
                .trackId(100L)
                .submittedByUserId(10L)
                .category("COPYRIGHT")
                .description("Copyright Infringement")
                .status("DISMISSED") // Rejected report
                .build();
        when(contentReportRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(trackRepository.findById(100L)).thenReturn(Optional.of(mockTrack));

        when(contentReportRepository.save(any(ContentReport.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateTrackReportRequest request = new UpdateTrackReportRequest("INAPPROPRIATE_CONTENT");
        TrackReportResponse response = contentReportService.updateTrackReport(1L, "listener@example.com", request);

        assertNotNull(response);
        assertEquals("INAPPROPRIATE_CONTENT", response.category());
        assertEquals("Inappropriate or Offensive Content", response.categoryLabel());
        assertEquals("PENDING", response.status());
        verify(contentReportRepository, times(1)).save(existing);
    }

    @Test
    @DisplayName("updateTrackReport - Throws BadRequestOperationException when status is PENDING (cannot edit pending)")
    void updateTrackReport_WhenPending_ThrowsBadRequest() {
        when(userRepository.findByEmailIgnoreCase("listener@example.com")).thenReturn(Optional.of(mockUser));

        ContentReport existing = ContentReport.builder()
                .id(1L)
                .trackId(100L)
                .submittedByUserId(10L)
                .category("COPYRIGHT")
                .description("Copyright Infringement")
                .status("PENDING")
                .build();
        when(contentReportRepository.findById(1L)).thenReturn(Optional.of(existing));

        UpdateTrackReportRequest request = new UpdateTrackReportRequest("OTHER");

        BadRequestOperationException ex = assertThrows(BadRequestOperationException.class, () ->
                contentReportService.updateTrackReport(1L, "listener@example.com", request)
        );
        assertTrue(ex.getMessage().contains("pending review"));
        verify(contentReportRepository, never()).save(any(ContentReport.class));
    }

    @Test
    @DisplayName("updateTrackReport - Throws ForbiddenOperationException when report belongs to another user")
    void updateTrackReport_UnauthorizedUser() {
        when(userRepository.findByEmailIgnoreCase("listener@example.com")).thenReturn(Optional.of(mockUser));

        ContentReport existing = ContentReport.builder()
                .id(1L)
                .trackId(100L)
                .submittedByUserId(999L) // Another user
                .category("COPYRIGHT")
                .status("DISMISSED")
                .build();
        when(contentReportRepository.findById(1L)).thenReturn(Optional.of(existing));

        UpdateTrackReportRequest request = new UpdateTrackReportRequest("OTHER");

        assertThrows(ForbiddenOperationException.class, () ->
                contentReportService.updateTrackReport(1L, "listener@example.com", request)
        );
        verify(contentReportRepository, never()).save(any());
    }

    @Test
    @DisplayName("updateTrackReport - Throws BadRequestOperationException when status is RESOLVED")
    void updateTrackReport_WhenResolved_ThrowsBadRequest() {
        when(userRepository.findByEmailIgnoreCase("listener@example.com")).thenReturn(Optional.of(mockUser));

        ContentReport existing = ContentReport.builder()
                .id(1L)
                .trackId(100L)
                .submittedByUserId(10L)
                .category("COPYRIGHT")
                .status("RESOLVED") // Reviewed and resolved
                .build();
        when(contentReportRepository.findById(1L)).thenReturn(Optional.of(existing));

        UpdateTrackReportRequest request = new UpdateTrackReportRequest("OTHER");

        BadRequestOperationException ex = assertThrows(BadRequestOperationException.class, () ->
                contentReportService.updateTrackReport(1L, "listener@example.com", request)
        );
        assertTrue(ex.getMessage().contains("resolved"));
        verify(contentReportRepository, never()).save(any());
    }

    @Test
    @DisplayName("updateTrackReport - Throws BadRequestOperationException when category option is invalid")
    void updateTrackReport_InvalidCategory() {
        when(userRepository.findByEmailIgnoreCase("listener@example.com")).thenReturn(Optional.of(mockUser));

        ContentReport existing = ContentReport.builder()
                .id(1L)
                .trackId(100L)
                .submittedByUserId(10L)
                .category("COPYRIGHT")
                .status("DISMISSED")
                .build();
        when(contentReportRepository.findById(1L)).thenReturn(Optional.of(existing));

        UpdateTrackReportRequest request = new UpdateTrackReportRequest("NOT_A_VALID_CATEGORY");

        assertThrows(BadRequestOperationException.class, () ->
                contentReportService.updateTrackReport(1L, "listener@example.com", request)
        );
        verify(contentReportRepository, never()).save(any());
    }
}
