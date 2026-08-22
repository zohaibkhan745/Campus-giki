import React from 'react';
import type { PostFeedItem } from '@/types/feed.types';
import { UnifiedFeedCard } from './UnifiedFeedCard';

interface PostCardProps {
  item: PostFeedItem;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const PostCard: React.FC<any> = ({ item, onEdit, onDelete }) => {
  return <UnifiedFeedCard item={item} type="POST" onEdit={onEdit} onDelete={onDelete} />;
};
