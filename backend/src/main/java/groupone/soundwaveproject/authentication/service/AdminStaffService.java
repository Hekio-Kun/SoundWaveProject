package groupone.soundwaveproject.authentication.service;

import groupone.soundwaveproject.authentication.dto.request.CreateStaffRequest;
import groupone.soundwaveproject.authentication.dto.request.DeactivateStaffRequest;
import groupone.soundwaveproject.authentication.dto.response.CreateStaffResponse;
import groupone.soundwaveproject.authentication.dto.response.DeactivateStaffResponse;
import groupone.soundwaveproject.authentication.dto.response.StaffDirectoryPageResponse;
import groupone.soundwaveproject.authentication.dto.response.StaffSummaryResponse;
import groupone.soundwaveproject.authentication.entity.Staff;
import groupone.soundwaveproject.authentication.entity.StaffRole;
import groupone.soundwaveproject.authentication.exception.EmailAlreadyExistsException;
import groupone.soundwaveproject.authentication.repository.RefreshTokenRepository;
import groupone.soundwaveproject.authentication.repository.StaffRepository;
import groupone.soundwaveproject.authentication.repository.StaffRoleRepository;
import groupone.soundwaveproject.authentication.repository.UserRepository;
import groupone.soundwaveproject.exception.ConflictOperationException;
import groupone.soundwaveproject.exception.ForbiddenOperationException;
import groupone.soundwaveproject.exception.ResourceNotFoundException;
import groupone.soundwaveproject.moderation.service.ModerationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.*;

/**
 * Service xử lý các nghiệp vụ quản trị danh bạ tài khoản Staff dành cho Admin (UC-27: Manage Staff Accounts).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AdminStaffService {

    private final StaffRepository staffRepository;
    private final StaffRoleRepository staffRoleRepository;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final ModerationService moderationService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationMailService mailService;

    @Value("${app.staff.login-url:http://127.0.0.1:4174/#/staff/login}")
    private String staffLoginUrl;

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

    /**
     * Khởi tạo tài khoản nhân viên kiểm duyệt mới và gửi email thông tin đăng nhập (UC-27.2 & UC-23).
     *
     * @param request Dữ liệu tạo tài khoản Staff
     * @return DTO thông tin nhân viên vừa tạo kèm trạng thái gửi email
     */
    @Transactional
    public CreateStaffResponse createStaff(CreateStaffRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase(Locale.ROOT);
        String trimmedFullName = request.fullName().trim();

        log.info("Creating new staff account: email='{}', fullName='{}'", normalizedEmail, trimmedFullName);

        // 1. Kiểm tra tính duy nhất của email (BR-02, EX01)
        if (staffRepository.existsByEmailIgnoreCase(normalizedEmail) ||
                userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            log.warn("Attempt to create staff with already registered email: {}", normalizedEmail);
            throw new EmailAlreadyExistsException();
        }

        // 2. Tìm hoặc khởi tạo vai trò STAFF
        StaffRole staffRole = staffRoleRepository.findByCode("STAFF")
                .orElseGet(() -> staffRoleRepository.save(new StaffRole("STAFF", "Staff", "Nhân viên vận hành và kiểm duyệt nội dung SoundWave")));

        // 3. Khởi tạo mật khẩu tài khoản theo định dạng bảo mật chuẩn SoundWave (BR-Staff-01, BR-Staff-02)
        // Quản trị viên không đặt mật khẩu thủ công; hệ thống tự sinh 100% để đảm bảo an toàn thông tin
        String rawPassword = generateStandardizedStaffPassword();

        // 4. Mã hóa mật khẩu và lưu nhân viên với trạng thái ACTIVE (BR-01, POST-1)
        String encodedPassword = passwordEncoder.encode(rawPassword);
        Staff staff = new Staff(staffRole, normalizedEmail, encodedPassword, trimmedFullName);
        staff.setStatus("ACTIVE");
        Staff savedStaff = staffRepository.save(staff);

        log.info("Staff account persisted in database: id={}, email={}", savedStaff.getId(), savedStaff.getEmail());

        // 5. Kích hoạt UC-23: Gửi email cấp thông tin đăng nhập
        boolean emailDispatched = mailService.sendStaffCredentials(
                savedStaff.getEmail(),
                savedStaff.getFullName(),
                rawPassword,
                staffLoginUrl
        );

        if (!emailDispatched) {
            log.warn("Staff account created (id={}), but UC-23 email sending encountered an SMTP error (EX02). Standardized password returned for manual handover.", savedStaff.getId());
        }

        return new CreateStaffResponse(
                savedStaff.getId(),
                savedStaff.getEmail(),
                savedStaff.getFullName(),
                savedStaff.getRole().getCode(),
                savedStaff.getRole().getName(),
                savedStaff.getStatus(),
                rawPassword,
                emailDispatched,
                savedStaff.getCreatedAt()
        );
    }

    /**
     * Vô hiệu hóa tài khoản nhân viên kiểm duyệt (UC-27.3: Deactivate Staff Account).
     * <p>
     * - PRE-2: Tài khoản phải ở trạng thái ACTIVE (EX02: nếu đã INACTIVE thì báo lỗi xung đột).
     * - POST-1: Trạng thái tài khoản chuyển sang INACTIVE.
     * - POST-2: Thu hồi (revoke) toàn bộ refresh token và phiên đăng nhập đang hoạt động của nhân viên.
     * - POST-3: Ghi nhận lý do và thời điểm vô hiệu hóa vào nhật ký kiểm toán quản trị.
     *
     * @param staffId ID của tài khoản nhân viên
     * @param request DTO chứa lý do vô hiệu hóa (bắt buộc theo EX01)
     * @return DTO xác nhận kết quả vô hiệu hóa
     */
    @Transactional
    public DeactivateStaffResponse deactivateStaff(Long staffId, DeactivateStaffRequest request) {
        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff account not found with ID: " + staffId));

        // Không cho phép vô hiệu hóa tài khoản Quản trị viên
        if ("ADMIN".equalsIgnoreCase(staff.getRole().getCode())) {
            throw new ForbiddenOperationException("Administrator accounts cannot be deactivated through staff management.");
        }

        // EX02: Xung đột trạng thái nếu tài khoản đã ở trạng thái INACTIVE
        if ("INACTIVE".equalsIgnoreCase(staff.getStatus())) {
            throw new ConflictOperationException("This staff account is already inactive.");
        }

        String trimmedReason = request.reason().trim();
        LocalDateTime now = LocalDateTime.now(ZoneOffset.UTC);

        // 1. Chuyển trạng thái sang INACTIVE (POST-1)
        staff.setStatus("INACTIVE");
        Staff updatedStaff = staffRepository.save(staff);

        // 2. Thu hồi toàn bộ phiên đăng nhập đang hoạt động (POST-2)
        int revokedTokens = refreshTokenRepository.revokeAllActiveByStaffId(staffId, now);

        // 3. Ghi log kiểm toán lý do và thời điểm vô hiệu hóa (POST-3)
        log.warn("Staff account deactivated by Admin: staffId={}, email='{}', revokedTokens={}, reason='{}', timestamp={}",
                staffId, updatedStaff.getEmail(), revokedTokens, trimmedReason, now);

        return new DeactivateStaffResponse(
                updatedStaff.getId(),
                updatedStaff.getEmail(),
                updatedStaff.getFullName(),
                updatedStaff.getRole().getCode(),
                updatedStaff.getStatus(),
                trimmedReason,
                now
        );
    }

    /**
     * Sinh mật khẩu tài khoản nhân viên theo định dạng chuẩn nhận diện tổ chức SoundWave:
     * Định dạng: "SW@" + 6 ký tự ngẫu nhiên (chữ hoa/chữ thường/chữ số) + "!" + 2 số ngẫu nhiên.
     * Ví dụ: "SW@K8xP3m!74"
     * <p>
     * - Độ dài: 12 ký tự
     * - Đáp ứng đầy đủ tiêu chuẩn bảo mật (chữ hoa, chữ thường, số, ký tự đặc biệt)
     * - Loại trừ các ký tự dễ nhầm lẫn (O/0, l/1/I) để hỗ trợ nhân viên nhập liệu chính xác.
     */
    private String generateStandardizedStaffPassword() {
        String upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
        String lower = "abcdefghjkmnpqrstuvwxyz";
        String digits = "23456789";
        String alphanum = upper + lower + digits;

        SecureRandom random = new SecureRandom();
        StringBuilder body = new StringBuilder(6);
        // Đảm bảo ít nhất có 1 chữ hoa, 1 chữ thường và 1 chữ số trong phần thân
        body.append(upper.charAt(random.nextInt(upper.length())));
        body.append(lower.charAt(random.nextInt(lower.length())));
        body.append(digits.charAt(random.nextInt(digits.length())));

        for (int i = 3; i < 6; i++) {
            body.append(alphanum.charAt(random.nextInt(alphanum.length())));
        }

        // Trộn ngẫu nhiên phần thân 6 ký tự
        List<Character> bodyChars = new ArrayList<>();
        for (char c : body.toString().toCharArray()) {
            bodyChars.add(c);
        }
        Collections.shuffle(bodyChars, random);

        StringBuilder bodyShuffled = new StringBuilder();
        for (char c : bodyChars) {
            bodyShuffled.append(c);
        }

        // Tạo 2 chữ số đuôi
        int suffixDigits = 10 + random.nextInt(90); // 10..99

        return "SW@" + bodyShuffled + "!" + suffixDigits;
    }
}
