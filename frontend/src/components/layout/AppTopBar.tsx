import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  DashboardIcon,
  LogoutIcon,
  PauseIcon,
  PlayIcon,
  SearchIcon,
  ShieldIcon,
  UploadIcon,
  UserIcon,
} from "../../icons";
import { NotificationDropdown } from "./NotificationDropdown";
import { searchApi } from "../../api/search";
import type { CurrentUser, LandingTrack, UnifiedSearchResponse } from "../../types";

const DEFAULT_COVER_FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300' width='300' height='300'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%230284C7'/%3E%3Cstop offset='100%25' stop-color='%230369A1'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='300' height='300' fill='url(%23bg)' rx='12'/%3E%3Ccircle cx='150' cy='150' r='54' fill='none' stroke='rgba(255,255,255,0.2)' stroke-width='4'/%3E%3Cpath d='M140 120v40a16 16 0 1 0 10 14.8V132l24-6v24a16 16 0 1 0 10 14.8V114l-44 6z' fill='%23ffffff'/%3E%3C/svg%3E";

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
    const hash = window.location.hash;
    if (hash.includes("/search")) {
      const match = hash.match(/[?&]q=([^&]*)/);
      if (match) return decodeURIComponent(match[1]);
    }
    return "";
  });
  const [searchWarning, setSearchWarning] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [liveResults, setLiveResults] = useState<UnifiedSearchResponse | null>(null);
  const [liveLoading, setLiveLoading] = useState(false);

  const actionsRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchCacheRef = useRef<Map<string, UnifiedSearchResponse>>(new Map());
  const currentQueryRef = useRef<string>("");

  useEffect(() => setUnreadCount(unreadNotifications), [unreadNotifications]);

  // Keep search keyword in sync with URL changes
  useEffect(() => {
    const syncQueryFromUrl = () => {
      const hash = window.location.hash;
      if (hash.includes("/search")) {
        const match = hash.match(/[?&]q=([^&]*)/);
        if (match) {
          setSearchKeyword(decodeURIComponent(match[1]));
        }
      }
    };
    window.addEventListener("hashchange", syncQueryFromUrl);
    return () => window.removeEventListener("hashchange", syncQueryFromUrl);
  }, []);

  // Live Instant Search Autocomplete with 0ms in-memory cache and race condition guard
  useEffect(() => {
    const trimmed = searchKeyword.trim();
    if (trimmed.length < 2) {
      setLiveResults(null);
      setLiveLoading(false);
      setDropdownOpen(false);
      return;
    }

    currentQueryRef.current = trimmed;

    // Instant cache return (0ms response)
    const cached = searchCacheRef.current.get(trimmed);
    if (cached) {
      setLiveResults(cached);
      setDropdownOpen(true);
      setLiveLoading(false);
      return;
    }

    setLiveLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await searchApi.search({ q: trimmed, type: "ALL", page: 0, size: 5 });
        if (currentQueryRef.current === trimmed) {
          const totalFound =
            (res.tracks?.totalElements || 0) +
            (res.albums?.totalElements || 0) +
            (res.creators?.totalElements || 0) +
            (res.lyrics?.totalElements || 0);
          if (totalFound > 0) {
            searchCacheRef.current.set(trimmed, res);
          }
          setLiveResults(res);
          setDropdownOpen(true);
        }
      } catch (err) {
        if (currentQueryRef.current === trimmed) {
          console.error("Live autocomplete search failed:", err);
        }
      } finally {
        if (currentQueryRef.current === trimmed) {
          setLiveLoading(false);
        }
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [searchKeyword]);

  // Close live search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!searchContainerRef.current?.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        setDropdownOpen(false);
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

  // UC-9: Normal Flow NF01 & Exception EX01
  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = searchKeyword.trim();
    if (trimmed.length < 2) {
      setSearchWarning("Please enter at least 2 characters to search");
      setTimeout(() => setSearchWarning(null), 3500);
      return;
    }
    setSearchWarning(null);
    setDropdownOpen(false);
    onNavigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const hasDashboardAccess = user?.role === "ADMIN" || user?.role === "STAFF" || user?.role === "MODERATOR";
  const workspaceRoute = user?.role === "ADMIN"
    ? "/admin/dashboard"
    : (user?.role === "STAFF" || user?.role === "MODERATOR")
      ? "/staff/dashboard"
      : "/track/create";
  const workspaceLabel = hasDashboardAccess ? "Open dashboard" : "Upload music";

  const isLiveEmpty =
    liveResults &&
    liveResults.tracks.content.length === 0 &&
    liveResults.albums.content.length === 0 &&
    liveResults.creators.content.length === 0;

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
          minWidth: "320px",
          maxWidth: "820px",
          margin: "0 20px",
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
            onFocus={() => {
              if (searchKeyword.trim().length >= 2 && liveResults) {
                setDropdownOpen(true);
              }
            }}
            placeholder="Search tracks, albums, creators, or lyrics..."
            aria-label="Search catalog"
            style={{
              width: "100%",
              height: "46px",
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
                setDropdownOpen(false);
                setLiveResults(null);
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

        {/* Live Search Instant Autocomplete Dropdown */}
        {dropdownOpen && searchKeyword.trim().length >= 2 && (
          <div
            className="topbar-search-dropdown"
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              left: 0,
              right: 0,
              width: "100%",
              maxWidth: "100%",
              boxSizing: "border-box",
              maxHeight: "480px",
              overflowY: "auto",
              background: "#FFFFFF",
              border: "1px solid var(--sw-border, #E2E8F0)",
              borderRadius: "16px",
              boxShadow: "0 16px 36px rgba(15, 23, 42, 0.14), 0 4px 12px rgba(15, 23, 42, 0.06)",
              padding: "12px",
              zIndex: 1000,
            }}
          >
            {liveLoading && !liveResults && (
              <div style={{ padding: "20px", textAlign: "center", color: "#64748B", fontSize: "13px" }}>
                Searching songs, albums, and artists...
              </div>
            )}

            {!liveLoading && isLiveEmpty && (
              <div style={{ padding: "20px", textAlign: "center", color: "#64748B", fontSize: "13px" }}>
                No published songs, albums, or artists found for "{searchKeyword.trim()}".
              </div>
            )}

            {liveResults && (
              <>
                {/* 1. Songs Section */}
                {liveResults.tracks.content.length > 0 && (
                  <div className="topbar-results-section" style={{ marginBottom: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 8px 6px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Songs
                      </span>
                      <span style={{ fontSize: "10.5px", fontWeight: 700, color: "#0284C7", background: "#E0F2FE", padding: "1px 6px", borderRadius: "8px" }}>
                        {liveResults.tracks.totalElements}
                      </span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      {liveResults.tracks.content.slice(0, 4).map((track) => {
                        const isTrackPlaying = currentTrack?.id === track.id && playing;

                        return (
                          <div
                            key={track.id}
                            className="topbar-dropdown-item"
                            onClick={() => {
                              setDropdownOpen(false);
                              onNavigate(`/search?q=${encodeURIComponent(searchKeyword.trim())}`);
                            }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                              padding: "6px 8px",
                              borderRadius: "10px",
                              cursor: "pointer",
                              transition: "background 0.15s ease",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#F8FAFC")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            <div style={{ position: "relative", width: "38px", height: "38px", borderRadius: "8px", overflow: "hidden", flexShrink: 0 }}>
                              <img
                                src={track.coverUrl || DEFAULT_COVER_FALLBACK}
                                alt=""
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = DEFAULT_COVER_FALLBACK;
                                }}
                              />
                              {onPlayTrack && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onPlayTrack(track);
                                  }}
                                  aria-label={isTrackPlaying ? "Pause" : "Play"}
                                  style={{
                                    position: "absolute",
                                    inset: 0,
                                    background: "rgba(0,0,0,0.45)",
                                    border: "none",
                                    cursor: "pointer",
                                    color: "#FFFFFF",
                                    display: "grid",
                                    placeItems: "center",
                                  }}
                                >
                                  {isTrackPlaying ? <PauseIcon width={15} height={15} /> : <PlayIcon width={15} height={15} />}
                                </button>
                              )}
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#0F172A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {track.title}
                              </div>
                              <div style={{ fontSize: "12px", color: "#64748B", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {track.creator?.displayName || "Unknown Artist"} {track.album ? `• ${track.album.title}` : ""}
                              </div>
                            </div>

                            <span style={{ fontSize: "11px", color: "#0284C7", background: "#F0F9FF", padding: "2px 6px", borderRadius: "6px", fontWeight: 600, flexShrink: 0 }}>
                              Play
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. Albums Section */}
                {liveResults.albums.content.length > 0 && (
                  <div className="topbar-results-section" style={{ marginBottom: "10px", borderTop: "1px dashed #E2E8F0", paddingTop: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 8px 6px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Albums
                      </span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      {liveResults.albums.content.slice(0, 3).map((album) => (
                        <div
                          key={album.id}
                          className="topbar-dropdown-item"
                          onClick={() => {
                            setDropdownOpen(false);
                            onNavigate(`/album/${album.id}`);
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "6px 8px",
                            borderRadius: "10px",
                            cursor: "pointer",
                            transition: "background 0.15s ease",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#F8FAFC")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <img
                            src={album.coverUrl || DEFAULT_COVER_FALLBACK}
                            alt=""
                            style={{ width: "36px", height: "36px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#0F172A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {album.title}
                            </div>
                            <div style={{ fontSize: "12px", color: "#64748B", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {album.creator?.displayName || "SoundWave Artist"} • {album.trackCount} tracks
                            </div>
                          </div>
                          <span style={{ fontSize: "11px", color: "#64748B", flexShrink: 0 }}>
                            Album
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Creators Section */}
                {liveResults.creators.content.length > 0 && (
                  <div className="topbar-results-section" style={{ marginBottom: "10px", borderTop: "1px dashed #E2E8F0", paddingTop: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 8px 6px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Artists & Creators
                      </span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      {liveResults.creators.content.slice(0, 3).map((creator) => (
                        <div
                          key={creator.userId}
                          className="topbar-dropdown-item"
                          onClick={() => {
                            setDropdownOpen(false);
                            onNavigate(`/creator/${creator.userId}`);
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "6px 8px",
                            borderRadius: "10px",
                            cursor: "pointer",
                            transition: "background 0.15s ease",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#F8FAFC")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <img
                            src={creator.avatarUrl || DEFAULT_COVER_FALLBACK}
                            alt=""
                            style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#0F172A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {creator.displayName}
                            </div>
                            <div style={{ fontSize: "12px", color: "#64748B", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              @{creator.username} • {creator.trackCount} releases
                            </div>
                          </div>
                          <span style={{ fontSize: "11px", color: "#64748B", flexShrink: 0 }}>
                            Artist
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Action: View Full Results Page */}
                <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: "8px", textAlign: "center" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      onNavigate(`/search?q=${encodeURIComponent(searchKeyword.trim())}`);
                    }}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "none",
                      background: "#F0F9FF",
                      color: "#0284C7",
                      fontSize: "12.5px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      transition: "background 0.15s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#E0F2FE")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#F0F9FF")}
                  >
                    <span>View all results for "{searchKeyword.trim()}"</span>
                    <ChevronRightIcon width={14} height={14} />
                  </button>
                </div>
              </>
            )}
          </div>
        )}

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
                  <span>Log out</span>
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
              Log in
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
