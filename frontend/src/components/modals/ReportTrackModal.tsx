import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { reportsApi, type ReportCategoryType } from "../../api/reports";
import { useModalScrollLock } from "../../hooks/useModalScrollLock";
import { AlertIcon, CloseIcon, FlagIcon, MusicIcon } from "../../icons";

export type ReportTrackModalProps = {
  open: boolean;
  onClose: () => void;
  trackId: number;
  trackTitle: string;
  trackArtist?: string;
  trackCoverUrl?: string | null;
  onSuccess: (message: string) => void;
};

type ReasonOption = {
  value: ReportCategoryType;
  title: string;
  description: string;
};

const PREDEFINED_REASONS: ReasonOption[] = [
  {
    value: "COPYRIGHT",
    title: "Copyright Infringement",
    description: "Unauthorized music distribution, sampled without permission, or intellectual property violation.",
  },
  {
    value: "INAPPROPRIATE_CONTENT",
    title: "Inappropriate or Offensive Content",
    description: "Contains hate speech, gratuitous violence, harassment, or sexually explicit material.",
  },
  {
    value: "INCORRECT_METADATA",
    title: "Misleading Metadata / Impersonation",
    description: "Inaccurate song title, false artist tags, or impersonating an official creator or label.",
  },
  {
    value: "OTHER",
    title: "Spam or Damaged Audio",
    description: "Audio stream is distorted, broken, repetitive commercial spam, or silent.",
  },
];

export function ReportTrackModal({
  open,
  onClose,
  trackId,
  trackTitle,
  trackArtist = "Unknown Artist",
  trackCoverUrl,
  onSuccess,
}: ReportTrackModalProps) {
  const [selectedReason, setSelectedReason] = useState<ReportCategoryType | "">("");
  const [customDetails, setCustomDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useModalScrollLock(open);

  useEffect(() => {
    if (!open) {
      setSelectedReason("");
      setCustomDetails("");
      setErrorMessage(null);
      setSubmitting(false);
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, submitting, onClose]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // EX01: Validate that a reason option was selected
    if (!selectedReason) {
      setErrorMessage("Please select a violation reason option to proceed.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    const selectedOption = PREDEFINED_REASONS.find((r) => r.value === selectedReason);
    const reportContent = customDetails.trim()
      ? (selectedOption ? `${selectedOption.title} - ${customDetails.trim()}` : customDetails.trim())
      : (selectedOption ? `${selectedOption.title} - ${selectedOption.description}` : selectedReason);

    try {
      await reportsApi.reportTrack({
        trackId,
        category: selectedReason,
        description: reportContent,
      });

      // NF01 Step 7: Close modal & notify listener
      onSuccess("Report submitted for review. Our moderation team will investigate this track.");
      onClose();
    } catch (err: any) {
      // EX01: Duplicate pending report or EX02: Track no longer eligible
      const msg = err?.message || "Failed to submit report. Please try again.";
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div
      role="presentation"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        zIndex: 1300,
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
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-track-modal-title"
        style={{
          width: "100%",
          maxWidth: "520px",
          maxHeight: "calc(100dvh - 48px)",
          background: "#FFFFFF",
          borderRadius: "16px",
          boxShadow: "0 24px 60px rgba(15, 23, 42, 0.25)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          border: "1px solid #E2E8F0",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header (Pinned at top) */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #E2E8F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#F8FAFC",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "#FEE2E2",
                color: "#EF4444",
                display: "grid",
                placeItems: "center",
              }}
            >
              <FlagIcon width={20} height={20} />
            </span>
            <div>
              <h2
                id="report-track-modal-title"
                style={{
                  margin: 0,
                  fontSize: "1.125rem",
                  fontWeight: 700,
                  color: "#0F172A",
                  lineHeight: 1.25,
                }}
              >
                Report Track
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.8125rem",
                  color: "#64748B",
                  marginTop: "2px",
                }}
              >
                Help us keep SoundWave safe and compliant
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close dialog"
            style={{
              background: "transparent",
              border: "none",
              color: "#94A3B8",
              cursor: submitting ? "not-allowed" : "pointer",
              padding: "6px",
              borderRadius: "8px",
              display: "grid",
              placeItems: "center",
              transition: "color 0.15s, background-color 0.15s",
            }}
          >
            <CloseIcon width={18} height={18} />
          </button>
        </div>

        {/* Modal Body Form with flex layout */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            minHeight: 0,
            overflow: "hidden",
            margin: 0,
          }}
        >
          {/* Scrollable Content */}
          <div
            style={{
              padding: "18px 20px",
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
            }}
          >
            {/* Target Track Summary Card */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 14px",
                background: "#F1F5F9",
                borderRadius: "12px",
                marginBottom: "16px",
                border: "1px solid #E2E8F0",
              }}
            >
              {trackCoverUrl ? (
                <img
                  src={trackCoverUrl}
                  alt=""
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "8px",
                    objectFit: "cover",
                    flexShrink: 0,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "8px",
                    background: "#0284C7",
                    color: "#FFFFFF",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <MusicIcon width={24} height={24} />
                </div>
              )}
              <div style={{ minWidth: 0, flex: 1 }}>
                <span
                  style={{
                    display: "inline-block",
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "#0284C7",
                    marginBottom: "2px",
                  }}
                >
                  Reported Track
                </span>
                <h4
                  style={{
                    margin: 0,
                    fontSize: "0.9375rem",
                    fontWeight: 600,
                    color: "#0F172A",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {trackTitle}
                </h4>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.8125rem",
                    color: "#64748B",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {trackArtist}
                </p>
              </div>
            </div>

            {/* Error / Alert Banner */}
            {errorMessage && (
              <div
                role="alert"
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  padding: "12px 14px",
                  background: "#FEF2F2",
                  border: "1px solid #FCA5A5",
                  borderRadius: "10px",
                  color: "#B91C1C",
                  fontSize: "0.875rem",
                  marginBottom: "16px",
                  lineHeight: 1.4,
                }}
              >
                <span style={{ flexShrink: 0, marginTop: "2px" }}>
                  <AlertIcon width={18} height={18} />
                </span>
                <span style={{ flex: 1 }}>{errorMessage}</span>
              </div>
            )}

            {/* Section Prompt */}
            <p
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#334155",
                margin: "0 0 10px 0",
              }}
            >
              Select a reason for reporting this track:
            </p>

            {/* Predefined Violation Reason Options (Radio Group) */}
            <div
              role="radiogroup"
              aria-label="Violation reasons"
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {PREDEFINED_REASONS.map((option) => {
                const isSelected = selectedReason === option.value;
                const optionId = `report-reason-${option.value}`;
                return (
                  <div
                    key={option.value}
                    role="button"
                    tabIndex={submitting ? -1 : 0}
                    onClick={() => {
                      if (!submitting) {
                        setSelectedReason(option.value);
                        setErrorMessage(null);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (!submitting && (e.key === " " || e.key === "Enter")) {
                        e.preventDefault();
                        setSelectedReason(option.value);
                        setErrorMessage(null);
                      }
                    }}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                      padding: "12px 14px",
                      borderRadius: "12px",
                      border: isSelected ? "2px solid #0284C7" : "1px solid #E2E8F0",
                      background: isSelected ? "#F0F9FF" : "#FFFFFF",
                      cursor: submitting ? "not-allowed" : "pointer",
                      transition: "all 0.15s ease",
                      userSelect: "none",
                    }}
                  >
                    <input
                      id={optionId}
                      type="radio"
                      name="report-reason"
                      value={option.value}
                      checked={isSelected}
                      onChange={() => {
                        setSelectedReason(option.value);
                        setErrorMessage(null);
                      }}
                      disabled={submitting}
                      style={{
                        marginTop: "3px",
                        accentColor: "#0284C7",
                        width: "18px",
                        height: "18px",
                        cursor: submitting ? "not-allowed" : "pointer",
                        flexShrink: 0,
                      }}
                    />
                    <label
                      htmlFor={optionId}
                      style={{
                        flex: 1,
                        cursor: submitting ? "not-allowed" : "pointer",
                        margin: 0,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.9375rem",
                            fontWeight: 600,
                            color: isSelected ? "#0369A1" : "#0F172A",
                          }}
                        >
                          {option.title}
                        </span>
                      </div>
                      <p
                        style={{
                          margin: "3px 0 0 0",
                          fontSize: "0.8125rem",
                          color: "#64748B",
                          lineHeight: 1.35,
                        }}
                      >
                        {option.description}
                      </p>
                    </label>
                  </div>
                );
              })}
            </div>

            {/* Optional Additional Details */}
            <div style={{ marginTop: "16px" }}>
              <label
                htmlFor="report-custom-details"
                style={{
                  display: "block",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: "#475569",
                  marginBottom: "6px",
                }}
              >
                Additional Details (Optional):
              </label>
              <textarea
                id="report-custom-details"
                rows={3}
                value={customDetails}
                onChange={(e) => setCustomDetails(e.target.value)}
                placeholder="Describe details, evidence, or timestamps (e.g. at 01:23) to assist moderation..."
                disabled={submitting}
                maxLength={1000}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  borderRadius: "10px",
                  border: "1px solid #CBD5E1",
                  padding: "10px 12px",
                  fontSize: "0.875rem",
                  color: "#0F172A",
                  fontFamily: "inherit",
                  resize: "vertical",
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* Modal Footer (Pinned at bottom, ALWAYS fully visible) */}
          <div
            style={{
              padding: "14px 20px",
              borderTop: "1px solid #E2E8F0",
              background: "#F8FAFC",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "12px",
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              className="button button-ghost"
              onClick={onClose}
              disabled={submitting}
              style={{
                borderRadius: "10px",
                padding: "8px 18px",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#64748B",
                minHeight: "38px",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button button-primary"
              disabled={submitting || !selectedReason}
              style={{
                borderRadius: "10px",
                padding: "8px 20px",
                fontSize: "0.875rem",
                fontWeight: 600,
                backgroundColor: !selectedReason ? "#94A3B8" : "#0284C7",
                borderColor: !selectedReason ? "#94A3B8" : "#0284C7",
                color: "#FFFFFF",
                cursor: submitting || !selectedReason ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                minHeight: "38px",
                boxShadow: !selectedReason ? "none" : "0 2px 6px rgba(2, 132, 199, 0.35)",
              }}
            >
              {submitting ? (
                <>
                  <span
                    style={{
                      width: "14px",
                      height: "14px",
                      border: "2px solid #FFFFFF",
                      borderTopColor: "transparent",
                      borderRadius: "50%",
                      animation: "spin 0.7s linear infinite",
                      display: "inline-block",
                    }}
                  />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <FlagIcon width={16} height={16} />
                  <span>Submit Report</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
