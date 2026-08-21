import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  MessageSquare,
  Plus,
  Trash2,
  Edit2,
  ArrowLeft,
  Image as ImageIcon,
  Clock,
  Loader2,
  X,
  AlertTriangle,
} from 'lucide-react';
import { postService, type PostItem } from '@/services/post.service';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { PostCreateModal } from '@/components/feed/PostCreateModal';
import type { AxiosError } from 'axios';

const postSchema = z.object({
  content: z.string().min(1, 'Post content is required').max(2000, 'Too long'),
  imageUrl: z.string().optional(),
});
type PostFormData = z.infer<typeof postSchema>;

export const SocietyPostsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [serverError, setServerError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<PostItem | null>(null);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['societyPosts', page],
    queryFn: () => postService.getMyPosts({ page, limit: 10 }),
  });

  const posts = data?.items || [];
  const meta = data?.meta;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
  });

  const handleOpenCreate = () => {
    setEditingPost(null);
    reset({ content: '', imageUrl: '' });
    setServerError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (post: PostItem) => {
    setEditingPost(post);
    reset({ content: post.content, imageUrl: post.imageUrl || '' });
    setServerError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPost(null);
    reset();
  };

  const saveMutation = useMutation({
    mutationFn: (formData: PostFormData) =>
      editingPost
        ? postService.updatePost(editingPost.id, formData)
        : postService.createPost(formData),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['societyPosts'] });
      await queryClient.invalidateQueries({ queryKey: ['feed'] });
      closeModal();
    },
    onError: (error: AxiosError<{ message?: string | string[] }>) => {
      const msg = error.response?.data?.message;
      setServerError('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => postService.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['societyPosts'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });

  const onSubmit = (formData: PostFormData) => {
    setServerError('');
    const dataToSend = {
      ...formData,
      imageUrl: formData.imageUrl?.trim() || undefined,
    };
    saveMutation.mutate(dataToSend);
  };

  const handleDelete = (id: string) => {
    setPostToDelete(id);
  };

  const confirmDelete = () => {
    if (postToDelete) {
      deleteMutation.mutate(postToDelete);
      setPostToDelete(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-left py-4 relative">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="fixed top-4 left-4 sm:top-6 sm:left-6 z-[100] inline-flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full transition-all cursor-pointer shadow-lg"
          title="Go Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-transparent p-6 rounded-cards border border-vast-ink/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-vast-ink text-xs font-semibold uppercase tracking-wider mb-1">
            <MessageSquare className="w-4 h-4" />
            <span>Communication Portal</span>
          </div>
          <h1 className="text-2xl font-extrabold text-vast-ink">
            Manage Posts
          </h1>
          <p className="text-sm text-fog">
            Broadcast updates, important news, and general posts to the student feed.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleOpenCreate}
          className="shrink-0"
          leftIcon={<Plus className="w-4 h-4" />}
        >
          New Post
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-lumen-cream p-12 rounded-cards border border-vast-ink/20 border-dashed flex flex-col items-center justify-center text-center space-y-3">
          <div className="p-4 bg-transparent rounded-full border border-vast-ink shadow-sm">
            <MessageSquare className="w-8 h-8 text-fog" />
          </div>
          <h3 className="text-lg font-extrabold text-vast-ink">No posts yet</h3>
          <p className="text-sm text-fog max-w-sm">
            You haven't published any posts. Create one to keep students updated on your society's activities.
          </p>
          <Button onClick={handleOpenCreate} variant="outline" className="mt-2 bg-transparent">
            Create First Post
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-transparent p-5 rounded-cards border border-vast-ink/20 flex flex-col h-full shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3 gap-2">
                <div className="flex items-center gap-2 text-xs text-fog font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => handleOpenEdit(post)}
                    className="p-1.5 text-fog hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(post.id)}
                    className="p-1.5 text-fog hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <p className="text-sm text-vast-ink whitespace-pre-wrap flex-1">{post.content}</p>
              
              {post.videoUrl && (
                <div className="mt-4 rounded-inputs overflow-hidden border border-vast-ink/20 bg-black">
                  <video 
                    controls
                    src={post.videoUrl} 
                    className="w-full max-h-56 object-contain"
                  />
                </div>
              )}

              {post.imageUrl && !post.videoUrl && (
                <div className="mt-4 rounded-inputs overflow-hidden border border-vast-ink/20">
                  <img 
                    src={post.imageUrl} 
                    alt="Post attachment" 
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      if (e.currentTarget.parentElement) {
                        e.currentTarget.parentElement.style.display = 'none';
                      }
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            className="bg-transparent"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-xs font-semibold text-fog">
            Page {meta.page} of {meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="bg-transparent"
            onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
            disabled={page === meta.totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <PostCreateModal
        isOpen={isModalOpen}
        onClose={closeModal}
        initialContent={editingPost?.content || ''}
        initialImageUrl={editingPost?.imageUrl || ''}
        isSubmitting={saveMutation.isPending}
        onSubmit={async (data) => {
          await saveMutation.mutateAsync(data);
        }}
      />

      {/* Delete Confirmation Modal */}
      {postToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/40">
          <div className="bg-transparent w-full max-w-sm rounded-cards border border-vast-ink/20 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-500">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h2 className="text-lg font-extrabold text-vast-ink">Remove Post</h2>
            </div>
            <p className="text-sm text-fog font-medium">
              Are you sure you want to remove this post? It will no longer be visible on the student feed.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button onClick={() => setPostToDelete(null)} variant="outline" className="bg-transparent hover:bg-lumen-stone">
                Cancel
              </Button>
              <Button onClick={confirmDelete} variant="primary" className="bg-red-500 hover:bg-red-600 text-white">
                Yes, Remove
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
