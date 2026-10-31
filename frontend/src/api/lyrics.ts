import { apiFetch } from "./client";
import { LyricDetail, TrackLyricsBundle, StaffTrackLyricSummary } from "../types";

export type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
};

export const lyricsApi = {
  // Listener endpoints (UC-16 & UC-18)
  getTrackLyrics: (trackId: number): Promise<TrackLyricsBundle> => {
    return apiFetch<TrackLyricsBundle>(`/tracks/${trackId}/lyrics`);
  },

  savePersonalLyric: (
    trackId: number,
    lyricContent: string,
    lyricType: "CUSTOM" | "TRANSLATION" = "CUSTOM"
  ): Promise<LyricDetail> => {
    return apiFetch<LyricDetail>(`/tracks/${trackId}/lyrics/personal`, {
      method: "POST",
      body: { lyricType, lyricContent },
    });
  },

  deletePersonalLyric: (
    trackId: number,
    lyricType: "CUSTOM" | "TRANSLATION" = "CUSTOM"
  ): Promise<{ message: string }> => {
    return apiFetch<{ message: string }>(
      `/tracks/${trackId}/lyrics/personal?lyricType=${encodeURIComponent(lyricType)}`,
      {
        method: "DELETE",
      }
    );
  },

  // Staff endpoints (UC-26 / Section 6.4)
  getStaffLyricsTracks: (params?: {
    search?: string;
    status?: string;
    page?: number;
    size?: number;
  }): Promise<PageResponse<StaffTrackLyricSummary>> => {
    const query = new URLSearchParams();
    if (params?.search && params.search.trim()) query.set("search", params.search.trim());
    if (params?.status && params.status !== "ALL") query.set("status", params.status);
    if (typeof params?.page === "number") query.set("page", params.page.toString());
    if (typeof params?.size === "number") query.set("size", params.size.toString());

    const qs = query.toString();
    return apiFetch<PageResponse<StaffTrackLyricSummary>>(
      `/staff/lyrics/tracks${qs ? `?${qs}` : ""}`
    );
  },

  getStaffOfficialLyric: (trackId: number): Promise<LyricDetail> => {
    return apiFetch<LyricDetail>(`/staff/lyrics/tracks/${trackId}`);
  },

  saveStaffOfficialLyric: (payload: {
    trackId: number;
    lyricContent: string;
    status: "DRAFT" | "PUBLISHED";
  }): Promise<LyricDetail> => {
    return apiFetch<LyricDetail>("/staff/lyrics", {
      method: "POST",
      body: payload,
    });
  },

  updateStaffOfficialLyricStatus: (
    trackId: number,
    status: "DRAFT" | "PUBLISHED"
  ): Promise<LyricDetail> => {
    return apiFetch<LyricDetail>(`/staff/lyrics/tracks/${trackId}/status`, {
      method: "PATCH",
      body: { status },
    });
  },

  deleteStaffOfficialLyric: (trackId: number): Promise<{ message: string }> => {
    return apiFetch<{ message: string }>(`/staff/lyrics/tracks/${trackId}`, {
      method: "DELETE",
    });
  },
};
