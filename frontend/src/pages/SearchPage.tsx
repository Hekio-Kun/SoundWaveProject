import React, { useCallback, useEffect, useState } from "react";
import { searchApi, type SearchCategoryType } from "../api/search";
import type {
  CurrentUser,
  CreatorSearchResult,
  LandingTrack,
  LyricSearchResult,
  PublicAlbum,
  UnifiedSearchResponse,
} from "../types";
import {
  CompassIcon,
  DiscIcon,
  HeadphonesIcon,
  MusicIcon,
  PauseIcon,
  PlayIcon,
  RefreshIcon,
  SearchIcon,
  TrophyIcon,
  UserIcon,
} from "../icons";

const DEFAULT_COVER_FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300' width='300' height='300'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%230284C7'/%3E%3Cstop offset='100%25' stop-color='%230369A1'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='300' height='300' fill='url(%23bg)' rx='12'/%3E%3Ccircle cx='150' cy='150' r='54' fill='none' stroke='rgba(255,255,255,0.2)' stroke-width='4'/%3E%3Cpath d='M140 120v40a16 16 0 1 0 10 14.8V132l24-6v24a16 16 0 1 0 10 14.8V114l-44 6z' fill='%23ffffff'/%3E%3C/svg%3E";

const formatDuration = (ms?: number) => {
  if (!ms || ms <= 0) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

type Props = {
  initialQuery?: string;
  initialType?: SearchCategoryType;
  initialPage?: number;
  user: CurrentUser | null;
  currentTrack?: LandingTrack | null;
  playing?: boolean;
  onPlayTrack: (track: LandingTrack) => void;
  onNavigate: (route: string) => void;
};

export function SearchPage({
  initialQuery = "",
  initialType = "ALL",
  initialPage = 0,
  user,
  currentTrack,
  playing = false,
  onPlayTrack,
  onNavigate,
}: Props) {
  const [activeTab, setActiveTab] = useState<SearchCategoryType>(initialType);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [searchData, setSearchData] = useState<UnifiedSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pageCacheRef = React.useRef<Map<string, UnifiedSearchResponse>>(new Map());

  // Sync state when props change (URL query change)
  useEffect(() => {
    setActiveTab(initialType);
  }, [initialType]);

  useEffect(() => {
    setCurrentPage(initialPage);
  }, [initialPage]);

  // Execute Search query with instant caching
  const executeSearch = useCallback(async () => {
    const trimmed = initialQuery.trim();
    if (trimmed.length < 2) {
      setSearchData(null);
      setError(null);
      setLoading(false);
      return;
    }

    const cacheKey = `${trimmed}::${activeTab}::${currentPage}`;
    const cached = pageCacheRef.current.get(cacheKey);
    if (cached) {
      setSearchData(cached);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await searchApi.search({
        q: trimmed,
        type: activeTab,
        page: currentPage,
        size: activeTab === "ALL" ? 10 : 20,
      });
      const totalFound =
        (response.tracks?.totalElements || 0) +
        (response.albums?.totalElements || 0) +
        (response.creators?.totalElements || 0) +
        (response.lyrics?.totalElements || 0);
      if (totalFound > 0) {
        pageCacheRef.current.set(cacheKey, response);
      }
      setSearchData(response);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unable to complete search request. Please try again.";
      setError(msg);
      setSearchData(null);
    } finally {
      setLoading(false);
    }
  }, [initialQuery, activeTab, currentPage]);

  useEffect(() => {
    executeSearch();
  }, [executeSearch]);

  // Tab switching
  const handleTabChange = (newTab: SearchCategoryType) => {
    setActiveTab(newTab);
    setCurrentPage(0);
    const params = new URLSearchParams();
    if (initialQuery.trim()) params.set("q", initialQuery.trim());
    if (newTab !== "ALL") params.set("type", newTab);
    const qs = params.toString();
    onNavigate(`/search${qs ? `?${qs}` : ""}`);
  };

  // Pagination switching (AF03)
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    const params = new URLSearchParams();
    if (initialQuery.trim()) params.set("q", initialQuery.trim());
    if (activeTab !== "ALL") params.set("type", activeTab);
    if (newPage > 0) params.set("page", String(newPage));
    const qs = params.toString();
    onNavigate(`/search${qs ? `?${qs}` : ""}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Highlight search keyword in snippet (AF02)
  const renderHighlightedSnippet = (snippet: string, keyword: string) => {
    if (!snippet || !keyword) return snippet;
    const parts = snippet.split(new RegExp(`(${keyword})`, "gi"));
    return parts.map((part, index) =>
      part.toLowerCase() === keyword.toLowerCase() ? (
        <mark
          key={index}
          style={{
            background: "rgba(2, 132, 199, 0.16)",
            color: "#0284C7",
            padding: "1px 4px",
            borderRadius: "4px",
            fontWeight: 700,
          }}
        >
          {part}
        </mark>
      ) : (
        <span key={index}>{part}</span>
      )
    );
  };

  const trimmedQuery = initialQuery.trim();
  const isQueryTooShort = trimmedQuery.length < 2;

  // Empty state check across categories (AF01)
  const totalFound =
    (searchData?.tracks?.totalElements || 0) +
    (searchData?.albums?.totalElements || 0) +
    (searchData?.creators?.totalElements || 0) +
    (searchData?.lyrics?.totalElements || 0);
  const isZeroResult = !loading && !error && searchData && totalFound === 0;

  return (
    <div className="search-page-container" style={{ padding: "24px 32px 64px", maxWidth: "1280px", margin: "0 auto" }}>
      {/* Category Tabs (AF03: Navigate search result categories) */}
      <div
        className="search-tabs"
        style={{
          display: "flex",
          gap: "8px",
          alignItems: "center",
          marginBottom: "28px",
          borderBottom: "1px solid var(--sw-border, #E2E8F0)",
          paddingBottom: "12px",
          overflowX: "auto",
        }}
        role="tablist"
      >
        {(
          [
            { id: "ALL", label: "All" },
            { id: "SONGS", label: "Songs" },
            { id: "ALBUMS", label: "Albums" },
            { id: "CREATORS", label: "Creators" },
            { id: "LYRICS", label: "Lyrics" },
          ] as const
        ).map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => handleTabChange(tab.id)}
              style={{
                padding: "8px 18px",
                borderRadius: "20px",
                border: "none",
                background: isActive ? "#0284C7" : "transparent",
                color: isActive ? "#FFFFFF" : "#64748B",
                fontWeight: isActive ? 600 : 500,
                fontSize: "13.5px",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* State 1: Invalid/Empty Keyword (EX01 Prompt Guidance) */}
      {isQueryTooShort && (
        <div
          style={{
            textAlign: "center",
            padding: "80px 20px",
            background: "#FFFFFF",
            borderRadius: "16px",
            border: "1px dashed var(--sw-border, #E2E8F0)",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "#F0F9FF",
              color: "#0284C7",
              display: "grid",
              placeItems: "center",
              margin: "0 auto 16px",
            }}
          >
            <SearchIcon width={26} height={26} />
          </div>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--sw-text-h, #0F172A)", marginBottom: "8px" }}>
            Search Public Catalog
          </h2>
          <p style={{ color: "#64748B", fontSize: "14px", maxWidth: "440px", margin: "0 auto 24px", lineHeight: "1.5" }}>
            Enter at least 2 characters in the search bar above to discover published songs, albums, artists, or officially approved lyrics.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              className="button button-ghost button-small"
              onClick={() => onNavigate("/ranking")}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <TrophyIcon width={16} height={16} />
              <span>Explore Top Charts</span>
            </button>
            <button
              className="button button-ghost button-small"
              onClick={() => onNavigate("/browse")}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <CompassIcon width={16} height={16} />
              <span>Browse Catalog</span>
            </button>
          </div>
        </div>
      )}

      {/* State 2: Loading Skeleton */}
      {loading && (
        <div style={{ padding: "40px 0", textAlign: "center", color: "#64748B" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              border: "3px solid #E2E8F0",
              borderTopColor: "#0284C7",
              borderRadius: "50%",
              animation: "sw-spin 0.8s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <p style={{ fontSize: "14px" }}>Searching public catalog for "{trimmedQuery}"...</p>
        </div>
      )}

      {/* State 3: EX02 Search Service Failure (With Retry Button) */}
      {!loading && error && (
        <div
          style={{
            padding: "48px 24px",
            textAlign: "center",
            background: "#FEF2F2",
            border: "1px solid #FECACA",
            borderRadius: "16px",
            maxWidth: "540px",
            margin: "40px auto",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "#FEE2E2",
              color: "#EF4444",
              display: "grid",
              placeItems: "center",
              margin: "0 auto 16px",
            }}
          >
            ⚠️
          </div>
          <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#991B1B", marginBottom: "8px" }}>
            Search request failed
          </h3>
          <p style={{ color: "#7F1D1D", fontSize: "13.5px", marginBottom: "20px", lineHeight: "1.5" }}>
            {error}
          </p>
          <button
            className="button button-primary button-small"
            onClick={executeSearch}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", margin: "0 auto" }}
          >
            <RefreshIcon width={14} height={14} />
            <span>Retry Search</span>
          </button>
        </div>
      )}

      {/* State 4: AF01 No Result Empty State */}
      {!loading && !error && !isQueryTooShort && isZeroResult && (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "#FFFFFF",
            borderRadius: "16px",
            border: "1px solid var(--sw-border, #E2E8F0)",
            maxWidth: "600px",
            margin: "20px auto",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "#F8FAFC",
              color: "#94A3B8",
              display: "grid",
              placeItems: "center",
              margin: "0 auto 16px",
            }}
          >
            <SearchIcon width={24} height={24} />
          </div>
          <h3 style={{ fontSize: "19px", fontWeight: 700, color: "var(--sw-text-h, #0F172A)", marginBottom: "8px" }}>
            No results found for "{trimmedQuery}"
          </h3>
          <p style={{ color: "#64748B", fontSize: "14px", marginBottom: "20px", lineHeight: "1.5" }}>
            Please check your spelling, try different keywords, or switch to Lyric Search to match words inside songs.
          </p>

          <div
            style={{
              background: "#F8FAFC",
              padding: "16px 20px",
              borderRadius: "12px",
              textAlign: "left",
              marginBottom: "24px",
              fontSize: "13px",
              color: "#475569",
              lineHeight: "1.6",
            }}
          >
            <strong>Search tips:</strong>
            <ul style={{ margin: "6px 0 0", paddingLeft: "20px" }}>
              <li>Ensure all words are spelled correctly.</li>
              <li>Try searching by artist name, track title, or album release name.</li>
              <li>Try broader or fewer keywords.</li>
              <li>Switch to the <strong>Lyrics</strong> tab to search inside lyrics directly.</li>
            </ul>
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              className="button button-primary button-small"
              onClick={() => onNavigate("/ranking")}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <TrophyIcon width={16} height={16} />
              <span>Explore Top Charts</span>
            </button>
            <button
              className="button button-ghost button-small"
              onClick={() => onNavigate("/browse")}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <CompassIcon width={16} height={16} />
              <span>Browse Catalog</span>
            </button>
          </div>
        </div>
      )}

      {/* State 5: Grouped Results (Tab: ALL) */}
      {!loading && !error && !isQueryTooShort && !isZeroResult && activeTab === "ALL" && searchData && (
        <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
          {/* Top Result Card & Top Songs Row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: searchData.topResult ? "340px 1fr" : "1fr",
              gap: "28px",
              alignItems: "stretch",
            }}
          >
            {/* Top Result Card */}
            {searchData.topResult && (
              <div>
                <h3 style={{ fontSize: "17px", fontWeight: 700, color: "var(--sw-text-h, #0F172A)", marginBottom: "14px" }}>
                  Top Result
                </h3>
                <div
                  style={{
                    background: "#FFFFFF",
                    borderRadius: "16px",
                    padding: "24px",
                    border: "1px solid var(--sw-border, #E2E8F0)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                    display: "flex",
                    flexDirection: "column",
                    height: "calc(100% - 36px)",
                    boxSizing: "border-box",
                    justifyContent: "space-between",
                    position: "relative",
                  }}
                >
                  <div>
                    {searchData.topResult.type === "SONG" && searchData.topResult.track && (
                      <>
                        <div style={{ position: "relative", width: "100px", height: "100px", marginBottom: "16px" }}>
                          <img
                            src={searchData.topResult.track.coverUrl || DEFAULT_COVER_FALLBACK}
                            alt=""
                            style={{ width: "100%", height: "100%", borderRadius: "12px", objectFit: "cover" }}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = DEFAULT_COVER_FALLBACK;
                            }}
                          />
                        </div>
                        <h4 style={{ fontSize: "20px", fontWeight: 800, color: "var(--sw-text-h, #0F172A)", margin: "0 0 6px" }}>
                          {searchData.topResult.track.title}
                        </h4>
                        <p style={{ color: "#64748B", fontSize: "14px", margin: "0 0 12px" }}>
                          By {searchData.topResult.track.creator?.displayName || "Unknown Artist"}
                        </p>
                        <span
                          style={{
                            background: "#F0F9FF",
                            color: "#0284C7",
                            padding: "3px 10px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: 600,
                          }}
                        >
                          Song • {searchData.topResult.track.genreName || "Music"}
                        </span>
                      </>
                    )}

                    {searchData.topResult.type === "ALBUM" && searchData.topResult.album && (
                      <>
                        <div style={{ position: "relative", width: "100px", height: "100px", marginBottom: "16px" }}>
                          <img
                            src={searchData.topResult.album.coverUrl || DEFAULT_COVER_FALLBACK}
                            alt=""
                            style={{ width: "100%", height: "100%", borderRadius: "12px", objectFit: "cover" }}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = DEFAULT_COVER_FALLBACK;
                            }}
                          />
                        </div>
                        <h4 style={{ fontSize: "20px", fontWeight: 800, color: "var(--sw-text-h, #0F172A)", margin: "0 0 6px" }}>
                          {searchData.topResult.album.title}
                        </h4>
                        <p style={{ color: "#64748B", fontSize: "14px", margin: "0 0 12px" }}>
                          By {searchData.topResult.album.creator?.displayName || "SoundWave Artist"}
                        </p>
                        <span
                          style={{
                            background: "#FEF3C7",
                            color: "#D97706",
                            padding: "3px 10px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: 600,
                          }}
                        >
                          Album • {searchData.topResult.album.trackCount} tracks
                        </span>
                      </>
                    )}

                    {searchData.topResult.type === "CREATOR" && searchData.topResult.creator && (
                      <>
                        <div style={{ position: "relative", width: "100px", height: "100px", marginBottom: "16px" }}>
                          <img
                            src={searchData.topResult.creator.avatarUrl || DEFAULT_COVER_FALLBACK}
                            alt=""
                            style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = DEFAULT_COVER_FALLBACK;
                            }}
                          />
                        </div>
                        <h4 style={{ fontSize: "20px", fontWeight: 800, color: "var(--sw-text-h, #0F172A)", margin: "0 0 6px" }}>
                          {searchData.topResult.creator.displayName}
                        </h4>
                        <p style={{ color: "#64748B", fontSize: "14px", margin: "0 0 12px" }}>
                          @{searchData.topResult.creator.username}
                        </p>
                        <span
                          style={{
                            background: "#EDE9FE",
                            color: "#7C3AED",
                            padding: "3px 10px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: 600,
                          }}
                        >
                          Artist • {searchData.topResult.creator.trackCount} tracks
                        </span>
                      </>
                    )}
                  </div>

                  <div style={{ marginTop: "24px" }}>
                    {searchData.topResult.type === "SONG" && searchData.topResult.track && (
                      <button
                        className="button button-primary button-small"
                        onClick={() => searchData.topResult?.track && onPlayTrack(searchData.topResult.track)}
                        style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
                      >
                        {currentTrack?.id === searchData.topResult.track.id && playing ? (
                          <>
                            <PauseIcon width={16} height={16} />
                            <span>Pause</span>
                          </>
                        ) : (
                          <>
                            <PlayIcon width={16} height={16} />
                            <span>Play now</span>
                          </>
                        )}
                      </button>
                    )}

                    {searchData.topResult.type === "ALBUM" && searchData.topResult.album && (
                      <button
                        className="button button-primary button-small"
                        onClick={() => onNavigate(`/album/${searchData.topResult?.album?.id}`)}
                      >
                        View Album
                      </button>
                    )}

                    {searchData.topResult.type === "CREATOR" && searchData.topResult.creator && (
                      <button
                        className="button button-primary button-small"
                        onClick={() => onNavigate(`/creator/${searchData.topResult?.creator?.userId}`)}
                      >
                        View Profile
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Songs Preview */}
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <h3 style={{ fontSize: "17px", fontWeight: 700, color: "var(--sw-text-h, #0F172A)", margin: 0 }}>
                  Songs
                </h3>
                {searchData.tracks.totalElements > 4 && (
                  <button
                    className="button button-ghost button-small"
                    onClick={() => handleTabChange("SONGS")}
                    style={{ fontSize: "13px" }}
                  >
                    See all ({searchData.tracks.totalElements}) →
                  </button>
                )}
              </div>

              {searchData.tracks.content.length === 0 ? (
                <div style={{ padding: "24px", color: "#94A3B8", background: "#FFFFFF", borderRadius: "12px", border: "1px solid var(--sw-border)" }}>
                  No published songs matching "{trimmedQuery}".
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {searchData.tracks.content.slice(0, 4).map((track) => {
                    const isTrackActive = currentTrack?.id === track.id;
                    const isTrackPlaying = isTrackActive && playing;

                    return (
                      <div
                        key={track.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          boxSizing: "border-box",
                    justifyContent: "space-between",
                          padding: "8px 14px",
                          borderRadius: "10px",
                          background: isTrackActive ? "rgba(2, 132, 199, 0.08)" : "#FFFFFF",
                          border: "1px solid var(--sw-border, #E2E8F0)",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                          <button
                            onClick={() => onPlayTrack(track)}
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "8px",
                              border: "none",
                              background: "#0284C7",
                              color: "#FFFFFF",
                              display: "grid",
                              placeItems: "center",
                              cursor: "pointer",
                              flexShrink: 0,
                            }}
                            aria-label={`Play ${track.title}`}
                          >
                            {isTrackPlaying ? <PauseIcon width={16} height={16} /> : <PlayIcon width={16} height={16} />}
                          </button>
                          <img
                            src={track.coverUrl || DEFAULT_COVER_FALLBACK}
                            alt=""
                            style={{ width: "40px", height: "40px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 }}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = DEFAULT_COVER_FALLBACK;
                            }}
                          />
                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: "14px",
                                fontWeight: 600,
                                color: isTrackActive ? "#0284C7" : "var(--sw-text-h, #0F172A)",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {track.title}
                            </div>
                            <div style={{ fontSize: "12.5px", color: "#64748B", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {track.creator?.displayName || "Unknown Artist"}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 }}>
                          <span style={{ fontSize: "12.5px", color: "#64748B" }}>
                            {formatDuration(track.durationMs)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Albums Preview */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "17px", fontWeight: 700, color: "var(--sw-text-h, #0F172A)", margin: 0 }}>
                Albums
              </h3>
              {searchData.albums.totalElements > 4 && (
                <button
                  className="button button-ghost button-small"
                  onClick={() => handleTabChange("ALBUMS")}
                  style={{ fontSize: "13px" }}
                >
                  See all ({searchData.albums.totalElements}) →
                </button>
              )}
            </div>

            {searchData.albums.content.length === 0 ? (
              <div style={{ padding: "20px", color: "#94A3B8", background: "#FFFFFF", borderRadius: "12px", border: "1px solid var(--sw-border)" }}>
                No published albums matching "{trimmedQuery}".
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
                {searchData.albums.content.slice(0, 4).map((album) => (
                  <div
                    key={album.id}
                    onClick={() => onNavigate(`/album/${album.id}`)}
                    style={{
                      background: "#FFFFFF",
                      borderRadius: "14px",
                      padding: "14px",
                      border: "1px solid var(--sw-border, #E2E8F0)",
                      cursor: "pointer",
                      transition: "transform 0.15s ease, box-shadow 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "none";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <img
                      src={album.coverUrl || DEFAULT_COVER_FALLBACK}
                      alt=""
                      style={{ width: "100%", aspectRatio: "1/1", borderRadius: "10px", objectFit: "cover", marginBottom: "10px" }}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = DEFAULT_COVER_FALLBACK;
                      }}
                    />
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--sw-text-h, #0F172A)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {album.title}
                    </div>
                    <div style={{ fontSize: "12.5px", color: "#64748B", margin: "2px 0 6px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {album.creator?.displayName || "SoundWave Artist"}
                    </div>
                    <span style={{ fontSize: "11.5px", color: "#0284C7", fontWeight: 600 }}>
                      {album.trackCount} tracks
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Creators Preview */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "17px", fontWeight: 700, color: "var(--sw-text-h, #0F172A)", margin: 0 }}>
                Artists & Creators
              </h3>
              {searchData.creators.totalElements > 4 && (
                <button
                  className="button button-ghost button-small"
                  onClick={() => handleTabChange("CREATORS")}
                  style={{ fontSize: "13px" }}
                >
                  See all ({searchData.creators.totalElements}) →
                </button>
              )}
            </div>

            {searchData.creators.content.length === 0 ? (
              <div style={{ padding: "20px", color: "#94A3B8", background: "#FFFFFF", borderRadius: "12px", border: "1px solid var(--sw-border)" }}>
                No active creators matching "{trimmedQuery}".
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
                {searchData.creators.content.slice(0, 4).map((creator) => (
                  <div
                    key={creator.userId}
                    onClick={() => onNavigate(`/creator/${creator.userId}`)}
                    style={{
                      background: "#FFFFFF",
                      borderRadius: "14px",
                      padding: "20px 14px",
                      border: "1px solid var(--sw-border, #E2E8F0)",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "transform 0.15s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
                  >
                    <img
                      src={creator.avatarUrl || DEFAULT_COVER_FALLBACK}
                      alt=""
                      style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover", margin: "0 auto 12px" }}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = DEFAULT_COVER_FALLBACK;
                      }}
                    />
                    <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--sw-text-h, #0F172A)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {creator.displayName}
                    </div>
                    <div style={{ fontSize: "12.5px", color: "#64748B", margin: "2px 0 6px" }}>
                      @{creator.username}
                    </div>
                    <span style={{ fontSize: "11.5px", color: "#0284C7", fontWeight: 600 }}>
                      {creator.trackCount} releases
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AF02: Lyrics Preview */}
          {searchData.lyrics.content.length > 0 && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "17px", fontWeight: 700, color: "var(--sw-text-h, #0F172A)", margin: 0 }}>
                  Matching Lyrics
                </h3>
                {searchData.lyrics.totalElements > 2 && (
                  <button
                    className="button button-ghost button-small"
                    onClick={() => handleTabChange("LYRICS")}
                    style={{ fontSize: "13px" }}
                  >
                    See all ({searchData.lyrics.totalElements}) →
                  </button>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {searchData.lyrics.content.slice(0, 3).map((item) => (
                  <div
                    key={item.officialLyricId}
                    style={{
                      background: "#FFFFFF",
                      borderRadius: "12px",
                      padding: "16px 20px",
                      border: "1px solid var(--sw-border, #E2E8F0)",
                      display: "flex",
                      alignItems: "center",
                      boxSizing: "border-box",
                    justifyContent: "space-between",
                      gap: "20px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", minWidth: 0 }}>
                      <button
                        onClick={() => onPlayTrack(item.track)}
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          border: "none",
                          background: "#0284C7",
                          color: "#FFFFFF",
                          display: "grid",
                          placeItems: "center",
                          cursor: "pointer",
                          flexShrink: 0,
                        }}
                      >
                        <PlayIcon width={16} height={16} />
                      </button>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--sw-text-h, #0F172A)" }}>
                          {item.track.title} • <span style={{ color: "#64748B", fontWeight: 400 }}>{item.track.creator?.displayName}</span>
                        </div>
                        <div
                          style={{
                            fontSize: "13.5px",
                            color: "#334155",
                            fontStyle: "italic",
                            marginTop: "4px",
                            lineHeight: "1.4",
                          }}
                        >
                          "{renderHighlightedSnippet(item.lyricSnippet, trimmedQuery)}"
                        </div>
                      </div>
                    </div>

                    <span style={{ fontSize: "12px", color: "#0284C7", fontWeight: 600, flexShrink: 0 }}>
                      Official Lyric
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* State 6: Full Category List (Tab: SONGS) */}
      {!loading && !error && !isQueryTooShort && activeTab === "SONGS" && searchData && (
        <div>
          <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--sw-text-h, #0F172A)", marginBottom: "16px" }}>
            Songs matching "{trimmedQuery}" ({searchData.tracks.totalElements})
          </h3>

          {searchData.tracks.content.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#94A3B8", background: "#FFFFFF", borderRadius: "12px" }}>
              No published songs found matching your search.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {searchData.tracks.content.map((track) => {
                const isTrackActive = currentTrack?.id === track.id;
                const isTrackPlaying = isTrackActive && playing;

                return (
                  <div
                    key={track.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      boxSizing: "border-box",
                    justifyContent: "space-between",
                      padding: "10px 16px",
                      borderRadius: "12px",
                      background: isTrackActive ? "rgba(2, 132, 199, 0.08)" : "#FFFFFF",
                      border: "1px solid var(--sw-border, #E2E8F0)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", minWidth: 0 }}>
                      <button
                        onClick={() => onPlayTrack(track)}
                        style={{
                          width: "38px",
                          height: "38px",
                          borderRadius: "50%",
                          border: "none",
                          background: "#0284C7",
                          color: "#FFFFFF",
                          display: "grid",
                          placeItems: "center",
                          cursor: "pointer",
                          flexShrink: 0,
                        }}
                      >
                        {isTrackPlaying ? <PauseIcon width={16} height={16} /> : <PlayIcon width={16} height={16} />}
                      </button>
                      <img
                        src={track.coverUrl || DEFAULT_COVER_FALLBACK}
                        alt=""
                        style={{ width: "44px", height: "44px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: "14.5px", fontWeight: 600, color: isTrackActive ? "#0284C7" : "var(--sw-text-h)" }}>
                          {track.title}
                        </div>
                        <div style={{ fontSize: "13px", color: "#64748B" }}>
                          {track.creator?.displayName || "Unknown Artist"} {track.album ? `• ${track.album.title}` : ""}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                      <span style={{ fontSize: "13px", color: "#64748B" }}>{formatDuration(track.durationMs)}</span>
                    </div>
                  </div>
                );
              })}

              {/* Pagination (AF03) */}
              {searchData.tracks.totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "24px" }}>
                  <button
                    className="button button-ghost button-small"
                    disabled={currentPage === 0}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    Previous
                  </button>
                  <span style={{ display: "flex", alignItems: "center", padding: "0 12px", fontSize: "13px", color: "#64748B" }}>
                    Page {currentPage + 1} of {searchData.tracks.totalPages}
                  </span>
                  <button
                    className="button button-ghost button-small"
                    disabled={currentPage >= searchData.tracks.totalPages - 1}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* State 7: Full Category List (Tab: ALBUMS) */}
      {!loading && !error && !isQueryTooShort && activeTab === "ALBUMS" && searchData && (
        <div>
          <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--sw-text-h, #0F172A)", marginBottom: "16px" }}>
            Albums matching "{trimmedQuery}" ({searchData.albums.totalElements})
          </h3>

          {searchData.albums.content.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#94A3B8", background: "#FFFFFF", borderRadius: "12px" }}>
              No published albums found matching your search.
            </div>
          ) : (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "18px" }}>
                {searchData.albums.content.map((album) => (
                  <div
                    key={album.id}
                    onClick={() => onNavigate(`/album/${album.id}`)}
                    style={{
                      background: "#FFFFFF",
                      borderRadius: "14px",
                      padding: "14px",
                      border: "1px solid var(--sw-border, #E2E8F0)",
                      cursor: "pointer",
                      transition: "transform 0.15s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-3px)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
                  >
                    <img
                      src={album.coverUrl || DEFAULT_COVER_FALLBACK}
                      alt=""
                      style={{ width: "100%", aspectRatio: "1/1", borderRadius: "10px", objectFit: "cover", marginBottom: "10px" }}
                    />
                    <div style={{ fontSize: "14.5px", fontWeight: 700, color: "var(--sw-text-h)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {album.title}
                    </div>
                    <div style={{ fontSize: "13px", color: "#64748B", margin: "2px 0 6px" }}>
                      {album.creator?.displayName || "SoundWave Artist"}
                    </div>
                    <span style={{ fontSize: "12px", color: "#0284C7", fontWeight: 600 }}>
                      {album.trackCount} tracks
                    </span>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {searchData.albums.totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "24px" }}>
                  <button
                    className="button button-ghost button-small"
                    disabled={currentPage === 0}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    Previous
                  </button>
                  <span style={{ display: "flex", alignItems: "center", padding: "0 12px", fontSize: "13px", color: "#64748B" }}>
                    Page {currentPage + 1} of {searchData.albums.totalPages}
                  </span>
                  <button
                    className="button button-ghost button-small"
                    disabled={currentPage >= searchData.albums.totalPages - 1}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* State 8: Full Category List (Tab: CREATORS) */}
      {!loading && !error && !isQueryTooShort && activeTab === "CREATORS" && searchData && (
        <div>
          <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--sw-text-h, #0F172A)", marginBottom: "16px" }}>
            Creators matching "{trimmedQuery}" ({searchData.creators.totalElements})
          </h3>

          {searchData.creators.content.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#94A3B8", background: "#FFFFFF", borderRadius: "12px" }}>
              No active creators found matching your search.
            </div>
          ) : (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "18px" }}>
                {searchData.creators.content.map((creator) => (
                  <div
                    key={creator.userId}
                    onClick={() => onNavigate(`/creator/${creator.userId}`)}
                    style={{
                      background: "#FFFFFF",
                      borderRadius: "14px",
                      padding: "24px 16px",
                      border: "1px solid var(--sw-border, #E2E8F0)",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "transform 0.15s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-3px)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
                  >
                    <img
                      src={creator.avatarUrl || DEFAULT_COVER_FALLBACK}
                      alt=""
                      style={{ width: "90px", height: "90px", borderRadius: "50%", objectFit: "cover", margin: "0 auto 14px" }}
                    />
                    <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--sw-text-h)" }}>
                      {creator.displayName}
                    </div>
                    <div style={{ fontSize: "13px", color: "#64748B", margin: "2px 0 8px" }}>
                      @{creator.username}
                    </div>
                    <span style={{ fontSize: "12px", color: "#0284C7", fontWeight: 600 }}>
                      {creator.trackCount} public tracks
                    </span>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {searchData.creators.totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "24px" }}>
                  <button
                    className="button button-ghost button-small"
                    disabled={currentPage === 0}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    Previous
                  </button>
                  <span style={{ display: "flex", alignItems: "center", padding: "0 12px", fontSize: "13px", color: "#64748B" }}>
                    Page {currentPage + 1} of {searchData.creators.totalPages}
                  </span>
                  <button
                    className="button button-ghost button-small"
                    disabled={currentPage >= searchData.creators.totalPages - 1}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* State 9: AF02 Full Category List (Tab: LYRICS) */}
      {!loading && !error && !isQueryTooShort && activeTab === "LYRICS" && searchData && (
        <div>
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--sw-text-h, #0F172A)", margin: "0 0 6px" }}>
              Matching Lyrics ({searchData.lyrics.totalElements})
            </h3>
            <p style={{ color: "#64748B", fontSize: "13.5px", margin: 0 }}>
              Officially approved lyrics matching your keyword "{trimmedQuery}"
            </p>
          </div>

          {searchData.lyrics.content.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#94A3B8", background: "#FFFFFF", borderRadius: "12px" }}>
              No official lyrics contain the keyword "{trimmedQuery}".
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {searchData.lyrics.content.map((item) => (
                <div
                  key={item.officialLyricId}
                  style={{
                    background: "#FFFFFF",
                    borderRadius: "14px",
                    padding: "18px 22px",
                    border: "1px solid var(--sw-border, #E2E8F0)",
                    display: "flex",
                    alignItems: "center",
                    boxSizing: "border-box",
                    justifyContent: "space-between",
                    gap: "24px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", minWidth: 0 }}>
                    <button
                      onClick={() => onPlayTrack(item.track)}
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "50%",
                        border: "none",
                        background: "#0284C7",
                        color: "#FFFFFF",
                        display: "grid",
                        placeItems: "center",
                        cursor: "pointer",
                        flexShrink: 0,
                        marginTop: "2px",
                      }}
                      aria-label={`Play ${item.track.title}`}
                    >
                      <PlayIcon width={18} height={18} />
                    </button>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--sw-text-h)" }}>
                        {item.track.title}
                        <span style={{ color: "#64748B", fontWeight: 400, marginLeft: "8px" }}>
                          by {item.track.creator?.displayName || "Unknown Artist"}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: "14px",
                          color: "#1E293B",
                          fontStyle: "italic",
                          marginTop: "8px",
                          lineHeight: "1.5",
                          background: "#F8FAFC",
                          padding: "8px 14px",
                          borderRadius: "8px",
                          borderLeft: "3px solid #0284C7",
                        }}
                      >
                        "{renderHighlightedSnippet(item.lyricSnippet, trimmedQuery)}"
                      </div>
                    </div>
                  </div>

                  <span
                    style={{
                      background: "#F0FDF4",
                      color: "#16A34A",
                      border: "1px solid #BBF7D0",
                      padding: "4px 12px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    Official Lyric
                  </span>
                </div>
              ))}

              {/* Pagination */}
              {searchData.lyrics.totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "24px" }}>
                  <button
                    className="button button-ghost button-small"
                    disabled={currentPage === 0}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    Previous
                  </button>
                  <span style={{ display: "flex", alignItems: "center", padding: "0 12px", fontSize: "13px", color: "#64748B" }}>
                    Page {currentPage + 1} of {searchData.lyrics.totalPages}
                  </span>
                  <button
                    className="button button-ghost button-small"
                    disabled={currentPage >= searchData.lyrics.totalPages - 1}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

