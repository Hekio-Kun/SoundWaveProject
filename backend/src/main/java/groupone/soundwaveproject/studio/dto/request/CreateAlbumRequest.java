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
 * DTO yêu cầu tạo Album mới (UC-21.1).
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateAlbumRequest {

    @NotBlank(message = "Album title is required.")
    @Size(max = 200, message = "Album title must not exceed 200 characters.")
    private String title;

    @Size(max = 2000, message = "Album description must not exceed 2000 characters.")
    private String description;

    private LocalDate releaseDate;

    /**
     * Danh sách ID các bài hát thuộc quyền sở hữu của người dùng muốn đưa vào Album.
     */
    private List<Long> trackIds;
}
