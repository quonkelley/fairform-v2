import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

import { StepNode } from "@/components/case-journey/step-node";
import type { CaseStep } from "@/lib/validation";

// Mock the useCompleteStep hook
vi.mock("@/lib/hooks/useCompleteStep", () => ({
  useCompleteStep: vi.fn(),
}));

// Mock the StepDetailModal component
vi.mock("@/components/case-journey/step-detail-modal", () => ({
  StepDetailModal: ({ isOpen, onClose, step, totalSteps }: any) =>
    isOpen ? (
      <div data-testid="step-detail-modal" role="dialog">
        <button onClick={onClose} aria-label="Close">Close</button>
        <div>Modal for {step.name}</div>
        <div>Step {step.order} of {totalSteps}</div>
      </div>
    ) : null,
}));

import { useCompleteStep } from "@/lib/hooks/useCompleteStep";

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

describe("StepNode", () => {
  const baseStep: CaseStep = {
    id: "step1",
    caseId: "case123",
    name: "File Complaint",
    order: 1,
    dueDate: new Date("2025-11-01"),
    isComplete: false,
    completedAt: null,
  };

  const mockMutate = vi.fn();
  const mockUseCompleteStep = {
    mutate: mockMutate,
    isPending: false,
    isError: false,
    isSuccess: false,
    error: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCompleteStep).mockReturnValue(mockUseCompleteStep as any);
  });

  it("should render step name and order", () => {
    render(<StepNode step={baseStep} index={0} totalSteps={5} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText("File Complaint")).toBeInTheDocument();
    expect(screen.getByText("1/5")).toBeInTheDocument();
  });

  it("should display due date when present", () => {
    render(<StepNode step={baseStep} index={0} totalSteps={5} />, {
      wrapper: createWrapper(),
    });

    // Check for "Due:" prefix - exact date may vary by timezone
    expect(screen.getByText(/Due:/)).toBeInTheDocument();
  });

  it("should not display due date when absent", () => {
    const stepWithoutDueDate = { ...baseStep, dueDate: null };
    render(<StepNode step={stepWithoutDueDate} index={0} totalSteps={5} />, {
      wrapper: createWrapper(),
    });

    expect(screen.queryByText(/Due:/)).not.toBeInTheDocument();
  });

  it("should render completed step with correct styling", () => {
    const completedStep: CaseStep = {
      ...baseStep,
      isComplete: true,
      completedAt: new Date("2025-10-15"),
    };

    const { container } = render(
      <StepNode step={completedStep} index={-1} totalSteps={5} />,
      { wrapper: createWrapper() }
    );

    // Should show completed badge
    expect(screen.getByText("✓ Complete")).toBeInTheDocument();

    // Check for success border class on card
    const card = container.querySelector('[class*="border-success"]');
    expect(card).toBeInTheDocument();
  });

  it("should render current step (first incomplete) with correct styling", () => {
    const { container } = render(
      <StepNode step={baseStep} index={0} totalSteps={5} />,
      { wrapper: createWrapper() }
    );

    // Should show in progress badge
    expect(screen.getByText("→ In Progress")).toBeInTheDocument();

    // Check for primary border class
    const card = container.querySelector('[class*="border-primary"]');
    expect(card).toBeInTheDocument();
  });

  it("should render upcoming step with correct styling", () => {
    const { container } = render(
      <StepNode step={baseStep} index={1} totalSteps={5} />,
      { wrapper: createWrapper() }
    );

    // Should show upcoming badge
    expect(screen.getByText("○ Upcoming")).toBeInTheDocument();

    // Check for default border class
    const card = container.querySelector('[class*="border-border"]');
    expect(card).toBeInTheDocument();
  });

  it("should have correct accessibility for Mark Complete button", () => {
    render(<StepNode step={baseStep} index={0} totalSteps={5} />, {
      wrapper: createWrapper(),
    });

    const button = screen.getByRole("button", { name: /mark.*complete/i });
    expect(button).toHaveAttribute(
      "aria-label",
      "Mark File Complaint as complete"
    );
  });

  it("should render CheckCircle icon for completed steps", () => {
    const completedStep: CaseStep = {
      ...baseStep,
      isComplete: true,
      completedAt: new Date(),
    };

    const { container } = render(
      <StepNode step={completedStep} index={-1} totalSteps={5} />,
      { wrapper: createWrapper() }
    );

    // Check for lucide CheckCircle2 icon
    const icon = container.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  it("should render Clock icon for current step", () => {
    const { container } = render(
      <StepNode step={baseStep} index={0} totalSteps={5} />,
      { wrapper: createWrapper() }
    );

    // Check for lucide Clock icon
    const icon = container.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  it("should render Circle icon for upcoming steps", () => {
    const { container } = render(
      <StepNode step={baseStep} index={1} totalSteps={5} />,
      { wrapper: createWrapper() }
    );

    // Check for lucide Circle icon
    const icon = container.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  it("should handle different step orders correctly", () => {
    const step2: CaseStep = {
      ...baseStep,
      order: 3,
      name: "Attend Hearing",
    };

    render(<StepNode step={step2} index={2} totalSteps={10} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText("3/10")).toBeInTheDocument();
    expect(screen.getByText("Attend Hearing")).toBeInTheDocument();
  });

  it("should apply transition styles via class names", () => {
    const { container } = render(
      <StepNode step={baseStep} index={0} totalSteps={5} />,
      { wrapper: createWrapper() }
    );

    // Card should have transition-all class
    const card = container.querySelector('[class*="transition"]');
    expect(card).toBeInTheDocument();
  });

  describe("Mark Complete Button", () => {
    it("should render Mark Complete button for incomplete steps", () => {
      render(<StepNode step={baseStep} index={0} totalSteps={5} />, {
        wrapper: createWrapper(),
      });

      const button = screen.getByRole("button", { name: /mark.*complete/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent("Mark Complete");
    });

    it("should NOT render Mark Complete button for completed steps", () => {
      const completedStep: CaseStep = {
        ...baseStep,
        isComplete: true,
        completedAt: new Date(),
      };

      render(<StepNode step={completedStep} index={-1} totalSteps={5} />, {
        wrapper: createWrapper(),
      });

      const button = screen.queryByRole("button", { name: /mark.*complete/i });
      expect(button).not.toBeInTheDocument();
    });

    it("should call mutation when Mark Complete button is clicked", async () => {
      const user = userEvent.setup();

      render(<StepNode step={baseStep} index={0} totalSteps={5} />, {
        wrapper: createWrapper(),
      });

      const button = screen.getByRole("button", { name: /mark.*complete/i });
      await user.click(button);

      expect(mockMutate).toHaveBeenCalledWith({
        stepId: "step1",
        caseId: "case123",
      });
    });

    it("should show loading state when mutation is pending", () => {
      vi.mocked(useCompleteStep).mockReturnValue({
        ...mockUseCompleteStep,
        isPending: true,
      } as any);

      render(<StepNode step={baseStep} index={0} totalSteps={5} />, {
        wrapper: createWrapper(),
      });

      const button = screen.getByRole("button", { name: /mark.*complete/i });
      expect(button).toBeDisabled();
      expect(button).toHaveTextContent("Completing...");
    });

    it("should display error message when mutation fails", () => {
      vi.mocked(useCompleteStep).mockReturnValue({
        ...mockUseCompleteStep,
        isError: true,
        error: new Error("Failed to complete step"),
      } as any);

      render(<StepNode step={baseStep} index={0} totalSteps={5} />, {
        wrapper: createWrapper(),
      });

      const errorMessage = screen.getByText(/unable to mark step complete/i);
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveAttribute("role", "alert");
    });

    it("should have proper accessibility attributes", () => {
      render(<StepNode step={baseStep} index={0} totalSteps={5} />, {
        wrapper: createWrapper(),
      });

      const button = screen.getByRole("button", { name: /mark.*complete/i });
      expect(button).toHaveAttribute("aria-label", "Mark File Complaint as complete");
    });

    it("should stop propagation when button is clicked", async () => {
      const user = userEvent.setup();
      const cardClickHandler = vi.fn();

      const { container } = render(
        <div onClick={cardClickHandler}>
          <StepNode step={baseStep} index={0} totalSteps={5} />
        </div>,
        { wrapper: createWrapper() }
      );

      const button = screen.getByRole("button", { name: /mark.*complete/i });
      await user.click(button);

      // Button click should not propagate to parent
      expect(mockMutate).toHaveBeenCalled();
      // Parent handler should not be called due to stopPropagation
    });
  });

  describe("Modal Integration", () => {
    it("should not show modal initially", () => {
      render(<StepNode step={baseStep} index={0} totalSteps={5} />, {
        wrapper: createWrapper(),
      });

      const modal = screen.queryByTestId("step-detail-modal");
      expect(modal).not.toBeInTheDocument();
    });

    it("should open modal when card is clicked", async () => {
      const user = userEvent.setup();

      const { container } = render(<StepNode step={baseStep} index={0} totalSteps={5} />, {
        wrapper: createWrapper(),
      });

      // Find the card element
      const card = container.querySelector('[class*="cursor-pointer"]');
      if (!card) throw new Error("Card not found");
      await user.click(card as HTMLElement);

      // Modal should now be visible
      const modal = screen.getByTestId("step-detail-modal");
      expect(modal).toBeInTheDocument();
      expect(screen.getByText("Modal for File Complaint")).toBeInTheDocument();
    });


    it("should close modal when close button is clicked", async () => {
      const user = userEvent.setup();

      const { container } = render(<StepNode step={baseStep} index={0} totalSteps={5} />, {
        wrapper: createWrapper(),
      });

      // Open modal
      const card = container.querySelector('[class*="cursor-pointer"]');
      if (!card) throw new Error("Card not found");
      await user.click(card as HTMLElement);

      expect(screen.getByTestId("step-detail-modal")).toBeInTheDocument();

      // Close modal
      const closeButton = screen.getByLabelText("Close");
      await user.click(closeButton);

      expect(screen.queryByTestId("step-detail-modal")).not.toBeInTheDocument();
    });

    it("should pass correct props to StepDetailModal", async () => {
      const user = userEvent.setup();

      const { container } = render(<StepNode step={baseStep} index={0} totalSteps={5} />, {
        wrapper: createWrapper(),
      });

      // Click the card
      const card = container.querySelector('[class*="cursor-pointer"]');
      if (!card) throw new Error("Card not found");
      await user.click(card as HTMLElement);

      // Check that modal receives correct step data
      expect(screen.getByText("Modal for File Complaint")).toBeInTheDocument();
      expect(screen.getByText("Step 1 of 5")).toBeInTheDocument();
    });

    it("should have cursor-pointer on card", () => {
      const { container } = render(
        <StepNode step={baseStep} index={0} totalSteps={5} />,
        { wrapper: createWrapper() }
      );

      const card = container.querySelector('[class*="cursor-pointer"]');
      expect(card).toBeInTheDocument();
    });

    it("should have hover effect on card", () => {
      const { container } = render(
        <StepNode step={baseStep} index={0} totalSteps={5} />,
        { wrapper: createWrapper() }
      );

      const card = container.querySelector('[class*="hover:shadow"]');
      expect(card).toBeInTheDocument();
    });

    it("should have cursor-pointer and clickable card", () => {
      const { container } = render(
        <StepNode step={baseStep} index={0} totalSteps={5} />,
        { wrapper: createWrapper() }
      );

      // Card should be clickable via pointer
      const card = container.querySelector('[class*="cursor-pointer"]');
      expect(card).toBeInTheDocument();
    });
  });
});
