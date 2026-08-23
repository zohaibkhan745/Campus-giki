import { QueryClient, MutationCache } from '@tanstack/react-query';
import { globalNotification } from '@/contexts/NotificationContext';

export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    // sync removed
    onSuccess: (_, __, ___, mutation) => { if (mutation?.meta?.notify === true) globalNotification.triggerSuccess(); },
    onError: (error, _, __, mutation) => { if (mutation?.meta?.notify === true) { const msg = (error as any)?.response?.data?.message; const text = Array.isArray(msg) ? msg.join(', ') : msg; globalNotification.triggerFailed(text); } console.error(error); },
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes stale time
      gcTime: 1000 * 60 * 30, // 30 minutes garbage collection time
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

