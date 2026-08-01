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
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-pure-white hover:bg-lumen-stone border-2 border-vast-ink text-vast-ink text-xs font-bold rounded-buttons transition-all cursor-pointer shadow-[2px_2px_0px_0px_#1B1B18]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      <div className="bg-pure-white p-6 rounded-cards border-2 border-vast-ink flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-vast-ink text-xs font-semibold uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            <span>DSA Administration</span>
          </div>
          <h1 className="text-2xl font-extrabold text-vast-ink">
            Campus Posts
          </h1>
          <p className="text-sm text-fog">
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
      <div className="bg-lumen-cream p-4 rounded-cards border-2 border-vast-ink flex flex-wrap items-center gap-4">
        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => {
            const val = e.target.value as 'all' | 'global' | 'society';
            setTypeFilter(val);
            if (val === 'global') setSocietyFilter('');
            setPage(1);
          }}
          className="w-full md:w-48 bg-pure-white text-vast-ink text-sm font-semibold rounded-inputs border-2 border-vast-ink px-3.5 py-2 transition-all outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 shrink-0 cursor-pointer"
        >
          <option value="all">All Posts</option>
          <option value="global">Admin</option>
          <option value="society">Societies</option>
        </select>

        {/* Society Dropdown */}
        <select
          value={societyFilter}
          onChange={(e) => {
            setSocietyFilter(e.target.value);
            setTypeFilter('society');
            setPage(1);
          }}
          disabled={typeFilter === 'global'}
          className="w-full md:w-64 bg-pure-white text-vast-ink text-sm rounded-inputs border-2 border-vast-ink px-3.5 py-2 transition-all outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:opacity-50"
        >
          <option value="">All Societies</option>
          {societies.map((soc) => (
            <option key={soc.id} value={soc.id}>{soc.name}</option>
          ))}
        </select>

        {(typeFilter !== 'all' || societyFilter) && (
          <button
            onClick={handleClearFilters}
            className="p-2 text-fog hover:text-vast-ink bg-lumen-stone rounded-inputs transition-colors shrink-0"
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
        <div className="bg-lumen-cream p-12 rounded-cards border-2 border-vast-ink border-dashed flex flex-col items-center justify-center text-center space-y-3">
          <div className="p-4 bg-pure-white rounded-full border border-vast-ink shadow-sm">
            <MessageSquare className="w-8 h-8 text-fog" />
          </div>
          <h3 className="text-lg font-extrabold text-vast-ink">No posts found</h3>
          <p className="text-sm text-fog max-w-sm">
            There are no posts matching your current filters.
          </p>
          {(typeFilter !== 'all' || societyFilter) && (
            <Button onClick={handleClearFilters} variant="outline" className="mt-2 bg-pure-white">
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
              <div key={post.id} className="bg-pure-white p-5 rounded-cards border-2 border-vast-ink flex flex-col h-full shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3 gap-2">
                  <div className="flex items-center gap-2">
                    {isAdmin ? (
                      <div className="w-8 h-8 rounded-full bg-vast-ink flex items-center justify-center shrink-0">
                        <Shield className="w-4 h-4 text-pure-white" />
                      </div>
                    ) : post.author.society?.logoUrl ? (
                      <img src={post.author.society.logoUrl} className="w-8 h-8 rounded-full object-cover border border-vast-ink shrink-0" alt="" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-lumen-stone flex items-center justify-center border border-vast-ink shrink-0">
                        <Building2 className="w-4 h-4 text-vast-ink" />
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-bold text-vast-ink">
                        {isAdmin ? 'GIKI Administration' : post.author.society?.name}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-fog font-medium">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {isOwnPost && (
                      <button 
                        onClick={() => handleOpenEdit(post)}
                        className="p-1.5 text-fog hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        title="Edit Post"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(post.id)}
                      className="p-1.5 text-fog hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                      title={isOwnPost ? "Delete Post" : "Delete (Moderation)"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-vast-ink whitespace-pre-wrap flex-1">{post.content}</p>
                
                {post.videoUrl && (
                  <div className="mt-4 rounded-inputs overflow-hidden border-2 border-vast-ink bg-black">
                    <video 
                      controls
                      src={post.videoUrl} 
                      className="w-full max-h-56 object-contain"
                    />
                  </div>
                )}

                {post.imageUrl && !post.videoUrl && (
                  <div className="mt-4 rounded-inputs overflow-hidden border-2 border-vast-ink">
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
            className="bg-pure-white"
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
            className="bg-pure-white"
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
          <div className="bg-pure-white w-full max-w-sm rounded-cards border-2 border-vast-ink p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-500">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h2 className="text-lg font-extrabold text-vast-ink">Remove Post</h2>
            </div>
            <p className="text-sm text-fog font-medium">
              Are you sure you want to remove this post? It will no longer be visible on the student feed.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button onClick={() => setPostToDelete(null)} variant="outline" className="bg-pure-white hover:bg-lumen-stone">
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
