package groupone.soundwaveproject.moderation.entity;

import lombok.Getter;

/**
 * Danh mục lý do báo cáo vi phạm bài hát được hệ thống định nghĩa trước (UC-22.1 & BR-31):
 * - Copyright Infringement (Vi phạm bản quyền)
 * - Inappropriate or Offensive Content (Nội dung phản cảm, bạo lực)
 * - Misleading Metadata / Impersonation (Thông tin sai lệch, giả mạo)
 * - Spam or Damaged Audio (Âm thanh hỏng, tạp âm, quảng cáo rác)
 */
@Getter
public enum ReportCategory {
    COPYRIGHT("Copyright Infringement", "Vi phạm bản quyền"),
    INAPPROPRIATE_CONTENT("Inappropriate or Offensive Content", "Nội dung phản cảm, bạo lực"),
    INCORRECT_METADATA("Misleading Metadata / Impersonation", "Thông tin sai lệch, giả mạo"),
    OTHER("Spam or Damaged Audio", "Âm thanh hỏng, tạp âm, quảng cáo rác");

    private final String displayName;
    private final String vietnameseLabel;

    ReportCategory(String displayName, String vietnameseLabel) {
        this.displayName = displayName;
        this.vietnameseLabel = vietnameseLabel;
    }

    public static boolean isValid(String name) {
        if (name == null || name.isBlank()) {
            return false;
        }
        for (ReportCategory cat : values()) {
            if (cat.name().equalsIgnoreCase(name.trim())) {
                return true;
            }
        }
        return false;
    }

    public static ReportCategory fromString(String name) {
        if (name != null) {
            for (ReportCategory cat : values()) {
                if (cat.name().equalsIgnoreCase(name.trim())) {
                    return cat;
                }
            }
        }
        return OTHER;
    }
}
