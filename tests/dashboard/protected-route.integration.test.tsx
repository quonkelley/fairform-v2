import { render, screen } from "@testing-library/react";
import type { User } from "firebase/auth";
import { vi } from "vitest";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/components/auth/auth-context";

const replace = vi.fn();

vi.mock("@/components/auth/auth-context", () => ({
  useAuth: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

const baseAuthValue = {
  signIn: vi.fn(),
  signUp: vi.fn(),
  requestPasswordReset: vi.fn(),
  signOutUser: vi.fn(),
} as const;

describe("ProtectedRoute", () => {
  beforeEach(() => {
    replace.mockReset();
  });

  it("redirects unauthenticated users to login", () => {
    vi.mocked(useAuth).mockReturnValue({
      ...baseAuthValue,
      user: null,
      loading: false,
    });

    render(
      <ProtectedRoute redirectTo="/login">
        <div>Secret area</div>
      </ProtectedRoute>,
    );

    expect(replace).toHaveBeenCalledWith("/login");
    expect(screen.getByText(/Redirecting to login/i)).toBeInTheDocument();
  });

  it("renders children when user is authenticated", () => {
    vi.mocked(useAuth).mockReturnValue({
      ...baseAuthValue,
      user: { uid: "user-1" } as unknown as User,
      loading: false,
    });

    render(
      <ProtectedRoute>
        <p>Dashboard content</p>
      </ProtectedRoute>,
    );

    expect(screen.getByText("Dashboard content")).toBeVisible();
    expect(replace).not.toHaveBeenCalled();
  });
});
