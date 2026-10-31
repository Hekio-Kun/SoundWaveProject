export type LandingTrack = {
  id: number;
  title: string;
  coverUrl: string | null;
  audioUrl: string;
  durationMs: number;
  playCount: number;
  slug?: string;
  publicationStatus?: "APPROVED" | "PUBLISHED" | string;
  genreSlug?: string;
  genreName?: string;
  description?: string;
  createdAt?: string;
  lyrics?: string;
  creator: {
    userId: number;
    displayName: string;
    avatarUrl: string | null;
  };
  album?: {
    id: number;
    title: string;
  };
};

export type FeaturedAlbum = {
  id: number;
  title: string;
  coverUrl: string;
  creatorName: string;
  releaseYear: number;
  tracksCount?: number;
  description?: string;
};

export type PublicAlbum = {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  coverUrl: string | null;
  releaseDate?: string | null;
  publishedAt?: string | null;
  createdAt?: string;
  trackCount: number;
  creator: {
    userId: number;
    displayName: string;
    avatarUrl: string | null;
  };
};

export type PublicAlbumDetails = PublicAlbum & {
  tracks: LandingTrack[];
};

export type FeaturedCreator = {
  userId: number;
  displayName: string;
  avatarUrl: string;
  bio: string;
  publishedTracks: number;
  followersCount?: number;
};

export type Genre = {
  id: number;
  name: string;
  slug: string;
  color: string;
  accent: string;
  description?: string;
};

export type Playlist = {
  id: number;
  title: string;
  description?: string;
  coverUrl: string;
  trackCount: number;
  isPrivate: boolean;
  ownerId: number;
  ownerName: string;
  creatorName?: string;
  createdAt?: string;
  trackIds: number[];
  tracks?: LandingTrack[];
};

export type StudioTrack = {
  id: number;
  title: string;
  slug?: string;
  description?: string;
  coverUrl: string | null;
  audioUrl: string;
  durationMs: number;
  genreId?: number;
  genreSlug: string;
  genreName: string;
  albumId?: number;
  albumTitle?: string;
  trackNumber?: number;
  status: "DRAFT" | "PENDING" | "APPROVED" | "PUBLISHED" | "REJECTED" | "TAKEN_DOWN" | string;
  audioFormat?: string;
  playCount?: number;
  latestRejectionReason?: string;
  reviewerNote?: string;
  submitterNote?: string;
  submittedAt?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt?: string;
  lyrics?: string;
};

export type CurrentUser = {
  id: number;
  userId?: number;
  email: string;
  username?: string;
  displayName: string;
  avatarUrl: string | null;
  role: "LISTENER" | "STAFF" | "MODERATOR" | "ADMIN";
  bio?: string;
  dateOfBirth?: string;
  countryCode?: string;
};

export type AlbumTrackItemPayload = {
  title: string;
  genreId: number;
  trackNumber?: number;
  description?: string;
  lyrics?: string;
  durationMs?: number;
  audioIndex?: number;
};

export type CreateAlbumPayload = {
  title: string;
  description?: string;
  releaseDate?: string;
  submitForReview?: boolean;
  tracks?: AlbumTrackItemPayload[];
  trackIds?: number[];
};

export type StudioAlbum = {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  status: "DRAFT" | "PENDING" | "PUBLISHED" | "REJECTED" | string;
  coverUrl?: string | null;
  releaseDate?: string | null;
  trackCount: number;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  tracks?: StudioTrack[];
};

export type ListeningHistoryItem = {
  id: number;
  trackId: number;
  title: string;
  slug: string;
  artistName: string;
  durationMs: number;
  coverUrl: string | null;
  audioUrl: string | null;
  playedAt: string;
  listenedDurationMs: number;
  completed: boolean;
};

export type NotificationItem = {
  id: number;
  type: string;
  title: string;
  message: string;
  referenceType?: string | null;
  referenceId?: string | null;
  isRead: boolean;
  createdAt: string;
  navigationUrl?: string | null;
};

export type CustomLyricItem = {
  id: number;
  trackId: number;
  userId: number;
  lyricType: string;
  lyricContent: string;
  createdAt: string;
  updatedAt: string;
};

export type TrackLyricsBundle = {
  trackId: number;
  officialLyrics?: string | null;
  syncType: "LRC" | "PLAIN" | "NONE";
  customLyrics: CustomLyricItem[];
};
