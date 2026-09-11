import os
import re

def process_event_card(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update needsFlip logic
    content = content.replace(
        "const { isActive, openCard, closeCard } = useCardFlip(wrapperRef, disableFlip);",
        "const coverImage = resolveImageUrl(item.coverImageUrl);\n  const hasRegistration = !!item.registrationLink;\n  const isLengthy = (item.description || '').length > 150;\n  const needsFlip = !!coverImage || hasRegistration || isLengthy;\n  const { isActive, openCard, closeCard } = useCardFlip(wrapperRef, disableFlip || !needsFlip);"
    )
    content = content.replace("const coverImage = resolveImageUrl(item.coverImageUrl);\n", "", 1) # Remove the old one

    # 2. Re-arrange FRONT FACE
    match = re.search(r'\{/\* FRONT FACE \*/\}(.*?)\{/\* BACK FACE \*/\}', content, re.DOTALL)
    if not match:
        print("Could not find FRONT FACE in EventCard")
        return
        
    old_front_face = match.group(0)
    
    new_front_face = """{/* FRONT FACE */}
        <div 
          className={cn("card-face card-front flex flex-col", needsFlip && "cursor-pointer")}
          onClick={() => needsFlip && openCard(false)}
        >
          {/* Upper Bar Section */}
          <div className="bg-gray-950/95 border-b border-white/10 px-4 py-3 flex items-center justify-between gap-3 w-full rounded-t-[24px] shrink-0 z-20 relative">
            <div className="flex items-baseline gap-2 flex-wrap min-w-0 flex-1">
              <span className="text-white text-[15px] font-black tracking-tight truncate" title={item.title}>{item.title}</span>
              <span className="text-gray-400 text-[10px] font-medium whitespace-nowrap">{formattedDate} • {formattedTime}</span>
            </div>
            <span className="card-tag !text-[9px] !py-1 !px-2 shrink-0">Event</span>
          </div>

          <div className={`relative w-full flex-1 overflow-hidden flex flex-col ${!coverImage ? 'bg-white/[0.05] backdrop-blur-[20px]' : 'bg-gray-900'}`}>
            {coverImage && (
              <img src={coverImage} alt="Event Poster" className="absolute inset-0 w-full h-full object-cover" />
            )}
            {coverImage && <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/30 to-black/90"></div>}
            
            <div className={cn("relative z-10 text-left flex flex-col flex-1", !coverImage ? "p-4" : "absolute top-5 left-5 right-5")}>
              <div className="flex flex-col gap-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                  <svg className="w-3.5 h-3.5 stroke-current flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <span>{eventDate} • {eventTime}</span>
                </div>
                {item.venue && (
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-200">
                    <svg className="w-3.5 h-3.5 stroke-current flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span className="truncate">{item.venue}</span>
                  </div>
                )}
              </div>

              {!coverImage && (
                <div className="text-gray-300 text-xs mt-3 line-clamp-6 whitespace-pre-wrap flex-1">
                  {item.description}
                </div>
              )}
            </div>

            {(item as any).approvalStatus && (item as any).approvalStatus !== 'PUBLISHED' && (item as any).approvalStatus !== 'APPROVED' && (
              <div className="absolute bottom-5 left-5 right-5 z-10 text-left">
                <span className={cn(
                  "inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-lg border",
                  (item as any).approvalStatus === 'PENDING_ADVISOR' ? "bg-orange-500/20 text-orange-400 border-orange-500/30" :
                    (item as any).approvalStatus === 'PENDING_ADMIN' ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" :
                      "bg-red-500/20 text-red-400 border-red-500/30"
                )}>
                  {(item as any).approvalStatus === 'PENDING_ADMIN' ? 'Pending DSA' : (item as any).approvalStatus === 'PENDING_ADVISOR' ? 'Pending Advisor' : (item as any).approvalStatus.replace('_', ' ')}
                </span>
              </div>
            )}
          </div>

          {/* Lower Bar Section */}
          <div 
             className="bg-gray-950/95 border-t border-white/10 p-4 flex items-center justify-between gap-3 shrink-0 rounded-b-[24px] relative z-20"
             onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-9 h-9 rounded-full bg-[#007ebb] flex items-center justify-center border border-white/20 shrink-0 overflow-hidden">
                <img src={logoImage} alt={authorName} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/default-society.jpg'; }} />
              </div>
              <div className="flex flex-col min-w-0 flex-1 text-left">
                <span className="text-white text-xs font-bold leading-none truncate">{authorName}</span>
                <span className="text-gray-400 text-[11px] font-medium leading-none mt-1 truncate">@{(item.society as any).username || item.society.name.toLowerCase().replace(r'\\s+', '')}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 h-full">
              {needsFlip && (
                <button type="button" className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold rounded-full transition-colors border border-white/10" onClick={(e) => { e.stopPropagation(); openCard(false); }}>
                  View Details
                </button>
              )}
              {(reviewUrl || canEditOrDelete) && (
                <div className="menu-container shrink-0 h-full flex items-center">
                  <button type="button" className="card-button visible flex items-center justify-center p-0" aria-label="Options" ref={buttonRef} onClick={toggleDropdown} style={{ height: '32px', width: '32px', borderRadius: '50%' }}>
                    <svg viewBox="0 0 24 24" fill="white" width="16" height="16"><circle cx="5" cy="12" r="2.5"></circle><circle cx="12" cy="12" r="2.5"></circle><circle cx="19" cy="12" r="2.5"></circle></svg>
                  </button>
                  {dropdownOpen && createPortal(
                    <div className="card-dropdown-menu active" style={{ position: 'fixed', top: dropdownPos.top, left: dropdownPos.left, zIndex: 99999, margin: 0 }} onClick={(e) => e.stopPropagation()}>
                      {reviewUrl && <Link to={reviewUrl} className="card-dropdown-item" onClick={() => setDropdownOpen(false)}>Review Event</Link>}
                      {canEdit && <button className="card-dropdown-item" onClick={(e) => { e.stopPropagation(); setDropdownOpen(false); if(onEdit) onEdit(); else navigate(`/society/events`); }}>Edit Event</button>}
                      {canEditOrDelete && <button className="card-dropdown-item delete" onClick={(e) => { e.stopPropagation(); setDropdownOpen(false); setShowDeleteConfirm(true); }}>Delete Event</button>}
                    </div>,
                    document.body
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BACK FACE */}"""

    content = content.replace(old_front_face, new_front_face)
    
    # Import cn just in case
    if "import { cn } from" not in content:
        content = "import { cn } from '@/lib/utils';\n" + content

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

process_event_card(r"d:\GitHub\Campus GIKI\client\src\components\feed\EventCard.tsx")
