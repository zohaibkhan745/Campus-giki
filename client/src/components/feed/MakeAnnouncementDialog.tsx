import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Megaphone, X, Image as ImageIcon } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { api } from '@/lib/api';

interface MakeAnnouncementDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MakeAnnouncementDialog: React.FC<MakeAnnouncementDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const queryClient = useQueryClient();

  const createPostMutation = useMutation({
    mutationFn: async (data: { content: string; imageUrl?: string }) => {
      const response = await api.post('/posts', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      setContent('');
      setImageUrl('');
      onClose();
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-vast-ink/40 backdrop-blur-sm">
      <div
        className="bg-pure-white w-full max-w-lg rounded-cards border-2 border-vast-ink p-6 space-y-6 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-fog hover:text-vast-ink transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b-2 border-vast-ink pb-4">
          <div className="p-2.5 bg-vast-ink text-white rounded-inputs">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-vast-ink">Make a Post</h2>
            <p className="text-xs text-fog font-medium">Publish instantly to the campus feed.</p>
          </div>
        </div>

        {createPostMutation.isError && (
          <Alert variant="error" message={createPostMutation.error.message} />
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            createPostMutation.mutate({
              content,
              imageUrl: imageUrl || undefined,
            });
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-vast-ink flex items-center justify-between">
              <span>Post Content <span className="text-red-500">*</span></span>
              <span className={`text-[10px] ${content.length > 2000 ? 'text-red-500' : 'text-fog'}`}>
                {content.length}/2000
              </span>
            </label>
            <textarea
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What do you want to share with the campus?"
              rows={5}
              className="w-full px-4 py-3 bg-pure-white border-2 border-vast-ink rounded-inputs text-sm text-vast-ink placeholder:text-fog focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-vast-ink flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              <span>Image URL (Optional)</span>
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-3 bg-pure-white border-2 border-vast-ink rounded-inputs text-sm text-vast-ink placeholder:text-fog focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-bold text-vast-ink hover:text-fog transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createPostMutation.isPending || content.trim().length === 0}
              className="px-6 py-2.5 bg-vast-ink hover:opacity-90 text-white rounded-inputs text-sm font-bold transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createPostMutation.isPending ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
