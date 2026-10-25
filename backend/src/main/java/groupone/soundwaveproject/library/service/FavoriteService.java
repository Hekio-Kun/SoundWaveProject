package groupone.soundwaveproject.library.service;

import groupone.soundwaveproject.authentication.service.UserAccountPublicService;
import groupone.soundwaveproject.catalog.entity.Track;
import groupone.soundwaveproject.catalog.entity.TrackPublicationStatus;
import groupone.soundwaveproject.catalog.service.TrackCatalogPublicService;
import groupone.soundwaveproject.exception.BadRequestOperationException;
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
    private final TrackCatalogPublicService trackCatalogPublicService;
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

        // Xác thực bài hát tồn tại và có trạng thái PUBLISHED qua Public Service của catalog (tuân thủ Modular Monolith & BR-09)
        trackCatalogPublicService.validatePublishedTrack(trackId);

        FavoriteId favoriteId = new FavoriteId(userId, trackId);
        if (favoriteRepository.existsById(favoriteId)) {
            log.info("Track ID {} is already in favorites for user ID {}", trackId, userId);
            return;
        }

        Favorite favorite = new Favorite(userId, trackId);
        favoriteRepository.save(favorite);
        log.info("Successfully added track ID {} to favorites for user ID {}", trackId, userId);
    }

    /**
     * Xóa một bài hát khỏi danh sách yêu thích của người dùng (UC-14.3: Remove Song from Favorites List).
     * Áp dụng cơ chế Idempotent (AF01): nếu bài hát không còn trong favorites thì hoàn tất thành công mà không ném lỗi.
     *
     * @param currentUserEmail Email của người dùng hiện tại từ Security Context
     * @param trackId ID của bài hát muốn xóa khỏi yêu thích
     */
    @Transactional
    public void removeFavorite(String currentUserEmail, Long trackId) {
        if (trackId == null || trackId <= 0) {
            throw new BadRequestOperationException("INVALID_TRACK_ID", "Track ID must be a valid positive number.");
        }

        Long userId = userAccountPublicService.getUserIdByEmail(currentUserEmail);

        FavoriteId favoriteId = new FavoriteId(userId, trackId);
        if (!favoriteRepository.existsById(favoriteId)) {
            log.info("Track ID {} is already absent from favorites for user ID {}", trackId, userId);
            return;
        }

        favoriteRepository.deleteById(favoriteId);
        log.info("Successfully removed track ID {} from favorites for user ID {}", trackId, userId);
    }

    /**
     * Lấy danh sách toàn bộ bài hát yêu thích của người dùng hiện tại (UC-14.2: View Favorite Tracks List).
     * Chỉ trả về các bài hát đang có trạng thái PUBLISHED (tuân thủ BR-09).
     *
     * @param currentUserEmail Email của người dùng hiện tại từ Security Context
     * @return Danh sách bài hát yêu thích dạng TrackResponse
     */
    @Transactional(readOnly = true)
    public java.util.List<groupone.soundwaveproject.catalog.dto.response.TrackResponse> getFavoriteTracks(String currentUserEmail) {
        Long userId = userAccountPublicService.getUserIdByEmail(currentUserEmail);

        java.util.List<Favorite> favorites = favoriteRepository.findFavoritesByUserIdAndPublicationStatus(
                userId, TrackPublicationStatus.PUBLISHED
        );

        if (favorites.isEmpty()) {
            return java.util.Collections.emptyList();
        }

        // Gom các uploaderUserId để resolve profile theo batch, triệt tiêu lỗi N+1
        java.util.Set<Long> creatorIds = favorites.stream()
                .map(Favorite::getTrack)
                .filter(java.util.Objects::nonNull)
                .map(Track::getUploaderUserId)
                .filter(java.util.Objects::nonNull)
                .collect(java.util.stream.Collectors.toSet());

        java.util.Map<Long, groupone.soundwaveproject.authentication.dto.response.UserProfileSummary> creatorSummaries =
                userAccountPublicService.getUserSummariesByIds(creatorIds);

        return favorites.stream()
                .map(Favorite::getTrack)
                .filter(java.util.Objects::nonNull)
                .map(track -> mapToTrackResponse(track, creatorSummaries))
                .toList();
    }

    private groupone.soundwaveproject.catalog.dto.response.TrackResponse mapToTrackResponse(
            Track track,
            java.util.Map<Long, groupone.soundwaveproject.authentication.dto.response.UserProfileSummary> creatorSummaries
    ) {
        groupone.soundwaveproject.catalog.dto.response.TrackResponse.TrackAlbumSummary albumSummary = null;
        if (track.getAlbum() != null) {
            albumSummary = new groupone.soundwaveproject.catalog.dto.response.TrackResponse.TrackAlbumSummary(
                    track.getAlbum().getId(),
                    track.getAlbum().getTitle()
            );
        }

        groupone.soundwaveproject.authentication.dto.response.UserProfileSummary creator =
                creatorSummaries.get(track.getUploaderUserId());
        groupone.soundwaveproject.catalog.dto.response.TrackResponse.TrackCreatorSummary creatorSummary =
                new groupone.soundwaveproject.catalog.dto.response.TrackResponse.TrackCreatorSummary(
                        track.getUploaderUserId(),
                        creator != null && creator.displayName() != null ? creator.displayName() : "Unknown Artist",
                        creator != null ? creator.avatarUrl() : null
                );

        return new groupone.soundwaveproject.catalog.dto.response.TrackResponse(
                track.getId(),
                track.getTitle(),
                track.getSlug(),
                track.getDescription(),
                track.getAudioUrl(),
                track.getCoverUrl(),
                track.getDurationMs(),
                track.getPlayCountCache() != null ? track.getPlayCountCache() : 0L,
                track.getPublicationStatus().name(),
                track.getGenre() != null ? track.getGenre().getSlug() : null,
                track.getGenre() != null ? track.getGenre().getName() : null,
                albumSummary,
                creatorSummary,
                track.getCreatedAt()
        );
    }
}
