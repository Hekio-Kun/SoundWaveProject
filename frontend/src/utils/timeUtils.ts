/**
 * Utility functions for formatting time and durations across SoundWave.
 */

/**
 * Formats duration in milliseconds into mm:ss format.
 *
 * @param ms Duration in milliseconds
 * @returns Formatted duration string, e.g. "3:45"
 */
export function formatDuration(ms?: number | null): string {
  if (!ms || ms <= 0) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Formats duration in seconds into mm:ss format.
 *
 * @param seconds Duration in seconds
 * @returns Formatted duration string, e.g. "3:45"
 */
export function formatDurationSeconds(seconds?: number | null): string {
  if (!seconds || seconds <= 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${minutes}:${sec.toString().padStart(2, "0")}`;
}

