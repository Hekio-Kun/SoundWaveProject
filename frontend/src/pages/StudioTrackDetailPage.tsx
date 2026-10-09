import { useEffect, useRef, useState } from "react";
import { studioApi, type ApiTrack } from "../api/track";
import {
  AlertIcon,
  CheckIcon,
  ClockIcon,
  DiscIcon,
  FileTextIcon,
  PauseIcon,
  PlayIcon,
  ShieldIcon,
  UserIcon,
  VolumeIcon,
} from "../icons";
import type { CurrentUser } from "../types";

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

  // Audio player state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    studioApi
      .getTrackById(trackId)
      .then((data) => {
        if (active) {
          setTrack(data);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load track details.");
          setLoading(false);
        }
      });

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

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      if (playPromiseRef.current) {
        playPromiseRef.current
          .then(() => {
            audioRef.current?.pause();
            setIsPlaying(false);
          })
          .catch(() => {
            setIsPlaying(false);
          });
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
            if (err.name !== "AbortError") {
              console.error("Audio playback error:", err);
            }
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

  return (
    <div className="studio-track-detail-page" style={{ padding: "28px clamp(16px, 3vw, 40px) 60px", maxWidth: "1120px", margin: "0 auto" }}>
      {/* Top Banner */}
      <header className="staff-hero-banner" style={{ marginBottom: "20px" }}>
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

      {/* Main Container */}
      <div className="staff-detail-view-container" style={{ background: "#ffffff", border: "1px solid var(--ops-border, #e2e8f0)", borderRadius: "20px", padding: "24px 28px", boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)" }}>
        {/* Top Breadcrumbs & Back Navigation */}
        <div className="staff-detail-top-nav" style={{ marginBottom: "20px" }}>
          <button
            type="button"
            onClick={() => onNavigate("/studio")}
            className="staff-detail-back-btn"
            title="Back to track list"
          >
            <span className="staff-detail-back-arrow" aria-hidden="true">←</span>
            <span>Back to Queue</span>
          </button>

          <div className="staff-detail-breadcrumbs">
            <span className="staff-crumb-muted">Moderation Queue</span>
            <span className="staff-crumb-sep">/</span>
            <span className="staff-crumb-active">Submission Details #{trackId}</span>
          </div>

          {track ? (
            <span className={`staff-status-chip ${statusClass}`}>
              <i />
              <span>{statusLabel}</span>
            </span>
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

            {/* Lyrics Section (Placeholder maintained as specifically requested) */}
            <div className="staff-lyrics-card">
              <div className="staff-lyrics-header">
                <div className="staff-lyrics-title-group">
                  <span className="staff-lyrics-icon-badge">
                    <FileTextIcon width={17} height={17} />
                  </span>
                  <h4 className="staff-lyrics-heading">Lyrics</h4>
                </div>
              </div>

              <div className="staff-lyrics-empty-state">
                <FileTextIcon width={28} height={28} />
                <div className="staff-lyrics-empty-text">
                  <strong>No lyrics provided</strong>
                  <span>The uploader did not attach lyrics for this release.</span>
                </div>
              </div>
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

            {isRejected && (
              <div className="staff-decision-summary is-rejected">
                <div className="staff-decision-title">
                  <AlertIcon width={16} height={16} />
                  <span>Track submission was rejected</span>
                </div>
                {track.latestRejectionReason ? (
                  <p className="staff-decision-reason">
                    <b>Rejection Reason:</b> {track.latestRejectionReason}
                  </p>
                ) : null}
                {track.reviewerNote ? (
                  <p className="staff-decision-note">
                    <b>Reviewer Note:</b> {track.reviewerNote}
                  </p>
                ) : null}
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
    </div>
  );
}
