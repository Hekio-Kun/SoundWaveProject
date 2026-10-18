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
     * True nếu người dùng chọn "Submit Album for Review" (chuyển sang PENDING).
     * False hoặc null nếu người dùng chọn "Save as Draft" (giữ trạng thái DRAFT).
     */
    private Boolean submitForReview;

    /**
     * Danh sách thông tin chi tiết từng bài hát cấu thành khi upload toàn bộ bài hát cùng album (UC-21.1).
     */
    private List<AlbumTrackItemRequest> tracks;

    /**
     * Danh sách ID các bài hát đã có sẵn trong studio muốn đưa vào Album (hỗ trợ tương thích ngược).
     */
    private List<Long> trackIds;
}

