import { useCallback, useEffect, useMemo, useState } from "react";
import { reportsApi, type MyReportHistoryResponse } from "../api/reports";
import { covers } from "../data";
import { CenterNotificationPopup } from "../components/modals/CenterNotificationPopup";
import { DeleteConfirmationModal } from "../components/modals/DeleteConfirmationModal";
import {
  AlertIcon,
  ClockIcon,
  FlagIcon,
  RefreshIcon,
} from "../icons";

type Props = {
  onNavigate: (route: string) => void;
};

type ReportFilterTab = "ALL" | "PENDING" | "RESOLVED" | "DISMISSED";

function parseIsoDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  if (!dateStr.endsWith("Z") && !/[+-]\d{2}:?\d{2}$/.test(dateStr)) {
    return new Date(dateStr + "Z");
  }
  return new Date(dateStr);
}

function getRelativeDateLabel(dateStr: string): string {
  if (!dateStr) return "Earlier";
  const date = parseIsoDate(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const targetDay = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const diffDays = Math.round((today - targetDay) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) {
    return date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatReportTime(dateStr: string): string {
  if (!dateStr) return "";
  const date = parseIsoDate(dateStr);
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

export function ReportsHistoryPage({ onNavigate }: Props) {
  const [reports, setReports] = useState<MyReportHistoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<ReportFilterTab>("ALL");

  // Confirmation modal and toast states
  const [withdrawTarget, setWithdrawTarget] = useState<MyReportHistoryResponse | null>(null);
  const [toastNotification, setToastNotification] = useState<{
    open: boolean;
    message: string;
    type: "success" | "error" | "info" | "warning";
  }>({ open: false, message: "", type: "info" });

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportsApi.getMyReports();
      setReports(data || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load report history. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  const handleActionNotice = (actionName: string) => {
    setToastNotification({
      open: true,
      message: `${actionName} will be available in the next use-case update.`,
      type: "info",
    });
  };

  const handleConfirmWithdraw = () => {
    if (!withdrawTarget) return;
    setToastNotification({
      open: true,
      message: `Withdraw Report (UC-22.4) for "${withdrawTarget.trackTitle}" will be handled in UC-22.4.`,
      type: "info",
    });
    setWithdrawTarget(null);
  };

  // Counts by status
  const pendingCount = useMemo(
    () => reports.filter((r) => r.status?.toUpperCase() === "PENDING").length,
    [reports]
  );
  const resolvedCount = useMemo(
    () => reports.filter((r) => r.status?.toUpperCase() === "RESOLVED").length,
    [reports]
  );
  const dismissedCount = useMemo(
    () =>
      reports.filter((r) => {
        const s = r.status?.toUpperCase();
        return s === "DISMISSED" || s === "REJECTED";
      }).length,
    [reports]
  );

  // Filtered reports
  const filteredReports = useMemo(() => {
    if (tab === "ALL") return reports;
    if (tab === "PENDING") {
      return reports.filter((r) => r.status?.toUpperCase() === "PENDING");
    }
    if (tab === "RESOLVED") {
      return reports.filter((r) => r.status?.toUpperCase() === "RESOLVED");
    }
    if (tab === "DISMISSED") {
      return reports.filter((r) => {
        const s = r.status?.toUpperCase();
        return s === "DISMISSED" || s === "REJECTED";
      });
    }
    return reports;
  }, [reports, tab]);

  // Date grouping (identical pattern to Listening History in LibraryPage)
  const groupedReports = useMemo(() => {
    const groups: { label: string; items: MyReportHistoryResponse[] }[] = [];
    const map = new Map<string, MyReportHistoryResponse[]>();

    for (const item of filteredReports) {
      const label = getRelativeDateLabel(item.createdAt);
      if (!map.has(label)) {
        map.set(label, []);
      }
      map.get(label)!.push(item);
    }

    for (const [label, items] of map.entries()) {
      groups.push({ label, items });
    }

    return groups;
  }, [filteredReports]);

  return (
    <div className="library-page" style={{ padding: "0 20px" }}>
      {/* Banner - Exactly like LibraryPage / Listening History */}
      <div className="page-title-banner">
        <div>
          <h1 className="page-heading" style={{ color: "var(--brand, #0284c7)" }}>
            Reports History
          </h1>
          <p className="page-subtext">
            Track the status of violation reports you submitted. Our moderation team reviews all reports to keep SoundWave safe and compliant.
          </p>
        </div>
      </div>

      {/* Tabs & Actions Bar - Identical to LibraryPage library-tabs-bar */}
      <div className="library-tabs-bar">
        <div className="library-nav-tabs">
          <button
            type="button"
            className={`library-tab ${tab === "ALL" ? "library-tab--active" : ""}`}
            onClick={() => setTab("ALL")}
          >
            All reports ({reports.length})
          </button>
          <button
            type="button"
            className={`library-tab ${tab === "PENDING" ? "library-tab--active" : ""}`}
            onClick={() => setTab("PENDING")}
          >
            Pending review ({pendingCount})
          </button>
          <button
            type="button"
            className={`library-tab ${tab === "RESOLVED" ? "library-tab--active" : ""}`}
            onClick={() => setTab("RESOLVED")}
          >
            Resolved ({resolvedCount})
          </button>
          <button
            type="button"
            className={`library-tab ${tab === "DISMISSED" ? "library-tab--active" : ""}`}
            onClick={() => setTab("DISMISSED")}
          >
            Dismissed ({dismissedCount})
          </button>
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button
            type="button"
            className="button button-secondary button-small"
            onClick={loadReports}
            disabled={loading}
            title="Refresh reports list"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <RefreshIcon width={14} height={14} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && reports.length === 0 ? (
        <div className="state-empty-box">
          <ClockIcon width={48} height={48} style={{ color: "var(--brand, #0284c7)" }} />
          <p className="empty-title">Loading reports history...</p>
          <p className="empty-desc">Fetching your submitted content reports.</p>
        </div>
      ) : error ? (
        /* Exception EX02: Database retrieval failure */
        <div className="state-empty-box">
          <AlertIcon width={48} height={48} style={{ color: "#ef4444" }} />
          <p className="empty-title">Unable to load reports history</p>
          <p className="empty-desc">{error}</p>
          <button className="button button-primary button-small" onClick={loadReports}>
            <RefreshIcon width={16} height={16} /> Try again
          </button>
        </div>
      ) : reports.length === 0 ? (
        /* Alternative Flow AF01: Empty State (No reports found) */
        <div className="state-empty-box">
          <FlagIcon width={48} height={48} style={{ color: "#94a3b8" }} />
          <p className="empty-title">You have not submitted any reports yet</p>
          <p className="empty-desc">
            If you notice copyright violations, offensive content, or damaged audio on SoundWave, you can submit a report directly from any track&apos;s action menu (...).
          </p>
          <button className="button button-primary button-small" onClick={() => onNavigate("/explore")}>
            Explore tracks
          </button>
        </div>
      ) : filteredReports.length === 0 ? (
        /* Filter returned empty */
        <div className="state-empty-box">
          <FlagIcon width={48} height={48} style={{ color: "#94a3b8" }} />
          <p className="empty-title">No {tab.toLowerCase()} reports</p>
          <p className="empty-desc">There are no violation reports matching the &ldquo;{tab.toLowerCase()}&rdquo; filter.</p>
          <button className="button button-secondary button-small" onClick={() => setTab("ALL")}>
            View all reports
          </button>
        </div>
      ) : (
        /* Normal Flow NF01: Render Reports with Date Grouping & Library-Style Rows */
        <div className="history-container">
          {groupedReports.map((group) => (
            <div key={group.label} className="history-date-group" style={{ marginBottom: "28px" }}>
              {/* Group Header - Same style as Listening History */}
              <div
                className="history-group-header"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  margin: "16px 0 12px 6px",
                  fontWeight: 700,
                  fontSize: "13px",
                  color: "var(--sw-text-muted, #64748B)",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                <ClockIcon width={14} height={14} />
                <span>{group.label}</span>
                <span style={{ fontSize: "11px", opacity: 0.8 }}>({group.items.length})</span>
              </div>

              {/* Table Styled Identically to Library Tracks Table */}
              <div className="library-tracks-table" style={{ overflowX: "auto" }}>
                <div style={{ minWidth: "820px" }}>
                  <div
                    className="library-tracks-header"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "36px 44px minmax(200px, 2.2fr) minmax(160px, 1.4fr) 120px minmax(180px, 1.8fr) 140px",
                      alignItems: "center",
                      gap: "12px",
                      padding: "8px 18px",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#94a3b8",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      borderBottom: "1px solid #eef2f6",
                      background: "#f8fafc",
                      borderRadius: "10px 10px 0 0",
                    }}
                  >
                    <span style={{ textAlign: "center" }}>#</span>
                    <span />
                    <span>Track Title</span>
                    <span>Selected Reason</span>
                    <span style={{ textAlign: "center" }}>Status</span>
                    <span>Staff Feedback</span>
                    <span style={{ textAlign: "right" }}>Actions</span>
                  </div>

                  {group.items.map((item, idx) => {
                    const isPending = item.status?.toUpperCase() === "PENDING";
                    const isResolved = item.status?.toUpperCase() === "RESOLVED";
                    const isDismissed =
                      item.status?.toUpperCase() === "DISMISSED" || item.status?.toUpperCase() === "REJECTED";

                    return (
                      <div
                        key={item.id}
                        className="table-track-row"
                        style={{
                          display: "grid",
                          gridTemplateColumns: "36px 44px minmax(200px, 2.2fr) minmax(160px, 1.4fr) 120px minmax(180px, 1.8fr) 140px",
                          alignItems: "center",
                          gap: "12px",
                          padding: "10px 18px",
                        }}
                      >
                        {/* Row Index */}
                        <span className="row-index">{String(idx + 1).padStart(2, "0")}</span>

                        {/* Track Thumbnail */}
                        <div
                          className="row-thumbnail"
                          onClick={() => onNavigate(`/track/${item.trackId}`)}
                          title="View Track Details"
                        >
                          <img
                            src={item.trackCoverUrl || covers.dawn}
                            alt={item.trackTitle}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = covers.dawn;
                            }}
                          />
                        </div>

                        {/* Track Title (Clickable link to UC-19.5 View Track Details) & Submission Time */}
                        <div className="row-main-info">
                          <a
                            className="row-title"
                            href={`#/track/${item.trackId}`}
                            onClick={(e) => {
                              e.preventDefault();
                              onNavigate(`/track/${item.trackId}`);
                            }}
                            title={`View track: ${item.trackTitle}`}
                          >
                            {item.trackTitle}
                          </a>
                          <span
                            className="row-creator"
                            style={{ display: "flex", alignItems: "center", gap: "4px" }}
                            title={`Submitted on ${new Date(item.createdAt).toLocaleString("en-US")}`}
                          >
                            <ClockIcon width={12} height={12} style={{ opacity: 0.6 }} />
                            <span>{formatReportTime(item.createdAt)}</span>
                          </span>
                        </div>

                        {/* Selected Reason (the chosen violation category) */}
                        <div className="row-album" style={{ minWidth: 0 }}>
                          <span
                            style={{
                              display: "inline-block",
                              background: "#F1F5F9",
                              padding: "3px 10px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: 600,
                              color: "#334155",
                              maxWidth: "100%",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                            title={item.categoryLabel || item.category}
                          >
                            {item.categoryLabel || item.category}
                          </span>
                        </div>

                        {/* Status Badge (PENDING, RESOLVED, or DISMISSED) */}
                        <div style={{ textAlign: "center" }}>
                          {isPending && (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                padding: "3px 10px",
                                borderRadius: "20px",
                                background: "#FEF3C7",
                                color: "#B45309",
                                fontSize: "11px",
                                fontWeight: 700,
                              }}
                            >
                              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#F59E0B" }} />
                              Pending
                            </span>
                          )}
                          {isResolved && (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                padding: "3px 10px",
                                borderRadius: "20px",
                                background: "#DCFCE7",
                                color: "#15803D",
                                fontSize: "11px",
                                fontWeight: 700,
                              }}
                            >
                              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22C55E" }} />
                              Resolved
                            </span>
                          )}
                          {isDismissed && (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                padding: "3px 10px",
                                borderRadius: "20px",
                                background: "#F1F5F9",
                                color: "#64748B",
                                fontSize: "11px",
                                fontWeight: 700,
                              }}
                            >
                              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#94A3B8" }} />
                              Dismissed
                            </span>
                          )}
                          {!isPending && !isResolved && !isDismissed && (
                            <span
                              style={{
                                padding: "3px 10px",
                                borderRadius: "20px",
                                background: "#F1F5F9",
                                color: "#475569",
                                fontSize: "11px",
                                fontWeight: 600,
                              }}
                            >
                              {item.status}
                            </span>
                          )}
                        </div>

                        {/* Staff Feedback Note (when available under BR-32) */}
                        <div style={{ fontSize: "12px", color: "var(--sw-text-muted, #475467)" }}>
                          {item.resolutionNote ? (
                            <span
                              title={item.resolutionNote}
                              style={{
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                lineHeight: 1.4,
                              }}
                            >
                              {item.resolutionNote}
                            </span>
                          ) : (
                            <span style={{ color: "#94a3b8", fontStyle: "italic", fontSize: "11.5px" }}>
                              {isPending ? "Awaiting staff review" : "No feedback provided"}
                            </span>
                          )}
                        </div>

                        {/* Action Buttons (NF01 Step 4) */}
                        <div className="row-actions" style={{ justifyContent: "flex-end" }}>
                          {isPending ? (
                            <div style={{ display: "inline-flex", gap: "6px" }}>
                              <button
                                type="button"
                                className="button button-ghost button-small"
                                onClick={() => handleActionNotice("Change Reason (UC-22.3)")}
                                title="Update violation reason"
                                style={{
                                  fontSize: "11.5px",
                                  padding: "3px 8px",
                                  borderRadius: "6px",
                                  color: "var(--brand, #0284c7)",
                                  border: "1px solid #bae6fd",
                                  background: "#f0f9ff",
                                }}
                              >
                                Change
                              </button>
                              <button
                                type="button"
                                className="button button-ghost button-small"
                                onClick={() => setWithdrawTarget(item)}
                                title="Withdraw this pending report"
                                style={{
                                  fontSize: "11.5px",
                                  padding: "3px 8px",
                                  borderRadius: "6px",
                                  color: "#b42318",
                                  border: "1px solid #fecdca",
                                  background: "#fff5f5",
                                }}
                              >
                                Withdraw
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: "11.5px", color: "#94a3b8", fontStyle: "italic" }}>
                              Read-only
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal for Withdrawing Report (UC-22.4) */}
      <DeleteConfirmationModal
        open={Boolean(withdrawTarget)}
        title="Withdraw report"
        message={`Are you sure you want to withdraw your report against "${withdrawTarget?.trackTitle}"? This will cancel the pending moderation review.`}
        confirmLabel="Withdraw"
        onConfirm={handleConfirmWithdraw}
        onCancel={() => setWithdrawTarget(null)}
      />

      {/* Center Toast Popup for Feedback */}
      <CenterNotificationPopup
        open={toastNotification.open}
        message={toastNotification.message}
        type={toastNotification.type}
        durationMs={3000}
        onClose={() => setToastNotification((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}
