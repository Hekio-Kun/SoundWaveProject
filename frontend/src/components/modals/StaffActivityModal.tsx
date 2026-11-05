import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useModalScrollLock } from "../../hooks/useModalScrollLock";
import {
  ActivityIcon,
  AlertIcon,
  CheckIcon,
  ClockIcon,
  CloseIcon,
  DiscIcon,
  FlagIcon,
  UserIcon,
} from "../../icons";
import type { StaffModerationActivityResponse, StaffSummaryItem } from "../../types";

type Props = {
  open: boolean;
  staff: StaffSummaryItem | null;
  activityData: StaffModerationActivityResponse | null;
  loading: boolean;
  error?: string;
  onClose: () => void;
};

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

export function StaffActivityModal({
  open,
  staff,
  activityData,
  loading,
  error,
  onClose,
}: Props) {
  const [activeTab, setActiveTab] = useState<"tracks" | "reports">("tracks");

  useModalScrollLock(open);

  useEffect(() => {
    if (!open) return;
    setActiveTab("tracks");
  }, [open, staff]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open || !staff) return null;

  const trackReviews = activityData?.trackReviews || [];
  const reportResolutions = activityData?.reportResolutions || [];
  const totalTracks = activityData?.totalTracksModerated ?? staff.totalTracksModerated ?? 0;
  const totalReports = activityData?.totalReportsResolved ?? staff.totalReportsResolved ?? 0;

  return createPortal(
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <section
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="staff-activity-modal-title"
        onClick={(event) => event.stopPropagation()}
        style={{
          maxWidth: "840px",
          width: "92vw",
          height: "min(84vh, 690px)",
          maxHeight: "calc(100dvh - 48px)",
          display: "flex",
          flexDirection: "column",
          padding: "20px 24px",
          borderRadius: "18px",
          overflow: "hidden",
          gap: 0,
        }}
      >
        {/* Header */}
        <div className="modal-header" style={{ marginBottom: "12px", flexShrink: 0 }}>
          <div>
            <span
              className="eyebrow"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                color: "#0284C7",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              <ActivityIcon width={13} height={13} />
              STAFF MODERATION AUDIT (UC-27.4)
            </span>
            <h2
              id="staff-activity-modal-title"
              style={{ fontSize: "19px", fontWeight: 700, margin: "2px 0 0", color: "#0F172A" }}
            >
              Moderation Activity History
            </h2>
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Close moderation activity modal"
          >
            <CloseIcon width={16} height={16} />
          </button>
        </div>

        {/* Staff Profile & Summary Cards */}
        <div
          style={{
            background: "#F8FAFC",
            border: "1px solid #E2E8F0",
            borderRadius: "10px",
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            marginBottom: "12px",
            flexShrink: 0,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "15px", fontWeight: 700, color: "#1E293B" }}>
                {activityData?.fullName || staff.fullName}
              </span>
              <span
                className="ops-role-chip"
                style={{
                  background: "#f5ead8",
                  color: "#8c5828",
                  borderColor: "#e8dccb",
                  fontWeight: 600,
                  fontSize: "11px",
                  padding: "1px 7px",
                  borderRadius: "5px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <UserIcon width={11} height={11} />
                <span>{activityData?.roleName || staff.roleName || "Staff"}</span>
              </span>
              <span
                className={`ops-status ${
                  (activityData?.status || staff.status) === "ACTIVE" ? "is-success" : "is-warning"
                }`}
                style={{ fontSize: "11px", padding: "1px 7px" }}
              >
                <i />
                {(activityData?.status || staff.status) === "ACTIVE" ? "Active" : "Inactive"}
              </span>
            </div>
            <div style={{ color: "#64748B", fontSize: "12px", marginTop: "2px" }}>
              {activityData?.email || staff.email}
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
            <div
              style={{
                padding: "6px 14px",
                background: "#FFFFFF",
                borderRadius: "8px",
                border: "1px solid #E2E8F0",
                textAlign: "center",
                minWidth: "110px",
              }}
            >
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                Tracks Reviewed
              </div>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "#0284C7", lineHeight: 1.2, marginTop: "2px" }}>
                {totalTracks}
              </div>
            </div>

            <div
              style={{
                padding: "6px 14px",
                background: "#FFFFFF",
                borderRadius: "8px",
                border: "1px solid #E2E8F0",
                textAlign: "center",
                minWidth: "110px",
              }}
            >
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                Reports Resolved
              </div>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "#D4A373", lineHeight: 1.2, marginTop: "2px" }}>
                {totalReports}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            borderBottom: "1px solid #E2E8F0",
            marginBottom: "12px",
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab("tracks")}
            style={{
              padding: "8px 14px",
              border: "none",
              background: "none",
              borderBottom: activeTab === "tracks" ? "2px solid #0284C7" : "2px solid transparent",
              color: activeTab === "tracks" ? "#0284C7" : "#64748B",
              fontWeight: activeTab === "tracks" ? 700 : 500,
              fontSize: "13px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.15s ease",
            }}
          >
            <DiscIcon width={15} height={15} />
            <span>Track Reviews</span>
            <span
              style={{
                background: activeTab === "tracks" ? "#E0F2FE" : "#F1F5F9",
                color: activeTab === "tracks" ? "#0369A1" : "#64748B",
                borderRadius: "10px",
                padding: "1px 6px",
                fontSize: "11px",
                fontWeight: 600,
              }}
            >
              {trackReviews.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("reports")}
            style={{
              padding: "8px 14px",
              border: "none",
              background: "none",
              borderBottom: activeTab === "reports" ? "2px solid #0284C7" : "2px solid transparent",
              color: activeTab === "reports" ? "#0284C7" : "#64748B",
              fontWeight: activeTab === "reports" ? 700 : 500,
              fontSize: "13px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.15s ease",
            }}
          >
            <FlagIcon width={15} height={15} />
            <span>Report Resolutions</span>
            <span
              style={{
                background: activeTab === "reports" ? "#E0F2FE" : "#F1F5F9",
                color: activeTab === "reports" ? "#0369A1" : "#64748B",
                borderRadius: "10px",
                padding: "1px 6px",
                fontSize: "11px",
                fontWeight: 600,
              }}
            >
              {reportResolutions.length}
            </span>
          </button>
        </div>

        {/* Content Area */}
        <div
          style={{
            flex: "1 1 0",
            minHeight: 0,
            overflowY: "auto",
            paddingRight: "4px",
          }}
        >
          {loading ? (
            <div style={{ padding: "36px", textAlign: "center", color: "#64748B" }}>
              <div
                style={{
                  width: "26px",
                  height: "26px",
                  border: "3px solid #E2E8F0",
                  borderTopColor: "#0284C7",
                  borderRadius: "50%",
                  margin: "0 auto 10px",
                  animation: "spin 0.8s linear infinite",
                }}
              />
              <p style={{ margin: 0, fontSize: "13px" }}>Loading moderation activities...</p>
            </div>
          ) : error ? (
            <div
              style={{
                padding: "14px",
                borderRadius: "8px",
                background: "#FEF2F2",
                border: "1px solid #FECACA",
                color: "#991B1B",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "13px",
              }}
            >
              <AlertIcon width={18} height={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          ) : activeTab === "tracks" ? (
            trackReviews.length === 0 ? (
              <div
                style={{
                  padding: "40px 20px",
                  textAlign: "center",
                  background: "#F8FAFC",
                  borderRadius: "10px",
                  border: "1px dashed #CBD5E1",
                }}
              >
                <DiscIcon width={32} height={32} style={{ color: "#94A3B8", margin: "0 auto 10px" }} />
                <h4 style={{ margin: "0 0 4px", fontSize: "15px", color: "#334155" }}>
                  No Track Reviews Recorded
                </h4>
                <p style={{ margin: 0, fontSize: "12px", color: "#64748B", maxWidth: "380px", marginLeft: "auto", marginRight: "auto" }}>
                  This staff member has not reviewed or approved any track submissions in the moderation queue yet.
                </p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: "8px" }}>
                {trackReviews.map((item) => {
                  const isApproved = item.action === "APPROVED";
                  const isRejected = item.action === "REJECTED";
                  return (
                    <div
                      key={item.submissionId}
                      style={{
                        background: "#FFFFFF",
                        border: "1px solid #E2E8F0",
                        borderRadius: "8px",
                        padding: "10px 14px",
                        display: "grid",
                        gap: "6px",
                        transition: "box-shadow 0.15s ease",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                        <div>
                          <div style={{ fontSize: "14px", fontWeight: 700, color: "#0F172A" }}>
                            {item.trackTitle}
                          </div>
                          <div style={{ fontSize: "12px", color: "#64748B", marginTop: "1px" }}>
                            Artist: <span style={{ color: "#334155", fontWeight: 500 }}>{item.artistName}</span> • Track ID #{item.trackId}
                          </div>
                        </div>

                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "2px 8px",
                            borderRadius: "5px",
                            fontSize: "11px",
                            fontWeight: 700,
                            background: isApproved ? "#ECFDF5" : isRejected ? "#FEF2F2" : "#F1F5F9",
                            color: isApproved ? "#065F46" : isRejected ? "#991B1B" : "#475569",
                            border: `1px solid ${isApproved ? "#A7F3D0" : isRejected ? "#FECACA" : "#CBD5E1"}`,
                            flexShrink: 0,
                          }}
                        >
                          {isApproved && <CheckIcon width={12} height={12} />}
                          {isRejected && <CloseIcon width={12} height={12} />}
                          {item.action}
                        </span>
                      </div>

                      {item.rejectionReason && (
                        <div
                          style={{
                            background: "#FFF1F2",
                            border: "1px solid #FFE4E6",
                            borderRadius: "5px",
                            padding: "6px 10px",
                            fontSize: "11.5px",
                            color: "#BE123C",
                            lineHeight: 1.4,
                          }}
                        >
                          <strong>Rejection Reason:</strong> {item.rejectionReason}
                        </div>
                      )}

                      {item.reviewerNote && (
                        <div
                          style={{
                            background: "#F8FAFC",
                            border: "1px solid #E2E8F0",
                            borderRadius: "5px",
                            padding: "6px 10px",
                            fontSize: "11.5px",
                            color: "#475569",
                            lineHeight: 1.4,
                          }}
                        >
                          <strong>Staff Note:</strong> {item.reviewerNote}
                        </div>
                      )}

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                          fontSize: "11px",
                          color: "#94A3B8",
                        }}
                      >
                        <ClockIcon width={12} height={12} />
                        <span>Reviewed: {formatDate(item.reviewedAt)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            reportResolutions.length === 0 ? (
              <div
                style={{
                  padding: "40px 20px",
                  textAlign: "center",
                  background: "#F8FAFC",
                  borderRadius: "10px",
                  border: "1px dashed #CBD5E1",
                }}
              >
                <FlagIcon width={32} height={32} style={{ color: "#94A3B8", margin: "0 auto 10px" }} />
                <h4 style={{ margin: "0 0 4px", fontSize: "15px", color: "#334155" }}>
                  No Report Resolutions Recorded
                </h4>
                <p style={{ margin: 0, fontSize: "12px", color: "#64748B", maxWidth: "380px", marginLeft: "auto", marginRight: "auto" }}>
                  This staff member has not resolved or dismissed any content reports yet.
                </p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: "8px" }}>
                {reportResolutions.map((item) => {
                  const isResolved = item.decision === "RESOLVED";
                  return (
                    <div
                      key={item.reportId}
                      style={{
                        background: "#FFFFFF",
                        border: "1px solid #E2E8F0",
                        borderRadius: "8px",
                        padding: "10px 14px",
                        display: "grid",
                        gap: "6px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                        <div>
                          <div style={{ fontSize: "14px", fontWeight: 700, color: "#0F172A" }}>
                            {item.targetTitle}
                          </div>
                          <div style={{ fontSize: "12px", color: "#64748B", marginTop: "1px" }}>
                            Category: <span style={{ color: "#D4A373", fontWeight: 600 }}>{item.category}</span> • Target: {item.targetType} #{item.targetId}
                          </div>
                        </div>

                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "2px 8px",
                            borderRadius: "5px",
                            fontSize: "11px",
                            fontWeight: 700,
                            background: isResolved ? "#ECFDF5" : "#F1F5F9",
                            color: isResolved ? "#065F46" : "#475569",
                            border: `1px solid ${isResolved ? "#A7F3D0" : "#CBD5E1"}`,
                            flexShrink: 0,
                          }}
                        >
                          {isResolved && <CheckIcon width={12} height={12} />}
                          {item.decision}
                        </span>
                      </div>

                      {item.resolutionNote && (
                        <div
                          style={{
                            background: "#F8FAFC",
                            border: "1px solid #E2E8F0",
                            borderRadius: "5px",
                            padding: "6px 10px",
                            fontSize: "11.5px",
                            color: "#475569",
                            lineHeight: 1.4,
                          }}
                        >
                          <strong>Resolution Note:</strong> {item.resolutionNote}
                        </div>
                      )}

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                          fontSize: "11px",
                          color: "#94A3B8",
                        }}
                      >
                        <ClockIcon width={12} height={12} />
                        <span>Resolved: {formatDate(item.resolvedAt)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>

        {/* Modal Footer */}
        <div
          className="modal-actions"
          style={{
            marginTop: "12px",
            paddingTop: "12px",
            borderTop: "1px solid #E2E8F0",
            flexShrink: 0,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            type="button"
            className="button button-primary"
            onClick={onClose}
            style={{ minWidth: "100px", padding: "6px 16px", fontSize: "13px" }}
          >
            Close
          </button>
        </div>
      </section>
    </div>,
    document.body
  );
}
