import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, CalendarDays, Users, LayoutDashboard } from 'lucide-react';

const navLinks = [
  { label: 'Home', path: '/', icon: <Home /> },
  { label: 'Calendar', path: '/events', icon: <CalendarDays /> },
  { label: 'Communities', path: '/societies', icon: <Users /> },
  { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard /> }
];

export const DockNav: React.FC = () => {
  const location = useLocation();
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const dockRef = useRef<HTMLDivElement>(null);
  const isHovering = useRef(false);
  const mouseX = useRef<number | null>(null);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    const footerElement = document.getElementById('global-footer');
    if (!footerElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsFooterVisible(entry.isIntersecting);
      },
      { root: null, threshold: 0.1 }
    );

    observer.observe(footerElement);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!dockRef.current) return;
    const items = dockRef.current.querySelectorAll('.nav-item') as NodeListOf<HTMLElement>;
    if (!items.length) return;

    const baseSize = window.innerWidth <= 480 ? 36 : window.innerWidth <= 768 ? 40 : 42;
    const maxSize = window.innerWidth <= 480 ? 54 : window.innerWidth <= 768 ? 60 : 68;
    const baseMargin = window.innerWidth <= 480 ? 3 : window.innerWidth <= 768 ? 4 : 5;
    const maxMargin = window.innerWidth <= 480 ? 8 : window.innerWidth <= 768 ? 10 : 12;
    const distanceThreshold = 130;

    const itemStates = Array.from(items).map(() => ({
      size: baseSize,
      margin: baseMargin,
      y: 0
    }));

    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor;
    };

    const animate = () => {
      // If footer is visible, don't animate scale to avoid conflicting with the CSS hide/shrink transition
      if (isFooterVisible) {
        // Reset instantly via css
        items.forEach((item) => {
          item.style.width = '';
          item.style.height = '';
          item.style.margin = '';
          item.style.transform = '';
        });
        animationFrameId.current = null;
        return;
      }

      let isSettled = true;

      items.forEach((item, index) => {
        // If it's the active item but hidden by footer transition, skip
        if (item.classList.contains('hidden-by-footer')) return;

        let targetSize = baseSize;
        let targetMargin = baseMargin;
        let targetY = 0;

        if (isHovering.current && mouseX.current !== null) {
          const rect = item.getBoundingClientRect();
          const itemCenterX = rect.left + rect.width / 2;
          const distance = Math.abs(mouseX.current - itemCenterX);

          if (distance < distanceThreshold) {
            const progress = Math.cos((distance / distanceThreshold) * (Math.PI / 2));
            targetSize = baseSize + (maxSize - baseSize) * progress;
            targetMargin = baseMargin + (maxMargin - baseMargin) * progress;
            targetY = (targetSize - baseSize) * 0.4;
          }
        }

        const state = itemStates[index];
        const easeSpeed = isHovering.current ? 0.16 : 0.12;

        state.size = lerp(state.size, targetSize, easeSpeed);
        state.margin = lerp(state.margin, targetMargin, easeSpeed);
        state.y = lerp(state.y, targetY, easeSpeed);

        if (Math.abs(state.size - targetSize) > 0.05 ||
            Math.abs(state.margin - targetMargin) > 0.05 ||
            Math.abs(state.y - targetY) > 0.05) {
          isSettled = false;
        }

        item.style.width = `${state.size}px`;
        item.style.height = `${state.size}px`;
        item.style.margin = `0 ${state.margin}px`;
        item.style.transform = `translateY(-${state.y}px)`;
      });

      if (!isSettled || isHovering.current) {
        animationFrameId.current = requestAnimationFrame(animate);
      } else {
        animationFrameId.current = null;
      }
    };

    const handleMouseEnter = () => {
      isHovering.current = true;
      if (!animationFrameId.current) {
        animationFrameId.current = requestAnimationFrame(animate);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.current = e.clientX;
      if (!animationFrameId.current) {
        animationFrameId.current = requestAnimationFrame(animate);
      }
    };

    const handleMouseLeave = () => {
      isHovering.current = false;
      mouseX.current = null;
      if (!animationFrameId.current) {
        animationFrameId.current = requestAnimationFrame(animate);
      }
    };

    const dock = dockRef.current;
    dock.addEventListener('mouseenter', handleMouseEnter);
    dock.addEventListener('mousemove', handleMouseMove);
    dock.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      dock.removeEventListener('mouseenter', handleMouseEnter);
      dock.removeEventListener('mousemove', handleMouseMove);
      dock.removeEventListener('mouseleave', handleMouseLeave);
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [isFooterVisible]);

  return (
    <div
      className={`dock-nav fixed bottom-4 md:bottom-[36px] left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] group ${
        isFooterVisible ? 'w-[52px] md:w-[64px] hover:w-[400px] hover:max-w-[400px]' : 'max-w-[400px]'
      }`}
    >
      <div 
        ref={dockRef}
        className={`flex items-center justify-center rounded-full transition-all duration-500 bg-[rgba(255,255,255,0.08)] backdrop-blur-[20px] border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.4)] ${isFooterVisible ? 'px-0 group-hover:px-[14px] h-[52px] md:h-[64px] w-[52px] md:w-[64px] group-hover:w-[auto]' : 'px-[14px] h-[52px] md:h-[64px]'}`}
      >
        {navLinks.map((link) => {
          const isActive =
            link.path === '/'
              ? location.pathname === '/'
              : link.path === '/dashboard'
                ? (location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin') || location.pathname.startsWith('/advisor') || location.pathname.startsWith('/society') || location.pathname.startsWith('/settings'))
                : location.pathname.startsWith(link.path);

          const isCollapsedState = isFooterVisible;
          // Apply nav-item class for the JS animation logic to pick up
          const visibilityClasses = isCollapsedState && !isActive 
            ? 'w-0 h-0 shrink-0 opacity-0 mx-0 scale-50 border-0 group-hover:border group-hover:w-[42px] group-hover:h-[42px] group-hover:opacity-100 group-hover:mx-[5px] group-hover:scale-100 pointer-events-none group-hover:pointer-events-auto hidden-by-footer' 
            : 'w-[36px] md:w-[42px] h-[36px] md:h-[42px] shrink-0 opacity-100 mx-[3px] md:mx-[5px] scale-100';

          return (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-item relative flex shrink-0 justify-center items-center rounded-full cursor-pointer transition-colors duration-200 ease-out group/item overflow-visible
                ${isActive ? 'bg-[rgba(255,255,255,0.15)] border-white/30' : 'bg-[rgba(0,0,0,0.25)] border-white/10 hover:bg-[rgba(0,0,0,0.45)] hover:border-white/30'}
                border group-hover:border shadow-[0_2px_8px_rgba(0,0,0,0.2)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.35)]
                ${visibilityClasses}
              `}
              style={!isFooterVisible ? { height: window.innerWidth <= 480 ? '36px' : window.innerWidth <= 768 ? '40px' : '42px', width: window.innerWidth <= 480 ? '36px' : window.innerWidth <= 768 ? '40px' : '42px' } : undefined}
            >
              <span className={`pointer-events-none whitespace-nowrap absolute bottom-[calc(100%+14px)] left-1/2 -translate-x-1/2 translate-y-[4px] bg-[rgba(15,15,20,0.85)] backdrop-blur-[12px] text-[#f3f4f6] px-[9px] py-[4px] rounded-[6px] text-[11px] font-medium tracking-[0.2px] border border-white/15 shadow-[0_4px_12px_rgba(0,0,0,0.35)] transition-all duration-200 opacity-0 group-hover/item:opacity-100 group-hover/item:translate-y-0 ${isCollapsedState ? 'hidden group-hover:block' : ''}`}>
                {link.label}
              </span>
              <div className={`w-full h-full flex items-center justify-center transition-transform duration-300 ease-out ${isActive ? 'text-white' : 'text-[#f3f4f6] group-hover/item:text-white'}`}>
                {React.cloneElement(link.icon as any, {
                  className: "w-[42%] h-[42%]",
                  strokeWidth: isActive ? 2.2 : 1.8,
                })}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
