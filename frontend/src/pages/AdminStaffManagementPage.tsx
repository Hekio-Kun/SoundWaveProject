import { useEffect, useRef, useState } from "react";
import { adminStaffApi } from "../api/adminStaff";
import { ApiError } from "../api/client";
import { CenterNotificationPopup } from "../components/modals/CenterNotificationPopup";
import {
  AlertIcon,
  CheckIcon,
  CloseIcon,
  EyeIcon,
  PlusIcon,
  RefreshIcon,
  SearchIcon,
  ShieldIcon,
  UserIcon,
  UsersIcon,
} from "../icons";
import type { StaffDirectoryResponse, StaffSummaryItem } from "../types";

function formatDate(value: string | null | undefined): string {
  if (!value) return "Never";
  try {
    return new Date(value).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return value;
  }
}

function getInitials(name: string): string {
  if (!name) return "ST";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

type AdminStaffManagementPageProps = {
  onCreateStaffClick?: () => void;
  onViewActivityClick?: (staff: StaffSummaryItem) => void;
  onDeactivateClick?: (staff: StaffSummaryItem) => void;
};

export function AdminStaffManagementPage({
  onCreateStaffClick,
  onViewActivityClick,
  onDeactivateClick,
}: AdminStaffManagementPageProps) {
  const [staffPage, setStaffPage] = useState<StaffDirectoryResponse | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    type: "success" | "error" | "info" | "warning";
  }>({ open: false, message: "", type: "success" });

  const requestIdRef = useRef(0);

  const loadStaffDirectory = async () => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setError("");
    try {
      const result = await adminStaffApi.getStaffDirectory({
        search,
        status: statusFilter === "ALL" ? undefined : statusFilter,
        page,
        size: 10,
        sort: "createdAt,desc",
      });
      if (requestId === requestIdRef.current) {
        setStaffPage(result);
      }
    } catch (loadError) {
      if (requestId === requestIdRef.current) {
        setError(
          loadError instanceof ApiError
            ? loadError.message
            : "Unable to load staff directory. Please try again."
        );
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    void loadStaffDirectory();
  }, [search, statusFilter, page]);

  const handleSearchSubmit = (event?: React.FormEvent) => {
    event?.preventDefault();
    const trimmed = searchInput.trim();
    if (trimmed === search && page === 0) {
      void loadStaffDirectory();
    } else {
      setSearch(trimmed);
      setPage(0);
    }
  };

  const handleClearSearch = () => {
    setSearchInput("");
    if (search === "" && page === 0) {
      void loadStaffDirectory();
    } else {
      setSearch("");
      setPage(0);
    }
  };

  const handleStatusFilterChange = (newStatus: "ALL" | "ACTIVE" | "INACTIVE") => {
    if (statusFilter !== newStatus) {
      setStatusFilter(newStatus);
      setPage(0);
    }
  };

  const totalStaff = staffPage?.totalElements ?? 0;

  return (
    <div className="ops-dashboard admin-staff-page">
      <header className="ops-dashboard-heading">
        <div className="ops-dashboard-heading-copy">
          <span className="ops-role-mark">
            <UsersIcon width={15} height={15} />
            STAFF ACCOUNTS
          </span>
          <h1>Staff Directory &amp; Status</h1>
          <p>
            Supervise moderator staff accounts, review workload metrics, and manage system access permissions.
          </p>
        </div>
        <div className="ops-heading-actions">
          <button
            type="button"
            className="button button-primary"
            onClick={
              onCreateStaffClick
                ? onCreateStaffClick
                : () =>
                    setNotification({
                      open: true,
                      type: "info",
                      message: "Create Staff Account form will be unlocked in Step 2 (UC-27.2).",
                    })
            }
          >
            <PlusIcon width={17} height={17} />
            <span>Create Staff Account</span>
          </button>
        </div>
      </header>

      <section className="ops-panel admin-genre-panel">
        {/* Toolbar: Filters and Search */}
        <div className="admin-genre-toolbar" style={{ flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            {(["ALL", "ACTIVE", "INACTIVE"] as const).map((filterKey) => (
              <button
                key={filterKey}
                type="button"
                className={`button button-small ${statusFilter === filterKey ? "button-primary" : "button-secondary"}`}
                onClick={() => handleStatusFilterChange(filterKey)}
                style={{ fontSize: "12px", padding: "6px 12px" }}
              >
                {filterKey === "ALL" ? "All Staff" : filterKey === "ACTIVE" ? "Active" : "Inactive"}
              </button>
            ))}
          </div>

          <form className="admin-genre-search" onSubmit={handleSearchSubmit} role="search" style={{ flex: 1, minWidth: "260px" }}>
            <SearchIcon width={17} height={17} />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search staff by name or email..."
              aria-label="Search staff"
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
              aria-label="Search staff"
            >
              <SearchIcon width={14} height={14} />
              <span>Search</span>
            </button>
          </form>

          <span className="admin-genre-total">
            {totalStaff} {totalStaff === 1 ? "staff account" : "staff accounts"}
          </span>
        </div>

        {/* Content View States */}
        {isLoading ? (
          <div className="admin-genre-loading" aria-busy="true" aria-label="Loading staff directory">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} style={{ height: "48px" }} />
            ))}
          </div>
        ) : error ? (
          <div className="staff-state-banner is-error" role="alert">
            <AlertIcon width={30} height={30} />
            <b>Unable to load staff directory</b>
            <p>{error}</p>
            <button
              type="button"
              className="button button-primary button-small"
              onClick={() => void loadStaffDirectory()}
            >
              <RefreshIcon width={15} height={15} />
              Retry
            </button>
          </div>
        ) : !staffPage || staffPage.content.length === 0 ? (
          <div className="staff-empty-box">
            <UsersIcon width={42} height={42} />
            <h2>No staff accounts found</h2>
            <p>
              {search
                ? `No staff matching "${search}" found in ${statusFilter.toLowerCase()} status.`
                : "No moderator staff accounts currently exist in this category."}
            </p>
          </div>
        ) : (
          <>
            <div className="ops-table-wrap">
              <table className="ops-table">
                <thead>
                  <tr>
                    <th>Staff Member</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Tracks Moderated</th>
                    <th>Last Login</th>
                    <th>Created</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staffPage.content.map((staff) => {
                    const isActive = staff.status === "ACTIVE";
                    return (
                      <tr key={staff.id}>
                        {/* 1. Staff Member Info */}
                        <td>
                          <div className="ops-user-cell">
                            {staff.avatarUrl ? (
                              <img
                                src={staff.avatarUrl}
                                alt={staff.fullName}
                                style={{
                                  width: "36px",
                                  height: "36px",
                                  borderRadius: "50%",
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              <span
                                style={{
                                  background: "#e0f2fe",
                                  color: "#0369a1",
                                  fontWeight: 700,
                                  fontSize: "12px",
                                }}
                              >
                                {getInitials(staff.fullName)}
                              </span>
                            )}
                            <div>
                              <b style={{ color: "#1c1917" }}>{staff.fullName}</b>
                              <small style={{ color: "#57534e" }}>{staff.email}</small>
                            </div>
                          </div>
                        </td>

                        {/* 2. Role */}
                        <td>
                          <span
                            className="ops-role-chip"
                            style={{
                              background: staff.roleCode === "ADMIN" ? "#fef3f2" : "#f5ead8",
                              color: staff.roleCode === "ADMIN" ? "#b42318" : "#8c5828",
                              borderColor: staff.roleCode === "ADMIN" ? "#fecdca" : "#e8dccb",
                              fontWeight: 600,
                            }}
                          >
                            {staff.roleCode === "ADMIN" ? <ShieldIcon width={12} height={12} /> : <UserIcon width={12} height={12} />}
                            {staff.roleName || staff.roleCode}
                          </span>
                        </td>

                        {/* 3. Status Badge */}
                        <td>
                          <span
                            className={`ops-status ${isActive ? "is-success" : "is-neutral"}`}
                          >
                            <i />
                            {isActive ? "Active" : "Inactive"}
                          </span>
                        </td>

                        {/* 4. Tracks Moderated */}
                        <td>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "2px 8px",
                              borderRadius: "12px",
                              background: staff.totalTracksModerated > 0 ? "#f0fdf4" : "#f5f5f4",
                              color: staff.totalTracksModerated > 0 ? "#15803d" : "#78716c",
                              fontWeight: 600,
                              fontSize: "12px",
                            }}
                          >
                            {staff.totalTracksModerated > 0 ? <CheckIcon width={12} height={12} /> : null}
                            {staff.totalTracksModerated} {staff.totalTracksModerated === 1 ? "track" : "tracks"}
                          </span>
                        </td>

                        {/* 5. Last Login */}
                        <td style={{ fontSize: "13px", color: "#57534e" }}>
                          {formatDate(staff.lastLoginAt)}
                        </td>

                        {/* 6. Created Date */}
                        <td style={{ fontSize: "13px", color: "#57534e" }}>
                          {formatDate(staff.createdAt)}
                        </td>

                        {/* 7. Actions */}
                        <td>
                          <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                            {/* View Activity (UC-27.4) */}
                            <button
                              type="button"
                              className="button button-secondary button-small"
                              onClick={() => {
                                if (onViewActivityClick) {
                                  onViewActivityClick(staff);
                                } else {
                                  setNotification({
                                    open: true,
                                    type: "info",
                                    message: `Audit history for ${staff.fullName} (UC-27.4) will be unlocked in Step 4.`,
                                  });
                                }
                              }}
                              title="View moderation activity audit"
                              style={{ padding: "4px 8px", fontSize: "12px" }}
                            >
                              <EyeIcon width={13} height={13} />
                              <span>Activity</span>
                            </button>

                            {/* Deactivate Account (UC-27.3) */}
                            {isActive && staff.roleCode !== "ADMIN" ? (
                              <button
                                type="button"
                                className="button button-small"
                                onClick={() => {
                                  if (onDeactivateClick) {
                                    onDeactivateClick(staff);
                                  } else {
                                    setNotification({
                                      open: true,
                                      type: "info",
                                      message: `Deactivate flow for ${staff.fullName} (UC-27.3) will be unlocked in Step 3.`,
                                    });
                                  }
                                }}
                                style={{
                                  padding: "4px 8px",
                                  fontSize: "12px",
                                  color: "#b42318",
                                  borderColor: "#fecdca",
                                  background: "#fef3f2",
                                }}
                                title="Deactivate staff account"
                              >
                                <span>Deactivate</span>
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {staffPage.totalPages > 1 && (
              <div className="staff-pagination-bar">
                <button
                  type="button"
                  className="staff-page-btn"
                  disabled={staffPage.first}
                  onClick={() => setPage((current) => Math.max(0, current - 1))}
                >
                  &larr; Previous
                </button>
                <span className="staff-page-indicator">
                  Page <b>{staffPage.number + 1}</b> of {staffPage.totalPages}
                </span>
                <button
                  type="button"
                  className="staff-page-btn"
                  disabled={staffPage.last}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next &rarr;
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <CenterNotificationPopup
        open={notification.open}
        type={notification.type}
        message={notification.message}
        onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}

