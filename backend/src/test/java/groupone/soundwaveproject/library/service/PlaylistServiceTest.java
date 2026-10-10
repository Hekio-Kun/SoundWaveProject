package groupone.soundwaveproject.library.service;

import groupone.soundwaveproject.authentication.entity.AppUser;
import groupone.soundwaveproject.authentication.entity.Role;
import groupone.soundwaveproject.authentication.entity.UserStatus;
import groupone.soundwaveproject.authentication.repository.AppUserRepository;
import groupone.soundwaveproject.authentication.service.UserAccountPublicService;
import groupone.soundwaveproject.catalog.entity.Genre;
import groupone.soundwaveproject.catalog.entity.Track;
import groupone.soundwaveproject.catalog.entity.TrackPublicationStatus;
import groupone.soundwaveproject.catalog.repository.TrackRepository;
import groupone.soundwaveproject.exception.BadRequestOperationException;
import groupone.soundwaveproject.exception.ConflictOperationException;
import groupone.soundwaveproject.exception.ForbiddenOperationException;
import groupone.soundwaveproject.library.dto.request.PlaylistRequest;
import groupone.soundwaveproject.library.dto.response.PlaylistResponse;
import groupone.soundwaveproject.library.entity.Playlist;
import groupone.soundwaveproject.library.entity.PlaylistTrack;
import groupone.soundwaveproject.library.repository.PlaylistRepository;
import groupone.soundwaveproject.library.repository.PlaylistTrackRepository;
import groupone.soundwaveproject.media.service.CloudMediaService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PlaylistServiceTest {

    @Mock
    private PlaylistRepository playlistRepository;

    @Mock
    private PlaylistTrackRepository playlistTrackRepository;

    @Mock
    private TrackRepository trackRepository;

    @Mock
    private AppUserRepository appUserRepository;

    @Mock
    private UserAccountPublicService userAccountPublicService;

    @Mock
    private CloudMediaService cloudMediaService;

    @InjectMocks
    private PlaylistService playlistService;

    private AppUser mockUser;
    private Playlist mockPlaylist;

    @BeforeEach
    void setUp() {
        Role role = new Role("LISTENER", "Listener", "Regular listener");
        mockUser = new AppUser(role, "listener@soundwave.com", "hashed_pwd");
        ReflectionTestUtils.setField(mockUser, "id", 10L);
        ReflectionTestUtils.setField(mockUser, "status", UserStatus.ACTIVE);

        mockPlaylist = Playlist.builder()
                .id(100L)
                .createdByUserId(10L)
                .title("Chill Vibes")
                .slug("chill-vibes")
                .description("Relaxing tracks")
                .coverUrl("https://cloudinary.com/cover.jpg")
                .isPrivate(false)
                .createdAt(LocalDateTime.now(ZoneOffset.UTC))
                .updatedAt(LocalDateTime.now(ZoneOffset.UTC))
                .playlistTracks(new ArrayList<>())
                .build();
    }

    @Test
    @DisplayName("Tạo Playlist thành công khi nhập tiêu đề hợp lệ")
    void createPlaylist_success() {
        when(appUserRepository.findByEmailIgnoreCase("listener@soundwave.com")).thenReturn(Optional.of(mockUser));
        when(playlistRepository.existsBySlug(anyString())).thenReturn(false);
        when(playlistRepository.save(any(Playlist.class))).thenAnswer(invocation -> {
            Playlist p = invocation.getArgument(0);
            ReflectionTestUtils.setField(p, "id", 100L);
            return p;
        });
        when(playlistTrackRepository.findByPlaylist_IdOrderByPositionAsc(100L)).thenReturn(List.of());

        PlaylistRequest request = new PlaylistRequest("Chill Vibes", "Relaxing tracks", false, "https://cloudinary.com/cover.jpg");
        PlaylistResponse response = playlistService.createPlaylist(request, "listener@soundwave.com");

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(100L);
        assertThat(response.title()).isEqualTo("Chill Vibes");
        assertThat(response.isPrivate()).isFalse();
        verify(playlistRepository).save(any(Playlist.class));
    }

    @Test
    @DisplayName("Ném BadRequestOperationException khi tạo Playlist với tiêu đề rỗng")
    void createPlaylist_blankTitle() {
        when(appUserRepository.findByEmailIgnoreCase("listener@soundwave.com")).thenReturn(Optional.of(mockUser));

        PlaylistRequest request = new PlaylistRequest("   ", "Description", false, null);

        assertThatThrownBy(() -> playlistService.createPlaylist(request, "listener@soundwave.com"))
                .isInstanceOf(BadRequestOperationException.class);
    }

    @Test
    @DisplayName("Lấy danh sách Playlist của người dùng hiện tại")
    void getMyPlaylists_success() {
        when(appUserRepository.findByEmailIgnoreCase("listener@soundwave.com")).thenReturn(Optional.of(mockUser));
        when(playlistRepository.findByCreatedByUserIdOrderByCreatedAtDesc(10L)).thenReturn(List.of(mockPlaylist));
        when(playlistTrackRepository.findByPlaylist_IdOrderByPositionAsc(100L)).thenReturn(List.of());

        List<PlaylistResponse> result = playlistService.getMyPlaylists("listener@soundwave.com");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).title()).isEqualTo("Chill Vibes");
    }

    @Test
    @DisplayName("Không cho phép xem Playlist riêng tư nếu không phải chủ sở hữu")
    void getPlaylistById_forbiddenIfPrivateAndNotOwner() {
        mockPlaylist.setPrivate(true);
        when(playlistRepository.findById(100L)).thenReturn(Optional.of(mockPlaylist));

        AppUser otherUser = new AppUser(new Role("LISTENER", "Listener", "Regular listener"), "other@soundwave.com", "pwd");
        ReflectionTestUtils.setField(otherUser, "id", 99L);
        ReflectionTestUtils.setField(otherUser, "status", UserStatus.ACTIVE);
        when(appUserRepository.findByEmailIgnoreCase("other@soundwave.com")).thenReturn(Optional.of(otherUser));

        assertThatThrownBy(() -> playlistService.getPlaylistById(100L, "other@soundwave.com"))
                .isInstanceOf(ForbiddenOperationException.class);
    }

    @Test
    @DisplayName("Cập nhật Playlist thành công")
    void updatePlaylist_success() {
        when(appUserRepository.findByEmailIgnoreCase("listener@soundwave.com")).thenReturn(Optional.of(mockUser));
        when(playlistRepository.findById(100L)).thenReturn(Optional.of(mockPlaylist));
        when(playlistRepository.save(any(Playlist.class))).thenReturn(mockPlaylist);
        when(playlistTrackRepository.findByPlaylist_IdOrderByPositionAsc(100L)).thenReturn(List.of());

        PlaylistRequest request = new PlaylistRequest("Updated Title", "Updated Description", true, null);
        PlaylistResponse response = playlistService.updatePlaylist(100L, request, "listener@soundwave.com");

        assertThat(response).isNotNull();
        assertThat(mockPlaylist.getTitle()).isEqualTo("Updated Title");
        assertThat(mockPlaylist.isPrivate()).isTrue();
    }

    @Test
    @DisplayName("Xóa Playlist và toàn bộ liên kết playlist_tracks thành công")
    void deletePlaylist_success() {
        when(appUserRepository.findByEmailIgnoreCase("listener@soundwave.com")).thenReturn(Optional.of(mockUser));
        when(playlistRepository.findById(100L)).thenReturn(Optional.of(mockPlaylist));

        playlistService.deletePlaylist(100L, "listener@soundwave.com");

        verify(playlistTrackRepository).deleteByPlaylist_Id(100L);
        verify(playlistRepository).delete(mockPlaylist);
    }

    @Test
    @DisplayName("Thêm bài hát vào playlist thất bại nếu bài hát đã tồn tại trong playlist")
    void addTrackToPlaylist_alreadyExists() {
        when(appUserRepository.findByEmailIgnoreCase("listener@soundwave.com")).thenReturn(Optional.of(mockUser));
        when(playlistRepository.findById(100L)).thenReturn(Optional.of(mockPlaylist));

        Track track = Track.builder().id(50L).title("Song").build();
        when(trackRepository.findById(50L)).thenReturn(Optional.of(track));
        when(playlistTrackRepository.existsByPlaylist_IdAndTrack_Id(100L, 50L)).thenReturn(true);

        assertThatThrownBy(() -> playlistService.addTrackToPlaylist(100L, 50L, "listener@soundwave.com"))
                .isInstanceOf(ConflictOperationException.class);
    }
}
