import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useModalScrollLock } from "../../hooks/useModalScrollLock";
import type { RejectionDetails } from "../../api/track";
import {
  AlertIcon,
  CloseIcon,
  ClockIcon,
  EditIcon,
  CheckIcon,
} from "../../icons";

/**
 * Props cho RejectionDetailsModal.
 */
export type RejectionDetailsModalProps = {
  /** Thông tin chi tiết lý do từ chối theo API */
  details: RejectionDetails | null;
  /** Trạng thái mở/đóng modal */
  isOpen: boolean;
  /** Callback khi người dùng nhấn đóng modal */
  onClose: () => void;
  /** Callback khi người dùng nhấn "Chỉnh sửa bài hát" để sửa và nộp lại duyệt (UC-19, BR-24) */
  onEditTrack?: (trackId: number) => void;
  /** Callback điều hướng tới trang chi tiết bài hát (tuỳ chọn) */
  onViewTrackDetail?: (trackId: number) => void;
};

/**
 * Component Modal hiển thị lý do từ chối kiểm duyệt bài hát (Use Case UC-20: View Rejection Reason).
 *
 * Đáp ứng toàn diện các tiêu chí trong tài liệu đặc tả RDS:
 * - Normal Flow: Hiển thị lý do từ chối (Categorized reason), ghi chú từ kiểm duyệt viên (Reviewer note), thời gian duyệt.
 * - Alternative Flow AF01: Mở rộng xem lịch sử phản hồi kiểm duyệt của các lần nộp trước (Submission history timeline).
 * - Exception EX01: Fallback hiển thị thông báo kiểm duyệt cộng đồng tiêu chuẩn nếu lý do trống.
 * - Business Rule BR-24: Cung cấp nút hành động "Chỉnh sửa bài hát" để cập nhật audio/metadata và nộp lại.
 */
export function RejectionDetailsModal({
  details,
  isOpen,
  onClose,
  onEditTrack,
  onViewTrackDetail,
}: RejectionDetailsModalProps) {
  // Khoá scroll chuột khi mở modal
  useModalScrollLock(isOpen);

  // Close on Escape key (Rule 4.7)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Trạng thái mở rộng xem lịch sử nộp duyệt (AF01)
  const [showHistory, setShowHistory] = useState(false);

  if (!isOpen || !details) return null;

  // Xử lý fallback lý do kiểm duyệt theo EX01 nếu trống
  const effectiveReason =
    details.rejectionReason?.trim() ||
    "Audio content violates community standards.";

  const historyItems = details.history || [];
  const hasHistory = historyItems.length > 0;

  return createPortal(
    <div
      className="modal-backdrop"
      role="presentation"
      onClick={onClose}
      style={{
        zIndex: 10050,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rejection-modal-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "560px",
          width: "92vw",
          borderRadius: "20px",
          padding: "28px",
          boxShadow: "0 20px 48px rgba(0, 0, 0, 0.2)",
          border: "1px solid #fee4e2",
        }}
      >
        {/* Header Modal */}
        <div
          className="modal-header"
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                backgroundColor: "#fee4e2",
                color: "#d92d20",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <AlertIcon width={22} height={22} />
            </div>
            <div>
              <h3
                id="rejection-modal-title"
                style={{
                  margin: 0,
                  fontSize: "19px",
                  fontWeight: 700,
                  color: "#1e293b",
                }}
              >
                Track Rejection Details
              </h3>
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: "13px",
                  color: "#64748b",
                }}
              >
                Moderation review feedback for your track submission
              </p>
            </div>
          </div>

          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              background: "#f1f5f9",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              cursor: "pointer",
              color: "#64748b",
            }}
          >
            <CloseIcon width={16} height={16} />
          </button>
        </div>

        {/* Thông tin bài hát & trạng thái */}
        <div
          style={{
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "12px 16px",
            marginBottom: "18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          <div>
            <span
              style={{
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                fontWeight: 600,
                color: "#94a3b8",
                display: "block",
              }}
            >
              Track Title
            </span>
            <b style={{ fontSize: "15px", color: "#0f172a" }}>
              {details.trackTitle}
            </b>
          </div>
          <div style={{ textAlign: "right" }}>
            <span
              className="status-badge status-badge--rejected"
              style={{
                display: "inline-block",
                backgroundColor: "#fee4e2",
                color: "#b42318",
                fontWeight: 700,
                padding: "4px 10px",
                borderRadius: "999px",
                fontSize: "12px",
              }}
            >
              Rejected
            </span>
            {details.reviewedAt && (
              <small
                style={{
                  display: "block",
                  color: "#64748b",
                  fontSize: "11px",
                  marginTop: "3px",
                }}
              >
                Reviewed: {new Date(details.reviewedAt).toLocaleString()}
              </small>
            )}
          </div>
        </div>

        {/* Khung lý do từ chối chính (Normal Flow) */}
        <div
          className="rejection-box"
          style={{
            backgroundColor: "#fef3f2",
            border: "1px solid #fee4e2",
            borderRadius: "14px",
            padding: "16px 18px",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginBottom: "8px",
              color: "#b42318",
              fontWeight: 700,
              fontSize: "13px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            <AlertIcon width={16} height={16} />
            <span>Staff Rejection Reason:</span>
          </div>

          <p
            className="rejection-text"
            style={{
              margin: "0 0 10px",
              fontSize: "14.5px",
              lineHeight: 1.5,
              color: "#991b1b",
              fontWeight: 500,
            }}
          >
            {effectiveReason}
          </p>

          {/* Ghi chú chi tiết từ kiểm duyệt viên */}
          {details.reviewerNote && (
            <div
              style={{
                marginTop: "10px",
                paddingTop: "10px",
                borderTop: "1px dashed rgba(180, 35, 24, 0.25)",
              }}
            >
              <span
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#7f1d1d",
                }}
              >
                Reviewer Internal Note:
              </span>
              <p
                style={{
                  margin: 0,
                  fontSize: "13.5px",
                  color: "#450a0a",
                  lineHeight: 1.45,
                  backgroundColor: "rgba(255, 255, 255, 0.6)",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  borderLeft: "3px solid #b42318",
                }}
              >
                {details.reviewerNote}
              </p>
            </div>
          )}
        </div>

        {/* Alternative Flow AF01: Lịch sử nộp duyệt và phản hồi các lần trước */}
        {hasHistory && (
          <div style={{ marginBottom: "20px" }}>
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              style={{
                background: "none",
                border: "none",
                padding: "4px 0",
                fontSize: "13px",
                fontWeight: 600,
                color: "#0284c7",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span>
                {showHistory ? "Hide submission history" : `View prior submission history (${historyItems.length})`}
              </span>
              <span style={{ fontSize: "10px" }}>{showHistory ? "▲" : "▼"}</span>
            </button>

            {showHistory && (
              <div
                style={{
                  marginTop: "10px",
                  maxHeight: "180px",
                  overflowY: "auto",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  padding: "10px",
                  backgroundColor: "#f8fafc",
                }}
              >
                {historyItems.map((item, idx) => (
                  <div
                    key={item.submissionId || idx}
                    style={{
                      padding: "8px",
                      borderBottom: idx < historyItems.length - 1 ? "1px solid #e2e8f0" : "none",
                      fontSize: "12px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ fontWeight: 600, color: "#334155" }}>
                        Submission #{item.submissionId || idx + 1}
                      </span>
                      <span
                        style={{
                          fontWeight: 700,
                          color: item.status === "REJECTED" ? "#b42318" : "#0284c7",
                        }}
                      >
                        {item.status}
                      </span>
                    </div>
                    {item.submittedAt && (
                      <div style={{ color: "#64748b", fontSize: "11px", marginBottom: "2px" }}>
                        Submitted: {new Date(item.submittedAt).toLocaleString()}
                      </div>
                    )}
                    {item.rejectionReason && (
                      <div style={{ color: "#991b1b", marginTop: "2px" }}>
                        <b>Reason:</b> {item.rejectionReason}
                      </div>
                    )}
                    {item.reviewerNote && (
                      <div style={{ color: "#475569", marginTop: "2px", fontStyle: "italic" }}>
                        <b>Note:</b> {item.reviewerNote}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div
          className="modal-actions"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "10px",
            borderTop: "1px solid #f1f5f9",
            paddingTop: "16px",
            margin: 0,
          }}
        >
          <button
            type="button"
            className="button button-secondary"
            onClick={onClose}
            style={{ minWidth: "90px" }}
          >
            Close
          </button>

          {onEditTrack && (
            <button
              type="button"
              className="button button-primary"
              onClick={() => {
                onClose();
                onEditTrack(details.trackId);
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#0284c7",
                color: "#ffffff",
                padding: "8px 18px",
                borderRadius: "10px",
                fontWeight: 600,
              }}
            >
              <EditIcon width={15} height={15} />
              <span>Edit Track</span>
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
