import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { createPortal } from "react-dom";
import { lyricsApi, type PageResponse } from "../api/lyrics";
import type { SubmissionDetail, SubmissionQueueItem, SubmissionStats } from "../api/moderation";
import { CenterNotificationPopup } from "../components/modals/CenterNotificationPopup";
import { useModalScrollLock } from "../hooks/useModalScrollLock";
import {
  AlertIcon,
  CheckIcon,
  ClockIcon,
  CloseIcon,
  CopyIcon,
  DownloadIcon,
  EyeIcon,
  FileTextIcon,
  MusicIcon,
  PauseIcon,
  PlayIcon,
  SearchIcon,
  ShieldIcon,
  UserIcon,
  VolumeIcon,
} from "../icons";
import { downloadLrcFile } from "../utils/lyricsDownload";

function formatDurationSeconds(seconds?: number | null): string {
  if (!seconds || seconds <= 0) return "--:--";
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.floor(seconds % 60);
  return `${minutes}:${remaining.toString().padStart(2, "0")}`;
}

function formatDurationMs(ms?: number | null): string {
  if (!ms || ms <= 0) return "--:--";
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function formatDate(isoString?: string | null): string {
  if (!isoString) return "--";
  try {
    return new Date(isoString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

function formatRelativeTime(isoString?: string | null): string {
  if (!isoString) return "--";
  try {
    const submitted = new Date(isoString).getTime();
    const diffMs = Date.now() - submitted;
    if (diffMs < 0) return "Just now";
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  } catch {
    return formatDate(isoString);
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

type ModStatusFilter = "PENDING" | "APPROVED" | "REJECTED" | "ALL";

type ParsedProposedLine = {
  lineNumber: number;
  raw: string;
  tsMatch: string | null;
  tsSeconds: number | null;
  text: string;
};

const REJECT_PRESETS = [
  {
    label: "⏱️ Desynchronized timestamps",
    text: "Timestamps are desynchronized with the track audio playback, especially after the intro/chorus sections. Please re-align timestamps.",
  },
  {
    label: "📝 Wrong song / Inaccurate lyrics",
    text: "The submitted lyrics do not match the audio recording of this track. Please verify and provide the correct lyrics.",
  },
  {
    label: "⚠️ Inappropriate language / Formatting",
    text: "The lyrics contain formatting errors or unverified text that does not meet SoundWave public catalog standards.",
  },
];

// =========================================================================
// ISOLATED SUB-COMPONENT: LyricInspectionModal (Shields Parent from Re-renders)
// =========================================================================
type LyricInspectionModalProps = {
  submissionId: number;
  onClose: () => void;
  onDecisionSuccess: (message: string, type: "success" | "info") => void;
};

function LyricInspectionModal({
  submissionId,
  onClose,
  onDecisionSuccess,
}: LyricInspectionModalProps) {
  const [inspectingDetail, setInspectingDetail] = useState<SubmissionDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [submittingDecision, setSubmittingDecision] = useState(false);
  const [reviewerNote, setReviewerNote] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  // Localized audio player state: updates DO NOT cause the parent page to re-render
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [copiedProposal, setCopiedProposal] = useState(false);

  // Auto-scroll synchronization
  const activeLineRef = useRef<HTMLDivElement | null>(null);
  const isUserScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<number | null>(null);

  // Cleanup audio playback on modal unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Fetch submission details with race condition prevention
  useEffect(() => {
    let isCurrent = true;
    setLoadingDetail(true);
    setDetailError(null);
    setActionError(null);
    setReviewerNote("");
    setRejectionReason("");
    setShowRejectForm(false);
    setAudioPlaying(false);
    setAudioCurrentTime(0);

    lyricsApi
      .getLyricSubmissionDetail(submissionId)
      .then((detail) => {
        if (isCurrent) {
          setInspectingDetail(detail);
        }
      })
      .catch((err: any) => {
        if (isCurrent) {
          setDetailError(err.message || "Failed to load submission details.");
        }
      })
      .finally(() => {
        if (isCurrent) {
          setLoadingDetail(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [submissionId]);

  // Audio Playback Handlers (UC-24.6 AF02)
  const togglePlayAudio = () => {
    if (!audioRef.current) return;
    if (audioPlaying) {
      audioRef.current.pause();
      setAudioPlaying(false);
    } else {
      audioRef.current.play().catch((e) => console.warn("Playback prevented:", e));
      setAudioPlaying(true);
    }
  };

  const handleAudioTimeUpdate = () => {
    if (!audioRef.current) return;
    setAudioCurrentTime(audioRef.current.currentTime);
  };

  const handleAudioLoadedMetadata = () => {
    if (!audioRef.current) return;
    setAudioDuration(audioRef.current.duration || 0);
  };

  const handleAudioSeek = (e: ChangeEvent<HTMLInputElement>) => {
    const target = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = target;
      setAudioCurrentTime(target);
    }
  };

  const handleJumpToTimestamp = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      setAudioCurrentTime(seconds);
      isUserScrollingRef.current = false;
      if (!audioPlaying) {
        audioRef.current.play().catch((e) => console.warn("Playback prevented:", e));
        setAudioPlaying(true);
      }
    }
  };

  const cyclePlaybackRate = () => {
    const rates = [1, 1.25, 1.5, 2];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    const nextRate = rates[nextIdx];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioRef.current.muted = nextMuted;
  };

  const handleVolumeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (audioRef.current) {
      audioRef.current.volume = val;
      audioRef.current.muted = val === 0;
    }
  };

  const handleProposedScroll = () => {
    isUserScrollingRef.current = true;
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = window.setTimeout(() => {
      isUserScrollingRef.current = false;
    }, 2500);
  };

  const handleCopyProposed = () => {
    if (!inspectingDetail?.proposedLyrics) return;
    void navigator.clipboard.writeText(inspectingDetail.proposedLyrics).then(() => {
      setCopiedProposal(true);
      setTimeout(() => setCopiedProposal(false), 2000);
    });
  };

  const handleDownloadProposed = () => {
    if (!inspectingDetail?.proposedLyrics || !inspectingDetail.track) return;
    downloadLrcFile(
      inspectingDetail.track.title,
      inspectingDetail.submitter?.displayName || "Creator",
      inspectingDetail.proposedLyrics
    );
  };

  // Pre-parse proposed lyrics with useMemo to eliminate repetitive Regex executions during audio playback
  const currentLines = useMemo(() => {
    if (!inspectingDetail?.track.lyrics) return [];
    return inspectingDetail.track.lyrics.split(/\r?\n/);
  }, [inspectingDetail?.track.lyrics]);

  const parsedProposedLines = useMemo<ParsedProposedLine[]>(() => {
    if (!inspectingDetail?.proposedLyrics) return [];
    return inspectingDetail.proposedLyrics.split(/\r?\n/).map((line, idx) => {
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
  }, [inspectingDetail?.proposedLyrics]);

  const activeLineIndex = useMemo(() => {
    if (parsedProposedLines.length === 0) return -1;
    let idx = -1;
    for (let i = 0; i < parsedProposedLines.length; i++) {
      const sec = parsedProposedLines[i].tsSeconds;
      if (sec !== null && audioCurrentTime >= sec) {
        idx = i;
      }
    }
    return idx;
  }, [parsedProposedLines, audioCurrentTime]);

  // Smooth auto-scroll active line into view during auditioning
  useEffect(() => {
    if (audioPlaying && activeLineRef.current && !isUserScrollingRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeLineIndex, audioPlaying]);

  // Approve Proposed Lyric
  const handleApproveLyric = async () => {
    setSubmittingDecision(true);
    setActionError(null);

    try {
      await lyricsApi.approveLyricSubmission(submissionId, reviewerNote.trim() || undefined);
      onDecisionSuccess("Proposed lyrics approved and published as official successfully!", "success");
      onClose();
    } catch (err: any) {
      setActionError(err.message || "Failed to approve lyric submission.");
    } finally {
      setSubmittingDecision(false);
    }
  };

  // Reject Proposed Lyric
  const handleRejectLyric = async () => {
    if (!rejectionReason.trim() || rejectionReason.trim().length < 10) {
      setActionError("A detailed rejection reason of at least 10 characters is required.");
      return;
    }

    setSubmittingDecision(true);
    setActionError(null);

    try {
      await lyricsApi.rejectLyricSubmission(
        submissionId,
        rejectionReason.trim(),
        reviewerNote.trim() || undefined
      );
      onDecisionSuccess("Lyric submission rejected. The creator has been notified with your reason.", "info");
      onClose();
    } catch (err: any) {
      setActionError(err.message || "Failed to reject lyric submission.");
    } finally {
      setSubmittingDecision(false);
    }
  };

  return createPortal(
    <div
      className="modal-backdrop"
      role="presentation"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !submittingDecision) {
          onClose();
        }
      }}
    >
      <div
        className="modal-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lyric-inspect-title"
        style={{
          background: "#FFFFFF",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "1080px",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid #E2E8F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#FAFAFA",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: "rgba(2, 132, 199, 0.1)",
                color: "#0284C7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FileTextIcon width={22} height={22} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h2 id="lyric-inspect-title" style={{ fontSize: "17px", fontWeight: 700, color: "#0F172A", margin: 0 }}>
                  {inspectingDetail?.track.title || "Review Proposed Lyrics"}
                </h2>
                {inspectingDetail?.status === "PENDING" ? (
                  <span className="staff-status-chip is-pending">
                    <i />
                    <span>Pending Review</span>
                  </span>
                ) : inspectingDetail?.status === "APPROVED" ? (
                  <span className="staff-status-chip is-approved">
                    <i />
                    <span>Approved</span>
                  </span>
                ) : inspectingDetail?.status === "REJECTED" ? (
                  <span className="staff-status-chip is-rejected">
                    <i />
                    <span>Rejected</span>
                  </span>
                ) : null}
              </div>
              <div style={{ fontSize: "12.5px", color: "#64748B", marginTop: 2 }}>
                Submitted by{" "}
                <strong style={{ color: "#334155" }}>
                  {inspectingDetail?.submitter?.displayName || inspectingDetail?.submitter?.email || "Creator"}
                </strong>{" "}
                • {formatDate(inspectingDetail?.submittedAt)}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submittingDecision}
            style={{
              background: "none",
              border: "none",
              color: "#64748B",
              cursor: "pointer",
              padding: 8,
              borderRadius: 8,
            }}
            title="Close (Esc)"
          >
            <CloseIcon width={18} height={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div
          style={{
            padding: "20px 24px",
            overflowY: "auto",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          {loadingDetail ? (
            <div className="staff-empty-state" style={{ minHeight: 280 }}>
              <span className="track-details-spinner" aria-hidden="true" />
              <p>Loading submission details...</p>
            </div>
          ) : detailError ? (
            <div className="staff-state-banner is-error">
              <AlertIcon width={24} height={24} />
              <b>Failed to load detail</b>
              <p>{detailError}</p>
            </div>
          ) : inspectingDetail ? (
            <>
              {/* Audio Auditioning Player (UC-24.6 AF02) */}
              <div
                style={{
                  background: "linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)",
                  border: "1px solid #BAE6FD",
                  borderRadius: "12px",
                  padding: "14px 18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <audio
                  ref={audioRef}
                  src={inspectingDetail.track.audioUrl}
                  preload="metadata"
                  onTimeUpdate={handleAudioTimeUpdate}
                  onLoadedMetadata={handleAudioLoadedMetadata}
                  onEnded={() => setAudioPlaying(false)}
                />

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <button
                      type="button"
                      onClick={togglePlayAudio}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: "#0284C7",
                        color: "#FFFFFF",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 2px 6px rgba(2, 132, 199, 0.3)",
                        transition: "transform 0.1s ease",
                      }}
                      title={audioPlaying ? "Pause audio" : "Play audio to audition lyrics"}
                    >
                      {audioPlaying ? <PauseIcon width={16} height={16} /> : <PlayIcon width={16} height={16} />}
                    </button>
                    <div>
                      <strong style={{ fontSize: "13.5px", color: "#0369A1", display: "block" }}>
                        Audio Auditioning Player
                      </strong>
                      <span style={{ fontSize: "12px", color: "#0284C7" }}>
                        {formatDurationSeconds(audioCurrentTime)} / {formatDurationSeconds(audioDuration || (inspectingDetail.track.durationMs / 1000))}
                      </span>
                    </div>

                    {/* Playback Speed Pill */}
                    <button
                      type="button"
                      onClick={cyclePlaybackRate}
                      style={{
                        background: "rgba(2, 132, 199, 0.15)",
                        border: "1px solid rgba(2, 132, 199, 0.3)",
                        color: "#0369A1",
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "4px 8px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        marginLeft: 6,
                      }}
                      title="Adjust playback speed for faster verification"
                    >
                      Speed: {playbackRate}x
                    </button>

                    {/* Volume Slider */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 10 }}>
                      <button
                        type="button"
                        onClick={toggleMute}
                        style={{
                          background: "none",
                          border: "none",
                          color: isMuted ? "#94A3B8" : "#0284C7",
                          cursor: "pointer",
                          padding: 4,
                          display: "flex",
                          alignItems: "center",
                        }}
                        title={isMuted ? "Unmute" : "Mute"}
                      >
                        <VolumeIcon width={15} height={15} />
                      </button>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        style={{ width: 68, cursor: "pointer", accentColor: "#0284C7" }}
                        title="Volume"
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: "12px",
                      color: "#0369A1",
                      background: "rgba(255, 255, 255, 0.7)",
                      padding: "6px 12px",
                      borderRadius: "20px",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontWeight: 500,
                    }}
                  >
                    <ClockIcon width={13} height={13} style={{ color: "#0284C7" }} />
                    <span>Auto-scrolling synchronized with audio playback. Click any timestamp to jump!</span>
                  </div>
                </div>

                {/* Scrubber Range */}
                <input
                  type="range"
                  min={0}
                  max={audioDuration || (inspectingDetail.track.durationMs / 1000) || 100}
                  step={0.1}
                  value={audioCurrentTime}
                  onChange={handleAudioSeek}
                  style={{
                    width: "100%",
                    cursor: "pointer",
                    accentColor: "#0284C7",
                  }}
                />
              </div>

              {/* Side-by-Side Diff Container */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                  minHeight: "340px",
                }}
              >
                {/* Left: Current Official Lyric */}
                <div
                  style={{
                    background: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    borderRadius: "12px",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "10px 16px",
                      background: "#F1F5F9",
                      borderBottom: "1px solid #E2E8F0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#475569" }}>
                      CURRENT OFFICIAL LYRICS
                    </span>
                    <span style={{ fontSize: "11px", color: "#64748B" }}>
                      {currentLines.length > 0 ? `${currentLines.length} lines` : "No lyrics"}
                    </span>
                  </div>

                  <div
                    style={{
                      padding: "14px 16px",
                      overflowY: "auto",
                      flex: 1,
                      maxHeight: "360px",
                      fontFamily: "monospace",
                      fontSize: "12.5px",
                      lineHeight: "1.7",
                    }}
                  >
                    {currentLines.length > 0 ? (
                      currentLines.map((line, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            gap: 12,
                            color: line.trim() ? "#334155" : "transparent",
                          }}
                        >
                          <span
                            style={{
                              width: 28,
                              color: "#94A3B8",
                              userSelect: "none",
                              textAlign: "right",
                              fontSize: 11,
                            }}
                          >
                            {idx + 1}
                          </span>
                          <span>{line || "\u00A0"}</span>
                        </div>
                      ))
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          height: "100%",
                          color: "#94A3B8",
                          gap: 6,
                          padding: 24,
                          textAlign: "center",
                        }}
                      >
                        <FileTextIcon width={32} height={32} />
                        <strong style={{ fontSize: 13, color: "#64748B" }}>No Official Lyrics Published</strong>
                        <span style={{ fontSize: 12 }}>This track currently has no official synchronized lyrics.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Proposed Lyrics */}
                <div
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #BAE6FD",
                    borderRadius: "12px",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    boxShadow: "0 2px 4px rgba(2, 132, 199, 0.04)",
                  }}
                >
                  <div
                    style={{
                      padding: "10px 16px",
                      background: "#F0F9FF",
                      borderBottom: "1px solid #BAE6FD",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#0369A1", display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#0284C7" }} />
                      PROPOSED LYRICS (NEW)
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: "11px", color: "#0284C7", fontWeight: 600 }}>
                        {parsedProposedLines.length} lines • {inspectingDetail.proposedLyrics?.split(/\s+/).filter(Boolean).length || 0} words
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyProposed}
                        style={{
                          background: "rgba(255, 255, 255, 0.8)",
                          border: "1px solid #BAE6FD",
                          borderRadius: 6,
                          padding: "3px 8px",
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#0369A1",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                        title="Copy proposed lyrics to clipboard"
                      >
                        <CopyIcon width={12} height={12} />
                        <span>{copiedProposal ? "Copied!" : "Copy"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadProposed}
                        style={{
                          background: "rgba(255, 255, 255, 0.8)",
                          border: "1px solid #BAE6FD",
                          borderRadius: 6,
                          padding: "3px 8px",
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#0369A1",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                        title="Download proposed lyrics as .lrc file"
                      >
                        <DownloadIcon width={12} height={12} />
                        <span>.LRC</span>
                      </button>
                    </div>
                  </div>

                  <div
                    onScroll={handleProposedScroll}
                    style={{
                      padding: "14px 16px",
                      overflowY: "auto",
                      flex: 1,
                      maxHeight: "360px",
                      fontFamily: "monospace",
                      fontSize: "12.5px",
                      lineHeight: "1.7",
                    }}
                  >
                    {parsedProposedLines.length > 0 ? (
                      parsedProposedLines.map((item, idx) => {
                        const isActive = idx === activeLineIndex;

                        return (
                          <div
                            key={item.lineNumber}
                            ref={isActive ? activeLineRef : null}
                            style={{
                              display: "flex",
                              gap: 10,
                              alignItems: "baseline",
                              background: isActive ? "rgba(2, 132, 199, 0.14)" : "transparent",
                              borderLeft: isActive ? "3px solid #0284C7" : "3px solid transparent",
                              borderRadius: 4,
                              padding: "2px 6px",
                              transition: "all 0.15s ease",
                            }}
                          >
                            <span
                              style={{
                                width: 24,
                                color: "#94A3B8",
                                userSelect: "none",
                                textAlign: "right",
                                fontSize: 11,
                              }}
                            >
                              {item.lineNumber}
                            </span>

                            {item.tsMatch && item.tsSeconds !== null ? (
                              <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                                <button
                                  type="button"
                                  onClick={() => handleJumpToTimestamp(item.tsSeconds!)}
                                  style={{
                                    background: "rgba(2, 132, 199, 0.12)",
                                    border: "1px solid rgba(2, 132, 199, 0.25)",
                                    color: "#0369A1",
                                    padding: "1px 6px",
                                    borderRadius: 4,
                                    fontSize: 11,
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    fontFamily: "inherit",
                                  }}
                                  title={`Jump audio to ${formatDurationSeconds(item.tsSeconds)}`}
                                >
                                  {item.tsMatch}
                                </button>
                                <span style={{ color: "#0F172A" }}>{item.text}</span>
                              </div>
                            ) : (
                              <span style={{ color: "#0F172A" }}>{item.raw || "\u00A0"}</span>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div style={{ color: "#94A3B8", padding: 16 }}>No proposed lyric content found.</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Submitter Note if any */}
              {inspectingDetail.submitterNote ? (
                <div
                  style={{
                    background: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    borderRadius: "10px",
                    padding: "12px 16px",
                    fontSize: "13px",
                  }}
                >
                  <strong style={{ color: "#475569", display: "block", marginBottom: 2 }}>Creator Note:</strong>
                  <span style={{ color: "#1E293B" }}>{inspectingDetail.submitterNote}</span>
                </div>
              ) : null}

              {/* Review Decision Info if already decided */}
              {inspectingDetail.status !== "PENDING" ? (
                <div
                  style={{
                    background: inspectingDetail.status === "APPROVED" ? "#F0FDF4" : "#FEF2F2",
                    border: inspectingDetail.status === "APPROVED" ? "1px solid #BBF7D0" : "1px solid #FECACA",
                    borderRadius: "10px",
                    padding: "14px 18px",
                    fontSize: "13px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    {inspectingDetail.status === "APPROVED" ? (
                      <CheckIcon width={16} height={16} style={{ color: "#16A34A" }} />
                    ) : (
                      <CloseIcon width={16} height={16} style={{ color: "#DC2626" }} />
                    )}
                    <strong style={{ color: inspectingDetail.status === "APPROVED" ? "#166534" : "#991B1B" }}>
                      Decision: {inspectingDetail.status}
                    </strong>
                    <span style={{ color: "#64748B" }}>
                      by {inspectingDetail.reviewer?.displayName || inspectingDetail.reviewer?.email || "Staff"} on {formatDate(inspectingDetail.reviewedAt)}
                    </span>
                  </div>

                  {inspectingDetail.rejectionReason ? (
                    <div style={{ marginTop: 6, color: "#991B1B" }}>
                      <strong>Rejection Reason:</strong> {inspectingDetail.rejectionReason}
                    </div>
                  ) : null}

                  {inspectingDetail.reviewerNote ? (
                    <div style={{ marginTop: 4, color: "#475569" }}>
                      <strong>Internal Note:</strong> {inspectingDetail.reviewerNote}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {/* Action Error Banner */}
              {actionError ? (
                <div className="staff-state-banner is-error" style={{ margin: 0 }}>
                  <AlertIcon width={18} height={18} />
                  <span>{actionError}</span>
                </div>
              ) : null}

              {/* Decision Form for Pending Submissions */}
              {inspectingDetail.status === "PENDING" && (
                <div
                  style={{
                    background: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    borderRadius: "12px",
                    padding: "16px 20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <label style={{ fontSize: "13px", fontWeight: 600, color: "#334155" }}>
                      Reviewer Internal Note (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Add internal notes for staff audit logs..."
                      value={reviewerNote}
                      onChange={(e) => setReviewerNote(e.target.value)}
                      disabled={submittingDecision}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "8px",
                        border: "1px solid #CBD5E1",
                        fontSize: "13px",
                      }}
                    />
                  </div>

                  {showRejectForm ? (
                    <div
                      style={{
                        background: "#FEF2F2",
                        border: "1px solid #FECACA",
                        borderRadius: "8px",
                        padding: "14px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <strong style={{ fontSize: "13px", color: "#991B1B" }}>
                          Reason for Rejection (Required, min 10 characters)
                        </strong>
                        <span style={{ fontSize: "11px", color: rejectionReason.trim().length >= 10 ? "#16A34A" : "#DC2626" }}>
                          {rejectionReason.trim().length} / 10 chars minimum
                        </span>
                      </div>

                      {/* Quick Reason Presets */}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                        <span style={{ fontSize: "11px", color: "#991B1B", fontWeight: 600 }}>Quick presets:</span>
                        {REJECT_PRESETS.map((p, pIdx) => (
                          <button
                            key={pIdx}
                            type="button"
                            onClick={() => setRejectionReason(p.text)}
                            style={{
                              fontSize: "11px",
                              padding: "3px 8px",
                              borderRadius: "6px",
                              background: "#FFFFFF",
                              border: "1px solid #FECACA",
                              color: "#991B1B",
                              cursor: "pointer",
                              transition: "all 0.15s ease",
                            }}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                      <textarea
                        rows={3}
                        placeholder="Explain clearly to the creator what is wrong (e.g. lyrics desynchronized after 00:45, offensive wording, wrong song)..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        disabled={submittingDecision}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          borderRadius: "6px",
                          border: "1px solid #FCA5A5",
                          fontSize: "13px",
                          resize: "vertical",
                        }}
                      />
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <button
                          type="button"
                          className="button button-secondary button-small"
                          onClick={() => setShowRejectForm(false)}
                          disabled={submittingDecision}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="button button-danger button-small"
                          onClick={handleRejectLyric}
                          disabled={submittingDecision || rejectionReason.trim().length < 10}
                          style={{ background: "#DC2626", color: "#FFFFFF" }}
                        >
                          {submittingDecision ? "Rejecting..." : "Confirm Reject"}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #E2E8F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#FAFAFA",
          }}
        >
          <button
            type="button"
            className="button button-secondary"
            onClick={onClose}
            disabled={submittingDecision}
          >
            Close
          </button>

          {inspectingDetail?.status === "PENDING" && !showRejectForm ? (
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setShowRejectForm(true)}
                disabled={submittingDecision}
                style={{ color: "#DC2626", borderColor: "#FECACA" }}
              >
                Reject Lyric...
              </button>
              <button
                type="button"
                className="button button-primary"
                onClick={handleApproveLyric}
                disabled={submittingDecision}
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <CheckIcon width={16} height={16} />
                <span>{submittingDecision ? "Approving..." : "Approve & Publish Official Lyric"}</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  );
}

// =========================================================================
// MAIN PAGE COMPONENT: StaffLyricsManagementPage
// =========================================================================
export function StaffLyricsManagementPage() {
  // Notification State
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    type: "success" | "error" | "info" | "warning";
  }>({ open: false, message: "", type: "success" });

  // -------------------------------------------------------------
  // LYRIC MODERATION QUEUE STATE (UC-24.6)
  // -------------------------------------------------------------
  const [modStats, setModStats] = useState<SubmissionStats | null>(null);
  const [modPage, setModPage] = useState<PageResponse<SubmissionQueueItem> | null>(null);
  const [modStatusFilter, setModStatusFilter] = useState<ModStatusFilter>("PENDING");
  const [modSearch, setModSearch] = useState("");
  const [debouncedModSearch, setDebouncedModSearch] = useState("");
  const [modPageIndex, setModPageIndex] = useState(0);
  const [modLoading, setModLoading] = useState(true);
  const [modRefreshing, setModRefreshing] = useState(false);
  const modRequestIdRef = useRef(0);

  // Inspection Modal ID
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<number | null>(null);

  const anyModalOpen = selectedSubmissionId !== null;
  useModalScrollLock(anyModalOpen);

  // Global escape key listener
  useEffect(() => {
    if (!anyModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedSubmissionId !== null) setSelectedSubmissionId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [anyModalOpen, selectedSubmissionId]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedModSearch(modSearch);
      setModPageIndex(0);
    }, 350);
    return () => clearTimeout(timer);
  }, [modSearch]);

  const handleModSearchSubmit = (event?: React.FormEvent) => {
    event?.preventDefault();
    const trimmed = modSearch.trim();
    if (trimmed === debouncedModSearch && modPageIndex === 0) {
      void loadModQueue(true);
    } else {
      setDebouncedModSearch(trimmed);
      setModPageIndex(0);
    }
  };

  const handleClearModSearch = () => {
    setModSearch("");
    if (debouncedModSearch === "" && modPageIndex === 0) {
      void loadModQueue(true);
    } else {
      setDebouncedModSearch("");
      setModPageIndex(0);
    }
  };

  // Load Lyric Moderation Stats & Queue
  const loadModStats = async () => {
    try {
      const stats = await lyricsApi.getLyricSubmissionStats();
      setModStats(stats);
    } catch (err) {
      console.error("Failed to load lyric moderation stats", err);
    }
  };

  const loadModQueue = async (isManual = false) => {
    const reqId = ++modRequestIdRef.current;
    if (isManual) setModRefreshing(true);
    else setModLoading(true);

    try {
      const [queueData] = await Promise.all([
        lyricsApi.getLyricSubmissions({
          status: modStatusFilter,
          search: debouncedModSearch,
          page: modPageIndex,
          size: 10,
        }),
        loadModStats(),
      ]);

      if (reqId === modRequestIdRef.current) {
        setModPage(queueData);
      }
    } catch (err: any) {
      if (reqId === modRequestIdRef.current) {
        setNotification({
          open: true,
          message: err.message || "Failed to load lyric moderation queue.",
          type: "error",
        });
      }
    } finally {
      if (reqId === modRequestIdRef.current) {
        setModLoading(false);
        setModRefreshing(false);
      }
    }
  };

  useEffect(() => {
    void loadModQueue();
  }, [modStatusFilter, debouncedModSearch, modPageIndex]);

  return (
    <div className="ops-dashboard ops-dashboard--staff">
      <div className="mod-track-view">
        {/* Top Executive Header */}
        <header className="staff-hero-banner">
          <div className="staff-hero-copy">
            <div className="staff-hero-title-row">
              <span className="staff-hero-title-icon" aria-hidden="true">
                <ShieldIcon width={18} height={18} />
              </span>
              <h1 className="staff-hero-title">Proposed Lyrics Queue</h1>
              {modStats?.pendingCount ? (
                <span
                  className="staff-tab-count"
                  style={{
                    background: "var(--ops-amber, #F59E0B)",
                    color: "#FFFFFF",
                    fontSize: "12px",
                    fontWeight: 700,
                    padding: "3px 9px",
                    borderRadius: "12px",
                  }}
                >
                  {modStats.pendingCount} pending
                </span>
              ) : null}
            </div>

            <p className="staff-hero-description">
              Review and approve or reject track lyric update proposals submitted by creators.
            </p>
          </div>
        </header>

        {/* Main Review Workspace Panel */}
        <section className="staff-queue-panel">
          {/* Toolbar: Segmented Filter Tabs & Instant Search */}
          <div className="staff-filter-toolbar">
            <div className="staff-segmented-tabs" role="tablist" aria-label="Lyric submission status tabs">
              <button
                type="button"
                role="tab"
                aria-selected={modStatusFilter === "PENDING"}
                className={`staff-segment-btn ${modStatusFilter === "PENDING" ? "is-active" : ""}`}
                    onClick={() => {
                      setModStatusFilter("PENDING");
                      setModPageIndex(0);
                    }}
                  >
                    <span className="staff-tab-dot is-amber" />
                    <span>Pending</span>
                    <span className="staff-tab-count">{modStats?.pendingCount ?? 0}</span>
                  </button>

                  <button
                    type="button"
                    role="tab"
                    aria-selected={modStatusFilter === "APPROVED"}
                    className={`staff-segment-btn ${modStatusFilter === "APPROVED" ? "is-active" : ""}`}
                    onClick={() => {
                      setModStatusFilter("APPROVED");
                      setModPageIndex(0);
                    }}
                  >
                    <span className="staff-tab-dot is-green" />
                    <span>Approved</span>
                    <span className="staff-tab-count">{modStats?.approvedCount ?? 0}</span>
                  </button>

                  <button
                    type="button"
                    role="tab"
                    aria-selected={modStatusFilter === "REJECTED"}
                    className={`staff-segment-btn ${modStatusFilter === "REJECTED" ? "is-active" : ""}`}
                    onClick={() => {
                      setModStatusFilter("REJECTED");
                      setModPageIndex(0);
                    }}
                  >
                    <span className="staff-tab-dot is-red" />
                    <span>Rejected</span>
                    <span className="staff-tab-count">{modStats?.rejectedCount ?? 0}</span>
                  </button>

                  <button
                    type="button"
                    role="tab"
                    aria-selected={modStatusFilter === "ALL"}
                    className={`staff-segment-btn ${modStatusFilter === "ALL" ? "is-active" : ""}`}
                    onClick={() => {
                      setModStatusFilter("ALL");
                      setModPageIndex(0);
                    }}
                  >
                    <span className="staff-tab-dot is-cyan" />
                    <span>All History</span>
                    <span className="staff-tab-count">{modStats?.totalCount ?? 0}</span>
                  </button>
                </div>

                {/* Search Box */}
                <form className="staff-search-wrapper" onSubmit={handleModSearchSubmit} role="search">
                  <div className="staff-search-input-box">
                    <button
                      type="submit"
                      className="staff-search-icon-btn"
                      aria-label="Execute search"
                      title="Search"
                    >
                      <SearchIcon width={16} height={16} className="staff-search-icon" />
                    </button>
                    <input
                      type="text"
                      placeholder="Search by track title, creator, or email..."
                      value={modSearch}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setModSearch(e.target.value)}
                      className="staff-search-input"
                      aria-label="Search lyric proposals"
                    />
                    {modSearch ? (
                      <button
                        type="button"
                        className="staff-search-clear-btn"
                        onClick={handleClearModSearch}
                        aria-label="Clear search query"
                        title="Clear search"
                      >
                        <CloseIcon width={14} height={14} />
                      </button>
                    ) : null}
                  </div>
                  <button
                    type="submit"
                    className="button button-primary staff-search-submit-btn"
                    aria-label="Search lyric proposals"
                  >
                    <SearchIcon width={15} height={15} />
                    <span>Search</span>
                  </button>
                </form>
              </div>

              {/* Content: Loading Skeleton / Error / Empty State / Queue Cards */}
              {modLoading ? (
                <div
                  className="staff-skeletons-container"
                  aria-busy="true"
                  aria-label="Loading lyric submissions from server"
                >
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="staff-skeleton-card">
                      <div className="staff-skeleton-thumb" />
                      <div className="staff-skeleton-meta">
                        <div className="staff-skeleton-bar is-long" />
                        <div className="staff-skeleton-bar is-short" />
                      </div>
                      <div className="staff-skeleton-pill" />
                      <div className="staff-skeleton-btns" />
                    </div>
                  ))}
                </div>
              ) : !modPage || modPage.content.length === 0 ? (
                <div className="staff-empty-box" role="status" aria-live="polite">
                  <div className="staff-empty-circle">
                    <CheckIcon width={36} height={36} />
                  </div>
                  <h3 className="staff-empty-title">
                    {debouncedModSearch
                      ? "No matching lyric proposals found."
                      : modStatusFilter === "PENDING"
                      ? "Lyric Moderation Queue Is Clear!"
                      : "No lyric proposals recorded"}
                  </h3>
                  <p className="staff-empty-description">
                    {debouncedModSearch
                      ? `No lyric submissions matched "${debouncedModSearch}". Try adjusting keywords or clear the filter.`
                      : modStatusFilter === "PENDING"
                      ? "All creator lyric proposals have been reviewed and processed. Great job!"
                      : `There are currently no proposals under the ${modStatusFilter.toLowerCase()} tab.`}
                  </p>
                  {debouncedModSearch ? (
                    <button
                      type="button"
                      className="button button-secondary button-small"
                      onClick={handleClearModSearch}
                    >
                      Reset / Clear
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="button button-secondary button-small"
                      onClick={() => void loadModQueue(true)}
                    >
                      Refresh Queue
                    </button>
                  )}
                </div>
              ) : (
                <div className="staff-track-cards-list">
                  {modPage.content.map((item) => (
                    <article
                      className={`staff-track-card ${item.status === "PENDING" ? "is-pending-track" : ""}`}
                      key={item.id}
                    >
                      <div className="staff-track-primary-content">
                        {/* Track artwork */}
                        <div className="staff-thumb-container">
                          <img
                            src={
                              item.coverUrl ||
                              "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400"
                            }
                            alt={item.trackTitle}
                            className="staff-thumb-image"
                          />
                          <button
                            type="button"
                            className="staff-thumb-inspect-btn"
                            onClick={() => setSelectedSubmissionId(item.id)}
                            title="Inspect proposed lyrics"
                            aria-label={`Inspect ${item.trackTitle}`}
                          >
                            <EyeIcon width={17} height={17} />
                          </button>
                        </div>

                        {/* Track & artist metadata */}
                        <div
                          className="staff-track-meta-section"
                          onClick={() => setSelectedSubmissionId(item.id)}
                        >
                          <div className="staff-track-name-row">
                            <button
                              type="button"
                              className="staff-track-title-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSubmissionId(item.id);
                              }}
                              title={`View details ${item.trackTitle}`}
                            >
                              {item.trackTitle}
                            </button>

                            {/* Lyric Update badge */}
                            <span className="staff-tag-badge is-single" title="Proposed Lyric Update">
                              <FileTextIcon width={12} height={12} />
                              <span>Lyric Update</span>
                            </span>

                            {item.albumTitle ? (
                              <span className="staff-meta-pill is-album">{item.albumTitle}</span>
                            ) : null}

                            {item.durationMs ? (
                              <span className="staff-meta-pill is-duration">
                                {formatDurationMs(item.durationMs)}
                              </span>
                            ) : null}
                          </div>

                          <div className="staff-creator-row">
                            <span className="staff-creator-label">
                              <UserIcon width={13} height={13} />
                              <b>{item.submitterDisplayName || "Unknown Creator"}</b>
                              {item.submitterEmail ? (
                                <span className="staff-creator-email">({item.submitterEmail})</span>
                              ) : null}
                            </span>

                            <span className="staff-queue-time-chip">
                              <ClockIcon width={12} height={12} />
                              <span>{formatRelativeTime(item.submittedAt)}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="staff-track-secondary-content">
                        {/* Moderation status */}
                        <div className="staff-track-status-col">
                          <span
                            className={`staff-status-chip ${
                              item.status === "APPROVED"
                                ? "is-approved"
                                : item.status === "REJECTED"
                                ? "is-rejected"
                                : "is-pending"
                            }`}
                          >
                            <i />
                            <span>
                              {item.status === "APPROVED"
                                ? "Approved"
                                : item.status === "REJECTED"
                                ? "Rejected"
                                : "Pending"}
                            </span>
                          </span>
                        </div>

                        {/* Action Button */}
                        <div className="staff-track-actions-col">
                          <button
                            type="button"
                            className="staff-btn-review"
                            onClick={() => setSelectedSubmissionId(item.id)}
                            title="Review proposed lyrics"
                          >
                            <EyeIcon width={15} height={15} />
                            <span>{item.status === "PENDING" ? "Review Lyrics" : "View Decision"}</span>
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {/* Pagination Controls */}
              {modPage && modPage.totalPages > 1 ? (
                <div className="staff-pagination-bar" aria-label="Queue pagination">
                  <button
                    type="button"
                    disabled={modPage.first}
                    onClick={() => setModPageIndex((p) => Math.max(0, p - 1))}
                    className="staff-page-btn"
                    aria-label="Previous page"
                  >
                    ← Previous
                  </button>
                  <span className="staff-page-indicator">
                    Page <b>{modPage.number + 1}</b> of {modPage.totalPages} ({modPage.totalElements} submissions)
                  </span>
                  <button
                    type="button"
                    disabled={modPage.last}
                    onClick={() => setModPageIndex((p) => p + 1)}
                    className="staff-page-btn"
                    aria-label="Next page"
                  >
                    Next →
                  </button>
                </div>
              ) : null}
            </section>
    </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: INSPECT & DECIDE LYRIC SUBMISSION (ISOLATED COMPONENT) */}
      {/* ------------------------------------------------------------- */}
      {selectedSubmissionId !== null && (
        <LyricInspectionModal
          submissionId={selectedSubmissionId}
          onClose={() => setSelectedSubmissionId(null)}
          onDecisionSuccess={(message, type) => {
            setNotification({ open: true, message, type });
            void loadModQueue(true);
          }}
        />
      )}

      {/* Center Notification Popup */}
      <CenterNotificationPopup
        open={notification.open}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}
