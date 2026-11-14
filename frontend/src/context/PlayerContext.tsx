import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { catalogApi } from "../api/catalog";
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
  lyricsFullScreen: boolean;
  setLyricsFullScreen: React.Dispatch<React.SetStateAction<boolean>>;
  lyricsSource: "OFFICIAL" | "PERSONAL";
  setLyricsSource: (source: "OFFICIAL" | "PERSONAL") => void;
  openLyricsFullscreen: (trackToPlay?: LandingTrack, source?: "OFFICIAL" | "PERSONAL") => void;
  removeFromQueue: (trackId: number) => void;
  clearQueue: () => void;
  handleGuestTrackEnded: (next: LandingTrack) => void;
  continueListening: () => void;
  closeGuestPrompt: () => void;
  reorderQueue: (newQueue: LandingTrack[]) => void;
  pause: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audio = useMemo(() => {
    const el = new Audio("");
    el.preload = "metadata";
    return el;
  }, []);

  const [currentTrack, setCurrentTrack] = useState<LandingTrack | null>(null);
  const [playing, setPlaying] = useState(false);
  const [queue, setQueue] = useState<LandingTrack[]>([]);
  const [queueOpen, setQueueOpen] = useState(false);
  const [lyricsOpen, setLyricsOpen] = useState(false);
  const [lyricsFullScreen, setLyricsFullScreen] = useState(false);
  const [lyricsSource, setLyricsSource] = useState<"OFFICIAL" | "PERSONAL">("OFFICIAL");

  const [guestPromptOpen, setGuestPromptOpen] = useState(false);
  const [pendingTrack, setPendingTrack] = useState<LandingTrack | null>(null);

  // Tự động tải danh sách bài hát thực tế mới nhất từ Backend API cho Player queue và track hiện tại
  useEffect(() => {
    let active = true;
    catalogApi.getTracks({ size: 50, sort: "newest" })
      .then((res) => {
        if (!active || !res?.content || res.content.length === 0) return;
        const apiTracks = res.content.filter(
          (t) => !t.audioUrl?.includes("soundwave-demo.wav") && t.id < 900
        );
        if (apiTracks.length === 0) return;

        setQueue((prevQueue) => (prevQueue.length === 0 ? apiTracks : prevQueue));

        setCurrentTrack((prev) => {
          if (!prev) {
            try {
              const savedId = sessionStorage.getItem("soundwave_current_track_id");
              if (savedId) {
                const matched = apiTracks.find((t) => t.id === Number(savedId));
                if (matched) {
                  if (audio && matched.audioUrl && (!audio.src || audio.src === window.location.href)) {
                    audio.src = matched.audioUrl;
                  }
                  return matched;
                } else {
                  sessionStorage.removeItem("soundwave_current_track_id");
                }
              }
            } catch {}

            const firstReal = apiTracks[0];
            if (audio && firstReal?.audioUrl && (!audio.src || audio.src === window.location.href)) {
              audio.src = firstReal.audioUrl;
            }
            return firstReal || null;
          }
          return prev;
        });
      })
      .catch((err) => {
        console.warn("Could not load backend tracks for player queue:", err);
      });

    return () => {
      active = false;
    };
  }, [audio]);

  useEffect(() => {
    if (currentTrack) {
      try {
        sessionStorage.setItem("soundwave_current_track_id", String(currentTrack.id));
      } catch {
        // ignore
      }
    }
  }, [currentTrack]);

  const currentTrackRef = useRef(currentTrack);
  useEffect(() => {
    currentTrackRef.current = currentTrack;
  }, [currentTrack]);

  // UC-10: Theo dõi ID track đã gửi request lấy stream info và ghi nhận lượt nghe cho phiên phát hiện tại
  const activeStreamTrackIdRef = useRef<number | null>(null);

  const syncTrackPlay = useCallback(async (targetTrack: LandingTrack, recordPlaySession: boolean = true) => {
    if (!targetTrack || !targetTrack.id) return;
    try {
      let updatedPlayCount = targetTrack.playCount;
      // UC-10: Ghi nhận lượt nghe và lịch sử nghe nhạc (Immediate on play - BR-13)
      if (recordPlaySession) {
        try {
          const playRes = await catalogApi.recordPlay(targetTrack.id, 0, false);
          if (playRes && typeof playRes.playCount === "number") {
            updatedPlayCount = playRes.playCount;
          }
        } catch (playErr) {
          console.warn("Could not record track play count:", playErr);
        }
      }

      const freshTrack = await catalogApi.getTrackById(targetTrack.id);
      const mergedTrack = freshTrack
        ? { ...freshTrack, playCount: updatedPlayCount }
        : { ...targetTrack, playCount: updatedPlayCount };

      setCurrentTrack((prev) => (prev && Number(prev.id) === Number(targetTrack.id) ? { ...prev, ...mergedTrack } : prev));
      setQueue((prevQueue) =>
        prevQueue.map((item) => (Number(item.id) === Number(targetTrack.id) ? { ...item, ...mergedTrack } : item))
      );
      if (mergedTrack.audioUrl && (!audio.src || audio.src === window.location.href)) {
        audio.src = mergedTrack.audioUrl;
        void audio.play().catch(() => { });
      }
    } catch (err) {
      console.warn("Could not sync live track stream info:", err);
    }
  }, [audio]);

  // UC-10 / UC-11: Tự động đồng bộ trạng thái playing với HTMLAudioElement nguyên bản
  useEffect(() => {
    const handlePlay = () => {
      setPlaying(true);
      const track = currentTrackRef.current;
      if (track?.id && activeStreamTrackIdRef.current !== track.id) {
        activeStreamTrackIdRef.current = track.id;
        void syncTrackPlay(track, true);
      }
    };
    const handlePause = () => {
      setPlaying(false);
    };
    const handleEnded = () => {
      if (audio.paused || audio.ended) {
        setPlaying(false);
      }
    };

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("playing", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    if (!audio.paused && !audio.ended) {
      setPlaying(true);
    } else {
      setPlaying(false);
    }

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("playing", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audio, syncTrackPlay]);

  const setAudioPlaying = useCallback(
    (shouldPlay: boolean) => {
      if (shouldPlay) {
        void audio
          .play()
          .then(() => {
            setPlaying(true);
            if (currentTrack?.id && activeStreamTrackIdRef.current !== currentTrack.id) {
              activeStreamTrackIdRef.current = currentTrack.id;
              void syncTrackPlay(currentTrack, true);
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
          void syncTrackPlay(track, true);
          return;
        }

        if (playing) {
          setAudioPlaying(false);
        } else {
          setAudioPlaying(true);
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

      // UC-10: Ghi nhận lượt nghe và đồng bộ metadata
      if (track.id) {
        void syncTrackPlay(track, true);
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

  const toggleQueue = useCallback(() => {
    setQueueOpen((prev) => {
      if (!prev) setLyricsOpen(false);
      return !prev;
    });
  }, []);

  const toggleLyrics = useCallback(() => {
    setLyricsOpen((prev) => {
      if (!prev) setQueueOpen(false);
      if (prev) setLyricsFullScreen(false);
      return !prev;
    });
  }, []);

  const handleSetLyricsOpen = useCallback((open: boolean) => {
    setLyricsOpen(open);
    if (!open) setLyricsFullScreen(false);
  }, []);

  const openLyricsFullscreen = useCallback((trackToPlay?: LandingTrack, source: "OFFICIAL" | "PERSONAL" = "OFFICIAL") => {
    if (trackToPlay && (!currentTrack || currentTrack.id !== trackToPlay.id)) {
      playTrack(trackToPlay);
    } else if (!playing) {
      setAudioPlaying(true);
      void audio.play().catch(() => { });
    }
    setQueueOpen(false);
    setLyricsSource(source);
    setLyricsFullScreen(true);
    setLyricsOpen(true);
  }, [currentTrack, playTrack, playing, audio]);

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
        setLyricsOpen: handleSetLyricsOpen,
        lyricsFullScreen,
        setLyricsFullScreen,
        lyricsSource,
        setLyricsSource,
        openLyricsFullscreen,
        removeFromQueue,
        clearQueue,
        reorderQueue,
        handleGuestTrackEnded,
        continueListening,
        closeGuestPrompt,
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
