import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";
import { usePlayer } from "../context/PlayerContext";
import { usePlaylists } from "../context/PlaylistContext";
import { useRouter } from "../hooks/useRouter";
import { initialStudioTracks } from "../data";

import { AlbumDetailsPage } from "../pages/AlbumDetailsPage";
import { ForgotPasswordPage, LoginPage, RegisterPage, ResetPasswordPage } from "../pages/AuthPages";
import { CreatorProfilePage } from "../pages/CreatorProfilePage";
import { ExplorePage } from "../pages/ExplorePage";
import { FilteredCatalogPage } from "../pages/FilteredCatalogPage";
import { GenresPage } from "../pages/GenresPage";
import { LibraryPage } from "../pages/LibraryPage";
import { PlaylistDetailsPage } from "../pages/PlaylistDetailsPage";
import { AdminDashboardPage, DashboardAccessDenied, StaffDashboardPage } from "../pages/OperationsDashboardPage";
import { AdminGenreManagementPage } from "../pages/AdminGenreManagementPage";
import { ProfilePage } from "../pages/ProfilePage";
import { SearchPage } from "../pages/SearchPage";
import { StudioPage } from "../pages/StudioPage";
import { StudioTrackDetailPage } from "../pages/StudioTrackDetailPage";
import { TrackDetailsPage } from "../pages/TrackDetailsPage";
import { UploadTrackPage } from "../pages/UploadTrackPage";
import { VerifyEmailPage } from "../pages/VerifyEmailPage";

export function AppRouter(): React.ReactElement | null {
  const { user, authReady, isAuthenticated, handleLoginSuccess, handleProfileUpdated } = useAuth();
  const { currentTrack, playing, playTrack, pause } = usePlayer();
  const { favoriteTracks, favoriteIds, toggleFavorite } = useFavorites();
  const {
    playlists,
    openCreatePlaylist,
    openEditPlaylist,
    openDeletePlaylist,
    openAddTrackModal,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    reorderPlaylistTracks,
    playAllPlaylistTracks,
  } = usePlaylists();
  const { pathname, queryParams, navigate, isDashboardRoute, isExploreRoute } = useRouter();

  // Tắt nhạc khi điều hướng vào trang quản trị (Admin / Staff)
  useEffect(() => {
    if (isDashboardRoute) {
      pause();
    }
  }, [isDashboardRoute, pause]);

  // Điều hướng và bảo vệ tuyến đường theo Role
  useEffect(() => {
    if (!authReady) return;
    if (!isAuthenticated && pathname.startsWith("/studio")) {
      window.location.hash = "#/login";
      return;
    }
    if (user?.role === "STAFF") {
      if (
        pathname === "/login" ||
        pathname === "/register" ||
        pathname === "/" ||
        pathname === "" ||
        pathname.startsWith("/admin")
      ) {
        window.location.hash = "#/staff/dashboard";
      }
    } else if (user?.role === "ADMIN") {
      if (
        pathname === "/login" ||
        pathname === "/register" ||
        pathname.startsWith("/staff")
      ) {
        window.location.hash = "#/admin/dashboard";
      }
    }
  }, [authReady, isAuthenticated, user, pathname]);

  // 1. Marketing / Authentication Routes
  if (pathname === "/login") {
    return <LoginPage onLoginSuccess={handleLoginSuccess} onNavigate={navigate} />;
  }
  if (pathname === "/register") {
    return <RegisterPage onNavigate={navigate} />;
  }
  if (pathname === "/verify-email") {
    return (
      <VerifyEmailPage
        email={queryParams.get("email") || "you@example.com"}
        onNavigate={navigate}
      />
    );
  }
  if (pathname === "/forgot-password") {
    return <ForgotPasswordPage onNavigate={navigate} />;
  }
  if (pathname === "/reset-password") {
    return <ResetPasswordPage email={queryParams.get("email") || ""} onNavigate={navigate} />;
  }

  // 2. Discover & Catalog Routes
  if (isExploreRoute) {
    return (
      <ExplorePage
        currentTrack={currentTrack}
        playing={playing}
        onPlayTrack={playTrack}
        onNavigate={navigate}
      />
    );
  }

  if (pathname === "/browse" || pathname === "/catalog" || pathname === "/filter") {
    const initialGenre = queryParams.get("genre") || undefined;
    const sort = queryParams.get("sort");
    const initialSort =
      sort === "newest" ? "newest" : sort === "trending" ? "trending" : sort === "title" ? "title" : undefined;
    return (
      <FilteredCatalogPage
        currentTrack={currentTrack}
        playing={playing}
        onPlayTrack={playTrack}
        onNavigate={navigate}
        initialGenre={initialGenre}
        initialSort={initialSort}
      />
    );
  }

  if (pathname === "/search") {
    const query = queryParams.get("q") || "";
    return (
      <SearchPage
        currentTrack={currentTrack}
        playing={playing}
        onPlayTrack={playTrack}
        onNavigate={navigate}
        initialQuery={query}
      />
    );
  }

  if (pathname === "/genres") {
    return <GenresPage onNavigate={navigate} />;
  }

  if (pathname.startsWith("/track/") || pathname.startsWith("/tracks/")) {
    const parsedId = Number(pathname.split("/")[2]);
    const trackId = Number.isFinite(parsedId) && parsedId > 0 ? parsedId : 1;
    return (
      <TrackDetailsPage
        trackId={trackId}
        currentTrack={currentTrack}
        playing={playing}
        onPlayTrack={playTrack}
        onNavigate={navigate}
        onToggleFavorite={toggleFavorite}
        isFavorited={favoriteIds.includes(trackId)}
        playlists={playlists}
        onAddToPlaylist={addTrackToPlaylist}
        canManageLibrary={user?.role === "LISTENER"}
      />
    );
  }

  if (pathname.startsWith("/album/")) {
    const albumId = Number(pathname.split("/")[2]) || 1;
    return (
      <AlbumDetailsPage
        albumId={albumId}
        currentTrack={currentTrack}
        playing={playing}
        onPlayTrack={playTrack}
        onNavigate={navigate}
      />
    );
  }

  if (pathname.startsWith("/creator/")) {
    const creatorId = Number(pathname.split("/")[2]) || 101;
    return (
      <CreatorProfilePage
        creatorId={creatorId}
        currentTrack={currentTrack}
        playing={playing}
        onPlayTrack={playTrack}
        onNavigate={navigate}
      />
    );
  }

  // 3. User & Library Routes
  if (pathname === "/profile") {
    return user ? (
      <ProfilePage onProfileUpdated={handleProfileUpdated} />
    ) : (
      <div className="state-page">
        <span className="state-icon">!</span>
        <h1>Log in to manage your profile</h1>
        <p>Your profile settings are available after authentication.</p>
        <button className="button button-primary" onClick={() => navigate("/login")}>
          Go to login
        </button>
      </div>
    );
  }

  if (pathname.startsWith("/playlist/")) {
    const playlistId = Number(pathname.split("/")[2]) || 1;
    return (
      <PlaylistDetailsPage
        playlistId={playlistId}
        playlists={playlists}
        currentTrack={currentTrack}
        playing={playing}
        onPlayTrack={playTrack}
        onPlayAll={playAllPlaylistTracks}
        onNavigate={navigate}
        onEditPlaylist={openEditPlaylist}
        onDeletePlaylist={openDeletePlaylist}
        onRemoveTrack={removeTrackFromPlaylist}
        onReorderTracks={reorderPlaylistTracks}
        onOpenAddTrackModal={() => openAddTrackModal(playlistId)}
        currentUser={user}
      />
    );
  }

  if (pathname === "/library" || pathname === "/favorites") {
    return (
      <LibraryPage
        currentTrack={currentTrack}
        playing={playing}
        onPlayTrack={playTrack}
        onNavigate={navigate}
        favoriteTracks={favoriteTracks}
        onToggleFavorite={toggleFavorite}
        playlists={playlists}
        onCreatePlaylist={openCreatePlaylist}
        onEditPlaylist={openEditPlaylist}
        onDeletePlaylist={openDeletePlaylist}
        initialTab="favorites"
      />
    );
  }

  if (pathname === "/playlists") {
    return (
      <LibraryPage
        currentTrack={currentTrack}
        playing={playing}
        onPlayTrack={playTrack}
        onNavigate={navigate}
        favoriteTracks={favoriteTracks}
        onToggleFavorite={toggleFavorite}
        playlists={playlists}
        onCreatePlaylist={openCreatePlaylist}
        onEditPlaylist={openEditPlaylist}
        onDeletePlaylist={openDeletePlaylist}
        initialTab="playlists"
      />
    );
  }

  // 4. Creator Studio Routes
  if (pathname === "/studio/upload") {
    if (!authReady || !isAuthenticated) return null;
    return (
      <UploadTrackPage
        isAuthenticated={isAuthenticated}
        canUpload={user?.role === "LISTENER"}
        onNavigate={navigate}
      />
    );
  }

  if (pathname.startsWith("/studio/tracks/") || pathname.startsWith("/studio/track/")) {
    if (!authReady || !isAuthenticated) return null;
    const parts = pathname.split("/");
    const trackId = Number(parts[3]) || Number(parts[2]) || null;
    if (!trackId) {
      navigate("/studio");
      return null;
    }
    return (
      <StudioTrackDetailPage
        trackId={trackId}
        currentUser={user}
        onNavigate={navigate}
      />
    );
  }

  if (pathname === "/studio") {
    if (!authReady || !isAuthenticated) return null;
    return <StudioPage tracks={initialStudioTracks} onNavigate={navigate} />;
  }

  // 5. Operations & Administration Routes
  if (pathname === "/admin/genres") {
    return user?.role === "ADMIN" ? (
      <AdminGenreManagementPage />
    ) : (
      <DashboardAccessDenied onNavigate={navigate} requiredRole="Administrator" />
    );
  }

  if (pathname === "/admin" || pathname === "/admin/dashboard") {
    return user?.role === "ADMIN" ? (
      <AdminDashboardPage onNavigate={navigate} />
    ) : (
      <DashboardAccessDenied onNavigate={navigate} requiredRole="Administrator" />
    );
  }

  if (
    pathname === "/staff" ||
    pathname === "/staff/dashboard" ||
    pathname.startsWith("/staff/submissions/") ||
    pathname.startsWith("/staff/moderation/")
  ) {
    const parts = pathname.split("/");
    const submissionId =
      pathname.startsWith("/staff/submissions/") || pathname.startsWith("/staff/moderation/")
        ? Number(parts[3]) || null
        : null;
    return user?.role === "STAFF" || user?.role === "ADMIN" ? (
      <StaffDashboardPage onNavigate={navigate} initialSubmissionId={submissionId} />
    ) : (
      <DashboardAccessDenied onNavigate={navigate} requiredRole="Moderation Staff" />
    );
  }

  // Default fallback to Explore
  return (
    <ExplorePage
      currentTrack={currentTrack}
      playing={playing}
      onPlayTrack={playTrack}
      onNavigate={navigate}
    />
  );
}
