package groupone.soundwaveproject.library.repository;

import groupone.soundwaveproject.library.entity.Favorite;
import groupone.soundwaveproject.library.entity.FavoriteId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository truy xuất dữ liệu bài hát yêu thích từ bảng favorites.
 */
@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, FavoriteId> {

    boolean existsByIdUserIdAndIdTrackId(Long userId, Long trackId);

    Optional<Favorite> findByIdUserIdAndIdTrackId(Long userId, Long trackId);

    void deleteByIdUserIdAndIdTrackId(Long userId, Long trackId);

    List<Favorite> findByIdUserIdOrderByCreatedAtDesc(Long userId);

    long countByIdUserId(Long userId);
}
