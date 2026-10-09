package groupone.soundwaveproject.catalog.repository;

import groupone.soundwaveproject.catalog.entity.Album;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AlbumRepository extends JpaRepository<Album, Long> {
    List<Album> findByCreatedByUserIdOrderByCreatedAtDesc(Long createdByUserId);
    Optional<Album> findByIdAndCreatedByUserId(Long id, Long createdByUserId);
}
