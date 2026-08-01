import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
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
    mutationFn: async (data: { content: string; imageUrl?: string; videoUrl?: string }) => {
      const response = await api.post('/posts', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
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
