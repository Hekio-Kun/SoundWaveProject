import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";
import { usePlayer } from "../context/PlayerContext";
import { usePlaylists } from "../context/PlaylistContext";
import { useRouter } from "../hooks/useRouter";
import { initialStudioTracks } from "../data";

import { AlbumDetailsPage } from "../pages/AlbumDetailsPage";
import { AlbumsPage } from "../pages/AlbumsPage";
import { CreateAlbumPage } from "../pages/CreateAlbumPage";
import { ForgotPasswordPage, LoginPage, RegisterPage, ResetPasswordPage } from "../pages/AuthPages";
import { StaffLoginPage } from "../pages/StaffLoginPage";
import { CreatorProfilePage } from "../pages/CreatorProfilePage";
import { ExplorePage } from "../pages/ExplorePage";
import { FilteredCatalogPage } from "../pages/FilteredCatalogPage";
import { GenresPage } from "../pages/GenresPage";
import { LibraryPage } from "../pages/LibraryPage";
import { PlaylistDetailsPage } from "../pages/PlaylistDetailsPage";
import { AdminDashboardPage, DashboardAccessDenied, StaffDashboardPage } from "../pages/OperationsDashboardPage";
import { AdminGenreManagementPage } from "../pages/AdminGenreManagementPage";
import { StaffLyricsManagementPage } from "../pages/StaffLyricsManagementPage";
import { ProfilePage } from "../pages/ProfilePage";
import { RankingBoardPage } from "../pages/RankingBoardPage";
import { StudioAlbumDetailPage } from "../pages/StudioAlbumDetailPage";
import { StudioPage } from "../pages/StudioPage";
import { StudioTrackDetailPage } from "../pages/StudioTrackDetailPage";

import { TrackDetailsPage } from "../pages/TrackDetailsPage";
import { CreateMyTrack } from "../pages/UploadTrackPage";
import { VerifyEmailPage } from "../pages/VerifyEmailPage";
import { SearchPage } from "../pages/SearchPage";
import { SearchIcon } from "../icons";

export function AppRouter(): React.ReactElement | null {
  const { user, authReady, isAuthenticated, handleLoginSuccess, handleProfileUpdated } = useAuth();
  const { currentTrack, playing, playTrack, pause, audio } = usePlayer();
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
  // [FEATURE]: Bảo vệ các tuyến đường Creator Studio (My Tracks / My Albums) - Yêu cầu đăng nhập tài khoản LISTENER
  useEffect(() => {
    if (!authReady) return;
    if (!isAuthenticated) {
      if (
        pathname.startsWith("/studio") ||
        pathname === "/tracks" ||
        pathname === "/track" ||
        pathname.startsWith("/track/submission") ||
        pathname.startsWith("/track/create") ||
        pathname.startsWith("/track/upload") ||
        pathname.startsWith("/track/edit") ||
        pathname === "/album" ||
        pathname.startsWith("/album/submission") ||
        pathname.startsWith("/album/manage") ||
        pathname.startsWith("/album/create") ||
        pathname === "/create-track" ||
        pathname === "/create-album" ||
        pathname === "/albums/create"
      ) {
        window.location.hash = "#/login";
        return;
      }
      if (
        (pathname.startsWith("/staff") && pathname !== "/staff/login" && pathname !== "/staff-login") ||
        pathname.startsWith("/admin")
      ) {
        window.location.hash = "#/staff/login";
        return;
      }
    }
    if (user?.role === "LISTENER") {
      if (
        (pathname.startsWith("/staff") && pathname !== "/staff/login" && pathname !== "/staff-login") ||
        pathname.startsWith("/admin")
      ) {
        window.location.hash = "#/";
        return;
      }
    }
    if (user?.role === "STAFF") {
      if (
        pathname === "/login" ||
        pathname === "/register" ||
        pathname === "/staff/login" ||
        pathname === "/staff-login" ||
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
        pathname === "/staff/login" ||
        pathname === "/staff-login" ||
        pathname.startsWith("/staff")
      ) {
        window.location.hash = "#/admin/dashboard";
      }
    }
  }, [authReady, isAuthenticated, user, pathname]);

  // 1. Marketing / Authentication Routes
  if (pathname === "/staff/login" || pathname === "/staff-login") {
    return <StaffLoginPage onLoginSuccess={handleLoginSuccess} onNavigate={navigate} />;
  }
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
        currentUser={user}
        favoriteIds={favoriteIds}
        onToggleFavorite={toggleFavorite}
        onAddToPlaylist={openAddTrackModal}
      />
    );
  }

  if (pathname === "/browse" || pathname === "/catalog" || pathname === "/filter") {
    const initialGenre = queryParams.get("genre") || undefined;
    const sort = queryParams.get("sort");
    const initialSort =
      sort === "newest"
        ? "newest"
        : sort === "trending"
        ? "trending"
        : sort === "title"
        ? "title"
        : sort === "title_desc"
        ? "title_desc"
        : undefined;
    const initialSearch = queryParams.get("search") || undefined;
    const pageParam = queryParams.get("page");
    const parsedPage = pageParam ? parseInt(pageParam, 10) : 1;
    const initialPage = !isNaN(parsedPage) && parsedPage > 0 ? parsedPage - 1 : 0;
    return (
      <FilteredCatalogPage
        initialPage={initialPage}
        currentTrack={currentTrack}
        playing={playing}
        onPlayTrack={playTrack}
        onNavigate={navigate}
        initialGenre={initialGenre}
        initialSort={initialSort}
        initialSearch={initialSearch}
      />
    );
  }

  if (pathname === "/ranking" || pathname === "/charts" || pathname === "/leaderboard") {
    const initialGenre = queryParams.get("genre") || undefined;
    return (
      <RankingBoardPage
        currentTrack={currentTrack}
        playing={playing}
        onPlayTrack={playTrack}
        onNavigate={navigate}
        initialGenre={initialGenre}
      />
    );
  }

  if (pathname === "/search") {
    const qParam = queryParams.get("q") || queryParams.get("search") || "";
    const typeParam = (queryParams.get("type") as any) || "ALL";
    const pageParam = queryParams.get("page");
    const parsedPage = pageParam ? parseInt(pageParam, 10) : 0;

    return (
      <SearchPage
        initialQuery={qParam}
        initialType={typeParam}
        initialPage={parsedPage}
        user={user}
        currentTrack={currentTrack}
        playing={playing}
        onPlayTrack={playTrack}
        onNavigate={navigate}
      />
    );
  }

  if (pathname === "/genres") {
    return <GenresPage onNavigate={navigate} />;
  }

  if (pathname === "/albums") {
    return (
      <AlbumsPage
        currentTrack={currentTrack}
        playing={playing}
        onPlayTrack={playTrack}
        onNavigate={navigate}
      />
    );
  }

  // [FEATURE]: Định tuyến trang chi tiết bài hát công khai (Public Catalog) cho Listener
  // Loại trừ các tiền tố Creator Studio (/track/submission, /track/create, /track/edit,...) để tránh xung đột
  if (
    (pathname.startsWith("/track/") || pathname.startsWith("/tracks/")) &&
    !pathname.startsWith("/track/submission") &&
    !pathname.startsWith("/track/details") &&
    !pathname.startsWith("/track/manage") &&
    !pathname.startsWith("/track/create") &&
    !pathname.startsWith("/track/upload") &&
    !pathname.startsWith("/track/edit")
  ) {
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

  // [FEATURE]: Định tuyến trang chi tiết album công khai cho Listener (/album/:id)
  // Loại trừ các tuyến đường quản lý album của Creator (/album/submission, /album/create,...)
  if (
    pathname.startsWith("/album/") &&
    !pathname.startsWith("/album/submission") &&
    !pathname.startsWith("/album/manage") &&
    !pathname.startsWith("/album/details") &&
    !pathname.startsWith("/album/create")
  ) {
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
    const tabParam = queryParams.get("tab");
    const initialTab =
      tabParam === "history" || tabParam === "playlists" || tabParam === "favorites"
        ? tabParam
        : pathname === "/favorites"
        ? "favorites"
        : "favorites";

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
        initialTab={initialTab}
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

  if (pathname === "/history") {
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
        initialTab="history"
      />
    );
  }

  // 4. Creator Studio Routes
  // [FEATURE]: Đã loại bỏ luồng chỉnh sửa bài hát - Tự động điều hướng về trang chi tiết hoặc danh sách bài hát
  if (
    (pathname.startsWith("/studio/tracks/") && pathname.endsWith("/edit")) ||
    (pathname.startsWith("/studio/track/") && pathname.endsWith("/edit")) ||
    (pathname.startsWith("/track/submission/") && pathname.endsWith("/edit")) ||
    (pathname.startsWith("/track/details/") && pathname.endsWith("/edit")) ||
    pathname.startsWith("/track/edit/")
  ) {
    if (!authReady || !isAuthenticated) return null;
    const parts = pathname.split("/");
    const trackId =
      parts[2] === "edit"
        ? Number(parts[3]) || null
        : Number(parts[3]) || Number(parts[2]) || null;
    if (trackId) {
      navigate("/track/submission/" + trackId);
    } else {
      navigate("/track");
    }
    return null;
  }

  // [FEATURE]: Trang tải lên bài hát mới (/track/create hoặc /track/upload) sử dụng CreateMyTrack component
  if (
    pathname === "/track/create" ||
    pathname === "/track/upload" ||
    pathname === "/studio/tracks" ||
    pathname === "/studio/upload" ||
    pathname === "/create-track"
  ) {
    if (!authReady || !isAuthenticated) return null;
    return (
      <CreateMyTrack
        isAuthenticated={isAuthenticated}
        canUpload={user?.role === "LISTENER"}
        onNavigate={navigate}
      />
    );
  }

  // [FEATURE]: Trang chi tiết bài hát nộp duyệt của Creator (/track/submission/:id)
  // Hiển thị trạng thái kiểm duyệt (Approved, Pending, Rejected, Draft), lý do từ chối, nút sửa/xóa
  if (
    pathname.startsWith("/track/submission/") ||
    pathname.startsWith("/track/submissions/") ||
    pathname.startsWith("/track/details/") ||
    pathname.startsWith("/studio/tracks/") ||
    pathname.startsWith("/studio/track/")
  ) {
    if (!authReady || !isAuthenticated) return null;
    const parts = pathname.split("/");
    const trackId =
      pathname.startsWith("/track/submission/") || pathname.startsWith("/track/submissions/") || pathname.startsWith("/track/details/")
        ? Number(parts[3]) || null
        : Number(parts[3]) || Number(parts[2]) || null;
    if (!trackId) {
      navigate("/track");
      return null;
    }
    return (
      <StudioTrackDetailPage
        trackId={trackId}
        currentUser={user}
        onNavigate={navigate}
        currentTrack={currentTrack}
        playing={playing}
        onPlayTrack={playTrack}
        audio={audio}
      />
    );
  }

  // [FEATURE]: Trang tạo Album mới của Creator (/album/create)
  if (
    pathname === "/album/create" ||
    pathname === "/create-album" ||
    pathname === "/albums/create" ||
    pathname === "/studio/albums/create"
  ) {
    if (!authReady || !isAuthenticated) return null;
    return (
      <CreateAlbumPage
        isAuthenticated={isAuthenticated}
        canCreate={user?.role === "LISTENER"}
        currentUser={user}
        onNavigate={navigate}
      />
    );
  }

  // [FEATURE]: Trang quản lý chi tiết album của Creator (/album/submission/:id)
  if (
    pathname.startsWith("/album/submission/") ||
    pathname.startsWith("/album/manage/") ||
    pathname.startsWith("/album/details/") ||
    pathname.startsWith("/studio/albums/")
  ) {
    if (!authReady || !isAuthenticated) return null;
    const parts = pathname.split("/");
    const albumId = Number(parts[3]) || null;
    if (!albumId) {
      navigate("/album");
      return null;
    }
    return (
      <StudioAlbumDetailPage
        albumId={albumId}
        currentUser={user}
        onNavigate={navigate}
        currentTrack={currentTrack}
        playing={playing}
        onPlayTrack={playTrack}
      />
    );
  }

  // [FEATURE]: Trang danh sách bài hát của Creator - My Tracks (/track hoặc /tracks)
  if (pathname === "/track" || pathname === "/tracks" || pathname === "/studio") {
    if (!authReady || !isAuthenticated) return null;
    return <StudioPage tracks={initialStudioTracks} onNavigate={navigate} initialTab="TRACKS" />;
  }

  // [FEATURE]: Trang danh sách album của Creator - My Albums (/album)
  if (pathname === "/album" || pathname === "/studio/albums") {
    if (!authReady || !isAuthenticated) return null;
    return <StudioPage tracks={initialStudioTracks} onNavigate={navigate} initialTab="ALBUMS" />;
  }


  if (pathname === "/staff/lyrics" || pathname === "/admin/lyrics") {
    return user?.role === "STAFF" || user?.role === "ADMIN" ? (
      <StaffLyricsManagementPage />
    ) : (
      <DashboardAccessDenied onNavigate={navigate} requiredRole="Moderation Staff" />
    );
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
    return user?.role === "STAFF" ? (
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
