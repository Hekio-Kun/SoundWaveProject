import { apiFetch, apiFetchBlob } from "./client";
import type {
  StaffContentReportResponse,
  ResolveContentReportRequest,
  TakeDownTrackRequest,
} from "../types";

const MIME_TO_EXTENSION: Record<string, string> = {
  "application/pdf": "pdf",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
};

function sanitizeFileName(raw: string): string {
  return raw.replace(/[/\\:*?"<>|]+/g, "_").trim();
}

function parseDownloadFilename(
  contentDisposition: string | null,
  reportId: number,
  mimeType: string
): string {
  if (contentDisposition) {
    const utf8Match = contentDisposition.match(/filename\*\s*=\s*UTF-8''([^;\n]+)/i);
    if (utf8Match?.[1]) {
      try {
        const decoded = sanitizeFileName(decodeURIComponent(utf8Match[1].trim()));
        if (decoded) return decoded;
      } catch {
        // Fallback to standard filename attribute below
      }
    }
    const plainMatch = contentDisposition.match(/filename\s*=\s*"?([^";\n]+)"?/i);
    if (plainMatch?.[1]) {
      const cleaned = sanitizeFileName(plainMatch[1]);
      if (cleaned) return cleaned;
    }
  }

  const normalizedMime = mimeType.split(";")[0].trim().toLowerCase();
  const ext = MIME_TO_EXTENSION[normalizedMime];
  return `copyright-proof-report-${reportId}${ext ? `.${ext}` : ""}`;
}

export const staffReportsApi = {
  getReportsQueue: async (): Promise<StaffContentReportResponse[]> => {
    return apiFetch<StaffContentReportResponse[]>("/staff/reports");
  },

  getReportById: async (id: number): Promise<StaffContentReportResponse> => {
    return apiFetch<StaffContentReportResponse>(`/staff/reports/${id}`);
  },

  downloadEvidence: async (id: number): Promise<{ blob: Blob; fileName: string }> => {
    const { blob, contentDisposition } = await apiFetchBlob(`/staff/reports/${id}/evidence/download`);
    return {
      blob,
      fileName: parseDownloadFilename(contentDisposition, id, blob.type),
    };
  },

  resolveReport: async (
    id: number,
    data: ResolveContentReportRequest
  ): Promise<StaffContentReportResponse> => {
    return apiFetch<StaffContentReportResponse>(`/staff/reports/${id}/resolve`, {
      method: "POST",
      body: data,
    });
  },

  takeDownTrack: async (
    trackId: number,
    data: TakeDownTrackRequest
  ): Promise<void> => {
    return apiFetch<void>(`/staff/tracks/${trackId}/takedown`, {
      method: "POST",
      body: data,
    });
  },
};

