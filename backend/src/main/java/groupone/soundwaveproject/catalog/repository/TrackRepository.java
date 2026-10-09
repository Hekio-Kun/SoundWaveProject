package groupone.soundwaveproject.catalog.repository;

import groupone.soundwaveproject.catalog.entity.Track;
import groupone.soundwaveproject.catalog.entity.TrackPublicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface TrackRepository extends JpaRepository<Track, Long> {
    Optional<Track> findByIdAndPublicationStatus(Long id, TrackPublicationStatus publicationStatus);

    Optional<Track> findBySlugAndPublicationStatus(String slug, TrackPublicationStatus publicationStatus);

    Page<Track> findByPublicationStatus(TrackPublicationStatus publicationStatus, Pageable pageable);

    @Modifying
    @Query("UPDATE Track t SET t.playCountCache = t.playCountCache + 1 WHERE t.id = :id")
    void incrementPlayCount(@Param("id") Long id);

    @Query("SELECT t.playCountCache FROM Track t WHERE t.id = :id")
    Optional<Long> getPlayCountById(@Param("id") Long id);
}
