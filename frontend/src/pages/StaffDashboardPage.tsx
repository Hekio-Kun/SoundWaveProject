import { useEffect, useState } from "react";
import { MusicIcon } from "../icons";
import { ModeratePendingTracks } from "../components/moderation/ModeratePendingTracks";

type Props = {
  onNavigate: (route: string) => void;
  initialSubmissionId?: number | null;
};

export function StaffDashboardPage({ onNavigate, initialSubmissionId }: Props) {
  const [activeSubmissionId, setActiveSubmissionId] = useState<number | null>(
    initialSubmissionId ?? null
  );

  useEffect(() => {
    setActiveSubmissionId(initialSubmissionId ?? null);
  }, [initialSubmissionId]);

  return (
    <div className="ops-dashboard ops-dashboard--staff">
      {/* Executive Hero Banner */}
      <header className="staff-hero-banner">
        <div className="staff-hero-copy">

          <div className="staff-hero-title-row">
            <span className="staff-hero-title-icon" aria-hidden="true">
              <MusicIcon width={18} height={18} />
            </span>
            <h1 className="staff-hero-title">Moderate Pending Tracks</h1>
          </div>

          <p className="staff-hero-description">
            Review pending submissions and record an approval or rejection decision.
          </p>
        </div>
      </header>

      {/* Main Review Center */}
      <ModeratePendingTracks
        onNavigate={onNavigate}
        initialSubmissionId={activeSubmissionId}
        onSelectionChange={(id) => setActiveSubmissionId(id)}
      />
    </div>
  );
}

