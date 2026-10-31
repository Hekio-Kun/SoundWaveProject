package groupone.soundwaveproject.lyrics.repository;

import groupone.soundwaveproject.lyrics.entity.OfficialLyric;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface OfficialLyricRepository extends JpaRepository<OfficialLyric, Long> {
    Optional<OfficialLyric> findByTrackId(Long trackId);

    Optional<OfficialLyric> findByTrackIdAndStatus(Long trackId, String status);

    List<OfficialLyric> findByTrackIdIn(Collection<Long> trackIds);

    boolean existsByTrackId(Long trackId);

    void deleteByTrackId(Long trackId);

    @Query(value = "SELECT o FROM OfficialLyric o JOIN FETCH o.track t " +
            "WHERE o.status = 'PUBLISHED' " +
            "AND t.publicationStatus = groupone.soundwaveproject.catalog.entity.TrackPublicationStatus.PUBLISHED " +
            "AND (LOWER(o.lyricContent) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "     OR LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%')))",
            countQuery = "SELECT count(o) FROM OfficialLyric o JOIN o.track t " +
            "WHERE o.status = 'PUBLISHED' " +
            "AND t.publicationStatus = groupone.soundwaveproject.catalog.entity.TrackPublicationStatus.PUBLISHED " +
            "AND (LOWER(o.lyricContent) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "     OR LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<OfficialLyric> searchPublishedLyrics(
            @Param("keyword") String keyword,
            @Param("unaccentedKeyword") String unaccentedKeyword,
            @Param("slugKeyword") String slugKeyword,
            Pageable pageable
    );
}
