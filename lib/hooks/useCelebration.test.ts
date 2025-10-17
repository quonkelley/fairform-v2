import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useCelebration } from './useCelebration';

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock celebration utils
vi.mock('@/lib/celebration/celebrationUtils', () => ({
  celebrateCaseCreation: vi.fn(),
  isFirstCase: vi.fn().mockResolvedValue(true),
}));

describe('useCelebration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with closed state', () => {
    const { result } = renderHook(() => useCelebration());

    expect(result.current.isOpen).toBe(false);
    expect(result.current.caseId).toBe(null);
    expect(result.current.caseTitle).toBe(null);
    expect(result.current.nextSteps).toEqual([]);
  });

  it('shows celebration modal with correct data', async () => {
    const { result } = renderHook(() => useCelebration());

    await act(async () => {
      await result.current.showCelebration('case-123', 'Test Case', 'user-456');
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.caseId).toBe('case-123');
    expect(result.current.caseTitle).toBe('Test Case');
    expect(result.current.nextSteps).toHaveLength(3);
    expect(result.current.nextSteps[0].title).toBe('View My Case');
    expect(result.current.nextSteps[1].title).toBe('Start First Step');
    expect(result.current.nextSteps[2].title).toBe('Learn About FairForm');
  });

  it('hides celebration modal', () => {
    const { result } = renderHook(() => useCelebration());

    act(() => {
      result.current.hideCelebration();
    });

    expect(result.current.isOpen).toBe(false);
  });

  it('handles errors gracefully', async () => {
    const { result } = renderHook(() => useCelebration());

    // Mock isFirstCase to throw an error
    const { isFirstCase } = await import('@/lib/celebration/celebrationUtils');
    vi.mocked(isFirstCase).mockRejectedValueOnce(new Error('Test error'));

    await act(async () => {
      await result.current.showCelebration('case-123', 'Test Case', 'user-456');
    });

    // Should still show the modal even if confetti fails
    expect(result.current.isOpen).toBe(true);
    expect(result.current.caseId).toBe('case-123');
    expect(result.current.caseTitle).toBe('Test Case');
    expect(result.current.nextSteps).toHaveLength(1); // Fallback to just view case
  });

  it('creates next steps with correct actions', async () => {
    const { result } = renderHook(() => useCelebration());

    await act(async () => {
      await result.current.showCelebration('case-123', 'Test Case', 'user-456');
    });

    const nextSteps = result.current.nextSteps;

    // Test View My Case action
    act(() => {
      nextSteps[0].action();
    });
    expect(mockPush).toHaveBeenCalledWith('/cases/case-123');
    expect(result.current.isOpen).toBe(false);

    // Reset for next test
    await act(async () => {
      await result.current.showCelebration('case-123', 'Test Case', 'user-456');
    });

    // Test Start First Step action
    act(() => {
      nextSteps[1].action();
    });
    expect(mockPush).toHaveBeenCalledWith('/cases/case-123/steps/1');
    expect(result.current.isOpen).toBe(false);

    // Reset for next test
    await act(async () => {
      await result.current.showCelebration('case-123', 'Test Case', 'user-456');
    });

    // Test Learn About FairForm action
    act(() => {
      nextSteps[2].action();
    });
    expect(mockPush).toHaveBeenCalledWith('/docs');
    expect(result.current.isOpen).toBe(false);
  });

  it('calls celebrateCaseCreation when isFirstCase returns true', async () => {
    const { celebrateCaseCreation } = await import('@/lib/celebration/celebrationUtils');
    const { result } = renderHook(() => useCelebration());

    await act(async () => {
      await result.current.showCelebration('case-123', 'Test Case', 'user-456');
    });

    expect(celebrateCaseCreation).toHaveBeenCalledTimes(1);
  });

  it('does not call celebrateCaseCreation when isFirstCase returns false', async () => {
    const { celebrateCaseCreation, isFirstCase } = await import('@/lib/celebration/celebrationUtils');
    vi.mocked(isFirstCase).mockResolvedValueOnce(false);
    
    const { result } = renderHook(() => useCelebration());

    await act(async () => {
      await result.current.showCelebration('case-123', 'Test Case', 'user-456');
    });

    expect(celebrateCaseCreation).not.toHaveBeenCalled();
  });

  it('maintains state correctly across multiple show/hide cycles', async () => {
    const { result } = renderHook(() => useCelebration());

    // First celebration
    await act(async () => {
      await result.current.showCelebration('case-1', 'First Case', 'user-123');
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.caseId).toBe('case-1');

    // Hide
    act(() => {
      result.current.hideCelebration();
    });

    expect(result.current.isOpen).toBe(false);

    // Second celebration
    await act(async () => {
      await result.current.showCelebration('case-2', 'Second Case', 'user-123');
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.caseId).toBe('case-2');
    expect(result.current.caseTitle).toBe('Second Case');
  });
});
