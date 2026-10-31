package groupone.soundwaveproject.lyrics.entity;

import groupone.soundwaveproject.authentication.entity.User;
import groupone.soundwaveproject.catalog.entity.Track;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Getter
@Setter
@Builder
@Entity
@Table(name = "personal_lyrics")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class PersonalLyric {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "track_id", nullable = false)
    private Track track;

    @Column(name = "lyric_type", nullable = false, length = 20)
    @Builder.Default
    private String lyricType = "CUSTOM"; // "CUSTOM" or "TRANSLATION"

    @Column(name = "lyric_content", columnDefinition = "TEXT", nullable = false)
    private String lyricContent;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        Instant now = Instant.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
        if (lyricType == null) lyricType = "CUSTOM";
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }
}
