import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { catalogApi } from "../api/catalog";
import { tracks } from "../data";
import type { LandingTrack } from "../types";

export interface PlayerContextType {
  audio: HTMLAudioElement;
  currentTrack: LandingTrack | null;
  playing: boolean;
  queue: LandingTrack[];
  queueOpen: boolean;
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
  removeFromQueue: (trackId: number) => void;
  clearQueue: () => void;
  handleGuestTrackEnded: (next: LandingTrack) => void;
  continueListening: () => void;
  closeGuestPrompt: () => void;
  handleRecordPlay: (trackId: number, listenedDurationMs: number, completed: boolean) => Promise<void>;
  pause: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audio = useMemo(() => new Audio(tracks[0]?.audioUrl || ""), []);
  const [currentTrack, setCurrentTrack] = useState<LandingTrack | null>(tracks[0] || null);
  const [playing, setPlaying] = useState(false);
  const [queue, setQueue] = useState<LandingTrack[]>(tracks);
  const [queueOpen, setQueueOpen] = useState(false);
  const [guestPromptOpen, setGuestPromptOpen] = useState(false);
  const [pendingTrack, setPendingTrack] = useState<LandingTrack | null>(null);

  useEffect(() => {
    return () => {
      audio.pause();
    };
  }, [audio]);

  const setAudioPlaying = useCallback(
    (shouldPlay: boolean) => {
      if (shouldPlay) {
        void audio
          .play()
          .then(() => setPlaying(true))
          .catch(() => setPlaying(false));
      } else {
        audio.pause();
        setPlaying(false);
      }
    },
    [audio]
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

      if (currentTrack?.id === track.id) {
        setAudioPlaying(!playing);
        return;
      }
      setCurrentTrack(track);
      if (contextQueue && contextQueue.length > 0) {
        setQueue(contextQueue);
      } else {
        setQueue((prev) => (prev.some((item) => item.id === track.id) ? prev : [track, ...prev]));
      }
      audio.src = track.audioUrl;
      audio.load();
      if (autoplay) setAudioPlaying(true);
      else setPlaying(false);
    },
    [audio, currentTrack?.id, playing, setAudioPlaying]
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
    setQueueOpen((prev) => !prev);
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

  return (
    <PlayerContext.Provider
      value={{
        audio,
        currentTrack,
        playing,
        queue,
        queueOpen,
        guestPromptOpen,
        pendingTrack,
        playTrack,
        togglePlay,
        setAudioPlaying,
        toggleQueue,
        setQueueOpen,
        removeFromQueue,
        clearQueue,
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
