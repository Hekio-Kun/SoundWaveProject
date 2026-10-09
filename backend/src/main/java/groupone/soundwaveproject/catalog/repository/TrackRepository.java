package groupone.soundwaveproject.catalog.repository;

import groupone.soundwaveproject.catalog.entity.PublicationStatus;
import groupone.soundwaveproject.catalog.entity.Track;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TrackRepository extends JpaRepository<Track, Long> {
    List<Track> findByUploaderUserIdOrderByCreatedAtDesc(Long uploaderUserId);
    List<Track> findByUploaderUserIdAndPublicationStatusOrderByCreatedAtDesc(Long uploaderUserId, PublicationStatus publicationStatus);
    Optional<Track> findByIdAndUploaderUserId(Long id, Long uploaderUserId);
    Optional<Track> findBySlug(String slug);
    boolean existsBySlug(String slug);
    long countByUploaderUserId(Long uploaderUserId);
    long countByUploaderUserIdAndPublicationStatus(Long uploaderUserId, PublicationStatus publicationStatus);
    boolean existsByGenreId(Long genreId);
    boolean existsByAlbumId(Long albumId);
}
