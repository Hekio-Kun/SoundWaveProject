package groupone.soundwaveproject.authentication.dto.response;

public record LoginResult(AuthResponse response, String refreshToken, long refreshTokenMaxAgeSeconds) {}
