package groupone.soundwaveproject.authentication.controller;

import groupone.soundwaveproject.authentication.dto.request.CreateStaffRequest;
import groupone.soundwaveproject.authentication.dto.response.CreateStaffResponse;
import groupone.soundwaveproject.authentication.dto.response.StaffDirectoryPageResponse;
import groupone.soundwaveproject.authentication.service.AdminStaffService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Controller tiếp nhận và xử lý các yêu cầu HTTP quản trị tài khoản Staff dành cho Admin (UC-27: Manage Staff Accounts).
 * Phân quyền yêu cầu vai trò ADMIN.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/admin/staffs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminStaffController {

    private final AdminStaffService adminStaffService;

    /**
     * Lấy danh bạ tài khoản nhân viên kiểm duyệt có tìm kiếm, lọc theo trạng thái/vai trò và phân trang (UC-27.1: View Staff Directory).
     *
     * @param search   Từ khóa tìm kiếm theo tên hoặc email
     * @param status   Lọc theo trạng thái tài khoản (ACTIVE, INACTIVE hoặc ALL/null)
     * @param role     Lọc theo vai trò (STAFF, ADMIN hoặc ALL/null)
     * @param pageable Cấu hình phân trang và sắp xếp (mặc định sắp xếp theo ngày tạo mới nhất)
     * @return Phản hồi chứa danh sách phân trang các tài khoản nhân viên
     */
    @GetMapping
    public ResponseEntity<StaffDirectoryPageResponse> getStaffDirectory(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String role,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        log.info("Admin requesting staff directory: search={}, status={}, role={}, page={}, size={}",
                search, status, role, pageable.getPageNumber(), pageable.getPageSize());
        return ResponseEntity.ok(adminStaffService.getStaffDirectory(search, status, role, pageable));
    }

    /**
     * Khởi tạo tài khoản nhân viên kiểm duyệt mới và tự động gửi email cấp thông tin đăng nhập (UC-27.2 & UC-23).
     *
     * @param request Dữ liệu tạo tài khoản nhân viên
     * @return Phản hồi chứa thông tin nhân viên vừa tạo kèm trạng thái gửi email
     */
    @PostMapping
    public ResponseEntity<CreateStaffResponse> createStaff(@Valid @RequestBody CreateStaffRequest request) {
        log.info("Admin creating staff account: email={}, fullName={}, autoGeneratePassword={}",
                request.email(), request.fullName(), request.autoGeneratePassword());
        CreateStaffResponse response = adminStaffService.createStaff(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
