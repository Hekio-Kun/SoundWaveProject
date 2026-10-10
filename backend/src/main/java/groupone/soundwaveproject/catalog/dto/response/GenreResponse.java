package groupone.soundwaveproject.catalog.dto.response;

/**
 * DTO trả về danh mục thể loại công khai phục vụ Filter Public Catalog (UC-8 Phase 1).
 */
public record GenreResponse(
        Long id,
        String name,
        String slug,
        String description
) {}
