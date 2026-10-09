package groupone.soundwaveproject.authentication.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import groupone.soundwaveproject.authentication.dto.request.EmailOtpRequest;
import groupone.soundwaveproject.authentication.dto.request.EmailRequest;
import groupone.soundwaveproject.authentication.dto.request.LoginRequest;
import groupone.soundwaveproject.authentication.dto.request.RegisterRequest;
import groupone.soundwaveproject.authentication.dto.request.ResetPasswordRequest;
import groupone.soundwaveproject.authentication.dto.response.AuthResponse;
import groupone.soundwaveproject.authentication.dto.response.LoginResult;
import groupone.soundwaveproject.authentication.dto.response.MessageResponse;
import groupone.soundwaveproject.authentication.entity.AccountUnlockToken;
import groupone.soundwaveproject.authentication.entity.AppUser;
import groupone.soundwaveproject.authentication.entity.EmailVerificationToken;
import groupone.soundwaveproject.authentication.entity.PasswordResetToken;
import groupone.soundwaveproject.authentication.entity.RefreshToken;
import groupone.soundwaveproject.authentication.entity.Role;
import groupone.soundwaveproject.authentication.entity.UserProfile;
import groupone.soundwaveproject.authentication.entity.UserStatus;
import groupone.soundwaveproject.authentication.exception.AccountBannedException;
import groupone.soundwaveproject.authentication.exception.AccountUnavailableException;
import groupone.soundwaveproject.authentication.exception.EmailAlreadyExistsException;
import groupone.soundwaveproject.authentication.exception.EmailNotVerifiedException;
import groupone.soundwaveproject.authentication.exception.InvalidCredentialsException;
import groupone.soundwaveproject.authentication.exception.InvalidOtpException;
import groupone.soundwaveproject.authentication.exception.InvalidRefreshTokenException;
import groupone.soundwaveproject.authentication.mapper.AuthenticationMapper;
import groupone.soundwaveproject.authentication.repository.AccountUnlockTokenRepository;
import groupone.soundwaveproject.authentication.repository.AppUserRepository;
import groupone.soundwaveproject.authentication.repository.EmailVerificationTokenRepository;
import groupone.soundwaveproject.authentication.repository.PasswordResetTokenRepository;
import groupone.soundwaveproject.authentication.repository.RefreshTokenRepository;
import groupone.soundwaveproject.authentication.repository.RoleRepository;
import groupone.soundwaveproject.authentication.repository.UserProfileRepository;
import groupone.soundwaveproject.security.JwtService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.Locale;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthenticationService {
    public static final long REFRESH_GRACE_PERIOD_SECONDS = 15;
    private static final String DEFAULT_ROLE = "LISTENER";
    private static final String RECOVERY_MESSAGE = "If the account exists, an OTP has been sent to the registered email.";

    private final AppUserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserProfileRepository profileRepository;
    private final EmailVerificationTokenRepository verificationTokenRepository;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final AccountUnlockTokenRepository unlockTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final OtpGenerator otpGenerator;
    private final TokenHashService tokenHashService;
    private final AuthenticationMailService mailService;
    private final JwtService jwtService;
    private final AuthenticationMapper mapper;
    private final AuthRateLimiterService authRateLimiterService;

    @Value("${app.auth.otp-expiration-minutes}")
    private long otpExpirationMinutes;
    @Value("${app.auth.otp-resend-seconds}")
    private long otpResendSeconds;
    @Value("${app.security.refresh-token-days}")
    private long refreshTokenDays;
    @Value("${app.security.remember-refresh-token-days}")
    private long rememberRefreshTokenDays;

    /**
     * Tạo tài khoản Listener ở trạng thái chờ và gửi OTP xác thực email.
     */
    @Transactional
    public MessageResponse register(RegisterRequest request, String clientIpAddress) {
        String email = normalizeEmail(request.email());
        if (!authRateLimiterService.tryAcquireRegistrationAttempt(email, clientIpAddress)) {
            throw new AccountUnavailableException(
                    "REGISTRATION_RATE_LIMITED",
                    "Too many registration attempts. Please wait a few minutes before trying again.");
        }
        if (!request.password().equals(request.confirmPassword())) {
            throw new AccountUnavailableException("PASSWORD_MISMATCH", "Password confirmation does not match.");
        }
        // SEC-03: Chống Account Enumeration theo chuẩn OWASP.
        // Luôn trả về phản hồi đồng nhất để kẻ tấn công không thể dò quét danh sách email tồn tại trong hệ thống.
        Optional<AppUser> existingUserOpt = userRepository.findByEmailIgnoreCase(email);
        if (existingUserOpt.isPresent()) {
            AppUser existing = existingUserOpt.get();
            if (existing.getEmailVerifiedAt() != null) {
                // Tài khoản đã kích hoạt: gửi email cảnh báo bảo mật tới chủ tài khoản
                mailService.sendAccountAlreadyExistsNotice(existing.getEmail());
                log.info("Registration attempted for already verified email: {}. Sent security notification email.", email);
            } else {
                // Tài khoản đã đăng ký nhưng chưa xác thực email: gửi lại mã OTP nếu thỏa mãn cooldown
                EmailVerificationToken current = verificationTokenRepository
                        .findFirstByUserIdAndUsedAtIsNullOrderByCreatedAtDesc(existing.getId()).orElse(null);
                if (isResendAllowed(current == null ? null : current.getCreatedAt())) {
                    if (current != null) current.markUsed(nowUtc());
                    authRateLimiterService.resetOtpAttempts(existing.getEmail());
                    String displayName = profileRepository.findByUserId(existing.getId())
                            .map(UserProfile::getDisplayName)
                            .orElse(request.displayName().trim());
                    createAndSendVerificationOtp(existing, displayName);
                    log.info("Registration attempted for unverified email: {}. Resent verification OTP.", email);
                } else {
                    log.info("Registration attempted for unverified email: {} within cooldown period. Skipped sending duplicate OTP.", email);
                }
            }
            return new MessageResponse("Registration successful. Enter the OTP sent to your email.");
        }

        Role role = roleRepository.findByCode(DEFAULT_ROLE)
                .orElseThrow(() -> new IllegalStateException("Default LISTENER role is missing"));
        AppUser user = userRepository.save(new AppUser(role, email, passwordEncoder.encode(request.password())));
        String username = createUniqueUsername(email, user.getId());
        profileRepository.save(new UserProfile(user, username, request.displayName().trim()));
        createAndSendVerificationOtp(user, request.displayName().trim());
        return new MessageResponse("Registration successful. Enter the OTP sent to your email.");
    }

    /**
     * Kiểm tra OTP và kích hoạt tài khoản sau khi xác thực email.
     */
    @Transactional
    public MessageResponse verifyEmail(EmailOtpRequest request) {
        AppUser user = findUser(request.email());
        if (user.getEmailVerifiedAt() != null) {
            return new MessageResponse("Email is already verified.");
        }
        if (authRateLimiterService.isOtpBlocked(user.getEmail())) {
            log.warn("Blocked OTP verification attempt for email {}: maximum failed attempts reached", user.getEmail());
            throw new InvalidOtpException("Too many failed attempts. This OTP code has been deactivated. Please request a new code.");
        }
        EmailVerificationToken token = verificationTokenRepository
                .findFirstByUserIdAndUsedAtIsNullOrderByCreatedAtDesc(user.getId())
                .orElseThrow(() -> new InvalidOtpException("No active verification code was found."));
        validateOtpWithAttempts(request.otp(), token.getTokenHash(), token.isUsed(), token.isExpired(nowUtc()),
                user.getEmail(), () -> token.markUsed(nowUtc()));
        LocalDateTime now = nowUtc();
        token.markUsed(now);
        user.verifyEmail(now);
        authRateLimiterService.resetOtpAttempts(user.getEmail());
        log.info("Email verified successfully for user ID: {} ({})", user.getId(), user.getEmail());
        return new MessageResponse("Email verified successfully. You can now log in.");
    }

    /**
     * Gửi lại OTP xác thực cho tài khoản chưa kích hoạt.
     */
    @Transactional
    public MessageResponse resendVerificationOtp(EmailRequest request) {
        AppUser user = findUser(request.email());
        if (user.getStatus() == UserStatus.BANNED) {
            throw new AccountBannedException();
        }
        if (user.getDeletedAt() != null) {
            throw new AccountUnavailableException("ACCOUNT_UNAVAILABLE", "This account is unavailable.");
        }
        if (user.getEmailVerifiedAt() != null) {
            throw new AccountUnavailableException("EMAIL_ALREADY_VERIFIED", "This email is already verified.");
        }
        EmailVerificationToken current = verificationTokenRepository
                .findFirstByUserIdAndUsedAtIsNullOrderByCreatedAtDesc(user.getId()).orElse(null);
        ensureResendAllowed(current == null ? null : current.getCreatedAt());
        if (current != null) current.markUsed(nowUtc());
        authRateLimiterService.resetOtpAttempts(user.getEmail());
        String displayName = profileRepository.findByUserId(user.getId())
                .map(UserProfile::getDisplayName).orElse("SoundWave user");
        createAndSendVerificationOtp(user, displayName);
        log.info("Resent verification OTP for user ID: {} ({})", user.getId(), user.getEmail());
        return new MessageResponse("A new verification OTP has been sent.");
    }

    /**
     * Xác thực thông tin đăng nhập và tạo phiên JWT theo vai trò của tài khoản.
     */
    @Transactional
    public LoginResult login(LoginRequest request) {
        String email = normalizeEmail(request.email());
        AppUser user = userRepository.findByEmailIgnoreCase(email).orElse(null);

        // 1. Kiểm tra trạng thái khóa trong DB
        if (user != null) {
            if (user.isTemporarilyLocked(nowUtc())) {
                long remainingSeconds = ChronoUnit.SECONDS.between(nowUtc(), user.getLockedUntil());
                long minutes = Math.max(1, (remainingSeconds + 59) / 60);
                log.warn("Blocked login attempt: email {} is TEMPORARILY_LOCKED in DB until {}", email, user.getLockedUntil());
                throw new AccountUnavailableException("LOGIN_LOCKED",
                        "Your account is temporarily locked for " + minutes + " more minute(s) due to multiple failed login attempts. You can wait or unlock immediately via email.");
            } else if (user.getStatus() == UserStatus.TEMPORARILY_LOCKED) {
                user.unlock();
                authRateLimiterService.resetLoginAttempts(email);
                log.info("Temporary lock expired for user {}. Account auto-unlocked.", email);
            }
        }

        // 2. Kiểm tra nếu Rate Limiter đang chặn
        if (authRateLimiterService.isLoginBlocked(email)) {
            log.warn("Blocked login attempt: email {} is temporarily locked out in RateLimiter", email);
            throw new AccountUnavailableException("LOGIN_LOCKED",
                    "Too many failed login attempts. Your account is temporarily locked for 10 minutes. You can wait or unlock immediately via email.");
        }

        // 3. Kiểm tra thông tin đăng nhập
        if (user == null || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            int failed = authRateLimiterService.recordFailedLogin(email);
            int remaining = authRateLimiterService.getRemainingLoginAttempts(email);
            log.warn("Failed login attempt #{} for email: {}. Remaining attempts before lockout: {}", failed, email, remaining);

            if (remaining == 0) {
                if (user != null) {
                    LocalDateTime lockedUntil = nowUtc().plusSeconds(AuthRateLimiterService.LOGIN_LOCKOUT_SECONDS);
                    user.lockTemporarily(lockedUntil);
                    log.warn("Account {} is now TEMPORARILY_LOCKED in DB until {}", email, lockedUntil);
                }
                throw new AccountUnavailableException("LOGIN_LOCKED",
                        "Too many failed login attempts. Your account is temporarily locked for 10 minutes. You can wait or unlock immediately via email.");
            }

            if (remaining <= 2) {
                throw new InvalidCredentialsException(
                        "Incorrect password. You have " + remaining + " attempt(s) remaining before your account is temporarily locked for 10 minutes.");
            }

            throw new InvalidCredentialsException();
        }

        ensureAccountCanLogin(user);
        authRateLimiterService.resetLoginAttempts(email);
        user.recordLogin(nowUtc());
        log.info("User {} logged in successfully with role {}", user.getEmail(), user.getRole().getCode());
        return createLoginResult(user, request.rememberMe());
    }

    /**
     * Gửi mã OTP mở khóa khẩn cấp về email nếu tài khoản đang bị khóa tạm thời.
     */
    @Transactional
    public MessageResponse requestUnlock(EmailRequest request) {
        String email = normalizeEmail(request.email());
        userRepository.findByEmailIgnoreCase(email).ifPresent(user -> {
            if (user.getStatus() != UserStatus.BANNED && user.getDeletedAt() == null) {
                if (user.isTemporarilyLocked(nowUtc()) || authRateLimiterService.isLoginBlocked(email)) {
                    AccountUnlockToken current = unlockTokenRepository
                            .findFirstByUserIdAndUsedAtIsNullOrderByCreatedAtDesc(user.getId()).orElse(null);
                    ensureResendAllowed(current == null ? null : current.getCreatedAt());
                    if (current != null) current.markUsed(nowUtc());

                    String otp = otpGenerator.generate();
                    unlockTokenRepository.save(new AccountUnlockToken(
                            user, passwordEncoder.encode(otp), nowUtc().plusMinutes(otpExpirationMinutes)));
                    authRateLimiterService.resetOtpAttempts(user.getEmail());
                    mailService.sendAccountUnlockOtp(user.getEmail(), otp, otpExpirationMinutes);
                    log.info("Sent emergency unlock OTP for user ID: {} ({})", user.getId(), user.getEmail());
                }
            }
        });
        return new MessageResponse("If your account is locked, an unlock OTP has been sent to your email.");
    }

    /**
     * Xác minh OTP và mở khóa tài khoản ngay lập tức.
     */
    @Transactional
    public MessageResponse unlockAccount(EmailOtpRequest request) {
        AppUser user = findUser(request.email());
        if (user.getStatus() == UserStatus.BANNED) {
            throw new AccountBannedException();
        }
        if (authRateLimiterService.isOtpBlocked(user.getEmail())) {
            log.warn("Blocked unlock OTP attempt for email {}: maximum failed attempts reached", user.getEmail());
            throw new InvalidOtpException("Too many failed attempts. This OTP code has been deactivated. Please request a new code.");
        }

        AccountUnlockToken token = unlockTokenRepository
                .findFirstByUserIdAndUsedAtIsNullOrderByCreatedAtDesc(user.getId())
                .orElseThrow(() -> new InvalidOtpException("No active unlock code was found."));

        validateOtpWithAttempts(request.otp(), token.getTokenHash(), token.isUsed(), token.isExpired(nowUtc()),
                user.getEmail(), () -> token.markUsed(nowUtc()));

        LocalDateTime now = nowUtc();
        token.markUsed(now);
        user.unlock();
        authRateLimiterService.resetLoginAttempts(user.getEmail());
        authRateLimiterService.resetOtpAttempts(user.getEmail());
        log.info("Account successfully unlocked via OTP for user ID: {} ({})", user.getId(), user.getEmail());
        return new MessageResponse("Your account has been successfully unlocked. You can now log in.");
    }

    /**
     * Gửi OTP đặt lại mật khẩu mà không tiết lộ email có tồn tại hay không.
     */
    @Transactional
    public MessageResponse forgotPassword(EmailRequest request) {
        userRepository.findByEmailIgnoreCase(normalizeEmail(request.email())).ifPresent(user -> {
            if ((user.getStatus() == UserStatus.ACTIVE || user.getStatus() == UserStatus.TEMPORARILY_LOCKED)
                    && user.getDeletedAt() == null) {
                PasswordResetToken current = resetTokenRepository
                        .findFirstByUserIdAndUsedAtIsNullOrderByCreatedAtDesc(user.getId()).orElse(null);
                ensureResendAllowed(current == null ? null : current.getCreatedAt());
                if (current != null) current.markUsed(nowUtc());
                String otp = otpGenerator.generate();
                resetTokenRepository.save(new PasswordResetToken(
                        user, passwordEncoder.encode(otp), nowUtc().plusMinutes(otpExpirationMinutes)));
                authRateLimiterService.resetOtpAttempts(user.getEmail());
                mailService.sendPasswordResetOtp(user.getEmail(), otp, otpExpirationMinutes);
                log.info("Sent password reset OTP for user ID: {} ({})", user.getId(), user.getEmail());
            }
        });
        return new MessageResponse(RECOVERY_MESSAGE);
    }

    /**
     * Xác minh OTP và thay đổi mật khẩu tài khoản trong một transaction.
     */
    @Transactional
    public MessageResponse resetPassword(ResetPasswordRequest request) {
        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new AccountUnavailableException("PASSWORD_MISMATCH", "Password confirmation does not match.");
        }
        AppUser user = findUser(request.email());
        if (authRateLimiterService.isOtpBlocked(user.getEmail())) {
            log.warn("Blocked password reset attempt for email {}: maximum failed attempts reached", user.getEmail());
            throw new InvalidOtpException("Too many failed attempts. This OTP code has been deactivated. Please request a new code.");
        }
        PasswordResetToken token = resetTokenRepository
                .findFirstByUserIdAndUsedAtIsNullOrderByCreatedAtDesc(user.getId())
                .orElseThrow(() -> new InvalidOtpException("No active password reset code was found."));
        validateOtpWithAttempts(request.otp(), token.getTokenHash(), token.isUsed(), token.isExpired(nowUtc()),
                user.getEmail(), () -> token.markUsed(nowUtc()));
        LocalDateTime now = nowUtc();
        token.markUsed(now);
        user.changePassword(passwordEncoder.encode(request.newPassword()), now);
        user.unlock();
        refreshTokenRepository.revokeAllActiveByUserId(user.getId(), now);
        authRateLimiterService.resetLoginAttempts(user.getEmail());
        authRateLimiterService.resetOtpAttempts(user.getEmail());
        log.info("Password reset successfully for user ID: {} ({}). All active sessions revoked.", user.getId(), user.getEmail());
        return new MessageResponse("Password updated successfully. Please log in again.");
    }

    /**
     * Cấp access token mới bằng refresh token hợp lệ và xoay refresh token.
     */
    @Transactional
    public LoginResult refresh(String rawRefreshToken) {
        RefreshToken stored = refreshTokenRepository.findByTokenHash(tokenHashService.hash(rawRefreshToken))
                .orElseThrow(InvalidRefreshTokenException::new);
        LocalDateTime now = nowUtc();

        if (stored.getRevokedAt() != null) {
            long secondsSinceRevocation = ChronoUnit.SECONDS.between(stored.getRevokedAt(), now);

            // SEC-05: Grace Period cho trường hợp nhiều request đồng thời trong React SPA (15s)
            if (secondsSinceRevocation >= 0 && secondsSinceRevocation <= REFRESH_GRACE_PERIOD_SECONDS) {
                log.info("Concurrent refresh request within grace period ({}s) for user ID: {}. Returning active session.",
                        secondsSinceRevocation, stored.getUser().getId());
                RefreshToken activeSession = refreshTokenRepository
                        .findFirstByUserIdAndRevokedAtIsNullAndExpiresAtAfterOrderByCreatedAtDesc(stored.getUser().getId(), now)
                        .orElse(null);
                if (activeSession != null) {
                    ensureAccountCanLogin(stored.getUser());
                    UserProfile profile = profileRepository.findByUserId(stored.getUser().getId()).orElse(null);
                    String displayName = profile == null ? stored.getUser().getEmail() : profile.getDisplayName();
                    String avatarUrl = profile == null ? null : profile.getAvatarUrl();
                    AuthResponse response = new AuthResponse(
                            jwtService.createAccessToken(stored.getUser(), activeSession.getId()),
                            "Bearer", jwtService.getAccessTokenSeconds(),
                            mapper.toUserResponse(stored.getUser(), displayName, avatarUrl));
                    return new LoginResult(response, rawRefreshToken, refreshTokenDays * 24 * 60 * 60);
                }
            }

            // SEC-04: Token Reuse Detection (OAuth 2.0 Family Revocation)
            log.warn("SECURITY ALERT: Refresh token reuse detected for user ID: {} (Email: {}). Revoked {}s ago. Inactivating all active sessions!",
                    stored.getUser().getId(), stored.getUser().getEmail(), secondsSinceRevocation);
            refreshTokenRepository.revokeAllActiveByUserId(stored.getUser().getId(), now);
            throw new InvalidRefreshTokenException();
        }

        if (stored.getExpiresAt().isBefore(now)) {
            log.warn("Refresh token expired for user ID: {}", stored.getUser().getId());
            throw new InvalidRefreshTokenException();
        }

        ensureAccountCanLogin(stored.getUser());
        stored.revoke(now);
        return createLoginResult(stored.getUser(), false);
    }

    /**
     * Thu hồi refresh token hiện tại khi người dùng đăng xuất.
     */
    @Transactional
    public void logout(String rawRefreshToken) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) return;
        refreshTokenRepository.findByTokenHash(tokenHashService.hash(rawRefreshToken))
                .filter(token -> token.getRevokedAt() == null)
                .ifPresent(token -> {
                    token.revoke(nowUtc());
                    Long userId = token.getUser() == null ? null : token.getUser().getId();
                    log.info("Session revoked for user ID: {}", userId);
                });
    }

    private LoginResult createLoginResult(AppUser user, boolean rememberMe) {
        long days = rememberMe ? rememberRefreshTokenDays : refreshTokenDays;
        String rawRefreshToken = generateRefreshToken();
        RefreshToken session = refreshTokenRepository.save(new RefreshToken(
                user, tokenHashService.hash(rawRefreshToken), nowUtc().plusDays(days)));
        UserProfile profile = profileRepository.findByUserId(user.getId()).orElse(null);
        String displayName = profile == null ? user.getEmail() : profile.getDisplayName();
        String avatarUrl = profile == null ? null : profile.getAvatarUrl();
        AuthResponse response = new AuthResponse(
                jwtService.createAccessToken(user, session.getId()), "Bearer", jwtService.getAccessTokenSeconds(),
                mapper.toUserResponse(user, displayName, avatarUrl));
        return new LoginResult(response, rawRefreshToken, days * 24 * 60 * 60);
    }

    private void createAndSendVerificationOtp(AppUser user, String displayName) {
        String otp = otpGenerator.generate();
        verificationTokenRepository.save(new EmailVerificationToken(
                user, passwordEncoder.encode(otp), nowUtc().plusMinutes(otpExpirationMinutes)));
        mailService.sendVerificationOtp(user.getEmail(), displayName, otp, otpExpirationMinutes);
    }

    private void validateOtpWithAttempts(String otp, String hash, boolean used, boolean expired, String email, Runnable onExceeded) {
        if (used) throw new InvalidOtpException("This OTP has already been used.");
        if (expired) throw new InvalidOtpException("This OTP has expired. Request a new code.");
        if (!passwordEncoder.matches(otp, hash)) {
            int failed = authRateLimiterService.recordFailedOtpAttempt(email);
            int remaining = authRateLimiterService.getRemainingOtpAttempts(email);
            log.warn("Incorrect OTP entered for email: {}. Failed attempts: {}/{}", email, failed, AuthRateLimiterService.MAX_FAILED_OTP_ATTEMPTS);
            if (failed >= AuthRateLimiterService.MAX_FAILED_OTP_ATTEMPTS) {
                onExceeded.run();
                log.warn("Deactivated OTP for email: {} due to exceeding max attempts ({})", email, failed);
                throw new InvalidOtpException("Too many failed attempts. This OTP code has been deactivated. Please request a new code.");
            }
            throw new InvalidOtpException("The OTP is incorrect. You have " + remaining + " attempt(s) remaining.");
        }
    }

    private void validateOtp(String otp, String hash, boolean used, boolean expired) {
        validateOtpWithAttempts(otp, hash, used, expired, "", () -> {});
    }

    private void ensureResendAllowed(LocalDateTime createdAt) {
        if (!isResendAllowed(createdAt)) {
            long remaining = createdAt == null ? otpResendSeconds : Math.max(1, otpResendSeconds - ChronoUnit.SECONDS.between(createdAt, nowUtc()));
            throw new AccountUnavailableException("OTP_RATE_LIMITED",
                    "Please wait " + remaining + " seconds before requesting another OTP.");
        }
    }

    private boolean isResendAllowed(LocalDateTime createdAt) {
        return createdAt == null || ChronoUnit.SECONDS.between(createdAt, nowUtc()) >= otpResendSeconds;
    }

    private void ensureAccountCanLogin(AppUser user) {
        if (user.getStatus() == UserStatus.BANNED) {
            throw new AccountBannedException();
        }
        if (user.getDeletedAt() != null) {
            throw new AccountUnavailableException("ACCOUNT_UNAVAILABLE", "This account is unavailable.");
        }
        if (user.isTemporarilyLocked(nowUtc())) {
            long remainingSeconds = ChronoUnit.SECONDS.between(nowUtc(), user.getLockedUntil());
            long minutes = Math.max(1, (remainingSeconds + 59) / 60);
            throw new AccountUnavailableException("LOGIN_LOCKED",
                    "Your account is temporarily locked for " + minutes + " more minute(s) due to multiple failed login attempts. You can wait or unlock immediately via email.");
        }
        if (user.getStatus() != UserStatus.ACTIVE || user.getEmailVerifiedAt() == null) {
            throw new EmailNotVerifiedException();
        }
    }

    private AppUser findUser(String email) {
        return userRepository.findByEmailIgnoreCase(normalizeEmail(email))
                .orElseThrow(() -> new AccountUnavailableException("ACCOUNT_NOT_FOUND", "Account was not found."));
    }

    private String createUniqueUsername(String email, Long userId) {
        String localPart = email.substring(0, email.indexOf('@')).toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9_]", "");
        String normalized = localPart.isBlank() ? "user" : localPart;
        String base = normalized.substring(0, Math.min(29, normalized.length()));
        String candidate = base;
        if (profileRepository.existsByUsername(candidate)) candidate = base + "_" + userId;
        return candidate;
    }

    private String generateRefreshToken() {
        byte[] bytes = new byte[48];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private LocalDateTime nowUtc() {
        return LocalDateTime.now(ZoneOffset.UTC);
    }
}
