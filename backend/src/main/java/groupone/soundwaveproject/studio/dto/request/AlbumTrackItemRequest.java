package groupone.soundwaveproject.studio.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO mô tả thông tin metadata của một bài hát cấu thành album khi upload theo lượt (UC-21.1).
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlbumTrackItemRequest {

    @NotBlank(message = "Track title is required.")
    @Size(max = 200, message = "Track title must not exceed 200 characters.")
    private String title;

    @NotNull(message = "Genre is required.")
    private Long genreId;

    private Integer trackNumber;

    @Size(max = 2000, message = "Track description must not exceed 2000 characters.")
    private String description;

    private String lyrics;

    private Integer durationMs;

    /**
     * Vị trí chỉ mục của file âm thanh trong danh sách audioFiles (0-indexed).
     * Nếu không truyền, mặc định sẽ ánh xạ theo đúng thứ tự mảng.
     */
    private Integer audioIndex;
}
