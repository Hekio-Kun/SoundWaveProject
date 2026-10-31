import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { studioApi, type ApiTrack, type PendingLyricSubmission } from "../../api/track";
import { useModalScrollLock } from "../../hooks/useModalScrollLock";
import {
  AlertIcon,
  CheckIcon,
  CloseIcon,
  DiscIcon,
  FileTextIcon,
  MusicIcon,
  UploadIcon,
  ZapIcon,
} from "../../icons";
import type { StudioTrack } from "../../types";
import { readLyricsFile, validateLyricsFile } from "../../utils/trackUpload";
import { LyricSyncTab } from "../common/LyricSyncTab";

type TrackLike = ApiTrack | StudioTrack;

type Props = {
  open: boolean;
  track: TrackLike | null;
  onClose: () => void;
  onSaved?: (updatedTrack: ApiTrack) => void;
  onSuccess?: (updatedTrack: ApiTrack) => void;
};

export function UpdateLyricModal({ open, track, onClose, onSaved, onSuccess }: Props) {
  useModalScrollLock(open);

  const [activeTab, setActiveTab] = useState<"TEXT" | "SYNC">("TEXT");
  const [lyricsText, setLyricsText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [pendingSubmission, setPendingSubmission] = useState<PendingLyricSubmission | null>(null);
  const [submitterNote, setSubmitterNote] = useState<string>("");
  const [withdrawing, setWithdrawing] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open || !track) return;
    setLyricsText(track.lyrics || "");
    setErrorMessage(null);
    setFileName(null);
    setActiveTab("TEXT");
  }, [open, track]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, submitting]);

  if (!open || !track) return null;

  const handleFileUpload = async (file: File | null) => {
    if (!file) return;
    const validationError = validateLyricsFile(file);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    try {
      const content = await readLyricsFile(file);
      setLyricsText(content);
      setFileName(file.name);
      setErrorMessage(null);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to read lyrics file.");
    }
  };

    const handleWithdraw = async () => {
    if (!track) return;
    setWithdrawing(true);
    setErrorMessage(null);
    try {
      await studioApi.withdrawLyricsSubmission(track.id);
      setPendingSubmission(null);
      setLyricsText(track.lyrics || "");
      setSuccessNotice("Lyric submission withdrawn. You can edit and submit again.");
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to withdraw lyric submission.");
    } finally {
      setWithdrawing(false);
    }
  };

  const handleSave = async () => {
    if (!lyricsText.trim()) {
      setErrorMessage("Lyrics content cannot be empty. Please enter or upload lyrics.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    const isPublished = track.status === "PUBLISHED" || (track as any).publicationStatus === "PUBLISHED";

    try {
      if (isPublished) {
        const pending = await studioApi.submitLyricsForReview(track.id, lyricsText.trim(), submitterNote.trim() || undefined);
        setPendingSubmission(pending);
        setSuccessNotice("Your lyric update has been submitted for Staff review! The track remains published and streamable.");
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        const updated = await studioApi.updateTrackLyrics(track.id, lyricsText.trim());
        onSaved?.(updated);
        onSuccess?.(updated);
        onClose();
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to update lyrics. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const linesCount = lyricsText
    .split(/\r?\n/)
    .filter((l) => l.trim().length > 0).length;

  return createPortal(
    <div
      className="modal-backdrop"
      role="presentation"
      onClick={() => !submitting && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(6px)",
        display: "grid",
        placeItems: "center",
        zIndex: 9999,
        padding: "16px",
      }}
    >
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-update-lyrics-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: activeTab === "SYNC" ? "920px" : "680px",
          maxHeight: "92vh",
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          boxShadow: "0 24px 48px -12px rgba(15, 23, 42, 0.25)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          transition: "max-width 0.25s ease",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--sw-border, #E2E8F0)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "linear-gradient(180deg, #FFFFFF, #F8FAFC)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                backgroundColor: "var(--color-ocean-light, #E0F2FE)",
                color: "var(--color-ocean-primary, #0284C7)",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              <FileTextIcon width={22} height={22} />
            </div>
            <div>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  color: "var(--color-ocean-primary, #0284C7)",
                  textTransform: "uppercase",
                }}
              >
                LYRIC MANAGEMENT
              </span>
              <h3
                id="modal-update-lyrics-title"
                style={{
                  margin: "2px 0 0",
                  fontSize: "18px",
                  fontWeight: 800,
                  color: "var(--color-ocean-dark, #0F172A)",
                }}
              >
                Update Lyric: {track.title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close dialog"
            style={{
              background: "none",
              border: "none",
              cursor: submitting ? "not-allowed" : "pointer",
              color: "#94A3B8",
              padding: "6px",
              borderRadius: "8px",
            }}
          >
            <CloseIcon width={18} height={18} />
          </button>
        </div>

        {/* Modal Sub-navigation Tabs */}
        <div
          style={{
            padding: "10px 24px",
            display: "flex",
            gap: "8px",
            background: "#F8FAFC",
            borderBottom: "1px solid var(--sw-border, #E2E8F0)",
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab("TEXT")}
            style={{
              padding: "6px 14px",
              borderRadius: "10px",
              fontSize: "12.5px",
              fontWeight: 700,
              border: "1px solid",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: activeTab === "TEXT" ? "#FFFFFF" : "transparent",
              color: activeTab === "TEXT" ? "var(--color-ocean-primary, #0284C7)" : "#64748B",
              borderColor: activeTab === "TEXT" ? "#BAE6FD" : "transparent",
              boxShadow: activeTab === "TEXT" ? "0 2px 4px rgba(0,0,0,0.04)" : "none",
            }}
          >
            <FileTextIcon width={14} height={14} />
            <span>Text / LRC Editor</span>
          </button>

          {track.audioUrl && (
            <button
              type="button"
              onClick={() => setActiveTab("SYNC")}
              style={{
                padding: "6px 14px",
                borderRadius: "10px",
                fontSize: "12.5px",
                fontWeight: 700,
                border: "1px solid",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                backgroundColor: activeTab === "SYNC" ? "#FFFFFF" : "transparent",
                color: activeTab === "SYNC" ? "var(--color-ocean-primary, #0284C7)" : "#64748B",
                borderColor: activeTab === "SYNC" ? "#BAE6FD" : "transparent",
                boxShadow: activeTab === "SYNC" ? "0 2px 4px rgba(0,0,0,0.04)" : "none",
              }}
            >
              <ZapIcon width={14} height={14} />
              <span>Interactive Time Synchronizer</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div
          style={{
            padding: "20px 24px",
            overflowY: "auto",
            flex: 1,
          }}
        >
          {errorMessage && (
            <div
              className="auth-v2-error upload-track-alert"
              role="alert"
              style={{
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 14px",
                borderRadius: "10px",
                backgroundColor: "#FEF2F2",
                border: "1px solid #FECACA",
                color: "#991B1B",
                fontSize: "13px",
              }}
            >
              <AlertIcon width={18} height={18} />
              <div style={{ flex: 1 }}>{errorMessage}</div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "inherit" }}
              >
                <CloseIcon width={14} height={14} />
              </button>
            </div>
          )}

          {activeTab === "TEXT" ? (
            <div>
              {/* File upload toolbar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                <div>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--color-ocean-dark, #0F172A)" }}>
                    Lyric Content (Text or LRC format)
                  </span>
                  <p style={{ margin: "2px 0 0", fontSize: "11.5px", color: "#64748B" }}>
                    Paste lyric lines or upload a valid <b>.lrc</b> timestamped file (max 1MB).
                  </p>
                </div>

                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".lrc,.txt"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      void handleFileUpload(file);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  />
                  <button
                    type="button"
                    className="button button-ghost button-small"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      border: "1px solid var(--sw-border, #CBD5E1)",
                      borderRadius: "8px",
                      padding: "6px 12px",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    <UploadIcon width={14} height={14} />
                    <span>Upload .lrc file</span>
                  </button>
                </div>
              </div>

              {fileName && (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    backgroundColor: "#F0FDF4",
                    border: "1px solid #BBF7D0",
                    color: "#166534",
                    fontSize: "11.5px",
                    fontWeight: 600,
                    marginBottom: "10px",
                  }}
                >
                  <CheckIcon width={13} height={13} />
                  <span>Loaded file: {fileName}</span>
                </div>
              )}

              {/* Textarea */}
              <textarea
                value={lyricsText}
                onChange={(e) => {
                  setLyricsText(e.target.value);
                  setErrorMessage(null);
                }}
                placeholder="[00:12.50] Write or paste lyrics here&#10;[00:16.80] Each line can include timestamp tags..."
                rows={14}
                style={{
                  width: "100%",
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                  fontSize: "13px",
                  lineHeight: "1.7",
                  padding: "14px",
                  borderRadius: "12px",
                  border: "1px solid var(--sw-border, #CBD5E1)",
                  backgroundColor: "#FAFAFA",
                  color: "#1E293B",
                  resize: "vertical",
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "8px",
                  fontSize: "11.5px",
                  color: "#64748B",
                }}
              >
                <span><b>{linesCount}</b> lines detected</span>
                <span>{lyricsText.length} characters</span>
              </div>
            </div>
          ) : (
            <div style={{ minHeight: "480px" }}>
              <LyricSyncTab
                audioUrl={track.audioUrl}
                initialLyrics={lyricsText}
                trackTitle={track.title}
                onApplyLyrics={(lrcContent) => {
                  setLyricsText(lrcContent);
                  setActiveTab("TEXT");
                }}
                onSwitchToUpload={() => setActiveTab("TEXT")}
              />
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid var(--sw-border, #E2E8F0)",
            background: "#F8FAFC",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <div style={{ fontSize: "12px", color: "#64748B" }}>
            {track.status === "PUBLISHED" || track.status === "APPROVED" ? (
              <span>
                ● This track is live. Lyric update will be queued for Staff moderation before going public; the song continues streaming without interruption.
              </span>
            ) : (
              <span>Lyrics will be attached to this track draft.</span>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              type="button"
              className="button button-secondary"
              onClick={onClose}
              disabled={submitting}
              style={{
                padding: "8px 16px",
                borderRadius: "10px",
                fontWeight: 600,
                cursor: submitting ? "not-allowed" : "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="button button-primary"
              onClick={handleSave}
              disabled={submitting || !lyricsText.trim()}
              id="btn-confirm-save-lyrics"
              style={{
                padding: "8px 20px",
                borderRadius: "10px",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                cursor: submitting || !lyricsText.trim() ? "not-allowed" : "pointer",
              }}
            >
              {submitting ? "Submitting..." : (track.status === "PUBLISHED" || (track as any).publicationStatus === "PUBLISHED") ? "Submit for Review" : "Save Lyrics"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
