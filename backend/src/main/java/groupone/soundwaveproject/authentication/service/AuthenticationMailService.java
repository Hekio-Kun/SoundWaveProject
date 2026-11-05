package groupone.soundwaveproject.authentication.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthenticationMailService {
    private final JavaMailSender mailSender;

    @Value("${app.mail.from:magicinema.system@gmail.com}")
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

    /**
     * Gửi email tự động chứa thông tin đăng nhập ban đầu cho nhân viên Staff mới tạo (UC-23: Send Account Credential Email).
     *
     * @param recipient         Email của nhân viên nhận tài khoản
     * @param fullName          Họ tên hiển thị của nhân viên
     * @param temporaryPassword Mật khẩu tạm thời ban đầu
     * @param loginUrl          Đường dẫn tới trang đăng nhập nhân viên
     * @return true nếu gửi email thành công; false nếu gặp sự cố kết nối SMTP (EX01)
     */
    public boolean sendStaffCredentials(String recipient, String fullName, String temporaryPassword, String loginUrl) {
        log.info("Dispatching staff account credential email to: {}", recipient);
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(fromAddress);
            helper.setTo(recipient);
            helper.setSubject("Welcome to SoundWave - Your Staff Account Credentials");

            String plainText = buildStaffCredentialsPlainText(fullName, recipient, temporaryPassword, loginUrl);
            String htmlContent = buildStaffCredentialsHtml(fullName, recipient, temporaryPassword, loginUrl);

            helper.setText(plainText, htmlContent);
            mailSender.send(mimeMessage);

            log.info("Successfully dispatched staff credential email to: {}", recipient);
            return true;
        } catch (Exception e) {
            // EX01: SMTP connection or delivery timeout / Mail server error
            log.error("Failed to dispatch staff credential email to {}: {}. Scheduled manual handover may be required.",
                    recipient, e.getMessage(), e);
            return false;
        }
    }

    private String buildStaffCredentialsPlainText(String fullName, String recipient, String temporaryPassword, String loginUrl) {
        return """
                Hello %s,

                Welcome to the SoundWave Team! Your Moderator Staff account has been created by the System Administrator.

                Account Details:
                - Username / Email: %s
                - Account Password: %s
                - Staff Login Portal: %s

                Security Reminder:
                Please store your account password safely and keep it confidential. SoundWave administrators will never ask for your password. You can use these credentials to log in to the Content Moderation Portal.

                Best regards,
                SoundWave Operations Team
                """.formatted(fullName, recipient, temporaryPassword, loginUrl);
    }

    private String buildStaffCredentialsHtml(String fullName, String recipient, String temporaryPassword, String loginUrl) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="UTF-8">
                  <title>SoundWave Staff Credentials</title>
                </head>
                <body style="margin: 0; padding: 32px 16px; background-color: #F6EFE3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1C1917;">
                  <div style="max-width: 560px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E8DCCB; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);">
                    <div style="background-color: #0284C7; padding: 24px 32px; text-align: center; color: #FFFFFF;">
                      <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">SoundWave</h1>
                      <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">Staff &amp; Content Moderation Workspace</p>
                    </div>
                    <div style="padding: 32px;">
                      <h2 style="margin-top: 0; font-size: 20px; font-weight: 700; color: #1C1917;">Welcome to the Team, %s!</h2>
                      <p style="font-size: 14px; line-height: 1.6; color: #57534E;">
                        Your SoundWave Moderator Staff account has been successfully provisioned by the System Administrator. You can now access the staff portal to moderate incoming tracks, resolve content reports, and maintain catalog quality.
                      </p>
                      
                      <div style="margin: 24px 0; padding: 20px; background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px;">
                        <span style="display: block; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; color: #64748B; margin-bottom: 12px;">Your Login Credentials</span>
                        <table style="width: 100%%; font-size: 14px; border-collapse: collapse;">
                          <tr>
                            <td style="padding: 6px 0; color: #64748B; width: 140px;">Portal Login:</td>
                            <td style="padding: 6px 0; font-weight: 600; color: #0F172A;">%s</td>
                          </tr>
                          <tr>
                            <td style="padding: 6px 0; color: #64748B;">Account Password:</td>
                            <td style="padding: 6px 0;">
                              <code style="font-family: monospace; font-size: 16px; font-weight: 700; color: #0284C7; background-color: #E0F2FE; padding: 3px 8px; border-radius: 6px;">%s</code>
                            </td>
                          </tr>
                        </table>
                      </div>

                      <div style="text-align: center; margin: 32px 0 24px;">
                        <a href="%s" target="_blank" style="display: inline-block; background-color: #0284C7; color: #FFFFFF; font-size: 14px; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 10px; box-shadow: 0 2px 8px rgba(2, 132, 199, 0.3);">
                          Log In to Staff Portal &rarr;
                        </a>
                      </div>

                      <div style="border-top: 1px solid #F1F5F9; padding-top: 20px; margin-top: 24px;">
                        <p style="font-size: 12px; line-height: 1.5; color: #8D877F; margin: 0;">
                          <strong style="color: #57534E;">Important Security Note:</strong> Please store your account password safely and keep it confidential. These credentials grant access to the SoundWave Content Moderation Portal. SoundWave staff will never ask you for your password.
                        </p>
                      </div>
                    </div>
                    <div style="background-color: #FAFAF9; border-top: 1px solid #E8DCCB; padding: 16px 32px; text-align: center; font-size: 11px; color: #A8A29E;">
                      &copy; 2026 SoundWave Streaming Music Platform &bull; Automated System Dispatch (UC-23)
                    </div>
                  </div>
                </body>
                </html>
                """.formatted(fullName, recipient, temporaryPassword, loginUrl);
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
