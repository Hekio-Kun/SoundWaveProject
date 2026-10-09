package groupone.soundwaveproject.authentication.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationMailService {
    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromAddress;

    /**
     * Gửi mã OTP dùng một lần để xác thực email đăng ký.
     */
    public void sendVerificationOtp(String recipient, String displayName, String otp, long expirationMinutes) {
        send(recipient, "Verify your SoundWave email",
                "Hello %s,%n%nYour SoundWave verification code is: %s%n%nThis code expires in %d minutes."
                        .formatted(displayName, otp, expirationMinutes));
    }

    /**
     * Gửi mã OTP dùng một lần để đặt lại mật khẩu.
     */
    public void sendPasswordResetOtp(String recipient, String otp, long expirationMinutes) {
        send(recipient, "Reset your SoundWave password",
                "Your SoundWave password reset code is: %s%n%nThis code expires in %d minutes. If you did not request it, ignore this email."
                        .formatted(otp, expirationMinutes));
    }

    /**
     * Gửi thông báo khi có yêu cầu đăng ký bằng email đã tồn tại để chống Account Enumeration và bảo vệ tài khoản.
     */
    public void sendAccountAlreadyExistsNotice(String recipient) {
        send(recipient, "SoundWave account registration attempt",
                "Hello,%n%nSomeone recently attempted to create a new SoundWave account using your email address (%s).%n%nBecause you already have an active SoundWave account, no new account was created.%n%nIf this was you, you can log in directly or reset your password if you forgot it.%n%nIf you did not make this request, you can safely ignore this email. Your account is secure."
                        .formatted(recipient));
    }

    /**
     * Gửi mã OTP dùng một lần để mở khóa tài khoản bị khóa tạm thời.
     */
    public void sendAccountUnlockOtp(String recipient, String otp, long expirationMinutes) {
        send(recipient, "Unlock your SoundWave account",
                "Hello,%n%nYour SoundWave emergency account unlock code is: %s%n%nThis code expires in %d minutes. Enter this code to immediately unlock your account. If you did not request this, please ignore this email."
                        .formatted(otp, expirationMinutes));
    }

    private void send(String recipient, String subject, String content) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(recipient);
        message.setSubject(subject);
        message.setText(content);
        mailSender.send(message);
    }
}
