package groupone.soundwaveproject.authentication.service;

import groupone.soundwaveproject.authentication.exception.EmailDeliveryUnavailableException;
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

import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Properties;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit Test cho AuthenticationMailService (SMTP local & HTTPS relay cho môi trường deploy).
 */
@ExtendWith(MockitoExtension.class)
class AuthenticationMailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private HttpClient httpClient;

    private AuthenticationMailService mailService;

    @BeforeEach
    void setUp() {
        mailService = new AuthenticationMailService(mailSender, httpClient);
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

    @Test
    @DisplayName("Lỗi kết nối SMTP khi gửi OTP phải ném EmailDeliveryUnavailableException an toàn")
    void testSendVerificationOtp_SmtpFailure_ThrowsEmailDeliveryUnavailable() {
        doThrow(new MailSendException("Connection timed out"))
                .when(mailSender).send(any(SimpleMailMessage.class));

        assertThrows(
                EmailDeliveryUnavailableException.class,
                () -> mailService.sendVerificationOtp("listener@example.com", "Nguyễn Văn A", "123456", 10)
        );
    }

    @Test
    @DisplayName("Gửi OTP qua Mail Webhook HTTPS (Google Apps Script) thành công và không đụng SMTP")
    @SuppressWarnings("unchecked")
    void testSendVerificationOtp_ViaWebhook_Success() throws Exception {
        ReflectionTestUtils.setField(mailService, "webhookUrl", "https://script.google.com/macros/s/test-id/exec");
        ReflectionTestUtils.setField(mailService, "webhookSecret", "secret-token");

        HttpResponse<String> okResponse = mock(HttpResponse.class);
        when(okResponse.statusCode()).thenReturn(200);
        when(okResponse.body()).thenReturn("{\"ok\":true}");
        when(httpClient.send(any(HttpRequest.class), any(HttpResponse.BodyHandler.class))).thenReturn(okResponse);

        mailService.sendVerificationOtp("listener@example.com", "Hải Duy", "654321", 10);

        ArgumentCaptor<HttpRequest> requestCaptor = ArgumentCaptor.forClass(HttpRequest.class);
        verify(httpClient, times(1)).send(requestCaptor.capture(), any(HttpResponse.BodyHandler.class));
        verifyNoInteractions(mailSender);
        assertEquals("https://script.google.com/macros/s/test-id/exec", requestCaptor.getValue().uri().toString());
    }

    @Test
    @DisplayName("Mail Webhook trả về ok=false phải ném EmailDeliveryUnavailableException")
    @SuppressWarnings("unchecked")
    void testSendVerificationOtp_ViaWebhookErrorPayload_ThrowsEmailDeliveryUnavailable() throws Exception {
        ReflectionTestUtils.setField(mailService, "webhookUrl", "https://script.google.com/macros/s/test-id/exec");

        HttpResponse<String> errorResponse = mock(HttpResponse.class);
        when(errorResponse.statusCode()).thenReturn(200);
        when(errorResponse.body()).thenReturn("{\"ok\":false,\"error\":\"Invalid secret\"}");
        when(httpClient.send(any(HttpRequest.class), any(HttpResponse.BodyHandler.class))).thenReturn(errorResponse);

        assertThrows(
                EmailDeliveryUnavailableException.class,
                () -> mailService.sendVerificationOtp("listener@example.com", "Hải Duy", "654321", 10)
        );
    }

    @Test
    @DisplayName("Gửi OTP qua Brevo HTTPS API gửi đúng header api-key và endpoint")
    @SuppressWarnings("unchecked")
    void testSendVerificationOtp_ViaBrevoApi_Success() throws Exception {
        ReflectionTestUtils.setField(mailService, "brevoApiKey", "xkeysib-test-key");

        HttpResponse<String> createdResponse = mock(HttpResponse.class);
        when(createdResponse.statusCode()).thenReturn(201);
        when(httpClient.send(any(HttpRequest.class), any(HttpResponse.BodyHandler.class))).thenReturn(createdResponse);

        mailService.sendVerificationOtp("listener@example.com", "Hải Duy", "112233", 10);

        ArgumentCaptor<HttpRequest> requestCaptor = ArgumentCaptor.forClass(HttpRequest.class);
        verify(httpClient, times(1)).send(requestCaptor.capture(), any(HttpResponse.BodyHandler.class));
        verifyNoInteractions(mailSender);
        HttpRequest sentRequest = requestCaptor.getValue();
        assertEquals("https://api.brevo.com/v3/smtp/email", sentRequest.uri().toString());
        assertEquals("xkeysib-test-key", sentRequest.headers().firstValue("api-key").orElse(null));
    }

    @Test
    @DisplayName("Gửi OTP qua Resend HTTPS API gửi đúng Bearer token và endpoint")
    @SuppressWarnings("unchecked")
    void testSendVerificationOtp_ViaResendApi_Success() throws Exception {
        ReflectionTestUtils.setField(mailService, "resendApiKey", "re_test_key");

        HttpResponse<String> okResponse = mock(HttpResponse.class);
        when(okResponse.statusCode()).thenReturn(200);
        when(httpClient.send(any(HttpRequest.class), any(HttpResponse.BodyHandler.class))).thenReturn(okResponse);

        mailService.sendPasswordResetOtp("listener@example.com", "998877", 10);

        ArgumentCaptor<HttpRequest> requestCaptor = ArgumentCaptor.forClass(HttpRequest.class);
        verify(httpClient, times(1)).send(requestCaptor.capture(), any(HttpResponse.BodyHandler.class));
        verifyNoInteractions(mailSender);
        HttpRequest sentRequest = requestCaptor.getValue();
        assertEquals("https://api.resend.com/emails", sentRequest.uri().toString());
        assertEquals("Bearer re_test_key", sentRequest.headers().firstValue("Authorization").orElse(null));
    }

    @Test
    @DisplayName("UC-23 / EX01: sendStaffCredentials qua HTTPS lỗi trả về false an toàn")
    @SuppressWarnings("unchecked")
    void testSendStaffCredentials_ViaWebhookFailure_ReturnsFalseGracefully() throws Exception {
        ReflectionTestUtils.setField(mailService, "webhookUrl", "https://script.google.com/macros/s/test-id/exec");

        HttpResponse<String> failResponse = mock(HttpResponse.class);
        when(failResponse.statusCode()).thenReturn(502);
        when(failResponse.body()).thenReturn("Bad Gateway");
        when(httpClient.send(any(HttpRequest.class), any(HttpResponse.BodyHandler.class))).thenReturn(failResponse);

        boolean result = mailService.sendStaffCredentials(
                "mod.tran@soundwave.com",
                "Trần Moderator",
                "Temp@123456",
                "https://soundwave.vercel.app/staff/login"
        );

        assertFalse(result);
    }
}

