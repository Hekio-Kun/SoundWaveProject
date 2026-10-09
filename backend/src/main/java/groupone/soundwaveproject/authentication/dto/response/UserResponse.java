package groupone.soundwaveproject.authentication.dto.response;

public record UserResponse(Long id, String email, String displayName, String avatarUrl, String role) {}
