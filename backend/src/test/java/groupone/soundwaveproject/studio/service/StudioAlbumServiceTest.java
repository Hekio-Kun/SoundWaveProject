package groupone.soundwaveproject.studio.service;

import groupone.soundwaveproject.authentication.entity.AppUser;
import groupone.soundwaveproject.authentication.entity.Role;
import groupone.soundwaveproject.authentication.entity.UserStatus;
import groupone.soundwaveproject.authentication.repository.AppUserRepository;
import groupone.soundwaveproject.catalog.entity.Album;
import groupone.soundwaveproject.catalog.entity.Genre;
import groupone.soundwaveproject.catalog.entity.Track;
import groupone.soundwaveproject.catalog.entity.TrackPublicationStatus;
import groupone.soundwaveproject.catalog.repository.AlbumRepository;
import groupone.soundwaveproject.catalog.repository.TrackRepository;
import groupone.soundwaveproject.exception.ConflictOperationException;
import groupone.soundwaveproject.exception.ResourceNotFoundException;
import groupone.soundwaveproject.media.dto.response.StoredMediaResponse;
import groupone.soundwaveproject.media.service.CloudMediaService;
import groupone.soundwaveproject.studio.dto.request.CreateAlbumRequest;
import groupone.soundwaveproject.studio.dto.request.UpdateAlbumRequest;
import groupone.soundwaveproject.studio.dto.response.StudioAlbumResponse;
import groupone.soundwaveproject.studio.mapper.StudioAlbumMapper;
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

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudioAlbumServiceTest {

    @Mock
    private AlbumRepository albumRepository;

    @Mock
    private TrackRepository trackRepository;

    @Mock
    private AppUserRepository appUserRepository;

    @Mock
    private CloudMediaService cloudMediaService;

    private StudioTrackMapper studioTrackMapper;
    private StudioAlbumMapper studioAlbumMapper;

    private StudioAlbumService studioAlbumService;

    private AppUser mockUser;
    private Album mockAlbum;
    private Track mockTrack;

    @BeforeEach
    void setUp() {
        studioTrackMapper = new StudioTrackMapper();
        studioAlbumMapper = new StudioAlbumMapper(studioTrackMapper);
        studioAlbumService = new StudioAlbumService(
                albumRepository,
                trackRepository,
                appUserRepository,
                cloudMediaService,
                studioAlbumMapper,
                studioTrackMapper
        );

        Role role = new Role("LISTENER", "Listener", "Listener account");
        mockUser = new AppUser(role, "creator@soundwave.com", "hashed");
        mockUser.verifyEmail(java.time.LocalDateTime.now());
        org.springframework.test.util.ReflectionTestUtils.setField(mockUser, "id", 10L);

        mockAlbum = Album.builder()
                .id(100L)
                .createdByUserId(10L)
                .title("Ocean Waves EP")
                .slug("ocean-waves-ep-1")
                .status("DRAFT")
                .releaseDate(LocalDate.now())
                .build();

        Genre genre = Genre.builder().id(1L).name("Pop").slug("pop").build();
        mockTrack = Track.builder()
                .id(500L)
                .uploaderUserId(10L)
                .title("Sandy Shore")
                .slug("sandy-shore-1")
                .genre(genre)
                .publicationStatus(TrackPublicationStatus.DRAFT)
                .audioPublicId("audio-1")
                .audioUrl("https://cloudinary.com/audio-1.mp3")
                .audioFormat("mp3")
                .durationMs(180000)
                .build();
    }

    @Test
    @DisplayName("UC-21.1: Tạo album mới thành công ở trạng thái DRAFT")
    void createAlbum_Success_WithDraftStatus() {
        when(appUserRepository.findByEmailIgnoreCase(mockUser.getEmail())).thenReturn(Optional.of(mockUser));
        when(albumRepository.existsByCreatedByUserIdAndTitleIgnoreCase(10L, "Summer Sunset")).thenReturn(false);
        when(albumRepository.save(any(Album.class))).thenAnswer(invocation -> {
            Album a = invocation.getArgument(0);
            a.setId(101L);
            return a;
        });
        when(trackRepository.existsByAlbum_IdAndPublicationStatus(eq(101L), eq(TrackPublicationStatus.PUBLISHED)))
                .thenReturn(false);

        CreateAlbumRequest request = CreateAlbumRequest.builder()
                .title("Summer Sunset")
                .description("Chill ambient album")
                .releaseDate(LocalDate.of(2026, 10, 15))
                .build();

        StudioAlbumResponse response = studioAlbumService.createAlbum(request, null, mockUser.getEmail());

        assertThat(response).isNotNull();
        assertThat(response.getTitle()).isEqualTo("Summer Sunset");
        assertThat(response.getStatus()).isEqualTo("DRAFT");
        verify(albumRepository, atLeastOnce()).save(any(Album.class));
    }

    @Test
    @DisplayName("UC-21.1 EX01: Báo lỗi khi tạo album trùng tiêu đề trong cùng tài khoản")
    void createAlbum_DuplicateTitle_ThrowsConflict() {
        when(appUserRepository.findByEmailIgnoreCase(mockUser.getEmail())).thenReturn(Optional.of(mockUser));
        when(albumRepository.existsByCreatedByUserIdAndTitleIgnoreCase(10L, "Ocean Waves EP")).thenReturn(true);

        CreateAlbumRequest request = CreateAlbumRequest.builder()
                .title("Ocean Waves EP")
                .build();

        assertThatThrownBy(() -> studioAlbumService.createAlbum(request, null, mockUser.getEmail()))
                .isInstanceOf(ConflictOperationException.class)
                .hasMessageContaining("already exists in your library");

        verify(albumRepository, never()).save(any());
    }

    @Test
    @DisplayName("UC-21.1 BR-18/BR-22: Tự động chuyển sang PUBLISHED nếu album chứa bài hát đã duyệt")
    void createAlbum_WithPublishedTrack_AutoSetsPublishedStatus() {
        when(appUserRepository.findByEmailIgnoreCase(mockUser.getEmail())).thenReturn(Optional.of(mockUser));
        when(albumRepository.existsByCreatedByUserIdAndTitleIgnoreCase(10L, "Golden Sand")).thenReturn(false);
        when(albumRepository.save(any(Album.class))).thenAnswer(invocation -> {
            Album a = invocation.getArgument(0);
            if (a.getId() == null) a.setId(102L);
            return a;
        });

        Track publishedTrack = Track.builder()
                .id(501L)
                .uploaderUserId(10L)
                .title("Sunlight")
                .genre(mockTrack.getGenre())
                .publicationStatus(TrackPublicationStatus.PUBLISHED)
                .build();

        when(trackRepository.findByIdAndUploaderUserId(501L, 10L)).thenReturn(Optional.of(publishedTrack));
        when(trackRepository.save(any(Track.class))).thenReturn(publishedTrack);
        when(trackRepository.existsByAlbum_IdAndPublicationStatus(eq(102L), eq(TrackPublicationStatus.PUBLISHED)))
                .thenReturn(true);

        CreateAlbumRequest request = CreateAlbumRequest.builder()
                .title("Golden Sand")
                .trackIds(List.of(501L))
                .build();

        StudioAlbumResponse response = studioAlbumService.createAlbum(request, null, mockUser.getEmail());

        assertThat(response.getStatus()).isEqualTo("PUBLISHED");
        assertThat(response.getTrackCount()).isEqualTo(1);
    }

    @Test
    @DisplayName("UC-21.2: Lấy danh sách album của người dùng thành công")
    void getMyAlbums_Success() {
        when(appUserRepository.findByEmailIgnoreCase(mockUser.getEmail())).thenReturn(Optional.of(mockUser));
        when(albumRepository.findByCreatedByUserIdOrderByCreatedAtDesc(10L)).thenReturn(List.of(mockAlbum));
        when(trackRepository.countByAlbum_Id(mockAlbum.getId())).thenReturn(3L);

        List<StudioAlbumResponse> responses = studioAlbumService.getMyAlbums(mockUser.getEmail());

        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).getTitle()).isEqualTo("Ocean Waves EP");
        assertThat(responses.get(0).getTrackCount()).isEqualTo(3);
    }

    @Test
    @DisplayName("UC-21.2: Xem chi tiết album kèm bài hát")
    void getAlbumById_Success() {
        when(appUserRepository.findByEmailIgnoreCase(mockUser.getEmail())).thenReturn(Optional.of(mockUser));
        when(albumRepository.findByIdAndCreatedByUserId(100L, 10L)).thenReturn(Optional.of(mockAlbum));
        when(trackRepository.findByAlbum_IdOrderByTrackNumberAsc(100L)).thenReturn(List.of(mockTrack));

        StudioAlbumResponse response = studioAlbumService.getAlbumById(100L, mockUser.getEmail());

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(100L);
        assertThat(response.getTracks()).hasSize(1);
        assertThat(response.getTracks().get(0).title()).isEqualTo("Sandy Shore");
    }

    @Test
    @DisplayName("UC-21.2 EX01: Xem album không tồn tại hoặc không thuộc sở hữu ném lỗi 404")
    void getAlbumById_NotFound_ThrowsException() {
        when(appUserRepository.findByEmailIgnoreCase(mockUser.getEmail())).thenReturn(Optional.of(mockUser));
        when(albumRepository.findByIdAndCreatedByUserId(999L, 10L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> studioAlbumService.getAlbumById(999L, mockUser.getEmail()))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Album not found or access denied");
    }

    @Test
    @DisplayName("UC-21.3: Cập nhật album và thay đổi danh sách bài hát")
    void updateAlbum_Success_UpdatesMetadataAndTracks() {
        when(appUserRepository.findByEmailIgnoreCase(mockUser.getEmail())).thenReturn(Optional.of(mockUser));
        when(albumRepository.findByIdAndCreatedByUserId(100L, 10L)).thenReturn(Optional.of(mockAlbum));
        when(albumRepository.existsByCreatedByUserIdAndTitleIgnoreCaseAndIdNot(10L, "New Album Title", 100L))
                .thenReturn(false);
        when(albumRepository.save(any(Album.class))).thenAnswer(inv -> inv.getArgument(0));

        Track track1 = Track.builder().id(501L).uploaderUserId(10L).title("Track 1").build();
        when(trackRepository.findByIdAndUploaderUserId(501L, 10L)).thenReturn(Optional.of(track1));
        when(trackRepository.save(any(Track.class))).thenReturn(track1);

        UpdateAlbumRequest request = UpdateAlbumRequest.builder()
                .title("New Album Title")
                .description("Updated description")
                .trackIds(List.of(501L))
                .build();

        StudioAlbumResponse response = studioAlbumService.updateAlbum(100L, request, null, mockUser.getEmail());

        assertThat(response.getTitle()).isEqualTo("New Album Title");
        assertThat(response.getDescription()).isEqualTo("Updated description");
        verify(trackRepository).save(track1);
    }

    @Test
    @DisplayName("UC-21.4 BR-23/BR-24: Xóa album gỡ liên kết bài hát và xóa ảnh Cloudinary")
    void deleteAlbum_Success_UnlinksTracksAndDeletesMedia() {
        mockAlbum.setCoverPublicId("album-cover-pub-id");
        when(appUserRepository.findByEmailIgnoreCase(mockUser.getEmail())).thenReturn(Optional.of(mockUser));
        when(albumRepository.findByIdAndCreatedByUserId(100L, 10L)).thenReturn(Optional.of(mockAlbum));

        studioAlbumService.deleteAlbum(100L, mockUser.getEmail());

        // Phải gọi unlink các bài hát, không xóa bài hát
        verify(trackRepository).unlinkAlbumFromTracks(100L, 10L);
        // Phải dọn dẹp ảnh cũ trên Cloudinary
        verify(cloudMediaService).deleteImageQuietly("album-cover-pub-id");
        // Xóa entity album
        verify(albumRepository).delete(mockAlbum);
    }
}
