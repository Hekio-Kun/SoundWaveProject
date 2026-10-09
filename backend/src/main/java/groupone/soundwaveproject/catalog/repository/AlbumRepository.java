package groupone.soundwaveproject.catalog.repository;

import groupone.soundwaveproject.catalog.entity.Album;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AlbumRepository extends JpaRepository<Album, Long> {
    Optional<Album> findBySlug(String slug);
    List<Album> findByCreatedByUserIdOrderByCreatedAtDesc(Long createdByUserId);
    Optional<Album> findByIdAndCreatedByUserId(Long id, Long createdByUserId);
    long countByCreatedByUserId(Long createdByUserId);
    boolean existsByCreatedByUserIdAndTitleIgnoreCase(Long createdByUserId, String title);
    boolean existsByCreatedByUserIdAndTitleIgnoreCaseAndIdNot(Long createdByUserId, String title, Long id);
    boolean existsBySlug(String slug);
}
