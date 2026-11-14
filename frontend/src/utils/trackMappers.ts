import type { LandingTrack, ListeningHistoryItem } from "../types";

/**
 * Maps a ListeningHistoryItem response from the backend to a playable LandingTrack.
 *
 * @param item - Listening history item from API
 * @returns Unified LandingTrack object for audio playback and queues
 */
export function historyItemToTrack(item: ListeningHistoryItem): LandingTrack {
  return {
    id: item.trackId,
    title: item.title,
    slug: item.slug,
    coverUrl: item.coverUrl,
    audioUrl: item.audioUrl || "",
    durationMs: item.durationMs,
    playCount: 0,
    creator: {
      userId: 0,
      displayName: item.artistName || "Unknown Creator",
      avatarUrl: null,
    },
  };
}

