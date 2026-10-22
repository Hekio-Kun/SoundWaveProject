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
@RequiredArgsConstructor
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

    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    /**
     * Lấy danh sách toàn bộ Album do người dùng hiện tại tạo ra (UC-21.2 View Albums).
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
     * Xem thông tin chi tiết một Album cụ thể cùng danh sách bài hát bên trong (UC-21.2 View Albums).
     */
    @Transactional(readOnly = true)
    public StudioAlbumResponse getAlbumById(Long id, String currentUserEmail) {
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
        User user = getAuthenticatedUser(currentUserEmail);
        String cleanTitle = request.getTitle().trim();

        if (albumRepository.existsByCreatedByUserIdAndTitleIgnoreCase(user.getId(), cleanTitle)) {
            throw new ConflictOperationException("An album with the title '" + cleanTitle + "' already exists in your library.");
        }

        StoredMediaResponse storedCover = null;
        if (cover != null && !cover.isEmpty()) {
            storedCover = cloudMediaService.uploadAlbumCover(cover, user.getId());
        }

        boolean isSubmit = Boolean.TRUE.equals(request.getSubmitForReview());
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

        if (request.getTracks() != null && !request.getTracks().isEmpty()) {
            if (audioFiles == null || audioFiles.isEmpty()) {
                throw new BadRequestOperationException("Audio files are required for constituent album tracks.");
            }

            for (int i = 0; i < request.getTracks().size(); i++) {
                AlbumTrackItemRequest item = request.getTracks().get(i);
                int fileIndex = item.getAudioIndex() != null ? item.getAudioIndex() : i;

                if (fileIndex < 0 || fileIndex >= audioFiles.size()) {
                    throw new BadRequestOperationException("Audio file index out of bounds for track '" + item.getTitle() + "'.");
                }

                MultipartFile audioFile = audioFiles.get(fileIndex);
                if (audioFile == null || audioFile.isEmpty()) {
                    throw new BadRequestOperationException("Audio file is required for track '" + item.getTitle() + "'.");
                }

                Genre genre = genreRepository.findById(item.getGenreId())
                        .orElseThrow(() -> new BadRequestOperationException("Selected genre for track '" + item.getTitle() + "' is invalid."));
                if (!Boolean.TRUE.equals(genre.getIsActive())) {
                    throw new BadRequestOperationException("Selected genre '" + genre.getName() + "' is currently inactive.");
                }

                StoredAudioResponse audioResponse = cloudMediaService.uploadTrackAudio(audioFile, user.getId());

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
        } else if (request.getTrackIds() != null && !request.getTrackIds().isEmpty()) {
            constituentTracks = assignTracksToAlbum(savedAlbum, request.getTrackIds(), user.getId());
        }

        recalculateAndSaveAlbumStatus(savedAlbum);

        log.info("Album '{}' (ID: {}) created with {} constituent tracks by user ID {}",
                savedAlbum.getTitle(), savedAlbum.getId(), constituentTracks.size(), user.getId());

        return studioAlbumMapper.toStudioAlbumResponse(savedAlbum, constituentTracks.size(), constituentTracks);
    }

    @Transactional
    public StudioAlbumResponse createAlbum(CreateAlbumRequest request, MultipartFile cover, String currentUserEmail) {
        return createAlbum(request, cover, null, currentUserEmail);
    }

    @Transactional
    public StudioAlbumResponse updateAlbum(Long id, UpdateAlbumRequest request, MultipartFile cover, String currentUserEmail) {
        User user = getAuthenticatedUser(currentUserEmail);
        Album album = albumRepository.findByIdAndCreatedByUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Album not found or access denied."));

        String cleanTitle = request.getTitle().trim();

        if (albumRepository.existsByCreatedByUserIdAndTitleIgnoreCaseAndIdNot(user.getId(), cleanTitle, id)) {
            throw new ConflictOperationException("Another album with the title '" + cleanTitle + "' already exists.");
        }

        if (!album.getTitle().equalsIgnoreCase(cleanTitle)) {
            album.setTitle(cleanTitle);
            album.setSlug(generateUniqueSlug(cleanTitle));
        }

        album.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        album.setReleaseDate(request.getReleaseDate());

        if (cover != null && !cover.isEmpty()) {
            StoredMediaResponse newCover = cloudMediaService.uploadAlbumCover(cover, user.getId());
            String oldCoverPublicId = album.getCoverPublicId();

            album.setCoverPublicId(newCover.publicId());
            album.setCoverUrl(newCover.secureUrl());

            if (oldCoverPublicId != null && !oldCoverPublicId.isBlank()) {
                cloudMediaService.deleteImageQuietly(oldCoverPublicId);
            }
        }

        List<Track> updatedTracks = request.getTrackIds() != null
                ? syncAlbumTracks(album, request.getTrackIds(), user.getId())
                : trackRepository.findByAlbum_IdOrderByTrackNumberAsc(album.getId());

        recalculateAndSaveAlbumStatus(album);

        Album updatedAlbum = albumRepository.save(album);
        log.info("Album '{}' (ID: {}) updated by user ID {}", updatedAlbum.getTitle(), updatedAlbum.getId(), user.getId());

        return studioAlbumMapper.toStudioAlbumResponse(updatedAlbum, updatedTracks.size(), updatedTracks);
    }

    @Transactional
    public void deleteAlbum(Long id, String currentUserEmail) {
        User user = getAuthenticatedUser(currentUserEmail);
        Album album = albumRepository.findByIdAndCreatedByUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Album not found or access denied."));

        List<Track> constituentTracks = trackRepository.findByAlbum_IdOrderByTrackNumberAsc(album.getId());
        for (Track track : constituentTracks) {
            playlistTrackRepository.deleteByTrack_Id(track.getId());
            listeningHistoryRepository.deleteByTrackId(track.getId());
            trackSubmissionRepository.deleteByTrackId(track.getId());
            cloudMediaService.deleteTrackAudioQuietly(track.getAudioPublicId());
            if (track.getCoverPublicId() != null && !track.getCoverPublicId().equals(album.getCoverPublicId())) {
                cloudMediaService.deleteImageQuietly(track.getCoverPublicId());
            }
            trackRepository.delete(track);
        }

        if (album.getCoverPublicId() != null && !album.getCoverPublicId().isBlank()) {
            cloudMediaService.deleteImageQuietly(album.getCoverPublicId());
        }

        albumRepository.delete(album);
        log.info("Album ID {} and all its {} constituent tracks permanently deleted by user ID {}.",
                id, constituentTracks.size(), user.getId());
    }

    @Transactional(readOnly = true)
    public List<StudioTrackResponse> getAvailableTracksForAlbum(Long currentAlbumId, String currentUserEmail) {
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

        for (Long trackId : trackIds) {
            Track track = trackRepository.findByIdAndUploaderUserId(trackId, currentUserId)
                    .orElseThrow(() -> new BadRequestOperationException("Track ID " + trackId + " not found or does not belong to you."));

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

        if (trackIds.isEmpty()) {
            throw new BadRequestOperationException("An album must contain at least one track. To remove all tracks, please delete the album instead.");
        }

        Set<Long> newTrackIdSet = new HashSet<>(trackIds);

        for (Track t : currentAlbumTracks) {
            if (!newTrackIdSet.contains(t.getId())) {
                playlistTrackRepository.deleteByTrack_Id(t.getId());
                listeningHistoryRepository.deleteByTrackId(t.getId());
                trackSubmissionRepository.deleteByTrackId(t.getId());
                cloudMediaService.deleteTrackAudioQuietly(t.getAudioPublicId());
                if (t.getCoverPublicId() != null && !t.getCoverPublicId().equals(album.getCoverPublicId())) {
                    cloudMediaService.deleteImageQuietly(t.getCoverPublicId());
                }
                trackRepository.delete(t);
            }
        }

        List<Track> resultTracks = new ArrayList<>();
        int order = 1;
        for (Long trackId : trackIds) {
            Track track = trackRepository.findByIdAndUploaderUserId(trackId, currentUserId)
                    .orElseThrow(() -> new BadRequestOperationException("Track ID " + trackId + " not found or does not belong to you."));

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
