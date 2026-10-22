package groupone.soundwaveproject.authentication.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank @Email String email,
        @NotBlank String password,
        boolean rememberMe,
        String portal
) {
    public LoginRequest(String email, String password, boolean rememberMe) {
        this(email, password, rememberMe, null);
    }
}
