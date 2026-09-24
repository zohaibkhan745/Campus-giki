import { api } from '@/lib/api';

export interface PostItem {
  title?: string;
  id: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id?: string;
    fullName?: string;
    email?: string;
    role: string;
    avatarUrl?: string | null;
    society?: {
      id: string;
      name: string;
      logoUrl?: string;
      category?: { id: string; name: string; slug: string };
    };
  };
}

export interface PaginatedPostsResponse {
  items: PostItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const postService = {
  createPost: async (data: { title: string; content: string; imageUrl?: string; videoUrl?: string }) => {
    return api.post('/posts', data);
  },

  updatePost: async (id: string, data: { title?: string; content: string; imageUrl?: string; videoUrl?: string }) => {
    return api.put(`/posts/${id}`, data);
  },

  deletePost: async (id: string) => {
    return api.delete(`/posts/${id}`);
  },

  getAllPosts: async (params?: { page?: number; limit?: number; type?: 'global' | 'society'; societyId?: string; from?: string; to?: string }): Promise<PaginatedPostsResponse> => {
    return api.get('/posts', { params }) as any;
  },

  getMyPosts: async (params?: { page?: number; limit?: number }): Promise<PaginatedPostsResponse> => {
    return api.get('/posts/me', { params }) as any;
  },
};
