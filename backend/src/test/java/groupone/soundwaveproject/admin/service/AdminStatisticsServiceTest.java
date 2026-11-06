package groupone.soundwaveproject.admin.service;

import groupone.soundwaveproject.admin.dto.response.SystemStatisticsResponse;
import groupone.soundwaveproject.authentication.entity.User;
import groupone.soundwaveproject.authentication.entity.UserStatus;
import groupone.soundwaveproject.authentication.repository.StaffRepository;
import groupone.soundwaveproject.authentication.repository.UserProfileRepository;
import groupone.soundwaveproject.authentication.repository.UserRepository;
import groupone.soundwaveproject.catalog.entity.Genre;
import groupone.soundwaveproject.catalog.entity.Track;
import groupone.soundwaveproject.catalog.entity.TrackPublicationStatus;
import groupone.soundwaveproject.catalog.repository.GenreRepository;
import groupone.soundwaveproject.catalog.repository.TrackRepository;
import groupone.soundwaveproject.moderation.entity.SubmissionStatus;
import groupone.soundwaveproject.moderation.repository.ContentReportRepository;
import groupone.soundwaveproject.moderation.repository.TrackSubmissionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminStatisticsServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserProfileRepository userProfileRepository;

    @Mock
    private StaffRepository staffRepository;

    @Mock
    private TrackRepository trackRepository;

    @Mock
    private GenreRepository genreRepository;

    @Mock
    private TrackSubmissionRepository trackSubmissionRepository;

    @Mock
    private ContentReportRepository contentReportRepository;

    private AdminStatisticsService adminStatisticsService;

    @BeforeEach
    void setUp() {
        adminStatisticsService = new AdminStatisticsService(
                userRepository,
                userProfileRepository,
                staffRepository,
                trackRepository,
                genreRepository,
                trackSubmissionRepository,
                contentReportRepository
        );
    }

    @Test
    void getSystemStatistics_Default7d_ShouldReturnAggregatedMetrics() {
        // Arrange
        when(userRepository.countByDeletedAtIsNull()).thenReturn(100L);
        when(userRepository.countByStatusAndDeletedAtIsNull(UserStatus.ACTIVE)).thenReturn(85L);
        when(userRepository.countByCreatedAtBetweenAndDeletedAtIsNull(any(), any())).thenReturn(10L);

        when(trackRepository.countByPublicationStatus(TrackPublicationStatus.PUBLISHED)).thenReturn(50L);
        when(trackRepository.countByPublicationStatusAndCreatedAtAfter(eq(TrackPublicationStatus.PUBLISHED), any())).thenReturn(5L);
        when(trackRepository.sumPlayCountCache()).thenReturn(12000L);
        when(trackRepository.countDistinctUploaders()).thenReturn(15L);

        when(trackSubmissionRepository.countByStatus(SubmissionStatus.PENDING)).thenReturn(3L);
        when(contentReportRepository.countByStatus("PENDING")).thenReturn(2L);
        when(genreRepository.countByIsActiveTrue()).thenReturn(8L);

        when(staffRepository.countByRole_CodeIgnoreCase("STAFF")).thenReturn(4L);
        when(staffRepository.countByRole_CodeIgnoreCase("ADMIN")).thenReturn(1L);

        Genre mockGenre = new Genre("Ambient", "ambient", "Relaxing sounds", 1L);
        Track mockTrack = Track.builder()
                .id(1L)
                .title("Sunset Horizon")
                .playCountCache(2500L)
                .genre(mockGenre)
                .build();

        when(trackRepository.findTopPublishedTracks(any(Pageable.class))).thenReturn(List.of(mockTrack));
        when(userRepository.findUsersCreatedSince(any())).thenReturn(Collections.emptyList());
        when(userRepository.findTop5ByDeletedAtIsNullOrderByCreatedAtDesc()).thenReturn(Collections.emptyList());

        // Act
        SystemStatisticsResponse response = adminStatisticsService.getSystemStatistics("7d");

        // Assert
        assertNotNull(response);
        assertEquals("7d", response.period());
        assertNotNull(response.overview());
        assertEquals(100L, response.overview().totalUsers());
        assertEquals(85L, response.overview().activeUsers());
        assertEquals(50L, response.overview().publishedTracks());
        assertEquals(12000L, response.overview().totalPlays());
        assertEquals(3L, response.overview().pendingReviews());
        assertEquals(2L, response.overview().pendingReports());
        assertEquals(8L, response.overview().activeGenres());
        assertEquals(15L, response.overview().totalCreators());

        assertEquals(1, response.topTracks().size());
        assertEquals("Sunset Horizon", response.topTracks().get(0).title());
        assertEquals("Ambient", response.topTracks().get(0).genreName());
        assertEquals(2500L, response.topTracks().get(0).playCount());

        assertNotNull(response.systemHealth());
        assertEquals("Operational", response.systemHealth().restApiStatus());
    }

    @Test
    void getSystemStatistics_WithInvalidPeriod_ShouldDefaultTo7d() {
        when(userRepository.countByDeletedAtIsNull()).thenReturn(0L);
        when(trackRepository.countByPublicationStatus(TrackPublicationStatus.PUBLISHED)).thenReturn(0L);
        when(trackRepository.findTopPublishedTracks(any(Pageable.class))).thenReturn(Collections.emptyList());
        when(userRepository.findUsersCreatedSince(any())).thenReturn(Collections.emptyList());
        when(userRepository.findTop5ByDeletedAtIsNullOrderByCreatedAtDesc()).thenReturn(Collections.emptyList());

        SystemStatisticsResponse response = adminStatisticsService.getSystemStatistics("invalid_period");

        assertNotNull(response);
        assertEquals("7d", response.period());
    }

    @Test
    void getSystemStatistics_WhenNoData_ShouldHandleZeroAndNullGracefully() {
        when(userRepository.countByDeletedAtIsNull()).thenReturn(0L);
        when(trackRepository.sumPlayCountCache()).thenReturn(null);
        when(trackRepository.countDistinctUploaders()).thenReturn(null);
        when(trackRepository.findTopPublishedTracks(any(Pageable.class))).thenReturn(Collections.emptyList());
        when(userRepository.findUsersCreatedSince(any())).thenReturn(Collections.emptyList());
        when(userRepository.findTop5ByDeletedAtIsNullOrderByCreatedAtDesc()).thenReturn(Collections.emptyList());

        SystemStatisticsResponse response = adminStatisticsService.getSystemStatistics("30d");

        assertNotNull(response);
        assertEquals("30d", response.period());
        assertEquals(0L, response.overview().totalPlays());
        assertEquals(0L, response.overview().totalCreators());
        assertTrue(response.topTracks().isEmpty());
        assertTrue(response.recentAccounts().isEmpty());
    }
}
