package groupone.soundwaveproject.catalog.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import groupone.soundwaveproject.authentication.dto.response.UserProfileSummary;
import groupone.soundwaveproject.authentication.service.UserAccountPublicService;
import groupone.soundwaveproject.catalog.dto.request.RecordPlayRequest;
import groupone.soundwaveproject.catalog.dto.response.RecordPlayResponse;
import groupone.soundwaveproject.catalog.dto.response.TrackResponse;
import groupone.soundwaveproject.catalog.entity.Track;
import groupone.soundwaveproject.catalog.entity.TrackPublicationStatus;
import groupone.soundwaveproject.exception.ResourceNotFoundException;
import groupone.soundwaveproject.catalog.repository.TrackRepository;
import groupone.soundwaveproject.library.service.ListeningHistoryPublicService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class TrackCatalogService {
    private final TrackRepository trackRepository;
    private final UserAccountPublicService userAccountPublicService;
    private final ListeningHistoryPublicService listeningHistoryPublicService;

    /**
     * Lấy thông tin bài hát và URL streaming trực tiếp từ CDN (Phase 1).
     * Áp dụng quy tắc BR-09: Chỉ bài hát có publication_status = 'PUBLISHED' mới có thể truy cập để nghe.
     */
    @Transactional(readOnly = true)
    public TrackResponse getTrackByIdOrSlug(String idOrSlug) {
        if (idOrSlug == null || idOrSlug.isBlank()) {
            throw new ResourceNotFoundException("TRACK_UNAVAILABLE", "Track unavailable");
        }

        Track track;
        if (idOrSlug.matches("\\d+")) {
            Long trackId = Long.valueOf(idOrSlug);
            track = trackRepository.findByIdAndPublicationStatus(trackId, TrackPublicationStatus.PUBLISHED)
                    .orElseThrow(() -> new ResourceNotFoundException("TRACK_UNAVAILABLE", "Track unavailable"));
        } else {
            track = trackRepository.findBySlugAndPublicationStatus(idOrSlug, TrackPublicationStatus.PUBLISHED)
                    .orElseThrow(() -> new ResourceNotFoundException("TRACK_UNAVAILABLE", "Track unavailable"));
        }

        return mapToTrackResponse(track);
    }

    /**
     * Ghi nhận lượt nghe và lịch sử nghe nhạc khi người dùng đạt ngưỡng hợp lệ (Phase 3 - BR.13).
     */
    @Transactional
    public RecordPlayResponse recordTrackPlay(Long trackId, RecordPlayRequest request, String userEmail) {
        Track track = trackRepository.findById(trackId)
                .filter(t -> t.getPublicationStatus() == TrackPublicationStatus.PUBLISHED)
                .orElseThrow(() -> new ResourceNotFoundException("TRACK_UNAVAILABLE", "Track unavailable"));

        // 1. Tăng play count trong database transaction
        trackRepository.incrementPlayCount(trackId);
        long updatedPlayCount = (track.getPlayCountCache() != null ? track.getPlayCountCache() : 0L) + 1;

        // 2. Ghi nhận lịch sử nghe nhạc nếu đã đăng nhập (Authenticated Listener)
        boolean recordedHistory = false;
        if (userEmail != null && !userEmail.isBlank()) {
            Optional<Long> userIdOpt = userAccountPublicService.findUserIdByEmail(userEmail);
            if (userIdOpt.isPresent()) {
                listeningHistoryPublicService.recordListeningHistory(
                        userIdOpt.get(),
                        trackId,
                        request.listenedDurationMs(),
                        Boolean.TRUE.equals(request.completed())
                );
                recordedHistory = true;
            }
        }

        log.info("Play recorded for trackId={}, playCount={}, recordedHistory={}",
                trackId, updatedPlayCount, recordedHistory);

        return new RecordPlayResponse(trackId, updatedPlayCount, recordedHistory);
    }

    private TrackResponse mapToTrackResponse(Track track) {
        TrackResponse.TrackAlbumSummary albumSummary = null;
        if (track.getAlbum() != null) {
            albumSummary = new TrackResponse.TrackAlbumSummary(
                    track.getAlbum().getId(),
                    track.getAlbum().getTitle()
            );
        }

        TrackResponse.TrackCreatorSummary creatorSummary = userAccountPublicService
                .findUserSummaryById(track.getUploaderUserId())
                .map(user -> new TrackResponse.TrackCreatorSummary(
                        user.userId(),
                        user.displayName(),
                        user.avatarUrl()
                ))
                .orElseGet(() -> new TrackResponse.TrackCreatorSummary(
                        track.getUploaderUserId(),
                        "Unknown Artist",
                        null
                ));

        return new TrackResponse(
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
