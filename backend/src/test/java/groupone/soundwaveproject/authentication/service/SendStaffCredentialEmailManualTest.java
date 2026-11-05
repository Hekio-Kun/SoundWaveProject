package groupone.soundwaveproject.authentication.service;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Properties;

import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Test gửi email thực tế phục vụ kiểm thử thủ công chức năng UC-23.
 * Được đánh dấu @Disabled để không tự động gửi mail khi chạy toàn bộ test suite CI/CD.
 */
class SendStaffCredentialEmailManualTest {

    @Test
    @Disabled("Kiểm thử gửi mail thực tế tới Gmail - Chỉ chạy thủ công khi cần kiểm tra định dạng email")
    @DisplayName("Gửi email thực tế tới haotntce200338@gmail.com để kiểm tra định dạng UC-23")
    void testSendRealEmailToHaoTNT() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost("smtp.gmail.com");
        mailSender.setPort(587);
        mailSender.setUsername("soundwave.song.website@gmail.com");
        mailSender.setPassword("mbtkqbtynqzrdnsz");

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.starttls.required", "true");

        AuthenticationMailService mailService = new AuthenticationMailService(mailSender);
        ReflectionTestUtils.setField(mailService, "fromAddress", "soundwave.song.website@gmail.com");

        boolean success = mailService.sendStaffCredentials(
                "haotntce200338@gmail.com",
                "Trần Ngọc Hạo",
                "Temp@Staff2026",
                "http://localhost:5173/#/staff/login"
        );

        System.out.println("==================================================");
        System.out.println("Kết quả gửi email UC-23: " + (success ? "THÀNH CÔNG (Đã gửi tới haotntce200338@gmail.com)" : "THẤT BẠI"));
        System.out.println("==================================================");

        assertTrue(success, "Gửi email tới địa chỉ thực tế phải thành công");
    }
}
