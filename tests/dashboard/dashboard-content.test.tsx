import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { DashboardContent } from "@/components/dashboard/dashboard-content";
import type { CaseRecord } from "@/lib/db/casesRepo";
import { listByUser } from "@/lib/db/casesRepo";

vi.mock("@/lib/db/casesRepo", () => ({
  listByUser: vi.fn(),
  createCase: vi.fn(),
  CasesRepositoryError: class CasesRepositoryError extends Error {},
}));

vi.mock("@/components/dashboard/start-case-dialog", () => ({
  StartCaseDialog: ({
    open,
    onOpenChange,
    onSuccess,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
  }) => (
    <div
      data-testid="start-case-dialog"
      data-state={open ? "open" : "closed"}
    >
      <button
        type="button"
        data-testid="mock-dialog-close"
        onClick={() => onOpenChange(false)}
      >
        Close dialog
      </button>
      <button
        type="button"
        data-testid="mock-dialog-success"
        onClick={() => onSuccess?.()}
      >
        Complete dialog
      </button>
    </div>
  ),
}));

const listByUserMock = vi.mocked(listByUser);

function createCase(overrides: Partial<CaseRecord> = {}): CaseRecord {
  const base: CaseRecord = {
    id: "case-1",
    userId: "user-1",
    title: "Johnson eviction",
    caseType: "eviction",
    jurisdiction: "marion_in",
    status: "active",
    progressPct: 20,
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-01T00:00:00.000Z"),
    notes: null,
  };
  return { ...base, ...overrides };
}

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return {
    user: userEvent.setup(),
    ...render(
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
    ),
  };
}

describe("DashboardContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders case cards when data is returned", async () => {
    listByUserMock.mockResolvedValueOnce([
      createCase(),
      createCase({ id: "case-2", title: "Tenant defense", createdAt: new Date("2024-02-01") }),
    ]);

    renderWithClient(
      <DashboardContent
        userId="user-1"
        userName="Alex"
        onSignOut={vi.fn().mockResolvedValue(undefined)}
        signingOut={false}
      />,
    );

    expect(await screen.findByText("Johnson eviction")).toBeInTheDocument();
    expect(screen.getByText("Tenant defense")).toBeInTheDocument();

    const firstCard = screen.getByRole("link", {
      name: /open case johnson eviction/i,
    });
    expect(firstCard).toHaveAttribute("href", "/case/case-1");
  });

  it("displays empty state when no cases exist", async () => {
    listByUserMock.mockResolvedValueOnce([]);

    const { user } = renderWithClient(
      <DashboardContent
        userId="user-1"
        userName="Alex"
        onSignOut={vi.fn().mockResolvedValue(undefined)}
        signingOut={false}
      />,
    );

    const emptyHeading = await screen.findByText("Let’s start your first case");
    const emptyState = emptyHeading.closest("div");

    await user.click(
      within(emptyState as HTMLElement).getByRole("button", {
        name: /start new case/i,
      }),
    );
    expect(
      screen.getByTestId("start-case-dialog").getAttribute("data-state"),
    ).toBe("open");
  });

  it("shows an error alert when cases fail to load", async () => {
    listByUserMock.mockRejectedValueOnce(new Error("network down"));

    const { user } = renderWithClient(
      <DashboardContent
        userId="user-1"
        userName="Alex"
        onSignOut={vi.fn().mockResolvedValue(undefined)}
        signingOut={false}
      />,
    );

    expect(
      await screen.findByText(/network down/i),
    ).toBeInTheDocument();

    listByUserMock.mockResolvedValueOnce([createCase()]);
    await user.click(screen.getByRole("button", { name: /try again/i }));
    expect(await screen.findByText("Johnson eviction")).toBeInTheDocument();
  });

  it("surfaces a flash message after case creation completes", async () => {
    listByUserMock.mockResolvedValue([]);

    const { user } = renderWithClient(
      <DashboardContent
        userId="user-1"
        userName="Alex"
        onSignOut={vi.fn().mockResolvedValue(undefined)}
        signingOut={false}
      />,
    );

    await screen.findByText("Let’s start your first case");

    await waitFor(() =>
      expect(
        screen.getByTestId("start-case-dialog").getAttribute("data-state"),
      ).toBe("closed"),
    );

    await user.click(screen.getByTestId("mock-dialog-success"));

    expect(await screen.findByText("Case created successfully.")).toBeVisible();

    await user.click(screen.getByRole("button", { name: /dismiss/i }));
    expect(
      screen.queryByText("Case created successfully."),
    ).not.toBeInTheDocument();
  });

  it("calls sign out handler when sign out button is clicked", async () => {
    listByUserMock.mockResolvedValueOnce([createCase()]);
    const signOut = vi.fn().mockResolvedValue(undefined);
    const { user } = renderWithClient(
      <DashboardContent
        userId="user-1"
        userName="Alex"
        onSignOut={signOut}
        signingOut={false}
      />,
    );

    await screen.findByText("Johnson eviction");

    await user.click(screen.getByRole("button", { name: /sign out/i }));
    expect(signOut).toHaveBeenCalledTimes(1);
  });
});
