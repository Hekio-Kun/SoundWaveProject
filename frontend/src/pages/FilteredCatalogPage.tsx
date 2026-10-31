import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { catalogApi } from "../api/catalog";
import { TrackCard } from "../components/common/MusicCards";
import { SortDropdown, type SortOptionValue } from "../components/common/SortDropdown";
import { HeadphonesIcon, SearchIcon } from "../icons";
import type { Genre, LandingTrack } from "../types";

type Props = {
  currentTrack: LandingTrack | null;
  playing: boolean;
  onPlayTrack: (track: LandingTrack, contextQueue?: LandingTrack[], contextTitle?: string) => void;
  onNavigate: (route: string) => void;
  initialGenre?: string;
  initialSort?: SortOptionValue;
  initialSearch?: string;
  initialPage?: number;
};

export function FilteredCatalogPage({
  currentTrack,
  playing,
  onPlayTrack,
  onNavigate,
  initialGenre,
  initialSort,
  initialSearch,
  initialPage = 0,
}: Props) {
  const [selectedGenre, setSelectedGenre] = useState<string>(initialGenre ?? "all");
  const [sortBy, setSortBy] = useState<SortOptionValue>(initialSort ?? "newest");
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch ?? "");
  const [searchInput, setSearchInput] = useState<string>(initialSearch ?? "");
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);

  const [genresList, setGenresList] = useState<Genre[]>([]);
  const [genresLoading, setGenresLoading] = useState(true);
  const [genresError, setGenresError] = useState(false);

  const [tracks, setTracks] = useState<LandingTrack[]>([]);
  const [tracksLoading, setTracksLoading] = useState(true);
  const [tracksError, setTracksError] = useState<string | null>(null);

  // Exception notices (EX01 & EX03)
  const [genreNotice, setGenreNotice] = useState<string | null>(null);
  const [pageNotice, setPageNotice] = useState<string | null>(null);

  // Keep state in sync with URL query params
  useEffect(() => {
    setSelectedGenre(initialGenre ?? "all");
  }, [initialGenre]);

  useEffect(() => {
    setSortBy(initialSort ?? "newest");
  }, [initialSort]);

  useEffect(() => {
    setSearchQuery(initialSearch ?? "");
    setSearchInput(initialSearch ?? "");
  }, [initialSearch]);

  useEffect(() => {
    if (initialPage !== undefined) {
      setCurrentPage(initialPage);
    }
  }, [initialPage]);

  // Phase 1: Load available genres from backend and validate selected genre (EX01)
  useEffect(() => {
    let active = true;
    setGenresLoading(true);
    setGenresError(false);

    catalogApi
      .getGenres()
      .then((data) => {
        if (!active) return;
        if (data && data.length > 0) {
          setGenresList(data);
          setGenresError(false);

          // EX01: Stale URL references an unavailable or disabled genre slug.
          // The system ignores the invalid value, resets to all genres, and informs the user.
          if (initialGenre && initialGenre !== "all") {
            const exists = data.some(
              (g) => g.slug.toLowerCase() === initialGenre.toLowerCase()
            );
            if (!exists) {
              setSelectedGenre("all");
              setGenreNotice(
                `The genre "${initialGenre}" is unavailable or disabled. Showing all genres.`
              );

              // Update URL removing the invalid genre slug
              const params = new URLSearchParams();
              if (sortBy !== "newest") params.set("sort", sortBy);
              if (searchQuery.trim()) params.set("search", searchQuery.trim());
              if (currentPage > 0) params.set("page", String(currentPage + 1));
              const qs = params.toString();
              onNavigate(`/browse${qs ? `?${qs}` : ""}`);
            }
          }
        } else {
          setGenresList([]);
          setGenresError(true);
        }
      })
      .catch(() => {
        if (!active) return;
        setGenresList([]);
        setGenresError(true);
      })
      .finally(() => {
        if (active) setGenresLoading(false);
      });

    return () => {
      active = false;
    };
  }, [initialGenre]);

  // Phase 2 & 3: Query matching published tracks whenever genre, sort, search, or page changes
  const fetchTracks = useCallback(() => {
    let active = true;
    setTracksLoading(true);
    setTracksError(null);

    catalogApi
      .getTracks({
        genre: selectedGenre !== "all" ? selectedGenre : undefined,
        search: searchQuery.trim() || undefined,
        sort: sortBy,
        page: currentPage,
        size: 20, // Standard page size fixed at 20 tracks per page
      })
      .then((res) => {
        if (!active) return;
        const totalP = res?.totalPages ?? 0;
        const totalE = res?.totalElements ?? 0;
        const fetchedTracks = res?.content ?? [];

        // EX03: A manual URL parameter references an out-of-bounds page number.
        // If totalPages is known (> 0) and the requested currentPage >= totalPages, reset to page 1 (index 0).
        if (totalP > 0 && currentPage >= totalP) {
          setPageNotice(`Page ${currentPage + 1} exceeds total pages (${totalP}). Resetting to page 1.`);
          setCurrentPage(0);

          const params = new URLSearchParams();
          if (selectedGenre && selectedGenre !== "all") params.set("genre", selectedGenre);
          if (sortBy && sortBy !== "newest") params.set("sort", sortBy);
          if (searchQuery.trim()) params.set("search", searchQuery.trim());
          const qs = params.toString();
          onNavigate(`/browse${qs ? `?${qs}` : ""}`);
          return;
        }

        setTracks(fetchedTracks);
        setTotalPages(totalP);
        setTotalElements(totalE);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setTracks([]);
        setTotalPages(0);
        setTotalElements(0);
        setTracksError(err instanceof Error ? err.message : "Failed to load public catalog.");
      })
      .finally(() => {
        if (active) setTracksLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedGenre, sortBy, searchQuery, currentPage, onNavigate]);

  useEffect(() => {
    const cleanup = fetchTracks();
    return cleanup;
  }, [fetchTracks]);

  const activeGenreObj = useMemo(
    () => genresList.find((g) => g.slug.toLowerCase() === selectedGenre.toLowerCase()),
    [genresList, selectedGenre]
  );

  // Update filters & URL state (NF01, AF01)
  const updateFilters = (
    newGenre: string,
    newSort: SortOptionValue,
    newSearch: string,
    newPage = 0
  ) => {
    setSelectedGenre(newGenre);
    setSortBy(newSort);
    setSearchQuery(newSearch);
    setSearchInput(newSearch);
    setCurrentPage(newPage);

    const params = new URLSearchParams();
    if (newGenre && newGenre !== "all") params.set("genre", newGenre);
    if (newSort && newSort !== "newest") params.set("sort", newSort);
    if (newSearch && newSearch.trim()) params.set("search", newSearch.trim());
    if (newPage > 0) params.set("page", String(newPage + 1));
    const qs = params.toString();

    // Update browser URL hash without full page reload
    onNavigate(`/browse${qs ? `?${qs}` : ""}`);
  };

  // AF03: Navigate catalog pages
  const handlePageChange = (newPage: number) => {
    if (newPage < 0 || (totalPages > 0 && newPage >= totalPages) || newPage === currentPage) return;
    setPageNotice(null);
    setCurrentPage(newPage);

    const params = new URLSearchParams();
    if (selectedGenre && selectedGenre !== "all") params.set("genre", selectedGenre);
    if (sortBy && sortBy !== "newest") params.set("sort", sortBy);
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    if (newPage > 0) params.set("page", String(newPage + 1));
    const qs = params.toString();

    onNavigate(`/browse${qs ? `?${qs}` : ""}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getVisiblePages = () => {
    const delta = 1;
    const range = [];
    for (let i = 0; i < totalPages; i++) {
      if (i === 0 || i === totalPages - 1 || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      } else if (range[range.length - 1] !== "...") {
        range.push("...");
      }
    }
    return range;
  };

  const handleGenreTagClick = (slug: string) => {
    // If user clicks "All" or unselects the currently active genre -> resets to "all"
    setGenreNotice(null);
    if (slug === "all" || selectedGenre.toLowerCase() === slug.toLowerCase()) {
      updateFilters("all", sortBy, searchQuery, 0);
    } else {
      updateFilters(slug, sortBy, searchQuery, 0);
    }
  };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    updateFilters(selectedGenre, sortBy, searchInput.trim(), 0);
  };

  // AF01: Clear filters
  const handleClearFilters = () => {
    setGenreNotice(null);
    setPageNotice(null);
    updateFilters("all", "newest", "", 0);
  };

  const hasActiveFilters =
    selectedGenre !== "all" || sortBy !== "newest" || searchQuery.trim() !== "";

  return (
    <div className="catalog-browse-page" style={{ padding: "0 0 60px 0" }}>
      {/* Page Title & Breadcrumb Banner */}
      <div className="page-title-banner" style={{ marginBottom: "20px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span className="eyebrow">
              {activeGenreObj ? `GENRE FILTER · ${activeGenreObj.name.toUpperCase()}` : "PUBLIC CATALOG"}
            </span>
          </div>
          <h1 className="page-heading">
            {activeGenreObj ? `${activeGenreObj.name} Music` : "Filter by Genre & Catalog"}
          </h1>
        </div>
      </div>

      {/* EX01: Stale / Inactive Genre Alert Banner */}
      {genreNotice && (
        <div
          role="status"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 16px",
            marginBottom: "16px",
            borderRadius: "12px",
            background: "#FFFBEB",
            border: "1px solid #FCD34D",
            color: "#92400E",
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span>⚠️</span>
            <span>{genreNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setGenreNotice(null)}
            style={{
              background: "none",
              border: "none",
              color: "#92400E",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: "14px",
              padding: "0 4px",
            }}
            aria-label="Dismiss warning"
          >
            ✕
          </button>
        </div>
      )}

      {/* EX03: Out-of-bounds Page Alert Banner */}
      {pageNotice && (
        <div
          role="status"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 16px",
            marginBottom: "16px",
            borderRadius: "12px",
            background: "#EFF6FF",
            border: "1px solid #93C5FD",
            color: "#1E40AF",
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span>ℹ️</span>
            <span>{pageNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setPageNotice(null)}
            style={{
              background: "none",
              border: "none",
              color: "#1E40AF",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: "14px",
              padding: "0 4px",
            }}
            aria-label="Dismiss notice"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter Toolbar: Sort dropdown, Search input, Clear filters, Result summary */}
      <div
        className="sw-catalog-toolbar"
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "14px",
          marginBottom: "18px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {/* Custom Modern Sort Dropdown (supports Newest, Most played, Title A-Z, Title Z-A) */}
          <SortDropdown
            value={sortBy}
            onChange={(newSort) => updateFilters(selectedGenre, newSort, searchQuery, 0)}
            showLabel={true}
          />

          {/* AF01: Clear filters Button */}
          {hasActiveFilters && (
            <button
              type="button"
              className="button button-ghost"
              onClick={handleClearFilters}
              style={{
                height: "38px",
                padding: "0 14px",
                fontSize: "12px",
                fontWeight: 700,
                borderRadius: "10px",
                border: "1px solid #FCA5A5",
                background: "#FEF2F2",
                color: "#DC2626",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Result summary & active criteria tag */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <span
            style={{
              padding: "6px 12px",
              borderRadius: "999px",
              background: "var(--sw-sand-chip, #f5ead8)",
              color: "var(--sw-sand-deep, #8c5828)",
              border: "1px solid var(--sw-sand-border, #e6d5b8)",
              fontSize: "11.5px",
              fontWeight: 700,
            }}
          >
            Result count: <b>{totalElements > 0 ? totalElements : tracks.length}</b> tracks
            {totalPages > 1 ? ` (Page ${currentPage + 1}/${totalPages})` : ""}
          </span>
          {activeGenreObj && (
            <span
              style={{
                padding: "6px 12px",
                borderRadius: "999px",
                background: "var(--sw-cyan-light, #ECFEFF)",
                color: "var(--sw-primary-dark, #0E7490)",
                fontSize: "11.5px",
                fontWeight: 800,
                border: "1px solid #BAE6FD",
              }}
            >
              Genre: {activeGenreObj.name}
            </span>
          )}
          {searchQuery && (
            <span
              style={{
                padding: "6px 12px",
                borderRadius: "999px",
                background: "#EFF6FF",
                color: "#1D4ED8",
                fontSize: "11.5px",
                fontWeight: 700,
                border: "1px solid #BFDBFE",
              }}
            >
              Keyword: "{searchQuery}"
            </span>
          )}
        </div>
      </div>

      {/* Phase 1: Quick genre filter pills scrollbar (Default: All, Ballad, Pop, Rock, ...) */}
      <div
        className="sw-filter-scroll"
        style={{
          display: "flex",
          gap: "8px",
          overflowX: "auto",
          marginBottom: "22px",
          paddingBottom: "4px",
          alignItems: "center",
        }}
      >
        {genresLoading ? (
          <span style={{ fontSize: "12px", color: "var(--sw-muted)", padding: "8px 0" }}>
            Loading genre filters...
          </span>
        ) : genresError && genresList.length === 0 ? (
          <span
            style={{
              fontSize: "12px",
              color: "#DC2626",
              background: "#FEF2F2",
              padding: "6px 14px",
              borderRadius: "8px",
              border: "1px solid #FCA5A5",
            }}
          >
            No genres are available right now
          </span>
        ) : (
          <>
            <button
              type="button"
              className={selectedGenre === "all" ? "is-active" : ""}
              onClick={() => handleGenreTagClick("all")}
              style={{
                padding: "8px 16px",
                borderRadius: "10px",
                fontSize: "12px",
                fontWeight: 700,
                border: selectedGenre === "all" ? "none" : "1px solid var(--sw-border)",
                background: selectedGenre === "all" ? "var(--sw-primary)" : "#fff",
                color: selectedGenre === "all" ? "#fff" : "var(--sw-muted)",
                cursor: "pointer",
                whiteSpace: "nowrap",
                boxShadow: selectedGenre === "all" ? "0 4px 12px rgba(8, 145, 178, 0.25)" : "none",
              }}
            >
              All Genres
            </button>
            {genresList.map((g) => {
              const isSelected = selectedGenre.toLowerCase() === g.slug.toLowerCase();
              return (
                <button
                  key={g.id}
                  type="button"
                  className={isSelected ? "is-active" : ""}
                  onClick={() => handleGenreTagClick(g.slug)}
                  title={isSelected ? `Unselect ${g.name} (reset to all)` : `Filter by ${g.name}`}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "10px",
                    fontSize: "12px",
                    fontWeight: 700,
                    border: isSelected ? "none" : "1px solid var(--sw-border)",
                    background: isSelected ? "var(--sw-primary)" : "#fff",
                    color: isSelected ? "#fff" : "var(--sw-muted)",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    boxShadow: isSelected ? "0 4px 12px rgba(8, 145, 178, 0.25)" : "none",
                  }}
                >
                  {g.name}
                </button>
              );
            })}
          </>
        )}
      </div>

      {/* Phase 4: Track Cards Results, Loading State, Error State (EX02), or Empty State (AF02) */}
      {tracksLoading ? (
        <div
          style={{
            minHeight: "260px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--sw-muted)",
            fontSize: "14px",
          }}
        >
          Loading published tracks...
        </div>
      ) : tracksError ? (
        /* EX02: Catalog retrieval failure with retry controls */
        <div
          role="alert"
          style={{
            padding: "28px 20px",
            background: "#FEF2F2",
            border: "1px solid #FCA5A5",
            borderRadius: "16px",
            color: "#991B1B",
            textAlign: "center",
            maxWidth: "520px",
            margin: "20px auto",
          }}
        >
          <div style={{ fontSize: "24px", marginBottom: "8px" }}>⚠️</div>
          <strong style={{ fontSize: "15px", display: "block", marginBottom: "6px" }}>
            Unable to retrieve catalog tracks
          </strong>
          <span style={{ fontSize: "13px", color: "#B91C1C", display: "block", marginBottom: "16px" }}>
            {tracksError}
          </span>
          <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
            <button
              type="button"
              className="button button-primary button-small"
              onClick={() => fetchTracks()}
            >
              Retry query
            </button>
            {hasActiveFilters && (
              <button
                type="button"
                className="button button-secondary button-small"
                onClick={handleClearFilters}
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      ) : tracks.length > 0 ? (
        /* Render matching Track Cards with Pagination */
        <>
          <div className="sw-track-grid sw-track-grid--catalog">
            {tracks.map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                active={currentTrack?.id === track.id}
                playing={currentTrack?.id === track.id && playing}
                onPlay={(t) =>
                  onPlayTrack(
                    t,
                    tracks,
                    selectedGenre !== "all" ? `Genre • ${selectedGenre}` : "Catalog"
                  )
                }
                onNavigate={onNavigate}
              />
            ))}
          </div>

          {/* AF03: Pagination Controls (Rendered when totalPages > 1) */}
          {totalPages > 1 && (
            <div
              className="catalog-pagination-bar"
              role="navigation"
              aria-label="Catalog pagination"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px",
                marginTop: "36px",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                className="button button-secondary button-small"
                disabled={currentPage === 0 || tracksLoading}
                onClick={() => handlePageChange(currentPage - 1)}
                aria-label="Go to previous page"
                style={{
                  padding: "8px 16px",
                  borderRadius: "10px",
                  fontWeight: 600,
                  fontSize: "13px",
                  cursor: currentPage === 0 ? "not-allowed" : "pointer",
                }}
              >
                ← Previous
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                {getVisiblePages().map((pageItem, idx) =>
                  typeof pageItem === "string" ? (
                    <span
                      key={`ellipsis-${idx}`}
                      style={{ padding: "0 4px", color: "var(--sw-muted)" }}
                      aria-hidden="true"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={pageItem}
                      type="button"
                      aria-current={currentPage === pageItem ? "page" : undefined}
                      aria-label={`Page ${pageItem + 1}`}
                      className={
                        currentPage === pageItem
                          ? "button button-primary button-small"
                          : "button button-ghost button-small"
                      }
                      style={{
                        minWidth: "36px",
                        height: "36px",
                        padding: "0 8px",
                        borderRadius: "8px",
                        fontWeight: currentPage === pageItem ? 700 : 500,
                        background: currentPage === pageItem ? "var(--sw-primary)" : "transparent",
                        color: currentPage === pageItem ? "#fff" : "var(--sw-text)",
                        border:
                          currentPage === pageItem ? "none" : "1px solid var(--sw-border, #E2E8F0)",
                        cursor: "pointer",
                      }}
                      onClick={() => handlePageChange(pageItem)}
                    >
                      {pageItem + 1}
                    </button>
                  )
                )}
              </div>

              <button
                type="button"
                className="button button-secondary button-small"
                disabled={currentPage >= totalPages - 1 || tracksLoading}
                onClick={() => handlePageChange(currentPage + 1)}
                aria-label="Go to next page"
                style={{
                  padding: "8px 16px",
                  borderRadius: "10px",
                  fontWeight: 600,
                  fontSize: "13px",
                  cursor: currentPage >= totalPages - 1 ? "not-allowed" : "pointer",
                }}
              >
                Next →
              </button>
            </div>
          )}
        </>
      ) : (
        /* AF02: No matching track empty state (Hides pagination, renders Clear Filters action) */
        <div
          className="sw-empty"
          style={{
            minHeight: "320px",
            padding: "40px 20px",
            background: "#fff",
            border: "1px dashed var(--sw-border)",
            borderRadius: "20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "#F0FDFF",
              display: "grid",
              placeItems: "center",
              color: "var(--sw-primary)",
            }}
          >
            <HeadphonesIcon width={28} height={28} />
          </div>

          <strong style={{ fontSize: "16px", color: "var(--sw-text)" }}>
            {searchQuery
              ? `No published songs found matching "${searchQuery}".`
              : selectedGenre !== "all"
              ? "No published songs found for this genre. Please select another genre."
              : "No published songs found in catalog. Please check back later."}
          </strong>

          <span style={{ fontSize: "13px", color: "var(--sw-muted)", maxWidth: "440px" }}>
            {searchQuery
              ? "Try checking your spelling, exploring other genres, or clearing active filters to browse all songs."
              : selectedGenre !== "all"
              ? `There are currently no active public tracks assigned to ${
                  activeGenreObj ? `"${activeGenreObj.name}"` : "this genre"
                }. Try exploring other musical genres.`
              : "There are currently no published tracks available in the public catalog."}
          </span>

          {/* AF02 Action: Clear Filters action is always prominently displayed in empty state */}
          <button
            type="button"
            className="button button-primary"
            onClick={handleClearFilters}
            style={{ marginTop: "10px" }}
          >
            Clear filters and view all tracks
          </button>
        </div>
      )}
    </div>
  );
}
