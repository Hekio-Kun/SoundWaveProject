import { useEffect, type ReactNode } from "react";
import { AppTopBar } from "../components/AppTopBar";
import { MobileBottomNav } from "../components/MobileBottomNav";
import { QueueDrawer } from "../components/QueueDrawer";
import { Sidebar } from "../components/Sidebar";
import { SoundWaveFooter } from "../components/SoundWaveFooter";
import type { CurrentUser, LandingTrack } from "../types";

/**
 * Props for the master {@link MusicAppShell} application layout wrapper.
 */
export type MusicAppShellProps = {
  /** Page content rendered inside the scrollable main container */
  children: ReactNode;
  /** Currently active navigation route key */
  activeRoute: string;
  /** Navigation callback to switch between views */
  onNavigate: (route: string) => void;
  /** Currently signed-in user object, or null for guests */
  user: CurrentUser | null;
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** Callback to initiate user sign-out */
  onLogout: () => void;
  /** Callback to launch the create playlist modal */
  onCreatePlaylist: () => void;
  // Queue state props
  /** Whether the playback queue drawer is open */
  queueOpen: boolean;
  /** Callback to dismiss the playback queue drawer */
  onCloseQueue: () => void;
  /** Track currently being played */
  currentTrack: LandingTrack | null;
  /** Whether the player is currently playing */
  playing: boolean;
  /** Active queue track list */
  queue: LandingTrack[];
  /** Callback to switch playback to a specific track */
  onPlayTrack: (track: LandingTrack) => void;
  /** Callback to remove a track from the queue */
  onRemoveFromQueue: (trackId: number) => void;
  /** Callback to clear upcoming tracks from the queue */
  onClearQueue: () => void;
  /** Callback invoked when the user reorders the playback queue (NF02) */
  onReorderQueue?: (newQueue: LandingTrack[]) => void;
  /** Playback context description */
  playbackContext?: string | null;
  /** Whether a track is currently active to display bottom player padding */
  hasPlayer: boolean;
  /** Whether the global landing/app footer should be displayed */
  showFooter: boolean;
};

/**
 * Main application shell providing the responsive navigation frame, top app bar,
 * sidebar, slide-out queue drawer, and bottom navigation bar.
 */
export function MusicAppShell({
  children,
  activeRoute,
  onNavigate,
  user,
  isAuthenticated,
  onLogout,
  onCreatePlaylist,
  queueOpen,
  onCloseQueue,
  currentTrack,
  playing,
  queue,
  onPlayTrack,
  onRemoveFromQueue,
  onClearQueue,
  onReorderQueue,
  playbackContext,
  hasPlayer,
  showFooter,
}: MusicAppShellProps) {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.getElementById("app-scroll-region")?.scrollTo({ top: 0, behavior: "auto" });
  }, [activeRoute]);

  return (
    <div className={`music-app-shell ${hasPlayer ? "music-app-shell--with-player" : ""} ${queueOpen ? "music-app-shell--queue-open" : ""}`}>
      {/* 1. Left Sidebar */}
      <Sidebar
        activeRoute={activeRoute}
        onNavigate={onNavigate}
        onCreatePlaylist={onCreatePlaylist}
        isAuthenticated={isAuthenticated}
        userRole={user?.role}
      />

      {/* 2. Main Workspace (Top bar + Dynamic Content) */}
      <div className="app-main-viewport">
        <AppTopBar
          user={user}
          isAuthenticated={isAuthenticated}
          onNavigate={onNavigate}
          onLogout={onLogout}
        />

        <div className="app-scroll-region" id="app-scroll-region">
          <main className="app-content-body" id="app-content-body">
            {children}
          </main>
          {showFooter && (
            <div className="app-shell-footer">
              <SoundWaveFooter hasPlayer={false} isAuthenticated={isAuthenticated} />
            </div>
          )}
        </div>
      </div>

      {/* 3. Right Queue Drawer (Optional / Toggleable) */}
      <QueueDrawer
        isOpen={queueOpen}
        onClose={onCloseQueue}
        currentTrack={currentTrack}
        playing={playing}
        queue={queue}
        onPlayTrack={onPlayTrack}
        onRemoveFromQueue={onRemoveFromQueue}
        onClearQueue={onClearQueue}
        onReorderQueue={onReorderQueue}
        playbackContext={playbackContext}
      />

      {/* 4. Mobile Bottom Navigation */}
      <MobileBottomNav
        activeRoute={activeRoute}
        onNavigate={onNavigate}
        isAuthenticated={isAuthenticated}
        userRole={user?.role}
      />
    </div>
  );
}
