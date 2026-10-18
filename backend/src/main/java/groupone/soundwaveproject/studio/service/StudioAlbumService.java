package groupone.soundwaveproject.studio.service;

import groupone.soundwaveproject.authentication.entity.AppUser;
import groupone.soundwaveproject.authentication.entity.UserStatus;
import groupone.soundwaveproject.authentication.exception.AccountBannedException;
import groupone.soundwaveproject.authentication.exception.AccountUnavailableException;
import groupone.soundwaveproject.authentication.exception.AuthenticationException;
import groupone.soundwaveproject.authentication.repository.AppUserRepository;
import groupone.soundwaveproject.catalog.entity.Album;
import groupone.soundwaveproject.catalog.entity.Genre;
import groupone.soundwaveproject.catalog.entity.Track;
import groupone.soundwaveproject.catalog.entity.TrackPublicationStatus;
import groupone.soundwaveproject.catalog.repository.AlbumRepository;
import groupone.soundwaveproject.catalog.repository.GenreRepository;
import groupone.soundwaveproject.catalog.repository.TrackRepository;
import groupone.soundwaveproject.exception.BadRequestOperationException;
import groupone.soundwaveproject.exception.ConflictOperationException;
import groupone.soundwaveproject.exception.ResourceNotFoundException;
import groupone.soundwaveproject.library.repository.ListeningHistoryRepository;
import groupone.soundwaveproject.library.repository.PlaylistTrackRepository;
import groupone.soundwaveproject.media.dto.response.StoredAudioResponse;
import groupone.soundwaveproject.media.dto.response.StoredMediaResponse;
import groupone.soundwaveproject.media.service.CloudMediaService;
import groupone.soundwaveproject.moderation.entity.SubmissionStatus;
import groupone.soundwaveproject.moderation.entity.TrackSubmission;
import groupone.soundwaveproject.moderation.repository.TrackSubmissionRepository;
import groupone.soundwaveproject.studio.dto.request.AlbumTrackItemRequest;
import groupone.soundwaveproject.studio.dto.request.CreateAlbumRequest;
import groupone.soundwaveproject.studio.dto.request.UpdateAlbumRequest;
import groupone.soundwaveproject.studio.dto.response.StudioAlbumResponse;
import groupone.soundwaveproject.studio.dto.response.StudioTrackResponse;
import groupone.soundwaveproject.studio.mapper.StudioAlbumMapper;
import groupone.soundwaveproject.studio.mapper.StudioTrackMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.text.Normalizer;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.*;
import java.util.regex.Pattern;

/**
 * Service xử lý nghiệp vụ quản lý Album của nghệ sĩ/Listener (UC-21.1 đến UC-21.4).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class StudioAlbumService {

    private final AlbumRepository albumRepository;
    private final TrackRepository trackRepository;
    private final GenreRepository genreRepository;
    private final PlaylistTrackRepository playlistTrackRepository;
    private final ListeningHistoryRepository listeningHistoryRepository;
    private final TrackSubmissionRepository trackSubmissionRepository;
    private final AppUserRepository appUserRepository;
    private final CloudMediaService cloudMediaService;
    private final StudioAlbumMapper studioAlbumMapper;
    private final StudioTrackMapper studioTrackMapper;

    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    /**
     * Lấy danh sách toàn bộ Album do người dùng hiện tại tạo ra (UC-21.2 View Albums).
     *
     * @param currentUserEmail Email của tài khoản đang đăng nhập
     * @return Danh sách DTO Album kèm số lượng bài hát và thông tin tóm tắt
     */
    @Transactional(readOnly = true)
    public List<StudioAlbumResponse> getMyAlbums(String currentUserEmail) {
        AppUser user = getAuthenticatedUser(currentUserEmail);
        List<Album> albums = albumRepository.findByCreatedByUserIdOrderByCreatedAtDesc(user.getId());

        return albums.stream()
                .map(album -> {
                    long trackCount = trackRepository.countByAlbum_Id(album.getId());
                    return studioAlbumMapper.toStudioAlbumResponse(album, (int) trackCount, Collections.emptyList());
                })
                .toList();
    }

    /**
     * Xem thông tin chi tiết một Album cụ thể cùng danh sách bài hát bên trong (UC-21.2 View Albums).
     *
     * @param id               ID của Album cần xem
     * @param currentUserEmail Email của tài khoản đang đăng nhập
     * @return DTO chi tiết Album kèm danh sách bài hát theo thứ tự trackNumber
     */
    @Transactional(readOnly = true)
    public StudioAlbumResponse getAlbumById(Long id, String currentUserEmail) {
        if (id == null || id <= 0) {
            throw new BadRequestOperationException("INVALID_ID", "Invalid album ID.");
        }
        AppUser user = getAuthenticatedUser(currentUserEmail);
        Album album = albumRepository.findByIdAndCreatedByUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Album not found or access denied."));

        List<Track> tracks = trackRepository.findByAlbum_IdOrderByTrackNumberAsc(album.getId());
        return studioAlbumMapper.toStudioAlbumResponse(album, tracks.size(), tracks);
    }

    /**
     * Tạo mới một Album và upload toàn bộ bài hát cấu thành cùng lúc (UC-21.1 Create Album).
     * Hỗ trợ lưu DRAFT (AF01) hoặc gửi phê duyệt PENDING (NF01).
     *
     * @param request          Dữ liệu tạo album kèm danh sách metadata các bài hát
     * @param cover            File ảnh bìa album (tùy chọn)
     * @param audioFiles       Danh sách file âm thanh tương ứng với từng bài hát
     * @param currentUserEmail Email của tài khoản đang đăng nhập
     * @return DTO Album vừa được tạo
     */
    @Transactional
    public StudioAlbumResponse createAlbum(
            CreateAlbumRequest request,
            MultipartFile cover,
            List<MultipartFile> audioFiles,
            String currentUserEmail
    ) {
        if (request == null) {
            throw new BadRequestOperationException("MISSING_PAYLOAD", "Album creation request payload is required.");
        }
        if (request.getTitle() == null || request.getTitle().trim().isBlank()) {
            throw new BadRequestOperationException("TITLE_REQUIRED", "Album title is required.");
        }
        String cleanTitle = request.getTitle().trim();
        if (cleanTitle.length() > 200) {
            throw new BadRequestOperationException("TITLE_TOO_LONG", "Album title must not exceed 200 characters.");
        }
        if (request.getDescription() != null && request.getDescription().trim().length() > 2000) {
            throw new BadRequestOperationException("DESCRIPTION_TOO_LONG", "Album description must not exceed 2000 characters.");
        }

        AppUser user = getAuthenticatedUser(currentUserEmail);

        // 1. Kiểm tra tính duy nhất của tên Album theo từng tài khoản (EX01)
        if (albumRepository.existsByCreatedByUserIdAndTitleIgnoreCase(user.getId(), cleanTitle)) {
            throw new ConflictOperationException("An album with the title '" + cleanTitle + "' already exists in your library.");
        }

        boolean isSubmit = Boolean.TRUE.equals(request.getSubmitForReview());
        boolean hasTracks = request.getTracks() != null && !request.getTracks().isEmpty();
        boolean hasTrackIds = request.getTrackIds() != null && !request.getTrackIds().isEmpty();

        if (isSubmit && !hasTracks && !hasTrackIds) {
            throw new BadRequestOperationException("EMPTY_ALBUM_SUBMISSION", "An album must contain at least one track to be submitted for review.");
        }

        // Validate metadata của toàn bộ track trước khi gọi Cloudinary
        if (hasTracks) {
            if (audioFiles == null || audioFiles.isEmpty()) {
                throw new BadRequestOperationException("Audio files are required for constituent album tracks.");
            }
            for (int i = 0; i < request.getTracks().size(); i++) {
                AlbumTrackItemRequest item = request.getTracks().get(i);
                if (item == null || item.getTitle() == null || item.getTitle().trim().isBlank()) {
                    throw new BadRequestOperationException("Track title is required for track #" + (i + 1) + ".");
                }
                if (item.getTitle().trim().length() > 200) {
                    throw new BadRequestOperationException("Track title must not exceed 200 characters for track #" + (i + 1) + ".");
                }
                if (item.getGenreId() == null || item.getGenreId() <= 0) {
                    throw new BadRequestOperationException("Genre is required for track '" + item.getTitle().trim() + "'.");
                }
                int fileIndex = item.getAudioIndex() != null ? item.getAudioIndex() : i;
                if (fileIndex < 0 || fileIndex >= audioFiles.size()) {
                    throw new BadRequestOperationException("Audio file index out of bounds for track '" + item.getTitle().trim() + "'.");
                }
                MultipartFile audioFile = audioFiles.get(fileIndex);
                if (audioFile == null || audioFile.isEmpty()) {
                    throw new BadRequestOperationException("Audio file is required for track '" + item.getTitle().trim() + "'.");
                }
            }
        }

        List<String> uploadedAudioPublicIds = new ArrayList<>();
        String uploadedCoverPublicId = null;

        try {
            // 2. Upload ảnh bìa album lên Cloudinary nếu có (UC-30)
            StoredMediaResponse storedCover = null;
            if (cover != null && !cover.isEmpty()) {
                storedCover = cloudMediaService.uploadAlbumCover(cover, user.getId());
                uploadedCoverPublicId = storedCover.publicId();
            }

            String initialAlbumStatus = "DRAFT";
            TrackPublicationStatus initialTrackStatus = isSubmit ? TrackPublicationStatus.PENDING : TrackPublicationStatus.DRAFT;
            String uniqueSlug = generateUniqueSlug(cleanTitle);

            Album album = Album.builder()
                    .createdByUserId(user.getId())
                    .title(cleanTitle)
                    .slug(uniqueSlug)
                    .description(request.getDescription() != null ? request.getDescription().trim() : null)
                    .releaseDate(request.getReleaseDate())
                    .status(initialAlbumStatus)
                    .coverPublicId(storedCover != null ? storedCover.publicId() : null)
                    .coverUrl(storedCover != null ? storedCover.secureUrl() : null)
                    .build();

            Album savedAlbum = albumRepository.save(album);
            List<Track> constituentTracks = new ArrayList<>();

            // 3. Quy trình tải lên toàn bộ bài hát cấu thành album cùng một lượt (UC-21.1)
            if (hasTracks) {
                for (int i = 0; i < request.getTracks().size(); i++) {
                    AlbumTrackItemRequest item = request.getTracks().get(i);
                    int fileIndex = item.getAudioIndex() != null ? item.getAudioIndex() : i;
                    MultipartFile audioFile = audioFiles.get(fileIndex);

                    Genre genre = genreRepository.findById(item.getGenreId())
                            .orElseThrow(() -> new BadRequestOperationException("Selected genre for track '" + item.getTitle() + "' is invalid."));
                    if (!Boolean.TRUE.equals(genre.getIsActive())) {
                        throw new BadRequestOperationException("Selected genre '" + genre.getName() + "' is currently inactive.");
                    }

                    // Upload tệp âm thanh lên Cloudinary
                    StoredAudioResponse audioResponse = cloudMediaService.uploadTrackAudio(audioFile, user.getId());
                    uploadedAudioPublicIds.add(audioResponse.publicId());

                    int trackOrder = item.getTrackNumber() != null ? item.getTrackNumber() : (i + 1);
                    int duration = (item.getDurationMs() != null && item.getDurationMs() > 0)
                            ? item.getDurationMs()
                            : (audioResponse.durationMs() != null ? audioResponse.durationMs() : 0);

                    String trackSlug = generateUniqueTrackSlug(item.getTitle().trim());

                    Track track = Track.builder()
                            .uploaderUserId(user.getId())
                            .album(savedAlbum)
                            .genre(genre)
                            .title(item.getTitle().trim())
                            .slug(trackSlug)
                            .description(item.getDescription() != null ? item.getDescription().trim() : null)
                            .trackNumber(trackOrder)
                            .publicationStatus(initialTrackStatus)
                            .audioPublicId(audioResponse.publicId())
                            .audioUrl(audioResponse.secureUrl())
                            .audioFormat(audioResponse.format() != null ? audioResponse.format() : "mp3")
                            .durationMs(duration)
                            .playCountCache(0L)
                            .coverPublicId(savedAlbum.getCoverPublicId())
                            .coverUrl(savedAlbum.getCoverUrl())
                            .lyrics(item.getLyrics() != null && !item.getLyrics().isBlank() ? item.getLyrics().trim() : null)
                            .createdAt(LocalDateTime.now(ZoneOffset.UTC))
                            .updatedAt(LocalDateTime.now(ZoneOffset.UTC))
                            .build();

                    Track savedTrack = trackRepository.save(track);
                    constituentTracks.add(savedTrack);

                    if (isSubmit) {
                        TrackSubmission submission = TrackSubmission.builder()
                                .trackId(savedTrack.getId())
                                .submittedByUserId(user.getId())
                                .status(SubmissionStatus.PENDING)
                                .submitterNote("Album submission: " + savedAlbum.getTitle())
                                .build();
                        trackSubmissionRepository.save(submission);
                    }
                }
            } else if (hasTrackIds) {
                constituentTracks = assignTracksToAlbum(savedAlbum, request.getTrackIds(), user.getId());
            }

            // 4. Đánh giá lại trạng thái xuất bản của Album theo BR-18 và quy chuẩn
            recalculateAndSaveAlbumStatus(savedAlbum);

            log.info("Album '{}' (ID: {}) created with {} constituent tracks by user ID {}",
                    savedAlbum.getTitle(), savedAlbum.getId(), constituentTracks.size(), user.getId());

            return studioAlbumMapper.toStudioAlbumResponse(savedAlbum, constituentTracks.size(), constituentTracks);

        } catch (Exception ex) {
            log.error("Exception during createAlbum for user ID {}. Cleaning up uploaded Cloudinary assets...", user.getId(), ex);
            if (uploadedCoverPublicId != null) {
                cloudMediaService.deleteImageQuietly(uploadedCoverPublicId);
            }
            for (String audioPublicId : uploadedAudioPublicIds) {
                cloudMediaService.deleteTrackAudioQuietly(audioPublicId);
            }
            throw ex;
        }
    }

    /**
     * Phương thức quá tải hỗ trợ gọi createAlbum không kèm danh sách file âm thanh (tương thích backward).
     */
    @Transactional
    public StudioAlbumResponse createAlbum(CreateAlbumRequest request, MultipartFile cover, String currentUserEmail) {
        return createAlbum(request, cover, null, currentUserEmail);
    }

    /**
     * Cập nhật thông tin Album, thay thế ảnh bìa và sắp xếp lại danh sách bài hát (UC-21.3 Update Album).
     *
     * @param id               ID của Album cần cập nhật
     * @param request          Dữ liệu cập nhật album
     * @param cover            File ảnh bìa mới (tùy chọn)
     * @param currentUserEmail Email của tài khoản đang đăng nhập
     * @return DTO Album sau khi cập nhật
     */
    @Transactional
    public StudioAlbumResponse updateAlbum(Long id, UpdateAlbumRequest request, MultipartFile cover, String currentUserEmail) {
        if (id == null || id <= 0) {
            throw new BadRequestOperationException("INVALID_ID", "Invalid album ID.");
        }
        if (request == null) {
            throw new BadRequestOperationException("MISSING_PAYLOAD", "Update album request payload is required.");
        }
        if (request.getTitle() == null || request.getTitle().trim().isBlank()) {
            throw new BadRequestOperationException("TITLE_REQUIRED", "Album title is required.");
        }
        String cleanTitle = request.getTitle().trim();
        if (cleanTitle.length() > 200) {
            throw new BadRequestOperationException("TITLE_TOO_LONG", "Album title must not exceed 200 characters.");
        }
        if (request.getDescription() != null && request.getDescription().trim().length() > 2000) {
            throw new BadRequestOperationException("DESCRIPTION_TOO_LONG", "Album description must not exceed 2000 characters.");
        }

        AppUser user = getAuthenticatedUser(currentUserEmail);
        Album album = albumRepository.findByIdAndCreatedByUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Album not found or access denied."));

        // Kiểm tra trùng tên album khác cùng tài khoản (EX01)
        if (albumRepository.existsByCreatedByUserIdAndTitleIgnoreCaseAndIdNot(user.getId(), cleanTitle, id)) {
            throw new ConflictOperationException("Another album with the title '" + cleanTitle + "' already exists.");
        }

        String newCoverPublicId = null;
        try {
            // Nếu đổi tiêu đề thì cập nhật lại slug duy nhất
            if (!album.getTitle().equalsIgnoreCase(cleanTitle)) {
                album.setTitle(cleanTitle);
                album.setSlug(generateUniqueSlug(cleanTitle));
            }

            album.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
            album.setReleaseDate(request.getReleaseDate());

            String oldCoverPublicId = album.getCoverPublicId();
            if (cover != null && !cover.isEmpty()) {
                StoredMediaResponse newCover = cloudMediaService.uploadAlbumCover(cover, user.getId());
                newCoverPublicId = newCover.publicId();

                album.setCoverPublicId(newCover.publicId());
                album.setCoverUrl(newCover.secureUrl());
            }

            // Đồng bộ danh sách bài hát thuộc Album
            List<Track> updatedTracks = request.getTrackIds() != null
                    ? syncAlbumTracks(album, request.getTrackIds(), user.getId())
                    : trackRepository.findByAlbum_IdOrderByTrackNumberAsc(album.getId());

            // Đánh giá lại trạng thái xuất bản theo BR-18 & BR-22
            recalculateAndSaveAlbumStatus(album);

            Album updatedAlbum = albumRepository.save(album);

            // Xóa ảnh bìa cũ trên Cloudinary sau khi lưu CSDL thành công
            if (newCoverPublicId != null && oldCoverPublicId != null && !oldCoverPublicId.isBlank()) {
                cloudMediaService.deleteImageQuietly(oldCoverPublicId);
            }

            log.info("Album '{}' (ID: {}) updated by user ID {}", updatedAlbum.getTitle(), updatedAlbum.getId(), user.getId());
            return studioAlbumMapper.toStudioAlbumResponse(updatedAlbum, updatedTracks.size(), updatedTracks);

        } catch (Exception ex) {
            log.error("Exception during updateAlbum for ID {}. Rolling back newly uploaded media...", id, ex);
            if (newCoverPublicId != null) {
                cloudMediaService.deleteImageQuietly(newCoverPublicId);
            }
            throw ex;
        }
    }

    /**
     * Xóa Album cá nhân và toàn bộ bài hát cấu thành bên trong album (UC-21.4 Delete Album).
     * Bám sát đặc tả mới: khi xóa 1 album sẽ xóa tất cả các bài nhạc trong album đó.
     *
     * @param id               ID của Album cần xóa
     * @param currentUserEmail Email của tài khoản đang đăng nhập
     */
    @Transactional
    public void deleteAlbum(Long id, String currentUserEmail) {
        if (id == null || id <= 0) {
            throw new BadRequestOperationException("INVALID_ID", "Invalid album ID.");
        }
        AppUser user = getAuthenticatedUser(currentUserEmail);
        Album album = albumRepository.findByIdAndCreatedByUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Album not found or access denied."));

        // 1. Xóa tất cả các bài hát cấu thành bên trong album khỏi CSDL và Cloudinary (UC-21.4 POST-1 & POST-2)
        List<Track> constituentTracks = trackRepository.findByAlbum_IdOrderByTrackNumberAsc(album.getId());
        for (Track track : constituentTracks) {
            try {
                playlistTrackRepository.deleteByTrack_Id(track.getId());
                listeningHistoryRepository.deleteByTrackId(track.getId());
                trackSubmissionRepository.deleteByTrackId(track.getId());
                cloudMediaService.deleteTrackAudioQuietly(track.getAudioPublicId());
                if (track.getCoverPublicId() != null && !track.getCoverPublicId().equals(album.getCoverPublicId())) {
                    cloudMediaService.deleteImageQuietly(track.getCoverPublicId());
                }
                trackRepository.delete(track);
            } catch (Exception ex) {
                log.warn("Error while deleting constituent track ID {} of album ID {}: {}", track.getId(), id, ex.getMessage());
                trackRepository.delete(track);
            }
        }

        // 2. Dọn dẹp ảnh bìa album trên Cloudinary nếu có (POST-2 của UC-21.4)
        if (album.getCoverPublicId() != null && !album.getCoverPublicId().isBlank()) {
            cloudMediaService.deleteImageQuietly(album.getCoverPublicId());
        }

        // 3. Xóa bản ghi Album khỏi database
        albumRepository.delete(album);
        log.info("Album ID {} and all its {} constituent tracks permanently deleted by user ID {}.",
                id, constituentTracks.size(), user.getId());
    }

    /**
     * Lấy danh sách các bài hát khả dụng của người dùng để chọn đưa vào Album.
     *
     * @param currentAlbumId   ID album hiện tại (nếu đang ở màn hình Edit), có thể null
     * @param currentUserEmail Email người dùng
     * @return Danh sách bài hát khả dụng
     */
    @Transactional(readOnly = true)
    public List<StudioTrackResponse> getAvailableTracksForAlbum(Long currentAlbumId, String currentUserEmail) {
        if (currentAlbumId != null && currentAlbumId <= 0) {
            throw new BadRequestOperationException("INVALID_ID", "Invalid album ID.");
        }
        AppUser user = getAuthenticatedUser(currentUserEmail);
        List<Track> allUserTracks = trackRepository.findByUploaderUserIdOrderByCreatedAtDesc(user.getId());

        return allUserTracks.stream()
                .filter(track -> track.getAlbum() == null || (currentAlbumId != null && track.getAlbum().getId().equals(currentAlbumId)))
                .map(track -> studioTrackMapper.toStudioTrackResponse(track, track.getGenre(), track.getAlbum(), null))
                .toList();
    }

    // ==========================================
    // CÁC HÀM TIỆN ÍCH NỘI BỘ (PRIVATE HELPERS)
    // ==========================================

    /**
     * Gán danh sách bài hát vào Album và đánh số thứ tự track_number.
     */
    private List<Track> assignTracksToAlbum(Album album, List<Long> trackIds, Long currentUserId) {
        List<Track> assigned = new ArrayList<>();
        int trackNumber = 1;
        List<Long> distinctTrackIds = trackIds.stream().distinct().toList();

        for (Long trackId : distinctTrackIds) {
            Track track = trackRepository.findByIdAndUploaderUserId(trackId, currentUserId)
                    .orElseThrow(() -> new BadRequestOperationException("Track ID " + trackId + " not found or does not belong to you."));

            if (track.getAlbum() != null && !track.getAlbum().getId().equals(album.getId())) {
                throw new BadRequestOperationException("Track '" + track.getTitle() + "' already belongs to another album ('" + track.getAlbum().getTitle() + "').");
            }

            track.setAlbum(album);
            track.setTrackNumber(trackNumber++);
            assigned.add(trackRepository.save(track));
        }

        return assigned;
    }

    /**
     * Đồng bộ bài hát trong Album: xóa vĩnh viễn những bài bị loại bỏ và cập nhật thứ tự các bài được giữ lại (UC-21.3).
     */
    private List<Track> syncAlbumTracks(Album album, List<Long> trackIds, Long currentUserId) {
        List<Track> currentAlbumTracks = trackRepository.findByAlbum_IdOrderByTrackNumberAsc(album.getId());

        if (trackIds == null) {
            return currentAlbumTracks;
        }

        List<Long> distinctTrackIds = trackIds.stream().distinct().toList();

        if (distinctTrackIds.isEmpty()) {
            throw new BadRequestOperationException("An album must contain at least one track. To remove all tracks, please delete the album instead.");
        }

        Set<Long> newTrackIdSet = new HashSet<>(distinctTrackIds);

        // Xóa vĩnh viễn những bài bị loại bỏ khỏi album (UC-21.3 POST-3)
        for (Track t : currentAlbumTracks) {
            if (!newTrackIdSet.contains(t.getId())) {
                try {
                    playlistTrackRepository.deleteByTrack_Id(t.getId());
                    listeningHistoryRepository.deleteByTrackId(t.getId());
                    trackSubmissionRepository.deleteByTrackId(t.getId());
                    cloudMediaService.deleteTrackAudioQuietly(t.getAudioPublicId());
                    if (t.getCoverPublicId() != null && !t.getCoverPublicId().equals(album.getCoverPublicId())) {
                        cloudMediaService.deleteImageQuietly(t.getCoverPublicId());
                    }
                    trackRepository.delete(t);
                } catch (Exception ex) {
                    log.warn("Error cleaning up removed track ID {}: {}", t.getId(), ex.getMessage());
                    trackRepository.delete(t);
                }
            }
        }

        // Cập nhật album và thứ tự bài hát mới cho các bài giữ lại
        List<Track> resultTracks = new ArrayList<>();
        int order = 1;
        for (Long trackId : distinctTrackIds) {
            Track track = trackRepository.findByIdAndUploaderUserId(trackId, currentUserId)
                    .orElseThrow(() -> new BadRequestOperationException("Track ID " + trackId + " not found or does not belong to you."));

            if (track.getAlbum() != null && !track.getAlbum().getId().equals(album.getId())) {
                throw new BadRequestOperationException("Track '" + track.getTitle() + "' already belongs to another album ('" + track.getAlbum().getTitle() + "').");
            }

            track.setAlbum(album);
            track.setTrackNumber(order++);
            resultTracks.add(trackRepository.save(track));
        }

        return resultTracks;
    }

    /**
    /**
     * Tự động tính toán lại và cập nhật trạng thái Album theo ràng buộc CK_albums_status ('DRAFT', 'PUBLISHED')
     * và quy tắc nghiệp vụ BR-18:
     * - Nếu có ít nhất 1 bài hát PUBLISHED: Album có trạng thái PUBLISHED.
     * - Ngược lại: Album duy trì trạng thái DRAFT.
     */
    private void recalculateAndSaveAlbumStatus(Album album) {
        boolean hasPublishedTrack = trackRepository.existsByAlbum_IdAndPublicationStatus(
                album.getId(), TrackPublicationStatus.PUBLISHED
        );

        if (hasPublishedTrack) {
            album.setStatus("PUBLISHED");
            if (album.getPublishedAt() == null) {
                album.setPublishedAt(LocalDateTime.now(ZoneOffset.UTC));
            }
        } else {
            album.setStatus("DRAFT");
        }
        albumRepository.save(album);
    }

    /**
     * Lấy thông tin tài khoản đã xác thực và kiểm tra tính hợp lệ.
     */
    private AppUser getAuthenticatedUser(String email) {
        if (email == null || email.isBlank()) {
            throw new AuthenticationException("UNAUTHORIZED", "Authentication required.");
        }
        AppUser user = appUserRepository.findByEmailIgnoreCase(email.trim().toLowerCase(Locale.ROOT))
                .filter(u -> u.getDeletedAt() == null)
                .orElseThrow(() -> new AuthenticationException("USER_NOT_FOUND", "Account not found."));

        if (user.getStatus() == UserStatus.BANNED) {
            throw new AccountBannedException();
        }
        if (user.getStatus() == UserStatus.PENDING) {
            throw new AccountUnavailableException("ACCOUNT_PENDING", "Account email has not been verified yet.");
        }
        return user;
    }

    /**
     * Tạo slug thân thiện với URL cho album.
     */
    private String generateUniqueSlug(String input) {
        String baseSlug = toSlug(input);
        if (baseSlug.isBlank()) baseSlug = "album";
        String candidate = baseSlug + "-" + System.currentTimeMillis();
        return candidate.length() > 220 ? candidate.substring(0, 220) : candidate;
    }

    /**
     * Tạo slug thân thiện với URL cho từng bài hát trong album.
     */
    private String generateUniqueTrackSlug(String input) {
        String baseSlug = toSlug(input);
        if (baseSlug.isBlank()) baseSlug = "track";
        String candidate = baseSlug + "-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 6);
        return candidate.length() > 220 ? candidate.substring(0, 220) : candidate;
    }

    private String toSlug(String input) {
        String nowhitespace = WHITESPACE.matcher(input).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = NONLATIN.matcher(normalized).replaceAll("");
        return slug.toLowerCase(Locale.ENGLISH);
    }
}
