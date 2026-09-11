
import os

def restore(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Restore lower bar click stopper
    content = content.replace(
        'className="bg-gray-950/95 border-t border-white/10 p-4 flex items-center justify-between gap-3 shrink-0 rounded-b-[24px] relative z-20"\n             ',
        'className="bg-gray-950/95 border-t border-white/10 p-4 flex items-center justify-between gap-3 shrink-0 rounded-b-[24px] relative z-20"\n             onClick={(e) => e.stopPropagation()}'
    )
    content = content.replace(
        'className="bg-gray-950/95 border-t border-white/10 p-4 flex items-center justify-between gap-3 shrink-0 rounded-b-[24px] relative z-20"\r\n             ',
        'className="bg-gray-950/95 border-t border-white/10 p-4 flex items-center justify-between gap-3 shrink-0 rounded-b-[24px] relative z-20"\n             onClick={(e) => e.stopPropagation()}'
    )

    # 2. Fix 3 dots button classes
    content = content.replace(
        'className="card-button visible flex items-center justify-center p-0 pointer-events-auto"',
        'className="flex items-center justify-center p-2 rounded-full hover:bg-white/10 transition-colors pointer-events-auto"'
    )

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

restore("client/src/components/feed/EventCard.tsx")
restore("client/src/components/feed/PostCard.tsx")

