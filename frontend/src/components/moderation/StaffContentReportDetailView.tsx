import { useState, useEffect, useRef, useMemo } from "react";
import {
  AlertIcon,
  CheckIcon,
  ClockIcon,
  DiscIcon,
  FileTextIcon,
  FlagIcon,
  PauseIcon,
  PlayIcon,
  ShieldIcon,
  UserIcon,
  VolumeIcon,
} from "../../icons";
import { staffReportsApi } from "../../api/staffReports";
import { lyricsApi } from "../../api/lyrics";
import { ApiError } from "../../api/client";
import type { StaffContentReportResponse } from "../../types";
import { TakeDownConfirmationModal } from "../modals/TakeDownConfirmationModal";

type Props = {
  reportId: number;
  initialReport?: StaffContentReportResponse;
  onBack: () => void;
  onRefreshQueue: () => void;
};

function formatSeconds(totalSeconds: number): string {
  if (isNaN(totalSeconds) || totalSeconds < 0) return "0:00";
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
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

export function StaffContentReportDetailView({
  reportId,
  initialReport,
  onBack,
  onRefreshQueue,
}: Props) {
  const [report, setReport] = useState<StaffContentReportResponse | null>(initialReport ?? null);
  const [loading, setLoading] = useState<boolean>(!initialReport);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

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

  // Lyrics state
  const [trackLyrics, setTrackLyrics] = useState<string | null>(initialReport?.lyrics || null);
  const [copiedLyrics, setCopiedLyrics] = useState<boolean>(false);

  useEffect(() => {
    if (report?.lyrics) {
      setTrackLyrics(report.lyrics);
      return;
    }
    const tid = report?.trackId || report?.targetId;
    if (tid) {
      lyricsApi
        .getStaffOfficialLyric(tid)
        .then((res) => {
          if (res?.lyricContent) setTrackLyrics(res.lyricContent);
        })
        .catch(() => {
          lyricsApi
            .getTrackLyrics(tid)
            .then((bundle) => {
              if (bundle?.officialLyric?.lyricContent) {
                setTrackLyrics(bundle.officialLyric.lyricContent);
              }
            })
            .catch(() => {});
        });
    }
  }, [report?.lyrics, report?.trackId, report?.targetId]);

  const handleJumpToTimestamp = (seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = seconds;
    setCurrentTime(seconds);
    if (!isPlaying) {
      const promise = audioRef.current.play();
      if (promise !== undefined) {
        playPromiseRef.current = promise;
        promise
          .then(() => setIsPlaying(true))
          .catch((err: Error) => {
            if (err.name !== "AbortError") {
              console.error("Audio playback error:", err);
            }
          });
      }
    }
  };

  const handleCopyLyrics = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLyrics(true);
      setTimeout(() => setCopiedLyrics(false), 2000);
    } catch {
      // Fallback
    }
  };

  const parsedLyricLines = useMemo<ParsedLyricLine[]>(() => {
    if (!trackLyrics) return [];
    return trackLyrics.split(/\r?\n/).map((line, idx) => {
      const match = line.match(/^(\[\d{1,2}:\d{2}(?:\.\d{1,3})?\])(.*)$/);
      const tsSeconds = parseTimestampToSeconds(line);
      return {
        lineNumber: idx + 1,
        raw: line,
        tsMatch: match ? match[1] : null,
        tsSeconds,
        text: match ? match[2] : line,
      };
    });
  }, [trackLyrics]);

  const hasSyncedLyrics = useMemo(() => {
    return parsedLyricLines.some((l) => l.tsSeconds !== null);
  }, [parsedLyricLines]);

  const activeLineIndex = useMemo(() => {
    if (!parsedLyricLines.length) return -1;
    let foundIdx = -1;
    for (let i = 0; i < parsedLyricLines.length; i++) {
      const sec = parsedLyricLines[i].tsSeconds;
      if (sec !== null && currentTime >= sec) {
        foundIdx = i;
      }
    }
    return foundIdx;
  }, [parsedLyricLines, currentTime]);

  const lyricStats = useMemo(() => {
    if (!trackLyrics) return { lines: 0, words: 0, characters: 0 };
    const raw = trackLyrics.trim();
    const lines = parsedLyricLines.filter((l) => l.raw.trim().length > 0).length;
    const words = raw.split(/\s+/).filter(Boolean).length;
    return { lines, words, characters: raw.length };
  }, [trackLyrics, parsedLyricLines]);

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
      setActionError("Please select a resolution decision: Confirm Violation or Dismiss Report.");
      return;
    }

    const trimmedNote = staffNote.trim();
    if (!trimmedNote) {
      setActionError("Please provide resolution feedback in the Staff Note field.");
      return;
    }

    try {
      setSubmitting(true);
      const updated = await staffReportsApi.resolveReport(reportId, {
        decision,
        staffNote: trimmedNote,
      });

      // Guarantee all reports in this track + reason group are resolved
      if (report?.reportIds && report.reportIds.length > 1) {
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
      setSuccessBanner("Report resolved successfully.");
      onRefreshQueue();
      setTimeout(() => setSuccessBanner(null), 4000);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.code === "REPORT_ALREADY_ADJUDICATED" || err.message.includes("already been adjudicated")) {
          alert("This report has already been adjudicated");
          onRefreshQueue();
          fetchReport();
          return;
        }
        setActionError(err.message || "Failed to resolve report.");
      } else {
        setActionError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleTakedownSuccess = (message: string) => {
    setIsTakedownModalOpen(false);
    setSuccessBanner(message);
    setTimeout(() => setSuccessBanner(null), 4000);
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
          title="Back to Content Reports queue"
        >
          <span className="staff-detail-back-arrow" aria-hidden="true">←</span>
          <span>Back to Reports</span>
        </button>

        <div className="staff-detail-breadcrumbs">
          <span className="staff-crumb-muted">Content Reports</span>
          <span className="staff-crumb-sep">/</span>
          <span className="staff-crumb-active">Report #{reportId}</span>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successBanner && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px 18px",
            backgroundColor: "#ECFDF5",
            border: "1px solid #A7F3D0",
            color: "#065F46",
            borderRadius: "10px",
            marginBottom: "16px",
            fontSize: "0.92rem",
            fontWeight: 500,
          }}
        >
          <CheckIcon width={18} height={18} />
          <span>{successBanner}</span>
        </div>
      )}

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

          {/* Lyrics Section */}
          <div className="staff-lyrics-card" style={{ marginBottom: "20px" }}>
            <div className="staff-lyrics-header">
              <div className="staff-lyrics-title-group">
                <span className="staff-lyrics-icon-badge">
                  <FileTextIcon width={17} height={17} />
                </span>
                <h4 className="staff-lyrics-heading">Lyrics</h4>
              </div>

              {trackLyrics ? (
                <div className="staff-lyrics-header-actions">
                  <div className="staff-lyrics-stats-badge">
                    {hasSyncedLyrics ? (
                      <>
                        <span style={{ color: "#0284c7", fontWeight: 700 }}>Synced (.LRC)</span>
                        <span>·</span>
                      </>
                    ) : null}
                    <span><b>{lyricStats.lines}</b> lines</span>
                    <span>·</span>
                    <span><b>{lyricStats.words}</b> words</span>
                  </div>
                  <button
                    type="button"
                    className="staff-lyrics-copy-btn"
                    onClick={() => void handleCopyLyrics(trackLyrics)}
                    title="Copy lyrics"
                  >
                    {copiedLyrics ? (
                      <>
                        <CheckIcon width={13} height={13} />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <FileTextIcon width={13} height={13} />
                        <span>Copy Lyrics</span>
                      </>
                    )}
                  </button>
                </div>
              ) : null}
            </div>

            {trackLyrics ? (
              <div className="staff-lyrics-viewer-wrapper">
                <div className="staff-lyrics-lines-container">
                  {parsedLyricLines.map((item, idx) => {
                    const isActive = idx === activeLineIndex && item.tsSeconds !== null;
                    return (
                      <div
                        key={item.lineNumber}
                        className={`staff-lyrics-line-row ${isActive ? "is-active" : ""}`}
                      >
                        <span className="staff-lyrics-line-number" aria-hidden="true">
                          {item.lineNumber}
                        </span>
                        <span className="staff-lyrics-line-content">
                          {item.tsMatch && item.tsSeconds !== null ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleJumpToTimestamp(item.tsSeconds!)}
                                className="staff-lyric-ts-jump-btn"
                                title={`Jump audio to ${formatSeconds(item.tsSeconds!)}`}
                                aria-label={`Jump audio to ${formatSeconds(item.tsSeconds!)}`}
                              >
                                {item.tsMatch}
                              </button>
                              <span>{item.text || "\u00A0"}</span>
                            </>
                          ) : (
                            item.raw || "\u00A0"
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {hasSyncedLyrics ? (
                  <div className="staff-lyrics-footer-guide">
                    💡 <b>Tip:</b> Click any timestamp badge to audition the track starting at that specific line.
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="staff-lyrics-empty-state">
                <FileTextIcon width={28} height={28} />
                <div className="staff-lyrics-empty-text">
                  <strong>No lyrics provided</strong>
                  <span>No official lyrics attached to this track.</span>
                </div>
              </div>
            )}
          </div>

          {/* Report Evidence & Reporter Information Section */}
          <div
            style={{
              padding: "20px 24px",
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              border: "1px solid #E8DCCB",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px",
                marginBottom: "18px",
                paddingBottom: "14px",
                borderBottom: "1px solid #F3ECE1",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "50%",
                    background: "#FEF2F2",
                    color: "#DC2626",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <FlagIcon width={18} height={18} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "#1C1917" }}>
                    Violation Option: {report.reason}
                  </h4>
                  <span style={{ fontSize: "0.82rem", color: "#57534E" }}>
                    Selected policy option submitted by listeners
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 14px",
                  backgroundColor: "#FFF1F2",
                  border: "1px solid #FECDD3",
                  borderRadius: "20px",
                  color: "#BE123C",
                  fontSize: "0.84rem",
                  fontWeight: 700,
                  boxShadow: "0 1px 2px rgba(190, 18, 60, 0.05)",
                }}
              >
                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    backgroundColor: "#E11D48",
                  }}
                />
                <span>
                  {report.reporterCount && report.reporterCount > 1
                    ? `${report.reporterCount} Reports`
                    : "1 Report"}
                </span>
              </div>
            </div>

            {/* Reporter Meta 4-Column Balanced Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                gap: "12px",
                marginBottom: report.reporters && report.reporters.length > 1 ? "16px" : "0",
              }}
            >
              <div className="staff-matrix-cell" style={{ margin: 0 }}>
                <small>Reporting Listener</small>
                <strong>
                  {report.reporterName}
                  {report.reporterCount && report.reporterCount > 1
                    ? ` (+${report.reporterCount - 1} more)`
                    : ""}
                </strong>
              </div>
              <div className="staff-matrix-cell" style={{ margin: 0 }}>
                <small>Reporter Email</small>
                <strong style={{ wordBreak: "break-all" }}>{report.reporterEmail || "--"}</strong>
              </div>
              <div className="staff-matrix-cell" style={{ margin: 0 }}>
                <small>Latest Submission</small>
                <strong>{formatDate(report.createdAt)}</strong>
              </div>
              <div className="staff-matrix-cell" style={{ margin: 0 }}>
                <small>Target Track</small>
                <strong>#{report.targetId} · {report.trackTitle}</strong>
              </div>
            </div>

            {/* All Reporting Listeners List (when multiple listeners reported the same option) */}
            {report.reporters && report.reporters.length > 1 && (
              <div style={{ marginTop: "16px" }}>
                <small style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#57534E", marginBottom: "8px" }}>
                  All Reporting Listeners in this Group ({report.reporters.length}):
                </small>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {report.reporters.map((rep, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#F6EFE3",
                        borderRadius: "8px",
                        border: "1px solid #E8DCCB",
                        fontSize: "0.82rem",
                        color: "#1C1917",
                      }}
                    >
                      <b>{rep.reporterName}</b>
                      {rep.reporterEmail && <span style={{ color: "#57534E", marginLeft: "4px" }}>({rep.reporterEmail})</span>}
                      <span style={{ color: "#8D877F", marginLeft: "6px" }}>· {formatDate(rep.submittedAt)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Adjudication Decision Panel */}
          {isPending ? (
            <div
              style={{
                padding: "24px",
                backgroundColor: "#FFFFFF",
                borderRadius: "16px",
                border: "1px solid #E8DCCB",
                marginBottom: "24px",
              }}
            >
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1C1917", margin: "0 0 4px 0" }}>
                Adjudicate Content Report
              </h3>
              <p style={{ fontSize: "0.85rem", color: "#57534E", margin: "0 0 16px 0" }}>
                Investigate target track audio and evidence. Select a resolution decision and provide a mandatory Staff Note.
              </p>

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
            </div>
          ) : (
            /* Already Adjudicated Information Box */
            <div
              style={{
                padding: "20px 24px",
                backgroundColor: "#FFFFFF",
                borderRadius: "16px",
                border: "1px solid #E8DCCB",
                marginBottom: "24px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#1C1917" }}>
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

              <div className="staff-specs-matrix" style={{ marginBottom: "12px" }}>
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
            </div>
          )}
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
          onCancel={() => setIsTakedownModalOpen(false)}
        />
      )}
    </div>
  );
}

