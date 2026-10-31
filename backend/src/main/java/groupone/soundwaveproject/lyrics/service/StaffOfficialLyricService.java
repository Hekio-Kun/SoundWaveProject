package groupone.soundwaveproject.lyrics.service;

import groupone.soundwaveproject.authentication.entity.Staff;
import groupone.soundwaveproject.authentication.entity.UserProfile;
import groupone.soundwaveproject.authentication.repository.StaffRepository;
import groupone.soundwaveproject.authentication.repository.UserProfileRepository;
import groupone.soundwaveproject.catalog.entity.Track;
import groupone.soundwaveproject.catalog.entity.TrackPublicationStatus;
import groupone.soundwaveproject.catalog.repository.TrackRepository;
import groupone.soundwaveproject.exception.BadRequestOperationException;
import groupone.soundwaveproject.exception.ResourceNotFoundException;
import groupone.soundwaveproject.lyrics.dto.request.SaveOfficialLyricRequest;
import groupone.soundwaveproject.lyrics.dto.response.LyricDetailResponse;
import groupone.soundwaveproject.lyrics.dto.response.StaffTrackLyricSummaryResponse;
import groupone.soundwaveproject.lyrics.entity.OfficialLyric;
import groupone.soundwaveproject.lyrics.repository.OfficialLyricRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZoneOffset;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class StaffOfficialLyricService {

    private final OfficialLyricRepository officialLyricRepository;
    private final TrackRepository trackRepository;
    private final StaffRepository staffRepository;
    private final UserProfileRepository profileRepository;

    /**
     * Xem chi tiết lời bài hát chính thức (kể cả bản DRAFT).
     */
    @Transactional(readOnly = true)
    public LyricDetailResponse getOfficialLyric(Long trackId) {
        Track track = trackRepository.findById(trackId)
                .orElseThrow(() -> new ResourceNotFoundException("TRACK_NOT_FOUND", "Track not found with id: " + trackId));

        return officialLyricRepository.findByTrackId(trackId)
                .map(this::mapToResponse)
                .orElse(null);
    }

    /**
     * Tìm kiếm và hiển thị danh sách bài hát cho giao diện Quản lý Lời bài hát của Staff (UC-26 / Section 6.4).
     */
    @Transactional(readOnly = true)
    public Page<StaffTrackLyricSummaryResponse> searchTracksForLyrics(String query, String statusFilter, Pageable pageable) {
        Page<Track> tracksPage;
        if (query != null && !query.trim().isBlank()) {
            tracksPage = trackRepository.findByPublicationStatusAndTitleContainingIgnoreCase(
                    TrackPublicationStatus.PUBLISHED, query.trim(), pageable);
        } else {
            tracksPage = trackRepository.findByPublicationStatus(TrackPublicationStatus.PUBLISHED, pageable);
        }

        List<Track> tracks = tracksPage.getContent();
        if (tracks.isEmpty()) {
            return Page.empty(pageable);
        }

        Set<Long> trackIds = tracks.stream().map(Track::getId).collect(Collectors.toSet());
        Set<Long> uploaderIds = tracks.stream().map(Track::getUploaderUserId).collect(Collectors.toSet());

        Map<Long, OfficialLyric> officialLyricsMap = officialLyricRepository.findByTrackIdIn(trackIds).stream()
                .collect(Collectors.toMap(l -> l.getTrack().getId(), Function.identity(), (a, b) -> a));

        Map<Long, UserProfile> profilesMap = uploaderIds.isEmpty() ? Map.of() :
                profileRepository.findAllById(uploaderIds).stream()
                        .collect(Collectors.toMap(UserProfile::getUserId, Function.identity(), (a, b) -> a));

        List<StaffTrackLyricSummaryResponse> content = tracks.stream()
                .map(track -> {
                    OfficialLyric official = officialLyricsMap.get(track.getId());
                    UserProfile profile = profilesMap.get(track.getUploaderUserId());
                    String uploaderName = profile != null ? profile.getDisplayName() : "Creator #" + track.getUploaderUserId();
                    String durationStr = formatDuration(track.getDurationMs());
                    String genreName = track.getGenre() != null ? track.getGenre().getName() : "Uncategorized";

                    boolean hasLyric = official != null;
                    String lyricStatus = official != null ? official.getStatus() : null;
                    Instant updatedAt = official != null ? official.getUpdatedAt() :
                            (track.getUpdatedAt() != null ? track.getUpdatedAt().toInstant(ZoneOffset.UTC) : null);

                    return new StaffTrackLyricSummaryResponse(
                            track.getId(),
                            track.getTitle(),
                            track.getSlug(),
                            track.getCoverUrl(),
                            track.getAudioUrl(),
                            durationStr,
                            genreName,
                            uploaderName,
                            hasLyric,
                            lyricStatus,
                            updatedAt
                    );
                })
                .filter(item -> {
                    if (statusFilter == null || statusFilter.isBlank() || "ALL".equalsIgnoreCase(statusFilter)) {
                        return true;
                    }
                    if ("HAS_LYRICS".equalsIgnoreCase(statusFilter)) {
                        return item.hasOfficialLyric();
                    }
                    if ("NO_LYRICS".equalsIgnoreCase(statusFilter)) {
                        return !item.hasOfficialLyric();
                    }
                    return statusFilter.equalsIgnoreCase(item.lyricStatus());
                })
                .toList();

        return new PageImpl<>(content, pageable, tracksPage.getTotalElements());
    }

    /**
     * Tạo mới hoặc lưu lời bài hát chính thức (UC-26 / Section 6.4).
     */
    @Transactional
    public LyricDetailResponse saveOrUpdateOfficialLyric(String staffEmail, SaveOfficialLyricRequest request) {
        Staff staff = staffRepository.findByEmailIgnoreCase(staffEmail)
                .orElseThrow(() -> new ResourceNotFoundException("STAFF_NOT_FOUND", "Staff account not found"));

        Track track = trackRepository.findById(request.trackId())
                .orElseThrow(() -> new ResourceNotFoundException("TRACK_NOT_FOUND", "Track not found with id: " + request.trackId()));

        String status = request.status().toUpperCase();
        if (!"DRAFT".equals(status) && !"PUBLISHED".equals(status)) {
            throw new BadRequestOperationException("INVALID_STATUS", "Status must be either DRAFT or PUBLISHED");
        }

        String content = request.lyricContent().trim();
        if (content.isEmpty()) {
            throw new BadRequestOperationException("EMPTY_LYRICS", "Lyrics content cannot be blank");
        }

        Optional<OfficialLyric> existingOpt = officialLyricRepository.findByTrackId(request.trackId());
        OfficialLyric lyric;
        if (existingOpt.isPresent()) {
            lyric = existingOpt.get();
            lyric.setLyricContent(content);
            lyric.setStatus(status);
            lyric.setCreatedBy(staff);
            lyric.setUpdatedAt(Instant.now());
        } else {
            lyric = OfficialLyric.builder()
                    .track(track)
                    .lyricContent(content)
                    .status(status)
                    .createdBy(staff)
                    .build();
        }

        OfficialLyric saved = officialLyricRepository.save(lyric);

        // Official lyric status updated

        log.info("Official lyric saved id={} for trackId={} by staff={} status={}",
                saved.getId(), track.getId(), staff.getEmail(), status);

        return mapToResponse(saved);
    }

    /**
     * Cập nhật trạng thái DRAFT <-> PUBLISHED của lời bài hát chính thức.
     */
    @Transactional
    public LyricDetailResponse updateStatus(String staffEmail, Long trackId, String newStatus) {
        Staff staff = staffRepository.findByEmailIgnoreCase(staffEmail)
                .orElseThrow(() -> new ResourceNotFoundException("STAFF_NOT_FOUND", "Staff account not found"));

        OfficialLyric lyric = officialLyricRepository.findByTrackId(trackId)
                .orElseThrow(() -> new ResourceNotFoundException("LYRIC_NOT_FOUND", "Official lyric not found for track id: " + trackId));

        String status = newStatus.toUpperCase();
        if (!"DRAFT".equals(status) && !"PUBLISHED".equals(status)) {
            throw new BadRequestOperationException("INVALID_STATUS", "Status must be either DRAFT or PUBLISHED");
        }

        lyric.setStatus(status);
        lyric.setCreatedBy(staff);
        lyric.setUpdatedAt(Instant.now());
        OfficialLyric saved = officialLyricRepository.save(lyric);

        // Official lyric status updated

        log.info("Updated official lyric status to {} for trackId={} by staff={}", status, trackId, staff.getEmail());
        return mapToResponse(saved);
    }

    /**
     * Xóa lời bài hát chính thức của bài hát (UC-26).
     */
    @Transactional
    public void deleteOfficialLyric(String staffEmail, Long trackId) {
        Staff staff = staffRepository.findByEmailIgnoreCase(staffEmail)
                .orElseThrow(() -> new ResourceNotFoundException("STAFF_NOT_FOUND", "Staff account not found"));

        Track track = trackRepository.findById(trackId)
                .orElseThrow(() -> new ResourceNotFoundException("TRACK_NOT_FOUND", "Track not found with id: " + trackId));

        officialLyricRepository.findByTrackId(trackId).ifPresent(lyric -> {
            officialLyricRepository.delete(lyric);
            // Official lyric removed
            log.info("Deleted official lyric for trackId={} by staff={}", trackId, staff.getEmail());
        });
    }

    private LyricDetailResponse mapToResponse(OfficialLyric lyric) {
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

    private String formatDuration(Integer durationMs) {
        if (durationMs == null || durationMs <= 0) return "0:00";
        int totalSec = durationMs / 1000;
        int min = totalSec / 60;
        int sec = totalSec % 60;
        return String.format("%d:%02d", min, sec);
    }
}
