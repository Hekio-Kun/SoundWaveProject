package groupone.soundwaveproject.studio.mapper;

import groupone.soundwaveproject.catalog.entity.Album;
import groupone.soundwaveproject.catalog.entity.Genre;
import groupone.soundwaveproject.catalog.entity.Track;
import groupone.soundwaveproject.moderation.entity.TrackSubmission;
import groupone.soundwaveproject.studio.dto.response.AlbumOptionResponse;
import groupone.soundwaveproject.studio.dto.response.GenreOptionResponse;
import groupone.soundwaveproject.studio.dto.response.RejectionDetailsResponse;
import groupone.soundwaveproject.studio.dto.response.StudioTrackResponse;
import org.springframework.stereotype.Component;

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

    public RejectionDetailsResponse toRejectionDetails(Track track, TrackSubmission submission) {
        String reason = track.getLatestRejectionReason();
        String note = null;
        java.time.Instant reviewedAt = null;

        if (submission != null) {
            if (reason == null || reason.isBlank()) {
                reason = submission.getRejectionReason();
            }
            note = submission.getReviewerNote();
            reviewedAt = submission.getReviewedAt();
        }

        return new RejectionDetailsResponse(
                track.getId(),
                track.getTitle(),
                track.getPublicationStatus().name(),
                reason != null ? reason : "Content was rejected during moderation.",
                note,
                reviewedAt
        );
    }
}

