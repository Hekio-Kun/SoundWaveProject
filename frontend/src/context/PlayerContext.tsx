import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { catalogApi } from "../api/catalog";
import { tracks } from "../data";
import type { LandingTrack } from "../types";

export interface PlayerContextType {
  audio: HTMLAudioElement;
  currentTrack: LandingTrack | null;
  playing: boolean;
  queue: LandingTrack[];
  queueOpen: boolean;
  lyricsOpen: boolean;
  guestPromptOpen: boolean;
  pendingTrack: LandingTrack | null;
  playTrack: (
    track: LandingTrack,
    contextQueueOrAutoplay?: LandingTrack[] | boolean,
    contextTitle?: string,
    contextKey?: string
  ) => void;
  togglePlay: () => void;
  setAudioPlaying: (shouldPlay: boolean) => void;
  toggleQueue: () => void;
  setQueueOpen: (open: boolean) => void;
  toggleLyrics: () => void;
  setLyricsOpen: (open: boolean) => void;
  removeFromQueue: (trackId: number) => void;
  clearQueue: () => void;
  handleGuestTrackEnded: (next: LandingTrack) => void;
  continueListening: () => void;
  closeGuestPrompt: () => void;
  handleRecordPlay: (trackId: number, listenedDurationMs: number, completed: boolean) => Promise<void>;
  reorderQueue: (newQueue: LandingTrack[]) => void;
  pause: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const defaultTrack = useMemo(() => tracks.find((t) => t.id === 1) || tracks[0] || null, []);
  const audio = useMemo(() => {
    const el = new Audio(defaultTrack?.audioUrl || "");
    el.preload = "metadata";
    return el;
  }, [defaultTrack]);

  const [currentTrack, setCurrentTrack] = useState<LandingTrack | null>(() => {
    try {
      const savedId = sessionStorage.getItem("soundwave_current_track_id");
      if (savedId) {
        const found = tracks.find((t) => t.id === Number(savedId));
        if (found) return found;
      }
    } catch {
      // ignore
    }
    return defaultTrack;
  });
  const [playing, setPlaying] = useState(false);
  const [queue, setQueue] = useState<LandingTrack[]>(tracks);
  const [queueOpen, setQueueOpen] = useState(false);
  const [lyricsOpen, setLyricsOpen] = useState(false);
  const [guestPromptOpen, setGuestPromptOpen] = useState(false);
  const [pendingTrack, setPendingTrack] = useState<LandingTrack | null>(null);

  useEffect(() => {
    if (currentTrack) {
      try {
        sessionStorage.setItem("soundwave_current_track_id", String(currentTrack.id));
      } catch {
        // ignore
      }
    }
  }, [currentTrack]);

  useEffect(() => {
    return () => {
      audio.pause();
    };
  }, [audio]);

  // UC-10: Theo dõi ID track đã gửi request lấy stream info và ghi nhận lượt nghe cho phiên phát hiện tại
  const activeStreamTrackIdRef = useRef<number | null>(null);

  const syncTrackPlay = useCallback(async (targetTrack: LandingTrack) => {
    if (!targetTrack || !targetTrack.id) return;
    try {
      const freshTrack = await catalogApi.getTrackById(targetTrack.id);
      if (freshTrack) {
        setCurrentTrack((prev) => (prev && Number(prev.id) === Number(targetTrack.id) ? { ...prev, ...freshTrack } : prev));
        setQueue((prevQueue) =>
          prevQueue.map((item) => (Number(item.id) === Number(targetTrack.id) ? { ...item, ...freshTrack } : item))
        );
        if (freshTrack.audioUrl && (!audio.src || audio.src === window.location.href)) {
          audio.src = freshTrack.audioUrl;
          void audio.play().catch(() => {});
        }
      }
    } catch (err) {
      console.warn("Could not sync live track stream info:", err);
    }
  }, [audio]);

  const setAudioPlaying = useCallback(
    (shouldPlay: boolean) => {
      if (shouldPlay) {
        void audio
          .play()
          .then(() => {
            setPlaying(true);
            if (currentTrack?.id && activeStreamTrackIdRef.current !== currentTrack.id) {
              activeStreamTrackIdRef.current = currentTrack.id;
              void syncTrackPlay(currentTrack);
            }
          })
          .catch(() => setPlaying(false));
      } else {
        audio.pause();
        setPlaying(false);
      }
    },
    [audio, currentTrack, syncTrackPlay]
  );

  const togglePlay = useCallback(() => {
    setAudioPlaying(!playing);
  }, [playing, setAudioPlaying]);

  const pause = useCallback(() => {
    audio.pause();
    setPlaying(false);
  }, [audio]);

  const playTrack = useCallback(
    (
      track: LandingTrack,
      contextQueueOrAutoplay?: LandingTrack[] | boolean,
      _contextTitle?: string,
      _contextKey?: string
    ) => {
      const autoplay = typeof contextQueueOrAutoplay === "boolean" ? contextQueueOrAutoplay : true;
      const contextQueue = Array.isArray(contextQueueOrAutoplay) ? contextQueueOrAutoplay : undefined;

      if (currentTrack && Number(currentTrack.id) === Number(track.id)) {
        if (typeof contextQueueOrAutoplay === "boolean" && contextQueueOrAutoplay === true) {
          // Yêu cầu phát lại cụ thể từ giao diện hoặc chế độ repeat
          audio.currentTime = 0;
          activeStreamTrackIdRef.current = track.id;
          void audio
            .play()
            .then(() => setPlaying(true))
            .catch(() => setPlaying(false));
          void syncTrackPlay(track);
          return;
        }

        if (playing) {
          setAudioPlaying(false);
        } else {
          activeStreamTrackIdRef.current = track.id;
          setAudioPlaying(true);
          void syncTrackPlay(track);
        }
        return;
      }

      activeStreamTrackIdRef.current = track.id;
      setCurrentTrack(track);
      if (contextQueue && contextQueue.length > 0) {
        setQueue(contextQueue);
      } else {
        setQueue((prev) => (prev.some((item) => Number(item.id) === Number(track.id)) ? prev : [track, ...prev]));
      }
      if (track.audioUrl && audio.src !== track.audioUrl) {
        audio.src = track.audioUrl;
        audio.load();
      }
      if (autoplay) {
        void audio
          .play()
          .then(() => setPlaying(true))
          .catch(() => setPlaying(false));
      } else {
        setPlaying(false);
      }

      // UC-10: Gửi request GET /api/v1/tracks/{trackId} lấy stream info, tự động tăng play count và ghi history
      if (track.id) {
        void syncTrackPlay(track);
      }
    },
    [audio, currentTrack, playing, setAudioPlaying, syncTrackPlay]
  );

  const handleGuestTrackEnded = useCallback((next: LandingTrack) => {
    setPendingTrack(next);
    setGuestPromptOpen(true);
  }, []);

  const continueListening = useCallback(() => {
    setGuestPromptOpen(false);
    if (pendingTrack) {
      playTrack(pendingTrack, true);
    }
    setPendingTrack(null);
  }, [pendingTrack, playTrack]);

  const closeGuestPrompt = useCallback(() => {
    setGuestPromptOpen(false);
  }, []);

  const handleRecordPlay = useCallback(
    async (trackId: number, listenedDurationMs: number, completed: boolean) => {
      try {
        const res = await catalogApi.recordPlay(trackId, listenedDurationMs, completed);
        setCurrentTrack((prev) =>
          prev && prev.id === trackId ? { ...prev, playCount: res.playCount } : prev
        );
        setQueue((prevQueue) =>
          prevQueue.map((item) => (item.id === trackId ? { ...item, playCount: res.playCount } : item))
        );
      } catch (err) {
        console.warn("Failed to record play count:", err);
      }
    },
    []
  );

  const toggleQueue = useCallback(() => {
    setQueueOpen((prev) => {
      if (!prev) setLyricsOpen(false);
      return !prev;
    });
  }, []);

  const toggleLyrics = useCallback(() => {
    setLyricsOpen((prev) => {
      if (!prev) setQueueOpen(false);
      return !prev;
    });
  }, []);

  const removeFromQueue = useCallback((trackId: number) => {
    setQueue((prev) => prev.filter((t) => t.id !== trackId));
  }, []);

  const clearQueue = useCallback(() => {
    setCurrentTrack((current) => {
      if (current) {
        setQueue([current]);
      } else {
        setQueue([]);
      }
      return current;
    });
  }, []);

  const reorderQueue = useCallback((newQueue: LandingTrack[]) => {
    setQueue(newQueue);
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        audio,
        currentTrack,
        playing,
        queue,
        queueOpen,
        lyricsOpen,
        guestPromptOpen,
        pendingTrack,
        playTrack,
        togglePlay,
        setAudioPlaying,
        toggleQueue,
        setQueueOpen,
        toggleLyrics,
        setLyricsOpen,
        removeFromQueue,
        clearQueue,
        reorderQueue,
        handleGuestTrackEnded,
        continueListening,
        closeGuestPrompt,
        handleRecordPlay,
        pause,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer(): PlayerContextType {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}
