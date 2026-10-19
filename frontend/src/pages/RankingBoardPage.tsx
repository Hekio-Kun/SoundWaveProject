import { useCallback, useEffect, useMemo, useState } from "react";
import { catalogApi } from "../api/catalog";
import { useFavorites } from "../context/FavoritesContext";
import {
  FlameIcon,
  HeartFillIcon,
  HeartIcon,
  PauseIcon,
  PlayIcon,
  TrophyIcon,
} from "../icons";
import type { Genre, LandingTrack } from "../types";

type Props = {
  currentTrack: LandingTrack | null;
  playing: boolean;
  onPlayTrack: (track: LandingTrack, contextQueue?: LandingTrack[], contextTitle?: string, contextKey?: string) => void;
  onNavigate: (route: string) => void;
  initialGenre?: string;
};

const formatDuration = (ms: number): string => {
  if (!ms || ms <= 0) return "0:00";
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
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

  // Top 3 for Podium cards
  const top1 = rankingTracks[0] ?? null;
  const top2 = rankingTracks[1] ?? null;
  const top3 = rankingTracks[2] ?? null;

  // Selected genre display name
  const currentGenreName = useMemo(() => {
    if (selectedGenre === "all") return "All Genres";
    const found = genres.find((g) => g.slug === selectedGenre);
    return found ? found.name : selectedGenre.toUpperCase();
  }, [selectedGenre, genres]);

  // Play All handler
  const handlePlayAll = () => {
    if (rankingTracks.length > 0) {
      onPlayTrack(
        rankingTracks[0],
        rankingTracks,
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
          background: "linear-gradient(135deg, #091e3a 0%, #0d3b66 60%, #175676 100%)",
          borderRadius: 24,
          padding: "36px 40px",
          color: "#ffffff",
          boxShadow: "0 16px 36px -12px rgba(13, 59, 102, 0.4)",
          position: "relative",
          overflow: "hidden",
          marginBottom: 32,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -40,
            right: -20,
            opacity: 0.1,
            pointerEvents: "none",
            transform: "rotate(15deg)",
          }}
        >
          <TrophyIcon width={280} height={280} />
        </div>

        <div style={{ position: "relative", zIndex: 1, maxWidth: 680 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(8px)",
              padding: "6px 14px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.06em",
              color: "#fbbf24",
              marginBottom: 16,
              textTransform: "uppercase",
            }}
          >
            <FlameIcon width={16} height={16} />
            <span>Official SoundWave Leaderboard</span>
          </div>

          <h1
            style={{
              fontSize: "clamp(28px, 4vw, 42px)",
              fontWeight: 900,
              lineHeight: 1.15,
              margin: "0 0 12px 0",
              letterSpacing: "-0.02em",
            }}
          >
            Top Charts
          </h1>

          <p
            style={{
              fontSize: 15,
              color: "rgba(255, 255, 255, 0.8)",
              margin: "0 0 24px 0",
              lineHeight: 1.5,
              maxWidth: 580,
            }}
          >
            Discover the most streamed music on SoundWave right now. Updated dynamically based on global listeners.
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <button
              className="button button-primary button-large"
              onClick={handlePlayAll}
              disabled={rankingTracks.length === 0 || loading}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                background: "#0284c7",
                color: "#ffffff",
                fontWeight: 700,
                padding: "12px 24px",
                borderRadius: 999,
                boxShadow: "0 4px 14px rgba(2, 132, 199, 0.4)",
              }}
            >
              <PlayIcon width={18} height={18} />
              <span>Play Chart ({rankingTracks.length})</span>
            </button>

            <span style={{ fontSize: 13, color: "rgba(255, 255, 255, 0.7)", marginLeft: 4 }}>
              {rankingTracks.length > 0 ? `Showing top ${rankingTracks.length} tracks` : ""}
            </span>
          </div>
        </div>
      </section>

      {/* Genre Filter Tabs (AF01) */}
      <section style={{ marginBottom: 32 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            overflowX: "auto",
            paddingBottom: 6,
            scrollbarWidth: "none",
          }}
        >
          <button
            onClick={() => setSelectedGenre("all")}
            style={{
              padding: "8px 18px",
              borderRadius: 999,
              fontSize: 13.5,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s ease",
              border: selectedGenre === "all" ? "1px solid #0284c7" : "1px solid #e2e8f0",
              background: selectedGenre === "all" ? "#0284c7" : "#ffffff",
              color: selectedGenre === "all" ? "#ffffff" : "#475569",
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
                  padding: "8px 18px",
                  borderRadius: 999,
                  fontSize: 13.5,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  border: active ? "1px solid #0284c7" : "1px solid #e2e8f0",
                  background: active ? "#0284c7" : "#ffffff",
                  color: active ? "#ffffff" : "#475569",
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
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 20,
              marginBottom: 24,
            }}
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  height: 180,
                  background: "#f1f5f9",
                  borderRadius: 18,
                  animation: "pulse 1.5s infinite ease-in-out",
                }}
              />
            ))}
          </div>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              style={{
                height: 60,
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
        <>
          {/* Top 3 Podium Highlights */}
          {top1 && (
            <section style={{ marginBottom: 40 }}>
              <h2
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: "#0f172a",
                  marginBottom: 18,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span>Podium Highlights</span>
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                  gap: 20,
                  alignItems: "stretch",
                }}
              >
                {/* #1 Champion */}
                <div
                  style={{
                    background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
                    border: "2px solid #fde68a",
                    borderRadius: 20,
                    padding: 22,
                    position: "relative",
                    boxShadow: "0 10px 25px -5px rgba(245, 158, 11, 0.2)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                    <div
                      style={{
                        position: "relative",
                        width: 90,
                        height: 90,
                        borderRadius: 14,
                        overflow: "hidden",
                        flexShrink: 0,
                        boxShadow: "0 6px 16px rgba(0, 0, 0, 0.12)",
                      }}
                    >
                      <img
                        src={top1.coverUrl || "/placeholder-album.png"}
                        alt={top1.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      <button
                        onClick={() =>
                          onPlayTrack(
                            top1,
                            rankingTracks,
                            `Top Charts - ${currentGenreName}`,
                            `ranking-${selectedGenre}`
                          )
                        }
                        aria-label={`Play #1 ${top1.title}`}
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "rgba(0, 0, 0, 0.4)",
                          border: 0,
                          display: "grid",
                          placeItems: "center",
                          color: "#ffffff",
                          cursor: "pointer",
                          opacity: isCurrentTrackPlaying(top1.id) ? 1 : 0.85,
                          transition: "opacity 0.2s",
                        }}
                      >
                        {isCurrentTrackPlaying(top1.id) ? (
                          <PauseIcon width={24} height={24} />
                        ) : (
                          <PlayIcon width={24} height={24} />
                        )}
                      </button>
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          background: "#f59e0b",
                          color: "#ffffff",
                          fontSize: 11,
                          fontWeight: 800,
                          padding: "3px 10px",
                          borderRadius: 999,
                          marginBottom: 8,
                        }}
                      >
                        🥇 #1 CHAMPION
                      </div>

                      <h3
                        onClick={() => onNavigate(`/track/${top1.id}`)}
                        style={{
                          fontSize: 17,
                          fontWeight: 800,
                          color: "#78350f",
                          margin: "0 0 4px 0",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        title={top1.title}
                      >
                        {top1.title}
                      </h3>

                      <p
                        onClick={() => onNavigate(`/creator/${top1.creator.userId}`)}
                        style={{
                          fontSize: 13,
                          color: "#92400e",
                          margin: "0 0 10px 0",
                          cursor: "pointer",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {top1.creator.displayName}
                      </p>

                      <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12, color: "#b45309", fontWeight: 700 }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <FlameIcon width={14} height={14} />
                          {formatPlayCount(top1.playCount)}
                        </span>
                        <span>•</span>
                        <span>{formatDuration(top1.durationMs)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* #2 Runner Up */}
                {top2 && (
                  <div
                    style={{
                      background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                      border: "2px solid #cbd5e1",
                      borderRadius: 20,
                      padding: 22,
                      boxShadow: "0 8px 20px -5px rgba(100, 116, 139, 0.15)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                      <div
                        style={{
                          position: "relative",
                          width: 80,
                          height: 80,
                          borderRadius: 14,
                          overflow: "hidden",
                          flexShrink: 0,
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                        }}
                      >
                        <img
                          src={top2.coverUrl || "/placeholder-album.png"}
                          alt={top2.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        <button
                          onClick={() =>
                            onPlayTrack(
                              top2,
                              rankingTracks,
                              `Top Charts - ${currentGenreName}`,
                              `ranking-${selectedGenre}`
                            )
                          }
                          aria-label={`Play #2 ${top2.title}`}
                          style={{
                            position: "absolute",
                            inset: 0,
                            background: "rgba(0, 0, 0, 0.4)",
                            border: 0,
                            display: "grid",
                            placeItems: "center",
                            color: "#ffffff",
                            cursor: "pointer",
                            opacity: isCurrentTrackPlaying(top2.id) ? 1 : 0.85,
                            transition: "opacity 0.2s",
                          }}
                        >
                          {isCurrentTrackPlaying(top2.id) ? (
                            <PauseIcon width={22} height={22} />
                          ) : (
                            <PlayIcon width={22} height={22} />
                          )}
                        </button>
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            background: "#64748b",
                            color: "#ffffff",
                            fontSize: 11,
                            fontWeight: 800,
                            padding: "3px 10px",
                            borderRadius: 999,
                            marginBottom: 8,
                          }}
                        >
                          🥈 #2 RUNNER-UP
                        </div>

                        <h3
                          onClick={() => onNavigate(`/track/${top2.id}`)}
                          style={{
                            fontSize: 16,
                            fontWeight: 800,
                            color: "#1e293b",
                            margin: "0 0 4px 0",
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          title={top2.title}
                        >
                          {top2.title}
                        </h3>

                        <p
                          onClick={() => onNavigate(`/creator/${top2.creator.userId}`)}
                          style={{
                            fontSize: 12.5,
                            color: "#475569",
                            margin: "0 0 8px 0",
                            cursor: "pointer",
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {top2.creator.displayName}
                        </p>

                        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "#64748b", fontWeight: 600 }}>
                          <span>{formatPlayCount(top2.playCount)}</span>
                          <span>•</span>
                          <span>{formatDuration(top2.durationMs)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* #3 Bronze */}
                {top3 && (
                  <div
                    style={{
                      background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
                      border: "2px solid #fed7aa",
                      borderRadius: 20,
                      padding: 22,
                      boxShadow: "0 8px 20px -5px rgba(234, 88, 12, 0.15)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                      <div
                        style={{
                          position: "relative",
                          width: 80,
                          height: 80,
                          borderRadius: 14,
                          overflow: "hidden",
                          flexShrink: 0,
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                        }}
                      >
                        <img
                          src={top3.coverUrl || "/placeholder-album.png"}
                          alt={top3.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        <button
                          onClick={() =>
                            onPlayTrack(
                              top3,
                              rankingTracks,
                              `Top Charts - ${currentGenreName}`,
                              `ranking-${selectedGenre}`
                            )
                          }
                          aria-label={`Play #3 ${top3.title}`}
                          style={{
                            position: "absolute",
                            inset: 0,
                            background: "rgba(0, 0, 0, 0.4)",
                            border: 0,
                            display: "grid",
                            placeItems: "center",
                            color: "#ffffff",
                            cursor: "pointer",
                            opacity: isCurrentTrackPlaying(top3.id) ? 1 : 0.85,
                            transition: "opacity 0.2s",
                          }}
                        >
                          {isCurrentTrackPlaying(top3.id) ? (
                            <PauseIcon width={22} height={22} />
                          ) : (
                            <PlayIcon width={22} height={22} />
                          )}
                        </button>
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            background: "#ea580c",
                            color: "#ffffff",
                            fontSize: 11,
                            fontWeight: 800,
                            padding: "3px 10px",
                            borderRadius: 999,
                            marginBottom: 8,
                          }}
                        >
                          🥉 #3 BRONZE
                        </div>

                        <h3
                          onClick={() => onNavigate(`/track/${top3.id}`)}
                          style={{
                            fontSize: 16,
                            fontWeight: 800,
                            color: "#9a3412",
                            margin: "0 0 4px 0",
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          title={top3.title}
                        >
                          {top3.title}
                        </h3>

                        <p
                          onClick={() => onNavigate(`/creator/${top3.creator.userId}`)}
                          style={{
                            fontSize: 12.5,
                            color: "#c2410c",
                            margin: "0 0 8px 0",
                            cursor: "pointer",
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {top3.creator.displayName}
                        </p>

                        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "#ea580c", fontWeight: 600 }}>
                          <span>{formatPlayCount(top3.playCount)}</span>
                          <span>•</span>
                          <span>{formatDuration(top3.durationMs)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Full Leaderboard Table */}
          <section>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: 0 }}>
                Leaderboard Rankings
              </h2>
              <span style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>
                Sorted by Total Plays & Fresh Releases
              </span>
            </div>

            <div
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 18,
                overflow: "hidden",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
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
                <span style={{ textAlign: "center" }}>Rank</span>
                <span>Track</span>
                <span>Title & Artist</span>
                <span>Genre / Album</span>
                <span style={{ textAlign: "right" }}>Plays</span>
                <span style={{ textAlign: "right" }}>Time</span>
                <span style={{ textAlign: "center" }}>Save</span>
              </div>

              {/* Rows */}
              <div>
                {rankingTracks.map((track, idx) => {
                  const rank = idx + 1;
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

                  if (rank === 1) {
                    rankBadgeStyle = {
                      ...rankBadgeStyle,
                      background: "#fef3c7",
                      color: "#b45309",
                      border: "1px solid #fde68a",
                    };
                  } else if (rank === 2) {
                    rankBadgeStyle = {
                      ...rankBadgeStyle,
                      background: "#f1f5f9",
                      color: "#475569",
                      border: "1px solid #cbd5e1",
                    };
                  } else if (rank === 3) {
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
                        borderBottom: idx === rankingTracks.length - 1 ? 0 : "1px solid #f1f5f9",
                        transition: "background 0.15s ease",
                      }}
                    >
                      {/* Rank Column */}
                      <div style={{ textAlign: "center" }}>
                        <span style={rankBadgeStyle}>
                          {rank === 1 ? "1" : rank === 2 ? "2" : rank === 3 ? "3" : rank}
                        </span>
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
                            rankingTracks,
                            `Top Charts - ${currentGenreName}`,
                            `ranking-${selectedGenre}`
                          )
                        }
                      >
                        <img
                          src={track.coverUrl || "/placeholder-album.png"}
                          alt={track.title}
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
                              rankingTracks,
                              `Top Charts - ${currentGenreName}`,
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
                          href={`#/track/${track.id}`}
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
                          href={`#/creator/${track.creator.userId}`}
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
        </>
      )}
    </div>
  );
}
