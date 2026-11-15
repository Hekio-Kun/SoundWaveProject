package groupone.soundwaveproject.authentication.exception;

/**
 * Ngoại lệ ném ra khi hệ thống không thể kết nối tới dịch vụ gửi email xác thực hoặc thông báo.
 */
public class EmailDeliveryUnavailableException extends AuthenticationException {
    public EmailDeliveryUnavailableException() {
        super("EMAIL_DELIVERY_UNAVAILABLE", "Unable to send verification email at the moment. Please try again later.");
    }
}
