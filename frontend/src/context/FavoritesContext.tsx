import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { catalogApi } from "../api/catalog";
import { favoriteApi } from "../api/favorites";
import { useAuth } from "./AuthContext";
import type { LandingTrack } from "../types";

export interface FavoritesContextType {
  favoriteTracks: LandingTrack[];
  favoriteIds: number[];
  isFavorite: (trackId: number) => boolean;
  toggleFavorite: (trackId: number) => Promise<void>;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user, authReady } = useAuth();
  const [favoriteTracks, setFavoriteTracks] = useState<LandingTrack[]>([]);

  const favoriteIds = useMemo(() => favoriteTracks.map((track) => track.id), [favoriteTracks]);

  const isFavorite = useCallback(
    (trackId: number) => favoriteIds.includes(trackId),
    [favoriteIds]
  );

  const refreshFavorites = useCallback(async () => {
    if (!authReady || user?.role !== "LISTENER") {
      setFavoriteTracks([]);
      return;
    }
    try {
      const items = await favoriteApi.getFavorites();
      setFavoriteTracks(items || []);
    } catch {
      setFavoriteTracks([]);
    }
  }, [authReady, user?.role]);

  useEffect(() => {
    let active = true;
    if (!authReady || user?.role !== "LISTENER") {
      setFavoriteTracks([]);
      return () => {
        active = false;
      };
    }

    void favoriteApi
      .getFavorites()
      .then((items) => {
        if (active) setFavoriteTracks(items || []);
      })
      .catch(() => {
        if (active) setFavoriteTracks([]);
      });

    return () => {
      active = false;
    };
  }, [authReady, user?.id, user?.role]);

  const toggleFavorite = useCallback(
    async (trackId: number) => {
      if (user?.role !== "LISTENER") {
        throw new Error("Log in with a Listener account to manage favorites.");
      }

      if (favoriteIds.includes(trackId)) {
        await favoriteApi.removeFavorite(trackId);
        setFavoriteTracks((previous) => previous.filter((track) => track.id !== trackId));
        return;
      }

      await favoriteApi.addFavorite(trackId);
      const favoriteTrack = await catalogApi.getTrackById(trackId);
      setFavoriteTracks((previous) => [
        favoriteTrack,
        ...previous.filter((track) => track.id !== trackId),
      ]);
    },
    [favoriteIds, user?.role]
  );

  return (
    <FavoritesContext.Provider
      value={{
        favoriteTracks,
        favoriteIds,
        isFavorite,
        toggleFavorite,
        refreshFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextType {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
