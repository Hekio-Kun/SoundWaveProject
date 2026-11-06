import { apiFetch } from "./client";
import type { SystemStatisticsResponse } from "../types";

export const adminStatisticsApi = {
  /**
   * Lấy số liệu thống kê hệ thống tổng thể cho Admin Dashboard (UC-29: View System Statistics).
   *
   * @param period Khoảng thời gian thống kê ("7d", "30d", "90d" - mặc định: "7d")
   */
  getSystemStatistics: (period: string = "7d") => {
    const query = new URLSearchParams();
    if (period) {
      query.set("period", period);
    }
    return apiFetch<SystemStatisticsResponse>(`/admin/statistics?${query.toString()}`);
  },
};

