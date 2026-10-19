package groupone.soundwaveproject.library.service;

import groupone.soundwaveproject.authentication.service.UserAccountPublicService;
import groupone.soundwaveproject.catalog.entity.Track;
import groupone.soundwaveproject.catalog.entity.TrackPublicationStatus;
import groupone.soundwaveproject.catalog.repository.TrackRepository;
import groupone.soundwaveproject.exception.BadRequestOperationException;
import groupone.soundwaveproject.exception.ResourceNotFoundException;
import groupone.soundwaveproject.library.entity.Favorite;
import groupone.soundwaveproject.library.entity.FavoriteId;
import groupone.soundwaveproject.library.repository.FavoriteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service xử lý nghiệp vụ Quản lý bài hát yêu thích (UC-14: Favorite Tracks Management).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final TrackRepository trackRepository;
    private final UserAccountPublicService userAccountPublicService;

    /**
     * Thêm một bài hát vào danh sách yêu thích của người dùng (UC-14.1: Add Track to Favorites).
     *
     * @param currentUserEmail Email của người dùng hiện tại từ Security Context
     * @param trackId ID của bài hát muốn thêm vào yêu thích
     */
    @Transactional
    public void addFavorite(String currentUserEmail, Long trackId) {
        if (trackId == null || trackId <= 0) {
            throw new BadRequestOperationException("INVALID_TRACK_ID", "Track ID must be a valid positive number.");
        }

        Long userId = userAccountPublicService.getUserIdByEmail(currentUserEmail);

        Track track = trackRepository.findById(trackId)
                .orElseThrow(() -> new ResourceNotFoundException("TRACK_NOT_FOUND", "Track not found with ID: " + trackId));

        // Business Rule BR-09: Chỉ bài hát có trạng thái PUBLISHED mới được hiển thị và tương tác công khai / yêu thích
        if (track.getPublicationStatus() != TrackPublicationStatus.PUBLISHED) {
            throw new BadRequestOperationException("TRACK_NOT_PUBLISHED", "Only published tracks can be added to favorites.");
        }

        FavoriteId favoriteId = new FavoriteId(userId, trackId);
        if (favoriteRepository.existsById(favoriteId)) {
            log.info("Track ID {} is already in favorites for user ID {}", trackId, userId);
            return;
        }

        Favorite favorite = new Favorite(userId, trackId);
        favoriteRepository.save(favorite);
        log.info("Successfully added track ID {} to favorites for user ID {}", trackId, userId);
    }
}
