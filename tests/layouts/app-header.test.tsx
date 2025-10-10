import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { usePathname, useRouter } from 'next/navigation';
import { AppHeader } from '@/components/layouts/AppHeader';
import { useAuth } from '@/components/auth/auth-context';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
  useRouter: vi.fn(),
  default: vi.fn(),
}));

// Mock Link component
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock auth context
vi.mock('@/components/auth/auth-context', () => ({
  useAuth: vi.fn(),
}));

describe('AppHeader', () => {
  const mockRouter = {
    push: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  };

  const mockSignOutUser = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue(mockRouter);
    (usePathname as any).mockReturnValue('/dashboard');
    (useAuth as any).mockReturnValue({
      user: {
        uid: 'test-user-id',
        email: 'test@example.com',
        displayName: 'Test User',
      },
      signOutUser: mockSignOutUser,
      loading: false,
    });
  });

  describe('Rendering', () => {
    it('should render the header with branding', () => {
      render(<AppHeader />);
      
      expect(screen.getByText('FairForm')).toBeInTheDocument();
      expect(screen.getByLabelText('FairForm home')).toBeInTheDocument();
    });

    it('should render navigation links', () => {
      render(<AppHeader />);
      
      const dashboardLinks = screen.getAllByText('Dashboard');
      expect(dashboardLinks.length).toBeGreaterThan(0);
      expect(screen.getAllByText('Settings').length).toBeGreaterThan(0);
    });

    it('should render user information', () => {
      render(<AppHeader />);
      
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    it('should render logout button', () => {
      render(<AppHeader />);
      
      expect(screen.getByLabelText('Sign out')).toBeInTheDocument();
    });

    it('should render skip to content link for accessibility', () => {
      render(<AppHeader />);
      
      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveClass('sr-only');
    });
  });

  describe('Active Route Highlighting', () => {
    it('should highlight active route on dashboard', () => {
      (usePathname as any).mockReturnValue('/dashboard');
      render(<AppHeader />);
      
      const dashboardLinks = screen.getAllByText('Dashboard');
      const desktopLink = dashboardLinks.find(link => 
        link.getAttribute('aria-current') === 'page'
      );
      
      expect(desktopLink).toHaveAttribute('aria-current', 'page');
    });

    it('should not highlight inactive routes', () => {
      (usePathname as any).mockReturnValue('/dashboard');
      render(<AppHeader />);
      
      const settingsElements = screen.getAllByText('Settings');
      settingsElements.forEach(element => {
        expect(element).not.toHaveAttribute('aria-current');
      });
    });
  });

  describe('User Authentication', () => {
    it('should display user email when displayName is not available', () => {
      (useAuth as any).mockReturnValue({
        user: {
          uid: 'test-user-id',
          email: 'test@example.com',
          displayName: null,
        },
        signOutUser: mockSignOutUser,
        loading: false,
      });

      render(<AppHeader />);
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    it('should handle logout action', async () => {
      mockSignOutUser.mockResolvedValue(undefined);
      render(<AppHeader />);
      
      const logoutButton = screen.getByLabelText('Sign out');
      fireEvent.click(logoutButton);
      
      await waitFor(() => {
        expect(mockSignOutUser).toHaveBeenCalledTimes(1);
        expect(mockRouter.push).toHaveBeenCalledWith('/login');
      });
    });

    it('should handle logout errors gracefully', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockSignOutUser.mockRejectedValue(new Error('Logout failed'));
      
      render(<AppHeader />);
      
      const logoutButton = screen.getByLabelText('Sign out');
      fireEvent.click(logoutButton);
      
      await waitFor(() => {
        expect(mockSignOutUser).toHaveBeenCalledTimes(1);
        expect(consoleError).toHaveBeenCalled();
      });
      
      consoleError.mockRestore();
    });
  });

  describe('Responsive Behavior', () => {
    it('should render both desktop and mobile navigation', () => {
      render(<AppHeader />);
      
      const navElements = screen.getAllByRole('navigation');
      expect(navElements.length).toBeGreaterThanOrEqual(2);
    });

    it('should have mobile navigation with proper aria-label', () => {
      render(<AppHeader />);
      
      expect(screen.getByLabelText('Mobile navigation')).toBeInTheDocument();
      expect(screen.getByLabelText('Main navigation')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA landmarks', () => {
      const { container } = render(<AppHeader />);
      
      const header = container.querySelector('header');
      expect(header).toBeInTheDocument();
      
      const navigation = screen.getAllByRole('navigation');
      expect(navigation.length).toBeGreaterThan(0);
    });

    it('should have accessible logout button', () => {
      render(<AppHeader />);
      
      const logoutButton = screen.getByLabelText('Sign out');
      expect(logoutButton).toHaveAttribute('aria-label', 'Sign out');
    });

    it('should indicate disabled settings link', () => {
      render(<AppHeader />);
      
      const settingsElements = screen.getAllByText('Settings');
      const disabledSettings = settingsElements.find(el => 
        el.getAttribute('aria-disabled') === 'true'
      );
      
      expect(disabledSettings).toHaveAttribute('aria-disabled', 'true');
      expect(disabledSettings).toHaveAttribute('title', 'Coming soon');
    });

    it('should have proper focus management', () => {
      render(<AppHeader />);
      
      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should be focusable with keyboard', () => {
      render(<AppHeader />);
      
      const dashboardLink = screen.getAllByText('Dashboard')[0];
      const logoutButton = screen.getByLabelText('Sign out');
      
      expect(dashboardLink).toHaveClass('focus-visible:outline-none');
      expect(logoutButton).toBeInTheDocument();
    });
  });
});

