import { apiFetch } from "./client";

export type SubmissionStatus = "PENDING" | "APPROVED" | "REJECTED";
export type SubmissionType = "TRACK_RELEASE" | "LYRIC_UPDATE";

export type SubmissionStats = {
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  totalCount: number;
};

export type SubmissionQueueItem = {
  id: number;
  itemType?: "SINGLE" | "ALBUM" | "ALBUM_TRACK";
  trackId?: number | null;
  trackTitle: string;
  trackNumber?: number | null;
  genreName: string | null;
  albumId?: number | null;
  albumTitle: string | null;
  coverUrl: string | null;
  durationMs: number | null;
  submitterId: number;
  submitterDisplayName: string | null;
  submitterEmail: string | null;
  status: SubmissionStatus;
  submissionType?: SubmissionType;
  proposedLyrics?: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  reviewerDisplayName: string | null;
  trackCount?: number;
  albumTracks?: SubmissionQueueItem[] | null;
};

export type AlbumTrackSummary = {
  submissionId: number | null;
  trackId: number;
  title: string;
  trackNumber: number | null;
  durationMs: number | null;
  status: SubmissionStatus | null;
};

export type AlbumTrackNavigation = {
  albumId: number;
  albumTitle: string;
  currentSubmissionId: number | null;
  prevSubmissionId: number | null;
  nextSubmissionId: number | null;
  nextPendingSubmissionId: number | null;
  currentIndex: number;
  totalTracks: number;
  tracks: AlbumTrackSummary[];
};

export type SubmissionDetail = {
  id: number;
  status: SubmissionStatus;
  submitterNote: string | null;
  reviewerNote: string | null;
  rejectionReason: string | null;
  submissionType?: SubmissionType;
  proposedLyrics?: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  track: {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    trackNumber: number | null;
    publicationStatus: string;
    audioUrl: string;
    audioFormat: string;
    durationMs: number;
    coverUrl: string | null;
    playCount: number;
    approvedAt: string | null;
    latestRejectionReason: string | null;
    createdAt: string;
    genre: { id: number; name: string; slug: string } | null;
    album: { id: number; title: string; slug: string; status: string } | null;
    lyrics?: string | null;
  };
  submitter: { id: number; email: string; username: string; displayName: string } | null;
  reviewer: { id: number; email: string; username: string; displayName: string } | null;
  albumNavigation?: AlbumTrackNavigation | null;
};

export type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
};

export const moderationApi = {
  getStats: (type?: string) => {
    const query = type && type !== "ALL" ? `?type=${encodeURIComponent(type)}` : "";
    return apiFetch<SubmissionStats>(`/moderation/submissions/stats${query}`);
  },

  getQueue: (params: { status?: string; type?: string; search?: string; page?: number; size?: number }) => {
    const searchParams = new URLSearchParams();
    if (params.status && params.status !== "ALL") {
      searchParams.set("status", params.status);
    }
    if (params.type && params.type !== "ALL") {
      searchParams.set("type", params.type);
    }
    if (params.search && params.search.trim()) {
      searchParams.set("search", params.search.trim());
    }
    searchParams.set("page", String(params.page ?? 0));
    searchParams.set("size", String(params.size ?? 10));

    return apiFetch<PageResponse<SubmissionQueueItem>>(`/moderation/submissions?${searchParams.toString()}`);
  },

  getSubmissionDetail: (id: number) =>
    apiFetch<SubmissionDetail>(`/moderation/submissions/${id}`),

  approveSubmission: (
    id: number,
    reviewerNoteOrRequest?: string | { reviewerNote?: string }
  ) => {
    const note =
      typeof reviewerNoteOrRequest === "string"
        ? reviewerNoteOrRequest
        : reviewerNoteOrRequest?.reviewerNote;
    return apiFetch<SubmissionDetail>(`/moderation/submissions/${id}/approve`, {
      method: "POST",
      body: { reviewerNote: note || undefined },
    });
  },

  rejectSubmission: (
    id: number,
    reasonOrRequest: string | { rejectionReason: string; reviewerNote?: string },
    reviewerNoteParam?: string
  ) => {
    const reason =
      typeof reasonOrRequest === "string"
        ? reasonOrRequest
        : reasonOrRequest.rejectionReason;
    const note =
      typeof reasonOrRequest === "string"
        ? reviewerNoteParam
        : reasonOrRequest.reviewerNote;
    return apiFetch<SubmissionDetail>(`/moderation/submissions/${id}/reject`, {
      method: "POST",
      body: {
        rejectionReason: reason,
        reviewerNote: note || undefined,
      },
    });
  },

  takeDownSubmission: (
    id: number,
    reasonOrRequest: string | { takedownReason: string; reviewerNote?: string },
    reviewerNoteParam?: string
  ) => {
    const reason =
      typeof reasonOrRequest === "string"
        ? reasonOrRequest
        : reasonOrRequest.takedownReason;
    const note =
      typeof reasonOrRequest === "string"
        ? reviewerNoteParam
        : reasonOrRequest.reviewerNote;
    return apiFetch<SubmissionDetail>(`/moderation/submissions/${id}/takedown`, {
      method: "POST",
      body: {
        takedownReason: reason,
        reviewerNote: note || undefined,
      },
    });
  },
};
