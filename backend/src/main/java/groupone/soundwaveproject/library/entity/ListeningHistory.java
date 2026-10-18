package groupone.soundwaveproject.library.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Getter
@Entity
@Table(name = "listening_history")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ListeningHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "track_id", nullable = false)
    private Long trackId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "track_id", insertable = false, updatable = false)
    private groupone.soundwaveproject.catalog.entity.Track track;

    @Column(name = "listened_duration_ms", nullable = false)
    private Integer listenedDurationMs;

    @Column(nullable = false)
    private Boolean completed = false;

    @Column(name = "played_at", nullable = false)
    private LocalDateTime playedAt;

    public ListeningHistory(Long userId, Long trackId, Integer listenedDurationMs, Boolean completed) {
        this.userId = userId;
        this.trackId = trackId;
        this.listenedDurationMs = listenedDurationMs;
        this.completed = completed != null ? completed : false;
    }

    public void updatePlayback(Integer listenedDurationMs, Boolean completed) {
        if (listenedDurationMs != null) {
            this.listenedDurationMs = listenedDurationMs;
        }
        if (completed != null) {
            this.completed = completed;
        }
        this.playedAt = LocalDateTime.now(ZoneOffset.UTC);
    }

    @PrePersist
    void initializePlayedAt() {
        if (playedAt == null) {
            playedAt = LocalDateTime.now(ZoneOffset.UTC);
        }
        if (completed == null) {
            completed = false;
        }
    }
}
