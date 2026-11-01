package groupone.soundwaveproject.catalog.repository;

import groupone.soundwaveproject.catalog.entity.Track;
import groupone.soundwaveproject.catalog.entity.TrackPublicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TrackRepository extends JpaRepository<Track, Long> {
    Optional<Track> findByIdAndPublicationStatus(Long id, TrackPublicationStatus publicationStatus);

    Optional<Track> findBySlugAndPublicationStatus(String slug, TrackPublicationStatus publicationStatus);

    Page<Track> findByPublicationStatus(TrackPublicationStatus publicationStatus, Pageable pageable);

    Page<Track> findByPublicationStatusAndTitleContainingIgnoreCase(TrackPublicationStatus publicationStatus, String title, Pageable pageable);

    Optional<Track> findBySlug(String slug);

    List<Track> findByUploaderUserIdOrderByCreatedAtDesc(Long uploaderUserId);

    List<Track> findByUploaderUserIdAndPublicationStatusOrderByCreatedAtDesc(Long uploaderUserId, TrackPublicationStatus publicationStatus);

    List<Track> findByUploaderUserIdAndPublicationStatusNotOrderByCreatedAtDesc(Long uploaderUserId, TrackPublicationStatus publicationStatus);

    Optional<Track> findByIdAndUploaderUserId(Long id, Long uploaderUserId);

    long countByUploaderUserId(Long uploaderUserId);

    long countByUploaderUserIdAndPublicationStatus(Long uploaderUserId, TrackPublicationStatus publicationStatus);

    boolean existsBySlug(String slug);

    boolean existsByGenre_Id(Long genreId);

    boolean existsByAlbum_Id(Long albumId);

    List<Track> findByAlbum_IdOrderByTrackNumberAsc(Long albumId);

    List<Track> findByAlbum_IdAndPublicationStatusOrderByTrackNumberAsc(Long albumId, TrackPublicationStatus publicationStatus);

    List<Track> findByTitleContainingIgnoreCase(String title);

    long countByAlbum_Id(Long albumId);

    long countByAlbum_IdAndPublicationStatus(Long albumId, TrackPublicationStatus publicationStatus);

    boolean existsByAlbum_IdAndPublicationStatus(Long albumId, TrackPublicationStatus publicationStatus);

    List<Track> findByUploaderUserIdAndAlbumIsNullOrderByCreatedAtDesc(Long uploaderUserId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Track t SET t.album = null, t.trackNumber = null, t.updatedAt = CURRENT_TIMESTAMP WHERE t.album.id = :albumId AND t.uploaderUserId = :userId")
    void unlinkAlbumFromTracks(@Param("albumId") Long albumId, @Param("userId") Long userId);

    /**
     * Atomically increments the cached play count for the given track ID.
     *
     * @param id Identifier of the track to increment.
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Track t SET t.playCountCache = COALESCE(t.playCountCache, 0) + 1 WHERE t.id = :id")
    void incrementPlayCount(@Param("id") Long id);

    /**
     * Retrieves the current cached play count for the given track ID.
     *
     * @param id Identifier of the track.
     * @return {@link Optional} containing play count if found.
     */
    @Query("SELECT t.playCountCache FROM Track t WHERE t.id = :id")
    Optional<Long> getPlayCountById(@Param("id") Long id);

    /**
     * Highly optimized SQL search for published tracks matching keyword in title, slug, description, or album title.
     * Orders by play count and creation date.
     *
     * @param keyword Search keyword.
     * @param pageable Pagination settings.
     * @return Paginated {@link Page} of matching published {@link Track} entities.
     */
    @Query(value = """
        SELECT t FROM Track t
        LEFT JOIN t.album a
        WHERE t.publicationStatus = groupone.soundwaveproject.catalog.entity.TrackPublicationStatus.PUBLISHED
          AND (
              LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
              OR LOWER(t.slug) LIKE LOWER(CONCAT('%', :keyword, '%'))
              OR LOWER(t.slug) LIKE LOWER(CONCAT('%', :slugKeyword, '%'))
              OR REPLACE(LOWER(t.slug), '-', ' ') LIKE LOWER(CONCAT('%', :unaccentedKeyword, '%'))
              OR LOWER(t.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
              OR (a IS NOT NULL AND (
                  LOWER(a.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
                  OR LOWER(a.slug) LIKE LOWER(CONCAT('%', :keyword, '%'))
                  OR LOWER(a.slug) LIKE LOWER(CONCAT('%', :slugKeyword, '%'))
                  OR REPLACE(LOWER(a.slug), '-', ' ') LIKE LOWER(CONCAT('%', :unaccentedKeyword, '%'))
              ))
          )
        ORDER BY COALESCE(t.playCountCache, 0L) DESC, t.createdAt DESC
    """, countQuery = """
        SELECT COUNT(t) FROM Track t
        LEFT JOIN t.album a
        WHERE t.publicationStatus = groupone.soundwaveproject.catalog.entity.TrackPublicationStatus.PUBLISHED
          AND (
              LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
              OR LOWER(t.slug) LIKE LOWER(CONCAT('%', :keyword, '%'))
              OR LOWER(t.slug) LIKE LOWER(CONCAT('%', :slugKeyword, '%'))
              OR REPLACE(LOWER(t.slug), '-', ' ') LIKE LOWER(CONCAT('%', :unaccentedKeyword, '%'))
              OR LOWER(t.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
              OR (a IS NOT NULL AND (
                  LOWER(a.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
                  OR LOWER(a.slug) LIKE LOWER(CONCAT('%', :keyword, '%'))
                  OR LOWER(a.slug) LIKE LOWER(CONCAT('%', :slugKeyword, '%'))
                  OR REPLACE(LOWER(a.slug), '-', ' ') LIKE LOWER(CONCAT('%', :unaccentedKeyword, '%'))
              ))
          )
    """)
    Page<Track> searchPublishedTracks(
            @Param("keyword") String keyword,
            @Param("unaccentedKeyword") String unaccentedKeyword,
            @Param("slugKeyword") String slugKeyword,
            Pageable pageable
    );
}
