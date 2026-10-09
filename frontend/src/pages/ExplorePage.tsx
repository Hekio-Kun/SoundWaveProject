import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { albums, featuredCreators, genres as initialGenres } from "../data";
import { catalogApi } from "../api/catalog";
import { AlbumCard, CreatorCard, SectionHeader, TrackCard } from "../components/MusicCards";
import { ArrowIcon, PauseIcon, PlayIcon } from "../icons";
import type { Genre, LandingTrack } from "../types";

type Props = {
  currentTrack: LandingTrack | null;
  playing: boolean;
  onPlayTrack: (track: LandingTrack, contextQueue?: LandingTrack[], contextTitle?: string) => void;
  onNavigate: (route: string) => void;
};

const formatDuration = (ms: number) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export function ExplorePage({ currentTrack, playing, onPlayTrack, onNavigate }: Props) {
  const [genresList, setGenresList] = useState<Genre[]>(initialGenres);
  const [trendingTracks, setTrendingTracks] = useState<LandingTrack[]>([]);
  const [newReleaseTracks, setNewReleaseTracks] = useState<LandingTrack[]>([]);
  const [catalogTrackCount, setCatalogTrackCount] = useState(0);
  const [tracksLoading, setTracksLoading] = useState(true);
  const [tracksError, setTracksError] = useState("");
  const heroTrack = trendingTracks[0] ?? newReleaseTracks[0] ?? null;
  const heroPlaying = Boolean(heroTrack && currentTrack?.id === heroTrack.id && playing);

  const loadExploreTracks = useCallback(async () => {
    try {
      const [trendingResponse, newestResponse] = await Promise.all([
        catalogApi.getTracks({ sort: "trending", page: 0, size: 5 }),
        catalogApi.getTracks({ sort: "newest", page: 0, size: 6 }),
      ]);
      if (trendingResponse?.content && trendingResponse.content.length > 0) {
        setTrendingTracks(trendingResponse.content);
      }
      if (newestResponse?.content && newestResponse.content.length > 0) {
        setNewReleaseTracks(newestResponse.content);
      }
      if (newestResponse?.totalElements) {
        setCatalogTrackCount(newestResponse.totalElements);
      }
    } catch {
      // Backend catalog API offline or unavailable: gracefully keep curated project tracks
    } finally {
      setTracksLoading(false);
    }
  }, []);

  useEffect(() => {
    catalogApi.getGenres()
      .then((data) => {
        if (data && data.length > 0) setGenresList(data);
      })
      .catch(() => {});
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
          Try again
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
                  onPlayTrack(heroTrack, trendingTracks.length > 0 ? trendingTracks : [heroTrack], "Explore Recommended");
                }
              }}
              disabled={!heroTrack}
            >
              {heroPlaying ? <PauseIcon /> : <PlayIcon />} {tracksLoading ? "Loading music..." : heroPlaying ? "Pause" : "Listen now"}
            </button>
            <button className="button button-secondary button-large" onClick={() => document.getElementById("trending")?.scrollIntoView({ behavior: "smooth" })}>
              View trending <ArrowIcon width={17} height={17} />
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
                onPlayTrack(heroTrack, trendingTracks.length > 0 ? trendingTracks : [heroTrack], "Explore Recommended");
              }
            }}
            aria-label={`${heroPlaying ? "Pause" : "Play"} ${heroTrack.title}`}
          >
            <span className="discover-feature-art"><img src={heroTrack.coverUrl ?? undefined} alt="" /></span>
            <span className="discover-feature-info">
              <small>RECOMMENDED SONG</small>
              <strong>{heroTrack.title}</strong>
              <em>{heroTrack.creator?.displayName ?? "Unknown Artist"}{heroTrack.album?.title ? ` · ${heroTrack.album.title}` : ""}</em>
            </span>
            <span className="discover-feature-play">{heroPlaying ? <PauseIcon /> : <PlayIcon />}</span>
          </button>
        ) : (
          <div className="discover-feature discover-feature--state">
            <span>{tracksError ? "Catalog unavailable" : "New music is coming soon"}</span>
          </div>
        )}
      </section>

      <section className="sw-section" id="trending">
        <SectionHeader title="Trending tracks" description="The most-played tracks in the SoundWave community this week" actionLabel="View all" onAction={() => onNavigate("/browse?sort=trending")} />
        {tracksLoading ? (
          <div className="sw-track-grid" aria-busy="true" aria-label="Loading trending tracks">
            {[1, 2, 3, 4, 5].map((item) => <div className="explore-track-skeleton" key={item}><span className="skeleton" /><i className="skeleton" /><i className="skeleton" /></div>)}
          </div>
        ) : trendingTracks.length > 0 ? (
          <div className="sw-track-grid">
            {trendingTracks.map((track, index) => (
              <TrackCard
                key={track.id}
                track={track}
                rank={index + 1}
                active={currentTrack?.id === track.id}
                playing={currentTrack?.id === track.id && playing}
                onPlay={(t) => onPlayTrack(t, trendingTracks, "Trending Tracks")}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        ) : renderTrackState("Approved tracks will appear here after staff publishes them.")}
      </section>

      <section className="sw-section sw-section--split">
        <div className="sw-release-panel">
          <SectionHeader title="New releases" description="Recently published on SoundWave" />
          {tracksLoading ? (
            <div className="explore-release-skeletons" aria-busy="true" aria-label="Loading new releases">
              {[1, 2, 3, 4, 5].map((item) => <span className="skeleton" key={item} />)}
            </div>
          ) : newReleaseTracks.length > 0 ? (
            <div className="sw-release-list">
              {newReleaseTracks.slice(0, 5).map((track, index) => {
                const isThisTrack = currentTrack?.id === track.id;
                const isThisPlaying = isThisTrack && playing;
                return (
                  <button
                    key={track.id}
                    className={`sw-release-row ${isThisTrack ? "is-active" : ""}`}
                    onClick={() => onPlayTrack(track, newReleaseTracks, "New Releases")}
                  >
                    <span className="sw-release-index">{String(index + 1).padStart(2, "0")}</span>
                    <img src={track.coverUrl ?? undefined} alt="" />
                    <span className="sw-release-copy">
                      <strong>{track.title}</strong>
                      <small>{track.creator?.displayName ?? "Unknown Artist"} · {track.genreName || track.genreSlug}</small>
                    </span>
                    <span className="sw-release-duration">{formatDuration(track.durationMs)}</span>
                    <span className="sw-release-icon">
                      {isThisPlaying ? <PauseIcon width={15} height={15} /> : <PlayIcon width={15} height={15} />}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : renderTrackState("Recently published tracks will appear here.")}
        </div>
        <div className="sw-genre-panel">
          <SectionHeader title="Genres" description="Choose music that matches your mood" actionLabel="View all" onAction={() => onNavigate("/genres")} />
          <div className="sw-genre-grid">
            {genresList.slice(0, 6).map((genre) => (
              <button key={genre.id} style={{ "--genre-color": genre.color, "--genre-accent": genre.accent } as CSSProperties} onClick={() => onNavigate(`/browse?genre=${genre.slug}`)}>
                <span>{genre.name}</span><small>{genre.description}</small><ArrowIcon width={16} height={16} />
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="sw-section">
        <SectionHeader title="Featured albums" description="Complete stories told through every album" actionLabel="Open library" onAction={() => onNavigate("/library")} />
        <div className="sw-album-grid">{albums.map((album) => <AlbumCard key={album.id} album={album} onNavigate={onNavigate} />)}</div>
      </section>

      <section className="sw-section">
        <SectionHeader title="Featured creators" description="Follow the creators shaping today's favorite sounds" />
        <div className="sw-creator-grid">{featuredCreators.map((creator) => <CreatorCard key={creator.userId} creator={creator} onNavigate={onNavigate} />)}</div>
      </section>
    </div>
  );
}
