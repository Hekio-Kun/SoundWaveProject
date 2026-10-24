import { useEffect, useMemo, useState } from "react";
import { covers } from "../data";
import {
  AlertIcon,
  ClockIcon,
  EditIcon,
  HeadphonesIcon,
  HeartIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  QueueIcon,
  RefreshIcon,
  TrashIcon,
} from "../icons";
import type { LandingTrack, ListeningHistoryItem, Playlist } from "../types";
import { historyApi } from "../api/history";
import { DeleteConfirmationModal } from "../components/modals/DeleteConfirmationModal";
import { CenterNotificationPopup } from "../components/modals/CenterNotificationPopup";

export function historyItemToTrack(item: ListeningHistoryItem): LandingTrack {
  return {
    id: item.trackId,
    title: item.title,
    slug: item.slug,
    coverUrl: item.coverUrl,
    audioUrl: item.audioUrl || "",
    durationMs: item.durationMs,
    playCount: 0,
    creator: {
      userId: 0,
      displayName: item.artistName || "Unknown Creator",
      avatarUrl: null,
    },
  };
}

type Props = {
  currentTrack: LandingTrack | null;
  playing: boolean;
  onPlayTrack: (track: LandingTrack, contextQueue?: LandingTrack[], contextTitle?: string, contextKey?: string) => void;
  onPlayAll?: (tracksToPlay: LandingTrack[], contextTitle?: string, contextKey?: string) => void;
  onNavigate: (route: string) => void;
  favoriteTracks: LandingTrack[];
  onToggleFavorite: (trackId: number) => Promise<void>;
  playlists: Playlist[];
  onCreatePlaylist: () => void;
  onEditPlaylist?: (playlist: Playlist) => void;
  onDeletePlaylist: (playlistId: number) => void;
  initialTab?: "favorites" | "playlists" | "history";
  allTracks?: LandingTrack[];
};

const formatDuration = (ms: number) => {
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${min}:${sec.toString().padStart(2, "0")}`;
};

function parseIsoDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  // Ensure ISO date string without explicit offset is treated as UTC
  if (!dateStr.endsWith("Z") && !/[+-]\d{2}:?\d{2}$/.test(dateStr)) {
    return new Date(dateStr + "Z");
  }
  return new Date(dateStr);
}

function getRelativeDateLabel(dateStr: string): string {
  if (!dateStr) return "Earlier";
  const date = parseIsoDate(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const targetDay = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const diffDays = Math.round((today - targetDay) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) {
    return date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatPlayedTime(dateStr: string): string {
  if (!dateStr) return "";
  const date = parseIsoDate(dateStr);
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

export function LibraryPage({
  currentTrack,
  playing,
  onPlayTrack,
  onPlayAll,
  onNavigate,
  favoriteTracks,
  onToggleFavorite,
  playlists,
  onCreatePlaylist,
  onEditPlaylist,
  onDeletePlaylist,
  initialTab = "favorites",
  allTracks,
}: Props) {
  const [tab, setTab] = useState<"favorites" | "playlists" | "history">(initialTab);

  // [FEATURE]: Đồng bộ hóa tab nội bộ khi prop initialTab thay đổi từ URL router (#/favorites, #/playlists, #/history)
  useEffect(() => {
    if (initialTab) {
      setTab(initialTab);
    }
  }, [initialTab]);

  const [historyItems, setHistoryItems] = useState<ListeningHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historyPage, setHistoryPage] = useState(0);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [historyTotalElements, setHistoryTotalElements] = useState(0);

  // Modal and Toast notification states
  const [deleteTarget, setDeleteTarget] = useState<ListeningHistoryItem | null>(null);
  const [isDeletingItem, setIsDeletingItem] = useState(false);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);
  const [isClearingAll, setIsClearingAll] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; message: string; type: "success" | "error" }>({
    open: false,
    message: "",
    type: "success",
  });

  const loadHistory = async (page = 0) => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const res = await historyApi.getListeningHistory(page, 20);
      setHistoryItems(res.content || []);
      setHistoryTotalPages(res.totalPages || 1);
      setHistoryPage(res.number || 0);
      setHistoryTotalElements(res.totalElements || 0);
    } catch (err: any) {
      setHistoryError(err?.message || "Failed to load listening history. Please try again.");
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "history") {
      loadHistory(historyPage);
    }
  }, [tab, historyPage]);

  const handleConfirmDeleteItem = async () => {
    if (!deleteTarget) return;
    setIsDeletingItem(true);
    try {
      await historyApi.deleteHistoryItem(deleteTarget.id);
      setHistoryItems((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      setHistoryTotalElements((prev) => Math.max(0, prev - 1));
      setToast({
        open: true,
        message: `Removed "${deleteTarget.title}" from your listening history.`,
        type: "success",
      });
      setDeleteTarget(null);
    } catch (err: any) {
      setToast({
        open: true,
        message: err?.message || "Failed to remove history record.",
        type: "error",
      });
    } finally {
      setIsDeletingItem(false);
    }
  };

  const handleConfirmClearAll = async () => {
    setIsClearingAll(true);
    try {
      await historyApi.clearHistory();
      setHistoryItems([]);
      setHistoryTotalElements(0);
      setHistoryTotalPages(1);
      setIsClearAllModalOpen(false);
      setToast({
        open: true,
        message: "Your listening history has been cleared successfully.",
        type: "success",
      });
    } catch (err: any) {
      setToast({
        open: true,
        message: err?.message || "Failed to clear listening history.",
        type: "error",
      });
    } finally {
      setIsClearingAll(false);
    }
  };

  const groupedHistory = useMemo(() => {
    const groups: { label: string; items: ListeningHistoryItem[] }[] = [];
    const map = new Map<string, ListeningHistoryItem[]>();

    for (const item of historyItems) {
      const label = getRelativeDateLabel(item.playedAt);
      if (!map.has(label)) {
        map.set(label, []);
      }
      map.get(label)!.push(item);
    }

    for (const [label, items] of map.entries()) {
      groups.push({ label, items });
    }

    return groups;
  }, [historyItems]);

  const historyTracks = useMemo(() => historyItems.map(historyItemToTrack), [historyItems]);

  return (
    <div className="library-page">
      <div className="page-title-banner">
        <div>
          <span className="eyebrow">PERSONAL COLLECTION</span>
          <h1 className="page-heading">Your Library</h1>
          <p className="page-subtext">Manage your Favorite tracks, Playlists, and Listening History.</p>
        </div>
      </div>

      {/* [FEATURE]: Thanh chuyển tab thư viện - Tự động cập nhật URL và đồng bộ trạng thái active của Sidebar */}
      <div className="library-tabs-bar">
        <div className="library-nav-tabs">
          <button
            className={`library-tab ${tab === "favorites" ? "library-tab--active" : ""}`}
            onClick={() => {
              setTab("favorites");
              onNavigate("/favorites");
            }}
          >
            Favorite tracks ({favoriteTracks.length})
          </button>
          <button
            className={`library-tab ${tab === "playlists" ? "library-tab--active" : ""}`}
            onClick={() => {
              setTab("playlists");
              onNavigate("/playlists");
            }}
          >
            Playlists ({playlists.length})
          </button>
          <button
            className={`library-tab ${tab === "history" ? "library-tab--active" : ""}`}
            onClick={() => {
              setTab("history");
              onNavigate("/history");
            }}
          >
            Listening history ({historyTotalElements})
          </button>
        </div>

        {tab === "favorites" && favoriteTracks.length > 0 && (
          <button
            className="button button-primary button-small"
            onClick={() =>
              onPlayAll
                ? onPlayAll(favoriteTracks, "Favorite tracks", "favorites")
                : onPlayTrack(favoriteTracks[0], favoriteTracks, "Favorite tracks", "favorites")
            }
          >
            <PlayIcon width={16} height={16} />
            <span>Play all</span>
          </button>
        )}

        {tab === "playlists" && (
          <button className="button button-primary button-small" onClick={onCreatePlaylist}>
            <PlusIcon width={16} height={16} />
            <span>Create playlist</span>
          </button>
        )}

        {tab === "history" && historyItems.length > 0 && (
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button
              className="button button-primary button-small"
              onClick={() =>
                onPlayAll
                  ? onPlayAll(historyTracks, "Listening History", "history")
                  : onPlayTrack(historyTracks[0], historyTracks, "Listening History", "history")
              }
            >
              <PlayIcon width={16} height={16} />
              <span>Play all</span>
            </button>
            <button
              className="button button-secondary button-small"
              onClick={() => setIsClearAllModalOpen(true)}
              title="Clear all listening history"
              style={{ color: "#b42318", borderColor: "#fecdca" }}
            >
              <TrashIcon width={14} height={14} />
              <span>Clear history</span>
            </button>
          </div>
        )}
      </div>

      {tab === "favorites" ? (
        favoriteTracks.length === 0 ? (
          <div className="state-empty-box">
            <HeartIcon width={48} height={48} />
            <p className="empty-title">No favorite tracks yet</p>
            <p className="empty-desc">Select the heart icon on a track to save it here.</p>
            <button className="button button-primary button-small" onClick={() => onNavigate("/explore")}>
              Explore tracks
            </button>
          </div>
        ) : (
          <div className="library-tracks-table">
            {favoriteTracks.map((track, idx) => {
              const isCurrent = currentTrack?.id === track.id;
              const isPlayingThis = isCurrent && playing;

              return (
                <div
                  key={track.id}
                  className={`table-track-row ${isCurrent ? "table-track-row--active" : ""}`}
                >
                  <span className="row-index">{String(idx + 1).padStart(2, "0")}</span>

                  <div
                    className="row-thumbnail"
                    onClick={() => onPlayTrack(track, favoriteTracks, "Favorite tracks", "favorites")}
                  >
                    <img src={track.coverUrl ?? undefined} alt="" />
                    <button
                      className="row-hover-play"
                      aria-label={`Play ${track.title}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlayTrack(track, favoriteTracks, "Favorite tracks", "favorites");
                      }}
                    >
                      {isPlayingThis ? <PauseIcon width={14} height={14} /> : <PlayIcon width={14} height={14} />}
                    </button>
                  </div>

                  <div className="row-main-info">
                    <a
                      className="row-title"
                      href={`#/track/${track.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigate(`/track/${track.id}`);
                      }}
                    >
                      {track.title}
                    </a>
                    <a
                      className="row-creator"
                      href={`#/creator/${track.creator.userId}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigate(`/creator/${track.creator.userId}`);
                      }}
                    >
                      {track.creator.displayName}
                    </a>
                  </div>

                  <span className="row-album-name">{track.album?.title ?? "Single"}</span>
                  <span className="row-duration">{formatDuration(track.durationMs)}</span>

                  <div className="row-actions">
                    <button
                      className="row-icon-btn row-icon-btn--favorited"
                      onClick={() => onToggleFavorite(track.id)}
                      title="Remove favorite"
                    >
                      <HeartIcon width={16} height={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : tab === "playlists" ? (
        playlists.length === 0 ? (
          <div className="state-empty-box">
            <HeadphonesIcon width={48} height={48} />
            <p className="empty-title">No playlists yet</p>
            <p className="empty-desc">Create a playlist to get started.</p>
            <button className="button button-primary button-small" onClick={onCreatePlaylist}>
              <PlusIcon width={16} height={16} /> Create playlist
            </button>
          </div>
        ) : (
          <div className="playlists-grid">
            {playlists.map((pl) => (
              <div key={pl.id} className="playlist-card">
                <div className="playlist-art" onClick={() => onNavigate(`/playlist/${pl.id}`)}>
                  <img
                    src={pl.coverUrl}
                    alt={pl.title}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = covers.dawn;
                    }}
                  />
                  <span className="playlist-hover-play">
                    <PlayIcon width={20} height={20} />
                  </span>
                </div>
                <div className="playlist-info" onClick={() => onNavigate(`/playlist/${pl.id}`)} style={{ cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                    <h3 className="playlist-title" style={{ margin: 0 }}>{pl.title}</h3>
                    <span
                      style={{
                        fontSize: "9px",
                        fontWeight: 800,
                        padding: "2px 6px",
                        borderRadius: "6px",
                        background: "#F3F4F6",
                        color: "#6B7280",
                        border: "1px solid #E5E7EB",
                      }}
                    >
                      Private
                    </span>
                  </div>
                  <p className="playlist-meta">
                    {pl.trackIds ? pl.trackIds.length : pl.trackCount} tracks
                  </p>
                  {pl.description && <p className="playlist-desc">{pl.description}</p>}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <button
                    className="icon-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate(`/playlist/${pl.id}`);
                    }}
                    title="Manage Playlist Tracks"
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      border: "1px solid #A7F3D0",
                      background: "#ECFDF5",
                      color: "#065F46",
                      cursor: "pointer",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <QueueIcon width={15} height={15} />
                  </button>
                  {onEditPlaylist && (
                    <button
                      className="icon-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditPlaylist(pl);
                      }}
                      title="Edit details"
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        border: "1px solid var(--sw-border)",
                        background: "#fff",
                        color: "var(--sw-text)",
                        cursor: "pointer",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <EditIcon width={14} height={14} />
                    </button>
                  )}
                  <button
                    className="playlist-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePlaylist(pl.id);
                    }}
                    title="Delete playlist"
                  >
                    <TrashIcon width={14} height={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* tab === "history" */
        historyLoading && historyItems.length === 0 ? (
          <div className="state-empty-box">
            <ClockIcon width={48} height={48} />
            <p className="empty-title">Loading listening history...</p>
          </div>
        ) : historyError ? (
          <div className="state-empty-box">
            <AlertIcon width={48} height={48} />
            <p className="empty-title">Unable to load listening history</p>
            <p className="empty-desc">{historyError}</p>
            <button className="button button-primary button-small" onClick={() => loadHistory(historyPage)}>
              <RefreshIcon width={16} height={16} /> Try again
            </button>
          </div>
        ) : historyItems.length === 0 ? (
          <div className="state-empty-box">
            <ClockIcon width={48} height={48} />
            <p className="empty-title">No listening history yet</p>
            <p className="empty-desc">Tracks you stream will automatically appear here in reverse chronological order.</p>
            <button className="button button-primary button-small" onClick={() => onNavigate("/explore")}>
              Explore tracks
            </button>
          </div>
        ) : (
          <div className="history-container">
            {groupedHistory.map((group) => (
              <div key={group.label} className="history-date-group" style={{ marginBottom: "28px" }}>
                <div
                  className="history-group-header"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    margin: "16px 0 12px 6px",
                    fontWeight: 700,
                    fontSize: "13px",
                    color: "var(--sw-text-muted, #64748B)",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}
                >
                  <ClockIcon width={14} height={14} />
                  <span>{group.label}</span>
                  <span style={{ fontSize: "11px", opacity: 0.8 }}>({group.items.length})</span>
                </div>

                <div className="library-tracks-table">
                  <div
                    className="library-tracks-header"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "36px 44px minmax(180px, 2fr) minmax(140px, 1.2fr) 70px 80px",
                      alignItems: "center",
                      gap: "12px",
                      padding: "8px 18px",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#94a3b8",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      borderBottom: "1px solid #eef2f6",
                      background: "#f8fafc",
                      borderRadius: "10px 10px 0 0",
                    }}
                  >
                    <span style={{ textAlign: "center" }}>#</span>
                    <span />
                    <span>Track & Creator</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <ClockIcon width={12} height={12} /> Played Time
                    </span>
                    <span style={{ textAlign: "right" }}>Duration</span>
                    <span style={{ textAlign: "center" }}>Remove</span>
                  </div>

                  {group.items.map((item, idx) => {
                    const track = historyItemToTrack(item);
                    const isCurrent = currentTrack?.id === track.id;
                    const isPlayingThis = isCurrent && playing;

                    return (
                      <div
                        key={item.id}
                        className={`table-track-row ${isCurrent ? "table-track-row--active" : ""}`}
                      >
                        <span className="row-index">{String(idx + 1).padStart(2, "0")}</span>

                        <div
                          className="row-thumbnail"
                          onClick={() => onPlayTrack(track, historyTracks, "Listening History", "history")}
                        >
                          <img src={item.coverUrl ?? undefined} alt="" />
                          <button
                            className="row-hover-play"
                            aria-label={`Play ${item.title}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onPlayTrack(track, historyTracks, "Listening History", "history");
                            }}
                          >
                            {isPlayingThis ? <PauseIcon width={14} height={14} /> : <PlayIcon width={14} height={14} />}
                          </button>
                        </div>

                        <div className="row-main-info">
                          <a
                            className="row-title"
                            href={`#/track/${item.trackId}`}
                            onClick={(e) => {
                              e.preventDefault();
                              onNavigate(`/track/${item.trackId}`);
                            }}
                          >
                            {item.title}
                          </a>
                          <span className="row-artist">{item.artistName}</span>
                        </div>

                        <div
                          className="row-album"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "12.5px",
                            color: "var(--sw-muted, #64748B)",
                          }}
                          title={`Streamed on ${new Date(item.playedAt).toLocaleString("en-US")}`}
                        >
                          <ClockIcon width={13} height={13} style={{ opacity: 0.6 }} />
                          <span>{formatPlayedTime(item.playedAt)}</span>
                        </div>

                        <span
                          className="row-duration"
                          title={`Track duration: ${formatDuration(item.durationMs)}`}
                          style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}
                        >
                          {formatDuration(item.durationMs)}
                        </span>

                        <div className="row-actions">
                          <button
                            className="icon-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTarget(item);
                            }}
                            title="Remove from history"
                            aria-label={`Remove ${item.title} from history`}
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "8px",
                              border: "1px solid var(--sw-border, #E2E8F0)",
                              background: "#fff",
                              color: "#94A3B8",
                              cursor: "pointer",
                              display: "grid",
                              placeItems: "center",
                            }}
                          >
                            <TrashIcon width={14} height={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {historyTotalPages > 1 && (
              <div
                className="staff-pagination-bar"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "12px",
                  marginTop: "24px",
                }}
              >
                <button
                  type="button"
                  className="button button-secondary button-small"
                  disabled={historyPage === 0 || historyLoading}
                  onClick={() => setHistoryPage((p) => Math.max(0, p - 1))}
                >
                  ← Previous
                </button>
                <span style={{ fontSize: "13px", fontWeight: 600 }}>
                  Page {historyPage + 1} of {historyTotalPages}
                </span>
                <button
                  type="button"
                  className="button button-secondary button-small"
                  disabled={historyPage >= historyTotalPages - 1 || historyLoading}
                  onClick={() => setHistoryPage((p) => p + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )
      )}

      {/* Confirmation modal for removing a single track from history */}
      <DeleteConfirmationModal
        open={Boolean(deleteTarget)}
        title="Remove track from history"
        message={`Are you sure you want to remove "${deleteTarget?.title}" by ${deleteTarget?.artistName} from your listening history?`}
        confirmLabel="Remove"
        submitting={isDeletingItem}
        onConfirm={handleConfirmDeleteItem}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Confirmation modal for clearing all listening history */}
      <DeleteConfirmationModal
        open={isClearAllModalOpen}
        title="Clear all listening history"
        message="Are you sure you want to delete your entire listening history? All playback records will be permanently removed. This action cannot be undone."
        confirmLabel="Clear all"
        submitting={isClearingAll}
        onConfirm={handleConfirmClearAll}
        onCancel={() => setIsClearAllModalOpen(false)}
      />

      {/* Top Center notification toast for user feedback */}
      <CenterNotificationPopup
        open={toast.open}
        type={toast.type}
        message={toast.message}
        durationMs={3000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}
