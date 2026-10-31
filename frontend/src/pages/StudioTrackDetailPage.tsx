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
import { usePlayer } from "../context/PlayerContext";
import { MediaUploadField } from "../components/common/MediaUploadField";
import { RejectionDetailsModal } from "../components/modals/RejectionDetailsModal";
import { UpdateLyricModal } from "../components/modals/UpdateLyricModal";
import { CenterNotificationPopup } from "../components/modals/CenterNotificationPopup";
import {
  AlertIcon,
  CheckIcon,
  ClockIcon,
  CloseIcon,
  DiscIcon,
  EditIcon,
  EyeIcon,
  FileTextIcon,
  HeadphonesIcon,
  PauseIcon,
  PlayIcon,
  ShieldIcon,
  TrashIcon,
  UploadIcon,
  UserIcon,
  VolumeIcon,
} from "../icons";
import type { CurrentUser, LandingTrack } from "../types";
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

function studioApiTrackToLanding(track: ApiTrack, currentUser: CurrentUser | null): LandingTrack {
  return {
    id: track.id,
    title: track.title,
    coverUrl: track.coverUrl || "/soundwave-logo.png",
    audioUrl: track.audioUrl,
    durationMs: track.durationMs || 0,
    playCount: track.playCount || 0,
    slug: track.slug,
    publicationStatus: track.status,
    genreSlug: track.genreSlug,
    genreName: track.genreName,
    description: track.description,
    createdAt: track.createdAt,
    lyrics: track.lyrics,
    creator: {
      userId: currentUser?.id || 0,
      displayName: currentUser?.displayName || currentUser?.email || "Creator",
      avatarUrl: currentUser?.avatarUrl || null,
    },
    album: track.albumId
      ? {
          id: track.albumId,
          title: track.albumTitle || "Album",
        }
      : undefined,
  };
}

type Props = {
  trackId: number;
  currentUser: CurrentUser | null;
  onNavigate: (route: string) => void;
  currentTrack?: LandingTrack | null;
  playing?: boolean;
  onPlayTrack?: (track: LandingTrack) => void;
  audio?: HTMLAudioElement;
  onPlayingChange?: (playing: boolean) => void;
};

export function StudioTrackDetailPage({
  trackId,
  currentUser,
  onNavigate,
  currentTrack,
  playing = false,
  onPlayTrack,
  audio,
}: Props) {
  const [track, setTrack] = useState<ApiTrack | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const player = usePlayer();
  const activeCurrentTrack = currentTrack ?? player.currentTrack;
  const isPlayingGlobal = playing ?? player.playing;
  const activeAudio = audio ?? player.audio;
  const handlePlayTrack = onPlayTrack ?? player.playTrack;

  // Audio player state - synchronized with global player
  const isCurrentTrack = Boolean(
    activeCurrentTrack && track && Number(activeCurrentTrack.id) === Number(track.id)
  );
  const isPlayingThis = Boolean(isCurrentTrack && isPlayingGlobal);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(() => (track?.durationMs ? track.durationMs / 1000 : 0));
  const [volume, setVolume] = useState(() => (activeAudio && Number.isFinite(activeAudio.volume) ? activeAudio.volume : 0.8));

  // Modals
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
      setActionError(null);
      const details = await studioApi.getRejectionDetails(track.id);
      setRejectionModalDetails(details);
      setRejectionModalOpen(true);
    } catch (err: unknown) {
      setActionError(
        err instanceof Error && err.message
          ? err.message
          : "Track not found or access denied."
      );
      setRejectionModalOpen(false);
    }
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
  const [updateLyricModalOpen, setUpdateLyricModalOpen] = useState(false);

  useModalScrollLock(deleteConfirmOpen || submitModalOpen || withdrawModalOpen || rejectionModalOpen);

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

        return () => {
      active = false;
    };
  }, [trackId]);

  useEffect(() => {
    try {
      const flash = sessionStorage.getItem("soundwave_flash_toast");
      if (flash) {
        sessionStorage.removeItem("soundwave_flash_toast");
        const parsed = JSON.parse(flash);
        if (parsed?.message) {
          setActionSuccess(parsed.message);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Synchronize duration when track metadata is loaded
  useEffect(() => {
    if (track?.durationMs) {
      setDuration(track.durationMs / 1000);
    }
  }, [track?.durationMs]);

  // Synchronize volume with global audio at all times
  useEffect(() => {
    if (!activeAudio) return;
    const handleVolumeUpdate = () => {
      setVolume(activeAudio.volume);
    };
    activeAudio.addEventListener("volumechange", handleVolumeUpdate);
    setVolume(activeAudio.volume);
    return () => {
      activeAudio.removeEventListener("volumechange", handleVolumeUpdate);
    };
  }, [activeAudio]);

  // Synchronize playback timeline with global audio
  useEffect(() => {
    if (!activeAudio) return;
    if (!isCurrentTrack) {
      setCurrentTime(0);
      setDuration(track?.durationMs ? track.durationMs / 1000 : 0);
      return;
    }

    const handleTimeUpdate = () => {
      setCurrentTime(activeAudio.currentTime);
      if (activeAudio.duration && !isNaN(activeAudio.duration)) {
        setDuration(activeAudio.duration);
      }
    };

    const handleLoadedMetadata = () => {
      if (activeAudio.duration && !isNaN(activeAudio.duration)) {
        setDuration(activeAudio.duration);
      }
    };

    activeAudio.addEventListener("timeupdate", handleTimeUpdate);
    activeAudio.addEventListener("loadedmetadata", handleLoadedMetadata);

    setCurrentTime(activeAudio.currentTime);
    if (activeAudio.duration && !isNaN(activeAudio.duration)) {
      setDuration(activeAudio.duration);
    }

    return () => {
      activeAudio.removeEventListener("timeupdate", handleTimeUpdate);
      activeAudio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [activeAudio, isCurrentTrack, track?.durationMs]);

  // Close modals on Escape key (Rule 4.7)
  useEffect(() => {
    const hasAnyModal = deleteConfirmOpen || submitModalOpen || withdrawModalOpen;
    if (!hasAnyModal || isProcessing) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDeleteConfirmOpen(false);
        setSubmitModalOpen(false);
        setWithdrawModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deleteConfirmOpen, submitModalOpen, withdrawModalOpen, isProcessing]);

  // Player controls
  const togglePlay = () => {
    if (!track) return;
    if (!track.audioUrl) {
      setActionError("Audio file is not available for this track.");
      return;
    }
    const landing = studioApiTrackToLanding(track, currentUser);
    if (isCurrentTrack) {
      player.setAudioPlaying(!isPlayingGlobal);
    } else {
      handlePlayTrack(landing);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = Number(e.target.value);
    setCurrentTime(target);
    if (isCurrentTrack && activeAudio) {
      activeAudio.currentTime = target;
    } else if (track) {
      const landing = studioApiTrackToLanding(track, currentUser);
      handlePlayTrack(landing);
      if (activeAudio) {
        activeAudio.currentTime = target;
      }
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (activeAudio) {
      activeAudio.volume = val;
    }
  };

  const maxSeekTime = duration || (track?.durationMs ? track.durationMs / 1000 : 100);

  // Status computation
  const rawStatus = track?.status || "DRAFT";
  const isApproved = rawStatus === "APPROVED" || rawStatus === "PUBLISHED";
  const isPending = rawStatus === "PENDING";
  const isRejected = rawStatus === "REJECTED" || rawStatus === "TAKEN_DOWN";
  const isDraft = rawStatus === "DRAFT";
  const canDelete = isDraft || isRejected || isApproved;

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

  const submitterName = currentUser?.displayName || currentUser?.username || "Creator";
  const submitterEmail = currentUser?.email || "creator@soundwave.io";
  const submitterUsername = currentUser?.username || currentUser?.email?.split("@")[0] || "creator";

  // Actions
  const handleDeleteConfirm = async () => {
    if (!track) return;
    try {
      setIsProcessing(true);
      setModalError(null);
      setActionError(null);
      const isPublished = track.status === "PUBLISHED" || track.status === "APPROVED";
      await studioApi.deleteTrack(track.id);
      setDeleteConfirmOpen(false);
      // [FEATURE]: UC-19: Delete An Owned Track (POST-5)
      // Lưu flash message vào sessionStorage để hiển thị khi điều hướng về danh sách bài hát
      sessionStorage.setItem(
        "soundwave_flash_toast",
        JSON.stringify({
          message: isPublished
            ? "Track taken down and removed from your active library successfully."
            : "Track deleted successfully.",
          type: "success",
        })
      );
      onNavigate("/track");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete track.";
      setModalError(msg);
      setActionError(msg);
      setTimeout(() => {
        setActionError((curr) => (curr === msg ? null : curr));
      }, 6000);
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
              <HeadphonesIcon width={13} height={13} />
              <span>CREATOR STUDIO</span>
            </span>
          </div>

          <h1 className="staff-hero-title">Track Submission Details</h1>

          <p className="staff-hero-description">
            Manage your audio track details, inspect moderation status, or update submission assets.
          </p>
        </div>
      </header>

      {/* Action Alerts */}
      {actionSuccess ? (
        <CenterNotificationPopup
          open={Boolean(actionSuccess)}
          type="success"
          message={actionSuccess}
          onClose={() => setActionSuccess(null)}
        />
      ) : null}

      {actionError ? (
        <div
          className="form-error-banner"
          role="alert"
          style={{ marginBottom: "16px", cursor: "pointer" }}
          onClick={() => setActionError(null)}
          title="Click to dismiss"
        >
          <AlertIcon width={16} height={16} />
          <span>{actionError}</span>
          <span style={{ marginLeft: "auto", fontSize: "14px", fontWeight: 700, padding: "0 4px", opacity: 0.7 }}>✕</span>
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
              {/* [FEATURE]: Breadcrumb điều hướng quay về trang danh sách bài hát cá nhân (/track) */}
              <span
                className="staff-crumb-muted"
                style={{ cursor: "pointer" }}
                onClick={() => onNavigate("/track")}
                title="Back to My Tracks"
              >
                My Tracks
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
                  title="View staff rejection reason & feedback"
                  style={{
                    backgroundColor: "#fee4e2",
                    color: "#b42318",
                    borderColor: "#fecdca",
                  }}
                >
                  <AlertIcon width={13} height={13} />
                  <span>Rejection feedback</span>
                </button>
              )}


              {/* 2. Delete button - only allowed for DRAFT, REJECTED, PUBLISHED */}
              {canDelete && (
                <button
                  type="button"
                  className="studio-crud-btn studio-crud-btn-delete"
                  onClick={() => {
                    setModalError(null);
                    setDeleteConfirmOpen(true);
                  }}
                  title="Delete this track"
                >
                  <TrashIcon width={13} height={13} />
                  <span>Delete</span>
                </button>
              )}

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
                  <span>{isRejected ? "Resubmit for review" : "Submit for review"}</span>
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

              {isApproved && (!track.lyrics || !track.lyrics.trim()) && (
                <button
                  type="button"
                  className="studio-crud-btn studio-crud-btn-edit"
                  onClick={() => setUpdateLyricModalOpen(true)}
                  style={{
                    backgroundColor: "#f0f9ff",
                    color: "var(--color-ocean-primary, #0284C7)",
                    borderColor: "#bae6fd",
                  }}
                  title="Update lyrics for this published track"
                >
                  <EditIcon width={13} height={13} />
                  <span>Update Lyric</span>
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
                  src={track.coverUrl || "/soundwave-logo.png"}
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
                  <div className="staff-player-controls-row">
                    <button
                      type="button"
                      onClick={togglePlay}
                      className={`staff-player-main-btn ${isPlayingThis ? "is-playing" : ""}`}
                      title={isPlayingThis ? "Pause audio stream" : "Play audio stream"}
                      aria-label={isPlayingThis ? "Pause audio stream" : "Play audio stream"}
                    >
                      {isPlayingThis ? (
                        <PauseIcon width={18} height={18} />
                      ) : (
                        <PlayIcon width={18} height={18} />
                      )}
                    </button>

                    {/* Equalizer animation bars while playing */}
                    <div className={`staff-equalizer-bars ${isPlayingThis ? "is-active" : ""}`}>
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
                        step={0.01}
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
                <small>CREATOR / SUBMITTER</small>
                <strong>{submitterName}</strong>
              </div>
              <div className="staff-matrix-cell">
                <small>ACCOUNT EMAIL</small>
                <strong>{submitterEmail}</strong>
              </div>
              <div className="staff-matrix-cell">
                <small>CREATOR USERNAME</small>
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
                  Reviewed by <b>Staff</b> on {formatDate(track.reviewedAt || track.createdAt)}
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
                  Your submission is in the moderation queue. Staff members will evaluate audio fidelity and copyright status before public release.
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
      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && track && createPortal(
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => {
            if (!isProcessing) {
              setDeleteConfirmOpen(false);
              setModalError(null);
            }
          }}
        >
          <div className="modal-card modal-card--narrow" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-danger">Delete Track</h3>
              <button
                className="icon-button"
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setModalError(null);
                }}
                disabled={isProcessing}
              >
                <CloseIcon width={18} height={18} />
              </button>
            </div>

            {modalError && (
              <div
                className="form-error-banner"
                role="alert"
                style={{ marginTop: "12px", marginBottom: "6px" }}
              >
                <AlertIcon width={16} height={16} />
                <span>{modalError}</span>
              </div>
            )}

            <p style={{ margin: "16px 0", color: "var(--sw-text-secondary)" }}>
              {track.status === "PUBLISHED" || track.status === "APPROVED" ? (
                <>
                  Are you sure you want to take down &quot;<b>{track.title}</b>&quot;? Public playback will be revoked and media assets purged from cloud storage, while historical play analytics will be preserved.
                </>
              ) : (
                <>
                  Are you sure you want to permanently delete &quot;<b>{track.title}</b>&quot;? This track and its media files will be permanently removed and cannot be recovered.
                </>
              )}
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="button button-secondary"
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setModalError(null);
                }}
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
                {isProcessing
                  ? "Processing..."
                  : track.status === "PUBLISHED" || track.status === "APPROVED"
                  ? "Confirm take down"
                  : "Confirm delete"}
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
                <h3>{isRejected ? "Resubmit Track for Moderation Review" : "Submit Track for Moderation Review"}</h3>
                <p className="modal-subtitle">Track: <b>{track.title}</b></p>
              </div>
              <button type="button" className="icon-button" onClick={() => setSubmitModalOpen(false)} disabled={isProcessing} aria-label="Close dialog">
                <CloseIcon width={18} height={18} />
              </button>
            </div>
            <form onSubmit={handleSubmitForReview} noValidate>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="submitter-note-input">Creator Note to Staff (Optional)</label>
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
                  {isProcessing ? (isRejected ? "Resubmitting..." : "Submitting...") : (isRejected ? "Resubmit track" : "Submit track")}
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
              <button type="button" className="icon-button" onClick={() => setWithdrawModalOpen(false)} disabled={isProcessing} aria-label="Close dialog">
                <CloseIcon width={18} height={18} />
              </button>
            </div>
            <p style={{ margin: "16px 0", color: "var(--sw-text-secondary)" }}>
              Are you sure you want to withdraw &quot;<b>{track.title}</b>&quot; from moderation review? The track will return to <b>Draft</b> status.
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
          if (track) {
            onNavigate(`/studio/tracks/${track.id}/edit`);
          }
        }}
      />

      {/* Update Lyric Modal */}
      {updateLyricModalOpen && track && (
        <UpdateLyricModal
          open={updateLyricModalOpen}
          onClose={() => setUpdateLyricModalOpen(false)}
          track={track}
          onSuccess={(updatedTrack) => {
            setTrack(updatedTrack);
            setUpdateLyricModalOpen(false);
            setActionSuccess(`Lyrics updated successfully for "${updatedTrack.title}".`);
          }}
        />
      )}

      {actionSuccess && (
        <CenterNotificationPopup
          open={Boolean(actionSuccess)}
          type="success"
          message={actionSuccess}
          onClose={() => setActionSuccess(null)}
        />
      )}

      {actionError && (
        <CenterNotificationPopup
          open={Boolean(actionError)}
          type="error"
          message={actionError}
          onClose={() => setActionError(null)}
        />
      )}
    </div>
  );
}
