import { useEffect, useMemo, useState } from "react";
import { covers } from "../data";
import {
  AlertIcon,
  ClockIcon,
  DiscIcon,
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
import { playlistApi } from "../api/playlists";
import { historyApi } from "../api/history";
import { DeleteConfirmationModal } from "../components/modals/DeleteConfirmationModal";
import { CenterNotificationPopup } from "../components/modals/CenterNotificationPopup";
import { formatDate, formatDateTime } from "../utils/dateUtils";
import { formatDuration } from "../utils/timeUtils";
import { historyItemToTrack } from "../utils/trackMappers";

export { historyItemToTrack };

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
  return formatDate(dateStr);
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

  const [playingPlaylistId, setPlayingPlaylistId] = useState<number | null>(null);

  const handlePlayPlaylist = async (playlist: Playlist, e: React.MouseEvent) => {
    e.stopPropagation();
    if (playingPlaylistId === playlist.id && playing) {
      return;
    }
    setPlayingPlaylistId(playlist.id);

    try {
      let tracks = playlist.tracks;
      if (!tracks || tracks.length === 0) {
        const details = await playlistApi.getPlaylistById(playlist.id);
        tracks = details.tracks || [];
      }
      if (tracks && tracks.length > 0) {
        if (onPlayAll) {
          onPlayAll(tracks, `Playlist • ${playlist.title}`, `playlist-${playlist.id}`);
        } else {
          onPlayTrack(tracks[0], tracks, `Playlist • ${playlist.title}`, `playlist-${playlist.id}`);
        }
      }
    } catch (err) {
      console.warn("Could not play playlist tracks:", err);
    }
  };

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
          <h1 className="page-heading" style={{ color: "var(--brand, #0284c7)" }}>Your Library</h1>
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
              <div className="library-tracks-header">
                <span style={{ textAlign: "center" }}>#</span>
                <span />
                <span>Track & Creator</span>
                <span>Album</span>
                <span style={{ textAlign: "right", whiteSpace: "nowrap" }}>Duration</span>
                <span style={{ textAlign: "center", whiteSpace: "nowrap" }}>Favorite</span>
              </div>
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
                    <img
                      src={track.coverUrl || covers.dawn}
                      alt=""
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = covers.dawn;
                      }}
                    />
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
                      href={`/track/${track.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigate(`/track/${track.id}`);
                      }}
                    >
                      {track.title}
                    </a>
                    <a
                      className="row-creator"
                      href={`/creator/${track.creator.userId}`}
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
          <div
            className="playlists-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
              gap: "22px",
            }}
          >
            {playlists.map((pl) => {
              const trackCount = pl.trackIds ? pl.trackIds.length : (pl.trackCount ?? 0);
              const playlistYear = pl.createdAt
                ? new Date(pl.createdAt).getFullYear()
                : new Date().getFullYear();
              const isPlaying = playingPlaylistId === pl.id && playing;

              return (
                <article
                  key={pl.id}
                  className="sw-album-card playlist-card"
                  onClick={() => onNavigate(`/playlist/${pl.id}`)}
                  style={{
                    background: "#ffffff",
                    borderRadius: "14px",
                    padding: "14px",
                    border: "1px solid var(--sw-border)",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    display: "flex",
                    flexDirection: "column",
                    cursor: "pointer",
                    position: "relative",
                    gap: "0px",
                  }}
                >
                  {/* Cover art with play overlay & track count badge */}
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      aspectRatio: "1/1",
                      borderRadius: "10px",
                      overflow: "hidden",
                      background: "linear-gradient(135deg, #0284c7 0%, #d4a373 100%)",
                      marginBottom: "12px",
                    }}
                  >
                    {pl.coverUrl ? (
                      <img
                        src={pl.coverUrl}
                        alt={pl.title}
                        loading="lazy"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = covers.dawn;
                        }}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#ffffff",
                        }}
                      >
                        <DiscIcon width={48} height={48} />
                      </div>
                    )}

                    {/* Track count badge (Top-Left of cover, matching Album card) */}
                    <span
                      style={{
                        position: "absolute",
                        left: "8px",
                        top: "8px",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        background: "rgba(15, 23, 42, 0.65)",
                        color: "#ffffff",
                        fontSize: "11px",
                        fontWeight: "700",
                        backdropFilter: "blur(4px)",
                        zIndex: 2,
                      }}
                    >
                      {trackCount} {trackCount === 1 ? "track" : "tracks"}
                    </span>

                    {/* Top-Right Action Buttons: Manage tracks, Edit, Delete */}
                    <div
                      className="playlist-card-actions"
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        display: "flex",
                        gap: "4px",
                        zIndex: 3,
                        background: "rgba(15, 23, 42, 0.65)",
                        backdropFilter: "blur(4px)",
                        padding: "3px 6px",
                        borderRadius: "16px",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => onNavigate(`/playlist/${pl.id}`)}
                        title="Manage playlist tracks"
                        aria-label="Manage tracks"
                        style={{
                          background: "none",
                          border: "none",
                          padding: "2px",
                          cursor: "pointer",
                          color: "#FFFFFF",
                          display: "grid",
                          placeItems: "center",
                          transition: "transform 0.15s ease",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.2)")}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                      >
                        <QueueIcon width={14} height={14} />
                      </button>

                      {onEditPlaylist && (
                        <button
                          type="button"
                          onClick={() => onEditPlaylist(pl)}
                          title="Edit playlist details"
                          aria-label="Edit playlist"
                          style={{
                            background: "none",
                            border: "none",
                            padding: "2px",
                            cursor: "pointer",
                            color: "#FFFFFF",
                            display: "grid",
                            placeItems: "center",
                            transition: "transform 0.15s ease",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.2)")}
                          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                        >
                          <EditIcon width={13} height={13} />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onDeletePlaylist(pl.id)}
                        title="Delete playlist"
                        aria-label="Delete playlist"
                        style={{
                          background: "none",
                          border: "none",
                          padding: "2px",
                          cursor: "pointer",
                          color: "#FCA5A5",
                          display: "grid",
                          placeItems: "center",
                          transition: "transform 0.15s ease",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.2)")}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                      >
                        <TrashIcon width={13} height={13} />
                      </button>
                    </div>

                    {/* Circular Blue Play Button (Bottom-Right of cover, matching Album card) */}
                    <button
                      type="button"
                      className="button-primary"
                      onClick={(e) => handlePlayPlaylist(pl, e)}
                      aria-label={`Play playlist ${pl.title}`}
                      style={{
                        position: "absolute",
                        right: "10px",
                        bottom: "10px",
                        width: "42px",
                        height: "42px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 0,
                        boxShadow: "0 6px 16px rgba(2, 132, 199, 0.4)",
                        transform: isPlaying ? "scale(1)" : "scale(0.95)",
                        opacity: isPlaying ? 1 : 0.95,
                        border: "none",
                        cursor: "pointer",
                        zIndex: 2,
                      }}
                      title={isPlaying ? "Playing playlist" : "Play entire playlist"}
                    >
                      {isPlaying ? <PauseIcon width={17} height={17} /> : <PlayIcon width={17} height={17} />}
                    </button>
                  </div>

                  {/* Playlist metadata: Title */}
                  <h3
                    style={{
                      fontSize: "14.5px",
                      fontWeight: 700,
                      margin: "0 0 4px 0",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      color: "var(--sw-text-primary, #0f172a)",
                    }}
                    title={pl.title}
                  >
                    {pl.title}
                  </h3>

                  {/* Subtitle: Creator · Year (matching Album card) */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      marginTop: "auto",
                      paddingTop: "6px",
                      fontSize: "12.5px",
                      color: "var(--sw-muted)",
                    }}
                  >
                    <span
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontWeight: 500,
                      }}
                    >
                      {pl.ownerName || pl.creatorName || "anh tuan"}
                    </span>
                    <span>· {playlistYear}</span>
                  </div>
                </article>
              );
            })}
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
                  <div className="library-tracks-header">
                    <span style={{ textAlign: "center" }}>#</span>
                    <span />
                    <span>Track & Creator</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <ClockIcon width={12} height={12} /> Played Time
                    </span>
                    <span style={{ textAlign: "right", whiteSpace: "nowrap" }}>Duration</span>
                    <span style={{ textAlign: "center", whiteSpace: "nowrap" }}>Remove</span>
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
                          <img
                            src={item.coverUrl || covers.dawn}
                            alt=""
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = covers.dawn;
                            }}
                          />
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
                            href={`/track/${item.trackId}`}
                            onClick={(e) => {
                              e.preventDefault();
                              onNavigate(`/track/${item.trackId}`);
                            }}
                          >
                            {item.title}
                          </a>
                          <span className="row-creator">{item.artistName}</span>
                        </div>

                        <div
                          className="row-album-name"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "12.5px",
                            color: "#475467",
                          }}
                          title={`Streamed on ${formatDateTime(item.playedAt)}`}
                        >
                          <ClockIcon width={13} height={13} style={{ opacity: 0.6 }} />
                          <span>{formatPlayedTime(item.playedAt)}</span>
                        </div>

                        <span
                          className="row-duration"
                          title={`Track duration: ${formatDuration(item.durationMs)}`}
                        >
                          {formatDuration(item.durationMs)}
                        </span>

                        <div className="row-actions">
                          <button
                            className="row-icon-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTarget(item);
                            }}
                            title="Remove from history"
                            aria-label={`Remove ${item.title} from history`}
                          >
                            <TrashIcon width={15} height={15} />
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
