package groupone.soundwaveproject.studio.service;

import groupone.soundwaveproject.authentication.entity.User;
import groupone.soundwaveproject.authentication.entity.UserStatus;
import groupone.soundwaveproject.authentication.exception.AccountBannedException;
import groupone.soundwaveproject.authentication.exception.AccountUnavailableException;
import groupone.soundwaveproject.authentication.exception.AuthenticationException;
import groupone.soundwaveproject.authentication.repository.UserRepository;
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
public class StudioAlbumService {

    private final AlbumRepository albumRepository;
    private final TrackRepository trackRepository;
    private final GenreRepository genreRepository;
    private final PlaylistTrackRepository playlistTrackRepository;
    private final ListeningHistoryRepository listeningHistoryRepository;
    private final TrackSubmissionRepository trackSubmissionRepository;
    private final UserRepository userRepository;
    private final CloudMediaService cloudMediaService;
    private final StudioAlbumMapper studioAlbumMapper;
    private final StudioTrackMapper studioTrackMapper;
    private final StudioTrackService studioTrackService;
    private final groupone.soundwaveproject.lyrics.service.LyricService lyricService;

    public StudioAlbumService(
            AlbumRepository albumRepository,
            TrackRepository trackRepository,
            GenreRepository genreRepository,
            PlaylistTrackRepository playlistTrackRepository,
            ListeningHistoryRepository listeningHistoryRepository,
            TrackSubmissionRepository trackSubmissionRepository,
            UserRepository userRepository,
            CloudMediaService cloudMediaService,
            StudioAlbumMapper studioAlbumMapper,
            StudioTrackMapper studioTrackMapper,
            StudioTrackService studioTrackService
    ) {
        this(albumRepository, trackRepository, genreRepository, playlistTrackRepository,
                listeningHistoryRepository, trackSubmissionRepository, userRepository,
                cloudMediaService, studioAlbumMapper, studioTrackMapper, studioTrackService, null);
    }

    @org.springframework.beans.factory.annotation.Autowired
    public StudioAlbumService(
            AlbumRepository albumRepository,
            TrackRepository trackRepository,
            GenreRepository genreRepository,
            PlaylistTrackRepository playlistTrackRepository,
            ListeningHistoryRepository listeningHistoryRepository,
            TrackSubmissionRepository trackSubmissionRepository,
            UserRepository userRepository,
            CloudMediaService cloudMediaService,
            StudioAlbumMapper studioAlbumMapper,
            StudioTrackMapper studioTrackMapper,
            StudioTrackService studioTrackService,
            groupone.soundwaveproject.lyrics.service.LyricService lyricService
    ) {
        this.albumRepository = albumRepository;
        this.trackRepository = trackRepository;
        this.genreRepository = genreRepository;
        this.playlistTrackRepository = playlistTrackRepository;
        this.listeningHistoryRepository = listeningHistoryRepository;
        this.trackSubmissionRepository = trackSubmissionRepository;
        this.userRepository = userRepository;
        this.cloudMediaService = cloudMediaService;
        this.studioAlbumMapper = studioAlbumMapper;
        this.studioTrackMapper = studioTrackMapper;
        this.studioTrackService = studioTrackService;
        this.lyricService = lyricService;
    }

    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    /**
     * Lấy danh sách toàn bộ Album do người dùng hiện tại tạo ra (UC-21.4 View Albums).
     * Sequence Diagram Steps:
     * 1.2: getMyAlbums(currentUserEmail)
     * 1.3: getAuthenticatedUser(currentUserEmail)
     * 1.4: findByEmailIgnoreCase(email)
     * 1.8: findByCreatedByUserIdOrderByCreatedAtDesc(user.getId())
     * 1.13.1: countByAlbum_Id(album.getId())
     * 1.13.5: toStudioAlbumResponse(album, trackCount, emptyList)
     * 1.14: return studioAlbumListResponse
     */
    @Transactional(readOnly = true)
    public List<StudioAlbumResponse> getMyAlbums(String currentUserEmail) {
        User user = getAuthenticatedUser(currentUserEmail);
        List<Album> albums = albumRepository.findByCreatedByUserIdOrderByCreatedAtDesc(user.getId());

        return albums.stream()
                .map(album -> {
                    long trackCount = trackRepository.countByAlbum_Id(album.getId());
                    return studioAlbumMapper.toStudioAlbumResponse(album, (int) trackCount, Collections.emptyList());
                })
                .toList();
    }

    /**
     * Xem thông tin chi tiết một Album cụ thể cùng danh sách bài hát bên trong (UC-21.3 View Album Details).
     */
    @Transactional(readOnly = true)
    public StudioAlbumResponse getAlbumById(Long id, String currentUserEmail) {
        if (id == null || id <= 0) {
            throw new BadRequestOperationException("INVALID_ID", "Invalid album ID.");
        }
        User user = getAuthenticatedUser(currentUserEmail);
        Album album = albumRepository.findByIdAndCreatedByUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Album not found or access denied."));

        List<Track> tracks = trackRepository.findByAlbum_IdOrderByTrackNumberAsc(album.getId());
        return studioAlbumMapper.toStudioAlbumResponse(album, tracks.size(), tracks);
    }

    /**
     * Tạo mới một Album và upload toàn bộ bài hát cấu thành cùng lúc (UC-21.1 Create Album).
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

        User user = getAuthenticatedUser(currentUserEmail);

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
            // 1. Upload ảnh bìa album lên Cloudinary nếu có (Sequence 1.2.2.4 & 1.2.2.5: uploadAlbumCover)
            StoredMediaResponse storedCover = null;
            if (cover != null && !cover.isEmpty()) {
                storedCover = cloudMediaService.uploadAlbumCover(cover, user.getId());
                uploadedCoverPublicId = storedCover.publicId();
            }

            // 2. Loop upload toàn bộ tệp âm thanh audioFiles lên Cloudinary trước khi ghi nhận CSDL (Sequence 1.2.2.6.1 & 1.2.2.6.2)
            List<StoredAudioResponse> uploadedAudios = new ArrayList<>();
            if (hasTracks) {
                for (MultipartFile audioFile : audioFiles) {
                    StoredAudioResponse audioResponse = cloudMediaService.uploadTrackAudio(audioFile, user.getId());
                    uploadedAudios.add(audioResponse);
                    uploadedAudioPublicIds.add(audioResponse.publicId());
                }
            }

            // 3. Khởi tạo Album entity với trạng thái DRAFT và lưu vào CSDL (Sequence 1.2.2.7 đến 1.2.2.12: new Album -> save -> persistAlbum)
            String initialAlbumStatus = "DRAFT";
            String uniqueSlug = generateUniqueSlug(cleanTitle);

            Album album = Album.builder()
                    .createdByUserId(user.getId())
                    .title(cleanTitle)
                    .slug(uniqueSlug)
                    .description(request.getDescription() != null ? request.getDescription().trim() : null)
                    .releaseDate(request.getReleaseDate() != null ? request.getReleaseDate() : java.time.LocalDate.now(ZoneOffset.UTC))
                    .status(initialAlbumStatus)
                    .coverPublicId(storedCover != null ? storedCover.publicId() : null)
                    .coverUrl(storedCover != null ? storedCover.secureUrl() : null)
                    .build();

            Album savedAlbum = albumRepository.save(album);
            List<Track> constituentTracks = new ArrayList<>();

            // 4. Loop khởi tạo và lưu từng bài hát Track entity vào CSDL (Sequence 1.2.2.13.1 đến 1.2.2.13.6: new Track -> save -> persistTrack)
            if (hasTracks) {
                TrackPublicationStatus initialTrackStatus = isSubmit ? TrackPublicationStatus.PENDING : TrackPublicationStatus.DRAFT;
                for (int i = 0; i < request.getTracks().size(); i++) {
                    AlbumTrackItemRequest item = request.getTracks().get(i);
                    int fileIndex = item.getAudioIndex() != null ? item.getAudioIndex() : i;
                    StoredAudioResponse audioResponse = uploadedAudios.get(fileIndex);

                    Genre genre = genreRepository.findById(item.getGenreId())
                            .orElseThrow(() -> new BadRequestOperationException("Selected genre for track '" + item.getTitle() + "' is invalid."));
                    if (!Boolean.TRUE.equals(genre.getIsActive())) {
                        throw new BadRequestOperationException("Selected genre '" + genre.getName() + "' is currently inactive.");
                    }

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

            // 5. Đánh giá lại trạng thái xuất bản của Album theo BR-18 và quy chuẩn
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

    @Transactional
    public StudioAlbumResponse createAlbum(CreateAlbumRequest request, MultipartFile cover, String currentUserEmail) {
        return createAlbum(request, cover, null, currentUserEmail);
    }

    /**
     * Cập nhật thông tin Album, thay ảnh bìa hoặc sắp xếp lại danh sách bài hát (UC-21.5 Update An Album).
     * Sequence Diagram Steps:
     * 1.2.2.2: updateAlbum(id, request, coverFile, authentication.getName())
     * 1.2.2.3 - 1.2.2.7: getAuthenticatedUser(currentUserEmail) -> UserRepository.findByEmailIgnoreCase
     * 1.2.2.8 - 1.2.2.11: AlbumRepository.findByIdAndCreatedByUserId(id, user.getId())
     *   alt [album_does_not_exist_or_not_owned] -> 1.2.2.12.1.1: throw ResourceNotFoundException("Album not found or access denied.")
     * 1.2.2.12.2.1 - 1.2.2.12.2.4: existsByCreatedByUserIdAndTitleIgnoreCaseAndIdNot(user.getId(), cleanTitle, id)
     *   alt [duplicate_title_exists] -> 1.2.2.12.2.5.1: throw ConflictOperationException("Another album with this title already exists.")
     * [title_is_unique]
     *   opt [replacement_cover_file_provided] -> 1.2.2.12.2.6.1: uploadAlbumCover -> 1.2.2.12.2.7-8: setCoverUrl, setCoverPublicId
     *   1.2.2.12.2.9: setTitle(cleanTitle)
     *   1.2.2.12.2.10: setDescription(cleanDescription)
     *   opt [release_date_provided] -> 1.2.2.12.2.11: setReleaseDate(releaseDate)
     *   1.2.2.12.2.12: setSlug(generateUniqueSlug(cleanTitle))
     *   1.2.2.12.2.13: setUpdatedAt(nowUtc)
     *   1.2.2.12.2.14 - 1.2.2.12.2.17: save(album)
     *   opt [old_cover_exists_and_replaced] -> 1.2.2.12.2.18 - 1.2.2.12.2.21: deleteImageQuietly(oldCoverPublicId)
     *   1.2.2.12.2.22 - 1.2.2.12.2.26: findByAlbum_IdOrderByTrackNumberAsc(album.getId())
     *   1.2.2.12.2.27 - 1.2.2.12.2.32: toStudioAlbumResponse(savedAlbum, constituentTracks.size(), constituentTracks)
     *   1.2.2.12.2.33: return studioAlbumResponse
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

        User user = getAuthenticatedUser(currentUserEmail);
        Album album = albumRepository.findByIdAndCreatedByUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Album not found or access denied."));

        // Kiểm tra trùng tên album khác cùng tài khoản (UC-21.5 Step 1.2.2.12.2.1)
        if (albumRepository.existsByCreatedByUserIdAndTitleIgnoreCaseAndIdNot(user.getId(), cleanTitle, id)) {
            throw new ConflictOperationException("Another album with this title already exists.");
        }

        String newCoverPublicId = null;
        try {
            String oldCoverPublicId = album.getCoverPublicId();

            // opt [replacement_cover_file_provided] (Step 1.2.2.12.2.6.1 - 1.2.2.12.2.8)
            if (cover != null && !cover.isEmpty()) {
                StoredMediaResponse newCover = cloudMediaService.uploadAlbumCover(cover, user.getId());
                newCoverPublicId = newCover.publicId();

                album.setCoverUrl(newCover.secureUrl());
                album.setCoverPublicId(newCover.publicId());
            }

            // Step 1.2.2.12.2.9 - 1.2.2.12.2.10: setTitle & setDescription
            boolean titleChanged = !cleanTitle.equalsIgnoreCase(album.getTitle());
            album.setTitle(cleanTitle);

            String cleanDescription = (request.getDescription() != null && !request.getDescription().trim().isBlank())
                    ? request.getDescription().trim()
                    : null;
            album.setDescription(cleanDescription);

            // opt [release_date_provided] (Step 1.2.2.12.2.11)
            if (request.getReleaseDate() != null) {
                album.setReleaseDate(request.getReleaseDate());
            }

            // Step 1.2.2.12.2.12: setSlug(generateUniqueSlug(cleanTitle))
            if (titleChanged || album.getSlug() == null || album.getSlug().isBlank()) {
                album.setSlug(generateUniqueSlug(cleanTitle));
            }

            // Step 1.2.2.12.2.13: setUpdatedAt(nowUtc)
            LocalDateTime nowUtc = LocalDateTime.now(ZoneOffset.UTC);
            album.setUpdatedAt(nowUtc);

            // Đồng bộ danh sách bài hát thuộc Album nếu request có cung cấp danh sách trackIds
            List<Track> constituentTracks;
            if (request.getTrackIds() != null) {
                constituentTracks = syncAlbumTracks(album, request.getTrackIds(), user.getId());
            } else {
                constituentTracks = trackRepository.findByAlbum_IdOrderByTrackNumberAsc(album.getId());
            }

            // Đánh giá lại trạng thái xuất bản theo BR-18 & BR-22
            recalculateAndSaveAlbumStatus(album);

            // Step 1.2.2.12.2.14 - 1.2.2.12.2.17: save(album)
            Album savedAlbum = albumRepository.save(album);

            // opt [old_cover_exists_and_replaced] (Step 1.2.2.12.2.18 - 1.2.2.12.2.21)
            if (newCoverPublicId != null && oldCoverPublicId != null && !oldCoverPublicId.isBlank()) {
                cloudMediaService.deleteImageQuietly(oldCoverPublicId);
            }

            // Step 1.2.2.12.2.22 - 1.2.2.12.2.26: findByAlbum_IdOrderByTrackNumberAsc(album.getId())
            if (request.getTrackIds() == null) {
                constituentTracks = trackRepository.findByAlbum_IdOrderByTrackNumberAsc(savedAlbum.getId());
            }

            log.info("Album '{}' (ID: {}) updated by user ID {}", savedAlbum.getTitle(), savedAlbum.getId(), user.getId());

            // Step 1.2.2.12.2.27 - 1.2.2.12.2.33: toStudioAlbumResponse
            return studioAlbumMapper.toStudioAlbumResponse(savedAlbum, constituentTracks.size(), constituentTracks);

        } catch (Exception ex) {
            log.error("Exception during updateAlbum for ID {}. Rolling back newly uploaded media...", id, ex);
            if (newCoverPublicId != null) {
                cloudMediaService.deleteImageQuietly(newCoverPublicId);
            }
            throw ex;
        }
    }

    /**
     * Xóa Album cá nhân và toàn bộ bài hát cấu thành (UC-21.6 Delete An Album).
     * Sequence Diagram Steps:
     * 1.1: DELETE /api/v1/studio/albums/{id}
     * 1.2: deleteAlbum(id, authentication.getName())
     * 1.3 - 1.7: getAuthenticatedUser(currentUserEmail) -> userRepository.findByEmailIgnoreCase -> PostgreSQL
     * 1.8 - 1.10: albumRepository.findByIdAndCreatedByUserId(id, user.getId())
     *   alt [album_not_found_or_access_denied] -> 1.11.1.2: throw ResourceNotFoundException("Album not found or access denied")
     * [album_owned_by_creator]
     *   1.11.2.4 - 1.11.2.8: trackRepository.findByAlbum_IdOrderByTrackNumberAsc(album.getId())
     *   loop [each track in constituentTracks]:
     *     1.11.2.9.1: studioTrackService.deleteTrack(track.getId(), currentUserEmail)
     *     1.11.2.9.2 - 1.11.2.9.7: getAudioPublicId() -> deleteTrackAudioQuietly(audioPublicId) -> Cloudinary
     *     1.11.2.9.8 - 1.11.2.9.11: delete(track) -> PostgreSQL
     *     1.11.2.9.12: return trackDeletedSignal
     *   1.11.2.10 - 1.11.2.11: album.getCoverPublicId()
     *   opt [cover_public_id != null]:
     *     1.11.2.12 - 1.11.2.15: cloudMediaService.deleteImageQuietly(coverPublicId) -> Cloudinary
     *   1.11.2.16 - 1.11.2.19: albumRepository.delete(album) -> PostgreSQL
     *   1.11.2.20: return cascadeDeletionCompletedSignal
     */
    @Transactional
    public void deleteAlbum(Long id, String currentUserEmail) {
        if (id == null || id <= 0) {
            throw new BadRequestOperationException("INVALID_ID", "Invalid album ID.");
        }
        User user = getAuthenticatedUser(currentUserEmail);
        Album album = albumRepository.findByIdAndCreatedByUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Album not found or access denied."));

        // Step 1.11.2.4 - 1.11.2.8: Lấy danh sách toàn bộ bài hát cấu thành
        List<Track> constituentTracks = trackRepository.findByAlbum_IdOrderByTrackNumberAsc(album.getId());

        // loop [each track in constituentTracks] (Step 1.11.2.9.1 - 1.11.2.9.12)
        for (Track track : constituentTracks) {
            try {
                if (studioTrackService != null) {
                    studioTrackService.deleteTrack(track.getId(), currentUserEmail);
                }
            } catch (Exception ex) {
                log.warn("Error delegating track deletion to StudioTrackService for track ID {}: {}", track.getId(), ex.getMessage());
            }

            // Đảm bảo bài hát được thanh lọc hoàn toàn khỏi CSDL (bảo toàn ràng buộc khóa ngoại khi xóa Album)
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
                log.warn("Error deleting constituent track record ID {}: {}", track.getId(), ex.getMessage());
            }
        }

        // opt [cover_public_id != null] (Step 1.11.2.10 - 1.11.2.15)
        if (album.getCoverPublicId() != null && !album.getCoverPublicId().isBlank()) {
            cloudMediaService.deleteImageQuietly(album.getCoverPublicId());
        }

        // Step 1.11.2.16 - 1.11.2.19: Xóa vĩnh viễn Album khỏi CSDL
        albumRepository.delete(album);

        // Step 1.11.2.20: cascadeDeletionCompletedSignal
        log.info("Album ID {} and all its {} constituent tracks permanently deleted by user ID {}.",
                id, constituentTracks.size(), user.getId());
    }

    /**
     * Nộp toàn bộ bài hát trong một Album nháp lên cho Staff kiểm duyệt (UC-21.2 Submit Album For Review).
     *
     * Quy tắc nghiệp vụ (Business Rules BR-18, BR-21, BR-22, BR-23 & PRE-1 đến PRE-3, POST-1 đến POST-4):
     * 1. PRE-1, PRE-2: Album phải tồn tại, thuộc quyền sở hữu của người dùng hiện tại và đang ở trạng thái DRAFT.
     * 2. PRE-3, BR-18, EX01: Album bắt buộc phải chứa ít nhất một bài hát cấu thành.
     * 3. POST-1 & Sequence 1.2.2.14.1 - 1.2.2.14.6: Chuyển toàn bộ bài hát cấu thành sang trạng thái PENDING kiểm duyệt.
     * 4. POST-2 & Sequence 1.2.2.14.7 - 1.2.2.14.12: Tạo các bản ghi nộp duyệt TrackSubmission mới với trạng thái PENDING.
     * 5. POST-3: Trạng thái của Album vẫn được giữ nguyên là DRAFT trong suốt quá trình chờ Staff duyệt bài hát.
     * 6. Thực thi toàn bộ trong một giao dịch nguyên tử @Transactional (EX03 rollback nếu có lỗi).
     */
    @Transactional
    public StudioAlbumResponse submitAlbumForReview(Long albumId, String currentUserEmail) {
        if (albumId == null || albumId <= 0) {
            throw new BadRequestOperationException("INVALID_ID", "Invalid album ID.");
        }
        User user = getAuthenticatedUser(currentUserEmail);

        // Sequence 1.2.2.6 - 1.2.2.9: findByIdAndUserId
        Album album = albumRepository.findByIdAndCreatedByUserId(albumId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Album not found or access denied."));

        // RDS EX02: Check album is in DRAFT status
        if (!"DRAFT".equalsIgnoreCase(album.getStatus())) {
            throw new ConflictOperationException("Only DRAFT albums can be submitted for review.");
        }

        // Sequence 1.2.2.10 - 1.2.2.13: findByAlbumId
        List<Track> tracks = trackRepository.findByAlbum_IdOrderByTrackNumberAsc(album.getId());

        // RDS EX01 & BR-18: Album contains zero associated tracks
        if (tracks.isEmpty()) {
            throw new BadRequestOperationException("EMPTY_ALBUM", "Cannot submit an empty album. Please add at least one track.");
        }

        // Sequence 1.2.2.14: loop for each track in constituentTracks
        List<Track> updatedTracks = new ArrayList<>();
        for (Track track : tracks) {
            // 1.2.2.14.1 - 1.2.2.14.6: setPublicationStatus(PENDING) and save
            track.setPublicationStatus(TrackPublicationStatus.PENDING);
            track.setUpdatedAt(LocalDateTime.now(ZoneOffset.UTC));
            Track savedTrack = trackRepository.save(track);
            updatedTracks.add(savedTrack);

            // 1.2.2.14.7 - 1.2.2.14.12: new TrackSubmission and save
            TrackSubmission submission = TrackSubmission.builder()
                    .trackId(savedTrack.getId())
                    .submittedByUserId(user.getId())
                    .status(SubmissionStatus.PENDING)
                    .submitterNote("Album submission: " + album.getTitle())
                    .build();
            trackSubmissionRepository.save(submission);
        }

        // RDS POST-3: The album status remains DRAFT awaiting review completion
        album.setStatus("DRAFT");
        album.setUpdatedAt(LocalDateTime.now(ZoneOffset.UTC));
        Album savedAlbum = albumRepository.save(album);

        log.info("Album ID {} and all {} constituent tracks successfully submitted for staff review by user ID {}.",
                albumId, updatedTracks.size(), user.getId());

        // Sequence 1.2.2.15: return albumSubmissionResponse
        return studioAlbumMapper.toStudioAlbumResponse(savedAlbum, updatedTracks.size(), updatedTracks);
    }

    @Transactional(readOnly = true)
    public List<StudioTrackResponse> getAvailableTracksForAlbum(Long currentAlbumId, String currentUserEmail) {
        if (currentAlbumId != null && currentAlbumId <= 0) {
            throw new BadRequestOperationException("INVALID_ID", "Invalid album ID.");
        }
        User user = getAuthenticatedUser(currentUserEmail);
        List<Track> allUserTracks = trackRepository.findByUploaderUserIdOrderByCreatedAtDesc(user.getId());

        return allUserTracks.stream()
                .filter(track -> track.getAlbum() == null || (currentAlbumId != null && track.getAlbum().getId().equals(currentAlbumId)))
                .map(track -> studioTrackMapper.toStudioTrackResponse(track, track.getGenre(), track.getAlbum(), null))
                .toList();
    }

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

    private User getAuthenticatedUser(String email) {
        if (email == null || email.isBlank()) {
            throw new AuthenticationException("UNAUTHORIZED", "Authentication required.");
        }
        User user = userRepository.findByEmailIgnoreCase(email.trim().toLowerCase(Locale.ROOT))
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

    private String generateUniqueSlug(String input) {
        String baseSlug = toSlug(input);
        if (baseSlug.isBlank()) baseSlug = "album";
        String candidate = baseSlug + "-" + System.currentTimeMillis();
        return candidate.length() > 220 ? candidate.substring(0, 220) : candidate;
    }

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
