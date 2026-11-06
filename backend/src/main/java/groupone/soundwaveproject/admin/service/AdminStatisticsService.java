package groupone.soundwaveproject.admin.service;

import groupone.soundwaveproject.admin.dto.response.*;
import groupone.soundwaveproject.authentication.entity.User;
import groupone.soundwaveproject.authentication.entity.UserProfile;
import groupone.soundwaveproject.authentication.entity.UserStatus;
import groupone.soundwaveproject.authentication.repository.StaffRepository;
import groupone.soundwaveproject.authentication.repository.UserProfileRepository;
import groupone.soundwaveproject.authentication.repository.UserRepository;
import groupone.soundwaveproject.catalog.entity.Track;
import groupone.soundwaveproject.catalog.entity.TrackPublicationStatus;
import groupone.soundwaveproject.catalog.repository.GenreRepository;
import groupone.soundwaveproject.catalog.repository.TrackRepository;
import groupone.soundwaveproject.moderation.entity.SubmissionStatus;
import groupone.soundwaveproject.moderation.repository.ContentReportRepository;
import groupone.soundwaveproject.moderation.repository.TrackSubmissionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service tổng hợp số liệu thống kê hệ thống phục vụ Admin Dashboard (UC-29: View System Statistics).
 * Đảm bảo luồng xử lý Controller -> Service -> Repository và dữ liệu trả về dưới dạng DTO an toàn.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AdminStatisticsService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final StaffRepository staffRepository;
    private final TrackRepository trackRepository;
    private final GenreRepository genreRepository;
    private final TrackSubmissionRepository trackSubmissionRepository;
    private final ContentReportRepository contentReportRepository;

    /**
     * Thu thập và tính toán số liệu thống kê hệ thống theo khoảng thời gian chỉ định.
     *
     * @param period Khoảng thời gian thống kê ("7d", "30d", "90d" - mặc định: "7d")
     * @return DTO tổng hợp toàn bộ số liệu thống kê hệ thống
     */
    @Transactional(readOnly = true)
    public SystemStatisticsResponse getSystemStatistics(String period) {
        String normalizedPeriod = normalizePeriod(period);
        int days = getDaysForPeriod(normalizedPeriod);

        LocalDateTime now = LocalDateTime.now(ZoneOffset.UTC);
        LocalDateTime periodStart = now.minusDays(days);
        LocalDateTime prevPeriodStart = now.minusDays(days * 2L);
        LocalDateTime prevPeriodEnd = periodStart;

        long dbStartMs = System.currentTimeMillis();

        // 1. Thống kê người dùng (User counts)
        long totalUsers = userRepository.countByDeletedAtIsNull();
        long activeUsers = userRepository.countByStatusAndDeletedAtIsNull(UserStatus.ACTIVE);
        long newUsersInPeriod = userRepository.countByCreatedAtBetweenAndDeletedAtIsNull(periodStart, now);
        long newUsersInPrevPeriod = userRepository.countByCreatedAtBetweenAndDeletedAtIsNull(prevPeriodStart, prevPeriodEnd);

        double userGrowthPercentage = calculateGrowthPercentage(newUsersInPeriod, newUsersInPrevPeriod);

        // 2. Thống kê danh mục bài hát & tương tác (Tracks & Plays)
        long publishedTracks = trackRepository.countByPublicationStatus(TrackPublicationStatus.PUBLISHED);
        long newTracksInPeriod = trackRepository.countByPublicationStatusAndCreatedAtAfter(TrackPublicationStatus.PUBLISHED, periodStart);
        Long totalPlaysVal = trackRepository.sumPlayCountCache();
        long totalPlays = totalPlaysVal != null ? totalPlaysVal : 0L;
        Long totalCreatorsVal = trackRepository.countDistinctUploaders();
        long totalCreators = totalCreatorsVal != null ? totalCreatorsVal : 0L;

        // 3. Thống kê kiểm duyệt & báo cáo (Moderation & Reports)
        long pendingReviews = trackSubmissionRepository.countByStatus(SubmissionStatus.PENDING);
        long pendingReports = contentReportRepository.countByStatus("PENDING");
        long activeGenres = genreRepository.countByIsActiveTrue();

        long dbLatencyMs = Math.max(5, System.currentTimeMillis() - dbStartMs);

        MetricOverviewResponse overview = new MetricOverviewResponse(
                totalUsers,
                activeUsers,
                newUsersInPeriod,
                userGrowthPercentage,
                publishedTracks,
                newTracksInPeriod,
                totalPlays,
                pendingReviews,
                pendingReports,
                activeGenres,
                totalCreators
        );

        // 4. Top 5 bài hát có lượt stream cao nhất
        List<TopTrackStatisticResponse> topTracks = getTopTracks(5);

        // 5. Biểu đồ tăng trưởng người dùng theo các ngày trong kỳ
        List<DailyGrowthStatisticResponse> userGrowth = getDailyGrowth(periodStart, now, days);

        // 6. Cơ cấu người dùng theo vai trò
        RoleDistributionResponse roleDistribution = getRoleDistribution(totalUsers, totalCreators);

        // 7. Danh sách 5 tài khoản đăng ký mới nhất
        List<RecentAccountStatisticResponse> recentAccounts = getRecentAccounts(5);

        // 8. Tình trạng sức khỏe hệ thống
        SystemHealthResponse systemHealth = new SystemHealthResponse(
                "Operational",
                "Operational",
                "Operational",
                "Operational",
                24,
                (int) dbLatencyMs,
                95,
                "99.98%"
        );

        return new SystemStatisticsResponse(
                overview,
                topTracks,
                userGrowth,
                roleDistribution,
                recentAccounts,
                systemHealth,
                normalizedPeriod,
                now
        );
    }

    private String normalizePeriod(String period) {
        if (period == null) return "7d";
        String trimmed = period.trim().toLowerCase(Locale.ROOT);
        if ("30d".equals(trimmed) || "90d".equals(trimmed)) {
            return trimmed;
        }
        return "7d";
    }

    private int getDaysForPeriod(String period) {
        return switch (period) {
            case "30d" -> 30;
            case "90d" -> 90;
            default -> 7;
        };
    }

    private double calculateGrowthPercentage(long current, long previous) {
        if (previous <= 0) {
            return current > 0 ? 100.0 : 0.0;
        }
        double percentage = ((double) (current - previous) / previous) * 100.0;
        return Math.round(percentage * 10.0) / 10.0;
    }

    private List<TopTrackStatisticResponse> getTopTracks(int limit) {
        List<Track> tracks = trackRepository.findTopPublishedTracks(PageRequest.of(0, limit));
        if (tracks.isEmpty()) {
            return Collections.emptyList();
        }

        Set<Long> uploaderIds = tracks.stream()
                .map(Track::getUploaderUserId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<Long, String> uploaderNameMap = new HashMap<>();
        if (!uploaderIds.isEmpty()) {
            userProfileRepository.findAllById(uploaderIds).forEach(profile -> {
                String name = profile.getDisplayName();
                if (name != null && !name.isBlank()) {
                    uploaderNameMap.put(profile.getUserId(), name);
                }
            });
        }

        return tracks.stream().map(track -> {
            String uploaderName = uploaderNameMap.getOrDefault(track.getUploaderUserId(), "SoundWave Artist");
            String genreName = track.getGenre() != null ? track.getGenre().getName() : "General";
            long playCount = track.getPlayCountCache() != null ? track.getPlayCountCache() : 0L;

            return new TopTrackStatisticResponse(
                    track.getId(),
                    track.getTitle(),
                    uploaderName,
                    genreName,
                    playCount,
                    track.getCoverUrl(),
                    track.getDurationMs()
            );
        }).toList();
    }

    private List<DailyGrowthStatisticResponse> getDailyGrowth(LocalDateTime start, LocalDateTime end, int days) {
        List<User> usersInPeriod = userRepository.findUsersCreatedSince(start);

        Map<LocalDate, Long> countByDate = new HashMap<>();
        for (User u : usersInPeriod) {
            if (u.getCreatedAt() != null) {
                LocalDate date = u.getCreatedAt().toLocalDate();
                countByDate.put(date, countByDate.getOrDefault(date, 0L) + 1);
            }
        }

        List<DailyGrowthStatisticResponse> result = new ArrayList<>();
        LocalDate startDate = start.toLocalDate();
        LocalDate endDate = end.toLocalDate();

        DateTimeFormatter dateFmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        if (days == 7) {
            for (int i = 6; i >= 0; i--) {
                LocalDate d = endDate.minusDays(i);
                String label = d.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
                long count = countByDate.getOrDefault(d, 0L);
                result.add(new DailyGrowthStatisticResponse(label, d.format(dateFmt), count));
            }
        } else {
            // Với 30d hoặc 90d, lấy dữ liệu theo từng ngày
            for (LocalDate d = startDate; !d.isAfter(endDate); d = d.plusDays(1)) {
                String label = d.format(DateTimeFormatter.ofPattern("MM/dd"));
                long count = countByDate.getOrDefault(d, 0L);
                result.add(new DailyGrowthStatisticResponse(label, d.format(dateFmt), count));
            }
        }

        return result;
    }

    private RoleDistributionResponse getRoleDistribution(long totalUsers, long totalCreators) {
        long staffs = staffRepository.countByRole_CodeIgnoreCase("STAFF");
        long admins = staffRepository.countByRole_CodeIgnoreCase("ADMIN");

        long listeners = Math.max(0, totalUsers - totalCreators);
        double listenerPercentage = totalUsers > 0
                ? Math.round(((double) listeners / totalUsers * 100.0) * 10.0) / 10.0
                : 100.0;
        double creatorPercentage = totalUsers > 0
                ? Math.round(((double) totalCreators / totalUsers * 100.0) * 10.0) / 10.0
                : 0.0;

        return new RoleDistributionResponse(
                listeners,
                totalCreators,
                staffs,
                admins,
                listenerPercentage,
                creatorPercentage
        );
    }

    private List<RecentAccountStatisticResponse> getRecentAccounts(int limit) {
        List<User> recentUsers = userRepository.findTop5ByDeletedAtIsNullOrderByCreatedAtDesc();
        if (recentUsers.isEmpty()) {
            return Collections.emptyList();
        }

        Set<Long> userIds = recentUsers.stream().map(User::getId).collect(Collectors.toSet());
        Map<Long, UserProfile> profileMap = userProfileRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(UserProfile::getUserId, p -> p, (a, b) -> a));

        return recentUsers.stream().map(u -> {
            UserProfile profile = profileMap.get(u.getId());
            String displayName = profile != null && profile.getDisplayName() != null && !profile.getDisplayName().isBlank()
                    ? profile.getDisplayName()
                    : extractNameFromEmail(u.getEmail());

            String initials = getInitials(displayName);
            String role = (trackRepository.countByUploaderUserId(u.getId()) > 0) ? "Creator" : "Listener";
            String status = u.getStatus() == UserStatus.ACTIVE ? "Verified" : "Pending";
            String avatarUrl = profile != null ? profile.getAvatarUrl() : null;

            return new RecentAccountStatisticResponse(
                    u.getId(),
                    u.getEmail(),
                    displayName,
                    role,
                    status,
                    u.getCreatedAt(),
                    initials,
                    avatarUrl
            );
        }).toList();
    }

    private String extractNameFromEmail(String email) {
        if (email == null) return "User";
        int atIndex = email.indexOf('@');
        return atIndex > 0 ? email.substring(0, atIndex) : email;
    }

    private String getInitials(String name) {
        if (name == null || name.isBlank()) return "SW";
        String[] parts = name.trim().split("\\s+");
        if (parts.length == 1) {
            return parts[0].substring(0, Math.min(2, parts[0].length())).toUpperCase(Locale.ROOT);
        }
        return (parts[0].substring(0, 1) + parts[parts.length - 1].substring(0, 1)).toUpperCase(Locale.ROOT);
    }
}

