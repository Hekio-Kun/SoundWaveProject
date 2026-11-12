/**
 * Định dạng ngày và giờ đồng nhất toàn bộ dự án SoundWave.
 * Chuẩn hóa theo format được thống nhất từ UC-27 (Staff Directory & Status):
 * - Ngày (formatDate): "Nov 9, 2026", "Oct 31, 2026" (month: "short", day: "numeric", year: "numeric")
 * - Ngày & giờ (formatDateTime): "Nov 9, 2026, 11:33 AM", "Oct 31, 2026, 11:33 PM"
 */

export function formatDate(value?: string | number | Date | null, fallback = "—"): string {
  if (!value) return fallback;
  try {
    // Nếu chuỗi có dạng YYYY-MM-DD thuần túy, parse local để tránh bị lùi ngày do múi giờ UTC
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
      const [year, month, day] = value.trim().split("-").map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return fallback;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return fallback;
  }
}

export function formatDateTime(value?: string | number | Date | null, fallback = "—"): string {
  if (!value) return fallback;
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return fallback;
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return fallback;
  }
}

