import React, { useEffect, useState } from 'react';
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

  return (
    <div
      className={`fixed bottom-4 md:bottom-[36px] left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] group ${
        isFooterVisible ? 'max-w-[68px] hover:max-w-[400px]' : 'max-w-[400px]'
      }`}
    >
      <div className={`bg-[#17181c] h-[52px] md:h-[64px] rounded-full flex items-center justify-center border border-white/10 shadow-2xl transition-all duration-500 ${isFooterVisible ? 'px-2 group-hover:px-[14px]' : 'px-[14px]'}`}>
        {navLinks.map((link) => {
          const isActive =
            link.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(link.path);

          const isCollapsedState = isFooterVisible;

          return (
            <Link
              key={link.path}
              to={link.path}
              className={`relative flex justify-center items-center rounded-full cursor-pointer transition-all duration-300 ease-out group/item
                ${isActive ? 'bg-[#3b3e4a]' : 'bg-transparent hover:bg-[#2c2f38]'}
                ${isCollapsedState && !isActive 
                  ? 'w-0 opacity-0 mx-0 scale-50 group-hover:w-[42px] group-hover:opacity-100 group-hover:mx-[5px] group-hover:scale-100 pointer-events-none group-hover:pointer-events-auto' 
                  : 'w-[42px] opacity-100 mx-[5px] scale-100'
                }
              `}
              style={{ height: '42px' }}
            >
              <span className={`pointer-events-none whitespace-nowrap absolute bottom-[calc(100%+14px)] left-1/2 -translate-x-1/2 translate-y-[8px] bg-[#17181c] text-[#f3f4f6] px-[10px] py-[5px] rounded-[6px] text-[12px] font-medium tracking-[0.2px] border border-white/10 transition-all duration-200 opacity-0 group-hover/item:opacity-100 group-hover/item:translate-y-0 ${isCollapsedState ? 'hidden group-hover:block' : ''}`}>
                {link.label}
              </span>
              <div className={`w-full h-full flex items-center justify-center transition-transform duration-300 ease-out ${isActive ? 'text-white scale-110' : 'text-[#8a8a8a] group-hover/item:text-white group-hover/item:scale-125'}`}>
                {React.cloneElement(link.icon as any, {
                  className: "w-5 h-5",
                  strokeWidth: isActive ? 2.5 : 2,
                })}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
