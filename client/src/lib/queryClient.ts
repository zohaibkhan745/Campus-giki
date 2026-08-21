import { QueryClient, MutationCache } from '@tanstack/react-query';
import { globalNotification } from '@/contexts/NotificationContext';

export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onMutate: () => { globalNotification.triggerSync(); },
    onSuccess: () => { globalNotification.triggerCommitted(); },
    onError: (error) => { globalNotification.triggerFailed(); console.error(error); },
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
