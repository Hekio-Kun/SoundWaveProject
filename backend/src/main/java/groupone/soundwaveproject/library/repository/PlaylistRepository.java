package groupone.soundwaveproject.library.repository;

import groupone.soundwaveproject.library.entity.Playlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlaylistRepository extends JpaRepository<Playlist, Long> {

    List<Playlist> findByOwnerUserIdOrderByCreatedAtDesc(Long ownerUserId);

    List<Playlist> findByCreatedByUserIdOrderByCreatedAtDesc(Long createdByUserId);

    List<Playlist> findByVisibilityIgnoreCaseOrderByCreatedAtDesc(String visibility);

    List<Playlist> findByIsPrivateFalseOrderByCreatedAtDesc();

    Optional<Playlist> findByIdAndOwnerUserId(Long id, Long ownerUserId);

    Optional<Playlist> findByIdAndCreatedByUserId(Long id, Long createdByUserId);

    Optional<Playlist> findBySlug(String slug);

    boolean existsBySlug(String slug);

    boolean existsByOwnerUserIdAndNameIgnoreCase(Long ownerUserId, String name);

    boolean existsByCreatedByUserIdAndTitleIgnoreCase(Long createdByUserId, String title);

    boolean existsByOwnerUserIdAndNameIgnoreCaseAndIdNot(Long ownerUserId, String name, Long id);

    boolean existsByCreatedByUserIdAndTitleIgnoreCaseAndIdNot(Long createdByUserId, String title, Long id);

    long countByOwnerUserId(Long ownerUserId);

    long countByCreatedByUserId(Long createdByUserId);
}
