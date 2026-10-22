package groupone.soundwaveproject.moderation.mapper;

import groupone.soundwaveproject.authentication.entity.Staff;
import groupone.soundwaveproject.authentication.entity.User;
import groupone.soundwaveproject.authentication.entity.UserProfile;
import groupone.soundwaveproject.catalog.entity.Album;
import groupone.soundwaveproject.catalog.entity.Genre;
import groupone.soundwaveproject.catalog.entity.Track;
import groupone.soundwaveproject.moderation.dto.response.*;
import groupone.soundwaveproject.moderation.entity.SubmissionStatus;
import groupone.soundwaveproject.moderation.entity.TrackSubmission;
import org.springframework.stereotype.Component;

/**
 * Mapper chuyển đổi dữ liệu giữa Entity và DTO cho chức năng Kiểm duyệt nội dung (UC-24: Manage Track & Album Moderation).
 */
@Component
public class TrackSubmissionMapper {

    /**
     * Ánh xạ thông tin yêu cầu kiểm duyệt, bài hát, tác giả và người duyệt sang DTO hiển thị danh sách hàng đợi (Queue Item).
     */
    public SubmissionQueueItemResponse toQueueItemResponse(TrackSubmission submission,
                                                           Track track,
                                                           User submitter,
                                                           UserProfile submitterProfile,
                                                           Staff reviewer) {
        if (submission == null) {
            return null;
        }

        Long trackId = track != null ? track.getId() : submission.getTrackId();
        String trackTitle = track != null ? track.getTitle() : null;
        Integer trackNumber = track != null ? track.getTrackNumber() : null;
        String genreName = (track != null && track.getGenre() != null) ? track.getGenre().getName() : null;
        Long albumId = (track != null && track.getAlbum() != null) ? track.getAlbum().getId() : null;
        String albumTitle = (track != null && track.getAlbum() != null) ? track.getAlbum().getTitle() : null;
        String itemType = (albumId != null) ? "ALBUM_TRACK" : "SINGLE";
        String coverUrl = track != null ? track.getCoverUrl() : null;
        Integer durationMs = track != null ? track.getDurationMs() : null;

        Long submitterId = submitter != null ? submitter.getId() : submission.getSubmittedByUserId();
        String submitterDisplayName = resolveDisplayName(submitter, submitterProfile);
        String submitterEmail = submitter != null ? submitter.getEmail() : null;
        String reviewerDisplayName = reviewer != null ? reviewer.getFullName() : null;

        return new SubmissionQueueItemResponse(
                submission.getId(),
                itemType,
                trackId,
                trackTitle,
                trackNumber,
                albumId,
                albumTitle,
                genreName,
                coverUrl,
                durationMs,
                submitterId,
                submitterDisplayName,
                submitterEmail,
                submission.getStatus(),
                submission.getSubmittedAt(),
                submission.getReviewedAt(),
                reviewerDisplayName,
                1,
                null
        );
    }

    /**
     * Tạo mục Queue Item đại diện cho Album chứa danh sách các bài hát bên trong.
     */
    public SubmissionQueueItemResponse createAlbumQueueItem(
            Album album,
            java.util.List<SubmissionQueueItemResponse> tracks,
            User submitter,
            UserProfile submitterProfile
    ) {
        if (album == null || tracks == null || tracks.isEmpty()) {
            return null;
        }

        SubmissionStatus overallStatus = tracks.stream().anyMatch(t -> t.status() == SubmissionStatus.PENDING)
                ? SubmissionStatus.PENDING
                : (tracks.stream().allMatch(t -> t.status() == SubmissionStatus.APPROVED)
                    ? SubmissionStatus.APPROVED
                    : SubmissionStatus.REJECTED);

        java.time.Instant latestSubmittedAt = tracks.stream()
                .map(SubmissionQueueItemResponse::submittedAt)
                .filter(java.util.Objects::nonNull)
                .max(java.util.Comparator.naturalOrder())
                .orElse(java.time.Instant.now());

        int totalDuration = tracks.stream()
                .map(SubmissionQueueItemResponse::durationMs)
                .filter(java.util.Objects::nonNull)
                .mapToInt(Integer::intValue)
                .sum();

        String coverUrl = album.getCoverUrl() != null ? album.getCoverUrl() : tracks.getFirst().coverUrl();
        String submitterDisplayName = resolveDisplayName(submitter, submitterProfile);
        String submitterEmail = submitter != null ? submitter.getEmail() : tracks.getFirst().submitterEmail();

        return new SubmissionQueueItemResponse(
                album.getId(),
                "ALBUM",
                null,
                album.getTitle(),
                null,
                album.getId(),
                album.getTitle(),
                tracks.getFirst().genreName(),
                coverUrl,
                totalDuration,
                album.getCreatedByUserId(),
                submitterDisplayName,
                submitterEmail,
                overallStatus,
                latestSubmittedAt,
                null,
                null,
                tracks.size(),
                tracks
        );
    }

    /**
     * Ánh xạ thông tin yêu cầu kiểm duyệt sang DTO chi tiết kèm lời bài hát (lyrics) (UC-24.1 View Track Details).
     */
    public SubmissionDetailResponse toDetailResponse(TrackSubmission submission,
                                                     Track track,
                                                     User submitter,
                                                     UserProfile submitterProfile,
                                                     Staff reviewer,
                                                     String lyrics) {
        return toDetailResponse(submission, track, submitter, submitterProfile, reviewer, lyrics, null);
    }

    public SubmissionDetailResponse toDetailResponse(TrackSubmission submission,
                                                     Track track,
                                                     User submitter,
                                                     UserProfile submitterProfile,
                                                     Staff reviewer,
                                                     String lyrics,
                                                     AlbumTrackNavigationResponse albumNavigation) {
        if (submission == null) {
            return null;
        }

        TrackDetailResponse trackDetail = toTrackDetailResponse(track, lyrics);
        UserSummaryResponse submitterSummary = toUserSummaryResponse(submitter, submitterProfile);
        UserSummaryResponse reviewerSummary = toStaffSummaryResponse(reviewer);

        return new SubmissionDetailResponse(
                submission.getId(),
                submission.getStatus(),
                submission.getSubmitterNote(),
                submission.getReviewerNote(),
                submission.getRejectionReason(),
                submission.getSubmittedAt(),
                submission.getReviewedAt(),
                trackDetail,
                submitterSummary,
                reviewerSummary,
                albumNavigation
        );
    }

    /**
     * Ánh xạ thực thể bài hát sang DTO chi tiết bài hát kèm lời bài hát chỉ định.
     */
    public TrackDetailResponse toTrackDetailResponse(Track track, String lyrics) {
        if (track == null) {
            return null;
        }

        GenreSummaryResponse genreSummary = toGenreSummaryResponse(track.getGenre());
        AlbumSummaryResponse albumSummary = toAlbumSummaryResponse(track.getAlbum());

        return new TrackDetailResponse(
                track.getId(),
                track.getTitle(),
                track.getSlug(),
                track.getDescription(),
                track.getTrackNumber(),
                track.getPublicationStatus() != null ? track.getPublicationStatus().name() : null,
                track.getAudioUrl(),
                track.getAudioFormat(),
                track.getDurationMs(),
                track.getCoverUrl(),
                track.getPlayCountCache(),
                track.getApprovedAt(),
                track.getLatestRejectionReason(),
                track.getCreatedAt(),
                genreSummary,
                albumSummary,
                lyrics
        );
    }

    public GenreSummaryResponse toGenreSummaryResponse(Genre genre) {
        if (genre == null) {
            return null;
        }
        return new GenreSummaryResponse(genre.getId(), genre.getName(), genre.getSlug());
    }

    public AlbumSummaryResponse toAlbumSummaryResponse(Album album) {
        if (album == null) {
            return null;
        }
        return new AlbumSummaryResponse(album.getId(), album.getTitle(), album.getSlug(), album.getStatus());
    }

    public UserSummaryResponse toUserSummaryResponse(User user, UserProfile profile) {
        if (user == null && profile == null) {
            return null;
        }
        Long id = user != null ? user.getId() : (profile != null ? profile.getUserId() : null);
        String email = user != null ? user.getEmail() : null;
        return new UserSummaryResponse(
                id,
                email,
                profile != null ? profile.getUsername() : null,
                resolveDisplayName(user, profile)
        );
    }

    public UserSummaryResponse toStaffSummaryResponse(Staff staff) {
        if (staff == null) {
            return null;
        }
        return new UserSummaryResponse(
                staff.getId(),
                staff.getEmail(),
                staff.getEmail().split("@")[0],
                staff.getFullName()
        );
    }

    private String resolveDisplayName(User user, UserProfile profile) {
        if (profile != null && profile.getDisplayName() != null && !profile.getDisplayName().isBlank()) {
            return profile.getDisplayName();
        }
        if (user != null) {
            return user.getEmail();
        }
        return null;
    }
}
