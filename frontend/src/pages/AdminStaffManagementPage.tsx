import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { adminStaffApi } from "../api/adminStaff";
import { ApiError } from "../api/client";
import { CenterNotificationPopup } from "../components/modals/CenterNotificationPopup";
import { CreateStaffModal } from "../components/modals/CreateStaffModal";
import { DeactivateStaffModal } from "../components/modals/DeactivateStaffModal";
import { StaffActivityModal } from "../components/modals/StaffActivityModal";
import {
  AlertIcon,
  CheckIcon,
  CloseIcon,
  EyeIcon,
  LockIcon,
  MailIcon,
  PlusIcon,
  RefreshIcon,
  ShieldIcon,
  UserIcon,
  UsersIcon,
} from "../icons";
import type {
  CreateStaffInput,
  CreateStaffResult,
  DeactivateStaffInput,
  StaffDirectoryResponse,
  StaffModerationActivityResponse,
  StaffSummaryItem,
} from "../types";

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
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createdResult, setCreatedResult] = useState<CreateStaffResult | null>(null);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [deactivateSubmitting, setDeactivateSubmitting] = useState(false);
  const [selectedStaffForDeactivate, setSelectedStaffForDeactivate] = useState<StaffSummaryItem | null>(null);
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [selectedStaffForActivity, setSelectedStaffForActivity] = useState<StaffSummaryItem | null>(null);
  const [activityData, setActivityData] = useState<StaffModerationActivityResponse | null>(null);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState("");
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
  }, [page]);

  const handleCreateStaff = async (input: CreateStaffInput): Promise<CreateStaffResult> => {
    setCreateSubmitting(true);
    try {
      const result = await adminStaffApi.createStaff(input);
      setCreateModalOpen(false);
      setCreatedResult(result);
      void loadStaffDirectory();
      return result;
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleCopyPassword = (text: string) => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    }).catch(() => {
      // Fallback
    });
  };

  const handleConfirmDeactivate = async (input: DeactivateStaffInput) => {
    if (!selectedStaffForDeactivate) return;
    setDeactivateSubmitting(true);
    try {
      await adminStaffApi.deactivateStaff(selectedStaffForDeactivate.id, input);
      setDeactivateModalOpen(false);
      const targetName = selectedStaffForDeactivate.fullName;
      setSelectedStaffForDeactivate(null);
      setNotification({
        open: true,
        type: "success",
        message: `Account for ${targetName} has been deactivated and active sessions revoked.`,
      });
      void loadStaffDirectory();
    } finally {
      setDeactivateSubmitting(false);
    }
  };

  const handleOpenActivity = async (staff: StaffSummaryItem) => {
    setSelectedStaffForActivity(staff);
    setActivityModalOpen(true);
    setActivityLoading(true);
    setActivityError("");
    setActivityData(null);
    try {
      const data = await adminStaffApi.getStaffActivity(staff.id);
      setActivityData(data);
    } catch (err) {
      setActivityError(
        err instanceof ApiError ? err.message : "Failed to load moderation activity data."
      );
    } finally {
      setActivityLoading(false);
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
                : () => setCreateModalOpen(true)
            }
          >
            <PlusIcon width={17} height={17} />
            <span>Create Staff Account</span>
          </button>
        </div>
      </header>

      <section className="ops-panel admin-genre-panel">
        {/* Toolbar: Total accounts count */}
        <div className="admin-genre-toolbar" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--sw-text-primary, #1e293b)" }}>
            Staff Directory
          </span>
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
            <p>No moderator staff accounts currently exist in the system.</p>
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
                                  void handleOpenActivity(staff);
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
                                    setSelectedStaffForDeactivate(staff);
                                    setDeactivateModalOpen(true);
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

      <CreateStaffModal
        open={createModalOpen}
        submitting={createSubmitting}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateStaff}
      />

      <DeactivateStaffModal
        open={deactivateModalOpen}
        staff={selectedStaffForDeactivate}
        submitting={deactivateSubmitting}
        onClose={() => {
          if (!deactivateSubmitting) {
            setDeactivateModalOpen(false);
            setSelectedStaffForDeactivate(null);
          }
        }}
        onConfirm={handleConfirmDeactivate}
      />

      <StaffActivityModal
        open={activityModalOpen}
        staff={selectedStaffForActivity}
        activityData={activityData}
        loading={activityLoading}
        error={activityError}
        onClose={() => {
          setActivityModalOpen(false);
          setSelectedStaffForActivity(null);
          setActivityData(null);
          setActivityError("");
        }}
      />

      {createdResult &&
        createPortal(
          <div className="modal-overlay" role="presentation" onClick={() => setCreatedResult(null)}>
            <section
              className="modal-card genre-form-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="created-staff-result-title"
              onClick={(event) => event.stopPropagation()}
              style={{ maxWidth: "520px" }}
            >
              <div className="modal-header">
                <div>
                  <span className="eyebrow" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <ShieldIcon width={13} height={13} />
                    STAFF ONBOARDING
                  </span>
                  <h2 id="created-staff-result-title" style={{ fontSize: "20px", fontWeight: 700, margin: "4px 0 0" }}>
                    {createdResult.emailDispatched
                      ? "Staff Account Created"
                      : "Staff Created (Email Delivery Warning)"}
                  </h2>
                </div>
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => setCreatedResult(null)}
                  aria-label="Close modal"
                >
                  <CloseIcon width={16} height={16} />
                </button>
              </div>

              <div style={{ display: "grid", gap: "16px", padding: "8px 0" }}>
                {createdResult.emailDispatched ? (
                  <div
                    style={{
                      padding: "12px 14px",
                      borderRadius: "10px",
                      background: "#ECFDF5",
                      border: "1px solid #A7F3D0",
                      color: "#065F46",
                      fontSize: "13px",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                    }}
                  >
                    <CheckIcon width={18} height={18} style={{ flexShrink: 0, marginTop: "2px" }} />
                    <div>
                      <strong>Welcome email dispatched successfully!</strong>
                      <div style={{ marginTop: "2px", color: "#047857" }}>
                        An automated onboarding email with login credentials has been sent directly to <strong>{createdResult.email}</strong>.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      padding: "12px 14px",
                      borderRadius: "10px",
                      background: "#FFFBEB",
                      border: "1px solid #FDE68A",
                      color: "#92400E",
                      fontSize: "13px",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                    }}
                  >
                    <AlertIcon width={18} height={18} style={{ flexShrink: 0, marginTop: "2px" }} />
                    <div>
                      <strong>Email could not be delivered automatically (EX02)</strong>
                      <div style={{ marginTop: "2px", color: "#B45309" }}>
                        The staff account has been saved and is ACTIVE. Please provide the account password below to the staff member directly.
                      </div>
                    </div>
                  </div>
                )}

                <div
                  style={{
                    background: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    borderRadius: "10px",
                    padding: "14px",
                    display: "grid",
                    gap: "10px",
                    fontSize: "13px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748B" }}>Full Name:</span>
                    <strong style={{ color: "#1E293B" }}>{createdResult.fullName}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748B" }}>Work Email:</span>
                    <strong style={{ color: "#1E293B" }}>{createdResult.email}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#64748B" }}>Assigned Role:</span>
                    <span
                      className="ops-role-chip"
                      style={{
                        background: "#f5ead8",
                        color: "#8c5828",
                        borderColor: "#e8dccb",
                        fontWeight: 600,
                        fontSize: "12px",
                        padding: "2px 8px",
                        borderRadius: "6px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <UserIcon width={12} height={12} />
                      <span>{createdResult.roleName || "Staff"}</span>
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#64748B" }}>Initial Status:</span>
                    <span className="ops-status is-success">
                      <i />
                      Active
                    </span>
                  </div>

                  {/* CHỈ hiển thị mật khẩu khi gửi email thất bại (EX02) để Admin bàn giao thủ công */}
                  {!createdResult.emailDispatched && (
                    <div
                      style={{
                        marginTop: "6px",
                        paddingTop: "10px",
                        borderTop: "1px dashed #CBD5E1",
                        display: "grid",
                        gap: "6px",
                      }}
                    >
                      <span style={{ color: "#475569", fontWeight: 600 }}>Account Password (Manual Handover):</span>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          background: "#FFFFFF",
                          border: "1px solid #CBD5E1",
                          borderRadius: "8px",
                          padding: "8px 12px",
                        }}
                      >
                        <code
                          style={{
                            fontFamily: "monospace",
                            fontSize: "15px",
                            fontWeight: 700,
                            letterSpacing: "1px",
                            color: "#0F172A",
                            flex: 1,
                          }}
                        >
                          {createdResult.temporaryPassword}
                        </code>
                        <button
                          type="button"
                          className="button button-small button-secondary"
                          onClick={() => handleCopyPassword(createdResult.temporaryPassword)}
                          style={{ fontSize: "12px", padding: "4px 10px" }}
                        >
                          {copiedPassword ? (
                            <>
                              <CheckIcon width={14} height={14} />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <span>Copy</span>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-actions" style={{ marginTop: "12px" }}>
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => setCreatedResult(null)}
                  style={{ width: "100%" }}
                >
                  Done
                </button>
              </div>
            </section>
          </div>,
          document.body
        )}
    </div>
  );
}

