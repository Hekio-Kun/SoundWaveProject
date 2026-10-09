import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useModalScrollLock } from "../hooks/useModalScrollLock";
import { albumApi } from "../api/album";
import { CloseIcon, EditIcon, HeadphonesIcon } from "../icons";
import type { StudioAlbum } from "../types";

type Props = {
  open: boolean;
  onClose: () => void;
  album: StudioAlbum | null;
  onEdit: (album: StudioAlbum) => void;
};

function formatDuration(ms?: number): string {
  if (!ms || ms <= 0) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function AlbumDetailModal({ open, onClose, album, onEdit }: Props) {
  useModalScrollLock(open);

  const [fullAlbum, setFullAlbum] = useState<StudioAlbum | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !album) {
      setFullAlbum(null);
      return;
    }

    setLoading(true);
    albumApi
      .getAlbumById(album.id)
      .then((data) => setFullAlbum(data))
      .catch((err) => {
        console.error("Failed to fetch album details", err);
        setFullAlbum(album);
      })
      .finally(() => setLoading(false));
  }, [open, album]);

  if (!open || !album) return null;

  const current = fullAlbum ?? album;
  const isPublished = current.status === "PUBLISHED";

  return createPortal(
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-container album-detail-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "720px", width: "95%" }}
      >
        <div className="modal-header">
          <div>
            <span className="eyebrow">ALBUM DETAILS (UC-21.2)</span>
            <h2 className="modal-title">{current.title}</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close dialog">
            <CloseIcon width={18} height={18} />
          </button>
        </div>

        <div style={{ padding: "0 24px 24px" }}>
          {/* Header Banner */}
          <div style={{ display: "flex", gap: "20px", alignItems: "flex-start", marginBottom: "24px" }}>
            <div
              style={{
                width: "160px",
                height: "160px",
                borderRadius: "12px",
                overflow: "hidden",
                backgroundColor: "var(--color-sand-light, #F5EFE6)",
                flexShrink: 0,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            >
              {current.coverUrl ? (
                <img
                  src={current.coverUrl}
                  alt={current.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "grid",
                    placeItems: "center",
                    color: "var(--color-sand-deep, #A88B68)",
                  }}
                >
                  <HeadphonesIcon width={48} height={48} />
                </div>
              )}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: "20px",
                    backgroundColor: isPublished ? "#ECFDF5" : "#FEF3F2",
                    color: isPublished ? "#059669" : "#B42318",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  {isPublished ? "● PUBLISHED (Live)" : "○ DRAFT"}
                </span>
                {current.releaseDate && (
                  <span style={{ fontSize: "12px", color: "var(--color-text-secondary, #57534E)" }}>
                    Released: {current.releaseDate}
                  </span>
                )}
              </div>

              <h3 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 8px 0" }}>{current.title}</h3>

              {current.description && (
                <p style={{ fontSize: "13px", color: "var(--color-text-secondary, #57534E)", margin: "0 0 16px 0", lineHeight: 1.5 }}>
                  {current.description}
                </p>
              )}

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  className="button button-primary button-small"
                  onClick={() => {
                    onClose();
                    onEdit(current);
                  }}
                >
                  <EditIcon width={14} height={14} />
                  <span>Edit Album</span>
                </button>
              </div>
            </div>
          </div>

          {/* Track List */}
          <div>
            <h4 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "12px" }}>
              Component Tracks ({current.tracks ? current.tracks.length : current.trackCount})
            </h4>

            {loading ? (
              <div style={{ padding: "20px", textAlign: "center", color: "var(--color-text-muted)" }}>
                Loading tracks...
              </div>
            ) : !current.tracks || current.tracks.length === 0 ? (
              <div
                style={{
                  padding: "20px",
                  borderRadius: "8px",
                  backgroundColor: "var(--color-sand-light, #F5EFE6)",
                  textAlign: "center",
                  fontSize: "13px",
                  color: "var(--color-text-secondary, #57534E)",
                }}
              >
                No component tracks have been assigned to this album yet.
              </div>
            ) : (
              <div
                style={{
                  border: "1px solid var(--color-border, #EAE4DC)",
                  borderRadius: "10px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "40px 1fr 140px 80px 100px",
                    padding: "8px 12px",
                    backgroundColor: "var(--color-sand-light, #F5EFE6)",
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: "var(--color-text-secondary, #57534E)",
                  }}
                >
                  <span>#</span>
                  <span>Title</span>
                  <span>Genre</span>
                  <span>Duration</span>
                  <span>Status</span>
                </div>

                {current.tracks.map((track, idx) => (
                  <div
                    key={track.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "40px 1fr 140px 80px 100px",
                      padding: "10px 12px",
                      borderTop: "1px solid var(--color-border, #EAE4DC)",
                      fontSize: "13px",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontWeight: 600, color: "var(--color-brand-blue, #0284C7)" }}>
                      {track.trackNumber ?? idx + 1}
                    </span>
                    <span style={{ fontWeight: 500 }}>{track.title}</span>
                    <span style={{ color: "var(--color-text-secondary, #57534E)" }}>{track.genreName}</span>
                    <span style={{ color: "var(--color-text-muted, #8D877F)", fontSize: "12px" }}>
                      {formatDuration(track.durationMs)}
                    </span>
                    <span>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          padding: "2px 8px",
                          borderRadius: "12px",
                          backgroundColor:
                            track.status === "APPROVED"
                              ? "#ECFDF5"
                              : "#FEF3F2",
                          color:
                            track.status === "APPROVED"
                              ? "#059669"
                              : "#B42318",
                        }}
                      >
                        {track.status}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
