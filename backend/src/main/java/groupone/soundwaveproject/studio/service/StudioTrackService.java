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
import groupone.soundwaveproject.moderation.entity.SubmissionType;
import groupone.soundwaveproject.studio.dto.request.SubmitTrackLyricsRequest;
import groupone.soundwaveproject.studio.dto.response.PendingLyricSubmissionResponse;
import java.util.Optional;
import groupone.soundwaveproject.moderation.entity.TrackSubmission;
import groupone.soundwaveproject.moderation.repository.TrackSubmissionRepository;
import groupone.soundwaveproject.notification.entity.NotificationType;
import groupone.soundwaveproject.notification.service.NotificationService;
import groupone.soundwaveproject.studio.dto.request.CreateTrackRequest;
import groupone.soundwaveproject.studio.dto.request.GetRejectionDetailsRequest;
import groupone.soundwaveproject.studio.dto.request.UpdateTrackRequest;
import groupone.soundwaveproject.studio.dto.response.AlbumOptionResponse;
import groupone.soundwaveproject.studio.dto.response.GenreOptionResponse;
import groupone.soundwaveproject.studio.dto.response.RejectionDetailsResponse;
import groupone.soundwaveproject.studio.dto.response.StudioStatsResponse;
import groupone.soundwaveproject.studio.dto.response.StudioTrackResponse;
import groupone.soundwaveproject.lyrics.entity.OfficialLyric;
import groupone.soundwaveproject.lyrics.repository.OfficialLyricRepository;
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
    private final groupone.soundwaveproject.lyrics.service.LyricService lyricService;

    public StudioTrackService(
            TrackRepository trackRepository,
            GenreRepository genreRepository,
            AlbumRepository albumRepository,
            TrackSubmissionRepository trackSubmissionRepository,
            PlaylistTrackRepository playlistTrackRepository,
            ListeningHistoryRepository listeningHistoryRepository,
            UserRepository userRepository,
            StaffRepository staffRepository,
            CloudMediaService cloudMediaService,
            StudioTrackMapper studioTrackMapper,
            NotificationService notificationService
    ) {
        this(trackRepository, genreRepository, albumRepository, trackSubmissionRepository,
                playlistTrackRepository, listeningHistoryRepository, userRepository,
                staffRepository, cloudMediaService, studioTrackMapper, notificationService, null);
    }

    @org.springframework.beans.factory.annotation.Autowired
    public StudioTrackService(
            TrackRepository trackRepository,
            GenreRepository genreRepository,
            AlbumRepository albumRepository,
            TrackSubmissionRepository trackSubmissionRepository,
            PlaylistTrackRepository playlistTrackRepository,
            ListeningHistoryRepository listeningHistoryRepository,
            UserRepository userRepository,
            StaffRepository staffRepository,
            CloudMediaService cloudMediaService,
            StudioTrackMapper studioTrackMapper,
            NotificationService notificationService,
            groupone.soundwaveproject.lyrics.service.LyricService lyricService
    ) {
        this.trackRepository = trackRepository;
        this.genreRepository = genreRepository;
        this.albumRepository = albumRepository;
        this.trackSubmissionRepository = trackSubmissionRepository;
        this.playlistTrackRepository = playlistTrackRepository;
        this.listeningHistoryRepository = listeningHistoryRepository;
        this.userRepository = userRepository;
        this.staffRepository = staffRepository;
        this.cloudMediaService = cloudMediaService;
        this.studioTrackMapper = studioTrackMapper;
        this.notificationService = notificationService;
        this.lyricService = lyricService;
    }

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
            String lyrics = lyricService != null ? lyricService.getOfficialLyrics(track.getId()) : null;
            return studioTrackMapper.toStudioTrackResponse(track, genre, album, submission, lyrics);
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
        String lyrics = lyricService != null ? lyricService.getOfficialLyrics(track.getId()) : null;

        return studioTrackMapper.toStudioTrackResponse(track, genre, album, submission, lyrics);
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
                    .build();

            Track savedTrack = trackRepository.save(track);
            String requestLyrics = (request.lyrics() != null && !request.lyrics().isBlank()) ? request.lyrics().trim() : null;
            if (requestLyrics != null && lyricService != null) {
                lyricService.saveOrUpdateOfficialLyric(savedTrack.getId(), requestLyrics, "DRAFT", user.getId());
            }
            return studioTrackMapper.toStudioTrackResponse(savedTrack, genre, album, null, requestLyrics);
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
     * [FEATURE]: UC-19.3 Update A Track
     * Cho phép Creator (Listener) cập nhật metadata, file audio hoặc cover artwork của bài hát.
     *
     * Quy tắc nghiệp vụ (Business Rules BR-21, BR-23, BR-24, BR-36):
     * 1. Chỉ cho phép chỉnh sửa bài hát ở trạng thái DRAFT, REJECTED hoặc PUBLISHED (PRE-3).
     * 2. Bài hát đang PENDING kiểm duyệt bị KHÓA hoàn toàn (EX01), yêu cầu rút bài trước nếu muốn sửa.
     * 3. Khi bài hát PUBLISHED được chỉnh sửa (POST-4, Normal Flow Step 12):
     *    - Thu hồi ngay lập tức quyền nghe công khai, chuyển trạng thái sang PENDING.
     *    - Tạo bản ghi nộp duyệt mới (TrackSubmission) với trạng thái PENDING.
     *    - Gửi thông báo đến toàn bộ Staff để kiểm duyệt lại nhằm ngăn chặn thay thế nhạc bản quyền / vi phạm tiêu chuẩn cộng đồng.
     *    - Nếu album cũ/hiện tại không còn bài hát nào PUBLISHED, chuyển trạng thái album về DRAFT.
     * 4. Khi bài hát REJECTED được chỉnh sửa kèm cờ resubmitForReview (AF02):
     *    - Chuyển trạng thái sang PENDING, tạo TrackSubmission và gửi thông báo kiểm duyệt cho Staff.
     * 5. Bài hát DRAFT hoặc REJECTED (chỉnh sửa thông thường, POST-3, Step 11):
     *    - Giữ nguyên trạng thái làm việc (DRAFT/REJECTED), cập nhật lại slug nếu đổi tiêu đề.
     * 6. Khi tải lên file thay thế mới thành công, các tệp media cũ trên Cloudinary sẽ được xóa dọn dẹp (POST-2).
     */
    @Transactional
    public StudioTrackResponse updateTrack(Long id, UpdateTrackRequest request, MultipartFile audio, MultipartFile cover, String currentUserEmail) {
        User user = getAuthenticatedUser(currentUserEmail);
        Track track = trackRepository.findByIdAndUploaderUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Track not found or access denied."));

        // EX01: Từ chối sửa nếu bài hát đang ở trạng thái PENDING chờ Staff duyệt
        if (track.getPublicationStatus() == TrackPublicationStatus.PENDING) {
            throw new ForbiddenOperationException("Tracks currently pending review cannot be modified. Please withdraw the submission first.");
        }
        if (track.getPublicationStatus() != TrackPublicationStatus.DRAFT
                && track.getPublicationStatus() != TrackPublicationStatus.REJECTED
                && track.getPublicationStatus() != TrackPublicationStatus.PUBLISHED) {
            throw new ForbiddenOperationException("Tracks in " + track.getPublicationStatus() + " status cannot be modified.");
        }

        // [FEATURE]: Ghi nhận trạng thái phát hành ban đầu trước khi cập nhật
        TrackPublicationStatus originalStatus = track.getPublicationStatus();

        // Kiểm tra thể loại nhạc hợp lệ và đang hoạt động (Step 8, EX03)
        Genre genre = genreRepository.findById(request.genreId())
                .orElseThrow(() -> new BadRequestOperationException("Selected genre is invalid."));
        if (!Boolean.TRUE.equals(genre.getIsActive())) {
            throw new BadRequestOperationException("Selected genre is currently inactive.");
        }

        // Kiểm tra quyền sở hữu album liên kết nếu có chọn album (Step 8, EX03)
        Album oldAlbum = track.getAlbum();
        Album album = null;
        if (request.albumId() != null) {
            album = albumRepository.findByIdAndCreatedByUserId(request.albumId(), user.getId())
                    .orElseThrow(() -> new BadRequestOperationException("Selected album is invalid or unauthorized."));
        }

        // POST-2 & Step 9: Tải file audio thay thế lên Cloudinary và xóa tệp audio cũ
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

        // POST-2 & Step 9: Tải ảnh bìa cover thay thế lên Cloudinary và xóa ảnh bìa cũ
        if (cover != null && !cover.isEmpty()) {
            StoredMediaResponse coverResponse = cloudMediaService.uploadTrackCover(cover, user.getId());
            cloudMediaService.deleteImageQuietly(track.getCoverPublicId());

            track.setCoverPublicId(coverResponse.publicId());
            track.setCoverUrl(coverResponse.secureUrl());
        }

        // Cập nhật tiêu đề và tái tạo slug duy nhất nếu tiêu đề thay đổi (Step 11)
        if (!track.getTitle().equalsIgnoreCase(request.title().trim())) {
            track.setTitle(request.title().trim());
            track.setSlug(generateUniqueSlug(request.title()));
        }

        track.setGenre(genre);
        track.setAlbum(album);
        track.setTrackNumber(request.trackNumber());
        track.setDescription(request.description() != null ? request.description().trim() : null);
        if (request.lyrics() != null && lyricService != null) {
            if (request.lyrics().isBlank()) {
                lyricService.deleteAllLyricsForTrack(track.getId());
            } else {
                lyricService.saveOrUpdateOfficialLyric(track.getId(), request.lyrics().trim(), "DRAFT", user.getId());
            }
        }

        TrackSubmission savedSubmission = null;

        // [FEATURE]: Xử lý trạng thái vòng đời xuất bản theo UC-19.3
        if (originalStatus == TrackPublicationStatus.PUBLISHED) {
            // POST-4 & Step 12: Bài hát PUBLISHED bị thu hồi quyền nghe công khai, chuyển về PENDING để Staff kiểm duyệt lại
            track.setPublicationStatus(TrackPublicationStatus.PENDING);

            // Tạo bản ghi nộp duyệt mới cho đợt kiểm duyệt lại bắt buộc này
            String note = (request.submitterNote() != null && !request.submitterNote().isBlank())
                    ? request.submitterNote().trim()
                    : "Published track updated by creator and queued for mandatory re-moderation.";
            TrackSubmission submission = TrackSubmission.builder()
                    .trackId(track.getId())
                    .submittedByUserId(user.getId())
                    .status(SubmissionStatus.PENDING)
                    .submitterNote(note)
                    .build();
            savedSubmission = trackSubmissionRepository.save(submission);

            // Gửi thông báo đến toàn bộ Staff để kiểm duyệt lại bài hát
            try {
                List<Staff> staffMembers = staffRepository.findAll();
                for (Staff staff : staffMembers) {
                    notificationService.createStaffNotification(
                            staff.getId(),
                            user.getId(),
                            NotificationType.TRACK_SUBMISSION,
                            "Track re-moderation required",
                            "Track \"" + track.getTitle() + "\" has been updated and queued for re-moderation.",
                            "SUBMISSION",
                            String.valueOf(savedSubmission.getId())
                    );
                }
            } catch (Exception e) {
                log.warn("Failed to create re-moderation notification for staff: {}", e.getMessage());
            }
        } else if (originalStatus == TrackPublicationStatus.REJECTED && Boolean.TRUE.equals(request.resubmitForReview())) {
            // AF02: Bài hát REJECTED được cập nhật và yêu cầu nộp duyệt lại ngay
            track.setPublicationStatus(TrackPublicationStatus.PENDING);

            String note = (request.submitterNote() != null && !request.submitterNote().isBlank())
                    ? request.submitterNote().trim()
                    : "Rejected track updated and resubmitted for moderation review.";
            TrackSubmission submission = TrackSubmission.builder()
                    .trackId(track.getId())
                    .submittedByUserId(user.getId())
                    .status(SubmissionStatus.PENDING)
                    .submitterNote(note)
                    .build();
            savedSubmission = trackSubmissionRepository.save(submission);

            // Gửi thông báo đến toàn bộ Staff
            try {
                List<Staff> staffMembers = staffRepository.findAll();
                for (Staff staff : staffMembers) {
                    notificationService.createStaffNotification(
                            staff.getId(),
                            user.getId(),
                            NotificationType.TRACK_SUBMISSION,
                            "New submission for review",
                            "Track \"" + track.getTitle() + "\" has been updated and resubmitted for moderation.",
                            "SUBMISSION",
                            String.valueOf(savedSubmission.getId())
                    );
                }
            } catch (Exception e) {
                log.warn("Failed to create resubmission notification for staff: {}", e.getMessage());
            }
        } else {
            // POST-3 & Step 11: Bài hát DRAFT hoặc REJECTED giữ nguyên trạng thái làm việc
            track.setPublicationStatus(originalStatus);
        }

        // Lưu bản ghi bài hát đã cập nhật vào PostgreSQL (POST-1)
        Track updatedTrack = trackRepository.save(track);

        // Kiểm tra và cập nhật trạng thái album cũ nếu không còn bài hát nào PUBLISHED
        if (oldAlbum != null) {
            boolean oldAlbumHasPublished = trackRepository.existsByAlbum_IdAndPublicationStatus(
                    oldAlbum.getId(), TrackPublicationStatus.PUBLISHED
            );
            if (oldAlbumHasPublished) {
                oldAlbum.setStatus("PUBLISHED");
            } else {
                boolean oldAlbumHasPending = trackRepository.existsByAlbum_IdAndPublicationStatus(
                        oldAlbum.getId(), TrackPublicationStatus.PENDING
                );
                oldAlbum.setStatus(oldAlbumHasPending ? "PENDING" : "DRAFT");
            }
            albumRepository.save(oldAlbum);
        }

        // Kiểm tra và cập nhật album mới (nếu chuyển album)
        if (album != null && (oldAlbum == null || !oldAlbum.getId().equals(album.getId()))) {
            boolean currentAlbumHasPublished = trackRepository.existsByAlbum_IdAndPublicationStatus(
                    album.getId(), TrackPublicationStatus.PUBLISHED
            );
            if (currentAlbumHasPublished) {
                album.setStatus("PUBLISHED");
            } else {
                boolean currentAlbumHasPending = trackRepository.existsByAlbum_IdAndPublicationStatus(
                        album.getId(), TrackPublicationStatus.PENDING
                );
                album.setStatus(currentAlbumHasPending ? "PENDING" : "DRAFT");
            }
            albumRepository.save(album);
        }

        // Lấy thông tin bản ghi nộp duyệt mới nhất để phản hồi cho UI (POST-5)
        TrackSubmission submissionToReturn = savedSubmission != null
                ? savedSubmission
                : trackSubmissionRepository.findFirstByTrackIdOrderBySubmittedAtDesc(track.getId()).orElse(null);

        return studioTrackMapper.toStudioTrackResponse(updatedTrack, genre, album, submissionToReturn);
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
            if (lyricService != null) {
                lyricService.deleteAllLyricsForTrack(track.getId());
            }
            playlistTrackRepository.deleteByTrack_Id(track.getId());
            listeningHistoryRepository.deleteByTrackId(track.getId());
            trackSubmissionRepository.deleteByTrackId(track.getId());
            trackRepository.delete(track);
        }

        // POST-4 & AF02: Đánh giá các bài hát còn lại trong Album
        if (album != null) {
            boolean hasPublishedTrack = trackRepository.existsByAlbum_IdAndPublicationStatus(
                    album.getId(), TrackPublicationStatus.PUBLISHED
            );
            if (hasPublishedTrack) {
                album.setStatus("PUBLISHED");
            } else {
                boolean hasPendingTrack = trackRepository.existsByAlbum_IdAndPublicationStatus(
                        album.getId(), TrackPublicationStatus.PENDING
                );
                album.setStatus(hasPendingTrack ? "PENDING" : "DRAFT");
            }
            albumRepository.save(album);
        }
    }

    public StudioTrackResponse updateLyrics(Long id, String lyrics, String currentUserEmail) {
        return updateTrackLyrics(id, new groupone.soundwaveproject.studio.dto.request.UpdateTrackLyricsRequest(lyrics), currentUserEmail);
    }

    /**
     * Gửi đề xuất cập nhật lời bài hát chính thức cho bài hát đã PUBLISHED để Staff kiểm duyệt (UC-16.2).
     * Trạng thái bài hát trên hệ thống vẫn duy trì PUBLISHED để phục vụ người nghe bình thường.
     */
    @Transactional
    public PendingLyricSubmissionResponse submitLyricsForReview(Long trackId, SubmitTrackLyricsRequest request, String currentUserEmail) {
        User user = getAuthenticatedUser(currentUserEmail);
        Track track = trackRepository.findByIdAndUploaderUserId(trackId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Track not found or access denied."));

        if (track.getPublicationStatus() != TrackPublicationStatus.PUBLISHED) {
            throw new ConflictOperationException("Only PUBLISHED tracks can submit lyric updates for moderation.");
        }

        // EX02: Existing pending submission
        Optional<TrackSubmission> pendingOpt = trackSubmissionRepository.findFirstByTrackIdAndSubmissionTypeAndStatus(
                trackId, SubmissionType.LYRIC_UPDATE, SubmissionStatus.PENDING);
        if (pendingOpt.isPresent()) {
            throw new ConflictOperationException("A lyric update for this track is already pending moderation. Please await completion of the current review.");
        }

        String rawLyrics = request != null && request.lyrics() != null ? request.lyrics().trim() : "";
        if (rawLyrics.isEmpty()) {
            throw new BadRequestOperationException("EMPTY_LYRICS", "Lyrics content cannot be blank.");
        }

        TrackSubmission submission = TrackSubmission.builder()
                .trackId(track.getId())
                .submittedByUserId(user.getId())
                .submissionType(SubmissionType.LYRIC_UPDATE)
                .proposedLyrics(rawLyrics)
                .submitterNote(request != null ? request.submitterNote() : null)
                .status(SubmissionStatus.PENDING)
                .build();

        TrackSubmission saved = trackSubmissionRepository.save(submission);

        // Notify active staff
        try {
            for (Staff staff : staffRepository.findAll()) {
                notificationService.createNotification(
                        staff.getId(),
                        user.getId(),
                        NotificationType.TRACK_SUBMISSION,
                        "Lyric Update Submitted",
                        "Creator submitted updated lyrics for published track " + track.getTitle() + ".",
                        "TRACK_SUBMISSION",
                        String.valueOf(saved.getId())
                );
            }
        } catch (Exception e) {
            log.warn("Failed to notify staff for lyric submission: {}", e.getMessage());
        }

        return new PendingLyricSubmissionResponse(
                saved.getId(),
                track.getId(),
                saved.getProposedLyrics(),
                saved.getSubmitterNote(),
                saved.getStatus(),
                saved.getSubmissionType(),
                saved.getSubmittedAt()
        );
    }

    /**
     * Tra cứu yêu cầu cập nhật lời bài hát đang chờ Staff duyệt của bài hát (nếu có) (UC-16.2).
     */
    @Transactional(readOnly = true)
    public PendingLyricSubmissionResponse getPendingLyricsSubmission(Long trackId, String currentUserEmail) {
        User user = getAuthenticatedUser(currentUserEmail);
        Track track = trackRepository.findByIdAndUploaderUserId(trackId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Track not found or access denied."));

        return trackSubmissionRepository.findFirstByTrackIdAndSubmissionTypeAndStatus(
                track.getId(), SubmissionType.LYRIC_UPDATE, SubmissionStatus.PENDING)
                .map(sub -> new PendingLyricSubmissionResponse(
                        sub.getId(),
                        sub.getTrackId(),
                        sub.getProposedLyrics(),
                        sub.getSubmitterNote(),
                        sub.getStatus(),
                        sub.getSubmissionType(),
                        sub.getSubmittedAt()
                ))
                .orElse(null);
    }

    /**
     * Rút lại yêu cầu cập nhật lời bài hát đang chờ Staff duyệt (UC-16.2 AF02 Withdraw submission).
     */
    @Transactional
    public void withdrawLyricsSubmission(Long trackId, String currentUserEmail) {
        User user = getAuthenticatedUser(currentUserEmail);
        Track track = trackRepository.findByIdAndUploaderUserId(trackId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Track not found or access denied."));

        TrackSubmission pending = trackSubmissionRepository.findFirstByTrackIdAndSubmissionTypeAndStatus(
                track.getId(), SubmissionType.LYRIC_UPDATE, SubmissionStatus.PENDING)
                .orElseThrow(() -> new ResourceNotFoundException("No pending lyric update submission found for this track."));

        trackSubmissionRepository.delete(pending);
        log.info("Withdrawn pending lyric submission id={} for trackId={} by userId={}", pending.getId(), trackId, user.getId());
    }

    public StudioTrackResponse updateTrackLyrics(Long id, groupone.soundwaveproject.studio.dto.request.UpdateTrackLyricsRequest request, String currentUserEmail) {
        User user = getAuthenticatedUser(currentUserEmail);
        Track track = trackRepository.findByIdAndUploaderUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Track not found or access denied."));

        if (track.getPublicationStatus() == TrackPublicationStatus.PENDING) {
            throw new ForbiddenOperationException("Tracks currently pending review cannot be modified.");
        }

        String rawLyrics = request != null ? request.lyrics() : null;
        if (lyricService != null) {
            lyricService.saveOrUpdateOfficialLyrics(id, rawLyrics, user.getId());
        }

        Genre genre = track.getGenreId() != null ? genreRepository.findById(track.getGenreId()).orElse(null) : null;
        Album album = track.getAlbumId() != null ? albumRepository.findById(track.getAlbumId()).orElse(null) : null;
        TrackSubmission submission = trackSubmissionRepository.findFirstByTrackIdOrderBySubmittedAtDesc(track.getId()).orElse(null);

        String finalLyrics = lyricService != null ? lyricService.getOfficialLyrics(track.getId()) : null;
        return studioTrackMapper.toStudioTrackResponse(track, genre, album, submission, finalLyrics);
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
