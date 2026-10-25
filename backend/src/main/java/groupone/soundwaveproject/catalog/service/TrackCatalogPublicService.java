package groupone.soundwaveproject.catalog.service;

import groupone.soundwaveproject.catalog.entity.Track;
import groupone.soundwaveproject.catalog.entity.TrackPublicationStatus;
import groupone.soundwaveproject.catalog.repository.TrackRepository;
import groupone.soundwaveproject.exception.BadRequestOperationException;
import groupone.soundwaveproject.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Public Service cung cấp các thao tác liên quan đến catalog bài hát cho các module khác
 * trong hệ thống Modular Monolith (library, moderation, playback,...).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TrackCatalogPublicService {

    private final TrackRepository trackRepository;

    /**
     * Xác thực sự tồn tại và trạng thái xuất bản PUBLISHED của bài hát.
     * Ném ResourceNotFoundException nếu không tìm thấy bài hát.
     * Ném BadRequestOperationException nếu bài hát chưa ở trạng thái xuất bản (tuân thủ BR-09).
     *
     * @param trackId ID của bài hát cần xác thực.
     * @return {@link Track} entity đã được xác thực hợp lệ.
     */
    @Transactional(readOnly = true)
    public Track validatePublishedTrack(Long trackId) {
        if (trackId == null || trackId <= 0) {
            throw new BadRequestOperationException("INVALID_TRACK_ID", "Track ID must be a valid positive number.");
        }

        Track track = trackRepository.findById(trackId)
                .orElseThrow(() -> new ResourceNotFoundException("TRACK_NOT_FOUND", "Track not found with ID: " + trackId));

        if (track.getPublicationStatus() != TrackPublicationStatus.PUBLISHED) {
            throw new BadRequestOperationException("TRACK_NOT_PUBLISHED", "Only published tracks can be added to favorites.");
        }

        return track;
    }
}
