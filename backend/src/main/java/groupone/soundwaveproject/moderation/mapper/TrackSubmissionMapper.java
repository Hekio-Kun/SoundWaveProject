package groupone.soundwaveproject.moderation.mapper;

import groupone.soundwaveproject.authentication.entity.AppUser;
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
     *
     * @param submission       Thực thể yêu cầu kiểm duyệt
     * @param track            Thực thể bài hát
     * @param submitter        Tài khoản tác giả gửi bài
     * @param submitterProfile Hồ sơ cá nhân của tác giả
     * @param reviewer         Tài khoản nhân viên kiểm duyệt
     * @param reviewerProfile  Hồ sơ cá nhân của nhân viên kiểm duyệt
     * @return DTO SubmissionQueueItemResponse chứa thông tin tóm tắt cho hàng đợi
     */
    public SubmissionQueueItemResponse toQueueItemResponse(TrackSubmission submission,
                                                           Track track,
                                                           AppUser submitter,
                                                           UserProfile submitterProfile,
                                                           AppUser reviewer,
                                                           UserProfile reviewerProfile) {
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
        String reviewerDisplayName = resolveDisplayName(reviewer, reviewerProfile);

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
     * Ánh xạ thông tin yêu cầu kiểm duyệt sang DTO chi tiết (mặc định không có lời bài hát truyền ngoài).
     *
     * @param submission       Thực thể yêu cầu kiểm duyệt
     * @param track            Thực thể bài hát
     * @param submitter        Tài khoản tác giả gửi bài
     * @param submitterProfile Hồ sơ cá nhân của tác giả
     * @param reviewer         Tài khoản nhân viên kiểm duyệt
     * @param reviewerProfile  Hồ sơ cá nhân của nhân viên kiểm duyệt
     * @return DTO SubmissionDetailResponse chi tiết
     */
    public SubmissionDetailResponse toDetailResponse(TrackSubmission submission,
                                                     Track track,
                                                     AppUser submitter,
                                                     UserProfile submitterProfile,
                                                     AppUser reviewer,
                                                     UserProfile reviewerProfile) {
        return toDetailResponse(submission, track, submitter, submitterProfile, reviewer, reviewerProfile, null);
    }

    /**
     * Ánh xạ thông tin yêu cầu kiểm duyệt sang DTO chi tiết kèm lời bài hát (lyrics) (UC-24.1 View Track Details).
     *
     * @param submission       Thực thể yêu cầu kiểm duyệt
     * @param track            Thực thể bài hát
     * @param submitter        Tài khoản tác giả gửi bài
     * @param submitterProfile Hồ sơ cá nhân của tác giả
     * @param reviewer         Tài khoản nhân viên kiểm duyệt
     * @param reviewerProfile  Hồ sơ cá nhân của nhân viên kiểm duyệt
     * @param lyrics           Lời bài hát (nội dung text/lrc)
     * @return DTO SubmissionDetailResponse chi tiết đầy đủ
     */
    public SubmissionDetailResponse toDetailResponse(TrackSubmission submission,
                                                     Track track,
                                                     AppUser submitter,
                                                     UserProfile submitterProfile,
                                                     AppUser reviewer,
                                                     UserProfile reviewerProfile,
                                                     String lyrics) {
        if (submission == null) {
            return null;
        }

        TrackDetailResponse trackDetail = toTrackDetailResponse(track, lyrics);
        UserSummaryResponse submitterSummary = toUserSummaryResponse(submitter, submitterProfile);
        UserSummaryResponse reviewerSummary = toUserSummaryResponse(reviewer, reviewerProfile);

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
     * Ánh xạ thực thể bài hát sang DTO chi tiết bài hát.
     *
     * @param track Thực thể bài hát
     * @return DTO TrackDetailResponse
     */
    public TrackDetailResponse toTrackDetailResponse(Track track) {
        return toTrackDetailResponse(track, track != null ? track.getLyrics() : null);
    }

    /**
     * Ánh xạ thực thể bài hát sang DTO chi tiết bài hát kèm lời bài hát chỉ định.
     *
     * @param track  Thực thể bài hát
     * @param lyrics Lời bài hát
     * @return DTO TrackDetailResponse
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

    /**
     * Ánh xạ thực thể thể loại (Genre) sang DTO tóm tắt GenreSummaryResponse.
     *
     * @param genre Thực thể thể loại
     * @return DTO GenreSummaryResponse
     */
    public GenreSummaryResponse toGenreSummaryResponse(Genre genre) {
        if (genre == null) {
            return null;
        }
        return new GenreSummaryResponse(genre.getId(), genre.getName(), genre.getSlug());
    }

    /**
     * Ánh xạ thực thể album (Album) sang DTO tóm tắt AlbumSummaryResponse.
     *
     * @param album Thực thể Album
     * @return DTO AlbumSummaryResponse
     */
    public AlbumSummaryResponse toAlbumSummaryResponse(Album album) {
        if (album == null) {
            return null;
        }
        return new AlbumSummaryResponse(album.getId(), album.getTitle(), album.getSlug(), album.getStatus());
    }

    /**
     * Ánh xạ tài khoản người dùng và hồ sơ cá nhân sang DTO tóm tắt UserSummaryResponse.
     *
     * @param user    Thực thể tài khoản AppUser
     * @param profile Thực thể hồ sơ cá nhân UserProfile
     * @return DTO UserSummaryResponse
     */
    public UserSummaryResponse toUserSummaryResponse(AppUser user, UserProfile profile) {
        if (user == null && profile == null) {
            return null;
        }
        Long id = user != null ? user.getId() : (profile != null ? profile.getUserId() : null);
        String email = user != null ? user.getEmail() : null;
        return new UserSummaryResponse(
                id,
                email,
                resolveUsername(profile),
                resolveDisplayName(user, profile)
        );
    }

    /**
     * Xác định tên hiển thị: ưu tiên Display Name trong hồ sơ, nếu không có thì dùng email.
     *
     * @param user    Thực thể tài khoản AppUser
     * @param profile Thực thể hồ sơ cá nhân UserProfile
     * @return Tên hiển thị phù hợp
     */
    private String resolveDisplayName(AppUser user, UserProfile profile) {
        if (profile != null && profile.getDisplayName() != null && !profile.getDisplayName().isBlank()) {
            return profile.getDisplayName();
        }
        if (user != null) {
            return user.getEmail();
        }
        return null;
    }

    /**
     * Lấy username từ hồ sơ người dùng nếu tồn tại.
     *
     * @param profile Thực thể hồ sơ cá nhân UserProfile
     * @return username hoặc null
     */
    private String resolveUsername(UserProfile profile) {
        if (profile != null) {
            return profile.getUsername();
        }
        return null;
    }
}
