import { useState, useEffect, useCallback, useMemo } from "react";
import { AlertIcon, EyeIcon, FlagIcon, PaperclipIcon, RefreshIcon } from "../icons";
import { staffReportsApi } from "../api/staffReports";
import { ApiError } from "../api/client";
import type { StaffContentReportResponse } from "../types";
import { covers } from "../data";
import { StaffContentReportDetailView } from "../components/moderation/StaffContentReportDetailView";
import { CenterNotificationPopup } from "../components/modals/CenterNotificationPopup";
import { formatDate } from "../utils/dateUtils";

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
        setErrorMessage(err.message || "Failed to load reported tracks.");
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

  const isCopyrightReport = (report: StaffContentReportResponse): boolean => {
    if (report.category?.toUpperCase() === "COPYRIGHT") return true;
    const reason = (report.reason || "").toLowerCase();
    return reason.includes("copyright") || reason.includes("bản quyền");
  };

  // Group reports by Target Track + Violation Reason, but DO NOT group Copyright reports!
  const groupedReports = useMemo(() => {
    const list: StaffContentReportResponse[] = [];
    const nonCopyrightMap = new Map<string, StaffContentReportResponse>();

    for (const report of reports) {
      if (isCopyrightReport(report)) {
        list.push({ ...report });
      } else {
        const key = `${report.targetId}::${(report.reason || "").trim().toLowerCase()}`;
        if (!nonCopyrightMap.has(key)) {
          const clone = { ...report };
          nonCopyrightMap.set(key, clone);
          list.push(clone);
        } else {
          const existing = nonCopyrightMap.get(key)!;
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
          if (report.reporters && existing.reporters) {
            const seen = new Set(existing.reporters.map((r) => r.reporterId));
            for (const r of report.reporters) {
              if (!seen.has(r.reporterId)) {
                existing.reporters.push(r);
                seen.add(r.reporterId);
              }
            }
          }
        }
      }
    }
    return list;
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
          setToastNotification((prev) => ({ ...prev, open: false }));
          fetchReports();
        }}
        onRefreshQueue={fetchReports}
        onNotify={(msg, type = "success") => {
          setToastNotification({ open: true, message: msg, type });
        }}
      />
    );
  }

  const getStatusBadge = (status: string) => {
    const upper = status.toUpperCase();
    if (upper === "PENDING") {
      return <span className="staff-report-status-badge is-pending">Pending</span>;
    }
    if (upper === "RESOLVED") {
      return <span className="staff-report-status-badge is-resolved">Resolved</span>;
    }
    if (upper === "DISMISSED") {
      return <span className="staff-report-status-badge is-dismissed">Dismissed</span>;
    }
    return <span className="staff-report-status-badge">{status}</span>;
  };

  return (
    <div className="ops-dashboard ops-dashboard--staff">
      {/* Header Banner */}
      <header className="staff-hero-banner staff-reports-hero-banner">
        <div className="staff-reports-hero-row">
          <div className="staff-hero-copy">
            <div className="staff-hero-title-row">
              <span className="staff-hero-title-icon" aria-hidden="true">
                <FlagIcon width={18} height={18} />
              </span>
              <h1 className="staff-hero-title">Reported Tracks</h1>
            </div>
            <p className="staff-hero-description">
              Queue of tracks reported by listeners for potential policy violations. Review reported tracks and adjudicate violations.
            </p>
          </div>

          <div>
            <button
              type="button"
              className="button button-secondary staff-reports-refresh-btn"
              onClick={fetchReports}
              disabled={loading}
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
      <section className="ops-panel staff-reports-panel">
        {loading ? (
          <div style={{ padding: "48px 24px", textAlign: "center", color: "#8D877F" }}>
            <p>Loading reported tracks queue...</p>
          </div>
        ) : groupedReports.length === 0 ? (
          <div style={{ padding: "64px 24px", textAlign: "center", color: "#8D877F" }}>
            <FlagIcon width={36} height={36} style={{ margin: "0 auto 12px auto", opacity: 0.4, display: "block" }} />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#57534E", marginBottom: "4px" }}>
              No reported tracks found.
            </h3>
            <p style={{ fontSize: "0.88rem", margin: 0 }}>
              There are currently no reported tracks in the queue.
            </p>
          </div>
        ) : (
          <div className="ops-table-wrap staff-reports-table-wrap">
            <table className="ops-table staff-reports-table">
              <colgroup>
                <col className="staff-reports-col-track" />
                <col className="staff-reports-col-reason" />
                <col className="staff-reports-col-reporter" />
                <col className="staff-reports-col-date" />
                <col className="staff-reports-col-status" />
                <col className="staff-reports-col-actions" />
              </colgroup>
              <thead>
                <tr>
                  <th>Track Title</th>
                  <th>Violation Reason</th>
                  <th>Reporter / Count</th>
                  <th>Submission Date</th>
                  <th className="staff-reports-th-center">Status</th>
                  <th className="staff-reports-th-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {groupedReports.map((report) => {
                  const isPending = report.status?.toUpperCase() === "PENDING";
                  const count = report.reporterCount || 1;
                  return (
                    <tr key={report.id}>
                      {/* Track Title */}
                      <td data-cell="track" data-label="Track Title">
                        <div className="staff-reports-track-cell">
                          <img
                            src={report.coverUrl || covers.dawn}
                            alt={report.trackTitle}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = covers.dawn;
                            }}
                            className="staff-reports-track-cover"
                          />
                          <div className="staff-reports-track-meta">
                            <button
                              type="button"
                              onClick={() => setSelectedReportId(report.id)}
                              className="staff-reports-track-btn"
                              title={`Inspect content report details: ${report.trackTitle}`}
                            >
                              {report.trackTitle}
                            </button>
                            <small className="staff-reports-track-artist" title={report.artistName}>
                              {report.artistName}
                            </small>
                          </div>
                        </div>
                      </td>

                      {/* Violation Reason */}
                      <td data-cell="reason" data-label="Violation Reason">
                        <span className="staff-reports-reason-pill">
                          <span className="staff-reports-reason-dot" />
                          <span>{report.reason}</span>
                        </span>
                      </td>

                      {/* Reporter / Count Column */}
                      <td data-cell="reporter" data-label="Reporter / Count">
                        {isCopyrightReport(report) ? (
                          <div className="staff-reports-reporter-wrap">
                            <span
                              className="staff-reports-reporter-handle"
                              title={`@${report.reporterUsername || report.reporterName || "user"}`}
                            >
                              @{report.reporterUsername || report.reporterName || "user"}
                            </span>
                            {report.evidenceUrl && (
                              <span
                                title="Copyright evidence document attached"
                                className="staff-reports-evidence-clip"
                              >
                                <PaperclipIcon width={13} height={13} />
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className={`staff-reports-count-pill ${count > 1 ? "is-multi" : ""}`}>
                            {count} {count > 1 ? "reports" : "report"}
                          </span>
                        )}
                      </td>

                      {/* Submission Date */}
                      <td data-cell="date" data-label="Submission Date">
                        <span className="staff-reports-date-text">
                          {formatDate(report.createdAt, "-")}
                        </span>
                      </td>

                      {/* Status */}
                      <td data-cell="status" data-label="Status" className="staff-reports-td-center">
                        {getStatusBadge(report.status)}
                      </td>

                      {/* Action Controls - Eye icon button */}
                      <td data-cell="actions" data-label="Actions" className="staff-reports-td-center">
                        <button
                          type="button"
                          className={`icon-button staff-reports-action-btn ${isPending ? "button-primary" : "button-secondary"}`}
                          onClick={() => setSelectedReportId(report.id)}
                          title="Review Report"
                          aria-label={`Review report for ${report.trackTitle}`}
                        >
                          <EyeIcon width={16} height={16} />
                          <span className="staff-reports-action-label">Review Report</span>
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
