package groupone.soundwaveproject.studio.service;

import groupone.soundwaveproject.authentication.entity.User;
import groupone.soundwaveproject.authentication.entity.UserStatus;
import groupone.soundwaveproject.authentication.repository.UserRepository;
import groupone.soundwaveproject.catalog.entity.Album;
import groupone.soundwaveproject.catalog.entity.Genre;
import groupone.soundwaveproject.catalog.entity.Track;
import groupone.soundwaveproject.catalog.entity.TrackPublicationStatus;
import groupone.soundwaveproject.catalog.repository.AlbumRepository;
import groupone.soundwaveproject.catalog.repository.GenreRepository;
import groupone.soundwaveproject.catalog.repository.TrackRepository;
import groupone.soundwaveproject.lyrics.repository.OfficialLyricRepository;
import groupone.soundwaveproject.exception.BadRequestOperationException;
import groupone.soundwaveproject.exception.ConflictOperationException;
import groupone.soundwaveproject.exception.ResourceNotFoundException;
import groupone.soundwaveproject.library.repository.ListeningHistoryRepository;
import groupone.soundwaveproject.library.repository.PlaylistTrackRepository;
import groupone.soundwaveproject.media.dto.response.StoredAudioResponse;
import groupone.soundwaveproject.media.dto.response.StoredMediaResponse;
import groupone.soundwaveproject.media.exception.CloudStorageUnavailableException;
import groupone.soundwaveproject.media.service.CloudMediaService;
import groupone.soundwaveproject.moderation.entity.TrackSubmission;
import groupone.soundwaveproject.moderation.repository.TrackSubmissionRepository;
import groupone.soundwaveproject.studio.dto.request.AlbumTrackItemRequest;
import groupone.soundwaveproject.studio.dto.request.CreateAlbumRequest;
import groupone.soundwaveproject.studio.dto.request.UpdateAlbumRequest;
import groupone.soundwaveproject.studio.dto.response.StudioAlbumResponse;
import groupone.soundwaveproject.studio.mapper.StudioAlbumMapper;
import groupone.soundwaveproject.studio.mapper.StudioTrackMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudioAlbumServiceTest {

    @Mock
    private AlbumRepository albumRepository;

    @Mock
    private TrackRepository trackRepository;

    @Mock
    private GenreRepository genreRepository;

    @Mock
    private PlaylistTrackRepository playlistTrackRepository;

    @Mock
    private ListeningHistoryRepository listeningHistoryRepository;

    @Mock
    private TrackSubmissionRepository trackSubmissionRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CloudMediaService cloudMediaService;

    @Mock
    private StudioTrackService studioTrackService;

    @Mock
    private groupone.soundwaveproject.lyrics.service.LyricService lyricService;

    private StudioTrackMapper studioTrackMapper;
    private StudioAlbumMapper studioAlbumMapper;

    private StudioAlbumService studioAlbumService;

    private User mockUser;
    private Album mockAlbum;
    private Track mockTrack;

    @BeforeEach
    void setUp() {
        studioTrackMapper = new StudioTrackMapper();
        studioAlbumMapper = new StudioAlbumMapper(studioTrackMapper);
        studioAlbumService = new StudioAlbumService(
                albumRepository,
                trackRepository,
                genreRepository,
                playlistTrackRepository,
                listeningHistoryRepository,
                trackSubmissionRepository,
                userRepository,
                cloudMediaService,
                studioAlbumMapper,
                studioTrackMapper,
                studioTrackService,
                lyricService
        );

        mockUser = new User("creator@soundwave.com", "hashed");
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

        Genre genre = Genre.builder().id(1L).name("Pop").slug("pop").isActive(true).build();
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
        when(userRepository.findByEmailIgnoreCase(mockUser.getEmail())).thenReturn(Optional.of(mockUser));
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
    @DisplayName("UC-21.1: Tạo album trọn gói kèm upload nhiều bài hát thành công")
    void createAlbum_WithConstituentTracks_Success() {
        when(userRepository.findByEmailIgnoreCase(mockUser.getEmail())).thenReturn(Optional.of(mockUser));
        when(albumRepository.existsByCreatedByUserIdAndTitleIgnoreCase(10L, "New Package Album")).thenReturn(false);
        when(albumRepository.save(any(Album.class))).thenAnswer(inv -> {
            Album a = inv.getArgument(0);
            a.setId(200L);
            return a;
        });

        Genre genre = Genre.builder().id(1L).name("Pop").isActive(true).build();
        when(genreRepository.findById(1L)).thenReturn(Optional.of(genre));
        when(cloudMediaService.uploadTrackAudio(any(), eq(10L))).thenReturn(
                new StoredAudioResponse("audio-pub-1", "https://cloud/audio.mp3", "mp3", 200000)
        );
        when(trackRepository.save(any(Track.class))).thenAnswer(inv -> inv.getArgument(0));

        AlbumTrackItemRequest trackItem = AlbumTrackItemRequest.builder()
                .title("Track 1")
                .genreId(1L)
                .trackNumber(1)
                .build();

        CreateAlbumRequest request = CreateAlbumRequest.builder()
                .title("New Package Album")
                .submitForReview(true)
                .tracks(List.of(trackItem))
                .build();

        MockMultipartFile audioFile = new MockMultipartFile("audioFiles", "track1.mp3", "audio/mpeg", new byte[]{1, 2, 3});

        StudioAlbumResponse response = studioAlbumService.createAlbum(request, null, List.of(audioFile), mockUser.getEmail());

        assertThat(response).isNotNull();
        assertThat(response.getTitle()).isEqualTo("New Package Album");
        assertThat(response.getStatus()).isEqualTo("PENDING");
        assertThat(response.getTrackCount()).isEqualTo(1);
        verify(trackSubmissionRepository).save(any());
        verify(trackRepository).save(any(Track.class));
    }

    @Test
    @DisplayName("UC-21.1 EX01: Báo lỗi khi tạo album trùng tiêu đề trong cùng tài khoản")
    void createAlbum_DuplicateTitle_ThrowsConflict() {
        when(userRepository.findByEmailIgnoreCase(mockUser.getEmail())).thenReturn(Optional.of(mockUser));
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
        when(userRepository.findByEmailIgnoreCase(mockUser.getEmail())).thenReturn(Optional.of(mockUser));
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
        when(userRepository.findByEmailIgnoreCase(mockUser.getEmail())).thenReturn(Optional.of(mockUser));
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
        when(userRepository.findByEmailIgnoreCase(mockUser.getEmail())).thenReturn(Optional.of(mockUser));
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
        when(userRepository.findByEmailIgnoreCase(mockUser.getEmail())).thenReturn(Optional.of(mockUser));
        when(albumRepository.findByIdAndCreatedByUserId(999L, 10L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> studioAlbumService.getAlbumById(999L, mockUser.getEmail()))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Album not found or access denied");
    }

    @Test
    @DisplayName("UC-21.2: Nộp album cho Staff kiểm duyệt chuyển trạng thái Album và bài hát sang PENDING")
    void submitAlbumForReview_Success_TransitionsToPending() {
        when(userRepository.findByEmailIgnoreCase(mockUser.getEmail())).thenReturn(Optional.of(mockUser));
        when(albumRepository.findByIdAndCreatedByUserId(100L, 10L)).thenReturn(Optional.of(mockAlbum));
        when(trackRepository.findByAlbum_IdOrderByTrackNumberAsc(100L)).thenReturn(List.of(mockTrack));
        when(trackRepository.save(any(Track.class))).thenAnswer(inv -> inv.getArgument(0));
        when(albumRepository.save(any(Album.class))).thenAnswer(inv -> inv.getArgument(0));

        StudioAlbumResponse response = studioAlbumService.submitAlbumForReview(100L, mockUser.getEmail());

        assertThat(response.getStatus()).isEqualTo("PENDING");
        assertThat(mockAlbum.getStatus()).isEqualTo("PENDING");
        assertThat(mockTrack.getPublicationStatus()).isEqualTo(TrackPublicationStatus.PENDING);
        verify(trackSubmissionRepository).save(any(TrackSubmission.class));
        verify(albumRepository).save(mockAlbum);
    }

    @Test
    @DisplayName("UC-21.2 EX: Báo lỗi Conflict khi nộp album đã ở trạng thái PENDING")
    void submitAlbumForReview_AlreadyPending_ThrowsConflict() {
        mockAlbum.setStatus("PENDING");
        when(userRepository.findByEmailIgnoreCase(mockUser.getEmail())).thenReturn(Optional.of(mockUser));
        when(albumRepository.findByIdAndCreatedByUserId(100L, 10L)).thenReturn(Optional.of(mockAlbum));

        assertThatThrownBy(() -> studioAlbumService.submitAlbumForReview(100L, mockUser.getEmail()))
                .isInstanceOf(ConflictOperationException.class)
                .hasMessageContaining("already been submitted and is currently pending review");
    }

    @Test
    @DisplayName("UC-21.2 EX: Báo lỗi Conflict khi nộp album đã ở trạng thái PUBLISHED")
    void submitAlbumForReview_AlreadyPublished_ThrowsConflict() {
        mockAlbum.setStatus("PUBLISHED");
        when(userRepository.findByEmailIgnoreCase(mockUser.getEmail())).thenReturn(Optional.of(mockUser));
        when(albumRepository.findByIdAndCreatedByUserId(100L, 10L)).thenReturn(Optional.of(mockAlbum));

        assertThatThrownBy(() -> studioAlbumService.submitAlbumForReview(100L, mockUser.getEmail()))
                .isInstanceOf(ConflictOperationException.class)
                .hasMessageContaining("already published");
    }

    @Test
    @DisplayName("UC-21.2 EX01: Báo lỗi BadRequest khi nộp album không có bài hát nào")
    void submitAlbumForReview_EmptyAlbum_ThrowsBadRequest() {
        when(userRepository.findByEmailIgnoreCase(mockUser.getEmail())).thenReturn(Optional.of(mockUser));
        when(albumRepository.findByIdAndCreatedByUserId(100L, 10L)).thenReturn(Optional.of(mockAlbum));
        when(trackRepository.findByAlbum_IdOrderByTrackNumberAsc(100L)).thenReturn(Collections.emptyList());

        assertThatThrownBy(() -> studioAlbumService.submitAlbumForReview(100L, mockUser.getEmail()))
                .isInstanceOf(BadRequestOperationException.class)
                .hasMessageContaining("Cannot submit an empty album");
    }

    @Test
    @DisplayName("UC-21.3: Cập nhật album và thay đổi danh sách bài hát")
    void updateAlbum_Success_UpdatesMetadataAndTracks() {
        when(userRepository.findByEmailIgnoreCase(mockUser.getEmail())).thenReturn(Optional.of(mockUser));
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
    @DisplayName("UC-21.6: Xóa album xóa toàn bộ các bài hát cấu thành và xóa ảnh Cloudinary")
    void deleteAlbum_Success_DeletesAllConstituentTracksAndMedia() {
        mockAlbum.setCoverPublicId("album-cover-pub-id");
        when(userRepository.findByEmailIgnoreCase(mockUser.getEmail())).thenReturn(Optional.of(mockUser));
        when(albumRepository.findByIdAndCreatedByUserId(100L, 10L)).thenReturn(Optional.of(mockAlbum));
        when(trackRepository.findByAlbum_IdOrderByTrackNumberAsc(100L)).thenReturn(List.of(mockTrack));

        studioAlbumService.deleteAlbum(100L, mockUser.getEmail());

        verify(studioTrackService).deleteTrack(mockTrack.getId(), mockUser.getEmail());
        verify(cloudMediaService).deleteImageQuietly("album-cover-pub-id");
        verify(albumRepository).delete(mockAlbum);
    }

    @Test
    @DisplayName("UC-21.1 EX: Báo lỗi khi tạo album với tiêu đề để trống")
    void createAlbum_BlankTitle_ThrowsBadRequest() {
        CreateAlbumRequest request = CreateAlbumRequest.builder().title("   ").build();
        assertThatThrownBy(() -> studioAlbumService.createAlbum(request, null, mockUser.getEmail()))
                .isInstanceOf(BadRequestOperationException.class)
                .hasMessageContaining("Album title is required");
    }

    @Test
    @DisplayName("UC-21.1 EX: Báo lỗi khi tiêu đề album vượt quá 200 ký tự")
    void createAlbum_TitleTooLong_ThrowsBadRequest() {
        String longTitle = "A".repeat(201);
        CreateAlbumRequest request = CreateAlbumRequest.builder().title(longTitle).build();
        assertThatThrownBy(() -> studioAlbumService.createAlbum(request, null, mockUser.getEmail()))
                .isInstanceOf(BadRequestOperationException.class)
                .hasMessageContaining("must not exceed 200 characters");
    }

    @Test
    @DisplayName("UC-21.1 EX: Báo lỗi khi gửi kiểm duyệt album trống không có bài hát nào")
    void createAlbum_SubmitForReviewWithNoTracks_ThrowsBadRequest() {
        when(userRepository.findByEmailIgnoreCase(mockUser.getEmail())).thenReturn(Optional.of(mockUser));
        when(albumRepository.existsByCreatedByUserIdAndTitleIgnoreCase(10L, "Empty Album")).thenReturn(false);

        CreateAlbumRequest request = CreateAlbumRequest.builder()
                .title("Empty Album")
                .submitForReview(true)
                .tracks(Collections.emptyList())
                .build();

        assertThatThrownBy(() -> studioAlbumService.createAlbum(request, null, mockUser.getEmail()))
                .isInstanceOf(BadRequestOperationException.class)
                .hasMessageContaining("An album must contain at least one track to be submitted for review");
    }

    @Test
    @DisplayName("UC-21.1 EX: Tự động dọn dẹp (compensating rollback) media đã tải lên Cloudinary khi xảy ra lỗi")
    void createAlbum_CloudinaryFailure_RollsBackUploadedMediaAndThrows() {
        when(userRepository.findByEmailIgnoreCase(mockUser.getEmail())).thenReturn(Optional.of(mockUser));
        when(albumRepository.existsByCreatedByUserIdAndTitleIgnoreCase(10L, "Crash Album")).thenReturn(false);

        MockMultipartFile coverFile = new MockMultipartFile("cover", "cover.png", "image/png", new byte[]{1, 2});
        when(cloudMediaService.uploadAlbumCover(any(), eq(10L)))
                .thenReturn(new StoredMediaResponse("uploaded-cover-id", "https://cloud/cover.png"));

        lenient().when(albumRepository.save(any(Album.class))).thenAnswer(inv -> {
            Album a = inv.getArgument(0);
            a.setId(999L);
            return a;
        });

        Genre genre = Genre.builder().id(1L).name("Pop").isActive(true).build();
        lenient().when(genreRepository.findById(1L)).thenReturn(Optional.of(genre));
        when(cloudMediaService.uploadTrackAudio(any(), eq(10L)))
                .thenThrow(new CloudStorageUnavailableException());

        AlbumTrackItemRequest trackItem = AlbumTrackItemRequest.builder()
                .title("Track 1")
                .genreId(1L)
                .build();

        CreateAlbumRequest request = CreateAlbumRequest.builder()
                .title("Crash Album")
                .tracks(List.of(trackItem))
                .build();

        MockMultipartFile audioFile = new MockMultipartFile("audioFiles", "track1.mp3", "audio/mpeg", new byte[]{1, 2, 3});

        assertThatThrownBy(() -> studioAlbumService.createAlbum(request, coverFile, List.of(audioFile), mockUser.getEmail()))
                .isInstanceOf(CloudStorageUnavailableException.class);

        // Xác nhận ảnh bìa đã upload phải được dọn dẹp ngay lập tức
        verify(cloudMediaService).deleteImageQuietly("uploaded-cover-id");
    }

    @Test
    @DisplayName("UC-21.2 EX: Báo lỗi BadRequest khi ID album không hợp lệ (<= 0 hoặc null)")
    void getAlbumById_InvalidId_ThrowsBadRequest() {
        assertThatThrownBy(() -> studioAlbumService.getAlbumById(-1L, mockUser.getEmail()))
                .isInstanceOf(BadRequestOperationException.class)
                .hasMessageContaining("Invalid album ID");
    }

    @Test
    @DisplayName("UC-21.3 EX: Báo lỗi khi cập nhật gán bài hát đã thuộc album khác")
    void updateAlbum_TrackBelongsToAnotherAlbum_ThrowsBadRequest() {
        when(userRepository.findByEmailIgnoreCase(mockUser.getEmail())).thenReturn(Optional.of(mockUser));
        when(albumRepository.findByIdAndCreatedByUserId(100L, 10L)).thenReturn(Optional.of(mockAlbum));
        when(albumRepository.existsByCreatedByUserIdAndTitleIgnoreCaseAndIdNot(10L, "New Album Title", 100L)).thenReturn(false);

        Album otherAlbum = Album.builder().id(200L).title("Other Album").build();
        Track stolenTrack = Track.builder().id(600L).uploaderUserId(10L).title("Belongs to Other").album(otherAlbum).build();
        when(trackRepository.findByIdAndUploaderUserId(600L, 10L)).thenReturn(Optional.of(stolenTrack));

        UpdateAlbumRequest request = UpdateAlbumRequest.builder()
                .title("New Album Title")
                .trackIds(List.of(600L))
                .build();

        assertThatThrownBy(() -> studioAlbumService.updateAlbum(100L, request, null, mockUser.getEmail()))
                .isInstanceOf(BadRequestOperationException.class)
                .hasMessageContaining("already belongs to another album");
    }

    @Test
    @DisplayName("UC-21.4 EX: Báo lỗi BadRequest khi xóa album với ID không hợp lệ")
    void deleteAlbum_InvalidId_ThrowsBadRequest() {
        assertThatThrownBy(() -> studioAlbumService.deleteAlbum(0L, mockUser.getEmail()))
                .isInstanceOf(BadRequestOperationException.class)
                .hasMessageContaining("Invalid album ID");
    }
}
