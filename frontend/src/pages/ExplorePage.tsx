import { useCallback, useEffect, useState } from "react";
import { catalogApi } from "../api/catalog";
import { TrackCard } from "../components/common/MusicCards";
import { tracks as fallbackTracks } from "../data";
import {
  ArrowIcon,
  ArrowUpRightIcon,
  CheckCircleIcon,
  PauseIcon,
  PlayIcon,
  RefreshIcon,
  SlidersIcon,
  SparklesIcon,
  WaveformIcon,
} from "../icons";
import type { CurrentUser, LandingTrack } from "../types";

type Props = {
  currentTrack: LandingTrack | null;
  playing: boolean;
  onPlayTrack: (track: LandingTrack, contextQueue?: LandingTrack[], contextTitle?: string) => void;
  onNavigate: (route: string) => void;
  currentUser?: CurrentUser | null;
  favoriteIds?: number[];
  onToggleFavorite?: (trackId: number) => Promise<void>;
  onAddToPlaylist?: (trackId: number) => void;
  syncExploreQueue?: (tracks: LandingTrack[]) => void;
};

const MOOD_CHIPS = [
  { id: "all", label: "All", genre: "" },
  { id: "vpop", label: "V-Pop", genre: "pop" },
  { id: "acoustic", label: "Acoustic Chill", genre: "acoustic" },
  { id: "indie", label: "Indie Vietnam", genre: "indie" },
  { id: "lofi", label: "Lofi Sunset", genre: "lofi" },
  { id: "workout", label: "Workout", genre: "edm" },
  { id: "focus", label: "Deep Focus", genre: "classical" },
];

const FALLBACK_BEACH_COVER =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80";

const getInitialRecommendedTracks = (): LandingTrack[] => {
  try {
    const raw = localStorage.getItem("soundwave_cached_explore_queue");
    if (raw) {
      const parsed = JSON.parse(raw) as LandingTrack[];
      if (
        Array.isArray(parsed) &&
        parsed.length > 0 &&
        parsed[0]?.title !== "Nơi Này Có Anh" &&
        parsed[0]?.slug !== "noi-nay-co-anh"
      ) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return fallbackTracks.slice(0, 10);
};

export function ExplorePage({
  currentTrack,
  playing,
  onPlayTrack,
  onNavigate,
  currentUser,
  favoriteIds = [],
  onToggleFavorite,
  onAddToPlaylist,
  syncExploreQueue,
}: Props) {
  const [recommendedTracks, setRecommendedTracks] = useState<LandingTrack[]>(getInitialRecommendedTracks);
  const [tracksLoading, setTracksLoading] = useState(() => {
    try {
      const raw = localStorage.getItem("soundwave_cached_explore_queue");
      if (raw) {
        const parsed = JSON.parse(raw) as LandingTrack[];
        if (
          Array.isArray(parsed) &&
          parsed.length > 0 &&
          parsed[0]?.title !== "Nơi Này Có Anh" &&
          parsed[0]?.slug !== "noi-nay-co-anh"
        ) {
          return false;
        }
      }
    } catch {
      // ignore
    }
    return true;
  });
  const [tracksError, setTracksError] = useState("");
  const [selectedChip, setSelectedChip] = useState("all");

  const heroTrack =
    recommendedTracks.find(
      (t) => t.id === 24 || t.slug?.includes("where-have-you-been") || t.title.toLowerCase().includes("where have you been")
    ) ??
    recommendedTracks[0] ??
    fallbackTracks[0] ??
    null;
  const heroPlaying = Boolean(heroTrack && currentTrack?.id === heroTrack.id && playing);

  // [FEATURE]: UC-06 View Recommended Song - Tải danh sách bài hát gợi ý theo sở thích và thể loại
  const loadExploreTracks = useCallback(async () => {
    try {
      setTracksLoading(true);
      setTracksError("");
      const recommendedRes = await catalogApi.getCuratedRecommendations(10);
      if (recommendedRes && recommendedRes.length > 0) {
        // Ưu tiên "Where Have You Been" (bài hát nổi bật trên radar) ở đầu danh sách nếu có
        const targetTrack = recommendedRes.find(
          (t) => t.id === 24 || t.slug?.includes("where-have-you-been") || t.title.toLowerCase().includes("where have you been")
        );
        let ordered = recommendedRes;
        if (targetTrack && recommendedRes[0]?.id !== targetTrack.id) {
          ordered = [targetTrack, ...recommendedRes.filter((t) => t.id !== targetTrack.id)];
        }
        setRecommendedTracks(ordered);
        syncExploreQueue?.(ordered);
        try {
          localStorage.setItem("soundwave_cached_explore_queue", JSON.stringify(ordered));
          localStorage.setItem("soundwave_cached_explore_track", JSON.stringify(ordered[0]));
        } catch {
          // ignore
        }
      } else {
        setRecommendedTracks(fallbackTracks.slice(0, 10));
        syncExploreQueue?.(fallbackTracks.slice(0, 10));
      }
    } catch (err: unknown) {
      console.warn("Using curated fallback tracks for explore feed:", err);
      if (fallbackTracks && fallbackTracks.length > 0) {
        setRecommendedTracks(fallbackTracks.slice(0, 10));
        syncExploreQueue?.(fallbackTracks.slice(0, 10));
      } else {
        setTracksError("Unable to load recommendations at this time");
      }
    } finally {
      setTracksLoading(false);
    }
  }, [syncExploreQueue]);

  useEffect(() => {
    void loadExploreTracks();
  }, [loadExploreTracks]);

  const handleSelectChip = async (chipId: string, genre: string) => {
    setSelectedChip(chipId);
    setTracksLoading(true);
    setTracksError("");
    try {
      if (chipId === "all" || !genre) {
        const res = await catalogApi.getCuratedRecommendations(10);
        if (res && res.length > 0) {
          const targetTrack = res.find(
            (t) => t.id === 24 || t.slug?.includes("where-have-you-been") || t.title.toLowerCase().includes("where have you been")
          );
          let ordered = res;
          if (targetTrack && res[0]?.id !== targetTrack.id) {
            ordered = [targetTrack, ...res.filter((t) => t.id !== targetTrack.id)];
          }
          setRecommendedTracks(ordered);
          syncExploreQueue?.(ordered);
        } else {
          setRecommendedTracks(fallbackTracks.slice(0, 10));
        }
      } else {
        const res = await catalogApi.getTracks({ genre, size: 10 });
        if (res?.content && res.content.length > 0) {
          setRecommendedTracks(res.content);
        } else {
          const filtered = fallbackTracks.filter((t) => t.genreSlug?.toLowerCase() === genre.toLowerCase());
          setRecommendedTracks(filtered.length > 0 ? filtered : fallbackTracks.slice(0, 10));
        }
      }
    } catch {
      const filtered = genre ? fallbackTracks.filter((t) => t.genreSlug?.toLowerCase() === genre.toLowerCase()) : fallbackTracks;
      setRecommendedTracks(filtered.length > 0 ? filtered : fallbackTracks.slice(0, 10));
    } finally {
      setTracksLoading(false);
    }
  };

  const renderTrackState = (emptyMessage: string) => (
    <div className={`explore-track-state ${tracksError ? "is-error" : ""}`} role={tracksError ? "alert" : "status"}>
      <strong>{tracksError ? "Unable to load music" : "No published tracks yet"}</strong>
      <span>{tracksError || emptyMessage}</span>
      {tracksError ? (
        <button className="button button-secondary button-small" onClick={() => void loadExploreTracks()}>
          <RefreshIcon width={14} height={14} style={{ marginRight: "4px" }} /> Try again
        </button>
      ) : null}
    </div>
  );

  return (
    <div className="discover-page">
      {/* 2. Hero Spotlight Banner */}
      <section className="discover-hero" aria-labelledby="discover-title">
        <div className="discover-hero-copy">
          <div className="discover-kicker">
            <SparklesIcon width={14} height={14} className="discover-sparkle-icon" />
            <span>DISCOVER SOMETHING NEW</span>
          </div>

          <h2 id="discover-title" className="discover-hero-heading">
            Music for the rhythm<br />
            <span>of your life</span>
          </h2>

          <p className="discover-hero-desc">
            From quiet mornings to golden-hour escapes. Dive into a new wave of Vietnamese indie, made
            by voices worth knowing.
          </p>

          <div className="discover-hero-actions">
            <button
              className="discover-btn-listen"
              onClick={() => {
                if (heroTrack) {
                  onPlayTrack(heroTrack, recommendedTracks, "Explore Recommended");
                }
              }}
              disabled={!heroTrack}
              title={heroTrack ? `Play ${heroTrack.title}` : "Play music"}
            >
              {heroPlaying ? <PauseIcon width={16} height={16} /> : <PlayIcon width={16} height={16} />}
              <span>{heroPlaying ? "Pause" : "Listen Now"}</span>
            </button>

            <button
              className="discover-btn-explore"
              onClick={() => document.getElementById("recommended")?.scrollIntoView({ behavior: "smooth" })}
            >
              <span>Explore Picks</span>
              <ArrowUpRightIcon width={15} height={15} />
            </button>
          </div>
        </div>

        {/* Right Feature Card with Angled Backdrop */}
        <div className="discover-feature-wrapper">
          <div className="discover-feature-backdrop" />
          {tracksLoading && !heroTrack ? (
            <div className="discover-feature-card discover-feature-card--skeleton">
              <span className="skeleton" style={{ width: "100%", height: "100%", display: "block" }} />
            </div>
          ) : heroTrack ? (
            <div
              className="discover-feature-card"
              onClick={() => {
                onPlayTrack(heroTrack, recommendedTracks, "Explore Recommended");
              }}
              title={`Play ${heroTrack.title}`}
            >
              <img
                src={heroTrack.coverUrl || FALLBACK_BEACH_COVER}
                alt={heroTrack.title}
                className="discover-feature-card-img"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = FALLBACK_BEACH_COVER;
                }}
              />

              {/* Radar Badge */}
              <div className="discover-feature-radar-badge">
                <WaveformIcon width={12} height={12} />
                <span>ON OUR RADAR</span>
              </div>

              {/* Bottom Metadata Overlay */}
              <div className="discover-feature-card-bottom">
                <div className="discover-feature-card-meta">
                  <strong className="discover-feature-track-name">{heroTrack.title}</strong>
                  <div className="discover-feature-artist-line">
                    <span>{heroTrack.creator?.displayName ?? "Mây Lang"}</span>
                    <CheckCircleIcon width={13} height={13} className="discover-verified-icon" />
                    <span className="discover-genre-bullet">
                      · {heroTrack.genreName || heroTrack.album?.title || "Indie folk"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="discover-feature-play-circle"
                  aria-label={heroPlaying ? "Pause" : "Play"}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlayTrack(heroTrack, recommendedTracks, "Explore Recommended");
                  }}
                >
                  {heroPlaying ? <PauseIcon width={15} height={15} /> : <PlayIcon width={15} height={15} />}
                </button>
              </div>
            </div>
          ) : (
            <div className="discover-feature-card" style={{ display: "grid", placeItems: "center", background: "#f8fafc" }}>
              <span style={{ color: "#64748b", fontSize: "13px", fontWeight: 600 }}>New music coming soon</span>
            </div>
          )}
        </div>
      </section>

      {/* 3. Mood Chips Bar */}
      <div className="explore-chips-bar">
        <div className="explore-chips-list">
          {MOOD_CHIPS.map((chip) => {
            const isActive = selectedChip === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                className={`explore-chip ${isActive ? "is-active" : ""}`}
                onClick={() => void handleSelectChip(chip.id, chip.genre)}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className="explore-chips-filter-btn"
          title="Browse All Genres"
          aria-label="Browse All Genres"
          onClick={() => onNavigate("/genres")}
        >
          <SlidersIcon width={16} height={16} />
        </button>
      </div>

      {/* 4. Section: Recommended for You */}
      <section className="sw-section" id="recommended">
        <div className="explore-section-header">
          <div>
            <h3 className="explore-section-title">Recommended for You</h3>
            <p className="explore-section-subtitle">A little familiar. A little unexpected. All you.</p>
          </div>
          <button
            type="button"
            className="explore-refresh-mix-btn"
            onClick={() => void loadExploreTracks()}
            title="Refresh recommendations"
          >
            <span>Refresh mix</span>
            <ArrowIcon width={14} height={14} />
          </button>
        </div>

        {tracksLoading ? (
          <div className="sw-track-grid" aria-busy="true" aria-label="Loading recommended tracks">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
              <div className="explore-track-skeleton" key={item}>
                <span className="skeleton" />
                <i className="skeleton" />
                <i className="skeleton" />
              </div>
            ))}
          </div>
        ) : tracksError ? (
          <div
            className="explore-track-state is-error"
            role="alert"
            style={{
              padding: "36px 20px",
              textAlign: "center",
              background: "#FFF1F2",
              border: "1px solid #FECDD3",
              borderRadius: "16px",
            }}
          >
            <div style={{ color: "#E11D48", fontWeight: 700, fontSize: "16px", marginBottom: "6px" }}>
              Unable to load recommendations at this time
            </div>
            <p
              style={{
                color: "#64748B",
                fontSize: "13px",
                marginBottom: "16px",
                maxWidth: "420px",
                margin: "0 auto 16px",
              }}
            >
              We encountered an issue while loading music recommendations. Please try again.
            </p>
            <button
              type="button"
              className="button button-primary button-small"
              onClick={() => void loadExploreTracks()}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", margin: "0 auto" }}
            >
              <RefreshIcon width={14} height={14} />
              <span>Retry</span>
            </button>
          </div>
        ) : recommendedTracks.length > 0 ? (
          <div className="sw-track-grid">
            {recommendedTracks.map((track) => (
              <TrackCard
                key={`rec-${track.id}`}
                track={track}
                active={currentTrack?.id === track.id}
                playing={currentTrack?.id === track.id && playing}
                onPlay={(t) => onPlayTrack(t, recommendedTracks, "Recommended Tracks")}
                onNavigate={onNavigate}
                canManageLibrary={currentUser?.role === "LISTENER"}
                isFavorited={favoriteIds.includes(track.id)}
                onToggleFavorite={onToggleFavorite}
                onAddToPlaylist={onAddToPlaylist}
              />
            ))}
          </div>
        ) : (
          renderTrackState("No tracks available in this section yet")
        )}
      </section>
    </div>
  );
}
