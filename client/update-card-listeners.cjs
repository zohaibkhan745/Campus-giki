const fs = require('fs');

function addOutsideClick(file) {
  let code = fs.readFileSync(file, 'utf8');

  // Find the useEffect for body.is-focused
  const focusEffect = /useEffect\(\(\) => \{\s*if \(isFlipped\) \{\s*document\.body\.classList\.add\('is-focused'\);\s*\}\s*return \(\) => \{\s*if \(isFlipped\) \{\s*document\.body\.classList\.remove\('is-focused'\);\s*\}\s*\};\s*\}, \[isFlipped\]\);/;

  const newEffect = `useEffect(() => {
    if (isFlipped) {
      document.body.classList.add('is-focused');
      
      const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
        if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
          // It's an outside click, simulate handleClose
          setIsFlipped(false);
          if (wrapperRef.current) {
            wrapperRef.current.style.height = \`\${defaultHeight}px\`;
          }
          document.body.classList.remove('is-focused');
        }
      };
      
      document.addEventListener('click', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick, { passive: true });
      
      return () => {
        document.removeEventListener('click', handleOutsideClick);
        document.removeEventListener('touchstart', handleOutsideClick);
        document.body.classList.remove('is-focused');
      };
    }
  }, [isFlipped]);`;

  if (!code.includes('handleOutsideClick')) {
    code = code.replace(focusEffect, newEffect);
    fs.writeFileSync(file, code);
  }
}

addOutsideClick('src/components/feed/PostCard.tsx');
addOutsideClick('src/components/feed/EventCard.tsx');
