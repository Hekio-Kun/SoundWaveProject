package groupone.soundwaveproject.lyrics.repository;

import groupone.soundwaveproject.lyrics.entity.OfficialLyric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface OfficialLyricRepository extends JpaRepository<OfficialLyric, Long> {

    Optional<OfficialLyric> findByTrackId(Long trackId);

    Optional<OfficialLyric> findByTrackIdAndStatus(Long trackId, String status);

    boolean existsByTrackId(Long trackId);

    void deleteByTrackId(Long trackId);

    List<OfficialLyric> findByTrackIdIn(Collection<Long> trackIds);
}
