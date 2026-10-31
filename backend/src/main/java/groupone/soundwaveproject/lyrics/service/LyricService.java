package groupone.soundwaveproject.lyrics.service;

import groupone.soundwaveproject.authentication.entity.User;
import groupone.soundwaveproject.authentication.repository.UserRepository;
import groupone.soundwaveproject.catalog.entity.Track;
import groupone.soundwaveproject.catalog.repository.TrackRepository;
import groupone.soundwaveproject.exception.BadRequestOperationException;
import groupone.soundwaveproject.exception.ResourceNotFoundException;
import groupone.soundwaveproject.lyrics.dto.request.SavePersonalLyricRequest;
import groupone.soundwaveproject.lyrics.dto.response.CustomLyricResponse;
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
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
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
     * Đồng bộ API lấy lời bài hát cho PersonalLyricController (UC-18.1).
     */
    @Transactional(readOnly = true)
    public TrackLyricsBundleResponse getSynchronousLyrics(Long trackId, String currentUserEmailOrNull) {
        return getTrackLyrics(trackId, currentUserEmailOrNull);
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
     * Tạo mới hoặc cập nhật bản lyric cá nhân trả về CustomLyricResponse (cho PersonalLyricController).
     */
    @Transactional
    public CustomLyricResponse saveOrUpdatePersonalLyric(Long trackId, String lyricType, String lyricContent, String userEmail) {
        LyricDetailResponse detail = savePersonalLyric(userEmail, trackId, new SavePersonalLyricRequest(lyricContent, lyricType));
        User user = userRepository.findByEmailIgnoreCase(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "User account not found"));
        PersonalLyric entity = personalLyricRepository.findById(detail.id())
                .orElseThrow(() -> new ResourceNotFoundException("LYRIC_NOT_FOUND", "Lyric not found with id: " + detail.id()));
        return mapToCustomResponse(entity);
    }

    /**
     * Lấy danh sách lyric cá nhân của User cho Track (UC-18.2).
     */
    @Transactional(readOnly = true)
    public List<CustomLyricResponse> getPersonalLyrics(Long trackId, String userEmail) {
        if (userEmail == null || userEmail.isBlank()) return List.of();
        User user = userRepository.findByEmailIgnoreCase(userEmail).orElse(null);
        if (user == null) return List.of();
        return personalLyricRepository.findByUserIdAndTrackId(user.getId(), trackId)
                .stream()
                .map(this::mapToCustomResponse)
                .toList();
    }

    /**
     * Xóa bản lyric cá nhân của User cho Track (UC-18).
     */
    @Transactional
    public void deletePersonalLyric(Long trackId, String userEmail, String lyricType) {
        deletePersonalLyric(userEmail, trackId, lyricType);
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

    public CustomLyricResponse mapToCustomResponse(PersonalLyric lyric) {
        LocalDateTime created = lyric.getCreatedAt() != null
                ? LocalDateTime.ofInstant(lyric.getCreatedAt(), ZoneOffset.UTC)
                : LocalDateTime.now(ZoneOffset.UTC);
        LocalDateTime updated = lyric.getUpdatedAt() != null
                ? LocalDateTime.ofInstant(lyric.getUpdatedAt(), ZoneOffset.UTC)
                : created;
        return new CustomLyricResponse(
                lyric.getId(),
                lyric.getTrack().getId(),
                lyric.getUser().getId(),
                lyric.getLyricType(),
                lyric.getLyricContent(),
                created,
                updated
        );
    }

    /**
     * Tra cứu nội dung lời bài hát chính thức dạng String (cho TrackResponse & StudioTrackResponse).
     */
    @Transactional(readOnly = true)
    public String getOfficialLyrics(Long trackId) {
        if (trackId == null) return null;
        return officialLyricRepository.findByTrackIdAndStatus(trackId, "PUBLISHED")
                .map(OfficialLyric::getLyricContent)
                .orElse(null);
    }

    /**
     * Lưu hoặc cập nhật lời bài hát chính thức (Official Lyric) với trạng thái chỉ định.
     */
    @Transactional
    public OfficialLyric saveOrUpdateOfficialLyric(Long trackId, String rawLyrics, String status, Long userId) {
        Track track = trackRepository.findById(trackId)
                .orElseThrow(() -> new ResourceNotFoundException("TRACK_NOT_FOUND", "Track not found with id: " + trackId));

        String trimmed = rawLyrics != null ? rawLyrics.trim() : "";
        OfficialLyric official = officialLyricRepository.findByTrackId(trackId)
                .orElseGet(() -> OfficialLyric.builder()
                        .track(track)
                        .status(status != null ? status : "PUBLISHED")
                        .build());

        official.setLyricContent(trimmed);
        if (status != null && !status.isBlank()) {
            official.setStatus(status);
        }
        official.setUpdatedAt(Instant.now());

        OfficialLyric saved = officialLyricRepository.save(official);
        log.info("Saved official lyric id={} for trackId={} by userId={}", saved.getId(), trackId, userId);
        return saved;
    }

    /**
     * Lưu hoặc cập nhật lời bài hát chính thức (Official Lyric) do tác giả (Creator) cập nhật.
     */
    @Transactional
    public OfficialLyric saveOrUpdateOfficialLyrics(Long trackId, String rawLyrics, Long userId) {
        return saveOrUpdateOfficialLyric(trackId, rawLyrics, "PUBLISHED", userId);
    }

    /**
     * Xóa toàn bộ lyrics liên kết với bài hát khi bài hát bị xóa khỏi hệ thống.
     */
    @Transactional
    public void deleteAllLyricsForTrack(Long trackId) {
        if (trackId == null) return;
        officialLyricRepository.deleteByTrackId(trackId);
        personalLyricRepository.deleteByTrackId(trackId);
    }
}
