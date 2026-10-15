import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import {
  AlertIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  CloseIcon,
  DownloadIcon,
  EditIcon,
  EyeIcon,
  FastForwardIcon,
  FileTextIcon,
  MusicIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  RefreshIcon,
  RewindIcon,
  RotateCcwIcon,
  TrashIcon,
  ZapIcon,
} from "../../icons";
import { CenterNotificationPopup } from "../modals/CenterNotificationPopup";

export interface LyricLine {
  id: string;
  timeSec: number | null;
  text: string;
}

export type LyricSyncTabProps = {
  audioFile?: File | null;
  audioUrl?: string | null;
  initialLyrics?: string;
  trackTitle?: string;
  onApplyLyrics: (lrcContent: string, virtualFile: File) => void;
  onClearLyrics?: () => void;
  onSwitchToUpload?: () => void;
};

/**
 * Formats seconds into standard LRC timestamp tag [mm:ss.xx].
 */
export function formatLrcTag(seconds: number): string {
  const clamped = Math.max(0, seconds);
  const m = Math.floor(clamped / 60);
  const s = Math.floor(clamped % 60);
  const cs = Math.floor((clamped % 1) * 100);
  return `[${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${cs.toString().padStart(2, "0")}]`;
}

/**
 * Formats seconds into human-readable display string mm:ss.xx.
 */
export function formatTimeDisplay(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "00:00.00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const cs = Math.floor((seconds % 1) * 100);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${cs.toString().padStart(2, "0")}`;
}

/**
 * Parses raw text or existing LRC content into LyricLine objects.
 */
export function parseLyricsToLines(rawText: string): LyricLine[] {
  if (!rawText.trim()) return [];
  const rawLines = rawText.split(/\r?\n/);
  const result: LyricLine[] = [];
  for (const raw of rawLines) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    const match = trimmed.match(/^\[(\d{1,2}):(\d{2}(?:\.\d{1,3})?)\](.*)$/);
    if (match) {
      const min = parseInt(match[1], 10);
      const sec = parseFloat(match[2]);
      const timeSec = min * 60 + sec;
      result.push({
        id: Math.random().toString(36).substring(2, 9),
        timeSec,
        text: match[3].trim(),
      });
    } else {
      result.push({
        id: Math.random().toString(36).substring(2, 9),
        timeSec: null,
        text: trimmed,
      });
    }
  }
  return result;
}

/**
 * Compiles an array of LyricLines into standard LRC string format.
 */
export function compileLinesToLrc(lines: LyricLine[]): string {
  const stamped = lines.filter((l) => l.timeSec !== null).sort((a, b) => a.timeSec! - b.timeSec!);
  const unstamped = lines.filter((l) => l.timeSec === null);

  const lrcLines = [
    ...stamped.map((l) => `${formatLrcTag(l.timeSec!)} ${l.text}`.trim()),
    ...unstamped.map((l) => l.text.trim()),
  ].filter(Boolean);

  return lrcLines.join("\n");
}

export function LyricSyncTab({
  audioFile,
  audioUrl: audioUrlProp,
  initialLyrics = "",
  trackTitle = "",
  onApplyLyrics,
  onClearLyrics,
  onSwitchToUpload,
}: LyricSyncTabProps) {
  // Audio state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);

  // Lyrics state
  const [subMode, setSubMode] = useState<"sync" | "dictation" | "preview">("sync");
  const [rawText, setRawText] = useState("");
  const [lines, setLines] = useState<LyricLine[]>([]);
  const [activeLineIndex, setActiveLineIndex] = useState(0);
  const [dictationInput, setDictationInput] = useState("");
  const [editingLineId, setEditingLineId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [feedbackNotice, setFeedbackNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Auto-scroll refs
  const lineListRef = useRef<HTMLDivElement | null>(null);
  const activeLineElementRef = useRef<HTMLDivElement | null>(null);

  // 1. Audio setup & revoke object URL
  useEffect(() => {
    if (audioFile) {
      const url = URL.createObjectURL(audioFile);
      setAudioUrl(url);
      setCurrentTime(0);
      setIsPlaying(false);

      if (initialLyrics.trim()) {
        const parsed = parseLyricsToLines(initialLyrics);
        setLines(parsed);
        setRawText(initialLyrics);
        const firstUnstamped = parsed.findIndex((l) => l.timeSec === null);
        setActiveLineIndex(firstUnstamped !== -1 ? firstUnstamped : 0);
      }

      return () => {
        URL.revokeObjectURL(url);
        setAudioUrl(null);
      };
    } else if (audioUrlProp) {
      setAudioUrl(audioUrlProp);
      setCurrentTime(0);
      setIsPlaying(false);

      if (initialLyrics.trim()) {
        const parsed = parseLyricsToLines(initialLyrics);
        setLines(parsed);
        setRawText(initialLyrics);
        const firstUnstamped = parsed.findIndex((l) => l.timeSec === null);
        setActiveLineIndex(firstUnstamped !== -1 ? firstUnstamped : 0);
      }
    } else {
      setAudioUrl(null);
    }
  }, [audioFile, audioUrlProp, initialLyrics]);

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, [audioUrl]);

  // Auto-scroll active line into view when activeLineIndex changes in sync mode
  useEffect(() => {
    if (subMode === "sync" && activeLineElementRef.current) {
      activeLineElementRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [activeLineIndex, subMode]);

  // Keyboard shortcut: Space to stamp when not typing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA");

      if (e.code === "Space" && !isInput) {
        e.preventDefault();
        if (subMode === "sync" && lines.length > 0) {
          handleStampCurrentLine();
        } else if (subMode === "preview") {
          togglePlayPause();
        }
        return;
      }

      if (!isInput && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
        e.preventDefault();
        const step = e.shiftKey ? 3 : 0.2;
        seekRelative(e.key === "ArrowLeft" ? -step : step);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [subMode, lines, activeLineIndex, currentTime, duration]);

  // Audio Playback Controls
  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      void audio.play();
    } else {
      audio.pause();
    }
  };

  const seekRelative = (deltaSec: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const target = Math.max(0, Math.min(audio.currentTime + deltaSec, duration));
    const rounded = Math.round(target * 100) / 100;
    audio.currentTime = rounded;
    setCurrentTime(rounded);
  };

  const seekTo = (sec: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(sec, duration));
  };

  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  // Sync Logic
  const handleParseRawText = () => {
    if (!rawText.trim()) {
      setFeedbackNotice({ type: "error", message: "Please enter or paste your lyrics text in the box below." });
      return;
    }
    const parsed = parseLyricsToLines(rawText);
    setLines(parsed);
    setActiveLineIndex(0);
    setFeedbackNotice({ type: "success", message: `Successfully parsed ${parsed.length} lines. Ready to timestamp!` });
  };

  const handleStampCurrentLine = () => {
    if (activeLineIndex < 0 || activeLineIndex >= lines.length) return;
    const time = currentTime;

    setLines((prev) => {
      const next = [...prev];
      next[activeLineIndex] = {
        ...next[activeLineIndex],
        timeSec: time,
      };
      return next;
    });

    if (activeLineIndex + 1 < lines.length) {
      setActiveLineIndex(activeLineIndex + 1);
    }
  };

  const handleAdjustLineTime = (index: number, delta: number) => {
    setLines((prev) => {
      const next = [...prev];
      const currentSec = next[index].timeSec ?? currentTime;
      next[index] = {
        ...next[index],
        timeSec: Math.max(0, Math.round((currentSec + delta) * 100) / 100),
      };
      return next;
    });
  };

  const handleClearLineTime = (index: number) => {
    setLines((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], timeSec: null };
      return next;
    });
  };

  const handleStartEditLine = (line: LyricLine) => {
    setEditingLineId(line.id);
    setEditingText(line.text);
  };

  const handleSaveEditLine = (index: number) => {
    if (!editingText.trim()) return;
    setLines((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], text: editingText.trim() };
      return next;
    });
    setEditingLineId(null);
    setEditingText("");
  };

  // Dictation Logic
  const handleAddDictationLine = () => {
    if (!dictationInput.trim()) return;
    const newLine: LyricLine = {
      id: Math.random().toString(36).substring(2, 9),
      timeSec: currentTime,
      text: dictationInput.trim(),
    };

    setLines((prev) => {
      const next = [...prev, newLine];
      return next.sort((a, b) => (a.timeSec ?? 0) - (b.timeSec ?? 0));
    });
    setDictationInput("");
  };

  // Save & Apply Actions
  const handleApply = () => {
    const lrcContent = compileLinesToLrc(lines);
    if (!lrcContent.trim()) {
      setFeedbackNotice({ type: "error", message: "Please enter and timestamp at least one lyric line before applying." });
      return;
    }

    const safeTitle = trackTitle.trim()
      ? trackTitle.trim().toLowerCase().replace(/[^a-z0-9]/gi, "-")
      : "track";
    const virtualFile = new File([lrcContent], `${safeTitle}-lyrics.lrc`, {
      type: "text/plain",
    });

    onApplyLyrics(lrcContent, virtualFile);
    setFeedbackNotice({
      type: "success",
      message: `Successfully applied ${lines.length} lyric lines to the track!`,
    });
  };

  const handleDownloadLrc = () => {
    const lrcContent = compileLinesToLrc(lines);
    if (!lrcContent.trim()) {
      setFeedbackNotice({ type: "error", message: "No lyrics available to download." });
      return;
    }
    const blob = new Blob([lrcContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const safeTitle = trackTitle.trim()
      ? trackTitle.trim().toLowerCase().replace(/[^a-z0-9]/gi, "_")
      : "soundwave_lyrics";
    a.href = url;
    a.download = `${safeTitle}.lrc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Preview Mode: find singing line
  const previewActiveLineIndex = lines.findIndex((line, i) => {
    if (line.timeSec === null) return false;
    const nextLine = lines.slice(i + 1).find((l) => l.timeSec !== null);
    if (!nextLine || nextLine.timeSec === null) {
      return currentTime >= line.timeSec;
    }
    return currentTime >= line.timeSec && currentTime < nextLine.timeSec;
  });

  const stampedCount = lines.filter((l) => l.timeSec !== null).length;
  const totalCount = lines.length;

  const hasAudio = Boolean(audioFile || audioUrlProp);

  // Render Prompt if no audio file
  if (!hasAudio) {
    return (
      <div
        style={{
          padding: "36px 24px",
          textAlign: "center",
          background: "#FEFBF6",
          border: "1.5px dashed #D4A373",
          borderRadius: "16px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "50%",
            background: "#F5EFE6",
            border: "1px solid #E8DCBA",
            display: "grid",
            placeItems: "center",
            color: "#0284C7",
          }}
        >
          <MusicIcon width={24} height={24} />
        </div>
        <h4 style={{ margin: "4px 0 0", fontSize: "16px", fontWeight: 700, color: "#1C1917" }}>
          No audio file selected
        </h4>
        <p style={{ margin: 0, fontSize: "13px", color: "#786F65", maxWidth: "460px", lineHeight: 1.5 }}>
          Please select an audio file (MP3, WAV, or FLAC) in the <strong>Audio file</strong> field above first to load audio into the lyric maker.
        </p>
        {onSwitchToUpload && (
          <button
            type="button"
            className="button button-secondary button-small"
            onClick={onSwitchToUpload}
            style={{ marginTop: "6px", display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <ChevronLeftIcon width={13} height={13} />
            <span>Close LRC Maker</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className="lyric-sync-tab-container"
      style={{
        background: "#FDFAF4",
        border: "1px solid rgba(232, 220, 203, 0.95)",
        borderRadius: "16px",
        padding: "20px 22px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        boxShadow: "0 4px 18px rgba(180, 140, 90, 0.05)",
      }}
    >
      {/* Hidden Audio */}
      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="auto" />}

      {/* Header Info */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 800,
              color: "var(--brand, #0284c7)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            LRC MAKER | STUDIO
          </span>
          <h3 style={{ margin: "2px 0 0", fontSize: "16px", fontWeight: 800, color: "#1C1917" }}>
            LRC Maker & Lyric Synchronizer
          </h3>
          <p style={{ margin: "3px 0 0", fontSize: "12px", color: "#786F65", display: "flex", alignItems: "center", gap: "5px" }}>
            <MusicIcon width={13} height={13} style={{ color: "#0284C7" }} />
            <span>Track Audio: <strong>{audioFile?.name || trackTitle || "Attached Audio"}</strong> ({formatTimeDisplay(duration)})</span>
          </p>
        </div>

        {lines.length > 0 && (
          <div
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "#574F45",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "#F5EFE6",
              padding: "5px 12px",
              borderRadius: "8px",
            }}
          >
            <ClockIcon width={14} height={14} />
            <span>
              Timestamped: <strong style={{ color: "#0284C7" }}>{stampedCount}</strong> / {totalCount} lines
            </span>
          </div>
        )}
      </div>

      {/* Top-Center Toast Notification */}
      {feedbackNotice && (
        <CenterNotificationPopup
          open={Boolean(feedbackNotice)}
          type={feedbackNotice.type === "success" ? "success" : "error"}
          message={feedbackNotice.message}
          onClose={() => setFeedbackNotice(null)}
        />
      )}

      {/* Audio Controller Bar */}
      <div
        style={{
          padding: "12px 16px",
          background: "linear-gradient(135deg, #FEFBF6 0%, #F8F1E5 100%)",
          border: "1px solid #E8DCBA",
          borderRadius: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <button
              type="button"
              onClick={() => seekRelative(-3)}
              title="Rewind 3 seconds (Shift + Left Arrow)"
              style={{
                height: "34px",
                padding: "0 10px",
                borderRadius: "8px",
                border: "1px solid #E2D7C3",
                background: "#FFFFFF",
                color: "#334155",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                transition: "all 0.15s ease",
              }}
            >
              <RewindIcon width={13} height={13} style={{ color: "#0284C7" }} />
              <span>-3s</span>
            </button>
            <button
              type="button"
              onClick={() => seekRelative(-0.2)}
              title="Rewind 0.2 seconds (Left Arrow key)"
              style={{
                height: "34px",
                padding: "0 10px",
                borderRadius: "8px",
                border: "1px solid #E2D7C3",
                background: "#FFFFFF",
                color: "#334155",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "3px",
                transition: "all 0.15s ease",
              }}
            >
              <ChevronLeftIcon width={13} height={13} style={{ color: "#0284C7" }} />
              <span>-0.2s</span>
            </button>
            <button
              type="button"
              onClick={togglePlayPause}
              aria-label={isPlaying ? "Pause" : "Play"}
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                border: "none",
                background: "linear-gradient(135deg, #0EA5E9 0%, #0284C7 50%, #0369A1 100%)",
                color: "#fff",
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
                boxShadow: "0 3px 10px rgba(2, 132, 199, 0.35)",
              }}
            >
              {isPlaying ? <PauseIcon width={16} height={16} /> : <PlayIcon width={16} height={16} />}
            </button>
            <button
              type="button"
              onClick={() => seekRelative(0.2)}
              title="Forward 0.2 seconds (Right Arrow key)"
              style={{
                height: "34px",
                padding: "0 10px",
                borderRadius: "8px",
                border: "1px solid #E2D7C3",
                background: "#FFFFFF",
                color: "#334155",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "3px",
                transition: "all 0.15s ease",
              }}
            >
              <span>+0.2s</span>
              <ChevronRightIcon width={13} height={13} style={{ color: "#0284C7" }} />
            </button>
            <button
              type="button"
              onClick={() => seekRelative(3)}
              title="Forward 3 seconds (Shift + Right Arrow)"
              style={{
                height: "34px",
                padding: "0 10px",
                borderRadius: "8px",
                border: "1px solid #E2D7C3",
                background: "#FFFFFF",
                color: "#334155",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                transition: "all 0.15s ease",
              }}
            >
              <span>+3s</span>
              <FastForwardIcon width={13} height={13} style={{ color: "#0284C7" }} />
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
            <span
              style={{
                fontFamily: "monospace",
                fontSize: "17px",
                fontWeight: 800,
                color: "var(--brand, #0284c7)",
                letterSpacing: "0.02em",
              }}
            >
              {formatTimeDisplay(currentTime)}
            </span>
            <span style={{ fontSize: "12px", color: "#8C8275", fontFamily: "monospace" }}>
              / {formatTimeDisplay(duration)}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#8C8275", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Speed:
            </span>
            <div
              style={{
                display: "inline-flex",
                background: "#F5EFE6",
                padding: "2px",
                borderRadius: "7px",
                border: "1px solid #E2D7C3",
                gap: "2px",
              }}
            >
              {[0.75, 1, 1.25].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => changePlaybackRate(rate)}
                  style={{
                    padding: "3px 8px",
                    borderRadius: "5px",
                    fontSize: "11px",
                    fontWeight: 700,
                    border: "none",
                    background: playbackRate === rate ? "#0284C7" : "transparent",
                    color: playbackRate === rate ? "#FFFFFF" : "#574F45",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>
        </div>

        <input
          type="range"
          min="0"
          max={Math.max(duration, 1)}
          step="0.05"
          value={Math.min(currentTime, duration)}
          onChange={(e) => seekTo(Number(e.target.value))}
          aria-label="Track playback progress"
          style={{ width: "100%", height: "6px", accentColor: "var(--brand, #0284c7)", cursor: "pointer" }}
        />
      </div>

      {/* Sub-mode switch buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid #EDE3D2", paddingBottom: "12px" }}>
        {[
          { id: "sync" as const, label: "Quick Sync", icon: ZapIcon },
          { id: "dictation" as const, label: "Live Dictation", icon: EditIcon },
          { id: "preview" as const, label: "Karaoke Preview", icon: EyeIcon },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = subMode === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSubMode(tab.id)}
              style={{
                padding: "7px 14px",
                borderRadius: "8px",
                border: isActive ? "1px solid #0284C7" : "1px solid #E2D7C3",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: isActive ? "#0284C7" : "#FFFFFF",
                color: isActive ? "#FFFFFF" : "#574F45",
                transition: "all 0.15s ease",
                boxShadow: isActive ? "0 2px 6px rgba(2, 132, 199, 0.25)" : "none",
              }}
            >
              <Icon width={14} height={14} style={{ color: isActive ? "#FFFFFF" : "#0284C7" }} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Mode 1: Quick Sync */}
      {subMode === "sync" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {lines.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div
                style={{
                  padding: "10px 14px",
                  background: "#F0F9FF",
                  border: "1px solid #BAE6FD",
                  borderRadius: "10px",
                  fontSize: "12px",
                  color: "#0369A1",
                  lineHeight: 1.5,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                }}
              >
                <FileTextIcon width={16} height={16} style={{ flexShrink: 0, marginTop: "2px", color: "#0284C7" }} />
                <div>
                  <strong>Paste raw lyrics:</strong> Paste song lyrics below (one line per verse). Click <strong>&quot;Parse lines & Start sync&quot;</strong> to begin playback and timestamping!
                </div>
              </div>

              <textarea
                rows={7}
                placeholder="Paste song lyrics here (one line per verse)...&#10;Example:&#10;Look at the stars&#10;Look how they shine for you&#10;And everything you do..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  border: "1px solid #E2D7C3",
                  background: "#FFF",
                  fontSize: "13px",
                  fontFamily: "inherit",
                  lineHeight: 1.6,
                  outline: "none",
                  resize: "vertical",
                }}
              />

              <button
                type="button"
                className="button button-primary button-small"
                onClick={handleParseRawText}
                style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <CheckIcon width={15} height={15} />
                <span>Parse lines & Start sync</span>
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {/* Highlight Action Banner */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 16px",
                  background: "#F0F9FF",
                  border: "2px dashed #0284C7",
                  borderRadius: "12px",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <span style={{ fontSize: "10.5px", fontWeight: 800, color: "#0369A1", letterSpacing: "0.05em" }}>
                    CURRENT LINE TO STAMP (#{activeLineIndex + 1}/{lines.length})
                  </span>
                  <p
                    style={{
                      margin: "2px 0 0",
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#0C4A6E",
                      maxWidth: "420px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {lines[activeLineIndex]?.text || "All lines stamped successfully!"}
                  </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={handleStampCurrentLine}
                    disabled={activeLineIndex >= lines.length}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      border: "none",
                      background: "linear-gradient(135deg, #0EA5E9, #0284C7)",
                      color: "#FFF",
                      fontSize: "12.5px",
                      fontWeight: 800,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      boxShadow: "0 2px 8px rgba(2, 132, 199, 0.3)",
                    }}
                  >
                    <ClockIcon width={15} height={15} />
                    <span>Stamp this line [Space]</span>
                  </button>

                  <button
                    type="button"
                    className="button button-secondary button-small"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to re-paste lyrics from scratch?")) {
                        setLines([]);
                      }
                    }}
                    style={{ fontSize: "11px" }}
                  >
                    <RefreshIcon width={12} height={12} /> Re-paste
                  </button>
                </div>
              </div>

              {/* Scrollable List */}
              <div
                ref={lineListRef}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  maxHeight: "300px",
                  overflowY: "auto",
                  paddingRight: "4px",
                }}
              >
                {lines.map((line, idx) => {
                  const isActive = idx === activeLineIndex;
                  const isEditing = editingLineId === line.id;
                  const hasTimestamp = line.timeSec !== null;

                  return (
                    <div
                      key={line.id}
                      ref={isActive ? activeLineElementRef : null}
                      onClick={() => setActiveLineIndex(idx)}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "32px 105px 1fr auto",
                        alignItems: "center",
                        gap: "10px",
                        padding: "7px 12px",
                        borderRadius: "8px",
                        border: isActive
                          ? "2px solid #0284C7"
                          : hasTimestamp
                          ? "1px solid #D5E7B5"
                          : "1px solid #EDE3D2",
                        background: isActive
                          ? "#F0F9FF"
                          : hasTimestamp
                          ? "#F9FCF3"
                          : "#FFFFFF",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#8C8275" }}>
                        #{idx + 1}
                      </span>

                      <div>
                        {hasTimestamp ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              seekTo(line.timeSec!);
                            }}
                            title="Click to play from this timestamp"
                            style={{
                              border: "none",
                              padding: "2px 7px",
                              borderRadius: "5px",
                              background: "#E0F2FE",
                              color: "#0284C7",
                              fontFamily: "monospace",
                              fontSize: "11.5px",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            {formatLrcTag(line.timeSec!)}
                          </button>
                        ) : (
                          <span style={{ fontSize: "11px", color: "#9C9285", fontStyle: "italic" }}>
                            Unstamped
                          </span>
                        )}
                      </div>

                      <div style={{ minWidth: 0 }}>
                        {isEditing ? (
                          <input
                            type="text"
                            autoFocus
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            onKeyDown={(e: ReactKeyboardEvent<HTMLInputElement>) => {
                              if (e.key === "Enter") handleSaveEditLine(idx);
                              if (e.key === "Escape") setEditingLineId(null);
                            }}
                            onBlur={() => handleSaveEditLine(idx)}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              width: "100%",
                              padding: "3px 7px",
                              fontSize: "12.5px",
                              borderRadius: "6px",
                              border: "1px solid #0284C7",
                              outline: "none",
                            }}
                          />
                        ) : (
                          <p
                            onDoubleClick={(e) => {
                              e.stopPropagation();
                              handleStartEditLine(line);
                            }}
                            title="Double-click to edit text"
                            style={{
                              margin: 0,
                              fontSize: "13px",
                              fontWeight: isActive ? 700 : 500,
                              color: isActive ? "#0284C7" : "#1C1917",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {line.text}
                          </p>
                        )}
                      </div>

                      <div
                        onClick={(e) => e.stopPropagation()}
                        style={{ display: "flex", alignItems: "center", gap: "3px" }}
                      >
                        {hasTimestamp ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleAdjustLineTime(idx, -0.2)}
                              title="Shift -0.2s"
                              style={{
                                padding: "2px 6px",
                                fontSize: "11px",
                                fontWeight: 700,
                                borderRadius: "4px",
                                border: "1px solid #E2D7C3",
                                background: "#FFF",
                                color: "#475569",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "2px",
                              }}
                            >
                              <ChevronLeftIcon width={10} height={10} style={{ color: "#0284C7" }} />
                              <span>0.2s</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAdjustLineTime(idx, 0.2)}
                              title="Shift +0.2s"
                              style={{
                                padding: "2px 6px",
                                fontSize: "11px",
                                fontWeight: 700,
                                borderRadius: "4px",
                                border: "1px solid #E2D7C3",
                                background: "#FFF",
                                color: "#475569",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "2px",
                              }}
                            >
                              <span>0.2s</span>
                              <ChevronRightIcon width={10} height={10} style={{ color: "#0284C7" }} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleClearLineTime(idx)}
                              title="Clear timestamp"
                              style={{ border: "none", background: "none", cursor: "pointer", color: "#9C9285", padding: "2px" }}
                            >
                              <CloseIcon width={12} height={12} />
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveLineIndex(idx);
                              handleStampCurrentLine();
                            }}
                            style={{
                              padding: "2px 7px",
                              borderRadius: "5px",
                              border: "1px solid #BAE6FD",
                              background: "#F0F9FF",
                              color: "#0284C7",
                              fontSize: "11px",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            Stamp
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleStartEditLine(line)}
                          title="Edit line text"
                          style={{ border: "none", background: "none", cursor: "pointer", color: "#8C8275" }}
                        >
                          <EditIcon width={13} height={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Dictation */}
      {subMode === "dictation" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              placeholder={`Type lyrics at [${formatLrcTag(currentTime)}]...`}
              value={dictationInput}
              onChange={(e) => setDictationInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddDictationLine();
              }}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #E2D7C3",
                fontSize: "13px",
                outline: "none",
              }}
            />
            <button
              type="button"
              className="button button-primary button-small"
              onClick={handleAddDictationLine}
              style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}
            >
              <PlusIcon width={14} height={14} /> Add line
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "260px", overflowY: "auto" }}>
            {lines.length === 0 ? (
              <p style={{ textAlign: "center", color: "#8C8275", fontSize: "12px", padding: "20px 0" }}>
                No lines yet. Play the audio and type lyrics as you listen!
              </p>
            ) : (
              lines.map((line, idx) => (
                <div
                  key={line.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    background: "#FFF",
                    border: "1px solid #EDE3D2",
                    borderRadius: "8px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontSize: "11.5px",
                        fontWeight: 700,
                        color: "#0284C7",
                        background: "#E0F2FE",
                        padding: "1px 5px",
                        borderRadius: "4px",
                      }}
                    >
                      {line.timeSec !== null ? formatLrcTag(line.timeSec) : "--:--"}
                    </span>
                    <span style={{ fontSize: "13px" }}>{line.text}</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <button
                      type="button"
                      onClick={() => line.timeSec !== null && seekTo(line.timeSec)}
                      style={{
                        border: "1px solid #E2D7C3",
                        background: "#FDFAF4",
                        color: "#574F45",
                        padding: "3px 8px",
                        borderRadius: "5px",
                        cursor: "pointer",
                        fontSize: "11px",
                        fontWeight: 700,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <RotateCcwIcon width={11} height={11} style={{ color: "#0284C7" }} />
                      <span>Replay</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLines((prev) => prev.filter((_, i) => i !== idx))}
                      style={{ border: "none", background: "none", cursor: "pointer", color: "#DC2626" }}
                    >
                      <TrashIcon width={13} height={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Mode 3: Preview */}
      {subMode === "preview" && (
        <div
          style={{
            height: "280px",
            overflowY: "auto",
            padding: "16px 20px",
            background: "linear-gradient(180deg, #1E293B 0%, #0F172A 100%)",
            borderRadius: "14px",
            color: "#FFF",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "14px",
          }}
        >
          {lines.length === 0 ? (
            <div style={{ textAlign: "center", margin: "auto", color: "#94A3B8", fontSize: "13px" }}>
              No lyrics to preview yet. Switch to <strong>Quick Sync</strong> to add lyrics!
            </div>
          ) : (
            lines.map((line, idx) => {
              const isCurrent = idx === previewActiveLineIndex;
              return (
                <div
                  key={line.id}
                  onClick={() => line.timeSec !== null && seekTo(line.timeSec)}
                  style={{
                    textAlign: "center",
                    cursor: line.timeSec !== null ? "pointer" : "default",
                    transition: "all 0.2s ease",
                    transform: isCurrent ? "scale(1.12)" : "scale(1)",
                    opacity: isCurrent ? 1 : 0.4,
                    color: isCurrent ? "#38BDF8" : "#CBD5E1",
                    textShadow: isCurrent ? "0 0 14px rgba(56, 189, 248, 0.6)" : "none",
                    fontWeight: isCurrent ? 800 : 500,
                    fontSize: isCurrent ? "16.5px" : "13.5px",
                  }}
                >
                  <p style={{ margin: 0 }}>{line.text}</p>
                  {line.timeSec !== null && (
                    <small style={{ fontSize: "9.5px", fontFamily: "monospace", color: isCurrent ? "#FDE68A" : "#64748B" }}>
                      {formatLrcTag(line.timeSec)}
                    </small>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Footer Actions */}
      <div
        style={{
          borderTop: "1px solid #EDE3D2",
          paddingTop: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            type="button"
            className="button button-secondary button-small"
            onClick={handleDownloadLrc}
            disabled={lines.length === 0}
            title="Download full LRC lyrics file (.lrc)"
            style={{ fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <DownloadIcon width={14} height={14} style={{ color: "#0284C7" }} />
            <span>Download .lrc</span>
          </button>

          {onClearLyrics && lines.length > 0 && (
            <button
              type="button"
              className="button button-secondary button-small"
              onClick={() => {
                if (window.confirm("Are you sure you want to clear all lyrics?")) {
                  setLines([]);
                  onClearLyrics();
                  setFeedbackNotice({ type: "success", message: "All lyrics have been cleared." });
                }
              }}
              style={{ fontSize: "12px", color: "#DC2626" }}
            >
              <TrashIcon width={13} height={13} /> Clear all
            </button>
          )}
        </div>

        <button
          type="button"
          className="button button-primary"
          onClick={handleApply}
          disabled={lines.length === 0}
          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <CheckIcon width={15} height={15} />
          <span>Apply to track</span>
        </button>
      </div>
    </div>
  );
}
