package groupone.soundwaveproject.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import groupone.soundwaveproject.authentication.entity.Staff;
import groupone.soundwaveproject.authentication.entity.StaffRole;
import groupone.soundwaveproject.authentication.repository.StaffRoleRepository;
import groupone.soundwaveproject.authentication.repository.StaffRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

/**
 * Tự động khởi tạo vai trò và tài khoản nhân viên mặc định (Admin, Staff) khi hệ thống khởi động.
 */
@Slf4j
@Component
@Order(1)
@RequiredArgsConstructor
public class AdminUserInitializer implements ApplicationRunner {
    private final StaffRoleRepository staffRoleRepository;
    private final StaffRepository staffRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.auto-create:true}")
    private boolean adminAutoCreate;

    @Value("${app.admin.email:admin@soundwave.com}")
    private String adminEmail;

    @Value("${app.admin.password:Admin@123456}")
    private String adminPassword;

    @Value("${app.admin.display-name:System Administrator}")
    private String adminDisplayName;

    @Value("${app.staff.auto-create:true}")
    private boolean staffAutoCreate;

    @Value("${app.staff.email:staff@soundwave.com}")
    private String staffEmail;

    @Value("${app.staff.password:Admin@123456}")
    private String staffPassword;

    @Value("${app.staff.display-name:Content Moderator}")
    private String staffDisplayName;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        initStaffRoles();
        if (adminAutoCreate) {
            initStaffAccount("ADMIN", adminEmail, adminPassword, adminDisplayName);
        }
        if (staffAutoCreate) {
            initStaffAccount("STAFF", staffEmail, staffPassword, staffDisplayName);
        }
    }

    private void initStaffRoles() {
        createStaffRoleIfAbsent("ADMIN", "Administrator", "Quản trị viên toàn quyền hệ thống SoundWave");
        createStaffRoleIfAbsent("STAFF", "Staff", "Nhân viên vận hành và kiểm duyệt nội dung SoundWave");
    }

    private void createStaffRoleIfAbsent(String code, String name, String description) {
        if (staffRoleRepository.findByCode(code).isEmpty()) {
            staffRoleRepository.save(new StaffRole(code, name, description));
            log.info("Initialized default staff role: {}", code);
        }
    }

    private void initStaffAccount(
            String roleCode,
            String email,
            String password,
            String displayName) {
        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
        if (staffRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            log.info("Staff {} account already exists with email: {}", roleCode, normalizedEmail);
            return;
        }

        StaffRole role = staffRoleRepository.findByCode(roleCode)
                .orElseThrow(() -> new IllegalStateException(roleCode + " staff role could not be found"));

        Staff staff = new Staff(role, normalizedEmail, passwordEncoder.encode(password), displayName.trim(), null);
        staffRepository.save(staff);

        log.info("Successfully created default {} staff account (Email: {}, Name: {})",
                roleCode, normalizedEmail, displayName);
    }
}
