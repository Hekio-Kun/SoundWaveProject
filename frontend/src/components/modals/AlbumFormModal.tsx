import { useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { useModalScrollLock } from "../../hooks/useModalScrollLock";
import { albumApi, AlbumApiError } from "../../api/album";
import {
  AlertIcon,
  CheckIcon,
  CloseIcon,
  DiscIcon,
  EditIcon,
  UploadIcon,
} from "../../icons";
import type { StudioAlbum } from "../../types";

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

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close on Escape key (Rule 4.7)
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, submitting]);

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
  }, [open, album]);

  if (!open) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file (PNG, JPG, JPEG, WEBP).");
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

  const handleRemoveCover = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCoverFile(null);
    setCoverPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
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
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      style={{
        backgroundColor: "rgba(15, 23, 42, 0.55)",
        backdropFilter: "blur(6px)",
        display: "grid",
        placeItems: "center",
        padding: "20px",
        zIndex: 1000,
      }}
    >
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "640px",
          width: "94vw",
          padding: "28px 32px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          borderRadius: "24px",
          boxShadow: "0 25px 60px -15px rgba(15, 23, 42, 0.25)",
          border: "1px solid rgba(226, 232, 240, 0.85)",
          background: "#ffffff",
          boxSizing: "border-box",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", position: "relative" }}>
          <div
            style={{
              width: "46px",
              height: "46px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, var(--color-ocean-primary, #0284C7), #38BDF8)",
              color: "#ffffff",
              display: "grid",
              placeItems: "center",
              boxShadow: "0 8px 18px rgba(2, 132, 199, 0.25)",
              flexShrink: 0,
            }}
          >
            {isEdit ? <EditIcon width={22} height={22} /> : <DiscIcon width={22} height={22} />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "0.08em",
                color: "var(--color-ocean-primary, #0284C7)",
                textTransform: "uppercase",
                display: "block",
                marginBottom: "2px",
              }}
            >
              ALBUM MANAGEMENT
            </span>
            <h2
              style={{
                fontSize: "21px",
                fontWeight: 800,
                margin: 0,
                color: "var(--color-ocean-dark, #0F172A)",
                letterSpacing: "-0.02em",
              }}
            >
              {isEdit ? "Edit Album Details" : "Create New Album"}
            </h2>
            <p style={{ margin: "2px 0 0", fontSize: "12.5px", color: "var(--sw-muted, #64748B)" }}>
              Customize your album title, release date, and artwork.
            </p>
          </div>

          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Close dialog"
            disabled={submitting}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "#F1F5F9",
              border: "none",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
              transition: "background 0.15s ease",
            }}
          >
            <CloseIcon width={18} height={18} />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="auth-v2-error" role="alert" style={{ margin: 0 }}>
            <span><AlertIcon width={16} height={16} /></span>
            <div><small>{errorMessage}</small></div>
            <button type="button" className="icon-button" onClick={() => setErrorMessage(null)} style={{ marginLeft: "auto" }} aria-label="Dismiss error">
              <CloseIcon width={14} height={14} />
            </button>
          </div>
        )}

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          noValidate
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            overflowY: "auto",
            paddingRight: "4px",
            maxHeight: "calc(90vh - 180px)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "190px 1fr",
              gap: "24px",
              alignItems: "start",
            }}
          >
            {/* Cover Column */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: 700,
                  fontSize: "13px",
                  color: "var(--color-ocean-dark, #0F172A)",
                }}
              >
                Cover Artwork
              </label>

              <div
                style={{
                  width: "190px",
                  height: "190px",
                  borderRadius: "18px",
                  border: coverPreview
                    ? "2px solid #E2E8F0"
                    : "2px dashed var(--color-sand-primary, #D4B996)",
                  backgroundColor: "var(--color-sand-light, #FAF7F2)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  overflow: "hidden",
                  position: "relative",
                  boxShadow: "0 6px 18px rgba(0, 0, 0, 0.06)",
                  transition: "border-color 0.18s ease",
                }}
                onClick={() => fileInputRef.current?.click()}
                title="Click to select artwork"
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
                        background: "rgba(15, 23, 42, 0.72)",
                        color: "#ffffff",
                        fontSize: "11px",
                        fontWeight: 700,
                        textAlign: "center",
                        padding: "7px 4px",
                        backdropFilter: "blur(4px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                      }}
                    >
                      <UploadIcon width={13} height={13} />
                      <span>Change cover</span>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: "center", padding: "16px", color: "var(--sw-muted, #64748B)" }}>
                    <UploadIcon
                      width={28}
                      height={28}
                      style={{
                        margin: "0 auto 8px",
                        display: "block",
                        color: "var(--color-ocean-primary, #0284C7)",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "12.5px",
                        fontWeight: 700,
                        color: "var(--color-ocean-primary, #0284C7)",
                        display: "block",
                      }}
                    >
                      Upload Artwork
                    </span>
                    <small style={{ fontSize: "11px", color: "var(--sw-muted, #64748B)", display: "block", marginTop: "3px" }}>
                      Square 1:1, max 5MB
                    </small>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  style={{ display: "none" }}
                />
              </div>

              {coverPreview && (
                <button
                  type="button"
                  onClick={handleRemoveCover}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#dc2626",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    marginTop: "10px",
                    padding: 0,
                    display: "block",
                  }}
                >
                  Remove artwork
                </button>
              )}

              <div
                style={{
                  marginTop: "12px",
                  padding: "10px",
                  borderRadius: "10px",
                  background: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  fontSize: "11.5px",
                  color: "var(--sw-muted, #64748B)",
                  lineHeight: "1.4",
                }}
              >
                💡 <b>Tip:</b> High quality 1000×1000px artwork looks best on listener profiles and players.
              </div>
            </div>

            {/* Metadata Fields Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label
                  htmlFor="album-form-title"
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: 700,
                    fontSize: "13px",
                    color: "var(--color-ocean-dark, #0F172A)",
                  }}
                >
                  Album Title <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <input
                  id="album-form-title"
                  type="text"
                  placeholder="e.g. Summer Breeze EP"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={200}
                  required
                  disabled={submitting}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "12px",
                    border: "1px solid var(--sw-border, #CBD5E1)",
                    fontSize: "14px",
                    fontWeight: 600,
                    boxSizing: "border-box",
                    outline: "none",
                    color: "var(--color-ocean-dark, #0F172A)",
                  }}
                />
                <div style={{ textAlign: "right", marginTop: "3px" }}>
                  <small style={{ fontSize: "11px", color: "var(--sw-muted, #64748B)" }}>
                    {title.length}/200
                  </small>
                </div>
              </div>

              <div>
                <label
                  htmlFor="album-form-release-date"
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: 700,
                    fontSize: "13px",
                    color: "var(--color-ocean-dark, #0F172A)",
                  }}
                >
                  Release Date
                </label>
                <input
                  id="album-form-release-date"
                  type="date"
                  value={releaseDate}
                  onChange={(e) => setReleaseDate(e.target.value)}
                  disabled={submitting}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "12px",
                    border: "1px solid var(--sw-border, #CBD5E1)",
                    fontSize: "13.5px",
                    boxSizing: "border-box",
                    color: "var(--color-ocean-dark, #0F172A)",
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="album-form-desc"
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: 700,
                    fontSize: "13px",
                    color: "var(--color-ocean-dark, #0F172A)",
                  }}
                >
                  Description <span style={{ fontWeight: 400, color: "var(--sw-muted, #64748B)" }}>(optional)</span>
                </label>
                <textarea
                  id="album-form-desc"
                  rows={4}
                  placeholder="Tell listeners about the concept, story, or genre behind this album..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={2000}
                  disabled={submitting}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "12px",
                    border: "1px solid var(--sw-border, #CBD5E1)",
                    fontSize: "13.5px",
                    boxSizing: "border-box",
                    outline: "none",
                    resize: "vertical",
                    color: "var(--color-ocean-dark, #0F172A)",
                    lineHeight: "1.45",
                  }}
                />
                <div style={{ textAlign: "right", marginTop: "3px" }}>
                  <small style={{ fontSize: "11px", color: "var(--sw-muted, #64748B)" }}>
                    {description.length}/2000
                  </small>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: "10px",
              marginTop: "8px",
              paddingTop: "16px",
              borderTop: "1px solid #F1F5F9",
            }}
          >
            <button
              type="button"
              className="button button-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button button-primary"
              disabled={submitting}
              id="btn-modal-save-album"
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
