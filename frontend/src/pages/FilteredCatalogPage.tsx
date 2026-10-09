import { useEffect, useMemo, useState } from "react";
import { catalogApi } from "../api/catalog";
import { TrackCard } from "../components/MusicCards";
import { SortDropdown } from "../components/SortDropdown";
import { HeadphonesIcon } from "../icons";
import type { Genre, LandingTrack } from "../types";

type Props = {
  currentTrack: LandingTrack | null;
  playing: boolean;
  onPlayTrack: (track: LandingTrack, contextQueue?: LandingTrack[], contextTitle?: string) => void;
  onNavigate: (route: string) => void;
  initialGenre?: string;
  initialSort?: "newest" | "trending" | "title";
};

export function FilteredCatalogPage({
  currentTrack,
  playing,
  onPlayTrack,
  onNavigate,
  initialGenre,
  initialSort,
}: Props) {
  const [selectedGenre, setSelectedGenre] = useState<string>(initialGenre ?? "all");
  const [sortBy, setSortBy] = useState<"newest" | "trending" | "title">(initialSort ?? "newest");
  const [genresList, setGenresList] = useState<Genre[]>([]);
  const [genresLoading, setGenresLoading] = useState(true);
  const [genresError, setGenresError] = useState(false);

  const [tracks, setTracks] = useState<LandingTrack[]>([]);
  const [tracksLoading, setTracksLoading] = useState(true);
  const [tracksError, setTracksError] = useState<string | null>(null);

  // Keep state in sync with URL query params
  useEffect(() => {
    setSelectedGenre(initialGenre ?? "all");
  }, [initialGenre]);

  useEffect(() => {
    setSortBy(initialSort ?? "newest");
  }, [initialSort]);

  // Phase 1: Load available genres from backend
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
  }, []);

  // Phase 2 & 3: Query matching published tracks whenever genre or sort changes
  useEffect(() => {
    let active = true;
    setTracksLoading(true);
    setTracksError(null);

    catalogApi
      .getTracks({
        genre: selectedGenre !== "all" ? selectedGenre : undefined,
        sort: sortBy,
        page: 0,
        size: 20,
      })
      .then((res) => {
        if (!active) return;
        setTracks(res?.content ?? []);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setTracks([]);
        setTracksError(err instanceof Error ? err.message : "Failed to load public catalog.");
      })
      .finally(() => {
        if (active) setTracksLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedGenre, sortBy]);

  const activeGenreObj = useMemo(
    () => genresList.find((g) => g.slug.toLowerCase() === selectedGenre.toLowerCase()),
    [genresList, selectedGenre]
  );

  // Phase 2: Select genre filter & trigger query with unselect reset to 'all'
  const updateFilters = (newGenre: string, newSort: "newest" | "trending" | "title") => {
    setSelectedGenre(newGenre);
    setSortBy(newSort);

    const params = new URLSearchParams();
    if (newGenre && newGenre !== "all") params.set("genre", newGenre);
    if (newSort && newSort !== "newest") params.set("sort", newSort);
    const qs = params.toString();

    // Update browser URL hash without full page reload
    onNavigate(`/browse${qs ? `?${qs}` : ""}`);
  };

  const handleGenreTagClick = (slug: string) => {
    // Sequence diagram Phase 2: If user clicks "All" or unselects the currently active genre -> resets to "all"
    if (slug === "all" || selectedGenre.toLowerCase() === slug.toLowerCase()) {
      updateFilters("all", sortBy);
    } else {
      updateFilters(slug, sortBy);
    }
  };

  const handleClearFilters = () => {
    updateFilters("all", "newest");
  };

  return (
    <div className="catalog-browse-page" style={{ padding: "0 0 60px 0" }}>
      {/* Page Title & Breadcrumb Banner */}
      <div className="page-title-banner" style={{ marginBottom: "24px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span className="eyebrow">
              {activeGenreObj ? `GENRE FILTER · ${activeGenreObj.name.toUpperCase()}` : "PUBLIC CATALOG"}
            </span>
          </div>
          <h1 className="page-heading">
            {activeGenreObj ? `${activeGenreObj.name} Music` : "Filter by Genre & Catalog"}
          </h1>
          <p className="page-subtext" style={{ color: "var(--sw-muted)", marginTop: "4px", fontSize: "14px" }}>
            {activeGenreObj
              ? activeGenreObj.description || `Discover trending and fresh ${activeGenreObj.name} tracks on SoundWave.`
              : "Filter tracks by genre, sort by newest releases or trending plays, and stream songs."}
          </p>
        </div>
      </div>

      {/* Filter Toolbar: Sort dropdown, Clear filters, Result summary */}
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
          {/* Custom Modern Sort Dropdown */}
          <SortDropdown
            value={sortBy}
            onChange={(newSort) => updateFilters(selectedGenre, newSort)}
            showLabel={true}
          />

          {/* Clear filters Button */}
          {(selectedGenre !== "all" || sortBy !== "newest") && (
            <button
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

        {/* Result summary */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
            Result count: <b>{tracks.length}</b> tracks
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
              Filtered by: {activeGenreObj.name}
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
          /* Step 12: Display message "No genres are available right now" */
          <span style={{ fontSize: "12px", color: "#DC2626", background: "#FEF2F2", padding: "6px 14px", borderRadius: "8px", border: "1px solid #FCA5A5" }}>
            No genres are available right now
          </span>
        ) : (
          /* Step 13: Render all genre filter tags (Default: All, Ballad, Pop, ...) */
          <>
            <button
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

      {/* Phase 4: Track Cards Results or Empty State */}
      {tracksLoading ? (
        <div
          style={{
            minHeight: "240px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--sw-muted)",
            fontSize: "14px",
          }}
        >
          Loading songs for selected filters...
        </div>
      ) : tracksError ? (
        <div
          style={{
            padding: "24px",
            background: "#FEF2F2",
            border: "1px solid #FCA5A5",
            borderRadius: "14px",
            color: "#991B1B",
            textAlign: "center",
          }}
        >
          <strong>{tracksError}</strong>
          <div style={{ marginTop: "12px" }}>
            <button className="button button-secondary" onClick={() => updateFilters(selectedGenre, sortBy)}>
              Retry query
            </button>
          </div>
        </div>
      ) : tracks.length > 0 ? (
        /* Step 31 & 32: Render matching Track Cards */
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
      ) : (
        /* Step 30: Empty State as per Sequence Diagram */
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

          {/* Sequence diagram Step 30 exact message: "No published songs found for this genre. Please select another genre." */}
          <strong style={{ fontSize: "16px", color: "var(--sw-text)" }}>
            {selectedGenre !== "all"
              ? "No published songs found for this genre. Please select another genre."
              : "No published songs found in catalog. Please check back later."}
          </strong>

          <span style={{ fontSize: "13px", color: "var(--sw-muted)", maxWidth: "420px" }}>
            {selectedGenre !== "all"
              ? `There are currently no active public tracks assigned to ${activeGenreObj ? `"${activeGenreObj.name}"` : "this genre"}. Try exploring other musical genres.`
              : "There are currently no published tracks available in the public catalog."}
          </span>

          {selectedGenre !== "all" && (
            <button
              className="button button-primary"
              onClick={handleClearFilters}
              style={{ marginTop: "10px" }}
            >
              Clear filters and view all tracks
            </button>
          )}
        </div>
      )}
    </div>
  );
}
