package groupone.soundwaveproject.lyrics.repository;

import groupone.soundwaveproject.lyrics.entity.PersonalLyric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PersonalLyricRepository extends JpaRepository<PersonalLyric, Long> {
    List<PersonalLyric> findByUserIdAndTrackId(Long userId, Long trackId);

    Optional<PersonalLyric> findByUserIdAndTrackIdAndLyricType(Long userId, Long trackId, String lyricType);

    Optional<PersonalLyric> findByIdAndUserId(Long id, Long userId);

    void deleteByUserIdAndTrackIdAndLyricType(Long userId, Long trackId, String lyricType);

    void deleteByUserIdAndTrackId(Long userId, Long trackId);

    void deleteByTrackId(Long trackId);
}
