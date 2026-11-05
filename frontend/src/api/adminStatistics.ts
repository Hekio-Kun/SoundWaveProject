import { apiFetch } from "./client";
import type { SystemStatisticsResponse } from "../types";

export const adminStatisticsApi = {
  /**
   * Lấy dữ liệu thống kê tổng quan hệ thống dành cho Admin.
   *
   * @param period Khoảng thời gian thống kê: "7d", "30d", "90d"
   */
  getSystemStatistics: (period: string = "7d") => {
    const query = new URLSearchParams();
    if (period) {
      query.set("period", period);
    }
    return apiFetch<SystemStatisticsResponse>(`/admin/statistics?${query.toString()}`);
  },
};

