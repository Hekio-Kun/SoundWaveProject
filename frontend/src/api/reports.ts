import { apiFetch } from "./client";

export type ReportCategoryType =
  | "COPYRIGHT"
  | "INAPPROPRIATE_CONTENT"
  | "INCORRECT_METADATA"
  | "OTHER";

export interface CreateTrackReportPayload {
  trackId: number;
  category: ReportCategoryType | string;
  description?: string;
}

export interface TrackReportResponse {
  id: number;
  trackId: number;
  trackTitle: string;
  trackCoverUrl?: string;
  submittedByUserId: number;
  category: string;
  categoryLabel: string;
  description: string;
  status: string;
  createdAt: string;
}

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
  /**
   * Báo cáo vi phạm nội dung bài hát đã phát hành (UC-22.1).
   */
  reportTrack: (payload: CreateTrackReportPayload): Promise<TrackReportResponse> => {
    return apiFetch<TrackReportResponse>("/reports", {
      method: "POST",
      body: payload,
    });
  },

  /**
   * Kiểm tra xem người dùng hiện tại đã có báo cáo PENDING cho bài hát hay chưa.
   */
  checkPendingReport: (trackId: number): Promise<{ trackId: number; hasPendingReport: boolean }> => {
    return apiFetch<{ trackId: number; hasPendingReport: boolean }>(`/reports/check?trackId=${trackId}`);
  },

  /**
   * Báo cáo lỗi lời bài hát (UC-31.1).
   */
  reportLyrics: (payload: CreateContentReportPayload): Promise<ContentReportResponse> => {
    return apiFetch<ContentReportResponse>("/reports/lyrics", {
      method: "POST",
      body: payload,
    });
  },
};
