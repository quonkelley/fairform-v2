import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardLayout from '@/app/dashboard/layout';
import { useAuth } from '@/components/auth/auth-context';
import { usePathname, useRouter } from 'next/navigation';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
  useRouter: vi.fn(),
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

describe('DashboardLayout Integration', () => {
  const mockRouter = {
    push: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  };

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
      signOutUser: vi.fn(),
      loading: false,
    });
  });

  describe('Layout Structure', () => {
    it('should render complete layout with header, main, and footer', () => {
      const { container } = render(
        <DashboardLayout>
          <div>Test Content</div>
        </DashboardLayout>
      );
      
      expect(container.querySelector('header')).toBeInTheDocument();
      expect(container.querySelector('main')).toBeInTheDocument();
      expect(container.querySelector('footer')).toBeInTheDocument();
    });

    it('should render children content inside main', () => {
      render(
        <DashboardLayout>
          <div>Test Content</div>
        </DashboardLayout>
      );
      
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should have main content with correct id for skip link', () => {
      const { container } = render(
        <DashboardLayout>
          <div>Test Content</div>
        </DashboardLayout>
      );
      
      const main = container.querySelector('main');
      expect(main).toHaveAttribute('id', 'main-content');
    });

    it('should have min-height full screen layout', () => {
      const { container } = render(
        <DashboardLayout>
          <div>Test Content</div>
        </DashboardLayout>
      );
      
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('min-h-screen');
      expect(wrapper).toHaveClass('flex');
      expect(wrapper).toHaveClass('flex-col');
    });
  });

  describe('Component Integration', () => {
    it('should render AppHeader with navigation', () => {
      render(
        <DashboardLayout>
          <div>Test Content</div>
        </DashboardLayout>
      );
      
      expect(screen.getByText('FairForm')).toBeInTheDocument();
      expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0);
    });

    it('should render AppFooter with copyright', () => {
      render(
        <DashboardLayout>
          <div>Test Content</div>
        </DashboardLayout>
      );
      
      const currentYear = new Date().getFullYear();
      expect(screen.getByText(new RegExp(`© ${currentYear}`))).toBeInTheDocument();
    });

    it('should maintain user context throughout layout', () => {
      render(
        <DashboardLayout>
          <div>Test Content</div>
        </DashboardLayout>
      );
      
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByLabelText('Sign out')).toBeInTheDocument();
    });
  });

  describe('Semantic HTML', () => {
    it('should use semantic HTML5 elements', () => {
      const { container } = render(
        <DashboardLayout>
          <div>Test Content</div>
        </DashboardLayout>
      );
      
      expect(container.querySelector('header')).toBeInTheDocument();
      expect(container.querySelector('main')).toBeInTheDocument();
      expect(container.querySelector('footer')).toBeInTheDocument();
      expect(container.querySelector('nav')).toBeInTheDocument();
    });

    it('should have proper ARIA landmarks', () => {
      const { container } = render(
        <DashboardLayout>
          <div>Test Content</div>
        </DashboardLayout>
      );
      
      const footer = container.querySelector('footer');
      expect(footer).toHaveAttribute('role', 'contentinfo');
      
      const nav = screen.getAllByRole('navigation');
      expect(nav.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Behavior', () => {
    it('should render both desktop and mobile navigation elements', () => {
      render(
        <DashboardLayout>
          <div>Test Content</div>
        </DashboardLayout>
      );
      
      const navElements = screen.getAllByRole('navigation');
      expect(navElements.length).toBeGreaterThanOrEqual(2);
    });

    it('should have responsive container classes', () => {
      const { container } = render(
        <DashboardLayout>
          <div>Test Content</div>
        </DashboardLayout>
      );
      
      const containerElements = container.querySelectorAll('.container');
      expect(containerElements.length).toBeGreaterThan(0);
      
      const maxWidthElements = container.querySelectorAll('.max-w-\\[960px\\]');
      expect(maxWidthElements.length).toBeGreaterThan(0);
    });
  });

  describe('Keyboard Navigation', () => {
    it('should have skip to content link', () => {
      render(
        <DashboardLayout>
          <div>Test Content</div>
        </DashboardLayout>
      );
      
      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    it('should have focusable navigation elements', () => {
      render(
        <DashboardLayout>
          <div>Test Content</div>
        </DashboardLayout>
      );
      
      const dashboardLink = screen.getAllByText('Dashboard')[0];
      const logoutButton = screen.getByLabelText('Sign out');
      
      expect(dashboardLink).toBeInTheDocument();
      expect(logoutButton).toBeInTheDocument();
    });
  });

  describe('Flex Layout Behavior', () => {
    it('should have flex-1 on main to fill available space', () => {
      const { container } = render(
        <DashboardLayout>
          <div>Test Content</div>
        </DashboardLayout>
      );
      
      const main = container.querySelector('main');
      expect(main).toHaveClass('flex-1');
    });

    it('should push footer to bottom with flex layout', () => {
      const { container } = render(
        <DashboardLayout>
          <div>Test Content</div>
        </DashboardLayout>
      );
      
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('flex');
      expect(wrapper).toHaveClass('flex-col');
      
      const footer = container.querySelector('footer');
      expect(footer).toBeInTheDocument();
    });
  });
});

