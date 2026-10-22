package groupone.soundwaveproject.library.service;

import groupone.soundwaveproject.authentication.service.UserAccountPublicService;
import groupone.soundwaveproject.catalog.entity.Genre;
import groupone.soundwaveproject.catalog.entity.Track;
import groupone.soundwaveproject.catalog.entity.TrackPublicationStatus;
import groupone.soundwaveproject.catalog.repository.TrackRepository;
import groupone.soundwaveproject.exception.BadRequestOperationException;
import groupone.soundwaveproject.exception.ResourceNotFoundException;
import groupone.soundwaveproject.library.entity.Favorite;
import groupone.soundwaveproject.library.entity.FavoriteId;
import groupone.soundwaveproject.library.repository.FavoriteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatNoException;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FavoriteServiceTest {

    @Mock
    private FavoriteRepository favoriteRepository;

    @Mock
    private TrackRepository trackRepository;

    @Mock
    private UserAccountPublicService userAccountPublicService;

    @InjectMocks
    private FavoriteService favoriteService;

    private static final String USER_EMAIL = "listener@soundwave.com";
    private static final Long USER_ID = 10L;
    private static final Long TRACK_ID = 100L;

    private Track publishedTrack;

    @BeforeEach
    void setUp() {
        Genre genre = Genre.builder()
                .id(1L)
                .name("Pop")
                .slug("pop")
                .isActive(true)
                .build();

        publishedTrack = Track.builder()
                .id(TRACK_ID)
                .title("Ocean Waves")
                .slug("ocean-waves")
                .uploaderUserId(20L)
                .genre(genre)
                .audioPublicId("audio/ocean_waves")
                .publicationStatus(TrackPublicationStatus.PUBLISHED)
                .build();
    }

    @Test
    @DisplayName("Thêm bài hát vào danh sách yêu thích thành công khi bài hát đã PUBLISHED và chưa được like")
    void addFavorite_Success() {
        when(userAccountPublicService.getUserIdByEmail(USER_EMAIL)).thenReturn(USER_ID);
        when(trackRepository.findById(TRACK_ID)).thenReturn(Optional.of(publishedTrack));
        when(favoriteRepository.existsById(new FavoriteId(USER_ID, TRACK_ID))).thenReturn(false);

        assertThatNoException().isThrownBy(() -> favoriteService.addFavorite(USER_EMAIL, TRACK_ID));

        verify(favoriteRepository, times(1)).save(any(Favorite.class));
    }

    @Test
    @DisplayName("Ném BadRequestOperationException khi trackId là null hoặc nhỏ hơn hoặc bằng 0")
    void addFavorite_InvalidTrackId() {
        assertThatThrownBy(() -> favoriteService.addFavorite(USER_EMAIL, null))
                .isInstanceOf(BadRequestOperationException.class)
                .hasMessageContaining("Track ID must be a valid positive number.");

        assertThatThrownBy(() -> favoriteService.addFavorite(USER_EMAIL, 0L))
                .isInstanceOf(BadRequestOperationException.class)
                .hasMessageContaining("Track ID must be a valid positive number.");

        assertThatThrownBy(() -> favoriteService.addFavorite(USER_EMAIL, -5L))
                .isInstanceOf(BadRequestOperationException.class)
                .hasMessageContaining("Track ID must be a valid positive number.");

        verifyNoInteractions(favoriteRepository);
    }

    @Test
    @DisplayName("Ném ResourceNotFoundException khi bài hát không tồn tại")
    void addFavorite_TrackNotFound() {
        when(userAccountPublicService.getUserIdByEmail(USER_EMAIL)).thenReturn(USER_ID);
        when(trackRepository.findById(TRACK_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> favoriteService.addFavorite(USER_EMAIL, TRACK_ID))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Track not found with ID");

        verify(favoriteRepository, never()).save(any(Favorite.class));
    }

    @Test
    @DisplayName("Ném BadRequestOperationException khi bài hát chưa ở trạng thái PUBLISHED (tuân thủ BR-09)")
    void addFavorite_TrackNotPublished() {
        publishedTrack.setPublicationStatus(TrackPublicationStatus.PENDING);

        when(userAccountPublicService.getUserIdByEmail(USER_EMAIL)).thenReturn(USER_ID);
        when(trackRepository.findById(TRACK_ID)).thenReturn(Optional.of(publishedTrack));

        assertThatThrownBy(() -> favoriteService.addFavorite(USER_EMAIL, TRACK_ID))
                .isInstanceOf(BadRequestOperationException.class)
                .hasMessageContaining("Only published tracks can be added to favorites.");

        verify(favoriteRepository, never()).save(any(Favorite.class));
    }

    @Test
    @DisplayName("Xử lý idempotent không lưu trùng khi bài hát đã có trong favorites")
    void addFavorite_AlreadyExists_Idempotent() {
        when(userAccountPublicService.getUserIdByEmail(USER_EMAIL)).thenReturn(USER_ID);
        when(trackRepository.findById(TRACK_ID)).thenReturn(Optional.of(publishedTrack));
        when(favoriteRepository.existsById(new FavoriteId(USER_ID, TRACK_ID))).thenReturn(true);

        assertThatNoException().isThrownBy(() -> favoriteService.addFavorite(USER_EMAIL, TRACK_ID));

        verify(favoriteRepository, never()).save(any(Favorite.class));
    }

    @Test
    @DisplayName("Lấy danh sách bài hát yêu thích thành công kèm thông tin nghệ sĩ và album")
    void getFavoriteTracks_Success() {
        when(userAccountPublicService.getUserIdByEmail(USER_EMAIL)).thenReturn(USER_ID);

        Favorite favorite = Favorite.builder()
                .id(new FavoriteId(USER_ID, TRACK_ID))
                .track(publishedTrack)
                .createdAt(java.time.LocalDateTime.now(java.time.ZoneOffset.UTC))
                .build();

        when(favoriteRepository.findFavoritesByUserIdAndPublicationStatus(USER_ID, TrackPublicationStatus.PUBLISHED))
                .thenReturn(java.util.List.of(favorite));

        groupone.soundwaveproject.authentication.dto.response.UserProfileSummary creatorProfile =
                new groupone.soundwaveproject.authentication.dto.response.UserProfileSummary(
                        20L, "artist@soundwave.com", "Ocean Artist", "https://cdn.soundwave.com/avatar.jpg", "LISTENER"
                );

        when(userAccountPublicService.getUserSummariesByIds(java.util.Set.of(20L)))
                .thenReturn(java.util.Map.of(20L, creatorProfile));

        java.util.List<groupone.soundwaveproject.catalog.dto.response.TrackResponse> results =
                favoriteService.getFavoriteTracks(USER_EMAIL);

        org.assertj.core.api.Assertions.assertThat(results).hasSize(1);
        groupone.soundwaveproject.catalog.dto.response.TrackResponse response = results.get(0);
        org.assertj.core.api.Assertions.assertThat(response.id()).isEqualTo(TRACK_ID);
        org.assertj.core.api.Assertions.assertThat(response.title()).isEqualTo("Ocean Waves");
        org.assertj.core.api.Assertions.assertThat(response.publicationStatus()).isEqualTo("PUBLISHED");
        org.assertj.core.api.Assertions.assertThat(response.creator().displayName()).isEqualTo("Ocean Artist");
        org.assertj.core.api.Assertions.assertThat(response.creator().avatarUrl()).isEqualTo("https://cdn.soundwave.com/avatar.jpg");
    }

    @Test
    @DisplayName("Trả về danh sách rỗng khi người dùng chưa like bài hát nào")
    void getFavoriteTracks_Empty() {
        when(userAccountPublicService.getUserIdByEmail(USER_EMAIL)).thenReturn(USER_ID);
        when(favoriteRepository.findFavoritesByUserIdAndPublicationStatus(USER_ID, TrackPublicationStatus.PUBLISHED))
                .thenReturn(java.util.Collections.emptyList());

        java.util.List<groupone.soundwaveproject.catalog.dto.response.TrackResponse> results =
                favoriteService.getFavoriteTracks(USER_EMAIL);

        org.assertj.core.api.Assertions.assertThat(results).isEmpty();
        verify(userAccountPublicService, never()).getUserSummariesByIds(any());
    }
}
