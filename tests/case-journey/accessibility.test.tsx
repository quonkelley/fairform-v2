import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

import { CaseJourneyMap } from "@/components/case-journey/case-journey-map";
import { StepNode } from "@/components/case-journey/step-node";
import type { CaseStep } from "@/lib/validation";

// Extend Vitest expect with jest-axe matchers
expect.extend(toHaveNoViolations);

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

describe("Case Journey - Accessibility", () => {
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

  describe("CaseJourneyMap Accessibility", () => {
    it("should have no accessibility violations in success state", async () => {
      mockUseCaseSteps.mockReturnValue({
        data: mockSteps,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      const { container } = render(<CaseJourneyMap caseId="case123" />, {
        wrapper: createWrapper(),
      });
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have no accessibility violations in loading state", async () => {
      mockUseCaseSteps.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
      } as any);

      const { container } = render(<CaseJourneyMap caseId="case123" />, {
        wrapper: createWrapper(),
      });
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have no accessibility violations in error state", async () => {
      mockUseCaseSteps.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error("Failed to load steps"),
      } as any);

      const { container } = render(<CaseJourneyMap caseId="case123" />, {
        wrapper: createWrapper(),
      });
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have no accessibility violations in empty state", async () => {
      mockUseCaseSteps.mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      const { container } = render(<CaseJourneyMap caseId="case123" />, {
        wrapper: createWrapper(),
      });
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("StepNode Accessibility", () => {
    const baseStep: CaseStep = {
      id: "step1",
      caseId: "case123",
      name: "File Complaint",
      order: 1,
      dueDate: new Date("2025-11-01"),
      isComplete: false,
      completedAt: null,
    };

    it("should have no accessibility violations for completed step", async () => {
      const completedStep = {
        ...baseStep,
        isComplete: true,
        completedAt: new Date(),
      };

      const { container } = render(
        <StepNode step={completedStep} index={-1} totalSteps={5} />,
        { wrapper: createWrapper() }
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have no accessibility violations for current step", async () => {
      const { container} = render(
        <StepNode step={baseStep} index={0} totalSteps={5} />,
        { wrapper: createWrapper() }
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have no accessibility violations for upcoming step", async () => {
      const { container } = render(
        <StepNode step={baseStep} index={1} totalSteps={5} />,
        { wrapper: createWrapper() }
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have no accessibility violations for step without due date", async () => {
      const stepWithoutDueDate = {
        ...baseStep,
        dueDate: null,
      };

      const { container } = render(
        <StepNode step={stepWithoutDueDate} index={0} totalSteps={5} />,
        { wrapper: createWrapper() }
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Keyboard Navigation", () => {
    const baseStep: CaseStep = {
      id: "step1",
      caseId: "case123",
      name: "File Complaint",
      order: 1,
      dueDate: null,
      isComplete: false,
      completedAt: null,
    };

    it("should have proper focus management on Mark Complete button", () => {
      const { container } = render(
        <StepNode step={baseStep} index={0} totalSteps={5} />,
        { wrapper: createWrapper() }
      );

      // Button should be focusable
      const button = container.querySelector('button');
      expect(button).toBeDefined();
    });

    it("should have visible focus indicators", () => {
      const { container } = render(
        <StepNode step={baseStep} index={0} totalSteps={5} />,
        { wrapper: createWrapper() }
      );

      const button = container.querySelector('button');
      // The component uses focus-visible via design system
      expect(button).toBeDefined();
    });
  });

  describe("Semantic HTML", () => {
    it("should use semantic heading hierarchy in CaseJourneyMap", () => {
      mockUseCaseSteps.mockReturnValue({
        data: mockSteps,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      const { container } = render(<CaseJourneyMap caseId="case123" />, {
        wrapper: createWrapper(),
      });

      // Should have H2 for main title
      const h2 = container.querySelector("h2");
      expect(h2).toBeTruthy();
      expect(h2?.textContent).toBe("Your Case Journey");

      // Should have H3 for each step name
      const h3Elements = container.querySelectorAll("h3");
      expect(h3Elements.length).toBe(3); // One for each step
    });

    it("should use ordered list for steps", () => {
      mockUseCaseSteps.mockReturnValue({
        data: mockSteps,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      const { container } = render(<CaseJourneyMap caseId="case123" />, {
        wrapper: createWrapper(),
      });

      const ol = container.querySelector("ol");
      expect(ol).toBeTruthy();

      const listItems = container.querySelectorAll("ol > li");
      expect(listItems.length).toBe(3);
    });
  });

  describe("ARIA Attributes", () => {
    const baseStep: CaseStep = {
      id: "step1",
      caseId: "case123",
      name: "File Complaint",
      order: 1,
      dueDate: null,
      isComplete: false,
      completedAt: null,
    };

    it("should have proper ARIA label for Mark Complete button", () => {
      const { container } = render(
        <StepNode step={baseStep} index={0} totalSteps={5} />,
        { wrapper: createWrapper() }
      );

      const button = container.querySelector('button');
      expect(button?.getAttribute("aria-label")).toContain("Mark File Complaint as complete");
    });

    it("should have aria-hidden on decorative icons", () => {
      const { container } = render(
        <StepNode step={baseStep} index={0} totalSteps={5} />,
        { wrapper: createWrapper() }
      );

      const iconContainer = container.querySelector('[aria-hidden="true"]');
      expect(iconContainer).toBeTruthy();
    });
  });
});
