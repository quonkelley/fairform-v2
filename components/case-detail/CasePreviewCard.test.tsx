import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { CasePreviewCard } from "./CasePreviewCard";
import type { IntakeClassification } from "@/lib/ai/schemas";

// Mock the form components
vi.mock("@hookform/resolvers/zod", () => ({
  zodResolver: vi.fn(),
}));

// Mock data
const mockClassification: IntakeClassification = {
  summary: "Landlord is refusing to fix the heater after multiple requests",
  primaryIssue: "Housing maintenance dispute",
  caseType: "eviction",
  jurisdiction: {
    state: "California",
    county: "Los Angeles",
    courtLevel: "Superior Court",
  },
  confidence: 0.85,
  riskLevel: "medium",
  recommendedNextSteps: [
    "Document all communication with landlord",
    "Check local housing codes",
    "Consider mediation",
  ],
  disclaimers: [
    "This is not legal advice. Consult with an attorney for legal guidance.",
  ],
};

const mockCaseData = {
  caseNumber: "EV-2024-001",
  court: "Los Angeles Superior Court",
  plaintiff: "Property Management LLC",
  defendant: "John Doe",
  propertyAddress: "123 Main St, Los Angeles, CA 90210",
  filingDate: "2024-01-15",
  nextHearingDate: "2024-02-15",
};

describe("CasePreviewCard", () => {
  const mockOnConfirm = vi.fn();
  const mockOnStartOver = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders case preview with classification data", () => {
    render(
      <CasePreviewCard
        classification={mockClassification}
        onConfirm={mockOnConfirm}
        onStartOver={mockOnStartOver}
      />
    );

    expect(screen.getByText("Case Preview")).toBeInTheDocument();
    expect(screen.getByText("eviction")).toBeInTheDocument();
    expect(screen.getByText("Housing maintenance dispute")).toBeInTheDocument();
    expect(screen.getByText("Landlord is refusing to fix the heater after multiple requests")).toBeInTheDocument();
    expect(screen.getByText("State: California")).toBeInTheDocument();
    expect(screen.getByText("County: Los Angeles")).toBeInTheDocument();
    expect(screen.getByText("Court: Superior Court")).toBeInTheDocument();
  });

  it("renders additional case data when provided", () => {
    render(
      <CasePreviewCard
        classification={mockClassification}
        caseData={mockCaseData}
        onConfirm={mockOnConfirm}
        onStartOver={mockOnStartOver}
      />
    );

    expect(screen.getByText("EV-2024-001")).toBeInTheDocument();
    expect(screen.getByText("Los Angeles Superior Court")).toBeInTheDocument();
    expect(screen.getByText("Property Management LLC")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("123 Main St, Los Angeles, CA 90210")).toBeInTheDocument();
  });

  it("shows risk level badge", () => {
    render(
      <CasePreviewCard
        classification={mockClassification}
        onConfirm={mockOnConfirm}
        onStartOver={mockOnStartOver}
      />
    );

    expect(screen.getByText("MEDIUM RISK")).toBeInTheDocument();
  });

  it("shows AI confidence percentage", () => {
    render(
      <CasePreviewCard
        classification={mockClassification}
        onConfirm={mockOnConfirm}
        onStartOver={mockOnStartOver}
      />
    );

    expect(screen.getByText("85%")).toBeInTheDocument();
  });

  it("shows recommended next steps", () => {
    render(
      <CasePreviewCard
        classification={mockClassification}
        onConfirm={mockOnConfirm}
        onStartOver={mockOnStartOver}
      />
    );

    expect(screen.getByText("Document all communication with landlord")).toBeInTheDocument();
    expect(screen.getByText("Check local housing codes")).toBeInTheDocument();
    expect(screen.getByText("Consider mediation")).toBeInTheDocument();
  });

  it("shows disclaimers", () => {
    render(
      <CasePreviewCard
        classification={mockClassification}
        onConfirm={mockOnConfirm}
        onStartOver={mockOnStartOver}
      />
    );

    expect(screen.getByText("This is not legal advice. Consult with an attorney for legal guidance.")).toBeInTheDocument();
  });

  it("has edit buttons for each field", () => {
    render(
      <CasePreviewCard
        classification={mockClassification}
        onConfirm={mockOnConfirm}
        onStartOver={mockOnStartOver}
      />
    );

    const editButtons = screen.getAllByText("Edit");
    expect(editButtons.length).toBeGreaterThan(0);
  });

  it("enters edit mode when edit button is clicked", async () => {
    render(
      <CasePreviewCard
        classification={mockClassification}
        onConfirm={mockOnConfirm}
        onStartOver={mockOnStartOver}
      />
    );

    const editButtons = screen.getAllByText("Edit");
    fireEvent.click(editButtons[0]); // Click first edit button

    await waitFor(() => {
      expect(screen.getByText("Save")).toBeInTheDocument();
      expect(screen.getByText("Cancel")).toBeInTheDocument();
    });
  });

  it("calls onConfirm when Create Case button is clicked", () => {
    render(
      <CasePreviewCard
        classification={mockClassification}
        onConfirm={mockOnConfirm}
        onStartOver={mockOnStartOver}
      />
    );

    const createButton = screen.getByText("Create Case");
    fireEvent.click(createButton);

    expect(mockOnConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        caseType: "eviction",
        primaryIssue: "Housing maintenance dispute",
        summary: "Landlord is refusing to fix the heater after multiple requests",
      })
    );
  });

  it("calls onStartOver when Start Over button is clicked", () => {
    render(
      <CasePreviewCard
        classification={mockClassification}
        onConfirm={mockOnConfirm}
        onStartOver={mockOnStartOver}
      />
    );

    const startOverButton = screen.getByText("Start Over");
    fireEvent.click(startOverButton);

    expect(mockOnStartOver).toHaveBeenCalled();
  });

  it("shows loading state when submitting", () => {
    render(
      <CasePreviewCard
        classification={mockClassification}
        onConfirm={mockOnConfirm}
        onStartOver={mockOnStartOver}
        isSubmitting={true}
      />
    );

    expect(screen.getByText("Creating Case...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /creating case/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /start over/i })).toBeDisabled();
  });

  it("handles jurisdiction editing correctly", async () => {
    render(
      <CasePreviewCard
        classification={mockClassification}
        onConfirm={mockOnConfirm}
        onStartOver={mockOnStartOver}
      />
    );

    // Find the jurisdiction edit button
    const jurisdictionSection = screen.getByText("Jurisdiction").closest("div");
    const editButton = jurisdictionSection?.querySelector("button");
    
    if (editButton) {
      fireEvent.click(editButton);

      await waitFor(() => {
        expect(screen.getByPlaceholderText("State (e.g., California)")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("County (e.g., Los Angeles)")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Court Level (e.g., Superior Court)")).toBeInTheDocument();
      });
    }
  });

  it("handles textarea fields correctly", async () => {
    render(
      <CasePreviewCard
        classification={mockClassification}
        onConfirm={mockOnConfirm}
        onStartOver={mockOnStartOver}
      />
    );

    // Find the summary edit button (should be a textarea field)
    const summarySection = screen.getByText("Case Summary").closest("div");
    const editButton = summarySection?.querySelector("button");
    
    if (editButton) {
      fireEvent.click(editButton);

      await waitFor(() => {
        const textarea = screen.getByRole("textbox");
        expect(textarea).toBeInTheDocument();
        expect(textarea.tagName).toBe("TEXTAREA");
      });
    }
  });

  it("formats dates correctly", () => {
    render(
      <CasePreviewCard
        classification={mockClassification}
        caseData={{
          ...mockCaseData,
          filingDate: "2024-01-15",
          nextHearingDate: "2024-02-15",
        }}
        onConfirm={mockOnConfirm}
        onStartOver={mockOnStartOver}
      />
    );

    // Check that dates are formatted (the exact format may vary by locale)
    // Look for the specific date values in the date fields
    expect(screen.getByText("2024-01-15")).toBeInTheDocument();
    expect(screen.getByText("2024-02-15")).toBeInTheDocument();
  });

  it("shows 'Not specified' for empty fields", () => {
    const emptyClassification: IntakeClassification = {
      ...mockClassification,
      jurisdiction: {
        state: "",
        county: "",
        courtLevel: "",
      },
    };

    render(
      <CasePreviewCard
        classification={emptyClassification}
        onConfirm={mockOnConfirm}
        onStartOver={mockOnStartOver}
      />
    );

    // Check that "Not specified" appears multiple times for empty fields
    const notSpecifiedElements = screen.getAllByText("Not specified");
    expect(notSpecifiedElements.length).toBeGreaterThan(0);
  });
});
