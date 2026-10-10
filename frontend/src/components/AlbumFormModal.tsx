import { useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { useModalScrollLock } from "../hooks/useModalScrollLock";
import { albumApi, AlbumApiError } from "../api/album";
import {
  AlertIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  CloseIcon,
  DiscIcon,
  EditIcon,
  SearchIcon,
  UploadIcon,
} from "../icons";
import type { StudioAlbum, StudioTrack } from "../types";

type Props = {
  open: boolean;
  onClose: () => void;
  album?: StudioAlbum | null;
  onSaved: () => void;
};

function formatDuration(ms?: number): string {
  if (!ms || ms <= 0) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function AlbumFormModal({ open, onClose, album, onSaved }: Props) {
  useModalScrollLock(open);

  const isEdit = Boolean(album);
  const [activeTab, setActiveTab] = useState<"details" | "tracks">("details");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  // Tracks inside and outside the album
  const [availableTracks, setAvailableTracks] = useState<StudioTrack[]>([]);
  const [selectedTrackIds, setSelectedTrackIds] = useState<number[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [trackSearchQuery, setTrackSearchQuery] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;

    setErrorMessage(null);
    setTrackSearchQuery("");
    setActiveTab("details");

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

    // Load available tracks for this album
    setLoadingTracks(true);
    albumApi
      .getAvailableTracks(album?.id)
      .then((tracks) => {
        setAvailableTracks(tracks);
        if (album && album.tracks && album.tracks.length > 0) {
          setSelectedTrackIds(album.tracks.map((t) => t.id));
        } else if (album) {
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
      setActiveTab("details");
      return;
    }
    if (title.trim().length > 200) {
      setErrorMessage("Album title cannot exceed 200 characters.");
      setActiveTab("details");
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

  // Filter available tracks for search
  const filteredAvailableTracks = availableTracks.filter((t) => {
    if (!trackSearchQuery.trim()) return true;
    const q = trackSearchQuery.trim().toLowerCase();
    return t.title.toLowerCase().includes(q) || (t.genreName && t.genreName.toLowerCase().includes(q));
  });

  // Selected tracks in order
  const selectedTracksInOrder = selectedTrackIds
    .map((id) => availableTracks.find((t) => t.id === id))
    .filter((t): t is StudioTrack => Boolean(t));

  const totalDurationMs = selectedTracksInOrder.reduce((acc, t) => acc + (t.durationMs || 0), 0);

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
        className="modal-card modal-card--wide"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "760px",
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
              {isEdit ? "Edit Album" : "Create New Album"}
            </h2>
            <p style={{ margin: "2px 0 0", fontSize: "12.5px", color: "var(--sw-muted, #64748B)" }}>
              Customize your album details, artwork, and tracks.
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

        {/* Tab Navigation */}
        <div
          style={{
            display: "flex",
            gap: "6px",
            background: "#F1F5F9",
            padding: "4px",
            borderRadius: "12px",
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab("details")}
            style={{
              flex: 1,
              padding: "8px 16px",
              borderRadius: "9px",
              border: "none",
              fontSize: "13px",
              fontWeight: activeTab === "details" ? 700 : 600,
              color: activeTab === "details" ? "var(--color-ocean-primary, #0284C7)" : "#64748B",
              background: activeTab === "details" ? "#FFFFFF" : "transparent",
              boxShadow: activeTab === "details" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
              cursor: "pointer",
              transition: "all 0.15s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <EditIcon width={15} height={15} />
            <span>Album Details</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("tracks")}
            style={{
              flex: 1,
              padding: "8px 16px",
              borderRadius: "9px",
              border: "none",
              fontSize: "13px",
              fontWeight: activeTab === "tracks" ? 700 : 600,
              color: activeTab === "tracks" ? "var(--color-ocean-primary, #0284C7)" : "#64748B",
              background: activeTab === "tracks" ? "#FFFFFF" : "transparent",
              boxShadow: activeTab === "tracks" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
              cursor: "pointer",
              transition: "all 0.15s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <DiscIcon width={15} height={15} />
            <span>Tracks ({selectedTrackIds.length})</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="auth-v2-error" role="alert" style={{ margin: 0 }}>
            <span><AlertIcon width={16} height={16} /></span>
            <div><small>{errorMessage}</small></div>
            <button className="icon-button" onClick={() => setErrorMessage(null)} style={{ marginLeft: "auto" }}>
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
            maxHeight: "calc(90vh - 230px)",
          }}
        >
          {activeTab === "details" ? (
            /* TAB 1: ALBUM DETAILS */
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "200px 1fr",
                gap: "26px",
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
                    width: "200px",
                    height: "200px",
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
                    rows={3}
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

                {/* Track Quick Banner */}
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: "12px",
                    background: "rgba(2, 132, 199, 0.05)",
                    border: "1px solid rgba(2, 132, 199, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <DiscIcon width={20} height={20} style={{ color: "var(--color-ocean-primary, #0284C7)" }} />
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--color-ocean-dark, #0F172A)" }}>
                        {selectedTrackIds.length} track(s) assigned
                      </div>
                      <small style={{ fontSize: "11.5px", color: "var(--sw-muted, #64748B)" }}>
                        {formatDuration(totalDurationMs)} total playing time
                      </small>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("tracks")}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-ocean-primary, #0284C7)",
                      background: "#ffffff",
                      color: "var(--color-ocean-primary, #0284C7)",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Manage sequence →
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* TAB 2: TRACKLIST & SEQUENCE */
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "var(--color-ocean-dark, #0F172A)" }}>
                    Album Tracks ({selectedTrackIds.length} selected)
                  </h3>
                  <small style={{ color: "var(--sw-muted, #64748B)", fontSize: "12px" }}>
                    Reorder tracks or add standalone songs from your library.
                  </small>
                </div>

                {availableTracks.length > 3 && (
                  <div style={{ position: "relative", minWidth: "220px" }}>
                    <input
                      type="text"
                      placeholder="Search tracks..."
                      value={trackSearchQuery}
                      onChange={(e) => setTrackSearchQuery(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "7px 10px 7px 32px",
                        borderRadius: "10px",
                        border: "1px solid #CBD5E1",
                        fontSize: "12.5px",
                        boxSizing: "border-box",
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        left: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "var(--sw-muted, #64748B)",
                      }}
                    >
                      <SearchIcon width={14} height={14} />
                    </span>
                  </div>
                )}
              </div>

              {loadingTracks ? (
                <div style={{ padding: "36px", textAlign: "center", color: "var(--sw-muted, #64748B)", fontSize: "13px" }}>
                  Loading tracklist...
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  {/* Current Sequence */}
                  <div>
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: 800,
                        padding: "0 4px 8px",
                        color: "var(--color-ocean-primary, #0284C7)",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      CURRENT TRACK SEQUENCE ({selectedTracksInOrder.length})
                    </div>

                    {selectedTracksInOrder.length === 0 ? (
                      <div
                        style={{
                          padding: "24px",
                          borderRadius: "12px",
                          backgroundColor: "#F8FAFC",
                          border: "1px dashed #CBD5E1",
                          textAlign: "center",
                          fontSize: "13px",
                          color: "var(--sw-muted, #64748B)",
                        }}
                      >
                        No tracks added to this album yet. Choose from the available tracks below.
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "6px",
                          maxHeight: "220px",
                          overflowY: "auto",
                          paddingRight: "2px",
                        }}
                      >
                        {selectedTracksInOrder.map((track, idx) => (
                          <div
                            key={track.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                              padding: "9px 14px",
                              borderRadius: "12px",
                              backgroundColor: "#ffffff",
                              border: "1.5px solid #E2E8F0",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "12px",
                                fontWeight: 800,
                                color: "var(--color-ocean-primary, #0284C7)",
                                background: "rgba(2, 132, 199, 0.1)",
                                width: "28px",
                                height: "24px",
                                borderRadius: "6px",
                                display: "grid",
                                placeItems: "center",
                                flexShrink: 0,
                              }}
                            >
                              #{idx + 1}
                            </span>
                            <span
                              style={{
                                flex: 1,
                                fontSize: "13.5px",
                                fontWeight: 600,
                                color: "var(--color-ocean-dark, #0F172A)",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {track.title}
                            </span>
                            <span
                              style={{
                                fontSize: "11px",
                                fontWeight: 700,
                                padding: "2px 8px",
                                borderRadius: "6px",
                                background:
                                  track.status === "APPROVED" || track.status === "PUBLISHED" ? "#D1FADF" : "#FFFBEB",
                                color:
                                  track.status === "APPROVED" || track.status === "PUBLISHED" ? "#027A48" : "#D97706",
                                border:
                                  track.status === "APPROVED" || track.status === "PUBLISHED"
                                    ? "1px solid #A7F3D0"
                                    : "1px solid #FDE68A",
                                textTransform: "uppercase",
                              }}
                            >
                              {track.status === "APPROVED" || track.status === "PUBLISHED" ? "PUBLISHED" : track.status}
                            </span>
                            <span style={{ fontSize: "12px", color: "var(--sw-muted, #64748B)", minWidth: "36px", textAlign: "right" }}>
                              {formatDuration(track.durationMs)}
                            </span>
                            <div style={{ display: "flex", gap: "4px" }}>
                              <button
                                type="button"
                                disabled={idx === 0 || submitting}
                                onClick={() => moveTrackOrder(idx, "up")}
                                style={{
                                  width: "28px",
                                  height: "28px",
                                  borderRadius: "8px",
                                  border: "1px solid #CBD5E1",
                                  background: idx === 0 ? "#F8FAFC" : "#ffffff",
                                  cursor: idx === 0 ? "not-allowed" : "pointer",
                                  display: "grid",
                                  placeItems: "center",
                                }}
                                title="Move track up"
                              >
                                <ArrowUpIcon width={13} height={13} />
                              </button>
                              <button
                                type="button"
                                disabled={idx === selectedTracksInOrder.length - 1 || submitting}
                                onClick={() => moveTrackOrder(idx, "down")}
                                style={{
                                  width: "28px",
                                  height: "28px",
                                  borderRadius: "8px",
                                  border: "1px solid #CBD5E1",
                                  background: idx === selectedTracksInOrder.length - 1 ? "#F8FAFC" : "#ffffff",
                                  cursor: idx === selectedTracksInOrder.length - 1 ? "not-allowed" : "pointer",
                                  display: "grid",
                                  placeItems: "center",
                                }}
                                title="Move track down"
                              >
                                <ArrowDownIcon width={13} height={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleTrackSelection(track.id)}
                                style={{
                                  width: "28px",
                                  height: "28px",
                                  borderRadius: "8px",
                                  border: "1px solid rgba(220, 38, 38, 0.2)",
                                  background: "rgba(220, 38, 38, 0.06)",
                                  color: "#dc2626",
                                  cursor: "pointer",
                                  display: "grid",
                                  placeItems: "center",
                                  marginLeft: "2px",
                                }}
                                title="Remove from album"
                              >
                                <CloseIcon width={13} height={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Available Tracks to Add */}
                  <div>
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: 800,
                        padding: "0 4px 8px",
                        color: "var(--sw-muted, #64748B)",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      AVAILABLE STANDALONE TRACKS TO ADD
                    </div>

                    {filteredAvailableTracks.filter((t) => !selectedTrackIds.includes(t.id)).length === 0 ? (
                      <div
                        style={{
                          padding: "16px",
                          borderRadius: "10px",
                          backgroundColor: "#F8FAFC",
                          textAlign: "center",
                          fontSize: "12.5px",
                          color: "var(--sw-muted, #64748B)",
                        }}
                      >
                        All available tracks are already included in this album.
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "6px",
                          maxHeight: "180px",
                          overflowY: "auto",
                          paddingRight: "2px",
                        }}
                      >
                        {filteredAvailableTracks
                          .filter((t) => !selectedTrackIds.includes(t.id))
                          .map((track) => (
                            <div
                              key={track.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                padding: "8px 14px",
                                borderRadius: "10px",
                                backgroundColor: "#ffffff",
                                border: "1px solid #E2E8F0",
                              }}
                            >
                              <span
                                style={{
                                  flex: 1,
                                  fontSize: "13px",
                                  color: "var(--color-ocean-dark, #0F172A)",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {track.title}
                              </span>
                              <span style={{ fontSize: "11px", color: "var(--sw-muted, #64748B)" }}>
                                {track.genreName || "Music"} • {formatDuration(track.durationMs)}
                              </span>
                              <button
                                type="button"
                                onClick={() => toggleTrackSelection(track.id)}
                                style={{
                                  padding: "5px 12px",
                                  fontSize: "12px",
                                  fontWeight: 700,
                                  borderRadius: "8px",
                                  border: "none",
                                  background: "var(--color-ocean-primary, #0284C7)",
                                  color: "#ffffff",
                                  cursor: "pointer",
                                }}
                              >
                                + Add
                              </button>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Form Actions Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "10px",
              paddingTop: "16px",
              borderTop: "1px solid #F1F5F9",
            }}
          >
            {activeTab === "details" ? (
              <button
                type="button"
                onClick={() => setActiveTab("tracks")}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--color-ocean-primary, #0284C7)",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                Tracklist ({selectedTrackIds.length}) →
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab("details")}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--color-ocean-primary, #0284C7)",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                ← Back to Album Details
              </button>
            )}

            <div style={{ display: "flex", gap: "10px" }}>
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
                <span>{submitting ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
