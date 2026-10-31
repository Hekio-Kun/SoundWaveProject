import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { catalogApi } from "../api/catalog";
import { lyricsApi } from "../api/lyrics";
import { SectionHeader, TrackCard } from "../components/common/MusicCards";
import { parseLyricsToLines, formatTimeDisplay } from "../components/common/LyricSyncTab";
import { CenterNotificationPopup } from "../components/modals/CenterNotificationPopup";
import { DeleteConfirmationModal } from "../components/modals/DeleteConfirmationModal";
import { covers } from "../data";
import { useModalScrollLock } from "../hooks/useModalScrollLock";
import {
  AlertIcon,
  CheckIcon,
  EditIcon,
  FileTextIcon,
  HeadphonesIcon,
  HeartFillIcon,
  HeartIcon,
  MusicIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  RefreshIcon,
  TrashIcon,
  UserIcon,
} from "../icons";
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
  audio?: HTMLAudioElement;
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
  audio,
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

  // Dual-Tier Lyrics State (UC-16 & UC-18)
  const [lyricsBundle, setLyricsBundle] = useState<TrackLyricsBundle | null>(null);
  const [lyricsLoading, setLyricsLoading] = useState(true);
  const [lyricsError, setLyricsError] = useState(false);
  const [lyricsTab, setLyricsTab] = useState<"OFFICIAL" | "PERSONAL">("OFFICIAL");
  const [personalEditorOpen, setPersonalEditorOpen] = useState(false);
  const [personalContent, setPersonalContent] = useState("");
  const [personalSaving, setPersonalSaving] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteSaving, setDeleteSaving] = useState(false);

  // Synchronous Playback Tracking (UC-16.1)
  const [currentTime, setCurrentTime] = useState(0);
  const activeLineRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const isUserScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<number | null>(null);

  // Center Notification State
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    type: "success" | "error" | "info" | "warning";
  }>({ open: false, message: "", type: "success" });

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setTrack(null);
    void catalogApi
      .getTrackById(trackId)
      .then((item) => {
        if (active) setTrack(item);
      })
      .catch(() => {
        if (active) setError("Track not found or unavailable.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [trackId]);

  // Load lyrics bundle (UC-16.1 & UC-18)
  const loadTrackLyrics = async () => {
    setLyricsLoading(true);
    setLyricsError(false);
    try {
      const bundle = await lyricsApi.getTrackLyrics(trackId);
      setLyricsBundle(bundle);
    } catch {
      setLyricsError(true);
      setLyricsBundle(null);
    } finally {
      setLyricsLoading(false);
    }
  };

  useEffect(() => {
    void loadTrackLyrics();
  }, [trackId]);

  // Track real-time playback position from audio element
  useEffect(() => {
    if (!audio) return;
    const handleTimeUpdate = () => {
      if (currentTrack?.id === trackId) {
        setCurrentTime(audio.currentTime);
      }
    };
    audio.addEventListener("timeupdate", handleTimeUpdate);
    return () => audio.removeEventListener("timeupdate", handleTimeUpdate);
  }, [audio, currentTrack?.id, trackId]);

  useEffect(() => {
    let active = true;
    setRecommendations([]);
    setRecommendationsLoading(true);
    setRecommendationsError(false);
    void catalogApi
      .getRecommendations(trackId, 5)
      .then((items) => {
        if (active) setRecommendations(items);
      })
      .catch(() => {
        if (active) setRecommendationsError(true);
      })
      .finally(() => {
        if (active) setRecommendationsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [trackId]);

  const anyModalOpen = playlistModalOpen || authPromptOpen || personalEditorOpen || deleteConfirmOpen;
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
        if (!personalSaving) setPersonalEditorOpen(false);
        if (!deleteSaving) setDeleteConfirmOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [anyModalOpen, personalSaving, deleteSaving]);

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

  // Save personal lyrics
  const handleSavePersonalLyrics = async () => {
    if (!personalContent.trim()) {
      setNotification({
        open: true,
        message: "Lyrics content cannot be blank.",
        type: "warning",
      });
      return;
    }

    setPersonalSaving(true);
    try {
      const saved = await lyricsApi.savePersonalLyric(trackId, personalContent.trim(), "CUSTOM");
      setLyricsBundle((prev) => ({
        officialLyric: prev?.officialLyric ?? null,
        userPersonalLyric: saved,
      }));
      setPersonalEditorOpen(false);
      setNotification({
        open: true,
        message: "Custom lyrics saved successfully.",
        type: "success",
      });
    } catch (err: any) {
      setNotification({
        open: true,
        message: err.message || "Failed to save custom lyrics.",
        type: "error",
      });
    } finally {
      setPersonalSaving(false);
    }
  };

  // Delete personal lyrics
  const handleDeletePersonalLyrics = async () => {
    setDeleteSaving(true);
    try {
      await lyricsApi.deletePersonalLyric(trackId, "CUSTOM");
      setLyricsBundle((prev) => ({
        officialLyric: prev?.officialLyric ?? null,
        userPersonalLyric: null,
      }));
      setDeleteConfirmOpen(false);
      setNotification({
        open: true,
        message: "Custom lyrics removed.",
        type: "success",
      });
    } catch (err: any) {
      setNotification({
        open: true,
        message: err.message || "Failed to delete custom lyrics.",
        type: "error",
      });
    } finally {
      setDeleteSaving(false);
    }
  };

  // Active lyric resolution
  const officialLyricContent = lyricsBundle?.officialLyric?.lyricContent ?? track?.lyrics ?? null;
  const personalLyricContent = lyricsBundle?.userPersonalLyric?.lyricContent ?? null;
  const activeLyricContent = lyricsTab === "OFFICIAL" ? officialLyricContent : personalLyricContent;

  // Parse lines using standard LRC parser (EX01: safe fallback on malformed syntax)
  const parsedActiveLines = useMemo(() => {
    if (!activeLyricContent) return [];
    try {
      return parseLyricsToLines(activeLyricContent);
    } catch {
      return [];
    }
  }, [activeLyricContent]);

  const hasTimestamps = useMemo(
    () => parsedActiveLines.some((l) => l.timeSec !== null),
    [parsedActiveLines]
  );

  // Compute active line index for real-time highlighting (UC-16.1 NF01 Step 4)
  const isPlayingThisTrack = currentTrack?.id === track?.id;
  const activeLineIndex = useMemo(() => {
    if (!hasTimestamps || parsedActiveLines.length === 0 || !isPlayingThisTrack) return -1;
    let idx = -1;
    for (let i = 0; i < parsedActiveLines.length; i++) {
      const lineTime = parsedActiveLines[i].timeSec;
      if (lineTime !== null && currentTime >= lineTime) {
        idx = i;
      }
    }
    return idx;
  }, [parsedActiveLines, currentTime, hasTimestamps, isPlayingThisTrack]);

  // Auto-scroll active line into center view
  useEffect(() => {
    if (activeLineRef.current && !isUserScrollingRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeLineIndex]);

  const handleLyricsScroll = () => {
    isUserScrollingRef.current = true;
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = window.setTimeout(() => {
      isUserScrollingRef.current = false;
    }, 2500);
  };

  // Click-to-seek (UC-16.1 NF01 Step 6)
  const handleLineClick = (timeSec: number | null) => {
    if (timeSec === null) return;
    if (isPlayingThisTrack && audio) {
      audio.currentTime = Math.max(0, timeSec);
      if (!playing) {
        void audio.play().catch(() => {});
      }
    } else if (track) {
      onPlayTrack(track);
      setTimeout(() => {
        if (audio) {
          audio.currentTime = Math.max(0, timeSec);
        }
      }, 150);
    }
  };

  if (loading) {
    return (
      <div className="track-details-state" role="status">
        <span className="track-details-spinner" aria-hidden="true" />
        <p>Loading track details...</p>
      </div>
    );
  }

  if (!track || error) {
    return (
      <div className="track-details-state">
        <h1>Track not found</h1>
        <p>The track does not exist, is not published, or has been removed.</p>
        <button className="button button-primary" onClick={() => onNavigate("/")}>
          Back to Explore
        </button>
      </div>
    );
  }

  const isPlayingThis = isPlayingThisTrack && playing;
  const creatorId = track.creator?.userId;
  const genreLabel = track.genreName ?? track.genreSlug ?? "Uncategorized";
  const publicationLabel = track.publicationStatus === "PUBLISHED" ? "Published" : track.publicationStatus ?? "Published";

  return (
    <div className="track-page-v2">
      <nav className="track-breadcrumb" aria-label="Breadcrumb">
        <button onClick={() => onNavigate("/")}>Explore</button>
        <span>/</span>
        <button onClick={() => goToCreatorProfile(creatorId)}>{track.creator?.displayName ?? "Unknown Creator"}</button>
        <span>/</span>
        <b>{track.title}</b>
      </nav>

      <section className="track-showcase">
        <div
          className="track-showcase-glow"
          style={{ backgroundImage: `url(${track.coverUrl ?? covers.dawn})` }}
          aria-hidden="true"
        />
        <div className="track-showcase-visual">
          <button
            className="track-cover-button"
            onClick={() => onPlayTrack(track)}
            aria-label={isPlayingThis ? `Pause ${track.title}` : `Play ${track.title}`}
          >
            <img
              src={track.coverUrl ?? covers.dawn}
              alt={`Cover for ${track.title}`}
              onError={(event) => {
                event.currentTarget.src = covers.dawn;
              }}
            />
            <span>{isPlayingThis ? <PauseIcon width={28} height={28} /> : <PlayIcon width={28} height={28} />}</span>
          </button>
        </div>

        <div className="track-showcase-content">
          <div className="track-labels">
            <span>TRACK</span>
            <span>{genreLabel}</span>
            <span className="is-approved">
              <CheckIcon width={12} height={12} /> {publicationLabel}
            </span>
          </div>
          <h1>{track.title}</h1>
          <p className="track-intro">{track.description?.trim() || "No description has been provided for this track."}</p>
          <button className="track-creator-chip" onClick={() => goToCreatorProfile(creatorId)}>
            {track.creator?.avatarUrl ? (
              <img src={track.creator.avatarUrl} alt="" />
            ) : (
              <span className="track-avatar-fallback" aria-hidden="true">
                <UserIcon width={18} height={18} />
              </span>
            )}
            <span>
              <small>Uploaded by</small>
              <strong>{track.creator?.displayName ?? "Unknown Creator"}</strong>
            </span>
          </button>
          <div className="track-stat-row">
            <span>
              <HeadphonesIcon width={16} height={16} />
              <b>{formatPlays(track.playCount)}</b>
              <small>plays</small>
            </span>
            <i />
            <span>
              <b>{formatDuration(track.durationMs)}</b>
              <small>duration</small>
            </span>
            <i />
            <span>
              <b>{track.album?.title ?? "Single"}</b>
              <small>release</small>
            </span>
          </div>
          <div className="track-primary-actions">
            <button className="button button-primary button-large" onClick={() => onPlayTrack(track)}>
              {isPlayingThis ? <PauseIcon /> : <PlayIcon />}
              <span>{isPlayingThis ? "Pause" : "Play track"}</span>
            </button>
            <button
              className={`track-round-action ${isFavorited ? "is-favorite" : ""}`}
              disabled={submittingAction}
              onClick={() =>
                requestLibraryAccess(() => {
                  void handleFavorite();
                })
              }
              aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
            >
              {isFavorited ? <HeartFillIcon /> : <HeartIcon />}
            </button>
            <button
              className="track-round-action"
              disabled={submittingAction}
              onClick={() => requestLibraryAccess(() => setPlaylistModalOpen(true))}
              aria-label="Add to playlist"
            >
              <PlusIcon />
            </button>
          </div>
          {actionMessage ? (
            <p className="track-action-message is-success" role="status">
              {actionMessage}
            </p>
          ) : null}
          {actionError ? (
            <p className="track-action-message is-error" role="alert">
              {actionError}
            </p>
          ) : null}
        </div>
      </section>

      <div className="track-content-grid">
        {/* Dual-Tier Synchronous Lyrics Panel (UC-16.1 & UC-18) */}
        <section className="track-lyrics-panel" aria-label="Lyrics Section">
          <header>
            <div>
              <span className="track-section-icon">
                <FileTextIcon width={19} height={19} />
              </span>
              <span>
                <small>LYRICS</small>
                <h2>{track.title}</h2>
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {isPlayingThisTrack && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 9px",
                    borderRadius: 8,
                    fontSize: 11,
                    fontWeight: 700,
                    background: "rgba(2, 132, 199, 0.12)",
                    color: "#0284c7",
                  }}
                >
                  <MusicIcon width={13} height={13} />
                  <span>Now Playing</span>
                </span>
              )}
              {officialLyricContent && lyricsTab === "OFFICIAL" ? (
                <span className="official-lyrics-badge">
                  <CheckIcon width={13} height={13} /> Verified Official
                </span>
              ) : null}
            </div>
          </header>

          {/* Dual-Tab Navigation Bar */}
          <div className="track-lyrics-tabs-header">
            <div className="track-lyrics-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={lyricsTab === "OFFICIAL"}
                className={`track-lyrics-tab-btn ${lyricsTab === "OFFICIAL" ? "is-active" : ""}`}
                onClick={() => setLyricsTab("OFFICIAL")}
              >
                <CheckIcon width={14} height={14} />
                <span>Official Lyrics</span>
                {officialLyricContent ? <span className="tab-pill">Verified</span> : null}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={lyricsTab === "PERSONAL"}
                className={`track-lyrics-tab-btn ${lyricsTab === "PERSONAL" ? "is-active" : ""}`}
                onClick={() => setLyricsTab("PERSONAL")}
              >
                <FileTextIcon width={14} height={14} />
                <span>My Personal Lyrics</span>
                {personalLyricContent ? <span className="tab-pill is-personal">Custom</span> : null}
              </button>
            </div>

            {/* Actions for Personal tab when user is logged in & has custom lyrics */}
            {lyricsTab === "PERSONAL" && canManageLibrary && personalLyricContent ? (
              <div className="track-lyrics-tab-actions">
                <button
                  type="button"
                  className="button button-secondary button-small"
                  onClick={() => {
                    setPersonalContent(personalLyricContent);
                    setPersonalEditorOpen(true);
                  }}
                  title="Edit your personal lyrics"
                >
                  <EditIcon width={13} height={13} />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  className="button button-secondary button-small button-danger-hover"
                  onClick={() => setDeleteConfirmOpen(true)}
                  title="Delete personal lyrics"
                >
                  <TrashIcon width={13} height={13} />
                  <span>Delete</span>
                </button>
              </div>
            ) : null}
          </div>

          {/* Tab Content Display */}
          {lyricsLoading ? (
            <div className="track-lyrics-empty">
              <span className="track-details-spinner" aria-hidden="true" />
              <p>Loading lyrics...</p>
            </div>
          ) : lyricsError ? (
            /* EX02: Network / Loading Exception */
            <div className="track-lyrics-empty">
              <AlertIcon width={32} height={32} />
              <strong>Unable to load lyrics</strong>
              <span>A network issue prevented loading the lyric data.</span>
              <button
                type="button"
                className="button button-secondary"
                style={{ marginTop: 10 }}
                onClick={() => void loadTrackLyrics()}
              >
                <RefreshIcon width={13} height={13} />
                <span>Retry</span>
              </button>
            </div>
          ) : lyricsTab === "OFFICIAL" ? (
            /* Tab 1: Official Lyrics */
            officialLyricContent ? (
              hasTimestamps ? (
                /* NF01: Real-time Synchronized Scrolling Karaoke Lines with Click-to-seek */
                <div
                  ref={scrollContainerRef}
                  onScroll={handleLyricsScroll}
                  className="track-lyrics-synced-list"
                >
                  {parsedActiveLines.map((line, idx) => {
                    const isActive = idx === activeLineIndex;
                    return (
                      <div
                        key={line.id}
                        ref={isActive ? activeLineRef : null}
                        className={`track-lyrics-synced-item ${isActive ? "is-active-line" : ""}`}
                        onClick={() => handleLineClick(line.timeSec)}
                        title={
                          line.timeSec !== null
                            ? `Click to jump audio to ${formatTimeDisplay(line.timeSec)}`
                            : undefined
                        }
                      >
                        {line.timeSec !== null ? (
                          <span className="track-lyrics-time-chip">{formatTimeDisplay(line.timeSec)}</span>
                        ) : null}
                        <span className="track-lyrics-text">{line.text || "\u00A0"}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* AF02: Plain text lyrics */
                <pre>{officialLyricContent}</pre>
              )
            ) : (
              /* AF01: Empty state when track has no official lyrics */
              <div className="track-lyrics-empty">
                <FileTextIcon width={32} height={32} />
                <strong>No official lyrics available</strong>
                <span>Official verified lyrics have not been provided for this track yet.</span>
                {canManageLibrary ? (
                  <button
                    type="button"
                    className="button button-secondary"
                    style={{ marginTop: 12 }}
                    onClick={() => {
                      setLyricsTab("PERSONAL");
                      setPersonalContent("");
                      setPersonalEditorOpen(true);
                    }}
                  >
                    <PlusIcon width={14} height={14} />
                    <span>Create Custom Lyrics</span>
                  </button>
                ) : null}
              </div>
            )
          ) : (
            /* Tab 2: Personal Lyrics */
            !canManageLibrary ? (
              <div className="track-lyrics-empty">
                <UserIcon width={32} height={32} />
                <strong>Listener Login Required</strong>
                <span>Log in with a Listener account to write, sync, and save your own personal lyrics.</span>
                <button
                  type="button"
                  className="button button-primary"
                  style={{ marginTop: 12 }}
                  onClick={() => onNavigate("/login")}
                >
                  Go to Login
                </button>
              </div>
            ) : personalLyricContent ? (
              hasTimestamps ? (
                <div
                  ref={scrollContainerRef}
                  onScroll={handleLyricsScroll}
                  className="track-lyrics-synced-list"
                >
                  {parsedActiveLines.map((line, idx) => {
                    const isActive = idx === activeLineIndex;
                    return (
                      <div
                        key={line.id}
                        ref={isActive ? activeLineRef : null}
                        className={`track-lyrics-synced-item ${isActive ? "is-active-line" : ""}`}
                        onClick={() => handleLineClick(line.timeSec)}
                        title={
                          line.timeSec !== null
                            ? `Click to jump audio to ${formatTimeDisplay(line.timeSec)}`
                            : undefined
                        }
                      >
                        {line.timeSec !== null ? (
                          <span className="track-lyrics-time-chip">{formatTimeDisplay(line.timeSec)}</span>
                        ) : null}
                        <span className="track-lyrics-text">{line.text || "\u00A0"}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <pre>{personalLyricContent}</pre>
              )
            ) : (
              <div className="track-lyrics-empty">
                <FileTextIcon width={32} height={32} />
                <strong>No personal lyrics yet</strong>
                <span>You can create your own custom or translated lyrics for this song.</span>
                <button
                  type="button"
                  className="button button-primary"
                  style={{ marginTop: 12 }}
                  onClick={() => {
                    setPersonalContent("");
                    setPersonalEditorOpen(true);
                  }}
                >
                  <PlusIcon width={14} height={14} />
                  <span>Create Custom Lyrics</span>
                </button>
              </div>
            )
          )}

          <footer>
            {hasTimestamps
              ? "Time-synced lyrics (.lrc). Click any line to seek audio playback (Click-to-seek)."
              : "Lyrics are displayed in plain text format."}
          </footer>
        </section>

        <aside className="track-context-column">
          <section className="track-context-card">
            <span className="context-eyebrow">RELEASE INFORMATION</span>
            <dl>
              <div>
                <dt>Album</dt>
                <dd>
                  {track.album ? (
                    <button onClick={() => onNavigate(`/album/${track.album!.id}`)}>{track.album.title}</button>
                  ) : (
                    "Single"
                  )}
                </dd>
              </div>
              <div>
                <dt>Genre</dt>
                <dd>{genreLabel}</dd>
              </div>
              <div>
                <dt>Published</dt>
                <dd>{formatReleaseDate(track.createdAt)}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>
                  <span className="context-status">
                    <CheckIcon width={12} height={12} /> {publicationLabel}
                  </span>
                </dd>
              </div>
            </dl>
          </section>
          <section className="track-author-card">
            {track.creator?.avatarUrl ? <img src={track.creator.avatarUrl} alt="" /> : null}
            <span className="track-section-icon">
              <UserIcon width={18} height={18} />
            </span>
            <small>CREATOR</small>
            <h3>{track.creator?.displayName ?? "Unknown Creator"}</h3>
            <p>Explore more music and albums from this creator.</p>
            <button onClick={() => goToCreatorProfile(creatorId)}>View profile</button>
          </section>
          <p className="track-report-unavailable">Track reporting is not available in this release.</p>
        </aside>
      </div>

      {/* Playlist Modal */}
      {playlistModalOpen
        ? createPortal(
            <div className="modal-backdrop" role="presentation" onClick={() => setPlaylistModalOpen(false)}>
              <section
                className="track-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="playlist-dialog-title"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="track-dialog-heading">
                  <span>
                    <PlusIcon />
                  </span>
                  <div>
                    <small>YOUR LIBRARY</small>
                    <h2 id="playlist-dialog-title">Add to playlist</h2>
                  </div>
                </div>
                <p>Select one of your playlists for “{track.title}”.</p>
                {actionError ? (
                  <p className="track-action-message is-error" role="alert">
                    {actionError}
                  </p>
                ) : null}
                {playlists.length === 0 ? (
                  <div className="track-dialog-empty">
                    <strong>No playlists yet</strong>
                    <span>Create a playlist from Your Library first.</span>
                    <button className="button button-primary" onClick={() => onNavigate("/playlists")}>
                      Open Your Library
                    </button>
                  </div>
                ) : (
                  <div className="track-dialog-list">
                    {playlists.map((playlist) => (
                      <button
                        key={playlist.id}
                        disabled={submittingAction}
                        onClick={() => {
                          void handleAddToPlaylist(playlist.id);
                        }}
                      >
                        <img
                          src={playlist.coverUrl || covers.dawn}
                          alt=""
                          onError={(event) => {
                            event.currentTarget.src = covers.dawn;
                          }}
                        />
                        <span>
                          <b>{playlist.title}</b>
                          <small>
                            {playlist.trackCount} {playlist.trackCount === 1 ? "track" : "tracks"} · Private
                          </small>
                        </span>
                        <PlusIcon width={17} height={17} />
                      </button>
                    ))}
                  </div>
                )}
                <button className="button button-secondary" onClick={() => setPlaylistModalOpen(false)}>
                  Close
                </button>
              </section>
            </div>,
            document.body
          )
        : null}

      {/* Auth Prompt Modal */}
      {authPromptOpen
        ? createPortal(
            <div className="modal-backdrop" role="presentation" onClick={() => setAuthPromptOpen(false)}>
              <section
                className="track-dialog track-auth-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="auth-dialog-title"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="track-dialog-heading">
                  <span>
                    <HeartIcon />
                  </span>
                  <div>
                    <small>PERSONAL LIBRARY</small>
                    <h2 id="auth-dialog-title">Listener login required</h2>
                  </div>
                </div>
                <p>Log in with a Listener account to save favorites and manage playlists.</p>
                <div className="track-dialog-actions">
                  <button className="button button-secondary" onClick={() => setAuthPromptOpen(false)}>
                    Not now
                  </button>
                  <button className="button button-primary" onClick={() => onNavigate("/login")}>
                    Go to login
                  </button>
                </div>
              </section>
            </div>,
            document.body
          )
        : null}

      {/* Personal Lyrics Editor Modal (UC-18) */}
      {personalEditorOpen
        ? createPortal(
            <div
              className="modal-backdrop"
              role="presentation"
              onClick={() => {
                if (!personalSaving) setPersonalEditorOpen(false);
              }}
            >
              <section
                className="track-dialog"
                style={{ width: "min(100%, 600px)" }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="personal-lyrics-title"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="track-dialog-heading">
                  <span>
                    <FileTextIcon />
                  </span>
                  <div>
                    <small>PERSONAL LYRICS</small>
                    <h2 id="personal-lyrics-title">
                      {personalLyricContent ? "Edit Custom Lyrics" : "Create Custom Lyrics"}
                    </h2>
                  </div>
                </div>
                <p>
                  Write or paste your custom lyrics for <b>{track.title}</b>. Supports both standard LRC timestamps
                  (e.g. <code>[01:23.45] lyric line</code>) and plain text.
                </p>

                <textarea
                  className="track-lyrics-dialog-textarea"
                  value={personalContent}
                  onChange={(e) => setPersonalContent(e.target.value)}
                  placeholder="Paste or type your lyrics here..."
                  rows={12}
                  disabled={personalSaving}
                />
                <p className="track-lyrics-dialog-hint">
                  Tip: Include timestamps like <code>[00:15.20]</code> at the start of lines to create time-synced lyrics!
                </p>

                <div className="track-dialog-actions">
                  <button
                    type="button"
                    className="button button-secondary"
                    disabled={personalSaving}
                    onClick={() => setPersonalEditorOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="button button-primary"
                    disabled={personalSaving || !personalContent.trim()}
                    onClick={() => {
                      void handleSavePersonalLyrics();
                    }}
                  >
                    {personalSaving ? "Saving..." : "Save Lyrics"}
                  </button>
                </div>
              </section>
            </div>,
            document.body
          )
        : null}

      {/* Delete Confirmation Modal for Personal Lyrics */}
      <DeleteConfirmationModal
        open={deleteConfirmOpen}
        title="Delete Custom Lyrics"
        message="Are you sure you want to remove your custom lyrics for this track? This action cannot be undone."
        confirmLabel="Delete Lyrics"
        submitting={deleteSaving}
        onConfirm={() => {
          void handleDeletePersonalLyrics();
        }}
        onCancel={() => setDeleteConfirmOpen(false)}
      />

      {/* Central Feedback Toast Popup */}
      <CenterNotificationPopup
        open={notification.open}
        type={notification.type}
        message={notification.message}
        onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}
