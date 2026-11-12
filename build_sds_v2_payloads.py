# -*- coding: utf-8 -*-
"""
Generates standardized Spring Data JPA Repository Methods & Hibernate Generated SQL
for all 64 Use Case sections in SDS (Section II: Code Designs).
"""

import json

PAYLOADS = {}

# Package 1: Authentication & Account
PAYLOADS["1.1 Login"] = """1. Find account by email
- JPA Repository Method:
  Optional<User> findByEmailIgnoreCaseAndDeletedAtIsNull(String email);
- Generated SQL (executed by Hibernate):
  SELECT u.user_id, u.email, u.password_hash, u.status, u.locked_until, u.email_verified_at, u.deleted_at
  FROM users u
  WHERE LOWER(u.email) = LOWER(?) AND u.deleted_at IS NULL;

2. Update login timestamp and reset failed counter
- JPA Entity State Transition:
  user.setLastLoginAt(LocalDateTime.now());
  user.setFailedLoginAttempts(0);
  userRepository.save(user);
- Generated SQL (executed by Hibernate):
  UPDATE users
  SET last_login_at = SYSUTCDATETIME(), failed_login_attempts = 0, updated_at = SYSUTCDATETIME()
  WHERE user_id = ?;

3. Store refresh token
- JPA Entity Operation:
  refreshTokenRepository.save(refreshToken);
- Generated SQL (executed by Hibernate):
  INSERT INTO refresh_tokens (user_id, token_hash, expires_at, created_at)
  VALUES (?, ?, ?, SYSUTCDATETIME());"""

PAYLOADS["1.2 Register"] = """1. Check email uniqueness
- JPA Repository Method:
  boolean existsByEmailIgnoreCaseAndDeletedAtIsNull(String email);
- Generated SQL (executed by Hibernate):
  SELECT COUNT(u.user_id) FROM users u WHERE LOWER(u.email) = LOWER(?) AND u.deleted_at IS NULL;

2. Check username uniqueness
- JPA Repository Method:
  boolean existsByUsernameIgnoreCase(String username);
- Generated SQL (executed by Hibernate):
  SELECT COUNT(up.user_id) FROM user_profiles up WHERE LOWER(up.username) = LOWER(?);

3. Persist new user account
- JPA Entity Operation:
  userRepository.save(newUser);
- Generated SQL (executed by Hibernate):
  INSERT INTO users (email, password_hash, status, created_at, updated_at)
  VALUES (LOWER(?), ?, 'PENDING_VERIFICATION', SYSUTCDATETIME(), SYSUTCDATETIME());

4. Create initial user profile
- JPA Entity Operation:
  userProfileRepository.save(userProfile);
- Generated SQL (executed by Hibernate):
  INSERT INTO user_profiles (user_id, username, display_name, created_at, updated_at)
  VALUES (?, ?, ?, SYSUTCDATETIME(), SYSUTCDATETIME());

5. Store email verification OTP token
- JPA Entity Operation:
  emailVerificationTokenRepository.save(token);
- Generated SQL (executed by Hibernate):
  INSERT INTO email_verification_tokens (user_id, token_hash, expires_at, created_at)
  VALUES (?, ?, ?, SYSUTCDATETIME());"""

PAYLOADS["1.3 Verify email"] = """1. Retrieve user account by email
- JPA Repository Method:
  Optional<User> findByEmailIgnoreCaseAndDeletedAtIsNull(String email);
- Generated SQL (executed by Hibernate):
  SELECT u.user_id, u.email, u.status, u.email_verified_at, u.deleted_at
  FROM users u WHERE LOWER(u.email) = LOWER(?) AND u.deleted_at IS NULL;

2. Retrieve latest active verification token
- JPA Repository Method:
  Optional<EmailVerificationToken> findByUser_UserIdAndTokenHashAndUsedAtIsNull(Long userId, String tokenHash);
- Generated SQL (executed by Hibernate):
  SELECT evt.verification_token_id, evt.user_id, evt.token_hash, evt.expires_at, evt.used_at, evt.created_at
  FROM email_verification_tokens evt
  WHERE evt.user_id = ? AND evt.token_hash = ? AND evt.used_at IS NULL;

3. Mark token as used and activate account
- JPA Entity State Transition:
  token.setUsedAt(LocalDateTime.now());
  emailVerificationTokenRepository.save(token);
  user.setStatus(UserStatus.ACTIVE);
  user.setEmailVerifiedAt(LocalDateTime.now());
  userRepository.save(user);
- Generated SQL (executed by Hibernate):
  UPDATE email_verification_tokens SET used_at = SYSUTCDATETIME() WHERE verification_token_id = ?;
  UPDATE users SET email_verified_at = SYSUTCDATETIME(), status = 'ACTIVE', updated_at = SYSUTCDATETIME() WHERE user_id = ?;"""

PAYLOADS["1.4 Forget and reset password"] = """1. Retrieve account by email for password reset
- JPA Repository Method:
  Optional<User> findByEmailIgnoreCaseAndDeletedAtIsNull(String email);
- Generated SQL (executed by Hibernate):
  SELECT u.user_id, u.email, u.status, u.locked_until, u.deleted_at
  FROM users u WHERE LOWER(u.email) = LOWER(?) AND u.deleted_at IS NULL;

2. Store password reset OTP token
- JPA Entity Operation:
  passwordResetTokenRepository.save(token);
- Generated SQL (executed by Hibernate):
  INSERT INTO password_reset_tokens (user_id, token_hash, expires_at, created_at)
  VALUES (?, ?, ?, SYSUTCDATETIME());

3. Validate password reset token
- JPA Repository Method:
  Optional<PasswordResetToken> findByUser_UserIdAndTokenHashAndUsedAtIsNull(Long userId, String tokenHash);
- Generated SQL (executed by Hibernate):
  SELECT prt.reset_token_id, prt.user_id, prt.token_hash, prt.expires_at, prt.used_at
  FROM password_reset_tokens prt
  WHERE prt.user_id = ? AND prt.token_hash = ? AND prt.used_at IS NULL;

4. Update password and invalidate token
- JPA Entity State Transition:
  user.setPasswordHash(newPasswordHash);
  userRepository.save(user);
  prt.setUsedAt(LocalDateTime.now());
  passwordResetTokenRepository.save(prt);
- Generated SQL (executed by Hibernate):
  UPDATE users SET password_hash = ?, updated_at = SYSUTCDATETIME() WHERE user_id = ?;
  UPDATE password_reset_tokens SET used_at = SYSUTCDATETIME() WHERE reset_token_id = ?;"""

PAYLOADS["1.5 Logout"] = """1. Validate and retrieve active refresh token
- JPA Repository Method:
  Optional<RefreshToken> findByTokenHashAndRevokedAtIsNull(String tokenHash);
- Generated SQL (executed by Hibernate):
  SELECT rt.refresh_token_id, rt.user_id, rt.staff_id, rt.token_hash, rt.expires_at, rt.revoked_at
  FROM refresh_tokens rt
  WHERE rt.token_hash = ? AND rt.revoked_at IS NULL;

2. Revoke refresh token session
- JPA Entity State Transition:
  refreshToken.setRevokedAt(LocalDateTime.now());
  refreshTokenRepository.save(refreshToken);
- Generated SQL (executed by Hibernate):
  UPDATE refresh_tokens SET revoked_at = SYSUTCDATETIME() WHERE refresh_token_id = ?;"""

# Package 2: Discovery & Public Catalog
PAYLOADS["2.1 View Recommended Song"] = """1. Retrieve personalized / curated recommendation track pool
- JPA Repository Method:
  @Query("SELECT t FROM Track t JOIN FETCH t.uploader u JOIN FETCH t.genre g WHERE t.publicationStatus = 'PUBLISHED' AND g.isActive = true ORDER BY t.playCount DESC")
  List<Track> findRecommendedTracks(Pageable pageable);
- Generated SQL (executed by Hibernate):
  SELECT TOP (?) t.track_id, t.title, t.duration_ms, t.play_count, t.cover_image_url, t.audio_url,
         u.user_id, up.display_name, g.genre_id, g.name AS genre_name
  FROM tracks t
  INNER JOIN users u ON u.user_id = t.uploader_user_id
  LEFT JOIN user_profiles up ON up.user_id = u.user_id
  INNER JOIN genres g ON g.genre_id = t.genre_id
  WHERE t.publication_status = 'PUBLISHED' AND g.is_active = 1
  ORDER BY t.play_count DESC;"""

PAYLOADS["2.2 View Ranking Board"] = """1. Query Top Charts leaderboard across genres
- JPA Repository Method:
  @Query("SELECT t FROM Track t JOIN FETCH t.uploader u JOIN FETCH t.genre g WHERE t.publicationStatus = 'PUBLISHED' AND g.isActive = true ORDER BY t.playCount DESC")
  List<Track> findTopChartTracks(Pageable pageable);
- Generated SQL (executed by Hibernate):
  SELECT TOP (?) t.track_id, t.title, t.duration_ms, t.play_count, t.cover_image_url,
         up.display_name AS artist_name, g.genre_id, g.name AS genre_name
  FROM tracks t
  INNER JOIN users u ON u.user_id = t.uploader_user_id
  LEFT JOIN user_profiles up ON up.user_id = u.user_id
  INNER JOIN genres g ON g.genre_id = t.genre_id
  WHERE t.publication_status = 'PUBLISHED' AND g.is_active = 1
  ORDER BY t.play_count DESC;"""

PAYLOADS["2.3 Filter Public Catalog"] = """1. Query active genres for filter toolbar
- JPA Repository Method:
  List<Genre> findByIsActiveTrueOrderByDisplayOrderAsc();
- Generated SQL (executed by Hibernate):
  SELECT g.genre_id, g.name, g.slug, g.icon_url, g.display_order
  FROM genres g WHERE g.is_active = 1 ORDER BY g.display_order ASC;

2. Filter tracks by genre and sort order
- JPA Repository Method:
  Page<Track> findByGenre_GenreIdAndPublicationStatus(Long genreId, PublicationStatus status, Pageable pageable);
- Generated SQL (executed by Hibernate):
  SELECT t.track_id, t.title, t.duration_ms, t.play_count, t.created_at, up.display_name
  FROM tracks t
  INNER JOIN users u ON u.user_id = t.uploader_user_id
  LEFT JOIN user_profiles up ON up.user_id = u.user_id
  WHERE t.genre_id = ? AND t.publication_status = 'PUBLISHED'
  ORDER BY t.created_at DESC OFFSET ? ROWS FETCH NEXT ? ROWS ONLY;"""

PAYLOADS["2.4 Search Public Catalog"] = """1. Multi-entity search across tracks, artists, and albums
- JPA Repository Method:
  @Query("SELECT t FROM Track t JOIN FETCH t.uploader u WHERE t.publicationStatus = 'PUBLISHED' AND LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%'))")
  Page<Track> searchPublishedTracks(@Param("keyword") String keyword, Pageable pageable);
- Generated SQL (executed by Hibernate):
  SELECT t.track_id, t.title, t.duration_ms, t.play_count, t.cover_image_url, up.display_name AS artist_name
  FROM tracks t
  INNER JOIN users u ON u.user_id = t.uploader_user_id
  LEFT JOIN user_profiles up ON up.user_id = u.user_id
  WHERE t.publication_status = 'PUBLISHED' AND LOWER(t.title) LIKE LOWER(?)
  ORDER BY t.play_count DESC OFFSET ? ROWS FETCH NEXT ? ROWS ONLY;

2. Search creators / artists
- JPA Repository Method:
  @Query("SELECT up FROM UserProfile up JOIN up.user u WHERE u.deletedAt IS NULL AND LOWER(up.displayName) LIKE LOWER(CONCAT('%', :keyword, '%'))")
  List<UserProfile> searchArtists(@Param("keyword") String keyword, Pageable pageable);
- Generated SQL (executed by Hibernate):
  SELECT up.user_id, up.username, up.display_name, up.avatar_url
  FROM user_profiles up
  INNER JOIN users u ON u.user_id = up.user_id
  WHERE u.deleted_at IS NULL AND LOWER(up.display_name) LIKE LOWER(?)
  ORDER BY up.display_name ASC;"""

# Package 3: Music Playback & Player
PAYLOADS["3.1 Play Music"] = """1. Retrieve published track audio stream and metadata
- JPA Repository Method:
  Optional<Track> findByTrackIdAndPublicationStatus(Long trackId, PublicationStatus status);
- Generated SQL (executed by Hibernate):
  SELECT t.track_id, t.title, t.audio_url, t.duration_ms, t.cover_image_url, t.uploader_user_id,
         up.display_name AS artist_name, g.genre_id, g.name AS genre_name
  FROM tracks t
  INNER JOIN users u ON u.user_id = t.uploader_user_id
  LEFT JOIN user_profiles up ON up.user_id = u.user_id
  INNER JOIN genres g ON g.genre_id = t.genre_id
  WHERE t.track_id = ? AND t.publication_status = 'PUBLISHED';

2. Record listening history
- JPA Entity Operation:
  listeningHistoryRepository.save(history);
- Generated SQL (executed by Hibernate):
  INSERT INTO listening_history (user_id, track_id, duration_listened_ms, listened_at)
  VALUES (?, ?, ?, SYSUTCDATETIME());

3. Increment play count atomically
- JPA Repository Method:
  @Modifying @Query("UPDATE Track t SET t.playCount = t.playCount + 1 WHERE t.trackId = :trackId")
  void incrementPlayCount(@Param("trackId") Long trackId);
- Generated SQL (executed by Hibernate):
  UPDATE tracks SET play_count = play_count + 1 WHERE track_id = ?;"""

PAYLOADS["3.2 Control Playback"] = """1. Batch load upcoming track queue metadata
- JPA Repository Method:
  List<Track> findByTrackIdInAndPublicationStatus(List<Long> trackIds, PublicationStatus status);
- Generated SQL (executed by Hibernate):
  SELECT t.track_id, t.title, t.duration_ms, t.audio_url, t.cover_image_url, up.display_name AS artist_name
  FROM tracks t
  INNER JOIN users u ON u.user_id = t.uploader_user_id
  LEFT JOIN user_profiles up ON up.user_id = u.user_id
  WHERE t.track_id IN (?, ?, ?) AND t.publication_status = 'PUBLISHED';"""

# Package 4: User Profile
PAYLOADS["4.1 View profile"] = """1. Retrieve user profile and account details
- JPA Repository Method:
  Optional<UserProfile> findByUser_UserId(Long userId);
- Generated SQL (executed by Hibernate):
  SELECT p.user_id, p.username, p.display_name, p.bio, p.avatar_url, p.date_of_birth, p.country_code,
         u.email, u.status, u.created_at
  FROM user_profiles p
  INNER JOIN users u ON p.user_id = u.user_id
  WHERE u.user_id = ? AND u.deleted_at IS NULL;

2. Count published tracks and playlists created by user
- JPA Repository Method:
  long countByUploader_UserIdAndPublicationStatus(Long userId, PublicationStatus status);
  long countByOwner_UserIdAndDeletedAtIsNull(Long userId);
- Generated SQL (executed by Hibernate):
  SELECT COUNT(t.track_id) FROM tracks t WHERE t.uploader_user_id = ? AND t.publication_status = 'PUBLISHED';
  SELECT COUNT(pl.playlist_id) FROM playlists pl WHERE pl.owner_user_id = ? AND pl.deleted_at IS NULL;"""

PAYLOADS["4.2 Update profile"] = """1. Verify unique username for profile update
- JPA Repository Method:
  boolean existsByUsernameIgnoreCaseAndUser_UserIdNot(String username, Long userId);
- Generated SQL (executed by Hibernate):
  SELECT COUNT(p.user_id) FROM user_profiles p WHERE LOWER(p.username) = LOWER(?) AND p.user_id != ?;

2. Update user profile information
- JPA Entity State Transition:
  profile.setDisplayName(newDisplayName);
  profile.setBio(newBio);
  profile.setAvatarUrl(newAvatarUrl);
  userProfileRepository.save(profile);
- Generated SQL (executed by Hibernate):
  UPDATE user_profiles
  SET display_name = ?, bio = ?, avatar_url = ?, date_of_birth = ?, country_code = ?, updated_at = SYSUTCDATETIME()
  WHERE user_id = ?;"""

# Package 5: Listening History
PAYLOADS["5.1 View Listening History"] = """1. Retrieve paginated user listening history
- JPA Repository Method:
  @Query("SELECT lh FROM ListeningHistory lh JOIN FETCH lh.track t JOIN FETCH t.uploader u WHERE lh.user.userId = :userId ORDER BY lh.listenedAt DESC")
  Page<ListeningHistory> findByUser_UserIdOrderByListenedAtDesc(@Param("userId") Long userId, Pageable pageable);
- Generated SQL (executed by Hibernate):
  SELECT lh.history_id, lh.user_id, lh.duration_listened_ms, lh.listened_at,
         t.track_id, t.title, t.duration_ms, t.cover_image_url, up.display_name AS artist_name
  FROM listening_history lh
  INNER JOIN tracks t ON t.track_id = lh.track_id
  INNER JOIN users u ON u.user_id = t.uploader_user_id
  LEFT JOIN user_profiles up ON up.user_id = u.user_id
  WHERE lh.user_id = ?
  ORDER BY lh.listened_at DESC OFFSET ? ROWS FETCH NEXT ? ROWS ONLY;

2. Clear user listening history
- JPA Repository Method:
  @Modifying @Query("DELETE FROM ListeningHistory lh WHERE lh.user.userId = :userId")
  void deleteByUser_UserId(@Param("userId") Long userId);
- Generated SQL (executed by Hibernate):
  DELETE FROM listening_history WHERE user_id = ?;"""

# Package 6: Favorites
PAYLOADS["6.1  Add Track To Favorites"] = """1. Check if track is already in favorites
- JPA Repository Method:
  boolean existsById(FavoriteId id);
- Generated SQL (executed by Hibernate):
  SELECT COUNT(f.track_id) FROM favorites f WHERE f.user_id = ? AND f.track_id = ?;

2. Add track to favorites
- JPA Entity Operation:
  favoriteRepository.save(new Favorite(user, track));
- Generated SQL (executed by Hibernate):
  INSERT INTO favorites (user_id, track_id, created_at)
  VALUES (?, ?, SYSUTCDATETIME());"""

PAYLOADS["6.2  View Favorite Track List"] = """1. Retrieve paginated favorite tracks of user
- JPA Repository Method:
  @Query("SELECT f.track FROM Favorite f WHERE f.user.userId = :userId AND f.track.publicationStatus = 'PUBLISHED' ORDER BY f.createdAt DESC")
  Page<Track> findFavoriteTracksByUser(@Param("userId") Long userId, Pageable pageable);
- Generated SQL (executed by Hibernate):
  SELECT t.track_id, t.title, t.duration_ms, t.cover_image_url, up.display_name AS artist_name, f.created_at
  FROM favorites f
  INNER JOIN tracks t ON t.track_id = f.track_id
  INNER JOIN users u ON u.user_id = t.uploader_user_id
  LEFT JOIN user_profiles up ON up.user_id = u.user_id
  WHERE f.user_id = ? AND t.publication_status = 'PUBLISHED'
  ORDER BY f.created_at DESC OFFSET ? ROWS FETCH NEXT ? ROWS ONLY;"""

PAYLOADS["6.3  Delete Track From Favorite List"] = """1. Remove track from user favorites
- JPA Repository Method:
  void deleteById(FavoriteId id);
- Generated SQL (executed by Hibernate):
  DELETE FROM favorites WHERE user_id = ? AND track_id = ?;"""

# Package 7: Playlists
PAYLOADS["7.1  Create A Playlist"] = """1. Create new custom playlist
- JPA Entity Operation:
  playlistRepository.save(playlist);
- Generated SQL (executed by Hibernate):
  INSERT INTO playlists (owner_user_id, title, description, cover_image_url, is_public, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, SYSUTCDATETIME(), SYSUTCDATETIME());"""

PAYLOADS["7.2  View My Playlists"] = """1. Retrieve all playlists owned by user
- JPA Repository Method:
  List<Playlist> findByOwner_UserIdAndDeletedAtIsNullOrderByCreatedAtDesc(Long userId);
- Generated SQL (executed by Hibernate):
  SELECT pl.playlist_id, pl.title, pl.description, pl.cover_image_url, pl.is_public, pl.created_at,
         (SELECT COUNT(pt.track_id) FROM playlist_tracks pt WHERE pt.playlist_id = pl.playlist_id) AS total_tracks
  FROM playlists pl
  WHERE pl.owner_user_id = ? AND pl.deleted_at IS NULL
  ORDER BY pl.created_at DESC;"""

PAYLOADS["7.3  Update My Playlist"] = """1. Update playlist metadata
- JPA Entity State Transition:
  playlist.setTitle(newTitle);
  playlist.setDescription(newDesc);
  playlistRepository.save(playlist);
- Generated SQL (executed by Hibernate):
  UPDATE playlists
  SET title = ?, description = ?, is_public = ?, updated_at = SYSUTCDATETIME()
  WHERE playlist_id = ? AND owner_user_id = ?;

2. Add track to playlist
- JPA Entity Operation:
  playlistTrackRepository.save(new PlaylistTrack(playlistId, trackId, sortOrder));
- Generated SQL (executed by Hibernate):
  INSERT INTO playlist_tracks (playlist_id, track_id, sort_order, added_at)
  VALUES (?, ?, ?, SYSUTCDATETIME());

3. Remove track from playlist
- JPA Repository Method:
  void deleteById(PlaylistTrackId id);
- Generated SQL (executed by Hibernate):
  DELETE FROM playlist_tracks WHERE playlist_id = ? AND track_id = ?;"""

PAYLOADS["7.3  Delete A Playlist"] = """1. Soft-delete user playlist
- JPA Entity State Transition:
  playlist.setDeletedAt(LocalDateTime.now());
  playlistRepository.save(playlist);
- Generated SQL (executed by Hibernate):
  UPDATE playlists SET deleted_at = SYSUTCDATETIME(), updated_at = SYSUTCDATETIME()
  WHERE playlist_id = ? AND owner_user_id = ?;"""

# Package 8: Lyrics
PAYLOADS["8.1  View Synchronous Lyric"] = """1. Retrieve official synchronized lyrics of published track
- JPA Repository Method:
  Optional<OfficialLyric> findByTrack_TrackId(Long trackId);
- Generated SQL (executed by Hibernate):
  SELECT ol.official_lyric_id, ol.track_id, ol.lyric_content, ol.is_synced, ol.created_at, ol.updated_at
  FROM official_lyrics ol
  INNER JOIN tracks t ON t.track_id = ol.track_id
  WHERE ol.track_id = ? AND t.publication_status = 'PUBLISHED';"""

PAYLOADS["8.2  Update Synchronous Lyric"] = """1. Upsert official synchronized lyric for track
- JPA Entity Operation:
  officialLyricRepository.save(officialLyric);
- Generated SQL (executed by Hibernate):
  UPDATE official_lyrics
  SET lyric_content = ?, is_synced = ?, updated_at = SYSUTCDATETIME()
  WHERE official_lyric_id = ?;"""

PAYLOADS["8.3 Create custom Lyric"] = """1. Save listener personal custom lyric
- JPA Entity Operation:
  personalLyricRepository.save(personalLyric);
- Generated SQL (executed by Hibernate):
  INSERT INTO personal_lyrics (user_id, track_id, language_code, lyric_content, created_at, updated_at)
  VALUES (?, ?, ?, ?, SYSUTCDATETIME(), SYSUTCDATETIME());"""

PAYLOADS["8.4 View custom  Lyric"] = """1. Retrieve listener personal custom lyrics for track
- JPA Repository Method:
  List<PersonalLyric> findByTrack_TrackIdAndUser_UserId(Long trackId, Long userId);
- Generated SQL (executed by Hibernate):
  SELECT pl.personal_lyric_id, pl.track_id, pl.user_id, pl.language_code, pl.lyric_content, pl.created_at
  FROM personal_lyrics pl
  WHERE pl.track_id = ? AND pl.user_id = ?
  ORDER BY pl.created_at ASC;"""

PAYLOADS["8.5 Update custom lyric"] = """1. Update personal custom lyric content
- JPA Entity State Transition:
  lyric.setLyricContent(newContent);
  personalLyricRepository.save(lyric);
- Generated SQL (executed by Hibernate):
  UPDATE personal_lyrics
  SET lyric_content = ?, language_code = ?, updated_at = SYSUTCDATETIME()
  WHERE personal_lyric_id = ? AND user_id = ?;"""

PAYLOADS["8.6 Delete custom lyric"] = """1. Delete personal custom lyric
- JPA Repository Method:
  void deleteByPersonalLyricIdAndUser_UserId(Long lyricId, Long userId);
- Generated SQL (executed by Hibernate):
  DELETE FROM personal_lyrics WHERE personal_lyric_id = ? AND user_id = ?;"""

# Package 9: Notifications
PAYLOADS["9.1 View My Notification"] = """1. Retrieve paginated notifications of user
- JPA Repository Method:
  Page<Notification> findByUser_UserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
- Generated SQL (executed by Hibernate):
  SELECT n.notification_id, n.user_id, n.type, n.title, n.message, n.reference_id, n.is_read, n.created_at
  FROM notifications n
  WHERE n.user_id = ?
  ORDER BY n.created_at DESC OFFSET ? ROWS FETCH NEXT ? ROWS ONLY;

2. Mark notification as read
- JPA Repository Method:
  @Modifying @Query("UPDATE Notification n SET n.isRead = true WHERE n.notificationId = :id AND n.user.userId = :userId")
  void markAsRead(@Param("id") Long id, @Param("userId") Long userId);
- Generated SQL (executed by Hibernate):
  UPDATE notifications SET is_read = 1 WHERE notification_id = ? AND user_id = ?;"""

# Package 10: Creator Track Management
PAYLOADS["10.1 Create Track Draft"] = """1. Create new draft track record
- JPA Entity Operation:
  trackRepository.save(draftTrack);
- Generated SQL (executed by Hibernate):
  INSERT INTO tracks (uploader_user_id, album_id, genre_id, title, duration_ms, audio_url, cover_image_url, publication_status, play_count, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, 'DRAFT', 0, SYSUTCDATETIME(), SYSUTCDATETIME());"""

PAYLOADS["10.2 View Tracks List"] = """1. Retrieve tracks uploaded by creator
- JPA Repository Method:
  List<Track> findByUploader_UserIdAndDeletedAtIsNullOrderByCreatedAtDesc(Long userId);
- Generated SQL (executed by Hibernate):
  SELECT t.track_id, t.title, t.publication_status, t.play_count, t.duration_ms, t.created_at,
         g.name AS genre_name, a.title AS album_title
  FROM tracks t
  INNER JOIN genres g ON g.genre_id = t.genre_id
  LEFT JOIN albums a ON a.album_id = t.album_id
  WHERE t.uploader_user_id = ? AND t.deleted_at IS NULL
  ORDER BY t.created_at DESC;"""

PAYLOADS["10.3 Delete A Track"] = """1. Soft-delete track
- JPA Entity State Transition:
  track.setDeletedAt(LocalDateTime.now());
  trackRepository.save(track);
- Generated SQL (executed by Hibernate):
  UPDATE tracks SET deleted_at = SYSUTCDATETIME(), updated_at = SYSUTCDATETIME()
  WHERE track_id = ? AND uploader_user_id = ?;"""

PAYLOADS["10.4 View Track Details"] = """1. Retrieve complete track metadata for creator inspection
- JPA Repository Method:
  Optional<Track> findByTrackIdAndUploader_UserIdAndDeletedAtIsNull(Long trackId, Long userId);
- Generated SQL (executed by Hibernate):
  SELECT t.track_id, t.title, t.duration_ms, t.audio_url, t.cover_image_url, t.publication_status,
         t.album_id, t.genre_id, t.play_count, t.created_at, t.updated_at
  FROM tracks t
  WHERE t.track_id = ? AND t.uploader_user_id = ? AND t.deleted_at IS NULL;"""

PAYLOADS["10.5 Submit Track for Review"] = """1. Create track moderation submission record
- JPA Entity Operation:
  trackSubmissionRepository.save(submission);
- Generated SQL (executed by Hibernate):
  INSERT INTO track_submissions (track_id, submitted_by_user_id, submission_status, submitted_at)
  VALUES (?, ?, 'PENDING', SYSUTCDATETIME());

2. Update track status to PENDING
- JPA Entity State Transition:
  track.setPublicationStatus(PublicationStatus.PENDING);
  trackRepository.save(track);
- Generated SQL (executed by Hibernate):
  UPDATE tracks SET publication_status = 'PENDING', updated_at = SYSUTCDATETIME()
  WHERE track_id = ? AND uploader_user_id = ?;"""

PAYLOADS["10.6 View Rejection Reason"] = """1. Retrieve rejection reason and feedback from latest submission
- JPA Repository Method:
  Optional<TrackSubmission> findTopByTrack_TrackIdOrderBySubmittedAtDesc(Long trackId);
- Generated SQL (executed by Hibernate):
  SELECT TOP 1 ts.submission_id, ts.track_id, ts.submission_status, ts.rejection_reason, ts.reviewed_at,
         s.full_name AS reviewer_name
  FROM track_submissions ts
  LEFT JOIN staffs s ON s.staff_id = ts.reviewer_staff_id
  WHERE ts.track_id = ?
  ORDER BY ts.submitted_at DESC;"""

# Package 11: Creator Album Management
PAYLOADS["11.1 Create An Album"] = """1. Check duplicate album title under current creator
- JPA Repository Method:
  boolean existsByCreatedBy_UserIdAndTitleIgnoreCaseAndDeletedAtIsNull(Long userId, String title);
- Generated SQL (executed by Hibernate):
  SELECT COUNT(a.album_id) FROM albums a
  WHERE a.created_by_user_id = ? AND LOWER(a.title) = LOWER(?) AND a.deleted_at IS NULL;

2. Persist new album record
- JPA Entity Operation:
  albumRepository.save(album);
- Generated SQL (executed by Hibernate):
  INSERT INTO albums (created_by_user_id, title, description, cover_image_url, release_date, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, SYSUTCDATETIME(), SYSUTCDATETIME());"""

PAYLOADS["11.2 Submit Album For Review"] = """1. Update album tracks publication status to PENDING
- JPA Repository Method:
  @Modifying @Query("UPDATE Track t SET t.publicationStatus = 'PENDING' WHERE t.album.albumId = :albumId AND t.uploader.userId = :userId")
  void submitTracksForReview(@Param("albumId") Long albumId, @Param("userId") Long userId);
- Generated SQL (executed by Hibernate):
  UPDATE tracks SET publication_status = 'PENDING', updated_at = SYSUTCDATETIME()
  WHERE album_id = ? AND uploader_user_id = ?;"""

PAYLOADS["11.3 View Album Details"] = """1. Retrieve album details and associated tracks
- JPA Repository Method:
  Optional<Album> findByAlbumIdAndCreatedBy_UserIdAndDeletedAtIsNull(Long albumId, Long userId);
- Generated SQL (executed by Hibernate):
  SELECT a.album_id, a.title, a.description, a.cover_image_url, a.release_date, a.created_at,
         t.track_id, t.title AS track_title, t.duration_ms, t.publication_status
  FROM albums a
  LEFT JOIN tracks t ON t.album_id = a.album_id AND t.deleted_at IS NULL
  WHERE a.album_id = ? AND a.created_by_user_id = ? AND a.deleted_at IS NULL;"""

PAYLOADS["11.4 View Albums"] = """1. Retrieve all albums owned by creator
- JPA Repository Method:
  List<Album> findByCreatedBy_UserIdAndDeletedAtIsNullOrderByCreatedAtDesc(Long userId);
- Generated SQL (executed by Hibernate):
  SELECT a.album_id, a.title, a.cover_image_url, a.release_date, a.created_at,
         (SELECT COUNT(t.track_id) FROM tracks t WHERE t.album_id = a.album_id AND t.deleted_at IS NULL) AS total_tracks
  FROM albums a
  WHERE a.created_by_user_id = ? AND a.deleted_at IS NULL
  ORDER BY a.created_at DESC;"""

PAYLOADS["11.5 Update An Album"] = """1. Update album information
- JPA Entity State Transition:
  album.setTitle(newTitle);
  album.setDescription(newDesc);
  albumRepository.save(album);
- Generated SQL (executed by Hibernate):
  UPDATE albums
  SET title = ?, description = ?, cover_image_url = ?, release_date = ?, updated_at = SYSUTCDATETIME()
  WHERE album_id = ? AND created_by_user_id = ?;"""

PAYLOADS["11.6 Delete An Album"] = """1. Soft-delete album
- JPA Entity State Transition:
  album.setDeletedAt(LocalDateTime.now());
  albumRepository.save(album);
- Generated SQL (executed by Hibernate):
  UPDATE albums SET deleted_at = SYSUTCDATETIME(), updated_at = SYSUTCDATETIME()
  WHERE album_id = ? AND created_by_user_id = ?;"""

# Package 12: Content Reporting
PAYLOADS["12.1 Create A Report"] = """1. Persist new content report
- JPA Entity Operation:
  contentReportRepository.save(report);
- Generated SQL (executed by Hibernate):
  INSERT INTO content_reports (track_id, submitted_by_user_id, reason, details, report_status, created_at)
  VALUES (?, ?, ?, ?, 'PENDING', SYSUTCDATETIME());"""

PAYLOADS["12.2 View Report"] = """1. Retrieve reports submitted by user
- JPA Repository Method:
  List<ContentReport> findBySubmittedBy_UserIdOrderByCreatedAtDesc(Long userId);
- Generated SQL (executed by Hibernate):
  SELECT cr.report_id, cr.track_id, cr.reason, cr.details, cr.report_status, cr.created_at,
         t.title AS track_title
  FROM content_reports cr
  LEFT JOIN tracks t ON t.track_id = cr.track_id
  WHERE cr.submitted_by_user_id = ?
  ORDER BY cr.created_at DESC;"""

PAYLOADS["12.3 Update A Content Report"] = """1. Update pending report details
- JPA Entity State Transition:
  report.setDetails(newDetails);
  contentReportRepository.save(report);
- Generated SQL (executed by Hibernate):
  UPDATE content_reports
  SET details = ?, reason = ?
  WHERE report_id = ? AND submitted_by_user_id = ? AND report_status = 'PENDING';"""

PAYLOADS["12.4 Withdraw Report"] = """1. Withdraw submitted content report
- JPA Repository Method:
  void deleteByReportIdAndSubmittedBy_UserId(Long reportId, Long userId);
- Generated SQL (executed by Hibernate):
  DELETE FROM content_reports WHERE report_id = ? AND submitted_by_user_id = ? AND report_status = 'PENDING';"""

# Package 13: Staff Directory & Account Management
PAYLOADS["13.1 View Staff Directory"] = """1. Retrieve staff directory filtered by status and role
- JPA Repository Method:
  Page<Staff> findByRole_Code(String roleCode, Pageable pageable);
- Generated SQL (executed by Hibernate):
  SELECT s.staff_id, s.email, s.full_name, s.status, s.last_login_at, s.created_at, sr.role_id, sr.code AS role_code
  FROM staffs s
  INNER JOIN staff_roles sr ON sr.role_id = s.role_id
  WHERE sr.code = 'ROLE_STAFF'
  ORDER BY s.created_at DESC OFFSET ? ROWS FETCH NEXT ? ROWS ONLY;"""

PAYLOADS["13.2 Create Staff Account"] = """1. Check staff email uniqueness
- JPA Repository Method:
  boolean existsByEmailIgnoreCase(String email);
- Generated SQL (executed by Hibernate):
  SELECT COUNT(s.staff_id) FROM staffs s WHERE LOWER(s.email) = LOWER(?);

2. Persist new staff member
- JPA Entity Operation:
  staffRepository.save(newStaff);
- Generated SQL (executed by Hibernate):
  INSERT INTO staffs (role_id, email, password_hash, full_name, status, created_at, updated_at)
  VALUES (?, LOWER(?), ?, ?, 'ACTIVE', SYSUTCDATETIME(), SYSUTCDATETIME());"""

PAYLOADS["13.3 Deactivate Staff Account"] = """1. Deactivate staff account
- JPA Entity State Transition:
  staff.setStatus(StaffStatus.DEACTIVATED);
  staffRepository.save(staff);
- Generated SQL (executed by Hibernate):
  UPDATE staffs SET status = 'DEACTIVATED', updated_at = SYSUTCDATETIME() WHERE staff_id = ?;"""

PAYLOADS["13.4 View Staff Moderation Activity"] = """1. Query moderation log / review activity by staff member
- JPA Repository Method:
  List<TrackSubmission> findByReviewer_StaffIdOrderByReviewedAtDesc(Long staffId);
- Generated SQL (executed by Hibernate):
  SELECT ts.submission_id, ts.track_id, ts.submission_status, ts.rejection_reason, ts.reviewed_at,
         t.title AS track_title
  FROM track_submissions ts
  INNER JOIN tracks t ON t.track_id = ts.track_id
  WHERE ts.reviewer_staff_id = ?
  ORDER BY ts.reviewed_at DESC;"""

# Package 14: Track Moderation
PAYLOADS["14.1 View Tracks Moderation List"] = """1. Retrieve pending track moderation submissions
- JPA Repository Method:
  Page<TrackSubmission> findBySubmissionStatusOrderBySubmittedAtAsc(SubmissionStatus status, Pageable pageable);
- Generated SQL (executed by Hibernate):
  SELECT ts.submission_id, ts.track_id, ts.submitted_by_user_id, ts.submission_status, ts.submitted_at,
         t.title, t.duration_ms, up.display_name AS creator_name, g.name AS genre_name
  FROM track_submissions ts
  INNER JOIN tracks t ON t.track_id = ts.track_id
  INNER JOIN users u ON u.user_id = ts.submitted_by_user_id
  LEFT JOIN user_profiles up ON up.user_id = u.user_id
  INNER JOIN genres g ON g.genre_id = t.genre_id
  WHERE ts.submission_status = 'PENDING'
  ORDER BY ts.submitted_at ASC OFFSET ? ROWS FETCH NEXT ? ROWS ONLY;"""

PAYLOADS["14.2 Approve Track Submission"] = """1. Approve track submission and publish track
- JPA Entity State Transition:
  submission.setSubmissionStatus(SubmissionStatus.APPROVED);
  submission.setReviewer(currentStaff);
  submission.setReviewedAt(LocalDateTime.now());
  trackSubmissionRepository.save(submission);
  track.setPublicationStatus(PublicationStatus.PUBLISHED);
  trackRepository.save(track);
- Generated SQL (executed by Hibernate):
  UPDATE track_submissions
  SET submission_status = 'APPROVED', reviewer_staff_id = ?, reviewed_at = SYSUTCDATETIME()
  WHERE submission_id = ?;
  UPDATE tracks SET publication_status = 'PUBLISHED', updated_at = SYSUTCDATETIME() WHERE track_id = ?;"""

PAYLOADS["14.3 Reject Track Submission"] = """1. Reject track submission with feedback reason
- JPA Entity State Transition:
  submission.setSubmissionStatus(SubmissionStatus.REJECTED);
  submission.setRejectionReason(reason);
  submission.setReviewer(currentStaff);
  submission.setReviewedAt(LocalDateTime.now());
  trackSubmissionRepository.save(submission);
  track.setPublicationStatus(PublicationStatus.REJECTED);
  trackRepository.save(track);
- Generated SQL (executed by Hibernate):
  UPDATE track_submissions
  SET submission_status = 'REJECTED', rejection_reason = ?, reviewer_staff_id = ?, reviewed_at = SYSUTCDATETIME()
  WHERE submission_id = ?;
  UPDATE tracks SET publication_status = 'REJECTED', updated_at = SYSUTCDATETIME() WHERE track_id = ?;"""

PAYLOADS["14.4 Search Moderation Tracks"] = """1. Search track submissions by title or creator
- JPA Repository Method:
  @Query("SELECT ts FROM TrackSubmission ts JOIN ts.track t JOIN ts.submittedBy u LEFT JOIN UserProfile up ON up.user.userId = u.userId WHERE LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%'))")
  Page<TrackSubmission> searchSubmissions(@Param("keyword") String keyword, Pageable pageable);
- Generated SQL (executed by Hibernate):
  SELECT ts.submission_id, ts.track_id, ts.submission_status, ts.submitted_at, t.title, up.display_name
  FROM track_submissions ts
  INNER JOIN tracks t ON t.track_id = ts.track_id
  INNER JOIN users u ON u.user_id = ts.submitted_by_user_id
  LEFT JOIN user_profiles up ON up.user_id = u.user_id
  WHERE LOWER(t.title) LIKE LOWER(?)
  ORDER BY ts.submitted_at DESC OFFSET ? ROWS FETCH NEXT ? ROWS ONLY;"""

PAYLOADS["14.5 Filter Moderation Track"] = """1. Filter moderation submissions by status and genre
- JPA Repository Method:
  @Query("SELECT ts FROM TrackSubmission ts JOIN ts.track t WHERE ts.submissionStatus = :status AND t.genre.genreId = :genreId")
  Page<TrackSubmission> filterSubmissions(@Param("status") SubmissionStatus status, @Param("genreId") Long genreId, Pageable pageable);
- Generated SQL (executed by Hibernate):
  SELECT ts.submission_id, ts.track_id, ts.submission_status, ts.submitted_at, t.title, g.name AS genre_name
  FROM track_submissions ts
  INNER JOIN tracks t ON t.track_id = ts.track_id
  INNER JOIN genres g ON g.genre_id = t.genre_id
  WHERE ts.submission_status = ? AND t.genre_id = ?
  ORDER BY ts.submitted_at ASC OFFSET ? ROWS FETCH NEXT ? ROWS ONLY;"""

PAYLOADS["14.6  View Track Moderation Detail"] = """1. Retrieve complete submission details including audio stream and lyrics
- JPA Repository Method:
  Optional<TrackSubmission> findBySubmissionId(Long submissionId);
- Generated SQL (executed by Hibernate):
  SELECT ts.submission_id, ts.track_id, ts.submission_status, ts.submitted_at,
         t.title, t.duration_ms, t.audio_url, t.cover_image_url,
         up.display_name AS creator_name, g.name AS genre_name,
         ol.lyric_content AS official_lyrics
  FROM track_submissions ts
  INNER JOIN tracks t ON t.track_id = ts.track_id
  INNER JOIN users u ON u.user_id = ts.submitted_by_user_id
  LEFT JOIN user_profiles up ON up.user_id = u.user_id
  INNER JOIN genres g ON g.genre_id = t.genre_id
  LEFT JOIN official_lyrics ol ON ol.track_id = t.track_id
  WHERE ts.submission_id = ?;"""

PAYLOADS["14.7  Moderate Track Lyric Update"] = """1. Review and moderate submitted official lyric updates
- JPA Repository Method:
  Optional<OfficialLyric> findByTrack_TrackId(Long trackId);
- Generated SQL (executed by Hibernate):
  SELECT ol.official_lyric_id, ol.track_id, ol.lyric_content, ol.is_synced, ol.updated_at,
         t.title, up.display_name AS creator_name
  FROM official_lyrics ol
  INNER JOIN tracks t ON t.track_id = ol.track_id
  INNER JOIN users u ON u.user_id = t.uploader_user_id
  LEFT JOIN user_profiles up ON up.user_id = u.user_id
  WHERE ol.track_id = ?;"""

# Package 15: Content Report Moderation
PAYLOADS["15.1 View User Reports"] = """1. Retrieve all pending content reports
- JPA Repository Method:
  List<ContentReport> findByReportStatusOrderByCreatedAtDesc(ReportStatus status);
- Generated SQL (executed by Hibernate):
  SELECT cr.report_id, cr.track_id, cr.submitted_by_user_id, cr.reason, cr.details, cr.report_status, cr.created_at,
         t.title AS track_title, up.display_name AS reporter_name
  FROM content_reports cr
  INNER JOIN tracks t ON t.track_id = cr.track_id
  INNER JOIN users u ON u.user_id = cr.submitted_by_user_id
  LEFT JOIN user_profiles up ON up.user_id = u.user_id
  WHERE cr.report_status = 'PENDING'
  ORDER BY cr.created_at DESC;"""

PAYLOADS["15.2 Resolve Report"] = """1. Resolve content report with staff decision
- JPA Entity State Transition:
  report.setReportStatus(ReportStatus.RESOLVED);
  report.setHandledBy(currentStaff);
  contentReportRepository.save(report);
- Generated SQL (executed by Hibernate):
  UPDATE content_reports
  SET report_status = 'RESOLVED', handled_by_user_id = ?
  WHERE report_id = ?;"""

PAYLOADS["15.3 Take Down Published Track"] = """1. Take down infringing track and mark report approved
- JPA Entity State Transition:
  track.setPublicationStatus(PublicationStatus.TAKEDOWN);
  trackRepository.save(track);
  report.setReportStatus(ReportStatus.ACTION_TAKEN);
  contentReportRepository.save(report);
- Generated SQL (executed by Hibernate):
  UPDATE tracks SET publication_status = 'TAKEDOWN', updated_at = SYSUTCDATETIME() WHERE track_id = ?;
  UPDATE content_reports SET report_status = 'ACTION_TAKEN', handled_by_user_id = ? WHERE report_id = ?;"""

# Package 16: Genre Management
PAYLOADS["16.1 Create A Genre"] = """1. Check for duplicate genre name
- JPA Repository Method:
  boolean existsByNameIgnoreCase(String name);
- Generated SQL (executed by Hibernate):
  SELECT COUNT(g.genre_id) FROM genres g WHERE LOWER(g.name) = LOWER(?);

2. Persist new genre
- JPA Entity Operation:
  genreRepository.save(genre);
- Generated SQL (executed by Hibernate):
  INSERT INTO genres (name, slug, description, icon_url, display_order, is_active, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, 1, SYSUTCDATETIME(), SYSUTCDATETIME());"""

PAYLOADS["16.2 View Genres"] = """1. Retrieve all genres ordered by display order
- JPA Repository Method:
  List<Genre> findAllByOrderByDisplayOrderAsc();
- Generated SQL (executed by Hibernate):
  SELECT g.genre_id, g.name, g.slug, g.description, g.icon_url, g.display_order, g.is_active
  FROM genres g
  ORDER BY g.display_order ASC;"""

PAYLOADS["16.3 Update A Genre"] = """1. Check unique genre name on update
- JPA Repository Method:
  boolean existsByNameIgnoreCaseAndGenreIdNot(String name, Long genreId);
- Generated SQL (executed by Hibernate):
  SELECT COUNT(g.genre_id) FROM genres g WHERE LOWER(g.name) = LOWER(?) AND g.genre_id != ?;

2. Update genre details
- JPA Entity State Transition:
  genre.setName(newName);
  genre.setDescription(newDesc);
  genreRepository.save(genre);
- Generated SQL (executed by Hibernate):
  UPDATE genres
  SET name = ?, slug = ?, description = ?, icon_url = ?, display_order = ?, updated_at = SYSUTCDATETIME()
  WHERE genre_id = ?;"""

PAYLOADS["16.4 Deactivate Genre"] = """1. Toggle genre active status
- JPA Entity State Transition:
  genre.setIsActive(!genre.getIsActive());
  genreRepository.save(genre);
- Generated SQL (executed by Hibernate):
  UPDATE genres SET is_active = ?, updated_at = SYSUTCDATETIME() WHERE genre_id = ?;"""

PAYLOADS["16.5 Search Genre"] = """1. Search genres matching keyword in name or slug
- JPA Repository Method:
  List<Genre> findByNameContainingIgnoreCaseOrSlugContainingIgnoreCase(String nameKw, String slugKw);
- Generated SQL (executed by Hibernate):
  SELECT g.genre_id, g.name, g.slug, g.description, g.is_active
  FROM genres g
  WHERE LOWER(g.name) LIKE LOWER(?) OR LOWER(g.slug) LIKE LOWER(?)
  ORDER BY g.display_order ASC;"""

# Package 17: Statistics
PAYLOADS["17.1 View System Statistic"] = """1. Query total active registered users
- JPA Repository Method:
  @Query("SELECT COUNT(u.userId) FROM User u WHERE u.deletedAt IS NULL")
  long countActiveUsers();
- Generated SQL (executed by Hibernate):
  SELECT COUNT(u.user_id) AS total_users FROM users u WHERE u.deleted_at IS NULL;

2. Query total published tracks
- JPA Repository Method:
  long countByPublicationStatus(PublicationStatus status);
- Generated SQL (executed by Hibernate):
  SELECT COUNT(t.track_id) AS total_published_tracks FROM tracks t WHERE t.publication_status = 'PUBLISHED';

3. Query cumulative track play count across system
- JPA Repository Method:
  @Query("SELECT COALESCE(SUM(t.playCount), 0) FROM Track t WHERE t.publicationStatus = 'PUBLISHED'")
  long sumTotalPlayCount();
- Generated SQL (executed by Hibernate):
  SELECT COALESCE(SUM(t.play_count), 0) AS total_plays FROM tracks t WHERE t.publication_status = 'PUBLISHED';

4. Query total active playlists
- JPA Repository Method:
  @Query("SELECT COUNT(pl.playlist_id) FROM Playlist pl WHERE pl.deletedAt IS NULL")
  long countActivePlaylists();
- Generated SQL (executed by Hibernate):
  SELECT COUNT(pl.playlist_id) AS total_playlists FROM playlists pl WHERE pl.deleted_at IS NULL;"""

# Save to scratch
with open(r'C:\Users\lehai\.gemini\antigravity\brain\fa75efb0-8c9d-49c2-a2a5-00764f57f176\scratch\sds_v2_payloads.json', 'w', encoding='utf-8') as f:
    json.dump(PAYLOADS, f, indent=2, ensure_ascii=False)

print(f"Total payloads created: {len(PAYLOADS)}")
