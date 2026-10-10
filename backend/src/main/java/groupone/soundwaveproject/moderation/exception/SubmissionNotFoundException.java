package groupone.soundwaveproject.moderation.exception;

import groupone.soundwaveproject.exception.ResourceNotFoundException;

public class SubmissionNotFoundException extends ResourceNotFoundException {
    public SubmissionNotFoundException(Long id) {
        super("SUBMISSION_NOT_FOUND", "Track submission not found with id: " + id);
    }
}
