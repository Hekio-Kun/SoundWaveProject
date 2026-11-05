import { apiFetch } from "./client";
import type { SystemStatisticsResponse } from "../types";

export const adminStatisticsApi = {
  getSystemStatistics: async (period: string = "month"): Promise<SystemStatisticsResponse> => {
    return apiFetch<SystemStatisticsResponse>(`/admin/statistics?period=${encodeURIComponent(period)}`);
  },
};

