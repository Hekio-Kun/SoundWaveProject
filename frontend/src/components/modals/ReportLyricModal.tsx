import { useState } from "react";
import { createPortal } from "react-dom";
import { reportsApi } from "../../api/reports";
import { AlertIcon, CloseIcon, FlagIcon } from "../../icons";

export type ReportLyricModalProps = {
  isOpen: boolean;
  onClose: () => void;
  trackId: number;
  trackTitle: string;
  onSuccess: (message: string) => void;
};

const REPORT_REASONS = [
  { value: "OUT_OF_SYNC", label: "Out of Sync", desc: "Timestamp doesn't match the vocals" },
  { value: "INCORRECT_TEXT", label: "Incorrect Lyrics", desc: "Misspelled words, wrong or missing verses" },
  { value: "OFFENSIVE_CONTENT", label: "Inappropriate Content", desc: "Violates community guidelines or contains hate speech" },
  { value: "OTHER", label: "Other Issue", desc: "Formatting errors, broken lines, etc." },
];

export function ReportLyricModal({
  isOpen,
  onClose,
  trackId,
  trackTitle,
  onSuccess,
}: ReportLyricModalProps) {
  const [reason, setReason] = useState("OUT_OF_SYNC");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await reportsApi.reportLyrics({
        trackId,
        reason,
        description: description.trim() || undefined,
      });
      onSuccess("Thank you! Your lyric report has been submitted to our moderation team.");
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div
      className="modal-backdrop"
      role="presentation"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={() => {
        if (!submitting) onClose();
      }}
    >
      <div
        className="modal-card"
        style={{
          width: "100%",
          maxWidth: "480px",
          background: "#FFFFFF",
          borderRadius: "16px",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.16)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid #E2E8F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#F8FAFC",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "rgba(239, 68, 68, 0.1)",
                color: "#EF4444",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FlagIcon width={18} height={18} />
            </span>
            <div>
              <h3 id="report-modal-title" style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0F172A" }}>
                Report Lyrics Issue
              </h3>
              <p style={{ margin: 0, fontSize: "12px", color: "#64748B" }}>
                Song: <b>{trackTitle}</b>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            style={{
              background: "none",
              border: "none",
              color: "#94A3B8",
              cursor: "pointer",
              padding: "6px",
              borderRadius: "8px",
            }}
            aria-label="Close modal"
          >
            <CloseIcon width={18} height={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {error && (
            <div
              style={{
                padding: "12px 14px",
                borderRadius: "8px",
                background: "#FEF2F2",
                border: "1px solid #FCA5A5",
                color: "#B91C1C",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <AlertIcon width={16} height={16} />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "8px" }}>
              What is wrong with the lyrics?
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {REPORT_REASONS.map((r) => {
                const isSelected = reason === r.value;
                return (
                  <label
                    key={r.value}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: `1px solid ${isSelected ? "#0284C7" : "#E2E8F0"}`,
                      background: isSelected ? "rgba(2, 132, 199, 0.05)" : "#FFFFFF",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      value={r.value}
                      checked={isSelected}
                      onChange={() => setReason(r.value)}
                      style={{ marginTop: "3px", accentColor: "#0284C7" }}
                    />
                    <div>
                      <span style={{ display: "block", fontSize: "13px", fontWeight: 600, color: isSelected ? "#0284C7" : "#1E293B" }}>
                        {r.label}
                      </span>
                      <small style={{ fontSize: "11.5px", color: "#64748B" }}>{r.desc}</small>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label
              htmlFor="report-desc"
              style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}
            >
              Additional Details (Optional)
            </label>
            <textarea
              id="report-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Timestamp at [01:23] is about 2 seconds too early..."
              maxLength={500}
              rows={3}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid #CBD5E1",
                fontSize: "13px",
                fontFamily: "inherit",
                resize: "vertical",
                boxSizing: "border-box",
                outline: "none",
              }}
              disabled={submitting}
            />
            <div style={{ textAlign: "right", fontSize: "11px", color: "#94A3B8", marginTop: "4px" }}>
              {description.length}/500
            </div>
          </div>

          {/* Modal Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="button button-secondary"
              style={{ padding: "8px 16px", borderRadius: "8px", fontSize: "13px" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="button button-primary"
              style={{
                padding: "8px 18px",
                borderRadius: "8px",
                fontSize: "13px",
                background: "#0284C7",
                color: "#FFFFFF",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {submitting ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
