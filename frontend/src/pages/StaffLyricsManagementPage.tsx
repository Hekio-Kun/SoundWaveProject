import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { createPortal } from "react-dom";
import { lyricsApi, type PageResponse } from "../api/lyrics";
import { CenterNotificationPopup } from "../components/modals/CenterNotificationPopup";
import { DeleteConfirmationModal } from "../components/modals/DeleteConfirmationModal";
import { useModalScrollLock } from "../hooks/useModalScrollLock";
import {
  AlertIcon,
  CheckIcon,
  ClockIcon,
  CloseIcon,
  DiscIcon,
  EditIcon,
  FileTextIcon,
  MusicIcon,
  PlusIcon,
  RefreshIcon,
  SearchIcon,
  TrashIcon,
} from "../icons";
import type { StaffTrackLyricSummary, LyricDetail } from "../types";

function formatDuration(seconds?: number | null): string {
  if (!seconds || seconds <= 0) return "--:--";
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.floor(seconds % 60);
  return `${minutes}:${remaining.toString().padStart(2, "0")}`;
}

function formatDate(isoString?: string | null): string {
  if (!isoString) return "--";
  try {
    return new Date(isoString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return isoString;
  }
}

type LyricStatusFilter = "ALL" | "PUBLISHED" | "DRAFT" | "NO_LYRICS";

export function StaffLyricsManagementPage() {
  const [tracksPage, setTracksPage] = useState<PageResponse<StaffTrackLyricSummary> | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LyricStatusFilter>("ALL");
  const [page, setPage] = useState(0);

  // Editor Modal State
  const [editingTrack, setEditingTrack] = useState<StaffTrackLyricSummary | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorLyricContent, setEditorLyricContent] = useState("");
  const [editorStatus, setEditorStatus] = useState<"DRAFT" | "PUBLISHED">("PUBLISHED");
  const [loadingLyricDetail, setLoadingLyricDetail] = useState(false);
  const [savingLyric, setSavingLyric] = useState(false);

  // Delete Confirmation Modal State
  const [deleteTargetTrack, setDeleteTargetTrack] = useState<StaffTrackLyricSummary | null>(null);
  const [deletingLyric, setDeletingLyric] = useState(false);

  // Notification State
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    type: "success" | "error" | "info" | "warning";
  }>({ open: false, message: "", type: "success" });

  const requestIdRef = useRef(0);
  const anyModalOpen = editorOpen || deleteTargetTrack !== null;
  useModalScrollLock(anyModalOpen);

  // Escape key closes modals
  useEffect(() => {
    if (!anyModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (!savingLyric) setEditorOpen(false);
        if (!deletingLyric) setDeleteTargetTrack(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [anyModalOpen, savingLyric, deletingLyric]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Load tracks list
  const loadTracks = async (isManualRefresh = false) => {
    const requestId = ++requestIdRef.current;
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const result = await lyricsApi.getStaffLyricsTracks({
        search: debouncedSearch,
        status: statusFilter,
        page,
        size: 15,
      });
      if (requestId === requestIdRef.current) {
        setTracksPage(result);
      }
    } catch (err: any) {
      if (requestId === requestIdRef.current) {
        setNotification({
          open: true,
          message: err.message || "Failed to load tracks for lyrics management.",
          type: "error",
        });
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    void loadTracks();
  }, [debouncedSearch, statusFilter, page]);

  // Open Editor for a track
  const handleOpenEditor = async (trackItem: StaffTrackLyricSummary) => {
    setEditingTrack(trackItem);
    setEditorOpen(true);
    setEditorLyricContent("");
    setEditorStatus(trackItem.lyricStatus === "DRAFT" ? "DRAFT" : "PUBLISHED");
    setLoadingLyricDetail(true);

    try {
      const detail: LyricDetail = await lyricsApi.getStaffOfficialLyric(trackItem.trackId);
      if (detail && detail.lyricContent) {
        setEditorLyricContent(detail.lyricContent);
        setEditorStatus(detail.status === "DRAFT" ? "DRAFT" : "PUBLISHED");
      }
    } catch {
      // No official lyric yet
      setEditorLyricContent("");
    } finally {
      setLoadingLyricDetail(false);
    }
  };

  // Save Official Lyric
  const handleSaveLyric = async () => {
    if (!editingTrack) return;
    if (!editorLyricContent.trim()) {
      setNotification({
        open: true,
        message: "Lyrics content cannot be blank.",
        type: "warning",
      });
      return;
    }

    setSavingLyric(true);
    try {
      await lyricsApi.saveStaffOfficialLyric({
        trackId: editingTrack.trackId,
        lyricContent: editorLyricContent.trim(),
        status: editorStatus,
      });

      setEditorOpen(false);
      setNotification({
        open: true,
        message: `Official lyric ${editorStatus === "PUBLISHED" ? "published" : "saved as draft"} successfully.`,
        type: "success",
      });
      void loadTracks();
    } catch (err: any) {
      setNotification({
        open: true,
        message: err.message || "Failed to save official lyric.",
        type: "error",
      });
    } finally {
      setSavingLyric(false);
    }
  };

  // Delete Official Lyric
  const handleDeleteLyric = async () => {
    if (!deleteTargetTrack) return;
    setDeletingLyric(true);

    try {
      await lyricsApi.deleteStaffOfficialLyric(deleteTargetTrack.trackId);
      setDeleteTargetTrack(null);
      if (editorOpen) setEditorOpen(false);

      setNotification({
        open: true,
        message: "Official lyric removed from track.",
        type: "success",
      });
      void loadTracks();
    } catch (err: any) {
      setNotification({
        open: true,
        message: err.message || "Failed to remove official lyric.",
        type: "error",
      });
    } finally {
      setDeletingLyric(false);
    }
  };

  return (
    <div className="staff-queue-workspace" style={{ padding: "24px 32px" }}>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <span
            style={{
              display: "grid",
              placeItems: "center",
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "#e0f2fe",
              color: "#0284c7",
            }}
          >
            <FileTextIcon width={18} height={18} />
          </span>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: "#0f172a" }}>
            Official Lyrics Management
          </h1>
        </div>
        <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>
          Create, edit, sync, and publish official verified lyrics for catalog tracks (UC-26 / Section 6.4).
        </p>
      </div>

      {/* Metric / Filter Cards */}
      <section className="staff-metrics-grid" style={{ marginBottom: 24 }}>
        <button
          type="button"
          className={`staff-metric-card is-cyan ${statusFilter === "ALL" ? "is-selected-filter" : ""}`}
          onClick={() => {
            setStatusFilter("ALL");
            setPage(0);
          }}
        >
          <div className="staff-metric-header">
            <span className="staff-metric-icon is-cyan">
              <DiscIcon width={18} height={18} />
            </span>
          </div>
          <div className="staff-metric-body">
            <span className="staff-metric-value">{tracksPage ? tracksPage.totalElements : "--"}</span>
            <strong className="staff-metric-title">All Catalog Tracks</strong>
          </div>
        </button>

        <button
          type="button"
          className={`staff-metric-card is-emerald ${statusFilter === "PUBLISHED" ? "is-selected-filter" : ""}`}
          onClick={() => {
            setStatusFilter("PUBLISHED");
            setPage(0);
          }}
        >
          <div className="staff-metric-header">
            <span className="staff-metric-icon is-emerald">
              <CheckIcon width={18} height={18} />
            </span>
          </div>
          <div className="staff-metric-body">
            <strong className="staff-metric-title">Published Official</strong>
            <span style={{ fontSize: 12, color: "#059669", marginTop: 4 }}>Live for listeners</span>
          </div>
        </button>

        <button
          type="button"
          className={`staff-metric-card is-amber ${statusFilter === "DRAFT" ? "is-selected-filter" : ""}`}
          onClick={() => {
            setStatusFilter("DRAFT");
            setPage(0);
          }}
        >
          <div className="staff-metric-header">
            <span className="staff-metric-icon is-amber">
              <ClockIcon width={18} height={18} />
            </span>
          </div>
          <div className="staff-metric-body">
            <strong className="staff-metric-title">Draft Lyrics</strong>
            <span style={{ fontSize: 12, color: "#d97706", marginTop: 4 }}>Work in progress</span>
          </div>
        </button>

        <button
          type="button"
          className={`staff-metric-card is-rose ${statusFilter === "NO_LYRICS" ? "is-selected-filter" : ""}`}
          onClick={() => {
            setStatusFilter("NO_LYRICS");
            setPage(0);
          }}
        >
          <div className="staff-metric-header">
            <span className="staff-metric-icon is-rose">
              <AlertIcon width={18} height={18} />
            </span>
          </div>
          <div className="staff-metric-body">
            <strong className="staff-metric-title">Missing Lyrics</strong>
            <span style={{ fontSize: 12, color: "#e11d48", marginTop: 4 }}>Needs official lyrics</span>
          </div>
        </button>
      </section>

      {/* Main Workspace Table Panel */}
      <section className="staff-queue-panel">
        <div className="staff-queue-panel-header">
          <div className="staff-queue-title-group">
            <h2 className="staff-queue-heading">Track Catalog</h2>
            <span className="staff-counter-badge">
              {tracksPage ? `${tracksPage.totalElements} tracks` : "..."}
            </span>
          </div>

          <div className="staff-queue-header-actions">
            <button
              type="button"
              className="staff-btn-refresh"
              onClick={() => void loadTracks(true)}
              disabled={refreshing || loading}
              title="Refresh track catalog"
            >
              <RefreshIcon width={14} height={14} className={refreshing ? "spin-icon" : ""} />
              <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="staff-filter-toolbar">
          <div className="staff-segmented-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={statusFilter === "ALL"}
              className={`staff-segment-btn ${statusFilter === "ALL" ? "is-active" : ""}`}
              onClick={() => {
                setStatusFilter("ALL");
                setPage(0);
              }}
            >
              <span>All Tracks</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={statusFilter === "PUBLISHED"}
              className={`staff-segment-btn ${statusFilter === "PUBLISHED" ? "is-active" : ""}`}
              onClick={() => {
                setStatusFilter("PUBLISHED");
                setPage(0);
              }}
            >
              <span>Published</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={statusFilter === "DRAFT"}
              className={`staff-segment-btn ${statusFilter === "DRAFT" ? "is-active" : ""}`}
              onClick={() => {
                setStatusFilter("DRAFT");
                setPage(0);
              }}
            >
              <span>Draft</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={statusFilter === "NO_LYRICS"}
              className={`staff-segment-btn ${statusFilter === "NO_LYRICS" ? "is-active" : ""}`}
              onClick={() => {
                setStatusFilter("NO_LYRICS");
                setPage(0);
              }}
            >
              <span>Missing Lyrics</span>
            </button>
          </div>

          <div className="staff-search-box">
            <SearchIcon width={15} height={15} />
            <input
              type="text"
              placeholder="Search by track title..."
              value={search}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              aria-label="Search tracks"
            />
            {search ? (
              <button
                type="button"
                className="staff-search-clear"
                onClick={() => setSearch("")}
                title="Clear search"
              >
                <CloseIcon width={12} height={12} />
              </button>
            ) : null}
          </div>
        </div>

        {/* Data Table */}
        <div className="staff-table-wrap">
          {loading ? (
            <div className="staff-empty-state" style={{ minHeight: 320 }}>
              <span className="track-details-spinner" aria-hidden="true" />
              <p>Loading tracks and lyrics...</p>
            </div>
          ) : !tracksPage || tracksPage.content.length === 0 ? (
            <div className="staff-empty-state" style={{ minHeight: 320 }}>
              <FileTextIcon width={36} height={36} />
              <strong>No tracks found</strong>
              <span>Try adjusting your search query or filter settings.</span>
            </div>
          ) : (
            <table className="staff-table">
              <thead>
                <tr>
                  <th>TRACK</th>
                  <th>ALBUM</th>
                  <th>DURATION</th>
                  <th>OFFICIAL LYRICS STATUS</th>
                  <th>LAST UPDATED</th>
                  <th style={{ textAlign: "right" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {tracksPage.content.map((trackItem) => {
                  const status = trackItem.lyricStatus;
                  return (
                    <tr key={trackItem.trackId}>
                      {/* Track info */}
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          <strong style={{ color: "#0f172a", fontSize: 13.5 }}>{trackItem.title}</strong>
                          <span style={{ color: "#64748b", fontSize: 12 }}>{trackItem.artistName}</span>
                        </div>
                      </td>

                      {/* Album */}
                      <td>
                        <span style={{ color: "#334155", fontSize: 13 }}>
                          {trackItem.albumTitle || "Single"}
                        </span>
                      </td>

                      {/* Duration */}
                      <td>
                        <span style={{ color: "#64748b", fontSize: 13, fontFamily: "monospace" }}>
                          {formatDuration(trackItem.durationSeconds)}
                        </span>
                      </td>

                      {/* Lyric status */}
                      <td>
                        {status === "PUBLISHED" ? (
                          <span className="staff-status-pill is-approved">
                            <CheckIcon width={12} height={12} /> Published
                          </span>
                        ) : status === "DRAFT" ? (
                          <span className="staff-status-pill is-pending">
                            <ClockIcon width={12} height={12} /> Draft
                          </span>
                        ) : (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              padding: "4px 8px",
                              borderRadius: 6,
                              fontSize: 11,
                              fontWeight: 600,
                              background: "#f1f5f9",
                              color: "#64748b",
                            }}
                          >
                            No Lyrics
                          </span>
                        )}
                      </td>

                      {/* Last updated */}
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          <span style={{ color: "#334155", fontSize: 12 }}>
                            {formatDate(trackItem.lastUpdated)}
                          </span>
                          {trackItem.updatedByStaffName ? (
                            <span style={{ color: "#94a3b8", fontSize: 11 }}>
                              by {trackItem.updatedByStaffName}
                            </span>
                          ) : null}
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                          <button
                            type="button"
                            className="button button-secondary button-small"
                            onClick={() => void handleOpenEditor(trackItem)}
                            title="Edit official lyrics"
                          >
                            <EditIcon width={13} height={13} />
                            <span>{trackItem.hasOfficialLyric ? "Edit Lyrics" : "Add Lyrics"}</span>
                          </button>

                          {trackItem.hasOfficialLyric ? (
                            <button
                              type="button"
                              className="button button-secondary button-small button-danger-hover"
                              onClick={() => setDeleteTargetTrack(trackItem)}
                              title="Delete official lyrics"
                            >
                              <TrashIcon width={13} height={13} />
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Bar */}
        {tracksPage && tracksPage.totalPages > 1 ? (
          <div className="staff-pagination" style={{ padding: "16px 24px", borderTop: "1px solid #f0f2f5" }}>
            <span style={{ fontSize: 13, color: "#64748b" }}>
              Page {tracksPage.number + 1} of {tracksPage.totalPages} ({tracksPage.totalElements} tracks)
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                type="button"
                className="button button-secondary button-small"
                disabled={tracksPage.first}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Previous
              </button>
              <button
                type="button"
                className="button button-secondary button-small"
                disabled={tracksPage.last}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </section>

      {/* Official Lyrics Editor Modal */}
      {editorOpen && editingTrack
        ? createPortal(
            <div
              className="modal-backdrop"
              role="presentation"
              onClick={() => {
                if (!savingLyric) setEditorOpen(false);
              }}
            >
              <section
                className="track-dialog"
                style={{ width: "min(100%, 720px)" }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="staff-lyric-modal-title"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="track-dialog-heading">
                  <span>
                    <FileTextIcon />
                  </span>
                  <div>
                    <small>OFFICIAL LYRICS</small>
                    <h2 id="staff-lyric-modal-title">Manage Official Lyrics</h2>
                  </div>
                </div>

                <div
                  style={{
                    background: "#f8fafc",
                    padding: "12px 16px",
                    borderRadius: 10,
                    margin: "14px 0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <strong style={{ display: "block", color: "#0f172a", fontSize: 15 }}>
                      {editingTrack.title}
                    </strong>
                    <span style={{ color: "#64748b", fontSize: 13 }}>{editingTrack.artistName}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>Status:</label>
                    <select
                      value={editorStatus}
                      onChange={(e) => setEditorStatus(e.target.value as "DRAFT" | "PUBLISHED")}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 8,
                        border: "1px solid #cbd5e1",
                        fontSize: 13,
                        fontWeight: 600,
                        background: "#fff",
                      }}
                      disabled={savingLyric}
                    >
                      <option value="PUBLISHED">PUBLISHED (Verified Official)</option>
                      <option value="DRAFT">DRAFT (Internal Review)</option>
                    </select>
                  </div>
                </div>

                {loadingLyricDetail ? (
                  <div style={{ textAlign: "center", padding: "40px 0" }}>
                    <span className="track-details-spinner" aria-hidden="true" />
                    <p style={{ color: "#64748b", marginTop: 8 }}>Loading lyric content...</p>
                  </div>
                ) : (
                  <>
                    <textarea
                      className="track-lyrics-dialog-textarea"
                      style={{ minHeight: 320 }}
                      value={editorLyricContent}
                      onChange={(e) => setEditorLyricContent(e.target.value)}
                      placeholder="Paste or edit LRC lyrics here (e.g. [00:01.00] Lyric line)..."
                      disabled={savingLyric}
                    />
                    <p className="track-lyrics-dialog-hint">
                      Format: Standard LRC with timestamps (e.g. <code>[mm:ss.xx] Line</code>) or plain text.
                      Publishing will immediately sync to the track's public playback view.
                    </p>
                  </>
                )}

                <div className="track-dialog-actions" style={{ justifyContent: "space-between" }}>
                  <div>
                    {editingTrack.hasOfficialLyric ? (
                      <button
                        type="button"
                        className="button button-secondary button-danger-hover"
                        disabled={savingLyric}
                        onClick={() => setDeleteTargetTrack(editingTrack)}
                      >
                        <TrashIcon width={14} height={14} />
                        <span>Delete Lyric</span>
                      </button>
                    ) : null}
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      type="button"
                      className="button button-secondary"
                      disabled={savingLyric}
                      onClick={() => setEditorOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="button button-primary"
                      disabled={savingLyric || loadingLyricDetail || !editorLyricContent.trim()}
                      onClick={() => {
                        void handleSaveLyric();
                      }}
                    >
                      {savingLyric ? "Saving..." : editorStatus === "PUBLISHED" ? "Save & Publish" : "Save Draft"}
                    </button>
                  </div>
                </div>
              </section>
            </div>,
            document.body
          )
        : null}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={deleteTargetTrack !== null}
        title="Delete Official Lyric"
        message={`Are you sure you want to permanently delete the official lyrics for "${deleteTargetTrack?.title}"? Listeners will no longer see verified lyrics for this track.`}
        confirmLabel="Delete Official Lyric"
        submitting={deletingLyric}
        onConfirm={() => {
          void handleDeleteLyric();
        }}
        onCancel={() => setDeleteTargetTrack(null)}
      />

      {/* Center Toast Feedback */}
      <CenterNotificationPopup
        open={notification.open}
        type={notification.type}
        message={notification.message}
        onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}
