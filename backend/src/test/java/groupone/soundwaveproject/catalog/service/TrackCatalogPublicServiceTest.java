package groupone.soundwaveproject.catalog.service;

import groupone.soundwaveproject.catalog.entity.Track;
import groupone.soundwaveproject.catalog.entity.TrackPublicationStatus;
import groupone.soundwaveproject.catalog.repository.TrackRepository;
import groupone.soundwaveproject.exception.BadRequestOperationException;
import groupone.soundwaveproject.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TrackCatalogPublicServiceTest {

    @Mock
    private TrackRepository trackRepository;

    @InjectMocks
    private TrackCatalogPublicService trackCatalogPublicService;

    private static final Long TRACK_ID = 100L;
    private Track publishedTrack;

    @BeforeEach
    void setUp() {
        publishedTrack = Track.builder()
                .id(TRACK_ID)
                .title("Ocean Waves")
                .publicationStatus(TrackPublicationStatus.PUBLISHED)
                .build();
    }

    @Test
    @DisplayName("Xác thực bài hát thành công khi bài hát tồn tại và ở trạng thái PUBLISHED")
    void validatePublishedTrack_Success() {
        when(trackRepository.findById(TRACK_ID)).thenReturn(Optional.of(publishedTrack));

        Track result = trackCatalogPublicService.validatePublishedTrack(TRACK_ID);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(TRACK_ID);
        assertThat(result.getPublicationStatus()).isEqualTo(TrackPublicationStatus.PUBLISHED);
        verify(trackRepository, times(1)).findById(TRACK_ID);
    }

    @Test
    @DisplayName("Ném BadRequestOperationException khi trackId là null hoặc âm")
    void validatePublishedTrack_InvalidTrackId() {
        assertThatThrownBy(() -> trackCatalogPublicService.validatePublishedTrack(null))
                .isInstanceOf(BadRequestOperationException.class)
                .hasMessageContaining("Track ID must be a valid positive number.");

        assertThatThrownBy(() -> trackCatalogPublicService.validatePublishedTrack(0L))
                .isInstanceOf(BadRequestOperationException.class)
                .hasMessageContaining("Track ID must be a valid positive number.");

        assertThatThrownBy(() -> trackCatalogPublicService.validatePublishedTrack(-1L))
                .isInstanceOf(BadRequestOperationException.class)
                .hasMessageContaining("Track ID must be a valid positive number.");

        verifyNoInteractions(trackRepository);
    }

    @Test
    @DisplayName("Ném ResourceNotFoundException khi không tìm thấy bài hát")
    void validatePublishedTrack_NotFound() {
        when(trackRepository.findById(TRACK_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> trackCatalogPublicService.validatePublishedTrack(TRACK_ID))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Track not found with ID: " + TRACK_ID);

        verify(trackRepository, times(1)).findById(TRACK_ID);
    }

    @Test
    @DisplayName("Ném BadRequestOperationException khi bài hát chưa ở trạng thái PUBLISHED (tuân thủ BR-09)")
    void validatePublishedTrack_NotPublished() {
        Track pendingTrack = Track.builder()
                .id(TRACK_ID)
                .title("Ocean Waves")
                .publicationStatus(TrackPublicationStatus.PENDING)
                .build();

        when(trackRepository.findById(TRACK_ID)).thenReturn(Optional.of(pendingTrack));

        assertThatThrownBy(() -> trackCatalogPublicService.validatePublishedTrack(TRACK_ID))
                .isInstanceOf(BadRequestOperationException.class)
                .hasMessageContaining("Only published tracks can be added to favorites.");

        verify(trackRepository, times(1)).findById(TRACK_ID);
    }
}
