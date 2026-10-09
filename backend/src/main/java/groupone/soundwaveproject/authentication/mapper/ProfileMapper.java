package groupone.soundwaveproject.authentication.mapper;

import groupone.soundwaveproject.authentication.dto.response.ProfileResponse;
import groupone.soundwaveproject.authentication.entity.UserProfile;
import org.springframework.stereotype.Component;

@Component
public class ProfileMapper {
    public ProfileResponse toResponse(UserProfile profile) {
        return new ProfileResponse(
                profile.getUserId(),
                profile.getUser().getEmail(),
                profile.getUsername(),
                profile.getDisplayName(),
                profile.getBio(),
                profile.getAvatarUrl(),
                profile.getDateOfBirth(),
                profile.getCountryCode(),
                profile.getUser().getRole().getCode(),
                profile.getCreatedAt(),
                profile.getUpdatedAt()
        );
    }
}
