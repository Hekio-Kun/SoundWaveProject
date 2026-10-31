import { useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { useModalScrollLock } from "../hooks/useModalScrollLock";
import {
  studioApi,
  TrackApiError,
  type ApiTrack,
  type GenreOption,
  type AlbumOption,
  type RejectionDetails,
} from "../api/track";
import { albumApi } from "../api/album";
import { AlbumFormModal } from "../components/modals/AlbumFormModal";
import { AlbumDetailModal } from "../components/modals/AlbumDetailModal";
import { AlbumSubmissionReviewModal } from "../components/modals/AlbumSubmissionReviewModal";
import { DeleteConfirmationModal } from "../components/modals/DeleteConfirmationModal";
import { MediaUploadField } from "../components/common/MediaUploadField";
import { RejectionDetailsModal } from "../components/modals/RejectionDetailsModal";
import { CenterNotificationPopup } from "../components/modals/CenterNotificationPopup";
import {
  AlertIcon,
  CheckIcon,
  ClockIcon,
  CloseIcon,
  EditIcon,
  EyeIcon,
  FileTextIcon,
  HeadphonesIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
  UploadIcon,
} from "../icons";
import type { StudioAlbum, StudioTrack } from "../types";
import {
  readAudioDuration,
  readLyricsFile,
  validateAudioFile,
  validateCoverFile,
  validateLyricsFile,
} from "../utils/trackUpload";

function formatDuration(ms?: number): string {
  if (!ms || ms <= 0) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

type Props = {
  tracks: StudioTrack[];
  onNavigate: (route: string) => void;
  audio?: HTMLAudioElement;
  playing?: boolean;
  onPlayingChange?: (playing: boolean) => void;
  initialTab?: "TRACKS" | "ALBUMS";
};

export function StudioPage({
  tracks: fallbackTracks,
  onNavigate,
  audio,
  playing = false,
  onPlayingChange,
  initialTab = "TRACKS",
}: Props) {
  const [filterStatus, setFilterStatus] = useState<
    "ALL" | "DRAFT" | "PENDING" | "APPROVED" | "REJECTED"
  >("ALL");

  // Server state
  const [trackList, setTrackList] = useState<StudioTrack[]>(fallbackTracks);
  const [stats, setStats] = useState({
    total: fallbackTracks.length,
    draft: fallbackTracks.filter((t) => t.status === "DRAFT").length,
    pending: fallbackTracks.filter((t) => t.status === "PENDING").length,
    approved: fallbackTracks.filter((t) => t.status === "APPROVED").length,
    rejected: fallbackTracks.filter((t) => t.status === "REJECTED").length,
  });
  const [genres, setGenres] = useState<GenreOption[]>([]);
  const [albums, setAlbums] = useState<AlbumOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Modals state

  const [deleteConfirmTrack, setDeleteConfirmTrack] = useState<StudioTrack | null>(null);
  const [rejectionModalTrack, setRejectionModalTrack] = useState<RejectionDetails | null>(null);
  const [submittingNoteTrack, setSubmittingNoteTrack] = useState<StudioTrack | null>(null);
  const [submitterNote, setSubmitterNote] = useState("");
  const [submitCopyrightAgreed, setSubmitCopyrightAgreed] = useState(false);
  const [withdrawConfirmTrack, setWithdrawConfirmTrack] = useState<StudioTrack | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [previewAudioUrl, setPreviewAudioUrl] = useState<string | null>(null);
  const [previewAudioPlaying, setPreviewAudioPlaying] = useState(false);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Navigation: Tracks vs Albums
  const [activeStudioTab, setActiveStudioTab] = useState<"TRACKS" | "ALBUMS">(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveStudioTab(initialTab);
    }
  }, [initialTab]);

  // Albums state (UC-21: Manage My Album - UC-21.4 View Albums)
  const [albumList, setAlbumList] = useState<StudioAlbum[]>([]);
  const [albumFilter, setAlbumFilter] = useState<
    "ALL" | "PUBLISHED" | "PENDING" | "REJECTED" | "DRAFT"
  >("ALL");
  const [albumSearchQuery, setAlbumSearchQuery] = useState("");
  const [albumViewMode, setAlbumViewMode] = useState<"table" | "grid">("table");
  const [loadingAlbums, setLoadingAlbums] = useState(false);
  const [albumModalOpen, setAlbumModalOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<StudioAlbum | null>(null);
  const [detailAlbum, setDetailAlbum] = useState<StudioAlbum | null>(null);
  const [deleteConfirmAlbum, setDeleteConfirmAlbum] = useState<StudioAlbum | null>(null);
  const [deletingAlbum, setDeletingAlbum] = useState(false);
  const [submittingAlbum, setSubmittingAlbum] = useState<StudioAlbum | null>(null);
  const [submitAlbumModalOpen, setSubmitAlbumModalOpen] = useState(false);

  // Trigger Submit Album for Review (Sequence 1, 1.1, 1.2.1.1, 1.2.2.1)
  const handleStartSubmitAlbum = (album: StudioAlbum) => {
    // 1.1: validateAlbumBeforeSubmission(albumId)
    // alt [contains_zero_associated_tracks]
    if (album.trackCount === 0) {
      // 1.2.1.1: displayAlert("Cannot submit an empty album. Please add at least one track")
      setActionError("Cannot submit an empty album. Please add at least one track.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    // [contains_at_least_one_associated_track] -> open review modal
    setSubmittingAlbum(album);
    setSubmitAlbumModalOpen(true);
  };

  const handleAlbumSubmittedSuccess = async () => {
    setSubmitAlbumModalOpen(false);
    setSubmittingAlbum(null);
    setActionSuccess("Album submitted successfully for Staff review.");
    await Promise.all([loadAlbums(), loadStudioData()]);
  };

  // Load albums from Backend API (UC-21.1)
  const loadAlbums = async () => {
    try {
      setLoadingAlbums(true);
      const data = await albumApi.getMyAlbums();
      setAlbumList(data);
    } catch (err: unknown) {
      console.error("Failed to load studio albums", err);
    } finally {
      setLoadingAlbums(false);
    }
  };

  useEffect(() => {
    void loadAlbums();
  }, []);

  // Delete album handler (UC-21.6 Delete An Album)
  const handleDeleteAlbum = async () => {
    if (!deleteConfirmAlbum) return;
    try {
      setDeletingAlbum(true);
      // Step 1.1: DELETE /api/v1/studio/albums/{id}
      await albumApi.deleteAlbum(deleteConfirmAlbum.id);
      // Step 1.11.2.22: displaySuccessToast("Album and all constituent tracks have been permanently deleted")
      setActionSuccess("Album and all constituent tracks have been permanently deleted");
      setDeleteConfirmAlbum(null);
      await Promise.all([loadAlbums(), loadStudioData()]);
    } catch (err: unknown) {
      // Step 1.11.1.4: displayErrorMessage("Album not found or access denied") and dismissModal()
      setActionError(err instanceof Error ? err.message : "Album not found or access denied");
      setDeleteConfirmAlbum(null);
    } finally {
      setDeletingAlbum(false);
    }
  };

  // Load data from Backend API
  const loadStudioData = async () => {
    try {
      setLoading(true);
      const [fetchedTracks, fetchedStats, fetchedGenres, fetchedAlbums] =
        await Promise.all([
          studioApi.getMyTracks(filterStatus),
          studioApi.getStats(),
          studioApi.getGenres(),
          studioApi.getMyAlbums(),
        ]);

      const mapped: StudioTrack[] = fetchedTracks.map((t: ApiTrack) => ({
          id: t.id,
          title: t.title,
          slug: t.slug,
          description: t.description,
          coverUrl: t.coverUrl ?? "/pics/album.png",
          audioUrl: t.audioUrl,
          durationMs: t.durationMs,
          genreId: t.genreId,
          genreSlug: t.genreSlug,
          genreName: t.genreName,
          albumId: t.albumId,
          albumTitle: t.albumTitle,
          trackNumber: t.trackNumber,
          status: t.status === "PUBLISHED" || t.status === "APPROVED"
            ? "APPROVED"
            : t.status === "TAKEN_DOWN"
            ? "REJECTED"
            : t.status,
          latestRejectionReason: t.latestRejectionReason,
          reviewerNote: t.reviewerNote,
          createdAt: new Date(t.createdAt).toLocaleDateString(),
          lyrics: t.lyrics,
        }));
      setTrackList(mapped);
      setStats(fetchedStats);

      if (fetchedGenres.length > 0) {
        setGenres(fetchedGenres);
      }

      setAlbums(fetchedAlbums);
      setActionError(null);
    } catch (error: unknown) {
      setActionError(error instanceof Error
        ? error.message
        : "Content Studio could not be loaded. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStudioData();
  }, [filterStatus]);

  useEffect(() => {
    try {
      const flash = sessionStorage.getItem("soundwave_flash_toast");
      if (flash) {
        sessionStorage.removeItem("soundwave_flash_toast");
        const parsed = JSON.parse(flash);
        if (parsed?.message) {
          setActionSuccess(parsed.message);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Rule 4.7: Modal background scroll lock
  useModalScrollLock(
    Boolean(
      deleteConfirmTrack ||
      rejectionModalTrack ||
      submittingNoteTrack ||
      withdrawConfirmTrack
    )
  );


  // [FEATURE]: Điều hướng xem chi tiết nộp duyệt bài hát (/track/submission/:id) - Loại bỏ tiền tố /studio
  const handleOpenDetail = (track: StudioTrack) => {
    onNavigate(`/track/submission/${track.id}`);
  };

  // Delete Track (UC-19.4)
  const handleDeleteTrack = async () => {
    if (!deleteConfirmTrack) return;
    const targetId = deleteConfirmTrack.id;
    try {
      setIsSaving(true);
      await studioApi.deleteTrack(targetId);
      setDeleteConfirmTrack(null);
      setTrackList((prev) => prev.filter((t) => t.id !== targetId));
      setActionSuccess("Đã xóa bài hát thành công.");
      await loadStudioData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete track.";
      setActionError(msg);

    } finally {
      setIsSaving(false);
    }
  };

  // Submit For Review (UC-19.4)
  const handleSubmitReview = async () => {
    if (!submittingNoteTrack) return;
    try {
      setIsSaving(true);
      await studioApi.submitForReview(submittingNoteTrack.id, submitterNote.trim() || undefined);
      const title = submittingNoteTrack.title;
      setSubmittingNoteTrack(null);
      setSubmitterNote("");
      setSubmitCopyrightAgreed(false);
      setActionSuccess(`Track "${title}" submitted for moderation review successfully.`);
      await loadStudioData();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Failed to submit track.");
    } finally {
      setIsSaving(false);
    }
  };

  // Withdraw Submission from Review (UC-19.4 Extension)
  const handleWithdrawSubmission = async () => {
    if (!withdrawConfirmTrack) return;
    try {
      setIsSaving(true);
      await studioApi.withdrawSubmission(withdrawConfirmTrack.id);
      const title = withdrawConfirmTrack.title;
      setWithdrawConfirmTrack(null);
      setActionSuccess(`Track "${title}" has been withdrawn from review and returned to Draft.`);
      await loadStudioData();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Failed to withdraw track submission.");
    } finally {
      setIsSaving(false);
    }
  };

  // Audio Preview Player
  const handleToggleAudioPreview = (audioUrl?: string) => {
    if (!audioUrl) return;
    if (!previewAudioRef.current) return;
    if (previewAudioUrl === audioUrl && previewAudioPlaying) {
      previewAudioRef.current.pause();
      setPreviewAudioPlaying(false);
    } else {
      if (playing) {
        onPlayingChange?.(false);
        if (audio) {
          audio.pause();
        }
      }
      previewAudioRef.current.src = audioUrl;
      previewAudioRef.current.play().then(() => {
        setPreviewAudioUrl(audioUrl);
        setPreviewAudioPlaying(true);
      }).catch(() => {
        setPreviewAudioPlaying(false);
      });
    }
  };

  useEffect(() => {
    if (playing && previewAudioPlaying && previewAudioRef.current) {
      previewAudioRef.current.pause();
      setPreviewAudioPlaying(false);
    }
  }, [playing, previewAudioPlaying]);

  // View Rejection Reason (UC-20)
  // View Rejection Reason (UC-20 theo đúng Sequence Diagram & Đặc tả RDS)
  const handleViewRejection = async (track: StudioTrack) => {
    try {
      setActionError(null);
      // Bước 2: getRejectionDetails(trackId) -> Gọi API backend
      const details = await studioApi.getRejectionDetails(track.id);
      // Bước 30: openModal(rejectionDetailsResponse)
      setRejectionModalTrack(details);
    } catch (err: unknown) {
      // Bước 15 & Exception EX02: displayErrorNotification("Track not found or access denied.")
      const errorMessage =
        err instanceof Error && err.message
          ? err.message
          : "Track not found or access denied.";
      setActionError(errorMessage);
      setRejectionModalTrack(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const filtered = trackList.filter((t) => {
    const matchesStatus = filterStatus === "ALL" || t.status === filterStatus;
    if (!matchesStatus) return false;
    if (!searchQuery.trim()) return true;
    const query = searchQuery.trim().toLowerCase();
    return (
      t.title.toLowerCase().includes(query) ||
      (t.genreName && t.genreName.toLowerCase().includes(query)) ||
      (t.albumTitle && t.albumTitle.toLowerCase().includes(query)) ||
      (t.description && t.description.toLowerCase().includes(query))
    );
  });

  // Album Metrics & Filters (UC-21.4 View Albums - RDS AF01: Draft, Pending, Published, Rejected)
  const albumStats = {
    total: albumList.length,
    published: albumList.filter((a) => (a.status || "").toUpperCase() === "PUBLISHED" || (a.status || "").toUpperCase() === "APPROVED").length,
    pending: albumList.filter((a) => (a.status || "").toUpperCase() === "PENDING").length,
    rejected: albumList.filter((a) => (a.status || "").toUpperCase() === "REJECTED").length,
    draft: albumList.filter((a) => (a.status || "DRAFT").toUpperCase() === "DRAFT").length,
  };

  const filteredAlbums = albumList.filter((album) => {
    const status = (album.status || "DRAFT").toUpperCase();
    const isPublished = status === "PUBLISHED" || status === "APPROVED";
    const matchesStatus =
      albumFilter === "ALL" ||
      (albumFilter === "PUBLISHED" && isPublished) ||
      (albumFilter === "PENDING" && status === "PENDING") ||
      (albumFilter === "REJECTED" && status === "REJECTED") ||
      (albumFilter === "DRAFT" && status === "DRAFT");

    if (!matchesStatus) return false;
    if (!albumSearchQuery.trim()) return true;
    const q = albumSearchQuery.trim().toLowerCase();
    return (
      album.title.toLowerCase().includes(q) ||
      (album.description && album.description.toLowerCase().includes(q))
    );
  });

  /**
   * Sequence Diagram UC-21.4 (Step 1.16):
   * renderMyAlbumsTable(albums[coverUrl, title, statusBadge, trackCount, actions])
   */
  const renderMyAlbumsTable = (albumsToRender: StudioAlbum[]) => {
    return (
      <div className="studio-table-container">
        <table className="studio-table">
          <thead>
            <tr>
              <th>Album</th>
              <th>Status</th>
              <th>Tracks</th>
              <th>Release date</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {albumsToRender.length === 0 ? (
              <tr>
                <td colSpan={5} className="table-empty-cell">
                  {albumSearchQuery
                    ? `No albums match "${albumSearchQuery}".`
                    : "No albums in this category. Click \"Create album\" to create one."}
                </td>
              </tr>
            ) : (
              albumsToRender.map((album) => {
                const status = (album.status || "DRAFT").toUpperCase();
                const isPublished = status === "PUBLISHED" || status === "APPROVED";
                const isPending = status === "PENDING";
                const isRejected = status === "REJECTED";
                const statusClass = isPublished
                  ? "status-pill--approved"
                  : isPending
                  ? "status-pill--pending"
                  : isRejected
                  ? "status-pill--rejected"
                  : "status-pill--draft";

                return (
                  <tr key={album.id}>
                    <td>
                      <div className="table-track-cell">
                        <img
                          src={album.coverUrl || "/pics/album.png"}
                          alt={album.title}
                          style={{
                            width: "42px",
                            height: "42px",
                            objectFit: "cover",
                            borderRadius: "6px",
                            flexShrink: 0,
                            display: "block",
                          }}
                        />
                        <div>
                          <button
                            type="button"
                            onClick={() => onNavigate(`/album/submission/${album.id}`)}
                            style={{
                              background: "none",
                              border: "none",
                              padding: 0,
                              font: "inherit",
                              fontWeight: "bold",
                              color: "var(--sw-text, #1e293b)",
                              cursor: "pointer",
                              textAlign: "left",
                            }}
                            title="Click to view album details"
                          >
                            {album.title}
                          </button>
                          {album.description && (
                            <small
                              style={{
                                display: "block",
                                color: "var(--sw-text-muted, #64748b)",
                                maxWidth: "340px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {album.description}
                            </small>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill ${statusClass}`}>
                        {status}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 500, color: "var(--sw-text-secondary, #475467)" }}>
                        {album.trackCount} {album.trackCount === 1 ? "track" : "tracks"}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "13px", color: "var(--sw-text-muted, #64748b)" }}>
                        {album.releaseDate || (album.createdAt ? new Date(album.createdAt).toLocaleDateString() : "—")}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", justifyContent: "flex-end" }}>
                        {!isPublished && (
                          <button
                            type="button"
                            className="button button-primary button-small"
                            onClick={() => handleStartSubmitAlbum(album)}
                            id={`btn-submit-album-table-${album.id}`}
                            style={{
                              padding: "4px 10px",
                              fontSize: "12px",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                            title="Submit album for staff moderation review"
                          >
                            <UploadIcon width={13} height={13} />
                            <span>Submit</span>
                          </button>
                        )}
                        <button
                          type="button"
                          className="button button-ghost button-small"
                          onClick={() => {
                            setEditingAlbum(album);
                            setAlbumModalOpen(true);
                          }}
                          id={`btn-edit-album-table-${album.id}`}
                          title="Edit album metadata (UC-21.5)"
                        >
                          <EditIcon width={14} height={14} />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          className="button button-ghost button-small"
                          onClick={() => onNavigate(`/album/submission/${album.id}`)}
                          title="View album details"
                        >
                          <EyeIcon width={14} height={14} />
                          <span>Details</span>
                        </button>
                        <button
                          type="button"
                          className="button button-ghost button-small"
                          onClick={() => setDeleteConfirmAlbum(album)}
                          style={{ color: "var(--sw-danger, #b42318)" }}
                          title="Delete album"
                        >
                          <TrashIcon width={14} height={14} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="studio-page">
      <div className="studio-header">
        <div>
          <span className="eyebrow">CONTENT STUDIO</span>
          <h1 className="page-heading">Content Studio</h1>
          <p className="page-subtext">
            Upload tracks, curate albums, save drafts, manage submissions, and review staff feedback.
          </p>
        </div>
        {/* [FEATURE]: Nút tạo bài hát / tạo album mới điều hướng trực tiếp đến /track/create hoặc /album/create */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {activeStudioTab === "TRACKS" ? (
            <button
              className="button button-primary"
              onClick={() => onNavigate("/track/create")}
              id="btn-open-create-track"
            >
              <UploadIcon width={18} height={18} />
              <span>Create track</span>
            </button>
          ) : (
            <button
              className="button button-primary"
              onClick={() => onNavigate("/album/create")}
              id="btn-open-create-album"
            >
              <PlusIcon width={18} height={18} />
              <span>Create album</span>
            </button>
          )}
        </div>
      </div>

      {actionError && (
        <div className="auth-v2-error" role="alert" style={{ marginBottom: "20px" }}>
          <span><AlertIcon width={18} height={18} /></span>
          <div>
            <b>Operation failed</b>
            <small>{actionError}</small>
          </div>
          <button
            className="icon-button"
            onClick={() => setActionError(null)}
            style={{ marginLeft: "auto" }}
            aria-label="Dismiss error"
          >
            <CloseIcon width={16} height={16} />
          </button>
        </div>
      )}

      {actionSuccess && (
        <div className="studio-success-alert" role="status">
          <span><CheckIcon width={18} height={18} /></span>
          <div>
            <b>Saved successfully</b>
            <small>{actionSuccess}</small>
          </div>
          <button
            className="icon-button"
            onClick={() => setActionSuccess(null)}
            aria-label="Dismiss success message"
          >
            <CloseIcon width={16} height={16} />
          </button>
        </div>
      )}

      {/* [FEATURE]: Thanh tab Content Studio (My Tracks vs My Albums) - Tự động cập nhật URL /track hoặc /album */}
      <div className="library-tabs-bar" style={{ marginBottom: "20px" }}>
        <div className="library-nav-tabs">
          <button
            type="button"
            className={`library-tab ${activeStudioTab === "TRACKS" ? "library-tab--active" : ""}`}
            onClick={() => {
              setActiveStudioTab("TRACKS");
              onNavigate("/track");
            }}
            id="tab-studio-tracks"
          >
            My Tracks ({stats.total})
          </button>
          <button
            type="button"
            className={`library-tab ${activeStudioTab === "ALBUMS" ? "library-tab--active" : ""}`}
            onClick={() => {
              setActiveStudioTab("ALBUMS");
              onNavigate("/album");
            }}
            id="tab-studio-albums"
          >
            My Albums ({albumList.length})
          </button>
        </div>
      </div>

      {activeStudioTab === "TRACKS" ? (
        <>
          {/* Status Filter Bar without Search & Overview */}
          <div className="studio-tabs-bar" style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "18px" }}>
            <button
              className={`filter-pill ${filterStatus === "ALL" ? "filter-pill--active" : ""}`}
              onClick={() => setFilterStatus("ALL")}
            >
              All ({stats.total})
            </button>
            <button
              className={`filter-pill ${filterStatus === "APPROVED" ? "filter-pill--active" : ""}`}
              onClick={() => setFilterStatus("APPROVED")}
            >
              Published ({stats.approved})
            </button>
            <button
              className={`filter-pill ${filterStatus === "PENDING" ? "filter-pill--active" : ""}`}
              onClick={() => setFilterStatus("PENDING")}
            >
              Pending ({stats.pending})
            </button>
            <button
              className={`filter-pill ${filterStatus === "REJECTED" ? "filter-pill--active" : ""}`}
              onClick={() => setFilterStatus("REJECTED")}
            >
              Rejected ({stats.rejected})
            </button>
            <button
              className={`filter-pill ${filterStatus === "DRAFT" ? "filter-pill--active" : ""}`}
              onClick={() => setFilterStatus("DRAFT")}
            >
              Draft ({stats.draft})
            </button>
          </div>

      <audio
        ref={previewAudioRef}
        style={{ display: "none" }}
        onEnded={() => setPreviewAudioPlaying(false)}
        onError={() => setPreviewAudioPlaying(false)}
      />

      {/* Tracks Table */}
      <div className="studio-table-container">
        {loading ? (
          <div style={{ padding: "32px", textAlign: "center", color: "var(--sw-text-muted)" }}>
            Loading tracks...
          </div>
        ) : (
          <table className="studio-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Genre</th>
                <th>Album</th>
                <th>Status</th>
                <th>Created date</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="table-empty-cell">
                    {searchQuery
                      ? `No tracks match "${searchQuery}".`
                      : "No tracks in this category. Click \"Upload track\" to create one."}
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <div className="table-track-cell">
                        <div style={{ position: "relative", width: "42px", height: "42px", flexShrink: 0 }}>
                          <img
                            src={t.coverUrl ?? "/pics/album.png"}
                            alt={t.title}
                            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "6px", display: "block" }}
                          />
                          {t.audioUrl && (
                            <button
                              type="button"
                              onClick={() => handleToggleAudioPreview(t.audioUrl)}
                              style={{
                                position: "absolute",
                                inset: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: previewAudioUrl === t.audioUrl && previewAudioPlaying ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.35)",
                                border: "none",
                                borderRadius: "6px",
                                color: "#fff",
                                cursor: "pointer",
                                opacity: previewAudioUrl === t.audioUrl && previewAudioPlaying ? 1 : 0.8,
                                transition: "opacity 0.2s",
                              }}
                              title={previewAudioUrl === t.audioUrl && previewAudioPlaying ? "Pause audio preview" : "Play audio preview"}
                              aria-label={previewAudioUrl === t.audioUrl && previewAudioPlaying ? `Pause ${t.title}` : `Play ${t.title}`}
                            >
                              {previewAudioUrl === t.audioUrl && previewAudioPlaying ? (
                                <PauseIcon width={16} height={16} />
                              ) : (
                                <PlayIcon width={16} height={16} />
                              )}
                            </button>
                          )}
                        </div>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <button
                              type="button"
                              onClick={() => void handleOpenDetail(t)}
                              style={{
                                background: "none",
                                border: "none",
                                padding: 0,
                                font: "inherit",
                                fontWeight: "bold",
                                color: "var(--sw-text, #1e293b)",
                                cursor: "pointer",
                                textAlign: "left",
                              }}
                              title="Click to view details"
                            >
                              {t.title}
                            </button>
                            {t.lyrics && (
                              <span
                                title="Official lyrics attached"
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "3px",
                                  padding: "2px 6px",
                                  fontSize: "10px",
                                  fontWeight: 600,
                                  background: "#ecfeff",
                                  color: "#0891b2",
                                  borderRadius: "4px",
                                  border: "1px solid #cffafe",
                                }}
                              >
                                <FileTextIcon width={10} height={10} /> Lyrics
                              </span>
                            )}
                          </div>
                          {t.description && (
                            <small
                              style={{
                                display: "block",
                                color: "var(--sw-text-muted)",
                                maxWidth: "260px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {t.description}
                            </small>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="genre-badge">{t.genreName}</span>
                    </td>
                    <td>
                      <span className="text-secondary small">
                        {t.albumTitle ? `${t.albumTitle}${t.trackNumber ? ` (#${t.trackNumber})` : ""}` : "—"}
                      </span>
                    </td>
                    <td>
                      {t.status === "REJECTED" ? (
                        <button
                          type="button"
                          className="status-badge status-badge--rejected"
                          onClick={() => handleViewRejection(t)}
                          title="Click to view rejection reason & staff feedback"
                          style={{ cursor: "pointer" }}
                        >
                          Rejected
                        </button>
                      ) : (
                        <span className={`status-badge status-badge--${t.status.toLowerCase()}`}>
                          {(t.status === "APPROVED" || t.status === "PUBLISHED") && "Published"}
                          {t.status === "PENDING" && "Pending Review"}
                          {t.status === "DRAFT" && "Draft"}
                        </span>
                      )}
                    </td>
                    <td>{t.createdAt}</td>
                    <td style={{ textAlign: "right" }}>
                      <div className="table-action-btns" style={{ justifyContent: "flex-end", gap: "8px" }}>
                        {t.status === "REJECTED" && (
                          <button
                            type="button"
                            className="button button-small"
                            onClick={() => handleViewRejection(t)}
                            title="View staff rejection reason & feedback"
                            style={{
                              backgroundColor: "#fee4e2",
                              color: "#b42318",
                              borderColor: "#fecdca",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              fontWeight: 600,
                              padding: "5px 12px",
                              borderRadius: "8px",
                            }}
                          >
                            <AlertIcon width={13} height={13} />
                            <span>Rejection feedback</span>
                          </button>
                        )}
                        <button
                          type="button"
                          className="button button-ghost button-small"
                          onClick={() => handleOpenDetail(t)}
                          title="View track details & moderation status"
                        >
                          <EyeIcon width={14} height={14} />
                          <span>Details</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
        </>
      ) : (
        <>
          {/* ALBUMS TAB (UC-21.4: View Albums - AF01: View owned albums in Content Studio) */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
              marginBottom: "18px",
            }}
          >
            {/* Status Filter Bar - RDS AF01: Draft, Pending Review, Published, Rejected */}
            <div
              className="studio-tabs-bar"
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
                margin: 0,
              }}
            >
              <button
                type="button"
                className={`filter-pill ${albumFilter === "ALL" ? "filter-pill--active" : ""}`}
                onClick={() => setAlbumFilter("ALL")}
              >
                All ({albumStats.total})
              </button>
              <button
                type="button"
                className={`filter-pill ${albumFilter === "PUBLISHED" ? "filter-pill--active" : ""}`}
                onClick={() => setAlbumFilter("PUBLISHED")}
              >
                Published ({albumStats.published})
              </button>
              <button
                type="button"
                className={`filter-pill ${albumFilter === "PENDING" ? "filter-pill--active" : ""}`}
                onClick={() => setAlbumFilter("PENDING")}
              >
                Pending ({albumStats.pending})
              </button>
              <button
                type="button"
                className={`filter-pill ${albumFilter === "REJECTED" ? "filter-pill--active" : ""}`}
                onClick={() => setAlbumFilter("REJECTED")}
              >
                Rejected ({albumStats.rejected})
              </button>
              <button
                type="button"
                className={`filter-pill ${albumFilter === "DRAFT" ? "filter-pill--active" : ""}`}
                onClick={() => setAlbumFilter("DRAFT")}
              >
                Draft ({albumStats.draft})
              </button>
            </div>

            {/* Search and View Mode Switcher */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  background: "#ffffff",
                  border: "1px solid #e4e7ec",
                  borderRadius: "10px",
                  padding: "0 10px",
                  height: "36px",
                  minWidth: "220px",
                }}
              >
                <span style={{ color: "#94a3b8", display: "grid", placeItems: "center", marginRight: "6px" }}>
                  <SearchIcon width={16} height={16} />
                </span>
                <input
                  type="text"
                  placeholder="Search albums..."
                  value={albumSearchQuery}
                  onChange={(e) => setAlbumSearchQuery(e.target.value)}
                  style={{
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    fontSize: "13px",
                    width: "100%",
                    color: "var(--sw-text, #1e293b)",
                  }}
                />
                {albumSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setAlbumSearchQuery("")}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#94a3b8",
                      cursor: "pointer",
                      padding: 0,
                      display: "grid",
                      placeItems: "center",
                    }}
                    title="Clear search"
                  >
                    <CloseIcon width={14} height={14} />
                  </button>
                )}
              </div>

              {/* View Mode Toggle (Table / Grid) */}
              <div
                style={{
                  display: "inline-flex",
                  background: "#f1f5f9",
                  padding: "3px",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <button
                  type="button"
                  onClick={() => setAlbumViewMode("table")}
                  style={{
                    border: "none",
                    background: albumViewMode === "table" ? "#ffffff" : "transparent",
                    color: albumViewMode === "table" ? "var(--color-ocean-primary, #0284C7)" : "#64748b",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: albumViewMode === "table" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                    transition: "all 0.15s ease",
                  }}
                  title="Table view (matches Sequence Diagram UC-21.4 step 1.16)"
                >
                  Table
                </button>
                <button
                  type="button"
                  onClick={() => setAlbumViewMode("grid")}
                  style={{
                    border: "none",
                    background: albumViewMode === "grid" ? "#ffffff" : "transparent",
                    color: albumViewMode === "grid" ? "var(--color-ocean-primary, #0284C7)" : "#64748b",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: albumViewMode === "grid" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                    transition: "all 0.15s ease",
                  }}
                  title="Grid card view"
                >
                  Cards
                </button>
              </div>
            </div>
          </div>

          {/* Albums Content */}
          {loadingAlbums ? (
            <div style={{ padding: "48px", textAlign: "center", color: "var(--sw-text-muted)" }}>
              Loading albums...
            </div>
          ) : filteredAlbums.length === 0 ? (
            <div
              style={{
                background: "#ffffff",
                border: "1px dashed var(--color-sand-primary, #D4B996)",
                borderRadius: "16px",
                padding: "48px 24px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  backgroundColor: "var(--color-sand-light, #F5EFE6)",
                  color: "var(--color-ocean-primary, #0284C7)",
                  display: "grid",
                  placeItems: "center",
                  margin: "0 auto 16px",
                }}
              >
                <HeadphonesIcon width={28} height={28} />
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 8px", color: "var(--color-ocean-dark, #0F172A)" }}>
                {albumSearchQuery ? `No albums match "${albumSearchQuery}"` : "No albums found"}
              </h3>
              <p style={{ color: "var(--sw-text-secondary)", fontSize: "14px", margin: "0 0 20px" }}>
                {albumSearchQuery
                  ? "Try adjusting your search terms or filter."
                  : "Group your tracks into albums to showcase your creator discography."}
              </p>
              {albumSearchQuery ? (
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setAlbumSearchQuery("")}
                >
                  Clear search
                </button>
              ) : (
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => onNavigate("/album/create")}
                  id="btn-empty-create-album"
                >
                  <PlusIcon width={16} height={16} />
                  <span>Create your first album</span>
                </button>
              )}
            </div>
          ) : albumViewMode === "table" ? (
            /* Sequence Diagram UC-21.4 Step 1.16: renderMyAlbumsTable(albums[coverUrl, title, statusBadge, trackCount, actions]) */
            renderMyAlbumsTable(filteredAlbums)
          ) : (
            /* Grid View */
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "20px",
              }}
            >
              {filteredAlbums.map((album) => {
                const status = (album.status || "DRAFT").toUpperCase();
                const isPublished = status === "PUBLISHED" || status === "APPROVED";
                const isPending = status === "PENDING";
                const isRejected = status === "REJECTED";
                const statusClass = isPublished
                  ? "status-pill--approved"
                  : isPending
                  ? "status-pill--pending"
                  : isRejected
                  ? "status-pill--rejected"
                  : "status-pill--draft";

                return (
                  <div
                    key={album.id}
                    onClick={() => onNavigate(`/album/submission/${album.id}`)}
                    style={{
                      background: "#ffffff",
                      border: "1px solid var(--color-sand-light, #E6D5B8)",
                      borderRadius: "16px",
                      overflow: "hidden",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                      display: "flex",
                      flexDirection: "column",
                      cursor: "pointer",
                      transition: "transform 0.18s ease, box-shadow 0.18s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow = "0 10px 24px rgba(2, 132, 199, 0.12)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
                    }}
                    title={`Click to view details & manage "${album.title}"`}
                  >
                    {/* Cover & Publication Status */}
                    <div style={{ position: "relative", width: "100%", aspectRatio: "1/1", backgroundColor: "#f1f5f9" }}>
                      <img
                        src={album.coverUrl || "/pics/album.png"}
                        alt={album.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      <div style={{ position: "absolute", top: "12px", right: "12px" }}>
                        <span
                          className={`status-pill ${statusClass}`}
                          style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.12)" }}
                        >
                          {status}
                        </span>
                      </div>
                      <div
                        style={{
                          position: "absolute",
                          bottom: "0",
                          left: "0",
                          right: "0",
                          background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
                          padding: "24px 14px 10px",
                          color: "#ffffff",
                          fontSize: "12px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span>{album.trackCount} {album.trackCount === 1 ? "track" : "tracks"}</span>
                        <span>{album.releaseDate || (album.createdAt ? new Date(album.createdAt).toLocaleDateString() : "No release date")}</span>
                      </div>
                    </div>

                    {/* Album Info */}
                    <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column" }}>
                      <h4
                        style={{
                          margin: "0 0 6px",
                          fontSize: "16px",
                          fontWeight: 700,
                          color: "var(--color-ocean-dark, #0F172A)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={album.title}
                      >
                        {album.title}
                      </h4>
                      <p
                        style={{
                          margin: "0 0 12px",
                          fontSize: "13px",
                          color: "var(--sw-text-secondary, #64748B)",
                          lineHeight: "1.4",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          minHeight: "36px",
                        }}
                      >
                        {album.description || "No description provided."}
                      </p>

                      <div style={{ marginTop: "auto", paddingTop: "12px", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "12px", color: "var(--sw-text-muted)" }}>
                          {album.releaseDate ? `Release: ${album.releaseDate}` : "No release date"}
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          {!isPublished && (
                            <button
                              type="button"
                              className="button button-primary button-small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartSubmitAlbum(album);
                              }}
                              id={`btn-submit-album-${album.id}`}
                              style={{
                                padding: "4px 8px",
                                fontSize: "12px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                              title="Submit album for staff moderation review"
                            >
                              <UploadIcon width={13} height={13} />
                              <span>Submit</span>
                            </button>
                          )}
                          <button
                            type="button"
                            className="button button-ghost button-small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingAlbum(album);
                              setAlbumModalOpen(true);
                            }}
                            id={`btn-edit-album-card-${album.id}`}
                            style={{ padding: "4px 8px" }}
                            title="Edit album metadata (UC-21.5)"
                          >
                            <EditIcon width={13} height={13} />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            className="button button-ghost button-small"
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigate(`/album/submission/${album.id}`);
                            }}
                            style={{ padding: "4px 8px" }}
                            title="View album details"
                          >
                            <EyeIcon width={13} height={13} />
                            <span>View</span>
                          </button>
                          <button
                            type="button"
                            className="button button-ghost button-small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmAlbum(album);
                            }}
                            style={{ color: "var(--sw-danger, #b42318)", padding: "4px 8px" }}
                            title="Delete album"
                          >
                            <TrashIcon width={13} height={13} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Rejection Details Modal (UC-20: View Rejection Reason) */}
      <RejectionDetailsModal
        isOpen={Boolean(rejectionModalTrack)}
        details={rejectionModalTrack}
        onClose={() => setRejectionModalTrack(null)}
        onEditTrack={(trackId) => {
          const targetTrack = trackList.find((t) => t.id === trackId);
          setRejectionModalTrack(null);
          if (targetTrack) {
            onNavigate(`/studio/tracks/${targetTrack.id}/edit`);
          }
        }}
      />

      {/* Withdraw Submission Modal (UC-19.4 Extension) */}
      {withdrawConfirmTrack && createPortal(
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => !isSaving && setWithdrawConfirmTrack(null)}
        >
          <div
            className="modal-card"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Withdraw submission</h3>
              <button
                className="icon-button"
                onClick={() => setWithdrawConfirmTrack(null)}
                disabled={isSaving}
              >
                <CloseIcon width={18} height={18} />
              </button>
            </div>
            <p style={{ margin: "16px 0", color: "var(--sw-text-secondary)" }}>
              Are you sure you want to withdraw &quot;<b>{withdrawConfirmTrack.title}</b>&quot; from moderation review? The track will return to <b>Draft</b> status.
            </p>
            <div className="modal-actions">
              <button
                className="button button-secondary"
                onClick={() => setWithdrawConfirmTrack(null)}
                disabled={isSaving}
              >
                Keep in review
              </button>
              <button
                className="button button-primary"
                onClick={handleWithdrawSubmission}
                disabled={isSaving}
              >
                {isSaving ? "Withdrawing..." : "Confirm withdraw"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Album Form Modal (Create / Edit - UC-21.1 & UC-21.5 Update An Album) */}
      <AlbumFormModal
        open={albumModalOpen}
        onClose={() => setAlbumModalOpen(false)}
        album={editingAlbum}
        onSaved={async () => {
          setAlbumModalOpen(false);
          await Promise.all([loadAlbums(), loadStudioData()]);
          setActionSuccess(editingAlbum ? "Album updated successfully." : "Album created successfully.");
        }}
      />

      {/* Album Detail Modal (UC-21.2) */}
      <AlbumDetailModal
        open={Boolean(detailAlbum)}
        onClose={() => setDetailAlbum(null)}
        album={detailAlbum}
        onEdit={(alb) => {
          setDetailAlbum(null);
          setEditingAlbum(alb);
          setAlbumModalOpen(true);
        }}
        onDelete={(alb) => {
          setDetailAlbum(null);
          setDeleteConfirmAlbum(alb);
        }}
      />

      {/* Album Delete Confirmation Modal (UC-21.6 Delete An Album) */}
      <DeleteConfirmationModal
        open={Boolean(deleteConfirmAlbum)}
        title="Delete Album"
        message={`Are you sure you want to delete "${deleteConfirmAlbum?.title}"? Deleting this album will permanently remove the album and all audio tracks contained within it. This action cannot be undone.`}
        confirmLabel="Delete Permanently"
        submittingLabel="Deleting..."
        onConfirm={handleDeleteAlbum}
        onCancel={() => setDeleteConfirmAlbum(null)}
        submitting={deletingAlbum}
      />

      {/* Album Submission Review Modal (UC-21.2) */}
      <AlbumSubmissionReviewModal
        open={submitAlbumModalOpen}
        album={submittingAlbum}
        onClose={() => {
          setSubmitAlbumModalOpen(false);
          setSubmittingAlbum(null);
        }}
        onSuccess={() => void handleAlbumSubmittedSuccess()}
      />

      {actionSuccess && (
        <CenterNotificationPopup
          open={Boolean(actionSuccess)}
          type="success"
          message={actionSuccess}
          onClose={() => setActionSuccess(null)}
        />
      )}
    </div>
  );
}

