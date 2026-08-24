import { useEffect, useState, RefObject } from 'react';

export function useCardFlip(wrapperRef: RefObject<HTMLDivElement>) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isActive, setIsActive] = useState(false); // represents 'in-focus'

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (wrapper.classList.contains('in-focus')) return;
      const rect = wrapper.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;
      wrapper.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };

    const handleMouseLeave = () => {
      if (!wrapper.classList.contains('in-focus')) {
        wrapper.style.transform = 'rotateX(0deg) rotateY(0deg)';
      }
    };

    wrapper.addEventListener('mousemove', handleMouseMove);
    wrapper.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      wrapper.removeEventListener('mousemove', handleMouseMove);
      wrapper.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [wrapperRef]);

  const openCard = (isEvent: boolean) => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    
    const flipper = wrapper.querySelector('.card-flipper');
    const focusBackdrop = document.getElementById('focusBackdrop');
    if (!flipper || !focusBackdrop) return;

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
          targetHeight = isEvent ? targetWidth : targetWidth;
          targetTop = (screenHeight - targetHeight) / 2;
          targetLeft = padding;
        } else {
          targetWidth = 560; 
          targetHeight = 560;
          targetTop = (screenHeight - targetHeight) / 2;
          targetLeft = (screenWidth - targetWidth) / 2;
        }

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
    if (!wrapper) return;
    
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
