/**
 * Downloads a string of LRC lyrics content as a .lrc file in the browser.
 * Sanitizes filename to prevent invalid characters across Windows/macOS/Linux.
 */
export function downloadLrcFile(trackTitle: string, artistName?: string, lrcContent?: string | null): boolean {
  if (!lrcContent || !lrcContent.trim()) {
    return false;
  }

  const safeTitle = (trackTitle || "lyrics").replace(/[<>:"/\\|?*\x00-\x1F]+/g, "_").trim();
  const safeArtist = artistName ? ` - ${artistName.replace(/[<>:"/\\|?*\x00-\x1F]+/g, "_").trim()}` : "";
  const filename = `${safeTitle}${safeArtist}.lrc`;

  const blob = new Blob([lrcContent], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}
