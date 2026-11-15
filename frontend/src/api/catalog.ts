import { API_BASE_URL, apiFetch } from "./client";
import type { Genre, LandingTrack, PublicAlbum, PublicAlbumDetails } from "../types";

export type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
};

export type RecordPlayResponse = {
  trackId: number;
  playCount: number;
  recordedHistory: boolean;
};

// Client-side in-memory caching to eliminate redundant loading flashes during SPA navigation
let genresCache: Genre[] | null = null;
let genresPromise: Promise<Genre[]> | null = null;

export function getCachedGenres(): Genre[] | null {
  return genresCache;
}

export function invalidateGenresCache(): void {
  genresCache = null;
  genresPromise = null;
}

type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

const tracksCache = new Map<string, CacheEntry<PageResponse<LandingTrack>>>();
const TRACKS_CACHE_TTL = 3 * 60 * 1000; // 3 minutes

export function getTracksCacheKey(params?: {
  genre?: string;
  search?: string;
  sort?: "newest" | "trending" | "title" | "title_desc";
  creatorId?: number;
  page?: number;
  size?: number;
}): string {
  return `${params?.genre || "all"}::${params?.search || ""}::${params?.sort || "newest"}::${params?.creatorId ?? ""}::${params?.page ?? 0}::${params?.size ?? 18}`;
}

export function getCachedTracks(params?: Parameters<typeof catalogApi.getTracks>[0]): PageResponse<LandingTrack> | null {
  const key = getTracksCacheKey(params);
  const entry = tracksCache.get(key);
  if (entry && Date.now() - entry.timestamp < TRACKS_CACHE_TTL) {
    return entry.data;
  }
  return null;
}

export function invalidateTracksCache(): void {
  tracksCache.clear();
}

const rankingCache = new Map<string, CacheEntry<LandingTrack[]>>();
const RANKING_CACHE_TTL = 3 * 60 * 1000;

export function getCachedRanking(params?: { genre?: string; limit?: number }): LandingTrack[] | null {
  const key = `${params?.genre || "all"}::${params?.limit ?? 50}`;
  const entry = rankingCache.get(key);
  if (entry && Date.now() - entry.timestamp < RANKING_CACHE_TTL) {
    return entry.data;
  }
  return null;
}

export function invalidateRankingCache(): void {
  rankingCache.clear();
}

const albumsCache = new Map<string, CacheEntry<PageResponse<PublicAlbum>>>();
const ALBUMS_CACHE_TTL = 3 * 60 * 1000;

export function getCachedAlbums(params?: {
  search?: string;
  sort?: "newest" | "title" | "tracks" | "oldest";
  page?: number;
  size?: number;
}): PageResponse<PublicAlbum> | null {
  const key = `${params?.search || ""}::${params?.sort || "newest"}::${params?.page ?? 0}::${params?.size ?? 50}`;
  const entry = albumsCache.get(key);
  if (entry && Date.now() - entry.timestamp < ALBUMS_CACHE_TTL) {
    return entry.data;
  }
  return null;
}

export function invalidateAlbumsCache(): void {
  albumsCache.clear();
}

export const catalogApi = {
  getGenres: async (): Promise<Genre[]> => {
    if (genresCache && genresCache.length > 0) {
      return genresCache;
    }
    if (genresPromise) {
      return genresPromise;
    }
    genresPromise = apiFetch<Genre[]>("/genres")
      .then((data) => {
        genresCache = data;
        return data;
      })
      .finally(() => {
        genresPromise = null;
      });
    return genresPromise;
  },

  getTracks: async (params?: {
    genre?: string;
    search?: string;
    sort?: "newest" | "trending" | "title" | "title_desc";
    creatorId?: number;
    page?: number;
    size?: number;
  }): Promise<PageResponse<LandingTrack>> => {
    const key = getTracksCacheKey(params);
    const cached = tracksCache.get(key);
    if (cached && Date.now() - cached.timestamp < TRACKS_CACHE_TTL) {
      return cached.data;
    }

    const query = new URLSearchParams();
    if (params?.genre && params.genre !== "all") query.set("genre", params.genre);
    if (params?.search) query.set("search", params.search);
    if (params?.sort) query.set("sort", params.sort);
    if (params?.creatorId !== undefined) query.set("creatorId", String(params.creatorId));
    if (params?.page !== undefined) query.set("page", String(params.page));
    if (params?.size !== undefined) query.set("size", String(params.size));

    const qs = query.toString();
    const data = await apiFetch<PageResponse<LandingTrack>>(`/tracks${qs ? `?${qs}` : ""}`);
    if (data) {
      tracksCache.set(key, { data, timestamp: Date.now() });
    }
    return data;
  },

  getRankingBoard: async (params?: { genre?: string; limit?: number }): Promise<LandingTrack[]> => {
    const key = `${params?.genre || "all"}::${params?.limit ?? 50}`;
    const cached = rankingCache.get(key);
    if (cached && Date.now() - cached.timestamp < RANKING_CACHE_TTL) {
      return cached.data;
    }

    const query = new URLSearchParams();
    if (params?.genre && params.genre !== "all") query.set("genre", params.genre);
    if (params?.limit !== undefined) query.set("limit", String(params.limit));

    const qs = query.toString();
    try {
      const data = await apiFetch<LandingTrack[]>(`/tracks/ranking${qs ? `?${qs}` : ""}`);
      if (data) {
        rankingCache.set(key, { data, timestamp: Date.now() });
      }
      return data;
    } catch {
      // Fallback: If running backend server has not yet been restarted with /tracks/ranking endpoint,
      // fallback smoothly to /tracks?sort=trending so the user gets real live data immediately
      const fallbackQuery = new URLSearchParams();
      if (params?.genre && params.genre !== "all") fallbackQuery.set("genre", params.genre);
      fallbackQuery.set("sort", "trending");
      fallbackQuery.set("page", "0");
      fallbackQuery.set("size", String(params?.limit ?? 50));

      const fallbackRes = await apiFetch<PageResponse<LandingTrack>>(`/tracks?${fallbackQuery.toString()}`);
      const fallbackData = fallbackRes?.content ?? [];
      if (fallbackData) {
        rankingCache.set(key, { data: fallbackData, timestamp: Date.now() });
      }
      return fallbackData;
    }
  },

  getTrackById: async (idOrSlug: string | number): Promise<LandingTrack> => {
    return apiFetch<LandingTrack>(`/tracks/${idOrSlug}`);
  },

  getRecommendations: async (idOrSlug: string | number, limit = 5): Promise<LandingTrack[]> => {
    return apiFetch<LandingTrack[]>(`/tracks/${idOrSlug}/recommendations?limit=${limit}`);
  },

  getCuratedRecommendations: async (limit = 10): Promise<LandingTrack[]> => {
    try {
      return await apiFetch<LandingTrack[]>(`/tracks/recommendations?limit=${limit}`);
    } catch {
      // Graceful fallback to trending catalog tracks if endpoint unavailable
      const fallbackRes = await apiFetch<PageResponse<LandingTrack>>(`/tracks?sort=trending&page=0&size=${limit}`);
      return fallbackRes?.content ?? [];
    }
  },

  getAlbums: async (params?: {
    search?: string;
    sort?: "newest" | "title" | "tracks" | "oldest";
    page?: number;
    size?: number;
  }): Promise<PageResponse<PublicAlbum>> => {
    const key = `${params?.search || ""}::${params?.sort || "newest"}::${params?.page ?? 0}::${params?.size ?? 50}`;
    const cached = albumsCache.get(key);
    if (cached && Date.now() - cached.timestamp < ALBUMS_CACHE_TTL) {
      return cached.data;
    }

    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.sort) query.set("sort", params.sort);
    if (params?.page !== undefined) query.set("page", String(params.page));
    if (params?.size !== undefined) query.set("size", String(params.size));

    const qs = query.toString();
    const data = await apiFetch<PageResponse<PublicAlbum>>(`/albums${qs ? `?${qs}` : ""}`);
    if (data) {
      albumsCache.set(key, { data, timestamp: Date.now() });
    }
    return data;
  },

  getAlbumByIdOrSlug: async (idOrSlug: string | number): Promise<PublicAlbumDetails> => {
    return apiFetch<PublicAlbumDetails>(`/albums/${idOrSlug}`);
  },

  recordPlay: async (
    trackId: number,
    listenedDurationMs: number,
    completed: boolean
  ): Promise<RecordPlayResponse> => {
    return apiFetch<RecordPlayResponse>(`/tracks/${trackId}/play`, {
      method: "POST",
      body: { listenedDurationMs, completed },
    });
  },
};
