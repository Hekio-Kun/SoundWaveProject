package groupone.soundwaveproject.moderation.exception;

import groupone.soundwaveproject.exception.ResourceNotFoundException;

/**
 * Ngoại lệ ném ra khi không tìm thấy bản ghi yêu cầu kiểm duyệt bài hát theo ID chỉ định (UC-24: Manage Track Moderation).
 */
public class SubmissionNotFoundException extends ResourceNotFoundException {
    public SubmissionNotFoundException(Long id) {
        super("SUBMISSION_NOT_FOUND", "Track submission not found with id: " + id);
    }
}
