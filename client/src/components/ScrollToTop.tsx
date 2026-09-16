import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

export function ScrollToTop() {
  const { pathname } = useLocation();
  const action = useNavigationType();

  useEffect(() => {
    // Ensure any focus mode / modal overlay states from cards are cleared on route switch
    document.body.classList.remove('is-focused');
    document.documentElement.classList.remove('is-focused');

    // Only scroll to top on explicit navigation, not when pressing back button (POP)
    if (action !== 'POP') {
      const root = document.getElementById('root');
      if (root) {
        root.scrollTo({
          top: 0,
          left: 0,
          behavior: 'instant',
        });
      } else {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'instant',
        });
      }
    }
  }, [pathname, action]);

  return null;
}
