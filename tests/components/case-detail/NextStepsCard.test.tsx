import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NextStepsCard } from "@/components/case-detail/NextStepsCard";
import { NextStepItem } from "@/components/case-detail/NextStepItem";
import type { NextStep } from "@/lib/nextSteps/generate";
import * as useNextStepsModule from "@/lib/hooks/useNextSteps";

// Create a fresh QueryClient for each test
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}

function renderWithQueryClient(component: React.ReactElement) {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
  );
}

describe("NextStepsCard", () => {
  describe("Component Rendering", () => {
    it("should render card with heading", () => {
      vi.spyOn(useNextStepsModule, "useNextSteps").mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      } as any);

      renderWithQueryClient(<NextStepsCard caseType="small_claims" currentStep={1} />);

      expect(screen.getByRole("region", { name: /next steps/i })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: /your next steps/i })).toBeInTheDocument();
    });

    it("should display formatted case type", () => {
      vi.spyOn(useNextStepsModule, "useNextSteps").mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      } as any);

      renderWithQueryClient(<NextStepsCard caseType="small_claims" currentStep={1} />);

      expect(screen.getByText(/small claims case/i)).toBeInTheDocument();
    });
  });

  describe("Loading State", () => {
    it("should show spinner when loading", () => {
      vi.spyOn(useNextStepsModule, "useNextSteps").mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
      } as any);

      renderWithQueryClient(<NextStepsCard caseType="small_claims" currentStep={1} />);

      expect(screen.getByText(/loading next steps/i)).toBeInTheDocument();
    });
  });

  describe("Error State", () => {
    it("should show error message when error occurs", () => {
      vi.spyOn(useNextStepsModule, "useNextSteps").mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
      } as any);

      renderWithQueryClient(<NextStepsCard caseType="small_claims" currentStep={1} />);

      expect(screen.getByText(/unable to load next steps/i)).toBeInTheDocument();
      expect(screen.getByText(/refresh the page/i)).toBeInTheDocument();
    });
  });

  describe("Empty State", () => {
    it("should show empty message when no steps available", () => {
      vi.spyOn(useNextStepsModule, "useNextSteps").mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      } as any);

      renderWithQueryClient(<NextStepsCard caseType="small_claims" currentStep={1} />);

      expect(screen.getByText(/no specific next steps available/i)).toBeInTheDocument();
    });

    it("should show different message when no current step", () => {
      vi.spyOn(useNextStepsModule, "useNextSteps").mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      } as any);

      renderWithQueryClient(<NextStepsCard caseType="small_claims" currentStep={undefined} />);

      expect(screen.getByText(/complete your first step/i)).toBeInTheDocument();
    });
  });

  describe("Next Steps Display", () => {
    const mockNextSteps: NextStep[] = [
      {
        id: "step-1",
        title: "Download court form",
        description: "Get the form from court website",
        actionType: "form",
        estimatedTime: 10,
        priority: "high",
      },
      {
        id: "step-2",
        title: "Gather documents",
        description: "Collect all supporting evidence",
        actionType: "document",
        estimatedTime: 30,
        priority: "high",
      },
      {
        id: "step-3",
        title: "Review requirements",
        description: "Check filing requirements",
        actionType: "review",
        estimatedTime: 15,
        priority: "medium",
      },
    ];

    it("should render all next steps", () => {
      vi.spyOn(useNextStepsModule, "useNextSteps").mockReturnValue({
        data: mockNextSteps,
        isLoading: false,
        isError: false,
      } as any);

      renderWithQueryClient(<NextStepsCard caseType="small_claims" currentStep={1} />);

      expect(screen.getByText("Download court form")).toBeInTheDocument();
      expect(screen.getByText("Gather documents")).toBeInTheDocument();
      expect(screen.getByText("Review requirements")).toBeInTheDocument();
    });

    it("should render steps as list items", () => {
      vi.spyOn(useNextStepsModule, "useNextSteps").mockReturnValue({
        data: mockNextSteps,
        isLoading: false,
        isError: false,
      } as any);

      renderWithQueryClient(<NextStepsCard caseType="small_claims" currentStep={1} />);

      const list = screen.getByRole("list");
      expect(list).toBeInTheDocument();

      const listItems = screen.getAllByRole("listitem");
      expect(listItems).toHaveLength(3);
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", () => {
      vi.spyOn(useNextStepsModule, "useNextSteps").mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      } as any);

      renderWithQueryClient(<NextStepsCard caseType="small_claims" currentStep={1} />);

      expect(screen.getByRole("region", { name: /next steps/i })).toBeInTheDocument();
    });

    it("should have proper heading hierarchy", () => {
      vi.spyOn(useNextStepsModule, "useNextSteps").mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
      } as any);

      renderWithQueryClient(<NextStepsCard caseType="small_claims" currentStep={1} />);

      const heading = screen.getByRole("heading", { name: /your next steps/i });
      expect(heading.tagName).toBe("H2");
    });
  });
});

describe("NextStepItem", () => {
  const mockStep: NextStep = {
    id: "test-step",
    title: "Test Next Step",
    description: "This is a test description",
    actionType: "form",
    estimatedTime: 30,
    priority: "high",
  };

  it("should render step title", () => {
    render(<NextStepItem step={mockStep} index={0} />);

    expect(screen.getByText("Test Next Step")).toBeInTheDocument();
  });

  it("should render step description", () => {
    render(<NextStepItem step={mockStep} index={0} />);

    expect(screen.getByText("This is a test description")).toBeInTheDocument();
  });

  it("should display step number", () => {
    render(<NextStepItem step={mockStep} index={0} />);

    expect(screen.getByLabelText("Step 1")).toBeInTheDocument();
  });

  it("should show estimated time when provided", () => {
    render(<NextStepItem step={mockStep} index={0} />);

    expect(screen.getByText(/30 min/i)).toBeInTheDocument();
  });

  it("should not show estimated time when zero", () => {
    const stepWithoutTime = { ...mockStep, estimatedTime: 0 };
    render(<NextStepItem step={stepWithoutTime} index={0} />);

    expect(screen.queryByText(/min/i)).not.toBeInTheDocument();
  });

  it("should show priority badge for high priority steps", () => {
    render(<NextStepItem step={mockStep} index={0} />);

    expect(screen.getByText("Priority")).toBeInTheDocument();
  });

  it("should not show priority badge for medium priority", () => {
    const mediumPriorityStep = { ...mockStep, priority: "medium" as const };
    render(<NextStepItem step={mediumPriorityStep} index={0} />);

    expect(screen.queryByText("Priority")).not.toBeInTheDocument();
  });

  it("should not show priority badge for low priority", () => {
    const lowPriorityStep = { ...mockStep, priority: "low" as const };
    render(<NextStepItem step={lowPriorityStep} index={0} />);

    expect(screen.queryByText("Priority")).not.toBeInTheDocument();
  });

  it("should render as list item", () => {
    render(
      <ul>
        <NextStepItem step={mockStep} index={0} />
      </ul>
    );

    expect(screen.getByRole("listitem")).toBeInTheDocument();
  });

  it("should handle different index numbers", () => {
    const { rerender } = render(<NextStepItem step={mockStep} index={0} />);
    expect(screen.getByLabelText("Step 1")).toBeInTheDocument();

    rerender(<NextStepItem step={mockStep} index={2} />);
    expect(screen.getByLabelText("Step 3")).toBeInTheDocument();
  });
});
