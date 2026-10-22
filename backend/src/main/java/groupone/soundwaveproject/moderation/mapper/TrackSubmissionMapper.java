package groupone.soundwaveproject.moderation.mapper;

import groupone.soundwaveproject.authentication.entity.Staff;
import groupone.soundwaveproject.authentication.entity.User;
import groupone.soundwaveproject.authentication.entity.UserProfile;
import groupone.soundwaveproject.catalog.entity.Album;
import groupone.soundwaveproject.catalog.entity.Genre;
import groupone.soundwaveproject.catalog.entity.Track;
import groupone.soundwaveproject.moderation.dto.response.*;
import groupone.soundwaveproject.moderation.entity.TrackSubmission;
import org.springframework.stereotype.Component;

/**
 * Mapper chuyển đổi dữ liệu giữa Entity và DTO cho chức năng Kiểm duyệt bài hát (UC-24: Manage Track Moderation).
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
        String genreName = (track != null && track.getGenre() != null) ? track.getGenre().getName() : null;
        String albumTitle = (track != null && track.getAlbum() != null) ? track.getAlbum().getTitle() : null;
        String coverUrl = track != null ? track.getCoverUrl() : null;
        Integer durationMs = track != null ? track.getDurationMs() : null;

        Long submitterId = submitter != null ? submitter.getId() : submission.getSubmittedByUserId();
        String submitterDisplayName = resolveDisplayName(submitter, submitterProfile);
        String submitterEmail = submitter != null ? submitter.getEmail() : null;
        String reviewerDisplayName = reviewer != null ? reviewer.getFullName() : null;

        return new SubmissionQueueItemResponse(
                submission.getId(),
                trackId,
                trackTitle,
                genreName,
                albumTitle,
                coverUrl,
                durationMs,
                submitterId,
                submitterDisplayName,
                submitterEmail,
                submission.getStatus(),
                submission.getSubmittedAt(),
                submission.getReviewedAt(),
                reviewerDisplayName
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
                reviewerSummary
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
