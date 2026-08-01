import { api } from '@/lib/api';

export interface UploadResponse {
  filename: string;
  relativePath: string;
  url: string;
  mimetype: string;
  sizeBytes: number;
}

export const uploadService = {
  uploadMedia: async (file: File, folder: 'posts' | 'events' | 'avatars' | 'societies' | 'general' = 'general'): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<UploadResponse>(`/uploads/media?folder=${folder}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return (response as any).data || response;
  },

  uploadImage: async (file: File, folder: 'posts' | 'events' | 'avatars' | 'societies' | 'general' = 'general'): Promise<UploadResponse> => {
    return uploadService.uploadMedia(file, folder);
  },
};
