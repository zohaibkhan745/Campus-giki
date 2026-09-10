import os

def update_file(path, is_event):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update Upper Bar Title and Date
    old_upper_bar_start = """<div className="flex items-baseline gap-2 flex-wrap min-w-0 flex-1">
              <span className="text-white text-[15px] font-black tracking-tight truncate" """
    new_upper_bar_start = """<div className="flex flex-col min-w-0 flex-1">
              <span className="text-white text-[17px] font-black tracking-tight truncate leading-tight" """
    
    if old_upper_bar_start in content:
        content = content.replace(old_upper_bar_start, new_upper_bar_start)

    old_date = """<span className="text-gray-400 text-[10px] font-medium whitespace-nowrap">{formattedDate} • {formattedTime}</span>"""
    new_date = """<span className="text-gray-400 text-[11px] font-medium whitespace-nowrap mt-0.5">{formattedDate} • {formattedTime}</span>"""
    if old_date in content:
        content = content.replace(old_date, new_date)

    # 2. Update Frosted Background
    old_frosted = """bg-white/[0.05] backdrop-blur-[20px]"""
    new_frosted = """bg-black/[0.4] backdrop-blur-[24px]"""
    if old_frosted in content:
        content = content.replace(old_frosted, new_frosted)

    # 3. Update Description Text Size
    old_text = """className="text-gray-300 text-xs mt-3 line-clamp-6 whitespace-pre-wrap flex-1\""""
    new_text = """className="text-gray-300 text-[13.5px] leading-relaxed mt-3 line-clamp-6 whitespace-pre-wrap flex-1\""""
    if old_text in content:
        content = content.replace(old_text, new_text)

    # 4. Update View Details Button
    old_btn = """className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold rounded-full transition-colors border border-white/10\""""
    new_btn = """className="px-4 h-[32px] flex items-center justify-center bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold rounded-full transition-colors border border-white/10 pointer-events-auto\""""
    if old_btn in content:
        content = content.replace(old_btn, new_btn)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

update_file(r"d:\GitHub\Campus GIKI\client\src\components\feed\EventCard.tsx", True)
update_file(r"d:\GitHub\Campus GIKI\client\src\components\feed\PostCard.tsx", False)
