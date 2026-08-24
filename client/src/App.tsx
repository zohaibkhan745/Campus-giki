import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/queryClient';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AppRoutes } from '@/routes/AppRoutes';
import { ScrollToTop } from '@/components/ScrollToTop';

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
          <ErrorBoundary>
            <BrowserRouter>
              <ScrollToTop />
              <img className="bg-wallpaper" src="https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=1920&q=80" alt="Background Wallpaper" />
              <div className="bg-overlay"></div>
              <AppRoutes />
              <div className="focus-backdrop" id="focusBackdrop"></div>
            </BrowserRouter>
          </ErrorBoundary>
        </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default App;
