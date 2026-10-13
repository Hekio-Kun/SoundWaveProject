package groupone.soundwaveproject.catalog.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Getter
@Setter
@Builder
@Entity
@Table(name = "genres")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class Genre {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 100)
    private String slug;

    @Column(length = 1000)
    private String description;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "created_by_user_id")
    private Long createdByUserId;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Genre(String name, String slug, String description, Long createdByUserId) {
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.createdByUserId = createdByUserId;
        this.isActive = true;
    }

    /**
     * Kiểm tra thể loại có đang ở trạng thái hoạt động hay không (UC-26: Manage Genres).
     *
     * @return true nếu thể loại đang kích hoạt, ngược lại false
     */
    public boolean isActive() {
        return Boolean.TRUE.equals(this.isActive);
    }

    /**
     * Cập nhật thông tin cơ bản của thể loại nhạc (UC-26.3 Update Genre).
     *
     * @param name        Tên mới của thể loại
     * @param slug        Đường dẫn thân thiện (slug) mới của thể loại
     * @param description Mô tả mới của thể loại
     * @param updatedAt   Thời điểm cập nhật
     */
    public void update(String name, String slug, String description, LocalDateTime updatedAt) {
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.updatedAt = updatedAt;
    }

    /**
     * Thay đổi trạng thái kích hoạt / vô hiệu hóa của thể loại nhạc (UC-26.4 / BR-23 Update Genre Status).
     *
     * @param active    Trạng thái mới (true: kích hoạt, false: vô hiệu hóa)
     * @param updatedAt Thời điểm cập nhật
     */
    public void changeActiveState(boolean active, LocalDateTime updatedAt) {
        this.isActive = active;
        this.updatedAt = updatedAt;
    }

    @PrePersist
    void initializeTimestamps() {
        LocalDateTime now = LocalDateTime.now(ZoneOffset.UTC);
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
        if (isActive == null) isActive = true;
    }

    @PreUpdate
    void updateTimestamp() {
        updatedAt = LocalDateTime.now(ZoneOffset.UTC);
    }
}
