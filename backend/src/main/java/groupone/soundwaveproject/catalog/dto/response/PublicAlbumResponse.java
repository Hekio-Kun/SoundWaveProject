package groupone.soundwaveproject.catalog.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO phản hồi thông tin Album đã xuất bản dành cho trang danh mục công khai (Public Albums).
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicAlbumResponse {
    private Long id;
    private String title;
    private String slug;
    private String description;
    private String coverUrl;
    private LocalDate releaseDate;
    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;
    private int trackCount;
    private AlbumCreatorSummary creator;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AlbumCreatorSummary {
        private Long userId;
        private String displayName;
        private String avatarUrl;
    }
}
