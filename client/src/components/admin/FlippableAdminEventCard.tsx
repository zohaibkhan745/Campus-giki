import React, { useState } from 'react';
import { EventCard } from '@/components/feed/EventCard';

export const FlippableAdminEventCard = ({ evt }: { evt: any }) => {
  return <EventCard item={{...evt, type: 'event'} as any} />;
};

export const EventGrid = ({ events, maxItems = 4 }: { events: any[], maxItems?: number }) => {
  const [visible, setVisible] = useState(maxItems);
  const shown = events.slice(0, visible);

  return (
    <div className="space-y-6">
      <div className="cards-container">
        {shown.map((evt: any) => <EventCard key={evt.id} item={{...evt, type: 'event'} as any} />)}
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
