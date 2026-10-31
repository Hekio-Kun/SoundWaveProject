package groupone.soundwaveproject.moderation.service;

import groupone.soundwaveproject.authentication.entity.Staff;
import groupone.soundwaveproject.authentication.entity.User;
import groupone.soundwaveproject.authentication.entity.UserProfile;
import groupone.soundwaveproject.authentication.repository.StaffRepository;
import groupone.soundwaveproject.authentication.repository.UserRepository;
import groupone.soundwaveproject.authentication.repository.UserProfileRepository;
import groupone.soundwaveproject.catalog.entity.Album;
import groupone.soundwaveproject.catalog.entity.Track;
import groupone.soundwaveproject.catalog.entity.TrackPublicationStatus;
import groupone.soundwaveproject.catalog.repository.AlbumRepository;
import groupone.soundwaveproject.catalog.repository.TrackRepository;
import groupone.soundwaveproject.exception.ResourceNotFoundException;
import groupone.soundwaveproject.moderation.dto.request.ApproveTrackRequest;
import groupone.soundwaveproject.moderation.dto.request.RejectTrackRequest;
import groupone.soundwaveproject.moderation.dto.request.TakeDownTrackRequest;
import groupone.soundwaveproject.moderation.dto.response.AlbumTrackNavigationResponse;
import groupone.soundwaveproject.moderation.dto.response.AlbumTrackSummaryResponse;
import groupone.soundwaveproject.moderation.dto.response.SubmissionDetailResponse;
import groupone.soundwaveproject.moderation.dto.response.SubmissionQueueItemResponse;
import groupone.soundwaveproject.moderation.dto.response.SubmissionStatsResponse;
import groupone.soundwaveproject.moderation.entity.SubmissionStatus;
import groupone.soundwaveproject.moderation.entity.SubmissionType;
import groupone.soundwaveproject.moderation.entity.TrackSubmission;
import groupone.soundwaveproject.moderation.exception.InvalidSubmissionStateException;
import groupone.soundwaveproject.moderation.exception.SubmissionNotFoundException;
import groupone.soundwaveproject.moderation.mapper.TrackSubmissionMapper;
import groupone.soundwaveproject.moderation.repository.TrackSubmissionRepository;
import groupone.soundwaveproject.notification.entity.NotificationType;
import groupone.soundwaveproject.lyrics.entity.OfficialLyric;
import groupone.soundwaveproject.lyrics.repository.OfficialLyricRepository;
import groupone.soundwaveproject.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Service xử lý toàn bộ nghiệp vụ Quản lý kiểm duyệt bài hát và album (UC-24: Manage Content Moderation).
 * Bao gồm các quy trình:
 * - Xem hàng đợi duyệt và tìm kiếm bài hát theo từ khóa (UC-24.1)
 * - Xem chi tiết bài hát, tệp âm thanh và lời bài hát (lyrics) (UC-24.1)
 * - Phê duyệt bài hát kèm tự động xuất bản Album theo BR-18 và gửi thông báo (UC-24.2)
 * - Từ chối bài hát kèm lý do tối thiểu 10 ký tự và gửi thông báo (UC-24.2)
 * - Gỡ bài hát đã xuất bản (Take Down) (UC-24.2)
 */
@Service
public class ModerationService {
    private final TrackSubmissionRepository submissionRepository;
    private final TrackRepository trackRepository;
    private final AlbumRepository albumRepository;
    private final TrackSubmissionMapper mapper;
    private final UserRepository userRepository;
    private final StaffRepository staffRepository;
    private final UserProfileRepository profileRepository;
    private final NotificationService notificationService;
    private final groupone.soundwaveproject.lyrics.service.LyricService lyricService;

    public ModerationService(
            TrackSubmissionRepository submissionRepository,
            TrackRepository trackRepository,
            AlbumRepository albumRepository,
            TrackSubmissionMapper mapper,
            UserRepository userRepository,
            StaffRepository staffRepository,
            UserProfileRepository profileRepository,
            NotificationService notificationService
    ) {
        this(submissionRepository, trackRepository, albumRepository, mapper,
                userRepository, staffRepository, profileRepository, notificationService, null);
    }

    @org.springframework.beans.factory.annotation.Autowired
    public ModerationService(
            TrackSubmissionRepository submissionRepository,
            TrackRepository trackRepository,
            AlbumRepository albumRepository,
            TrackSubmissionMapper mapper,
            UserRepository userRepository,
            StaffRepository staffRepository,
            UserProfileRepository profileRepository,
            NotificationService notificationService,
            groupone.soundwaveproject.lyrics.service.LyricService lyricService
    ) {
        this.submissionRepository = submissionRepository;
        this.trackRepository = trackRepository;
        this.albumRepository = albumRepository;
        this.mapper = mapper;
        this.userRepository = userRepository;
        this.staffRepository = staffRepository;
        this.profileRepository = profileRepository;
        this.notificationService = notificationService;
        this.lyricService = lyricService;
    }

    /**
     * Lấy danh sách hàng đợi các bài hát và album cần kiểm duyệt theo phân trang và bộ lọc tìm kiếm (UC-24.1 View Moderation Queue).
     *
     * @param status   Trạng thái yêu cầu kiểm duyệt cần lọc (PENDING, APPROVED, REJECTED)
     * @param search   Từ khóa tìm kiếm theo tên bài hát, tên album hoặc email người gửi
     * @param pageable Cấu hình phân trang và sắp xếp
     * @return Trang danh sách các mục (Track đơn hoặc Album) trong hàng đợi kiểm duyệt
     */
    @Transactional(readOnly = true)
    public Page<SubmissionQueueItemResponse> getQueue(SubmissionStatus status, String search, Pageable pageable) {
        return getQueue(status, null, search, pageable);
    }

    /**
     * Lấy danh sách hàng đợi các bài hát và album cần kiểm duyệt theo phân trang, loại yêu cầu và bộ lọc tìm kiếm.
     */
    @Transactional(readOnly = true)
    public Page<SubmissionQueueItemResponse> getQueue(SubmissionStatus status, SubmissionType type, String search, Pageable pageable) {
        boolean searchProvided = search != null && !search.trim().isBlank();
        Page<TrackSubmission> page;

        if (searchProvided) {
            String trimmedSearch = search.trim().toLowerCase(Locale.ROOT);
            List<Long> matchingTrackIds = trackRepository.findAll().stream()
                    .filter(t -> {
                        if (t.getTitle() != null && t.getTitle().toLowerCase(Locale.ROOT).contains(trimmedSearch)) {
                            return true;
                        }
                        if (t.getAlbum() != null && t.getAlbum().getTitle() != null && t.getAlbum().getTitle().toLowerCase(Locale.ROOT).contains(trimmedSearch)) {
                            return true;
                        }
                        if (t.getGenre() != null && t.getGenre().getName() != null && t.getGenre().getName().toLowerCase(Locale.ROOT).contains(trimmedSearch)) {
                            return true;
                        }
                        return false;
                    })
                    .map(Track::getId)
                    .toList();

            Set<Long> matchingUserIds = new HashSet<>(userRepository.findByEmailContainingIgnoreCase(trimmedSearch).stream()
                    .map(User::getId)
                    .toList());

            profileRepository.findAll().stream()
                    .filter(p -> (p.getDisplayName() != null && p.getDisplayName().toLowerCase(Locale.ROOT).contains(trimmedSearch))
                            || (p.getUsername() != null && p.getUsername().toLowerCase(Locale.ROOT).contains(trimmedSearch)))
                    .forEach(p -> matchingUserIds.add(p.getUserId()));

            if (matchingTrackIds.isEmpty() && matchingUserIds.isEmpty()) {
                return Page.empty(pageable);
            }

            Collection<Long> safeTrackIds = matchingTrackIds.isEmpty() ? List.of(-1L) : matchingTrackIds;
            Collection<Long> safeUserIds = matchingUserIds.isEmpty() ? List.of(-1L) : matchingUserIds;
            if (type != null) {
                page = submissionRepository.findByStatusAndSubmissionTypeAndMatchingIds(status, type, safeTrackIds, safeUserIds, pageable);
            } else {
                page = submissionRepository.findByStatusAndMatchingIds(status, safeTrackIds, safeUserIds, pageable);
            }
        } else if (status != null && type != null) {
            page = submissionRepository.findByStatusAndSubmissionType(status, type, pageable);
        } else if (status != null) {
            page = submissionRepository.findByStatus(status, pageable);
        } else if (type != null) {
            page = submissionRepository.findBySubmissionType(type, pageable);
        } else {
            page = submissionRepository.findAll(pageable);
        }

        Set<Long> trackIds = page.getContent().stream()
                .map(TrackSubmission::getTrackId)
                .collect(Collectors.toSet());

        Set<Long> submitterIds = page.getContent().stream()
                .map(TrackSubmission::getSubmittedByUserId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Set<Long> reviewerIds = page.getContent().stream()
                .map(TrackSubmission::getReviewerUserId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<Long, Track> tracksMap = trackIds.isEmpty() ? Map.of() :
                trackRepository.findAllById(trackIds).stream()
                        .collect(Collectors.toMap(Track::getId, Function.identity()));

        Map<Long, UserProfile> profilesMap = submitterIds.isEmpty() ? Map.of() :
                profileRepository.findAllById(submitterIds).stream()
                        .collect(Collectors.toMap(UserProfile::getUserId, Function.identity()));

        Map<Long, User> usersMap = submitterIds.isEmpty() ? Map.of() :
                userRepository.findAllById(submitterIds).stream()
                        .collect(Collectors.toMap(User::getId, Function.identity()));

        Map<Long, Staff> reviewersMap = reviewerIds.isEmpty() ? Map.of() :
                staffRepository.findAllById(reviewerIds).stream()
                        .collect(Collectors.toMap(Staff::getId, Function.identity()));

        List<SubmissionQueueItemResponse> queueItems = new ArrayList<>();
        Set<Long> processedAlbumIds = new HashSet<>();

        for (TrackSubmission submission : page.getContent()) {
            Track track = tracksMap.get(submission.getTrackId());
            if (track == null) continue;

            if (track.getAlbum() == null || submission.getSubmissionType() == SubmissionType.LYRIC_UPDATE) {
                User submitter = usersMap.get(submission.getSubmittedByUserId());
                UserProfile submitterProfile = profilesMap.get(submission.getSubmittedByUserId());
                Staff reviewer = submission.getReviewerUserId() != null ? reviewersMap.get(submission.getReviewerUserId()) : null;
                queueItems.add(mapper.toQueueItemResponse(submission, track, submitter, submitterProfile, reviewer));
            } else {
                Long albumId = track.getAlbum().getId();
                if (!processedAlbumIds.contains(albumId)) {
                    processedAlbumIds.add(albumId);
                    Album album = track.getAlbum();

                    // Lấy tất cả tracks thuộc album này theo thứ tự trackNumber
                    List<Track> albumTracksList = trackRepository.findByAlbum_IdOrderByTrackNumberAsc(albumId);
                    List<Long> albumTrackIds = albumTracksList.stream().map(Track::getId).toList();
                    List<TrackSubmission> albumSubmissions = submissionRepository.findByTrackIdInOrderBySubmittedAtDesc(albumTrackIds);
                    Map<Long, TrackSubmission> latestSubByTrackId = albumSubmissions.stream()
                            .collect(Collectors.toMap(TrackSubmission::getTrackId, Function.identity(), (existing, replacement) -> existing));

                    User albumCreator = usersMap.get(album.getCreatedByUserId());
                    if (albumCreator == null) {
                        albumCreator = userRepository.findById(album.getCreatedByUserId()).orElse(null);
                    }
                    UserProfile albumCreatorProfile = profilesMap.get(album.getCreatedByUserId());
                    if (albumCreatorProfile == null && albumCreator != null) {
                        albumCreatorProfile = profileRepository.findByUserId(albumCreator.getId()).orElse(null);
                    }

                    List<SubmissionQueueItemResponse> mappedAlbumTracks = new ArrayList<>();
                    for (Track at : albumTracksList) {
                        TrackSubmission atSub = latestSubByTrackId.get(at.getId());
                        if (atSub == null) {
                            atSub = TrackSubmission.builder()
                                    .id(at.getId())
                                    .trackId(at.getId())
                                    .submittedByUserId(album.getCreatedByUserId())
                                    .status(submission.getStatus())
                                    .submittedAt(submission.getSubmittedAt())
                                    .build();
                        }
                        Staff atReviewer = atSub.getReviewerUserId() != null ? reviewersMap.get(atSub.getReviewerUserId()) : null;
                        if (atReviewer == null && atSub.getReviewerUserId() != null) {
                            atReviewer = staffRepository.findById(atSub.getReviewerUserId()).orElse(null);
                        }
                        mappedAlbumTracks.add(mapper.toQueueItemResponse(atSub, at, albumCreator, albumCreatorProfile, atReviewer));
                    }

                    SubmissionQueueItemResponse albumItem = mapper.createAlbumQueueItem(album, mappedAlbumTracks, albumCreator, albumCreatorProfile);
                    if (albumItem != null) {
                        if (status != null && mappedAlbumTracks.stream().anyMatch(t -> t.status() == status)) {
                            albumItem = albumItem.withStatus(status);
                        }
                        queueItems.add(albumItem);
                    }
                }
            }
        }

        return new org.springframework.data.domain.PageImpl<>(queueItems, pageable, page.getTotalElements());
    }

    /**
     * Xem thông tin chi tiết một bản ghi yêu cầu kiểm duyệt kèm tệp âm thanh và lời bài hát (UC-24.1 View Track Details).
     */
    @Transactional(readOnly = true)
    public SubmissionDetailResponse getSubmissionDetail(Long id) {
        TrackSubmission submission = submissionRepository.findById(id)
                .orElseThrow(() -> new SubmissionNotFoundException(id));

        Track track = trackRepository.findById(submission.getTrackId()).orElse(null);
        String lyrics = lyricService != null ? lyricService.getOfficialLyrics(submission.getTrackId()) : null;

        User submitter = userRepository.findById(submission.getSubmittedByUserId()).orElse(null);
        UserProfile submitterProfile = profileRepository.findByUserId(submission.getSubmittedByUserId()).orElse(null);
        Staff reviewer = submission.getReviewerUserId() != null ?
                staffRepository.findById(submission.getReviewerUserId()).orElse(null) : null;

        AlbumTrackNavigationResponse albumNavigation = buildAlbumNavigation(submission, track);
        return mapper.toDetailResponse(submission, track, submitter, submitterProfile, reviewer, lyrics, albumNavigation);
    }

    /**
     * Lấy số liệu thống kê tổng hợp số lượng bài hát theo từng trạng thái kiểm duyệt (UC-24.1 View Moderation Queue Stats).
     */
    @Transactional(readOnly = true)
    public SubmissionStatsResponse getQueueStats() {
        return getQueueStats(null);
    }

    /**
     * Lấy số liệu thống kê tổng hợp số lượng yêu cầu kiểm duyệt theo loại (TRACK_RELEASE hoặc LYRIC_UPDATE).
     */
    @Transactional(readOnly = true)
    public SubmissionStatsResponse getQueueStats(SubmissionType type) {
        if (type != null) {
            long pending = submissionRepository.countByStatusAndSubmissionType(SubmissionStatus.PENDING, type);
            long approved = submissionRepository.countByStatusAndSubmissionType(SubmissionStatus.APPROVED, type);
            long rejected = submissionRepository.countByStatusAndSubmissionType(SubmissionStatus.REJECTED, type);
            long total = submissionRepository.countBySubmissionType(type);
            return new SubmissionStatsResponse(pending, approved, rejected, total);
        }
        long pending = submissionRepository.countByStatus(SubmissionStatus.PENDING);
        long approved = submissionRepository.countByStatus(SubmissionStatus.APPROVED);
        long rejected = submissionRepository.countByStatus(SubmissionStatus.REJECTED);
        long total = submissionRepository.count();
        return new SubmissionStatsResponse(pending, approved, rejected, total);
    }

    /**
     * Phê duyệt bài hát đang chờ duyệt để xuất bản công khai lên SoundWave (UC-24.2 Approve Track).
     */
    @Transactional
    public SubmissionDetailResponse approveSubmission(Long id, ApproveTrackRequest request, String reviewerEmail) {
        TrackSubmission submission = submissionRepository.findById(id)
                .orElseThrow(() -> new SubmissionNotFoundException(id));

        if (submission.getStatus() != SubmissionStatus.PENDING) {
            throw new InvalidSubmissionStateException("Track submission is not in PENDING status. Current status: " + submission.getStatus());
        }

        Staff reviewer = staffRepository.findByEmailIgnoreCase(reviewerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("REVIEWER_NOT_FOUND", "Reviewer staff account not found."));

        Instant nowInstant = Instant.now();
        LocalDateTime nowUtc = LocalDateTime.now(ZoneOffset.UTC);
        String reviewerNote = request != null ? request.reviewerNote() : null;

        submission.setStatus(SubmissionStatus.APPROVED);
        submission.setReviewerUserId(reviewer.getId());
        submission.setReviewerNote(reviewerNote);
        submission.setRejectionReason(null);
        submission.setReviewedAt(nowInstant);
        submissionRepository.save(submission);

        Track track = trackRepository.findById(submission.getTrackId())
                .orElseThrow(() -> new ResourceNotFoundException("TRACK_NOT_FOUND", "Track not found with id: " + submission.getTrackId()));

        // UC-24.6: If LYRIC_UPDATE, update lyric and keep track PUBLISHED
        if (submission.getSubmissionType() == SubmissionType.LYRIC_UPDATE) {
            if (lyricService != null && submission.getProposedLyrics() != null) {
                lyricService.saveOrUpdateOfficialLyric(track.getId(), submission.getProposedLyrics(), "PUBLISHED", reviewer.getId());
            }

            User submitter = userRepository.findById(submission.getSubmittedByUserId()).orElse(null);
            UserProfile submitterProfile = profileRepository.findByUserId(submission.getSubmittedByUserId()).orElse(null);

            if (submitter != null) {
                notificationService.createNotification(
                        submitter.getId(),
                        reviewer.getId(),
                        NotificationType.TRACK_APPROVED,
                        "Official Lyric Approved",
                        "Your lyric update for \"" + track.getTitle() + "\" has been approved and is now live!",
                        "TRACK",
                        String.valueOf(track.getId())
                );
            }

            String lyrics = resolveTrackLyrics(track);
            AlbumTrackNavigationResponse albumNavigation = buildAlbumNavigation(submission, track);
            return mapper.toDetailResponse(submission, track, submitter, submitterProfile, reviewer, lyrics, albumNavigation);
        }



        User submitter = userRepository.findById(submission.getSubmittedByUserId()).orElse(null);
        UserProfile submitterProfile = profileRepository.findByUserId(submission.getSubmittedByUserId()).orElse(null);

        Album album = track.getAlbum();
        if (album == null) {
            // Track đơn lẻ: Xuất bản trực tiếp ngay khi được duyệt
            track.setPublicationStatus(TrackPublicationStatus.PUBLISHED);
            track.setApprovedAt(nowUtc);
            track.setLatestRejectionReason(null);
            trackRepository.save(track);

            if (submitter != null) {
                notificationService.createNotification(
                        submitter.getId(),
                        reviewer.getId(),
                        NotificationType.TRACK_APPROVED,
                        "Track approved",
                        "Your track \"" + track.getTitle() + "\" has been approved and is now available in the public catalog.",
                        "TRACK",
                        String.valueOf(track.getId())
                );
            }
        } else {
            // Track thuộc Album: Ghi nhận duyệt nhưng chỉ xuất bản khi TOÀN BỘ bài trong album đã duyệt xong
            track.setApprovedAt(nowUtc);
            track.setLatestRejectionReason(null);
            trackRepository.save(track);

            processAlbumPublicationIfAllReviewed(album, nowUtc, submitter, reviewer);

            if (submitter != null && !"PUBLISHED".equalsIgnoreCase(album.getStatus())) {
                notificationService.createNotification(
                        submitter.getId(),
                        reviewer.getId(),
                        NotificationType.TRACK_APPROVED,
                        "Track approved",
                        "Your track \"" + track.getTitle() + "\" in album \"" + album.getTitle() + "\" has been approved. It will be published once all tracks in the album are reviewed.",
                        "TRACK",
                        String.valueOf(track.getId())
                );
            }
        }

        String lyrics = resolveTrackLyrics(track);
        AlbumTrackNavigationResponse albumNavigation = buildAlbumNavigation(submission, track);
        return mapper.toDetailResponse(submission, track, submitter, submitterProfile, reviewer, lyrics, albumNavigation);
    }

    /**
     * Từ chối bài hát đang chờ duyệt do không đạt tiêu chuẩn nội dung hoặc chất lượng (UC-24.2 Reject Track).
     */
    @Transactional
    public SubmissionDetailResponse rejectSubmission(Long id, RejectTrackRequest request, String reviewerEmail) {
        TrackSubmission submission = submissionRepository.findById(id)
                .orElseThrow(() -> new SubmissionNotFoundException(id));

        if (submission.getStatus() != SubmissionStatus.PENDING) {
            throw new InvalidSubmissionStateException("Track submission is not in PENDING status. Current status: " + submission.getStatus());
        }

        Staff reviewer = staffRepository.findByEmailIgnoreCase(reviewerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("REVIEWER_NOT_FOUND", "Reviewer staff account not found."));

        Instant nowInstant = Instant.now();
        LocalDateTime nowUtc = LocalDateTime.now(ZoneOffset.UTC);
        String rejectionReason = request.rejectionReason().trim();
        String reviewerNote = request.reviewerNote();

        submission.setStatus(SubmissionStatus.REJECTED);
        submission.setReviewerUserId(reviewer.getId());
        submission.setReviewerNote(reviewerNote);
        submission.setRejectionReason(rejectionReason);
        submission.setReviewedAt(nowInstant);
        submissionRepository.save(submission);

        Track track = trackRepository.findById(submission.getTrackId())
                .orElseThrow(() -> new ResourceNotFoundException("TRACK_NOT_FOUND", "Track not found with id: " + submission.getTrackId()));

        // UC-24.6: If LYRIC_UPDATE, reject submission but KEEP track PUBLISHED and preserve existing lyrics
        if (submission.getSubmissionType() == SubmissionType.LYRIC_UPDATE) {
            User submitter = userRepository.findById(submission.getSubmittedByUserId()).orElse(null);
            UserProfile submitterProfile = profileRepository.findByUserId(submission.getSubmittedByUserId()).orElse(null);

            if (submitter != null) {
                notificationService.createNotification(
                        submitter.getId(),
                        reviewer.getId(),
                        NotificationType.TRACK_REJECTED,
                        "Official Lyric Rejected",
                        "Your lyric update for \"" + track.getTitle() + "\" was not approved: " + rejectionReason,
                        "TRACK",
                        String.valueOf(track.getId())
                );
            }

            String lyrics = resolveTrackLyrics(track);
            AlbumTrackNavigationResponse albumNavigation = buildAlbumNavigation(submission, track);
            return mapper.toDetailResponse(submission, track, submitter, submitterProfile, reviewer, lyrics, albumNavigation);
        }

        track.setPublicationStatus(TrackPublicationStatus.REJECTED);
        track.setLatestRejectionReason(rejectionReason);
        trackRepository.save(track);

        User submitter = userRepository.findById(submission.getSubmittedByUserId()).orElse(null);
        UserProfile submitterProfile = profileRepository.findByUserId(submission.getSubmittedByUserId()).orElse(null);

        Album album = track.getAlbum();
        if (album != null) {
            // Kiểm tra xem bài bị reject này có phải là bài cuối cùng đang pending trong album hay không
            processAlbumPublicationIfAllReviewed(album, nowUtc, submitter, reviewer);
        }

        if (submitter != null) {
            notificationService.createNotification(
                    submitter.getId(),
                    reviewer.getId(),
                    NotificationType.TRACK_REJECTED,
                    "Revision requested",
                    "\"" + track.getTitle() + "\" needs revision: " + rejectionReason,
                    "TRACK",
                    String.valueOf(track.getId())
            );
        }

        String lyrics = resolveTrackLyrics(track);
        AlbumTrackNavigationResponse albumNavigation = buildAlbumNavigation(submission, track);
        return mapper.toDetailResponse(submission, track, submitter, submitterProfile, reviewer, lyrics, albumNavigation);
    }

    /**
     * Đồng bộ và xuất bản Album nếu tất cả các bài hát trong Album đã được Staff duyệt qua.
     * Quy tắc nghiệp vụ:
     * - Khi Staff duyệt từng bài trong Album (Approve hoặc Reject), nếu vẫn còn bài PENDING thì cả Album và các bài hát chưa được public.
     * - Khi Staff đã duyệt qua HẾT toàn bộ bài trong Album:
     *   + Chỉ những bài có trạng thái APPROVED mới được chuyển thành PUBLISHED.
     *   + Những bài bị REJECTED giữ nguyên REJECTED (không public).
     *   + Nếu Album có ít nhất 1 bài APPROVED -> Album được đặt status = "PUBLISHED" và xuất bản công khai.
     *   + Nếu toàn bộ bài trong Album bị REJECTED -> Album được đặt status = "REJECTED".
     */
    private void processAlbumPublicationIfAllReviewed(Album album, LocalDateTime nowUtc, User submitter, Staff reviewer) {
        if (album == null || album.getId() == null) {
            return;
        }

        List<Track> albumTracks = trackRepository.findByAlbum_IdOrderByTrackNumberAsc(album.getId());
        if (albumTracks == null || albumTracks.isEmpty()) {
            return;
        }

        List<Long> trackIds = albumTracks.stream().map(Track::getId).toList();
        List<TrackSubmission> submissions = submissionRepository.findByTrackIdInOrderBySubmittedAtDesc(trackIds);
        Map<Long, TrackSubmission> latestSubByTrackId = submissions.stream()
                .collect(Collectors.toMap(TrackSubmission::getTrackId, Function.identity(), (existing, replacement) -> existing));

        // Kiểm tra xem còn bài nào trong Album đang ở trạng thái PENDING hay không
        boolean hasPendingTracks = albumTracks.stream().anyMatch(t -> {
            TrackSubmission sub = latestSubByTrackId.get(t.getId());
            return sub == null || sub.getStatus() == SubmissionStatus.PENDING;
        });

        if (hasPendingTracks) {
            // Vẫn còn bài chờ duyệt: Album giữ nguyên trạng thái PENDING/DRAFT, chưa công khai
            if (!"PENDING".equalsIgnoreCase(album.getStatus()) && !"DRAFT".equalsIgnoreCase(album.getStatus())) {
                album.setStatus("PENDING");
                albumRepository.save(album);
            }
            return;
        }

        // Toàn bộ bài hát trong Album đã được duyệt xong (không còn bài nào PENDING)
        List<Track> approvedTracks = new ArrayList<>();
        List<Track> rejectedTracks = new ArrayList<>();

        for (Track t : albumTracks) {
            TrackSubmission sub = latestSubByTrackId.get(t.getId());
            if (sub != null && sub.getStatus() == SubmissionStatus.APPROVED) {
                t.setPublicationStatus(TrackPublicationStatus.PUBLISHED);
                t.setApprovedAt(nowUtc);
                t.setLatestRejectionReason(null);
                approvedTracks.add(t);
            } else {
                t.setPublicationStatus(TrackPublicationStatus.REJECTED);
                if (sub != null && sub.getRejectionReason() != null) {
                    t.setLatestRejectionReason(sub.getRejectionReason());
                }
                rejectedTracks.add(t);
            }
            trackRepository.save(t);
        }

        if (!approvedTracks.isEmpty()) {
            album.setStatus("PUBLISHED");
            album.setPublishedAt(nowUtc);
            albumRepository.save(album);

            if (submitter != null) {
                notificationService.createNotification(
                        submitter.getId(),
                        reviewer != null ? reviewer.getId() : null,
                        NotificationType.TRACK_APPROVED,
                        "Album published",
                        "All tracks in album \"" + album.getTitle() + "\" have been reviewed. "
                                + approvedTracks.size() + " track(s) have been approved and published to the public catalog.",
                        "ALBUM",
                        String.valueOf(album.getId())
                );
            }
        } else {
            album.setStatus("REJECTED");
            albumRepository.save(album);

            if (submitter != null) {
                notificationService.createNotification(
                        submitter.getId(),
                        reviewer != null ? reviewer.getId() : null,
                        NotificationType.TRACK_REJECTED,
                        "Album rejected",
                        "All tracks in album \"" + album.getTitle() + "\" were rejected. The album was not published.",
                        "ALBUM",
                        String.valueOf(album.getId())
                );
            }
        }
    }

    /**
     * Gỡ bỏ một bài hát đã được phê duyệt và xuất bản trước đó (UC-24.2 Take Down Track).
     */
    @Transactional
    public SubmissionDetailResponse takeDownSubmission(Long id, TakeDownTrackRequest request, String reviewerEmail) {
        TrackSubmission submission = submissionRepository.findById(id)
                .orElseThrow(() -> new SubmissionNotFoundException(id));

        if (submission.getStatus() != SubmissionStatus.APPROVED) {
            throw new InvalidSubmissionStateException("Only approved tracks can be taken down. Current status: " + submission.getStatus());
        }

        Staff reviewer = staffRepository.findByEmailIgnoreCase(reviewerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("REVIEWER_NOT_FOUND", "Reviewer staff account not found."));

        Instant nowInstant = Instant.now();
        String reason = request.takedownReason().trim();
        String reviewerNote = request.reviewerNote();

        submission.setStatus(SubmissionStatus.REJECTED);
        submission.setReviewerUserId(reviewer.getId());
        submission.setReviewerNote(reviewerNote);
        submission.setRejectionReason(reason);
        submission.setReviewedAt(nowInstant);
        submissionRepository.save(submission);

        Track track = trackRepository.findById(submission.getTrackId())
                .orElseThrow(() -> new ResourceNotFoundException("TRACK_NOT_FOUND", "Track not found with id: " + submission.getTrackId()));

        track.setPublicationStatus(TrackPublicationStatus.TAKEN_DOWN);
        track.setLatestRejectionReason(reason);
        trackRepository.save(track);

        User submitter = userRepository.findById(submission.getSubmittedByUserId()).orElse(null);
        UserProfile submitterProfile = profileRepository.findByUserId(submission.getSubmittedByUserId()).orElse(null);

        if (submitter != null) {
            notificationService.createNotification(
                    submitter.getId(),
                    reviewer.getId(),
                    NotificationType.TRACK_REJECTED,
                    "Track taken down",
                    "\"" + track.getTitle() + "\" has been taken down: " + reason,
                    "TRACK",
                    String.valueOf(track.getId())
            );
        }

        String lyrics = resolveTrackLyrics(track);
        AlbumTrackNavigationResponse albumNavigation = buildAlbumNavigation(submission, track);
        return mapper.toDetailResponse(submission, track, submitter, submitterProfile, reviewer, lyrics, albumNavigation);
    }

    /**
     * Xây dựng dữ liệu điều hướng danh sách các bài hát trong Album dành cho nhân viên kiểm duyệt.
     * Cho phép duyệt liên tục từ bài này sang bài tiếp theo trong cùng Album mà không cần quay lại danh sách.
     *
     * @param currentSubmission Bản ghi kiểm duyệt bài hát hiện tại
     * @param currentTrack      Thực thể bài hát hiện tại
     * @return DTO AlbumTrackNavigationResponse chứa ID bài trước, bài sau, bài pending kế tiếp và toàn bộ bài hát trong album
     */
    private String resolveTrackLyrics(Track track) {
        if (track == null) {
            return null;
        }
        return lyricService != null ? lyricService.getOfficialLyrics(track.getId()) : null;
    }

    public AlbumTrackNavigationResponse buildAlbumNavigation(TrackSubmission currentSubmission, Track currentTrack) {
        if (currentTrack == null || currentTrack.getAlbum() == null) {
            return null;
        }

        Album album = currentTrack.getAlbum();
        List<Track> albumTracks = trackRepository.findByAlbum_IdOrderByTrackNumberAsc(album.getId());
        if (albumTracks == null || albumTracks.isEmpty()) {
            return null;
        }

        List<Long> trackIds = albumTracks.stream().map(Track::getId).toList();
        List<TrackSubmission> submissions = submissionRepository.findByTrackIdInOrderBySubmittedAtDesc(trackIds);
        Map<Long, TrackSubmission> latestSubByTrackId = submissions.stream()
                .collect(Collectors.toMap(TrackSubmission::getTrackId, Function.identity(), (existing, replacement) -> existing));

        List<AlbumTrackSummaryResponse> trackSummaries = new ArrayList<>();
        int currentIndex = -1;

        for (int i = 0; i < albumTracks.size(); i++) {
            Track t = albumTracks.get(i);
            TrackSubmission sub = latestSubByTrackId.get(t.getId());
            Long subId = sub != null ? sub.getId() : null;
            SubmissionStatus status = sub != null ? sub.getStatus() : null;

            if (Objects.equals(t.getId(), currentTrack.getId())
                    || (currentSubmission != null && currentSubmission.getId() != null && Objects.equals(subId, currentSubmission.getId()))) {
                currentIndex = i;
                if (currentSubmission != null) {
                    subId = currentSubmission.getId();
                    status = currentSubmission.getStatus();
                }
            }

            trackSummaries.add(new AlbumTrackSummaryResponse(
                    subId,
                    t.getId(),
                    t.getTitle(),
                    t.getTrackNumber(),
                    t.getDurationMs(),
                    status
            ));
        }

        if (currentIndex == -1) {
            currentIndex = 0;
        }

        Long prevSubmissionId = null;
        for (int i = currentIndex - 1; i >= 0; i--) {
            if (trackSummaries.get(i).submissionId() != null) {
                prevSubmissionId = trackSummaries.get(i).submissionId();
                break;
            }
        }

        Long nextSubmissionId = null;
        for (int i = currentIndex + 1; i < trackSummaries.size(); i++) {
            if (trackSummaries.get(i).submissionId() != null) {
                nextSubmissionId = trackSummaries.get(i).submissionId();
                break;
            }
        }

        Long nextPendingSubmissionId = null;
        // Tìm bài PENDING tiếp theo phía sau
        for (int i = currentIndex + 1; i < trackSummaries.size(); i++) {
            AlbumTrackSummaryResponse item = trackSummaries.get(i);
            if (item.submissionId() != null && item.status() == SubmissionStatus.PENDING) {
                nextPendingSubmissionId = item.submissionId();
                break;
            }
        }
        // Nếu phía sau không còn, kiểm tra vòng lặp từ đầu album xem còn bài nào PENDING chưa duyệt
        if (nextPendingSubmissionId == null) {
            for (int i = 0; i < currentIndex; i++) {
                AlbumTrackSummaryResponse item = trackSummaries.get(i);
                if (item.submissionId() != null && item.status() == SubmissionStatus.PENDING) {
                    nextPendingSubmissionId = item.submissionId();
                    break;
                }
            }
        }

        Long currentSubId = currentSubmission != null ? currentSubmission.getId() : null;

        return new AlbumTrackNavigationResponse(
                album.getId(),
                album.getTitle(),
                currentSubId,
                prevSubmissionId,
                nextSubmissionId,
                nextPendingSubmissionId,
                currentIndex + 1,
                trackSummaries.size(),
                trackSummaries
        );
    }
}
