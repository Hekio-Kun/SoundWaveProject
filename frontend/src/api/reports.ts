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

export interface MyReportHistoryResponse {
  id: number;
  trackId: number;
  trackTitle: string;
  trackCoverUrl?: string | null;
  category: string;
  categoryLabel: string;
  status: "PENDING" | "RESOLVED" | "DISMISSED" | "REJECTED" | string;
  resolutionNote?: string | null;
  createdAt: string;
  handledAt?: string | null;
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
   * Lấy lịch sử các báo cáo vi phạm do người nghe hiện tại đã gửi (UC-22.2).
   */
  getMyReports: (): Promise<MyReportHistoryResponse[]> => {
    return apiFetch<MyReportHistoryResponse[]>("/reports/my-reports");
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
