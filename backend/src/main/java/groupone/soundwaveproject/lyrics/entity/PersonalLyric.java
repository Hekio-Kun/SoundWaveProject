package groupone.soundwaveproject.lyrics.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity ánh xạ bảng personal_lyrics trong cơ sở dữ liệu SoundWave.
 * Quản lý lời bài hát cá nhân/tùy biến (Custom Lyrics / Personal Lyrics) do Listener tự biên soạn.
 */
@Entity
@Table(name = "personal_lyrics")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PersonalLyric {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "track_id", nullable = false)
    private Long trackId;

    @Column(name = "lyric_type", nullable = false, length = 20)
    @Builder.Default
    private String lyricType = "CUSTOM"; // CUSTOM, TRANSLATION

    @Column(name = "lyric_content", nullable = false, columnDefinition = "TEXT")
    private String lyricContent;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        if (updatedAt == null) {
            updatedAt = now;
        }
        if (lyricType == null || lyricType.isBlank()) {
            lyricType = "CUSTOM";
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
