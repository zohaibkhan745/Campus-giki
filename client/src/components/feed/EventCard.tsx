import React from 'react';
import type { EventFeedItem } from '@/types/feed.types';
import { UnifiedFeedCard } from './UnifiedFeedCard';

interface EventCardProps {
  item: EventFeedItem;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({ item, onEdit, onDelete }) => {
  return <UnifiedFeedCard item={item} type="EVENT" onEdit={onEdit} onDelete={onDelete} />;
};
