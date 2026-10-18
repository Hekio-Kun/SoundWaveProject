package groupone.soundwaveproject.catalog.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO chi tiết Album công khai kèm toàn bộ bài hát cấu thành đã được phê duyệt xuất bản.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicAlbumDetailsResponse {
    private Long id;
    private String title;
    private String slug;
    private String description;
    private String coverUrl;
    private LocalDate releaseDate;
    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;
    private int trackCount;
    private PublicAlbumResponse.AlbumCreatorSummary creator;
    private List<TrackResponse> tracks;
}
