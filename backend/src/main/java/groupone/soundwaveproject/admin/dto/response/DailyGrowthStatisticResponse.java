package groupone.soundwaveproject.admin.dto.response;

/**
 * DTO đại diện cho một điểm dữ liệu trên biểu đồ tăng trưởng người dùng (UC-29).
 */
public record DailyGrowthStatisticResponse(
        String label,
        String date,
        long count
) {}

