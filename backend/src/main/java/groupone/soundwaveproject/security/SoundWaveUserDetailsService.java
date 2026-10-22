package groupone.soundwaveproject.security;

import lombok.RequiredArgsConstructor;
import groupone.soundwaveproject.authentication.entity.Staff;
import groupone.soundwaveproject.authentication.entity.User;
import groupone.soundwaveproject.authentication.entity.UserStatus;
import groupone.soundwaveproject.authentication.repository.StaffRepository;
import groupone.soundwaveproject.authentication.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SoundWaveUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;
    private final StaffRepository staffRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // 1. Kiểm tra tài khoản Staff trước (Admin, Content Moderator, Staff)
        Optional<Staff> staffOpt = staffRepository.findByEmailIgnoreCase(email);
        if (staffOpt.isPresent()) {
            Staff staff = staffOpt.get();
            List<SimpleGrantedAuthority> authorities = new ArrayList<>();
            if (staff.getRole() != null) {
                authorities.add(new SimpleGrantedAuthority("ROLE_" + staff.getRole().getCode()));
            }
            authorities.add(new SimpleGrantedAuthority("ROLE_STAFF"));

            return org.springframework.security.core.userdetails.User.withUsername(staff.getEmail())
                    .password(staff.getPasswordHash())
                    .authorities(authorities)
                    .disabled(!"ACTIVE".equalsIgnoreCase(staff.getStatus()))
                    .accountLocked("BANNED".equalsIgnoreCase(staff.getStatus()))
                    .build();
        }

        // 2. Kiểm tra tài khoản Người nghe / Nghệ sĩ
        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            return org.springframework.security.core.userdetails.User.withUsername(user.getEmail())
                    .password(user.getPasswordHash())
                    .authorities(List.of(
                            new SimpleGrantedAuthority("ROLE_LISTENER"),
                            new SimpleGrantedAuthority("ROLE_USER")
                    ))
                    .disabled(user.getDeletedAt() != null)
                    .accountLocked(user.getStatus() == UserStatus.BANNED)
                    .build();
        }

        throw new UsernameNotFoundException("User was not found with email: " + email);
    }
}
