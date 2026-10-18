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

export const catalogApi = {
  getGenres: async (): Promise<Genre[]> => {
    return apiFetch<Genre[]>("/genres");
  },

  getTracks: async (params?: {
    genre?: string;
    search?: string;
    sort?: "newest" | "trending" | "title";
    creatorId?: number;
    page?: number;
    size?: number;
  }): Promise<PageResponse<LandingTrack>> => {
    const query = new URLSearchParams();
    if (params?.genre && params.genre !== "all") query.set("genre", params.genre);
    if (params?.search) query.set("search", params.search);
    if (params?.sort) query.set("sort", params.sort);
    if (params?.creatorId !== undefined) query.set("creatorId", String(params.creatorId));
    if (params?.page !== undefined) query.set("page", String(params.page));
    if (params?.size !== undefined) query.set("size", String(params.size));

    const qs = query.toString();
    return apiFetch<PageResponse<LandingTrack>>(`/tracks${qs ? `?${qs}` : ""}`);
  },

  getRankingBoard: async (params?: { genre?: string; limit?: number }): Promise<LandingTrack[]> => {
    const query = new URLSearchParams();
    if (params?.genre && params.genre !== "all") query.set("genre", params.genre);
    if (params?.limit !== undefined) query.set("limit", String(params.limit));

    const qs = query.toString();
    try {
      return await apiFetch<LandingTrack[]>(`/tracks/ranking${qs ? `?${qs}` : ""}`);
    } catch {
      // Fallback: If running backend server has not yet been restarted with /tracks/ranking endpoint,
      // fallback smoothly to /tracks?sort=trending so the user gets real live data immediately
      const fallbackQuery = new URLSearchParams();
      if (params?.genre && params.genre !== "all") fallbackQuery.set("genre", params.genre);
      fallbackQuery.set("sort", "trending");
      fallbackQuery.set("page", "0");
      fallbackQuery.set("size", String(params?.limit ?? 50));

      const fallbackRes = await apiFetch<PageResponse<LandingTrack>>(`/tracks?${fallbackQuery.toString()}`);
      return fallbackRes?.content ?? [];
    }
  },

  getTrackById: async (idOrSlug: string | number): Promise<LandingTrack> => {
    return apiFetch<LandingTrack>(`/tracks/${idOrSlug}`);
  },

  getRecommendations: async (idOrSlug: string | number, limit = 5): Promise<LandingTrack[]> => {
    return apiFetch<LandingTrack[]>(`/tracks/${idOrSlug}/recommendations?limit=${limit}`);
  },

  getAlbums: async (params?: {
    search?: string;
    sort?: "newest" | "title" | "tracks" | "oldest";
    page?: number;
    size?: number;
  }): Promise<PageResponse<PublicAlbum>> => {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.sort) query.set("sort", params.sort);
    if (params?.page !== undefined) query.set("page", String(params.page));
    if (params?.size !== undefined) query.set("size", String(params.size));

    const qs = query.toString();
    return apiFetch<PageResponse<PublicAlbum>>(`/albums${qs ? `?${qs}` : ""}`);
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
