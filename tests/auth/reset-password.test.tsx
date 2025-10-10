import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import ResetPasswordPage from "@/app/(auth)/reset-password/page";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

const requestResetMock = vi.fn();

vi.mock("@/components/auth/auth-context", () => ({
  useAuth: () => ({
    requestPasswordReset: requestResetMock,
  }),
}));

describe("ResetPasswordPage", () => {
  beforeEach(() => {
    requestResetMock.mockReset();
    pushMock.mockReset();
  });

  it("requires a valid email before submission", async () => {
    render(<ResetPasswordPage />);

    fireEvent.click(screen.getByRole("button", { name: /send reset link/i }));

    expect(
      await screen.findByText(/enter a valid email address/i),
    ).toBeInTheDocument();
  });

  it("requests a password reset and navigates after success", async () => {
    requestResetMock.mockResolvedValue(undefined);
    render(<ResetPasswordPage />);

    fireEvent.input(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });

    fireEvent.click(screen.getByRole("button", { name: /send reset link/i }));

    await waitFor(() => {
      expect(requestResetMock).toHaveBeenCalledWith("test@example.com");
    });
  });
});

