/**
 * Time and duration formatting utility functions.
 */

export function formatDuration(ms?: number | null): string {
  if (!ms || ms <= 0 || isNaN(ms)) return "0:00";
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function formatDurationSeconds(seconds?: number | null): string {
  if (!seconds || seconds <= 0 || isNaN(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.floor(seconds % 60);
  return `${minutes}:${remaining.toString().padStart(2, "0")}`;
}
