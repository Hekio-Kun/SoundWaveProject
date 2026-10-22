import { useEffect, useState } from "react";
import { covers, featuredCreators, tracks } from "../data";
import { ClockIcon, HeadphonesIcon, MailIcon, PauseIcon, PlayIcon, UserIcon } from "../icons";
import type { LandingTrack } from "../types";
import { catalogApi } from "../api/catalog";
import { profileApi, type ProfileDetails } from "../api/profile";

type Props = {
  creatorId: number;
  currentTrack: LandingTrack | null;
  playing: boolean;
  onPlayTrack: (track: LandingTrack, contextQueue?: LandingTrack[], contextTitle?: string) => void;
  onNavigate: (route: string) => void;
};

const formatDate = (value: string | null | undefined) =>
  value
    ? new Intl.DateTimeFormat("en-US", { day: "2-digit", month: "long", year: "numeric" }).format(
        new Date(`${value}T00:00:00`)
      )
    : "Not provided";

const formatPlays = (value: number) =>
  new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);

const formatDuration = (ms: number) => {
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${min}:${sec.toString().padStart(2, "0")}`;
};

export function CreatorProfilePage({ creatorId, currentTrack, playing, onPlayTrack, onNavigate }: Props) {
  const [profile, setProfile] = useState<ProfileDetails | null>(null);
  const [creatorTracks, setCreatorTracks] = useState<LandingTrack[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [avatarFailed, setAvatarFailed] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setAvatarFailed(false);

    async function loadData() {
      // 1. Check sessionStorage cache for creator metadata passed from TrackDetailsPage or cards
      let cachedCreator: { displayName?: string; avatarUrl?: string | null } | null = null;
      try {
        const stored = sessionStorage.getItem(`creator_profile_${creatorId}`);
        if (stored) {
          cachedCreator = JSON.parse(stored);
        }
      } catch {}

      // 2. Also check currentTrack
      if (!cachedCreator && currentTrack?.creator?.userId === creatorId) {
        cachedCreator = currentTrack.creator;
      }

      // 3. Mock featuredCreators
      const mockCreator = featuredCreators.find((c) => c.userId === creatorId);

      // 4. Fetch tracks to get actual uploaded tracks & creator metadata
      let tracksList: LandingTrack[] = [];
      let creatorFromTracks: { displayName: string; avatarUrl: string | null } | null = null;
      try {
        const tracksRes = await catalogApi.getTracks({ size: 100 });
        if (tracksRes?.content) {
          const matching = tracksRes.content.filter((t) => t.creator?.userId === creatorId);
          tracksList = matching;
          if (matching.length > 0 && matching[0].creator) {
            creatorFromTracks = {
              displayName: matching[0].creator.displayName,
              avatarUrl: matching[0].creator.avatarUrl,
            };
          }
        }
      } catch {
        tracksList = tracks.filter((t) => t.creator.userId === creatorId && t.publicationStatus === "APPROVED");
      }

      // 5. Try fetching from profileApi
      let loadedProfile: ProfileDetails | null = null;
      try {
        const res = await profileApi.getPublicProfile(creatorId);
        if (res) {
          loadedProfile = res;
        }
      } catch {
        // Handled below with resolved metadata
      }

      // Best resolved display name and avatar (matches the track creator)
      const resolvedName =
        (loadedProfile?.displayName && !loadedProfile.displayName.startsWith("Creator #")
          ? loadedProfile.displayName
          : null) ||
        cachedCreator?.displayName ||
        creatorFromTracks?.displayName ||
        mockCreator?.displayName ||
        `Creator #${creatorId}`;

      const resolvedAvatar =
        loadedProfile?.avatarUrl ||
        cachedCreator?.avatarUrl ||
        creatorFromTracks?.avatarUrl ||
        mockCreator?.avatarUrl ||
        null;

      const resolvedUsername =
        loadedProfile?.username && !loadedProfile.username.startsWith("user")
          ? loadedProfile.username
          : resolvedName.toLowerCase().replace(/[^a-z0-9]/g, "") || `user${creatorId}`;

      const finalProfile: ProfileDetails = {
        userId: creatorId,
        email: loadedProfile?.email || "Not provided",
        username: resolvedUsername,
        displayName: resolvedName,
        bio: loadedProfile?.bio || mockCreator?.bio || "- -",
        avatarUrl: resolvedAvatar,
        dateOfBirth: loadedProfile?.dateOfBirth ?? null,
        countryCode: loadedProfile?.countryCode ?? null,
        role: loadedProfile?.role || "LISTENER",
        createdAt: loadedProfile?.createdAt || new Date().toISOString(),
        updatedAt: loadedProfile?.updatedAt || new Date().toISOString(),
      };

      if (isMounted) {
        setProfile(finalProfile);
        setCreatorTracks(tracksList);
        setLoading(false);
      }
    }

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [creatorId, currentTrack]);

  if (loading) {
    return (
      <div className="profile-settings-page" aria-busy="true">
        <div className="profile-settings-skeleton skeleton" />
        <div className="profile-settings-skeleton profile-settings-skeleton--form skeleton" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="state-page">
        <span className="state-icon">!</span>
        <h1>Unable to load profile</h1>
        <p>This user profile could not be found.</p>
        <button className="button button-primary" onClick={() => onNavigate("/")}>
          Back to Explore
        </button>
      </div>
    );
  }

  const memberSince = profile.createdAt ? new Date(profile.createdAt).getFullYear() : 2026;
  const displayedAvatar = profile.avatarUrl || "";

  return (
    <div className="profile-settings-page">
      {/* Profile Hero */}
      <section className="profile-settings-hero">
        <div className="profile-settings-avatar">
          {displayedAvatar && !avatarFailed ? (
            <img
              src={displayedAvatar}
              alt={profile.displayName}
              onError={() => setAvatarFailed(true)}
            />
          ) : (
            <UserIcon width={38} height={38} />
          )}
        </div>
        <div className="profile-hero-copy">
          <span className="eyebrow">PERSONAL PROFILE</span>
          <h1>{profile.displayName}</h1>
          <p>
            @{profile.username} · Member since {memberSince}
          </p>
        </div>
        <div className="profile-hero-actions">
          <span className="profile-settings-role">{profile.role || "LISTENER"}</span>
        </div>
      </section>

      {/* Profile Dashboard */}
      <section className="profile-dashboard">
        <div className="profile-about-card">
          <span className="profile-section-kicker">ABOUT</span>
          <h2>Biography</h2>
          <p>{profile.bio || "- -"}</p>
        </div>

        <div className="profile-details-card">
          <div className="profile-card-heading">
            <div>
              <span className="profile-section-kicker">ACCOUNT DETAILS</span>
              <h2>Personal information</h2>
            </div>
          </div>
          <dl>
            <div>
              <dt>
                <UserIcon width={17} height={17} />
                Username
              </dt>
              <dd>@{profile.username}</dd>
            </div>
            <div>
              <dt>
                <MailIcon width={17} height={17} />
                Email
              </dt>
              <dd>{profile.email}</dd>
            </div>
            <div>
              <dt>
                <ClockIcon width={17} height={17} />
                Date of birth
              </dt>
              <dd>{formatDate(profile.dateOfBirth)}</dd>
            </div>
            <div>
              <dt>
                <span className="profile-country-icon">◎</span>
                Country
              </dt>
              <dd>{profile.countryCode || "Not provided"}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Published Tracks section if any */}
      {creatorTracks.length > 0 && (
        <section
          className="profile-tracks-card"
          style={{
            background: "#ffffff",
            border: "1px solid #e4e7ec",
            borderRadius: "20px",
            boxShadow: "0 10px 30px rgba(16, 24, 40, 0.05)",
            padding: "28px",
          }}
        >
          <div className="profile-card-heading" style={{ marginBottom: "20px" }}>
            <div>
              <span className="profile-section-kicker">MUSIC CATALOG</span>
              <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#101828", margin: "4px 0 0" }}>
                Published Tracks ({creatorTracks.length})
              </h2>
            </div>
          </div>
          <div className="creator-tracks-list">
            {creatorTracks.map((track, idx) => {
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
                    onClick={() => onPlayTrack(track, creatorTracks, `Creator • ${profile.displayName}`)}
                  >
                    <img
                      src={track.coverUrl ?? covers.dawn}
                      alt=""
                      onError={(e) => {
                        e.currentTarget.src = covers.dawn;
                      }}
                    />
                    <button
                      className="row-hover-play"
                      aria-label={`Play ${track.title}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlayTrack(track, creatorTracks, `Creator • ${profile.displayName}`);
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
                    <span className="row-album-name">{track.album?.title ?? "Single"}</span>
                  </div>

                  <span className="row-plays">
                    <HeadphonesIcon width={12} height={12} /> {formatPlays(track.playCount)}
                  </span>

                  <span className="row-duration">{formatDuration(track.durationMs)}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
