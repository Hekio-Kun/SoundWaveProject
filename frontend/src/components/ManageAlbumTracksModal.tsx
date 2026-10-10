import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { albumApi, AlbumApiError } from "../api/album";
import { useModalScrollLock } from "../hooks/useModalScrollLock";
import {
  AlertIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  CloseIcon,
  DiscIcon,
  HeadphonesIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
} from "../icons";
import type { StudioAlbum, StudioTrack } from "../types";

type Props = {
  open: boolean;
  onClose: () => void;
  album: StudioAlbum;
  onTracksUpdated: () => Promise<void>;
};

function formatDuration(ms?: number): string {
  if (!ms || ms <= 0) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function ManageAlbumTracksModal({
  open,
  onClose,
  album,
  onTracksUpdated,
}: Props) {
  const [activeTab, setActiveTab] = useState<"MANAGE" | "ADD">("MANAGE");
  const [searchQuery, setSearchQuery] = useState("");
  const [addSearchQuery, setAddSearchQuery] = useState("");

  // Tracks inside the album (ordered)
  const [currentTracks, setCurrentTracks] = useState<StudioTrack[]>(album.tracks || []);

  // Available standalone tracks outside the album
  const [availableTracks, setAvailableTracks] = useState<StudioTrack[]>([]);
  const [loadingAvailable, setLoadingAvailable] = useState(false);

  // Operation status
  const [saving, setSaving] = useState(false);
  const [actionLoadingTrackId, setActionLoadingTrackId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useModalScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !saving) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, saving, onClose]);

  // Sync current tracks when album updates
  useEffect(() => {
    if (open) {
      setCurrentTracks(album.tracks || []);
      setErrorMessage(null);
      setSuccessMessage(null);
      setActiveTab("MANAGE");
      setSearchQuery("");
      setAddSearchQuery("");
      void loadAvailableTracks();
    }
  }, [open, album]);

  const loadAvailableTracks = async () => {
    try {
      setLoadingAvailable(true);
      const data = await albumApi.getAvailableTracks(album.id);
      // Filter out tracks already inside this album
      const currentIds = new Set((album.tracks || []).map((t) => t.id));
      setAvailableTracks(data.filter((t) => !currentIds.has(t.id)));
    } catch (err: unknown) {
      console.error("Failed to load available tracks", err);
    } finally {
      setLoadingAvailable(false);
    }
  };

  const totalDurationMs = useMemo(() => {
    return currentTracks.reduce((acc, t) => acc + (t.durationMs || 0), 0);
  }, [currentTracks]);

  // Filter tracks in album by search
  const filteredCurrentTracks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return currentTracks;
    return currentTracks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.genreName && t.genreName.toLowerCase().includes(q))
    );
  }, [currentTracks, searchQuery]);

  // Filter available tracks to add
  const filteredAvailableTracks = useMemo(() => {
    const q = addSearchQuery.trim().toLowerCase();
    if (!q) return availableTracks;
    return availableTracks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.genreName && t.genreName.toLowerCase().includes(q))
    );
  }, [availableTracks, addSearchQuery]);

  // Save new track list to Backend
  const syncTracksToBackend = async (newTrackList: StudioTrack[]) => {
    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const newTrackIds = newTrackList.map((t) => t.id);
      await albumApi.updateAlbum(album.id, {
        title: album.title,
        description: album.description ? album.description : undefined,
        releaseDate: album.releaseDate ? album.releaseDate : undefined,
        trackIds: newTrackIds,
      });
      setCurrentTracks(newTrackList);
      await onTracksUpdated();
      void loadAvailableTracks();
    } catch (err: unknown) {
      if (err instanceof AlbumApiError) {
        setErrorMessage(err.message);
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Failed to update album tracks.");
      }
    } finally {
      setSaving(false);
      setActionLoadingTrackId(null);
    }
  };

  // Reorder track up or down
  const handleReorder = async (trackId: number, direction: "up" | "down") => {
    const index = currentTracks.findIndex((t) => t.id === trackId);
    if (index === -1) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentTracks.length) return;

    setActionLoadingTrackId(trackId);
    const newOrder = [...currentTracks];
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;

    await syncTracksToBackend(newOrder);
  };

  // Remove track from album (BR-24 preserves track as standalone)
  const handleRemoveTrack = async (track: StudioTrack) => {
    setActionLoadingTrackId(track.id);
    const updated = currentTracks.filter((t) => t.id !== track.id);
    await syncTracksToBackend(updated);
    setSuccessMessage(`Removed "${track.title}" from album. The track is preserved as a standalone single.`);
  };

  // Add standalone track into album
  const handleAddTrack = async (track: StudioTrack) => {
    setActionLoadingTrackId(track.id);
    const updated = [...currentTracks, track];
    await syncTracksToBackend(updated);
    setSuccessMessage(`Added "${track.title}" to album tracklist.`);
  };

  if (!open) return null;

  return createPortal(
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        zIndex: 1100,
        backgroundColor: "rgba(15, 23, 42, 0.55)",
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "680px",
          width: "92vw",
          padding: "24px 28px",
          maxHeight: "88vh",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
          borderRadius: "20px",
          boxShadow: "0 25px 60px -15px rgba(15, 23, 42, 0.22)",
          border: "1px solid rgba(226, 232, 240, 0.8)",
          background: "#ffffff",
        }}
      >
        {/* Header with Album Identity Banner (Style matching Playlist modal) */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", position: "relative" }}>
          {album.coverUrl ? (
            <img
              src={album.coverUrl}
              alt={album.title}
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "14px",
                objectFit: "cover",
                boxShadow: "0 6px 16px rgba(0, 0, 0, 0.12)",
                border: "1px solid rgba(0, 0, 0, 0.06)",
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, var(--color-ocean-primary, #0284C7), var(--color-sand-primary, #D4A373))",
                display: "grid",
                placeItems: "center",
                color: "#ffffff",
                boxShadow: "0 6px 16px rgba(2, 132, 199, 0.2)",
                flexShrink: 0,
              }}
            >
              <DiscIcon width={28} height={28} />
            </div>
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  letterSpacing: "0.06em",
                  color: "var(--color-ocean-primary, #0284C7)",
                  background: "rgba(2, 132, 199, 0.08)",
                  padding: "3px 9px",
                  borderRadius: "6px",
                  textTransform: "uppercase",
                }}
              >
                ALBUM
              </span>
              <span style={{ fontSize: "12px", color: "var(--sw-muted, #64748B)", fontWeight: 500 }}>
                {currentTracks.length} {currentTracks.length === 1 ? "track" : "tracks"} • {formatDuration(totalDurationMs)}
              </span>
            </div>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: 800,
                margin: 0,
                color: "var(--color-ocean-dark, #0F172A)",
                letterSpacing: "-0.02em",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              Manage Tracks in &ldquo;{album.title}&rdquo;
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: "12.5px", color: "var(--sw-muted, #64748B)" }}>
              Reorder track positions, add standalone songs, or remove songs from this album.
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={saving}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "#F1F5F9",
              border: "none",
              cursor: "pointer",
              color: "var(--sw-muted, #64748B)",
              display: "grid",
              placeItems: "center",
              transition: "background .15s, color .15s",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#E2E8F0";
              e.currentTarget.style.color = "var(--sw-text, #0F172A)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#F1F5F9";
              e.currentTarget.style.color = "var(--sw-muted, #64748B)";
            }}
            title="Close"
          >
            <CloseIcon width={18} height={18} />
          </button>
        </div>

        {/* Alerts */}
        {errorMessage && (
          <div className="auth-v2-error" role="alert" style={{ margin: 0 }}>
            <span><AlertIcon width={16} height={16} /></span>
            <div><small>{errorMessage}</small></div>
            <button className="icon-button" onClick={() => setErrorMessage(null)} style={{ marginLeft: "auto" }}>
              <CloseIcon width={14} height={14} />
            </button>
          </div>
        )}

        {successMessage && (
          <div
            style={{
              background: "rgba(5, 150, 105, 0.08)",
              border: "1px solid rgba(5, 150, 105, 0.2)",
              color: "#059669",
              padding: "10px 14px",
              borderRadius: "10px",
              fontSize: "12.5px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <CheckIcon width={16} height={16} />
            <span style={{ flex: 1 }}>{successMessage}</span>
            <button
              onClick={() => setSuccessMessage(null)}
              style={{ background: "none", border: "none", color: "#059669", cursor: "pointer", padding: 0 }}
            >
              <CloseIcon width={12} height={12} />
            </button>
          </div>
        )}

        {/* Tab Switcher & Search Bar */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          {/* Tabs */}
          <div
            style={{
              display: "flex",
              backgroundColor: "#F1F5F9",
              borderRadius: "12px",
              padding: "3px",
              gap: "2px",
            }}
          >
            <button
              type="button"
              onClick={() => {
                setActiveTab("MANAGE");
                setSuccessMessage(null);
              }}
              style={{
                padding: "6px 14px",
                fontSize: "12.5px",
                fontWeight: 700,
                borderRadius: "9px",
                border: "none",
                cursor: "pointer",
                background: activeTab === "MANAGE" ? "#ffffff" : "transparent",
                color: activeTab === "MANAGE" ? "var(--color-ocean-dark, #0F172A)" : "var(--sw-muted, #64748B)",
                boxShadow: activeTab === "MANAGE" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                transition: "all 0.16s ease",
              }}
            >
              Tracklist ({currentTracks.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("ADD");
                setSuccessMessage(null);
                void loadAvailableTracks();
              }}
              style={{
                padding: "6px 14px",
                fontSize: "12.5px",
                fontWeight: 700,
                borderRadius: "9px",
                border: "none",
                cursor: "pointer",
                background: activeTab === "ADD" ? "#ffffff" : "transparent",
                color: activeTab === "ADD" ? "var(--color-ocean-primary, #0284C7)" : "var(--sw-muted, #64748B)",
                boxShadow: activeTab === "ADD" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                transition: "all 0.16s ease",
              }}
            >
              <PlusIcon width={14} height={14} />
              <span>Add Tracks ({availableTracks.length})</span>
            </button>
          </div>

          {/* Search box */}
          <div style={{ position: "relative", flex: 1, minWidth: "220px" }}>
            <SearchIcon
              width={15}
              height={15}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--sw-muted, #64748B)",
                pointerEvents: "none",
              }}
            />
            <input
              type="text"
              placeholder={activeTab === "MANAGE" ? "Search tracks in album..." : "Search standalone tracks to add..."}
              value={activeTab === "MANAGE" ? searchQuery : addSearchQuery}
              onChange={(e) =>
                activeTab === "MANAGE" ? setSearchQuery(e.target.value) : setAddSearchQuery(e.target.value)
              }
              style={{
                width: "100%",
                paddingLeft: "34px",
                paddingRight: (activeTab === "MANAGE" ? searchQuery : addSearchQuery) ? "32px" : "12px",
                height: "38px",
                fontSize: "13px",
                borderRadius: "12px",
                border: "1px solid #E2E8F0",
                background: "#F8FAFC",
                color: "var(--color-ocean-dark, #0F172A)",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            {(activeTab === "MANAGE" ? searchQuery : addSearchQuery) && (
              <button
                type="button"
                onClick={() => (activeTab === "MANAGE" ? setSearchQuery("") : setAddSearchQuery(""))}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--sw-muted, #64748B)",
                  padding: "2px",
                }}
              >
                <CloseIcon width={12} height={12} />
              </button>
            )}
          </div>
        </div>

        {/* TAB 1: MANAGE CURRENT TRACKS IN ALBUM */}
        {activeTab === "MANAGE" && (
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              border: "1px solid #EEF2F6",
              borderRadius: "16px",
              background: "#F8FAFC",
              padding: "8px",
              maxHeight: "440px",
            }}
          >
            {currentTracks.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "48px 16px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    background: "rgba(2, 132, 199, 0.08)",
                    color: "var(--color-ocean-primary, #0284C7)",
                    display: "grid",
                    placeItems: "center",
                    marginBottom: "12px",
                  }}
                >
                  <HeadphonesIcon width={28} height={28} />
                </div>
                <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: "15px", color: "var(--color-ocean-dark, #0F172A)" }}>
                  No tracks in this album yet
                </p>
                <p style={{ margin: "0 0 16px", fontSize: "13px", color: "var(--sw-muted, #64748B)", maxWidth: "320px" }}>
                  Add standalone songs to form your album tracklist.
                </p>
                <button
                  type="button"
                  className="button button-primary button-small"
                  onClick={() => setActiveTab("ADD")}
                >
                  <PlusIcon width={14} height={14} />
                  <span>Add Standalone Tracks</span>
                </button>
              </div>
            ) : filteredCurrentTracks.length === 0 ? (
              <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--sw-muted, #64748B)", fontSize: "13px" }}>
                No tracks match your search &ldquo;{searchQuery}&rdquo;.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {filteredCurrentTracks.map((track) => {
                  const trueIndex = currentTracks.findIndex((t) => t.id === track.id);
                  const isFirst = trueIndex === 0;
                  const isLast = trueIndex === currentTracks.length - 1;
                  const isProcessingThis = actionLoadingTrackId === track.id;

                  return (
                    <div
                      key={track.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "10px 14px",
                        background: "#ffffff",
                        borderRadius: "12px",
                        border: "1px solid #E2E8F0",
                        transition: "box-shadow 0.16s ease",
                        opacity: isProcessingThis ? 0.6 : 1,
                      }}
                    >
                      {/* Track Position */}
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: 800,
                          color: "var(--color-ocean-primary, #0284C7)",
                          width: "24px",
                          textAlign: "center",
                        }}
                      >
                        {String(trueIndex + 1).padStart(2, "0")}
                      </span>

                      {/* Thumbnail */}
                      <div
                        style={{
                          width: "42px",
                          height: "42px",
                          borderRadius: "9px",
                          overflow: "hidden",
                          background: "#EEF2F6",
                          flexShrink: 0,
                          display: "grid",
                          placeItems: "center",
                        }}
                      >
                        {track.coverUrl ? (
                          <img
                            src={track.coverUrl}
                            alt={track.title}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <HeadphonesIcon width={18} height={18} style={{ color: "var(--sw-muted, #64748B)" }} />
                        )}
                      </div>

                      {/* Track Title & Genre */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span
                          style={{
                            display: "block",
                            fontSize: "13.5px",
                            fontWeight: 700,
                            color: "var(--color-ocean-dark, #0F172A)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {track.title}
                        </span>
                        <span style={{ fontSize: "11.5px", color: "var(--sw-muted, #64748B)" }}>
                          {track.genreName || "Music"} • {formatDuration(track.durationMs)}
                        </span>
                      </div>

                      {/* Reorder Buttons (▲ and ▼) */}
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <button
                          type="button"
                          disabled={isFirst || saving}
                          onClick={() => handleReorder(track.id, "up")}
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "8px",
                            border: "1px solid #E2E8F0",
                            background: isFirst ? "#F8FAFC" : "#ffffff",
                            color: isFirst ? "#CBD5E1" : "var(--color-ocean-dark, #0F172A)",
                            display: "grid",
                            placeItems: "center",
                            cursor: isFirst || saving ? "not-allowed" : "pointer",
                            transition: "all 0.15s",
                          }}
                          title="Move track up"
                        >
                          <ArrowUpIcon width={13} height={13} />
                        </button>
                        <button
                          type="button"
                          disabled={isLast || saving}
                          onClick={() => handleReorder(track.id, "down")}
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "8px",
                            border: "1px solid #E2E8F0",
                            background: isLast ? "#F8FAFC" : "#ffffff",
                            color: isLast ? "#CBD5E1" : "var(--color-ocean-dark, #0F172A)",
                            display: "grid",
                            placeItems: "center",
                            cursor: isLast || saving ? "not-allowed" : "pointer",
                            transition: "all 0.15s",
                          }}
                          title="Move track down"
                        >
                          <ArrowDownIcon width={13} height={13} />
                        </button>
                      </div>

                      {/* Remove Button (Red Trash) */}
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => handleRemoveTrack(track)}
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "8px",
                          border: "1px solid rgba(220, 38, 38, 0.2)",
                          background: "rgba(220, 38, 38, 0.05)",
                          color: "#dc2626",
                          display: "grid",
                          placeItems: "center",
                          cursor: saving ? "not-allowed" : "pointer",
                          transition: "all 0.15s",
                        }}
                        title="Remove track from album"
                      >
                        <TrashIcon width={13} height={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ADD STANDALONE TRACKS INTO ALBUM */}
        {activeTab === "ADD" && (
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              border: "1px solid #EEF2F6",
              borderRadius: "16px",
              background: "#F8FAFC",
              padding: "8px",
              maxHeight: "440px",
            }}
          >
            {loadingAvailable ? (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--sw-muted, #64748B)" }}>
                Loading standalone tracks...
              </div>
            ) : availableTracks.length === 0 ? (
              <div style={{ padding: "48px 16px", textAlign: "center" }}>
                <HeadphonesIcon width={32} height={32} style={{ color: "var(--color-ocean-primary, #0284C7)", margin: "0 auto 8px" }} />
                <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: "14px", color: "var(--color-ocean-dark, #0F172A)" }}>
                  All your standalone tracks are already in this album!
                </p>
                <p style={{ margin: 0, fontSize: "12.5px", color: "var(--sw-muted, #64748B)" }}>
                  Upload more songs in Content Studio to add them to this release.
                </p>
              </div>
            ) : filteredAvailableTracks.length === 0 ? (
              <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--sw-muted, #64748B)", fontSize: "13px" }}>
                No standalone tracks match your search &ldquo;{addSearchQuery}&rdquo;.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {filteredAvailableTracks.map((track) => {
                  const isAdding = actionLoadingTrackId === track.id;

                  return (
                    <div
                      key={track.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "10px 14px",
                        background: "#ffffff",
                        borderRadius: "12px",
                        border: "1px solid #E2E8F0",
                      }}
                    >
                      {/* Thumbnail */}
                      <div
                        style={{
                          width: "42px",
                          height: "42px",
                          borderRadius: "9px",
                          overflow: "hidden",
                          background: "#EEF2F6",
                          flexShrink: 0,
                          display: "grid",
                          placeItems: "center",
                        }}
                      >
                        {track.coverUrl ? (
                          <img
                            src={track.coverUrl}
                            alt={track.title}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <HeadphonesIcon width={18} height={18} style={{ color: "var(--sw-muted, #64748B)" }} />
                        )}
                      </div>

                      {/* Track Title & Genre */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span
                          style={{
                            display: "block",
                            fontSize: "13.5px",
                            fontWeight: 700,
                            color: "var(--color-ocean-dark, #0F172A)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {track.title}
                        </span>
                        <span style={{ fontSize: "11.5px", color: "var(--sw-muted, #64748B)" }}>
                          {track.genreName || "Music"} • {formatDuration(track.durationMs)}
                        </span>
                      </div>

                      {/* Add Button */}
                      <button
                        type="button"
                        disabled={saving || isAdding}
                        onClick={() => handleAddTrack(track)}
                        style={{
                          padding: "6px 14px",
                          fontSize: "12.5px",
                          fontWeight: 700,
                          borderRadius: "10px",
                          border: "none",
                          background: "var(--color-ocean-primary, #0284C7)",
                          color: "#ffffff",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          cursor: saving || isAdding ? "not-allowed" : "pointer",
                          transition: "all 0.16s ease",
                        }}
                      >
                        <PlusIcon width={14} height={14} />
                        <span>{isAdding ? "Adding..." : "Add to album"}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid #f1f5f9", paddingTop: "14px" }}>
          <button
            type="button"
            className="button button-secondary"
            onClick={onClose}
            disabled={saving}
          >
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
