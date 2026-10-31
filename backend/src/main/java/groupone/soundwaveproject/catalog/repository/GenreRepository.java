package groupone.soundwaveproject.catalog.repository;

import groupone.soundwaveproject.catalog.entity.Genre;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Locale;
import java.util.Optional;

/**
 * Repository interface for music genres (genres table).
 * Serves public catalog browsing and Admin genre management.
 */
public interface GenreRepository extends JpaRepository<Genre, Long> {
    Optional<Genre> findBySlug(String slug);
    List<Genre> findByIsActiveTrue();
    List<Genre> findByIsActiveTrueOrderByNameAsc();

    /**
     * Finds a genre by its ID if it is currently active.
     *
     * @param id Genre ID
     * @return Optional containing the genre if found and active
     */
    Optional<Genre> findByIdAndIsActiveTrue(Long id);

    /**
     * Finds a genre by its slug case-insensitively.
     *
     * @param slug Genre slug
     * @return Optional containing the genre if found
     */
    Optional<Genre> findBySlugIgnoreCase(String slug);

    /**
     * Finds a genre by its slug case-insensitively and if active.
     *
     * @param slug Genre slug
     * @return Optional containing the genre if found and active
     */
    Optional<Genre> findBySlugIgnoreCaseAndIsActiveTrue(String slug);

    /**
     * Checks if a genre name exists case-insensitively.
     *
     * @param name Genre name to check
     * @return true if the name already exists
     */
    boolean existsByNameIgnoreCase(String name);

    /**
     * Checks if a genre slug exists case-insensitively.
     *
     * @param slug Genre slug to check
     * @return true if the slug already exists
     */
    boolean existsBySlugIgnoreCase(String slug);

    /**
     * Checks if a genre name exists for another record excluding the given ID.
     *
     * @param name Genre name to check
     * @param id   ID of the genre being updated
     * @return true if the name conflicts with another genre
     */
    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);

    /**
     * Checks if a genre slug exists for another record excluding the given ID.
     *
     * @param slug Genre slug to check
     * @param id   ID of the genre being updated
     * @return true if the slug conflicts with another genre
     */
    boolean existsBySlugIgnoreCaseAndIdNot(String slug, Long id);

    /**
     * Filters genres by active status with pagination.
     *
     * @param active   Active status (true or false)
     * @param pageable Pagination and sorting configuration
     * @return Page of matching genres
     */
    Page<Genre> findByIsActive(Boolean active, Pageable pageable);

    /**
     * Searches genres matching keyword in name or slug with pagination.
     *
     * @param search   Search keyword
     * @param pageable Pagination and sorting configuration
     * @return Page of matching genres
     */
    @Query("SELECT g FROM Genre g WHERE LOWER(g.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(g.slug) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Genre> searchByKeyword(@Param("search") String search, Pageable pageable);

    /**
     * Searches genres matching both active status and keyword with pagination.
     *
     * @param active   Active status
     * @param search   Search keyword
     * @param pageable Pagination and sorting configuration
     * @return Page of matching genres
     */
    @Query("SELECT g FROM Genre g WHERE g.isActive = :active AND (LOWER(g.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(g.slug) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Genre> searchByActiveAndKeyword(@Param("active") Boolean active, @Param("search") String search, Pageable pageable);

    /**
     * Dispatches search and pagination queries optimized for database execution.
     *
     * @param search   Search keyword (nullable)
     * @param pageable Pagination and sorting configuration
     * @return Page of administrator genres
     */
    default Page<Genre> searchForAdmin(String search, Pageable pageable) {
        boolean hasSearch = search != null && !search.trim().isBlank();
        String keyword = hasSearch ? search.trim().toLowerCase(Locale.ROOT) : null;
        if (hasSearch) {
            return searchByKeyword(keyword, pageable);
        } else {
            return findAll(pageable);
        }
    }
}
