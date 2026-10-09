package groupone.soundwaveproject.authentication.exception;

public class ProfileNotFoundException extends AuthenticationException {
    public ProfileNotFoundException() {
        super("PROFILE_NOT_FOUND", "The user profile was not found.");
    }
}
