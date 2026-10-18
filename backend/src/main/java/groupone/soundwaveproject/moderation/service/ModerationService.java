package groupone.soundwaveproject.moderation.service;

import groupone.soundwaveproject.authentication.entity.AppUser;
import groupone.soundwaveproject.authentication.entity.UserProfile;
import groupone.soundwaveproject.authentication.repository.AppUserRepository;
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
import groupone.soundwaveproject.moderation.dto.response.SubmissionDetailResponse;
import groupone.soundwaveproject.moderation.dto.response.SubmissionQueueItemResponse;
import groupone.soundwaveproject.moderation.dto.response.SubmissionStatsResponse;
import groupone.soundwaveproject.moderation.entity.SubmissionStatus;
import groupone.soundwaveproject.moderation.entity.TrackSubmission;
import groupone.soundwaveproject.moderation.exception.InvalidSubmissionStateException;
import groupone.soundwaveproject.moderation.exception.SubmissionNotFoundException;
import groupone.soundwaveproject.moderation.mapper.TrackSubmissionMapper;
import groupone.soundwaveproject.moderation.repository.TrackSubmissionRepository;
import groupone.soundwaveproject.notification.entity.NotificationType;
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
import java.util.stream.Stream;

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
@RequiredArgsConstructor
public class ModerationService {
    private final TrackSubmissionRepository submissionRepository;
    private final TrackRepository trackRepository;
    private final AlbumRepository albumRepository;
    private final ModerationMailService mailService;
    private final TrackSubmissionMapper mapper;
    private final AppUserRepository userRepository;
    private final UserProfileRepository profileRepository;
    private final NotificationService notificationService;

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
        boolean searchProvided = search != null && !search.trim().isBlank();
        Page<TrackSubmission> page;

        // 1. Nếu có từ khóa tìm kiếm: lọc trước theo tên bài hát, tên album hoặc email người gửi
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
                        return false;
                    })
                    .map(Track::getId)
                    .toList();

            List<Long> matchingUserIds = userRepository.findByEmailContainingIgnoreCase(trimmedSearch).stream()
                    .map(AppUser::getId)
                    .toList();

            if (matchingTrackIds.isEmpty() && matchingUserIds.isEmpty()) {
                return Page.empty(pageable);
            }

            Collection<Long> safeTrackIds = matchingTrackIds.isEmpty() ? List.of(-1L) : matchingTrackIds;
            Collection<Long> safeUserIds = matchingUserIds.isEmpty() ? List.of(-1L) : matchingUserIds;
            page = submissionRepository.findByStatusAndMatchingIds(status, safeTrackIds, safeUserIds, pageable);
        } else if (status != null) {
            // 2. Không có từ khóa tìm kiếm: lọc theo trạng thái nếu có
            page = submissionRepository.findByStatus(status, pageable);
        } else {
            // 3. Lấy tất cả bản ghi có phân trang
            page = submissionRepository.findAll(pageable);
        }

        // 4. Gom nhóm các ID để truy vấn hàng loạt dữ liệu liên quan (tránh lỗi N+1 query)
        Set<Long> trackIds = page.getContent().stream()
                .map(TrackSubmission::getTrackId)
                .collect(Collectors.toSet());

        Set<Long> userIds = page.getContent().stream()
                .flatMap(s -> Stream.of(s.getSubmittedByUserId(), s.getReviewerUserId()))
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<Long, Track> tracksMap = trackIds.isEmpty() ? Map.of() :
                trackRepository.findAllById(trackIds).stream()
                        .collect(Collectors.toMap(Track::getId, Function.identity()));

        Map<Long, UserProfile> profilesMap = userIds.isEmpty() ? Map.of() :
                profileRepository.findAllById(userIds).stream()
                        .collect(Collectors.toMap(UserProfile::getUserId, Function.identity()));

        Map<Long, AppUser> usersMap = userIds.isEmpty() ? Map.of() :
                userRepository.findAllById(userIds).stream()
                        .collect(Collectors.toMap(AppUser::getId, Function.identity()));

        // 5. Ánh xạ sang danh sách DTO SubmissionQueueItemResponse:
        // - Single tracks được hiển thị riêng lẻ với itemType = "SINGLE"
        // - Các bài hát thuộc Album được gom nhóm theo Album với itemType = "ALBUM" và chứa albumTracks
        List<SubmissionQueueItemResponse> queueItems = new ArrayList<>();
        Set<Long> processedAlbumIds = new HashSet<>();

        for (TrackSubmission submission : page.getContent()) {
            Track track = tracksMap.get(submission.getTrackId());
            if (track == null) continue;

            if (track.getAlbum() == null) {
                AppUser submitter = usersMap.get(submission.getSubmittedByUserId());
                UserProfile submitterProfile = profilesMap.get(submission.getSubmittedByUserId());
                AppUser reviewer = submission.getReviewerUserId() != null ? usersMap.get(submission.getReviewerUserId()) : null;
                UserProfile reviewerProfile = submission.getReviewerUserId() != null ? profilesMap.get(submission.getReviewerUserId()) : null;
                queueItems.add(mapper.toQueueItemResponse(submission, track, submitter, submitterProfile, reviewer, reviewerProfile));
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

                    AppUser albumCreator = usersMap.get(album.getCreatedByUserId());
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
                        AppUser atReviewer = atSub.getReviewerUserId() != null ? usersMap.get(atSub.getReviewerUserId()) : null;
                        UserProfile atRevProfile = atSub.getReviewerUserId() != null ? profilesMap.get(atSub.getReviewerUserId()) : null;
                        mappedAlbumTracks.add(mapper.toQueueItemResponse(atSub, at, albumCreator, albumCreatorProfile, atReviewer, atRevProfile));
                    }

                    SubmissionQueueItemResponse albumItem = mapper.createAlbumQueueItem(album, mappedAlbumTracks, albumCreator, albumCreatorProfile);
                    if (albumItem != null) {
                        queueItems.add(albumItem);
                    }
                }
            }
        }

        return new org.springframework.data.domain.PageImpl<>(queueItems, pageable, page.getTotalElements());
    }

    /**
     * Xem thông tin chi tiết một bản ghi yêu cầu kiểm duyệt kèm tệp âm thanh và lời bài hát (UC-24.1 View Track Details).
     *
     * @param id ID của bản ghi yêu cầu kiểm duyệt (TrackSubmission ID)
     * @return DTO thông tin chi tiết bài hát, người gửi và kiểm duyệt viên
     * @throws SubmissionNotFoundException nếu không tìm thấy bản ghi yêu cầu kiểm duyệt
     */
    @Transactional(readOnly = true)
    public SubmissionDetailResponse getSubmissionDetail(Long id) {
        // 1. Tìm bản ghi yêu cầu kiểm duyệt theo ID
        TrackSubmission submission = submissionRepository.findById(id)
                .orElseThrow(() -> new SubmissionNotFoundException(id));

        // 2. Lấy thông tin bài hát và trích xuất lời bài hát (lyrics)
        Track track = trackRepository.findById(submission.getTrackId()).orElse(null);
        String lyrics = track != null ? track.getLyrics() : null;

        // 3. Lấy thông tin người nộp bài và kiểm duyệt viên (nếu có)
        AppUser submitter = userRepository.findById(submission.getSubmittedByUserId()).orElse(null);
        UserProfile submitterProfile = profileRepository.findByUserId(submission.getSubmittedByUserId()).orElse(null);
        AppUser reviewer = submission.getReviewerUserId() != null ?
                userRepository.findById(submission.getReviewerUserId()).orElse(null) : null;
        UserProfile reviewerProfile = submission.getReviewerUserId() != null ?
                profileRepository.findByUserId(submission.getReviewerUserId()).orElse(null) : null;

        // 4. Ánh xạ dữ liệu trả về cho giao diện chi tiết
        return mapper.toDetailResponse(submission, track, submitter, submitterProfile, reviewer, reviewerProfile, lyrics);
    }

    /**
     * Lấy số liệu thống kê tổng hợp số lượng bài hát theo từng trạng thái kiểm duyệt (UC-24.1 View Moderation Queue Stats).
     *
     * @return DTO chứa số lượng chờ duyệt (PENDING), đã duyệt (APPROVED), bị từ chối (REJECTED) và tổng số
     */
    @Transactional(readOnly = true)
    public SubmissionStatsResponse getQueueStats() {
        long pending = submissionRepository.countByStatus(SubmissionStatus.PENDING);
        long approved = submissionRepository.countByStatus(SubmissionStatus.APPROVED);
        long rejected = submissionRepository.countByStatus(SubmissionStatus.REJECTED);
        long total = submissionRepository.count();
        return new SubmissionStatsResponse(pending, approved, rejected, total);
    }

    /**
     * Phê duyệt bài hát đang chờ duyệt để xuất bản công khai lên SoundWave (UC-24.2 Approve Track).
     * - Cập nhật trạng thái bài hát sang PUBLISHED.
     * - Áp dụng quy tắc BR-18: Tự động chuyển Album sang PUBLISHED nếu Album đang ở DRAFT.
     * - Gửi email thông báo xuất bản thành công tới nghệ sĩ/tác giả.
     *
     * @param id            ID của bản ghi yêu cầu kiểm duyệt
     * @param request       DTO chứa ghi chú nội bộ của người kiểm duyệt (tùy chọn)
     * @param reviewerEmail Email của nhân viên kiểm duyệt đang đăng nhập
     * @return DTO thông tin chi tiết bài hát sau khi được phê duyệt
     * @throws SubmissionNotFoundException     nếu không tìm thấy yêu cầu kiểm duyệt
     * @throws InvalidSubmissionStateException nếu yêu cầu không ở trạng thái PENDING
     * @throws ResourceNotFoundException       nếu không tìm thấy tài khoản kiểm duyệt viên hoặc bài hát
     */
    @Transactional
    public SubmissionDetailResponse approveSubmission(Long id, ApproveTrackRequest request, String reviewerEmail) {
        // 1. Kiểm tra tồn tại bản ghi yêu cầu kiểm duyệt
        TrackSubmission submission = submissionRepository.findById(id)
                .orElseThrow(() -> new SubmissionNotFoundException(id));

        // 2. Ràng buộc trạng thái: Chỉ bài hát ở trạng thái PENDING mới được phê duyệt
        if (submission.getStatus() != SubmissionStatus.PENDING) {
            throw new InvalidSubmissionStateException("Track submission is not in PENDING status. Current status: " + submission.getStatus());
        }

        // 3. Xác thực tài khoản nhân viên kiểm duyệt thực hiện thao tác
        AppUser reviewer = userRepository.findByEmailIgnoreCase(reviewerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("REVIEWER_NOT_FOUND", "Reviewer account not found."));

        Instant nowInstant = Instant.now();
        LocalDateTime nowUtc = LocalDateTime.now(ZoneOffset.UTC);
        String reviewerNote = request != null ? request.reviewerNote() : null;

        // 4. Cập nhật trạng thái bản ghi yêu cầu kiểm duyệt sang APPROVED
        submission.setStatus(SubmissionStatus.APPROVED);
        submission.setReviewerUserId(reviewer.getId());
        submission.setReviewerNote(reviewerNote);
        submission.setRejectionReason(null);
        submission.setReviewedAt(nowInstant);
        submissionRepository.save(submission);

        // 5. Cập nhật bài hát sang PUBLISHED
        Track track = trackRepository.findById(submission.getTrackId())
                .orElseThrow(() -> new ResourceNotFoundException("TRACK_NOT_FOUND", "Track not found with id: " + submission.getTrackId()));

        track.setPublicationStatus(TrackPublicationStatus.PUBLISHED);
        track.setApprovedAt(nowUtc);
        track.setLatestRejectionReason(null);

        // 6. Quy tắc nghiệp vụ BR-18: Tự động kích hoạt xuất bản Album nếu Album đang ở trạng thái DRAFT
        Album album = track.getAlbum();
        if (album != null && "DRAFT".equalsIgnoreCase(album.getStatus())) {
            album.setStatus("PUBLISHED");
            album.setPublishedAt(nowUtc);
            albumRepository.save(album);
        }
        trackRepository.save(track);

        // 7. Gửi email thông báo xuất bản bài hát thành công tới nghệ sĩ/tác giả
        AppUser submitter = userRepository.findById(submission.getSubmittedByUserId()).orElse(null);
        UserProfile submitterProfile = profileRepository.findByUserId(submission.getSubmittedByUserId()).orElse(null);
        String submitterDisplayName = submitterProfile != null && submitterProfile.getDisplayName() != null && !submitterProfile.getDisplayName().isBlank()
                ? submitterProfile.getDisplayName() : (submitter != null ? submitter.getEmail() : "Creator");

        if (submitter != null) {
            mailService.sendTrackApprovedEmail(submitter.getEmail(), submitterDisplayName, track.getTitle());
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

        UserProfile reviewerProfile = profileRepository.findByUserId(reviewer.getId()).orElse(null);
        String lyrics = track.getLyrics();
        return mapper.toDetailResponse(submission, track, submitter, submitterProfile, reviewer, reviewerProfile, lyrics);
    }

    /**
     * Từ chối bài hát đang chờ duyệt do không đạt tiêu chuẩn nội dung hoặc chất lượng (UC-24.2 Reject Track).
     * Bắt buộc phải có lý do từ chối (tối thiểu 10 ký tự) và gửi email giải thích cụ thể cho tác giả.
     *
     * @param id            ID của bản ghi yêu cầu kiểm duyệt
     * @param request       DTO chứa lý do từ chối và ghi chú của kiểm duyệt viên
     * @param reviewerEmail Email của nhân viên kiểm duyệt đang đăng nhập
     * @return DTO thông tin chi tiết bài hát sau khi bị từ chối
     * @throws SubmissionNotFoundException     nếu không tìm thấy yêu cầu kiểm duyệt
     * @throws InvalidSubmissionStateException nếu yêu cầu không ở trạng thái PENDING
     * @throws ResourceNotFoundException       nếu không tìm thấy tài khoản kiểm duyệt viên hoặc bài hát
     */
    @Transactional
    public SubmissionDetailResponse rejectSubmission(Long id, RejectTrackRequest request, String reviewerEmail) {
        // 1. Kiểm tra tồn tại bản ghi yêu cầu kiểm duyệt
        TrackSubmission submission = submissionRepository.findById(id)
                .orElseThrow(() -> new SubmissionNotFoundException(id));

        // 2. Ràng buộc trạng thái: Chỉ bài hát ở trạng thái PENDING mới được từ chối
        if (submission.getStatus() != SubmissionStatus.PENDING) {
            throw new InvalidSubmissionStateException("Track submission is not in PENDING status. Current status: " + submission.getStatus());
        }

        // 3. Xác thực tài khoản nhân viên kiểm duyệt thực hiện thao tác
        AppUser reviewer = userRepository.findByEmailIgnoreCase(reviewerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("REVIEWER_NOT_FOUND", "Reviewer account not found."));

        Instant nowInstant = Instant.now();
        String rejectionReason = request.rejectionReason().trim();
        String reviewerNote = request.reviewerNote();

        // 4. Cập nhật bản ghi kiểm duyệt sang REJECTED kèm lý do và ghi chú
        submission.setStatus(SubmissionStatus.REJECTED);
        submission.setReviewerUserId(reviewer.getId());
        submission.setReviewerNote(reviewerNote);
        submission.setRejectionReason(rejectionReason);
        submission.setReviewedAt(nowInstant);
        submissionRepository.save(submission);

        // 5. Cập nhật trạng thái bài hát sang REJECTED và lưu lý do từ chối mới nhất
        Track track = trackRepository.findById(submission.getTrackId())
                .orElseThrow(() -> new ResourceNotFoundException("TRACK_NOT_FOUND", "Track not found with id: " + submission.getTrackId()));

        track.setPublicationStatus(TrackPublicationStatus.REJECTED);
        track.setLatestRejectionReason(rejectionReason);
        trackRepository.save(track);

        // 6. Gửi email thông báo từ chối kèm lý do chi tiết tới tác giả
        AppUser submitter = userRepository.findById(submission.getSubmittedByUserId()).orElse(null);
        UserProfile submitterProfile = profileRepository.findByUserId(submission.getSubmittedByUserId()).orElse(null);
        String submitterDisplayName = submitterProfile != null && submitterProfile.getDisplayName() != null && !submitterProfile.getDisplayName().isBlank()
                ? submitterProfile.getDisplayName() : (submitter != null ? submitter.getEmail() : "Creator");

        if (submitter != null) {
            mailService.sendTrackRejectedEmail(submitter.getEmail(), submitterDisplayName, track.getTitle(), rejectionReason);
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

        UserProfile reviewerProfile = profileRepository.findByUserId(reviewer.getId()).orElse(null);
        String lyrics = track.getLyrics();
        return mapper.toDetailResponse(submission, track, submitter, submitterProfile, reviewer, reviewerProfile, lyrics);
    }

    /**
     * Gỡ bỏ một bài hát đã được phê duyệt và xuất bản trước đó (UC-24.2 Take Down Track).
     * Chuyển trạng thái xuất bản của bài hát sang TAKEN_DOWN và gửi email giải trình cho tác giả.
     *
     * @param id            ID của bản ghi yêu cầu kiểm duyệt
     * @param request       DTO chứa lý do gỡ bài và ghi chú của kiểm duyệt viên
     * @param reviewerEmail Email của nhân viên kiểm duyệt đang đăng nhập
     * @return DTO thông tin chi tiết bài hát sau khi bị gỡ bỏ
     * @throws SubmissionNotFoundException     nếu không tìm thấy yêu cầu kiểm duyệt
     * @throws InvalidSubmissionStateException nếu yêu cầu không ở trạng thái APPROVED
     * @throws ResourceNotFoundException       nếu không tìm thấy tài khoản kiểm duyệt viên hoặc bài hát
     */
    @Transactional
    public SubmissionDetailResponse takeDownSubmission(Long id, TakeDownTrackRequest request, String reviewerEmail) {
        // 1. Kiểm tra tồn tại bản ghi yêu cầu kiểm duyệt
        TrackSubmission submission = submissionRepository.findById(id)
                .orElseThrow(() -> new SubmissionNotFoundException(id));

        // 2. Ràng buộc trạng thái: Chỉ bài hát đã APPROVED mới có thể bị gỡ bỏ
        if (submission.getStatus() != SubmissionStatus.APPROVED) {
            throw new InvalidSubmissionStateException("Only approved tracks can be taken down. Current status: " + submission.getStatus());
        }

        // 3. Xác thực tài khoản nhân viên kiểm duyệt thực hiện thao tác
        AppUser reviewer = userRepository.findByEmailIgnoreCase(reviewerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("REVIEWER_NOT_FOUND", "Reviewer account not found."));

        Instant nowInstant = Instant.now();
        String reason = request.takedownReason().trim();
        String reviewerNote = request.reviewerNote();

        // 4. Cập nhật trạng thái bản ghi kiểm duyệt và lưu lý do gỡ bài
        submission.setStatus(SubmissionStatus.REJECTED);
        submission.setReviewerUserId(reviewer.getId());
        submission.setReviewerNote(reviewerNote);
        submission.setRejectionReason(reason);
        submission.setReviewedAt(nowInstant);
        submissionRepository.save(submission);

        // 5. Cập nhật trạng thái bài hát sang TAKEN_DOWN để dừng phát hành công khai
        Track track = trackRepository.findById(submission.getTrackId())
                .orElseThrow(() -> new ResourceNotFoundException("TRACK_NOT_FOUND", "Track not found with id: " + submission.getTrackId()));

        track.setPublicationStatus(TrackPublicationStatus.TAKEN_DOWN);
        track.setLatestRejectionReason(reason);
        trackRepository.save(track);

        // 6. Gửi email thông báo gỡ bài kèm lý do cho tác giả
        AppUser submitter = userRepository.findById(submission.getSubmittedByUserId()).orElse(null);
        UserProfile submitterProfile = profileRepository.findByUserId(submission.getSubmittedByUserId()).orElse(null);
        String submitterDisplayName = submitterProfile != null && submitterProfile.getDisplayName() != null && !submitterProfile.getDisplayName().isBlank()
                ? submitterProfile.getDisplayName() : (submitter != null ? submitter.getEmail() : "Creator");

        if (submitter != null) {
            mailService.sendTrackTakenDownEmail(submitter.getEmail(), submitterDisplayName, track.getTitle(), reason);
        }

        UserProfile reviewerProfile = profileRepository.findByUserId(reviewer.getId()).orElse(null);
        String lyrics = track.getLyrics();
        return mapper.toDetailResponse(submission, track, submitter, submitterProfile, reviewer, reviewerProfile, lyrics);
    }
}
