import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressOverview } from "@/components/case-detail/ProgressOverview";

describe("ProgressOverview", () => {
  describe("Component Rendering", () => {
    it("should render progress overview section", () => {
      render(
        <ProgressOverview
          progressPct={40}
          currentStep={3}
          totalSteps={5}
          caseType="small_claims"
        />
      );

      expect(screen.getByRole("region", { name: /progress overview/i })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: /case progress/i })).toBeInTheDocument();
    });

    it("should display formatted case type", () => {
      render(
        <ProgressOverview
          progressPct={40}
          currentStep={3}
          totalSteps={5}
          caseType="small_claims"
        />
      );

      expect(screen.getByText(/small claims case/i)).toBeInTheDocument();
    });

    it("should format case type with underscores", () => {
      render(
        <ProgressOverview
          progressPct={50}
          currentStep={1}
          totalSteps={2}
          caseType="employment_dispute"
        />
      );

      expect(screen.getByText(/employment dispute case/i)).toBeInTheDocument();
    });
  });

  describe("Progress Display", () => {
    it("should display progress percentage", () => {
      render(
        <ProgressOverview
          progressPct={60}
          currentStep={3}
          totalSteps={5}
          caseType="small_claims"
        />
      );

      expect(screen.getByText("60%")).toBeInTheDocument();
    });

    it("should handle 0% progress", () => {
      render(
        <ProgressOverview
          progressPct={0}
          currentStep={1}
          totalSteps={5}
          caseType="small_claims"
        />
      );

      expect(screen.getByText("0%")).toBeInTheDocument();
    });

    it("should handle 100% progress", () => {
      render(
        <ProgressOverview
          progressPct={100}
          currentStep={6}
          totalSteps={5}
          caseType="small_claims"
        />
      );

      expect(screen.getByText("100%")).toBeInTheDocument();
    });
  });

  describe("Step Information", () => {
    it("should display current step and total steps", () => {
      render(
        <ProgressOverview
          progressPct={40}
          currentStep={2}
          totalSteps={5}
          caseType="small_claims"
        />
      );

      expect(screen.getByText(/step 2 of 5/i)).toBeInTheDocument();
    });

    it("should display steps remaining", () => {
      render(
        <ProgressOverview
          progressPct={40}
          currentStep={2}
          totalSteps={5}
          caseType="small_claims"
        />
      );

      expect(screen.getByText("4")).toBeInTheDocument();
      expect(screen.getByText("steps remaining")).toBeInTheDocument();
    });

    it("should display singular 'step remaining' for 1 step", () => {
      render(
        <ProgressOverview
          progressPct={80}
          currentStep={5}
          totalSteps={5}
          caseType="small_claims"
        />
      );

      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.getByText("step remaining")).toBeInTheDocument();
    });

    it("should show 'Complete!' when all steps done", () => {
      render(
        <ProgressOverview
          progressPct={100}
          currentStep={6}
          totalSteps={5}
          caseType="small_claims"
        />
      );

      expect(screen.getByText("Complete!")).toBeInTheDocument();
      expect(screen.getByText("All steps done")).toBeInTheDocument();
    });

    it("should not show step info when currentStep is undefined", () => {
      render(
        <ProgressOverview
          progressPct={0}
          currentStep={undefined}
          totalSteps={5}
          caseType="small_claims"
        />
      );

      expect(screen.queryByText(/step/i)).not.toBeInTheDocument();
    });

    it("should not show step info when totalSteps is undefined", () => {
      render(
        <ProgressOverview
          progressPct={0}
          currentStep={1}
          totalSteps={undefined}
          caseType="small_claims"
        />
      );

      expect(screen.queryByText(/step/i)).not.toBeInTheDocument();
    });

    it("should not show step info when totalSteps is 0", () => {
      render(
        <ProgressOverview
          progressPct={0}
          currentStep={1}
          totalSteps={0}
          caseType="small_claims"
        />
      );

      expect(screen.queryByText(/step/i)).not.toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle currentStep greater than totalSteps", () => {
      render(
        <ProgressOverview
          progressPct={100}
          currentStep={10}
          totalSteps={5}
          caseType="small_claims"
        />
      );

      expect(screen.getByText(/step 5 of 5/i)).toBeInTheDocument();
      expect(screen.getByText("Complete!")).toBeInTheDocument();
    });

    it("should handle negative progress percentage", () => {
      render(
        <ProgressOverview
          progressPct={-10}
          currentStep={1}
          totalSteps={5}
          caseType="small_claims"
        />
      );

      // Should still render without crashing
      expect(screen.getByText("-10%")).toBeInTheDocument();
    });

    it("should handle empty case type", () => {
      render(
        <ProgressOverview
          progressPct={50}
          currentStep={2}
          totalSteps={4}
          caseType=""
        />
      );

      // Should still render without crashing
      expect(screen.getByRole("region")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", () => {
      render(
        <ProgressOverview
          progressPct={60}
          currentStep={3}
          totalSteps={5}
          caseType="small_claims"
        />
      );

      expect(screen.getByRole("region", { name: /progress overview/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/60 percent complete/i)).toBeInTheDocument();
    });

    it("should have proper heading hierarchy", () => {
      render(
        <ProgressOverview
          progressPct={60}
          currentStep={3}
          totalSteps={5}
          caseType="small_claims"
        />
      );

      const heading = screen.getByRole("heading", { name: /case progress/i });
      expect(heading.tagName).toBe("H2");
    });
  });

  describe("Visual Elements", () => {
    it("should render progress bar", () => {
      render(
        <ProgressOverview
          progressPct={75}
          currentStep={4}
          totalSteps={5}
          caseType="small_claims"
        />
      );

      const progressBar = screen.getByLabelText("Case progress bar");
      expect(progressBar).toBeInTheDocument();
    });
  });
});
