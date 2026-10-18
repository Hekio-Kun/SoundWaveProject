package groupone.soundwaveproject.library.repository;

import groupone.soundwaveproject.library.entity.ListeningHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ListeningHistoryRepository extends JpaRepository<ListeningHistory, Long> {
    List<ListeningHistory> findByUserIdOrderByPlayedAtDesc(Long userId, Pageable pageable);

    List<ListeningHistory> findByUserIdAndTrackIdOrderByPlayedAtDesc(Long userId, Long trackId);

    @Query(value = "SELECT lh FROM ListeningHistory lh JOIN FETCH lh.track t WHERE lh.userId = :userId AND t.publicationStatus = groupone.soundwaveproject.catalog.entity.TrackPublicationStatus.PUBLISHED ORDER BY lh.playedAt DESC",
           countQuery = "SELECT count(lh) FROM ListeningHistory lh JOIN lh.track t WHERE lh.userId = :userId AND t.publicationStatus = groupone.soundwaveproject.catalog.entity.TrackPublicationStatus.PUBLISHED")
    Page<ListeningHistory> findPublishedHistoryByUserId(@Param("userId") Long userId, Pageable pageable);

    @Modifying
    @Query("DELETE FROM ListeningHistory lh WHERE lh.id = :id AND lh.userId = :userId")
    int deleteByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);

    @Modifying
    @Query("DELETE FROM ListeningHistory lh WHERE lh.userId = :userId")
    void deleteByUserId(@Param("userId") Long userId);

    @Modifying
    @Query("DELETE FROM ListeningHistory lh WHERE lh.trackId = :trackId")
    void deleteByTrackId(@Param("trackId") Long trackId);
}
