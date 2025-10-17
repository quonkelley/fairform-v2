import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useCaseImport } from '@/lib/hooks/useCaseImport';
import { parseDemoNotice, isNoticeFileSupported } from '@/lib/demo/importNotice';
import { resetDemoStorage, demoCasesRepo, demoStepsRepo, getDemoStorageState } from '@/lib/demo/demoRepos';

// Mock the demo utilities
vi.mock('@/lib/demo/importNotice');
vi.mock('@/lib/demo/demoRepos');
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

const mockParseDemoNotice = vi.mocked(parseDemoNotice);
const mockIsNoticeFileSupported = vi.mocked(isNoticeFileSupported);
const mockResetDemoStorage = vi.mocked(resetDemoStorage);
const mockGetDemoStorageState = vi.mocked(getDemoStorageState);
const mockDemoCasesRepo = vi.mocked(demoCasesRepo);
const mockDemoStepsRepo = vi.mocked(demoStepsRepo);

describe('useCaseImport', () => {
  const mockUserId = 'test-user-123';
  const mockOnImportSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsNoticeFileSupported.mockReturnValue(true);
    mockGetDemoStorageState.mockReturnValue({
      cases: [],
      steps: [],
      reminders: [],
    });
  });

  it('initializes with idle state', () => {
    const { result } = renderHook(() => useCaseImport({ userId: mockUserId, onImportSuccess: mockOnImportSuccess }));
    
    expect(result.current.state.status).toBe('idle');
    expect(result.current.state.progress).toBe(0);
    expect(result.current.state.error).toBeNull();
    expect(result.current.state.showReplaceConfirmation).toBe(false);
  });

  it('handles file selection with valid file', async () => {
    const { result } = renderHook(() => useCaseImport({ userId: mockUserId, onImportSuccess: mockOnImportSuccess }));
    
    const mockFile = new File(['{"test": "data"}'], 'eviction.notice.json', { type: 'application/json' });
    
    mockParseDemoNotice.mockResolvedValue({
      success: true,
      data: {
        case: {
          caseType: 'eviction',
          jurisdiction: 'Marion County',
          caseNumber: '49K01-2510-EV-001234',
          title: 'Test Case',
          notes: 'Test notes',
          courtInfo: {
            code: '49K01',
            name: 'Test Court',
            address: '123 Test St',
            phone: '555-1234',
            hours: '9-5',
          },
          parties: {
            plaintiff: 'Test Plaintiff',
            defendant: 'Test Defendant',
          },
          propertyAddress: '123 Test St',
          rentOwed: '$1000',
          noticeDescription: 'Test notice',
        },
        timeline: {
          noticeDate: new Date('2025-01-01'),
          responseDueDate: new Date('2025-01-06'),
          hearingDate: new Date('2025-01-15'),
        },
        glossaryKeys: ['eviction-notice'],
        metadata: {
          source: 'test',
          filingFee: '$50',
          serviceFee: '$25',
        },
      },
    });

    mockDemoCasesRepo.createCase.mockResolvedValue({
      id: 'test-case-123',
      userId: mockUserId,
      caseType: 'eviction',
      jurisdiction: 'Marion County',
      status: 'active',
      title: 'Test Case',
      notes: 'Test notes',
      progressPct: 0,
      totalSteps: 0,
      completedSteps: 0,
      currentStep: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockDemoStepsRepo.createStep.mockResolvedValue({
      id: 'test-step-123',
      caseId: 'test-case-123',
      name: 'Test Step',
      order: 1,
      dueDate: new Date(),
      isComplete: false,
      completedAt: null,
    });

    await act(async () => {
      await result.current.handleFileSelect(mockFile);
    });

    expect(mockParseDemoNotice).toHaveBeenCalledWith('eviction.notice.json');
    expect(mockDemoCasesRepo.createCase).toHaveBeenCalled();
    expect(mockDemoStepsRepo.createStep).toHaveBeenCalledTimes(4);
  });

  it('handles file selection with invalid file type', async () => {
    const { result } = renderHook(() => useCaseImport({ userId: mockUserId, onImportSuccess: mockOnImportSuccess }));
    
    const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    
    await act(async () => {
      await result.current.handleFileSelect(mockFile);
    });

    expect(result.current.state.status).toBe('error');
    expect(result.current.state.error).toBe('Please select a JSON file');
  });

  it('handles file selection with unsupported file', async () => {
    const { result } = renderHook(() => useCaseImport({ userId: mockUserId, onImportSuccess: mockOnImportSuccess }));
    
    mockIsNoticeFileSupported.mockReturnValue(false);
    const mockFile = new File(['{"test": "data"}'], 'unsupported.notice.json', { type: 'application/json' });
    
    await act(async () => {
      await result.current.handleFileSelect(mockFile);
    });

    expect(result.current.state.status).toBe('error');
    expect(result.current.state.error).toContain('not supported');
  });

  it('shows replace confirmation when existing case is found', async () => {
    const { result } = renderHook(() => useCaseImport({ userId: mockUserId, onImportSuccess: mockOnImportSuccess }));
    
    // Mock existing case
    mockGetDemoStorageState.mockReturnValue({
      cases: [{
        id: 'existing-case-123',
        userId: mockUserId,
        caseType: 'eviction',
        jurisdiction: 'Marion County',
        status: 'active',
        title: 'Existing Case',
        notes: 'Existing notes',
        progressPct: 50,
        totalSteps: 4,
        completedSteps: 2,
        currentStep: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      }],
      steps: [],
      reminders: [],
    });

    const mockFile = new File(['{"test": "data"}'], 'eviction.notice.json', { type: 'application/json' });
    
    mockParseDemoNotice.mockResolvedValue({
      success: true,
      data: {
        case: {
          caseType: 'eviction',
          jurisdiction: 'Marion County',
          caseNumber: '49K01-2510-EV-001234',
          title: 'Test Case',
          notes: 'Test notes',
          courtInfo: {
            code: '49K01',
            name: 'Test Court',
            address: '123 Test St',
            phone: '555-1234',
            hours: '9-5',
          },
          parties: {
            plaintiff: 'Test Plaintiff',
            defendant: 'Test Defendant',
          },
          propertyAddress: '123 Test St',
          rentOwed: '$1000',
          noticeDescription: 'Test notice',
        },
        timeline: {
          noticeDate: new Date('2025-01-01'),
          responseDueDate: new Date('2025-01-06'),
          hearingDate: new Date('2025-01-15'),
        },
        glossaryKeys: ['eviction-notice'],
        metadata: {
          source: 'test',
          filingFee: '$50',
          serviceFee: '$25',
        },
      },
    });

    await act(async () => {
      await result.current.handleFileSelect(mockFile);
    });

    expect(result.current.state.showReplaceConfirmation).toBe(true);
    expect(result.current.state.status).toBe('idle');
  });

  it('handles replace confirmation', async () => {
    const { result } = renderHook(() => useCaseImport({ userId: mockUserId, onImportSuccess: mockOnImportSuccess }));
    
    // Mock existing case
    mockGetDemoStorageState.mockReturnValue({
      cases: [{
        id: 'existing-case-123',
        userId: mockUserId,
        caseType: 'eviction',
        jurisdiction: 'Marion County',
        status: 'active',
        title: 'Existing Case',
        notes: 'Existing notes',
        progressPct: 50,
        totalSteps: 4,
        completedSteps: 2,
        currentStep: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      }],
      steps: [],
      reminders: [],
    });

    const mockFile = new File(['{"test": "data"}'], 'eviction.notice.json', { type: 'application/json' });
    
    mockParseDemoNotice.mockResolvedValue({
      success: true,
      data: {
        case: {
          caseType: 'eviction',
          jurisdiction: 'Marion County',
          caseNumber: '49K01-2510-EV-001234',
          title: 'Test Case',
          notes: 'Test notes',
          courtInfo: {
            code: '49K01',
            name: 'Test Court',
            address: '123 Test St',
            phone: '555-1234',
            hours: '9-5',
          },
          parties: {
            plaintiff: 'Test Plaintiff',
            defendant: 'Test Defendant',
          },
          propertyAddress: '123 Test St',
          rentOwed: '$1000',
          noticeDescription: 'Test notice',
        },
        timeline: {
          noticeDate: new Date('2025-01-01'),
          responseDueDate: new Date('2025-01-06'),
          hearingDate: new Date('2025-01-15'),
        },
        glossaryKeys: ['eviction-notice'],
        metadata: {
          source: 'test',
          filingFee: '$50',
          serviceFee: '$25',
        },
      },
    });

    mockDemoCasesRepo.createCase.mockResolvedValue({
      id: 'test-case-123',
      userId: mockUserId,
      caseType: 'eviction',
      jurisdiction: 'Marion County',
      status: 'active',
      title: 'Test Case',
      notes: 'Test notes',
      progressPct: 0,
      totalSteps: 0,
      completedSteps: 0,
      currentStep: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockDemoStepsRepo.createStep.mockResolvedValue({
      id: 'test-step-123',
      caseId: 'test-case-123',
      name: 'Test Step',
      order: 1,
      dueDate: new Date(),
      isComplete: false,
      completedAt: null,
    });

    // First, trigger the replace confirmation
    await act(async () => {
      await result.current.handleFileSelect(mockFile);
    });

    expect(result.current.state.showReplaceConfirmation).toBe(true);

    // Then confirm the replace
    await act(async () => {
      result.current.handleReplaceConfirm();
    });

    expect(mockResetDemoStorage).toHaveBeenCalled();
    expect(mockParseDemoNotice).toHaveBeenCalledWith('eviction.notice.json');
  });

  it('handles replace cancellation', async () => {
    const { result } = renderHook(() => useCaseImport({ userId: mockUserId, onImportSuccess: mockOnImportSuccess }));
    
    // Set up replace confirmation state
    act(() => {
      result.current.state.showReplaceConfirmation = true;
    });

    await act(async () => {
      result.current.handleReplaceCancel();
    });

    expect(result.current.state.showReplaceConfirmation).toBe(false);
  });

  it('resets state correctly', () => {
    const { result } = renderHook(() => useCaseImport({ userId: mockUserId, onImportSuccess: mockOnImportSuccess }));
    
    // Set some state
    act(() => {
      result.current.state.status = 'error';
      result.current.state.error = 'Test error';
      result.current.state.progress = 50;
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.state.status).toBe('idle');
    expect(result.current.state.error).toBeNull();
    expect(result.current.state.progress).toBe(0);
    expect(result.current.state.showReplaceConfirmation).toBe(false);
  });

  it('handles parse errors', async () => {
    const { result } = renderHook(() => useCaseImport({ userId: mockUserId, onImportSuccess: mockOnImportSuccess }));
    
    const mockFile = new File(['{"test": "data"}'], 'eviction.notice.json', { type: 'application/json' });
    
    mockParseDemoNotice.mockResolvedValue({
      success: false,
      error: 'Invalid JSON format',
      code: 'INVALID_JSON',
    });

    await act(async () => {
      await result.current.handleFileSelect(mockFile);
    });

    expect(result.current.state.status).toBe('error');
    expect(result.current.state.error).toBe('Invalid JSON format');
  });
});
