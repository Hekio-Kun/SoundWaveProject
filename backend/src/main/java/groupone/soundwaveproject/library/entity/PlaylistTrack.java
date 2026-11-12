package groupone.soundwaveproject.library.entity;

import groupone.soundwaveproject.catalog.entity.Track;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

/**
 * Entity ánh xạ bảng playlist_tracks.
 * Thực thể yếu (Weak Entity) có khóa chính tổng hợp (playlist_id, track_id).
 */
@Getter
@Setter
@Builder
@Entity
@Table(name = "playlist_tracks")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class PlaylistTrack {

    @EmbeddedId
    private PlaylistTrackId id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("playlistId")
    @JoinColumn(name = "playlist_id", nullable = false)
    private Playlist playlist;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("trackId")
    @JoinColumn(name = "track_id", nullable = false)
    private Track track;

    @Column(name = "added_by_user_id", nullable = false)
    private Long addedByUserId;

    @Column(nullable = false)
    private Integer position;

    @Column(name = "added_at", nullable = false)
    private LocalDateTime addedAt;

    public PlaylistTrack(Playlist playlist, Track track, Long addedByUserId, Integer position) {
        this.playlist = playlist;
        this.track = track;
        this.id = new PlaylistTrackId(
                playlist != null ? playlist.getId() : null,
                track != null ? track.getId() : null
        );
        this.addedByUserId = addedByUserId;
        this.position = position;
        this.addedAt = LocalDateTime.now(ZoneOffset.UTC);
    }

    @PrePersist
    void initializeTimestamps() {
        if (addedAt == null) {
            addedAt = LocalDateTime.now(ZoneOffset.UTC);
        }
        if (id == null && playlist != null && track != null) {
            id = new PlaylistTrackId(playlist.getId(), track.getId());
        }
    }
}
