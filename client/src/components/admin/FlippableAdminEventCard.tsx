import React, { useState, useMemo } from 'react';
import { EventCard } from '@/components/feed/EventCard';

export const FlippableAdminEventCard = ({ evt }: { evt: any }) => {
  const item = useMemo(() => ({ ...evt, type: 'event' } as any), [evt]);
  return <EventCard item={item} />;
};

export const EventGrid = ({ events, maxItems = 4, reviewUrlBase }: { events: any[], maxItems?: number, reviewUrlBase?: string }) => {
  const [visible, setVisible] = useState(maxItems);

  const memoizedShown = useMemo(() => {
    return events.slice(0, visible).map((evt: any) => ({ ...evt, type: 'event' } as any));
  }, [events, visible]);

  return (
    <div className="space-y-6">
      <div className="cards-container">
        {memoizedShown.map((item: any) => <EventCard key={item.id} item={item} reviewUrl={reviewUrlBase ? `${reviewUrlBase}/${item.id}` : undefined} />)}
      </div>
      {visible < events.length && (
        <button
          onClick={() => setVisible(v => v + 4)}
          className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-sm font-bold transition-colors"
        >
          Load More Events
        </button>
      )}
    </div>
  );
};
