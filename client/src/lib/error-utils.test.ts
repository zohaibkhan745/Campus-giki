import { describe, it, expect } from 'vitest';
import { categorizeError } from './error-utils';

describe('categorizeError utility', () => {
  it('correctly categorizes ERR_NETWORK / server offline', () => {
    const error = {
      isAxiosError: true,
      code: 'ERR_NETWORK',
      message: 'Network Error',
    };
    const result = categorizeError(error);
    expect(result.category).toBe('server_unreachable');
    expect(result.badge).toBe('Campus Server Offline');
    expect(result.title).toBe('Unable to Reach Campus Hub');
  });

  it('correctly categorizes HTTP 404 as not_found', () => {
    const error = {
      isAxiosError: true,
      response: {
        status: 404,
        data: { message: 'Society not found' },
      },
    };
    const result = categorizeError(error);
    expect(result.category).toBe('not_found');
    expect(result.badge).toBe('404 Not Found');
    expect(result.message).toBe('Society not found');
  });

  it('correctly categorizes HTTP 500 as server_error', () => {
    const error = {
      isAxiosError: true,
      response: {
        status: 500,
        data: { message: 'Internal Server Error' },
      },
    };
    const result = categorizeError(error);
    expect(result.category).toBe('server_error');
    expect(result.badge).toBe('Campus Server Error');
  });

  it('correctly categorizes HTTP 401 as unauthorized', () => {
    const error = {
      isAxiosError: true,
      response: {
        status: 401,
        data: { message: 'Session expired' },
      },
    };
    const result = categorizeError(error);
    expect(result.category).toBe('unauthorized');
    expect(result.badge).toBe('Authentication Required');
  });

  it('handles null, undefined or unknown errors gracefully', () => {
    const resultNull = categorizeError(null);
    expect(resultNull.category).toBe('generic');
    expect(resultNull.badge).toBe('Notice');

    const resultUndefined = categorizeError(undefined);
    expect(resultUndefined.category).toBe('generic');

    const resultString = categorizeError('Something weird happened');
    expect(resultString.category).toBe('generic');
    expect(resultString.message).toBe('Something weird happened');
  });
});
