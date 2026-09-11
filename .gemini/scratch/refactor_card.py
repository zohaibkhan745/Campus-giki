
import os
import re

def fix_card(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Fix "View Details" onClick
    content = content.replace(
        '<button type="button" className="px-4 h-[32px] flex items-center justify-center bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold rounded-full transition-colors border border-white/10 pointer-events-auto" >',
        '<button type="button" className="px-4 h-[32px] flex items-center justify-center bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold rounded-full transition-colors border border-white/10 pointer-events-auto" onClick={(e) => { e.preventDefault(); e.stopPropagation(); openCard(false); }}>'
    )

    # 2. Fix 3-dots menu button SVG missing (sometimes self-closing tags or nested svgs get messed up)
    # Also add e.preventDefault() to toggleDropdown
    content = content.replace(
        'const toggleDropdown = (e: React.MouseEvent) => {\n    e.stopPropagation();',
        'const toggleDropdown = (e: React.MouseEvent) => {\n    e.preventDefault();\n    e.stopPropagation();'
    )

    # 3. Increase heading, society name, and text inside
    content = content.replace(
        'text-white text-[17px] font-black tracking-tight',
        'text-white text-[18px] font-black tracking-tight'
    )
    content = content.replace(
        '<span className="text-white text-xs font-bold leading-none truncate">{authorName}</span>',
        '<span className="text-white text-[14px] font-bold leading-tight truncate">{authorName}</span>'
    )
    content = content.replace(
        '<span className="text-gray-400 text-[11px] font-medium leading-none mt-1 truncate">',
        '<span className="text-gray-400 text-[12px] font-medium leading-none mt-0.5 truncate">'
    )
    # Increase text inside (description)
    content = content.replace(
        'text-gray-300 text-[13.5px] leading-relaxed mt-3',
        'text-gray-300 text-[14.5px] leading-relaxed mt-3'
    )

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

fix_card("client/src/components/feed/EventCard.tsx")
fix_card("client/src/components/feed/PostCard.tsx")

