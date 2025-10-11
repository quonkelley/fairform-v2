import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { CaseCard } from "@/components/dashboard/case-card";
import type { CaseRecord } from "@/lib/db/casesRepo";

// Extend Vitest expect with jest-axe matchers
expect.extend(toHaveNoViolations);

describe("CaseCard", () => {
  const baseCaseRecord: CaseRecord = {
    id: "case123",
    userId: "user123",
    title: "Small Claims vs. Acme Corp",
    caseType: "small-claims",
    jurisdiction: "marion_in",
    status: "active",
    progressPct: 60,
    totalSteps: 5,
    completedSteps: 3,
    notes: null,
    createdAt: new Date("2025-10-01"),
    updatedAt: new Date("2025-10-10"),
  };

  describe("Basic Rendering", () => {
    it("renders case title", () => {
      render(<CaseCard record={baseCaseRecord} />);
      expect(screen.getByText("Small Claims vs. Acme Corp")).toBeInTheDocument();
    });

    it("renders formatted case type and status", () => {
      render(<CaseCard record={baseCaseRecord} />);
      // Case type and status appear together in the subtitle
      const subtitle = screen.getByText(/Small Claims · In progress/i);
      expect(subtitle).toBeInTheDocument();
    });

    it("renders formatted jurisdiction", () => {
      render(<CaseCard record={baseCaseRecord} />);
      expect(screen.getByText(/Marion County, IN/i)).toBeInTheDocument();
    });

    it("renders created date", () => {
      render(<CaseCard record={baseCaseRecord} />);
      // Date shows as "Sep 30, 2025" (timezone dependent, so check for Sep or Oct)
      expect(screen.getByText(/Sep|Oct/i)).toBeInTheDocument();
    });
  });

  describe("Progress Display", () => {
    it("displays progress bar with correct value", () => {
      render(<CaseCard record={baseCaseRecord} />);
      
      const progressBar = screen.getByRole("progressbar");
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute("aria-valuenow", "60");
    });

    it("displays progress text 'X of Y steps complete'", () => {
      render(<CaseCard record={baseCaseRecord} />);
      
      expect(screen.getByText("3 of 5 steps complete")).toBeInTheDocument();
    });

    it("handles 0% progress (no steps completed)", () => {
      const caseWith0Progress: CaseRecord = {
        ...baseCaseRecord,
        progressPct: 0,
        completedSteps: 0,
        totalSteps: 5,
      };

      render(<CaseCard record={caseWith0Progress} />);
      
      const progressBar = screen.getByRole("progressbar");
      expect(progressBar).toHaveAttribute("aria-valuenow", "0");
      expect(screen.getByText("0 of 5 steps complete")).toBeInTheDocument();
    });

    it("handles 100% progress (all steps completed)", () => {
      const caseWith100Progress: CaseRecord = {
        ...baseCaseRecord,
        progressPct: 100,
        completedSteps: 5,
        totalSteps: 5,
      };

      render(<CaseCard record={caseWith100Progress} />);
      
      const progressBar = screen.getByRole("progressbar");
      expect(progressBar).toHaveAttribute("aria-valuenow", "100");
      expect(screen.getByText("5 of 5 steps complete")).toBeInTheDocument();
    });

    it("displays 'No steps defined' when totalSteps is 0", () => {
      const caseWithNoSteps: CaseRecord = {
        ...baseCaseRecord,
        progressPct: 0,
        completedSteps: 0,
        totalSteps: 0,
      };

      render(<CaseCard record={caseWithNoSteps} />);
      
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
      expect(screen.getByText("No steps defined for this case")).toBeInTheDocument();
    });

    it("displays 'No steps defined' when totalSteps is undefined (legacy case)", () => {
      const legacyCase: CaseRecord = {
        ...baseCaseRecord,
        progressPct: 0,
        totalSteps: undefined,
        completedSteps: undefined,
      };

      render(<CaseCard record={legacyCase} />);
      
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
      expect(screen.getByText("No steps defined for this case")).toBeInTheDocument();
    });

    it("handles undefined completedSteps gracefully", () => {
      const caseWithUndefinedCompleted: CaseRecord = {
        ...baseCaseRecord,
        progressPct: 0,
        totalSteps: 5,
        completedSteps: undefined,
      };

      render(<CaseCard record={caseWithUndefinedCompleted} />);
      
      expect(screen.getByText("0 of 5 steps complete")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA attributes on progress bar", () => {
      render(<CaseCard record={baseCaseRecord} />);
      
      const progressBar = screen.getByRole("progressbar");
      expect(progressBar).toHaveAttribute("aria-label", "Case progress");
      expect(progressBar).toHaveAttribute("aria-valuenow", "60");
      expect(progressBar).toHaveAttribute("aria-valuemin", "0");
      expect(progressBar).toHaveAttribute("aria-valuemax", "100");
    });

    it("has no accessibility violations", async () => {
      const { container } = render(<CaseCard record={baseCaseRecord} />);
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no accessibility violations with 0% progress", async () => {
      const caseWith0Progress: CaseRecord = {
        ...baseCaseRecord,
        progressPct: 0,
        completedSteps: 0,
        totalSteps: 5,
      };

      const { container } = render(<CaseCard record={caseWith0Progress} />);
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has no accessibility violations when no steps defined", async () => {
      const caseWithNoSteps: CaseRecord = {
        ...baseCaseRecord,
        totalSteps: 0,
        completedSteps: 0,
      };

      const { container } = render(<CaseCard record={caseWithNoSteps} />);
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has accessible link with proper aria-label", () => {
      render(<CaseCard record={baseCaseRecord} />);
      
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("aria-label", "Open case Small Claims vs. Acme Corp");
    });
  });

  describe("Link Navigation", () => {
    it("links to correct case detail page", () => {
      render(<CaseCard record={baseCaseRecord} />);
      
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/case/case123");
    });
  });

  describe("Different Status Values", () => {
    it("formats closed status correctly", () => {
      const closedCase: CaseRecord = {
        ...baseCaseRecord,
        status: "closed",
      };

      render(<CaseCard record={closedCase} />);
      expect(screen.getByText(/Closed/i)).toBeInTheDocument();
    });

    it("formats archived status correctly", () => {
      const archivedCase: CaseRecord = {
        ...baseCaseRecord,
        status: "archived",
      };

      render(<CaseCard record={archivedCase} />);
      expect(screen.getByText(/Archived/i)).toBeInTheDocument();
    });
  });
});

