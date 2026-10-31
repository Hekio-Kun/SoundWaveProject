package groupone.soundwaveproject.lyrics.service;

import groupone.soundwaveproject.authentication.entity.User;
import groupone.soundwaveproject.authentication.repository.UserRepository;
import groupone.soundwaveproject.catalog.entity.Track;
import groupone.soundwaveproject.catalog.repository.TrackRepository;
import groupone.soundwaveproject.exception.ResourceNotFoundException;
import groupone.soundwaveproject.lyrics.dto.response.CustomLyricResponse;
import groupone.soundwaveproject.lyrics.dto.response.TrackLyricsBundleResponse;
import groupone.soundwaveproject.lyrics.entity.OfficialLyric;
import groupone.soundwaveproject.lyrics.entity.PersonalLyric;
import groupone.soundwaveproject.lyrics.repository.OfficialLyricRepository;
import groupone.soundwaveproject.lyrics.repository.PersonalLyricRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Service quản lý toàn bộ nghiệp vụ lời bài hát (Official Lyrics và Custom/Personal Lyrics).
 * Tuân thủ quy chuẩn kiến trúc Monorepo & phân tách module của SoundWave.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LyricService {

    private static final Pattern LRC_TIMESTAMP_PATTERN = Pattern.compile("\\[\\d{2}:\\d{2}");

    private final OfficialLyricRepository officialLyricRepository;
    private final PersonalLyricRepository personalLyricRepository;
    private final TrackRepository trackRepository;
    private final UserRepository userRepository;

    /**
     * Lưu mới hoặc cập nhật lời bài hát chính thức (Official Lyric) vào bảng official_lyrics.
     * Đồng thời đồng bộ vào trường track.lyrics để đảm bảo tính tương thích ngược hoàn hảo.
     */
    @Transactional
    public OfficialLyric saveOrUpdateOfficialLyric(Long trackId, String lyricContent, String status, Long createdByUserId) {
        if (trackId == null) {
            throw new IllegalArgumentException("Track ID cannot be null.");
        }

        String cleanLyrics = (lyricContent != null && !lyricContent.isBlank()) ? lyricContent.trim() : null;
        String finalStatus = (status != null && !status.isBlank()) ? status.toUpperCase() : "DRAFT";
        Long finalCreatedBy = (createdByUserId != null) ? createdByUserId : 1L;

        // Đồng bộ mirror vào bảng tracks
        trackRepository.findById(trackId).ifPresent(track -> {
            track.setLyrics(cleanLyrics);
            trackRepository.save(track);
        });

        if (cleanLyrics == null) {
            // Nếu lyric rỗng hoặc bị xóa
            officialLyricRepository.findByTrackId(trackId).ifPresent(officialLyricRepository::delete);
            return null;
        }

        OfficialLyric officialLyric = officialLyricRepository.findByTrackId(trackId)
                .orElseGet(() -> OfficialLyric.builder()
                        .trackId(trackId)
                        .createdByUserId(finalCreatedBy)
                        .build());

        officialLyric.setLyricContent(cleanLyrics);
        officialLyric.setStatus(finalStatus);
        officialLyric.setUpdatedAt(LocalDateTime.now());
        if (officialLyric.getCreatedAt() == null) {
            officialLyric.setCreatedAt(LocalDateTime.now());
        }

        OfficialLyric saved = officialLyricRepository.save(officialLyric);
        log.info("Persisted official lyric for track ID: {}, status: {}", trackId, finalStatus);
        return saved;
    }

    /**
     * Lấy nội dung lời bài hát chính thức (Official Lyric) của một bài hát.
     * Tự động tra cứu trong official_lyrics, nếu chưa có sẽ fallback sang track.lyrics (và tự backfill).
     */
    @Transactional(readOnly = true)
    public Optional<String> getOfficialLyricContent(Long trackId) {
        if (trackId == null) return Optional.empty();

        Optional<OfficialLyric> lyricOpt = officialLyricRepository.findByTrackId(trackId);
        if (lyricOpt.isPresent() && lyricOpt.get().getLyricContent() != null && !lyricOpt.get().getLyricContent().isBlank()) {
            return Optional.of(lyricOpt.get().getLyricContent());
        }

        // Fallback sang track.lyrics nếu có dữ liệu legacy
        return trackRepository.findById(trackId)
                .map(Track::getLyrics)
                .filter(l -> l != null && !l.isBlank());
    }

    /**
     * Tra cứu hàng loạt (bulk) lời bài hát chính thức cho danh sách bài hát (phục vụ Studio Track List & Album Detail).
     */
    @Transactional(readOnly = true)
    public Map<Long, String> getOfficialLyricsForTracks(Collection<Long> trackIds) {
        if (trackIds == null || trackIds.isEmpty()) return Collections.emptyMap();

        Map<Long, String> result = new HashMap<>();

        // Tra cứu trong bảng official_lyrics
        List<OfficialLyric> lyrics = officialLyricRepository.findByTrackIdIn(trackIds);
        for (OfficialLyric l : lyrics) {
            if (l.getLyricContent() != null && !l.getLyricContent().isBlank()) {
                result.put(l.getTrackId(), l.getLyricContent());
            }
        }

        // Fallback cho những track chưa có trong official_lyrics
        Set<Long> missingIds = trackIds.stream()
                .filter(id -> !result.containsKey(id))
                .collect(Collectors.toSet());

        if (!missingIds.isEmpty()) {
            trackRepository.findAllById(missingIds).forEach(t -> {
                if (t.getLyrics() != null && !t.getLyrics().isBlank()) {
                    result.put(t.getId(), t.getLyrics());
                }
            });
        }

        return result;
    }

    /**
     * Đổi trạng thái của Official Lyric sang PUBLISHED khi bài hát được duyệt thành công.
     */
    @Transactional
    public void publishOfficialLyric(Long trackId) {
        if (trackId == null) return;
        officialLyricRepository.findByTrackId(trackId).ifPresent(l -> {
            l.setStatus("PUBLISHED");
            l.setUpdatedAt(LocalDateTime.now());
            officialLyricRepository.save(l);
            log.info("Published official lyric for track ID: {}", trackId);
        });
    }

    /**
     * Xóa lời bài hát chính thức của một bài hát (khi bài hát bị xóa vĩnh viễn).
     */
    @Transactional
    public void deleteOfficialLyric(Long trackId) {
        if (trackId == null) return;
        officialLyricRepository.findByTrackId(trackId).ifPresent(officialLyricRepository::delete);
    }

    /**
     * Lấy toàn bộ thông tin lời bài hát phục vụ trình phát nhạc và giao diện chi tiết (UC-18.1).
     * Trả về Official Lyrics cùng danh sách Custom Lyrics của Listener hiện tại nếu đã đăng nhập.
     */
    @Transactional(readOnly = true)
    public TrackLyricsBundleResponse getSynchronousLyrics(Long trackId, String currentUserEmail) {
        Track track = trackRepository.findById(trackId)
                .orElseThrow(() -> new ResourceNotFoundException("Track not found with id: " + trackId));

        String officialLyric = getOfficialLyricContent(trackId).orElse(null);
        String syncType = evaluateSyncType(officialLyric);

        List<CustomLyricResponse> customLyrics = Collections.emptyList();
        if (currentUserEmail != null && !currentUserEmail.isBlank()) {
            Optional<User> userOpt = userRepository.findByEmailIgnoreCase(currentUserEmail);
            if (userOpt.isPresent()) {
                customLyrics = personalLyricRepository
                        .findByUserIdAndTrackIdOrderByCreatedAtAsc(userOpt.get().getId(), trackId)
                        .stream()
                        .map(this::toCustomLyricResponse)
                        .toList();
            }
        }

        return new TrackLyricsBundleResponse(trackId, officialLyric, syncType, customLyrics);
    }

    /**
     * Tạo mới hoặc cập nhật lời bài hát tùy chỉnh (Custom Lyric / Personal Lyric) của người dùng cho bài hát (UC-18.2 & UC-18.3).
     */
    @Transactional
    public CustomLyricResponse saveOrUpdatePersonalLyric(Long trackId, String lyricType, String lyricContent, String currentUserEmail) {
        if (currentUserEmail == null || currentUserEmail.isBlank()) {
            throw new IllegalArgumentException("User email cannot be null or blank.");
        }
        User user = userRepository.findByEmailIgnoreCase(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUserEmail));

        trackRepository.findById(trackId)
                .orElseThrow(() -> new ResourceNotFoundException("Track not found with id: " + trackId));

        if (lyricContent == null || lyricContent.isBlank()) {
            throw new IllegalArgumentException("Lyric content cannot be blank.");
        }

        String cleanType = (lyricType != null && !lyricType.isBlank()) ? lyricType.toUpperCase() : "CUSTOM";
        String cleanContent = lyricContent.trim();

        PersonalLyric lyric = personalLyricRepository
                .findByUserIdAndTrackIdAndLyricType(user.getId(), trackId, cleanType)
                .orElseGet(() -> PersonalLyric.builder()
                        .userId(user.getId())
                        .trackId(trackId)
                        .lyricType(cleanType)
                        .build());

        lyric.setLyricContent(cleanContent);
        lyric.setUpdatedAt(LocalDateTime.now());
        if (lyric.getCreatedAt() == null) {
            lyric.setCreatedAt(LocalDateTime.now());
        }

        PersonalLyric saved = personalLyricRepository.save(lyric);
        log.info("Saved custom lyric ID: {} for user: {} on track: {}", saved.getId(), user.getId(), trackId);
        return toCustomLyricResponse(saved);
    }

    /**
     * Lấy danh sách toàn bộ lời bài hát tùy chỉnh của người dùng hiện tại đối với bài hát.
     */
    @Transactional(readOnly = true)
    public List<CustomLyricResponse> getPersonalLyrics(Long trackId, String currentUserEmail) {
        if (currentUserEmail == null || currentUserEmail.isBlank()) {
            return Collections.emptyList();
        }
        return userRepository.findByEmailIgnoreCase(currentUserEmail)
                .map(user -> personalLyricRepository.findByUserIdAndTrackIdOrderByCreatedAtAsc(user.getId(), trackId)
                        .stream()
                        .map(this::toCustomLyricResponse)
                        .toList())
                .orElse(Collections.emptyList());
    }

    /**
     * Lấy lời bài hát tùy chỉnh cụ thể của người dùng hiện tại đối với bài hát.
     */
    @Transactional(readOnly = true)
    public Optional<CustomLyricResponse> getPersonalLyric(Long trackId, String currentUserEmail, String lyricType) {
        if (currentUserEmail == null || currentUserEmail.isBlank()) {
            return Optional.empty();
        }
        String cleanType = (lyricType != null && !lyricType.isBlank()) ? lyricType.toUpperCase() : "CUSTOM";
        return userRepository.findByEmailIgnoreCase(currentUserEmail)
                .flatMap(user -> personalLyricRepository.findByUserIdAndTrackIdAndLyricType(user.getId(), trackId, cleanType))
                .map(this::toCustomLyricResponse);
    }

    /**
     * Xóa lời bài hát tùy chỉnh của người dùng hiện tại đối với bài hát (UC-18.4 Delete Custom Lyric).
     */
    @Transactional
    public void deletePersonalLyric(Long trackId, String currentUserEmail, String lyricType) {
        if (currentUserEmail == null || currentUserEmail.isBlank()) return;

        User user = userRepository.findByEmailIgnoreCase(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUserEmail));

        String cleanType = (lyricType != null && !lyricType.isBlank()) ? lyricType.toUpperCase() : "CUSTOM";
        personalLyricRepository.deleteByUserIdAndTrackIdAndLyricType(user.getId(), trackId, cleanType);
        log.info("Deleted personal lyric type: {} for user: {} on track: {}", cleanType, user.getId(), trackId);
    }

    private String evaluateSyncType(String lyricContent) {
        if (lyricContent == null || lyricContent.isBlank()) {
            return "NONE";
        }
        if (LRC_TIMESTAMP_PATTERN.matcher(lyricContent).find()) {
            return "LRC";
        }
        return "PLAIN";
    }

    private CustomLyricResponse toCustomLyricResponse(PersonalLyric pl) {
        return new CustomLyricResponse(
                pl.getId(),
                pl.getTrackId(),
                pl.getUserId(),
                pl.getLyricType(),
                pl.getLyricContent(),
                pl.getCreatedAt(),
                pl.getUpdatedAt()
        );
    }
}
