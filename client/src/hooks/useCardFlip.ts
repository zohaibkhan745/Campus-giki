import { useEffect, useState } from 'react';
import type { RefObject } from 'react';

export function useCardFlip(wrapperRef: RefObject<HTMLDivElement | null>, disable?: boolean) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isActive, setIsActive] = useState(false); // represents 'in-focus'


  // Global click listener to close card if clicking outside, and Escape key
  useEffect(() => {
    if (!isActive) return;

    const handleGlobalClick = (e: MouseEvent) => {
      const wrapper = wrapperRef.current;
      // If click is outside the card wrapper, close it
      if (wrapper && !wrapper.contains(e.target as Node)) {
        closeCard();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeCard();
      }
    };

    // Small timeout to prevent immediate triggering from the open click
    const timer = setTimeout(() => {
      window.addEventListener('click', handleGlobalClick);
      window.addEventListener('keydown', handleKeyDown);
    }, 100);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive]);

  // Active wheel and touch scroll handler when card is in focus
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper || !isActive) return;

    const handleWheel = (e: WheelEvent) => {
      // Find the scrollable container inside the card
      const scrollEl = (wrapper.querySelector('.card-back-inner') || wrapper.querySelector('.scroll-area')) as HTMLElement | null;
      if (!scrollEl) return;

      let delta = e.deltaY;
      if (e.deltaMode === 1) {
        delta *= 24; // Lines to px
      } else if (e.deltaMode === 2) {
        delta *= scrollEl.clientHeight; // Pages to px
      }

      const maxScroll = scrollEl.scrollHeight - scrollEl.clientHeight;
      if (maxScroll <= 0) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      const canScrollDown = delta > 0 && scrollEl.scrollTop < maxScroll;
      const canScrollUp = delta < 0 && scrollEl.scrollTop > 0;

      if (canScrollDown || canScrollUp) {
        scrollEl.scrollTop += delta;
      }
      e.preventDefault();
      e.stopPropagation();
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      const scrollEl = (wrapper.querySelector('.card-back-inner') || wrapper.querySelector('.scroll-area')) as HTMLElement | null;
      if (!scrollEl || e.touches.length !== 1) return;

      const currentY = e.touches[0].clientY;
      const deltaY = touchStartY - currentY;
      touchStartY = currentY;

      const maxScroll = scrollEl.scrollHeight - scrollEl.clientHeight;
      if (maxScroll <= 0) return;

      const canScrollDown = deltaY > 0 && scrollEl.scrollTop < maxScroll;
      const canScrollUp = deltaY < 0 && scrollEl.scrollTop > 0;

      if (canScrollDown || canScrollUp) {
        scrollEl.scrollTop += deltaY;
      }
    };

    wrapper.addEventListener('wheel', handleWheel, { passive: false });
    wrapper.addEventListener('touchstart', handleTouchStart, { passive: true });
    wrapper.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      wrapper.removeEventListener('wheel', handleWheel);
      wrapper.removeEventListener('touchstart', handleTouchStart);
      wrapper.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isActive, wrapperRef]);

  const openCard = (isEvent: boolean) => {
    window.dispatchEvent(new CustomEvent('close-all-dropdowns'));
    const wrapper = wrapperRef.current;
    if (!wrapper || disable) return;
    
    const flipper = wrapper.querySelector('.card-flipper');
    const focusBackdrop = document.getElementById('focusBackdrop');
    if (!flipper || !focusBackdrop) return;

    // Reset scroll position to top
    const scrollEl = (wrapper.querySelector('.card-back-inner') || wrapper.querySelector('.scroll-area')) as HTMLElement | null;
    if (scrollEl) scrollEl.scrollTop = 0;

    const rect = wrapper.getBoundingClientRect();
    const startWidth = rect.width;
    const startHeight = rect.height;
    wrapper.dataset.origWidth = startWidth.toString();
    wrapper.dataset.origHeight = startHeight.toString();
    
    wrapper.style.position = "fixed";
    wrapper.style.top = rect.top + "px";
    wrapper.style.left = rect.left + "px";
    wrapper.style.width = startWidth + "px";
    wrapper.style.height = startHeight + "px";
    wrapper.style.margin = "0";
    wrapper.style.transform = "rotateX(0deg) rotateY(0deg)";

    const placeholder = document.createElement("div");
    placeholder.className = "card-placeholder";
    placeholder.style.width = startWidth + "px";
    placeholder.style.height = startHeight + "px";
    wrapper.parentNode?.insertBefore(placeholder, wrapper);

    document.body.classList.add("is-focused");
    document.documentElement.classList.add("is-focused");
    wrapper.classList.add("in-focus");
    focusBackdrop.classList.add("active");
    wrapper.classList.add("fading-front");
    flipper.classList.add("flipped");
    
    setIsActive(true);
    setIsFlipped(true);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        wrapper.classList.add("has-transition");

        const screenWidth = document.documentElement.clientWidth; 
        const screenHeight = window.innerHeight;
        const isMobile = screenWidth <= 768;
        
        let targetWidth, targetHeight, targetTop, targetLeft;
        
        if (isMobile) {
          const padding = 20; 
          targetWidth = screenWidth - (padding * 2); 
          targetLeft = padding;
        } else {
          targetWidth = 560;
          targetLeft = (screenWidth - targetWidth) / 2;
        }

        // Calculate dynamic height based on content
        let contentHeight = isMobile ? 520 : 640;
        const textContainer = wrapper.querySelector('.card-back-inner > div:nth-child(2)') as HTMLElement | null;
        if (textContainer) {
            const clone = textContainer.cloneNode(true) as HTMLElement;
            clone.style.setProperty('position', 'absolute', 'important');
            clone.style.setProperty('visibility', 'hidden', 'important');
            clone.style.setProperty('height', 'auto', 'important');
            clone.style.setProperty('width', targetWidth + 'px', 'important');
            document.body.appendChild(clone);
            
            const textHeight = clone.scrollHeight;
            document.body.removeChild(clone);
            
            const imgHeight = isMobile ? 200 : 220; // Height of the image container
            contentHeight = imgHeight + textHeight;
        }

        const minHeight = isMobile ? 480 : 540;
        const maxAllowedHeight = Math.max(minHeight, screenHeight - 64);
        targetHeight = Math.min(Math.max(contentHeight, minHeight), maxAllowedHeight);
        targetTop = Math.max(20, (screenHeight - targetHeight) / 2);

        wrapper.style.width = targetWidth + "px";
        wrapper.style.height = targetHeight + "px";
        wrapper.style.top = targetTop + "px";
        wrapper.style.left = targetLeft + "px";
      });
    });

    setTimeout(() => {
      wrapper.classList.add("show-back");
    }, 300);
  };

  const closeCard = () => {
    const wrapper = wrapperRef.current;
    if (!wrapper || disable) return;
    
    const flipper = wrapper.querySelector('.card-flipper');
    const focusBackdrop = document.getElementById('focusBackdrop');
    
    document.body.classList.remove("is-focused");
    document.documentElement.classList.remove("is-focused");
    if (focusBackdrop) focusBackdrop.classList.remove("active");
    wrapper.classList.remove("show-back");

    if (flipper) flipper.classList.remove("flipped");
    wrapper.classList.remove("in-focus");

    const placeholder = wrapper.previousElementSibling;
    if (placeholder && placeholder.classList.contains("card-placeholder")) {
      const rect = placeholder.getBoundingClientRect();
      const startWidth = parseFloat(wrapper.dataset.origWidth || '340');
      const startHeight = parseFloat(wrapper.dataset.origHeight || startWidth.toString());
      
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          wrapper.style.top = rect.top + "px";
          wrapper.style.left = rect.left + "px";
          wrapper.style.width = startWidth + "px";
          wrapper.style.height = startHeight + "px";
        });
      });
    }

    setTimeout(() => {
      wrapper.classList.remove("fading-front");
    }, 300);

    setIsActive(false);
    setIsFlipped(false);

    setTimeout(() => {
      if (!wrapper.classList.contains("in-focus")) {
        wrapper.classList.remove("has-transition");
        wrapper.style.position = "";
        wrapper.style.top = "";
        wrapper.style.left = "";
        wrapper.style.width = "";
        wrapper.style.height = "";
        wrapper.style.margin = "";
        wrapper.style.transform = "";
        delete wrapper.dataset.origWidth;
        delete wrapper.dataset.origHeight;
        
        if (placeholder && placeholder.classList.contains("card-placeholder")) {
          placeholder.remove();
        }
      }
    }, 800);
  };

  return { isFlipped, isActive, openCard, closeCard };
}
