import { AuthProvider, useAuth } from "./context/AuthContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import { PlayerProvider, usePlayer } from "./context/PlayerContext";
import { PlaylistProvider, usePlaylists } from "./context/PlaylistContext";
import { useRouter } from "./hooks/useRouter";
import { AppRouter } from "./routes/AppRouter";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { MusicAppShell } from "./layouts/MusicAppShell";
import { MusicPlayer } from "./components/MusicPlayer";
import { GuestLoginPrompt } from "./components/GuestLoginPrompt";
import { LogoutConfirmationDialog } from "./components/LogoutConfirmationDialog";

function AppContent() {
  const {
    user,
    isAuthenticated,
    requestLogout,
    logoutDialogOpen,
    logoutSubmitting,
    confirmLogout,
    cancelLogout,
    logoutNotice,
  } = useAuth();

  const {
    currentTrack,
    playing,
    queue,
    audio,
    setAudioPlaying,
    playTrack,
    handleGuestTrackEnded,
    guestPromptOpen,
    continueListening,
    closeGuestPrompt,
    queueOpen,
    setQueueOpen,
    toggleQueue,
    handleRecordPlay,
    removeFromQueue,
    clearQueue,
  } = usePlayer();

  const { openCreatePlaylist, toastNotice } = usePlaylists();
  const { pathname, navigate, isAuthRoute, isDashboardRoute, isMusicRoute, isExploreRoute } = useRouter();

  return (
    <div className={isMusicRoute ? "app-root app-root--has-player" : "app-root"}>
      {isAuthRoute ? (
        <div key={pathname} className="app-route-stage app-route-stage--auth">
          <AppRouter />
        </div>
      ) : isDashboardRoute ? (
        <DashboardLayout
          activeRoute={pathname}
          user={user}
          onNavigate={navigate}
          onLogout={requestLogout}
        >
          <div key={pathname} className="app-route-stage app-route-stage--dashboard">
            <AppRouter />
          </div>
        </DashboardLayout>
      ) : (
        <MusicAppShell
          activeRoute={pathname}
          onNavigate={navigate}
          user={user}
          isAuthenticated={isAuthenticated}
          onLogout={requestLogout}
          onCreatePlaylist={openCreatePlaylist}
          queueOpen={queueOpen}
          onCloseQueue={() => setQueueOpen(false)}
          currentTrack={currentTrack}
          playing={playing}
          queue={queue}
          onPlayTrack={playTrack}
          onRemoveFromQueue={removeFromQueue}
          onClearQueue={clearQueue}
          hasPlayer
          showFooter={isExploreRoute}
        >
          <div key={pathname} className="app-route-stage app-route-stage--music">
            <AppRouter />
          </div>
        </MusicAppShell>
      )}

      {/* Global Music Player fixed at bottom */}
      {isMusicRoute && currentTrack && (
        <MusicPlayer
          track={currentTrack}
          queue={queue}
          audio={audio}
          playing={playing}
          onPlayingChange={setAudioPlaying}
          onTrackChange={playTrack}
          onGuestTrackEnded={handleGuestTrackEnded}
          isAuthenticated={isAuthenticated}
          onToggleQueue={toggleQueue}
          isQueueOpen={queueOpen}
          onRecordPlay={handleRecordPlay}
        />
      )}

      {/* Guest Login Prompt Modal */}
      <GuestLoginPrompt
        open={guestPromptOpen}
        onContinue={continueListening}
        onLogin={() => {
          closeGuestPrompt();
          navigate("/login");
        }}
      />

      {/* Logout Confirmation Dialog */}
      <LogoutConfirmationDialog
        open={logoutDialogOpen}
        submitting={logoutSubmitting}
        onCancel={cancelLogout}
        onConfirm={confirmLogout}
      />

      {/* Global Toast Notifications */}
      {logoutNotice ? <div className="app-toast" role="status">{logoutNotice}</div> : null}
      {toastNotice ? <div className="app-toast" role="status">{toastNotice}</div> : null}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <FavoritesProvider>
          <PlaylistProvider>
            <AppContent />
          </PlaylistProvider>
        </FavoritesProvider>
      </PlayerProvider>
    </AuthProvider>
  );
}
