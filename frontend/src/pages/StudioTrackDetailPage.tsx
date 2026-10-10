import { FormEvent, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  studioApi,
  type AlbumOption,
  type ApiTrack,
  type GenreOption,
  type RejectionDetails,
} from "../api/track";
import { useModalScrollLock } from "../hooks/useModalScrollLock";
import { MediaUploadField } from "../components/MediaUploadField";
import { RejectionDetailsModal } from "../components/RejectionDetailsModal";
import {
  AlertIcon,
  CheckIcon,
  ClockIcon,
  CloseIcon,
  DiscIcon,
  EditIcon,
  EyeIcon,
  FileTextIcon,
  PauseIcon,
  PlayIcon,
  ShieldIcon,
  TrashIcon,
  UploadIcon,
  UserIcon,
  VolumeIcon,
} from "../icons";
import type { CurrentUser } from "../types";
import {
  readAudioDuration,
  readLyricsFile,
  validateAudioFile,
  validateCoverFile,
  validateLyricsFile,
} from "../utils/trackUpload";

function formatDuration(ms?: number | null): string {
  if (!ms || ms <= 0) return "0:00";
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function formatDate(isoString?: string | null): string {
  if (!isoString) return "--";
  try {
    const d = new Date(isoString);
    return d.toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return isoString;
  }
}

function formatSeconds(totalSeconds: number): string {
  if (isNaN(totalSeconds) || totalSeconds < 0) return "0:00";
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

type Props = {
  trackId: number;
  currentUser: CurrentUser | null;
  onNavigate: (route: string) => void;
};

export function StudioTrackDetailPage({ trackId, currentUser, onNavigate }: Props) {
  const [track, setTrack] = useState<ApiTrack | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Audio player state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);

  // Modals
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [rejectionModalDetails, setRejectionModalDetails] = useState<RejectionDetails | null>(null);

  /**
   * Mở modal xem chi tiết lý do từ chối kiểm duyệt (UC-20: View Rejection Reason).
   */
  const handleOpenRejectionModal = async () => {
    if (!track) return;
    try {
      const details = await studioApi.getRejectionDetails(track.id);
      setRejectionModalDetails(details);
    } catch {
      setRejectionModalDetails({
        trackId: track.id,
        trackTitle: track.title,
        status: "REJECTED",
        rejectionReason:
          track.latestRejectionReason ||
          "Audio content violates community standards.",
        reviewerNote: track.reviewerNote,
        reviewedAt: track.reviewedAt || track.createdAt,
      });
    }
    setRejectionModalOpen(true);
  };

  // Edit form state
  const [genres, setGenres] = useState<GenreOption[]>([]);
  const [albums, setAlbums] = useState<AlbumOption[]>([]);
  const [editTitle, setEditTitle] = useState("");
  const [editGenreId, setEditGenreId] = useState<number>(0);
  const [editAlbumId, setEditAlbumId] = useState<number | "">("");
  const [editDescription, setEditDescription] = useState("");
  const [editAudioFile, setEditAudioFile] = useState<File | null>(null);
  const [editCoverFile, setEditCoverFile] = useState<File | null>(null);
  const [editLyricsContent, setEditLyricsContent] = useState("");
  const [editAudioFileName, setEditAudioFileName] = useState("");
  const [editCoverFileName, setEditCoverFileName] = useState("");
  const [editLyricsFileName, setEditLyricsFileName] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Submit for review state
  const [submitterNote, setSubmitterNote] = useState("");
  const [submitCopyrightAgreed, setSubmitCopyrightAgreed] = useState(false);

  useModalScrollLock(editModalOpen || deleteConfirmOpen || submitModalOpen || withdrawModalOpen || rejectionModalOpen);

  const fetchTrackData = async (active = true) => {
    try {
      setLoading(true);
      setError(null);
      const data = await studioApi.getTrackById(trackId);
      if (active) {
        setTrack(data);
        setLoading(false);
      }
    } catch (err: unknown) {
      if (active) {
        setError(err instanceof Error ? err.message : "Failed to load track details.");
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    let active = true;
    void fetchTrackData(active);

    // Also load genres & albums for editing
    studioApi.getGenres().then((g) => {
      if (active && g.length > 0) setGenres(g);
    }).catch(() => {});

    studioApi.getMyAlbums().then((a) => {
      if (active && a.length > 0) setAlbums(a);
    }).catch(() => {});

    return () => {
      active = false;
      if (audioRef.current) {
        if (playPromiseRef.current) {
          playPromiseRef.current
            .then(() => audioRef.current?.pause())
            .catch(() => {});
        } else {
          audioRef.current.pause();
        }
      }
    };
  }, [trackId]);

  // Player controls
  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      if (playPromiseRef.current) {
        playPromiseRef.current
          .then(() => {
            audioRef.current?.pause();
            setIsPlaying(false);
          })
          .catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      const promise = audioRef.current.play();
      if (promise !== undefined) {
        playPromiseRef.current = promise;
        promise
          .then(() => setIsPlaying(true))
          .catch((err: Error) => {
            if (err.name !== "AbortError") console.error("Audio playback error:", err);
            setIsPlaying(false);
          });
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (!duration && audioRef.current.duration) {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      audioRef.current.volume = volume;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = Number(e.target.value);
    setCurrentTime(target);
    if (audioRef.current) {
      audioRef.current.currentTime = target;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
  };

  const maxSeekTime = duration || (track?.durationMs ? track.durationMs / 1000 : 100);

  // Status computation
  const rawStatus = track?.status || "DRAFT";
  const isApproved = rawStatus === "APPROVED" || rawStatus === "PUBLISHED";
  const isPending = rawStatus === "PENDING";
  const isRejected = rawStatus === "REJECTED" || rawStatus === "TAKEN_DOWN";
  const isDraft = rawStatus === "DRAFT";

  const statusLabel = isApproved
    ? "Approved & Published"
    : isPending
    ? "Pending Review"
    : isRejected
    ? "Rejected"
    : "Draft";

  const statusClass = isApproved
    ? "is-approved"
    : isPending
    ? "is-pending"
    : isRejected
    ? "is-rejected"
    : "is-pending";

  const submitterName = currentUser?.displayName || currentUser?.username || "Artist";
  const submitterEmail = currentUser?.email || "artist@soundwave.io";
  const submitterUsername = currentUser?.username || currentUser?.email?.split("@")[0] || "artist";

  // Actions
  const openEditModal = () => {
    if (!track) return;
    setEditTitle(track.title);
    setEditGenreId(track.genreId);
    setEditAlbumId(track.albumId ?? "");
    setEditDescription(track.description ?? "");
    setEditLyricsContent(track.lyrics ?? "");
    setEditAudioFile(null);
    setEditCoverFile(null);
    setEditAudioFileName(track.audioUrl ? "Current audio file attached" : "");
    setEditCoverFileName(track.coverUrl ? "Current cover image attached" : "");
    setEditLyricsFileName(track.lyrics ? "Existing lyrics attached" : "");
    setFormErrors({});
    setActionError(null);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!track) return;

    const errors: Record<string, string> = {};
    if (!editTitle.trim()) {
      errors.title = "Please enter the track title.";
    } else if (editTitle.trim().length > 200) {
      errors.title = "Track title cannot exceed 200 characters.";
    }

    if (!editGenreId) {
      errors.genre = "Please select a music genre.";
    }

    if (editAudioFile) {
      const audioErr = validateAudioFile(editAudioFile);
      if (audioErr) errors.audio = audioErr;
    }

    if (editCoverFile) {
      const coverErr = validateCoverFile(editCoverFile);
      if (coverErr) errors.cover = coverErr;
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setIsProcessing(true);
      setActionError(null);
      const updated = await studioApi.updateTrack(
        track.id,
        {
          title: editTitle.trim(),
          genreId: editGenreId,
          albumId: editAlbumId ? Number(editAlbumId) : undefined,
          description: editDescription.trim() || undefined,
          lyrics: editLyricsContent.trim() || undefined,
        },
        editAudioFile ?? undefined,
        editCoverFile ?? undefined
      );

      setTrack(updated);
      setEditModalOpen(false);
      setActionSuccess("Track updated successfully.");
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Failed to update track.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!track) return;
    try {
      setIsProcessing(true);
      setActionError(null);
      await studioApi.deleteTrack(track.id);
      setDeleteConfirmOpen(false);
      onNavigate("/studio");
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Failed to delete track.");
      setIsProcessing(false);
    }
  };

  const handleSubmitForReview = async (e: FormEvent) => {
    e.preventDefault();
    if (!track) return;
    if (!submitCopyrightAgreed) {
      setActionError("You must acknowledge that you own or have permission to distribute this audio.");
      return;
    }

    try {
      setIsProcessing(true);
      setActionError(null);
      const updated = await studioApi.submitForReview(track.id, submitterNote.trim() || undefined);
      setTrack(updated);
      setSubmitModalOpen(false);
      setActionSuccess("Track submitted for moderation review successfully.");
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Failed to submit track.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWithdrawSubmission = async () => {
    if (!track) return;
    try {
      setIsProcessing(true);
      setActionError(null);
      const updated = await studioApi.withdrawSubmission(track.id);
      setTrack(updated);
      setWithdrawModalOpen(false);
      setActionSuccess("Submission withdrawn back to draft successfully.");
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Failed to withdraw submission.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="studio-track-detail-page" style={{ padding: "0 0 48px", width: "100%", maxWidth: "100%", boxSizing: "border-box" }}>
      {/* Top Banner */}
      <header
        className="staff-hero-banner"
        style={{
          marginTop: "0px",
          marginBottom: "18px",
          width: "100%",
          boxSizing: "border-box",
          border: "1.5px solid #99f6e4",
          boxShadow: "0 4px 20px rgba(2, 132, 199, 0.05)",
          borderRadius: "18px",
        }}
      >
        <div className="staff-hero-copy">
          <div className="staff-hero-eyebrow">
            <span className="staff-hero-eyebrow-pill">
              <ShieldIcon width={13} height={13} />
              <span>TRACK MODERATION</span>
            </span>
          </div>

          <h1 className="staff-hero-title">Moderate Pending Tracks</h1>

          <p className="staff-hero-description">
            Review pending submissions and record an approval or rejection decision.
          </p>
        </div>
      </header>

      {/* Action Alerts */}
      {actionSuccess ? (
        <div className="app-toast" role="status" style={{ marginBottom: "16px", position: "static" }}>
          {actionSuccess}
        </div>
      ) : null}

      {actionError ? (
        <div className="form-error-banner" role="alert" style={{ marginBottom: "16px" }}>
          {actionError}
        </div>
      ) : null}

      {/* Main Container */}
      <div
        className="staff-detail-view-container"
        style={{
          background: "#ffffff",
          border: "1px solid var(--ops-border, #e2e8f0)",
          borderRadius: "20px",
          padding: "20px 24px",
          boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Top Header & Navigation Bar - CÙNG 1 HÀNG NGANG Ở TRÊN DUY NHẤT */}
        <div className="studio-detail-top-nav-single-row">
          {/* Left: Back button + Breadcrumb */}
          <div className="studio-top-nav-single-left">
            <div className="staff-detail-breadcrumbs" style={{ fontSize: "13px" }}>
              <span
                className="staff-crumb-muted"
                style={{ cursor: "pointer" }}
                onClick={() => onNavigate("/studio")}
                title="Back to Content Studio"
              >
                Moderation Queue
              </span>
              <span className="staff-crumb-sep">/</span>
              <span className="staff-crumb-active">Submission Details #{trackId}</span>
            </div>
          </div>

          {/* Right: Status Badge & Action CRUD Buttons */}
          {track ? (
            <div className="studio-top-nav-single-right">
              {/* Status Badge */}
              <span
                className={`staff-status-chip ${statusClass}`}
                style={{ padding: "4px 10px", fontSize: "12.5px" }}
              >
                <i />
                <span>{statusLabel}</span>
              </span>

              {/* View Rejection button (UC-20) */}
              {isRejected && (
                <button
                  type="button"
                  className="studio-crud-btn"
                  onClick={handleOpenRejectionModal}
                  title="View moderator rejection reason & feedback"
                  style={{
                    backgroundColor: "#fee4e2",
                    color: "#b42318",
                    borderColor: "#fecdca",
                  }}
                >
                  <AlertIcon width={13} height={13} />
                  <span>View Rejection</span>
                </button>
              )}

              {/* 1. Edit track button */}
              <button
                type="button"
                className="studio-crud-btn studio-crud-btn-edit"
                onClick={openEditModal}
                title="Edit track information & media"
              >
                <EditIcon width={13} height={13} />
                <span>Edit track</span>
              </button>

              {/* 2. Delete button */}
              <button
                type="button"
                className="studio-crud-btn studio-crud-btn-delete"
                onClick={() => setDeleteConfirmOpen(true)}
                title="Delete this track"
              >
                <TrashIcon width={13} height={13} />
                <span>Delete</span>
              </button>

              {/* 3. Status-specific action button */}
              {(isDraft || isRejected) && (
                <button
                  type="button"
                  className="studio-crud-btn studio-crud-btn-primary"
                  onClick={() => {
                    setSubmitterNote("");
                    setSubmitCopyrightAgreed(false);
                    setSubmitModalOpen(true);
                  }}
                >
                  <UploadIcon width={13} height={13} />
                  <span>Submit for review</span>
                </button>
              )}

              {isPending && (
                <button
                  type="button"
                  className="studio-crud-btn studio-crud-btn-warning"
                  onClick={() => setWithdrawModalOpen(true)}
                >
                  <span>Withdraw submission</span>
                </button>
              )}

              {isApproved && (
                <button
                  type="button"
                  className="studio-crud-btn studio-crud-btn-primary"
                  onClick={() => onNavigate(`/track/${track.id}`)}
                >
                  <EyeIcon width={13} height={13} />
                  <span>View on Public Catalog</span>
                </button>
              )}
            </div>
          ) : null}
        </div>

        {/* Loading / Error States */}
        {loading ? (
          <div className="staff-inspector-loading" aria-busy="true" aria-live="polite">
            <div className="staff-inspector-spinner" />
            <span>Loading track submission details and audio stream...</span>
          </div>
        ) : error || !track ? (
          <div className="staff-inspector-error" role="alert">
            <AlertIcon width={36} height={36} />
            <b>Failed to load track details</b>
            <p>{error || "Track not found."}</p>
            <button
              type="button"
              className="button button-ghost button-small"
              onClick={() => onNavigate("/studio")}
            >
              Back to My Tracks
            </button>
          </div>
        ) : (
          <div className="staff-detail-content-body">
            {/* Submission Status Row */}
            <div className="staff-inspector-status-banner">
              <div className="staff-status-group">
                <span className="staff-status-label">Submission Status:</span>
                <span className={`staff-status-chip ${statusClass}`}>
                  <i />
                  <span>{statusLabel}</span>
                </span>
              </div>

              <div className="staff-time-group">
                <ClockIcon width={13} height={13} />
                <span>
                  Submitted: <b>{formatDate(track.submittedAt || track.createdAt)}</b>
                </span>
              </div>
            </div>

            {/* Hero Card & Integrated Stream Player */}
            <div className="staff-inspector-hero-card staff-detail-hero-card">
              <div className="staff-hero-artwork-wrap staff-detail-artwork-wrap">
                <img
                  src={track.coverUrl || "/pics/album.png"}
                  alt={track.title}
                  className="staff-hero-artwork"
                />
              </div>

              <div className="staff-hero-info-col">
                <div className="staff-hero-badge-row">
                  <span className="staff-meta-pill is-genre">
                    {track.genreName || "Indie"}
                  </span>
                  {track.albumTitle ? (
                    <span className="staff-meta-pill is-album">
                      <DiscIcon width={12} height={12} />
                      Album: {track.albumTitle}
                    </span>
                  ) : (
                    <span className="staff-meta-pill is-single">Single Release</span>
                  )}
                  <span className="staff-meta-pill is-format">
                    {(track.audioFormat || "MP3").toUpperCase()} · {formatDuration(track.durationMs)}
                  </span>
                </div>

                <h2 className="staff-hero-track-title staff-detail-track-title">
                  {track.title}
                </h2>

                <p className="staff-hero-creator-line">
                  <UserIcon width={14} height={14} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
                  Submitted by: <b>{submitterName}</b>
                  <span className="staff-creator-email">({submitterEmail})</span>
                </p>

                {/* Built-in High-Fidelity Audio Studio Player */}
                <div className="staff-audio-studio-player staff-detail-audio-player">
                  <audio
                    ref={audioRef}
                    src={track.audioUrl}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={() => setIsPlaying(false)}
                    preload="metadata"
                  />

                  <div className="staff-player-controls-row">
                    <button
                      type="button"
                      onClick={togglePlay}
                      className={`staff-player-main-btn ${isPlaying ? "is-playing" : ""}`}
                      title={isPlaying ? "Pause audio stream" : "Play audio stream"}
                      aria-label={isPlaying ? "Pause audio stream" : "Play audio stream"}
                    >
                      {isPlaying ? (
                        <PauseIcon width={18} height={18} />
                      ) : (
                        <PlayIcon width={18} height={18} />
                      )}
                    </button>

                    {/* Equalizer animation bars while playing */}
                    <div className={`staff-equalizer-bars ${isPlaying ? "is-active" : ""}`}>
                      <span />
                      <span />
                      <span />
                      <span />
                    </div>

                    {/* Timeline Seekbar */}
                    <div className="staff-player-seek-wrap">
                      <div className="staff-player-times">
                        <span className="staff-time-current">{formatSeconds(currentTime)}</span>
                        <span className="staff-time-total">
                          {formatSeconds(duration || (track.durationMs ? track.durationMs / 1000 : 0))}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={maxSeekTime}
                        step={0.1}
                        value={currentTime}
                        onChange={handleSeek}
                        className="staff-player-slider-bar"
                        aria-label="Seek track position"
                      />
                    </div>

                    {/* Volume Slider */}
                    <div className="staff-player-vol-wrap">
                      <VolumeIcon width={16} height={16} />
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={volume}
                        onChange={handleVolumeChange}
                        className="staff-vol-slider-bar"
                        title="Volume slider"
                        aria-label="Volume slider"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Creator Note Card */}
            <div className="staff-note-box">
              <div className="staff-note-header">
                <FileTextIcon width={14} height={14} />
                <span>CREATOR NOTE</span>
              </div>
              <p className="staff-note-content">
                {track.submitterNote ? (
                  `“${track.submitterNote}”`
                ) : (
                  <span className="staff-text-muted">
                    No creator note attached for this submission.
                  </span>
                )}
              </p>
            </div>

            {/* Technical Specifications Matrix Grid */}
            <div className="staff-specs-matrix">
              <div className="staff-matrix-cell">
                <small>ARTIST / SUBMITTER</small>
                <strong>{submitterName}</strong>
              </div>
              <div className="staff-matrix-cell">
                <small>ACCOUNT EMAIL</small>
                <strong>{submitterEmail}</strong>
              </div>
              <div className="staff-matrix-cell">
                <small>ARTIST USERNAME</small>
                <strong>@{submitterUsername}</strong>
              </div>
              <div className="staff-matrix-cell">
                <small>CATALOG SLUG</small>
                <code>{track.slug}</code>
              </div>
              <div className="staff-matrix-cell">
                <small>TRACK NUMBER</small>
                <strong>{track.albumTitle ? (track.trackNumber ? `#${track.trackNumber}` : "Album Track") : "Single"}</strong>
              </div>
              <div className="staff-matrix-cell">
                <small>MASTER AUDIO FORMAT</small>
                <strong>{(track.audioFormat || "MP3").toUpperCase()}</strong>
              </div>
            </div>

            {/* Description if provided */}
            {track.description ? (
              <div className="staff-desc-box">
                <small>TRACK DESCRIPTION</small>
                <p>{track.description}</p>
              </div>
            ) : null}

            {/* Lyrics Section */}
            <div className="staff-lyrics-card">
              <div className="staff-lyrics-header">
                <div className="staff-lyrics-title-group">
                  <span className="staff-lyrics-icon-badge">
                    <FileTextIcon width={17} height={17} />
                  </span>
                  <h4 className="staff-lyrics-heading">Lyrics</h4>
                </div>

                {track.lyrics ? (
                  <div className="staff-lyrics-header-actions">
                    <div className="staff-lyrics-stats-badge">
                      <span><b>{track.lyrics.split(/\r?\n/).filter((l) => l.trim().length > 0).length}</b> lines</span>
                    </div>
                  </div>
                ) : null}
              </div>

              {track.lyrics ? (
                <div className="staff-lyrics-viewer-wrapper">
                  <div className="staff-lyrics-lines-container">
                    {track.lyrics.split(/\r?\n/).map((line, idx) => (
                      <div key={idx} className="staff-lyrics-line-row">
                        <span className="staff-lyrics-line-number" aria-hidden="true">
                          {idx + 1}
                        </span>
                        <span className="staff-lyrics-line-content">
                          {line || "\u00A0"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="staff-lyrics-empty-state">
                  <FileTextIcon width={28} height={28} />
                  <div className="staff-lyrics-empty-text">
                    <strong>No lyrics provided</strong>
                    <span>The uploader did not attach lyrics for this release.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Moderation Review Decision Footer Banner */}
            {isApproved && (
              <div className="staff-decision-summary is-approved">
                <div className="staff-decision-title">
                  <CheckIcon width={16} height={16} />
                  <span>Track approved and published to catalog</span>
                </div>
                <small className="staff-decision-meta">
                  Reviewed by <b>Content Moderator</b> on {formatDate(track.reviewedAt || track.createdAt)}
                </small>
              </div>
            )}

            {isPending && (
              <div className="staff-decision-summary is-pending" style={{ background: "#fefce8", borderColor: "#fde047", color: "#854d0e" }}>
                <div className="staff-decision-title" style={{ color: "#ca8a04" }}>
                  <ClockIcon width={16} height={16} />
                  <span>Track is currently pending moderation review</span>
                </div>
                <p className="staff-decision-note" style={{ color: "#a16207" }}>
                  Your submission is in the moderation queue. Content moderators will evaluate audio fidelity and copyright status before public release.
                </p>
              </div>
            )}

            {isDraft && (
              <div className="staff-decision-summary" style={{ background: "#f8fafc", borderColor: "#e2e8f0", color: "#475569" }}>
                <div className="staff-decision-title" style={{ color: "#0284c7" }}>
                  <FileTextIcon width={16} height={16} />
                  <span>Draft track — Not yet submitted</span>
                </div>
                <p className="staff-decision-note" style={{ color: "#64748b" }}>
                  This track is currently saved as a private draft. You can edit the audio or metadata and submit it for review when ready.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Track Modal */}
      {editModalOpen && track && createPortal(
        <div className="modal-backdrop" role="presentation" onClick={() => !isProcessing && setEditModalOpen(false)}>
          <div
            className="modal-card modal-card--wide studio-track-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-track-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="studio-modal-heading">
                <span className="studio-modal-heading__icon"><UploadIcon width={20} height={20} /></span>
                <div>
                  <span className="eyebrow">CONTENT STUDIO</span>
                  <h3 id="edit-track-modal-title">Edit track</h3>
                </div>
              </div>
              <button
                className="icon-button"
                onClick={() => setEditModalOpen(false)}
                aria-label="Close edit modal"
                disabled={isProcessing}
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

            <form onSubmit={handleEditSubmit} className="modal-form" noValidate>
              <div className="form-group">
                <label htmlFor="edit-track-title">
                  Title <span style={{ color: "var(--sw-danger, #ef4444)" }}>*</span>
                </label>
                <input
                  id="edit-track-title"
                  type="text"
                  placeholder="For example: Sunset Memories"
                  value={editTitle}
                  aria-invalid={Boolean(formErrors.title)}
                  style={formErrors.title ? { borderColor: "#b42318", background: "#fef3f2" } : {}}
                  onChange={(e) => {
                    setEditTitle(e.target.value);
                    if (formErrors.title) {
                      setFormErrors((prev) => ({ ...prev, title: "" }));
                    }
                  }}
                  disabled={isProcessing}
                />
                {formErrors.title && (
                  <small className="auth-v2-field-error">
                    <AlertIcon width={12} height={12} />
                    {formErrors.title}
                  </small>
                )}
              </div>

              <div className="studio-form-grid studio-form-grid--equal">
                <div className="form-group">
                  <label htmlFor="edit-track-genre">
                    Genre <span style={{ color: "var(--sw-danger, #ef4444)" }}>*</span>
                  </label>
                  <select
                    id="edit-track-genre"
                    value={editGenreId}
                    onChange={(e) => {
                      setEditGenreId(Number(e.target.value));
                      if (formErrors.genre) setFormErrors((prev) => ({ ...prev, genre: "" }));
                    }}
                    style={formErrors.genre ? { borderColor: "#b42318", background: "#fef3f2" } : {}}
                    disabled={isProcessing}
                  >
                    <option value={0}>Select genre...</option>
                    {genres.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.genre && (
                    <small className="auth-v2-field-error">
                      <AlertIcon width={12} height={12} />
                      {formErrors.genre}
                    </small>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="edit-track-album">Album (optional)</label>
                  <select
                    id="edit-track-album"
                    value={editAlbumId}
                    onChange={(e) => setEditAlbumId(e.target.value ? Number(e.target.value) : "")}
                    disabled={isProcessing}
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
                <label htmlFor="edit-track-desc">Description (optional)</label>
                <textarea
                  id="edit-track-desc"
                  placeholder="Brief description or mood of the track"
                  value={editDescription}
                  rows={3}
                  maxLength={2000}
                  onChange={(e) => setEditDescription(e.target.value)}
                  disabled={isProcessing}
                />
              </div>

              <div className="studio-media-grid">
                <MediaUploadField
                  id="edit-audio-file-input"
                  label="Audio file"
                  helperText="MP3, WAV or FLAC · Max 30MB"
                  accept=".mp3,.wav,.flac,audio/mpeg,audio/wav,audio/flac"
                  file={editAudioFile}
                  existingFileLabel={editAudioFileName}
                  error={formErrors.audio}
                  disabled={isProcessing}
                  onFileChange={(file) => {
                    setEditAudioFile(file);
                    if (file) {
                      setEditAudioFileName(file.name);
                      if (formErrors.audio) setFormErrors((prev) => ({ ...prev, audio: "" }));
                    } else {
                      setEditAudioFileName(track.audioUrl ? "Current audio file attached" : "");
                    }
                  }}
                />

                <MediaUploadField
                  id="edit-cover-file-input"
                  label="Cover artwork"
                  helperText="JPG or PNG · Max 5MB"
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                  file={editCoverFile}
                  existingFileLabel={editCoverFileName}
                  error={formErrors.cover}
                  disabled={isProcessing}
                  onFileChange={(file) => {
                    setEditCoverFile(file);
                    if (file) {
                      setEditCoverFileName(file.name);
                      if (formErrors.cover) setFormErrors((prev) => ({ ...prev, cover: "" }));
                    } else {
                      setEditCoverFileName(track.coverUrl ? "Current cover image attached" : "");
                    }
                  }}
                />
              </div>

              <div className="form-group" style={{ marginTop: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <label htmlFor="edit-lyrics-file-input" style={{ margin: 0 }}>
                    Lyrics file (.lrc, .txt - Optional)
                  </label>
                  {editLyricsContent && (
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
                        setEditLyricsContent("");
                        setEditLyricsFileName("");
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
                    id="edit-lyrics-file-input"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const lyricsError = validateLyricsFile(file);
                      if (lyricsError) {
                        setEditLyricsFileName("");
                        setFormErrors((prev) => ({ ...prev, lyrics: lyricsError }));
                        e.target.value = "";
                        return;
                      }
                      void readLyricsFile(file)
                        .then((content) => {
                          setEditLyricsFileName(file.name);
                          setEditLyricsContent(content);
                          setFormErrors((prev) => ({ ...prev, lyrics: "" }));
                        })
                        .catch((error: unknown) => {
                          setEditLyricsFileName("");
                          setFormErrors((prev) => ({
                            ...prev,
                            lyrics: error instanceof Error ? error.message : "Lyrics file could not be read.",
                          }));
                        });
                      e.target.value = "";
                    }}
                    style={{ display: "none" }}
                  />
                  <label htmlFor="edit-lyrics-file-input" className="file-drop-label">
                    <FileTextIcon width={24} height={24} />
                    <span>
                      {editLyricsFileName
                        ? `Selected lyrics: ${editLyricsFileName}`
                        : editLyricsContent
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


              </div>

              <div className="modal-actions studio-track-modal__actions">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setEditModalOpen(false)}
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="button button-primary"
                  disabled={isProcessing}
                >
                  {isProcessing ? "Saving changes..." : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && track && createPortal(
        <div className="modal-backdrop" role="presentation" onClick={() => !isProcessing && setDeleteConfirmOpen(false)}>
          <div className="modal-card modal-card--narrow" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-danger">Delete Track</h3>
              <button className="icon-button" onClick={() => setDeleteConfirmOpen(false)} disabled={isProcessing}>
                <CloseIcon width={18} height={18} />
              </button>
            </div>
            <p style={{ margin: "16px 0", color: "var(--sw-text-secondary)" }}>
              Are you sure you want to permanently delete &quot;<b>{track.title}</b>&quot;? All uploaded audio files, covers, and play stats will be removed and cannot be recovered.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setDeleteConfirmOpen(false)}
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                type="button"
                className="button button-primary"
                style={{ background: "#dc2626", borderColor: "#dc2626" }}
                onClick={handleDeleteConfirm}
                disabled={isProcessing}
              >
                {isProcessing ? "Deleting..." : "Confirm delete"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Submit for Review Modal */}
      {submitModalOpen && track && createPortal(
        <div className="modal-backdrop" role="presentation" onClick={() => !isProcessing && setSubmitModalOpen(false)}>
          <div className="modal-card modal-card--medium" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Submit Track for Moderation Review</h3>
                <p className="modal-subtitle">Track: <b>{track.title}</b></p>
              </div>
              <button className="icon-button" onClick={() => setSubmitModalOpen(false)} disabled={isProcessing}>
                <CloseIcon width={18} height={18} />
              </button>
            </div>
            <form onSubmit={handleSubmitForReview}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="submitter-note-input">Creator Note to Moderator (Optional)</label>
                  <textarea
                    id="submitter-note-input"
                    rows={3}
                    placeholder="Notes on mastering, genre clarification, or credits..."
                    value={submitterNote}
                    onChange={(e) => setSubmitterNote(e.target.value)}
                    disabled={isProcessing}
                  />
                </div>
                <div className="form-group" style={{ marginTop: "12px" }}>
                  <label style={{ display: "flex", alignItems: "flex-start", gap: "8px", cursor: "pointer", fontSize: "13px" }}>
                    <input
                      type="checkbox"
                      checked={submitCopyrightAgreed}
                      onChange={(e) => setSubmitCopyrightAgreed(e.target.checked)}
                      disabled={isProcessing}
                      style={{ marginTop: "3px" }}
                    />
                    <span>
                      I certify that I hold the copyright or necessary licenses for this audio recording and artwork, and agree to SoundWave community terms.
                    </span>
                  </label>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="button button-secondary" onClick={() => setSubmitModalOpen(false)} disabled={isProcessing}>
                  Cancel
                </button>
                <button type="submit" className="button button-primary" disabled={isProcessing || !submitCopyrightAgreed}>
                  {isProcessing ? "Submitting..." : "Submit track"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Withdraw Modal */}
      {withdrawModalOpen && track && createPortal(
        <div className="modal-backdrop" role="presentation" onClick={() => !isProcessing && setWithdrawModalOpen(false)}>
          <div className="modal-card modal-card--narrow" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Withdraw Submission</h3>
              <button className="icon-button" onClick={() => setWithdrawModalOpen(false)} disabled={isProcessing}>
                <CloseIcon width={18} height={18} />
              </button>
            </div>
            <p style={{ margin: "16px 0", color: "var(--sw-text-secondary)" }}>
              Are you sure you want to withdraw &quot;<b>{track.title}</b>&quot; from moderation review? The track will return to <b>Draft</b> status so you can continue editing.
            </p>
            <div className="modal-actions">
              <button type="button" className="button button-secondary" onClick={() => setWithdrawModalOpen(false)} disabled={isProcessing}>
                Keep in review
              </button>
              <button type="button" className="button button-primary" onClick={handleWithdrawSubmission} disabled={isProcessing}>
                {isProcessing ? "Withdrawing..." : "Confirm withdraw"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Rejection Details Modal (UC-20: View Rejection Reason) */}
      <RejectionDetailsModal
        isOpen={rejectionModalOpen}
        details={rejectionModalDetails}
        onClose={() => setRejectionModalOpen(false)}
        onEditTrack={() => {
          setRejectionModalOpen(false);
          openEditModal();
        }}
      />
    </div>
  );
}
