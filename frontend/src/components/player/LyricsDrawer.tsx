import { useEffect, useMemo, useRef, useState } from "react";
import { lyricsApi } from "../../api/lyrics";
import { parseLyricsToLines, formatTimeDisplay, LyricLine } from "../common/LyricSyncTab";
import { CenterNotificationPopup } from "../modals/CenterNotificationPopup";
import { downloadLrcFile } from "../../utils/lyricsDownload";
import {
  AlertIcon,
  CheckIcon,
  CloseIcon,
  CopyIcon,
  DownloadIcon,
  FileTextIcon,
  FlagIcon,
  MaximizeIcon,
  MinimizeIcon,
  MusicIcon,
  PlusIcon,
  RefreshIcon,
  UserIcon,
} from "../../icons";
import type { LandingTrack, TrackLyricsBundle } from "../../types";

export type LyricsDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  currentTrack: LandingTrack | null;
  audio: HTMLAudioElement;
  playing: boolean;
  isAuthenticated: boolean;
  onNavigate?: (route: string) => void;
  onCreateCustomLyrics?: (trackId: number) => void;
};

export function LyricsDrawer({
  isOpen,
  onClose,
  currentTrack,
  audio,
  playing,
  isAuthenticated,
  onNavigate,
  onCreateCustomLyrics,
}: LyricsDrawerProps) {
  const [lyricsBundle, setLyricsBundle] = useState<TrackLyricsBundle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [activeSource, setActiveSource] = useState<"OFFICIAL" | "PERSONAL">("OFFICIAL");
  const [currentTime, setCurrentTime] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [fontSize, setFontSize] = useState<"NORMAL" | "LARGE" | "XLARGE">("NORMAL");
  const [duration, setDuration] = useState(0);
  const [toastNotification, setToastNotification] = useState<{
    open: boolean;
    message: string;
    type: "success" | "error" | "info" | "warning";
  }>({ open: false, message: "", type: "success" });

  const activeLineRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const isUserScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<number | null>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isFullScreen) setIsFullScreen(false);
        else onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isFullScreen, onClose]);

  // Load lyrics for the active track
  const loadLyrics = async () => {
    if (!currentTrack?.id) {
      setLyricsBundle(null);
      return;
    }
    setLoading(true);
    setError(false);
    try {
      const bundle = await lyricsApi.getTrackLyrics(currentTrack.id);
      setLyricsBundle(bundle);
    } catch {
      setError(true);
      setLyricsBundle(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && currentTrack?.id) {
      void loadLyrics();
    }
  }, [isOpen, currentTrack?.id]);

  // Track real-time audio playback position and duration
  useEffect(() => {
    if (!audio) return;
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    if (audio.duration && !isNaN(audio.duration)) {
      setDuration(audio.duration);
    }
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [audio]);

  // Determine active lyric content
  const officialContent = lyricsBundle?.officialLyric?.lyricContent ?? currentTrack?.lyrics ?? null;
  const personalContent = lyricsBundle?.userPersonalLyric?.lyricContent ?? null;
  const rawContent = activeSource === "OFFICIAL" ? officialContent : personalContent;

  // Parse lines using standard LRC parser
  const parsedLines: LyricLine[] = useMemo(() => {
    if (!rawContent) return [];
    try {
      return parseLyricsToLines(rawContent);
    } catch {
      return [];
    }
  }, [rawContent]);

  const hasTimestamps = useMemo(
    () => parsedLines.some((line) => line.timeSec !== null),
    [parsedLines]
  );

  // Compute active line index according to currentTime
  const activeLineIndex = useMemo(() => {
    if (!hasTimestamps || parsedLines.length === 0) return -1;
    let index = -1;
    for (let i = 0; i < parsedLines.length; i++) {
      const lineTime = parsedLines[i].timeSec;
      if (lineTime !== null && currentTime >= lineTime) {
        index = i;
      }
    }
    return index;
  }, [parsedLines, currentTime, hasTimestamps]);

  // Auto-scroll active line into center view
  useEffect(() => {
    if (activeLineRef.current && !isUserScrollingRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeLineIndex]);

  // Detect user manual scroll to avoid fighting auto-scroll
  const handleScroll = () => {
    isUserScrollingRef.current = true;
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = window.setTimeout(() => {
      isUserScrollingRef.current = false;
    }, 2500);
  };

  // Click-to-seek (UC-16.1 NF01 Step 6)
  const handleLineClick = (timeSec: number | null) => {
    if (timeSec === null || !audio) return;
    audio.currentTime = Math.max(0, timeSec);
    if (audio.paused) {
      void audio.play().catch(() => {});
    }
  };

  const handleCopyLyrics = () => {
    if (!rawContent) return;
    const cleanText = rawContent
      .split(/\r?\n/)
      .map((l) => l.replace(/^\[\d{1,2}:\d{2}(?:\.\d{1,3})?\]\s*/, ""))
      .join("\n");
    void navigator.clipboard.writeText(cleanText).then(() => {
      setToastNotification({
        open: true,
        message: "Lyrics copied to clipboard!",
        type: "success",
      });
    });
  };

  const handleCreateCustom = () => {
    if (!currentTrack?.id) return;
    if (onCreateCustomLyrics) {
      onCreateCustomLyrics(currentTrack.id);
    } else if (onNavigate) {
      onClose();
      onNavigate(`/tracks/${currentTrack.id}`);
    }
  };

  const cycleFontSize = () => {
    setFontSize((prev) => (prev === "NORMAL" ? "LARGE" : prev === "LARGE" ? "XLARGE" : "NORMAL"));
  };

  const getLineFontSize = (isActive: boolean) => {
    if (isFullScreen) {
      if (fontSize === "XLARGE") return isActive ? "32px" : "24px";
      if (fontSize === "LARGE") return isActive ? "28px" : "22px";
      return isActive ? "25px" : "19px";
    }
    if (fontSize === "XLARGE") return isActive ? "18.5px" : "16px";
    if (fontSize === "LARGE") return isActive ? "17px" : "15px";
    return isActive ? "16px" : "14px";
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop: only active in standard drawer mode */}
      {!isFullScreen && (
        <div
          className="queue-drawer-backdrop queue-drawer-backdrop--open"
          onClick={onClose}
          aria-hidden="true"
          style={{ zIndex: 54 }}
        />
      )}

      {/* Main Drawer or Fullscreen Karaoke Container */}
      <aside
        className={`queue-drawer queue-drawer--open ${isFullScreen ? "lyrics-drawer--fullscreen" : ""}`}
        aria-label="Synchronous Lyrics Viewer"
      >
        {/* Ambient Glow Background Reflection (Fullscreen Theater Mode) */}
        {isFullScreen && currentTrack?.coverUrl && (
          <div
            className="lyrics-ambient-glow"
            style={{
              position: "absolute",
              inset: -60,
              backgroundImage: `url(${currentTrack.coverUrl})`,
              backgroundPosition: "center",
              backgroundSize: "cover",
              filter: "blur(90px) saturate(180%) brightness(0.95)",
              opacity: 0.28,
              pointerEvents: "none",
              zIndex: 0,
              transform: "scale(1.2)",
              transition: "background-image 0.5s ease",
            }}
            aria-hidden="true"
          />
        )}

        {/* Pinned Top Lyrics Toolbar & Track Info Header */}
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 20,
            background: "rgba(253, 250, 244, 0.98)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderBottom: "1px solid #e8dcba",
            boxShadow: "0 2px 12px rgba(0, 0, 0, 0.03)",
            flexShrink: 0,
          }}
        >
          {/* Header Bar */}
        <div
          className="queue-drawer-header"
          style={{
            padding: isFullScreen ? "0 28px" : "0 12px",
            borderBottom: currentTrack ? "1px solid rgba(232, 220, 203, 0.6)" : "none",
            background: "transparent",
            position: "relative",
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 6,
          }}
        >
          {/* Tabs: compact in drawer mode to guarantee all buttons fit */}
          <div className="queue-drawer-tabs" style={{ display: "flex", gap: 4, minWidth: 0, flexShrink: 1 }}>
            <button
              type="button"
              className={`queue-tab ${activeSource === "OFFICIAL" ? "queue-tab--active" : ""}`}
              onClick={() => setActiveSource("OFFICIAL")}
              style={{
                padding: isFullScreen ? "6px 14px" : "5px 8px",
                fontSize: isFullScreen ? "12.5px" : "11.5px",
                whiteSpace: "nowrap",
                display: "inline-flex",
                alignItems: "center",
              }}
              title="Official Verified Lyrics"
            >
              <span>{isFullScreen ? "Official Lyrics" : "Official"}</span>
              {officialContent && (
                <span
                  style={{
                    marginLeft: 4,
                    padding: isFullScreen ? "1px 6px" : "1px 4px",
                    borderRadius: 999,
                    fontSize: isFullScreen ? 10 : 9,
                    fontWeight: 700,
                    background: "#ecfdf3",
                    color: "#027a48",
                  }}
                >
                  {isFullScreen ? "Verified" : "✓"}
                </span>
              )}
            </button>
            <button
              type="button"
              className={`queue-tab ${activeSource === "PERSONAL" ? "queue-tab--active" : ""}`}
              onClick={() => setActiveSource("PERSONAL")}
              style={{
                padding: isFullScreen ? "6px 14px" : "5px 8px",
                fontSize: isFullScreen ? "12.5px" : "11.5px",
                whiteSpace: "nowrap",
                display: "inline-flex",
                alignItems: "center",
              }}
              title="My Personal Custom Lyrics"
            >
              <span>{isFullScreen ? "My Lyrics" : "Custom"}</span>
              {personalContent && (
                <span
                  style={{
                    marginLeft: 4,
                    padding: isFullScreen ? "1px 6px" : "1px 4px",
                    borderRadius: 999,
                    fontSize: isFullScreen ? 10 : 9,
                    fontWeight: 700,
                    background:
                      lyricsBundle?.userPersonalLyric?.lyricType === "TRANSLATION"
                        ? "#eff6ff"
                        : "#fef3c7",
                    color:
                      lyricsBundle?.userPersonalLyric?.lyricType === "TRANSLATION"
                        ? "#1d4ed8"
                        : "#b45309",
                  }}
                >
                  {isFullScreen
                    ? lyricsBundle?.userPersonalLyric?.lyricType === "TRANSLATION"
                      ? "Translation"
                      : "Custom"
                    : "★"}
                </span>
              )}
            </button>
          </div>

          {/* Action Toolbar: Guaranteed visible with flexShrink: 0 and compact sizing */}
          <div style={{ display: "flex", alignItems: "center", gap: isFullScreen ? 6 : 3, flexShrink: 0 }}>
            {/* Font Size Toggle Button */}
            {rawContent && (
              <button
                type="button"
                className="queue-close-btn"
                onClick={cycleFontSize}
                title={`Font Size: ${fontSize === "NORMAL" ? "Standard" : fontSize === "LARGE" ? "Large" : "Extra Large"}`}
                aria-label="Adjust font size"
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  width: isFullScreen ? "auto" : "26px",
                  height: isFullScreen ? "34px" : "28px",
                  padding: isFullScreen ? "0 8px" : "0",
                  borderRadius: "6px",
                }}
              >
                <span>A{fontSize === "NORMAL" ? "" : fontSize === "LARGE" ? "+" : "++"}</span>
              </button>
            )}

            {/* Copy Lyrics Text */}
            {rawContent && (
              <button
                type="button"
                className="queue-close-btn"
                onClick={handleCopyLyrics}
                title="Copy lyrics to clipboard"
                aria-label="Copy lyrics to clipboard"
                style={{
                  width: isFullScreen ? "34px" : "28px",
                  height: isFullScreen ? "34px" : "28px",
                }}
              >
                <CopyIcon width={isFullScreen ? 16 : 14} height={isFullScreen ? 16 : 14} />
              </button>
            )}

            {/* Download .LRC */}
            {rawContent && (
              <button
                type="button"
                className="queue-close-btn"
                onClick={() => {
                  downloadLrcFile(
                    currentTrack?.title || "lyrics",
                    currentTrack?.creator?.displayName,
                    rawContent
                  );
                }}
                title="Download lyrics as .lrc file"
                aria-label="Download lyrics as .lrc file"
                style={{
                  width: isFullScreen ? "34px" : "28px",
                  height: isFullScreen ? "34px" : "28px",
                }}
              >
                <DownloadIcon width={isFullScreen ? 16 : 14} height={isFullScreen ? 16 : 14} />
              </button>
            )}

            {/* Toggle Fullscreen / Karaoke Mode */}
            <button
              type="button"
              className="queue-close-btn"
              onClick={() => setIsFullScreen((prev) => !prev)}
              aria-label={isFullScreen ? "Exit Fullscreen" : "Fullscreen Karaoke"}
              title={isFullScreen ? "Exit Fullscreen" : "Fullscreen Karaoke View"}
              style={{
                width: isFullScreen ? "34px" : "30px",
                height: isFullScreen ? "34px" : "30px",
                color: "#0284c7",
                background: isFullScreen ? "rgba(2, 132, 199, 0.14)" : "rgba(2, 132, 199, 0.08)",
                borderRadius: "8px",
              }}
            >
              {isFullScreen ? (
                <MinimizeIcon width={isFullScreen ? 16 : 15} height={isFullScreen ? 16 : 15} />
              ) : (
                <MaximizeIcon width={isFullScreen ? 16 : 15} height={isFullScreen ? 16 : 15} />
              )}
            </button>

            {/* Close Drawer */}
            <button
              type="button"
              className="queue-close-btn"
              onClick={onClose}
              aria-label="Close Lyrics Drawer"
              title="Close Lyrics"
              style={{
                width: isFullScreen ? "34px" : "28px",
                height: isFullScreen ? "34px" : "28px",
              }}
            >
              <CloseIcon width={isFullScreen ? 16 : 14} height={isFullScreen ? 16 : 14} />
            </button>
          </div>
        </div>

        {/* Track Now Playing Context Card */}
        {currentTrack && (
          <div
            style={{
              padding: isFullScreen ? "20px 48px" : "14px 20px",
              borderBottom: "1px solid #e8dccb",
              background: "rgba(255, 255, 255, 0.65)",
              display: "flex",
              alignItems: "center",
              gap: 14,
              flexShrink: 0,
            }}
          >
            {currentTrack.coverUrl ? (
              <img
                src={currentTrack.coverUrl}
                alt=""
                style={{
                  width: isFullScreen ? 54 : 44,
                  height: isFullScreen ? 54 : 44,
                  borderRadius: 10,
                  objectFit: "cover",
                }}
              />
            ) : (
              <span
                style={{
                  width: isFullScreen ? 54 : 44,
                  height: isFullScreen ? 54 : 44,
                  borderRadius: 10,
                  background: "#e0f2fe",
                  color: "#0284c7",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <MusicIcon width={22} height={22} />
              </span>
            )}
            <div style={{ minWidth: 0, flex: 1 }}>
              <strong
                style={{
                  display: "block",
                  color: "#1c1917",
                  fontSize: isFullScreen ? 18 : 14.5,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {currentTrack.title}
              </strong>
              <span
                style={{
                  display: "block",
                  color: "#57534e",
                  fontSize: isFullScreen ? 14 : 12.5,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {currentTrack.creator?.displayName ?? "Unknown Creator"}
              </span>
            </div>
            {hasTimestamps && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "4px 8px",
                  borderRadius: 6,
                  background: "#e0f2fe",
                  color: "#0284c7",
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: "monospace",
                }}
              >
                SYNCED LRC
              </span>
            )}
          </div>
        )}
        </div>

        {/* Scrollable Synchronous Lyrics Body */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="queue-drawer-body"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: isFullScreen ? "40px 15% 90px" : "24px 20px 80px",
            textAlign: isFullScreen ? "center" : "left",
          }}
        >
          {loading ? (
            <div
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                color: "#786f65",
              }}
            >
              <span className="track-details-spinner" aria-hidden="true" />
              <p style={{ margin: 0, fontSize: 13.5 }}>Loading lyrics...</p>
            </div>
          ) : error ? (
            /* EX02: Network / Loading Exception */
            <div
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                color: "#786f65",
                textAlign: "center",
              }}
            >
              <AlertIcon width={32} height={32} />
              <strong style={{ color: "#1c1917", fontSize: 15 }}>
                Unable to load lyrics
              </strong>
              <span style={{ fontSize: 13, maxWidth: 280 }}>
                A network error occurred while fetching the lyric data.
              </span>
              <button
                type="button"
                className="button button-secondary button-small"
                onClick={() => void loadLyrics()}
                style={{ marginTop: 8 }}
              >
                <RefreshIcon width={13} height={13} />
                <span>Retry</span>
              </button>
            </div>
          ) : activeSource === "OFFICIAL" ? (
            /* Official Lyrics Content */
            officialContent ? (
              hasTimestamps ? (
                /* NF01: Real-time Synchronized Scrolling Karaoke Lines */
                <div style={{ display: "flex", flexDirection: "column", gap: isFullScreen ? 24 : 14 }}>
                  {parsedLines.map((line, idx) => {
                    const isActive = idx === activeLineIndex;
                    return (
                      <div
                        key={line.id}
                        ref={isActive ? activeLineRef : null}
                        onClick={() => handleLineClick(line.timeSec)}
                        style={{
                          padding: isFullScreen ? "12px 24px" : "8px 12px",
                          borderRadius: 12,
                          cursor: line.timeSec !== null ? "pointer" : "default",
                          transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                          background: isActive
                            ? "rgba(2, 132, 199, 0.12)"
                            : "transparent",
                          color: isActive
                            ? "#0284c7"
                            : idx < activeLineIndex
                            ? "#8d877f"
                            : "#57534e",
                          transform: isActive
                            ? isFullScreen
                              ? "scale(1.08)"
                              : "scale(1.02)"
                            : "scale(1)",
                          fontWeight: isActive ? 700 : 500,
                          fontSize: getLineFontSize(isActive),
                          lineHeight: 1.6,
                          display: "flex",
                          alignItems: isFullScreen ? "center" : "baseline",
                          justifyContent: isFullScreen ? "center" : "flex-start",
                          gap: 12,
                        }}
                        title={
                          line.timeSec !== null
                            ? `Click to jump audio to ${formatTimeDisplay(line.timeSec)}`
                            : undefined
                        }
                      >
                        {!isFullScreen && line.timeSec !== null && (
                          <span
                            className="track-lyrics-time-chip"
                            style={{
                              background: isActive ? "#0284c7" : undefined,
                              color: isActive ? "#ffffff" : undefined,
                            }}
                          >
                            {formatTimeDisplay(line.timeSec)}
                          </span>
                        )}
                        <span>{line.text || "\u00A0"}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* AF02: Static Plain Text */
                <pre
                  style={{
                    fontFamily: "inherit",
                    fontSize: isFullScreen
                      ? fontSize === "XLARGE" ? 22 : fontSize === "LARGE" ? 19 : 17
                      : fontSize === "XLARGE" ? 17 : fontSize === "LARGE" ? 15.5 : 14,
                    lineHeight: 2.1,
                    color: "#344054",
                    whiteSpace: "pre-wrap",
                    margin: 0,
                  }}
                >
                  {officialContent}
                </pre>
              )
            ) : (
              /* AF01: Empty State when track has no official lyrics */
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  color: "#8d877f",
                  textAlign: "center",
                  padding: "40px 20px",
                }}
              >
                <FileTextIcon width={36} height={36} />
                <strong style={{ color: "#1c1917", fontSize: 16 }}>
                  No official lyrics available
                </strong>
                <span style={{ fontSize: 13, maxWidth: 300, lineHeight: 1.5 }}>
                  Official verified lyrics have not been provided for this track yet.
                </span>
                {isAuthenticated && currentTrack?.id && (
                  <button
                    type="button"
                    className="button button-secondary"
                    style={{ marginTop: 14 }}
                    onClick={() => {
                      setActiveSource("PERSONAL");
                      handleCreateCustom();
                    }}
                  >
                    <PlusIcon width={14} height={14} />
                    <span>Create Custom Lyrics</span>
                  </button>
                )}
              </div>
            )
          ) : (
            /* Personal Lyrics Content */
            !isAuthenticated ? (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  color: "#8d877f",
                  textAlign: "center",
                  padding: "40px 20px",
                }}
              >
                <UserIcon width={36} height={36} />
                <strong style={{ color: "#1c1917", fontSize: 16 }}>
                  Listener Login Required
                </strong>
                <span style={{ fontSize: 13, maxWidth: 300, lineHeight: 1.5 }}>
                  Log in to create, time-sync, and save your own private lyrics for this song.
                </span>
                <button
                  type="button"
                  className="button button-primary"
                  style={{ marginTop: 14 }}
                  onClick={() => {
                    onClose();
                    onNavigate?.("/login");
                  }}
                >
                  Go to Login
                </button>
              </div>
            ) : personalContent ? (
              hasTimestamps ? (
                <div style={{ display: "flex", flexDirection: "column", gap: isFullScreen ? 24 : 14 }}>
                  {parsedLines.map((line, idx) => {
                    const isActive = idx === activeLineIndex;
                    return (
                      <div
                        key={line.id}
                        ref={isActive ? activeLineRef : null}
                        onClick={() => handleLineClick(line.timeSec)}
                        style={{
                          padding: isFullScreen ? "12px 24px" : "8px 12px",
                          borderRadius: 12,
                          cursor: line.timeSec !== null ? "pointer" : "default",
                          transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                          background: isActive
                            ? "rgba(212, 163, 115, 0.2)"
                            : "transparent",
                          color: isActive
                            ? "#8c5828"
                            : idx < activeLineIndex
                            ? "#8d877f"
                            : "#57534e",
                          transform: isActive
                            ? isFullScreen
                              ? "scale(1.08)"
                              : "scale(1.02)"
                            : "scale(1)",
                          fontWeight: isActive ? 700 : 500,
                          fontSize: getLineFontSize(isActive),
                          lineHeight: 1.6,
                          display: "flex",
                          alignItems: isFullScreen ? "center" : "baseline",
                          justifyContent: isFullScreen ? "center" : "flex-start",
                          gap: 12,
                        }}
                      >
                        {!isFullScreen && line.timeSec !== null && (
                          <span
                            className="track-lyrics-time-chip"
                            style={{
                              background: isActive ? "#d4a373" : undefined,
                              color: isActive ? "#ffffff" : undefined,
                            }}
                          >
                            {formatTimeDisplay(line.timeSec)}
                          </span>
                        )}
                        <span>{line.text || "\u00A0"}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <pre
                  style={{
                    fontFamily: "inherit",
                    fontSize: isFullScreen
                      ? fontSize === "XLARGE" ? 22 : fontSize === "LARGE" ? 19 : 17
                      : fontSize === "XLARGE" ? 17 : fontSize === "LARGE" ? 15.5 : 14,
                    lineHeight: 2.1,
                    color: "#344054",
                    whiteSpace: "pre-wrap",
                    margin: 0,
                  }}
                >
                  {personalContent}
                </pre>
              )
            ) : (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  color: "#8d877f",
                  textAlign: "center",
                  padding: "40px 20px",
                }}
              >
                <FileTextIcon width={36} height={36} />
                <strong style={{ color: "#1c1917", fontSize: 16 }}>
                  No personal lyrics yet
                </strong>
                <span style={{ fontSize: 13, maxWidth: 300, lineHeight: 1.5 }}>
                  Add your custom translation, chords, or transliteration for this song.
                </span>
                {currentTrack?.id && (
                  <button
                    type="button"
                    className="button button-primary"
                    style={{ marginTop: 14 }}
                    onClick={() => {
                      handleCreateCustom();
                    }}
                  >
                    <PlusIcon width={14} height={14} />
                    <span>Create Custom Lyrics</span>
                  </button>
                )}
              </div>
            )
          )}
        </div>
      </aside>

      {/* Central Feedback Toast Popup */}
      <CenterNotificationPopup
        open={toastNotification.open}
        type={toastNotification.type}
        message={toastNotification.message}
        onClose={() => setToastNotification((prev) => ({ ...prev, open: false }))}
      />
    </>
  );
}
