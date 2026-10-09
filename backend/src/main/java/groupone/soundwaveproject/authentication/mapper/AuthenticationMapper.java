package groupone.soundwaveproject.authentication.mapper;

import groupone.soundwaveproject.authentication.dto.response.UserResponse;
import groupone.soundwaveproject.authentication.entity.AppUser;
import org.springframework.stereotype.Component;

@Component
public class AuthenticationMapper {
    public UserResponse toUserResponse(AppUser user, String displayName, String avatarUrl) {
        return new UserResponse(user.getId(), user.getEmail(), displayName, avatarUrl, user.getRole().getCode());
    }
}
