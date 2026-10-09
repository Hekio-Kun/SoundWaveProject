package groupone.soundwaveproject.studio.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

/**
 * DTO yêu cầu cập nhật thông tin và danh sách bài hát của Album (UC-21.3).
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateAlbumRequest {

    @NotBlank(message = "Album title is required.")
    @Size(max = 200, message = "Album title must not exceed 200 characters.")
    private String title;

    @Size(max = 2000, message = "Album description must not exceed 2000 characters.")
    private String description;

    private LocalDate releaseDate;

    /**
     * Danh sách ID các bài hát cập nhật trong Album (theo thứ tự track number mới).
     */
    private List<Long> trackIds;
}
