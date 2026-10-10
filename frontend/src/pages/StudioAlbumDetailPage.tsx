import { useEffect, useState } from "react";
import { albumApi } from "../api/album";
import { AlbumFormModal } from "../components/AlbumFormModal";
import { DeleteConfirmationModal } from "../components/DeleteConfirmationModal";
import { ManageAlbumTracksModal } from "../components/ManageAlbumTracksModal";
import {
  AlertIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  ClockIcon,
  CloseIcon,
  DiscIcon,
  EditIcon,
  HeadphonesIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  QueueIcon,
  TrashIcon,
} from "../icons";
import type { CurrentUser, LandingTrack, StudioAlbum, StudioTrack } from "../types";

type Props = {
  albumId: number;
  currentUser: CurrentUser | null;
  onNavigate: (route: string) => void;
  currentTrack?: LandingTrack | null;
  playing?: boolean;
  onPlayTrack?: (
    track: LandingTrack,
    contextQueue?: LandingTrack[],
    contextTitle?: string,
    contextKey?: string
  ) => void;
};

function formatDuration(ms?: number): string {
  if (!ms || ms <= 0) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function studioTrackToLandingTrack(st: StudioTrack, artistName: string): LandingTrack {
  return {
    id: st.id,
    title: st.title,
    creator: {
      userId: 0,
      displayName: artistName,
      avatarUrl: null,
    },
    audioUrl: st.audioUrl,
    coverUrl: st.coverUrl,
    durationMs: st.durationMs,
    playCount: st.playCount || 0,
    genreName: st.genreName,
    genreSlug: st.genreSlug,
  };
}

export function StudioAlbumDetailPage({
  albumId,
  currentUser,
  onNavigate,
  currentTrack,
  playing = false,
  onPlayTrack,
}: Props) {
  const [album, setAlbum] = useState<StudioAlbum | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [manageTracksModalOpen, setManageTracksModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);

  const fetchAlbumData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await albumApi.getAlbumById(albumId);
      setAlbum(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load album details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchAlbumData();
  }, [albumId]);

  const handleDeleteAlbum = async () => {
    if (!album) return;
    try {
      setDeleting(true);
      await albumApi.deleteAlbum(album.id);
      setDeleteConfirmOpen(false);
      onNavigate("/studio");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete album.");
    } finally {
      setDeleting(false);
    }
  };

  // Inline reorder track directly from table (matching Playlist details behavior)
  const handleInlineReorder = async (index: number, direction: "up" | "down") => {
    if (!album || !album.tracks || reordering) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= album.tracks.length) return;

    const newTracks = [...album.tracks];
    const temp = newTracks[index];
    newTracks[index] = newTracks[targetIndex];
    newTracks[targetIndex] = temp;

    // Optimistic UI update
    setAlbum({ ...album, tracks: newTracks });
    setReordering(true);

    try {
      await albumApi.updateAlbum(album.id, {
        title: album.title,
        description: album.description ? album.description : undefined,
        releaseDate: album.releaseDate ? album.releaseDate : undefined,
        trackIds: newTracks.map((t) => t.id),
      });
      await fetchAlbumData();
      setActionSuccess("Track sequence updated successfully.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to reorder tracks.");
      await fetchAlbumData();
    } finally {
      setReordering(false);
    }
  };

  // Inline remove track directly from table
  const handleInlineRemoveTrack = async (trackId: number) => {
    if (!album || !album.tracks) return;
    const remainingTracks = album.tracks.filter((t) => t.id !== trackId);

    // Optimistic UI update
    setAlbum({ ...album, tracks: remainingTracks, trackCount: remainingTracks.length });

    try {
      await albumApi.updateAlbum(album.id, {
        title: album.title,
        description: album.description ? album.description : undefined,
        releaseDate: album.releaseDate ? album.releaseDate : undefined,
        trackIds: remainingTracks.map((t) => t.id),
      });
      await fetchAlbumData();
      setActionSuccess("Track removed from album. It remains in your studio library as a standalone track.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to remove track.");
      await fetchAlbumData();
    }
  };

  // Play audio handlers
  const handlePlayTrack = (track: StudioTrack) => {
    if (!onPlayTrack || !album) return;
    const artist = currentUser?.displayName || "Artist";
    const landing = studioTrackToLandingTrack(track, artist);
    const landingList = (album.tracks || []).map((t) => studioTrackToLandingTrack(t, artist));
    onPlayTrack(landing, landingList, `Album • ${album.title}`, `album-${album.id}`);
  };

  const handlePlayAll = () => {
    if (!onPlayTrack || !album || !album.tracks || album.tracks.length === 0) return;
    const artist = currentUser?.displayName || "Artist";
    const landingList = album.tracks.map((t) => studioTrackToLandingTrack(t, artist));
    onPlayTrack(landingList[0], landingList, `Album • ${album.title}`, `album-${album.id}`);
  };

  if (loading) {
    return (
      <div style={{ maxWidth: "1120px", margin: "0 auto", padding: "28px 24px" }}>
        <div style={{ padding: "60px", textAlign: "center", color: "var(--sw-muted, #64748B)" }}>
          Loading album information...
        </div>
      </div>
    );
  }

  if (error || !album) {
    return (
      <div style={{ maxWidth: "1120px", margin: "0 auto", padding: "28px 24px" }}>
        <div className="auth-v2-error" role="alert" style={{ margin: "24px 0" }}>
          <span><AlertIcon width={18} height={18} /></span>
          <div>
            <b>Unable to load album</b>
            <small>{error || "Album not found."}</small>
          </div>
          <button className="button button-secondary button-small" onClick={() => void fetchAlbumData()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const isPublished = album.status === "PUBLISHED";
  const albumTracks = album.tracks || [];
  const totalDurationMs = albumTracks.reduce((acc, t) => acc + (t.durationMs || 0), 0);
  const totalMinutes = Math.round(totalDurationMs / 60000);

  return (
    <div className="playlist-details-page" style={{ padding: "0 0 60px 0" }}>
      {/* Breadcrumb Navigation matching Playlist Details */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          color: "var(--sw-muted, #64748B)",
          fontSize: "12px",
          marginBottom: "20px",
        }}
      >
        <button
          onClick={() => onNavigate("/studio")}
          style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0 }}
        >
          Content Studio
        </button>
        <span>/</span>
        <button
          onClick={() => onNavigate("/studio")}
          style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0 }}
        >
          Albums
        </button>
        <span>/</span>
        <span style={{ color: "var(--color-ocean-dark, #0F172A)", fontWeight: 700 }}>{album.title}</span>
      </div>

      {actionSuccess && (
        <div className="studio-success-alert" role="status" style={{ marginBottom: "20px" }}>
          <div>
            <b>Success</b>
            <small>{actionSuccess}</small>
          </div>
          <button
            className="icon-button"
            onClick={() => setActionSuccess(null)}
            aria-label="Dismiss message"
          >
            <CloseIcon width={16} height={16} />
          </button>
        </div>
      )}

      {/* Album Header Banner (Styling matching Playlist Details Showcase) */}
      <section
        className="playlist-header-banner"
        style={{
          display: "grid",
          gridTemplateColumns: "220px 1fr",
          gap: "28px",
          padding: "28px",
          background: "#ffffff",
          border: "1px solid var(--sw-border, #E2E8F0)",
          borderRadius: "20px",
          boxShadow: "0 8px 30px rgba(16, 24, 40, 0.04)",
          marginBottom: "32px",
        }}
      >
        {/* Cover Art */}
        <div
          style={{
            position: "relative",
            width: "220px",
            height: "220px",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
            backgroundColor: "var(--color-sand-light, #FAF7F2)",
          }}
        >
          {album.coverUrl ? (
            <img
              src={album.coverUrl}
              alt={album.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "grid",
                placeItems: "center",
                color: "var(--color-ocean-primary, #0284C7)",
              }}
            >
              <DiscIcon width={64} height={64} />
            </div>
          )}
        </div>

        {/* Album Meta Info & Action Toolbar */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <span className="eyebrow" style={{ color: "var(--color-ocean-primary, #0284C7)" }}>
                ALBUM
              </span>
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: "999px",
                  fontSize: "10.5px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  background: isPublished ? "#ECFEFF" : "#FFFBEB",
                  color: isPublished ? "var(--color-ocean-primary, #0284C7)" : "#D97706",
                  border: isPublished ? "1px solid #BAE6FD" : "1px solid #FDE68A",
                }}
              >
                {isPublished ? "● Published (Live)" : "○ Draft"}
              </span>
            </div>

            <h1
              style={{
                fontSize: "clamp(26px, 3.5vw, 40px)",
                fontWeight: 800,
                color: "var(--color-ocean-dark, #0F172A)",
                letterSpacing: "-0.04em",
                margin: "0 0 10px 0",
              }}
            >
              {album.title}
            </h1>

            {album.description && (
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--sw-muted, #64748B)",
                  margin: "0 0 12px 0",
                  lineHeight: 1.6,
                }}
              >
                {album.description}
              </p>
            )}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                fontSize: "12px",
                color: "var(--sw-muted, #64748B)",
                flexWrap: "wrap",
              }}
            >
              <span>
                Created by <b style={{ color: "var(--color-ocean-dark, #0F172A)" }}>{currentUser?.displayName || "You"}</b>
              </span>
              <span>•</span>
              <span><b>{albumTracks.length}</b> tracks</span>
              {totalMinutes > 0 && (
                <>
                  <span>•</span>
                  <span>about {totalMinutes} min</span>
                </>
              )}
              {album.releaseDate && (
                <>
                  <span>•</span>
                  <span>Release: <b>{album.releaseDate}</b></span>
                </>
              )}
            </div>
          </div>

          {/* Action Toolbar matching Playlist Details Page */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "20px", flexWrap: "wrap" }}>
            {albumTracks.length > 0 && onPlayTrack && (
              <button
                className="button button-primary button-large"
                onClick={handlePlayAll}
                style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
              >
                <PlayIcon width={18} height={18} />
                <span>Play all</span>
              </button>
            )}

            <button
              className="button button-ghost"
              onClick={() => setEditModalOpen(true)}
              id="btn-page-edit-album"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                border: "1px solid var(--sw-border, #CBD5E1)",
                height: "40px",
                padding: "0 14px",
                borderRadius: "10px",
                fontWeight: 600,
              }}
            >
              <EditIcon width={15} height={15} />
              <span>Edit details</span>
            </button>

            <button
              className="button button-ghost"
              onClick={() => setDeleteConfirmOpen(true)}
              id="btn-page-delete-album"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                border: "1px solid #FCA5A5",
                color: "#DC2626",
                background: "#FEF2F2",
                height: "40px",
                padding: "0 14px",
                borderRadius: "10px",
                fontWeight: 600,
              }}
              title="Delete album"
            >
              <TrashIcon width={15} height={15} />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </section>

      {/* Album Tracks Table Section matching Playlist Details */}
      <section className="playlist-tracklist-section">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 800, margin: 0, color: "var(--color-ocean-dark, #0F172A)" }}>
                Tracks in Album ({albumTracks.length})
              </h2>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              className="button button-secondary button-small"
              onClick={() => setManageTracksModalOpen(true)}
              id="btn-open-manage-tracks"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "#ECFDF5",
                color: "#065F46",
                border: "1px solid #A7F3D0",
                fontWeight: 700,
              }}
            >
              <QueueIcon width={14} height={14} />
              <span>Manage Album Tracks</span>
            </button>
            <button
              className="button button-primary button-small"
              onClick={() => setManageTracksModalOpen(true)}
              id="btn-open-add-tracks"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <PlusIcon width={14} height={14} />
              <span>Add tracks</span>
            </button>
          </div>
        </div>

        {albumTracks.length === 0 ? (
          <div
            className="sw-empty"
            style={{
              padding: "48px 24px",
              background: "#ffffff",
              border: "1px dashed var(--sw-border, #CBD5E1)",
              borderRadius: "16px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
            }}
          >
            <HeadphonesIcon width={36} height={36} style={{ color: "var(--color-ocean-primary, #0284C7)" }} />
            <strong style={{ fontSize: "16px", color: "var(--color-ocean-dark, #0F172A)" }}>
              This album is empty
            </strong>
            <span style={{ fontSize: "13px", color: "var(--sw-muted, #64748B)" }}>
              Add standalone tracks from your Content Studio to build this album.
            </span>
            <button
              className="button button-primary"
              onClick={() => setManageTracksModalOpen(true)}
              style={{ marginTop: "8px", display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <PlusIcon width={16} height={16} /> Add tracks to album
            </button>
          </div>
        ) : (
          <div
            className="library-tracks-table"
            style={{
              background: "#ffffff",
              border: "1px solid var(--sw-border, #E2E8F0)",
              borderRadius: "16px",
              overflow: "hidden",
            }}
          >
            {/* Table Header matching Playlist Details Table */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "36px 48px minmax(160px, 1.8fr) minmax(120px, 1fr) 110px 70px 140px",
                alignItems: "center",
                gap: "14px",
                padding: "10px 16px",
                background: "#F8FAFC",
                borderBottom: "1px solid var(--sw-border, #E2E8F0)",
                fontSize: "11px",
                fontWeight: 800,
                color: "var(--sw-muted, #64748B)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              <span style={{ textAlign: "center" }}>#</span>
              <span />
              <span>Title</span>
              <span>Genre</span>
              <span>Status</span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <ClockIcon width={12} height={12} /> Time
              </span>
              <span style={{ textAlign: "right" }}>Actions</span>
            </div>

            {/* Table Track Rows */}
            {albumTracks.map((track, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === albumTracks.length - 1;
              const isCurrent = currentTrack?.id === track.id;
              const isPlayingThis = isCurrent && playing;

              return (
                <div
                  key={`${track.id}-${idx}`}
                  className={`table-track-row ${isCurrent ? "table-track-row--active" : ""}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "36px 48px minmax(160px, 1.8fr) minmax(120px, 1fr) 110px 70px 140px",
                    alignItems: "center",
                    gap: "14px",
                    padding: "10px 16px",
                    borderBottom: idx === albumTracks.length - 1 ? "none" : "1px solid #F1F5F9",
                    transition: "background 0.15s ease",
                  }}
                >
                  {/* Position number */}
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#98A2B3", textAlign: "center" }}>
                    {String(idx + 1).padStart(2, "0")}
                  </span>

                  {/* Thumbnail & Play button */}
                  <div
                    style={{
                      position: "relative",
                      width: "44px",
                      height: "44px",
                      borderRadius: "8px",
                      overflow: "hidden",
                      cursor: onPlayTrack ? "pointer" : "default",
                      backgroundColor: "#F1F5F9",
                    }}
                    onClick={() => handlePlayTrack(track)}
                  >
                    <img
                      src={track.coverUrl || album.coverUrl || "/pics/album.png"}
                      alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    {onPlayTrack && (
                      <button
                        className="row-hover-play"
                        aria-label={`Play ${track.title}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayTrack(track);
                        }}
                      >
                        {isPlayingThis ? <PauseIcon width={14} height={14} /> : <PlayIcon width={14} height={14} />}
                      </button>
                    )}
                  </div>

                  {/* Title */}
                  <div style={{ minWidth: 0 }}>
                    <span
                      style={{
                        display: "block",
                        fontSize: "13.5px",
                        fontWeight: 700,
                        color: "var(--color-ocean-dark, #0F172A)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        cursor: "pointer",
                      }}
                      onClick={() => onNavigate(`/studio/tracks/${track.id}`)}
                      title="View studio track details"
                    >
                      {track.title}
                    </span>
                  </div>

                  {/* Genre */}
                  <div style={{ minWidth: 0 }}>
                    <span
                      style={{
                        fontSize: "13px",
                        color: "var(--sw-muted, #64748B)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        display: "block",
                      }}
                      title={track.genreName || "Music"}
                    >
                      {track.genreName || "Music"}
                    </span>
                  </div>

                  {/* Status Pill */}
                  <div>
                    {(() => {
                      const isPublished = track.status === "PUBLISHED" || track.status === "APPROVED";
                      const isPending = track.status === "PENDING";
                      const isRejected = track.status === "REJECTED";

                      return (
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            padding: "3px 9px",
                            borderRadius: "6px",
                            background: isPublished
                              ? "#D1FADF"
                              : isPending
                              ? "#FEF0C7"
                              : isRejected
                              ? "#FEE4E2"
                              : "#F2F4F7",
                            color: isPublished
                              ? "#027A48"
                              : isPending
                              ? "#B54708"
                              : isRejected
                              ? "#B42318"
                              : "#344054",
                            border: isPublished
                              ? "1px solid #A7F3D0"
                              : isPending
                              ? "1px solid #FDE68A"
                              : isRejected
                              ? "1px solid #FCA5A5"
                              : "1px solid #E4E7EC",
                            textTransform: "uppercase",
                            display: "inline-block",
                          }}
                        >
                          {isPublished ? "PUBLISHED" : track.status}
                        </span>
                      );
                    })()}
                  </div>

                  {/* Time Duration */}
                  <span style={{ fontSize: "12px", color: "var(--sw-muted, #64748B)" }}>
                    {formatDuration(track.durationMs)}
                  </span>

                  {/* Inline Actions (Reorder / Remove / View) */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "4px" }}>
                    <button
                      type="button"
                      className="button button-ghost button-small"
                      onClick={() => handleInlineReorder(idx, "up")}
                      disabled={isFirst || reordering}
                      style={{
                        padding: "4px 6px",
                        opacity: isFirst ? 0.3 : 1,
                        cursor: isFirst ? "not-allowed" : "pointer",
                      }}
                      title="Move up in sequence"
                    >
                      <ArrowUpIcon width={13} height={13} />
                    </button>
                    <button
                      type="button"
                      className="button button-ghost button-small"
                      onClick={() => handleInlineReorder(idx, "down")}
                      disabled={isLast || reordering}
                      style={{
                        padding: "4px 6px",
                        opacity: isLast ? 0.3 : 1,
                        cursor: isLast ? "not-allowed" : "pointer",
                      }}
                      title="Move down in sequence"
                    >
                      <ArrowDownIcon width={13} height={13} />
                    </button>
                    <button
                      type="button"
                      className="button button-ghost button-small"
                      onClick={() => handleInlineRemoveTrack(track.id)}
                      style={{ padding: "4px 6px", color: "#DC2626" }}
                      title="Remove from album"
                    >
                      <TrashIcon width={13} height={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Edit Album Info Modal */}
      <AlbumFormModal
        open={editModalOpen}
        album={album}
        onClose={() => setEditModalOpen(false)}
        onSaved={async () => {
          setEditModalOpen(false);
          await fetchAlbumData();
          setActionSuccess("Album updated successfully.");
        }}
      />

      {/* Manage Tracks Modal (Styled like Playlist track manager) */}
      <ManageAlbumTracksModal
        open={manageTracksModalOpen}
        onClose={() => setManageTracksModalOpen(false)}
        album={album}
        onTracksUpdated={fetchAlbumData}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={deleteConfirmOpen}
        title="Delete Album"
        message={`Are you sure you want to delete "${album.title}"? All tracks in this album will remain in your library as standalone tracks and will not be deleted.`}
        confirmLabel="Delete album"
        onConfirm={handleDeleteAlbum}
        onCancel={() => setDeleteConfirmOpen(false)}
        submitting={deleting}
      />
    </div>
  );
}
