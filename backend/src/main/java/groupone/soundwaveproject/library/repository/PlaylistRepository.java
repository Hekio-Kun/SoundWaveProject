package groupone.soundwaveproject.library.repository;

import groupone.soundwaveproject.library.entity.Playlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlaylistRepository extends JpaRepository<Playlist, Long> {

    List<Playlist> findByCreatedByUserIdOrderByCreatedAtDesc(Long createdByUserId);

    List<Playlist> findByIsPrivateFalseOrderByCreatedAtDesc();

    Optional<Playlist> findByIdAndCreatedByUserId(Long id, Long createdByUserId);

    Optional<Playlist> findBySlug(String slug);

    boolean existsBySlug(String slug);

    boolean existsByCreatedByUserIdAndTitleIgnoreCase(Long createdByUserId, String title);

    boolean existsByCreatedByUserIdAndTitleIgnoreCaseAndIdNot(Long createdByUserId, String title, Long id);

    long countByCreatedByUserId(Long createdByUserId);
}
