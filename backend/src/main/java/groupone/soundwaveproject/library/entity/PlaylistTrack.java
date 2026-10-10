package groupone.soundwaveproject.library.entity;

import groupone.soundwaveproject.catalog.entity.Track;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Getter
@Setter
@Builder
@Entity
@Table(
        name = "playlist_tracks",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_playlist_track", columnNames = {"playlist_id", "track_id"})
        }
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class PlaylistTrack {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "playlist_id", nullable = false)
    private Playlist playlist;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
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
        this.addedByUserId = addedByUserId;
        this.position = position;
        this.addedAt = LocalDateTime.now(ZoneOffset.UTC);
    }

    @PrePersist
    void initializeTimestamps() {
        if (addedAt == null) {
            addedAt = LocalDateTime.now(ZoneOffset.UTC);
        }
    }
}
