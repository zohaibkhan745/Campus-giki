import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postService } from '@/services/post.service';
import { invalidatePostQueries } from '@/lib/queryInvalidations';
import { PostCreateModal } from './PostCreateModal';

interface MakeAnnouncementDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MakeAnnouncementDialog: React.FC<MakeAnnouncementDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient();

  const createPostMutation = useMutation({
    meta: { notify: true },
    mutationFn: async (data: { title: string; content: string; imageUrl?: string; videoUrl?: string }) => {
      return postService.createPost(data);
    },
    onSuccess: () => {
      void invalidatePostQueries(queryClient);
      onClose();
    },
  });

  return (
    <PostCreateModal
      isOpen={isOpen}
      onClose={onClose}
      isSubmitting={createPostMutation.isPending}
      onSubmit={async (data) => {
        await createPostMutation.mutateAsync(data);
      }}
    />
  );
};
