import { useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { albumApi, AlbumApiError } from "../api/album";
import { catalogApi } from "../api/catalog";
import { LyricSyncTab } from "../components/common/LyricSyncTab";
import { MediaUploadField } from "../components/common/MediaUploadField";
import { CenterNotificationPopup } from "../components/modals/CenterNotificationPopup";
import { useModalScrollLock } from "../hooks/useModalScrollLock";
import {
  AlertIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  DiscIcon,
  EditIcon,
  FileTextIcon,
  HeadphonesIcon,
  PlusIcon,
  TrashIcon,
  UploadIcon,
} from "../icons";
import type { CurrentUser, Genre } from "../types";
import {
  readAudioDuration,
  readLyricsFile,
  validateAudioFile,
  validateLyricsFile,
} from "../utils/trackUpload";

type Props = {
  isAuthenticated: boolean;
  canCreate: boolean;
  currentUser?: CurrentUser | null;
  onNavigate: (route: string) => void;
};

type TrackItem = {
  id: string; // temporary client ID
  file: File;
  title: string;
  genreId: number;
  durationMs: number;
  description: string;
  lyrics: string;
};

type FormErrors = Record<string, string>;

function formatDuration(ms?: number): string {
  if (!ms || ms <= 0) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function cleanFilenameToTitle(filename: string): string {
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
  return nameWithoutExt.replace(/^\d+[\s.-]+/, "").trim() || nameWithoutExt;
}

export function CreateAlbumPage({ isAuthenticated, canCreate, onNavigate }: Props) {
  // Wizard steps: 1 = Album Details, 2 = Add Tracks (Track by Track builder)
  const [step, setStep] = useState<1 | 2>(1);

  // 1. Album metadata (Album does NOT have a genre column)
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [releaseDate, setReleaseDate] = useState(() => new Date().toISOString().slice(0, 10));

  // Cover artwork
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Available genres (used for individual track assignment)
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loadingGenres, setLoadingGenres] = useState(false);

  // 2. Added tracks list
  const [tracks, setTracks] = useState<TrackItem[]>([]);

  // 3. Current track form (identical layout and controls to UploadTrackPage)
  const [editingTrackIndex, setEditingTrackIndex] = useState<number | null>(null);
  const [currentAudioFile, setCurrentAudioFile] = useState<File | null>(null);
  const [currentTitle, setCurrentTitle] = useState("");
  const [currentGenreId, setCurrentGenreId] = useState<number>(0);
  const [currentDurationMs, setCurrentDurationMs] = useState<number>(0);
  const [currentDescription, setCurrentDescription] = useState("");
  const [currentLyrics, setCurrentLyrics] = useState("");
  const [currentLyricsFile, setCurrentLyricsFile] = useState<File | null>(null);
  const [showLyricMaker, setShowLyricMaker] = useState(false);

  // Validation & Submission state
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [trackFormErrors, setTrackFormErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ title: string; status: string; count: number } | null>(null);
  const [pageToast, setPageToast] = useState<{ message: string; type: "success" | "warning" | "error" } | null>(null);

  // Submit for Review confirmation modal
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [copyrightAgreed, setCopyrightAgreed] = useState(false);
  const [submitterNote, setSubmitterNote] = useState("");

  useModalScrollLock(confirmModalOpen);

  useEffect(() => {
    if (!confirmModalOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) setConfirmModalOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [confirmModalOpen, submitting]);

  // Load genres for track assignment
  useEffect(() => {
    let mounted = true;
    const fetchGenres = async () => {
      setLoadingGenres(true);
      try {
        const data = await catalogApi.getGenres();
        if (mounted) {
          setGenres(data);
          if (data.length > 0) {
            setCurrentGenreId((prev) => (prev ? prev : data[0].id));
          }
        }
      } catch (err) {
        console.error("Failed to load genres", err);
      } finally {
        if (mounted) setLoadingGenres(false);
      }
    };
    void fetchGenres();
    return () => {
      mounted = false;
    };
  }, []);

  const clearError = (field: string) => {
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const clearTrackError = (field: string) => {
    if (trackFormErrors[field]) {
      setTrackFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Cover upload
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    if (coverInputRef.current) coverInputRef.current.value = "";
  };

  // Step 1 Validation -> Proceed to Step 2
  const handleProceedToTracks = (e?: FormEvent) => {
    if (e) e.preventDefault();
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

    setFormErrors({});
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Audio file selection for active track form
  const handleCurrentAudioChange = async (file: File | null) => {
    setCurrentAudioFile(null);
    setCurrentDurationMs(0);
    if (!file) {
      clearTrackError("audio");
      return;
    }

    const error = validateAudioFile(file);
    if (error) {
      setTrackFormErrors((prev) => ({ ...prev, audio: error }));
      return;
    }

    setCurrentAudioFile(file);
    clearTrackError("audio");

    // Autofill track title from filename if title is currently empty
    if (!currentTitle.trim()) {
      setCurrentTitle(cleanFilenameToTitle(file.name));
      clearTrackError("title");
    }

    const duration = await readAudioDuration(file);
    if (duration) {
      setCurrentDurationMs(duration);
    }
  };

  // Lyrics file selection for active track form
  const handleCurrentLyricsChange = async (file: File | null) => {
    setCurrentLyricsFile(null);
    setCurrentLyrics("");
    if (!file) {
      clearTrackError("lyrics");
      return;
    }

    const error = validateLyricsFile(file);
    if (error) {
      setTrackFormErrors((prev) => ({ ...prev, lyrics: error }));
      return;
    }

    try {
      const text = await readLyricsFile(file);
      setCurrentLyrics(text);
      setCurrentLyricsFile(file);
      clearTrackError("lyrics");
      setPageToast({ type: "success", message: "Lyrics file loaded successfully." });
    } catch (err: unknown) {
      setTrackFormErrors((prev) => ({
        ...prev,
        lyrics: err instanceof Error ? err.message : "Lyrics file could not be read.",
      }));
    }
  };

  // Reset active track form
  const resetTrackForm = () => {
    setEditingTrackIndex(null);
    setCurrentAudioFile(null);
    setCurrentTitle("");
    setCurrentDurationMs(0);
    setCurrentDescription("");
    setCurrentLyrics("");
    setCurrentLyricsFile(null);
    setShowLyricMaker(false);
    setTrackFormErrors({});
  };

  // Save current track and advance to next track ("Add Next Track")
  const handleSaveAndNextTrack = () => {
    const errors: FormErrors = {};

    if (!currentAudioFile && editingTrackIndex === null) {
      errors.audio = "Please select an MP3, WAV or FLAC audio file.";
    }
    if (!currentTitle.trim()) {
      errors.title = "Track title is required.";
    } else if (currentTitle.trim().length > 200) {
      errors.title = "Track title cannot exceed 200 characters.";
    }
    if (!currentGenreId) {
      errors.genre = "Please select a music genre.";
    }
    if (currentDescription.trim().length > 2000) {
      errors.description = "Description cannot exceed 2000 characters.";
    }

    if (Object.keys(errors).length > 0) {
      setTrackFormErrors(errors);
      const firstField = Object.keys(errors)[0];
      const targetId = firstField === "audio" ? "audio-upload-button" : `upload-track-${firstField}`;
      requestAnimationFrame(() => document.getElementById(targetId)?.focus());
      return;
    }

    const genreIdVal = Number(currentGenreId);

    if (editingTrackIndex !== null) {
      // Update existing track in list
      const target = tracks[editingTrackIndex];
      const updatedItem: TrackItem = {
        ...target,
        file: currentAudioFile || target.file,
        title: currentTitle.trim(),
        genreId: genreIdVal,
        durationMs: currentDurationMs > 0 ? currentDurationMs : target.durationMs,
        description: currentDescription.trim(),
        lyrics: currentLyrics.trim(),
      };
      setTracks((prev) => prev.map((t, idx) => (idx === editingTrackIndex ? updatedItem : t)));
      setPageToast({ type: "success", message: `Updated "${currentTitle.trim()}" successfully!` });
    } else {
      // Add new track into album tracklist
      const newItem: TrackItem = {
        id: `track-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        file: currentAudioFile!,
        title: currentTitle.trim(),
        genreId: genreIdVal,
        durationMs: currentDurationMs,
        description: currentDescription.trim(),
        lyrics: currentLyrics.trim(),
      };
      setTracks((prev) => [...prev, newItem]);
      setPageToast({ type: "success", message: `Track #${tracks.length + 1} "${currentTitle.trim()}" added to album!` });
    }

    // Reset active form ready for next track
    resetTrackForm();
    clearError("tracks");
    requestAnimationFrame(() => {
      document.getElementById("upload-track-title")?.focus();
    });
  };

  // Edit an existing track from the tracklist
  const handleEditTrack = (index: number) => {
    const track = tracks[index];
    setEditingTrackIndex(index);
    setCurrentAudioFile(track.file);
    setCurrentTitle(track.title);
    setCurrentGenreId(track.genreId);
    setCurrentDurationMs(track.durationMs);
    setCurrentDescription(track.description);
    setCurrentLyrics(track.lyrics);
    setCurrentLyricsFile(null);
    setShowLyricMaker(false);
    setTrackFormErrors({});
    window.scrollTo({ top: 240, behavior: "smooth" });
    requestAnimationFrame(() => document.getElementById("upload-track-title")?.focus());
  };

  // Reorder tracks
  const handleMoveTrack = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= tracks.length) return;
    const reordered = [...tracks];
    const temp = reordered[index];
    reordered[index] = reordered[target];
    reordered[target] = temp;
    setTracks(reordered);
  };

  // Remove track from album
  const handleRemoveTrack = (index: number) => {
    if (editingTrackIndex === index) {
      resetTrackForm();
    } else if (editingTrackIndex !== null && editingTrackIndex > index) {
      setEditingTrackIndex(editingTrackIndex - 1);
    }
    setTracks((prev) => prev.filter((_, i) => i !== index));
  };

  // Submission process (Draft or Submit for Review)
  const processSubmitAlbum = async (submitForReview: boolean) => {
    // If user has an in-progress track filled with audio and title, automatically commit it
    let finalTracks = [...tracks];
    if (editingTrackIndex === null && currentAudioFile && currentTitle.trim()) {
      const genreIdVal = Number(currentGenreId || genres[0]?.id || 1);
      const autoTrack: TrackItem = {
        id: `track-auto-${Date.now()}`,
        file: currentAudioFile,
        title: currentTitle.trim(),
        genreId: genreIdVal,
        durationMs: currentDurationMs,
        description: currentDescription.trim(),
        lyrics: currentLyrics.trim(),
      };
      finalTracks.push(autoTrack);
      setTracks(finalTracks);
      resetTrackForm();
    }

    if (finalTracks.length === 0) {
      setSubmitError("Please add at least one track to your album before saving.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const constituentTracksPayload = finalTracks.map((t, idx) => ({
        title: t.title.trim(),
        genreId: t.genreId,
        trackNumber: idx + 1,
        description: t.description.trim() ? t.description.trim() : undefined,
        lyrics: t.lyrics.trim() ? t.lyrics.trim() : undefined,
        durationMs: t.durationMs > 0 ? t.durationMs : undefined,
        audioIndex: idx,
      }));

      const payload = {
        title: title.trim(),
        description: description.trim() ? description.trim() : undefined,
        releaseDate: releaseDate ? releaseDate : undefined,
        submitForReview,
        tracks: constituentTracksPayload,
      };

      const audioFiles = finalTracks.map((t) => t.file);
      const created = await albumApi.createAlbum(payload, coverFile ?? undefined, audioFiles);

      setSuccessInfo({
        title: created.title,
        status: created.status,
        count: created.trackCount || finalTracks.length,
      });
    } catch (err: unknown) {
      if (err instanceof AlbumApiError) {
        setSubmitError(err.message);
        if (err.fieldErrors) {
          setFormErrors(err.fieldErrors);
        }
      } else if (err instanceof Error) {
        setSubmitError(err.message);
      } else {
        setSubmitError("Failed to create album. Please verify your connection and try again.");
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartSubmitReview = () => {
    let finalCount = tracks.length;
    if (editingTrackIndex === null && currentAudioFile && currentTitle.trim()) {
      finalCount++;
    }

    if (finalCount === 0) {
      setSubmitError("Please add at least one track to your album before submitting.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setConfirmModalOpen(true);
  };

  const handleConfirmSubmitReview = async () => {
    setConfirmModalOpen(false);
    await processSubmitAlbum(true);
  };

  const totalDurationMs = tracks.reduce((acc, t) => acc + (t.durationMs || 0), 0);

  // Access Control Guard
  if (!isAuthenticated || !canCreate) {
    return (
      <div className="upload-track-page">
        <button className="upload-track-back" type="button" onClick={() => onNavigate("/studio")}>
          <ChevronLeftIcon width={17} height={17} /> Back to Content Studio
        </button>
        <section className="upload-track-access-card">
          <span className="upload-track-access-card__icon"><UploadIcon width={28} height={28} /></span>
          <h1>{isAuthenticated ? "Creator access required" : "Log in to create an album"}</h1>
          <p>
            {isAuthenticated
              ? "Album creation is available for active creator accounts. Please return to studio or contact support."
              : "Your account is required to create albums, save drafts, and submit music for review."}
          </p>
          <button className="button button-primary" onClick={() => onNavigate(isAuthenticated ? "/studio" : "/login")}>
            {isAuthenticated ? "Return to Content Studio" : "Go to login"}
          </button>
        </section>
      </div>
    );
  }

  // Success Confirmation Screen
  if (successInfo) {
    const isPending = successInfo.status === "PENDING";
    return (
      <div className="upload-track-page" style={{ maxWidth: "760px", margin: "40px auto", padding: "0 24px" }}>
        <section className="upload-track-success" role="status">
          <span className="upload-track-success__icon"><CheckIcon width={34} height={34} /></span>
          <span className="eyebrow">{isPending ? "SUBMITTED FOR REVIEW" : "ALBUM SAVED AS DRAFT"}</span>
          <h1>{isPending ? "Album queued for staff review" : "Your album is ready"}</h1>
          <p>
            {isPending ? (
              <>
                <strong>"{successInfo.title}"</strong> and all {successInfo.count} constituent tracks have been submitted to the moderation queue. Staff will examine the audio and metadata before making it publicly accessible.
              </>
            ) : (
              <>
                <strong>"{successInfo.title}"</strong> with {successInfo.count} tracks has been saved in your personal library. You can review it in Content Studio before submitting it to staff.
              </>
            )}
          </p>
          <div className="upload-track-success__actions">
            <button className="button button-primary" onClick={() => onNavigate("/studio")}>
              Open Content Studio
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="upload-track-page" style={{ maxWidth: "1160px", margin: "0 auto", padding: "24px 24px 80px" }}>
      {/* Stepper Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "28px",
          borderBottom: "1px solid var(--sw-border, #E2E8F0)",
          paddingBottom: "18px",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <span className="eyebrow">CONTENT STUDIO · ALBUM BUILDER</span>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--color-ocean-dark, #0F172A)", margin: "4px 0" }}>
            Create An Album
          </h1>
          <p style={{ color: "var(--sw-text-secondary, #64748B)", fontSize: "14px", margin: 0 }}>
            {step === 1
              ? "Step 1 of 2: Set album title, artwork, and release details."
              : "Step 2 of 2: Build your album track by track, then submit or save as draft."}
          </p>
        </div>

        {/* Step Indicators */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            type="button"
            onClick={() => setStep(1)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "7px 16px",
              borderRadius: "20px",
              background: step === 1 ? "var(--color-ocean-primary, #0284C7)" : "var(--color-sand-light, #F5EFE6)",
              color: step === 1 ? "#ffffff" : "var(--color-ocean-dark, #0F172A)",
              border: "none",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <span>1. Album Info</span>
          </button>

          <ChevronRightIcon width={14} height={14} style={{ color: "var(--sw-text-muted)" }} />

          <button
            type="button"
            onClick={() => {
              if (title.trim()) {
                setStep(2);
              } else {
                handleProceedToTracks();
              }
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "7px 16px",
              borderRadius: "20px",
              background: step === 2 ? "var(--color-ocean-primary, #0284C7)" : "var(--color-sand-light, #F5EFE6)",
              color: step === 2 ? "#ffffff" : "var(--color-ocean-dark, #0F172A)",
              border: "none",
              fontSize: "13px",
              fontWeight: 700,
              cursor: title.trim() ? "pointer" : "not-allowed",
              opacity: title.trim() ? 1 : 0.6,
            }}
          >
            <span>2. Add Tracks ({tracks.length})</span>
          </button>
        </div>
      </div>

      {/* Global Error Alert */}
      {submitError && (
        <div className="auth-v2-error upload-track-alert" role="alert" style={{ marginBottom: "24px" }}>
          <span><AlertIcon width={20} height={20} /></span>
          <div>
            <b>Notice</b>
            <small>{submitError}</small>
          </div>
        </div>
      )}

      {/* ========================================================
          STEP 1: ALBUM INFORMATION (NO GENRE COLUMN)
      ======================================================== */}
      {step === 1 && (
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div
            className="upload-track-form-card"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            <div className="upload-track-card-heading">
              <div>
                <span>01</span>
                <h2>Album Details</h2>
              </div>
              <small><b>*</b> Required fields</small>
            </div>

            {/* Cover Art Box */}
            <div>
              <label style={{ display: "block", fontWeight: 700, fontSize: "14px", marginBottom: "8px", color: "var(--color-ocean-dark, #0F172A)" }}>
                Cover Artwork <span style={{ fontWeight: 400, color: "var(--sw-text-muted)" }}>(Optional)</span>
              </label>

              <div style={{ display: "flex", gap: "24px", alignItems: "center", flexWrap: "wrap" }}>
                <div
                  onClick={() => coverInputRef.current?.click()}
                  style={{
                    width: "160px",
                    height: "160px",
                    borderRadius: "14px",
                    border: coverPreview ? "1px solid var(--color-sand-light, #E6D5B8)" : "2px dashed var(--color-sand-primary, #D4B996)",
                    backgroundColor: coverPreview ? "#000000" : "var(--color-sand-light, #F5EFE6)",
                    display: "grid",
                    placeItems: "center",
                    cursor: "pointer",
                    position: "relative",
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  {coverPreview ? (
                    <>
                      <img
                        src={coverPreview}
                        alt="Album Cover Preview"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      <button
                        type="button"
                        onClick={handleRemoveCover}
                        style={{
                          position: "absolute",
                          top: "8px",
                          right: "8px",
                          background: "rgba(15, 23, 42, 0.75)",
                          border: "none",
                          color: "#ffffff",
                          borderRadius: "50%",
                          width: "26px",
                          height: "26px",
                          display: "grid",
                          placeItems: "center",
                          cursor: "pointer",
                        }}
                        title="Remove cover"
                      >
                        <CloseIcon width={12} height={12} />
                      </button>
                    </>
                  ) : (
                    <div style={{ textAlign: "center", padding: "12px" }}>
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          backgroundColor: "#ffffff",
                          color: "var(--color-ocean-primary, #0284C7)",
                          display: "grid",
                          placeItems: "center",
                          margin: "0 auto 8px",
                        }}
                      >
                        <UploadIcon width={18} height={18} />
                      </div>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-ocean-dark, #0F172A)", display: "block" }}>
                        Upload Cover
                      </span>
                    </div>
                  )}
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleCoverChange}
                    style={{ display: "none" }}
                    id="create-album-cover-file"
                  />
                </div>

                <div style={{ fontSize: "13px", color: "var(--sw-text-secondary, #64748B)", lineHeight: 1.6, flex: 1, minWidth: "220px" }}>
                  <p style={{ margin: "0 0 6px", fontWeight: 600, color: "var(--color-ocean-dark, #0F172A)" }}>
                    Recommended album cover image:
                  </p>
                  <p style={{ margin: 0 }}>Square aspect ratio (1:1), at least 500x500 pixels. Supports PNG, JPG, or WEBP up to 5MB.</p>
                  {formErrors.cover && (
                    <p style={{ color: "#dc2626", fontWeight: 600, marginTop: "6px" }}>{formErrors.cover}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Album Title */}
            <div className="form-group">
              <label htmlFor="create-album-title">
                Album Title <span aria-hidden="true">*</span>
              </label>
              <input
                id="create-album-title"
                type="text"
                value={title}
                placeholder="e.g. Ocean Breeze EP"
                autoFocus
                onChange={(e) => {
                  setTitle(e.target.value);
                  clearError("title");
                }}
              />
              {formErrors.title && (
                <small className="auth-v2-field-error"><AlertIcon width={12} height={12} />{formErrors.title}</small>
              )}
            </div>

            {/* Intended Release Date */}
            <div className="form-group">
              <label htmlFor="create-album-release-date">
                Intended Release Date
              </label>
              <input
                id="create-album-release-date"
                type="date"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
              />
            </div>

            {/* Album Description */}
            <div className="form-group">
              <label htmlFor="create-album-description">
                Album Description <span>(optional)</span>
              </label>
              <textarea
                id="create-album-description"
                rows={3}
                value={description}
                maxLength={2000}
                placeholder="Describe the story, themes, or background of this album..."
                onChange={(e) => setDescription(e.target.value)}
              />
              <div className="upload-track-character-count">
                <span>{formErrors.description || ""}</span>
                <small>{description.length}/2000</small>
              </div>
            </div>

            {/* Step 1 Actions */}
            <div className="upload-track-actions" style={{ marginTop: "12px" }}>
              <button
                type="button"
                className="button button-ghost"
                onClick={() => onNavigate("/studio")}
              >
                Cancel
              </button>

              <button
                type="button"
                className="button button-primary"
                onClick={() => handleProceedToTracks()}
                style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
              >
                <span>Next: Add Tracks</span>
                <ChevronRightIcon width={16} height={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          STEP 2: ADD TRACKS (IDENTICAL TO UPLOAD TRACK PAGE)
      ======================================================== */}
      {step === 2 && (
        <div>
          {/* Top Album Summary Card */}
          <div
            style={{
              background: "var(--color-sand-light, #F5EFE6)",
              border: "1px solid var(--color-sand-primary, #D4B996)",
              borderRadius: "14px",
              padding: "14px 20px",
              marginBottom: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "8px",
                  backgroundColor: "#ffffff",
                  overflow: "hidden",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                {coverPreview ? (
                  <img src={coverPreview} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <DiscIcon width={24} height={24} style={{ color: "var(--color-ocean-primary, #0284C7)" }} />
                )}
              </div>
              <div>
                <h3 style={{ margin: "0 0 2px", fontSize: "16px", fontWeight: 800, color: "var(--color-ocean-dark, #0F172A)" }}>
                  {title || "Untitled Album"}
                </h3>
                <span style={{ fontSize: "12px", color: "var(--sw-text-secondary, #64748B)" }}>
                  {releaseDate ? `Release: ${releaseDate}` : "Immediate Release"}
                </span>
              </div>
            </div>

            <button
              type="button"
              className="button button-ghost button-small"
              onClick={() => setStep(1)}
              style={{ fontSize: "12px" }}
            >
              Edit Album Details
            </button>
          </div>

          {/* Upload Track Layout matching UploadTrackPage */}
          <div className="upload-track-layout">
            
            {/* Left Column: Track Information & Media Form */}
            <form
              className="upload-track-form-card"
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveAndNextTrack();
              }}
              noValidate
            >
              <div className="upload-track-card-heading">
                <div>
                  <span>{editingTrackIndex !== null ? editingTrackIndex + 1 : tracks.length + 1}</span>
                  <h2>{editingTrackIndex !== null ? `Edit Track #${editingTrackIndex + 1}` : `Track #${tracks.length + 1} Information`}</h2>
                </div>
                <small><b>*</b> Required fields</small>
              </div>

              {/* Track Title */}
              <div className="form-group">
                <label htmlFor="upload-track-title">
                  Track title <span aria-hidden="true">*</span>
                </label>
                <input
                  id="upload-track-title"
                  value={currentTitle}
                  maxLength={201}
                  disabled={submitting}
                  aria-invalid={Boolean(trackFormErrors.title)}
                  placeholder="For example: Sunset Memories"
                  onChange={(event) => {
                    setCurrentTitle(event.target.value);
                    clearTrackError("title");
                  }}
                />
                {trackFormErrors.title && (
                  <small className="auth-v2-field-error"><AlertIcon width={12} height={12} />{trackFormErrors.title}</small>
                )}
              </div>

              {/* Grid: Genre & Album (Album is fixed to this album) */}
              <div className="studio-form-grid studio-form-grid--equal">
                <div className="form-group">
                  <label htmlFor="upload-track-genre">
                    Genre <span aria-hidden="true">*</span>
                  </label>
                  <select
                    id="upload-track-genre"
                    value={currentGenreId}
                    disabled={submitting || loadingGenres || genres.length === 0}
                    aria-invalid={Boolean(trackFormErrors.genre)}
                    onChange={(event) => {
                      setCurrentGenreId(Number(event.target.value));
                      clearTrackError("genre");
                    }}
                  >
                    {genres.length === 0 && <option value={0}>{loadingGenres ? "Loading genres..." : "Genres unavailable"}</option>}
                    {genres.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                  {trackFormErrors.genre && (
                    <small className="auth-v2-field-error"><AlertIcon width={12} height={12} />{trackFormErrors.genre}</small>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="upload-track-album">Album</label>
                  <input
                    id="upload-track-album"
                    value={title ? `${title} (Current Album)` : "Current Album"}
                    disabled
                    readOnly
                    style={{ backgroundColor: "var(--sw-surface-alt, #f8fafc)", cursor: "not-allowed" }}
                  />
                </div>
              </div>

              {/* Track Description */}
              <div className="form-group">
                <label htmlFor="upload-track-description">
                  Description <span>(optional)</span>
                </label>
                <textarea
                  id="upload-track-description"
                  rows={3}
                  maxLength={2001}
                  value={currentDescription}
                  disabled={submitting}
                  aria-invalid={Boolean(trackFormErrors.description)}
                  placeholder="Describe the mood or story behind this track"
                  onChange={(event) => {
                    setCurrentDescription(event.target.value);
                    clearTrackError("description");
                  }}
                />
                <div className="upload-track-character-count">
                  <span>{trackFormErrors.description || ""}</span>
                  <small>{currentDescription.length}/2000</small>
                </div>
              </div>

              {/* Section 02: Media Files */}
              <div className="upload-track-card-heading upload-track-card-heading--section">
                <div><span>02</span><h2>Media files</h2></div>
              </div>

              <div className="studio-media-grid">
                <MediaUploadField
                  id="audio-upload"
                  label="Audio file"
                  helperText="MP3, WAV or FLAC · Max 30MB"
                  accept=".mp3,.wav,.flac,audio/mpeg,audio/wav,audio/flac"
                  file={currentAudioFile}
                  error={trackFormErrors.audio}
                  required
                  disabled={submitting}
                  onFileChange={(file) => void handleCurrentAudioChange(file)}
                />

                <MediaUploadField
                  id="cover-upload"
                  label="Cover artwork"
                  helperText="Inherited from album artwork"
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                  file={null}
                  existingFileLabel={coverFile ? `Album cover: ${coverFile.name}` : coverPreview ? "Album cover attached" : "Default album artwork"}
                  disabled
                  onFileChange={() => {}}
                />
              </div>

              {/* Lyrics Section with LyricSyncTab */}
              <div className="upload-track-lyrics-section" style={{ marginTop: "24px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "10px",
                    flexWrap: "wrap",
                    gap: "8px",
                  }}
                >
                  <label style={{ fontSize: "13px", fontWeight: 700, color: "#1C1917" }}>
                    Lyrics <span style={{ fontWeight: 400, color: "#786F65", fontSize: "12px" }}>(optional)</span>
                  </label>
                  {currentLyrics && (
                    <span
                      style={{
                        fontSize: "12px",
                        color: "var(--brand, #0284c7)",
                        fontWeight: 700,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        background: "#E0F2FE",
                        padding: "3px 10px",
                        borderRadius: "20px",
                      }}
                    >
                      <CheckIcon width={14} height={14} />
                      Lyrics loaded ({currentLyrics.split("\n").filter((l) => l.trim().length > 0).length} lines)
                    </span>
                  )}
                </div>

                <div className="upload-track-lyrics-field">
                  <MediaUploadField
                    id="lyrics-upload"
                    label="Lyrics file"
                    helperText="LRC or TXT · Max 1MB · Optional"
                    accept=".lrc,.txt,text/plain"
                    file={currentLyricsFile}
                    existingFileLabel={currentLyrics ? "Lyrics attached" : undefined}
                    error={trackFormErrors.lyrics}
                    disabled={submitting}
                    onFileChange={(file) => void handleCurrentLyricsChange(file)}
                    extraActions={
                      <button
                        type="button"
                        className={`button button-small ${showLyricMaker ? "button-primary" : "button-secondary"}`}
                        disabled={submitting || !currentAudioFile}
                        title={!currentAudioFile ? "Upload audio first to synchronize lyrics" : undefined}
                        onClick={() => setShowLyricMaker((prev) => !prev)}
                        style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}
                      >
                        <EditIcon width={14} height={14} />
                        <span>{showLyricMaker ? "Close LRC Maker" : currentLyrics ? "Edit lyrics" : "Create lyrics"}</span>
                      </button>
                    }
                  />
                </div>

                {showLyricMaker && (
                  <div style={{ marginTop: "14px" }}>
                    <LyricSyncTab
                      audioFile={currentAudioFile}
                      initialLyrics={currentLyrics}
                      trackTitle={currentTitle}
                      onApplyLyrics={(lrcString, virtualFile) => {
                        setCurrentLyrics(lrcString);
                        setCurrentLyricsFile(virtualFile);
                        clearTrackError("lyrics");
                        setShowLyricMaker(false);
                        setPageToast({ type: "success", message: "Lyrics applied to track successfully!" });
                      }}
                      onClearLyrics={() => {
                        setCurrentLyrics("");
                        setCurrentLyricsFile(null);
                        setPageToast({ type: "success", message: "Lyrics cleared." });
                      }}
                      onSwitchToUpload={() => setShowLyricMaker(false)}
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons: Add Next Track */}
              <div className="upload-track-actions">
                {editingTrackIndex !== null ? (
                  <>
                    <button
                      className="button button-secondary"
                      type="button"
                      disabled={submitting}
                      onClick={resetTrackForm}
                    >
                      Cancel edit
                    </button>
                    <button
                      className="button button-primary"
                      type="button"
                      disabled={submitting}
                      onClick={handleSaveAndNextTrack}
                      id="btn-save-track-changes"
                    >
                      <CheckIcon width={16} height={16} /> Save track changes
                    </button>
                  </>
                ) : (
                  <button
                    className="button button-primary"
                    type="button"
                    disabled={submitting}
                    onClick={handleSaveAndNextTrack}
                    id="btn-add-next-track"
                    style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
                  >
                    <PlusIcon width={16} height={16} />
                    <span>Add Next Track</span>
                  </button>
                )}
              </div>
            </form>

            {/* Right Column: Album Tracklist Sidebar + Upload Checklist */}
            <aside className="upload-track-sidebar" aria-label="Album tracklist and guidance">
              <section>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                  <span className="eyebrow">ALBUM TRACKLIST</span>
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: "12px",
                      backgroundColor: "#e0f2fe",
                      color: "var(--sw-primary-dark, #0284c7)",
                      fontWeight: 700,
                      fontSize: "12px",
                    }}
                  >
                    {tracks.length} track{tracks.length === 1 ? "" : "s"} • {formatDuration(totalDurationMs)}
                  </span>
                </div>

                {tracks.length === 0 ? (
                  <div
                    style={{
                      border: "1px dashed var(--color-sand-primary, #D4B996)",
                      borderRadius: "12px",
                      padding: "28px 16px",
                      textAlign: "center",
                      color: "var(--sw-text-secondary)",
                    }}
                  >
                    <HeadphonesIcon width={28} height={28} style={{ color: "var(--color-ocean-primary, #0284C7)", margin: "0 auto 10px" }} />
                    <h4 style={{ margin: "0 0 6px", fontSize: "14px", fontWeight: 700, color: "var(--color-ocean-dark, #0F172A)" }}>
                      No tracks in album yet
                    </h4>
                    <p style={{ margin: 0, fontSize: "12px", color: "var(--sw-text-muted)" }}>
                      Fill in the track details on the left and click <b>"Add Next Track"</b> to add songs.
                    </p>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "380px", overflowY: "auto", marginBottom: "12px" }}>
                      {tracks.map((track, idx) => {
                        const trackGenre = genres.find((g) => g.id === track.genreId);
                        const isBeingEdited = editingTrackIndex === idx;

                        return (
                          <div
                            key={track.id}
                            style={{
                              border: isBeingEdited
                                ? "2px solid var(--color-ocean-primary, #0284C7)"
                                : "1px solid var(--sw-border)",
                              backgroundColor: isBeingEdited ? "#f0f9ff" : "var(--sw-surface, #ffffff)",
                              borderRadius: "10px",
                              padding: "10px 12px",
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                            }}
                          >
                            <div
                              style={{
                                width: "24px",
                                height: "24px",
                                borderRadius: "50%",
                                backgroundColor: "#e0f2fe",
                                color: "var(--sw-primary-dark, #0284c7)",
                                fontWeight: 700,
                                fontSize: "11px",
                                display: "grid",
                                placeItems: "center",
                                flexShrink: 0,
                              }}
                            >
                              {idx + 1}
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--sw-text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {track.title}
                              </div>
                              <div style={{ fontSize: "11px", color: "var(--sw-text-secondary)" }}>
                                {trackGenre?.name || "Music"} · {track.durationMs > 0 ? formatDuration(track.durationMs) : "Audio"}
                              </div>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "2px", flexShrink: 0 }}>
                              <button
                                type="button"
                                className="icon-button"
                                onClick={() => handleEditTrack(idx)}
                                title="Edit track"
                                style={{ padding: "4px" }}
                              >
                                <EditIcon width={13} height={13} />
                              </button>
                              <button
                                type="button"
                                className="icon-button"
                                onClick={() => handleMoveTrack(idx, "up")}
                                disabled={idx === 0}
                                title="Move up"
                                style={{ padding: "4px" }}
                              >
                                <ArrowUpIcon width={13} height={13} />
                              </button>
                              <button
                                type="button"
                                className="icon-button"
                                onClick={() => handleMoveTrack(idx, "down")}
                                disabled={idx === tracks.length - 1}
                                title="Move down"
                                style={{ padding: "4px" }}
                              >
                                <ArrowDownIcon width={13} height={13} />
                              </button>
                              <button
                                type="button"
                                className="icon-button"
                                onClick={() => handleRemoveTrack(idx)}
                                title="Remove track"
                                style={{ padding: "4px", color: "#dc2626" }}
                              >
                                <TrashIcon width={13} height={13} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {editingTrackIndex === null && (
                      <div style={{ paddingTop: "10px", borderTop: "1px solid var(--sw-border)" }}>
                        <button
                          type="button"
                          className="button button-secondary button-small"
                          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                          onClick={() => {
                            resetTrackForm();
                            requestAnimationFrame(() => document.getElementById("upload-track-title")?.focus());
                          }}
                        >
                          <PlusIcon width={14} height={14} />
                          <span>Add Next Track</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </section>

              {/* Upload Checklist */}
              <section>
                <span className="eyebrow">BEFORE YOU UPLOAD</span>
                <h2>Quick checklist</h2>
                <ul>
                  <li><CheckIcon width={16} height={16} /><span>You own the audio or have permission to publish it.</span></li>
                  <li><CheckIcon width={16} height={16} /><span>Each track audio is MP3, WAV or FLAC and under 30MB.</span></li>
                  <li><CheckIcon width={16} height={16} /><span>The album title and individual track genres are accurate.</span></li>
                </ul>
              </section>

              {/* Sidebar Note */}
              <section className="upload-track-sidebar__note">
                <FileTextIcon width={20} height={20} />
                <div>
                  <b>Save as Draft or Submit for Review</b>
                  <p>You can keep the album and all tracks as private drafts, or submit directly to staff for moderation review.</p>
                </div>
              </section>
            </aside>
          </div>

          {/* Bottom Action Footer for Step 2 */}
          <div
            style={{
              marginTop: "32px",
              background: "#ffffff",
              border: "1px solid var(--sw-border, #E2E8F0)",
              borderRadius: "16px",
              padding: "20px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <button
              type="button"
              className="button button-ghost"
              onClick={() => setStep(1)}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <ChevronLeftIcon width={16} height={16} />
              <span>Back to Album Info</span>
            </button>

            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <button
                type="button"
                className="button button-secondary"
                onClick={() => void processSubmitAlbum(false)}
                disabled={submitting || (tracks.length === 0 && !currentAudioFile)}
                id="btn-save-draft-album"
                title="Save album and constituent tracks as draft"
              >
                Save as Draft
              </button>

              <button
                type="button"
                className="button button-primary"
                onClick={() => handleStartSubmitReview()}
                disabled={submitting || (tracks.length === 0 && !currentAudioFile)}
                id="btn-submit-review-album"
                title="Submit album and all constituent tracks for staff moderation"
                style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
              >
                <UploadIcon width={16} height={16} />
                <span>{submitting ? "Submitting..." : "Submit Album for Review"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Review Submission */}
      {confirmModalOpen && createPortal(
        <div className="modal-backdrop" role="presentation" onClick={() => !submitting && setConfirmModalOpen(false)}>
          <div className="modal-card" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Submit Album for Staff review</h3>
              <button type="button" className="icon-button" onClick={() => setConfirmModalOpen(false)} disabled={submitting} aria-label="Close dialog">
                <CloseIcon width={18} height={18} />
              </button>
            </div>
            <p style={{ margin: "12px 0 8px", color: "var(--sw-text-secondary)" }}>
              You are submitting <b>“{title}”</b> with {tracks.length + (editingTrackIndex === null && currentAudioFile && currentTitle.trim() ? 1 : 0)} track(s) to the moderation queue. Once submitted, editing is locked until staff completes review.
            </p>
            <div className="form-group" style={{ marginTop: "12px" }}>
              <label htmlFor="upload-submitter-note">Note for reviewer (optional)</label>
              <textarea
                id="upload-submitter-note"
                rows={3}
                placeholder="Mention master source, licenses, or specific credits..."
                value={submitterNote}
                onChange={(e) => setSubmitterNote(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid var(--sw-border)" }}
              />
            </div>
            <div style={{ marginTop: "14px", padding: "12px", background: "var(--sw-surface-alt, #f8fafc)", borderRadius: "8px", border: "1px solid var(--sw-border)" }}>
              <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer", fontSize: "13px", color: "var(--sw-text-primary)" }}>
                <input
                  type="checkbox"
                  id="chk-copyright-agree"
                  checked={copyrightAgreed}
                  onChange={(e) => setCopyrightAgreed(e.target.checked)}
                  style={{ marginTop: "3px" }}
                />
                <span>
                  I confirm that I own all rights to this album, audio tracks, and artwork, or hold legal authorization to publish them, and agree to SoundWave Community Guidelines.
                </span>
              </label>
            </div>
            <div className="modal-actions" style={{ marginTop: "18px" }}>
              <button className="button button-secondary" onClick={() => setConfirmModalOpen(false)} disabled={submitting}>
                Cancel
              </button>
              <button
                className="button button-primary"
                disabled={!copyrightAgreed || submitting}
                onClick={() => void handleConfirmSubmitReview()}
                id="btn-confirm-agree-submit"
              >
                {submitting ? "Submitting..." : "Agree & Submit Album"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Center Toast Notification Popup */}
      {pageToast && (
        <CenterNotificationPopup
          open={Boolean(pageToast)}
          type={pageToast.type}
          message={pageToast.message}
          onClose={() => setPageToast(null)}
        />
      )}
    </div>
  );
}
