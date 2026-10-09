package groupone.soundwaveproject.catalog.repository;

import groupone.soundwaveproject.catalog.entity.Album;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AlbumRepository extends JpaRepository<Album, Long> {
    Optional<Album> findBySlug(String slug);
}
