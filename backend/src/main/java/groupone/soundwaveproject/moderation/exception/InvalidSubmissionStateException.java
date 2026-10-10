package groupone.soundwaveproject.moderation.exception;

import groupone.soundwaveproject.exception.BadRequestOperationException;

public class InvalidSubmissionStateException extends BadRequestOperationException {
    public InvalidSubmissionStateException(String message) {
        super("INVALID_SUBMISSION_STATE", message);
    }
}
