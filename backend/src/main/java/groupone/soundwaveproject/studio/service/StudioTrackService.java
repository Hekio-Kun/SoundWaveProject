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
import groupone.soundwaveproject.exception.ForbiddenOperationException;
import groupone.soundwaveproject.exception.ResourceNotFoundException;
import groupone.soundwaveproject.media.dto.response.StoredAudioResponse;
import groupone.soundwaveproject.media.dto.response.StoredMediaResponse;
import groupone.soundwaveproject.media.service.CloudMediaService;
import groupone.soundwaveproject.moderation.entity.SubmissionStatus;
import groupone.soundwaveproject.moderation.entity.TrackSubmission;
import groupone.soundwaveproject.moderation.repository.TrackSubmissionRepository;
import groupone.soundwaveproject.studio.dto.request.CreateTrackRequest;
import groupone.soundwaveproject.studio.dto.request.UpdateTrackRequest;
import groupone.soundwaveproject.studio.dto.response.AlbumOptionResponse;
import groupone.soundwaveproject.studio.dto.response.GenreOptionResponse;
import groupone.soundwaveproject.studio.dto.response.RejectionDetailsResponse;
import groupone.soundwaveproject.studio.dto.response.StudioStatsResponse;
import groupone.soundwaveproject.studio.dto.response.StudioTrackResponse;
import groupone.soundwaveproject.studio.mapper.StudioTrackMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class StudioTrackService {

    private final TrackRepository trackRepository;
    private final GenreRepository genreRepository;
    private final AlbumRepository albumRepository;
    private final TrackSubmissionRepository trackSubmissionRepository;
    private final AppUserRepository appUserRepository;
    private final CloudMediaService cloudMediaService;
    private final StudioTrackMapper studioTrackMapper;

    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    @Transactional(readOnly = true)
    public List<StudioTrackResponse> getMyTracks(String currentUserEmail, String statusFilter) {
        AppUser user = getAuthenticatedUser(currentUserEmail);

        List<Track> tracks;
        if (statusFilter == null || statusFilter.isBlank() || "ALL".equalsIgnoreCase(statusFilter)) {
            tracks = trackRepository.findByUploaderUserIdOrderByCreatedAtDesc(user.getId());
        } else {
            try {
                String normalizedFilter = statusFilter.trim().toUpperCase(Locale.ROOT);
                if ("APPROVED".equals(normalizedFilter)) {
                    normalizedFilter = "PUBLISHED";
                }
                TrackPublicationStatus status = TrackPublicationStatus.valueOf(normalizedFilter);
                tracks = trackRepository.findByUploaderUserIdAndPublicationStatusOrderByCreatedAtDesc(user.getId(), status);
            } catch (IllegalArgumentException ex) {
                tracks = trackRepository.findByUploaderUserIdOrderByCreatedAtDesc(user.getId());
            }
        }

        return tracks.stream().map(track -> {
            Genre genre = track.getGenreId() != null ? genreRepository.findById(track.getGenreId()).orElse(null) : null;
            Album album = track.getAlbumId() != null ? albumRepository.findById(track.getAlbumId()).orElse(null) : null;
            TrackSubmission submission = trackSubmissionRepository.findFirstByTrackIdOrderBySubmittedAtDesc(track.getId()).orElse(null);
            return studioTrackMapper.toStudioTrackResponse(track, genre, album, submission);
        }).toList();
    }

    @Transactional(readOnly = true)
    public StudioTrackResponse getTrackById(Long id, String currentUserEmail) {
        AppUser user = getAuthenticatedUser(currentUserEmail);
        Track track = trackRepository.findByIdAndUploaderUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Track not found or access denied."));

        Genre genre = track.getGenreId() != null ? genreRepository.findById(track.getGenreId()).orElse(null) : null;
        Album album = track.getAlbumId() != null ? albumRepository.findById(track.getAlbumId()).orElse(null) : null;
        TrackSubmission submission = trackSubmissionRepository.findFirstByTrackIdOrderBySubmittedAtDesc(track.getId()).orElse(null);

        return studioTrackMapper.toStudioTrackResponse(track, genre, album, submission);
    }

    @Transactional
    public StudioTrackResponse createDraft(CreateTrackRequest request, MultipartFile audio, MultipartFile cover, String currentUserEmail) {
        AppUser user = getAuthenticatedUser(currentUserEmail);

        if (audio == null || audio.isEmpty()) {
            throw new BadRequestOperationException("Audio file is required to upload a track.");
        }

        Genre genre = genreRepository.findById(request.genreId())
                .orElseThrow(() -> new BadRequestOperationException("Selected genre is invalid."));
        if (!Boolean.TRUE.equals(genre.getIsActive())) {
            throw new BadRequestOperationException("Selected genre is currently inactive.");
        }

        Album album = null;
        if (request.albumId() != null) {
            album = albumRepository.findByIdAndCreatedByUserId(request.albumId(), user.getId())
                    .orElseThrow(() -> new BadRequestOperationException("Selected album is invalid or unauthorized."));
        }

        StoredAudioResponse audioResponse = cloudMediaService.uploadTrackAudio(audio, user.getId());

        StoredMediaResponse coverResponse = null;
        if (cover != null && !cover.isEmpty()) {
            coverResponse = cloudMediaService.uploadTrackCover(cover, user.getId());
        }

        String slug = generateUniqueSlug(request.title());
        int finalDurationMs = request.durationMs() != null && request.durationMs() > 0
                ? request.durationMs()
                : (audioResponse.durationMs() != null ? audioResponse.durationMs() : 0);

        Track track = Track.builder()
                .uploaderUserId(user.getId())
                .genre(genre)
                .album(album)
                .title(request.title().trim())
                .slug(slug)
                .description(request.description() != null ? request.description().trim() : null)
                .trackNumber(request.trackNumber())
                .publicationStatus(TrackPublicationStatus.DRAFT)
                .audioPublicId(audioResponse.publicId())
                .audioUrl(audioResponse.secureUrl())
                .audioFormat(audioResponse.format() != null ? audioResponse.format() : "mp3")
                .durationMs(finalDurationMs)
                .coverPublicId(coverResponse != null ? coverResponse.publicId() : null)
                .coverUrl(coverResponse != null ? coverResponse.secureUrl() : null)
                .playCountCache(0L)
                .lyrics(request.lyrics() != null && !request.lyrics().isBlank() ? request.lyrics().trim() : null)
                .build();

        Track savedTrack = trackRepository.save(track);
        return studioTrackMapper.toStudioTrackResponse(savedTrack, genre, album, null);
    }

    @Transactional
    public StudioTrackResponse updateTrack(Long id, UpdateTrackRequest request, MultipartFile audio, MultipartFile cover, String currentUserEmail) {
        AppUser user = getAuthenticatedUser(currentUserEmail);
        Track track = trackRepository.findByIdAndUploaderUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Track not found or access denied."));

        if (track.getPublicationStatus() != TrackPublicationStatus.DRAFT && track.getPublicationStatus() != TrackPublicationStatus.REJECTED) {
            throw new ForbiddenOperationException("Only DRAFT or REJECTED tracks can be modified.");
        }

        Genre genre = genreRepository.findById(request.genreId())
                .orElseThrow(() -> new BadRequestOperationException("Selected genre is invalid."));
        if (!Boolean.TRUE.equals(genre.getIsActive())) {
            throw new BadRequestOperationException("Selected genre is currently inactive.");
        }

        Album album = null;
        if (request.albumId() != null) {
            album = albumRepository.findByIdAndCreatedByUserId(request.albumId(), user.getId())
                    .orElseThrow(() -> new BadRequestOperationException("Selected album is invalid or unauthorized."));
        }

        if (audio != null && !audio.isEmpty()) {
            StoredAudioResponse audioResponse = cloudMediaService.uploadTrackAudio(audio, user.getId());
            cloudMediaService.deleteTrackAudioQuietly(track.getAudioPublicId());

            track.setAudioPublicId(audioResponse.publicId());
            track.setAudioUrl(audioResponse.secureUrl());
            track.setAudioFormat(audioResponse.format() != null ? audioResponse.format() : "mp3");
            track.setDurationMs(request.durationMs() != null && request.durationMs() > 0
                    ? request.durationMs()
                    : (audioResponse.durationMs() != null ? audioResponse.durationMs() : track.getDurationMs()));
        } else if (request.durationMs() != null && request.durationMs() > 0) {
            track.setDurationMs(request.durationMs());
        }

        if (cover != null && !cover.isEmpty()) {
            StoredMediaResponse coverResponse = cloudMediaService.uploadTrackCover(cover, user.getId());
            cloudMediaService.deleteImageQuietly(track.getCoverPublicId());

            track.setCoverPublicId(coverResponse.publicId());
            track.setCoverUrl(coverResponse.secureUrl());
        }

        if (!track.getTitle().equalsIgnoreCase(request.title().trim())) {
            track.setTitle(request.title().trim());
            track.setSlug(generateUniqueSlug(request.title()));
        }

        track.setGenre(genre);
        track.setAlbum(album);
        track.setTrackNumber(request.trackNumber());
        track.setDescription(request.description() != null ? request.description().trim() : null);
        if (request.lyrics() != null) {
            track.setLyrics(request.lyrics().isBlank() ? null : request.lyrics().trim());
        }

        Track updatedTrack = trackRepository.save(track);
        TrackSubmission submission = trackSubmissionRepository.findFirstByTrackIdOrderBySubmittedAtDesc(track.getId()).orElse(null);

        return studioTrackMapper.toStudioTrackResponse(updatedTrack, genre, album, submission);
    }

    @Transactional
    public void deleteTrack(Long id, String currentUserEmail) {
        AppUser user = getAuthenticatedUser(currentUserEmail);
        Track track = trackRepository.findByIdAndUploaderUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Track not found or access denied."));

        if (track.getPublicationStatus() == TrackPublicationStatus.PUBLISHED || track.getPublicationStatus() == TrackPublicationStatus.PENDING) {
            throw new ConflictOperationException("Cannot delete a published or pending track directly.");
        }

        trackSubmissionRepository.deleteByTrackId(track.getId());
        cloudMediaService.deleteTrackAudioQuietly(track.getAudioPublicId());
        cloudMediaService.deleteImageQuietly(track.getCoverPublicId());

        trackRepository.delete(track);
    }

    @Transactional
    public StudioTrackResponse submitForReview(Long id, String submitterNote, String currentUserEmail) {
        AppUser user = getAuthenticatedUser(currentUserEmail);
        Track track = trackRepository.findByIdAndUploaderUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Track not found or access denied."));

        if (track.getPublicationStatus() != TrackPublicationStatus.DRAFT && track.getPublicationStatus() != TrackPublicationStatus.REJECTED) {
            throw new ConflictOperationException("Only DRAFT or REJECTED tracks can be submitted for review.");
        }

        track.setPublicationStatus(TrackPublicationStatus.PENDING);
        trackRepository.save(track);

        TrackSubmission submission = TrackSubmission.builder()
                .trackId(track.getId())
                .submittedByUserId(user.getId())
                .status(SubmissionStatus.PENDING)
                .submitterNote(submitterNote)
                .build();
        TrackSubmission savedSubmission = trackSubmissionRepository.save(submission);

        Genre genre = genreRepository.findById(track.getGenreId()).orElse(null);
        Album album = track.getAlbumId() != null ? albumRepository.findById(track.getAlbumId()).orElse(null) : null;

        return studioTrackMapper.toStudioTrackResponse(track, genre, album, savedSubmission);
    }

    @Transactional
    public StudioTrackResponse withdrawSubmission(Long id, String currentUserEmail) {
        AppUser user = getAuthenticatedUser(currentUserEmail);
        Track track = trackRepository.findByIdAndUploaderUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Track not found or access denied."));

        if (track.getPublicationStatus() != TrackPublicationStatus.PENDING) {
            throw new ConflictOperationException("Only PENDING tracks can be withdrawn from review.");
        }

        track.setPublicationStatus(TrackPublicationStatus.DRAFT);
        trackRepository.save(track);

        trackSubmissionRepository.findFirstByTrackIdOrderBySubmittedAtDesc(track.getId())
                .ifPresent(sub -> {
                    if (sub.getStatus() == SubmissionStatus.PENDING) {
                        trackSubmissionRepository.delete(sub);
                    }
                });

        Genre genre = genreRepository.findById(track.getGenreId()).orElse(null);
        Album album = track.getAlbumId() != null ? albumRepository.findById(track.getAlbumId()).orElse(null) : null;

        return studioTrackMapper.toStudioTrackResponse(track, genre, album, null);
    }

    @Transactional(readOnly = true)
    public RejectionDetailsResponse getRejectionDetails(Long id, String currentUserEmail) {
        AppUser user = getAuthenticatedUser(currentUserEmail);
        Track track = trackRepository.findByIdAndUploaderUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Track not found or access denied."));

        TrackSubmission submission = trackSubmissionRepository.findFirstByTrackIdOrderBySubmittedAtDesc(track.getId()).orElse(null);
        return studioTrackMapper.toRejectionDetails(track, submission);
    }

    @Transactional(readOnly = true)
    public StudioStatsResponse getStats(String currentUserEmail) {
        AppUser user = getAuthenticatedUser(currentUserEmail);
        long total = trackRepository.countByUploaderUserId(user.getId());
        long draft = trackRepository.countByUploaderUserIdAndPublicationStatus(user.getId(), TrackPublicationStatus.DRAFT);
        long pending = trackRepository.countByUploaderUserIdAndPublicationStatus(user.getId(), TrackPublicationStatus.PENDING);
        long approved = trackRepository.countByUploaderUserIdAndPublicationStatus(user.getId(), TrackPublicationStatus.PUBLISHED);
        long rejected = trackRepository.countByUploaderUserIdAndPublicationStatus(user.getId(), TrackPublicationStatus.REJECTED);

        return new StudioStatsResponse(total, draft, pending, approved, rejected);
    }

    @Transactional(readOnly = true)
    public List<GenreOptionResponse> getActiveGenres() {
        return genreRepository.findByIsActiveTrueOrderByNameAsc()
                .stream()
                .map(studioTrackMapper::toGenreOption)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AlbumOptionResponse> getMyAlbums(String currentUserEmail) {
        AppUser user = getAuthenticatedUser(currentUserEmail);
        return albumRepository.findByCreatedByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(studioTrackMapper::toAlbumOption)
                .toList();
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
        return user;
    }

    private String generateUniqueSlug(String input) {
        String baseSlug = toSlug(input);
        if (baseSlug.isBlank()) baseSlug = "track";
        String slug = baseSlug + "-" + System.currentTimeMillis();
        return slug.length() > 220 ? slug.substring(0, 220) : slug;
    }

    private String toSlug(String input) {
        String nowhitespace = WHITESPACE.matcher(input).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = NONLATIN.matcher(normalized).replaceAll("");
        return slug.toLowerCase(Locale.ENGLISH);
    }
}

