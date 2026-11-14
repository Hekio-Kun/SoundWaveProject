import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  DashboardIcon,
  FlagIcon,
  LogoutIcon,
  SearchIcon,
  ShieldIcon,
  UploadIcon,
  UserIcon,
} from "../../icons";
import { NotificationDropdown } from "./NotificationDropdown";
import type { CurrentUser, LandingTrack } from "../../types";
import { LOCATION_CHANGE_EVENT } from "../../utils/navigation";

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
  onPlayTrack,
  currentTrack,
  playing = false,
}: Props) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(unreadNotifications);

  // Search input & live autocomplete state (UC-9: Search Public Catalog)
  const [searchKeyword, setSearchKeyword] = useState(() => {
    const pathname = window.location.pathname;
    if (pathname.startsWith("/search/")) {
      return decodeURIComponent(pathname.slice("/search/".length));
    }
    if (pathname === "/search") {
      return new URLSearchParams(window.location.search).get("q") || "";
    }
    return "";
  });
  const [searchWarning, setSearchWarning] = useState<string | null>(null);

  const actionsRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => setUnreadCount(unreadNotifications), [unreadNotifications]);

  // Keep search keyword in sync with URL changes (/search/:query and /search?q=...)
  useEffect(() => {
    const syncQueryFromUrl = () => {
      const pathname = window.location.pathname;
      if (pathname.startsWith("/search/")) {
        setSearchKeyword(decodeURIComponent(pathname.slice("/search/".length)));
        return;
      }
      if (pathname === "/search") {
        const q = new URLSearchParams(window.location.search).get("q");
        setSearchKeyword(q ?? "");
      }
    };
    syncQueryFromUrl();
    window.addEventListener("popstate", syncQueryFromUrl);
    window.addEventListener(LOCATION_CHANGE_EVENT, syncQueryFromUrl);
    return () => {
      window.removeEventListener("popstate", syncQueryFromUrl);
      window.removeEventListener(LOCATION_CHANGE_EVENT, syncQueryFromUrl);
    };
  }, []);

  // Spotify-style live typing: typing updates the route to /search/:query
  useEffect(() => {
    const trimmed = searchKeyword.trim();
    if (!trimmed) {
      if (window.location.pathname.startsWith("/search")) {
        onNavigate("/");
      }
      return;
    }

    if (trimmed.length < 2) return;

    const timer = setTimeout(() => {
      const currentPath = window.location.pathname;
      const targetPath = `/search/${encodeURIComponent(trimmed)}`;
      if (currentPath !== targetPath) {
        onNavigate(targetPath);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchKeyword, onNavigate]);

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
    const event = new CustomEvent("soundwave:back", { cancelable: true });
    const notCancelled = window.dispatchEvent(event);
    if (notCancelled) {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        onNavigate("/");
      }
    }
  };

  const handleForward = () => {
    window.history.forward();
  };

  // UC-9: Spotify-styled submit to /search/:query
  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = searchKeyword.trim();
    if (!trimmed) {
      // User pressed enter without typing anything -> do nothing, stay on current page
      return;
    }
    if (trimmed.length < 2) {
      setSearchWarning("Please enter at least 2 characters to search");
      setTimeout(() => setSearchWarning(null), 3500);
      return;
    }
    setSearchWarning(null);
    onNavigate(`/search/${encodeURIComponent(trimmed)}`);
  };

  const hasDashboardAccess = user?.role === "ADMIN" || user?.role === "STAFF" || user?.role === "MODERATOR";
  const workspaceRoute = user?.role === "ADMIN"
    ? "/admin/dashboard"
    : (user?.role === "STAFF" || user?.role === "MODERATOR")
      ? "/staff/dashboard"
      : "/track/create";
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

      {/* UC-9: Global Public Catalog Search Bar (Spotify-styled prominent search pill) */}
      <div
        className="topbar-search-container"
        ref={searchContainerRef}
        style={{
          flex: 1,
          minWidth: "260px",
          maxWidth: "480px",
          margin: "0 16px",
          position: "relative",
          display: "flex",
          alignItems: "center",
        }}
      >
        <form
          onSubmit={handleSearchSubmit}
          style={{ width: "100%", position: "relative", display: "flex", alignItems: "center" }}
          role="search"
        >
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => {
              setSearchKeyword(e.target.value);
              if (searchWarning && e.target.value.trim().length >= 2) {
                setSearchWarning(null);
              }
            }}
            placeholder="Artists, tracks, or your next favorite sound"
            aria-label="Search catalog"
            style={{
              width: "100%",
              height: "42px",
              padding: "0 46px 0 50px",
              borderRadius: "9999px",
              border: searchWarning ? "1.5px solid #EF4444" : "1px solid var(--sw-border, #E2E8F0)",
              background: "#F1F5F9",
              color: "var(--sw-text-h, #0F172A)",
              fontSize: "14px",
              outline: "none",
              transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
            }}
            onMouseEnter={(e) => {
              if (document.activeElement !== e.currentTarget && !searchWarning) {
                e.currentTarget.style.borderColor = "#CBD5E1";
              }
            }}
            onMouseLeave={(e) => {
              if (document.activeElement !== e.currentTarget && !searchWarning) {
                e.currentTarget.style.borderColor = "var(--sw-border, #E2E8F0)";
              }
            }}
          />
          <button
            type="submit"
            aria-label="Search"
            style={{
              position: "absolute",
              left: "16px",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#64748B",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
            }}
          >
            <SearchIcon width={19} height={19} />
          </button>
          {searchKeyword && (
            <button
              type="button"
              onClick={() => {
                setSearchKeyword("");
                setSearchWarning(null);
                if (window.location.pathname.startsWith("/search")) {
                  onNavigate("/");
                }
              }}
              aria-label="Clear search keyword"
              style={{
                position: "absolute",
                right: "14px",
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                background: "#CBD5E1",
                border: "none",
                cursor: "pointer",
                color: "#1E293B",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#94A3B8")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#CBD5E1")}
            >
              <CloseIcon width={12} height={12} />
            </button>
          )}
        </form>

        {/* EX01: Inline guidance notification when keyword is < 2 characters */}
        {searchWarning && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              left: "16px",
              background: "#FEF2F2",
              color: "#B91C1C",
              border: "1px solid #FECACA",
              borderRadius: "8px",
              padding: "6px 14px",
              fontSize: "12.5px",
              fontWeight: 500,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              zIndex: 100,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              whiteSpace: "nowrap",
            }}
          >
            <span>⚠️</span>
            <span>{searchWarning}</span>
          </div>
        )}
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
          <div className="topbar-user-menu" style={{ position: "relative" }}>
            <button
              className="user-profile-btn"
              onClick={() => {
                setUserMenuOpen((open) => !open);
              }}
              aria-label="Account menu"
              aria-expanded={userMenuOpen}
              aria-controls="account-popover"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "4px 12px 4px 6px",
                borderRadius: "24px",
                border: "1px solid var(--sw-border, #E2E8F0)",
                background: "#FFFFFF",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt=""
                  className="user-avatar"
                  style={{ width: "30px", height: "30px", borderRadius: "50%", objectFit: "cover" }}
                />
              ) : (
                <span
                  className="user-avatar"
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    background: "#E0F2FE",
                    color: "#0284C7",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <UserIcon width={16} height={16} />
                </span>
              )}
              <span className="user-display-name" style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--sw-text-h, #0F172A)" }}>
                {user.displayName || user.username}
              </span>
              <span style={{ fontSize: "11px", color: "#64748B", marginLeft: "2px" }}>▾</span>
            </button>

            {userMenuOpen && (
              <div
                id="account-popover"
                className="user-dropdown"
                role="menu"
                style={{
                  position: "absolute",
                  top: "calc(100% + 10px)",
                  right: 0,
                  width: "230px",
                  background: "#FFFFFF",
                  border: "1px solid var(--sw-border, #E2E8F0)",
                  borderRadius: "14px",
                  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.12), 0 2px 6px rgba(15, 23, 42, 0.04)",
                  padding: "6px",
                  zIndex: 100,
                  display: "flex",
                  flexDirection: "column",
                  animation: "dialog-in 0.16s ease-out",
                }}
              >
                <div
                  className="dropdown-header"
                  style={{
                    padding: "10px 12px 12px",
                    borderBottom: "1px solid #F1F5F9",
                    marginBottom: "4px",
                  }}
                >
                  <div
                    className="dropdown-user-name"
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "var(--sw-text-h, #0F172A)",
                      lineHeight: "1.3",
                    }}
                  >
                    {user.displayName || user.username}
                  </div>
                  <div
                    className="dropdown-user-email"
                    style={{
                      fontSize: "12px",
                      color: "#64748B",
                      marginTop: "3px",
                      wordBreak: "break-all",
                    }}
                  >
                    {user.email}
                  </div>
                </div>

                <button
                  className="dropdown-item"
                  onClick={() => {
                    setUserMenuOpen(false);
                    onNavigate("/profile");
                  }}
                  role="menuitem"
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "9px 12px",
                    border: "none",
                    background: "transparent",
                    borderRadius: "8px",
                    fontSize: "13.5px",
                    fontWeight: 500,
                    color: "#334155",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#F0F9FF";
                    e.currentTarget.style.color = "#0284C7";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#334155";
                  }}
                >
                  <UserIcon width={16} height={16} />
                  <span>Your profile</span>
                </button>

                <button
                  className="dropdown-item"
                  onClick={() => {
                    setUserMenuOpen(false);
                    onNavigate("/reports");
                  }}
                  role="menuitem"
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "9px 12px",
                    border: "none",
                    background: "transparent",
                    borderRadius: "8px",
                    fontSize: "13.5px",
                    fontWeight: 500,
                    color: "#334155",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#F0F9FF";
                    e.currentTarget.style.color = "#0284C7";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#334155";
                  }}
                >
                  <FlagIcon width={16} height={16} />
                  <span>Reports history</span>
                </button>

                <button
                  className="dropdown-item"
                  onClick={() => {
                    setUserMenuOpen(false);
                    onNavigate("/track");
                  }}
                  role="menuitem"
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "9px 12px",
                    border: "none",
                    background: "transparent",
                    borderRadius: "8px",
                    fontSize: "13.5px",
                    fontWeight: 500,
                    color: "#334155",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#F0F9FF";
                    e.currentTarget.style.color = "#0284C7";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#334155";
                  }}
                >
                  <UploadIcon width={16} height={16} />
                  <span>Content Studio</span>
                </button>

                {(user.role === "ADMIN" || user.role === "STAFF" || user.role === "MODERATOR") && (
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setUserMenuOpen(false);
                      onNavigate(user.role === "ADMIN" ? "/admin/dashboard" : "/staff/dashboard");
                    }}
                    role="menuitem"
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "9px 12px",
                      border: "none",
                      background: "transparent",
                      borderRadius: "8px",
                      fontSize: "13.5px",
                      fontWeight: 500,
                      color: "#334155",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#F0F9FF";
                      e.currentTarget.style.color = "#0284C7";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#334155";
                    }}
                  >
                    {user.role === "ADMIN" ? (
                      <ShieldIcon width={16} height={16} />
                    ) : (
                      <DashboardIcon width={16} height={16} />
                    )}
                    <span>{user.role === "ADMIN" ? "Admin dashboard" : "Staff dashboard"}</span>
                  </button>
                )}

                <div style={{ height: "1px", background: "#F1F5F9", margin: "4px 0" }} />

                <button
                  className="dropdown-item dropdown-item--danger"
                  onClick={() => {
                    setUserMenuOpen(false);
                    onLogout();
                  }}
                  role="menuitem"
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "9px 12px",
                    border: "none",
                    background: "transparent",
                    borderRadius: "8px",
                    fontSize: "13.5px",
                    fontWeight: 500,
                    color: "#EF4444",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#FEF2F2";
                    e.currentTarget.style.color = "#DC2626";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#EF4444";
                  }}
                >
                  <LogoutIcon width={16} height={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        ) : !isAuthenticated ? (
          <div className="topbar-guest-actions">
            <button
              className="button button-ghost button-small"
              onClick={() => onNavigate("/login")}
            >
              Login
            </button>
            <button
              className="button button-primary button-small"
              onClick={() => onNavigate("/register")}
            >
              Sign up
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
