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
import { societyService } from '@/services/society.service';
import { Button } from '@/components/ui/Button';
import { PostCard } from '@/components/feed/PostCard';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { CustomDatePicker } from '@/components/ui/date-picker';
import { Alert } from '@/components/ui/Alert';
import { PostCreateModal } from '@/components/feed/PostCreateModal';
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
  const [typeFilter, setTypeFilter] = useState<'all' | 'global' | 'society'>('all');
  const [societyFilter, setSocietyFilter] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [serverError, setServerError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<PostItem | null>(null);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  // Query societies list for dropdown filter
  const { data: societiesData } = useQuery({
    queryKey: ['publicSocietiesList'],
    queryFn: () => societyService.getPublicSocieties({ limit: 100 }),
  });
  const societies = societiesData?.items || [];

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['adminPosts', typeFilter, societyFilter, dateFrom, dateTo],
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) => postService.getAllPosts({
      page: pageParam,
      limit: 6,
      type: typeFilter !== 'all' ? typeFilter : undefined,
      societyId: societyFilter || undefined,
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
    setTypeFilter('all');
    setSocietyFilter('');
    setDateFrom('');
    setDateTo('');
    /* reset handled by queryKey */
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

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 py-6">
        <h1 className="font-extrabold text-5xl sm:text-6xl text-white tracking-tight leading-tight mb-8 drop-shadow-md">
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
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Type Filter */}
          <CustomDropdown 
            options={[
              { value: 'all', label: 'All Posts' },
              { value: 'global', label: 'Admin' },
              { value: 'society', label: 'Societies' }
            ]}
            value={typeFilter}
            onChange={(e: any) => {
              const val = e.target.value;
              setTypeFilter(val as any);
              if (val === 'global') setSocietyFilter('');
              /* reset handled by queryKey */
            }}
            className="w-full md:flex-1 shrink-0"
          />

          {/* Society Dropdown */}
          <CustomDropdown 
            options={[
              { value: '', label: 'All Societies' },
              ...societies.map((soc: any) => ({ value: soc.id, label: soc.name }))
            ]}
            value={societyFilter}
            onChange={(e: any) => {
              setSocietyFilter(e.target.value);
              setTypeFilter('society');
              /* reset handled by queryKey */
            }}
            disabled={typeFilter === 'global'}
            className="w-full md:flex-1"
          />

          <div className="w-full md:flex-1 shrink-0"><CustomDatePicker value={dateFrom} max={dateTo} onChange={(val: string) => { setDateFrom(val); /* reset handled by queryKey */ }} placeholder="From Date" /></div>
          <div className="w-full md:flex-1 shrink-0"><CustomDatePicker value={dateTo} min={dateFrom} onChange={(val: string) => { setDateTo(val); /* reset handled by queryKey */ }} placeholder="To Date" /></div>

          {(typeFilter !== 'all' || societyFilter || dateFrom || dateTo) && (
            <button
              onClick={handleClearFilters}
              className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-[14px] transition-colors shrink-0"
              title="Clear filters"
            >
              <FilterX className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white/[0.08] backdrop-blur-[20px] p-12 rounded-[18px] border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.4)] flex flex-col items-center justify-center text-center space-y-3">
          <div className="p-4 bg-transparent rounded-full border border-white/10 shadow-sm">
            <MessageSquare className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-extrabold text-white">No posts found</h3>
          <p className="text-sm text-gray-400 max-w-sm">
            There are no posts matching your current filters.
          </p>
          {(typeFilter !== 'all' || societyFilter) && (
            <Button onClick={handleClearFilters} variant="outline" className="mt-2 text-white border-white/20 hover:bg-white/10">
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 justify-items-center w-full mx-auto">
          {posts.map((post: any) => {
            const isAdmin = post.author.role === 'DSA_ADMIN';
            const isOwnPost = isAdmin; // Since we are viewing as Admin
            
            // Format post for PostCard if needed. PostFeedItem requires society, if Admin, inject dummy society
            const feedItem = {
              ...post,
              society: post.author.society || {
                id: 'admin',
                name: 'GIKI Administration',
                description: 'Dean Student Affair',
                logoUrl: '',
                coverUrl: '',
                email: 'dsa@giki.edu.pk',
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
      {postToDelete && (
        <div className="modal-overlay active z-[60]">
          <div className="modal-box">
            <h3 className="modal-title" style={{ color: '#fca5a5' }}>
              <AlertTriangle className="w-6 h-6" />
              <span>Remove Post</span>
            </h3>
            <p className="modal-description">
              Are you sure you want to remove this post? It will no longer be visible on the student feed.
            </p>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setPostToDelete(null)} className="btn-cancel">
                Cancel
              </button>
              <button onClick={confirmDelete} className="btn-confirm danger">
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


