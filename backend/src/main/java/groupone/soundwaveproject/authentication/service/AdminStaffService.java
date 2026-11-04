package groupone.soundwaveproject.authentication.service;

import groupone.soundwaveproject.authentication.dto.response.StaffDirectoryPageResponse;
import groupone.soundwaveproject.authentication.dto.response.StaffSummaryResponse;
import groupone.soundwaveproject.authentication.entity.Staff;
import groupone.soundwaveproject.authentication.repository.StaffRepository;
import groupone.soundwaveproject.moderation.service.ModerationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

/**
 * Service xử lý các nghiệp vụ quản trị danh bạ tài khoản Staff dành cho Admin (UC-27: Manage Staff Accounts).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AdminStaffService {

    private final StaffRepository staffRepository;
    private final ModerationService moderationService;

    /**
     * Lấy danh bạ tài khoản nhân viên kiểm duyệt có tìm kiếm, lọc theo trạng thái/vai trò và phân trang (UC-27.1).
     *
     * @param search   Từ khóa tìm kiếm theo họ tên hoặc email
     * @param status   Trạng thái tài khoản (ACTIVE, INACTIVE hoặc ALL/null)
     * @param role     Mã vai trò (STAFF, ADMIN hoặc ALL/null)
     * @param pageable Thông tin phân trang và sắp xếp
     * @return DTO phân trang chứa danh sách tóm tắt thông tin nhân viên kèm thống kê kiểm duyệt
     */
    @Transactional(readOnly = true)
    public StaffDirectoryPageResponse getStaffDirectory(String search, String status, String role, Pageable pageable) {
        String normalizedSearch = (search != null && !search.isBlank()) ? search.trim() : null;
        String normalizedStatus = (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status.trim()))
                ? status.trim().toUpperCase() : null;
        String normalizedRole = (role != null && !role.isBlank() && !"ALL".equalsIgnoreCase(role.trim()))
                ? role.trim().toUpperCase() : null;

        log.info("Fetching staff directory: search='{}', status='{}', role='{}', page={}, size={}",
                normalizedSearch, normalizedStatus, normalizedRole, pageable.getPageNumber(), pageable.getPageSize());

        Page<Staff> page = staffRepository.findByFilter(normalizedSearch, normalizedStatus, pageable);

        List<Long> staffIds = page.getContent().stream().map(Staff::getId).toList();
        Map<Long, Long> moderationCounts = moderationService.getModerationCountsByReviewerIds(staffIds);

        Page<StaffSummaryResponse> responsePage = page.map(staff -> new StaffSummaryResponse(
                staff.getId(),
                staff.getEmail(),
                staff.getFullName(),
                staff.getRole() != null ? staff.getRole().getCode() : "STAFF",
                staff.getRole() != null ? staff.getRole().getName() : "Staff",
                staff.getStatus(),
                staff.getAvatarUrl(),
                staff.getLastLoginAt(),
                staff.getCreatedAt(),
                moderationCounts.getOrDefault(staff.getId(), 0L),
                0L
        ));

        return StaffDirectoryPageResponse.of(responsePage);
    }
}

