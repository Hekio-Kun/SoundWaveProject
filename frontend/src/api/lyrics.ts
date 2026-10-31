import { apiFetch } from "./client";
import type { CustomLyricItem, TrackLyricsBundle } from "../types";

export const lyricsApi = {
  getTrackLyrics: async (trackId: number): Promise<TrackLyricsBundle> => {
    return apiFetch<TrackLyricsBundle>(`/tracks/${trackId}/lyrics`);
  },

  getMyCustomLyrics: async (trackId: number): Promise<CustomLyricItem[]> => {
    return apiFetch<CustomLyricItem[]>(`/tracks/${trackId}/lyrics/custom`);
  },

  saveCustomLyric: async (
    trackId: number,
    lyricContent: string,
    lyricType = "CUSTOM"
  ): Promise<CustomLyricItem> => {
    return apiFetch<CustomLyricItem>(`/tracks/${trackId}/lyrics/custom`, {
      method: "POST",
      body: { lyricContent, lyricType },
    });
  },

  deleteCustomLyric: async (
    trackId: number,
    lyricType = "CUSTOM"
  ): Promise<void> => {
    await apiFetch<void>(`/tracks/${trackId}/lyrics/custom?lyricType=${encodeURIComponent(lyricType)}`, {
      method: "DELETE",
    });
  },
};
