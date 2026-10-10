package groupone.soundwaveproject.library.repository;

import groupone.soundwaveproject.library.entity.PlaylistTrack;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlaylistTrackRepository extends JpaRepository<PlaylistTrack, Long> {

    List<PlaylistTrack> findByPlaylist_IdOrderByPositionAsc(Long playlistId);

    Optional<PlaylistTrack> findByPlaylist_IdAndTrack_Id(Long playlistId, Long trackId);

    boolean existsByPlaylist_IdAndTrack_Id(Long playlistId, Long trackId);

    long countByPlaylist_Id(Long playlistId);

    @Modifying
    @Query("DELETE FROM PlaylistTrack pt WHERE pt.playlist.id = :playlistId")
    void deleteByPlaylist_Id(@Param("playlistId") Long playlistId);

    @Modifying
    @Query("DELETE FROM PlaylistTrack pt WHERE pt.playlist.id = :playlistId AND pt.track.id = :trackId")
    void deleteByPlaylist_IdAndTrack_Id(@Param("playlistId") Long playlistId, @Param("trackId") Long trackId);
}
