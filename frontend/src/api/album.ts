import { ApiError, apiFetch } from "./client";
import type { StudioAlbum, StudioTrack } from "../types";

export type CreateAlbumPayload = {
  title: string;
  description?: string;
  releaseDate?: string;
  trackIds?: number[];
};

export type UpdateAlbumPayload = {
  title: string;
  description?: string;
  releaseDate?: string;
  trackIds?: number[];
};

export class AlbumApiError extends Error {
  readonly code?: string;
  readonly status: number;
  readonly fieldErrors: Record<string, string>;

  constructor(payload: { code?: string; message?: string; fieldErrors?: Record<string, string> }, status: number) {
    super(payload.message || "The album operation failed. Please try again.");
    this.name = "AlbumApiError";
    this.code = payload.code;
    this.status = status;
    this.fieldErrors = payload.fieldErrors ?? {};
  }
}

async function albumRequest<T>(
  path: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: unknown | FormData
): Promise<T> {
  try {
    return await apiFetch<T>(path, { method, body });
  } catch (error) {
    if (error instanceof ApiError) {
      throw new AlbumApiError(
        {
          code: error.code,
          message: error.message,
          fieldErrors: error.fieldErrors,
        },
        error.status
      );
    }
    throw error;
  }
}

function buildAlbumFormData(
  payload: CreateAlbumPayload | UpdateAlbumPayload,
  cover?: File
): FormData {
  const formData = new FormData();
  formData.append(
    "album",
    new Blob([JSON.stringify(payload)], { type: "application/json" })
  );
  if (cover) {
    formData.append("cover", cover);
  }
  return formData;
}

export const albumApi = {
  /**
   * Lấy danh sách toàn bộ album của người dùng hiện tại (UC-21.2)
   */
  getMyAlbums: (): Promise<StudioAlbum[]> => {
    return albumRequest<StudioAlbum[]>("/studio/albums");
  },

  /**
   * Xem chi tiết một album cụ thể kèm danh sách bài hát bên trong (UC-21.2)
   */
  getAlbumById: (id: number): Promise<StudioAlbum> => {
    return albumRequest<StudioAlbum>(`/studio/albums/${id}`);
  },

  /**
   * Lấy danh sách bài hát khả dụng để đưa vào album
   */
  getAvailableTracks: (albumId?: number): Promise<StudioTrack[]> => {
    return albumRequest<StudioTrack[]>(
      `/studio/albums/available-tracks${albumId ? `?albumId=${albumId}` : ""}`
    );
  },

  /**
   * Tạo album mới với ảnh bìa (UC-21.1)
   */
  createAlbum: (payload: CreateAlbumPayload, cover?: File): Promise<StudioAlbum> => {
    return albumRequest<StudioAlbum>(
      "/studio/albums",
      "POST",
      buildAlbumFormData(payload, cover)
    );
  },

  /**
   * Cập nhật thông tin album và thay đổi danh sách bài hát (UC-21.3)
   */
  updateAlbum: (
    id: number,
    payload: UpdateAlbumPayload,
    cover?: File
  ): Promise<StudioAlbum> => {
    return albumRequest<StudioAlbum>(
      `/studio/albums/${id}`,
      "PUT",
      buildAlbumFormData(payload, cover)
    );
  },

  /**
   * Xóa album cá nhân (UC-21.4)
   */
  deleteAlbum: (id: number): Promise<void> => {
    return albumRequest<void>(`/studio/albums/${id}`, "DELETE");
  },
};
