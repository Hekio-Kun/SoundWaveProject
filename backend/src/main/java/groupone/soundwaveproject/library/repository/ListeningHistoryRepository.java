package groupone.soundwaveproject.library.repository;

import groupone.soundwaveproject.library.entity.ListeningHistory;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ListeningHistoryRepository extends JpaRepository<ListeningHistory, Long> {
    List<ListeningHistory> findByUserIdOrderByPlayedAtDesc(Long userId, Pageable pageable);

    @Modifying
    @Query("DELETE FROM ListeningHistory lh WHERE lh.trackId = :trackId")
    void deleteByTrackId(@Param("trackId") Long trackId);
}
