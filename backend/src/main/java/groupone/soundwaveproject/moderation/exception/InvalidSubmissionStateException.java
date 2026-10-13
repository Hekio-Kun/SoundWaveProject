package groupone.soundwaveproject.moderation.exception;

import groupone.soundwaveproject.exception.BadRequestOperationException;

/**
 * Ngoại lệ ném ra khi trạng thái yêu cầu kiểm duyệt không thỏa mãn điều kiện thực hiện thao tác (UC-24: Manage Track Moderation).
 * Ví dụ: Cố gắng phê duyệt bài hát không ở trạng thái PENDING, hoặc gỡ bài hát chưa từng được APPROVED.
 */
public class InvalidSubmissionStateException extends BadRequestOperationException {
    public InvalidSubmissionStateException(String message) {
        super("INVALID_SUBMISSION_STATE", message);
    }
}
