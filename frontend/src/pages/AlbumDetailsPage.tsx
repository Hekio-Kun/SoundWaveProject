import { useEffect, useState } from "react";
import { catalogApi } from "../api/catalog";
import { covers } from "../data";
import { ClockIcon, DiscIcon, EyeIcon, HeadphonesIcon, PauseIcon, PlayIcon } from "../icons";
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

  const title = albumData?.title ?? "Album";
  const coverUrl = albumData?.coverUrl;
  const description = albumData?.description;
  const creatorName = albumData?.creator?.displayName ?? "Creator";
  const releaseYear = albumData?.releaseDate
    ? new Date(albumData.releaseDate).getFullYear()
    : albumData?.createdAt
    ? new Date(albumData.createdAt).getFullYear()
    : new Date().getFullYear();

  const albumTracks: LandingTrack[] = albumData?.tracks || [];

  const totalDurationMs = albumTracks.reduce((acc, t) => acc + (t.durationMs || 0), 0);
  const totalMin = Math.round(totalDurationMs / 60000);

  const isAlbumPlaying = Boolean(
    albumTracks.some((t) => t.id === currentTrack?.id) && playing
  );

  return (
    <div className="album-details-page" style={{ padding: "0 0 60px 0" }}>
      {/* Breadcrumb Navigation */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          color: "var(--sw-muted, #64748b)",
          fontSize: "12px",
          marginBottom: "20px",
        }}
      >
        <button
          onClick={() => onNavigate("/")}
          style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0 }}
        >
          Discover
        </button>
        <span>/</span>
        <button
          onClick={() => onNavigate("/albums")}
          style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0 }}
        >
          Albums
        </button>
        <span>/</span>
        <span style={{ color: "var(--sw-text, #0f172a)", fontWeight: 700 }}>{title}</span>
      </div>

      {/* Album Header Banner Showcase matching Playlist */}
      <section
        className="playlist-header-banner"
        style={{
          display: "grid",
          gridTemplateColumns: "220px 1fr",
          gap: "28px",
          padding: "28px",
          background: "#fff",
          border: "1px solid var(--sw-border, #ede3d2)",
          borderRadius: "20px",
          boxShadow: "0 8px 30px rgba(16, 24, 40, 0.04)",
          marginBottom: "32px",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "220px",
            height: "220px",
            borderRadius: "16px",
            overflow: "hidden",
            flexShrink: 0,
            boxShadow: "0 8px 24px rgba(16, 24, 40, 0.08)",
          }}
        >
          <img
            src={coverUrl || covers.dawn}
            alt={title}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = covers.dawn;
            }}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <span className="eyebrow" style={{ color: "var(--sw-primary, #0284c7)", fontWeight: 800, fontSize: "11px", letterSpacing: "0.08em" }}>
                ALBUM
              </span>
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: "999px",
                  fontSize: "10.5px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  background: "#ECFDF5",
                  color: "#065F46",
                  border: "1px solid #A7F3D0",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <DiscIcon width={11} height={11} /> Public
              </span>
            </div>

            <h1
              style={{
                fontSize: "clamp(26px, 3.5vw, 40px)",
                fontWeight: 800,
                color: "var(--sw-text, #0f172a)",
                letterSpacing: "-0.04em",
                margin: "0 0 10px 0",
              }}
            >
              {title}
            </h1>

            {description && (
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--sw-muted, #64748b)",
                  margin: "0 0 12px 0",
                  lineHeight: 1.6,
                }}
              >
                {description}
              </p>
            )}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                fontSize: "12px",
                color: "var(--sw-muted, #64748b)",
                flexWrap: "wrap",
              }}
            >
              <span>
                Creator:{" "}
                <button
                  type="button"
                  onClick={() => {
                    if (albumData?.creator?.userId) {
                      onNavigate(`/creator/${albumData.creator.userId}`);
                    }
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    fontWeight: 700,
                    color: "var(--sw-text, #0f172a)",
                    cursor: "pointer",
                  }}
                >
                  {creatorName}
                </button>
              </span>
              <span>•</span>
              <span>Released: {releaseYear}</span>
              <span>•</span>
              <span>
                <b>{albumTracks.length}</b> tracks
              </span>
              {totalMin > 0 && (
                <>
                  <span>•</span>
                  <span>about {totalMin} min</span>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons: Play all only (No edit, delete, or manage) */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "20px", flexWrap: "wrap" }}>
            <button
              className="button button-primary button-large"
              disabled={albumTracks.length === 0}
              onClick={() => {
                if (albumTracks.length > 0) {
                  onPlayTrack(
                    albumTracks[0],
                    albumTracks,
                    `Album • ${title}`,
                    `album-${albumId}`
                  );
                }
              }}
              style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
            >
              {isAlbumPlaying ? <PauseIcon width={18} height={18} /> : <PlayIcon width={18} height={18} />}
              <span>{isAlbumPlaying ? "Playing" : "Play all"}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Album Tracks Table matching Playlist Design */}
      <section className="album-tracklist-section">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: 800, margin: 0, color: "var(--sw-text, #0f172a)" }}>
              Tracks in Album ({albumTracks.length})
            </h2>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: "20px 0" }}>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="skeleton"
                style={{ height: "54px", borderRadius: "10px", marginBottom: "8px" }}
              />
            ))}
          </div>
        ) : albumTracks.length === 0 ? (
          <div
            className="sw-empty"
            style={{
              padding: "48px 24px",
              background: "#fff",
              border: "1px dashed var(--sw-border, #ede3d2)",
              borderRadius: "16px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              textAlign: "center",
            }}
          >
            <DiscIcon width={36} height={36} />
            <strong style={{ fontSize: "16px", color: "var(--sw-text, #0f172a)" }}>This album is empty</strong>
            <span style={{ fontSize: "13px", color: "var(--sw-muted, #64748b)" }}>
              No published tracks found in this album yet.
            </span>
          </div>
        ) : (
          <div
            className="library-tracks-table"
            style={{
              background: "#fff",
              border: "1px solid var(--sw-border, #ede3d2)",
              borderRadius: "16px",
              overflow: "hidden",
            }}
          >
            {/* Table Header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "36px 48px minmax(180px, 1.5fr) minmax(120px, 1fr) 70px 85px",
                alignItems: "center",
                gap: "14px",
                padding: "10px 16px",
                background: "#F8FAFC",
                borderBottom: "1px solid var(--sw-border, #ede3d2)",
                fontSize: "11px",
                fontWeight: 800,
                color: "var(--sw-muted, #64748b)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              <span style={{ textAlign: "center" }}>#</span>
              <span />
              <span>Title</span>
              <span>Genre</span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <ClockIcon width={12} height={12} /> Time
              </span>
              <span style={{ textAlign: "right" }}>Actions</span>
            </div>

            {albumTracks.map((track, idx) => {
              const isCurrent = currentTrack?.id === track.id;
              const isPlayingThis = isCurrent && playing;

              return (
                <div
                  key={`${track.id}-${idx}`}
                  className={`table-track-row ${isCurrent ? "table-track-row--active" : ""}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "36px 48px minmax(180px, 1.5fr) minmax(120px, 1fr) 70px 85px",
                    alignItems: "center",
                    gap: "14px",
                    padding: "10px 16px",
                    borderBottom: idx === albumTracks.length - 1 ? "none" : "1px solid #F1F5F9",
                    transition: "background 0.15s ease",
                  }}
                >
                  {/* Position number */}
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#98A2B3", textAlign: "center" }}>
                    {String(idx + 1).padStart(2, "0")}
                  </span>

                  {/* Thumbnail & Play button */}
                  <div
                    style={{
                      position: "relative",
                      width: "44px",
                      height: "44px",
                      borderRadius: "8px",
                      overflow: "hidden",
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      onPlayTrack(
                        track,
                        albumTracks,
                        `Album • ${title}`,
                        `album-${albumId}`
                      )
                    }
                  >
                    <img
                      src={track.coverUrl ?? coverUrl ?? covers.dawn}
                      alt=""
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = covers.dawn;
                      }}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
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
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0,0,0,0.45)",
                        border: "none",
                        color: "#fff",
                        display: isPlayingThis ? "flex" : "none",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                    >
                      {isPlayingThis ? <PauseIcon width={14} height={14} /> : <PlayIcon width={14} height={14} />}
                    </button>
                  </div>

                  {/* Main info */}
                  <div style={{ overflow: "hidden" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <button
                        type="button"
                        onClick={() => onNavigate(`/track/${track.id}`)}
                        style={{
                          display: "inline-block",
                          background: "none",
                          border: "none",
                          padding: 0,
                          textAlign: "left",
                          cursor: "pointer",
                          fontSize: "13px",
                          fontWeight: 700,
                          color: isCurrent ? "var(--sw-primary, #0284c7)" : "var(--sw-text, #0f172a)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          fontFamily: "inherit",
                          transition: "color 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!isCurrent) e.currentTarget.style.color = "var(--sw-primary, #0284c7)";
                        }}
                        onMouseLeave={(e) => {
                          if (!isCurrent) e.currentTarget.style.color = "var(--sw-text, #0f172a)";
                        }}
                        title={`View details for ${track.title}`}
                      >
                        {track.title}
                      </button>
                    </div>
                    <a
                      href={`/creator/${track.creator?.userId}`}
                      onClick={(e) => {
                        e.preventDefault();
                        if (track.creator?.userId) onNavigate(`/creator/${track.creator.userId}`);
                      }}
                      style={{
                        fontSize: "11px",
                        color: "var(--sw-muted, #64748b)",
                        textDecoration: "none",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {track.creator?.displayName || creatorName}
                    </a>
                  </div>

                  {/* Genre */}
                  <span
                    style={{
                      fontSize: "12px",
                      color: "var(--sw-muted, #64748b)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {track.genreName || track.genreSlug || "Pop"}
                  </span>

                  {/* Duration */}
                  <span style={{ fontSize: "11.5px", color: "var(--sw-muted, #64748b)", fontVariantNumeric: "tabular-nums" }}>
                    {formatDuration(track.durationMs || 0)}
                  </span>

                  {/* Actions column: Detail button only (No delete, edit, or manage) */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "6px" }}>
                    <button
                      type="button"
                      className="button button-ghost button-small"
                      onClick={() => onNavigate(`/track/${track.id}`)}
                      title={`View details for ${track.title}`}
                      style={{
                        padding: "4px 8px",
                        fontSize: "12px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        color: "var(--sw-primary, #0284c7)",
                        fontWeight: 600,
                      }}
                    >
                      <EyeIcon width={13} height={13} />
                      <span>Detail</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
