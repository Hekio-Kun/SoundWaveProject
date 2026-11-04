import { apiFetch } from "./client";
import type { UnifiedSearchResponse } from "../types";

export type SearchCategoryType = "ALL" | "SONGS" | "ALBUMS" | "CREATORS" | "LYRICS";

export type SearchParams = {
  q: string;
  type?: SearchCategoryType;
  page?: number;
  size?: number;
};

export const searchApi = {
  search: async (params: SearchParams): Promise<UnifiedSearchResponse> => {
    const query = new URLSearchParams();
    query.set("q", params.q.trim());
    if (params.type) query.set("type", params.type);
    if (params.page !== undefined) query.set("page", String(params.page));
    if (params.size !== undefined) query.set("size", String(params.size));

    return apiFetch<UnifiedSearchResponse>(`/search?${query.toString()}`);
  },
};

