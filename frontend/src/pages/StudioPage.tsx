import { useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { useModalScrollLock } from "../hooks/useModalScrollLock";
import {
  studioApi,
  TrackApiError,
  type ApiTrack,
  type GenreOption,
  type AlbumOption,
  type RejectionDetails,
} from "../api/track";
import { MediaUploadField } from "../components/MediaUploadField";
import {
  AlertIcon,
  CheckIcon,
  ClockIcon,
  CloseIcon,
  EditIcon,
  EyeIcon,
  FileTextIcon,
  PauseIcon,
  PlayIcon,
  SearchIcon,
  TrashIcon,
  UploadIcon,
} from "../icons";
import type { StudioTrack } from "../types";
import {
  readAudioDuration,
  readLyricsFile,
  validateAudioFile,
  validateCoverFile,
  validateLyricsFile,
} from "../utils/trackUpload";

function formatDuration(ms?: number): string {
  if (!ms || ms <= 0) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

type Props = {
  tracks: StudioTrack[];
  onNavigate: (route: string) => void;
};

export function StudioPage({ tracks: fallbackTracks, onNavigate }: Props) {
  const [filterStatus, setFilterStatus] = useState<
    "ALL" | "DRAFT" | "PENDING" | "APPROVED" | "REJECTED"
  >("ALL");

  // Server state
  const [trackList, setTrackList] = useState<StudioTrack[]>(fallbackTracks);
  const [stats, setStats] = useState({
    total: fallbackTracks.length,
    draft: fallbackTracks.filter((t) => t.status === "DRAFT").length,
    pending: fallbackTracks.filter((t) => t.status === "PENDING").length,
    approved: fallbackTracks.filter((t) => t.status === "APPROVED").length,
    rejected: fallbackTracks.filter((t) => t.status === "REJECTED").length,
  });
  const [genres, setGenres] = useState<GenreOption[]>([]);
  const [albums, setAlbums] = useState<AlbumOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Modals state
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [editingTrackId, setEditingTrackId] = useState<number | null>(null);

  const [deleteConfirmTrack, setDeleteConfirmTrack] = useState<StudioTrack | null>(null);
  const [rejectionModalTrack, setRejectionModalTrack] = useState<RejectionDetails | null>(null);
  const [submittingNoteTrack, setSubmittingNoteTrack] = useState<StudioTrack | null>(null);
  const [submitterNote, setSubmitterNote] = useState("");
  const [submitCopyrightAgreed, setSubmitCopyrightAgreed] = useState(false);
  const [withdrawConfirmTrack, setWithdrawConfirmTrack] = useState<StudioTrack | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [previewAudioUrl, setPreviewAudioUrl] = useState<string | null>(null);
  const [previewAudioPlaying, setPreviewAudioPlaying] = useState(false);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // View Detail state (Manage My Tracks - View Detail Sequence)
  const [detailTrack, setDetailTrack] = useState<StudioTrack | null>(null);
  const [loadingDetailId, setLoadingDetailId] = useState<number | null>(null);
  const [detailAudioPlaying, setDetailAudioPlaying] = useState(false);
  const [detailAudioCurrentTime, setDetailAudioCurrentTime] = useState(0);
  const [detailAudioDuration, setDetailAudioDuration] = useState(0);
  const detailAudioRef = useRef<HTMLAudioElement | null>(null);

  // Form inputs
  const [title, setTitle] = useState("");
  const [selectedGenreId, setSelectedGenreId] = useState<number>(0);
  const [selectedAlbumId, setSelectedAlbumId] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [audioFileName, setAudioFileName] = useState("");
  const [coverFileName, setCoverFileName] = useState("");
  const [audioDurationMs, setAudioDurationMs] = useState<number | undefined>();
  const [lyricsContent, setLyricsContent] = useState("");
  const [lyricsFileName, setLyricsFileName] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Load data from Backend API
  const loadStudioData = async () => {
    try {
      setLoading(true);
      const [fetchedTracks, fetchedStats, fetchedGenres, fetchedAlbums] =
        await Promise.all([
          studioApi.getMyTracks(filterStatus),
          studioApi.getStats(),
          studioApi.getGenres(),
          studioApi.getMyAlbums(),
        ]);

      const mapped: StudioTrack[] = fetchedTracks.map((t: ApiTrack) => ({
          id: t.id,
          title: t.title,
          slug: t.slug,
          description: t.description,
          coverUrl: t.coverUrl ?? "/pics/album.png",
          audioUrl: t.audioUrl,
          durationMs: t.durationMs,
          genreId: t.genreId,
          genreSlug: t.genreSlug,
          genreName: t.genreName,
          albumId: t.albumId,
          albumTitle: t.albumTitle,
          trackNumber: t.trackNumber,
          status: t.status === "PUBLISHED" || t.status === "APPROVED"
            ? "APPROVED"
            : t.status === "TAKEN_DOWN"
            ? "REJECTED"
            : t.status,
          latestRejectionReason: t.latestRejectionReason,
          reviewerNote: t.reviewerNote,
          createdAt: new Date(t.createdAt).toLocaleDateString(),
          lyrics: t.lyrics,
        }));
      setTrackList(mapped);
      setStats(fetchedStats);

      if (fetchedGenres.length > 0) {
        setGenres(fetchedGenres);
        if (!selectedGenreId) {
          setSelectedGenreId(fetchedGenres[0].id);
        }
      }

      setAlbums(fetchedAlbums);
      setActionError(null);
    } catch (error: unknown) {
      setActionError(error instanceof Error
        ? error.message
        : "Content Studio could not be loaded. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStudioData();
  }, [filterStatus]);

  // Rule 4.7: Modal background scroll lock
  useModalScrollLock(
    Boolean(
      trackModalOpen ||
      deleteConfirmTrack ||
      rejectionModalTrack ||
      submittingNoteTrack ||
      withdrawConfirmTrack ||
      detailTrack
    )
  );

  useEffect(() => {
    if (!trackModalOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSaving) setTrackModalOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [trackModalOpen, isSaving]);

  useEffect(() => {
    if (!detailTrack) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDetailModal();
    };
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [detailTrack]);

  // View Detail (Manage My Tracks - View Detail Sequence Diagram)
  const handleOpenDetail = async (track: StudioTrack) => {
    try {
      setLoadingDetailId(track.id);
      setActionError(null);
      const data = await studioApi.getTrackById(track.id);
      const mapped: StudioTrack = {
        id: data.id,
        title: data.title,
        slug: data.slug,
        description: data.description,
        coverUrl: data.coverUrl ?? "/pics/album.png",
        audioUrl: data.audioUrl,
        audioFormat: data.audioFormat,
        durationMs: data.durationMs,
        genreId: data.genreId,
        genreSlug: data.genreSlug,
        genreName: data.genreName,
        albumId: data.albumId,
        albumTitle: data.albumTitle,
        trackNumber: data.trackNumber,
        status: data.status === "PUBLISHED" || data.status === "APPROVED"
          ? "APPROVED"
          : data.status === "TAKEN_DOWN"
          ? "REJECTED"
          : data.status,
        playCount: data.playCount,
        latestRejectionReason: data.latestRejectionReason,
        reviewerNote: data.reviewerNote,
        submitterNote: data.submitterNote,
        submittedAt: data.submittedAt,
        reviewedAt: data.reviewedAt,
        createdAt: new Date(data.createdAt).toLocaleDateString(),
        updatedAt: data.updatedAt ? new Date(data.updatedAt).toLocaleDateString() : undefined,
        lyrics: data.lyrics,
      };
      setDetailTrack(mapped);
      setDetailAudioPlaying(false);
      setDetailAudioCurrentTime(0);
    } catch {
      // Fallback local if offline/mock
      setDetailTrack(track);
      setDetailAudioPlaying(false);
      setDetailAudioCurrentTime(0);
    } finally {
      setLoadingDetailId(null);
    }
  };

  const closeDetailModal = () => {
    if (detailAudioRef.current) {
      detailAudioRef.current.pause();
    }
    setDetailAudioPlaying(false);
    setDetailTrack(null);
  };

  const handleToggleDetailAudio = () => {
    if (!detailAudioRef.current) return;
    if (detailAudioPlaying) {
      detailAudioRef.current.pause();
      setDetailAudioPlaying(false);
    } else {
      detailAudioRef.current.play()
        .then(() => setDetailAudioPlaying(true))
        .catch(() => setDetailAudioPlaying(false));
    }
  };

  // Open Edit Modal (UC-19.3)
  const openEditModal = (track: StudioTrack) => {
    setActionError(null);
    setEditingTrackId(track.id);
    setTitle(track.title);
    setDescription(track.description ?? "");
    setSelectedAlbumId(track.albumId ?? "");
    setAudioFile(null);
    setCoverFile(null);
    setAudioDurationMs(undefined);
    if (track.genreId) {
      setSelectedGenreId(track.genreId);
    } else if (genres.length > 0) {
      const match = genres.find((g) => g.slug === track.genreSlug);
      setSelectedGenreId(match ? match.id : genres[0].id);
    }
    setAudioFileName(track.audioUrl ? "Existing audio file attached" : "");
    setCoverFileName(track.coverUrl ? "Existing cover artwork attached" : "");
    setLyricsContent(track.lyrics ?? "");
    setLyricsFileName(track.lyrics ? "Existing lyrics attached" : "");
    setFormErrors({});
    setTrackModalOpen(true);
  };

  const handleAudioFileChange = async (file: File | null) => {
    if (!file) {
      setAudioFile(null);
      setAudioDurationMs(undefined);
      setFormErrors((previous) => ({ ...previous, audio: "" }));
      return;
    }

    const validationError = validateAudioFile(file);
    if (validationError) {
      setAudioFile(null);
      setAudioDurationMs(undefined);
      setFormErrors((previous) => ({ ...previous, audio: validationError }));
      return;
    }

    setAudioFile(file);
    setFormErrors((previous) => ({ ...previous, audio: "" }));
    setAudioDurationMs(await readAudioDuration(file));
  };

  const handleCoverFileChange = (file: File | null) => {
    if (!file) {
      setCoverFile(null);
      setFormErrors((previous) => ({ ...previous, cover: "" }));
      return;
    }

    const validationError = validateCoverFile(file);
    if (validationError) {
      setCoverFile(null);
      setFormErrors((previous) => ({ ...previous, cover: validationError }));
      return;
    }

    setCoverFile(file);
    setFormErrors((previous) => ({ ...previous, cover: "" }));
  };

  // Cập nhật thông tin và media của bản nháp hiện có (UC-19.3).
  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!title.trim()) {
      errors.title = "Please enter the track title.";
    } else if (title.trim().length > 200) {
      errors.title = "Track title cannot exceed 200 characters.";
    }

    if (!selectedGenreId) {
      errors.genre = "Please select a music genre.";
    }

    if (audioFile) {
      const audioError = validateAudioFile(audioFile);
      if (audioError) errors.audio = audioError;
    }

    if (coverFile) {
      const coverError = validateCoverFile(coverFile);
      if (coverError) errors.cover = coverError;
    }

    if (description.trim().length > 2000) {
      errors.description = "Description cannot exceed 2000 characters.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      const firstError = Object.keys(errors)[0];
      const targetId = firstError === "audio" || firstError === "cover"
        ? `${firstError}-file-input-button`
        : firstError === "description"
        ? "track-desc"
        : `track-${firstError}`;
      requestAnimationFrame(() => document.getElementById(targetId)?.focus());
      return;
    }

    setIsSaving(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      if (editingTrackId) {
        await studioApi.updateTrack(editingTrackId, {
          title: title.trim(),
          genreId: selectedGenreId,
          albumId: selectedAlbumId ? Number(selectedAlbumId) : undefined,
          description: description.trim() || undefined,
          durationMs: audioDurationMs,
          lyrics: lyricsContent.trim() || undefined,
        }, audioFile ?? undefined, coverFile ?? undefined);
        setActionSuccess("Track changes saved successfully.");
      }

      setTrackModalOpen(false);
      await loadStudioData();
    } catch (err: unknown) {
      if (err instanceof TrackApiError && Object.keys(err.fieldErrors).length > 0) {
        const normalizedErrors = { ...err.fieldErrors };
        if (normalizedErrors.media && !normalizedErrors.audio) normalizedErrors.audio = normalizedErrors.media;
        setFormErrors((previous) => ({ ...previous, ...normalizedErrors }));
      }
      setActionError(err instanceof Error ? err.message : "Failed to save track.");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Track (UC-19.4)
  const handleDeleteTrack = async () => {
    if (!deleteConfirmTrack) return;
    const targetId = deleteConfirmTrack.id;
    try {
      setIsSaving(true);
      await studioApi.deleteTrack(targetId);
      setDeleteConfirmTrack(null);
      setTrackList((prev) => prev.filter((t) => t.id !== targetId));
      setActionSuccess("Đã xóa bài hát thành công.");
      await loadStudioData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete track.";
      setActionError(msg);
      alert(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // Submit For Review (UC-19.4)
  const handleSubmitReview = async () => {
    if (!submittingNoteTrack) return;
    try {
      setIsSaving(true);
      await studioApi.submitForReview(submittingNoteTrack.id, submitterNote.trim() || undefined);
      const title = submittingNoteTrack.title;
      setSubmittingNoteTrack(null);
      setSubmitterNote("");
      setSubmitCopyrightAgreed(false);
      setActionSuccess(`Track "${title}" submitted for moderation review successfully.`);
      await loadStudioData();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Failed to submit track.");
    } finally {
      setIsSaving(false);
    }
  };

  // Withdraw Submission from Review (UC-19.4 Extension)
  const handleWithdrawSubmission = async () => {
    if (!withdrawConfirmTrack) return;
    try {
      setIsSaving(true);
      await studioApi.withdrawSubmission(withdrawConfirmTrack.id);
      const title = withdrawConfirmTrack.title;
      setWithdrawConfirmTrack(null);
      setActionSuccess(`Track "${title}" has been withdrawn from review and returned to Draft.`);
      await loadStudioData();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Failed to withdraw track submission.");
    } finally {
      setIsSaving(false);
    }
  };

  // Audio Preview Player
  const handleToggleAudioPreview = (audioUrl?: string) => {
    if (!audioUrl) return;
    if (!previewAudioRef.current) return;
    if (previewAudioUrl === audioUrl && previewAudioPlaying) {
      previewAudioRef.current.pause();
      setPreviewAudioPlaying(false);
    } else {
      previewAudioRef.current.src = audioUrl;
      previewAudioRef.current.play().then(() => {
        setPreviewAudioUrl(audioUrl);
        setPreviewAudioPlaying(true);
      }).catch(() => {
        setPreviewAudioPlaying(false);
      });
    }
  };

  // View Rejection Reason (UC-20)
  const handleViewRejection = async (track: StudioTrack) => {
    try {
      const details = await studioApi.getRejectionDetails(track.id).catch(() => null);
      if (details) {
        setRejectionModalTrack(details);
      } else {
        setRejectionModalTrack({
          trackId: track.id,
          trackTitle: track.title,
          status: "REJECTED",
          rejectionReason:
            track.latestRejectionReason ||
            "The audio file or metadata does not satisfy SoundWave community standards.",
          reviewerNote: track.reviewerNote,
          reviewedAt: track.createdAt,
        });
      }
    } catch {
      setRejectionModalTrack({
        trackId: track.id,
        trackTitle: track.title,
        status: "REJECTED",
        rejectionReason:
          track.latestRejectionReason || "Audio content violates policy.",
        reviewedAt: track.createdAt,
      });
    }
  };

  const filtered = trackList.filter((t) => {
    const matchesStatus = filterStatus === "ALL" || t.status === filterStatus;
    if (!matchesStatus) return false;
    if (!searchQuery.trim()) return true;
    const query = searchQuery.trim().toLowerCase();
    return (
      t.title.toLowerCase().includes(query) ||
      (t.genreName && t.genreName.toLowerCase().includes(query)) ||
      (t.albumTitle && t.albumTitle.toLowerCase().includes(query)) ||
      (t.description && t.description.toLowerCase().includes(query))
    );
  });

  return (
    <div className="studio-page">
      <div className="studio-header">
        <div>
          <span className="eyebrow">CONTENT STUDIO</span>
          <h1 className="page-heading">Content Studio</h1>
          <p className="page-subtext">
            Upload tracks, save drafts, manage submissions, and review staff feedback.
          </p>
        </div>
        <button
          className="button button-primary"
          onClick={() => onNavigate("/studio/upload")}
          id="btn-open-create-track"
        >
          <UploadIcon width={18} height={18} />
          <span>Upload track</span>
        </button>
      </div>

      {actionError && (
        <div className="auth-v2-error" role="alert" style={{ marginBottom: "20px" }}>
          <span><AlertIcon width={18} height={18} /></span>
          <div>
            <b>Operation failed</b>
            <small>{actionError}</small>
          </div>
          <button
            className="icon-button"
            onClick={() => setActionError(null)}
            style={{ marginLeft: "auto" }}
            aria-label="Dismiss error"
          >
            <CloseIcon width={16} height={16} />
          </button>
        </div>
      )}

      {actionSuccess && (
        <div className="studio-success-alert" role="status">
          <span><CheckIcon width={18} height={18} /></span>
          <div>
            <b>Saved successfully</b>
            <small>{actionSuccess}</small>
          </div>
          <button
            className="icon-button"
            onClick={() => setActionSuccess(null)}
            aria-label="Dismiss success message"
          >
            <CloseIcon width={16} height={16} />
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="studio-metrics-grid">
        <div
          className={`metric-card ${filterStatus === "ALL" ? "metric-card--active" : ""}`}
          onClick={() => setFilterStatus("ALL")}
          role="button"
          tabIndex={0}
        >
          <span className="metric-label">Total tracks</span>
          <b className="metric-value">{stats.total}</b>
        </div>
        <div
          className={`metric-card ${filterStatus === "APPROVED" ? "metric-card--active" : ""}`}
          onClick={() => setFilterStatus("APPROVED")}
          role="button"
          tabIndex={0}
        >
          <span className="metric-label metric-label--approved">Published</span>
          <b className="metric-value text-success">{stats.approved}</b>
        </div>
        <div
          className={`metric-card ${filterStatus === "PENDING" ? "metric-card--active" : ""}`}
          onClick={() => setFilterStatus("PENDING")}
          role="button"
          tabIndex={0}
        >
          <span className="metric-label metric-label--pending">Pending</span>
          <b className="metric-value text-warning">{stats.pending}</b>
        </div>
        <div
          className={`metric-card ${filterStatus === "REJECTED" ? "metric-card--active" : ""}`}
          onClick={() => setFilterStatus("REJECTED")}
          role="button"
          tabIndex={0}
        >
          <span className="metric-label metric-label--rejected">Rejected</span>
          <b className="metric-value text-danger">{stats.rejected}</b>
        </div>
        <div
          className={`metric-card ${filterStatus === "DRAFT" ? "metric-card--active" : ""}`}
          onClick={() => setFilterStatus("DRAFT")}
          role="button"
          tabIndex={0}
        >
          <span className="metric-label">Draft</span>
          <b className="metric-value">{stats.draft}</b>
        </div>
      </div>

      {/* Status Filter Bar and Search */}
      <div className="studio-tabs-bar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            className={`filter-pill ${filterStatus === "ALL" ? "filter-pill--active" : ""}`}
            onClick={() => setFilterStatus("ALL")}
          >
            All ({stats.total})
          </button>
          <button
            className={`filter-pill ${filterStatus === "APPROVED" ? "filter-pill--active" : ""}`}
            onClick={() => setFilterStatus("APPROVED")}
          >
            Published ({stats.approved})
          </button>
          <button
            className={`filter-pill ${filterStatus === "PENDING" ? "filter-pill--active" : ""}`}
            onClick={() => setFilterStatus("PENDING")}
          >
            Pending ({stats.pending})
          </button>
          <button
            className={`filter-pill ${filterStatus === "REJECTED" ? "filter-pill--active" : ""}`}
            onClick={() => setFilterStatus("REJECTED")}
          >
            Rejected ({stats.rejected})
          </button>
          <button
            className={`filter-pill ${filterStatus === "DRAFT" ? "filter-pill--active" : ""}`}
            onClick={() => setFilterStatus("DRAFT")}
          >
            Draft ({stats.draft})
          </button>
        </div>

        <div style={{ position: "relative", minWidth: "220px" }}>
          <input
            type="text"
            placeholder="Search tracks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "7px 12px 7px 32px",
              borderRadius: "20px",
              border: "1px solid var(--sw-border)",
              background: "var(--sw-surface)",
              color: "var(--sw-text-primary)",
              fontSize: "13px",
              boxSizing: "border-box",
            }}
          />
          <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--sw-text-muted)", pointerEvents: "none", display: "flex" }}>
            <SearchIcon width={14} height={14} />
          </span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--sw-text-muted)", padding: "2px", display: "flex" }}
              aria-label="Clear search"
            >
              <CloseIcon width={12} height={12} />
            </button>
          )}
        </div>
      </div>

      <audio
        ref={previewAudioRef}
        style={{ display: "none" }}
        onEnded={() => setPreviewAudioPlaying(false)}
        onError={() => setPreviewAudioPlaying(false)}
      />

      {/* Tracks Table */}
      <div className="studio-table-container">
        {loading ? (
          <div style={{ padding: "32px", textAlign: "center", color: "var(--sw-text-muted)" }}>
            Loading tracks...
          </div>
        ) : (
          <table className="studio-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Genre</th>
                <th>Album</th>
                <th>Status</th>
                <th>Created date</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="table-empty-cell">
                    {searchQuery
                      ? `No tracks match "${searchQuery}".`
                      : "No tracks in this category. Click \"Upload track\" to create one."}
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <div className="table-track-cell">
                        <div style={{ position: "relative", width: "42px", height: "42px", flexShrink: 0 }}>
                          <img
                            src={t.coverUrl ?? "/pics/album.png"}
                            alt={t.title}
                            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "6px", display: "block" }}
                          />
                          {t.audioUrl && (
                            <button
                              type="button"
                              onClick={() => handleToggleAudioPreview(t.audioUrl)}
                              style={{
                                position: "absolute",
                                inset: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: previewAudioUrl === t.audioUrl && previewAudioPlaying ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.35)",
                                border: "none",
                                borderRadius: "6px",
                                color: "#fff",
                                cursor: "pointer",
                                opacity: previewAudioUrl === t.audioUrl && previewAudioPlaying ? 1 : 0.8,
                                transition: "opacity 0.2s",
                              }}
                              title={previewAudioUrl === t.audioUrl && previewAudioPlaying ? "Pause audio preview" : "Play audio preview"}
                              aria-label={previewAudioUrl === t.audioUrl && previewAudioPlaying ? `Pause ${t.title}` : `Play ${t.title}`}
                            >
                              {previewAudioUrl === t.audioUrl && previewAudioPlaying ? (
                                <PauseIcon width={16} height={16} />
                              ) : (
                                <PlayIcon width={16} height={16} />
                              )}
                            </button>
                          )}
                        </div>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <button
                              type="button"
                              onClick={() => void handleOpenDetail(t)}
                              style={{
                                background: "none",
                                border: "none",
                                padding: 0,
                                font: "inherit",
                                fontWeight: "bold",
                                color: "var(--sw-text, #1e293b)",
                                cursor: "pointer",
                                textAlign: "left",
                              }}
                              title="Click to view details"
                            >
                              {t.title}
                            </button>
                            {t.lyrics && (
                              <span
                                title="Official lyrics attached"
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "3px",
                                  padding: "2px 6px",
                                  fontSize: "10px",
                                  fontWeight: 600,
                                  background: "#ecfeff",
                                  color: "#0891b2",
                                  borderRadius: "4px",
                                  border: "1px solid #cffafe",
                                }}
                              >
                                <FileTextIcon width={10} height={10} /> Lyrics
                              </span>
                            )}
                          </div>
                          {t.description && (
                            <small
                              style={{
                                display: "block",
                                color: "var(--sw-text-muted)",
                                maxWidth: "260px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {t.description}
                            </small>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="genre-badge">{t.genreName}</span>
                    </td>
                    <td>
                      <span className="text-secondary small">
                        {t.albumTitle ? `${t.albumTitle}${t.trackNumber ? ` (#${t.trackNumber})` : ""}` : "—"}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-badge--${t.status.toLowerCase()}`}>
                        {t.status === "APPROVED" && "Published"}
                        {t.status === "PENDING" && "Pending Review"}
                        {t.status === "REJECTED" && "Rejected"}
                        {t.status === "DRAFT" && "Draft"}
                      </span>
                    </td>
                    <td>{t.createdAt}</td>
                    <td style={{ textAlign: "right" }}>
                      <div className="table-action-btns" style={{ justifyContent: "flex-end" }}>
                        <button
                          type="button"
                          className="button button-ghost button-small"
                          onClick={() => void handleOpenDetail(t)}
                          disabled={loadingDetailId === t.id}
                          title="View track details & moderation status"
                        >
                          <EyeIcon width={14} height={14} />
                          <span>Details</span>
                        </button>

                        {t.status === "DRAFT" && (
                          <>
                            <button
                              className="button button-ghost button-small"
                              onClick={() => openEditModal(t)}
                              title="Edit draft metadata"
                            >
                              Edit
                            </button>
                            <button
                              className="button button-primary button-small"
                              onClick={() => {
                                setSubmittingNoteTrack(t);
                                setSubmitterNote("");
                                setSubmitCopyrightAgreed(false);
                              }}
                            >
                              Submit for review
                            </button>
                            <button
                              className="button button-ghost button-small text-danger"
                              onClick={() => setDeleteConfirmTrack(t)}
                              title="Delete draft"
                              aria-label="Delete draft"
                            >
                              <TrashIcon width={15} height={15} />
                            </button>
                          </>
                        )}

                        {t.status === "REJECTED" && (
                          <>
                            <button
                              className="button button-secondary button-small"
                              onClick={() => handleViewRejection(t)}
                            >
                              Feedback
                            </button>
                            <button
                              className="button button-ghost button-small"
                              onClick={() => openEditModal(t)}
                              title="Edit rejected track before resubmitting"
                            >
                              Edit
                            </button>
                            <button
                              className="button button-primary button-small"
                              onClick={() => {
                                setSubmittingNoteTrack(t);
                                setSubmitterNote("");
                                setSubmitCopyrightAgreed(false);
                              }}
                            >
                              Resubmit
                            </button>
                            <button
                              className="button button-ghost button-small text-danger"
                              onClick={() => setDeleteConfirmTrack(t)}
                              title="Delete track"
                              aria-label="Delete rejected track"
                            >
                              <TrashIcon width={15} height={15} />
                            </button>
                          </>
                        )}

                        {t.status === "APPROVED" && (
                          <>
                            <button
                              className="button button-ghost button-small"
                              onClick={() => onNavigate(`/track/${t.id}`)}
                            >
                              View track
                            </button>
                            <button
                              className="button button-ghost button-small text-danger"
                              onClick={() => setDeleteConfirmTrack(t)}
                              title="Delete track"
                              aria-label="Delete published track"
                            >
                              <TrashIcon width={15} height={15} />
                            </button>
                          </>
                        )}

                        {t.status === "PENDING" && (
                          <>
                            <span className="text-muted small" style={{ marginRight: "4px" }}>Under review...</span>
                            <button
                              type="button"
                              className="button button-ghost button-small text-warning"
                              onClick={() => setWithdrawConfirmTrack(t)}
                              title="Withdraw submission from moderation review"
                            >
                              Withdraw
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Track Modal (UC-19.3) */}
      {trackModalOpen && createPortal(
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => !isSaving && setTrackModalOpen(false)}
        >
          <div
            className="modal-card modal-card--wide studio-track-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="track-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="studio-modal-heading">
                <span className="studio-modal-heading__icon"><UploadIcon width={20} height={20} /></span>
                <div>
                  <span className="eyebrow">CONTENT STUDIO</span>
                  <h3 id="track-modal-title">Edit track</h3>
                  <p>Update the metadata or replace media before resubmitting.</p>
                </div>
              </div>
              <button
                className="icon-button"
                onClick={() => setTrackModalOpen(false)}
                disabled={isSaving}
                aria-label="Close dialog"
              >
                <CloseIcon width={18} height={18} />
              </button>
            </div>

            {Object.keys(formErrors).length > 0 && (
              <div className="auth-v2-error" role="alert">
                <span><AlertIcon width={16} height={16} /></span>
                <div>
                  <b>Please review errors below</b>
                  <small>Make sure all mandatory fields are correctly filled.</small>
                </div>
              </div>
            )}

            {actionError && (
              <div className="auth-v2-error studio-inline-api-error" role="alert">
                <span><AlertIcon width={16} height={16} /></span>
                <div>
                  <b>Unable to save this track</b>
                  <small>{actionError}</small>
                </div>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="modal-form" noValidate>
              <div className="form-group">
                <label htmlFor="track-title">
                  Title <span style={{ color: "var(--sw-danger)" }}>*</span>
                </label>
                <input
                  id="track-title"
                  type="text"
                  placeholder="For example: Sunset Memories"
                  value={title}
                  autoFocus
                  aria-invalid={Boolean(formErrors.title)}
                  aria-describedby={formErrors.title ? "track-title-error" : undefined}
                  style={formErrors.title ? { borderColor: "#b42318", background: "#fef3f2" } : {}}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (formErrors.title) {
                      setFormErrors((prev) => ({ ...prev, title: "" }));
                    }
                  }}
                />
                {formErrors.title && (
                  <small id="track-title-error" className="auth-v2-field-error">
                    <AlertIcon width={12} height={12} />
                    {formErrors.title}
                  </small>
                )}
              </div>

              <div className="studio-form-grid studio-form-grid--equal">
                <div className="form-group">
                  <label htmlFor="track-genre">
                    Genre <span style={{ color: "var(--sw-danger)" }}>*</span>
                  </label>
                  <select
                    id="track-genre"
                    value={selectedGenreId}
                    disabled={genres.length === 0 || isSaving}
                    aria-invalid={Boolean(formErrors.genre)}
                    aria-describedby={formErrors.genre ? "track-genre-error" : undefined}
                    onChange={(e) => {
                      setSelectedGenreId(Number(e.target.value));
                      if (formErrors.genre) {
                        setFormErrors((prev) => ({ ...prev, genre: "" }));
                      }
                    }}
                  >
                    {genres.length > 0 ? (
                      genres.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))
                    ) : <option value={0}>Genres unavailable</option>}
                  </select>
                  {formErrors.genre && (
                    <small id="track-genre-error" className="auth-v2-field-error">
                      <AlertIcon width={12} height={12} />
                      {formErrors.genre}
                    </small>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="track-album">Album (optional)</label>
                  <select
                    id="track-album"
                    value={selectedAlbumId}
                    onChange={(e) =>
                      setSelectedAlbumId(e.target.value ? Number(e.target.value) : "")
                    }
                  >
                    <option value="">None (Single track)</option>
                    {albums.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: "16px" }}>
                <label htmlFor="track-desc">Description (optional)</label>
                <textarea
                  id="track-desc"
                  placeholder="Brief description or mood of the track"
                  value={description}
                  rows={3}
                  maxLength={2001}
                  aria-invalid={Boolean(formErrors.description)}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (formErrors.description) setFormErrors((previous) => ({ ...previous, description: "" }));
                  }}
                />
                {formErrors.description && <small className="auth-v2-field-error"><AlertIcon width={12} height={12} />{formErrors.description}</small>}
              </div>

              <div className="studio-media-grid">
                <MediaUploadField
                  id="audio-file-input"
                  label="Audio file"
                  helperText="MP3, WAV or FLAC · Max 30MB"
                  accept=".mp3,.wav,.flac,audio/mpeg,audio/wav,audio/flac"
                  file={audioFile}
                  existingFileLabel={audioFileName}
                  error={formErrors.audio}
                  disabled={isSaving}
                  onFileChange={(file) => void handleAudioFileChange(file)}
                />

                <MediaUploadField
                  id="cover-file-input"
                  label="Cover artwork"
                  helperText="JPG or PNG · Max 5MB"
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                  file={coverFile}
                  existingFileLabel={coverFileName}
                  error={formErrors.cover}
                  disabled={isSaving}
                  onFileChange={handleCoverFileChange}
                />
              </div>

              <div className="form-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <label htmlFor="lyrics-file-input" style={{ margin: 0 }}>
                    Lyrics file (.lrc, .txt - Optional)
                  </label>
                  {lyricsContent && (
                    <button
                      type="button"
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--sw-danger, #ef4444)",
                        fontSize: "12px",
                        cursor: "pointer",
                        fontWeight: 600,
                        padding: 0,
                      }}
                      onClick={() => {
                        setLyricsContent("");
                        setLyricsFileName("");
                      }}
                    >
                      Remove lyrics
                    </button>
                  )}
                </div>

                <div className="file-drop-zone">
                  <input
                    type="file"
                    accept=".lrc,.txt,text/plain"
                    id="lyrics-file-input"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const lyricsError = validateLyricsFile(file);
                      if (lyricsError) {
                        setLyricsFileName("");
                        setFormErrors((previous) => ({ ...previous, lyrics: lyricsError }));
                        e.target.value = "";
                        return;
                      }
                      void readLyricsFile(file)
                        .then((content) => {
                          setLyricsFileName(file.name);
                          setLyricsContent(content);
                          setFormErrors((previous) => ({ ...previous, lyrics: "" }));
                        })
                        .catch((error: unknown) => {
                          setLyricsFileName("");
                          setFormErrors((previous) => ({
                            ...previous,
                            lyrics: error instanceof Error ? error.message : "Lyrics file could not be read.",
                          }));
                        });
                      e.target.value = "";
                    }}
                    style={{ display: "none" }}
                  />
                  <label htmlFor="lyrics-file-input" className="file-drop-label">
                    <FileTextIcon width={24} height={24} />
                    <span>
                      {lyricsFileName
                        ? `Selected lyrics: ${lyricsFileName}`
                        : lyricsContent
                        ? "Lyrics attached (click to choose a different file)"
                        : "Upload lyrics file (.lrc, .txt - optional)"}
                    </span>
                  </label>
                </div>

                {formErrors.lyrics && (
                  <small className="auth-v2-field-error">
                    <AlertIcon width={12} height={12} />
                    {formErrors.lyrics}
                  </small>
                )}

                {lyricsContent && (
                  <div style={{ marginTop: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <span style={{ fontSize: "11px", color: "var(--sw-text-secondary)", fontWeight: 600 }}>
                        Lyrics content & preview:
                      </span>
                      <span style={{ fontSize: "11px", color: "var(--sw-primary)", fontWeight: 600 }}>
                        {lyricsContent.split("\n").filter((l) => l.trim().length > 0).length} lines
                      </span>
                    </div>
                    <textarea
                      id="track-lyrics-editor"
                      rows={4}
                      value={lyricsContent}
                      onChange={(e) => setLyricsContent(e.target.value)}
                      placeholder="Paste or edit synchronized (.lrc) or plain text lyrics..."
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: "1px solid var(--sw-border)",
                        fontFamily: "monospace",
                        fontSize: "12px",
                        lineHeight: "1.5",
                        resize: "vertical",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                )}
              </div>

              {isSaving && (
                <div className="studio-upload-progress" role="status" aria-live="polite">
                  <span className="studio-upload-progress__bar" />
                  <div>
                    <b>Saving track changes</b>
                    <small>Please keep this window open while media is being processed.</small>
                  </div>
                </div>
              )}

              <div className="modal-actions studio-track-modal__actions">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setTrackModalOpen(false)}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="button button-primary"
                  disabled={isSaving}
                  id="btn-save-track"
                >
                  {isSaving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal (UC-19.4) */}
      {deleteConfirmTrack && createPortal(
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => !isSaving && setDeleteConfirmTrack(null)}
        >
          <div
            className="modal-card"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 style={{ color: "var(--sw-danger, #dc2626)" }}>Delete track</h3>
              <button
                className="icon-button"
                onClick={() => setDeleteConfirmTrack(null)}
                disabled={isSaving}
              >
                <CloseIcon width={18} height={18} />
              </button>
            </div>
            <p style={{ margin: "16px 0", color: "var(--sw-text-secondary, #475467)" }}>
              Are you sure you want to permanently delete track &quot;
              <b>{deleteConfirmTrack.title}</b>&quot;? This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button
                className="button button-secondary"
                onClick={() => setDeleteConfirmTrack(null)}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                className="button button-danger"
                style={{
                  background: "var(--sw-danger, #dc2626)",
                  color: "#ffffff",
                  borderColor: "var(--sw-danger, #dc2626)",
                  fontWeight: 600,
                  boxShadow: "0 4px 14px rgba(220, 38, 38, 0.28)"
                }}
                onClick={handleDeleteTrack}
                disabled={isSaving}
              >
                {isSaving ? "Deleting..." : "Confirm delete"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Submit for Review Modal (UC-19.5) */}
      {submittingNoteTrack && createPortal(
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => !isSaving && setSubmittingNoteTrack(null)}
        >
          <div
            className="modal-card"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Submit track for Staff review</h3>
              <button
                className="icon-button"
                onClick={() => setSubmittingNoteTrack(null)}
                disabled={isSaving}
              >
                <CloseIcon width={18} height={18} />
              </button>
            </div>
            <p style={{ margin: "12px 0 8px", color: "var(--sw-text-secondary)" }}>
              You are submitting <b>“{submittingNoteTrack.title}”</b> to the moderation queue.
              Once submitted, editing is locked until staff completes review.
            </p>
            <div className="form-group" style={{ marginTop: "12px" }}>
              <label htmlFor="submitter-note">Note for reviewer (optional)</label>
              <textarea
                id="submitter-note"
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
                  id="chk-studio-agree-copyright"
                  checked={submitCopyrightAgreed}
                  onChange={(e) => setSubmitCopyrightAgreed(e.target.checked)}
                  style={{ marginTop: "3px" }}
                />
                <span>
                  I confirm that I own all rights to this audio and artwork, or hold legal authorization to publish it, and agree to SoundWave Community Guidelines.
                </span>
              </label>
            </div>
            <div className="modal-actions" style={{ marginTop: "18px" }}>
              <button
                className="button button-secondary"
                onClick={() => setSubmittingNoteTrack(null)}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                className="button button-primary"
                onClick={handleSubmitReview}
                disabled={!submitCopyrightAgreed || isSaving}
                id="btn-studio-agree-submit"
              >
                {isSaving ? "Submitting..." : "Agree & Submit"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Rejection Details Modal (UC-20) */}
      {rejectionModalTrack && createPortal(
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => setRejectionModalTrack(null)}
        >
          <div
            className="modal-card"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Track Rejection Details</h3>
              <button
                className="icon-button"
                onClick={() => setRejectionModalTrack(null)}
              >
                <CloseIcon width={18} height={18} />
              </button>
            </div>
            <p className="rejection-track-name" style={{ marginBottom: "6px" }}>
              Track: <b>{rejectionModalTrack.trackTitle}</b>
            </p>
            {rejectionModalTrack.reviewedAt && (
              <p style={{ margin: "0 0 14px", fontSize: "12px", color: "var(--sw-text-muted)" }}>
                Decision recorded: {new Date(rejectionModalTrack.reviewedAt).toLocaleString()}
              </p>
            )}
            <div className="rejection-box">
              <b style={{ display: "block", marginBottom: "4px", color: "#b42318" }}>
                Staff rejection reason:
              </b>
              <p className="rejection-text">{rejectionModalTrack.rejectionReason}</p>
              {rejectionModalTrack.reviewerNote && (
                <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px dashed rgba(180, 35, 24, 0.2)" }}>
                  <b style={{ display: "block", marginBottom: "2px", fontSize: "12px", color: "var(--sw-text-secondary)" }}>
                    Reviewer note:
                  </b>
                  <p style={{ margin: 0, fontSize: "13px" }}>{rejectionModalTrack.reviewerNote}</p>
                </div>
              )}
            </div>
            <p className="rejection-help">
              You can edit the audio file and metadata to address this feedback, then resubmit the track.
            </p>
            <div className="modal-actions">
              <button
                className="button button-secondary"
                onClick={() => setRejectionModalTrack(null)}
              >
                Close
              </button>
              <button
                className="button button-primary"
                onClick={() => {
                  const targetTrack = trackList.find(
                    (t) => t.id === rejectionModalTrack.trackId
                  );
                  setRejectionModalTrack(null);
                  if (targetTrack) {
                    openEditModal(targetTrack);
                  }
                }}
              >
                Edit track
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Withdraw Submission Modal (UC-19.4 Extension) */}
      {withdrawConfirmTrack && createPortal(
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => !isSaving && setWithdrawConfirmTrack(null)}
        >
          <div
            className="modal-card"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Withdraw submission</h3>
              <button
                className="icon-button"
                onClick={() => setWithdrawConfirmTrack(null)}
                disabled={isSaving}
              >
                <CloseIcon width={18} height={18} />
              </button>
            </div>
            <p style={{ margin: "16px 0", color: "var(--sw-text-secondary)" }}>
              Are you sure you want to withdraw &quot;<b>{withdrawConfirmTrack.title}</b>&quot; from moderation review? The track will return to <b>Draft</b> status so you can continue editing or replacing media.
            </p>
            <div className="modal-actions">
              <button
                className="button button-secondary"
                onClick={() => setWithdrawConfirmTrack(null)}
                disabled={isSaving}
              >
                Keep in review
              </button>
              <button
                className="button button-primary"
                onClick={handleWithdrawSubmission}
                disabled={isSaving}
              >
                {isSaving ? "Withdrawing..." : "Confirm withdraw"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Track Detail Modal (Manage My Tracks - View Detail Sequence Diagram) */}
      {detailTrack && createPortal(
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={closeDetailModal}
        >
          <div
            className="modal-card modal-card--wide studio-track-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="studio-detail-modal-title"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "780px" }}
          >
            {/* Header */}
            <div className="modal-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid #e4e7ec" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", minWidth: 0 }}>
                <img
                  src={detailTrack.coverUrl || "/pics/album.png"}
                  alt={detailTrack.title}
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "8px",
                    objectFit: "cover",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                    flexShrink: 0,
                  }}
                />
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <h3 id="studio-detail-modal-title" style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, color: "var(--sw-text, #1e293b)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {detailTrack.title}
                    </h3>
                    <span className={`status-badge status-badge--${detailTrack.status.toLowerCase()}`}>
                      {detailTrack.status === "APPROVED" && "Published"}
                      {detailTrack.status === "PENDING" && "Pending Review"}
                      {detailTrack.status === "REJECTED" && "Rejected"}
                      {detailTrack.status === "DRAFT" && "Draft"}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px", fontSize: "12px", color: "var(--sw-text-muted, #64748b)" }}>
                    <span>Slug: <code>{detailTrack.slug}</code></span>
                    <span>•</span>
                    <span>ID: #{detailTrack.id}</span>
                  </div>
                </div>
              </div>
              <button
                className="icon-button"
                onClick={closeDetailModal}
                title="Close modal"
                aria-label="Close modal"
              >
                <CloseIcon width={18} height={18} />
              </button>
            </div>

            {/* Content Area */}
            <div style={{ padding: "20px 24px", overflowY: "auto", maxHeight: "calc(85vh - 160px)", display: "flex", flexDirection: "column", gap: "18px" }}>
              {/* Audio Preview Player (Step 5) */}
              {detailTrack.audioUrl && (
                <div
                  style={{
                    background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                    border: "1px solid #bae6fd",
                    borderRadius: "12px",
                    padding: "14px 18px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <audio
                    ref={detailAudioRef}
                    src={detailTrack.audioUrl}
                    preload="metadata"
                    onTimeUpdate={() => setDetailAudioCurrentTime(detailAudioRef.current?.currentTime || 0)}
                    onLoadedMetadata={() => setDetailAudioDuration(detailAudioRef.current?.duration || 0)}
                    onEnded={() => {
                      setDetailAudioPlaying(false);
                      setDetailAudioCurrentTime(0);
                    }}
                  />
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <button
                        type="button"
                        onClick={handleToggleDetailAudio}
                        style={{
                          width: "38px",
                          height: "38px",
                          borderRadius: "50%",
                          background: "var(--sw-primary, #0284c7)",
                          color: "#ffffff",
                          border: "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          boxShadow: "0 2px 6px rgba(2, 132, 199, 0.3)",
                          flexShrink: 0,
                        }}
                        title={detailAudioPlaying ? "Pause preview" : "Play preview"}
                        aria-label={detailAudioPlaying ? "Pause preview" : "Play preview"}
                      >
                        {detailAudioPlaying ? <PauseIcon width={18} height={18} /> : <PlayIcon width={18} height={18} />}
                      </button>
                      <div>
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "#0369a1" }}>Audio Preview</span>
                        <div style={{ fontSize: "11px", color: "#0284c7" }}>
                          {detailTrack.audioFormat?.toUpperCase() || "AUDIO"} • {formatDuration((detailAudioDuration || ((detailTrack.durationMs || 0) / 1000)) * 1000)}
                        </div>
                      </div>
                    </div>
                    <span style={{ fontSize: "12px", fontWeight: 500, color: "#0369a1", fontVariantNumeric: "tabular-nums" }}>
                      {formatDuration(detailAudioCurrentTime * 1000)} / {formatDuration((detailAudioDuration || ((detailTrack.durationMs || 0) / 1000)) * 1000)}
                    </span>
                  </div>
                  {/* Progress scrubber */}
                  <input
                    type="range"
                    min={0}
                    max={detailAudioDuration || (detailTrack.durationMs ? detailTrack.durationMs / 1000 : 100)}
                    step={0.1}
                    value={detailAudioCurrentTime}
                    onChange={(e) => {
                      const newTime = Number(e.target.value);
                      if (detailAudioRef.current) {
                        detailAudioRef.current.currentTime = newTime;
                      }
                      setDetailAudioCurrentTime(newTime);
                    }}
                    style={{
                      width: "100%",
                      accentColor: "var(--sw-primary, #0284c7)",
                      cursor: "pointer",
                      height: "5px",
                    }}
                  />
                </div>
              )}

              {/* Moderation State Evaluation Banner (Step 4) */}
              {detailTrack.status === "PENDING" && (
                <div
                  style={{
                    background: "#fefce8",
                    border: "1px solid #fef08a",
                    borderRadius: "10px",
                    padding: "14px 16px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                  }}
                >
                  <div style={{ color: "#ca8a04", flexShrink: 0, marginTop: "2px" }}>
                    <ClockIcon width={20} height={20} />
                  </div>
                  <div style={{ fontSize: "13px", color: "#854d0e", lineHeight: 1.5 }}>
                    <strong style={{ display: "block", color: "#713f12", marginBottom: "3px" }}>
                      Pending Moderation Review
                    </strong>
                    This track is currently queued for review by SoundWave moderators. Direct editing and deletion are locked to preserve submission integrity.
                    {detailTrack.submittedAt && (
                      <div style={{ marginTop: "6px", fontSize: "12px" }}>
                        Submitted on: <b>{new Date(detailTrack.submittedAt).toLocaleString()}</b>
                      </div>
                    )}
                    {detailTrack.submitterNote && (
                      <div style={{ marginTop: "6px", padding: "8px 12px", background: "#fef9c3", borderRadius: "6px", fontStyle: "italic" }}>
                        &ldquo;{detailTrack.submitterNote}&rdquo;
                      </div>
                    )}
                  </div>
                </div>
              )}

              {detailTrack.status === "REJECTED" && (
                <div
                  style={{
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: "10px",
                    padding: "14px 16px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                  }}
                >
                  <div style={{ color: "#dc2626", flexShrink: 0, marginTop: "2px" }}>
                    <AlertIcon width={20} height={20} />
                  </div>
                  <div style={{ fontSize: "13px", color: "#991b1b", lineHeight: 1.5, flex: 1 }}>
                    <strong style={{ display: "block", color: "#7f1d1d", marginBottom: "4px" }}>
                      Submission Rejected
                    </strong>
                    <div style={{ marginBottom: "6px" }}>
                      Reason: <b>{detailTrack.latestRejectionReason || "Content or metadata does not meet community guidelines."}</b>
                    </div>
                    {detailTrack.reviewerNote && (
                      <div style={{ padding: "8px 12px", background: "#fee2e2", borderRadius: "6px", marginBottom: "6px", fontSize: "12px" }}>
                        <strong>Reviewer note:</strong> {detailTrack.reviewerNote}
                      </div>
                    )}
                    {detailTrack.reviewedAt && (
                      <div style={{ fontSize: "12px", color: "#b91c1c" }}>
                        Reviewed on: {new Date(detailTrack.reviewedAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {detailTrack.status === "DRAFT" && (
                <div
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    padding: "14px 16px",
                    fontSize: "13px",
                    color: "var(--sw-text-secondary, #475569)",
                    lineHeight: 1.5,
                  }}
                >
                  <strong style={{ display: "block", color: "var(--sw-text, #1e293b)", marginBottom: "3px" }}>
                    Draft Track
                  </strong>
                  This track is in draft mode and not visible to public listeners. You can edit the audio file and metadata at any time before submitting for review.
                </div>
              )}

              {detailTrack.status === "APPROVED" && (
                <div
                  style={{
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: "10px",
                    padding: "14px 16px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                  }}
                >
                  <div style={{ color: "#16a34a", flexShrink: 0, marginTop: "2px" }}>
                    <CheckIcon width={20} height={20} />
                  </div>
                  <div style={{ fontSize: "13px", color: "#166534", lineHeight: 1.5 }}>
                    <strong style={{ display: "block", color: "#14532d", marginBottom: "3px" }}>
                      Live in Public Catalog
                    </strong>
                    This track is approved and streaming on SoundWave.
                    <div style={{ marginTop: "4px", fontSize: "12px" }}>
                      Total Plays: <b>{detailTrack.playCount ?? 0}</b>
                    </div>
                  </div>
                </div>
              )}

              {/* Metadata Details Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "12px",
                  background: "#f8fafc",
                  padding: "16px",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--sw-text-muted, #64748b)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Genre
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--sw-text, #1e293b)", marginTop: "2px" }}>
                    {detailTrack.genreName || "Unassigned"}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--sw-text-muted, #64748b)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Album
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--sw-text, #1e293b)", marginTop: "2px" }}>
                    {detailTrack.albumTitle ? `${detailTrack.albumTitle}${detailTrack.trackNumber ? ` (#${detailTrack.trackNumber})` : ""}` : "Single Release"}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--sw-text-muted, #64748b)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Duration
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--sw-text, #1e293b)", marginTop: "2px" }}>
                    {formatDuration(detailTrack.durationMs)}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--sw-text-muted, #64748b)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Format
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--sw-text, #1e293b)", marginTop: "2px" }}>
                    {detailTrack.audioFormat?.toUpperCase() || "MP3 / AAC"}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--sw-text-muted, #64748b)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Created Date
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--sw-text, #1e293b)", marginTop: "2px" }}>
                    {detailTrack.createdAt}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--sw-text-muted, #64748b)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Plays
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--sw-text, #1e293b)", marginTop: "2px" }}>
                    {detailTrack.playCount ?? 0}
                  </div>
                </div>
              </div>

              {/* Description */}
              {detailTrack.description && (
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--sw-text-secondary, #475569)", marginBottom: "4px" }}>
                    Description
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--sw-text, #1e293b)", background: "#ffffff", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0", whiteSpace: "pre-wrap" }}>
                    {detailTrack.description}
                  </div>
                </div>
              )}

              {/* Lyrics */}
              {detailTrack.lyrics && (
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--sw-text-secondary, #475569)", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <FileTextIcon width={14} height={14} /> Lyrics
                  </div>
                  <div style={{ maxHeight: "140px", overflowY: "auto", fontSize: "12px", color: "var(--sw-text, #1e293b)", background: "#ffffff", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0", whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
                    {detailTrack.lyrics}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions (Step 4 & 22) */}
            <div className="modal-actions" style={{ padding: "16px 24px", borderTop: "1px solid #e4e7ec", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <button
                type="button"
                className="button button-secondary"
                onClick={closeDetailModal}
              >
                Close
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {/* Status: PENDING (lock dangerous edit, provide Withdraw) */}
                {detailTrack.status === "PENDING" && (
                  <button
                    type="button"
                    className="button button-primary"
                    onClick={() => {
                      const t = detailTrack;
                      closeDetailModal();
                      setWithdrawConfirmTrack(t);
                    }}
                  >
                    Withdraw submission
                  </button>
                )}

                {/* Status: REJECTED (provide Edit, Delete & Resubmit) */}
                {detailTrack.status === "REJECTED" && (
                  <>
                    <button
                      type="button"
                      className="button button-ghost text-danger"
                      onClick={() => {
                        const t = detailTrack;
                        closeDetailModal();
                        setDeleteConfirmTrack(t);
                      }}
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      className="button button-secondary"
                      onClick={() => {
                        const t = detailTrack;
                        closeDetailModal();
                        openEditModal(t);
                      }}
                    >
                      Edit track
                    </button>
                    <button
                      type="button"
                      className="button button-primary"
                      onClick={() => {
                        const t = detailTrack;
                        closeDetailModal();
                        setSubmittingNoteTrack(t);
                        setSubmitterNote("");
                        setSubmitCopyrightAgreed(false);
                      }}
                    >
                      Resubmit for review
                    </button>
                  </>
                )}

                {/* Status: DRAFT (provide Edit, Delete & Submit for Review) */}
                {detailTrack.status === "DRAFT" && (
                  <>
                    <button
                      type="button"
                      className="button button-ghost text-danger"
                      onClick={() => {
                        const t = detailTrack;
                        closeDetailModal();
                        setDeleteConfirmTrack(t);
                      }}
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      className="button button-secondary"
                      onClick={() => {
                        const t = detailTrack;
                        closeDetailModal();
                        openEditModal(t);
                      }}
                    >
                      Edit track
                    </button>
                    <button
                      type="button"
                      className="button button-primary"
                      onClick={() => {
                        const t = detailTrack;
                        closeDetailModal();
                        setSubmittingNoteTrack(t);
                        setSubmitterNote("");
                        setSubmitCopyrightAgreed(false);
                      }}
                    >
                      Submit for review
                    </button>
                  </>
                )}

                {/* Status: APPROVED (provide View on Public Catalog, Edit & Delete) */}
                {detailTrack.status === "APPROVED" && (
                  <>
                    <button
                      type="button"
                      className="button button-ghost text-danger"
                      onClick={() => {
                        const t = detailTrack;
                        closeDetailModal();
                        setDeleteConfirmTrack(t);
                      }}
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      className="button button-secondary"
                      onClick={() => {
                        const t = detailTrack;
                        closeDetailModal();
                        openEditModal(t);
                      }}
                    >
                      Edit track
                    </button>
                    <button
                      type="button"
                      className="button button-primary"
                      onClick={() => {
                        closeDetailModal();
                        onNavigate(`/track/${detailTrack.id}`);
                      }}
                    >
                      View on Public Catalog
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
