package groupone.soundwaveproject.catalog.dto.response;

import org.springframework.data.domain.Page;

import java.util.List;

/**
 * Paginated response DTO of genres for the administrator management view.
 *
 * @param content       List of genres on the current page
 * @param totalElements Total number of genres matching filter criteria
 * @param totalPages    Total number of pages
 * @param size          Page size
 * @param number        Current page index (0-indexed)
 * @param first         Whether this is the first page
 * @param last          Whether this is the last page
 */
public record AdminGenrePageResponse(
        List<AdminGenreResponse> content,
        long totalElements,
        int totalPages,
        int size,
        int number,
        boolean first,
        boolean last
) {
    /**
     * Converts a Spring Data JPA Page object into an AdminGenrePageResponse DTO.
     *
     * @param page Spring Data pagination object
     * @return Corresponding AdminGenrePageResponse DTO
     */
    public static AdminGenrePageResponse from(Page<AdminGenreResponse> page) {
        return new AdminGenrePageResponse(
                List.copyOf(page.getContent()),
                page.getTotalElements(),
                page.getTotalPages(),
                page.getSize(),
                page.getNumber(),
                page.isFirst(),
                page.isLast()
        );
    }
}
