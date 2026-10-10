import { useEffect, useRef, useState, type FormEvent } from "react";
import { albumApi, AlbumApiError } from "../api/album";
import {
  AlertIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  ChevronLeftIcon,
  CloseIcon,
  DiscIcon,
  HeadphonesIcon,
  PlusIcon,
  SearchIcon,
  UploadIcon,
} from "../icons";
import type { CurrentUser, StudioTrack } from "../types";

type Props = {
  isAuthenticated: boolean;
  canCreate: boolean;
  currentUser?: CurrentUser | null;
  onNavigate: (route: string) => void;
};

type FormErrors = Record<string, string>;

function formatDuration(ms?: number): string {
  if (!ms || ms <= 0) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function CreateAlbumPage({ isAuthenticated, canCreate, currentUser, onNavigate }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [releaseDate, setReleaseDate] = useState(() => new Date().toISOString().slice(0, 10));

  // Artwork
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tracks selection & sequencing
  const [availableTracks, setAvailableTracks] = useState<StudioTrack[]>([]);
  const [selectedTrackIds, setSelectedTrackIds] = useState<number[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [tracksError, setTracksError] = useState("");
  const [trackSearchQuery, setTrackSearchQuery] = useState("");

  // Submission state
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [createdAlbumTitle, setCreatedAlbumTitle] = useState("");

  // Load available tracks (standalone tracks owned by current user)
  const loadTracks = async () => {
    if (!isAuthenticated || !canCreate) return;
    setLoadingTracks(true);
    setTracksError("");
    try {
      const tracks = await albumApi.getAvailableTracks();
      setAvailableTracks(tracks);
    } catch (err: unknown) {
      setTracksError(err instanceof Error ? err.message : "Failed to load standalone tracks.");
    } finally {
      setLoadingTracks(false);
    }
  };

  useEffect(() => {
    void loadTracks();
  }, [isAuthenticated, canCreate]);

  const clearError = (field: string) => {
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormErrors((prev) => ({ ...prev, cover: "Please select a valid image file (PNG, JPG, JPEG, WEBP)." }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormErrors((prev) => ({ ...prev, cover: "Cover artwork must not exceed 5MB." }));
      return;
    }

    clearError("cover");
    setCoverFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setCoverPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCover = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCoverFile(null);
    setCoverPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
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
    const errors: FormErrors = {};

    if (!title.trim()) {
      errors.title = "Album title is required.";
    } else if (title.trim().length > 200) {
      errors.title = "Album title cannot exceed 200 characters.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    const payload = {
      title: title.trim(),
      description: description.trim() ? description.trim() : undefined,
      releaseDate: releaseDate ? releaseDate : undefined,
      trackIds: selectedTrackIds,
    };

    try {
      await albumApi.createAlbum(payload, coverFile ?? undefined);
      setCreatedAlbumTitle(payload.title);
    } catch (err: unknown) {
      if (err instanceof AlbumApiError) {
        setSubmitError(err.message);
        if (err.fieldErrors) setFormErrors(err.fieldErrors);
      } else if (err instanceof Error) {
        setSubmitError(err.message);
      } else {
        setSubmitError("Failed to create album. Please verify your connection and try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setReleaseDate(new Date().toISOString().slice(0, 10));
    setCoverFile(null);
    setCoverPreview(null);
    setSelectedTrackIds([]);
    setFormErrors({});
    setSubmitError("");
    setCreatedAlbumTitle("");
    void loadTracks();
  };

  // Guard: Unauthorized or non-listener
  if (!isAuthenticated || !canCreate) {
    return (
      <div className="upload-track-page">
        <button className="upload-track-back" type="button" onClick={() => onNavigate("/studio")}>
          <ChevronLeftIcon width={17} height={17} /> Back to Content Studio
        </button>
        <section className="upload-track-access-card">
          <span className="upload-track-access-card__icon"><DiscIcon width={28} height={28} /></span>
          <h1>{isAuthenticated ? "Listener access required" : "Log in to create an album"}</h1>
          <p>{isAuthenticated
            ? "Album creation is available to listener and artist accounts. Staff and administrators can use their moderation dashboards."
            : "Please sign in to organize your discography and create albums."}</p>
          <button className="button button-primary" onClick={() => onNavigate(isAuthenticated ? "/" : "/login")}>
            {isAuthenticated ? "Return to Explore" : "Go to login"}
          </button>
        </section>
      </div>
    );
  }

  // Success view
  if (createdAlbumTitle) {
    return (
      <div className="upload-track-page">
        <section className="upload-track-success" role="status">
          <span className="upload-track-success__icon"><CheckIcon width={34} height={34} /></span>
          <span className="eyebrow">ALBUM CREATED</span>
          <h1>Your album is ready!</h1>
          <p>
            <strong>{createdAlbumTitle}</strong> has been successfully created with{" "}
            <b>{selectedTrackIds.length} {selectedTrackIds.length === 1 ? "track" : "tracks"}</b>.
            You can view, edit, or publish it anytime from your Content Studio dashboard.
          </p>
          <div className="upload-track-success__actions">
            <button className="button button-primary" onClick={() => onNavigate("/studio")}>
              View in Content Studio
            </button>
            <button className="button button-secondary" onClick={resetForm}>
              Create another album
            </button>
          </div>
        </section>
      </div>
    );
  }

  // Filter tracks by search query
  const filteredAvailableTracks = availableTracks.filter((track) => {
    if (!trackSearchQuery.trim()) return true;
    const q = trackSearchQuery.trim().toLowerCase();
    return track.title.toLowerCase().includes(q) || (track.genreName && track.genreName.toLowerCase().includes(q));
  });

  const selectedTracksList = selectedTrackIds
    .map((id) => availableTracks.find((t) => t.id === id))
    .filter((t): t is StudioTrack => Boolean(t));

  const artistDisplayName = currentUser?.displayName || currentUser?.username || "You (Artist)";

  return (
    <div style={{ maxWidth: "1240px", margin: "0 auto", padding: "24px 28px 60px", boxSizing: "border-box" }}>
      {/* Redesigned Header: Content Studio Hero Banner */}
      <header
        style={{
          background: "linear-gradient(135deg, rgba(2, 132, 199, 0.07) 0%, rgba(212, 163, 115, 0.1) 100%)",
          border: "1px solid rgba(2, 132, 199, 0.14)",
          borderRadius: "20px",
          padding: "26px 30px",
          display: "flex",
          alignItems: "center",
          gap: "20px",
          marginBottom: "28px",
          boxShadow: "0 10px 28px rgba(16, 24, 40, 0.03)",
        }}
      >
        <div
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, var(--color-ocean-primary, #0284C7), var(--color-sand-primary, #D4A373))",
            color: "#ffffff",
            display: "grid",
            placeItems: "center",
            boxShadow: "0 8px 20px rgba(2, 132, 199, 0.22)",
            flexShrink: 0,
          }}
        >
          <DiscIcon width={28} height={28} />
        </div>
        <div>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--color-ocean-primary, #0284C7)",
              display: "block",
              marginBottom: "4px",
            }}
          >
            CONTENT STUDIO • NEW RELEASE
          </span>
          <h1
            style={{
              fontSize: "clamp(24px, 2.5vw, 30px)",
              fontWeight: 800,
              color: "var(--color-ocean-dark, #0F172A)",
              margin: "0 0 6px 0",
              lineHeight: 1.2,
            }}
          >
            Create a new album
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "var(--sw-text-secondary, #64748B)",
              margin: 0,
              lineHeight: 1.5,
              maxWidth: "760px",
            }}
          >
            Curate your standalone tracks into a cohesive album experience, upload custom artwork, and set the perfect track sequence.
          </p>
        </div>
      </header>

      {/* Alerts */}
      {tracksError && (
        <div className="auth-v2-error" role="alert" style={{ marginBottom: "20px" }}>
          <span><AlertIcon width={17} height={17} /></span>
          <div><b>Unable to load tracks</b><small>{tracksError}</small></div>
          <button className="button button-secondary button-small" type="button" onClick={() => void loadTracks()}>
            Try again
          </button>
        </div>
      )}

      {submitError && (
        <div className="auth-v2-error" role="alert" style={{ marginBottom: "20px" }}>
          <span><AlertIcon width={17} height={17} /></span>
          <div><b>Failed to create album</b><small>{submitError}</small></div>
        </div>
      )}

      {/* Main 2-Column Grid: Form in the center & Live Preview on the right */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 350px",
          gap: "28px",
          alignItems: "start",
        }}
      >
        {/* CENTER COLUMN: The Album Creation Form */}
        <form
          onSubmit={handleSubmit}
          noValidate
          style={{
            background: "#ffffff",
            border: "1px solid var(--color-sand-light, #E6D5B8)",
            borderRadius: "20px",
            padding: "32px",
            boxShadow: "0 10px 30px rgba(16, 24, 40, 0.04)",
          }}
        >
          {/* Section 01: Album Information */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
              paddingBottom: "16px",
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "8px",
                  backgroundColor: "var(--color-sand-light, #F5EFE6)",
                  color: "var(--color-ocean-primary, #0284C7)",
                  fontSize: "13px",
                  fontWeight: 800,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                01
              </span>
              <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0, color: "var(--color-ocean-dark, #0F172A)" }}>
                Album information
              </h2>
            </div>
            <small style={{ color: "var(--sw-text-muted)", fontSize: "12px" }}>
              <b style={{ color: "#dc2626" }}>*</b> Required fields
            </small>
          </div>

          <div className="form-group" style={{ marginBottom: "20px" }}>
            <label htmlFor="create-album-title" style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "14px" }}>
              Album title <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <input
              id="create-album-title"
              type="text"
              placeholder="e.g. Echoes of the Coastline"
              value={title}
              maxLength={200}
              disabled={submitting}
              onChange={(e) => {
                setTitle(e.target.value);
                clearError("title");
              }}
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: "12px",
                border: formErrors.title ? "1.5px solid #dc2626" : "1px solid var(--sw-border, #CBD5E1)",
                fontSize: "14px",
                boxSizing: "border-box",
                outline: "none",
                transition: "border-color 0.16s ease",
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
              {formErrors.title ? (
                <small style={{ color: "#dc2626", fontSize: "12px" }}>{formErrors.title}</small>
              ) : <span />}
              <small style={{ color: "var(--sw-text-muted)", fontSize: "12px" }}>{title.length}/200</small>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: "20px" }}>
            <label htmlFor="create-album-description" style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "14px" }}>
              Description <span style={{ color: "var(--sw-text-muted)", fontWeight: "normal" }}>(optional)</span>
            </label>
            <textarea
              id="create-album-description"
              rows={3}
              placeholder="Tell listeners the story behind this album, artistic concepts, or collaborative credits..."
              value={description}
              disabled={submitting}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: "12px",
                border: "1px solid var(--sw-border, #CBD5E1)",
                fontSize: "14px",
                boxSizing: "border-box",
                outline: "none",
                resize: "vertical",
              }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: "28px" }}>
            <label htmlFor="create-album-release-date" style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "14px" }}>
              Release date
            </label>
            <input
              id="create-album-release-date"
              type="date"
              value={releaseDate}
              disabled={submitting}
              onChange={(e) => setReleaseDate(e.target.value)}
              style={{
                maxWidth: "260px",
                padding: "10px 14px",
                borderRadius: "12px",
                border: "1px solid var(--sw-border, #CBD5E1)",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Section 02: Cover Artwork */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
              paddingTop: "20px",
              paddingBottom: "16px",
              borderTop: "1px solid #f1f5f9",
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "8px",
                  backgroundColor: "var(--color-sand-light, #F5EFE6)",
                  color: "var(--color-ocean-primary, #0284C7)",
                  fontSize: "13px",
                  fontWeight: 800,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                02
              </span>
              <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0, color: "var(--color-ocean-dark, #0F172A)" }}>
                Cover artwork
              </h2>
            </div>
            <small style={{ color: "var(--sw-text-muted)", fontSize: "12px" }}>JPG, PNG up to 5MB</small>
          </div>

          <div className="form-group" style={{ marginBottom: "28px" }}>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png,image/jpeg,image/jpg,image/webp"
              style={{ display: "none" }}
              onChange={handleFileChange}
              disabled={submitting}
              id="create-album-cover-file"
            />

            <div style={{ display: "flex", gap: "22px", alignItems: "flex-start", flexWrap: "wrap" }}>
              <div
                style={{
                  width: "170px",
                  height: "170px",
                  borderRadius: "16px",
                  border: "2px dashed var(--color-sand-primary, #D4B996)",
                  backgroundColor: "var(--color-sand-light, #FAF7F2)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  overflow: "hidden",
                  position: "relative",
                  transition: "all 0.18s ease",
                  flexShrink: 0,
                }}
                onClick={() => fileInputRef.current?.click()}
                title="Click to select album cover"
              >
                {coverPreview ? (
                  <>
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <button
                      type="button"
                      onClick={handleRemoveCover}
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        backgroundColor: "rgba(15, 23, 42, 0.75)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "50%",
                        width: "28px",
                        height: "28px",
                        display: "grid",
                        placeItems: "center",
                        cursor: "pointer",
                      }}
                      title="Remove artwork"
                      aria-label="Remove artwork"
                    >
                      <CloseIcon width={14} height={14} />
                    </button>
                  </>
                ) : (
                  <div style={{ textAlign: "center", padding: "16px", color: "var(--sw-text-muted)" }}>
                    <UploadIcon width={30} height={30} style={{ margin: "0 auto 8px", display: "block", color: "var(--color-ocean-primary, #0284C7)" }} />
                    <span style={{ fontSize: "13px", fontWeight: 700, display: "block", color: "var(--color-ocean-primary, #0284C7)" }}>
                      Choose cover
                    </span>
                    <small style={{ fontSize: "11px", display: "block", marginTop: "4px" }}>
                      Square 1:1 ratio
                    </small>
                  </div>
                )}
              </div>

              <div style={{ flex: 1, minWidth: "220px" }}>
                <p style={{ margin: "0 0 12px", fontSize: "14px", color: "var(--sw-text-secondary, #64748B)", lineHeight: "1.5" }}>
                  A high-resolution cover image makes your album stand out on the catalog and explore pages. Recommended size: <b>500x500px</b> or higher.
                </p>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    className="button button-secondary button-small"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={submitting}
                  >
                    <UploadIcon width={15} height={15} />
                    <span>{coverPreview ? "Change image" : "Browse file"}</span>
                  </button>
                  {coverPreview && (
                    <button
                      type="button"
                      className="button button-ghost button-small text-danger"
                      onClick={handleRemoveCover}
                      disabled={submitting}
                    >
                      Remove
                    </button>
                  )}
                </div>
                {formErrors.cover && (
                  <small style={{ color: "#dc2626", fontSize: "12px", display: "block", marginTop: "8px" }}>
                    {formErrors.cover}
                  </small>
                )}
              </div>
            </div>
          </div>

          {/* Section 03: Tracklist Selection */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
              paddingTop: "20px",
              paddingBottom: "16px",
              borderTop: "1px solid #f1f5f9",
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "8px",
                  backgroundColor: "var(--color-sand-light, #F5EFE6)",
                  color: "var(--color-ocean-primary, #0284C7)",
                  fontSize: "13px",
                  fontWeight: 800,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                03
              </span>
              <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0, color: "var(--color-ocean-dark, #0F172A)" }}>
                Tracklist selection
              </h2>
            </div>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: "12px",
                backgroundColor: selectedTrackIds.length > 0 ? "rgba(2, 132, 199, 0.1)" : "#f1f5f9",
                color: selectedTrackIds.length > 0 ? "var(--color-ocean-primary, #0284C7)" : "var(--sw-text-muted)",
              }}
            >
              {selectedTrackIds.length} selected
            </span>
          </div>

          <div className="form-group" style={{ marginBottom: "20px" }}>
            <p style={{ fontSize: "13px", color: "var(--sw-text-secondary, #64748B)", margin: "0 0 14px" }}>
              Select standalone tracks from your studio to include in this album. You can order tracks by moving them up or down.
            </p>

            {/* Quick search filter for tracks */}
            {availableTracks.length > 3 && (
              <div style={{ position: "relative", marginBottom: "14px" }}>
                <input
                  type="text"
                  placeholder="Filter tracks by title or genre..."
                  value={trackSearchQuery}
                  onChange={(e) => setTrackSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px 8px 34px",
                    borderRadius: "10px",
                    border: "1px solid var(--sw-border, #CBD5E1)",
                    fontSize: "13px",
                    boxSizing: "border-box",
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    left: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--sw-text-muted)",
                    display: "flex",
                    pointerEvents: "none",
                  }}
                >
                  <SearchIcon width={14} height={14} />
                </span>
                {trackSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setTrackSearchQuery("")}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--sw-text-muted)",
                      padding: 0,
                    }}
                  >
                    <CloseIcon width={12} height={12} />
                  </button>
                )}
              </div>
            )}

            {loadingTracks ? (
              <div style={{ padding: "30px", textAlign: "center", color: "var(--sw-text-muted)" }}>
                Loading your tracks...
              </div>
            ) : availableTracks.length === 0 ? (
              <div
                style={{
                  background: "var(--color-sand-light, #FAF7F2)",
                  border: "1px dashed var(--color-sand-primary, #D4B996)",
                  borderRadius: "14px",
                  padding: "24px",
                  textAlign: "center",
                }}
              >
                <HeadphonesIcon width={32} height={32} style={{ color: "var(--color-ocean-primary, #0284C7)", margin: "0 auto 8px" }} />
                <h4 style={{ margin: "0 0 4px", fontSize: "15px", color: "var(--color-ocean-dark, #0F172A)" }}>
                  No standalone tracks available
                </h4>
                <p style={{ margin: 0, fontSize: "13px", color: "var(--sw-text-secondary)" }}>
                  You can create this album now as an empty collection and assign tracks later from Content Studio.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "380px", overflowY: "auto", paddingRight: "4px" }}>
                {filteredAvailableTracks.map((track) => {
                  const isSelected = selectedTrackIds.includes(track.id);
                  const selectedIndex = selectedTrackIds.indexOf(track.id);

                  return (
                    <div
                      key={track.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "10px 14px",
                        borderRadius: "12px",
                        border: isSelected
                          ? "1.5px solid var(--color-ocean-primary, #0284C7)"
                          : "1px solid var(--sw-border, #E2E8F0)",
                        backgroundColor: isSelected ? "rgba(2, 132, 199, 0.04)" : "#ffffff",
                        transition: "all 0.16s ease",
                      }}
                    >
                      <input
                        type="checkbox"
                        id={`track-chk-${track.id}`}
                        checked={isSelected}
                        onChange={() => toggleTrackSelection(track.id)}
                        disabled={submitting}
                        style={{ cursor: "pointer", width: "17px", height: "17px", accentColor: "var(--color-ocean-primary, #0284C7)" }}
                      />

                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "8px",
                          backgroundColor: "#f1f5f9",
                          overflow: "hidden",
                          flexShrink: 0,
                          display: "grid",
                          placeItems: "center",
                        }}
                      >
                        {track.coverUrl ? (
                          <img
                            src={track.coverUrl}
                            alt={track.title}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <HeadphonesIcon width={18} height={18} style={{ color: "var(--sw-text-muted)" }} />
                        )}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <b style={{ display: "block", fontSize: "14px", color: "var(--color-ocean-dark, #0F172A)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {track.title}
                        </b>
                        <small style={{ color: "var(--sw-text-muted)", fontSize: "12px" }}>
                          {track.genreName || "Music"} • {formatDuration(track.durationMs)}
                        </small>
                      </div>

                      {isSelected && (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: 700,
                              padding: "2px 8px",
                              borderRadius: "10px",
                              backgroundColor: "var(--color-sand-light, #F5EFE6)",
                              color: "var(--color-sand-dark, #8C6D46)",
                            }}
                          >
                            Track #{selectedIndex + 1}
                          </span>
                          <button
                            type="button"
                            className="icon-button"
                            disabled={selectedIndex === 0 || submitting}
                            onClick={() => moveTrackOrder(selectedIndex, "up")}
                            title="Move track up"
                            aria-label="Move track up"
                            style={{ padding: "4px" }}
                          >
                            <ArrowUpIcon width={14} height={14} />
                          </button>
                          <button
                            type="button"
                            className="icon-button"
                            disabled={selectedIndex === selectedTrackIds.length - 1 || submitting}
                            onClick={() => moveTrackOrder(selectedIndex, "down")}
                            title="Move track down"
                            aria-label="Move track down"
                            style={{ padding: "4px" }}
                          >
                            <ArrowDownIcon width={14} height={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Form Bottom Actions */}
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "32px", paddingTop: "20px", borderTop: "1px solid #f1f5f9" }}>
            <button
              type="button"
              className="button button-secondary"
              onClick={() => onNavigate("/studio")}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button button-primary"
              disabled={submitting}
              id="btn-submit-create-album"
            >
              <PlusIcon width={16} height={16} />
              <span>{submitting ? "Creating album..." : "Create Album"}</span>
            </button>
          </div>
        </form>

        {/* RIGHT COLUMN: Polished Sticky Live Preview Card */}
        <aside
          style={{
            position: "sticky",
            top: "24px",
            alignSelf: "start",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              border: "1px solid var(--color-sand-light, #E6D5B8)",
              borderRadius: "20px",
              padding: "24px",
              boxShadow: "0 12px 36px rgba(16, 24, 40, 0.06)",
            }}
          >
            {/* Live Preview Label with Pulse Dot */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "var(--color-ocean-primary, #0284C7)",
                    display: "inline-block",
                    boxShadow: "0 0 0 3px rgba(2, 132, 199, 0.2)",
                  }}
                />
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                    color: "var(--color-ocean-primary, #0284C7)",
                    textTransform: "uppercase",
                  }}
                >
                  LIVE PREVIEW
                </span>
              </div>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: "10px",
                  backgroundColor: "var(--color-sand-light, #F5EFE6)",
                  color: "var(--color-sand-dark, #8C6D46)",
                }}
              >
                DRAFT
              </span>
            </div>

            {/* Artwork Preview (NO BROKEN IMAGE EVER) */}
            <div
              style={{
                width: "100%",
                aspectRatio: "1/1",
                borderRadius: "16px",
                overflow: "hidden",
                marginBottom: "16px",
                boxShadow: "0 8px 24px rgba(16, 24, 40, 0.1)",
                position: "relative",
              }}
            >
              {coverPreview ? (
                <img
                  src={coverPreview}
                  alt="Album artwork live preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                /* Elegant Vinyl Art Placeholder */
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(135deg, #0369A1 0%, #0284C7 50%, #D4A373 100%)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ffffff",
                    position: "relative",
                  }}
                >
                  {/* Vinyl Record Center Effect */}
                  <div
                    style={{
                      width: "84px",
                      height: "84px",
                      borderRadius: "50%",
                      backgroundColor: "rgba(15, 23, 42, 0.5)",
                      border: "2px solid rgba(255, 255, 255, 0.25)",
                      display: "grid",
                      placeItems: "center",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
                      marginBottom: "10px",
                    }}
                  >
                    <DiscIcon width={40} height={40} style={{ opacity: 0.95 }} />
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: 600, opacity: 0.85, letterSpacing: "0.02em" }}>
                    Your Artwork Here
                  </span>
                  <small style={{ fontSize: "10px", opacity: 0.65, marginTop: "2px" }}>
                    Square 1:1 format
                  </small>
                </div>
              )}
            </div>

            {/* Album Metadata in Preview */}
            <div style={{ marginBottom: "16px" }}>
              <h3
                style={{
                  margin: "0 0 4px 0",
                  fontSize: "17px",
                  fontWeight: 700,
                  color: "var(--color-ocean-dark, #0F172A)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={title || "Untitled Album"}
              >
                {title.trim() ? title.trim() : "Untitled Album"}
              </h3>
              <p
                style={{
                  margin: "0 0 6px 0",
                  fontSize: "13px",
                  color: "var(--sw-text-secondary, #64748B)",
                }}
              >
                by <b>{artistDisplayName}</b>
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--sw-text-muted)" }}>
                <span>Release: {releaseDate || "Today"}</span>
                <span>•</span>
                <span>{selectedTrackIds.length} {selectedTrackIds.length === 1 ? "track" : "tracks"}</span>
              </div>
            </div>

            {/* Mini Tracklist Sequence Preview */}
            <div
              style={{
                borderTop: "1px solid #f1f5f9",
                paddingTop: "14px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--sw-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Tracklist Sequence
                </span>
                <span style={{ fontSize: "11px", color: "var(--color-ocean-primary, #0284C7)", fontWeight: 600 }}>
                  {selectedTracksList.length} total
                </span>
              </div>

              {selectedTracksList.length === 0 ? (
                <p style={{ margin: 0, fontSize: "12px", color: "var(--sw-text-muted)", fontStyle: "italic", textAlign: "center", padding: "12px 0" }}>
                  Select tracks from the form to arrange track order.
                </p>
              ) : (
                <div style={{ maxHeight: "180px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px" }}>
                  {selectedTracksList.map((track, idx) => (
                    <div
                      key={track.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "6px 8px",
                        borderRadius: "8px",
                        backgroundColor: "#f8fafc",
                        fontSize: "12px",
                      }}
                    >
                      <span style={{ fontWeight: 700, color: "var(--sw-text-muted)", width: "18px", textAlign: "right" }}>
                        {idx + 1}.
                      </span>
                      <span
                        style={{
                          flex: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          fontWeight: 600,
                          color: "var(--color-ocean-dark, #0F172A)",
                        }}
                      >
                        {track.title}
                      </span>
                      <span style={{ color: "var(--sw-text-muted)", fontSize: "11px", flexShrink: 0 }}>
                        {formatDuration(track.durationMs)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
