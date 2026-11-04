import { useCallback, useEffect, useState } from "react";
import { catalogApi } from "../api/catalog";
import { SectionHeader, TrackCard } from "../components/common/MusicCards";
import { ArrowIcon, PauseIcon, PlayIcon, RefreshIcon } from "../icons";
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
}: Props) {
  const [recommendedTracks, setRecommendedTracks] = useState<LandingTrack[]>([]);
  const [catalogTrackCount, setCatalogTrackCount] = useState(0);
  const [tracksLoading, setTracksLoading] = useState(true);
  const [tracksError, setTracksError] = useState("");

  const heroTrack = recommendedTracks[0] ?? null;
  const heroPlaying = Boolean(heroTrack && currentTrack?.id === heroTrack.id && playing);

  // [FEATURE]: UC-06 View Recommended Song - Tải danh sách bài hát gợi ý theo thể loại phổ biến và sở thích cá nhân
  const loadExploreTracks = useCallback(async () => {
    try {
      setTracksLoading(true);
      setTracksError("");
      const [recommendedRes, catalogRes] = await Promise.all([
        catalogApi.getCuratedRecommendations(10),
        catalogApi.getTracks({ size: 1 }),
      ]);

      if (recommendedRes && recommendedRes.length > 0) {
        setRecommendedTracks(recommendedRes);
      }
      if (catalogRes?.totalElements) {
        setCatalogTrackCount(catalogRes.totalElements);
      }
    } catch (err: unknown) {
      console.error("Failed to load explore recommendations:", err);
      // EX01: Catalog retrieval failure - hiển thị thông báo lỗi thân thiện kèm nút Retry
      setTracksError("Unable to load recommendations at this time");
    } finally {
      setTracksLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadExploreTracks();
  }, [loadExploreTracks]);

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
      <section className="discover-hero" aria-labelledby="discover-title">
        <div className="discover-hero-copy">
          <span className="discover-kicker"><i /> DISCOVER SOMETHING NEW EVERY DAY</span>
          <h1 id="discover-title">Music for<br /><span>the rhythm of your life.</span></h1>
          <p>Find new tracks, follow Vietnamese creators, and save music for every moment.</p>
          <div className="discover-hero-actions">
            <button
              className="button button-primary button-large"
              onClick={() => {
                if (heroTrack) {
                  onPlayTrack(
                    heroTrack,
                    recommendedTracks,
                    "Explore Recommended"
                  );
                }
              }}
              disabled={!heroTrack}
            >
              {heroPlaying ? <PauseIcon /> : <PlayIcon />} {tracksLoading ? "Loading music..." : heroPlaying ? "Pause" : "Listen now"}
            </button>
            <button
              className="button button-secondary button-large"
              onClick={() => document.getElementById("recommended")?.scrollIntoView({ behavior: "smooth" })}
            >
              Explore picks <ArrowIcon width={17} height={17} />
            </button>
          </div>
          <div className="discover-proof">
            <span><b>1.2K+</b><small>Vietnamese creators</small></span>
            <span><b>{tracksLoading ? "--" : catalogTrackCount}</b><small>published tracks</small></span>
            <span><b>Every day</b><small>new music added</small></span>
          </div>
        </div>
        {tracksLoading ? (
          <div className="discover-feature discover-feature--skeleton" aria-hidden="true">
            <span className="discover-feature-art skeleton" />
            <span className="discover-feature-skeleton-copy"><i className="skeleton" /><i className="skeleton" /><i className="skeleton" /></span>
          </div>
        ) : heroTrack ? (
          <button
            className="discover-feature"
            onClick={() => {
              if (heroTrack) {
                onPlayTrack(
                  heroTrack,
                  recommendedTracks,
                  "Explore Recommended"
                );
              }
            }}
            aria-label={`${heroPlaying ? "Pause" : "Play"} ${heroTrack.title}`}
          >
            <span className="discover-feature-art"><img src={heroTrack.coverUrl ?? undefined} alt="" /></span>
            <span className="discover-feature-info">
              <small>RECOMMENDED SONG</small>
              <strong>{heroTrack.title}</strong>
              <em>{heroTrack.creator?.displayName ?? "Unknown Creator"}{heroTrack.album?.title ? ` · ${heroTrack.album.title}` : ""}</em>
            </span>
            <span className="discover-feature-play">{heroPlaying ? <PauseIcon /> : <PlayIcon />}</span>
          </button>
        ) : (
          <div className="discover-feature discover-feature--state">
            <span>{tracksError ? "Catalog unavailable" : "New music is coming soon"}</span>
          </div>
        )}
      </section>

      {/* UC-06: View Recommended Song - Section: Recommended Tracks */}
      <section className="sw-section" id="recommended">
        <SectionHeader
          title="Recommended for you"
          description="Algorithmic selections based on popular genres and your listening tastes"
        />
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
          /* EX01: Catalog retrieval failure with Retry button */
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
            <p style={{ color: "#64748B", fontSize: "13px", marginBottom: "16px", maxWidth: "420px", margin: "0 auto 16px" }}>
              We encountered a connection issue while loading music recommendations. Please try again.
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
          /* AF01: Empty recommendation section */
          renderTrackState("No tracks available in this section yet")
        )}
      </section>
    </div>
  );
}
