package groupone.soundwaveproject.catalog.repository;

import groupone.soundwaveproject.catalog.entity.Genre;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GenreRepository extends JpaRepository<Genre, Long> {
    Optional<Genre> findBySlug(String slug);
    List<Genre> findByIsActiveTrue();
    List<Genre> findByIsActiveTrueOrderByNameAsc();
}
