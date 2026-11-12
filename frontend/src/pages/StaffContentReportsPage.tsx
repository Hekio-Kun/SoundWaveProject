import { useState, useEffect, useCallback, useMemo } from "react";
import { AlertIcon, CheckIcon, FlagIcon, RefreshIcon } from "../icons";
import { staffReportsApi } from "../api/staffReports";
import { ApiError } from "../api/client";
import type { StaffContentReportResponse } from "../types";
import { StaffContentReportDetailView } from "../components/moderation/StaffContentReportDetailView";
import { CenterNotificationPopup } from "../components/modals/CenterNotificationPopup";

type Props = {
  onNavigate: (route: string) => void;
};

export function StaffContentReportsPage({ onNavigate }: Props) {
  const [reports, setReports] = useState<StaffContentReportResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastNotification, setToastNotification] = useState<{
    open: boolean;
    message: string;
    type: "success" | "info" | "warning" | "error";
  }>({ open: false, message: "", type: "success" });

  // Selected report ID for dedicated full-page Review Detail View
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const data = await staffReportsApi.getReportsQueue();
      setReports(data);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 401 || err.status === 403) {
          onNavigate("/staff/login");
          return;
        }
        setErrorMessage(err.message || "Failed to load content reports.");
      } else {
        setErrorMessage("A data retrieval error occurred.");
      }
    } finally {
      setLoading(false);
    }
  }, [onNavigate]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Group reports by Target Track + Violation Reason to guarantee 1 row per reason on a track
  const groupedReports = useMemo(() => {
    const map = new Map<string, StaffContentReportResponse>();
    for (const report of reports) {
      const key = `${report.targetId}::${report.reason.trim().toLowerCase()}`;
      if (!map.has(key)) {
        map.set(key, { ...report });
      } else {
        const existing = map.get(key)!;
        const combinedIds = Array.from(
          new Set([...(existing.reportIds || [existing.id]), ...(report.reportIds || [report.id])])
        );
        const isPending =
          existing.status?.toUpperCase() === "PENDING" || report.status?.toUpperCase() === "PENDING";
        existing.reportIds = combinedIds;
        existing.reporterCount = combinedIds.length;
        if (isPending) {
          existing.status = "PENDING";
        }
      }
    }
    return Array.from(map.values());
  }, [reports]);

  // If a report is selected, render the dedicated Inspection & Adjudication Detail View
  if (selectedReportId) {
    const activeReport = groupedReports.find((r) => r.id === selectedReportId) || reports.find((r) => r.id === selectedReportId);
    return (
      <StaffContentReportDetailView
        reportId={selectedReportId}
        initialReport={activeReport}
        onBack={() => {
          setSelectedReportId(null);
          fetchReports();
        }}
        onRefreshQueue={fetchReports}
        onNotify={(msg, type = "success") => {
          setToastNotification({ open: true, message: msg, type });
        }}
      />
    );
  }

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: string) => {
    const upper = status.toUpperCase();
    if (upper === "PENDING") {
      return (
        <span
          style={{
            padding: "3px 8px",
            borderRadius: "6px",
            fontSize: "0.78rem",
            fontWeight: 600,
            backgroundColor: "#FEF3C7",
            color: "#92400E",
          }}
        >
          Pending
        </span>
      );
    }
    if (upper === "RESOLVED") {
      return (
        <span
          style={{
            padding: "3px 8px",
            borderRadius: "6px",
            fontSize: "0.78rem",
            fontWeight: 600,
            backgroundColor: "#DEF7EC",
            color: "#03543F",
          }}
        >
          Resolved
        </span>
      );
    }
    if (upper === "DISMISSED") {
      return (
        <span
          style={{
            padding: "3px 8px",
            borderRadius: "6px",
            fontSize: "0.78rem",
            fontWeight: 600,
            backgroundColor: "#F3F4F6",
            color: "#4B5563",
          }}
        >
          Dismissed
        </span>
      );
    }
    return <span>{status}</span>;
  };

  return (
    <div className="ops-dashboard ops-dashboard--staff">
      {/* Header Banner */}
      <header className="staff-hero-banner" style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", flexWrap: "wrap", gap: "16px" }}>
          <div className="staff-hero-copy">
            <div className="staff-hero-title-row">
              <span className="staff-hero-title-icon" aria-hidden="true">
                <FlagIcon width={18} height={18} />
              </span>
              <h1 className="staff-hero-title">Content Reports</h1>
            </div>
            <p className="staff-hero-description">
              Queue of content violation reports submitted by listeners. Review reported tracks and adjudicate violations.
            </p>
          </div>

          <div>
            <button
              type="button"
              className="button button-secondary"
              onClick={fetchReports}
              disabled={loading}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <RefreshIcon width={15} height={15} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </header>

      {/* Center Toast Popup for Feedback (AGENTS_FRONTEND.md) */}
      <CenterNotificationPopup
        open={toastNotification.open}
        message={toastNotification.message}
        type={toastNotification.type}
        durationMs={3000}
        onClose={() => setToastNotification((prev) => ({ ...prev, open: false }))}
      />

      {/* Exception Notice (EX02: Data retrieval failure) */}
      {errorMessage && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 18px",
            backgroundColor: "#FEF2F2",
            border: "1px solid #FCA5A5",
            color: "#B42318",
            borderRadius: "10px",
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <AlertIcon width={20} height={20} />
            <span style={{ fontSize: "0.9rem" }}>{errorMessage}</span>
          </div>
          <button
            type="button"
            className="button button-small"
            style={{ backgroundColor: "#DC2626", borderColor: "#DC2626", color: "#FFFFFF" }}
            onClick={fetchReports}
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Table or Loading/Empty State */}
      <section className="ops-panel" style={{ padding: "0", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "48px 24px", textAlign: "center", color: "#8D877F" }}>
            <p>Loading content reports queue...</p>
          </div>
        ) : groupedReports.length === 0 ? (
          <div style={{ padding: "64px 24px", textAlign: "center", color: "#8D877F" }}>
            <FlagIcon width={36} height={36} style={{ margin: "0 auto 12px auto", opacity: 0.4, display: "block" }} />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#57534E", marginBottom: "4px" }}>
              No content reports found.
            </h3>
            <p style={{ fontSize: "0.88rem", margin: 0 }}>
              There are currently no violation reports in the queue.
            </p>
          </div>
        ) : (
          <div className="ops-table-wrap" style={{ margin: 0 }}>
            <table className="ops-table">
              <thead>
                <tr>
                  <th style={{ width: "34%" }}>Track Title</th>
                  <th style={{ width: "26%" }}>Violation Reason</th>
                  <th style={{ width: "12%" }}>Total Reports</th>
                  <th style={{ width: "15%" }}>Submission Date</th>
                  <th style={{ width: "8%" }}>Status</th>
                  <th style={{ width: "5%", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {groupedReports.map((report) => {
                  const isPending = report.status?.toUpperCase() === "PENDING";
                  const count = report.reporterCount || 1;
                  return (
                    <tr key={report.id}>
                      {/* Track Title */}
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          {report.coverUrl ? (
                            <img
                              src={report.coverUrl}
                              alt={report.trackTitle}
                              style={{ width: "42px", height: "42px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 }}
                            />
                          ) : (
                            <div
                              style={{
                                width: "42px",
                                height: "42px",
                                borderRadius: "8px",
                                background: "#D4A373",
                                color: "#FFFFFF",
                                display: "grid",
                                placeItems: "center",
                                fontSize: "0.85rem",
                                fontWeight: 700,
                                flexShrink: 0,
                              }}
                            >
                              ♪
                            </div>
                          )}
                          <div style={{ minWidth: 0 }}>
                            <button
                              type="button"
                              onClick={() => setSelectedReportId(report.id)}
                              style={{
                                background: "none",
                                border: "none",
                                padding: 0,
                                font: "inherit",
                                fontWeight: 700,
                                color: "#1C1917",
                                fontSize: "0.94rem",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxWidth: "260px",
                                cursor: "pointer",
                                textAlign: "left",
                                display: "block",
                              }}
                              title="Inspect content report details"
                            >
                              {report.trackTitle}
                            </button>
                            <small style={{ color: "#57534E", fontSize: "0.82rem" }}>
                              {report.artistName}
                            </small>
                          </div>
                        </div>
                      </td>

                      {/* Violation Reason */}
                      <td>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "0.84rem",
                            fontWeight: 600,
                            color: "#BE123C",
                            backgroundColor: "#FFF1F2",
                            padding: "6px 14px",
                            borderRadius: "20px",
                            border: "1px solid #FECDD3",
                            whiteSpace: "nowrap",
                            boxShadow: "0 1px 2px rgba(190, 18, 60, 0.04)",
                          }}
                        >
                          <span
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              backgroundColor: "#E11D48",
                              flexShrink: 0,
                            }}
                          />
                          <span>{report.reason}</span>
                        </span>
                      </td>

                      {/* Total Reports Column */}
                      <td>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            color: count > 1 ? "#0369A1" : "#57534E",
                            backgroundColor: count > 1 ? "#E0F2FE" : "#F6EFE3",
                            border: count > 1 ? "1px solid #BAE6FD" : "1px solid #E8DCCB",
                            padding: "4px 10px",
                            borderRadius: "12px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {count} {count > 1 ? "reports" : "report"}
                        </span>
                      </td>

                      {/* Submission Date */}
                      <td>
                        <span style={{ fontSize: "0.84rem", color: "#57534E", whiteSpace: "nowrap" }}>
                          {formatDate(report.createdAt)}
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        {getStatusBadge(report.status)}
                      </td>

                      {/* Action Controls - Always Review Report */}
                      <td style={{ textAlign: "right" }}>
                        <button
                          type="button"
                          className={`button button-small ${isPending ? "button-primary" : "button-secondary"}`}
                          onClick={() => setSelectedReportId(report.id)}
                          style={{ whiteSpace: "nowrap" }}
                        >
                          Review Report
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
