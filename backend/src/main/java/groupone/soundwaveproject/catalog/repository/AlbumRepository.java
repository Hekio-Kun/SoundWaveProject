package groupone.soundwaveproject.catalog.repository;

import groupone.soundwaveproject.catalog.entity.Album;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AlbumRepository extends JpaRepository<Album, Long> {
    Optional<Album> findBySlug(String slug);
    Optional<Album> findByIdAndStatusIgnoreCase(Long id, String status);
    Optional<Album> findBySlugAndStatusIgnoreCase(String slug, String status);
    List<Album> findByStatusIgnoreCaseOrderByCreatedAtDesc(String status);
    List<Album> findByCreatedByUserIdOrderByCreatedAtDesc(Long createdByUserId);
    Optional<Album> findByIdAndCreatedByUserId(Long id, Long createdByUserId);
    long countByCreatedByUserId(Long createdByUserId);
    boolean existsByCreatedByUserIdAndTitleIgnoreCase(Long createdByUserId, String title);
    boolean existsByCreatedByUserIdAndTitleIgnoreCaseAndIdNot(Long createdByUserId, String title, Long id);
    boolean existsBySlug(String slug);

    /**
     * Highly optimized SQL search for published albums matching keyword in title, slug, or description.
     * Orders by creation date descending.
     *
     * @param keyword Search keyword.
     * @param pageable Pagination settings.
     * @return Paginated {@link Page} of matching published {@link Album} entities.
     */
    @Query(value = """
        SELECT a FROM Album a
        WHERE LOWER(a.status) = 'published'
          AND (
              LOWER(a.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
              OR LOWER(a.slug) LIKE LOWER(CONCAT('%', :keyword, '%'))
              OR LOWER(a.slug) LIKE LOWER(CONCAT('%', :slugKeyword, '%'))
              OR REPLACE(LOWER(a.slug), '-', ' ') LIKE LOWER(CONCAT('%', :unaccentedKeyword, '%'))
              OR LOWER(a.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
          )
        ORDER BY a.createdAt DESC
    """, countQuery = """
        SELECT COUNT(a) FROM Album a
        WHERE LOWER(a.status) = 'published'
          AND (
              LOWER(a.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
              OR LOWER(a.slug) LIKE LOWER(CONCAT('%', :keyword, '%'))
              OR LOWER(a.slug) LIKE LOWER(CONCAT('%', :slugKeyword, '%'))
              OR REPLACE(LOWER(a.slug), '-', ' ') LIKE LOWER(CONCAT('%', :unaccentedKeyword, '%'))
              OR LOWER(a.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
          )
    """)
    Page<Album> searchPublishedAlbums(
            @Param("keyword") String keyword,
            @Param("unaccentedKeyword") String unaccentedKeyword,
            @Param("slugKeyword") String slugKeyword,
            Pageable pageable
    );
}
