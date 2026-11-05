import { apiFetch } from "./client";
import type {
  StaffContentReportResponse,
  ResolveContentReportRequest,
  TakeDownTrackRequest,
} from "../types";

export const staffReportsApi = {
  getReportsQueue: async (): Promise<StaffContentReportResponse[]> => {
    return apiFetch<StaffContentReportResponse[]>("/staff/reports");
  },

  getReportById: async (id: number): Promise<StaffContentReportResponse> => {
    return apiFetch<StaffContentReportResponse>(`/staff/reports/${id}`);
  },

  resolveReport: async (
    id: number,
    data: ResolveContentReportRequest
  ): Promise<StaffContentReportResponse> => {
    return apiFetch<StaffContentReportResponse>(`/staff/reports/${id}/resolve`, {
      method: "POST",
      body: data,
    });
  },

  takeDownTrack: async (
    trackId: number,
    data: TakeDownTrackRequest
  ): Promise<void> => {
    return apiFetch<void>(`/staff/tracks/${trackId}/takedown`, {
      method: "POST",
      body: data,
    });
  },
};

