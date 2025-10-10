import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

import { CaseJourneyMap } from "@/components/case-journey/case-journey-map";
import type { CaseStep } from "@/lib/validation";

// Mock the useCaseSteps hook
vi.mock("@/lib/hooks/useCaseSteps", () => ({
  useCaseSteps: vi.fn(),
}));

// Mock the useCompleteStep hook
vi.mock("@/lib/hooks/useCompleteStep", () => ({
  useCompleteStep: vi.fn(),
}));

import { useCaseSteps } from "@/lib/hooks/useCaseSteps";
import { useCompleteStep } from "@/lib/hooks/useCompleteStep";

const mockUseCaseSteps = vi.mocked(useCaseSteps);
const mockUseCompleteStep = vi.mocked(useCompleteStep);

// Create wrapper for React Query
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("CaseJourneyMap", () => {
  const mockSteps: CaseStep[] = [
    {
      id: "step1",
      caseId: "case123",
      name: "File Complaint",
      order: 1,
      dueDate: new Date("2025-11-01"),
      isComplete: true,
      completedAt: new Date("2025-10-15"),
    },
    {
      id: "step2",
      caseId: "case123",
      name: "Serve Defendant",
      order: 2,
      dueDate: new Date("2025-11-15"),
      isComplete: false,
      completedAt: null,
    },
    {
      id: "step3",
      caseId: "case123",
      name: "Attend Hearing",
      order: 3,
      dueDate: null,
      isComplete: false,
      completedAt: null,
    },
  ];

  const mockCompleteStep = {
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    isSuccess: false,
    error: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCompleteStep.mockReturnValue(mockCompleteStep as any);
  });

  it("should render loading state", () => {
    mockUseCaseSteps.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as any);

    render(<CaseJourneyMap caseId="case123" />, { wrapper: createWrapper() });

    expect(screen.getByText("Loading your case journey")).toBeInTheDocument();
    expect(screen.getByText("Fetching your case steps...")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /case journey timeline/i })).toHaveAttribute("aria-busy", "true");
  });

  it("should render error state", () => {
    mockUseCaseSteps.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error("Failed to fetch steps"),
    } as any);

    render(<CaseJourneyMap caseId="case123" />, { wrapper: createWrapper() });

    expect(screen.getByText("Unable to load case journey")).toBeInTheDocument();
    expect(screen.getByText("Failed to fetch steps")).toBeInTheDocument();
    expect(screen.getByText(/please refresh the page/i)).toBeInTheDocument();
  });

  it("should render empty state when no steps", () => {
    mockUseCaseSteps.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    render(<CaseJourneyMap caseId="case123" />, { wrapper: createWrapper() });

    expect(screen.getByText("No steps found")).toBeInTheDocument();
    expect(
      screen.getByText(/this case doesn't have any steps yet/i)
    ).toBeInTheDocument();
  });

  it("should render steps in correct order", () => {
    mockUseCaseSteps.mockReturnValue({
      data: mockSteps,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    render(<CaseJourneyMap caseId="case123" />, { wrapper: createWrapper() });

    expect(screen.getByText("Your Case Journey")).toBeInTheDocument();
    expect(screen.getByText("File Complaint")).toBeInTheDocument();
    expect(screen.getByText("Serve Defendant")).toBeInTheDocument();
    expect(screen.getByText("Attend Hearing")).toBeInTheDocument();
  });

  it("should display step order numbers", () => {
    mockUseCaseSteps.mockReturnValue({
      data: mockSteps,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    render(<CaseJourneyMap caseId="case123" />, { wrapper: createWrapper() });

    // StepNode now displays order as "X/Total"
    expect(screen.getByText("1/3")).toBeInTheDocument();
    expect(screen.getByText("2/3")).toBeInTheDocument();
    expect(screen.getByText("3/3")).toBeInTheDocument();
  });

  it("should display due dates when present", () => {
    mockUseCaseSteps.mockReturnValue({
      data: mockSteps,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    render(<CaseJourneyMap caseId="case123" />, { wrapper: createWrapper() });

    // Check for "Due:" prefix in due dates
    const dueDates = screen.getAllByText(/^Due:/);
    expect(dueDates).toHaveLength(2); // Only steps 1 and 2 have due dates
  });

  it("should not display due date for steps without one", () => {
    mockUseCaseSteps.mockReturnValue({
      data: mockSteps,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    const { container } = render(<CaseJourneyMap caseId="case123" />, { wrapper: createWrapper() });

    // Get the third step's container
    const stepElements = container.querySelectorAll("li");
    const thirdStep = stepElements[2];

    // The third step (Attend Hearing) shouldn't have a due date
    expect(thirdStep.textContent).not.toContain("Due:");
  });

  it("should have accessible region landmark", () => {
    mockUseCaseSteps.mockReturnValue({
      data: mockSteps,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    render(<CaseJourneyMap caseId="case123" />, { wrapper: createWrapper() });

    const region = screen.getByRole("region", {
      name: /case journey timeline/i,
    });
    expect(region).toBeInTheDocument();
  });

  it("should use semantic HTML with ordered list", () => {
    mockUseCaseSteps.mockReturnValue({
      data: mockSteps,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    const { container } = render(<CaseJourneyMap caseId="case123" />, { wrapper: createWrapper() });

    const ol = container.querySelector("ol");
    expect(ol).toBeInTheDocument();

    const listItems = container.querySelectorAll("ol > li");
    expect(listItems).toHaveLength(3);
  });

  it("should pass caseId to useCaseSteps hook", () => {
    mockUseCaseSteps.mockReturnValue({
      data: mockSteps,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    render(<CaseJourneyMap caseId="test-case-123" />, { wrapper: createWrapper() });

    expect(mockUseCaseSteps).toHaveBeenCalledWith("test-case-123");
  });

  it("should handle error without message gracefully", () => {
    mockUseCaseSteps.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: null, // Error object is null
    } as any);

    render(<CaseJourneyMap caseId="case123" />, { wrapper: createWrapper() });

    expect(
      screen.getByText(/an unexpected error occurred/i)
    ).toBeInTheDocument();
  });
});
