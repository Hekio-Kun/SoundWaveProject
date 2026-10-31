package groupone.soundwaveproject.lyrics.repository;

import groupone.soundwaveproject.lyrics.entity.PersonalLyric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PersonalLyricRepository extends JpaRepository<PersonalLyric, Long> {

    Optional<PersonalLyric> findByUserIdAndTrackIdAndLyricType(Long userId, Long trackId, String lyricType);

    Optional<PersonalLyric> findFirstByUserIdAndTrackIdOrderByUpdatedAtDesc(Long userId, Long trackId);

    List<PersonalLyric> findByUserIdAndTrackIdOrderByCreatedAtAsc(Long userId, Long trackId);

    List<PersonalLyric> findByTrackId(Long trackId);

    boolean existsByUserIdAndTrackIdAndLyricType(Long userId, Long trackId, String lyricType);

    void deleteByUserIdAndTrackIdAndLyricType(Long userId, Long trackId, String lyricType);

    void deleteByTrackId(Long trackId);
}
