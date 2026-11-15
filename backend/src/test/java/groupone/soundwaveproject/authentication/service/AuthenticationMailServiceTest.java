package groupone.soundwaveproject.authentication.service;

import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Properties;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit Test cho AuthenticationMailService (kiểm thử UC-23: Send Account Credential Email).
 */
@ExtendWith(MockitoExtension.class)
class AuthenticationMailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    private AuthenticationMailService mailService;

    @BeforeEach
    void setUp() {
        mailService = new AuthenticationMailService(mailSender);
        ReflectionTestUtils.setField(mailService, "fromAddress", "no-reply@soundwave.com");
    }

    @Test
    @DisplayName("UC-23 / NF01: Gửi email cấp tài khoản Staff thành công")
    void testSendStaffCredentials_Success() {
        MimeMessage mockMimeMessage = new MimeMessage(Session.getInstance(new Properties()));
        when(mailSender.createMimeMessage()).thenReturn(mockMimeMessage);

        boolean result = mailService.sendStaffCredentials(
                "mod.tran@soundwave.com",
                "Trần Moderator",
                "Temp@123456",
                "http://localhost:5173/staff/login"
        );

        assertTrue(result, "Gửi email thành công phải trả về true");
        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("UC-23 / EX01: Xử lý lỗi SMTP timeout / MailException - Không crash ứng dụng, trả về false")
    void testSendStaffCredentials_SmtpFailure_ReturnsFalseGracefully() {
        MimeMessage mockMimeMessage = new MimeMessage(Session.getInstance(new Properties()));
        when(mailSender.createMimeMessage()).thenReturn(mockMimeMessage);
        doThrow(new MailSendException("SMTP connection timed out")).when(mailSender).send(any(MimeMessage.class));

        boolean result = mailService.sendStaffCredentials(
                "mod.tran@soundwave.com",
                "Trần Moderator",
                "Temp@123456",
                "http://localhost:5173/staff/login"
        );

        assertFalse(result, "Khi SMTP lỗi phải bắt ngoại lệ an toàn và trả về false (EX01)");
    }

    @Test
    @DisplayName("Kiểm tra gửi mã OTP xác thực email (sendVerificationOtp)")
    void testSendVerificationOtp() {
        mailService.sendVerificationOtp("listener@example.com", "Nguyễn Văn A", "123456", 10);

        ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender, times(1)).send(messageCaptor.capture());

        SimpleMailMessage captured = messageCaptor.getValue();
        assertEquals("no-reply@soundwave.com", captured.getFrom());
        assertNotNull(captured.getTo());
        assertEquals("listener@example.com", captured.getTo()[0]);
        assertTrue(captured.getText().contains("123456"));
    }
}

