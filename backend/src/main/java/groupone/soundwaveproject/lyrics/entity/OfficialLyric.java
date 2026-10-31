package groupone.soundwaveproject.lyrics.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity ánh xạ bảng official_lyrics trong cơ sở dữ liệu SoundWave.
 * Quản lý lời bài hát chính thức (Official Lyrics) do Creator hoặc Staff khởi tạo/cập nhật.
 */
@Entity
@Table(name = "official_lyrics")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OfficialLyric {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "track_id", nullable = false, unique = true)
    private Long trackId;

    @Column(name = "lyric_content", nullable = false, columnDefinition = "TEXT")
    private String lyricContent;

    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private String status = "DRAFT"; // DRAFT, PUBLISHED

    @Column(name = "created_by_user_id", nullable = false)
    private Long createdByUserId;

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
        if (status == null || status.isBlank()) {
            status = "DRAFT";
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
