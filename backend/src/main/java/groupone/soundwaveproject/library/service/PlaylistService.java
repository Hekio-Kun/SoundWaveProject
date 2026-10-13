package groupone.soundwaveproject.library.service;

import groupone.soundwaveproject.authentication.dto.response.UserProfileSummary;
import groupone.soundwaveproject.authentication.entity.AppUser;
import groupone.soundwaveproject.authentication.entity.UserStatus;
import groupone.soundwaveproject.authentication.exception.AccountBannedException;
import groupone.soundwaveproject.authentication.exception.AccountUnavailableException;
import groupone.soundwaveproject.authentication.exception.AuthenticationException;
import groupone.soundwaveproject.authentication.repository.AppUserRepository;
import groupone.soundwaveproject.authentication.service.UserAccountPublicService;
import groupone.soundwaveproject.catalog.dto.response.TrackResponse;
import groupone.soundwaveproject.catalog.entity.Track;
import groupone.soundwaveproject.catalog.entity.TrackPublicationStatus;
import groupone.soundwaveproject.catalog.repository.TrackRepository;
import groupone.soundwaveproject.exception.BadRequestOperationException;
import groupone.soundwaveproject.exception.ConflictOperationException;
import groupone.soundwaveproject.exception.ForbiddenOperationException;
import groupone.soundwaveproject.exception.ResourceNotFoundException;
import groupone.soundwaveproject.library.dto.request.PlaylistRequest;
import groupone.soundwaveproject.library.dto.request.ReorderPlaylistTracksRequest;
import groupone.soundwaveproject.library.dto.response.PlaylistResponse;
import groupone.soundwaveproject.library.entity.Playlist;
import groupone.soundwaveproject.library.entity.PlaylistTrack;
import groupone.soundwaveproject.library.repository.PlaylistRepository;
import groupone.soundwaveproject.library.repository.PlaylistTrackRepository;
import groupone.soundwaveproject.media.dto.response.StoredMediaResponse;
import groupone.soundwaveproject.media.service.CloudMediaService;
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
 * Service xử lý nghiệp vụ Quản lý Playlist cá nhân (UC-15: Manage My Playlist - CRUD).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PlaylistService {

    private final PlaylistRepository playlistRepository;
    private final PlaylistTrackRepository playlistTrackRepository;
    private final TrackRepository trackRepository;
    private final AppUserRepository appUserRepository;
    private final UserAccountPublicService userAccountPublicService;
    private final CloudMediaService cloudMediaService;

    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    /**
     * Lấy danh sách toàn bộ Playlist thuộc quyền sở hữu của người dùng hiện tại (Sequence: View).
     */
    @Transactional(readOnly = true)
    public List<PlaylistResponse> getMyPlaylists(String currentUserEmail) {
        AppUser user = getAuthenticatedUser(currentUserEmail);
        List<Playlist> playlists = playlistRepository.findByCreatedByUserIdOrderByCreatedAtDesc(user.getId());
        return playlists.stream()
                .map(p -> mapToPlaylistResponse(p, false))
                .toList();
    }

    /**
     * Lấy danh sách Playlist công khai (Public Playlists).
     */
    @Transactional(readOnly = true)
    public List<PlaylistResponse> getPublicPlaylists() {
        List<Playlist> playlists = playlistRepository.findByIsPrivateFalseOrderByCreatedAtDesc();
        return playlists.stream()
                .map(p -> mapToPlaylistResponse(p, false))
                .toList();
    }

    /**
     * Xem thông tin chi tiết một Playlist kèm danh sách bài hát có thứ tự (Sequence: View).
     */
    @Transactional(readOnly = true)
    public PlaylistResponse getPlaylistById(Long id, String currentUserEmail) {
        Playlist playlist = playlistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PLAYLIST_NOT_FOUND", "Playlist not found."));

        AppUser currentUser = null;
        if (currentUserEmail != null && !currentUserEmail.isBlank()) {
            currentUser = appUserRepository.findByEmailIgnoreCase(currentUserEmail.trim().toLowerCase(Locale.ROOT))
                    .filter(u -> u.getDeletedAt() == null)
                    .orElse(null);
        }

        // Kiểm tra quyền riêng tư: nếu playlist isPrivate = true thì chỉ chủ sở hữu mới xem được
        if (playlist.isPrivate()) {
            if (currentUser == null || !currentUser.getId().equals(playlist.getCreatedByUserId())) {
                throw new ForbiddenOperationException("FORBIDDEN", "You do not have permission to view this private playlist.");
            }
        }

        return mapToPlaylistResponse(playlist, true);
    }

    /**
     * Tạo Playlist mới (Sequence: Create).
     */
    @Transactional
    public PlaylistResponse createPlaylist(PlaylistRequest request, String currentUserEmail) {
        AppUser user = getAuthenticatedUser(currentUserEmail);

        String trimmedTitle = request.title().trim();
        if (trimmedTitle.isBlank()) {
            throw new BadRequestOperationException("INVALID_TITLE", "Playlist title cannot be blank.");
        }

        String slug = generateUniqueSlug(trimmedTitle);
        boolean isPrivate = Boolean.TRUE.equals(request.isPrivate());

        Playlist playlist = Playlist.builder()
                .ownerUserId(user.getId())
                .createdByUserId(user.getId())
                .title(trimmedTitle)
                .name(trimmedTitle)
                .slug(slug)
                .description(request.description() != null ? request.description().trim() : null)
                .coverUrl(request.coverUrl() != null && !request.coverUrl().isBlank() ? request.coverUrl().trim() : null)
                .visibility(isPrivate ? "PRIVATE" : "PUBLIC")
                .isPrivate(isPrivate)
                .createdAt(LocalDateTime.now(ZoneOffset.UTC))
                .updatedAt(LocalDateTime.now(ZoneOffset.UTC))
                .playlistTracks(new ArrayList<>())
                .build();

        Playlist saved = playlistRepository.save(playlist);
        log.info("Playlist '{}' (ID: {}) created by user ID {}", saved.getTitle(), saved.getId(), user.getId());

        return mapToPlaylistResponse(saved, true);
    }

    /**
     * Cập nhật thông tin Playlist (Sequence: Update).
     */
    @Transactional
    public PlaylistResponse updatePlaylist(Long id, PlaylistRequest request, String currentUserEmail) {
        AppUser user = getAuthenticatedUser(currentUserEmail);
        Playlist playlist = playlistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PLAYLIST_NOT_FOUND", "Playlist not found."));

        validateOwnership(playlist, user);

        String trimmedTitle = request.title().trim();
        if (trimmedTitle.isBlank()) {
            throw new BadRequestOperationException("INVALID_TITLE", "Playlist title cannot be blank.");
        }

        if (!playlist.getTitle().equalsIgnoreCase(trimmedTitle)) {
            playlist.setTitle(trimmedTitle);
            playlist.setName(trimmedTitle);
            playlist.setSlug(generateUniqueSlug(trimmedTitle));
        }

        if (request.description() != null) {
            playlist.setDescription(request.description().trim());
        }

        if (request.isPrivate() != null) {
            playlist.setPrivate(request.isPrivate());
            playlist.setVisibility(request.isPrivate() ? "PRIVATE" : "PUBLIC");
        }

        if (request.coverUrl() != null) {
            playlist.setCoverUrl(request.coverUrl().trim());
        }

        playlist.setUpdatedAt(LocalDateTime.now(ZoneOffset.UTC));
        Playlist updated = playlistRepository.save(playlist);
        log.info("Playlist ID {} updated by user ID {}", updated.getId(), user.getId());

        return mapToPlaylistResponse(updated, true);
    }

    /**
     * Xóa Playlist và toàn bộ liên kết bài hát trong Playlist (Sequence: Delete).
     */
    @Transactional
    public void deletePlaylist(Long id, String currentUserEmail) {
        AppUser user = getAuthenticatedUser(currentUserEmail);
        Playlist playlist = playlistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PLAYLIST_NOT_FOUND", "Playlist not found."));

        validateOwnership(playlist, user);

        // 1. Xóa toàn bộ liên kết bài hát trong playlist_tracks
        playlistTrackRepository.deleteByPlaylist_Id(id);

        // 2. Xóa bản ghi Playlist
        playlistRepository.delete(playlist);
        log.info("Playlist ID {} deleted by user ID {}", id, user.getId());
    }

    /**
     * Upload ảnh bìa playlist lên Cloud Media Storage (Cloudinary).
     */
    public String uploadCover(MultipartFile file, String currentUserEmail) {
        AppUser user = getAuthenticatedUser(currentUserEmail);
        StoredMediaResponse media = cloudMediaService.uploadPlaylistCover(file, user.getId());
        return media.secureUrl();
    }

    /**
     * Thêm một bài hát vào Playlist.
     */
    @Transactional
    public PlaylistResponse addTrackToPlaylist(Long playlistId, Long trackId, String currentUserEmail) {
        AppUser user = getAuthenticatedUser(currentUserEmail);
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new ResourceNotFoundException("PLAYLIST_NOT_FOUND", "Playlist not found."));

        validateOwnership(playlist, user);

        Track track = trackRepository.findById(trackId)
                .orElseThrow(() -> new ResourceNotFoundException("TRACK_NOT_FOUND", "Track not found."));

        if (playlistTrackRepository.existsByPlaylist_IdAndTrack_Id(playlistId, trackId)) {
            throw new ConflictOperationException("TRACK_ALREADY_EXISTS", "Track is already in this playlist.");
        }

        int nextPosition = (int) playlistTrackRepository.countByPlaylist_Id(playlistId) + 1;
        PlaylistTrack pt = new PlaylistTrack(playlist, track, user.getId(), nextPosition);
        playlistTrackRepository.save(pt);

        playlist.setUpdatedAt(LocalDateTime.now(ZoneOffset.UTC));
        playlistRepository.save(playlist);

        log.info("Track ID {} added to playlist ID {} at position {}", trackId, playlistId, nextPosition);
        return mapToPlaylistResponse(playlist, true);
    }

    /**
     * Xóa bài hát khỏi Playlist.
     */
    @Transactional
    public PlaylistResponse removeTrackFromPlaylist(Long playlistId, Long trackId, String currentUserEmail) {
        AppUser user = getAuthenticatedUser(currentUserEmail);
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new ResourceNotFoundException("PLAYLIST_NOT_FOUND", "Playlist not found."));

        validateOwnership(playlist, user);

        playlistTrackRepository.deleteByPlaylist_IdAndTrack_Id(playlistId, trackId);

        // Chuẩn hóa lại thứ tự các bài hát còn lại
        List<PlaylistTrack> remaining = playlistTrackRepository.findByPlaylist_IdOrderByPositionAsc(playlistId);
        int pos = 1;
        for (PlaylistTrack pt : remaining) {
            if (pt.getPosition() != pos) {
                pt.setPosition(pos);
                playlistTrackRepository.save(pt);
            }
            pos++;
        }

        playlist.setUpdatedAt(LocalDateTime.now(ZoneOffset.UTC));
        playlistRepository.save(playlist);

        log.info("Track ID {} removed from playlist ID {}", trackId, playlistId);
        return mapToPlaylistResponse(playlist, true);
    }

    /**
     * Đổi thứ tự bài hát trong Playlist (Reorder Tracks).
     */
    @Transactional
    public PlaylistResponse reorderPlaylistTracks(Long playlistId, ReorderPlaylistTracksRequest request, String currentUserEmail) {
        AppUser user = getAuthenticatedUser(currentUserEmail);
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new ResourceNotFoundException("PLAYLIST_NOT_FOUND", "Playlist not found."));

        validateOwnership(playlist, user);

        List<PlaylistTrack> tracks = playlistTrackRepository.findByPlaylist_IdOrderByPositionAsc(playlistId);

        if (request.trackIds() != null && !request.trackIds().isEmpty()) {
            Map<Long, PlaylistTrack> trackMap = new HashMap<>();
            tracks.forEach(pt -> trackMap.put(pt.getTrack().getId(), pt));

            // Shift to temporary positions first to avoid UQ_playlist_tracks_position violation
            for (int i = 0; i < tracks.size(); i++) {
                PlaylistTrack pt = tracks.get(i);
                pt.setPosition(1000000 + i + 1);
                playlistTrackRepository.save(pt);
            }
            playlistTrackRepository.flush();

            int pos = 1;
            for (Long tId : request.trackIds()) {
                PlaylistTrack pt = trackMap.get(tId);
                if (pt != null) {
                    pt.setPosition(pos++);
                    playlistTrackRepository.save(pt);
                }
            }
            playlistTrackRepository.flush();
        } else if (request.trackId() != null && request.direction() != null) {
            int targetIdx = -1;
            for (int i = 0; i < tracks.size(); i++) {
                if (tracks.get(i).getTrack().getId().equals(request.trackId())) {
                    targetIdx = i;
                    break;
                }
            }

            if (targetIdx >= 0) {
                int swapIdx = "UP".equalsIgnoreCase(request.direction()) ? targetIdx - 1 : targetIdx + 1;
                if (swapIdx >= 0 && swapIdx < tracks.size()) {
                    PlaylistTrack current = tracks.get(targetIdx);
                    PlaylistTrack target = tracks.get(swapIdx);

                    int currentPos = current.getPosition();
                    int targetPos = target.getPosition();

                    // Step 1: Move current to temporary position to avoid duplicate key collision
                    current.setPosition(1000000 + currentPos);
                    playlistTrackRepository.saveAndFlush(current);

                    // Step 2: Set target to current's old position
                    target.setPosition(currentPos);
                    playlistTrackRepository.saveAndFlush(target);

                    // Step 3: Set current to target's old position
                    current.setPosition(targetPos);
                    playlistTrackRepository.saveAndFlush(current);
                }
            }
        }

        playlist.setUpdatedAt(LocalDateTime.now(ZoneOffset.UTC));
        playlistRepository.save(playlist);

        return mapToPlaylistResponse(playlist, true);
    }

    private void validateOwnership(Playlist playlist, AppUser user) {
        if (!playlist.getCreatedByUserId().equals(user.getId())) {
            throw new ForbiddenOperationException("FORBIDDEN", "You do not have permission to modify this playlist.");
        }
    }

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
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new AccountUnavailableException("ACCOUNT_INACTIVE", "Account is not active.");
        }
        return user;
    }

    private PlaylistResponse mapToPlaylistResponse(Playlist playlist, boolean includeTracks) {
        List<PlaylistTrack> pts = playlistTrackRepository.findByPlaylist_IdOrderByPositionAsc(playlist.getId());
        int trackCount = pts.size();
        long totalDurationMs = pts.stream()
                .mapToLong(pt -> pt.getTrack().getDurationMs() != null ? pt.getTrack().getDurationMs() : 0L)
                .sum();
        List<Long> trackIds = pts.stream()
                .map(pt -> pt.getTrack().getId())
                .toList();

        List<TrackResponse> trackResponses = null;
        if (includeTracks) {
            trackResponses = pts.stream()
                    .map(pt -> mapToTrackResponse(pt.getTrack()))
                    .toList();
        }

        String ownerName = userAccountPublicService.findUserSummaryById(playlist.getCreatedByUserId())
                .map(u -> u.displayName() != null ? u.displayName() : "User #" + u.userId())
                .orElse("User #" + playlist.getCreatedByUserId());

        return new PlaylistResponse(
                playlist.getId(),
                playlist.getTitle(),
                playlist.getSlug(),
                playlist.getDescription(),
                playlist.getCoverUrl(),
                playlist.isPrivate(),
                playlist.getCreatedByUserId(),
                ownerName,
                ownerName,
                trackCount,
                totalDurationMs,
                trackIds,
                trackResponses,
                playlist.getCreatedAt(),
                playlist.getUpdatedAt()
        );
    }

    private TrackResponse mapToTrackResponse(Track track) {
        TrackResponse.TrackAlbumSummary albumSummary = null;
        if (track.getAlbum() != null) {
            albumSummary = new TrackResponse.TrackAlbumSummary(
                    track.getAlbum().getId(),
                    track.getAlbum().getTitle()
            );
        }

        TrackResponse.TrackCreatorSummary creatorSummary = userAccountPublicService
                .findUserSummaryById(track.getUploaderUserId())
                .map(user -> new TrackResponse.TrackCreatorSummary(
                        user.userId(),
                        user.displayName(),
                        user.avatarUrl()
                ))
                .orElseGet(() -> new TrackResponse.TrackCreatorSummary(
                        track.getUploaderUserId(),
                        "Unknown Artist",
                        null
                ));

        return new TrackResponse(
                track.getId(),
                track.getTitle(),
                track.getSlug(),
                track.getDescription(),
                track.getAudioUrl(),
                track.getCoverUrl(),
                track.getDurationMs(),
                track.getPlayCountCache() != null ? track.getPlayCountCache() : 0L,
                track.getPublicationStatus() != null ? track.getPublicationStatus().name() : TrackPublicationStatus.DRAFT.name(),
                track.getGenre() != null ? track.getGenre().getSlug() : null,
                track.getGenre() != null ? track.getGenre().getName() : null,
                albumSummary,
                creatorSummary,
                track.getCreatedAt()
        );
    }

    private String generateUniqueSlug(String title) {
        String baseSlug = toSlug(title);
        if (baseSlug.isBlank()) baseSlug = "playlist";
        String candidate = baseSlug;
        int counter = 1;
        while (playlistRepository.existsBySlug(candidate)) {
            candidate = baseSlug + "-" + counter;
            counter++;
        }
        return candidate;
    }

    private static String toSlug(String input) {
        if (input == null) return "";
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        String noAccents = Pattern.compile("\\p{InCombiningDiacriticalMarks}+").matcher(normalized).replaceAll("");
        String slug = WHITESPACE.matcher(noAccents).replaceAll("-");
        slug = NONLATIN.matcher(slug).replaceAll("");
        return slug.toLowerCase(Locale.ENGLISH).replaceAll("-+", "-").replaceAll("^-|-$", "");
    }
}
