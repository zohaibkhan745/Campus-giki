import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
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
  Building2,
  Shield,
  FilterX,
  AlertTriangle
} from 'lucide-react';
import { postService, type PostItem } from '@/services/post.service';
import { Button } from '@/components/ui/Button';
import { PostCard } from '@/components/feed/PostCard';
import { CustomDatePicker } from '@/components/ui/date-picker';
import { Alert } from '@/components/ui/Alert';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { PostCreateModal } from '@/components/feed/PostCreateModal';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import type { AxiosError } from 'axios';

const postSchema = z.object({
  title: z.string().min(1, 'Heading is required').max(255, 'Heading is too long'),
  content: z.string().min(1, 'Post content is required').max(2000, 'Too long'),
  imageUrl: z.string().optional(),
});
type PostFormData = z.infer<typeof postSchema>;

export const AdminPostsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [serverError, setServerError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<PostItem | null>(null);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['adminPosts', dateFrom, dateTo],
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) => postService.getAllPosts({
      page: pageParam,
      limit: 6,
      from: dateFrom || undefined,
      to: dateTo || undefined
    }),
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    }
  });

  const posts = (data as any)?.pages?.flatMap((page: any) => page.items) || [];
  const meta = (data as any)?.pages?.[(data as any).pages.length - 1]?.meta;
  

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
    meta: { notify: true },
    mutationFn: (formData: PostFormData) =>
      editingPost
        ? postService.updatePost(editingPost.id, formData)
        : postService.createPost(formData),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['adminPosts'] });
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
      queryClient.invalidateQueries({ queryKey: ['adminPosts'] });
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

  const handleClearFilters = () => {
    setDateFrom('');
    setDateTo('');
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto text-left relative">
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
        <h1 className="font-extrabold text-5xl sm:text-6xl text-text-primary tracking-tight leading-tight">
          Campus Posts
        </h1>
        <Button
          variant="primary"
          onClick={handleOpenCreate}
          className="shrink-0"
          leftIcon={<Plus className="w-4 h-4" />}
        >
          New Post
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="relative z-[200] bg-white/[0.08] backdrop-blur-[20px] p-5 rounded-[18px] border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.4)] w-full">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-full sm:flex-1 shrink-0">
            <CustomDatePicker
              value={dateFrom}
              max={dateTo}
              onChange={(val: string) => setDateFrom(val)}
              placeholder="From Date"
            />
          </div>
          <div className="w-full sm:flex-1 shrink-0">
            <CustomDatePicker
              value={dateTo}
              min={dateFrom}
              onChange={(val: string) => setDateTo(val)}
              placeholder="To Date"
            />
          </div>

          {(dateFrom || dateTo) && (
            <button
              onClick={handleClearFilters}
              className="p-2.5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-[14px] transition-colors shrink-0 flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              title="Clear filters"
            >
              <FilterX className="w-4 h-4" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-white/50" />
        </div>
      ) : isError ? (
        <ErrorState
          error={error}
          onRetry={refetch}
          compact
        />
      ) : posts.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No Posts Found"
          description={
            dateFrom || dateTo
              ? 'There are no campus posts matching your selected dates.'
              : 'No campus announcements or posts have been created yet.'
          }
          onClearFilters={
            dateFrom || dateTo
              ? handleClearFilters
              : undefined
          }
          action={
            !(dateFrom || dateTo)
              ? {
                  label: 'Create Announcement',
                  onClick: () => setIsModalOpen(true),
                  icon: Plus,
                }
              : undefined
          }
          compact
        />
      ) : (
        <div className="cards-container">
          {posts.map((post: any) => {
            const isAdmin = post.author?.role === 'DSA_ADMIN';
            const isOwnPost = isAdmin; // Since we are viewing as Admin
            
            // Format post for PostCard if needed. PostFeedItem requires society, if Admin, inject dummy society
            const feedItem = {
              ...post,
              isAdminPost: isAdmin,
              society: post.author?.society || {
                id: 'admin',
                name: post.author?.fullName || 'Dean Student Affairs',
                description: 'Directorate of Student Affairs',
                logoUrl: post.author?.avatarUrl || '/default-dsa.png',
                coverUrl: '',
                email: post.author?.email || 'dsa@giki.edu.pk',
                status: 'ACTIVE'
              }
            };
            
            return (
              <PostCard 
                key={post.id} 
                item={feedItem as any} 
                onEdit={isOwnPost ? () => handleOpenEdit(post) : undefined}
                onDelete={() => handleDelete(post.id)}
              />
            );
          })}
        </div>
      )}

      {/* Load More */}
      {hasNextPage && (
        <div className="flex justify-center items-center pt-8 pb-4">
          <Button
            variant="outline"
            className="rounded-[12px] px-8 py-3 bg-[rgba(255,255,255,0.08)] backdrop-blur-[12px] text-[16px] font-semibold text-white border border-[rgba(255,255,255,0.15)] hover:bg-[rgba(255,255,255,0.16)] hover:border-[rgba(255,255,255,0.25)] transition-all"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}

      {/* Create/Edit Modal */}
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!postToDelete}
        onClose={() => setPostToDelete(null)}
        onConfirm={confirmDelete}
        title="Remove Post"
        message="Are you sure you want to remove this post? It will no longer be visible on the student feed."
        confirmText="Confirm Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};


