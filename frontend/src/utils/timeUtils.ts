/**
 * Định dạng thời lượng đồng nhất toàn bộ dự án SoundWave.
 */

/**
 * Định dạng thời lượng từ mili-giây sang mm:ss (dùng cho Track duration, Album duration).
 *
 * @param ms - Thời lượng tính bằng mili-giây
 * @returns Chuỗi định dạng "mm:ss", hoặc "0:00" nếu không hợp lệ
 */
export function formatDuration(ms?: number | null): string {
  if (typeof ms !== "number" || !Number.isFinite(ms) || ms <= 0) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Định dạng thời lượng từ giây sang mm:ss (dùng cho Audio player currentTime, duration).
 *
 * @param seconds - Thời lượng tính bằng giây
 * @returns Chuỗi định dạng "mm:ss", hoặc "0:00" nếu không hợp lệ
 */
export function formatDurationSeconds(seconds?: number | null): string {
  if (typeof seconds !== "number" || !Number.isFinite(seconds) || seconds <= 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.floor(seconds % 60);
  return `${minutes}:${remaining.toString().padStart(2, "0")}`;
}

/**
 * Bí danh cho formatDurationSeconds.
 */
export const formatTime = formatDurationSeconds;
