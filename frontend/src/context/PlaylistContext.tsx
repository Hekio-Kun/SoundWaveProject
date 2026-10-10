import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { playlistApi } from "../api/playlists";
import { demoPlaylists } from "../data";
import { AddTrackToPlaylistModal } from "../components/AddTrackToPlaylistModal";
import { DeleteConfirmationModal } from "../components/DeleteConfirmationModal";
import { PlaylistFormModal } from "../components/PlaylistFormModal";
import { useAuth } from "./AuthContext";
import { usePlayer } from "./PlayerContext";
import type { LandingTrack, Playlist } from "../types";

export interface PlaylistContextType {
  playlists: Playlist[];
  toastNotice: string;
  showToast: (msg: string) => void;
  openCreatePlaylist: () => void;
  openEditPlaylist: (pl: Playlist) => void;
  closePlaylistForm: () => void;
  savePlaylist: (data: {
    title: string;
    description: string;
    isPrivate: boolean;
    coverUrl: string;
  }) => Promise<void>;
  openDeletePlaylist: (id: number) => void;
  closeDeletePlaylist: () => void;
  confirmDeletePlaylist: () => Promise<void>;
  openAddTrackModal: (playlistId: number) => void;
  closeAddTrackModal: () => void;
  addTrackToPlaylist: (playlistId: number, trackId: number) => Promise<void>;
  removeTrackFromPlaylist: (playlistId: number, trackId: number) => Promise<void>;
  reorderPlaylistTracks: (
    playlistId: number,
    trackId: number,
    direction: "up" | "down"
  ) => Promise<void>;
  playAllPlaylistTracks: (tracksToPlay: LandingTrack[]) => void;
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

export function PlaylistProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const { playTrack, setQueueOpen } = usePlayer();

  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    const saved = localStorage.getItem("soundwave_playlists");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return demoPlaylists;
  });

  const [toastNotice, setToastNotice] = useState("");
  const [playlistFormOpen, setPlaylistFormOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [addTrackPlaylistId, setAddTrackPlaylistId] = useState<number | null>(null);
  const [deletePlaylistId, setDeletePlaylistId] = useState<number | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastNotice(msg);
  }, []);

  useEffect(() => {
    if (!toastNotice) return;
    const timeoutId = window.setTimeout(() => setToastNotice(""), 3500);
    return () => window.clearTimeout(timeoutId);
  }, [toastNotice]);

  useEffect(() => {
    const loadPlaylists = async () => {
      try {
        if (isAuthenticated) {
          const myPlaylists = await playlistApi.getMyPlaylists();
          setPlaylists(myPlaylists ?? []);
        } else {
          const publicPlaylists = await playlistApi.getPublicPlaylists();
          setPlaylists(publicPlaylists ?? []);
        }
      } catch {
        // Retain current or fallback
      }
    };
    loadPlaylists();
  }, [isAuthenticated, user?.role]);

  useEffect(() => {
    localStorage.setItem("soundwave_playlists", JSON.stringify(playlists));
  }, [playlists]);

  const openCreatePlaylist = useCallback(() => {
    if (!isAuthenticated) {
      alert("Please log in to create a playlist.");
      window.location.hash = "#/login";
      return;
    }
    setEditingPlaylist(null);
    setPlaylistFormOpen(true);
  }, [isAuthenticated]);

  const openEditPlaylist = useCallback(
    (pl: Playlist) => {
      if (!isAuthenticated) {
        alert("Please log in to edit the playlist.");
        window.location.hash = "#/login";
        return;
      }
      setEditingPlaylist(pl);
      setPlaylistFormOpen(true);
    },
    [isAuthenticated]
  );

  const closePlaylistForm = useCallback(() => {
    setPlaylistFormOpen(false);
    setEditingPlaylist(null);
  }, []);

  const savePlaylist = useCallback(
    async (data: {
      title: string;
      description: string;
      isPrivate: boolean;
      coverUrl: string;
    }) => {
      if (editingPlaylist) {
        try {
          const updated = await playlistApi.updatePlaylist(editingPlaylist.id, data);
          setPlaylists((prev) =>
            prev.map((p) => (p.id === editingPlaylist.id ? updated : p))
          );
          showToast("Playlist updated successfully!");
          closePlaylistForm();
        } catch (err: any) {
          alert(err?.message || "Failed to update playlist.");
        }
      } else {
        try {
          const created = await playlistApi.createPlaylist(data);
          setPlaylists((prev) => [created, ...prev]);
          showToast("Playlist created successfully!");
          closePlaylistForm();
        } catch (err: any) {
          alert(err?.message || "Failed to create playlist.");
        }
      }
    },
    [closePlaylistForm, editingPlaylist, showToast]
  );

  const openDeletePlaylist = useCallback((id: number) => {
    setDeletePlaylistId(id);
  }, []);

  const closeDeletePlaylist = useCallback(() => {
    setDeletePlaylistId(null);
  }, []);

  const confirmDeletePlaylist = useCallback(async () => {
    if (!deletePlaylistId) return;
    const targetId = deletePlaylistId;
    try {
      await playlistApi.deletePlaylist(targetId);
    } catch {
      // Local fallback
    }
    setPlaylists((prev) => prev.filter((pl) => pl.id !== targetId));
    setDeletePlaylistId(null);
    showToast("Playlist deleted successfully.");
    if (window.location.hash.includes(`/playlist/${targetId}`)) {
      window.location.hash = "#/playlists";
    }
  }, [deletePlaylistId, showToast]);

  const openAddTrackModal = useCallback((playlistId: number) => {
    setAddTrackPlaylistId(playlistId);
  }, []);

  const closeAddTrackModal = useCallback(() => {
    setAddTrackPlaylistId(null);
  }, []);

  const addTrackToPlaylist = useCallback(
    async (playlistId: number, trackId: number) => {
      try {
        const updated = await playlistApi.addTrackToPlaylist(playlistId, trackId);
        setPlaylists((prev) => prev.map((pl) => (pl.id === playlistId ? updated : pl)));
        showToast("Track added to playlist.");
      } catch (err: any) {
        if (err?.status === 409 || err?.message?.includes("already in this playlist")) {
          alert("This track is already in the playlist.");
        } else {
          alert(err?.message || "Failed to add track to playlist.");
        }
      }
    },
    [showToast]
  );

  const removeTrackFromPlaylist = useCallback(
    async (playlistId: number, trackId: number) => {
      try {
        const updated = await playlistApi.removeTrackFromPlaylist(playlistId, trackId);
        setPlaylists((prev) => prev.map((pl) => (pl.id === playlistId ? updated : pl)));
      } catch (err) {
        setPlaylists((prev) =>
          prev.map((pl) => {
            if (pl.id === playlistId) {
              const nextTracks = pl.trackIds.filter((id) => id !== trackId);
              return {
                ...pl,
                trackIds: nextTracks,
                tracks: pl.tracks ? pl.tracks.filter((t) => t.id !== trackId) : undefined,
                trackCount: nextTracks.length,
              };
            }
            return pl;
          })
        );
        throw err;
      }
    },
    []
  );

  const reorderPlaylistTracks = useCallback(
    async (playlistId: number, trackId: number, direction: "up" | "down") => {
      try {
        const updated = await playlistApi.reorderPlaylistTracks(playlistId, {
          trackId,
          direction,
        });
        setPlaylists((prev) => prev.map((pl) => (pl.id === playlistId ? updated : pl)));
      } catch (err) {
        setPlaylists((prev) =>
          prev.map((pl) => {
            if (pl.id === playlistId) {
              const idx = pl.trackIds.indexOf(trackId);
              if (idx === -1) return pl;
              const targetIdx = direction === "up" ? idx - 1 : idx + 1;
              if (targetIdx < 0 || targetIdx >= pl.trackIds.length) return pl;
              const copy = [...pl.trackIds];
              const [moved] = copy.splice(idx, 1);
              copy.splice(targetIdx, 0, moved);

              let nextTracks = pl.tracks ? [...pl.tracks] : undefined;
              if (nextTracks && nextTracks.length === pl.trackIds.length) {
                const [movedTrack] = nextTracks.splice(idx, 1);
                nextTracks.splice(targetIdx, 0, movedTrack);
              }

              return { ...pl, trackIds: copy, tracks: nextTracks };
            }
            return pl;
          })
        );
        throw err;
      }
    },
    []
  );

  const playAllPlaylistTracks = useCallback(
    (tracksToPlay: LandingTrack[]) => {
      if (!tracksToPlay.length) return;
      playTrack(tracksToPlay[0], tracksToPlay);
      setQueueOpen(true);
    },
    [playTrack, setQueueOpen]
  );

  return (
    <PlaylistContext.Provider
      value={{
        playlists,
        toastNotice,
        showToast,
        openCreatePlaylist,
        openEditPlaylist,
        closePlaylistForm,
        savePlaylist,
        openDeletePlaylist,
        closeDeletePlaylist,
        confirmDeletePlaylist,
        openAddTrackModal,
        closeAddTrackModal,
        addTrackToPlaylist,
        removeTrackFromPlaylist,
        reorderPlaylistTracks,
        playAllPlaylistTracks,
      }}
    >
      {children}

      {/* Integrated Modals */}
      <PlaylistFormModal
        open={playlistFormOpen}
        onClose={closePlaylistForm}
        playlist={editingPlaylist}
        onSave={savePlaylist}
      />

      <AddTrackToPlaylistModal
        open={Boolean(addTrackPlaylistId)}
        onClose={closeAddTrackModal}
        playlistTitle={
          playlists.find((p) => p.id === addTrackPlaylistId)?.title ?? "Playlist"
        }
        currentTrackIds={
          playlists.find((p) => p.id === addTrackPlaylistId)?.trackIds ?? []
        }
        onAddTrack={(trackId) => {
          if (addTrackPlaylistId) {
            void addTrackToPlaylist(addTrackPlaylistId, trackId);
          }
        }}
      />

      <DeleteConfirmationModal
        open={Boolean(deletePlaylistId)}
        title="Delete Playlist"
        message="Are you sure you want to delete this playlist? This will remove the playlist permanently, but tracks will remain in the catalog."
        confirmLabel="Delete Playlist"
        onConfirm={confirmDeletePlaylist}
        onCancel={closeDeletePlaylist}
      />
    </PlaylistContext.Provider>
  );
}

export function usePlaylists(): PlaylistContextType {
  const context = useContext(PlaylistContext);
  if (!context) {
    throw new Error("usePlaylists must be used within a PlaylistProvider");
  }
  return context;
}
