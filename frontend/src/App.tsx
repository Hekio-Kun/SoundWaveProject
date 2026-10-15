import { AuthProvider, useAuth } from "./context/AuthContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import { PlayerProvider, usePlayer } from "./context/PlayerContext";
import { PlaylistProvider, usePlaylists } from "./context/PlaylistContext";
import { useRouter } from "./hooks/useRouter";
import { AppRouter } from "./routes/AppRouter";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { MusicAppShell } from "./layouts/MusicAppShell";
import { MusicPlayer } from "./components/player/MusicPlayer";
import { GuestLoginPrompt } from "./components/modals/GuestLoginPrompt";
import { LogoutConfirmationDialog } from "./components/modals/LogoutConfirmationDialog";
import { CenterNotificationPopup } from "./components/modals/CenterNotificationPopup";
import { tracks } from "./data";

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
    setLogoutNotice,
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
    reorderQueue,
  } = usePlayer();

  const { openCreatePlaylist, toastNotice, showToast } = usePlaylists();
  const { pathname, navigate, isAuthRoute, isDashboardRoute, isMusicRoute, isExploreRoute } = useRouter();

  const activeTrack = currentTrack || tracks[0];
  const activeQueue = queue.length > 0 ? queue : tracks;

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
          currentTrack={activeTrack}
          playing={playing}
          queue={activeQueue}
          onPlayTrack={playTrack}
          onRemoveFromQueue={removeFromQueue}
          onClearQueue={clearQueue}
          onReorderQueue={reorderQueue}
          hasPlayer
          showFooter={isExploreRoute}
        >
          <div key={pathname} className="app-route-stage app-route-stage--music">
            <AppRouter />
          </div>
        </MusicAppShell>
      )}

      {/* Global Music Player fixed at bottom - luôn luôn giữ được bật không được tắt */}
      {isMusicRoute && activeTrack && (
        <MusicPlayer
          track={activeTrack}
          queue={activeQueue}
          audio={audio}
          playing={playing}
          onPlayingChange={setAudioPlaying}
          onTrackChange={playTrack}
          onGuestTrackEnded={handleGuestTrackEnded}
          isAuthenticated={isAuthenticated}
          onToggleQueue={toggleQueue}
          isQueueOpen={queueOpen}
          onRecordPlay={handleRecordPlay}
          onReorderQueue={reorderQueue}
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

      {/* Global Top-Center Toast Notifications */}
      {logoutNotice ? (
        <CenterNotificationPopup
          open={Boolean(logoutNotice)}
          type="success"
          message={logoutNotice}
          onClose={() => setLogoutNotice("")}
        />
      ) : null}

      {toastNotice ? (
        <CenterNotificationPopup
          open={Boolean(toastNotice)}
          type="success"
          message={toastNotice}
          onClose={() => showToast("")}
        />
      ) : null}
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
