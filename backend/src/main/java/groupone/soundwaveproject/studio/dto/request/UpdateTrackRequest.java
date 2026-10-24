package groupone.soundwaveproject.studio.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * [FEATURE]: UC-19.3 Update A Track
 * DTO chứa thông tin cập nhật bài hát của Creator Studio.
 * 
 * Cho phép chỉnh sửa metadata (tiêu đề, thể loại, album, mô tả, lời bài hát),
 * tùy chọn nộp duyệt lại bài hát bị từ chối (AF02 resubmitForReview),
 * và ghi chú gửi cho Staff kiểm duyệt.
 */
public record UpdateTrackRequest(
        @NotBlank(message = "Track title is required")
        @Size(max = 200, message = "Track title cannot exceed 200 characters")
        String title,

        @NotNull(message = "Genre is required")
        Long genreId,

        Long albumId,

        Integer trackNumber,

        @Size(max = 2000, message = "Description cannot exceed 2000 characters")
        String description,

        Integer durationMs,

        String lyrics,

        Boolean resubmitForReview,

        String submitterNote
) {
    /**
     * Constructor tương thích ngược cho các luồng cập nhật cơ bản không kèm cờ nộp duyệt.
     */
    public UpdateTrackRequest(String title, Long genreId, Long albumId, Integer trackNumber, String description, Integer durationMs, String lyrics) {
        this(title, genreId, albumId, trackNumber, description, durationMs, lyrics, false, null);
    }
}

