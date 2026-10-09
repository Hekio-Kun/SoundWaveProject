import { useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { useModalScrollLock } from "../hooks/useModalScrollLock";
import { albumApi, AlbumApiError } from "../api/album";
import { CloseIcon, UploadIcon, CheckIcon, AlertIcon } from "../icons";
import type { StudioAlbum, StudioTrack } from "../types";

type Props = {
  open: boolean;
  onClose: () => void;
  album?: StudioAlbum | null;
  onSaved: () => void;
};

export function AlbumFormModal({ open, onClose, album, onSaved }: Props) {
  useModalScrollLock(open);

  const isEdit = Boolean(album);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  // Danh sách bài hát khả dụng và bài hát đã chọn (theo thứ tự)
  const [availableTracks, setAvailableTracks] = useState<StudioTrack[]>([]);
  const [selectedTrackIds, setSelectedTrackIds] = useState<number[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;

    setErrorMessage(null);

    if (album) {
      setTitle(album.title);
      setDescription(album.description ?? "");
      setReleaseDate(album.releaseDate ?? "");
      setCoverPreview(album.coverUrl ?? null);
      setCoverFile(null);
    } else {
      setTitle("");
      setDescription("");
      setReleaseDate(new Date().toISOString().slice(0, 10));
      setCoverPreview(null);
      setCoverFile(null);
    }

    // Tải danh sách bài hát có thể đưa vào album
    setLoadingTracks(true);
    albumApi
      .getAvailableTracks(album?.id)
      .then((tracks) => {
        setAvailableTracks(tracks);
        if (album && album.tracks && album.tracks.length > 0) {
          // Khôi phục thứ tự bài hát hiện tại của album
          setSelectedTrackIds(album.tracks.map((t) => t.id));
        } else if (album) {
          // Lấy chi tiết album để lấy đầy đủ tracks nếu chưa có
          albumApi.getAlbumById(album.id).then((fullAlbum) => {
            if (fullAlbum.tracks) {
              setSelectedTrackIds(fullAlbum.tracks.map((t) => t.id));
            }
          });
        } else {
          setSelectedTrackIds([]);
        }
      })
      .catch((err) => {
        console.error("Failed to load tracks for album", err);
      })
      .finally(() => {
        setLoadingTracks(false);
      });
  }, [open, album]);

  if (!open) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file (PNG, JPG, JPEG).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Cover artwork must not exceed 5MB.");
      return;
    }

    setCoverFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setCoverPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
    setErrorMessage(null);
  };

  const toggleTrackSelection = (trackId: number) => {
    setSelectedTrackIds((prev) => {
      if (prev.includes(trackId)) {
        return prev.filter((id) => id !== trackId);
      } else {
        return [...prev, trackId];
      }
    });
  };

  const moveTrackOrder = (index: number, direction: "up" | "down") => {
    const newOrder = [...selectedTrackIds];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;

    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    setSelectedTrackIds(newOrder);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage("Album title is required.");
      return;
    }
    if (title.trim().length > 200) {
      setErrorMessage("Album title cannot exceed 200 characters.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    const payload = {
      title: title.trim(),
      description: description.trim() ? description.trim() : undefined,
      releaseDate: releaseDate ? releaseDate : undefined,
      trackIds: selectedTrackIds,
    };

    try {
      if (isEdit && album) {
        await albumApi.updateAlbum(album.id, payload, coverFile ?? undefined);
      } else {
        await albumApi.createAlbum(payload, coverFile ?? undefined);
      }
      onSaved();
      onClose();
    } catch (err) {
      if (err instanceof AlbumApiError) {
        setErrorMessage(err.message);
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("An unexpected error occurred while saving the album.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-container album-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "680px", width: "95%" }}
      >
        <div className="modal-header">
          <div>
            <span className="eyebrow">{isEdit ? "EDIT DISCOGRAPHY" : "NEW RELEASE"}</span>
            <h2 className="modal-title">{isEdit ? "Edit Album" : "Create New Album"}</h2>
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Close dialog"
            disabled={submitting}
          >
            <CloseIcon width={18} height={18} />
          </button>
        </div>

        {errorMessage && (
          <div className="auth-v2-error" role="alert" style={{ margin: "0 24px 16px" }}>
            <span><AlertIcon width={18} height={18} /></span>
            <div>
              <b>Error</b>
              <small>{errorMessage}</small>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="album-form" style={{ padding: "0 24px 24px" }}>
          {/* Cover Art Upload & Metadata */}
          <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: "20px", marginBottom: "20px" }}>
            <div>
              <label className="input-label" style={{ display: "block", marginBottom: "8px" }}>
                Cover Artwork
              </label>
              <div
                style={{
                  width: "180px",
                  height: "180px",
                  borderRadius: "12px",
                  border: "2px dashed var(--color-sand-primary, #D4B996)",
                  backgroundColor: "var(--color-sand-light, #F5EFE6)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  overflow: "hidden",
                  position: "relative",
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                {coverPreview ? (
                  <>
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: "rgba(0,0,0,0.6)",
                        color: "#fff",
                        fontSize: "11px",
                        textAlign: "center",
                        padding: "4px",
                      }}
                    >
                      Change cover
                    </div>
                  </>
                ) : (
                  <>
                    <UploadIcon width={28} height={28} />
                    <span style={{ fontSize: "12px", marginTop: "8px", color: "var(--color-text-secondary, #57534E)" }}>
                      Upload Cover
                    </span>
                    <span style={{ fontSize: "10px", color: "var(--color-text-muted, #8D877F)" }}>Max 5MB</span>
                  </>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png,image/jpeg,image/jpg"
                  style={{ display: "none" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label className="input-label" htmlFor="album-title">
                  Album Title <span style={{ color: "var(--color-danger, #B42318)" }}>*</span>
                </label>
                <input
                  id="album-title"
                  type="text"
                  className="input-field"
                  placeholder="e.g. Summer Breeze EP"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={200}
                  required
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="input-label" htmlFor="album-release-date">
                  Release Date
                </label>
                <input
                  id="album-release-date"
                  type="date"
                  className="input-field"
                  value={releaseDate}
                  onChange={(e) => setReleaseDate(e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="input-label" htmlFor="album-desc">
                  Description
                </label>
                <textarea
                  id="album-desc"
                  className="input-field"
                  rows={2}
                  placeholder="Tell listeners about the concept or story of this album..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={2000}
                  disabled={submitting}
                />
              </div>
            </div>
          </div>

          {/* Component Tracks Selection (BR-18, BR-22, BR-23) */}
          <div style={{ marginTop: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <label className="input-label" style={{ margin: 0 }}>
                Component Tracks ({selectedTrackIds.length} selected)
              </label>
              <small style={{ color: "var(--color-text-secondary, #57534E)" }}>
                Tip: Published tracks will make the album live publicly
              </small>
            </div>

            {loadingTracks ? (
              <div style={{ padding: "20px", textAlign: "center", color: "var(--color-text-muted)" }}>
                Loading available tracks...
              </div>
            ) : availableTracks.length === 0 ? (
              <div
                style={{
                  padding: "16px",
                  borderRadius: "8px",
                  backgroundColor: "var(--color-sand-light, #F5EFE6)",
                  textAlign: "center",
                  fontSize: "13px",
                  color: "var(--color-text-secondary, #57534E)",
                }}
              >
                You don't have any standalone tracks available. You can create the album now and assign tracks later during upload!
              </div>
            ) : (
              <div
                style={{
                  maxHeight: "220px",
                  overflowY: "auto",
                  border: "1px solid var(--color-border, #EAE4DC)",
                  borderRadius: "10px",
                  padding: "6px",
                  backgroundColor: "#fff",
                }}
              >
                {/* 1. Danh sách các bài đã chọn với nút sắp xếp thứ tự */}
                {selectedTrackIds.length > 0 && (
                  <div style={{ marginBottom: "10px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, padding: "4px 8px", color: "var(--color-brand-blue, #0284C7)", textTransform: "uppercase" }}>
                      Track Sequence in Album
                    </div>
                    {selectedTrackIds.map((trackId, idx) => {
                      const track = availableTracks.find((t) => t.id === trackId);
                      if (!track) return null;
                      return (
                        <div
                          key={`selected-${track.id}`}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            padding: "6px 10px",
                            borderRadius: "6px",
                            backgroundColor: "var(--color-sand-light, #F5EFE6)",
                            marginBottom: "4px",
                            fontSize: "13px",
                          }}
                        >
                          <span style={{ width: "24px", fontWeight: 700, color: "var(--color-brand-blue, #0284C7)" }}>
                            #{idx + 1}
                          </span>
                          <span style={{ flex: 1, fontWeight: 500 }}>{track.title}</span>
                          <span
                            style={{
                              fontSize: "11px",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              marginRight: "10px",
                              backgroundColor: track.status === "APPROVED" ? "#ECFDF5" : "#FEF3F2",
                              color: track.status === "APPROVED" ? "#059669" : "#B42318",
                            }}
                          >
                            {track.status}
                          </span>
                          <button
                            type="button"
                            className="button button-outline"
                            style={{ padding: "2px 6px", minHeight: "auto", fontSize: "11px", marginRight: "4px" }}
                            onClick={() => moveTrackOrder(idx, "up")}
                            disabled={idx === 0}
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            className="button button-outline"
                            style={{ padding: "2px 6px", minHeight: "auto", fontSize: "11px", marginRight: "6px" }}
                            onClick={() => moveTrackOrder(idx, "down")}
                            disabled={idx === selectedTrackIds.length - 1}
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            className="icon-button"
                            style={{ width: "24px", height: "24px" }}
                            onClick={() => toggleTrackSelection(track.id)}
                            title="Remove from album"
                          >
                            <CloseIcon width={12} height={12} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 2. Danh sách các bài chưa chọn để thêm vào */}
                <div style={{ fontSize: "11px", fontWeight: 700, padding: "4px 8px", color: "var(--color-text-muted, #8D877F)", textTransform: "uppercase" }}>
                  Available Tracks to Add
                </div>
                {availableTracks
                  .filter((t) => !selectedTrackIds.includes(t.id))
                  .map((track) => (
                    <div
                      key={`avail-${track.id}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "6px 10px",
                        borderRadius: "6px",
                        marginBottom: "4px",
                        cursor: "pointer",
                      }}
                      onClick={() => toggleTrackSelection(track.id)}
                    >
                      <input
                        type="checkbox"
                        checked={false}
                        readOnly
                        style={{ marginRight: "10px" }}
                      />
                      <span style={{ flex: 1, fontSize: "13px" }}>{track.title}</span>
                      <span style={{ fontSize: "11px", color: "var(--color-text-secondary, #57534E)" }}>
                        {track.genreName || "Track"} · {track.status}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="modal-actions" style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <button
              type="button"
              className="button button-outline"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button button-primary"
              disabled={submitting}
            >
              <CheckIcon width={16} height={16} />
              <span>{submitting ? "Saving..." : isEdit ? "Save Changes" : "Create Album"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
