package groupone.soundwaveproject.moderation.dto.response;

/**
 * DTO chứa nội dung nhị phân và metadata phục vụ tải xuống tệp tài liệu chứng minh bản quyền.
 */
public record EvidenceDownloadResponse(
        byte[] bytes,
        String contentType,
        String fileName
) {}
