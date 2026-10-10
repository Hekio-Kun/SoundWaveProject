import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { NextIcon, PauseIcon, PlayIcon, PreviousIcon, QueueIcon, RepeatIcon, ShuffleIcon, VolumeIcon } from "../icons";
import type { LandingTrack } from "../types";

/**
 * Props for the persistent {@link MusicPlayer} component.
 */
export type MusicPlayerProps = {
  /** The track currently loaded into the player */
  track: LandingTrack;
  /** Active playback queue of tracks */
  queue: LandingTrack[];
  /** Underlying HTML audio element used for playback */
  audio: HTMLAudioElement;
  /** Whether audio is currently playing */
  playing: boolean;
  /** Callback triggered when playback state toggles between play and pause */
  onPlayingChange: (playing: boolean) => void;
  /** Callback triggered when active track changes (e.g., skip, previous, auto-advance) */
  onTrackChange: (track: LandingTrack, autoplay?: boolean) => void;
  /** Callback invoked when a guest finishes playing a track to display registration prompt */
  onGuestTrackEnded: (next: LandingTrack) => void;
  /** Flag indicating whether current user is authenticated */
  isAuthenticated: boolean;
  /** Optional callback to toggle the visibility of the queue drawer */
  onToggleQueue?: () => void;
  /** Controlled open state of the queue drawer */
  isQueueOpen?: boolean;
  /** Callback to record playback count when valid listening threshold is met (BR.13) */
  onRecordPlay?: (trackId: number, listenedDurationMs: number, completed: boolean) => void;
  /** Human-readable playback context description (e.g., "Playing from Top Charts") */
  playbackContext?: string | null;
};

/**
 * Formats a duration in seconds into `mm:ss` representation.
 *
 * @param seconds - Duration in seconds
 * @returns Formatted time string, or "0:00" if invalid
 */
const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`;
};

/**
 * Persistent bottom music player controller bar.
 * <p>
 * Handles playback controls, queue navigation, boundary-clamped seeking (NF01/EF01),
 * shuffle/repeat persistence (NF03), rewind/previous logic (AF02), and auto-skip error recovery (EX01/EX02).
 */
export function MusicPlayer({
  track,
  queue,
  audio,
  playing,
  onPlayingChange,
  onTrackChange,
  onGuestTrackEnded,
  isAuthenticated,
  onToggleQueue,
  isQueueOpen,
  onRecordPlay,
  playbackContext,
}: MusicPlayerProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(track.durationMs / 1000);
  const [volume, setVolume] = useState(0.8);
  const [shuffle, setShuffle] = useState(() => {
    try {
      return sessionStorage.getItem("soundwave_player_shuffle") === "true";
    } catch {
      return false;
    }
  });
  const [repeat, setRepeat] = useState(() => {
    try {
      return sessionStorage.getItem("soundwave_player_repeat") === "true";
    } catch {
      return false;
    }
  });
  const [localQueueOpen, setLocalQueueOpen] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const recordedRef = useRef(false);
  const lastTimeRef = useRef<number | null>(null);
  const errorTimerRef = useRef<number | null>(null);

  // NF03: Persist shuffle preference to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem("soundwave_player_shuffle", String(shuffle));
    } catch {
      // ignore
    }
  }, [shuffle]);

  // NF03: Persist repeat preference to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem("soundwave_player_repeat", String(repeat));
    } catch {
      // ignore
    }
  }, [repeat]);

  const isQueueActive = isQueueOpen !== undefined ? isQueueOpen : localQueueOpen;
  const handleQueueClick = () => {
    if (onToggleQueue) {
      onToggleQueue();
    } else {
      setLocalQueueOpen((prev) => !prev);
    }
  };

  const index = useMemo(() => queue.findIndex((item) => item.id === track.id), [queue, track.id]);

  /**
   * Resolves next track to play taking into account shuffle mode and queue boundaries.
   *
   * @returns Next {@link LandingTrack} to play
   */
  const nextTrack = () => {
    if (!queue.length) return track;
    if (shuffle && queue.length > 1) {
      const candidates = queue.filter((item) => item.id !== track.id);
      if (candidates.length > 0) {
        return candidates[Math.floor(Math.random() * candidates.length)];
      }
    }
    const curIdx = index >= 0 ? index : 0;
    return queue[(curIdx + 1) % queue.length];
  };

  useEffect(() => {
    audio.volume = volume;
  }, [audio, volume]);

  /**
   * Handles natural track completion: records listening event, respects repeat mode,
   * or advances to the next track.
   */
  const handleEnded = () => {
    if (!recordedRef.current) {
      recordedRef.current = true;
      onRecordPlay?.(track.id, Math.round(audio.currentTime * 1000), true);
    }
    if (repeat) {
      audio.currentTime = 0;
      recordedRef.current = false;
      void audio.play();
      return;
    }
    const next = nextTrack();
    onPlayingChange(false);
    if (isAuthenticated) onTrackChange(next, true);
    else onGuestTrackEnded(next);
  };

  /**
   * Handles previous button navigation adhering to sequence rule AF02:
   * - If current playback time > 4s: resets current track to 00:00.
   * - If playback time <= 4s and already at queue start: resets track without error.
   * - If playback time <= 4s and previous track exists: switches to previous track.
   */
  const previous = () => {
    // AF02 [24]: If current playback time > 4 seconds, restart current track
    if (audio.currentTime > 4) {
      audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }
    if (!queue.length) return;
    const curIdx = index >= 0 ? index : 0;
    // AF02 [25]: Playback time <= 4 seconds and at queue start -> restart without error
    if (curIdx === 0) {
      audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }
    // AF02 [26-28]: Previous track exists in queue -> load and play previous track
    onTrackChange(queue[curIdx - 1], true);
  };

  /**
   * Seeks audio to target timestamp, clamping to valid interval [0, duration] (NF01 & EF01).
   *
   * @param value - Requested playback position in seconds
   */
  const seek = (value: number) => {
    // NF01 & EF01: Clamp requested timestamp to nearest valid boundary (0 or duration)
    const maxDur = Math.max(duration, 0);
    const clamped = Math.max(0, Math.min(value, maxDur));
    audio.currentTime = clamped;
    setCurrentTime(clamped);
  };

  useEffect(() => {
    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current);
      errorTimerRef.current = null;
    }
    setCurrentTime(0);
    setDuration(track.durationMs / 1000);
    setAudioError(false);
    setErrorMessage("");
    recordedRef.current = false;
    lastTimeRef.current = null;
  }, [track.id, track.durationMs]);

  useEffect(() => {
    const updateTime = () => {
      const cur = audio.currentTime;
      setCurrentTime(cur);

      // BR.13: Listening event is counted when valid listening threshold is reached
      // Duration <= 30s: Threshold = 90% duration; Duration > 30s: Threshold = 30 seconds
      if (!recordedRef.current && playing && cur > 0) {
        const dur = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : track.durationMs / 1000;
        const threshold = dur <= 30 ? dur * 0.9 : 30;
        if (cur >= threshold) {
          recordedRef.current = true;
          const completed = cur >= dur * 0.9;
          onRecordPlay?.(track.id, Math.round(cur * 1000), completed);
        }
      }
    };

    const updateDuration = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : track.durationMs / 1000);
    const reportError = () => {
      // EX01 [30], EX02 [36]: Detect track inaccessible or player error
      setAudioError(true);
      // EX01 [31], EX02 [37]: Stop current track and restore last stable state
      onPlayingChange(false);
      audio.currentTime = 0;
      setCurrentTime(0);

      // EX01 [32-35]: Advance to next eligible track if queue has other tracks
      if (queue.length > 1) {
        setErrorMessage("Track unavailable. Skipping to next track in queue...");
        if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
        errorTimerRef.current = window.setTimeout(() => {
          setAudioError(false);
          setErrorMessage("");
          onTrackChange(nextTrack(), true);
        }, 1500);
      } else {
        setErrorMessage("The audio could not be loaded. Please check your network connection.");
      }
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", reportError);
    if (audio.readyState >= 1) updateDuration();
    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", reportError);
    };
  });

  return (
    <aside className={`music-player ${playing ? "music-player--playing" : ""}`} aria-label="Music player">
      <div className="player-track">
        <img src={track.coverUrl ?? undefined} alt={`${track.title} cover`} />
        <div>
          <a href={`#/track/${track.id}`}>{track.title}</a>
          <a href={`#/creator/${track.creator.userId}`}>{track.creator.displayName}</a>
          {playbackContext && (
            <span
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--brand, #0284c7)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "200px",
                lineHeight: 1.3,
                marginTop: "2px",
              }}
              title={playbackContext}
            >
              {playbackContext}
            </span>
          )}
        </div>
      </div>

      <div className="player-center">
        <div className="player-controls">
          <button className={`player-icon ${shuffle ? "player-icon--active" : ""}`} onClick={() => setShuffle((value) => !value)} aria-label={shuffle ? "Turn shuffle off" : "Turn shuffle on"}><ShuffleIcon /></button>
          <button className="player-icon" onClick={previous} aria-label="Previous"><PreviousIcon /></button>
          <button className="player-play" onClick={() => onPlayingChange(!playing)} aria-label={playing ? "Pause" : "Play"}>
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button className="player-icon" onClick={() => onTrackChange(nextTrack(), true)} aria-label="Next"><NextIcon /></button>
          <button className={`player-icon ${repeat ? "player-icon--active" : ""}`} onClick={() => setRepeat((value) => !value)} aria-label={repeat ? "Turn repeat off" : "Turn repeat on"}><RepeatIcon /></button>
        </div>
        <div className="timeline">
          <span>{formatTime(currentTime)}</span>
          <input type="range" min="0" max={Math.max(duration, 1)} step="0.1" value={Math.min(currentTime, duration)} onChange={(event) => seek(Number(event.target.value))} aria-label="Progress" style={{ "--range-progress": `${Math.min((currentTime / Math.max(duration, 1)) * 100, 100)}%` } as CSSProperties} />
          <span>{formatTime(duration)}</span>
        </div>
        {audioError && <span className="audio-error">{errorMessage || "The audio could not be loaded. Check your network connection."}</span>}
      </div>

      <div className="player-tools">
        <button className={`player-icon ${isQueueActive ? "player-icon--active" : ""}`} onClick={handleQueueClick} aria-label="Queue"><QueueIcon /></button>
        <VolumeIcon />
        <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(event) => setVolume(Number(event.target.value))} aria-label="Volume" style={{ "--range-progress": `${volume * 100}%` } as CSSProperties} />
      </div>

      {!onToggleQueue && localQueueOpen && (
        <div className="queue-popover">
          <div className="queue-heading">
            <div>
              <span>PLAYING FROM</span>
              <h3>{playbackContext || "Queue"}</h3>
            </div>
            <button className="text-button" onClick={() => setLocalQueueOpen(false)}>Close</button>
          </div>
          <div className="queue-list">
            {queue.map((item) => (
              <button key={item.id} className={item.id === track.id ? "queue-item queue-item--active" : "queue-item"} onClick={() => onTrackChange(item, true)}>
                <img src={item.coverUrl ?? undefined} alt="" />
                <span><b>{item.title}</b><small>{item.creator.displayName}</small></span>
                <small>{formatTime(item.durationMs / 1000)}</small>
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
