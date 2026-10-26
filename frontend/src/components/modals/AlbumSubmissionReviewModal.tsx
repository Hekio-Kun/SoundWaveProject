import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { albumApi } from "../../api/album";
import { useModalScrollLock } from "../../hooks/useModalScrollLock";
import {
  AlertIcon,
  CheckIcon,
  ClockIcon,
  CloseIcon,
  DiscIcon,
  MusicIcon,
  UploadIcon,
} from "../../icons";
import type { StudioAlbum, StudioTrack } from "../../types";

type Props = {
  open: boolean;
  onClose: () => void;
  album: StudioAlbum | null;
  onSuccess: (updatedAlbum: StudioAlbum) => void;
};

function formatDuration(ms?: number): string {
  if (!ms || ms <= 0) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function AlbumSubmissionReviewModal({ open, onClose, album, onSuccess }: Props) {
  useModalScrollLock(open);

  const [fullAlbum, setFullAlbum] = useState<StudioAlbum | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreeTerms, setAgreeTerms] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, submitting, onClose]);

  useEffect(() => {
    if (!open || !album) {
      setFullAlbum(null);
      setError(null);
      setAgreeTerms(false);
      return;
    }

    // Luôn nạp chi tiết danh sách constituent tracks của album
    setLoading(true);
    albumApi
      .getAlbumById(album.id)
      .then((data) => setFullAlbum(data))
      .catch((err) => {
        console.error("Failed to load album tracks for review", err);
        setFullAlbum(album);
      })
      .finally(() => setLoading(false));
  }, [open, album]);

  if (!open || !album) return null;

  const current = fullAlbum ?? album;
  const tracks: StudioTrack[] = current.tracks ?? [];
  const isEmptyAlbum = tracks.length === 0 && (current.trackCount ?? 0) === 0;
  const totalDurationMs = tracks.reduce((acc, t) => acc + (t.durationMs || 0), 0);
  const totalMinutes = Math.round(totalDurationMs / 60000);

  // Sequence 1.2.2.2: click "Confirm Submission"
  const handleConfirmSubmission = async () => {
    if (isEmptyAlbum) {
      setError("Cannot submit an empty album. Please add at least one track.");
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      // Sequence 1.2.2.3: POST /api/v1/studio/albums/{id}/submit
      const updated = await albumApi.submitAlbumForReview(current.id);
      onSuccess(updated);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit album for review.");
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="modal-backdrop" onClick={() => !submitting && onClose()} role="dialog" aria-modal="true">
      <div
        className="modal-card modal-card--wide"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "760px",
          width: "95%",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "28px",
          borderRadius: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        {/* Modal Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", borderBottom: "1px solid var(--sw-border, #E2E8F0)", paddingBottom: "16px" }}>
          <div>
            <span className="eyebrow" style={{ color: "var(--color-ocean-primary, #0284C7)" }}>
              MODERATION SUBMISSION REVIEW · UC-21.2
            </span>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--color-ocean-dark, #0F172A)", margin: "4px 0 0" }}>
              Submit Album For Review
            </h2>
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close dialog"
            style={{ borderRadius: "50%", padding: "6px" }}
          >
            <CloseIcon width={18} height={18} />
          </button>
        </div>

        {/* Error / Alert Display */}
        {error && (
          <div
            className="auth-v2-error"
            role="alert"
            style={{
              padding: "12px 16px",
              borderRadius: "12px",
              background: "#FEF2F2",
              border: "1px solid #FCA5A5",
              color: "#991B1B",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "13.5px",
            }}
          >
            <AlertIcon width={18} height={18} />
            <span>{error}</span>
          </div>
        )}

        {/* EX01: Album contains zero tracks */}
        {!loading && isEmptyAlbum ? (
          <div
            style={{
              background: "#FFFBEB",
              border: "1px dashed #F59E0B",
              borderRadius: "16px",
              padding: "36px 20px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                backgroundColor: "#FEF3C7",
                color: "#D97706",
                display: "grid",
                placeItems: "center",
                margin: "0 auto 12px",
              }}
            >
              <AlertIcon width={24} height={24} />
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 6px", color: "#92400E" }}>
              Cannot submit an empty album
            </h3>
            <p style={{ color: "#B45309", fontSize: "13.5px", margin: "0 0 18px", maxWidth: "420px", marginLeft: "auto", marginRight: "auto" }}>
              Please add at least one track to your draft album before submitting it for Staff moderation review.
            </p>
            <button type="button" className="button button-secondary" onClick={onClose}>
              Close & Add Tracks
            </button>
          </div>
        ) : (
          <>
            {/* Sequence 1.2.2.1: displayAlbumSubmissionReviewBanner(albumMetadata, constituentTracks[]) */}
            <div
              style={{
                background: "linear-gradient(135deg, rgba(2, 132, 199, 0.04) 0%, rgba(212, 163, 115, 0.08) 100%)",
                border: "1px solid var(--sw-border, #E2E8F0)",
                borderRadius: "16px",
                padding: "20px",
                display: "flex",
                gap: "20px",
                alignItems: "flex-start",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "12px",
                  overflow: "hidden",
                  backgroundColor: "var(--color-sand-light, #F5EFE6)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  flexShrink: 0,
                }}
              >
                {current.coverUrl ? (
                  <img src={current.coverUrl} alt={current.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", color: "var(--color-ocean-primary)" }}>
                    <DiscIcon width={48} height={48} />
                  </div>
                )}
              </div>

              <div style={{ flex: 1, minWidth: "220px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: "999px",
                      fontSize: "11px",
                      fontWeight: 700,
                      background: "#FFFBEB",
                      color: "#D97706",
                      border: "1px solid #FDE68A",
                    }}
                  >
                    DRAFT → PENDING
                  </span>
                  {current.releaseDate && (
                    <span style={{ fontSize: "12px", color: "var(--sw-text-muted)" }}>
                      Release: {current.releaseDate}
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: "18px", fontWeight: 800, color: "var(--color-ocean-dark, #0F172A)", margin: "0 0 6px" }}>
                  {current.title}
                </h3>

                <p style={{ fontSize: "13px", color: "var(--sw-text-secondary, #64748B)", margin: "0 0 10px", lineHeight: "1.5" }}>
                  {current.description || "No description provided."}
                </p>

                <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "12px", color: "var(--color-ocean-dark, #0F172A)", fontWeight: 600 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <MusicIcon width={13} height={13} style={{ color: "var(--color-ocean-primary)" }} />
                    {tracks.length} constituent {tracks.length === 1 ? "track" : "tracks"}
                  </span>
                  {totalMinutes > 0 && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <ClockIcon width={13} height={13} style={{ color: "var(--color-ocean-primary)" }} />
                      approx. {totalMinutes} min
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Constituent Tracks List */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--color-ocean-dark, #0F172A)", margin: 0 }}>
                  Constituent Tracks To Be Moderated ({tracks.length})
                </h4>
                <span style={{ fontSize: "12px", color: "var(--sw-text-muted)" }}>
                  All tracks will transition to PENDING status
                </span>
              </div>

              {loading ? (
                <div style={{ padding: "24px", textAlign: "center", color: "var(--sw-text-muted)", fontSize: "13px" }}>
                  Loading tracklist...
                </div>
              ) : (
                <div
                  style={{
                    border: "1px solid var(--sw-border, #E2E8F0)",
                    borderRadius: "12px",
                    overflow: "hidden",
                    maxHeight: "220px",
                    overflowY: "auto",
                  }}
                >
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ background: "#F8FAFC", borderBottom: "1px solid var(--sw-border, #E2E8F0)", textAlign: "left", color: "var(--sw-text-secondary)" }}>
                        <th style={{ padding: "8px 12px", width: "40px" }}>#</th>
                        <th style={{ padding: "8px 12px" }}>Title</th>
                        <th style={{ padding: "8px 12px" }}>Genre</th>
                        <th style={{ padding: "8px 12px", textAlign: "right" }}>Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tracks.map((track, idx) => (
                        <tr
                          key={track.id}
                          style={{
                            borderBottom: idx < tracks.length - 1 ? "1px solid #F1F5F9" : "none",
                            background: idx % 2 === 0 ? "#ffffff" : "#FAFAFA",
                          }}
                        >
                          <td style={{ padding: "8px 12px", color: "var(--sw-text-muted)", fontWeight: 600 }}>
                            {track.trackNumber ?? idx + 1}
                          </td>
                          <td style={{ padding: "8px 12px", fontWeight: 600, color: "var(--color-ocean-dark, #0F172A)" }}>
                            {track.title}
                          </td>
                          <td style={{ padding: "8px 12px", color: "var(--sw-text-secondary)" }}>
                            {track.genreName || "General"}
                          </td>
                          <td style={{ padding: "8px 12px", textAlign: "right", color: "var(--sw-text-muted)" }}>
                            {formatDuration(track.durationMs)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Compliance & Ownership Checkbox */}
            <label
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "flex-start",
                padding: "12px 14px",
                borderRadius: "10px",
                background: "#F8FAFC",
                border: "1px solid var(--sw-border, #E2E8F0)",
                cursor: "pointer",
                fontSize: "13px",
                color: "var(--color-ocean-dark, #0F172A)",
                lineHeight: "1.4",
              }}
            >
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                style={{ marginTop: "2px" }}
                id="chk-album-submission-terms"
              />
              <span>
                I confirm that I own or hold all required intellectual property rights for the audio and artwork in this album, and all tracks adhere to SoundWave Community Guidelines.
              </span>
            </label>

            {/* Modal Actions */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: "12px",
                borderTop: "1px solid var(--sw-border, #E2E8F0)",
                paddingTop: "16px",
              }}
            >
              <button
                type="button"
                className="button button-ghost"
                onClick={onClose}
                disabled={submitting}
                id="btn-cancel-album-submission"
              >
                Cancel
              </button>

              <button
                type="button"
                className="button button-primary"
                onClick={() => void handleConfirmSubmission()}
                disabled={submitting || !agreeTerms || isEmptyAlbum || loading}
                id="btn-confirm-album-submission"
                style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
              >
                {submitting ? (
                  <span>Submitting for Review...</span>
                ) : (
                  <>
                    <UploadIcon width={16} height={16} />
                    <span>Confirm Submission</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
