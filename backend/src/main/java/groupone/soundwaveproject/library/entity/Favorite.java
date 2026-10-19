package groupone.soundwaveproject.library.entity;

import groupone.soundwaveproject.catalog.entity.Track;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

/**
 * Entity ánh xạ bảng favorites (UC-14: Favorite Tracks Management).
 */
@Getter
@Setter
@Entity
@Table(name = "favorites")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Favorite {

    @EmbeddedId
    private FavoriteId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "track_id", insertable = false, updatable = false)
    private Track track;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public Favorite(Long userId, Long trackId) {
        this.id = new FavoriteId(userId, trackId);
        this.createdAt = LocalDateTime.now(ZoneOffset.UTC);
    }

    @PrePersist
    void initializeCreatedAt() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now(ZoneOffset.UTC);
        }
    }
}
