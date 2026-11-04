import { apiFetch } from "./client";
import type { StaffDirectoryResponse } from "../types";

export type GetStaffParams = {
  search?: string;
  status?: string;
  role?: string;
  page?: number;
  size?: number;
  sort?: string;
};

export const adminStaffApi = {
  /**
   * Lấy danh bạ nhân viên kiểm duyệt (UC-27.1: View Staff Directory).
   */
  getStaffDirectory: (params: GetStaffParams = {}) => {
    const query = new URLSearchParams();
    if (params.search?.trim()) {
      query.set("search", params.search.trim());
    }
    if (params.status && params.status !== "ALL") {
      query.set("status", params.status);
    }
    if (params.role && params.role !== "ALL") {
      query.set("role", params.role);
    }
    query.set("page", String(params.page ?? 0));
    query.set("size", String(params.size ?? 10));
    query.set("sort", params.sort ?? "createdAt,desc");

    return apiFetch<StaffDirectoryResponse>(`/admin/staffs?${query.toString()}`);
  },
};

