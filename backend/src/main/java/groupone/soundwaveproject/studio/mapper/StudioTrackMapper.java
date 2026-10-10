package groupone.soundwaveproject.studio.mapper;

import groupone.soundwaveproject.catalog.entity.Album;
import groupone.soundwaveproject.catalog.entity.Genre;
import groupone.soundwaveproject.catalog.entity.Track;
import groupone.soundwaveproject.moderation.entity.TrackSubmission;
import groupone.soundwaveproject.studio.dto.response.AlbumOptionResponse;
import groupone.soundwaveproject.studio.dto.response.GenreOptionResponse;
import groupone.soundwaveproject.studio.dto.response.RejectionDetailsResponse;
import groupone.soundwaveproject.studio.dto.response.RejectionHistoryItemResponse;
import groupone.soundwaveproject.studio.dto.response.StudioTrackResponse;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class StudioTrackMapper {

    public StudioTrackResponse toStudioTrackResponse(Track track, Genre genre, Album album, TrackSubmission latestSubmission) {
        String genreName = genre != null ? genre.getName() : (track.getGenre() != null ? track.getGenre().getName() : "Unknown");
        String genreSlug = genre != null ? genre.getSlug() : (track.getGenre() != null ? track.getGenre().getSlug() : "");
        String albumTitle = album != null ? album.getTitle() : (track.getAlbum() != null ? track.getAlbum().getTitle() : null);

        String rejectionReason = track.getLatestRejectionReason();
        String reviewerNote = null;
        String submitterNote = null;
        java.time.Instant submittedAt = null;
        java.time.Instant reviewedAt = null;

        if (latestSubmission != null) {
            if (rejectionReason == null || rejectionReason.isBlank()) {
                rejectionReason = latestSubmission.getRejectionReason();
            }
            reviewerNote = latestSubmission.getReviewerNote();
            submitterNote = latestSubmission.getSubmitterNote();
            submittedAt = latestSubmission.getSubmittedAt();
            reviewedAt = latestSubmission.getReviewedAt();
        }

        return new StudioTrackResponse(
                track.getId(),
                track.getTitle(),
                track.getSlug(),
                track.getDescription(),
                track.getGenreId(),
                genreName,
                genreSlug,
                track.getAlbumId(),
                albumTitle,
                track.getTrackNumber(),
                track.getPublicationStatus().name(),
                track.getAudioUrl(),
                track.getAudioFormat(),
                track.getDurationMs(),
                track.getCoverUrl(),
                track.getPlayCountCache(),
                rejectionReason,
                reviewerNote,
                submitterNote,
                submittedAt,
                reviewedAt,
                track.getCreatedAt() != null ? track.getCreatedAt().toInstant(java.time.ZoneOffset.UTC) : null,
                track.getUpdatedAt() != null ? track.getUpdatedAt().toInstant(java.time.ZoneOffset.UTC) : null,
                track.getLyrics()
        );
    }

    public GenreOptionResponse toGenreOption(Genre genre) {
        return new GenreOptionResponse(
                genre.getId(),
                genre.getName(),
                genre.getSlug(),
                genre.getDescription()
        );
    }

    public AlbumOptionResponse toAlbumOption(Album album) {
        return new AlbumOptionResponse(
                album.getId(),
                album.getTitle(),
                album.getSlug()
        );
    }

    /**
     * Chuyển đổi dữ liệu bài hát và danh sách các đợt nộp duyệt thành RejectionDetailsResponse.
     *
     * Đáp ứng đặc tả RDS:
     * - Normal Flow: Lấy thông tin phản hồi kiểm duyệt của đợt nộp mới nhất.
     * - Alternative Flow AF01: Ánh xạ danh sách tất cả các đợt nộp duyệt trước đó (history).
     * - Exception EX01: Nếu lý do từ chối trống, fallback về thông báo tiêu chuẩn:
     *   "Audio content violates community standards."
     *
     * @param track       Bản ghi bài hát bị từ chối
     * @param submissions Danh sách các đợt nộp duyệt của bài hát (sắp xếp mới nhất trước)
     * @return RejectionDetailsResponse chứa đầy đủ phản hồi và lịch sử
     */
    public RejectionDetailsResponse toRejectionDetails(Track track, List<TrackSubmission> submissions) {
        TrackSubmission latestSubmission = (submissions != null && !submissions.isEmpty())
                ? submissions.get(0)
                : null;

        String reason = track.getLatestRejectionReason();
        String note = null;
        java.time.Instant reviewedAt = null;

        if (latestSubmission != null) {
            if (reason == null || reason.isBlank()) {
                reason = latestSubmission.getRejectionReason();
            }
            note = latestSubmission.getReviewerNote();
            reviewedAt = latestSubmission.getReviewedAt();
        }

        // Exception EX01: Reason unavailable -> Display standard moderation notice
        String effectiveReason = (reason != null && !reason.isBlank())
                ? reason.trim()
                : "Audio content violates community standards.";

        List<RejectionHistoryItemResponse> history = (submissions != null)
                ? submissions.stream()
                        .map(sub -> new RejectionHistoryItemResponse(
                                sub.getId(),
                                sub.getStatus() != null ? sub.getStatus().name() : "UNKNOWN",
                                sub.getRejectionReason(),
                                sub.getReviewerNote(),
                                sub.getSubmittedAt(),
                                sub.getReviewedAt()
                        ))
                        .toList()
                : List.of();

        return new RejectionDetailsResponse(
                track.getId(),
                track.getTitle(),
                track.getPublicationStatus().name(),
                effectiveReason,
                note,
                reviewedAt,
                history
        );
    }

    /**
     * Phương thức tương thích ngược khi chỉ truyền một TrackSubmission đơn lẻ.
     */
    public RejectionDetailsResponse toRejectionDetails(Track track, TrackSubmission submission) {
        List<TrackSubmission> list = submission != null ? List.of(submission) : List.of();
        return toRejectionDetails(track, list);
    }
}

