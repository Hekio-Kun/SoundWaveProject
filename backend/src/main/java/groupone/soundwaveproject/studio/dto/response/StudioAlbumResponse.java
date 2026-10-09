package groupone.soundwaveproject.studio.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO phản hồi thông tin chi tiết Album cho Content Studio (UC-21.2).
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudioAlbumResponse {
    private Long id;
    private String title;
    private String slug;
    private String description;
    private String status;
    private String coverUrl;
    private LocalDate releaseDate;
    private int trackCount;
    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<StudioTrackResponse> tracks;
}
