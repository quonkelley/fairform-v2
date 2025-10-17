import { renderHook, act } from '@testing-library/react';
import { vi, MockedFunction } from 'vitest';
import { useFormSession } from '@/lib/hooks/useFormSession';
import { loadFormTemplate } from '@/lib/forms/formLoader';
import { prefillFromCase } from '@/lib/forms/prefillData';
import type { FormTemplate } from '@/lib/forms/types';
import type { Case } from '@/lib/db/types';

// Mock the form loader and prefill functions
vi.mock('@/lib/forms/formLoader');
vi.mock('@/lib/forms/prefillData');

const mockLoadFormTemplate = loadFormTemplate as MockedFunction<typeof loadFormTemplate>;
const mockPrefillFromCase = prefillFromCase as MockedFunction<typeof prefillFromCase>;

describe('useFormSession', () => {
  const mockTemplate: FormTemplate = {
    formId: 'marion-appearance',
    title: 'Appearance Form',
    jurisdiction: 'marion-county-in',
    fields: [
      {
        id: 'full_name',
        label: "What's your full legal name?",
        type: 'text',
        required: true,
        pdfFieldName: 'defendant_name',
        helpText: 'Enter your name as it appears on legal documents'
      },
      {
        id: 'case_number',
        label: "What's your case number?",
        type: 'text',
        required: true,
        pdfFieldName: 'case_no',
        helpText: 'Found at the top of your court notice'
      },
      {
        id: 'hearing_date',
        label: "When is your hearing?",
        type: 'date',
        required: false,
        pdfFieldName: 'hearing_date'
      },
      {
        id: 'represent_self',
        label: 'Are you representing yourself?',
        type: 'checkbox',
        required: true,
        pdfFieldName: 'pro_se',
        placeholder: 'Yes, I am representing myself'
      }
    ]
  };

  const mockCaseData: Case = {
    id: 'case123',
    userId: 'user123',
    caseNumber: '12345-EV-2024',
    caseType: 'eviction',
    jurisdiction: 'Marion County',
    court: 'Marion County Court',
    plaintiff: 'Landlord LLC',
    defendant: 'John Doe',
    filingDate: new Date('2024-01-01'),
    nextHearingDate: new Date('2024-02-01'),
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockLoadFormTemplate.mockResolvedValue({
      success: true,
      data: mockTemplate
    });
    mockPrefillFromCase.mockReturnValue({
      case_number: '12345-EV-2024',
      hearing_date: new Date('2024-02-01')
    });
  });

  it('should load form template on mount', async () => {
    const { result } = renderHook(() => useFormSession('marion-appearance'));

    expect(result.current.isLoading).toBe(true);
    expect(mockLoadFormTemplate).toHaveBeenCalledWith('marion-appearance');

    // Wait for loading to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeUndefined();
    expect(result.current.currentField).toEqual(mockTemplate.fields[0]);
  });

  it('should handle form template loading error', async () => {
    mockLoadFormTemplate.mockResolvedValue({
      success: false,
      error: 'Template not found'
    });

    const { result } = renderHook(() => useFormSession('invalid-form'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Template not found');
    expect(result.current.currentField).toBeUndefined();
  });

  it('should prefill fields from case data', async () => {
    const { result } = renderHook(() => 
      useFormSession('marion-appearance', mockCaseData)
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockPrefillFromCase).toHaveBeenCalledWith(mockCaseData, mockTemplate);
    expect(result.current.fieldValues).toEqual({
      case_number: '12345-EV-2024',
      hearing_date: new Date('2024-02-01')
    });
  });

  it('should navigate to next field', async () => {
    const { result } = renderHook(() => useFormSession('marion-appearance'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Set value for current field
    act(() => {
      result.current.setFieldValue('full_name', 'John Doe');
    });

    expect(result.current.progress.current).toBe(1);

    // Navigate to next field
    act(() => {
      result.current.nextField();
    });

    expect(result.current.progress.current).toBe(2);
    expect(result.current.currentField?.id).toBe('case_number');
  });

  it('should navigate to previous field', async () => {
    const { result } = renderHook(() => useFormSession('marion-appearance'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Navigate to second field
    act(() => {
      result.current.setFieldValue('full_name', 'John Doe');
      result.current.nextField();
    });

    expect(result.current.progress.current).toBe(2);

    // Navigate back
    act(() => {
      result.current.previousField();
    });

    expect(result.current.progress.current).toBe(1);
    expect(result.current.currentField?.id).toBe('full_name');
  });

  it('should validate required fields', async () => {
    const { result } = renderHook(() => useFormSession('marion-appearance'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Try to navigate without filling required field
    act(() => {
      result.current.nextField();
    });

    expect(result.current.validationError).toBe("What's your full legal name? is required");
    expect(result.current.progress.current).toBe(1); // Should not advance
  });

  it('should clear validation error when field is filled', async () => {
    const { result } = renderHook(() => useFormSession('marion-appearance'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Try to navigate without filling required field
    act(() => {
      result.current.nextField();
    });

    expect(result.current.validationError).toBeTruthy();

    // Fill the field
    act(() => {
      result.current.setFieldValue('full_name', 'John Doe');
    });

    expect(result.current.validationError).toBeUndefined();
  });

  it('should determine completion status correctly', async () => {
    const { result } = renderHook(() => useFormSession('marion-appearance'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isComplete).toBe(false);

    // Fill all required fields and navigate to last field
    act(() => {
      result.current.setFieldValue('full_name', 'John Doe');
      result.current.nextField();
      result.current.setFieldValue('case_number', '12345');
      result.current.nextField();
      result.current.nextField(); // Skip optional date
      result.current.setFieldValue('represent_self', true);
    });

    expect(result.current.progress.current).toBe(4);
    expect(result.current.isComplete).toBe(true);
  });

  it('should update field values', async () => {
    const { result } = renderHook(() => useFormSession('marion-appearance'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    act(() => {
      result.current.setFieldValue('full_name', 'Jane Smith');
    });

    expect(result.current.fieldValues).toEqual({
      full_name: 'Jane Smith'
    });

    act(() => {
      result.current.setFieldValue('case_number', '98765');
    });

    expect(result.current.fieldValues).toEqual({
      full_name: 'Jane Smith',
      case_number: '98765'
    });
  });

  it('should provide accurate progress information', async () => {
    const { result } = renderHook(() => useFormSession('marion-appearance'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.progress).toEqual({
      current: 1,
      total: 4
    });

    // Navigate through fields
    act(() => {
      result.current.setFieldValue('full_name', 'John Doe');
      result.current.nextField();
    });

    expect(result.current.progress).toEqual({
      current: 2,
      total: 4
    });
  });
});
