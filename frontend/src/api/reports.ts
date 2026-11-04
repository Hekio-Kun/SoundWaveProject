import { apiFetch } from "./client";

export interface CreateContentReportPayload {
  trackId: number;
  reason: string;
  description?: string;
}

export interface ContentReportResponse {
  id: number;
  reporterId: number;
  targetType: string;
  targetId: number;
  reason: string;
  description?: string;
  status: string;
  createdAt: string;
}

export const reportsApi = {
  reportLyrics: (payload: CreateContentReportPayload): Promise<ContentReportResponse> => {
    return apiFetch<ContentReportResponse>("/reports/lyrics", {
      method: "POST",
      body: payload,
    });
  },
};
