import { apiFetch } from "./client";
import type { PageResponse } from "./catalog";
import type { ListeningHistoryItem } from "../types";

export const historyApi = {
  getListeningHistory: async (page = 0, size = 20): Promise<PageResponse<ListeningHistoryItem>> => {
    return apiFetch<PageResponse<ListeningHistoryItem>>(`/library/history?page=${page}&size=${size}`);
  },

  deleteHistoryItem: async (id: number): Promise<{ message: string }> => {
    return apiFetch<{ message: string }>(`/library/history/${id}`, {
      method: "DELETE",
    });
  },

  clearHistory: async (): Promise<{ message: string }> => {
    return apiFetch<{ message: string }>("/library/history", {
      method: "DELETE",
    });
  },
};
