package groupone.soundwaveproject.catalog.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Getter
@Entity
@Table(name = "tracks")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Track {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "uploader_user_id", nullable = false)
    private Long uploaderUserId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "album_id")
    private Album album;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "genre_id", nullable = false)
    private Genre genre;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, unique = true, length = 220)
    private String slug;

    @Column(length = 2000)
    private String description;

    @Column(name = "track_number")
    private Integer trackNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "publication_status", nullable = false, length = 30)
    private TrackPublicationStatus publicationStatus = TrackPublicationStatus.DRAFT;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "latest_rejection_reason", length = 1000)
    private String latestRejectionReason;

    @Column(name = "audio_public_id", nullable = false, length = 255)
    private String audioPublicId;

    @Column(name = "audio_url", nullable = false, length = 2048)
    private String audioUrl;

    @Column(name = "audio_format", nullable = false, length = 20)
    private String audioFormat;

    @Column(name = "duration_ms", nullable = false)
    private Integer durationMs;

    @Column(name = "cover_public_id", length = 255)
    private String coverPublicId;

    @Column(name = "cover_url", length = 2048)
    private String coverUrl;

    @Setter
    @Column(name = "play_count_cache", nullable = false)
    private Long playCountCache = 0L;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Track(Long uploaderUserId,
                 Genre genre,
                 Album album,
                 String title,
                 String slug,
                 String description,
                 String audioPublicId,
                 String audioUrl,
                 String audioFormat,
                 Integer durationMs,
                 String coverPublicId,
                 String coverUrl,
                 TrackPublicationStatus publicationStatus) {
        this.uploaderUserId = uploaderUserId;
        this.genre = genre;
        this.album = album;
        this.title = title;
        this.slug = slug;
        this.description = description;
        this.audioPublicId = audioPublicId;
        this.audioUrl = audioUrl;
        this.audioFormat = audioFormat;
        this.durationMs = durationMs;
        this.coverPublicId = coverPublicId;
        this.coverUrl = coverUrl;
        this.publicationStatus = publicationStatus != null ? publicationStatus : TrackPublicationStatus.DRAFT;
        this.playCountCache = 0L;
    }

    public void incrementPlayCount() {
        if (this.playCountCache == null) {
            this.playCountCache = 1L;
        } else {
            this.playCountCache++;
        }
    }

    @PrePersist
    void initializeTimestamps() {
        LocalDateTime now = LocalDateTime.now(ZoneOffset.UTC);
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
        if (playCountCache == null) playCountCache = 0L;
        if (publicationStatus == null) publicationStatus = TrackPublicationStatus.DRAFT;
    }

    @PreUpdate
    void updateTimestamp() {
        updatedAt = LocalDateTime.now(ZoneOffset.UTC);
    }
}
