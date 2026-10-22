package groupone.soundwaveproject.authentication.service;

import lombok.RequiredArgsConstructor;
import groupone.soundwaveproject.authentication.entity.Staff;
import groupone.soundwaveproject.authentication.entity.User;
import groupone.soundwaveproject.authentication.entity.UserStatus;
import groupone.soundwaveproject.authentication.repository.RefreshTokenRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Service
@RequiredArgsConstructor
public class AuthenticationSessionService {
    private final RefreshTokenRepository refreshTokenRepository;

    /**
     * Kiểm tra phiên được liên kết với access token còn hợp lệ cho đúng tài khoản (User hoặc Staff).
     */
    @Transactional(readOnly = true)
    public boolean isSessionActive(Long sessionId, String email) {
        if (sessionId == null || email == null || email.isBlank()) return false;
        LocalDateTime now = LocalDateTime.now(ZoneOffset.UTC);
        return refreshTokenRepository.findById(sessionId)
                .filter(token -> token.isUsable(now))
                .filter(token -> {
                    if (token.getStaff() != null) {
                        Staff staff = token.getStaff();
                        return "ACTIVE".equalsIgnoreCase(staff.getStatus()) &&
                                staff.getEmail().equalsIgnoreCase(email);
                    }
                    if (token.getUser() != null) {
                        User user = token.getUser();
                        return user.getDeletedAt() == null &&
                                user.getStatus() == UserStatus.ACTIVE &&
                                user.getEmailVerifiedAt() != null &&
                                user.getEmail().equalsIgnoreCase(email);
                    }
                    return false;
                })
                .isPresent();
    }
}
