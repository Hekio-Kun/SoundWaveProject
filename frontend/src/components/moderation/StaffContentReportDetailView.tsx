import { useState, useEffect, useRef, useMemo } from "react";
import {
  AlertIcon,
  CheckIcon,
  ClockIcon,
  DiscIcon,
  FileTextIcon,
  FlagIcon,
  PaperclipIcon,
  PauseIcon,
  PlayIcon,
  ShieldIcon,
  UserIcon,
  UsersIcon,
  VolumeIcon,
} from "../../icons";
import { staffReportsApi } from "../../api/staffReports";
import { lyricsApi } from "../../api/lyrics";
import { ApiError } from "../../api/client";
import type { StaffContentReportResponse } from "../../types";
import { TakeDownConfirmationModal } from "../modals/TakeDownConfirmationModal";
import { CenterNotificationPopup } from "../modals/CenterNotificationPopup";
import { parseLyricsToLines, formatTimeDisplay } from "../common/LyricSyncTab";
import { formatDurationSeconds as formatSeconds } from "../../utils/timeUtils";
import { formatDate } from "../../utils/dateUtils";

type Props = {
  reportId: number;
  initialReport?: StaffContentReportResponse;
  onBack: () => void;
  onRefreshQueue: () => void;
  onNotify?: (message: string, type?: "success" | "info" | "warning" | "error") => void;
};

export function StaffContentReportDetailView({
  reportId,
  initialReport,
  onBack,
  onRefreshQueue,
  onNotify,
}: Props) {
  const [report, setReport] = useState<StaffContentReportResponse | null>(initialReport ?? null);
  const [loading, setLoading] = useState<boolean>(!initialReport);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastNotification, setToastNotification] = useState<{
    open: boolean;
    message: string;
    type: "success" | "info" | "warning" | "error";
  }>({ open: false, message: "", type: "success" });

  // Audio player state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.85);

  // Decision state
  const [decision, setDecision] = useState<"RESOLVED" | "DISMISSED" | null>(null);
  const [staffNote, setStaffNote] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Take Down Modal state
  const [isTakedownModalOpen, setIsTakedownModalOpen] = useState<boolean>(false);

  const isCopyright = useMemo(() => {
    if (!report) return false;
    if (report.category?.toUpperCase() === "COPYRIGHT") return true;
    const r = (report.reason || "").toLowerCase();
    return r.includes("copyright") || r.includes("bản quyền");
  }, [report]);

  // Lyrics state
  const [trackLyrics, setTrackLyrics] = useState<string | null>(initialReport?.lyrics || null);
  const [copiedLyrics, setCopiedLyrics] = useState<boolean>(false);
  const activeLineRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const isUserScrollingRef = useRef<boolean>(false);
  const isProgrammaticScrollRef = useRef<boolean>(false);
  const scrollTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const tid = report?.trackId || report?.targetId;
    if (!tid) return;

    if (report?.lyrics) {
      setTrackLyrics(report.lyrics);
    }

    lyricsApi
      .getTrackLyrics(tid)
      .then((bundle) => {
        const content = bundle?.officialLyric?.lyricContent || bundle?.userPersonalLyric?.lyricContent;
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
  }, [report?.trackId, report?.targetId, report?.lyrics]);

  const handleCopyLyrics = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLyrics(true);
      setTimeout(() => setCopiedLyrics(false), 2000);
    } catch {
      // Fallback
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

  // Fetch report details
  const fetchReport = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const data = await staffReportsApi.getReportById(reportId);
      setReport(data);
      if (data.staffNote) {
        setStaffNote(data.staffNote);
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message || "Failed to load content report details.");
      } else {
        setErrorMessage("An unexpected error occurred while loading details.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialReport) {
      fetchReport();
    } else {
      setReport(initialReport);
      if (initialReport.staffNote) {
        setStaffNote(initialReport.staffNote);
      }
    }
  }, [reportId]);

  // Audio cleanup on unmount
  useEffect(() => {
    return () => {
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
  }, []);

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
    const seekTime = parseFloat(e.target.value);
    setCurrentTime(seekTime);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
  };

  // Submit resolution
  const handleConfirmResolution = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);

    if (!decision) {
      const err = "Please select a resolution decision: Confirm Violation or Dismiss Report.";
      setActionError(err);
      setToastNotification({
        open: true,
        message: "Please select a resolution decision.",
        type: "warning",
      });
      return;
    }

    const trimmedNote = staffNote.trim();
    if (!trimmedNote) {
      const err = "Please provide resolution feedback in the Staff Note field.";
      setActionError(err);
      setToastNotification({
        open: true,
        message: "Please enter a staff note.",
        type: "warning",
      });
      return;
    }

    try {
      setSubmitting(true);
      const updated = await staffReportsApi.resolveReport(reportId, {
        decision,
        staffNote: trimmedNote,
      });

      // Guarantee all reports in this track + reason group are resolved (only for grouped non-copyright)
      if (!isCopyright && report?.reportIds && report.reportIds.length > 1) {
        for (const otherId of report.reportIds) {
          if (otherId !== reportId) {
            try {
              await staffReportsApi.resolveReport(otherId, {
                decision,
                staffNote: trimmedNote,
              });
            } catch {
              // Ignore if already marked by backend bulk-resolution
            }
          }
        }
      }

      setReport(updated);
      const successMsg =
        decision === "RESOLVED"
          ? "Violation confirmed successfully."
          : "Report dismissed successfully.";
      setToastNotification({
        open: true,
        message: successMsg,
        type: "success",
      });
      onRefreshQueue();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.code === "REPORT_ALREADY_ADJUDICATED" || err.message.includes("already been adjudicated")) {
          setToastNotification({
            open: true,
            message: "This report has already been adjudicated.",
            type: "warning",
          });
          onRefreshQueue();
          fetchReport();
          return;
        }
        const errorMsg = err.message || "Failed to resolve report.";
        setActionError(errorMsg);
        setToastNotification({
          open: true,
          message: errorMsg,
          type: "error",
        });
      } else {
        const errorMsg = "An unexpected error occurred. Please try again.";
        setActionError(errorMsg);
        setToastNotification({
          open: true,
          message: errorMsg,
          type: "error",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleTakedownSuccess = (message: string) => {
    setIsTakedownModalOpen(false);
    const msg = message || "Track taken down successfully.";
    setToastNotification({
      open: true,
      message: msg,
      type: "success",
    });
    fetchReport();
    onRefreshQueue();
  };

  const isPending = report?.status?.toUpperCase() === "PENDING";
  const isPublished = report?.trackPublicationStatus === "PUBLISHED";
  const maxSeekTime = duration || 1;

  return (
    <div className="staff-detail-view-container">
      {/* Top Breadcrumb & Navigation Bar */}
      <div className="staff-detail-top-nav">
        <button
          type="button"
          onClick={onBack}
          className="staff-detail-back-btn"
          title="Back to Reported Tracks queue"
        >
          <span className="staff-detail-back-arrow" aria-hidden="true">←</span>
          <span>Back to Reported Tracks</span>
        </button>

        <div className="staff-detail-breadcrumbs">
          <span className="staff-crumb-muted">Reported Tracks</span>
          <span className="staff-crumb-sep">/</span>
          <span className="staff-crumb-active">Report #{reportId}</span>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="staff-inspector-loading" aria-busy="true">
          <div className="staff-inspector-spinner" />
          <span>Loading content report details and audio stream...</span>
        </div>
      ) : errorMessage ? (
        <div className="staff-inspector-error" role="alert">
          <AlertIcon width={36} height={36} />
          <b>Failed to load report details</b>
          <p>{errorMessage}</p>
          <button type="button" className="button button-ghost button-small" onClick={onBack}>
            Back to Reports
          </button>
        </div>
      ) : report ? (
        <div className="staff-detail-content-body">
          {/* Status & Timing Banner */}
          <div className="staff-inspector-status-banner">
            <div className="staff-status-group">
              <span className="staff-status-label">Report Status:</span>
              <span
                className={`staff-status-chip ${
                  report.status?.toUpperCase() === "RESOLVED"
                    ? "is-approved"
                    : report.status?.toUpperCase() === "DISMISSED"
                    ? "is-rejected"
                    : "is-pending"
                }`}
              >
                <i />
                <span>
                  {report.status?.toUpperCase() === "RESOLVED"
                    ? "Resolved (Violation Confirmed)"
                    : report.status?.toUpperCase() === "DISMISSED"
                    ? "Dismissed"
                    : "Pending Adjudication"}
                </span>
              </span>
            </div>

            <div className="staff-time-group">
              <ClockIcon width={13} height={13} />
              <span>Submitted: <b>{formatDate(report.createdAt)}</b></span>
              {report.resolvedAt && (
                <span style={{ marginLeft: "12px" }}>
                  Resolved: <b>{formatDate(report.resolvedAt)}</b>
                  {report.reviewerName ? ` by ${report.reviewerName}` : ""}
                </span>
              )}
            </div>
          </div>

          {/* Hero Card & Integrated Audio Studio Player */}
          <div className="staff-inspector-hero-card staff-detail-hero-card">
            <div className="staff-hero-artwork-wrap staff-detail-artwork-wrap">
              {report.coverUrl ? (
                <img
                  src={report.coverUrl}
                  alt={report.trackTitle}
                  className="staff-hero-artwork"
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "#D4A373",
                    color: "#FFFFFF",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <DiscIcon width={64} height={64} />
                </div>
              )}
            </div>

            <div className="staff-hero-info-col">
              <div className="staff-hero-badge-row">
                <span className="staff-meta-pill is-single">
                  Target: {report.targetType || "TRACK"} #{report.targetId}
                </span>
                {report.trackPublicationStatus && (
                  <span
                    className={`staff-meta-pill ${
                      report.trackPublicationStatus === "PUBLISHED" ? "is-genre" : "is-rejected"
                    }`}
                  >
                    Publication: {report.trackPublicationStatus}
                  </span>
                )}
              </div>

              <h2 className="staff-hero-track-title staff-detail-track-title">
                {report.trackTitle}
              </h2>

              <p className="staff-hero-creator-line">
                <UserIcon width={14} height={14} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
                Artist: <b>{report.artistName}</b>
              </p>

              {/* Integrated High-Fidelity Audio Studio Player */}
              {report.audioUrl ? (
                <div className="staff-audio-studio-player staff-detail-audio-player">
                  <audio
                    ref={audioRef}
                    src={report.audioUrl}
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
                      title={isPlaying ? "Pause audio preview" : "Play audio preview"}
                      aria-label={isPlaying ? "Pause audio preview" : "Play audio preview"}
                    >
                      {isPlaying ? (
                        <PauseIcon width={18} height={18} />
                      ) : (
                        <PlayIcon width={18} height={18} />
                      )}
                    </button>

                    <div className={`staff-equalizer-bars ${isPlaying ? "is-active" : ""}`}>
                      <span />
                      <span />
                      <span />
                      <span />
                    </div>

                    <div className="staff-player-seek-wrap">
                      <div className="staff-player-times">
                        <span className="staff-time-current">{formatSeconds(currentTime)}</span>
                        <span className="staff-time-total">{formatSeconds(duration)}</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={maxSeekTime}
                        step={0.1}
                        value={currentTime}
                        onChange={handleSeek}
                        className="staff-player-slider-bar"
                        aria-label="Seek audio preview position"
                      />
                    </div>

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
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: "16px", color: "#8D877F", fontStyle: "italic", fontSize: "0.85rem" }}>
                  Audio preview stream not available for this track.
                </div>
              )}
            </div>
          </div>

          {/* Synchronous Lyrics Section (Matching Track Details Page) */}
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

          {/* Unified Moderation & Adjudication Card */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              border: "1px solid #E8DCCB",
              overflow: "hidden",
              marginBottom: "24px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
            }}
          >
            {/* Unified Card Header: Reason & Report Count */}
            <div
              style={{
                padding: "16px 24px",
                backgroundColor: "#FAF6F0",
                borderBottom: "1px solid #E8DCCB",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "#FEF2F2",
                    color: "#DC2626",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <FlagIcon width={17} height={17} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#1C1917" }}>
                    Violation Option: {report.reason}
                  </h4>
                  <span style={{ fontSize: "0.8rem", color: "#57534E" }}>
                    Selected policy option submitted by listeners
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "5px 12px",
                  backgroundColor: "#FFF1F2",
                  border: "1px solid #FECDD3",
                  borderRadius: "20px",
                  color: "#BE123C",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  boxShadow: "0 1px 2px rgba(190, 18, 60, 0.05)",
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: "#E11D48",
                  }}
                />
                <span>
                  {isCopyright
                    ? "Copyright Infringement"
                    : report.reporterCount && report.reporterCount > 1
                    ? `${report.reporterCount} Reports`
                    : "1 Report"}
                </span>
              </div>
            </div>

            {/* Unified Card Body: Form or Resolution Record */}
            <div style={{ padding: "24px" }}>
              {/* Reporter Info Section: Copyright (Individual Detailed) vs Grouped (Summary line) */}
              {isCopyright ? (
                /* Copyright Infringement: Individual Claimant Details */
                <div
                  style={{
                    backgroundColor: "#F0F9FF",
                    border: "1px solid #BAE6FD",
                    borderRadius: "14px",
                    padding: "20px 24px",
                    marginBottom: "24px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "16px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      {report.reporterAvatarUrl ? (
                        <img
                          src={report.reporterAvatarUrl}
                          alt={report.reporterName}
                          style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: "2px solid #BAE6FD",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "50%",
                            backgroundColor: "#0284C7",
                            color: "#FFFFFF",
                            display: "grid",
                            placeItems: "center",
                            fontWeight: 700,
                            fontSize: "1.1rem",
                            border: "2px solid #BAE6FD",
                          }}
                        >
                          {(report.reporterName || report.reporterUsername || "U").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0C4A6E" }}>
                            {report.reporterName}
                          </span>
                          <span style={{ fontSize: "0.85rem", color: "#0284C7", fontWeight: 600 }}>
                            @{report.reporterUsername || report.reporterName}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            marginTop: "4px",
                            fontSize: "0.82rem",
                            color: "#57534E",
                            flexWrap: "wrap",
                          }}
                        >
                          {report.reporterEmail && <span>{report.reporterEmail}</span>}
                          <span>•</span>
                          <span>
                            Submitted: <b>{formatDate(report.createdAt)}</b>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Proof Document Open / Download Button */}
                    {report.evidenceUrl ? (
                      <a
                        href={report.evidenceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="button button-small"
                        style={{
                          backgroundColor: "#0284C7",
                          color: "#FFFFFF",
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          fontWeight: 600,
                          padding: "8px 16px",
                          borderRadius: "8px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <PaperclipIcon width={14} height={14} />
                        <span>View Proof Document ↗</span>
                      </a>
                    ) : (
                      <span
                        style={{
                          fontSize: "0.82rem",
                          color: "#6B7280",
                          fontStyle: "italic",
                          padding: "6px 12px",
                          backgroundColor: "#E5E7EB",
                          borderRadius: "6px",
                        }}
                      >
                        No proof document attached
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                /* Non-Copyright Grouped Report: Total Reports Count */
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: "#F9FAFB",
                    border: "1px solid #E5E7EB",
                    borderRadius: "12px",
                    padding: "14px 18px",
                    marginBottom: "24px",
                    gap: "10px",
                  }}
                >
                  <UsersIcon width={18} height={18} style={{ color: "#6B7280", flexShrink: 0 }} />
                  <span style={{ fontSize: "0.92rem", color: "#374151" }}>
                    Total Reports:{" "}
                    <strong style={{ color: "#0C4A6E" }}>
                      {report.reporterCount && report.reporterCount > 1
                        ? `${report.reporterCount} reports submitted by listeners`
                        : "1 report submitted by a listener"}
                    </strong>
                  </span>
                </div>
              )}

              {isPending ? (
                <>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#1C1917", margin: "0 0 16px 0" }}>
                    Adjudicate Reported Track
                  </h3>

                  {actionError && (
                    <div
                      style={{
                        padding: "10px 14px",
                        backgroundColor: "#FEF2F2",
                        border: "1px solid #FCA5A5",
                        color: "#B42318",
                        borderRadius: "8px",
                        fontSize: "0.85rem",
                        marginBottom: "16px",
                      }}
                    >
                      {actionError}
                    </div>
                  )}

                  <form onSubmit={handleConfirmResolution}>
                    {/* Decision choices */}
                    <div style={{ marginBottom: "16px" }}>
                      <label style={{ display: "block", fontSize: "0.88rem", fontWeight: 600, color: "#1C1917", marginBottom: "8px" }}>
                        Resolution Decision <span style={{ color: "#DC2626" }}>*</span>
                      </label>
                      <div style={{ display: "flex", gap: "12px", maxWidth: "520px" }}>
                        <button
                          type="button"
                          onClick={() => setDecision("RESOLVED")}
                          disabled={submitting}
                          style={{
                            flex: 1,
                            padding: "12px 16px",
                            borderRadius: "10px",
                            border: decision === "RESOLVED" ? "2px solid #DC2626" : "1px solid #E8DCCB",
                            backgroundColor: decision === "RESOLVED" ? "#FEF2F2" : "#FFFFFF",
                            color: decision === "RESOLVED" ? "#B42318" : "#1C1917",
                            fontWeight: 600,
                            fontSize: "0.92rem",
                            cursor: "pointer",
                          }}
                        >
                          Confirm Violation
                        </button>
                        <button
                          type="button"
                          onClick={() => setDecision("DISMISSED")}
                          disabled={submitting}
                          style={{
                            flex: 1,
                            padding: "12px 16px",
                            borderRadius: "10px",
                            border: decision === "DISMISSED" ? "2px solid #57534E" : "1px solid #E8DCCB",
                            backgroundColor: decision === "DISMISSED" ? "#F5F5F4" : "#FFFFFF",
                            color: decision === "DISMISSED" ? "#1C1917" : "#57534E",
                            fontWeight: 600,
                            fontSize: "0.92rem",
                            cursor: "pointer",
                          }}
                        >
                          Dismiss Report
                        </button>
                      </div>
                    </div>

                    {/* Mandatory Staff Note */}
                    <div style={{ marginBottom: "20px" }}>
                      <label
                        htmlFor="staff-note-input"
                        style={{ display: "block", fontSize: "0.88rem", fontWeight: 600, color: "#1C1917", marginBottom: "6px" }}
                      >
                        Staff Note <span style={{ color: "#DC2626" }}>*</span>
                      </label>
                      <textarea
                        id="staff-note-input"
                        rows={4}
                        value={staffNote}
                        onChange={(e) => setStaffNote(e.target.value)}
                        placeholder="Enter note..."
                        disabled={submitting}
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          borderRadius: "10px",
                          border: "1px solid #E8DCCB",
                          fontSize: "0.9rem",
                          fontFamily: "inherit",
                          resize: "vertical",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "12px" }}>
                      <button
                        type="button"
                        className="button button-secondary"
                        onClick={onBack}
                        disabled={submitting}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="button button-primary"
                        disabled={submitting}
                      >
                        {submitting ? "Processing..." : "Confirm Resolution"}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                /* Already Adjudicated Information Box */
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <h4 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "#1C1917" }}>
                      Resolution Record
                    </h4>
                    {report.status?.toUpperCase() === "RESOLVED" && isPublished && (
                      <button
                        type="button"
                        className="button"
                        style={{
                          backgroundColor: "#DC2626",
                          borderColor: "#DC2626",
                          color: "#FFFFFF",
                          padding: "8px 16px",
                          fontSize: "0.85rem",
                        }}
                        onClick={() => setIsTakedownModalOpen(true)}
                      >
                        Take Down
                      </button>
                    )}
                  </div>

                  <div className="staff-specs-matrix" style={{ marginBottom: "16px" }}>
                    <div className="staff-matrix-cell">
                      <small>Adjudicated By Staff</small>
                      <strong>{report.reviewerName || "Staff Member"}</strong>
                    </div>
                    <div className="staff-matrix-cell">
                      <small>Resolution Decision</small>
                      <strong style={{ color: report.status === "RESOLVED" ? "#B42318" : "#57534E" }}>
                        {report.status === "RESOLVED" ? "Confirmed Violation" : "Dismissed"}
                      </strong>
                    </div>
                    <div className="staff-matrix-cell">
                      <small>Status</small>
                      <strong>{report.status}</strong>
                    </div>
                    <div className="staff-matrix-cell">
                      <small>Resolved At</small>
                      <strong>{formatDate(report.resolvedAt)}</strong>
                    </div>
                  </div>

                  <div>
                    <small style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#57534E", marginBottom: "4px" }}>
                      Staff Note:
                    </small>
                    <p
                      style={{
                        margin: 0,
                        padding: "10px 14px",
                        backgroundColor: "#FAFAF9",
                        borderRadius: "8px",
                        border: "1px solid #E8DCCB",
                        fontSize: "0.88rem",
                        color: "#1C1917",
                        lineHeight: "1.5",
                      }}
                    >
                      {report.staffNote || "No resolution note provided."}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Take Down Confirmation Modal */}
      {report && (
        <TakeDownConfirmationModal
          open={isTakedownModalOpen}
          trackId={report.targetId}
          trackTitle={report.trackTitle}
          artistName={report.artistName}
          coverUrl={report.coverUrl}
          onSuccess={handleTakedownSuccess}
          onNotify={(msg, type) => {
            setToastNotification({
              open: true,
              message: msg,
              type: type || "warning",
            });
            if (onNotify) onNotify(msg, type || "warning");
          }}
          onCancel={() => setIsTakedownModalOpen(false)}
        />
      )}

      {/* Synchronized Center Notification Popup (agent/AGENTS_FRONTEND.md Section 4.9) */}
      <CenterNotificationPopup
        open={toastNotification.open}
        message={toastNotification.message}
        type={toastNotification.type}
        durationMs={3000}
        onClose={() => setToastNotification((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}

