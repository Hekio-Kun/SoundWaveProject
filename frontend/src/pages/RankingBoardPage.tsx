import { useCallback, useEffect, useMemo, useState } from "react";
import { catalogApi } from "../api/catalog";
import { useFavorites } from "../context/FavoritesContext";
import { covers } from "../data";
import {
  FlameIcon,
  HeartFillIcon,
  HeartIcon,
  PauseIcon,
  PlayIcon,
  TrophyIcon,
} from "../icons";
import type { Genre, LandingTrack } from "../types";
import { formatDuration } from "../utils/timeUtils";

type Props = {
  currentTrack: LandingTrack | null;
  playing: boolean;
  onPlayTrack: (track: LandingTrack, contextQueue?: LandingTrack[], contextTitle?: string, contextKey?: string) => void;
  onNavigate: (route: string) => void;
  initialGenre?: string;
};

const formatPlayCount = (count?: number): string => {
  if (count === undefined || count === null) return "0 plays";
  return new Intl.NumberFormat("en-US").format(count) + (count === 1 ? " play" : " plays");
};


export function RankingBoardPage({
  currentTrack,
  playing,
  onPlayTrack,
  onNavigate,
  initialGenre,
}: Props) {
  const { favoriteIds, toggleFavorite } = useFavorites();

  const [selectedGenre, setSelectedGenre] = useState<string>(initialGenre ?? "all");
  const [genres, setGenres] = useState<Genre[]>([]);
  const [rankingTracks, setRankingTracks] = useState<LandingTrack[]>([]);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load genres for AF01
  useEffect(() => {
    let active = true;
    catalogApi
      .getGenres()
      .then((data) => {
        if (active && Array.isArray(data)) {
          setGenres(data);
        }
      })
      .catch(() => {
        // Keep empty genres fallback if genres fail to load
      });
    return () => {
      active = false;
    };
  }, []);

  // Synchronize initialGenre prop if route params change
  useEffect(() => {
    if (initialGenre) {
      setSelectedGenre(initialGenre);
    }
  }, [initialGenre]);

  // Fetch ranking tracks (Normal Flow & AF01)
  const fetchRanking = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const genreParam = selectedGenre !== "all" ? selectedGenre : undefined;
      const tracks = await catalogApi.getRankingBoard({ genre: genreParam, limit: 50 });
      setRankingTracks(tracks || []);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to load ranking board. Please check your network connection.";
      setError(message);
      setRankingTracks([]);
    } finally {
      setLoading(false);
    }
  }, [selectedGenre]);

  useEffect(() => {
    void fetchRanking();
  }, [fetchRanking]);

  // Selected genre display name
  const currentGenreName = useMemo(() => {
    if (selectedGenre === "all") return "All Genres";
    const found = genres.find((g) => g.slug === selectedGenre);
    return found ? found.name : selectedGenre.toUpperCase();
  }, [selectedGenre, genres]);

  // Compute items with stable original rank
  const rankedItems = useMemo(() => {
    const base = rankingTracks.map((track, idx) => ({
      track,
      originalRank: idx + 1,
    }));

    if (sortOrder === "asc") {
      // Sort từ dưới lên (Bottom-up: ít lượt nghe nhất lên nhiều nhất)
      return [...base].reverse();
    }
    return base;
  }, [rankingTracks, sortOrder]);

  const displayedTracks = useMemo(() => rankedItems.map((item) => item.track), [rankedItems]);

  // Play All handler
  const handlePlayAll = () => {
    if (displayedTracks.length > 0) {
      onPlayTrack(
        displayedTracks[0],
        displayedTracks,
        `Top Charts - ${currentGenreName}`,
        `ranking-${selectedGenre}`
      );
    }
  };

  const isCurrentTrackPlaying = (trackId: number) => {
    return Boolean(currentTrack?.id === trackId && playing);
  };

  return (
    <div className="ranking-page-container" style={{ padding: "32px 36px 80px", maxWidth: 1240, margin: "0 auto" }}>
      {/* Hero Section */}
      <section
        style={{
          background: "linear-gradient(125deg, #e9fbff 0%, #fdfcf9 45%, #fbf3e5 100%)",
          borderRadius: 22,
          padding: "32px 36px",
          border: "1px solid rgba(2, 132, 199, 0.12)",
          boxShadow: "0 14px 40px rgba(16, 24, 40, 0.055)",
          position: "relative",
          overflow: "hidden",
          marginBottom: 28,
        }}
      >
        <div style={{ position: "relative", zIndex: 1, maxWidth: 680 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "#e0f2fe",
              color: "#0284c7",
              padding: "4px 12px",
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.08em",
              marginBottom: 12,
              textTransform: "uppercase",
            }}
          >
            <FlameIcon width={13} height={13} />
            <span>Official SoundWave Leaderboard</span>
          </div>

          <h1
            className="page-heading"
            style={{
              fontSize: "clamp(28px, 4vw, 38px)",
              fontWeight: 800,
              lineHeight: 1.15,
              margin: "0 0 8px 0",
              letterSpacing: "-0.03em",
              color: "var(--brand, #0284c7)",
            }}
          >
            Top Charts
          </h1>

          <p
            className="page-subtext"
            style={{
              fontSize: 14.5,
              color: "#57534e",
              margin: "0 0 20px 0",
              lineHeight: 1.55,
              maxWidth: 580,
            }}
          >
            Discover the most streamed music on SoundWave right now. Updated dynamically based on global listeners.
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <button
              className="button button-primary"
              onClick={handlePlayAll}
              disabled={rankingTracks.length === 0 || loading}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "#0284c7",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: 14,
                padding: "10px 22px",
                borderRadius: 999,
                border: 0,
                cursor: rankingTracks.length === 0 || loading ? "not-allowed" : "pointer",
                boxShadow: "0 4px 12px rgba(2, 132, 199, 0.25)",
                transition: "all 0.2s ease",
              }}
            >
              <PlayIcon width={16} height={16} />
              <span>Play Chart ({rankingTracks.length})</span>
            </button>

            <span style={{ fontSize: 13, color: "#8d877f", fontWeight: 500 }}>
              {rankingTracks.length > 0 ? `Showing top ${rankingTracks.length} tracks` : ""}
            </span>
          </div>
        </div>
      </section>

      {/* Genre Filter Tabs (AF01) */}
      <section style={{ marginBottom: 28 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            overflowX: "auto",
            paddingBottom: 6,
            scrollbarWidth: "none",
          }}
        >
          <button
            onClick={() => setSelectedGenre("all")}
            style={{
              padding: "7px 16px",
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.15s ease",
              border: selectedGenre === "all" ? "1px solid #0284c7" : "1px solid #e8dccb",
              background: selectedGenre === "all" ? "#0284c7" : "#fbf4ea",
              color: selectedGenre === "all" ? "#ffffff" : "#785028",
              boxShadow: selectedGenre === "all" ? "0 4px 12px rgba(2, 132, 199, 0.25)" : "none",
              whiteSpace: "nowrap",
            }}
          >
            All Genres
          </button>

          {genres.map((g) => {
            const active = selectedGenre === g.slug;
            return (
              <button
                key={g.id || g.slug}
                onClick={() => setSelectedGenre(g.slug)}
                style={{
                  padding: "7px 16px",
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  border: active ? "1px solid #0284c7" : "1px solid #e8dccb",
                  background: active ? "#0284c7" : "#fbf4ea",
                  color: active ? "#ffffff" : "#785028",
                  boxShadow: active ? "0 4px 12px rgba(2, 132, 199, 0.25)" : "none",
                  whiteSpace: "nowrap",
                }}
              >
                {g.name}
              </button>
            );
          })}
        </div>
      </section>

      {/* Loading Skeleton */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              style={{
                height: 56,
                background: "#f8fafc",
                borderRadius: 12,
                animation: "pulse 1.5s infinite ease-in-out",
              }}
            />
          ))}
        </div>
      )}

      {/* Error State (EX02) */}
      {!loading && error && (
        <div
          role="alert"
          style={{
            background: "#fef2f2",
            border: "1px solid #fee2e2",
            borderRadius: 16,
            padding: "36px 24px",
            textAlign: "center",
            color: "#991b1b",
            margin: "20px 0",
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px 0" }}>Unable to load Top Charts</h3>
          <p style={{ fontSize: 14, color: "#b91c1c", margin: "0 0 20px 0", maxWidth: 460, marginInline: "auto" }}>
            {error}
          </p>
          <button
            className="button button-primary button-small"
            onClick={() => void fetchRanking()}
            style={{ borderRadius: 999, padding: "8px 20px" }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State (EX01) */}
      {!loading && !error && rankingTracks.length === 0 && (
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 20,
            padding: "60px 24px",
            textAlign: "center",
            margin: "20px 0",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.03)",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "#eff6ff",
              display: "grid",
              placeItems: "center",
              margin: "0 auto 16px",
              color: "#0284c7",
            }}
          >
            <TrophyIcon width={32} height={32} />
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "0 0 8px 0" }}>
            No rankings available yet
          </h3>
          <p style={{ fontSize: 14, color: "#64748b", maxWidth: 440, margin: "0 auto 24px", lineHeight: 1.5 }}>
            {selectedGenre !== "all"
              ? `There are no tracks published yet in the "${currentGenreName}" category. Be the first to listen or upload!`
              : "No tracks are currently ranked. Check back soon or explore our newest catalog releases."}
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
            {selectedGenre !== "all" && (
              <button
                className="button button-secondary button-small"
                onClick={() => setSelectedGenre("all")}
                style={{ borderRadius: 999 }}
              >
                View All Genres
              </button>
            )}
            <button
              className="button button-primary button-small"
              onClick={() => onNavigate("/browse")}
              style={{ borderRadius: 999 }}
            >
              Browse Catalog
            </button>
          </div>
        </div>
      )}

      {/* Ranking Board Content */}
      {!loading && !error && rankingTracks.length > 0 && (
        <section>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1c1917", margin: "0 0 4px 0" }}>
                Leaderboard Rankings
              </h2>
              <span style={{ fontSize: 13, color: "#57534e", fontWeight: 600 }}>
                {sortOrder === "desc"
                  ? `Top to Bottom (#1 → #${rankingTracks.length}) • Highest to lowest plays`
                  : `Bottom Up (#${rankingTracks.length} → #1) • Lowest to highest plays`}
              </span>
            </div>

            {/* Sort Order Toggle Button (Bottom-Up vs Top-to-Bottom) */}
            <button
              onClick={() => setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: "8px 16px",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                border: sortOrder === "asc" ? "1px solid #0284c7" : "1px solid #e8dccb",
                background: sortOrder === "asc" ? "#0284c7" : "#ffffff",
                color: sortOrder === "asc" ? "#ffffff" : "#475569",
                transition: "all 0.15s ease",
                boxShadow: sortOrder === "asc" ? "0 4px 12px rgba(2, 132, 199, 0.25)" : "0 1px 3px rgba(0, 0, 0, 0.04)",
              }}
              title={
                sortOrder === "desc"
                  ? "Bấm để đổi sang sắp xếp từ dưới lên (Bottom-up: ít lượt nghe nhất lên đầu)"
                  : "Bấm để quay về sắp xếp chuẩn từ trên xuống (Top-down: #1 lên đầu)"
              }
            >
              <span style={{ fontSize: 13, fontWeight: 900 }}>
                {sortOrder === "desc" ? "⬇" : "⬆"}
              </span>
              <span>
                {sortOrder === "desc"
                  ? `Sort: Top to Bottom (#1 → #${rankingTracks.length})`
                  : `Sort: Bottom Up (#${rankingTracks.length} → #1)`}
              </span>
            </button>
          </div>

          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e8dccb",
              borderRadius: 18,
              overflow: "hidden",
              boxShadow: "0 4px 20px rgba(16, 24, 40, 0.04)",
            }}
          >
              {/* Header row */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "50px 48px minmax(200px, 2fr) minmax(110px, 1fr) 110px 70px 44px",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 18px",
                  borderBottom: "1px solid #e2e8f0",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#64748b",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  background: "#f8fafc",
                }}
              >
                <div
                  onClick={() => setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                    cursor: "pointer",
                    userSelect: "none",
                    color: "#0f172a",
                  }}
                  title="Click to toggle rank sort order"
                >
                  <span>Rank</span>
                  <span style={{ fontSize: 11, color: "#0284c7" }}>
                    {sortOrder === "desc" ? "↓" : "↑"}
                  </span>
                </div>
                <span>Track</span>
                <span>Title & Artist</span>
                <span>Genre / Album</span>
                <div
                  onClick={() => setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    gap: 4,
                    cursor: "pointer",
                    userSelect: "none",
                    color: "#0f172a",
                  }}
                  title="Click to toggle plays sort order"
                >
                  <span>Plays</span>
                  <span style={{ fontSize: 11, color: "#0284c7" }}>
                    {sortOrder === "desc" ? "↓" : "↑"}
                  </span>
                </div>
                <span style={{ textAlign: "right" }}>Time</span>
                <span style={{ textAlign: "center" }}>Save</span>
              </div>

              {/* Rows */}
              <div>
                {rankedItems.map(({ track, originalRank }, idx) => {
                  const isCurrent = currentTrack?.id === track.id;
                  const isPlaying = isCurrent && playing;
                  const isFavorited = favoriteIds.includes(track.id);

                  let rankBadgeStyle: React.CSSProperties = {
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    fontSize: 13,
                    fontWeight: 800,
                    margin: "0 auto",
                  };

                  if (originalRank === 1) {
                    rankBadgeStyle = {
                      ...rankBadgeStyle,
                      background: "#fef3c7",
                      color: "#b45309",
                      border: "1px solid #fde68a",
                    };
                  } else if (originalRank === 2) {
                    rankBadgeStyle = {
                      ...rankBadgeStyle,
                      background: "#f1f5f9",
                      color: "#475569",
                      border: "1px solid #cbd5e1",
                    };
                  } else if (originalRank === 3) {
                    rankBadgeStyle = {
                      ...rankBadgeStyle,
                      background: "#ffedd5",
                      color: "#c2410c",
                      border: "1px solid #fed7aa",
                    };
                  } else {
                    rankBadgeStyle = {
                      ...rankBadgeStyle,
                      color: "#94a3b8",
                      fontSize: 13,
                      fontWeight: 700,
                    };
                  }

                  return (
                    <div
                      key={track.id}
                      className={`table-track-row ${isCurrent ? "table-track-row--active" : ""}`}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "50px 48px minmax(200px, 2fr) minmax(110px, 1fr) 110px 70px 44px",
                        alignItems: "center",
                        gap: 12,
                        padding: "10px 18px",
                        borderBottom: idx === rankedItems.length - 1 ? 0 : "1px solid #f1f5f9",
                        transition: "background 0.15s ease",
                      }}
                    >
                      {/* Rank Column */}
                      <div style={{ textAlign: "center" }}>
                        <span style={rankBadgeStyle}>{originalRank}</span>
                      </div>

                      {/* Thumbnail & Quick Play */}
                      <div
                        className="row-thumbnail"
                        style={{
                          position: "relative",
                          width: 44,
                          height: 44,
                          borderRadius: 8,
                          overflow: "hidden",
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          onPlayTrack(
                            track,
                            displayedTracks,
                            `Top Charts - ${currentGenreName}${sortOrder === "asc" ? " (Bottom-Up)" : ""}`,
                            `ranking-${selectedGenre}`
                          )
                        }
                      >
                        <img
                          src={track.coverUrl || covers.dawn}
                          alt={track.title}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = covers.dawn;
                          }}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        <button
                          className="row-hover-play"
                          aria-label={`Play ${track.title}`}
                          style={{
                            opacity: isPlaying ? 1 : undefined,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onPlayTrack(
                              track,
                              displayedTracks,
                              `Top Charts - ${currentGenreName}${sortOrder === "asc" ? " (Bottom-Up)" : ""}`,
                              `ranking-${selectedGenre}`
                            );
                          }}
                        >
                          {isPlaying ? (
                            <PauseIcon width={16} height={16} />
                          ) : (
                            <PlayIcon width={16} height={16} />
                          )}
                        </button>
                      </div>

                      {/* Title & Artist */}
                      <div className="row-main-info" style={{ minWidth: 0 }}>
                        <a
                          className="row-title"
                          href={`/track/${track.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            onNavigate(`/track/${track.id}`);
                          }}
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: isCurrent ? "#0284c7" : "#0f172a",
                            textDecoration: "none",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
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
                          style={{
                            fontSize: 12.5,
                            color: "#64748b",
                            textDecoration: "none",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {track.creator.displayName}
                        </a>
                      </div>

                      {/* Genre / Album Tag */}
                      <div style={{ minWidth: 0 }}>
                        <span
                          style={{
                            display: "inline-block",
                            fontSize: 11.5,
                            fontWeight: 600,
                            color: "#475569",
                            background: "#f1f5f9",
                            padding: "3px 8px",
                            borderRadius: 6,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: "100%",
                          }}
                        >
                          {track.genreName || track.album?.title || "Single"}
                        </span>
                      </div>

                      {/* Total Plays */}
                      <div
                        style={{
                          textAlign: "right",
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#334155",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatPlayCount(track.playCount)}
                      </div>

                      {/* Duration */}
                      <div
                        style={{
                          textAlign: "right",
                          fontSize: 12.5,
                          color: "#64748b",
                          fontWeight: 500,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatDuration(track.durationMs)}
                      </div>

                      {/* Favorite Button */}
                      <div style={{ textAlign: "center" }}>
                        <button
                          onClick={() => toggleFavorite(track.id)}
                          aria-label={isFavorited ? "Remove from favorites" : "Save to favorites"}
                          style={{
                            background: "transparent",
                            border: 0,
                            cursor: "pointer",
                            padding: 6,
                            borderRadius: "50%",
                            color: isFavorited ? "#ef4444" : "#94a3b8",
                            display: "grid",
                            placeItems: "center",
                            transition: "all 0.15s ease",
                          }}
                        >
                          {isFavorited ? (
                            <HeartFillIcon width={16} height={16} />
                          ) : (
                            <HeartIcon width={16} height={16} />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
      )}
    </div>
  );
}
