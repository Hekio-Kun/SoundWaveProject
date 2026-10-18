import { apiFetch } from "./client";
import type { NotificationItem } from "../types";

export type UnreadCountData = {
  unreadCount: number;
};

/**
 * Lấy số lượng thông báo chưa đọc của người dùng hiện tại (UC-17 Phase 1).
 */
export async function fetchUnreadCount(): Promise<number> {
  const data = await apiFetch<UnreadCountData>("/notifications/unread-count");
  return data?.unreadCount ?? 0;
}

/**
 * Lấy danh sách thông báo mới nhất của người dùng hiện tại (UC-17 Phase 2).
 */
export async function fetchNotifications(): Promise<NotificationItem[]> {
  return await apiFetch<NotificationItem[]>("/notifications");
}

/**
 * Đánh dấu một thông báo cụ thể là đã đọc (UC-17 Phase 4).
 */
export async function markNotificationAsRead(id: number): Promise<NotificationItem> {
  return await apiFetch<NotificationItem>(`/notifications/${id}/read`, {
    method: "PATCH",
  });
}

/**
 * Đánh dấu toàn bộ thông báo của người dùng là đã đọc (UC-17 Phase 4).
 */
export async function markAllNotificationsAsRead(): Promise<void> {
  await apiFetch<{ message: string }>("/notifications/read-all", {
    method: "PATCH",
  });
}
