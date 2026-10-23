package groupone.soundwaveproject.moderation.service;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Service gửi email thông báo kết quả kiểm duyệt bài hát tới nghệ sĩ/tác giả (UC-24: Manage Track Moderation).
 */
@Service
@RequiredArgsConstructor
public class ModerationMailService {
    private static final Logger log = LoggerFactory.getLogger(ModerationMailService.class);

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromAddress;

    /**
     * Gửi email thông báo bài hát đã được phê duyệt và xuất bản công khai lên hệ thống (UC-24.2 Approve Track).
     *
     * @param recipient   Địa chỉ email người nhận (nghệ sĩ/tác giả)
     * @param displayName Tên hiển thị của nghệ sĩ
     * @param trackTitle  Tiêu đề bài hát được phê duyệt
     */
    public void sendTrackApprovedEmail(String recipient, String displayName, String trackTitle) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(recipient);
            message.setSubject("Your track \"" + trackTitle + "\" has been approved!");
            message.setText("Hello " + displayName + ",\n\n"
                    + "Great news! Your track \"" + trackTitle + "\" has been approved by our moderation team and is now published on SoundWave.\n\n"
                    + "Thank you for sharing your music with our community!\n\n"
                    + "Best regards,\nSoundWave Team");
            mailSender.send(message);
        } catch (Exception ex) {
            log.warn("Failed to send track approval email to {}: {}", recipient, ex.getMessage());
        }
    }

    /**
     * Gửi email thông báo bài hát đã bị gỡ bỏ khỏi hệ thống do vi phạm chính sách hoặc bản quyền (UC-24.2 Take Down Track).
     *
     * @param recipient      Địa chỉ email người nhận (nghệ sĩ/tác giả)
     * @param displayName    Tên hiển thị của nghệ sĩ
     * @param trackTitle     Tiêu đề bài hát bị gỡ bỏ
     * @param takedownReason Lý do gỡ bỏ cụ thể
     */
    public void sendTrackTakenDownEmail(String recipient, String displayName, String trackTitle, String takedownReason) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(recipient);
            message.setSubject("Notice: Your track \"" + trackTitle + "\" has been taken down");
            message.setText("Hello " + displayName + ",\n\n"
                    + "We are writing to inform you that your track \"" + trackTitle + "\" has been taken down from SoundWave.\n\n"
                    + "Reason for removal:\n" + takedownReason + "\n\n"
                    + "If you believe this was done in error, please contact our support team.\n\n"
                    + "Best regards,\nSoundWave Team");
            mailSender.send(message);
        } catch (Exception ex) {
            log.warn("Failed to send track takedown email to {}: {}", recipient, ex.getMessage());
        }
    }
}
