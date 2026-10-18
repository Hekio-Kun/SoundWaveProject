import { useEffect, useState } from "react";
import { catalogApi } from "../api/catalog";
import { albums as mockAlbums, tracks as mockTracks } from "../data";
import { DiscIcon, HeadphonesIcon, PauseIcon, PlayIcon } from "../icons";
import type { LandingTrack, PublicAlbumDetails } from "../types";

type Props = {
  albumId: number;
  currentTrack: LandingTrack | null;
  playing: boolean;
  onPlayTrack: (track: LandingTrack, contextQueue?: LandingTrack[], contextTitle?: string, contextKey?: string) => void;
  onNavigate: (route: string) => void;
};

const formatDuration = (ms: number) => {
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${min}:${sec.toString().padStart(2, "0")}`;
};

export function AlbumDetailsPage({ albumId, currentTrack, playing, onPlayTrack, onNavigate }: Props) {
  const [albumData, setAlbumData] = useState<PublicAlbumDetails | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch real album details from API
  useEffect(() => {
    let active = true;
    setLoading(true);

    catalogApi
      .getAlbumByIdOrSlug(albumId)
      .then((data) => {
        if (!active) return;
        setAlbumData(data);
      })
      .catch((err) => {
        console.warn("Could not fetch album details from API, using fallback:", err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [albumId]);

  // Fallback to mock data if API call returns null
  const fallbackAlbum = mockAlbums.find((a) => a.id === albumId) ?? mockAlbums[0];
  const fallbackTracks = mockTracks.filter((t) => t.album?.id === fallbackAlbum?.id && t.publicationStatus === "APPROVED");

  const title = albumData?.title ?? fallbackAlbum?.title ?? "Album";
  const coverUrl = albumData?.coverUrl ?? fallbackAlbum?.coverUrl;
  const description = albumData?.description ?? fallbackAlbum?.description;
  const creatorName = albumData?.creator?.displayName ?? fallbackAlbum?.creatorName ?? "Creator";
  const releaseYear = albumData?.releaseDate
    ? new Date(albumData.releaseDate).getFullYear()
    : albumData?.createdAt
    ? new Date(albumData.createdAt).getFullYear()
    : fallbackAlbum?.releaseYear ?? 2026;

  const albumTracks: LandingTrack[] = albumData?.tracks && albumData.tracks.length > 0
    ? albumData.tracks
    : fallbackTracks;

  const totalDurationMs = albumTracks.reduce((acc, t) => acc + (t.durationMs || 0), 0);
  const totalMin = Math.round(totalDurationMs / 60000);

  const isAlbumPlaying = Boolean(
    albumTracks.some((t) => t.id === currentTrack?.id) && playing
  );

  return (
    <div className="album-details-page">
      <section className="album-header-banner">
        {coverUrl ? (
          <img src={coverUrl} alt={title} className="album-large-cover" />
        ) : (
          <div
            className="album-large-cover"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #0284c7 0%, #d4a373 100%)",
              color: "#ffffff",
            }}
          >
            <DiscIcon width={64} height={64} />
          </div>
        )}

        <div className="album-header-meta">
          <span className="eyebrow">
            <DiscIcon width={14} height={14} /> PUBLIC ALBUM
          </span>
          <h1 className="album-title">{title}</h1>
          <p className="album-subtitle">
            Creator: <b>{creatorName}</b> · Released: {releaseYear} · {albumTracks.length} tracks ({totalMin} minutes)
          </p>
          {description && <p className="album-desc">{description}</p>}

          <div className="album-actions">
            <button
              className="button button-primary button-large"
              onClick={() =>
                albumTracks.length > 0 &&
                onPlayTrack(
                  albumTracks[0],
                  albumTracks,
                  `Album • ${title}`,
                  `album-${albumId}`
                )
              }
              disabled={albumTracks.length === 0}
            >
              {isAlbumPlaying ? <PauseIcon /> : <PlayIcon />}
              <span>{isAlbumPlaying ? "Playing" : "Play all"}</span>
            </button>
          </div>
        </div>
      </section>

      <section className="album-tracklist-section">
        <h2 className="section-title">Track list</h2>
        {loading ? (
          <div style={{ padding: "20px 0" }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton" style={{ height: "54px", borderRadius: "10px", marginBottom: "8px" }} />
            ))}
          </div>
        ) : albumTracks.length === 0 ? (
          <div style={{ padding: "40px 0", textAlign: "center", color: "var(--sw-text-secondary, #64748b)" }}>
            <p>No tracks currently published in this album.</p>
          </div>
        ) : (
          <div className="album-tracks-table">
            {albumTracks.map((track, idx) => {
              const isCurrent = currentTrack?.id === track.id;
              const isPlayingThis = isCurrent && playing;

              return (
                <div
                  key={track.id}
                  className={`table-track-row ${isCurrent ? "table-track-row--active" : ""}`}
                >
                  <span className="row-index">{String(idx + 1).padStart(2, "0")}</span>

                  <div
                    className="row-thumbnail"
                    onClick={() =>
                      onPlayTrack(
                        track,
                        albumTracks,
                        `Album • ${title}`,
                        `album-${albumId}`
                      )
                    }
                  >
                    <img src={track.coverUrl ?? coverUrl ?? undefined} alt="" />
                    <button
                      className="row-hover-play"
                      aria-label={`Play ${track.title}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlayTrack(
                          track,
                          albumTracks,
                          `Album • ${title}`,
                          `album-${albumId}`
                        );
                      }}
                    >
                      {isPlayingThis ? <PauseIcon width={14} height={14} /> : <PlayIcon width={14} height={14} />}
                    </button>
                  </div>

                  <div className="row-main-info">
                    <a
                      className="row-title"
                      href={`#/track/${track.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigate(`/track/${track.id}`);
                      }}
                    >
                      {track.title}
                    </a>
                    <span className="row-creator">{track.creator?.displayName || creatorName}</span>
                  </div>

                  <span className="row-plays">
                    <HeadphonesIcon width={12} height={12} /> {(track.playCount || 0).toLocaleString()}
                  </span>

                  <span className="row-duration">{formatDuration(track.durationMs || 0)}</span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
