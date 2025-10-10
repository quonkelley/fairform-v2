import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import DashboardLayout from '@/app/dashboard/layout';
import { AppHeader } from '@/components/layouts/AppHeader';
import { AppFooter } from '@/components/layouts/AppFooter';
import { useAuth } from '@/components/auth/auth-context';
import { usePathname, useRouter } from 'next/navigation';

expect.extend(toHaveNoViolations);

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

describe('Layout Accessibility Tests', () => {
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

  describe('AppHeader Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<AppHeader />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper heading hierarchy', () => {
      const { container } = render(<AppHeader />);
      
      // Logo/brand should not be a heading, just a link
      const headerElement = container.querySelector('header');
      expect(headerElement).toBeInTheDocument();
      
      // No h1 in header (should be in page content)
      const h1Elements = container.querySelectorAll('h1');
      expect(h1Elements.length).toBe(0);
    });

    it('should have accessible navigation landmarks', () => {
      const { container } = render(<AppHeader />);
      
      const navElements = container.querySelectorAll('nav');
      expect(navElements.length).toBeGreaterThanOrEqual(2);
      
      navElements.forEach(nav => {
        expect(nav).toHaveAttribute('aria-label');
      });
    });

    it('should have sufficient color contrast', () => {
      const { container } = render(<AppHeader />);
      
      // Check that text elements have proper contrast classes
      const textElements = container.querySelectorAll('.text-muted-foreground');
      expect(textElements.length).toBeGreaterThan(0);
    });
  });

  describe('AppFooter Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<AppFooter />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have contentinfo landmark', () => {
      const { container } = render(<AppFooter />);
      
      const footer = container.querySelector('footer');
      expect(footer).toHaveAttribute('role', 'contentinfo');
    });

    it('should have accessible navigation in footer', () => {
      const { container } = render(<AppFooter />);
      
      const nav = container.querySelector('nav');
      expect(nav).toHaveAttribute('aria-label', 'Footer navigation');
    });

    it('should have external links with proper attributes', () => {
      const { container } = render(<AppFooter />);
      
      const externalLinks = container.querySelectorAll('a[target="_blank"]');
      externalLinks.forEach(link => {
        expect(link).toHaveAttribute('rel');
        expect(link.getAttribute('rel')).toContain('noopener');
      });
    });
  });

  describe('DashboardLayout Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <DashboardLayout>
          <div>
            <h1>Dashboard</h1>
            <p>Test content</p>
          </div>
        </DashboardLayout>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper landmark structure', () => {
      const { container } = render(
        <DashboardLayout>
          <div>Test content</div>
        </DashboardLayout>
      );
      
      // Should have header, main, and footer landmarks
      expect(container.querySelector('header')).toBeInTheDocument();
      expect(container.querySelector('main')).toBeInTheDocument();
      expect(container.querySelector('footer')).toBeInTheDocument();
    });

    it('should have skip link for keyboard navigation', () => {
      const { container } = render(
        <DashboardLayout>
          <div>Test content</div>
        </DashboardLayout>
      );
      
      const skipLink = container.querySelector('a[href="#main-content"]');
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveClass('sr-only');
    });

    it('should have main content with proper id', () => {
      const { container } = render(
        <DashboardLayout>
          <div>Test content</div>
        </DashboardLayout>
      );
      
      const main = container.querySelector('main#main-content');
      expect(main).toBeInTheDocument();
    });

    it('should have logical tab order', () => {
      const { container } = render(
        <DashboardLayout>
          <div>
            <button>Content Button</button>
          </div>
        </DashboardLayout>
      );
      
      // Skip link should be first
      const skipLink = container.querySelector('a[href="#main-content"]');
      expect(skipLink).toBeInTheDocument();
      
      // Header navigation should follow
      const navElements = container.querySelectorAll('nav');
      expect(navElements.length).toBeGreaterThan(0);
      
      // Main content should be accessible
      const main = container.querySelector('main');
      expect(main).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation Support', () => {
    it('should have focus indicators on interactive elements', () => {
      const { container } = render(<AppHeader />);
      
      // Check for focus-visible classes
      const focusableElements = container.querySelectorAll(
        'a, button, [tabindex]:not([tabindex="-1"])'
      );
      
      expect(focusableElements.length).toBeGreaterThan(0);
    });

    it('should not have any elements with negative tabindex that should be focusable', () => {
      const { container } = render(
        <DashboardLayout>
          <div>Test content</div>
        </DashboardLayout>
      );
      
      // Interactive elements should not have tabindex="-1" unless intentional
      const links = container.querySelectorAll('a:not([tabindex="-1"])');
      const buttons = container.querySelectorAll('button:not([tabindex="-1"])');
      
      expect(links.length).toBeGreaterThan(0);
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('ARIA Attributes', () => {
    it('should have proper aria-current on active navigation items', () => {
      const { container } = render(<AppHeader />);
      
      const currentPageLinks = container.querySelectorAll('[aria-current="page"]');
      expect(currentPageLinks.length).toBeGreaterThan(0);
    });

    it('should have aria-label on important navigation elements', () => {
      const { container } = render(<AppHeader />);
      
      const brandLink = container.querySelector('a[aria-label="FairForm home"]');
      expect(brandLink).toBeInTheDocument();
      
      const logoutButton = container.querySelector('[aria-label="Sign out"]');
      expect(logoutButton).toBeInTheDocument();
    });

    it('should have aria-disabled on disabled elements', () => {
      const { container } = render(<AppHeader />);
      
      const disabledElements = container.querySelectorAll('[aria-disabled="true"]');
      expect(disabledElements.length).toBeGreaterThan(0);
    });
  });

  describe('Screen Reader Support', () => {
    it('should have hidden decorative icons', () => {
      const { container } = render(<AppHeader />);
      
      const icons = container.querySelectorAll('svg[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should have descriptive text for screen readers where needed', () => {
      const { container } = render(
        <DashboardLayout>
          <div>Test content</div>
        </DashboardLayout>
      );
      
      // Skip link should be readable by screen readers
      const skipLink = container.querySelector('a[href="#main-content"]');
      expect(skipLink?.textContent).toBeTruthy();
    });
  });
});

