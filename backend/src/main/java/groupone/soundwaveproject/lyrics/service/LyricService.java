package groupone.soundwaveproject.lyrics.service;

import groupone.soundwaveproject.authentication.entity.User;
import groupone.soundwaveproject.authentication.repository.UserRepository;
import groupone.soundwaveproject.catalog.entity.Track;
import groupone.soundwaveproject.catalog.repository.TrackRepository;
import groupone.soundwaveproject.exception.BadRequestOperationException;
import groupone.soundwaveproject.exception.ResourceNotFoundException;
import groupone.soundwaveproject.lyrics.dto.request.SavePersonalLyricRequest;
import groupone.soundwaveproject.lyrics.dto.response.LyricDetailResponse;
import groupone.soundwaveproject.lyrics.dto.response.TrackLyricsBundleResponse;
import groupone.soundwaveproject.lyrics.entity.OfficialLyric;
import groupone.soundwaveproject.lyrics.entity.PersonalLyric;
import groupone.soundwaveproject.lyrics.repository.OfficialLyricRepository;
import groupone.soundwaveproject.lyrics.repository.PersonalLyricRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class LyricService {

    private final OfficialLyricRepository officialLyricRepository;
    private final PersonalLyricRepository personalLyricRepository;
    private final TrackRepository trackRepository;
    private final UserRepository userRepository;

    /**
     * Lấy bundle lời bài hát cho trang chi tiết track (bao gồm Official và Personal của user hiện tại).
     */
    @Transactional(readOnly = true)
    public TrackLyricsBundleResponse getTrackLyrics(Long trackId, String currentUserEmailOrNull) {
        Track track = trackRepository.findById(trackId)
                .orElseThrow(() -> new ResourceNotFoundException("TRACK_NOT_FOUND", "Track not found with id: " + trackId));

        LyricDetailResponse officialResponse = officialLyricRepository.findByTrackIdAndStatus(trackId, "PUBLISHED")
                .map(this::mapOfficialToResponse)
                .orElse(null);

        LyricDetailResponse personalResponse = null;
        if (currentUserEmailOrNull != null && !currentUserEmailOrNull.isBlank()) {
            Optional<User> userOpt = userRepository.findByEmailIgnoreCase(currentUserEmailOrNull);
            if (userOpt.isPresent()) {
                personalResponse = personalLyricRepository
                        .findByUserIdAndTrackIdAndLyricType(userOpt.get().getId(), trackId, "CUSTOM")
                        .map(this::mapPersonalToResponse)
                        .orElse(null);
            }
        }

        return new TrackLyricsBundleResponse(officialResponse, personalResponse);
    }

    /**
     * Tạo mới hoặc cập nhật bản lyric cá nhân của User cho Track (UC-18).
     */
    @Transactional
    public LyricDetailResponse savePersonalLyric(String userEmail, Long trackId, SavePersonalLyricRequest request) {
        User user = userRepository.findByEmailIgnoreCase(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "User account not found"));

        Track track = trackRepository.findById(trackId)
                .orElseThrow(() -> new ResourceNotFoundException("TRACK_NOT_FOUND", "Track not found with id: " + trackId));

        String lyricType = (request.lyricType() != null && !request.lyricType().isBlank())
                ? request.lyricType().trim().toUpperCase()
                : "CUSTOM";

        if (!"CUSTOM".equals(lyricType) && !"TRANSLATION".equals(lyricType)) {
            lyricType = "CUSTOM";
        }

        String content = request.lyricContent().trim();
        if (content.isEmpty()) {
            throw new BadRequestOperationException("EMPTY_LYRICS", "Lyrics content cannot be blank");
        }

        Optional<PersonalLyric> existingOpt = personalLyricRepository
                .findByUserIdAndTrackIdAndLyricType(user.getId(), track.getId(), lyricType);

        PersonalLyric personalLyric;
        if (existingOpt.isPresent()) {
            personalLyric = existingOpt.get();
            personalLyric.setLyricContent(content);
            personalLyric.setUpdatedAt(Instant.now());
        } else {
            personalLyric = PersonalLyric.builder()
                    .user(user)
                    .track(track)
                    .lyricType(lyricType)
                    .lyricContent(content)
                    .build();
        }

        PersonalLyric saved = personalLyricRepository.save(personalLyric);
        log.info("Saved personal lyric id={} for userId={} trackId={} lyricType={}",
                saved.getId(), user.getId(), track.getId(), lyricType);

        return mapPersonalToResponse(saved);
    }

    /**
     * Xóa bản lyric cá nhân của User cho Track (UC-18).
     */
    @Transactional
    public void deletePersonalLyric(String userEmail, Long trackId, String lyricType) {
        User user = userRepository.findByEmailIgnoreCase(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "User account not found"));

        String type = (lyricType != null && !lyricType.isBlank())
                ? lyricType.trim().toUpperCase()
                : "CUSTOM";

        personalLyricRepository.deleteByUserIdAndTrackIdAndLyricType(user.getId(), trackId, type);
        log.info("Deleted personal lyric for userId={} trackId={} lyricType={}", user.getId(), trackId, type);
    }

    public LyricDetailResponse mapOfficialToResponse(OfficialLyric lyric) {
        return new LyricDetailResponse(
                lyric.getId(),
                lyric.getTrack().getId(),
                lyric.getLyricContent(),
                lyric.getStatus(),
                true,
                "OFFICIAL",
                lyric.getUpdatedAt()
        );
    }

    public LyricDetailResponse mapPersonalToResponse(PersonalLyric lyric) {
        return new LyricDetailResponse(
                lyric.getId(),
                lyric.getTrack().getId(),
                lyric.getLyricContent(),
                "PERSONAL",
                false,
                lyric.getLyricType(),
                lyric.getUpdatedAt()
        );
    }
}
