import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import LoginPage from "@/app/(auth)/login/page";

const replaceMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: replaceMock,
  }),
  useSearchParams: () => new URLSearchParams(""),
}));

const signInMock = vi.fn();

vi.mock("@/components/auth/auth-context", () => ({
  useAuth: () => ({
    signIn: signInMock,
  }),
}));

describe("LoginPage", () => {
  beforeEach(() => {
    signInMock.mockReset();
    replaceMock.mockReset();
  });

  it("shows validation errors for empty fields", async () => {
    render(<LoginPage />);

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(
      await screen.findByText(/enter a valid email address/i),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/password must be at least 8 characters/i),
    ).toBeInTheDocument();
  });

  it("submits credentials and redirects on success", async () => {
    signInMock.mockResolvedValue(undefined);
    render(<LoginPage />);

    fireEvent.input(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.input(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(signInMock).toHaveBeenCalledWith(
        "test@example.com",
        "password123",
      );
      expect(replaceMock).toHaveBeenCalledWith("/dashboard");
    });
  });
});

