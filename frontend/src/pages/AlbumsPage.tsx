import { useCallback, useEffect, useState } from "react";
import { catalogApi } from "../api/catalog";
import { SortDropdown, type SortOption } from "../components/common/SortDropdown";
import {
  ClockIcon,
  CloseIcon,
  DiscIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  SearchIcon,
  TrendingUpIcon,
} from "../icons";
import type { LandingTrack, PublicAlbum } from "../types";

type Props = {
  currentTrack: LandingTrack | null;
  playing: boolean;
  onPlayTrack: (track: LandingTrack, contextQueue?: LandingTrack[], contextTitle?: string, contextKey?: string) => void;
  onNavigate: (route: string) => void;
};

const ALBUM_SORT_OPTIONS: SortOption<"newest" | "trending" | "title">[] = [
  {
    value: "newest",
    label: "Newest",
    hint: "Recently published albums",
    icon: <ClockIcon width={15} height={15} />,
    badgeBg: "#EFF6FF",
    badgeColor: "#2563EB",
  },
  {
    value: "trending",
    label: "Most tracks",
    hint: "Albums with most constituent tracks",
    icon: <TrendingUpIcon width={15} height={15} />,
    badgeBg: "#FFF1F2",
    badgeColor: "#E11D48",
  },
  {
    value: "title",
    label: "Title (A-Z)",
    hint: "Alphabetical from A to Z",
    icon: (
      <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 8 4-4 4 4" />
        <path d="M7 4v16" />
        <path d="M15 5h5l-5 5h5" />
        <path d="M15 19v-3a2 2 0 0 1 4 0v3" />
        <path d="M15 17h4" />
      </svg>
    ),
    badgeBg: "#F0FDF4",
    badgeColor: "#16A34A",
  },
];

export function AlbumsPage({ currentTrack, playing, onPlayTrack, onNavigate }: Props) {
  const [albums, setAlbums] = useState<PublicAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "trending" | "title">("newest");
  const [playingAlbumId, setPlayingAlbumId] = useState<number | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const loadAlbums = useCallback(async () => {
    setLoading(true);
    try {
      const response = await catalogApi.getAlbums({
        search: debouncedSearch || undefined,
        sort: sortBy === "trending" ? "tracks" : sortBy,
        page: 0,
        size: 50,
      });
      setAlbums(response?.content ?? []);
    } catch {
      // Gracefully fall back to empty list so user can see friendly empty state & create album CTA
      setAlbums([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, sortBy]);

  useEffect(() => {
    void loadAlbums();
  }, [loadAlbums]);

  // Handle Play entire Album
  const handlePlayAlbum = async (album: PublicAlbum, e: React.MouseEvent) => {
    e.stopPropagation();
    if (playingAlbumId === album.id && playing) {
      return;
    }
    setPlayingAlbumId(album.id);

    try {
      const details = await catalogApi.getAlbumByIdOrSlug(album.id);
      if (details.tracks && details.tracks.length > 0) {
        onPlayTrack(
          details.tracks[0],
          details.tracks,
          `Album • ${album.title}`,
          `album-${album.id}`
        );
      }
    } catch (err) {
      console.warn("Could not load album constituent tracks to play:", err);
    } finally {
      setPlayingAlbumId(null);
    }
  };

  const isCurrentAlbumPlaying = (albumId: number) => {
    return Boolean(
      currentTrack?.album?.id === albumId && playing
    );
  };

  const handleClearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setSortBy("newest");
  };

  return (
    <div className="catalog-browse-page" style={{ padding: "0 0 60px 0" }}>
      {/* 1. Page Title & Breadcrumb Banner (matching Browse Catalog design) */}
      <div className="page-title-banner" style={{ marginBottom: "24px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span className="eyebrow">PUBLIC CATALOG</span>
          </div>
          <h1 className="page-heading">Browse Public Albums</h1>
          <p className="page-subtext" style={{ color: "var(--sw-muted)", marginTop: "4px", fontSize: "14px" }}>
            Explore full albums, LPs, and curated records officially released by SoundWave creators.
          </p>
        </div>
      </div>

      {/* 2. Filter Toolbar (matching Browse Catalog toolbar style) */}
      <div
        className="sw-catalog-toolbar"
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "14px",
          marginBottom: "24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", flex: 1 }}>
          {/* Custom Modern Sort Dropdown */}
          <SortDropdown
            value={sortBy}
            onChange={(newSort) => setSortBy(newSort)}
            options={ALBUM_SORT_OPTIONS}
            showLabel={true}
          />

          {/* Search Input */}
          <div style={{ position: "relative", minWidth: "260px", maxWidth: "380px", flex: "1" }}>
            <SearchIcon
              width={16}
              height={16}
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--sw-muted)",
              }}
            />
            <input
              type="text"
              className="input-field"
              placeholder="Search albums by title or artist..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                height: "38px",
                paddingLeft: "38px",
                paddingRight: search ? "34px" : "14px",
                borderRadius: "10px",
                fontSize: "13px",
                width: "100%",
                background: "#ffffff",
                border: "1px solid var(--sw-border)",
              }}
            />
            {search && (
              <button
                type="button"
                className="icon-button"
                onClick={() => setSearch("")}
                style={{
                  position: "absolute",
                  right: "8px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  padding: "4px",
                }}
                title="Clear search"
              >
                <CloseIcon width={13} height={13} />
              </button>
            )}
          </div>

          {/* Clear filters Button */}
          {(debouncedSearch || sortBy !== "newest") && (
            <button
              type="button"
              className="button button-ghost"
              onClick={handleClearFilters}
              style={{
                height: "38px",
                padding: "0 14px",
                fontSize: "12px",
                fontWeight: 700,
                borderRadius: "10px",
                border: "1px solid #FCA5A5",
                background: "#FEF2F2",
                color: "#DC2626",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Result summary chip (matching Browse Catalog chip) */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              padding: "6px 14px",
              borderRadius: "999px",
              background: "var(--sw-sand-chip, #f5ead8)",
              color: "var(--sw-sand-deep, #8c5828)",
              border: "1px solid var(--sw-sand-border, #e6d5b8)",
              fontSize: "12px",
              fontWeight: 700,
            }}
          >
            Result count: <b>{albums.length}</b> albums
          </span>
        </div>
      </div>

      {/* 3. Albums Content Area */}
      {loading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
            gap: "22px",
          }}
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              style={{
                background: "#ffffff",
                borderRadius: "14px",
                padding: "14px",
                border: "1px solid var(--sw-border)",
              }}
            >
              <div className="skeleton" style={{ width: "100%", aspectRatio: "1/1", borderRadius: "10px", marginBottom: "12px" }} />
              <div className="skeleton" style={{ width: "75%", height: "16px", borderRadius: "4px", marginBottom: "8px" }} />
              <div className="skeleton" style={{ width: "50%", height: "13px", borderRadius: "4px" }} />
            </div>
          ))}
        </div>
      ) : albums.length > 0 ? (
        /* Albums Grid */
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
            gap: "22px",
          }}
        >
          {albums.map((album) => {
            const isPlaying = isCurrentAlbumPlaying(album.id);
            const releaseYear = album.releaseDate
              ? new Date(album.releaseDate).getFullYear()
              : album.createdAt
              ? new Date(album.createdAt).getFullYear()
              : null;

            return (
              <article
                key={album.id}
                className="sw-album-card"
                onClick={() => onNavigate(`/album/${album.id}`)}
                style={{
                  background: "#ffffff",
                  borderRadius: "14px",
                  padding: "14px",
                  border: "1px solid var(--sw-border)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  display: "flex",
                  flexDirection: "column",
                  cursor: "pointer",
                }}
              >
                {/* Cover art with play overlay */}
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
                  {album.coverUrl ? (
                    <img
                      src={album.coverUrl}
                      alt={album.title}
                      loading="lazy"
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

                  {/* Play overlay button */}
                  <button
                    type="button"
                    className="button-primary"
                    onClick={(e) => handlePlayAlbum(album, e)}
                    aria-label={`Play album ${album.title}`}
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
                    }}
                    title={isPlaying ? "Playing album" : "Play entire album"}
                  >
                    {isPlaying ? <PauseIcon width={17} height={17} /> : <PlayIcon width={17} height={17} />}
                  </button>

                  {/* Track count badge */}
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
                    }}
                  >
                    {album.trackCount} {album.trackCount === 1 ? "track" : "tracks"}
                  </span>
                </div>

                {/* Album metadata */}
                <h3
                  style={{
                    fontSize: "14.5px",
                    fontWeight: 700,
                    margin: "0 0 4px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    color: "var(--sw-text-primary, #0f172a)",
                  }}
                  title={album.title}
                >
                  {album.title}
                </h3>

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
                    {album.creator?.displayName || "SoundWave Creator"}
                  </span>
                  {releaseYear && <span>· {releaseYear}</span>}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* 4. Empty State (matching Browse Catalog with CTA to create album) */
        <div
          className="sw-empty"
          style={{
            minHeight: "340px",
            padding: "48px 24px",
            background: "#ffffff",
            border: "1px dashed var(--sw-border)",
            borderRadius: "20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "14px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "#F0FDFF",
              display: "grid",
              placeItems: "center",
              color: "var(--sw-primary, #0284c7)",
            }}
          >
            <DiscIcon width={30} height={30} />
          </div>

          <strong style={{ fontSize: "17px", color: "var(--sw-text, #0f172a)" }}>
            {debouncedSearch
              ? `No public albums match "${debouncedSearch}"`
              : "No public albums available yet"}
          </strong>

          <span style={{ fontSize: "13.5px", color: "var(--sw-muted)", maxWidth: "460px", lineHeight: "1.5" }}>
            {debouncedSearch
              ? "We couldn't find any public albums matching your query. Try searching for different keywords or clear your filters."
              : "There are currently no published albums in the public catalog. Start shaping your musical journey by creating and releasing your first album."}
          </span>

          <div style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "8px", flexWrap: "wrap", justifyContent: "center" }}>
            {debouncedSearch && (
              <button
                type="button"
                className="button button-secondary"
                onClick={handleClearFilters}
              >
                Clear search
              </button>
            )}

            <button
              type="button"
              className="button button-primary"
              onClick={() => onNavigate("/studio/albums/create")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 22px",
                fontWeight: 700,
              }}
            >
              <PlusIcon width={17} height={17} />
              <span>Create your first album</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
