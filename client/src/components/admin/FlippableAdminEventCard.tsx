import React from 'react';
import { FeedCard } from '@/components/feed/FeedCard';

export const FlippableAdminEventCard: React.FC<{ event: any }> = ({ event }) => {
  return <FeedCard item={event} />;
};

export const EventGrid: React.FC<{ events: any[] }> = ({ events }) => {
  return (
    <div className="flex flex-col gap-6">
      {events.map(event => (
        <FeedCard key={event.id} item={event} />
      ))}
    </div>
  );
};
