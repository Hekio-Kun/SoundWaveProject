package groupone.soundwaveproject.library.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

/**
 * Composite Key đại diện cho khóa chính tổng hợp của bảng playlist_tracks (playlist_id, track_id).
 * Bảng playlist_tracks là thực thể yếu (Weak Entity) phụ thuộc định danh vào Playlist và Track.
 */
@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class PlaylistTrackId implements Serializable {

    @Column(name = "playlist_id", nullable = false)
    private Long playlistId;

    @Column(name = "track_id", nullable = false)
    private Long trackId;
}
