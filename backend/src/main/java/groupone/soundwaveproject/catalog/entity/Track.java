package groupone.soundwaveproject.catalog.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

@Entity
@Table(name = "tracks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Track {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "uploader_user_id", nullable = false)
    private Long uploaderUserId;

    @Column(name = "album_id")
    private Long albumId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "album_id", insertable = false, updatable = false)
    private Album album;

    @Column(name = "genre_id", nullable = false)
    private Long genreId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "genre_id", insertable = false, updatable = false)
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
    @Builder.Default
    private PublicationStatus publicationStatus = PublicationStatus.DRAFT;

    @Column(name = "approved_at")
    private Instant approvedAt;

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

    @Column(name = "play_count_cache", nullable = false)
    @Builder.Default
    private Long playCountCache = 0L;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
