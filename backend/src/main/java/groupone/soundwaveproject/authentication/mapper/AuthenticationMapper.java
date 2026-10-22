package groupone.soundwaveproject.authentication.mapper;

import groupone.soundwaveproject.authentication.dto.response.UserResponse;
import groupone.soundwaveproject.authentication.entity.Staff;
import groupone.soundwaveproject.authentication.entity.User;
import org.springframework.stereotype.Component;

@Component
public class AuthenticationMapper {
    public UserResponse toUserResponse(User user, String displayName, String avatarUrl) {
        return new UserResponse(user.getId(), user.getEmail(), displayName, avatarUrl, "LISTENER");
    }

    public UserResponse toUserResponse(Staff staff) {
        return new UserResponse(
                staff.getId(),
                staff.getEmail(),
                staff.getFullName(),
                staff.getAvatarUrl(),
                staff.getRole() != null ? staff.getRole().getCode() : "STAFF"
        );
    }
}
