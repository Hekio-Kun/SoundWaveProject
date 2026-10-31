import { useEffect, useRef, useState } from "react";
import { adminGenreApi, type AdminGenre, type AdminGenrePage, type GenreInput } from "../api/adminGenres";
import { ApiError } from "../api/client";
import { CenterNotificationPopup } from "../components/modals/CenterNotificationPopup";
import { DeleteConfirmationModal } from "../components/modals/DeleteConfirmationModal";
import { GenreFormModal } from "../components/modals/GenreFormModal";
import { AlertIcon, CloseIcon, DiscIcon, EditIcon, PlusIcon, RefreshIcon, SearchIcon } from "../icons";

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function AdminGenreManagementPage() {
  const [genrePage, setGenrePage] = useState<AdminGenrePage | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingGenre, setEditingGenre] = useState<AdminGenre | null>(null);
  const [statusTarget, setStatusTarget] = useState<{
    genre: AdminGenre;
    nextActive: boolean;
  } | null>(null);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    type: "success" | "error" | "info" | "warning";
  }>({ open: false, message: "", type: "success" });
  const requestIdRef = useRef(0);

  const loadGenres = async () => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setError("");
    try {
      const result = await adminGenreApi.getGenres({
        search,
        page,
        size: 10,
      });
      if (requestId === requestIdRef.current) setGenrePage(result);
    } catch (loadError) {
      if (requestId === requestIdRef.current) {
        setError(loadError instanceof ApiError ? loadError.message : "Unable to load genres. Please try again.");
      }
    } finally {
      if (requestId === requestIdRef.current) setIsLoading(false);
    }
  };

  const handleSearchSubmit = (event?: React.FormEvent) => {
    event?.preventDefault();
    const trimmed = searchInput.trim();
    if (trimmed === search && page === 0) {
      void loadGenres();
    } else {
      setSearch(trimmed);
      setPage(0);
    }
  };

  const handleClearSearch = () => {
    setSearchInput("");
    if (search === "" && page === 0) {
      void loadGenres();
    } else {
      setSearch("");
      setPage(0);
    }
  };

  useEffect(() => {
    void loadGenres();
  }, [search, page]);

  const openCreateForm = () => {
    setEditingGenre(null);
    setFormOpen(true);
  };

  const openEditForm = (genre: AdminGenre) => {
    setEditingGenre(genre);
    setFormOpen(true);
  };

  const handleSave = async (input: GenreInput) => {
    setIsSaving(true);
    try {
      if (editingGenre) {
        await adminGenreApi.updateGenre(editingGenre.id, input);
        setNotification({
          open: true,
          type: "success",
          message: "Genre updated successfully.",
        });
      } else {
        await adminGenreApi.createGenre(input);
        setNotification({
          open: true,
          type: "success",
          message: "Genre created successfully.",
        });
      }
      setFormOpen(false);
      setEditingGenre(null);
      await loadGenres();
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmStatus = async () => {
    if (!statusTarget) return;
    setIsSaving(true);
    try {
      await adminGenreApi.updateGenreStatus(statusTarget.genre.id, statusTarget.nextActive);
      const actionText = statusTarget.nextActive ? "activated" : "deactivated";
      setNotification({
        open: true,
        type: "success",
        message: `“${statusTarget.genre.name}” has been ${actionText} successfully.`,
      });
      setStatusTarget(null);
      await loadGenres();
    } catch (statusError) {
      setNotification({
        open: true,
        type: "error",
        message: statusError instanceof ApiError ? statusError.message : "Unable to update genre status. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const totalGenres = genrePage?.totalElements ?? 0;

  return (
    <div className="ops-dashboard admin-genre-page">
      <header className="admin-genre-heading">
        <div>
          <span className="ops-role-mark"><DiscIcon width={15} height={15} />CATALOG SETTINGS</span>
          <h1>Genre Management</h1>
          <p>Create and maintain the genres available across SoundWave.</p>
        </div>
        <button type="button" className="button button-primary" onClick={openCreateForm}><PlusIcon width={17} height={17} />Create genre</button>
      </header>

      <section className="ops-panel admin-genre-panel">
        <div className="admin-genre-toolbar">
          <form className="admin-genre-search" onSubmit={handleSearchSubmit} role="search">
            <SearchIcon width={17} height={17} />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by name or slug..."
              aria-label="Search genres"
            />
            {searchInput && (
              <button
                type="button"
                className="admin-genre-search-clear"
                onClick={handleClearSearch}
                aria-label="Clear search"
                title="Clear search"
              >
                <CloseIcon width={14} height={14} />
              </button>
            )}
            <button
              type="submit"
              className="button button-primary button-small admin-genre-search-btn"
              aria-label="Search genres"
            >
              <SearchIcon width={14} height={14} />
              <span>Search</span>
            </button>
          </form>
          <span className="admin-genre-total">{totalGenres} {totalGenres === 1 ? "genre" : "genres"}</span>
        </div>

        {isLoading ? (
          <div className="admin-genre-loading" aria-busy="true" aria-label="Loading genres">{[1, 2, 3, 4].map((item) => <div key={item} />)}</div>
        ) : error ? (
          <div className="staff-state-banner is-error" role="alert"><AlertIcon width={30} height={30} /><b>Unable to load genre management</b><p>{error}</p><button type="button" className="button button-primary button-small" onClick={() => void loadGenres()}><RefreshIcon width={15} height={15} />Retry</button></div>
        ) : !genrePage || genrePage.content.length === 0 ? (
          <div className="staff-empty-box"><DiscIcon width={38} height={38} /><h2>No genres found</h2><p>{search ? "Try changing the search query." : "Create the first genre for the public catalog."}</p>{!search ? <button type="button" className="button button-primary" onClick={openCreateForm}>Create genre</button> : null}</div>
        ) : (
          <>
            <div className="ops-table-wrap">
              <table className="ops-table admin-genre-table">
                <thead><tr><th>Genre</th><th>Description</th><th>Status</th><th>Last updated</th><th><span className="sr-only">Actions</span></th></tr></thead>
                <tbody>{genrePage.content.map((genre) => (
                  <tr key={genre.id}>
                    <td><div className="admin-genre-name"><span><DiscIcon width={16} height={16} /></span><div><b>{genre.name}</b><small>/{genre.slug}</small></div></div></td>
                    <td><p className="admin-genre-description">{genre.description || "No description provided."}</p></td>
                    <td><span className={`ops-status ${genre.active ? "is-success" : "is-neutral"}`}><i />{genre.active ? "Active" : "Inactive"}</span></td>
                    <td>{formatDate(genre.updatedAt)}</td>
                    <td>
                      <div className="admin-genre-actions">
                        <button type="button" className="button button-secondary button-small" onClick={() => openEditForm(genre)}><EditIcon width={14} height={14} />Edit</button>
                        {genre.active ? (
                          <button type="button" className="admin-genre-status-button is-danger" onClick={() => setStatusTarget({ genre, nextActive: false })}>Deactivate</button>
                        ) : (
                          <button type="button" className="admin-genre-status-button" disabled={isSaving} onClick={() => setStatusTarget({ genre, nextActive: true })}>Activate</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
            {genrePage.totalPages > 1 ? <div className="staff-pagination-bar"><button type="button" className="staff-page-btn" disabled={genrePage.first} onClick={() => setPage((current) => Math.max(0, current - 1))}>← Previous</button><span className="staff-page-indicator">Page <b>{genrePage.number + 1}</b> of {genrePage.totalPages}</span><button type="button" className="staff-page-btn" disabled={genrePage.last} onClick={() => setPage((current) => current + 1)}>Next →</button></div> : null}
          </>
        )}
      </section>

      <GenreFormModal open={formOpen} genre={editingGenre} submitting={isSaving} onClose={() => { if (!isSaving) setFormOpen(false); }} onSubmit={handleSave} />

      <DeleteConfirmationModal
        open={Boolean(statusTarget)}
        variant={statusTarget?.nextActive ? "primary" : "danger"}
        title={statusTarget?.nextActive ? "Activate genre?" : "Deactivate genre?"}
        message={
          statusTarget?.nextActive
            ? `“${statusTarget.genre.name}” will become visible in public catalog filters and available for track assignment.`
            : statusTarget
              ? `“${statusTarget.genre.name}” will no longer appear in public filters or new track uploads. Existing tracks will keep their genre.`
              : ""
        }
        confirmLabel={statusTarget?.nextActive ? "Activate" : "Deactivate"}
        submittingLabel={statusTarget?.nextActive ? "Activating..." : "Deactivating..."}
        onConfirm={() => void handleConfirmStatus()}
        onCancel={() => setStatusTarget(null)}
        submitting={isSaving}
      />

      <CenterNotificationPopup
        open={notification.open}
        type={notification.type}
        message={notification.message}
        onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}
