import { useEffect, useState } from "react";
import { ArrowDownIcon, ArrowUpIcon, CloseIcon, PlayIcon, TrashIcon } from "../icons";
import type { LandingTrack } from "../types";

/**
 * Props for the {@link QueueDrawer} component.
 */
export type QueueDrawerProps = {
  /** Controls drawer slide-out visibility */
  isOpen: boolean;
  /** Callback triggered to close the drawer (via backdrop click, close button, or Escape key) */
  onClose: () => void;
  /** Track currently being played, rendered in the "Now Playing" top card */
  currentTrack: LandingTrack | null;
  /** Whether playback is currently active */
  playing: boolean;
  /** Entire playback queue including current and upcoming tracks */
  queue: LandingTrack[];
  /** Callback to switch playback immediately to the selected track */
  onPlayTrack: (track: LandingTrack) => void;
  /** Callback to remove a specific track from the queue */
  onRemoveFromQueue: (trackId: number) => void;
  /** Callback to clear upcoming tracks from the queue */
  onClearQueue: () => void;
  /** Callback invoked when queue track order is modified via drag-and-drop or reorder buttons (NF02) */
  onReorderQueue?: (newQueue: LandingTrack[]) => void;
  /** Human-readable context indicating where tracks were queued from */
  playbackContext?: string | null;
};

/**
 * Formats duration in milliseconds into `mm:ss` display format.
 *
 * @param ms - Duration in milliseconds
 * @returns Formatted time string
 */
const formatDuration = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

/**
 * Side drawer panel displaying the active playback queue and recently played tracks.
 * Supports drag-and-drop reordering, accessible move up/down controls (NF02),
 * and track deletion.
 */
export function QueueDrawer({
  isOpen,
  onClose,
  currentTrack,
  playing,
  queue,
  onPlayTrack,
  onRemoveFromQueue,
  onClearQueue,
  onReorderQueue,
  playbackContext,
}: QueueDrawerProps) {
  const [tab, setTab] = useState<"queue" | "recent">("queue");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const nextTracks = currentTrack ? queue.filter((t) => t.id !== currentTrack.id) : queue;

  /**
   * Reorders upcoming tracks by moving an element from `fromIndex` to `toIndex` (NF02).
   *
   * @param fromIndex - Source index within upcoming tracks list
   * @param toIndex - Destination index within upcoming tracks list
   */
  const moveTrack = (fromIndex: number, toIndex: number) => {
    if (!onReorderQueue || fromIndex < 0 || toIndex < 0 || fromIndex >= nextTracks.length || toIndex >= nextTracks.length) return;
    const reordered = [...nextTracks];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    const updatedQueue = currentTrack ? [currentTrack, ...reordered] : reordered;
    onReorderQueue(updatedQueue);
  };

  /**
   * Initiates drag operation for an upcoming queue track item.
   */
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  /**
   * Allows dragged item to be dropped over valid queue slots.
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  /**
   * Completes drag-and-drop operation, committing new queue ordering (NF02).
   */
  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;
    moveTrack(draggedIndex, dropIndex);
    setDraggedIndex(null);
  };

  return (
    <>
      <div
        className={`queue-drawer-backdrop ${isOpen ? "queue-drawer-backdrop--open" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`queue-drawer ${isOpen ? "queue-drawer--open" : ""}`}
        aria-label="Playback queue"
        aria-hidden={!isOpen}
      >
      <div className="queue-drawer-header">
        <div className="queue-drawer-tabs">
          <button
            className={`queue-tab ${tab === "queue" ? "queue-tab--active" : ""}`}
            onClick={() => setTab("queue")}
          >
            Queue ({queue.length})
          </button>
          <button
            className={`queue-tab ${tab === "recent" ? "queue-tab--active" : ""}`}
            onClick={() => setTab("recent")}
          >
            Recently played
          </button>
        </div>

        <button className="icon-button queue-close-btn" onClick={onClose} aria-label="Close queue">
          <CloseIcon width={18} height={18} />
        </button>
      </div>

      <div className="queue-drawer-body">
        {currentTrack && (
          <div className="queue-now-playing">
            <span className="queue-section-label">NOW PLAYING</span>
            <div className="queue-track-card queue-track-card--active">
              <div className="queue-track-cover">
                <img src={currentTrack.coverUrl ?? undefined} alt="" />
                <span className={`queue-playing-indicator ${playing ? "is-playing" : "is-paused"}`} aria-label={playing ? "Now playing" : "Paused"}>
                  <i /><i /><i />
                </span>
              </div>
              <div className="queue-track-info">
                <p className="queue-track-title">{currentTrack.title}</p>
                <p className="queue-track-artist">{currentTrack.creator.displayName}</p>
              </div>
              <span className="queue-track-duration">{formatDuration(currentTrack.durationMs)}</span>
            </div>
          </div>
        )}

        <div className="queue-next-section">
          <div className="queue-next-header">
            <span className="queue-section-label">NEXT TRACKS</span>
            {nextTracks.length > 0 && (
              <button className="queue-clear-btn" onClick={onClearQueue}>
                Clear queue
              </button>
            )}
          </div>

          {nextTracks.length === 0 ? (
            <div className="queue-empty-state">
              <p>There are no upcoming tracks.</p>
              <small>Add tracks from your Library or Explore.</small>
            </div>
          ) : (
            <div className="queue-track-list">
              {nextTracks.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className={`queue-track-card ${draggedIndex === index ? "queue-track-card--dragging" : ""}`}
                  draggable={Boolean(onReorderQueue)}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  <div className="queue-track-cover" onClick={() => onPlayTrack(item)}>
                    <img src={item.coverUrl ?? undefined} alt="" />
                    <button className="queue-play-hover-btn" aria-label={`Play ${item.title}`}>
                      <PlayIcon width={14} height={14} />
                    </button>
                  </div>
                  <div className="queue-track-info" onClick={() => onPlayTrack(item)}>
                    <p className="queue-track-title">{item.title}</p>
                    <p className="queue-track-artist">{item.creator.displayName}</p>
                  </div>
                  <span className="queue-track-duration">{formatDuration(item.durationMs)}</span>
                  {onReorderQueue && (
                    <div className="queue-item-reorder-actions" style={{ display: "flex", gap: "2px", alignItems: "center" }}>
                      <button
                        type="button"
                        className="queue-reorder-btn"
                        onClick={() => moveTrack(index, index - 1)}
                        disabled={index === 0}
                        aria-label={`Move ${item.title} up`}
                        title="Move up"
                        style={{
                          border: "none",
                          background: "transparent",
                          cursor: index === 0 ? "default" : "pointer",
                          opacity: index === 0 ? 0.25 : 0.7,
                          padding: "4px",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <ArrowUpIcon width={14} height={14} />
                      </button>
                      <button
                        type="button"
                        className="queue-reorder-btn"
                        onClick={() => moveTrack(index, index + 1)}
                        disabled={index === nextTracks.length - 1}
                        aria-label={`Move ${item.title} down`}
                        title="Move down"
                        style={{
                          border: "none",
                          background: "transparent",
                          cursor: index === nextTracks.length - 1 ? "default" : "pointer",
                          opacity: index === nextTracks.length - 1 ? 0.25 : 0.7,
                          padding: "4px",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <ArrowDownIcon width={14} height={14} />
                      </button>
                    </div>
                  )}
                  <button
                    className="queue-remove-btn"
                    onClick={() => onRemoveFromQueue(item.id)}
                    aria-label={`Remove ${item.title} from queue`}
                  >
                    <TrashIcon width={14} height={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  </>
);
}
