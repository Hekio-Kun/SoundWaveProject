import { useEffect, useMemo, useRef, useState } from "react";
import {
  moderationApi,
  type SubmissionDetail,
} from "../../api/moderation";
import { lyricsApi } from "../../api/lyrics";
import {
  AlertIcon,
  ArrowIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  CloseIcon,
  DiscIcon,
  FileTextIcon,
  HeadphonesIcon,
  PauseIcon,
  PlayIcon,
  UserIcon,
  VolumeIcon,
} from "../../icons";
import { parseLyricsToLines, formatTimeDisplay } from "../common/LyricSyncTab";
import { CenterNotificationPopup } from "../modals/CenterNotificationPopup";

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

// Parse timestamp [mm:ss.xx] or [mm:ss] into seconds
function parseTimestampToSeconds(line: string): number | null {
  const match = line.match(/\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/);
  if (!match) return null;
  const minutes = parseInt(match[1], 10);
  const seconds = parseInt(match[2], 10);
  const fractionStr = match[3];
  let fraction = 0;
  if (fractionStr) {
    fraction = fractionStr.length === 2 ? parseInt(fractionStr, 10) / 100 : parseInt(fractionStr, 10) / 1000;
  }
  return minutes * 60 + seconds + fraction;
}

type ParsedLyricLine = {
  lineNumber: number;
  raw: string;
  tsMatch: string | null;
  tsSeconds: number | null;
  text: string;
};

const PRESET_REASONS = [
  "Audio clipping or severe distortion detected in master stream.",
  "Incomplete or placeholder metadata (title, artist or artwork).",
  "Unlicensed sample, beat, or suspected copyright infringement.",
  "Audio file corrupted or encoding does not meet platform standards.",
];

type Props = {
  submissionId: number;
  onBack: () => void;
  onApproveSuccess?: (message?: string) => void;
  onRejectSuccess?: (message?: string) => void;
  onNavigateToSubmission?: (submissionId: number) => void;
};

export function PendingTrackDetailView({
  submissionId,
  onBack,
  onApproveSuccess,
  onRejectSuccess,
  onNavigateToSubmission,
}: Props) {
  const [detail, setDetail] = useState<SubmissionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Audio playback ref and play-promise tracker to prevent race conditions
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);

  // Moderation Action states
  const [actionType, setActionType] = useState<"APPROVE" | "REJECT" | null>(null);
  const [approveNote, setApproveNote] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Lyrics inspection state
  const [trackLyrics, setTrackLyrics] = useState<string | null>(null);
  const [copiedLyrics, setCopiedLyrics] = useState(false);
  const activeLineRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const isUserScrollingRef = useRef<boolean>(false);
  const isProgrammaticScrollRef = useRef<boolean>(false);
  const scrollTimeoutRef = useRef<number | null>(null);

  // Floating Toast Notification
  const [internalToast, setInternalToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showInternalToast = (message: string, type: "success" | "error" = "success") => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    setInternalToast({ message, type });
    toastTimerRef.current = window.setTimeout(() => {
      setInternalToast(null);
      toastTimerRef.current = null;
    }, 3500);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  // Sync lyrics from submission or lyricsApi
  useEffect(() => {
    const tid = detail?.track?.id;
    if (!tid) return;

    if (detail.track.lyrics) {
      setTrackLyrics(detail.track.lyrics);
    }

    lyricsApi
      .getTrackLyrics(tid)
      .then((bundle) => {
        const content =
          bundle?.officialLyric?.lyricContent ||
          bundle?.userPersonalLyric?.lyricContent;
        if (content) {
          setTrackLyrics(content);
        }
      })
      .catch(() => {
        lyricsApi
          .getStaffOfficialLyric(tid)
          .then((res) => {
            if (res?.lyricContent) setTrackLyrics(res.lyricContent);
          })
          .catch(() => {});
      });
  }, [detail?.track?.id, detail?.track?.lyrics]);

  const handleCopyLyrics = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLyrics(true);
      setTimeout(() => setCopiedLyrics(false), 2000);
    } catch {
      // Fallback if clipboard API is restricted
    }
  };

  const parsedActiveLines = useMemo(() => {
    if (!trackLyrics) return [];
    try {
      return parseLyricsToLines(trackLyrics);
    } catch {
      return [];
    }
  }, [trackLyrics]);

  const hasTimestamps = useMemo(
    () => parsedActiveLines.some((l) => l.timeSec !== null),
    [parsedActiveLines]
  );

  const activeLineIndex = useMemo(() => {
    if (!hasTimestamps || parsedActiveLines.length === 0) return -1;
    let idx = -1;
    for (let i = 0; i < parsedActiveLines.length; i++) {
      const lineTime = parsedActiveLines[i].timeSec;
      if (lineTime !== null && currentTime >= lineTime) {
        idx = i;
      }
    }
    return idx;
  }, [parsedActiveLines, currentTime, hasTimestamps]);

  const totalAlbumDurationMs = useMemo(() => {
    if (!detail?.albumNavigation?.tracks) return 0;
    return detail.albumNavigation.tracks.reduce((sum, t) => sum + (t.durationMs || 0), 0);
  }, [detail?.albumNavigation?.tracks]);

  const albumProgressStats = useMemo(() => {
    if (!detail?.albumNavigation?.tracks) {
      return { total: 0, approved: 0, rejected: 0, pending: 0, processed: 0, percent: 0 };
    }
    const tracks = detail.albumNavigation.tracks;
    const total = tracks.length;
    const approved = tracks.filter((t) => t.status === "APPROVED").length;
    const rejected = tracks.filter((t) => t.status === "REJECTED").length;
    const pending = tracks.filter((t) => !t.status || t.status === "PENDING").length;
    const processed = approved + rejected;
    const percent = total > 0 ? Math.round((processed / total) * 100) : 0;
    return { total, approved, rejected, pending, processed, percent };
  }, [detail?.albumNavigation?.tracks]);

  // Auto-scroll active line strictly within lyrics container without scrolling whole page
  useEffect(() => {
    if (
      activeLineIndex >= 0 &&
      activeLineRef.current &&
      scrollContainerRef.current &&
      !isUserScrollingRef.current
    ) {
      const container = scrollContainerRef.current;
      const activeLine = activeLineRef.current;

      const lineRect = activeLine.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const relativeTop = lineRect.top - containerRect.top;
      const targetScrollTop =
        container.scrollTop +
        relativeTop -
        container.clientHeight / 2 +
        lineRect.height / 2;

      isProgrammaticScrollRef.current = true;
      container.scrollTo({
        top: Math.max(0, targetScrollTop),
        behavior: "smooth",
      });

      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = window.setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 450);
    }
  }, [activeLineIndex]);

  const handleLyricsScroll = () => {
    if (isProgrammaticScrollRef.current) return;
    isUserScrollingRef.current = true;
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = window.setTimeout(() => {
      isUserScrollingRef.current = false;
    }, 2500);
  };

  const handleLineClick = (timeSec: number | null) => {
    if (timeSec === null || !audioRef.current) return;
    audioRef.current.currentTime = timeSec;
    setCurrentTime(timeSec);
    if (!isPlaying) {
      const promise = audioRef.current.play();
      if (promise !== undefined) {
        playPromiseRef.current = promise;
        promise
          .then(() => setIsPlaying(true))
          .catch(() => {});
      }
    }
  };

  // Fetch track submission detail safely
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    setActionType(null);
    setApproveNote("");
    setRejectionReason("");
    setActionError(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    moderationApi
      .getSubmissionDetail(submissionId)
      .then((data) => {
        if (isMounted) {
          setDetail(data);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load submission details.");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
      // Safely pause audio during unmount
      if (audioRef.current) {
        if (playPromiseRef.current) {
          playPromiseRef.current
            .then(() => {
              audioRef.current?.pause();
            })
            .catch(() => {
              // Ignore aborted play promise on cleanup
            });
        } else {
          audioRef.current.pause();
        }
      }
    };
  }, [submissionId]);

  // Safe Play/Pause toggle
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
          .then(() => {
            setIsPlaying(true);
          })
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
    const targetTime = Number(e.target.value);
    setCurrentTime(targetTime);
    if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = Number(e.target.value);
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
  };

  const handleJumpToTimestamp = (seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = seconds;
    setCurrentTime(seconds);
    if (!isPlaying) {
      const promise = audioRef.current.play();
      if (promise !== undefined) {
        playPromiseRef.current = promise;
        promise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err: Error) => {
            if (err.name !== "AbortError") {
              console.error("Audio playback error:", err);
            }
            setIsPlaying(false);
          });
      }
    }
  };

  const handleApprove = async () => {
    if (!detail) return;
    setSubmittingAction(true);
    setActionError(null);
    try {
      const updated = await moderationApi.approveSubmission(detail.id, approveNote.trim() || undefined);
      if (audioRef.current) audioRef.current.pause();
      setDetail(updated);
      setActionType(null);

      const isAlbumFinished = Boolean(
        updated.albumNavigation && !updated.albumNavigation.nextPendingSubmissionId
      );

      const finalMsg = isAlbumFinished
        ? "All tracks in album have been reviewed."
        : detail.submissionType === "LYRIC_UPDATE"
        ? "Lyric update approved successfully."
        : "Track approved successfully.";

      try {
        sessionStorage.setItem(
          "soundwave_flash_toast",
          JSON.stringify({ message: finalMsg, type: "success" })
        );
      } catch {
        // ignore
      }

      showInternalToast(finalMsg, "success");
      onApproveSuccess?.(finalMsg);

      const nextPendingId = updated.albumNavigation?.nextPendingSubmissionId;
      if (nextPendingId && onNavigateToSubmission) {
        onNavigateToSubmission(nextPendingId);
      } else {
        onBack();
      }
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Failed to approve track.");
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleReject = async () => {
    if (!detail) return;
    if (rejectionReason.trim().length < 10) {
      setActionError("Rejection reason must be at least 10 characters.");
      return;
    }
    setSubmittingAction(true);
    setActionError(null);
    try {
      const updated = await moderationApi.rejectSubmission(
        detail.id,
        rejectionReason.trim()
      );
      if (audioRef.current) audioRef.current.pause();
      setDetail(updated);
      setActionType(null);

      const isAlbumFinished = Boolean(
        updated.albumNavigation && !updated.albumNavigation.nextPendingSubmissionId
      );

      const finalMsg = isAlbumFinished
        ? "All tracks in album have been reviewed."
        : detail.submissionType === "LYRIC_UPDATE"
        ? "Lyric update rejected successfully."
        : "Track rejected successfully.";

      try {
        sessionStorage.setItem(
          "soundwave_flash_toast",
          JSON.stringify({ message: finalMsg, type: "success" })
        );
      } catch {
        // ignore
      }

      showInternalToast(finalMsg, "success");
      onRejectSuccess?.(finalMsg);

      const nextPendingId = updated.albumNavigation?.nextPendingSubmissionId;
      if (nextPendingId && onNavigateToSubmission) {
        onNavigateToSubmission(nextPendingId);
      } else {
        onBack();
      }
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Failed to reject track.");
    } finally {
      setSubmittingAction(false);
    }
  };

  const maxSeekTime = duration || (detail?.track.durationMs ? detail.track.durationMs / 1000 : 100);

  return (
    <div className="staff-detail-view-container">
      {/* SoundWave Standard Top-Center Toast Notification */}
      <CenterNotificationPopup
        open={Boolean(internalToast)}
        type={internalToast?.type ?? "success"}
        message={internalToast?.message ?? ""}
        durationMs={3000}
        onClose={() => setInternalToast(null)}
      />

      {/* Top Breadcrumb & Navigation Bar */}
      <div className="staff-detail-top-nav">
        <button
          type="button"
          onClick={onBack}
          className="staff-detail-back-btn"
          title="Back to queue list"
        >
          <span className="staff-detail-back-arrow" aria-hidden="true">←</span>
          <span>Back to Queue</span>
        </button>

        <div className="staff-detail-breadcrumbs">
          <span className="staff-crumb-muted">Moderation Queue</span>
          <span className="staff-crumb-sep">/</span>
          {detail?.albumNavigation ? (
            <>
              <span className="staff-crumb-muted">{detail.albumNavigation.albumTitle}</span>
              <span className="staff-crumb-sep">/</span>
              <span className="staff-crumb-active">
                Track #{detail.track.trackNumber ?? detail.albumNavigation.currentIndex}: {detail.track.title}
              </span>
            </>
          ) : (
            <span className="staff-crumb-active">{detail ? detail.track.title : "Submission Details"}</span>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="staff-inspector-loading" aria-busy="true" aria-live="polite">
          <div className="staff-inspector-spinner" />
          <span>Loading track submission metadata and audio stream...</span>
        </div>
      ) : error ? (
        <div className="staff-inspector-error" role="alert">
          <AlertIcon width={36} height={36} />
          <b>Failed to load submission details</b>
          <p>{error}</p>
          <button
            type="button"
            className="button button-ghost button-small"
            onClick={onBack}
          >
            Back to Queue
          </button>
        </div>
      ) : detail ? (
        <div className="staff-detail-content-body">
          {/* Lyric Update Notice Banner (UC-24.6) */}
          {detail.submissionType === "LYRIC_UPDATE" ? (
            <div style={{
              padding: "14px 18px",
              background: "#F0F9FF",
              border: "1px solid #BAE6FD",
              borderRadius: "14px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}>
              <FileTextIcon width={22} height={22} style={{ color: "#0284C7", flexShrink: 0 }} />
              <div style={{ fontSize: "13px", color: "#0369A1", lineHeight: "1.5" }}>
                <strong>Lyric Update Moderation:</strong> The creator submitted updated synchronized lyrics for this already published song. Making a decision here only modifies the song's official lyrics; the song remains published and streamable without interruption.
              </div>
            </div>
          ) : null}

          {/* Status & Submission Metadata Banner */}
          <div className="staff-inspector-status-banner">
            <div className="staff-status-group">
              <span className="staff-status-label">Submission Status:</span>
              <span
                className={`staff-status-chip ${detail.status === "APPROVED"
                    ? "is-approved"
                    : detail.status === "REJECTED"
                      ? "is-rejected"
                      : "is-pending"
                  }`}
              >
                <i />
                <span>
                  {detail.status === "APPROVED"
                    ? "Approved & Published"
                    : detail.status === "REJECTED"
                      ? "Rejected"
                      : "Pending Review"}
                </span>
              </span>
            </div>

            <div className="staff-time-group">
              <ClockIcon width={13} height={13} />
              <span>Submitted: <b>{formatDate(detail.submittedAt)}</b></span>
            </div>
          </div>

          {/* Main Layout Grid: Split layout when albumNavigation exists, otherwise single flow */}
          <div className={detail.albumNavigation ? "staff-detail-layout-split" : "staff-detail-layout-single"}>
            <div className="staff-detail-main-flow">
              {/* Hero Card & Integrated Stream Player (Spacious Full-Width) */}
          <div className="staff-inspector-hero-card staff-detail-hero-card">
            <div className="staff-hero-artwork-wrap staff-detail-artwork-wrap">
              <img
                src={
                  detail.track.coverUrl ||
                  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400"
                }
                alt={detail.track.title}
                className="staff-hero-artwork"
              />
            </div>

            <div className="staff-hero-info-col">
              <div className="staff-hero-badge-row" style={{ gap: "10px", marginBottom: "14px" }}>
                <span
                  className="staff-meta-pill is-genre"
                  style={{ padding: "6px 14px", fontSize: "0.85rem", fontWeight: 700, borderRadius: "8px" }}
                >
                  {detail.track.genre?.name || "Music"}
                </span>
                {detail.track.album ? (
                  <span
                    className="staff-meta-pill is-album"
                    style={{ padding: "6px 14px", fontSize: "0.85rem", fontWeight: 600, borderRadius: "8px", gap: "6px" }}
                  >
                    <DiscIcon width={14} height={14} />
                    Album: {detail.track.album.title}
                  </span>
                ) : (
                  <span
                    className="staff-meta-pill is-single"
                    style={{ padding: "6px 14px", fontSize: "0.85rem", fontWeight: 600, borderRadius: "8px" }}
                  >
                    Single Release
                  </span>
                )}
                <span
                  className="staff-meta-pill is-format"
                  style={{ padding: "6px 14px", fontSize: "0.85rem", fontWeight: 600, borderRadius: "8px" }}
                >
                  {detail.track.audioFormat.toUpperCase()} · {formatDuration(detail.track.durationMs)}
                </span>
              </div>

              <h2
                className="staff-hero-track-title staff-detail-track-title"
                style={{ fontSize: "1.9rem", fontWeight: 800, margin: "0 0 12px 0", letterSpacing: "-0.025em" }}
              >
                {detail.track.title}
              </h2>

              <p
                className="staff-hero-creator-line"
                style={{ fontSize: "1rem", margin: "0 0 18px 0", display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}
              >
                <UserIcon width={16} height={16} style={{ display: "inline", verticalAlign: "middle", color: "var(--color-ocean-primary, #0284C7)" }} />
                <span>Submitted by:</span>
                <b style={{ color: "#0F172A" }}>{detail.submitter?.displayName || detail.submitter?.email}</b>
                {detail.submitter?.email ? (
                  <span className="staff-creator-email" style={{ color: "#64748B", fontWeight: 400, marginLeft: "4px" }}>
                    ({detail.submitter.email})
                  </span>
                ) : null}
              </p>

              {/* Built-in High-Fidelity Audio Studio Player */}
              <div className="staff-audio-studio-player staff-detail-audio-player">
                <audio
                  ref={audioRef}
                  src={detail.track.audioUrl}
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

                  {/* Timeline Seekbar with full accessibility attributes */}
                  <div className="staff-player-seek-wrap">
                    <div className="staff-player-times">
                      <span className="staff-time-current">{formatSeconds(currentTime)}</span>
                      <span className="staff-time-total">
                        {formatSeconds(
                          duration || (detail.track.durationMs ? detail.track.durationMs / 1000 : 0)
                        )}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={maxSeekTime}
                      value={currentTime}
                      onChange={handleSeek}
                      className="staff-player-slider-bar"
                      aria-label="Seek track position"
                      aria-valuemin={0}
                      aria-valuemax={maxSeekTime}
                      aria-valuenow={currentTime}
                      aria-valuetext={`${formatSeconds(currentTime)} of ${formatSeconds(maxSeekTime)}`}
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
                      aria-valuemin={0}
                      aria-valuemax={1}
                      aria-valuenow={volume}
                      aria-valuetext={`${Math.round(volume * 100)}%`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description if provided */}
          {detail.track.description ? (
            <div className="staff-desc-box">
              <small>Track Description</small>
              <p>{detail.track.description}</p>
            </div>
          ) : null}

          {/* Synchronous Lyrics Section */}
          <section className="track-lyrics-panel" style={{ marginBottom: "20px" }}>
            <header
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
                padding: "16px 22px",
                borderBottom: "1px solid #f0f2f5",
                background: "linear-gradient(180deg, #ffffff 0%, #fbfcfd 100%)",
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div className="track-section-icon">
                  <FileTextIcon width={18} height={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "#1c1917" }}>
                    Lyrics
                  </h3>
                </div>
              </div>

              {trackLyrics ? (
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <button
                    type="button"
                    className="button button-ghost button-small"
                    onClick={() => void handleCopyLyrics(trackLyrics)}
                    title="Copy lyrics"
                  >
                    {copiedLyrics ? "Copied!" : "Copy Lyrics"}
                  </button>
                </div>
              ) : null}
            </header>

            {trackLyrics ? (
              hasTimestamps ? (
                <div
                  ref={scrollContainerRef}
                  onScroll={handleLyricsScroll}
                  onWheel={handleLyricsScroll}
                  onTouchMove={handleLyricsScroll}
                  className="track-lyrics-synced-list"
                  style={{ maxHeight: "420px", overflowY: "auto", position: "relative" }}
                >
                  {parsedActiveLines.map((line, idx) => {
                    const isActive = idx === activeLineIndex;
                    return (
                      <div
                        key={line.id}
                        ref={isActive ? activeLineRef : null}
                        className={`track-lyrics-synced-item ${isActive ? "is-active-line" : ""}`}
                        onClick={() => handleLineClick(line.timeSec)}
                        role={line.timeSec !== null ? "button" : undefined}
                        tabIndex={line.timeSec !== null ? 0 : undefined}
                        onKeyDown={(e) => {
                          if (line.timeSec !== null && (e.key === "Enter" || e.key === " ")) {
                            e.preventDefault();
                            handleLineClick(line.timeSec);
                          }
                        }}
                        title={
                          line.timeSec !== null
                            ? `Click to jump audio to ${formatTimeDisplay(line.timeSec)}`
                            : undefined
                        }
                      >
                        {line.timeSec !== null ? (
                          <span className="track-lyrics-time-chip">{formatTimeDisplay(line.timeSec)}</span>
                        ) : null}
                        <span className="track-lyrics-text">{line.text || "\u00A0"}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <pre style={{ margin: 0, padding: "24px", whiteSpace: "pre-wrap", color: "#344054", fontSize: "0.95rem", lineHeight: 1.8 }}>
                  {trackLyrics}
                </pre>
              )
            ) : (
              <div className="track-lyrics-empty" style={{ minHeight: "180px", padding: "28px 20px" }}>
                <FileTextIcon width={32} height={32} />
                <strong>No official lyrics available</strong>
                <span>No synchronized lyrics have been attached to this track yet.</span>
              </div>
            )}
          </section>

          {/* Previous Review History (if already reviewed) */}
          {detail.status !== "PENDING" ? (
            <div
              className={`staff-decision-summary ${detail.status === "APPROVED" ? "is-approved" : "is-rejected"
                }`}
            >
              <div className="staff-decision-title">
                {detail.status === "APPROVED" ? (
                  <>
                    <CheckIcon width={16} height={16} />
                    <span>Track approved and published to catalog</span>
                  </>
                ) : (
                  <>
                    <AlertIcon width={16} height={16} />
                    <span>Track submission was rejected</span>
                  </>
                )}
              </div>

              {detail.rejectionReason ? (
                <p className="staff-decision-reason">
                  <b>Rejection Reason:</b> {detail.rejectionReason}
                </p>
              ) : null}

              {detail.reviewerNote ? (
                <p className="staff-decision-note">
                  <b>Reviewer Note:</b> {detail.reviewerNote}
                </p>
              ) : null}

              <small className="staff-decision-meta">
                Reviewed by <b>{detail.reviewer?.displayName || detail.reviewer?.email || "Staff"}</b> on{" "}
                {formatDate(detail.reviewedAt)}
              </small>
            </div>
          ) : null}

          {/* Moderation Decision Form Section (Buttons moved into detail page) */}
          {detail.status === "PENDING" ? (
            <div className="staff-moderation-decision-area staff-detail-decision-area">
              {actionType === "APPROVE" ? (
                <div className="staff-decision-panel is-approve">
                  <h4 className="staff-decision-panel-title text-success">
                    {detail.submissionType === "LYRIC_UPDATE" ? "Approve Lyric Update" : "Approve & Publish"} “{detail.track.title}”
                  </h4>
                  <p className="staff-decision-panel-desc">
                    {detail.submissionType === "LYRIC_UPDATE" ? (
                      "The proposed lyrics will become the official published lyrics for this track. The track remains PUBLISHED and streamable."
                    ) : (
                      <>The track will immediately change to <strong>PUBLISHED</strong> status and be streamable on SoundWave.</>
                    )}
                  </p>

                  <label className="staff-input-group" htmlFor="detail-approve-note">
                    <span className="staff-input-label">Internal Reviewer Note (Optional)</span>
                    <input
                      id="detail-approve-note"
                      type="text"
                      className="staff-text-input"
                      placeholder="e.g. Master stream balanced, good dynamic range, meets publishing standard..."
                      value={approveNote}
                      onChange={(e) => setApproveNote(e.target.value)}
                      disabled={submittingAction}
                    />
                  </label>

                  {actionError ? (
                    <p className="staff-action-error" role="alert">
                      <AlertIcon width={13} height={13} />
                      <span>{actionError}</span>
                    </p>
                  ) : null}

                  <div className="staff-decision-actions-row">
                    <button
                      type="button"
                      className="button button-ghost"
                      onClick={() => setActionType(null)}
                      disabled={submittingAction}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="button staff-btn-confirm-approve"
                      onClick={() => void handleApprove()}
                      disabled={submittingAction}
                    >
                      {submittingAction ? "Processing..." : detail.submissionType === "LYRIC_UPDATE" ? "Confirm & Approve Lyrics" : "Confirm & Publish Track"}
                    </button>
                  </div>
                </div>
              ) : actionType === "REJECT" ? (
                <div className="staff-decision-panel is-reject">
                  <h4 className="staff-decision-panel-title text-danger">
                    Reject Submission “{detail.track.title}”
                  </h4>
                  <p className="staff-decision-panel-desc">
                    Please provide specific, constructive feedback so the creator understands the defects and can rectify them before resubmitting.
                  </p>

                  {/* Quick Preset Buttons */}
                  <div className="staff-preset-chips-section">
                    <span className="staff-preset-title">Common presets:</span>
                    <div className="staff-preset-chips">
                      {PRESET_REASONS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="staff-preset-btn"
                          onClick={() => setRejectionReason(preset)}
                          disabled={submittingAction}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="staff-input-group" htmlFor="detail-reject-reason">
                    <span className="staff-input-label">
                      Rejection Reason <span className="staff-text-danger">*</span> (Min 10 characters)
                    </span>
                    <textarea
                      id="detail-reject-reason"
                      rows={3}
                      className="staff-textarea"
                      placeholder="Provide specific reasons why this submission does not meet publication criteria..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      disabled={submittingAction}
                      aria-invalid={
                        rejectionReason.trim().length > 0 && rejectionReason.trim().length < 10
                      }
                      aria-describedby="detail-reject-counter"
                    />
                    <span
                      id="detail-reject-counter"
                      className={
                        rejectionReason.trim().length >= 10
                          ? "staff-text-success font-medium"
                          : "staff-text-muted"
                      }
                    >
                      {rejectionReason.trim().length} / 10 minimum characters
                    </span>
                  </label>

                  {actionError ? (
                    <p className="staff-action-error" role="alert">
                      <AlertIcon width={13} height={13} />
                      <span>{actionError}</span>
                    </p>
                  ) : null}

                  <div className="staff-decision-actions-row">
                    <button
                      type="button"
                      className="button button-ghost"
                      onClick={() => setActionType(null)}
                      disabled={submittingAction}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="button staff-btn-confirm-reject"
                      onClick={() => void handleReject()}
                      disabled={rejectionReason.trim().length < 10 || submittingAction}
                    >
                      {submittingAction ? "Processing..." : "Confirm Rejection"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="staff-detail-action-buttons-card">
                  <div className="staff-detail-action-hint">
                    <HeadphonesIcon width={18} height={18} />
                    <span>Audition and inspection complete? Make a moderation decision below:</span>
                  </div>

                  <div className="staff-initial-action-buttons">
                    <button
                      type="button"
                      className="button staff-btn-approve-primary staff-btn-action-large"
                      onClick={() => setActionType("APPROVE")}
                    >
                      <CheckIcon width={16} height={16} />
                      <span>Approve & Publish</span>
                    </button>
                    <button
                      type="button"
                      className="button staff-btn-reject-primary staff-btn-action-large"
                      onClick={() => setActionType("REJECT")}
                    >
                      <CloseIcon width={16} height={16} />
                      <span>Reject Submission</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Album Tracklist Sidebar (matching Image 2 style) */}
        {detail.albumNavigation ? (
          <aside className="staff-album-tracklist-sidebar">
            <div className="staff-album-sidebar-header">
              <div className="staff-album-sidebar-title-wrap">
                <h3 className="staff-album-sidebar-title">ALBUM TRACKLIST</h3>
                <span className="staff-album-sidebar-album-name">
                  {albumProgressStats.pending === 0 ? (
                    `All ${albumProgressStats.total} tracks processed`
                  ) : (
                    <>
                      <b>{albumProgressStats.processed}/{albumProgressStats.total}</b> processed · <b>{albumProgressStats.pending}</b> pending
                    </>
                  )}
                </span>
              </div>
              <span className="staff-album-sidebar-meta-badge">
                {detail.albumNavigation.totalTracks} tracks • {formatDuration(totalAlbumDurationMs)}
              </span>
            </div>

            {/* Navigation Bar with Pre & Next Buttons */}
            <div className="staff-album-sidebar-nav">
              <button
                type="button"
                className="staff-album-nav-step-btn"
                disabled={!detail.albumNavigation.prevSubmissionId}
                onClick={() => {
                  if (detail.albumNavigation?.prevSubmissionId) {
                    onNavigateToSubmission?.(detail.albumNavigation.prevSubmissionId);
                  }
                }}
                title="Go to previous track in this album"
              >
                <ChevronLeftIcon width={14} height={14} />
                <span>Pre</span>
              </button>

              <div className="staff-album-nav-counter">
                Track <b>{detail.albumNavigation.currentIndex}</b> of <b>{detail.albumNavigation.totalTracks}</b>
              </div>

              <button
                type="button"
                className="staff-album-nav-step-btn is-next"
                disabled={!detail.albumNavigation.nextSubmissionId}
                onClick={() => {
                  if (detail.albumNavigation?.nextSubmissionId) {
                    onNavigateToSubmission?.(detail.albumNavigation.nextSubmissionId);
                  }
                }}
                title="Go to next track in this album"
              >
                <span>Next</span>
                <ChevronRightIcon width={14} height={14} />
              </button>
            </div>

            {/* Track Items List matching Image 2 */}
            <div className="staff-album-sidebar-tracklist">
              {detail.albumNavigation.tracks.map((t, idx) => {
                const isCurrent = t.trackId === detail.track.id || t.submissionId === detail.id;
                const canClick = Boolean(t.submissionId && !isCurrent);
                const trackNumberDisplay = t.trackNumber || idx + 1;

                return (
                  <button
                    key={t.trackId}
                    type="button"
                    className={`staff-album-sidebar-track-item ${isCurrent ? "is-current" : ""}`}
                    disabled={!canClick}
                    onClick={() => {
                      if (t.submissionId) {
                        onNavigateToSubmission?.(t.submissionId);
                      }
                    }}
                    title={
                      isCurrent
                        ? `Currently reviewing Track #${trackNumberDisplay}: ${t.title}`
                        : canClick
                        ? `Click to review Track #${trackNumberDisplay}: ${t.title}`
                        : `Track #${trackNumberDisplay}: ${t.title}`
                    }
                  >
                    <div className="staff-album-track-main-info">
                      <span className="staff-album-track-num-badge">
                        {trackNumberDisplay}
                      </span>
                      <div className="staff-album-track-text-meta">
                        <span className="staff-album-track-title">{t.title}</span>
                        <span className="staff-album-track-sub">
                          {formatDuration(t.durationMs)}
                        </span>
                      </div>
                    </div>

                    <div className="staff-album-track-right-meta">
                      <span className={`staff-album-track-status-pill is-${(t.status || "pending").toLowerCase()}`}>
                        <span className="staff-album-track-status-dot" />
                        <span>{t.status === "APPROVED" ? "Approved" : t.status === "REJECTED" ? "Rejected" : "Pending"}</span>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>
        ) : null}
      </div>
        </div>
      ) : null}
    </div>
  );
}
