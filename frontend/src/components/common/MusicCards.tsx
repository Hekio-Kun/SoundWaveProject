import type { FeaturedAlbum, FeaturedCreator, LandingTrack } from "../../types";
import { ArrowIcon, HeadphonesIcon, HeartFillIcon, HeartIcon, PauseIcon, PlayIcon, PlusIcon } from "../../icons";

const compactNumber = (value: number) =>
  new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);

const DEFAULT_COVER_FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300' width='300' height='300'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%230284C7'/%3E%3Cstop offset='100%25' stop-color='%230369A1'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='300' height='300' fill='url(%23bg)' rx='12'/%3E%3Ccircle cx='150' cy='150' r='54' fill='none' stroke='rgba(255,255,255,0.2)' stroke-width='4'/%3E%3Cpath d='M140 120v40a16 16 0 1 0 10 14.8V132l24-6v24a16 16 0 1 0 10 14.8V114l-44 6z' fill='%23ffffff'/%3E%3C/svg%3E";

type TrackCardProps = {
  track: LandingTrack;
  active: boolean;
  playing: boolean;
  onPlay: (track: LandingTrack) => void;
  onNavigate: (route: string) => void;
  rank?: number;
  isFavorited?: boolean;
  onToggleFavorite?: (trackId: number) => void;
  onAddToPlaylist?: (trackId: number) => void;
  canManageLibrary?: boolean;
};

export function TrackCard({
  track,
  active,
  playing,
  onPlay,
  onNavigate,
  rank,
  isFavorited = false,
  onToggleFavorite,
  onAddToPlaylist,
  canManageLibrary = false,
}: TrackCardProps) {
  return (
    <article className={`sw-track-card ${active ? "sw-track-card--active" : ""}`} style={{ position: "relative" }}>
      <button
        className="sw-track-cover"
        onClick={() => onPlay(track)}
        aria-label={playing ? `Pause ${track.title}` : `Play ${track.title}`}
      >
        <img
          src={track.coverUrl || DEFAULT_COVER_FALLBACK}
          alt=""
          loading="lazy"
          onError={(e) => {
            // EX02: Fallback cover artwork when CDN fails
            (e.currentTarget as HTMLImageElement).src = DEFAULT_COVER_FALLBACK;
          }}
        />
        {rank ? <span className="sw-track-rank">#{rank}</span> : null}
        <span className="sw-track-play">
          {playing ? <PauseIcon width={19} height={19} /> : <PlayIcon width={19} height={19} />}
        </span>
        {playing ? (
          <span className="sw-playing-bars" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        ) : null}
      </button>

      {/* AF02: Authenticated Listener Interactions (Favorite bookmark & Add to playlist) */}
      {canManageLibrary && (
        <div
          className="sw-track-card-actions"
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            display: "flex",
            gap: "4px",
            zIndex: 3,
            background: "rgba(15, 23, 42, 0.7)",
            backdropFilter: "blur(4px)",
            padding: "3px 6px",
            borderRadius: "16px",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {onToggleFavorite && (
            <button
              type="button"
              onClick={() => onToggleFavorite(track.id)}
              title={isFavorited ? "Remove from favorites" : "Save to favorites"}
              aria-label={isFavorited ? "Remove from favorites" : "Save to favorites"}
              style={{
                background: "none",
                border: "none",
                padding: "2px",
                cursor: "pointer",
                color: isFavorited ? "#F43F5E" : "#FFFFFF",
                display: "grid",
                placeItems: "center",
                transition: "transform 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.15)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              {isFavorited ? <HeartFillIcon width={15} height={15} /> : <HeartIcon width={15} height={15} />}
            </button>
          )}

          {onAddToPlaylist && (
            <button
              type="button"
              onClick={() => onAddToPlaylist(track.id)}
              title="Add to playlist"
              aria-label="Add to playlist"
              style={{
                background: "none",
                border: "none",
                padding: "2px",
                cursor: "pointer",
                color: "#FFFFFF",
                display: "grid",
                placeItems: "center",
                transition: "transform 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.15)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <PlusIcon width={15} height={15} />
            </button>
          )}
        </div>
      )}

      <div className="sw-card-copy">
        <a
          href={`#/track/${track.id}`}
          className="sw-card-title"
          onClick={(event) => {
            event.preventDefault();
            onNavigate(`/track/${track.id}`);
          }}
        >
          {track.title}
        </a>
        <a
          href={`#/creator/${track.creator.userId}`}
          className="sw-card-subtitle"
          onClick={(event) => {
            event.preventDefault();
            onNavigate(`/creator/${track.creator.userId}`);
          }}
        >
          {track.creator.displayName}
        </a>
        <span className="sw-card-meta">
          <HeadphonesIcon width={13} height={13} /> {compactNumber(track.playCount)} plays
        </span>
      </div>
    </article>
  );
}

export function AlbumCard({ album, onNavigate }: { album: FeaturedAlbum; onNavigate: (route: string) => void }) {
  return (
    <article className="sw-album-card">
      <button className="sw-album-art" onClick={() => onNavigate(`/album/${album.id}`)} aria-label={`Open album ${album.title}`}>
        <img src={album.coverUrl} alt="" loading="lazy" />
        <span className="sw-track-play"><PlayIcon width={19} height={19} /></span>
      </button>
      <a href={`#/album/${album.id}`} className="sw-card-title" onClick={(event) => { event.preventDefault(); onNavigate(`/album/${album.id}`); }}>{album.title}</a>
      <span className="sw-card-subtitle">{album.creatorName} · {album.releaseYear}</span>
    </article>
  );
}

export function CreatorCard({ creator, onNavigate }: { creator: FeaturedCreator; onNavigate: (route: string) => void }) {
  return (
    <article className="sw-creator-card">
      <button className="sw-creator-avatar" onClick={() => onNavigate(`/creator/${creator.userId}`)} aria-label={`Open ${creator.displayName}'s profile`}><img src={creator.avatarUrl} alt="" loading="lazy" /></button>
      <div>
        <a href={`#/creator/${creator.userId}`} className="sw-card-title" onClick={(event) => { event.preventDefault(); onNavigate(`/creator/${creator.userId}`); }}>{creator.displayName}</a>
        <p>{creator.bio}</p>
        <span>{creator.publishedTracks} tracks · {compactNumber(creator.followersCount ?? 0)} followers</span>
      </div>
      <button className="sw-follow-button" onClick={() => onNavigate(`/creator/${creator.userId}`)}>View profile</button>
    </article>
  );
}

export function SectionHeader({ title, description, actionLabel, onAction }: { title: string; description?: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <div className="sw-section-heading">
      <div><h2>{title}</h2>{description ? <p>{description}</p> : null}</div>
      {actionLabel && onAction ? <button onClick={onAction}>{actionLabel}<ArrowIcon width={16} height={16} /></button> : null}
    </div>
  );
}
