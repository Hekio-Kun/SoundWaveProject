package groupone.soundwaveproject.catalog.dto.request;

import jakarta.validation.constraints.NotNull;

/**
 * DTO chứa thông tin yêu cầu thay đổi trạng thái kích hoạt / vô hiệu hóa thể loại (UC-26.4 Update Genre Status).
 *
 * @param active Trạng thái kích hoạt mới (true: kích hoạt, false: vô hiệu hóa)
 */
public record UpdateGenreStatusRequest(
        @NotNull(message = "Genre active status is required.")
        Boolean active
) {}
