import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useModalScrollLock } from "../../hooks/useModalScrollLock";
import { AlertIcon, CloseIcon, DiscIcon } from "../../icons";
import { staffReportsApi } from "../../api/staffReports";
import { ApiError } from "../../api/client";

type Props = {
  open: boolean;
  trackId: number;
  trackTitle: string;
  artistName?: string;
  coverUrl?: string | null;
  onSuccess: (message: string) => void;
  onNotify?: (message: string, type?: "success" | "info" | "warning" | "error") => void;
  onCancel: () => void;
};

export function TakeDownConfirmationModal({
  open,
  trackId,
  trackTitle,
  artistName,
  coverUrl,
  onSuccess,
  onNotify,
  onCancel,
}: Props) {
  useModalScrollLock(open);

  const [takedownReason, setTakedownReason] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setTakedownReason("");
      setInternalNote("");
      setErrorMessage(null);
      setSubmitting(false);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedReason = takedownReason.trim();
    if (!trimmedReason) {
      setErrorMessage("Please enter a takedown reason.");
      return;
    }

    try {
      setSubmitting(true);
      await staffReportsApi.takeDownTrack(trackId, {
        takedownReason: trimmedReason,
        reviewerNote: internalNote.trim() ? internalNote.trim() : undefined,
      });
      onSuccess("Track taken down successfully.");
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.code === "TRACK_NOT_PUBLISHED" || err.message.includes("published")) {
          if (onNotify) {
            onNotify("Track is not in an active published state.", "warning");
          }
          onCancel();
          return;
        }
        setErrorMessage(err.message || "Failed to take down track.");
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="modal-overlay" onClick={submitting ? undefined : onCancel} style={{ zIndex: 1250 }}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "520px", width: "100%", padding: "28px", borderRadius: "16px" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                background: "#FEF2F2",
                color: "#DC2626",
                display: "grid",
                placeItems: "center",
              }}
            >
              <AlertIcon width={22} height={22} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "#1C1917" }}>
                Take Down Published Track
              </h2>
              <span style={{ fontSize: "0.85rem", color: "#57534E" }}>
                Unpublish and revoke public access to this track
              </span>
            </div>
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={onCancel}
            disabled={submitting}
            aria-label="Close"
          >
            <CloseIcon width={18} height={18} />
          </button>
        </div>

        {/* Track Info Card */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            padding: "12px",
            backgroundColor: "#F6EFE3",
            borderRadius: "10px",
            marginBottom: "20px",
            border: "1px solid #E8DCCB",
          }}
        >
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={trackTitle}
              style={{ width: "48px", height: "48px", borderRadius: "8px", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "8px",
                background: "#D4A373",
                color: "#FFFFFF",
                display: "grid",
                placeItems: "center",
              }}
            >
              <DiscIcon width={24} height={24} />
            </div>
          )}
          <div style={{ minWidth: 0, flex: 1 }}>
            <h4
              style={{
                margin: 0,
                fontSize: "0.95rem",
                fontWeight: 600,
                color: "#1C1917",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {trackTitle}
            </h4>
            <p style={{ margin: "2px 0 0 0", fontSize: "0.82rem", color: "#57534E" }}>
              {artistName || "Creator"}
            </p>
          </div>
        </div>

        {errorMessage && (
          <div
            style={{
              padding: "10px 14px",
              backgroundColor: "#FEF2F2",
              border: "1px solid #FCA5A5",
              color: "#B42318",
              borderRadius: "8px",
              fontSize: "0.85rem",
              marginBottom: "16px",
              wordBreak: "break-word",
              overflowWrap: "anywhere",
              boxSizing: "border-box",
            }}
          >
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Takedown Reason */}
          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor="takedown-reason"
              style={{ display: "block", fontSize: "0.88rem", fontWeight: 600, color: "#1C1917", marginBottom: "6px" }}
            >
              Takedown Reason <span style={{ color: "#DC2626" }}>*</span>
            </label>
            <textarea
              id="takedown-reason"
              rows={3}
              value={takedownReason}
              onChange={(e) => setTakedownReason(e.target.value)}
              placeholder="Enter the specific reason for removal (this will be sent to the track creator)..."
              disabled={submitting}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid #E8DCCB",
                fontSize: "0.88rem",
                fontFamily: "inherit",
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Optional Internal Note */}
          <div style={{ marginBottom: "24px" }}>
            <label
              htmlFor="internal-note"
              style={{ display: "block", fontSize: "0.88rem", fontWeight: 600, color: "#1C1917", marginBottom: "6px" }}
            >
              Internal Operations Note <span style={{ fontSize: "0.78rem", color: "#8D877F", fontWeight: 400 }}>(Optional)</span>
            </label>
            <input
              id="internal-note"
              type="text"
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              placeholder="Internal moderation notes..."
              disabled={submitting}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid #E8DCCB",
                fontSize: "0.88rem",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <button
              type="button"
              className="button button-secondary"
              onClick={onCancel}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button"
              style={{
                backgroundColor: "#DC2626",
                borderColor: "#DC2626",
                color: "#FFFFFF",
              }}
              disabled={submitting}
            >
              {submitting ? "Processing..." : "Confirm Takedown"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

