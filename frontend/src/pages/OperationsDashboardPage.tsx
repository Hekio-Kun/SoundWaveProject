import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { adminStatisticsApi } from "../api/adminStatistics";
import { ApiError } from "../api/client";
import {
  ActivityIcon,
  AlertIcon,
  DiscIcon,
  FlagIcon,
  MusicIcon,
  RefreshIcon,
  ShieldIcon,
  TrendingUpIcon,
  UsersIcon,
} from "../icons";
import type { SystemStatisticsResponse } from "../types";

type DashboardProps = {
  onNavigate: (route: string) => void;
  initialSubmissionId?: number | null;
};

type MetricProps = {
  icon: ReactNode;
  label: string;
  value: string;
  change: string;
  note: string;
  tone?: "cyan" | "violet" | "green" | "amber" | "red";
};

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatCompactNumber(value: number): string {
  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (value >= 1_000) {
    return (value / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return String(value);
}

function formatTimeAgo(dateStr: string): string {
  if (!dateStr) return "Recently";
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "Recently";
  }
}

function DashboardMetric({ icon, label, value, change, note, tone = "cyan" }: MetricProps) {
  return (
    <article className={`ops-metric ops-metric--${tone}`}>
      <div className="ops-metric-top">
        <span className="ops-metric-icon">{icon}</span>
        <span className="ops-metric-change"><TrendingUpIcon width={13} height={13} />{change}</span>
      </div>
      <strong>{value}</strong>
      <span className="ops-metric-label">{label}</span>
      <small>{note}</small>
    </article>
  );
}

function DashboardHeading({
  eyebrow,
  title,
  description,
  icon,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="ops-dashboard-heading">
      <div className="ops-dashboard-heading-copy">
        <span className="ops-role-mark">{icon}{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children ? <div className="ops-heading-actions">{children}</div> : null}
    </header>
  );
}

function PanelHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="ops-panel-heading">
      <div>
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function AdminDashboardPage({ onNavigate: _onNavigate }: DashboardProps) {
  const [range, setRange] = useState("7d");
  const [data, setData] = useState<SystemStatisticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const requestIdRef = useRef(0);

  const loadStatistics = useCallback(async (period: string) => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setError("");

    try {
      const response = await adminStatisticsApi.getSystemStatistics(period);
      if (requestId === requestIdRef.current) {
        setData(response);
      }
    } catch (err) {
      if (requestId === requestIdRef.current) {
        setError(err instanceof ApiError ? err.message : "Unable to load system statistics. Please verify backend connection.");
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadStatistics(range);
  }, [range, loadStatistics]);

  const overview = data?.overview;
  const growthList = data?.userGrowth ?? [];
  const maxGrowth = Math.max(...growthList.map((g) => g.count), 1);

  return (
    <div className="ops-dashboard ops-dashboard--admin">
      <DashboardHeading
        eyebrow="ADMINISTRATION · UC-29"
        title="System Statistics"
        description="Review users, published content, playback trends, and platform health."
        icon={<ShieldIcon width={15} height={15} />}
      >
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
          {data?.generatedAt ? (
            <span style={{ fontSize: "12px", color: "#64748B", display: "inline-flex", alignItems: "center", gap: "5px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10B981" }} />
              Snapshot: {new Date(data.generatedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          ) : null}
          <label className="ops-range-select">
            <span>Date range</span>
            <select
              value={range}
              onChange={(event) => setRange(event.target.value)}
              aria-label="Date range"
              disabled={isLoading}
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </label>
          <button
            type="button"
            className="button button-secondary"
            onClick={() => void loadStatistics(range)}
            disabled={isLoading}
            title="Refresh statistics"
            aria-label="Refresh statistics"
            style={{ minHeight: "40px", padding: "0 0.75rem", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
          >
            <RefreshIcon width={15} height={15} className={isLoading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </DashboardHeading>

      {error ? (
        <section className="ops-panel" style={{ padding: "2rem", textAlign: "center" }} role="alert">
          <div style={{ display: "inline-flex", padding: "0.75rem", borderRadius: "50%", background: "#FEF3F2", color: "#B42318", marginBottom: "0.75rem" }}>
            <AlertIcon width={24} height={24} />
          </div>
          <h2 style={{ fontSize: "1.1rem", marginBottom: "0.5rem", color: "#1C1917" }}>Could not load statistics</h2>
          <p style={{ color: "#57534E", maxWidth: "480px", margin: "0 auto 1rem auto" }}>{error}</p>
          <button type="button" className="button button-primary" onClick={() => void loadStatistics(range)}>
            <RefreshIcon width={15} height={15} /> Try again
          </button>
        </section>
      ) : (
        <>
          {/* Key Performance Indicators */}
          <section className="ops-metric-grid" aria-label="System statistics">
            <DashboardMetric
              icon={<UsersIcon />}
              label="Total users"
              value={isLoading && !overview ? "..." : formatNumber(overview?.totalUsers ?? 0)}
              change={isLoading && !overview ? "..." : `${(overview?.userGrowthPercentage ?? 0) >= 0 ? "+" : ""}${overview?.userGrowthPercentage ?? 0}%`}
              note={`+${formatNumber(overview?.newUsersInPeriod ?? 0)} in this period`}
              tone="cyan"
            />
            <DashboardMetric
              icon={<DiscIcon />}
              label="Published tracks"
              value={isLoading && !overview ? "..." : formatNumber(overview?.publishedTracks ?? 0)}
              change={`+${formatNumber(overview?.newTracksInPeriod ?? 0)} new`}
              note={`${formatNumber(overview?.activeGenres ?? 0)} active genres`}
              tone="violet"
            />
            <DashboardMetric
              icon={<ActivityIcon />}
              label="Total plays"
              value={isLoading && !overview ? "..." : formatCompactNumber(overview?.totalPlays ?? 0)}
              change="Streams"
              note={`${formatNumber(overview?.totalPlays ?? 0)} total listening sessions`}
              tone="green"
            />
            <DashboardMetric
              icon={<ShieldIcon />}
              label="Pending reviews"
              value={isLoading && !overview ? "..." : String(overview?.pendingReviews ?? 0)}
              change="Submissions"
              note="Awaiting staff moderation"
              tone="amber"
            />
            <DashboardMetric
              icon={<FlagIcon />}
              label="Pending reports"
              value={isLoading && !overview ? "..." : String(overview?.pendingReports ?? 0)}
              change="Reports"
              note="Community violation alerts"
              tone="red"
            />
          </section>

          {/* User Growth Chart & Platform Health */}
          <section className="ops-dashboard-grid ops-dashboard-grid--hero">
            <article className="ops-panel ops-panel--chart">
              <PanelHeading
                title="User growth"
                description={range === "7d" ? "New users in the last 7 days" : `Trend over the last ${range === "30d" ? "30" : "90"} days`}
                action={
                  <span className="ops-panel-total">
                    <b>+{formatNumber(overview?.newUsersInPeriod ?? 0)}</b> new accounts
                  </span>
                }
              />
              <div className="ops-growth-chart" aria-label="User growth chart">
                <div className="ops-chart-scale">
                  <span>{formatNumber(Math.round(maxGrowth))}</span>
                  <span>{formatNumber(Math.round(maxGrowth * 0.66))}</span>
                  <span>{formatNumber(Math.round(maxGrowth * 0.33))}</span>
                  <span>0</span>
                </div>
                <div className="ops-bars">
                  {growthList.map((item, index) => {
                    const heightPercent = maxGrowth > 0 ? Math.round((item.count / maxGrowth) * 100) : 0;
                    return (
                      <div className="ops-bar-column" key={`${item.date}-${index}`} title={`${item.date}: ${item.count} users`}>
                        <div className="ops-bar-track">
                          <i style={{ height: `${Math.max(6, heightPercent)}%` }} />
                        </div>
                        <span>{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="ops-chart-summary">
                <span>
                  <i className="is-primary" />Listeners <b>{data?.roleDistribution.listenerPercentage ?? 0}%</b>
                </span>
                <span>
                  <i className="is-accent" />Creators <b>{data?.roleDistribution.creatorPercentage ?? 0}%</b>
                </span>
                <span className="ops-chart-insight">
                  <TrendingUpIcon width={14} height={14} /> {(overview?.userGrowthPercentage ?? 0) >= 0 ? "+" : ""}{overview?.userGrowthPercentage ?? 0}% growth vs previous period
                </span>
              </div>
            </article>

            <aside className="ops-panel ops-health-panel">
              <PanelHeading title="System health" description="Live infrastructure indicators" />
              <div className="ops-health-score">
                <div className="ops-score-ring">
                  <span>
                    <b>{data?.systemHealth.uptime ?? "99.98%"}</b>
                    <small>uptime</small>
                  </span>
                </div>
                <p>All core infrastructure services are operational.</p>
              </div>
              <div className="ops-health-list">
                <div>
                  <span><i className="is-ok" />REST API</span>
                  <b>{data?.systemHealth.restApiLatencyMs ?? 24} ms</b>
                </div>
                <div>
                  <span><i className="is-ok" />Database</span>
                  <b>{data?.systemHealth.databaseLatencyMs ?? 15} ms</b>
                </div>
                <div>
                  <span><i className="is-ok" />Cloud Storage</span>
                  <b>{data?.systemHealth.cloudStorageLatencyMs ?? 95} ms</b>
                </div>
                <div>
                  <span><i className="is-ok" />Email Service</span>
                  <b>{data?.systemHealth.emailServiceStatus ?? "Operational"}</b>
                </div>
              </div>
            </aside>
          </section>

          {/* Top Tracks & Recent Accounts */}
          <section className="ops-dashboard-grid ops-dashboard-grid--lower">
            {/* Top Streamed Tracks */}
            <article className="ops-panel ops-top-tracks">
              <PanelHeading
                title="Top streamed tracks"
                description="Highest play counts across published catalog"
              />
              {(!data?.topTracks || data.topTracks.length === 0) ? (
                <div style={{ padding: "2rem", textAlign: "center", color: "#8D877F" }}>
                  <MusicIcon width={24} height={24} style={{ opacity: 0.5, margin: "0 auto 0.5rem auto", display: "block" }} />
                  <p>No published tracks with stream data available yet.</p>
                </div>
              ) : (
                <div className="ops-table-wrap">
                  <table className="ops-table">
                    <thead>
                      <tr>
                        <th style={{ width: "44px", textAlign: "center" }}>#</th>
                        <th style={{ minWidth: "200px" }}>Track</th>
                        <th style={{ width: "120px", whiteSpace: "nowrap" }}>Genre</th>
                        <th style={{ width: "90px", textAlign: "right", whiteSpace: "nowrap" }}>Plays</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.topTracks.map((track, idx) => (
                        <tr key={track.id}>
                          <td style={{ fontWeight: 800, color: "#8C5828", textAlign: "center", fontSize: "14px" }}>{idx + 1}</td>
                          <td>
                            <div className="ops-user-cell">
                              {track.coverUrl ? (
                                <img
                                  src={track.coverUrl}
                                  alt={track.title}
                                  style={{ width: "44px", height: "44px", borderRadius: "10px", objectFit: "cover", flexShrink: 0 }}
                                />
                              ) : (
                                <span
                                  style={{
                                    width: "44px",
                                    height: "44px",
                                    borderRadius: "10px",
                                    background: "#E0F2FE",
                                    color: "#0284C7",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                  }}
                                >
                                  <MusicIcon width={18} height={18} />
                                </span>
                              )}
                              <div style={{ minWidth: 0 }}>
                                <b style={{ fontSize: "14px" }}>{track.title}</b>
                                <small style={{ fontSize: "12px" }}>{track.uploaderName}</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="ops-role-chip" style={{ background: "#F5EAD8", color: "#8C5828" }}>
                              {track.genreName}
                            </span>
                          </td>
                          <td style={{ textAlign: "right", fontWeight: 800, fontSize: "15px", color: "#0284C7" }}>
                            {formatNumber(track.playCount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </article>

            {/* Recent Accounts */}
            <article className="ops-panel ops-recent-users">
              <PanelHeading
                title="Recent accounts"
                description="Accounts that recently joined SoundWave"
              />
              {(!data?.recentAccounts || data.recentAccounts.length === 0) ? (
                <div style={{ padding: "2rem", textAlign: "center", color: "#8D877F" }}>
                  <UsersIcon width={24} height={24} style={{ opacity: 0.5, margin: "0 auto 0.5rem auto", display: "block" }} />
                  <p>No recently registered accounts found.</p>
                </div>
              ) : (
                <div className="ops-table-wrap">
                  <table className="ops-table">
                    <thead>
                      <tr>
                        <th style={{ minWidth: "160px" }}>User</th>
                        <th style={{ width: "95px", whiteSpace: "nowrap" }}>Role</th>
                        <th style={{ width: "105px", whiteSpace: "nowrap" }}>Status</th>
                        <th style={{ width: "80px", textAlign: "right", whiteSpace: "nowrap" }}>Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentAccounts.map((account) => (
                        <tr key={account.id}>
                          <td>
                            <div className="ops-user-cell">
                              {account.avatarUrl ? (
                                <img
                                  src={account.avatarUrl}
                                  alt={account.displayName}
                                  style={{ width: "42px", height: "42px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                                />
                              ) : (
                                <span style={{ width: "42px", height: "42px", borderRadius: "50%", flexShrink: 0, fontSize: "13px" }}>
                                  {account.initials}
                                </span>
                              )}
                              <div style={{ minWidth: 0 }}>
                                <b style={{ fontSize: "14px" }}>{account.displayName}</b>
                                <small style={{ fontSize: "12px" }}>{account.email}</small>
                              </div>
                            </div>
                          </td>
                          <td style={{ whiteSpace: "nowrap" }}>
                            <span className="ops-role-chip">{account.role}</span>
                          </td>
                          <td style={{ whiteSpace: "nowrap" }}>
                            <span className={`ops-status ${account.status === "Verified" ? "is-success" : "is-warning"}`}>
                              <i />
                              {account.status}
                            </span>
                          </td>
                          <td style={{ textAlign: "right", whiteSpace: "nowrap", fontSize: "12.5px", color: "#64748B", fontWeight: 500 }}>
                            {formatTimeAgo(account.joinedAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </article>
          </section>
        </>
      )}
    </div>
  );
}

export const AdminStatisticsPage = AdminDashboardPage;

export { StaffDashboardPage } from "./StaffDashboardPage";

export function DashboardAccessDenied({
  onNavigate,
  requiredRole = "authorized",
}: {
  onNavigate: (route: string) => void;
  initialSubmissionId?: number | null;
  requiredRole?: string;
}) {
  return (
    <div className="ops-access-denied">
      <span><ShieldIcon width={32} height={32} /></span>
      <small>403 · RESTRICTED AREA</small>
      <h1>Access denied</h1>
      <p>This workspace is available only to accounts with the {requiredRole} role. Please login with an authorized account.</p>
      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", marginTop: "1rem" }}>
        <button className="button button-primary" onClick={() => onNavigate("/staff/login")}>Login as Staff</button>
        <button className="button button-secondary" onClick={() => onNavigate("/")}>Back to Explore</button>
      </div>
    </div>
  );
}
