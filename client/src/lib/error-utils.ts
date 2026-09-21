export type ErrorCategory =
  | 'offline'
  | 'server_unreachable'
  | 'server_error'
  | 'not_found'
  | 'unauthorized'
  | 'generic';

export interface CategorizedError {
  category: ErrorCategory;
  badge: string;
  title: string;
  message: string;
  suggestedAction: string;
  isRetryable: boolean;
}

/**
 * Inspects any error (AxiosError, NetworkError, standard Error, string) and categorizes it
 * into human-centered terminology according to HCI feedback principles.
 */
export function categorizeError(error: unknown, fallbackMessage?: string): CategorizedError {
  if (typeof window !== 'undefined' && !navigator.onLine) {
    return {
      category: 'offline',
      badge: 'You are Offline',
      title: 'No Internet Connection',
      message: 'Your device seems to be offline. Please check your Wi-Fi or mobile network to continue browsing Campus GIKI.',
      suggestedAction: 'Try Reconnecting',
      isRetryable: true,
    };
  }

  const err = error as any;
  const status = err?.response?.status;
  const code = err?.code;
  const rawMessage =
    typeof error === 'string'
      ? error
      : err?.response?.data?.message || err?.message || '';

  // Network / Connection errors (Backend not running, CORS issue, timeout, DNS resolution)
  if (
    code === 'ERR_NETWORK' ||
    code === 'ECONNABORTED' ||
    rawMessage === 'Network Error' ||
    (err?.isAxiosError && !err.response) ||
    status === 502 ||
    status === 503 ||
    status === 504
  ) {
    return {
      category: 'server_unreachable',
      badge: 'Campus Server Offline',
      title: 'Unable to Reach Campus Hub',
      message: 'The Campus GIKI backend service is currently unreachable or starting up. Please try reconnecting in a moment.',
      suggestedAction: 'Try Reconnecting',
      isRetryable: true,
    };
  }

  // Not Found errors (404)
  if (status === 404) {
    return {
      category: 'not_found',
      badge: '404 Not Found',
      title: 'Resource Not Found',
      message: typeof rawMessage === 'string' && rawMessage
        ? rawMessage
        : 'The item or page you are looking for does not exist, may have been deleted, or the link has changed.',
      suggestedAction: 'Explore Campus Feed',
      isRetryable: false,
    };
  }

  // Authentication errors (401 / 403)
  if (status === 401 || status === 403) {
    return {
      category: 'unauthorized',
      badge: 'Authentication Required',
      title: 'Session Expired or Unauthorized',
      message: 'Your active session is either expired or does not have permission to view this campus record.',
      suggestedAction: 'Sign In Again',
      isRetryable: false,
    };
  }

  // Server error (500)
  if (status === 500) {
    return {
      category: 'server_error',
      badge: 'Campus Server Error',
      title: 'Unexpected Server Response',
      message: 'Our campus systems encountered an unexpected hiccup while processing this request. The team has been notified.',
      suggestedAction: 'Try Again',
      isRetryable: true,
    };
  }

  // Default / Generic error
  const displayMsg =
    typeof rawMessage === 'string' && rawMessage
      ? rawMessage
      : fallbackMessage || 'Something went wrong while loading this content. Please try again.';

  return {
    category: 'generic',
    badge: 'Notice',
    title: 'Unable to Load Content',
    message: displayMsg,
    suggestedAction: 'Try Again',
    isRetryable: true,
  };
}
