import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { useNavigationIndicator } from '../useNavigationIndicator';
import { ReactNode } from 'react';

// Mock useLocation from react-router-dom
const mockLocation = {
  pathname: '/',
  search: '',
  hash: '',
  state: null,
  key: 'default',
};

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: () => mockLocation,
  };
});

// Wrapper component for the hook that provides router context
function createWrapper(initialEntries: string[] = ['/']) {
  return ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={initialEntries}>
      {children}
    </MemoryRouter>
  );
}

describe('useNavigationIndicator', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('should return true initially then false after 300ms', async () => {
    const { result } = renderHook(() => useNavigationIndicator(), {
      wrapper: createWrapper(),
    });

    // Hook starts with true because useEffect triggers on mount
    expect(result.current).toBe(true);

    // After 300ms should be false
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe(false);
  });

  it('should return true immediately when location changes', () => {
    const { result, rerender } = renderHook(() => useNavigationIndicator(), {
      wrapper: createWrapper(['/initial']),
    });

    // Initially true due to mount effect
    expect(result.current).toBe(true);

    // Let initial navigation complete
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe(false);

    // Change location
    mockLocation.pathname = '/new-path';

    // Force re-render to trigger useEffect
    rerender();

    // Should be true immediately after location change
    expect(result.current).toBe(true);
  });

  it('should return false after 300ms delay', () => {
    const { result, rerender } = renderHook(() => useNavigationIndicator(), {
      wrapper: createWrapper(['/initial']),
    });

    // Change location
    mockLocation.pathname = '/new-path';
    rerender();

    // Should be true immediately
    expect(result.current).toBe(true);

    // Fast-forward time by 300ms
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Should be false after 300ms
    expect(result.current).toBe(false);
  });

  it('should not return false before 300ms', () => {
    const { result, rerender } = renderHook(() => useNavigationIndicator(), {
      wrapper: createWrapper(['/initial']),
    });

    // Change location
    mockLocation.pathname = '/another-path';
    rerender();

    // Should be true immediately
    expect(result.current).toBe(true);

    // Fast-forward time by 299ms (just before the timeout)
    act(() => {
      vi.advanceTimersByTime(299);
    });

    // Should still be true
    expect(result.current).toBe(true);

    // Fast-forward the remaining 1ms
    act(() => {
      vi.advanceTimersByTime(1);
    });

    // Now should be false
    expect(result.current).toBe(false);
  });

  it('should reset timer when location changes again before timeout', () => {
    const { result, rerender } = renderHook(() => useNavigationIndicator(), {
      wrapper: createWrapper(['/initial']),
    });

    // First location change
    mockLocation.pathname = '/first-change';
    rerender();
    expect(result.current).toBe(true);

    // Fast-forward 150ms (halfway through)
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(result.current).toBe(true);

    // Second location change before first timeout completes
    mockLocation.pathname = '/second-change';
    rerender();
    expect(result.current).toBe(true);

    // Fast-forward another 150ms (300ms total from first change, but only 150ms from second)
    act(() => {
      vi.advanceTimersByTime(150);
    });

    // Should still be true because the timer was reset
    expect(result.current).toBe(true);

    // Fast-forward the remaining 150ms to complete the second timeout
    act(() => {
      vi.advanceTimersByTime(150);
    });

    // Now should be false
    expect(result.current).toBe(false);
  });

  it('should handle multiple rapid location changes', () => {
    const { result, rerender } = renderHook(() => useNavigationIndicator(), {
      wrapper: createWrapper(['/initial']),
    });

    // Multiple rapid changes
    mockLocation.pathname = '/path1';
    rerender();
    expect(result.current).toBe(true);

    act(() => {
      vi.advanceTimersByTime(50);
    });

    mockLocation.pathname = '/path2';
    rerender();
    expect(result.current).toBe(true);

    act(() => {
      vi.advanceTimersByTime(50);
    });

    mockLocation.pathname = '/path3';
    rerender();
    expect(result.current).toBe(true);

    // Fast-forward less than 300ms from the last change
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(result.current).toBe(true);

    // Complete the timeout from the last change
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(result.current).toBe(false);
  });

  it('should clean up timer on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

    const { unmount, rerender } = renderHook(() => useNavigationIndicator(), {
      wrapper: createWrapper(),
    });

    // Trigger navigation
    mockLocation.pathname = '/new-path';
    rerender();

    // Unmount before timeout completes
    unmount();

    // Verify clearTimeout was called
    expect(clearTimeoutSpy).toHaveBeenCalled();

    clearTimeoutSpy.mockRestore();
  });

  it('should work with different pathname formats', () => {
    const { result, rerender } = renderHook(() => useNavigationIndicator(), {
      wrapper: createWrapper(),
    });

    const testPaths = [
      '/home',
      '/podcasts/123',
      '/podcasts/123/episodes/456',
      '/search?q=test',
      '/profile#settings',
    ];

    testPaths.forEach((path) => {
      mockLocation.pathname = path;
      rerender();

      expect(result.current).toBe(true);

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(result.current).toBe(false);
    });
  });

  it('should only trigger on pathname changes, not other location properties', () => {
    const { result, rerender } = renderHook(() => useNavigationIndicator(), {
      wrapper: createWrapper(),
    });

    // Initial state - true due to mount effect
    expect(result.current).toBe(true);

    // Wait for initial navigation to complete
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe(false);

    // Change search without changing pathname
    mockLocation.search = '?newQuery=test';
    rerender();

    // Should still be false because pathname didn't change
    expect(result.current).toBe(false);

    // Change hash without changing pathname
    mockLocation.hash = '#newHash';
    rerender();

    // Should still be false
    expect(result.current).toBe(false);

    // Now change pathname
    mockLocation.pathname = '/new-path';
    rerender();

    // Should be true because pathname changed
    expect(result.current).toBe(true);
  });
});