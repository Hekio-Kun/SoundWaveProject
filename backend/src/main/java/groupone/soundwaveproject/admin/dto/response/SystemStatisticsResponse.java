package groupone.soundwaveproject.admin.dto.response;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO tổng hợp toàn bộ số liệu thống kê hệ thống dành cho Admin Dashboard (UC-29: View System Statistics).
 */
public record SystemStatisticsResponse(
        MetricOverviewResponse overview,
        List<TopTrackStatisticResponse> topTracks,
        List<DailyGrowthStatisticResponse> userGrowth,
        RoleDistributionResponse roleDistribution,
        List<RecentAccountStatisticResponse> recentAccounts,
        SystemHealthResponse systemHealth,
        String period,
        LocalDateTime generatedAt
) {}

