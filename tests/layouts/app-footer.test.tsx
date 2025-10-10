import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppFooter } from '@/components/layouts/AppFooter';

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('AppFooter', () => {
  describe('Rendering', () => {
    it('should render the footer', () => {
      const { container } = render(<AppFooter />);
      
      const footer = container.querySelector('footer');
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveAttribute('role', 'contentinfo');
    });

    it('should display current year in copyright', () => {
      render(<AppFooter />);
      
      const currentYear = new Date().getFullYear();
      expect(screen.getByText(new RegExp(`© ${currentYear} FairForm`))).toBeInTheDocument();
    });

    it('should display version information', () => {
      render(<AppFooter />);
      
      expect(screen.getByText('v1.0.0')).toBeInTheDocument();
    });

    it('should render footer navigation links', () => {
      render(<AppFooter />);
      
      expect(screen.getByText('Documentation')).toBeInTheDocument();
      expect(screen.getByText('GitHub')).toBeInTheDocument();
    });
  });

  describe('Links', () => {
    it('should have correct href for documentation link', () => {
      render(<AppFooter />);
      
      const docLink = screen.getByText('Documentation');
      expect(docLink).toHaveAttribute('href', '/docs');
    });

    it('should have correct href for GitHub link with external attributes', () => {
      render(<AppFooter />);
      
      const githubLink = screen.getByText('GitHub');
      expect(githubLink).toHaveAttribute('href', 'https://github.com/fairform');
      expect(githubLink).toHaveAttribute('target', '_blank');
      expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Accessibility', () => {
    it('should have proper landmark role', () => {
      const { container } = render(<AppFooter />);
      
      const footer = container.querySelector('footer');
      expect(footer).toHaveAttribute('role', 'contentinfo');
    });

    it('should have navigation with aria-label', () => {
      render(<AppFooter />);
      
      expect(screen.getByLabelText('Footer navigation')).toBeInTheDocument();
    });

    it('should have focusable links', () => {
      render(<AppFooter />);
      
      const docLink = screen.getByText('Documentation');
      const githubLink = screen.getByText('GitHub');
      
      expect(docLink).toHaveClass('focus-visible:outline-none');
      expect(githubLink).toHaveClass('focus-visible:outline-none');
    });
  });

  describe('Responsive Layout', () => {
    it('should have responsive flex layout classes', () => {
      const { container } = render(<AppFooter />);
      
      const contentDiv = container.querySelector('.flex.flex-col.items-center.justify-between');
      expect(contentDiv).toBeInTheDocument();
      expect(contentDiv).toHaveClass('sm:flex-row');
    });
  });
});

