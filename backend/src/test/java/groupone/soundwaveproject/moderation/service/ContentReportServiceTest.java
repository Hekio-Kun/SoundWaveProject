package groupone.soundwaveproject.moderation.service;

import groupone.soundwaveproject.authentication.entity.User;
import groupone.soundwaveproject.authentication.repository.UserRepository;
import groupone.soundwaveproject.catalog.entity.Genre;
import groupone.soundwaveproject.catalog.entity.Track;
import groupone.soundwaveproject.catalog.entity.TrackPublicationStatus;
import groupone.soundwaveproject.catalog.repository.TrackRepository;
import groupone.soundwaveproject.exception.BadRequestOperationException;
import groupone.soundwaveproject.exception.ResourceNotFoundException;
import groupone.soundwaveproject.moderation.dto.request.CreateContentReportRequest;
import groupone.soundwaveproject.moderation.dto.response.ContentReportResponse;
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
}
