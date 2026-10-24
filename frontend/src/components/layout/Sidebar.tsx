import { ClockIcon, CompassIcon, DashboardIcon, DiscIcon, FilterIcon, HeartIcon, LibraryIcon, PlusIcon, ShieldIcon, TrophyIcon, UploadIcon } from "../../icons";
import type { CurrentUser } from "../../types";

type Props = {
  activeRoute: string;
  onNavigate: (route: string) => void;
  onCreatePlaylist: () => void;
  isAuthenticated: boolean;
  userRole?: CurrentUser["role"];
};

export function Sidebar({ activeRoute, onNavigate, onCreatePlaylist, isAuthenticated, userRole }: Props) {
  const isCurrent = (route: string) => activeRoute === route || (route !== "/" && activeRoute.startsWith(route));

  return (
    <aside className="app-sidebar" aria-label="Main navigation">
      <div className="sidebar-brand">
        <button className="brand" onClick={() => onNavigate("/")} aria-label="Go to SoundWave home">
          <img className="brand-mark" src="/soundwave-logo.png" alt="SoundWave logo" />
          <span>SoundWave</span>
        </button>
      </div>

      <nav className="sidebar-nav">
        {userRole === "ADMIN" ? (
          <div className="nav-group">
            <span className="nav-group-title">SYSTEM ADMINISTRATION</span>
            <button
              className={`nav-item ${isCurrent("/admin") ? "nav-item--active" : ""}`}
              onClick={() => onNavigate("/admin/dashboard")}
            >
              <ShieldIcon />
              <span>Administration overview</span>
              <small className="sidebar-badge">ADMIN</small>
            </button>
          </div>
        ) : userRole === "STAFF" || userRole === "MODERATOR" ? (
          <div className="nav-group">
            <span className="nav-group-title">STAFF WORKSPACE</span>
            <button
              className={`nav-item ${isCurrent("/staff") ? "nav-item--active" : ""}`}
              onClick={() => onNavigate("/staff/dashboard")}
            >
              <DashboardIcon />
              <span>Moderation dashboard</span>
              <small className="sidebar-badge">STAFF</small>
            </button>
          </div>
        ) : null}

        <div className="nav-group">
          <span className="nav-group-title">DISCOVER</span>
          <button
            className={`nav-item ${activeRoute === "/" || activeRoute === "/home" || (activeRoute.startsWith("/explore") && !activeRoute.includes("genre")) ? "nav-item--active" : ""}`}
            onClick={() => onNavigate("/")}
          >
            <CompassIcon />
            <span>Explore</span>
          </button>
          <button
            className={`nav-item ${isCurrent("/ranking") || isCurrent("/charts") ? "nav-item--active" : ""}`}
            onClick={() => onNavigate("/ranking")}
          >
            <TrophyIcon width={18} height={18} />
            <span>Top Charts</span>
          </button>
          <button
            className={`nav-item ${activeRoute.startsWith("/browse") || activeRoute.includes("genre") ? "nav-item--active" : ""}`}
            onClick={() => onNavigate("/browse")}
          >
            <FilterIcon width={18} height={18} />
            <span>Browse Catalog</span>
          </button>
          <button
            className={`nav-item ${isCurrent("/albums") && !activeRoute.includes("create") ? "nav-item--active" : ""}`}
            onClick={() => onNavigate("/albums")}
          >
            <DiscIcon width={18} height={18} />
            <span>Albums</span>
          </button>
        </div>

        <div className="nav-group">
          <span className="nav-group-title">YOUR LIBRARY</span>
          <button
            className={`nav-item ${isCurrent("/favorites") ? "nav-item--active" : ""}`}
            onClick={() => onNavigate("/favorites")}
          >
            <HeartIcon />
            <span>Favorite tracks</span>
          </button>
          {/* [FEATURE]: Đồng bộ active highlight khi xem Playlists hoặc chi tiết Playlist */}
          <button
            className={`nav-item ${activeRoute === "/playlists" || activeRoute.startsWith("/playlist") ? "nav-item--active" : ""}`}
            onClick={() => onNavigate("/playlists")}
          >
            <LibraryIcon />
            <span>Playlists</span>
          </button>
          {isAuthenticated && (
            <button
              className={`nav-item ${isCurrent("/history") ? "nav-item--active" : ""}`}
              onClick={() => onNavigate("/history")}
            >
              <ClockIcon />
              <span>Listening history</span>
            </button>
          )}
        </div>

        {/* [FEATURE]: CONTENT STUDIO - Thay nút Studio bằng My Tracks (/track) & My Albums (/album), duy trì active highlight */}
        {isAuthenticated && (
          <div className="nav-group">
            <span className="nav-group-title">CONTENT STUDIO</span>
            <button
              className={`nav-item ${
                activeRoute === "/track" ||
                activeRoute === "/tracks" ||
                activeRoute === "/studio" ||
                activeRoute.startsWith("/track/submission") ||
                activeRoute.startsWith("/track/details") ||
                activeRoute.startsWith("/track/create") ||
                activeRoute.startsWith("/track/upload") ||
                activeRoute.startsWith("/track/edit") ||
                activeRoute.startsWith("/studio/track")
                  ? "nav-item--active"
                  : ""
              }`}
              onClick={() => onNavigate("/track")}
            >
              <UploadIcon width={18} height={18} />
              <span>My Tracks</span>
            </button>
            <button
              className={`nav-item ${
                activeRoute === "/album" ||
                activeRoute.startsWith("/album/submission") ||
                activeRoute.startsWith("/album/manage") ||
                activeRoute.startsWith("/album/details") ||
                activeRoute.startsWith("/album/create") ||
                activeRoute.startsWith("/studio/album")
                  ? "nav-item--active"
                  : ""
              }`}
              onClick={() => onNavigate("/album")}
            >
              <DiscIcon width={18} height={18} />
              <span>My Albums</span>
            </button>
          </div>
        )}
      </nav>

      <div className="sidebar-playlist-cta">
        <button className="button button-secondary button-small create-playlist-btn" onClick={onCreatePlaylist}>
          <PlusIcon width={16} height={16} />
          <span>Create playlist</span>
        </button>
      </div>

      {!isAuthenticated && (
        <div className="sidebar-guest-card">
          <p className="guest-card-title">Join SoundWave</p>
          <p className="guest-card-text">Log in to create playlists and upload your own tracks.</p>
          <button className="button button-primary button-small" onClick={() => onNavigate("/login")}>
            Login now
          </button>
        </div>
      )}
    </aside>
  );
}
