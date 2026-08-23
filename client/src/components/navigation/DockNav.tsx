import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, CalendarDays, UsersRound, Menu, Sparkles } from 'lucide-react';
import { UpcomingEventIcon } from '@/components/icons/UpcomingEventIcon';
import { SocietyIcon } from '@/components/icons/SocietyIcon';
import { createPortal } from 'react-dom';

const navLinks = [
  { label: 'Home', path: '/', icon: <Home /> },
  { label: 'Upcoming', path: '/upcoming-events', icon: <UpcomingEventIcon /> },
  { label: 'Calendar', path: '/events', icon: <CalendarDays /> },
  { label: 'Societies', path: '/societies', icon: <SocietyIcon /> },
  { label: 'Dashboard', path: '/dashboard', icon: <Menu /> },
];

export const DockNav: React.FC = () => {
  const location = useLocation();
  const hideRoutes = ['/society/setup', '/admin/settings', '/advisor/settings', '/dsa/settings', '/settings'];
  if (hideRoutes.some(route => location.pathname.includes(route))) return null;
  const dockRef = useRef<HTMLDivElement>(null);
  const portalsRef = useRef<HTMLDivElement>(null);
  
  // Animation state refs
  const isHovering = useRef(false);
  const isCollapsed = useRef(false);
  const isFooterVisible = useRef(false);
  const mouseX = useRef<number | null>(null);
  const animationFrameId = useRef<number | null>(null);
  
  const baseSize = 42;
  const maxSize = 68;
  const baseMargin = 5;
  const maxMargin = 12;
  const distanceThreshold = 130;
  const baseSidePadding = 14;
  const collapsedPadding = 5;
  const containerBorder = 2;
  
  const currentContainerPadding = useRef(baseSidePadding);

  const fullExpandedWidth = (navLinks.length * baseSize) + (navLinks.length * (baseMargin * 2)) + (baseSidePadding * 2) + containerBorder;

  const itemStates = useRef(
    navLinks.map(() => ({ size: baseSize, margin: baseMargin, y: 0, scale: 1, opacity: 1 }))
  );

  const lerp = (start: number, end: number, factor: number) => {
    return start + (end - start) * factor;
  };

  const evaluateDockState = () => {
    isCollapsed.current = isFooterVisible.current && !isHovering.current;
  };

  useEffect(() => {
    const dock = dockRef.current;
    const portalsContainer = portalsRef.current;
    if (!dock || !portalsContainer) return;

    const placeholders = Array.from(dock.querySelectorAll('.nav-placeholder')) as HTMLElement[];
    const items = Array.from(portalsContainer.querySelectorAll('.reparented-item')) as HTMLElement[];

    const animate = () => {
      let isSettled = true;

      placeholders.forEach((ph, index) => {
        const item = items[index];
        if (!item) return;
        const isActive = item.classList.contains('active');
        
        let targetSize = baseSize;
        let targetMargin = baseMargin;
        let targetY = 0;
        let targetOpacity = 1;
        let targetScale = 1;

        if (isCollapsed.current && !isActive) {
            targetSize = 0;
            targetMargin = 0;
            targetOpacity = 0;
            targetScale = 0.3;
        } else if (isHovering.current && mouseX.current !== null && !isCollapsed.current) {
            const rect = ph.getBoundingClientRect();
            const itemCenterX = rect.left + rect.width / 2;
            const distance = Math.abs(mouseX.current - itemCenterX);

            if (distance < distanceThreshold) {
                const progress = Math.cos((distance / distanceThreshold) * (Math.PI / 2));
                targetSize = baseSize + (maxSize - baseSize) * progress;
                targetMargin = baseMargin + (maxMargin - baseMargin) * progress;
                targetY = (targetSize - baseSize) * 0.4;
            }
        }

        const state = itemStates.current[index];
        const easeSpeed = 0.28;

        state.size = lerp(state.size, targetSize, easeSpeed);
        state.margin = lerp(state.margin, targetMargin, easeSpeed);
        state.y = lerp(state.y, targetY, easeSpeed);
        state.scale = lerp(state.scale, targetScale, easeSpeed);
        state.opacity = lerp(state.opacity, targetOpacity, easeSpeed);

        if (Math.abs(state.size - targetSize) > 0.05 ||
            Math.abs(state.margin - targetMargin) > 0.05 ||
            Math.abs(state.y - targetY) > 0.05 ||
            Math.abs(state.opacity - targetOpacity) > 0.01) {
            isSettled = false;
        }

        ph.style.width = `${state.size}px`;
        ph.style.height = `${state.size}px`;
        ph.style.margin = `0 ${state.margin}px`;

        const phRect = ph.getBoundingClientRect();
        
        item.style.width = `${state.size}px`;
        item.style.height = `${state.size}px`;
        item.style.left = `${phRect.left}px`;
        item.style.top = `${phRect.top}px`;
        item.style.transform = `translateY(-${state.y}px) scale(${state.scale})`;
        item.style.opacity = state.opacity.toString();
        item.style.pointerEvents = state.opacity < 0.2 ? 'none' : 'auto';
      });

      let contentWidth = 0;
      itemStates.current.forEach((state) => {
          contentWidth += state.size + state.margin * 2;
      });

      const targetPadding = isCollapsed.current ? collapsedPadding : baseSidePadding;
      currentContainerPadding.current = lerp(currentContainerPadding.current, targetPadding, 0.28);

      dock.style.width = `${contentWidth + (currentContainerPadding.current * 2) + containerBorder}px`;
      dock.style.padding = `0 ${currentContainerPadding.current}px`;

      if (!isSettled || isHovering.current) {
          animationFrameId.current = requestAnimationFrame(animate);
      } else {
          animationFrameId.current = null;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const screenCenterX = window.innerWidth / 2;
      const dockBottom = window.innerHeight - 36;
      
      const hitWidth = isCollapsed.current && !isHovering.current ? 64 : fullExpandedWidth; 
      const leftBound = screenCenterX - (hitWidth / 2) - 30;
      const rightBound = screenCenterX + (hitWidth / 2) + 30;
      const topBound = dockBottom - (isHovering.current ? 110 : 64) - 20; 
      const bottomBound = dockBottom + 40;

      const isOverDockArea = (
          e.clientX >= leftBound &&
          e.clientX <= rightBound &&
          e.clientY >= topBound && 
          e.clientY <= bottomBound
      );

      if (isOverDockArea) {
          mouseX.current = e.clientX;
          if (!isHovering.current) {
              isHovering.current = true;
              evaluateDockState();
              if (!animationFrameId.current) animationFrameId.current = requestAnimationFrame(animate);
          }
      } else {
          if (isHovering.current) {
              isHovering.current = false;
              mouseX.current = null;
              evaluateDockState();
              if (!animationFrameId.current) animationFrameId.current = requestAnimationFrame(animate);
          }
      }
    };

    const handleResize = () => {
      if (!animationFrameId.current) animationFrameId.current = requestAnimationFrame(animate);
    };

    document.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);
    
    // Boot up
    animationFrameId.current = requestAnimationFrame(animate);

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const footer = document.getElementById('global-footer');
    let footerObserver: IntersectionObserver | null = null;
    
    if (footer) {
      footerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          isFooterVisible.current = entry.isIntersecting;
          evaluateDockState();
          if (!animationFrameId.current) animationFrameId.current = requestAnimationFrame(animate);
        });
      }, observerOptions);
      footerObserver.observe(footer);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (footerObserver && footer) footerObserver.unobserve(footer);
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, []);

  return (
    <>
      <style>
        {`
          .nav-container {
              position: fixed;
              bottom: 36px;
              left: 50%;
              transform: translateX(-50%);
              height: 64px;
              border-radius: 9999px;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              z-index: 100; 
              
              background: rgba(255, 255, 255, 0.05); 
              backdrop-filter: blur(20px);
              -webkit-backdrop-filter: blur(20px);
              border: 1px solid rgba(255, 255, 255, 0.15);
              box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
              transition: background 0.3s ease; 
              box-sizing: border-box;
          }

          .nav-placeholder {
              flex-shrink: 0;
              pointer-events: none;
              opacity: 0;
              width: 42px;
              height: 42px;
              margin: 0 5px;
          }

          .reparented-item {
              position: fixed;
              z-index: 1000;
              display: flex;
              justify-content: center;
              align-items: center;
              border-radius: 50%;
              
              background: rgba(255, 255, 255, 0.12);
              backdrop-filter: blur(16px);
              -webkit-backdrop-filter: blur(16px);
              border: 1px solid rgba(255, 255, 255, 0.25);
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
              
              color: #ffffff;
              text-decoration: none;
              cursor: pointer;
              
              transition: background 0.2s ease,
                          border-color 0.2s ease,
                          box-shadow 0.2s ease;
          }

          .reparented-item.active {
              background: rgba(255, 255, 255, 0.95);
              border: 1px solid rgba(255, 255, 255, 1);
              box-shadow: 0 0 22px rgba(255, 255, 255, 0.4);
              color: #0d0d0d;
          }

          .reparented-item.active svg {
              stroke: #0d0d0d;
          }

          .reparented-item:not(.active) svg {
              stroke: #ffffff;
          }

          .reparented-item svg {
              width: 42%;
              height: 42%;
              stroke-width: 1.8;
              stroke-linecap: round;
              stroke-linejoin: round;
              fill: none;
              pointer-events: none;
              transition: stroke 0.2s ease;
          }

          .reparented-item:hover {
              background: rgba(255, 255, 255, 0.25);
              border-color: rgba(255, 255, 255, 0.45);
          }

          .reparented-item:hover svg {
              stroke: #ffffff;
          }

          .reparented-item.active:hover {
              background: #ffffff;
          }

          .reparented-item.active:hover svg {
              stroke: #0d0d0d;
          }

          .fluid-tooltip {
              position: absolute;
              bottom: calc(100% + 12px);
              left: 50%;
              transform: translateX(-50%) translateY(4px);
              
              background: rgba(0, 0, 0, 0.5);
              backdrop-filter: blur(10px);
              -webkit-backdrop-filter: blur(10px);
              border: 1px solid rgba(255, 255, 255, 0.2);
              
              color: #ffffff;
              padding: 6px 12px;
              border-radius: 8px;
              font-size: 11px;
              font-weight: 600;
              letter-spacing: 0.2px;
              opacity: 0;
              pointer-events: none;
              white-space: nowrap;
              transition: opacity 0.25s ease, transform 0.25s ease;
          }

          .reparented-item:hover .fluid-tooltip {
              opacity: 1;
              transform: translateX(-50%) translateY(0);
          }
        `}
      </style>

      <div className="nav-container" id="dock" ref={dockRef}>
        {navLinks.map((link) => {
          const isActive =
            link.path === '/'
              ? location.pathname === '/'
              : link.path === '/dashboard'
                ? (location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin') || location.pathname.startsWith('/advisor') || location.pathname.startsWith('/society') || location.pathname.startsWith('/settings'))
                : location.pathname.startsWith(link.path);

          return (
            <div key={`ph-${link.path}`} className={`nav-placeholder ${isActive ? 'active' : ''}`} />
          );
        })}
      </div>

      {typeof document !== 'undefined' && createPortal(
        <div ref={portalsRef} style={{ display: 'contents' }}>
          {navLinks.map((link) => {
            const isActive =
              link.path === '/'
                ? location.pathname === '/'
                : link.path === '/dashboard'
                  ? (location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin') || location.pathname.startsWith('/advisor') || location.pathname.startsWith('/society') || location.pathname.startsWith('/settings'))
                  : location.pathname.startsWith(link.path);

            return (
              <Link
                key={link.path}
                to={link.path}
                className={`reparented-item ${isActive ? 'active' : ''}`}
              >
                <span className="fluid-tooltip">{link.label}</span>
                {React.cloneElement(link.icon as any, {
                  strokeWidth: isActive ? 2.2 : 1.8,
                })}
              </Link>
            );
          })}
        </div>,
        document.body
      )}
    </>
  );
};




