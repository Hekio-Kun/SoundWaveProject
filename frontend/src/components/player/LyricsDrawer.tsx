import { useEffect, useMemo, useRef, useState } from "react";
import { lyricsApi } from "../../api/lyrics";
import { parseLyricsToLines, formatTimeDisplay, LyricLine } from "../common/LyricSyncTab";
import {
  AlertIcon,
  CheckIcon,
  CloseIcon,
  FileTextIcon,
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

  // Track real-time audio playback position
  useEffect(() => {
    if (!audio) return;
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    audio.addEventListener("timeupdate", handleTimeUpdate);
    return () => audio.removeEventListener("timeupdate", handleTimeUpdate);
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
    }, 2200);
  };

  // Click-to-seek (UC-16.1 NF01 Step 6)
  const handleLineClick = (timeSec: number | null) => {
    if (timeSec === null || !audio) return;
    audio.currentTime = Math.max(0, timeSec);
    if (audio.paused) {
      void audio.play().catch(() => {});
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="queue-drawer-backdrop queue-drawer-backdrop--open"
        onClick={onClose}
        aria-hidden="true"
        style={{ zIndex: isFullScreen ? 99 : 54 }}
      />

      {/* Main Drawer or Fullscreen Karaoke Container */}
      <aside
        className={`queue-drawer queue-drawer--open ${
          isFullScreen ? "lyrics-drawer--fullscreen" : ""
        }`}
        style={
          isFullScreen
            ? {
                width: "100vw",
                height: "100vh",
                zIndex: 100,
                background: "linear-gradient(170deg, #fdfaf4 0%, #f6efe3 100%)",
                boxShadow: "none",
              }
            : { zIndex: 55 }
        }
        aria-label="Synchronous Lyrics Viewer"
      >
        {/* Header Bar */}
        <div className="queue-drawer-header" style={{ padding: "0 20px" }}>
          <div className="queue-drawer-tabs">
            <button
              type="button"
              className={`queue-tab ${activeSource === "OFFICIAL" ? "queue-tab--active" : ""}`}
              onClick={() => setActiveSource("OFFICIAL")}
            >
              Official Lyrics
              {officialContent && (
                <span
                  style={{
                    marginLeft: 6,
                    padding: "1px 6px",
                    borderRadius: 999,
                    fontSize: 10,
                    fontWeight: 700,
                    background: "#ecfdf3",
                    color: "#027a48",
                  }}
                >
                  Verified
                </span>
              )}
            </button>
            <button
              type="button"
              className={`queue-tab ${activeSource === "PERSONAL" ? "queue-tab--active" : ""}`}
              onClick={() => setActiveSource("PERSONAL")}
            >
              My Lyrics
              {personalContent && (
                <span
                  style={{
                    marginLeft: 6,
                    padding: "1px 6px",
                    borderRadius: 999,
                    fontSize: 10,
                    fontWeight: 700,
                    background: "#fef3c7",
                    color: "#b45309",
                  }}
                >
                  Custom
                </span>
              )}
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {/* Toggle Fullscreen / Karaoke Mode */}
            <button
              type="button"
              className="queue-close-btn"
              onClick={() => setIsFullScreen((prev) => !prev)}
              aria-label={isFullScreen ? "Exit Fullscreen" : "Fullscreen Karaoke"}
              title={isFullScreen ? "Exit Fullscreen" : "Fullscreen Karaoke View"}
            >
              {isFullScreen ? (
                <MinimizeIcon width={16} height={16} />
              ) : (
                <MaximizeIcon width={16} height={16} />
              )}
            </button>

            {/* Close Drawer */}
            <button
              type="button"
              className="queue-close-btn"
              onClick={onClose}
              aria-label="Close Lyrics Drawer"
              title="Close Lyrics"
            >
              <CloseIcon width={16} height={16} />
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

        {/* Scrollable Synchronous Lyrics Body */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="queue-drawer-body"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: isFullScreen ? "48px 15%" : "28px 20px 80px",
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
                          fontSize: isFullScreen
                            ? isActive
                              ? "26px"
                              : "20px"
                            : isActive
                            ? "16.5px"
                            : "14.5px",
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
                    fontSize: isFullScreen ? 18 : 14.5,
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
                      onCreateCustomLyrics?.(currentTrack.id);
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
                          fontSize: isFullScreen
                            ? isActive
                              ? "26px"
                              : "20px"
                            : isActive
                            ? "16.5px"
                            : "14.5px",
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
                    fontSize: isFullScreen ? 18 : 14.5,
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
                      onCreateCustomLyrics?.(currentTrack.id);
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

        {/* Footer Click-To-Seek Notice */}
        <div
          style={{
            padding: "10px 20px",
            borderTop: "1px solid #e8dccb",
            background: "rgba(253, 250, 244, 0.98)",
            color: "#8d877f",
            fontSize: 11.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <span>
            {hasTimestamps
              ? "Tip: Click any lyric line to jump playback to that section."
              : "Plain text lyric format."}
          </span>
          <span style={{ fontSize: 11, fontWeight: 600 }}>UC-16.1</span>
        </div>
      </aside>
    </>
  );
}
