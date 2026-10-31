package groupone.soundwaveproject.studio.service;

import groupone.soundwaveproject.authentication.entity.Staff;
import groupone.soundwaveproject.authentication.entity.User;
import groupone.soundwaveproject.authentication.entity.UserStatus;
import groupone.soundwaveproject.authentication.exception.AccountBannedException;
import groupone.soundwaveproject.authentication.exception.AccountUnavailableException;
import groupone.soundwaveproject.authentication.exception.AuthenticationException;
import groupone.soundwaveproject.authentication.repository.StaffRepository;
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
import groupone.soundwaveproject.exception.ForbiddenOperationException;
import groupone.soundwaveproject.exception.ResourceNotFoundException;
import groupone.soundwaveproject.library.repository.ListeningHistoryRepository;
import groupone.soundwaveproject.library.repository.PlaylistTrackRepository;
import groupone.soundwaveproject.media.dto.response.StoredAudioResponse;
import groupone.soundwaveproject.media.dto.response.StoredMediaResponse;
import groupone.soundwaveproject.media.service.CloudMediaService;
import groupone.soundwaveproject.moderation.entity.SubmissionStatus;
import groupone.soundwaveproject.moderation.entity.TrackSubmission;
import groupone.soundwaveproject.moderation.repository.TrackSubmissionRepository;
import groupone.soundwaveproject.notification.entity.NotificationType;
import groupone.soundwaveproject.notification.service.NotificationService;
import groupone.soundwaveproject.studio.dto.request.CreateTrackRequest;
import groupone.soundwaveproject.studio.dto.request.GetRejectionDetailsRequest;
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
import java.time.LocalDateTime;
import java.time.ZoneOffset;
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
    private final PlaylistTrackRepository playlistTrackRepository;
    private final ListeningHistoryRepository listeningHistoryRepository;
    private final UserRepository userRepository;
    private final StaffRepository staffRepository;
    private final CloudMediaService cloudMediaService;
    private final StudioTrackMapper studioTrackMapper;
    private final NotificationService notificationService;

    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    @Transactional(readOnly = true)
    public List<StudioTrackResponse> getMyTracks(String currentUserEmail, String statusFilter) {
        User user = getAuthenticatedUser(currentUserEmail);

        List<Track> tracks;
        if (statusFilter == null || statusFilter.isBlank() || "ALL".equalsIgnoreCase(statusFilter)) {
            // [FEATURE]: UC-19: Delete An Owned Track (POST-5)
            // Lọc bỏ bài hát đã bị gỡ / xóa mềm (TAKEN_DOWN) khỏi bảng quản lý My Tracks của creator
            tracks = trackRepository.findByUploaderUserIdAndPublicationStatusNotOrderByCreatedAtDesc(
                    user.getId(), TrackPublicationStatus.TAKEN_DOWN
            );
        } else {
            try {
                String normalizedFilter = statusFilter.trim().toUpperCase(Locale.ROOT);
                if ("APPROVED".equals(normalizedFilter)) {
                    normalizedFilter = "PUBLISHED";
                }
                TrackPublicationStatus status = TrackPublicationStatus.valueOf(normalizedFilter);
                if (status == TrackPublicationStatus.TAKEN_DOWN) {
                    tracks = List.of();
                } else {
                    tracks = trackRepository.findByUploaderUserIdAndPublicationStatusOrderByCreatedAtDesc(user.getId(), status);
                }
            } catch (IllegalArgumentException ex) {
                tracks = trackRepository.findByUploaderUserIdAndPublicationStatusNotOrderByCreatedAtDesc(
                        user.getId(), TrackPublicationStatus.TAKEN_DOWN
                );
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
        User user = getAuthenticatedUser(currentUserEmail);
        Track track = trackRepository.findByIdAndUploaderUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Track not found or access denied."));

        Genre genre = track.getGenreId() != null ? genreRepository.findById(track.getGenreId()).orElse(null) : null;
        Album album = track.getAlbumId() != null ? albumRepository.findById(track.getAlbumId()).orElse(null) : null;
        TrackSubmission submission = trackSubmissionRepository.findFirstByTrackIdOrderBySubmittedAtDesc(track.getId()).orElse(null);

        return studioTrackMapper.toStudioTrackResponse(track, genre, album, submission);
    }

    /**
     * Tạo bản nháp bài hát mới (UC-19.1 Create Track Draft) cho tác giả (Listener).
     * Tải media lên Cloudinary, khởi tạo bài hát ở trạng thái DRAFT và tự động dọn dẹp
     * media trên Cloudinary nếu quá trình lưu cơ sở dữ liệu gặp lỗi (EX05).
     */
    @Transactional
    public StudioTrackResponse createDraft(CreateTrackRequest request, MultipartFile audio, MultipartFile cover, String currentUserEmail) {
        User user = getAuthenticatedUser(currentUserEmail);

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

        try {
            String slug = generateUniqueSlug(request.title());
            int finalDurationMs = request.durationMs() != null && request.durationMs() > 0
                    ? request.durationMs()
                    : (audioResponse.durationMs() != null ? audioResponse.durationMs() : 0);

            Integer finalTrackNumber = request.trackNumber();
            if (finalTrackNumber == null && album != null) {
                finalTrackNumber = (int) trackRepository.countByAlbum_Id(album.getId()) + 1;
            }

            Track track = Track.builder()
                    .uploaderUserId(user.getId())
                    .genre(genre)
                    .album(album)
                    .title(request.title().trim())
                    .slug(slug)
                    .description(request.description() != null ? request.description().trim() : null)
                    .trackNumber(finalTrackNumber)
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
        } catch (Exception ex) {
            log.error("Failed to persist track into database for user ID {}. Purging uploaded Cloudinary media...", user.getId(), ex);
            cloudMediaService.deleteTrackAudioQuietly(audioResponse.publicId());
            if (coverResponse != null) {
                cloudMediaService.deleteImageQuietly(coverResponse.publicId());
            }
            throw ex;
        }
    }



    /**
     * [FEATURE]: UC-19: Delete An Owned Track
     * Cho phép Creator xóa bài hát thuộc quyền sở hữu của mình ở trạng thái DRAFT, REJECTED hoặc PUBLISHED.
     *
     * Áp dụng chiến lược xóa 2 tầng (Dual-tier deletion strategy):
     * 1. PRE-1, PRE-2, PRE-3: Xác thực người dùng sở hữu bài hát và bài hát ở trạng thái hợp lệ.
     *    - EX01: Khóa hoàn toàn và từ chối nếu bài hát đang trong hàng đợi PENDING kiểm duyệt.
     *    - EX02: Từ chối nếu bài hát không tồn tại hoặc không thuộc quyền sở hữu của user.
     * 2. POST-1 & EX03: Xóa vĩnh viễn tài nguyên media trên Cloudinary (âm thanh và ảnh bìa)
     *    để giải phóng dung lượng và ngăn chặn nghe nhạc trái phép.
     * 3. Chiến lược phân tầng:
     *    - HARD DELETE (DRAFT, REJECTED - POST-2 & Step 7):
     *      Xóa vĩnh viễn bản ghi bài hát và các dữ liệu liên kết nháp tạm thời (playlist, history, submission) khỏi PostgreSQL.
     *    - SOFT DELETE (PUBLISHED - POST-3 & Step 8):
     *      Chuyển publicationStatus sang TAKEN_DOWN, xóa sạch URL phát nhạc công khai và media public IDs,
     *      nhưng BẢO TỒN bản ghi cơ sở dữ liệu và liên kết để duy trì tính toàn vẹn dữ liệu tham chiếu
     *      cho lịch sử nghe nhạc và báo cáo phân tích/analytics.
     * 4. POST-4 & AF02: Đánh giá và tự động hạ cấp trạng thái Album về DRAFT nếu không còn bài hát nào PUBLISHED.
     */
    @Transactional
    public void deleteTrack(Long id, String currentUserEmail) {
        User user = getAuthenticatedUser(currentUserEmail);
        Track track = trackRepository.findByIdAndUploaderUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Track not found or access denied."));

        // EX01: Khóa hoàn toàn nếu bài hát đang trong hàng đợi PENDING kiểm duyệt
        if (track.getPublicationStatus() == TrackPublicationStatus.PENDING) {
            throw new ForbiddenOperationException("Tracks currently pending review cannot be deleted. Please withdraw the submission first.");
        }
        if (track.getPublicationStatus() != TrackPublicationStatus.DRAFT
                && track.getPublicationStatus() != TrackPublicationStatus.REJECTED
                && track.getPublicationStatus() != TrackPublicationStatus.PUBLISHED) {
            throw new ForbiddenOperationException("Tracks in " + track.getPublicationStatus() + " status cannot be deleted.");
        }

        Album album = track.getAlbum();
        TrackPublicationStatus originalStatus = track.getPublicationStatus();

        // POST-1 & EX03: Yêu cầu Cloudinary thanh lọc vĩnh viễn file âm thanh và ảnh bìa
        cloudMediaService.deleteTrackAudioQuietly(track.getAudioPublicId());
        cloudMediaService.deleteImageQuietly(track.getCoverPublicId());

        if (originalStatus == TrackPublicationStatus.PUBLISHED) {
            // [FEATURE]: SOFT DELETE (POST-3 & Step 8) cho bài hát PUBLISHED
            // Chuyển sang TAKEN_DOWN, thu hồi quyền nghe công khai, xóa URL streaming
            // Bảo toàn tính toàn vẹn tham chiếu cho listening history và analytics
            track.setPublicationStatus(TrackPublicationStatus.TAKEN_DOWN);
            track.setAudioUrl(null);
            track.setAudioPublicId(null);
            track.setCoverUrl(null);
            track.setCoverPublicId(null);
            trackRepository.save(track);
        } else {
            // [FEATURE]: HARD DELETE (POST-2 & Step 7) cho bài hát DRAFT hoặc REJECTED
            playlistTrackRepository.deleteByTrack_Id(track.getId());
            listeningHistoryRepository.deleteByTrackId(track.getId());
            trackSubmissionRepository.deleteByTrackId(track.getId());
            trackRepository.delete(track);
        }

        // POST-4 & AF02: Đánh giá các bài hát còn lại trong Album, hạ cấp về DRAFT nếu không còn bài hát PUBLISHED nào
        if (album != null) {
            boolean hasPublishedTrack = trackRepository.existsByAlbum_IdAndPublicationStatus(
                    album.getId(), TrackPublicationStatus.PUBLISHED
            );
            if (!hasPublishedTrack) {
                album.setStatus("DRAFT");
                albumRepository.save(album);
            }
        }
    }

    @Transactional
    public StudioTrackResponse submitForReview(Long id, String submitterNote, String currentUserEmail) {
        User user = getAuthenticatedUser(currentUserEmail);
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

        try {
            List<Staff> staffMembers = staffRepository.findAll();
            for (Staff staff : staffMembers) {
                notificationService.createStaffNotification(
                        staff.getId(),
                        user.getId(),
                        NotificationType.TRACK_SUBMISSION,
                        "New submission for review",
                        "Track \"" + track.getTitle() + "\" has been submitted for moderation.",
                        "SUBMISSION",
                        String.valueOf(savedSubmission.getId())
                );
            }
        } catch (Exception e) {
            log.warn("Failed to create submission notification for staff: {}", e.getMessage());
        }

        Genre genre = genreRepository.findById(track.getGenreId()).orElse(null);
        Album album = track.getAlbumId() != null ? albumRepository.findById(track.getAlbumId()).orElse(null) : null;

        return studioTrackMapper.toStudioTrackResponse(track, genre, album, savedSubmission);
    }

    @Transactional
    public StudioTrackResponse withdrawSubmission(Long id, String currentUserEmail) {
        User user = getAuthenticatedUser(currentUserEmail);
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

        /**
     * Tra cứu chi tiết lý do từ chối kiểm duyệt của bài hát theo request DTO (UC-20 theo Sequence Diagram).
     * Bước 5: getRejectionDetails(rejectionRequestDTO, currentUserEmail)
     */
    @Transactional(readOnly = true)
    public RejectionDetailsResponse getRejectionDetails(GetRejectionDetailsRequest request, String currentUserEmail) {
        if (request == null || request.trackId() == null) {
            throw new ResourceNotFoundException("Track not found or access denied.");
        }
        return getRejectionDetails(request.trackId(), currentUserEmail);
    }

    /**
     * Tra cứu chi tiết lý do từ chối kiểm duyệt bài hát theo trackId (UC-20: View Rejection Reason).
     * Bước 6: uploader = validateAndGetUploader(currentUserEmail)
     * Bước 7: optionalTrack = trackRepository.findByIdAndUploaderUserId(trackId, uploader.getId())
     * Bước 13 (Alt: Track not found / access denied): throw ResourceNotFoundException("Track not found or access denied.")
     * Bước 16 (Alt: Track exists and owned by listener): track = optionalTrack.get()
     * Bước 17: submissionsList = trackSubmissionRepository.findByTrackIdOrderBySubmittedAtDesc(trackId)
     * Bước 23: rejectionDetailsResponse = studioTrackMapper.toRejectionDetails(track, submissionsList)
     */
    @Transactional(readOnly = true)
    public RejectionDetailsResponse getRejectionDetails(Long id, String currentUserEmail) {
        User uploader = validateAndGetUploader(currentUserEmail);
        Track track = trackRepository.findByIdAndUploaderUserId(id, uploader.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Track not found or access denied."));

        List<TrackSubmission> submissionsList = trackSubmissionRepository.findByTrackIdOrderBySubmittedAtDesc(track.getId());
        return studioTrackMapper.toRejectionDetails(track, submissionsList);
    }

    /**
     * Xác thực và lấy đối tượng người dùng sở hữu (uploader) theo email (Bước 6 trong Sequence Diagram).
     */
    private User validateAndGetUploader(String email) {
        return getAuthenticatedUser(email);
    }

    @Transactional(readOnly = true)
    public StudioStatsResponse getStats(String currentUserEmail) {
        User user = getAuthenticatedUser(currentUserEmail);
        long draft = trackRepository.countByUploaderUserIdAndPublicationStatus(user.getId(), TrackPublicationStatus.DRAFT);
        long pending = trackRepository.countByUploaderUserIdAndPublicationStatus(user.getId(), TrackPublicationStatus.PENDING);
        long approved = trackRepository.countByUploaderUserIdAndPublicationStatus(user.getId(), TrackPublicationStatus.PUBLISHED);
        long rejected = trackRepository.countByUploaderUserIdAndPublicationStatus(user.getId(), TrackPublicationStatus.REJECTED);
        long total = draft + pending + approved + rejected;

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
        User user = getAuthenticatedUser(currentUserEmail);
        return albumRepository.findByCreatedByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(studioTrackMapper::toAlbumOption)
                .toList();
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
