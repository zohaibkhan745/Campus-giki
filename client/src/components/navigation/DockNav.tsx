import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, CalendarDays, UsersRound, Menu } from 'lucide-react';

const navLinks = [
  { label: 'Home', path: '/', icon: <Home /> },
  { label: 'Calendar', path: '/events', icon: <CalendarDays /> },
  { label: 'Societies', path: '/societies', icon: <UsersRound /> },
  { label: 'Dashboard', path: '/dashboard', icon: <Menu /> },
];

export const DockNav: React.FC = () => {
  const location = useLocation();
  const dockRef = useRef<HTMLDivElement>(null);
  
  // Animation state refs
  const isHovering = useRef(false);
  const isCollapsed = useRef(false);
  const transitionTimer = useRef<NodeJS.Timeout | null>(null);
  const mouseX = useRef<number | null>(null);
  const animationFrameId = useRef<number | null>(null);

  const baseSize = 42;
  const maxSize = 68;
  const baseMargin = 5;
  const maxMargin = 12;
  const distanceThreshold = 130;
  const baseSidePadding = 14;
  const containerBorder = 2;

  const itemStates = useRef(
    navLinks.map(() => ({ size: baseSize, margin: baseMargin, y: 0 }))
  );

  const fullExpandedWidth = (navLinks.length * baseSize) + (navLinks.length * (baseMargin * 2)) + (baseSidePadding * 2) + containerBorder;

  const lerp = (start: number, end: number, factor: number) => {
    return start + (end - start) * factor;
  };

  useEffect(() => {
    const dock = dockRef.current;
    if (!dock) return;
    
    const items = dock.querySelectorAll('.fluid-nav-item') as NodeListOf<HTMLElement>;
    const footer = document.getElementById('global-footer');

    dock.style.width = `${fullExpandedWidth}px`;

    const updateContainerWidth = () => {
      let contentWidth = 0;
      itemStates.current.forEach((state) => {
        contentWidth += state.size + state.margin * 2;
      });
      dock.style.width = `${contentWidth + baseSidePadding * 2 + containerBorder}px`;
    };

    const animate = () => {
      if (isCollapsed.current) {
        animationFrameId.current = null;
        return;
      }

      let isSettled = true;

      items.forEach((item, index) => {
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

        const state = itemStates.current[index];
        const easeSpeed = isHovering.current ? 0.6 : 0.4;

        state.size = lerp(state.size, targetSize, easeSpeed);
        state.margin = lerp(state.margin, targetMargin, easeSpeed);
        state.y = lerp(state.y, targetY, easeSpeed);

        if (Math.abs(state.size - targetSize) > 0.01 ||
            Math.abs(state.margin - targetMargin) > 0.01 ||
            Math.abs(state.y - targetY) > 0.01) {
          isSettled = false;
        }

        item.style.width = `${state.size}px`;
        item.style.height = `${state.size}px`;
        item.style.margin = `0 ${state.margin}px`;
        item.style.transform = `translateY(-${state.y}px)`;
      });

      updateContainerWidth();

      if (!isSettled || isHovering.current) {
        animationFrameId.current = requestAnimationFrame(animate);
      } else {
        animationFrameId.current = null;
        resetItemStyles();
      }
    };

    const requestAnimation = () => {
      if (!animationFrameId.current && !isCollapsed.current && !dock.classList.contains('is-transitioning')) {
        animationFrameId.current = requestAnimationFrame(animate);
      }
    };

    const resetItemStyles = () => {
      items.forEach((item, index) => {
        itemStates.current[index].size = baseSize;
        itemStates.current[index].margin = baseMargin;
        itemStates.current[index].y = 0;

        item.style.width = '';
        item.style.height = '';
        item.style.margin = '';
        item.style.transform = '';
      });
      if (!isCollapsed.current) {
        dock.style.width = `${fullExpandedWidth}px`;
      }
    };

    const collapseDock = () => {
      if (isCollapsed.current) return;
      isCollapsed.current = true;

      resetItemStyles();
      dock.classList.add('is-transitioning');
      void dock.offsetWidth; // force reflow
      dock.classList.add('collapsed');

      if (transitionTimer.current) clearTimeout(transitionTimer.current);
      transitionTimer.current = setTimeout(() => {
        dock.classList.remove('is-transitioning');
      }, 400);
    };

    const expandDock = () => {
      if (!isCollapsed.current) return;
      isCollapsed.current = false;

      resetItemStyles();
      dock.classList.add('is-transitioning');
      void dock.offsetWidth; // force reflow

      dock.classList.remove('collapsed');
      dock.style.width = `${fullExpandedWidth}px`;

      if (transitionTimer.current) clearTimeout(transitionTimer.current);
      transitionTimer.current = setTimeout(() => {
        dock.classList.remove('is-transitioning');
        if (isHovering.current) requestAnimation();
      }, 400);
    };

    const handleMouseEnter = () => {
      isHovering.current = true;
      requestAnimation();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.current = e.clientX;
      requestAnimation();
    };

    const handleMouseLeave = () => {
      isHovering.current = false;
      mouseX.current = null;
      requestAnimation();
    };

    dock.addEventListener('mouseenter', handleMouseEnter);
    dock.addEventListener('mousemove', handleMouseMove);
    dock.addEventListener('mouseleave', handleMouseLeave);

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    let footerObserver: IntersectionObserver | null = null;
    if (footer) {
      footerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            collapseDock();
          } else {
            expandDock();
          }
        });
      }, observerOptions);
      footerObserver.observe(footer);
    }

    return () => {
      dock.removeEventListener('mouseenter', handleMouseEnter);
      dock.removeEventListener('mousemove', handleMouseMove);
      dock.removeEventListener('mouseleave', handleMouseLeave);
      if (footerObserver && footer) footerObserver.unobserve(footer);
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      if (transitionTimer.current) clearTimeout(transitionTimer.current);
    };
  }, []);

  return (
    <>
      <style>
        {`
          .fluid-nav-container {
              position: fixed;
              bottom: 36px;
              left: 50%;
              transform: translateX(-50%);
              background-color: #17181c;
              height: 64px;
              padding: 0 14px;
              border-radius: 9999px;
              display: inline-flex;
              align-items: center;
              border: 1px solid rgba(255, 255, 255, 0.08);
              box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.6);
              transition: background-color 0.3s ease;
              z-index: 1000;
              box-sizing: border-box;
          }

          .fluid-nav-container.is-transitioning {
              transition: background-color 0.3s ease,
                          width 0.4s cubic-bezier(0.16, 1, 0.3, 1),
                          padding 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          }

          .fluid-nav-container.collapsed {
              width: 64px !important;
              padding: 0 11px !important;
          }

          .fluid-nav-item {
              position: relative;
              display: flex;
              justify-content: center;
              align-items: center;
              width: 42px;
              height: 42px;
              margin: 0 5px;
              flex-shrink: 0;
              border-radius: 50%;
              background-color: #22242a;
              color: #ffffff;
              text-decoration: none;
              cursor: pointer;
              transform-origin: center bottom;
              will-change: width, height, margin, transform, opacity;
              
              transition: background-color 0.15s ease,
                          box-shadow 0.15s ease,
                          opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          }

          .fluid-nav-container.is-transitioning .fluid-nav-item {
              transition: background-color 0.15s ease,
                          box-shadow 0.15s ease,
                          opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1),
                          margin 0.4s cubic-bezier(0.16, 1, 0.3, 1),
                          width 0.4s cubic-bezier(0.16, 1, 0.3, 1),
                          height 0.4s cubic-bezier(0.16, 1, 0.3, 1),
                          transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          }

          .fluid-nav-item.active {
              background-color: #ffffff;
              box-shadow: 0 0 12px rgba(255, 255, 255, 0.8), 0 0 30px rgba(255, 255, 255, 0.5), inset 0 0 10px rgba(255, 255, 255, 0.2);
          }

          .fluid-nav-item.active svg {
              stroke: #17181c;
          }

          .fluid-nav-item:not(.active) svg {
              stroke: #d1d5db;
          }

          .fluid-nav-container.collapsed .fluid-nav-item:not(.active) {
              opacity: 0;
              pointer-events: none;
              transform: scale(0.3) translateY(0);
              margin: 0 !important;
              width: 0 !important;
              height: 0 !important;
          }

          .fluid-nav-container.collapsed .fluid-nav-item.active {
              margin: 0 !important;
              width: 42px !important;
              height: 42px !important;
              transform: translateY(0) !important;
          }

          .fluid-nav-item svg {
              width: 42%;
              height: 42%;
              stroke-width: 1.8;
              stroke-linecap: round;
              stroke-linejoin: round;
              fill: none;
              pointer-events: none;
              transition: stroke 0.2s ease;
          }

          .fluid-nav-item:hover {
              background-color: #3b3f4a; box-shadow: 0 8px 20px rgba(0,0,0,0.3);
          }

          .fluid-nav-item:hover svg {
              stroke: #ffffff;
          }

          .fluid-nav-item.active:hover {
              background-color: #ffffff;
          }

          .fluid-nav-item.active:hover svg {
              stroke: #17181c;
          }

          .fluid-tooltip {
              position: absolute;
              bottom: calc(100% + 10px);
              left: 50%;
              transform: translateX(-50%) translateY(4px);
              background-color: #17181c;
              color: #f3f4f6;
              padding: 4px 9px;
              border-radius: 6px;
              font-size: 11px;
              font-weight: 500;
              letter-spacing: 0.2px;
              opacity: 0;
              pointer-events: none;
              white-space: nowrap;
              border: 1px solid rgba(255, 255, 255, 0.08);
              transition: opacity 0.25s ease, transform 0.25s ease;
          }

          .fluid-nav-item:hover .fluid-tooltip {
              opacity: 1;
              transform: translateX(-50%) translateY(0);
          }

          .fluid-nav-container.collapsed .fluid-tooltip {
              display: none;
          }

          @media (max-width: 768px) {
              .fluid-nav-container {
                  height: 58px;
                  padding: 0 10px;
                  bottom: 24px;
              }

              .fluid-nav-container.collapsed {
                  width: 58px !important;
                  padding: 0 8px !important;
              }
          }

          @media (max-width: 480px) {
              .fluid-nav-container {
                  height: 52px;
                  padding: 0 8px;
                  bottom: 16px;
              }

              .fluid-nav-container.collapsed {
                  width: 52px !important;
                  padding: 0 5px !important;
              }
          }
        `}
      </style>
      <div className="fluid-nav-container" id="dock" ref={dockRef}>
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
              className={`fluid-nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="fluid-tooltip">{link.label}</span>
              {React.cloneElement(link.icon as any, {
                strokeWidth: isActive ? 2.2 : 1.8,
              })}
            </Link>
          );
        })}
      </div>
    </>
  );
};
