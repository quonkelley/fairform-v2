import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { CaseImportCard } from '@/components/demo/CaseImportCard';
import { parseDemoNotice, isNoticeFileSupported } from '@/lib/demo/importNotice';
import { resetDemoStorage, demoCasesRepo, demoStepsRepo } from '@/lib/demo/demoRepos';

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
const mockDemoCasesRepo = vi.mocked(demoCasesRepo);
const mockDemoStepsRepo = vi.mocked(demoStepsRepo);

describe('CaseImportCard', () => {
  const mockUserId = 'test-user-123';
  const mockOnImportSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsNoticeFileSupported.mockReturnValue(true);
  });

  it('renders upload area by default', () => {
    render(<CaseImportCard userId={mockUserId} onImportSuccess={mockOnImportSuccess} />);
    
    expect(screen.getByText('Case Import')).toBeInTheDocument();
    expect(screen.getByText('Upload an eviction notice or manually enter case details to create a new case')).toBeInTheDocument();
    expect(screen.getByText('Upload Eviction Notice')).toBeInTheDocument();
    expect(screen.getByText('Choose File')).toBeInTheDocument();
  });

  it('handles file selection via file input', async () => {
    const user = userEvent.setup();
    render(<CaseImportCard userId={mockUserId} onImportSuccess={mockOnImportSuccess} />);
    
    const fileInput = screen.getByLabelText('Select eviction notice file');
    const file = new File(['{"test": "data"}'], 'eviction.notice.json', { type: 'application/json' });
    
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

    await user.upload(fileInput, file);

    expect(mockParseDemoNotice).toHaveBeenCalledWith('eviction.notice.json');
  });

  it('shows error for unsupported file types', async () => {
    render(<CaseImportCard userId={mockUserId} onImportSuccess={mockOnImportSuccess} />);
    
    const fileInput = screen.getByLabelText('Select eviction notice file');
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    
    // Use fireEvent.change instead of user.upload
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/Please select a JSON file/)).toBeInTheDocument();
    });
  });

  it('shows error for unsupported file names', async () => {
    const user = userEvent.setup();
    render(<CaseImportCard userId={mockUserId} onImportSuccess={mockOnImportSuccess} />);
    
    mockIsNoticeFileSupported.mockReturnValue(false);
    
    const fileInput = screen.getByLabelText('Select eviction notice file');
    const file = new File(['{"test": "data"}'], 'unsupported.notice.json', { type: 'application/json' });
    
    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByText(/not supported/)).toBeInTheDocument();
    });
  });

  it('shows manual entry form when button is clicked', async () => {
    const user = userEvent.setup();
    render(<CaseImportCard userId={mockUserId} onImportSuccess={mockOnImportSuccess} />);
    
    const manualEntryButton = screen.getByText('Manual Entry Instead');
    await user.click(manualEntryButton);

    expect(screen.getByText('Manual Case Entry')).toBeInTheDocument();
    expect(screen.getByLabelText('Case Number *')).toBeInTheDocument();
    expect(screen.getByText('Create Case')).toBeInTheDocument();
  });

  it('handles manual entry form submission', async () => {
    const user = userEvent.setup();
    render(<CaseImportCard userId={mockUserId} onImportSuccess={mockOnImportSuccess} />);
    
    // Open manual entry form
    const manualEntryButton = screen.getByText('Manual Entry Instead');
    await user.click(manualEntryButton);

    // Fill out form
    const caseNumberInput = screen.getByLabelText('Case Number *');
    await user.type(caseNumberInput, '49K01-2510-EV-001234');

    const titleInput = screen.getByLabelText('Title');
    await user.type(titleInput, 'Test Manual Case');

    const notesInput = screen.getByLabelText('Notes');
    await user.type(notesInput, 'Test manual entry notes');

    // Mock repository responses
    mockDemoCasesRepo.createCase.mockResolvedValue({
      id: 'test-case-123',
      userId: mockUserId,
      caseType: 'eviction',
      jurisdiction: 'Marion County',
      status: 'active',
      title: 'Test Manual Case',
      notes: 'Test manual entry notes',
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

    // Submit form
    const submitButton = screen.getByText('Create Case');
    await user.click(submitButton);

    expect(mockResetDemoStorage).toHaveBeenCalled();
    expect(mockDemoCasesRepo.createCase).toHaveBeenCalledWith({
      userId: mockUserId,
      caseType: 'eviction',
      jurisdiction: 'Marion County',
      title: 'Test Manual Case',
      notes: 'Test manual entry notes',
    });
  });

  it('handles drag and drop file upload', async () => {
    render(<CaseImportCard userId={mockUserId} onImportSuccess={mockOnImportSuccess} />);
    
    const uploadArea = screen.getByLabelText('Upload eviction notice file');
    const file = new File(['{"test": "data"}'], 'eviction.notice.json', { type: 'application/json' });
    
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

    fireEvent.drop(uploadArea, {
      dataTransfer: {
        files: [file],
      },
    });

    expect(mockParseDemoNotice).toHaveBeenCalledWith('eviction.notice.json');
  });

  it('shows processing state during file upload', async () => {
    const user = userEvent.setup();
    render(<CaseImportCard userId={mockUserId} onImportSuccess={mockOnImportSuccess} />);
    
    const fileInput = screen.getByLabelText('Select eviction notice file');
    const file = new File(['{"test": "data"}'], 'eviction.notice.json', { type: 'application/json' });
    
    // Mock a delayed response
    mockParseDemoNotice.mockImplementation(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({
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
        }), 100)
      )
    );

    await user.upload(fileInput, file);

    expect(screen.getByText('Processing Notice')).toBeInTheDocument();
    expect(screen.getByText('Scanning and parsing your eviction notice...')).toBeInTheDocument();
  });

  it('handles parse errors gracefully', async () => {
    const user = userEvent.setup();
    render(<CaseImportCard userId={mockUserId} onImportSuccess={mockOnImportSuccess} />);
    
    const fileInput = screen.getByLabelText('Select eviction notice file');
    const file = new File(['{"test": "data"}'], 'eviction.notice.json', { type: 'application/json' });
    
    mockParseDemoNotice.mockResolvedValue({
      success: false,
      error: 'Invalid JSON format',
      code: 'INVALID_JSON',
    });

    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getAllByText(/Import Failed/)).toHaveLength(2); // Title and description
      expect(screen.getByText(/Invalid JSON format/)).toBeInTheDocument();
    });
  });
});
