import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { catalogApi } from "../api/catalog";
import { lyricsApi } from "../api/lyrics";
import { SectionHeader, TrackCard } from "../components/common/MusicCards";
import { covers } from "../data";
import { useModalScrollLock } from "../hooks/useModalScrollLock";
import { CheckIcon, FileTextIcon, HeadphonesIcon, HeartFillIcon, HeartIcon, PauseIcon, PlayIcon, PlusIcon, UserIcon } from "../icons";
import type { LandingTrack, Playlist, TrackLyricsBundle } from "../types";

type Props = {
  trackId: number;
  currentTrack: LandingTrack | null;
  playing: boolean;
  onPlayTrack: (track: LandingTrack, contextQueue?: LandingTrack[], contextTitle?: string) => void;
  onNavigate: (route: string) => void;
  onToggleFavorite: (trackId: number) => Promise<void>;
  isFavorited: boolean;
  playlists: Playlist[];
  onAddToPlaylist: (playlistId: number, trackId: number) => Promise<void>;
  canManageLibrary: boolean;
};

const formatPlays = (value: number) =>
  new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);

const formatDuration = (ms: number) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const formatReleaseDate = (value?: string) => {
  if (!value) return "Not specified";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not specified"
    : new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
};

export function TrackDetailsPage({
  trackId,
  currentTrack,
  playing,
  onPlayTrack,
  onNavigate,
  onToggleFavorite,
  isFavorited,
  playlists,
  onAddToPlaylist,
  canManageLibrary,
}: Props) {
  const [track, setTrack] = useState<LandingTrack | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<LandingTrack[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(true);
  const [recommendationsError, setRecommendationsError] = useState(false);
  const [playlistModalOpen, setPlaylistModalOpen] = useState(false);
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const [submittingAction, setSubmittingAction] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [lyricsBundle, setLyricsBundle] = useState<TrackLyricsBundle | null>(null);
  const [selectedLyricSource, setSelectedLyricSource] = useState<"OFFICIAL" | "CUSTOM">("OFFICIAL");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setTrack(null);
    setLyricsBundle(null);
    setSelectedLyricSource("OFFICIAL");

    void catalogApi.getTrackById(trackId)
      .then((item) => { if (active) setTrack(item); })
      .catch(() => { if (active) setError("Track not found or unavailable."); })
      .finally(() => { if (active) setLoading(false); });

    void lyricsApi.getTrackLyrics(trackId)
      .then((bundle) => { if (active) setLyricsBundle(bundle); })
      .catch(() => {});

    return () => { active = false; };
  }, [trackId]);

  useEffect(() => {
    let active = true;
    setRecommendations([]);
    setRecommendationsLoading(true);
    setRecommendationsError(false);
    void catalogApi.getRecommendations(trackId, 5)
      .then((items) => { if (active) setRecommendations(items); })
      .catch(() => { if (active) setRecommendationsError(true); })
      .finally(() => { if (active) setRecommendationsLoading(false); });
    return () => { active = false; };
  }, [trackId]);

  const anyModalOpen = playlistModalOpen || authPromptOpen;
  useModalScrollLock(anyModalOpen);

  const goToCreatorProfile = (targetCreatorId?: number) => {
    if (!targetCreatorId) return;
    if (track?.creator) {
      try {
        sessionStorage.setItem(`creator_profile_${targetCreatorId}`, JSON.stringify(track.creator));
      } catch {}
    }
    onNavigate(`/creator/${targetCreatorId}`);
  };

  useEffect(() => {
    if (!anyModalOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPlaylistModalOpen(false);
        setAuthPromptOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [anyModalOpen]);

  const requestLibraryAccess = (action: () => void) => {
    setActionError(null);
    setActionMessage(null);
    if (!canManageLibrary) {
      setAuthPromptOpen(true);
      return;
    }
    action();
  };

  const handleFavorite = async () => {
    setSubmittingAction(true);
    setActionError(null);
    setActionMessage(null);
    try {
      await onToggleFavorite(trackId);
      setActionMessage(isFavorited ? "Removed from your favorites." : "Added to your favorites.");
    } catch {
      setActionError("Unable to update favorites. Please try again.");
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleAddToPlaylist = async (playlistId: number) => {
    setSubmittingAction(true);
    setActionError(null);
    try {
      await onAddToPlaylist(playlistId, trackId);
      setPlaylistModalOpen(false);
      setActionMessage("Track added to your playlist.");
    } catch {
      setActionError("Unable to add this track. It may already be in the selected playlist.");
    } finally {
      setSubmittingAction(false);
    }
  };

  if (loading) {
    return <div className="track-details-state" role="status"><span className="track-details-spinner" aria-hidden="true" /><p>Loading track details...</p></div>;
  }

  if (!track || error) {
    return (
      <div className="track-details-state">
        <h1>Track not found</h1>
        <p>The track does not exist, is not published, or has been removed.</p>
        <button className="button button-primary" onClick={() => onNavigate("/")}>Back to Explore</button>
      </div>
    );
  }

  const isPlayingThis = currentTrack?.id === track.id && playing;
  const creatorId = track.creator?.userId;
  const genreLabel = track.genreName ?? track.genreSlug ?? "Uncategorized";
  const publicationLabel = track.publicationStatus === "PUBLISHED" ? "Published" : track.publicationStatus ?? "Published";

  return (
    <div className="track-page-v2">
      <nav className="track-breadcrumb" aria-label="Breadcrumb">
        <button onClick={() => onNavigate("/")}>Explore</button><span>/</span>
        <button onClick={() => goToCreatorProfile(creatorId)}>{track.creator?.displayName ?? "Unknown Creator"}</button>
        <span>/</span><b>{track.title}</b>
      </nav>

      <section className="track-showcase">
        <div className="track-showcase-glow" style={{ backgroundImage: `url(${track.coverUrl ?? covers.dawn})` }} aria-hidden="true" />
        <div className="track-showcase-visual">
          <button className="track-cover-button" onClick={() => onPlayTrack(track)} aria-label={isPlayingThis ? `Pause ${track.title}` : `Play ${track.title}`}>
            <img src={track.coverUrl ?? covers.dawn} alt={`Cover for ${track.title}`} onError={(event) => { event.currentTarget.src = covers.dawn; }} />
            <span>{isPlayingThis ? <PauseIcon width={28} height={28} /> : <PlayIcon width={28} height={28} />}</span>
          </button>
        </div>

        <div className="track-showcase-content">
          <div className="track-labels"><span>TRACK</span><span>{genreLabel}</span><span className="is-approved"><CheckIcon width={12} height={12} /> {publicationLabel}</span></div>
          <h1>{track.title}</h1>
          <p className="track-intro">{track.description?.trim() || "No description has been provided for this track."}</p>
          <button className="track-creator-chip" onClick={() => goToCreatorProfile(creatorId)}>
            {track.creator?.avatarUrl ? <img src={track.creator.avatarUrl} alt="" /> : <span className="track-avatar-fallback" aria-hidden="true"><UserIcon width={18} height={18} /></span>}
            <span><small>Uploaded by</small><strong>{track.creator?.displayName ?? "Unknown Creator"}</strong></span>
          </button>
          <div className="track-stat-row">
            <span><HeadphonesIcon width={16} height={16} /><b>{formatPlays(track.playCount)}</b><small>plays</small></span><i />
            <span><b>{formatDuration(track.durationMs)}</b><small>duration</small></span><i />
            <span><b>{track.album?.title ?? "Single"}</b><small>release</small></span>
          </div>
          <div className="track-primary-actions">
            <button className="button button-primary button-large" onClick={() => onPlayTrack(track)}>{isPlayingThis ? <PauseIcon /> : <PlayIcon />}<span>{isPlayingThis ? "Pause" : "Play track"}</span></button>
            <button className={`track-round-action ${isFavorited ? "is-favorite" : ""}`} disabled={submittingAction} onClick={() => requestLibraryAccess(() => { void handleFavorite(); })} aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}>{isFavorited ? <HeartFillIcon /> : <HeartIcon />}</button>
            <button className="track-round-action" disabled={submittingAction} onClick={() => requestLibraryAccess(() => setPlaylistModalOpen(true))} aria-label="Add to playlist"><PlusIcon /></button>
          </div>
          {actionMessage ? <p className="track-action-message is-success" role="status">{actionMessage}</p> : null}
          {actionError ? <p className="track-action-message is-error" role="alert">{actionError}</p> : null}
        </div>
      </section>

      <div className="track-content-grid">
        <section className="track-lyrics-panel">
          <header>
            <div>
              <span className="track-section-icon"><FileTextIcon width={19} height={19} /></span>
              <span><small>LYRICS</small><h2>{track.title}</h2></span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {lyricsBundle?.customLyrics && lyricsBundle.customLyrics.length > 0 && (
                <div style={{ display: "inline-flex", background: "#f1f5f9", padding: "3px", borderRadius: "8px", gap: "4px" }}>
                  <button
                    type="button"
                    style={{
                      padding: "4px 10px",
                      borderRadius: "6px",
                      border: "none",
                      fontSize: "11px",
                      fontWeight: 600,
                      cursor: "pointer",
                      background: selectedLyricSource === "OFFICIAL" ? "#fff" : "transparent",
                      color: selectedLyricSource === "OFFICIAL" ? "#0284c7" : "#64748b",
                      boxShadow: selectedLyricSource === "OFFICIAL" ? "0 1px 3px rgba(0,0,0,0.1)" : "none"
                    }}
                    onClick={() => setSelectedLyricSource("OFFICIAL")}
                  >
                    Official
                  </button>
                  <button
                    type="button"
                    style={{
                      padding: "4px 10px",
                      borderRadius: "6px",
                      border: "none",
                      fontSize: "11px",
                      fontWeight: 600,
                      cursor: "pointer",
                      background: selectedLyricSource === "CUSTOM" ? "#fff" : "transparent",
                      color: selectedLyricSource === "CUSTOM" ? "#d97706" : "#64748b",
                      boxShadow: selectedLyricSource === "CUSTOM" ? "0 1px 3px rgba(0,0,0,0.1)" : "none"
                    }}
                    onClick={() => setSelectedLyricSource("CUSTOM")}
                  >
                    Custom
                  </button>
                </div>
              )}
              {selectedLyricSource === "CUSTOM" ? (
                <span className="official-lyrics-badge" style={{ background: "#fef3c7", color: "#b45309" }}>
                  <CheckIcon width={13} height={13} /> Custom
                </span>
              ) : (lyricsBundle?.officialLyrics || track.lyrics) ? (
                <span className="official-lyrics-badge">
                  <CheckIcon width={13} height={13} /> Official
                </span>
              ) : null}
            </div>
          </header>
          {(() => {
            const displayLyrics = selectedLyricSource === "CUSTOM"
              ? (lyricsBundle?.customLyrics?.[0]?.lyricContent || null)
              : (lyricsBundle?.officialLyrics || track.lyrics);
            return displayLyrics ? (
              <pre>{displayLyrics}</pre>
            ) : (
              <div className="track-lyrics-empty">
                <FileTextIcon />
                <strong>No lyrics available</strong>
                <span>{selectedLyricSource === "CUSTOM" ? "You have not saved any custom lyrics for this track." : "Official lyrics have not been provided for this track."}</span>
              </div>
            );
          })()}
          <footer>Lyrics are displayed in plain text format.</footer>
        </section>

        <aside className="track-context-column">
          <section className="track-context-card">
            <span className="context-eyebrow">RELEASE INFORMATION</span>
            <dl>
              <div><dt>Album</dt><dd>{track.album ? <button onClick={() => onNavigate(`/album/${track.album!.id}`)}>{track.album.title}</button> : "Single"}</dd></div>
              <div><dt>Genre</dt><dd>{genreLabel}</dd></div>
              <div><dt>Published</dt><dd>{formatReleaseDate(track.createdAt)}</dd></div>
              <div><dt>Status</dt><dd><span className="context-status"><CheckIcon width={12} height={12} /> {publicationLabel}</span></dd></div>
            </dl>
          </section>
          <section className="track-author-card">
            {track.creator?.avatarUrl ? <img src={track.creator.avatarUrl} alt="" /> : null}
            <span className="track-section-icon"><UserIcon width={18} height={18} /></span><small>CREATOR</small>
            <h3>{track.creator?.displayName ?? "Unknown Creator"}</h3><p>Explore more music and albums from this creator.</p>
            <button onClick={() => goToCreatorProfile(creatorId)}>View profile</button>
          </section>
          <p className="track-report-unavailable">Track reporting is not available in this release.</p>
        </aside>
      </div>



      {playlistModalOpen ? createPortal(
        <div className="modal-backdrop" role="presentation" onClick={() => setPlaylistModalOpen(false)}>
          <section className="track-dialog" role="dialog" aria-modal="true" aria-labelledby="playlist-dialog-title" onClick={(event) => event.stopPropagation()}>
            <div className="track-dialog-heading"><span><PlusIcon /></span><div><small>YOUR LIBRARY</small><h2 id="playlist-dialog-title">Add to playlist</h2></div></div>
            <p>Select one of your playlists for “{track.title}”.</p>
            {actionError ? <p className="track-action-message is-error" role="alert">{actionError}</p> : null}
            {playlists.length === 0 ? <div className="track-dialog-empty"><strong>No playlists yet</strong><span>Create a playlist from Your Library first.</span><button className="button button-primary" onClick={() => onNavigate("/playlists")}>Open Your Library</button></div>
              : <div className="track-dialog-list">{playlists.map((playlist) => <button key={playlist.id} disabled={submittingAction} onClick={() => { void handleAddToPlaylist(playlist.id); }}><img src={playlist.coverUrl || covers.dawn} alt="" onError={(event) => { event.currentTarget.src = covers.dawn; }} /><span><b>{playlist.title}</b><small>{playlist.trackCount} {playlist.trackCount === 1 ? "track" : "tracks"} · Private</small></span><PlusIcon width={17} height={17} /></button>)}</div>}
            <button className="button button-secondary" onClick={() => setPlaylistModalOpen(false)}>Close</button>
          </section>
        </div>, document.body) : null}

      {authPromptOpen ? createPortal(
        <div className="modal-backdrop" role="presentation" onClick={() => setAuthPromptOpen(false)}>
          <section className="track-dialog track-auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-dialog-title" onClick={(event) => event.stopPropagation()}>
            <div className="track-dialog-heading"><span><HeartIcon /></span><div><small>PERSONAL LIBRARY</small><h2 id="auth-dialog-title">Listener login required</h2></div></div>
            <p>Log in with a Listener account to save favorites and manage playlists.</p>
            <div className="track-dialog-actions"><button className="button button-secondary" onClick={() => setAuthPromptOpen(false)}>Not now</button><button className="button button-primary" onClick={() => onNavigate("/login")}>Go to login</button></div>
          </section>
        </div>, document.body) : null}
    </div>
  );
}
