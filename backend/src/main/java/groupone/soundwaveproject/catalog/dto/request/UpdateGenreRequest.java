package groupone.soundwaveproject.catalog.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * DTO chứa thông tin yêu cầu cập nhật thể loại âm nhạc (UC-26.3 Update Genre).
 *
 * @param name        Tên thể loại âm nhạc cập nhật (bắt buộc, tối đa 100 ký tự)
 * @param slug        Đường dẫn thân thiện (slug) cập nhật (tùy chọn, tối đa 100 ký tự)
 * @param description Mô tả chi tiết cập nhật (tối đa 1000 ký tự)
 */
public record UpdateGenreRequest(
        @NotBlank(message = "Genre name is required.")
        @Size(max = 100, message = "Genre name must not exceed 100 characters.")
        String name,

        @Size(max = 100, message = "Genre slug must not exceed 100 characters.")
        @Pattern(regexp = "^$|^[a-z0-9]+(?:-[a-z0-9]+)*$",
                message = "Genre slug may contain only lowercase letters, numbers, and hyphens.")
        String slug,

        @Size(max = 1000, message = "Genre description must not exceed 1000 characters.")
        String description
) {}
