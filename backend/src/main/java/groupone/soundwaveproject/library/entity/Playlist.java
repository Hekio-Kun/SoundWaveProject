package groupone.soundwaveproject.library.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@Entity
@Table(name = "playlists")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class Playlist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "owner_user_id", nullable = false)
    private Long ownerUserId;

    @Column(name = "created_by_user_id", nullable = false)
    private Long createdByUserId;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(nullable = false, unique = true, length = 180)
    private String slug;

    @Column(length = 2000)
    private String description;

    @Column(name = "cover_url", length = 2048)
    private String coverUrl;

    @Column(name = "cover_public_id", length = 255)
    private String coverPublicId;

    @Column(name = "visibility", nullable = false, length = 30)
    private String visibility;

    @Builder.Default
    @Column(name = "is_private", nullable = false)
    private boolean isPrivate = true;

    @Builder.Default
    @OneToMany(mappedBy = "playlist", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position ASC")
    private List<PlaylistTrack> playlistTracks = new ArrayList<>();

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Playlist(Long userId, String title, String slug, String description, String coverUrl, boolean isPrivate) {
        this.ownerUserId = userId;
        this.createdByUserId = userId;
        this.title = title;
        this.name = title;
        this.slug = slug;
        this.description = description;
        this.coverUrl = coverUrl;
        this.visibility = isPrivate ? "PRIVATE" : "PUBLIC";
        this.isPrivate = isPrivate;
        this.playlistTracks = new ArrayList<>();
    }

    @PrePersist
    void initializeTimestamps() {
        LocalDateTime now = LocalDateTime.now(ZoneOffset.UTC);
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
    }

    @PreUpdate
    void updateTimestamp() {
        updatedAt = LocalDateTime.now(ZoneOffset.UTC);
    }
}
