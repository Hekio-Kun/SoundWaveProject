package groupone.soundwaveproject.lyrics.entity;

import groupone.soundwaveproject.authentication.entity.Staff;
import groupone.soundwaveproject.catalog.entity.Track;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Getter
@Setter
@Builder
@Entity
@Table(name = "official_lyrics")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class OfficialLyric {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "track_id", nullable = false, unique = true)
    private Track track;

    @Column(name = "lyric_content", columnDefinition = "TEXT", nullable = false)
    private String lyricContent;

    @Column(name = "status", nullable = false, length = 30)
    private String status; // "DRAFT" or "PUBLISHED"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id")
    private Staff createdBy;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        Instant now = Instant.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
        if (status == null) status = "DRAFT";
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }
}
