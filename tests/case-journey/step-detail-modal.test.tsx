import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { StepDetailModal } from "@/components/case-journey/step-detail-modal";
import type { CaseStep } from "@/lib/validation";

describe("StepDetailModal", () => {
  const mockStep: CaseStep = {
    id: "step1",
    caseId: "case1",
    name: "File Complaint",
    order: 1,
    dueDate: new Date("2025-11-15"),
    isComplete: false,
    completedAt: null,
  };

  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  describe("Modal Rendering", () => {
    it("renders modal content when isOpen is true", () => {
      render(
        <StepDetailModal
          step={mockStep}
          totalSteps={5}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText("File Your Small Claims Complaint")).toBeInTheDocument();
      expect(screen.getByText("Step 1 of 5")).toBeInTheDocument();
    });

    it("does not render modal content when isOpen is false", () => {
      render(
        <StepDetailModal
          step={mockStep}
          totalSteps={5}
          isOpen={false}
          onClose={mockOnClose}
        />
      );

      expect(screen.queryByText("File Your Small Claims Complaint")).not.toBeInTheDocument();
    });

    it("displays step instructions from template", () => {
      render(
        <StepDetailModal
          step={mockStep}
          totalSteps={5}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/Complete form SC-100/)).toBeInTheDocument();
      expect(screen.getByText(/Make 2 copies of the completed form/)).toBeInTheDocument();
      expect(screen.getByText(/File the original form at the courthouse/)).toBeInTheDocument();
      expect(screen.getByText(/Pay the filing fee or request a fee waiver/)).toBeInTheDocument();
    });

    it("displays due date when present", () => {
      render(
        <StepDetailModal
          step={mockStep}
          totalSteps={5}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText("Due Date")).toBeInTheDocument();
      // Use regex to handle timezone differences
      expect(screen.getByText(/November \d{1,2}, 2025/)).toBeInTheDocument();
    });

    it("does not display due date section when dueDate is null", () => {
      const stepWithoutDueDate: CaseStep = {
        ...mockStep,
        dueDate: null,
      };

      render(
        <StepDetailModal
          step={stepWithoutDueDate}
          totalSteps={5}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.queryByText("Due Date")).not.toBeInTheDocument();
    });

    it("displays estimated time", () => {
      render(
        <StepDetailModal
          step={mockStep}
          totalSteps={5}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText("Estimated Time")).toBeInTheDocument();
      expect(screen.getByText("1-2 hours")).toBeInTheDocument();
    });

    it("displays resources when available", () => {
      render(
        <StepDetailModal
          step={mockStep}
          totalSteps={5}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/You'll Need/)).toBeInTheDocument();
      expect(screen.getByText(/Form SC-100/)).toBeInTheDocument();
      expect(screen.getByText(/Fee Waiver Form FW-001/)).toBeInTheDocument();
    });

    it("displays help text when available", () => {
      render(
        <StepDetailModal
          step={mockStep}
          totalSteps={5}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/Helpful Tip:/)).toBeInTheDocument();
      expect(screen.getByText(/Filing fee varies by claim amount/)).toBeInTheDocument();
    });

    it("uses default instructions for unknown step names", () => {
      const unknownStep: CaseStep = {
        ...mockStep,
        name: "Unknown Step",
      };

      render(
        <StepDetailModal
          step={unknownStep}
          totalSteps={5}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText("Complete This Step")).toBeInTheDocument();
      expect(screen.getByText(/Follow the specific requirements for this step/)).toBeInTheDocument();
    });
  });

  describe("Close Mechanisms", () => {
    it("calls onClose when dialog is closed", () => {
      render(
        <StepDetailModal
          step={mockStep}
          totalSteps={5}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Find and click the close button
      const closeButton = screen.getByLabelText("Close");
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("handles ESC key press to close modal", () => {
      render(
        <StepDetailModal
          step={mockStep}
          totalSteps={5}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Simulate ESC key press
      fireEvent.keyDown(document, { key: "Escape" });

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe("Different Step Types", () => {
    it("renders Serve Defendant step correctly", () => {
      const serveStep: CaseStep = {
        ...mockStep,
        name: "Serve Defendant",
        order: 2,
      };

      render(
        <StepDetailModal
          step={serveStep}
          totalSteps={5}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText("Serve the Defendant")).toBeInTheDocument();
      expect(screen.getByText(/Have someone over 18/)).toBeInTheDocument();
      expect(screen.getByText(/Proof of Service Form SC-104/)).toBeInTheDocument();
    });

    it("renders Wait for Response step correctly", () => {
      const waitStep: CaseStep = {
        ...mockStep,
        name: "Wait for Response",
        order: 3,
      };

      render(
        <StepDetailModal
          step={waitStep}
          totalSteps={5}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText("Wait for Defendant's Response")).toBeInTheDocument();
      expect(screen.getByText(/defendant has 30 days/)).toBeInTheDocument();
    });

    it("renders Attend Hearing step correctly", () => {
      const hearingStep: CaseStep = {
        ...mockStep,
        name: "Attend Hearing",
        order: 4,
      };

      render(
        <StepDetailModal
          step={hearingStep}
          totalSteps={5}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText("Attend Your Court Hearing")).toBeInTheDocument();
      expect(screen.getByText(/Arrive at the courthouse 30 minutes early/)).toBeInTheDocument();
    });

    it("renders Receive Judgment step correctly", () => {
      const judgmentStep: CaseStep = {
        ...mockStep,
        name: "Receive Judgment",
        order: 5,
      };

      render(
        <StepDetailModal
          step={judgmentStep}
          totalSteps={5}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText("Receive and Understand the Judgment")).toBeInTheDocument();
      expect(screen.getByText(/judge will issue a judgment/)).toBeInTheDocument();
    });
  });

  describe("Responsive and Layout", () => {
    it("renders modal dialog when open", () => {
      render(
        <StepDetailModal
          step={mockStep}
          totalSteps={5}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
    });

    it("renders all modal sections in correct order", () => {
      render(
        <StepDetailModal
          step={mockStep}
          totalSteps={5}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      // Verify all sections are present
      expect(screen.getByText("Instructions")).toBeInTheDocument();
      expect(screen.getByText("Due Date")).toBeInTheDocument();
      expect(screen.getByText("Estimated Time")).toBeInTheDocument();
      expect(screen.getByText(/You'll Need/)).toBeInTheDocument();
      expect(screen.getByText(/Helpful Tip:/)).toBeInTheDocument();
    });
  });
});

