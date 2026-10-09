package groupone.soundwaveproject.catalog.repository;

import groupone.soundwaveproject.catalog.entity.Genre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GenreRepository extends JpaRepository<Genre, Long> {
    List<Genre> findByIsActiveTrueOrderByNameAsc();
    Optional<Genre> findBySlug(String slug);
    boolean existsByNameIgnoreCase(String name);
    boolean existsBySlugIgnoreCase(String slug);
}
