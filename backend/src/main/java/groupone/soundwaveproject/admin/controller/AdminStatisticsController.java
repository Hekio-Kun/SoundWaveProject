package groupone.soundwaveproject.admin.controller;

import groupone.soundwaveproject.admin.dto.response.SystemStatisticsResponse;
import groupone.soundwaveproject.admin.service.AdminStatisticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller tiếp nhận và xử lý các yêu cầu HTTP xem số liệu thống kê hệ thống dành cho Admin (UC-29: View System Statistics).
 * Toàn bộ các endpoint trong controller này yêu cầu tài khoản có vai trò ADMIN (ROLE_ADMIN).
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/admin/statistics")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminStatisticsController {

    private final AdminStatisticsService adminStatisticsService;

    /**
     * Lấy dữ liệu thống kê tổng thể của toàn bộ hệ thống SoundWave theo khoảng thời gian chỉ định.
     *
     * @param period Khoảng thời gian thống kê (ví dụ: "7d", "30d", "90d" - mặc định là "7d")
     * @return DTO chứa dữ liệu tổng quan, top bài hát, biểu đồ tăng trưởng, cơ cấu người dùng và trạng thái hệ thống
     */
    @GetMapping
    public ResponseEntity<SystemStatisticsResponse> getSystemStatistics(
            @RequestParam(required = false, defaultValue = "7d") String period) {
        log.info("Admin requesting system statistics with period={}", period);
        SystemStatisticsResponse response = adminStatisticsService.getSystemStatistics(period);
        return ResponseEntity.ok(response);
    }
}

