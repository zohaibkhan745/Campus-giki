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
  Building2,
  Shield,
  FilterX,
  AlertTriangle
} from 'lucide-react';
import { postService, type PostItem } from '@/services/post.service';
import { societyService } from '@/services/society.service';
import { Button } from '@/components/ui/Button';
import { CustomDropdown } from '@/components/ui/CustomDropdown';
import { Alert } from '@/components/ui/Alert';
import { PostCreateModal } from '@/components/feed/PostCreateModal';
import type { AxiosError } from 'axios';

const postSchema = z.object({
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

  const { data, isLoading } = useQuery({
    queryKey: ['adminPosts', page, typeFilter, societyFilter],
    queryFn: () => postService.getAllPosts({ 
      page, 
      limit: 10,
      type: typeFilter !== 'all' ? typeFilter : undefined,
      societyId: societyFilter || undefined
    }),
  });

  const posts = data?.items || [];
  const meta = data?.meta;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
  });

  const handleOpenCreate = () => {
    setEditingPost(null);
    reset({ content: '', imageUrl: '' });
    setServerError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (post: PostItem) => {
    setEditingPost(post);
    reset({ content: post.content, imageUrl: post.imageUrl || '' });
    setServerError(null);
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPosts'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      closeModal();
    },
    onError: (error: AxiosError<{ message?: string | string[] }>) => {
      const msg = error.response?.data?.message;
      setServerError(Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to save post');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => postService.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPosts'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });

  const onSubmit = (formData: PostFormData) => {
    setServerError(null);
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
    setPage(1);
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

      <div className="bg-transparent p-6 rounded-[18px] border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-white text-xs font-semibold uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            <span>DSA Administration</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">
            Campus Posts
          </h1>
          <p className="text-sm text-gray-400">
            Manage global administrative posts and moderate society posts.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleOpenCreate}
          className="shrink-0"
          leftIcon={<Plus className="w-4 h-4" />}
        >
          New Global Post
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white/[0.08] backdrop-blur-[20px] p-5 rounded-[18px] border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.4)] flex flex-wrap items-center gap-4">
        {/* Type Filter */}
        <CustomDropdown 
          options={[
            { value: 'all', label: 'All Posts' },
            { value: 'global', label: 'Admin' },
            { value: 'society', label: 'Societies' }
          ]}
          value={typeFilter}
          onChange={(val) => {
            setTypeFilter(val as any);
            if (val === 'global') setSocietyFilter('');
            setPage(1);
          }}
          className="w-full md:w-48 shrink-0"
        />

        {/* Society Dropdown */}
        <CustomDropdown 
          options={[
            { value: '', label: 'All Societies' },
            ...societies.map(soc => ({ value: soc.id, label: soc.name }))
          ]}
          value={societyFilter}
          onChange={(val) => {
            setSocietyFilter(val);
            setTypeFilter('society');
            setPage(1);
          }}
          disabled={typeFilter === 'global'}
          className="w-full md:w-64"
        />

        {(typeFilter !== 'all' || societyFilter) && (
          <button
            onClick={handleClearFilters}
            className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-[14px] transition-colors shrink-0"
            title="Clear filters"
          >
            <FilterX className="w-4 h-4" />
          </button>
        )}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => {
            const isAdmin = post.author.role === 'DSA_ADMIN';
            const isOwnPost = isAdmin; // Since we are viewing as Admin
            
            return (
              <div key={post.id} className="bg-white/[0.08] backdrop-blur-[20px] p-6 rounded-[18px] border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.4)] flex flex-col h-full">
                <div className="flex items-start justify-between mb-3 gap-2">
                  <div className="flex items-center gap-2">
                    {isAdmin ? (
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                        <Shield className="w-4 h-4 text-pure-white" />
                      </div>
                    ) : post.author.society?.logoUrl ? (
                      <img src={post.author.society.logoUrl} className="w-8 h-8 rounded-full object-cover border border-white/10 shrink-0" alt="" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                        <Building2 className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {isAdmin ? 'GIKI Administration' : post.author.society?.name}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {isOwnPost && (
                      <button 
                        onClick={() => handleOpenEdit(post)}
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                        title="Edit Post"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(post.id)}
                      className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded transition-colors"
                      title={isOwnPost ? "Delete Post" : "Delete (Moderation)"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-white whitespace-pre-wrap flex-1">{post.content}</p>
                
                {post.videoUrl && (
                  <div className="mt-4 rounded-[14px] overflow-hidden border border-white/10 bg-black">
                    <video 
                      controls
                      src={post.videoUrl} 
                      className="w-full max-h-56 object-contain"
                    />
                  </div>
                )}

                {post.imageUrl && !post.videoUrl && (
                  <div className="mt-4 rounded-[14px] overflow-hidden border border-white/10">
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
            );
          })}
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
          <span className="text-xs font-semibold text-gray-400">
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
          <div className="bg-transparent w-full max-w-sm rounded-[18px] border border-white/10 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-500">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h2 className="text-lg font-extrabold text-white">Remove Post</h2>
            </div>
            <p className="text-sm text-gray-400 font-medium">
              Are you sure you want to remove this post? It will no longer be visible on the student feed.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button onClick={() => setPostToDelete(null)} variant="outline" className="bg-transparent hover:bg-white/5">
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
