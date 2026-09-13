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
import { societyService } from '@/services/society.service';
import { Button } from '@/components/ui/Button';
import { CouncilNoticeModal } from '@/components/ui/CouncilNoticeModal';
import { PostCard } from '@/components/feed/PostCard';
import { Alert } from '@/components/ui/Alert';
import { PostCreateModal } from '@/components/feed/PostCreateModal';
import type { AxiosError } from 'axios';

const postSchema = z.object({
  title: z.string().min(1, 'Heading is required').max(255, 'Heading is too long'),
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
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [editingPost, setEditingPost] = useState<PostItem | null>(null);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  const { data: dashboardData } = useQuery({ queryKey: ['societyDashboard'], queryFn: societyService.getDashboard });

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
    let hasFullCouncil = false;
    if ((dashboardData as any)?.profile?.executiveCouncil) {
      try {
        const council = JSON.parse((dashboardData as any)?.profile?.executiveCouncil);
        const mandatoryRoles = ['Vice President', 'Event Coordinator', 'General Secretary', 'Treasurer', 'Director Liaison'];
        hasFullCouncil = mandatoryRoles.every(r => council.map((m:any) => m.role).includes(r));
      } catch {}
    }
    if (!hasFullCouncil) {
      setShowNoticeModal(true);
      return;
    }
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
    meta: { notify: true },
    mutationFn: (formData: PostFormData) =>
      editingPost
        ? postService.updatePost(editingPost.id, formData)
        : postService.createPost(formData),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['societyPosts'] });
      await queryClient.invalidateQueries({ queryKey: ['campusFeed'] });
      closeModal();
    },
    onError: (error: AxiosError<{ message?: string | string[] }>) => {
      const msg = error.response?.data?.message;
      setServerError('');
    },
  });

  const deleteMutation = useMutation({
    meta: { notify: true },
    mutationFn: (id: string) => postService.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['societyPosts'] });
      queryClient.invalidateQueries({ queryKey: ['campusFeed'] });
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
    <div className="w-full max-w-[1440px] mx-auto text-left relative pb-20">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="fixed top-4 left-4 sm:top-6 sm:left-6 z-[100] inline-flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full transition-all cursor-pointer shadow-lg"
          title="Go Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="font-extrabold text-5xl sm:text-6xl text-white tracking-tight leading-tight drop-shadow-md">
          Manage Posts
        </h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white/[0.05] p-12 rounded-[24px] border border-white/10 border-dashed flex flex-col items-center justify-center text-center space-y-3 backdrop-blur-md">
          <div className="p-4 bg-white/10 rounded-full border border-white/20 shadow-sm">
            <MessageSquare className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-extrabold text-white">No posts yet</h3>
          <p className="text-sm text-gray-400 max-w-sm">
            Posts and announcements are issued centrally by the Director of Student Affairs (DSA).
          </p>
        </div>
      ) : (
        <div className="cards-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 w-full mx-auto">
          {posts.map((post) => {
            const feedItem = {
              ...post,
              society: {
                id: dashboardData?.profile?.id || post.author.society?.id || '',
                name: dashboardData?.profile?.name || post.author.society?.name || 'Your Society',
                logoUrl: dashboardData?.profile?.logoUrl || post.author.society?.logoUrl || '',
                slug: dashboardData?.profile?.name?.toLowerCase().replace(/\s+/g, '') || post.author.society?.name.toLowerCase().replace(/\s+/g, '') || 'your-society',
              }
            };
            return (
              <PostCard 
                key={post.id} 
                item={feedItem as any}
                onEdit={() => handleOpenEdit(post)}
                onDelete={() => handleDelete(post.id)}
              />
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-8">
          <Button
            variant="outline"
            size="sm"
            className="text-white border-white/20 bg-white/10 hover:bg-white/20"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-xs font-semibold text-gray-400">
            Page {meta.page} of {meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="text-white border-white/20 bg-white/10 hover:bg-white/20"
            onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
            disabled={page === meta.totalPages}
          >
            Next
          </Button>
        </div>
      )}

      <PostCreateModal
        isOpen={isModalOpen}
        onClose={closeModal}
        initialContent={editingPost?.content || ''}
        initialTitle={editingPost?.title || ''}
        initialImageUrl={editingPost?.imageUrl || ''}
        isSubmitting={saveMutation.isPending}
        onSubmit={async (data) => {
          await saveMutation.mutateAsync(data);
        }}
      />

      {postToDelete && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-[#050507]/80 backdrop-blur-md">
          <div className="bg-[#121319] w-full max-w-sm rounded-[24px] border border-white/10 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-500">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h2 className="text-lg font-extrabold text-white">Remove Post</h2>
            </div>
            <p className="text-sm text-gray-300 font-medium">
              Are you sure you want to remove this post? It will no longer be visible on the student feed.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button onClick={() => setPostToDelete(null)} variant="outline" className="text-white border-white/20 bg-white/5 hover:bg-white/10">
                Cancel
              </Button>
              <Button onClick={confirmDelete} variant="primary" className="bg-red-500 hover:bg-red-600 text-white border-none">
                Yes, Remove
              </Button>
            </div>
          </div>
        </div>
      )}
      <CouncilNoticeModal isOpen={showNoticeModal} onClose={() => navigate('/society/setup?tab=council')} />
    </div>
  );
};