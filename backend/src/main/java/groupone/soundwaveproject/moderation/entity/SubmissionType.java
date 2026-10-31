package groupone.soundwaveproject.moderation.entity;

/**
 * Phân loại các yêu cầu kiểm duyệt trong hệ thống SoundWave (UC-24: Content Moderation).
 * - TRACK_RELEASE: Yêu cầu kiểm duyệt phát hành bài hát mới (UC-24.1, UC-24.2).
 * - LYRIC_UPDATE: Yêu cầu kiểm duyệt cập nhật lời bài hát đồng bộ chính thức (UC-16.2, UC-24.6).
 */
public enum SubmissionType {
    /**
     * Kiểm duyệt phát hành bài hát mới.
     */
    TRACK_RELEASE,

    /**
     * Kiểm duyệt đề xuất cập nhật lời bài hát đồng bộ cho bài hát đã xuất bản.
     */
    LYRIC_UPDATE
}
