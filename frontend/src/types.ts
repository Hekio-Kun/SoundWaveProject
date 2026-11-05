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

export type LyricDetail = {
  id: number | null;
  trackId: number;
  lyricContent: string;
  status: string; // "PUBLISHED", "DRAFT", "PERSONAL"
  isOfficial: boolean;
  lyricType: string; // "OFFICIAL", "CUSTOM", "TRANSLATION"
  updatedAt?: string;
};

export type TrackLyricsBundle = {
  officialLyric: LyricDetail | null;
  userPersonalLyric: LyricDetail | null;
};

export type StaffTrackLyricSummary = {
  trackId: number;
  title: string;
  artistName: string;
  albumTitle?: string | null;
  durationSeconds?: number | null;
  hasOfficialLyric: boolean;
  lyricStatus?: string | null; // "PUBLISHED", "DRAFT", null
  lastUpdated?: string | null;
  updatedByStaffName?: string | null;
};


export type StaffSummaryItem = {
  id: number;
  email: string;
  fullName: string;
  roleCode: "STAFF" | "ADMIN" | string;
  roleName: string;
  status: "ACTIVE" | "INACTIVE" | string;
  avatarUrl: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  totalTracksModerated: number;
  totalReportsResolved: number;
};

export type StaffDirectoryResponse = {
  content: StaffSummaryItem[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
};

export type CreatorSearchResult = {
  userId: number;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  trackCount: number;
};

export type LyricSearchResult = {
  officialLyricId: number;
  track: LandingTrack;
  lyricSnippet: string;
};

export type TopSearchResult = {
  type: "SONG" | "ALBUM" | "CREATOR";
  track?: LandingTrack | null;
  album?: PublicAlbum | null;
  creator?: CreatorSearchResult | null;
};

export type SearchPageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
};

export type UnifiedSearchResponse = {
  query: string;
  type: string;
  topResult: TopSearchResult | null;
  tracks: SearchPageResponse<LandingTrack>;
  albums: SearchPageResponse<PublicAlbum>;
  creators: SearchPageResponse<CreatorSearchResult>;
  lyrics: SearchPageResponse<LyricSearchResult>;
};


export type CreateStaffInput = {
  fullName: string;
  email: string;
  password?: string;
  autoGeneratePassword?: boolean;
};

export type CreateStaffResult = {
  id: number;
  email: string;
  fullName: string;
  roleCode: string;
  roleName: string;
  status: string;
  temporaryPassword: string;
  emailDispatched: boolean;
  createdAt: string;
};

export type MetricOverview = {
  totalUsers: number;
  activeUsers: number;
  newUsersInPeriod: number;
  userGrowthPercentage: number;
  publishedTracks: number;
  newTracksInPeriod: number;
  totalPlays: number;
  pendingReviews: number;
  pendingReports: number;
  activeGenres: number;
  totalCreators: number;
};

export type TopTrackStatistic = {
  id: number;
  title: string;
  uploaderName: string;
  genreName: string;
  playCount: number;
  coverUrl: string | null;
  durationMs: number | null;
};

export type DailyGrowthStatistic = {
  label: string;
  date: string;
  count: number;
};

export type RoleDistribution = {
  listeners: number;
  creators: number;
  staffs: number;
  admins: number;
  listenerPercentage: number;
  creatorPercentage: number;
};

export type RecentAccountStatistic = {
  id: number;
  email: string;
  displayName: string;
  role: string;
  status: string;
  joinedAt: string;
  initials: string;
  avatarUrl: string | null;
};

export type SystemHealth = {
  restApiStatus: string;
  databaseStatus: string;
  cloudStorageStatus: string;
  emailServiceStatus: string;
  restApiLatencyMs: number;
  databaseLatencyMs: number;
  cloudStorageLatencyMs: number;
  uptime: string;
};

export type SystemStatisticsResponse = {
  overview: MetricOverview;
  topTracks: TopTrackStatistic[];
  userGrowth: DailyGrowthStatistic[];
  roleDistribution: RoleDistribution;
  recentAccounts: RecentAccountStatistic[];
  systemHealth: SystemHealth;
  period: string;
  generatedAt: string;
};

