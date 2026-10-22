import { useEffect, useRef, useState } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DashboardIcon,
  LogoutIcon,
  SearchIcon,
  ShieldIcon,
  UploadIcon,
  UserIcon,
} from "../../icons";
import { NotificationDropdown } from "./NotificationDropdown";
import type { CurrentUser, LandingTrack } from "../../types";

type Props = {
  user: CurrentUser | null;
  isAuthenticated: boolean;
  onNavigate: (route: string) => void;
  onLogout: () => void;
  unreadNotifications?: number;
  onPlayTrack?: (track: LandingTrack) => void;
  currentTrack?: LandingTrack | null;
  playing?: boolean;
};

export function AppTopBar({
  user,
  isAuthenticated,
  onNavigate,
  onLogout,
  unreadNotifications = 0,
}: Props) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(unreadNotifications);

  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => setUnreadCount(unreadNotifications), [unreadNotifications]);

  // Handle outside clicks and keyboard events for User menu
  useEffect(() => {
    if (!userMenuOpen) return;
    const closeMenus = (event: MouseEvent) => {
      if (!actionsRef.current?.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", closeMenus);
    document.addEventListener("keydown", closeWithEscape);
    return () => {
      document.removeEventListener("mousedown", closeMenus);
      document.removeEventListener("keydown", closeWithEscape);
    };
  }, [userMenuOpen]);

  const handleBack = () => {
    window.history.back();
  };

  const handleForward = () => {
    window.history.forward();
  };

  const hasDashboardAccess = user?.role === "ADMIN" || user?.role === "STAFF" || user?.role === "MODERATOR";
  const workspaceRoute = user?.role === "ADMIN"
    ? "/admin/dashboard"
    : (user?.role === "STAFF" || user?.role === "MODERATOR")
    ? "/staff/dashboard"
    : "/studio/upload";
  const workspaceLabel = hasDashboardAccess ? "Open dashboard" : "Upload music";

  return (
    <header className="app-topbar">
      <div className="topbar-nav-controls">
        <button className="topbar-nav-btn" onClick={handleBack} aria-label="Back">
          <ChevronLeftIcon width={18} height={18} />
        </button>
        <button className="topbar-nav-btn" onClick={handleForward} aria-label="Forward">
          <ChevronRightIcon width={18} height={18} />
        </button>
      </div>

      <div className="topbar-search-container" style={{ position: "relative", flex: 1, maxWidth: 520 }}>
        <div className="topbar-search" role="search">
          <SearchIcon width={18} height={18} />
          <input
            type="search"
            readOnly
            placeholder="Search tracks, albums, creators..."
            aria-label="Search music"
          />
        </div>
      </div>

      <div className="topbar-actions" ref={actionsRef}>
        {isAuthenticated && (
          <button
            className="button button-ghost button-small topbar-upload-btn"
            onClick={() => onNavigate(workspaceRoute)}
            aria-label={workspaceLabel}
          >
            {user?.role === "ADMIN" ? (
              <ShieldIcon width={16} height={16} />
            ) : (user?.role === "STAFF" || user?.role === "MODERATOR") ? (
              <DashboardIcon width={16} height={16} />
            ) : (
              <UploadIcon width={16} height={16} />
            )}
            <span>{workspaceLabel}</span>
          </button>
        )}

        {isAuthenticated && (
          <NotificationDropdown
            unreadCount={unreadCount}
            onNavigate={onNavigate}
            onMarkAllRead={() => setUnreadCount(0)}
          />
        )}

        {isAuthenticated && user ? (
          <div className="topbar-user-wrapper">
            <button
              className={`topbar-user-btn ${userMenuOpen ? "is-active" : ""}`}
              onClick={() => {
                setUserMenuOpen((open) => !open);
              }}
              aria-label="Account menu"
              aria-expanded={userMenuOpen}
              aria-controls="account-popover"
            >
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="topbar-avatar" />
              ) : (
                <span className="topbar-avatar topbar-avatar--fallback">
                  <UserIcon width={16} height={16} />
                </span>
              )}
              <span className="topbar-username">{user.displayName}</span>
              <ChevronRightIcon width={14} height={14} className="topbar-user-chevron" />
            </button>

            {userMenuOpen && (
              <div className="user-dropdown-menu" id="account-popover" role="menu">
                <div className="dropdown-user-info">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" />
                  ) : (
                    <span className="dropdown-avatar-fallback">
                      <UserIcon width={20} height={20} />
                    </span>
                  )}
                  <div>
                    <span className="user-role-tag">{user.role}</span>
                    <p className="dropdown-name">{user.displayName}</p>
                    <p className="dropdown-email">{user.email}</p>
                  </div>
                </div>
                <div className="dropdown-section-label">ACCOUNT</div>
                {user.role === "ADMIN" || user.role === "STAFF" || user.role === "MODERATOR" ? (
                  <button
                    className="dropdown-item"
                    role="menuitem"
                    onClick={() => {
                      setUserMenuOpen(false);
                      onNavigate(user.role === "ADMIN" ? "/admin/dashboard" : "/staff/dashboard");
                    }}
                  >
                    <span className="dropdown-item-icon">
                      <DashboardIcon width={16} height={16} />
                    </span>
                    <span>
                      <strong>{user.role === "ADMIN" ? "Administration" : "Moderation"}</strong>
                      <small>Open your dashboard</small>
                    </span>
                    <ChevronRightIcon width={15} height={15} />
                  </button>
                ) : null}
                <button
                  className="dropdown-item"
                  role="menuitem"
                  onClick={() => {
                    setUserMenuOpen(false);
                    onNavigate("/profile");
                  }}
                >
                  <span className="dropdown-item-icon">
                    <UserIcon width={16} height={16} />
                  </span>
                  <span>
                    <strong>My profile</strong>
                    <small>Manage your public identity</small>
                  </span>
                  <ChevronRightIcon width={15} height={15} />
                </button>
                <button
                  className="dropdown-item"
                  role="menuitem"
                  onClick={() => {
                    setUserMenuOpen(false);
                    onNavigate("/studio");
                  }}
                >
                  <span className="dropdown-item-icon">
                    <UploadIcon width={16} height={16} />
                  </span>
                  <span>
                    <strong>Content Studio</strong>
                    <small>Tracks, albums and reports</small>
                  </span>
                  <ChevronRightIcon width={15} height={15} />
                </button>
                <div className="dropdown-divider" />
                <button
                  className="dropdown-item dropdown-item--danger"
                  role="menuitem"
                  onClick={() => {
                    setUserMenuOpen(false);
                    onLogout();
                  }}
                >
                  <span className="dropdown-item-icon">
                    <LogoutIcon width={15} height={15} />
                  </span>
                  <span>
                    <strong>Log out</strong>
                    <small>End this session safely</small>
                  </span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="topbar-auth-buttons">
            <button className="button button-ghost button-small" onClick={() => onNavigate("/login")}>
              Login
            </button>
            <button className="button button-primary button-small" onClick={() => onNavigate("/register")}>
              Register
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
