import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChatWidget, type ConnectionStatus } from './ChatWidget';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: React.ComponentProps<'button'>) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: React.ComponentProps<'div'>) => <>{children}</>,
}));

describe('ChatWidget', () => {
  const defaultProps = {
    isOpen: false,
    onToggle: vi.fn(),
    unreadCount: 0,
    connectionStatus: 'connected' as ConnectionStatus,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering and Positioning', () => {
    it('renders with correct positioning classes', () => {
      render(<ChatWidget {...defaultProps} />);
      
      const widget = screen.getByRole('button');
      expect(widget.closest('div')).toHaveClass('fixed', 'bottom-6', 'right-6', 'z-50');
    });

    it('renders with correct size classes', () => {
      render(<ChatWidget {...defaultProps} />);
      
      const widget = screen.getByRole('button');
      expect(widget.closest('div')).toHaveClass('w-14', 'h-14', 'md:w-16', 'md:h-16');
    });

    it('renders the message circle icon', () => {
      render(<ChatWidget {...defaultProps} />);
      
      const icon = screen.getByRole('button').querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('w-6', 'h-6');
    });

    it('applies custom className when provided', () => {
      render(<ChatWidget {...defaultProps} className="custom-class" />);
      
      const widget = screen.getByRole('button').closest('div');
      expect(widget).toHaveClass('custom-class');
    });
  });

  describe('Click Handler Functionality', () => {
    it('calls onToggle when clicked', () => {
      const onToggle = vi.fn();
      render(<ChatWidget {...defaultProps} onToggle={onToggle} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it('handles keyboard navigation with Enter key', () => {
      const onToggle = vi.fn();
      render(<ChatWidget {...defaultProps} onToggle={onToggle} />);
      
      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter' });
      
      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it('handles keyboard navigation with Space key', () => {
      const onToggle = vi.fn();
      render(<ChatWidget {...defaultProps} onToggle={onToggle} />);
      
      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: ' ' });
      
      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it('ignores other key presses', () => {
      const onToggle = vi.fn();
      render(<ChatWidget {...defaultProps} onToggle={onToggle} />);
      
      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Escape' });
      
      expect(onToggle).not.toHaveBeenCalled();
    });
  });

  describe('Unread Count Badge', () => {
    it('shows unread count badge when count > 0', () => {
      render(<ChatWidget {...defaultProps} unreadCount={5} />);
      
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('does not show badge when count is 0', () => {
      render(<ChatWidget {...defaultProps} unreadCount={0} />);
      
      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });

    it('displays "99+" for counts over 99', () => {
      render(<ChatWidget {...defaultProps} unreadCount={150} />);
      
      expect(screen.getByText('99+')).toBeInTheDocument();
    });

    it('displays exact count for numbers 99 and below', () => {
      render(<ChatWidget {...defaultProps} unreadCount={99} />);
      
      expect(screen.getByText('99')).toBeInTheDocument();
    });

    it('applies correct styling to unread badge', () => {
      render(<ChatWidget {...defaultProps} unreadCount={3} />);
      
      const badge = screen.getByText('3');
      expect(badge).toHaveClass('bg-red-500', 'text-white', 'rounded-full');
    });
  });

  describe('Connection Status Indicator', () => {
    it('shows connected status with green color', () => {
      render(<ChatWidget {...defaultProps} connectionStatus="connected" />);
      
      const statusIndicator = screen.getByRole('button').querySelector('.bg-green-500');
      expect(statusIndicator).toBeInTheDocument();
    });

    it('shows connecting status with yellow color', () => {
      render(<ChatWidget {...defaultProps} connectionStatus="connecting" />);
      
      const statusIndicator = screen.getByRole('button').querySelector('.bg-yellow-500');
      expect(statusIndicator).toBeInTheDocument();
    });

    it('shows disconnected status with red color', () => {
      render(<ChatWidget {...defaultProps} connectionStatus="disconnected" />);
      
      const statusIndicator = screen.getByRole('button').querySelector('.bg-red-500');
      expect(statusIndicator).toBeInTheDocument();
    });

    it('applies correct styling to status indicator', () => {
      render(<ChatWidget {...defaultProps} connectionStatus="connected" />);
      
      const statusIndicator = screen.getByRole('button').querySelector('.bg-green-500');
      expect(statusIndicator?.parentElement).toHaveClass('w-3', 'h-3', 'rounded-full');
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA attributes', () => {
      render(<ChatWidget {...defaultProps} isOpen={false} unreadCount={3} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(button).toHaveAttribute('tabIndex', '0');
      // role="button" is implicit for button elements, so we don't need to test it explicitly
    });

    it('updates aria-expanded when isOpen changes', () => {
      render(<ChatWidget {...defaultProps} isOpen={true} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('includes unread count in aria-label', () => {
      render(<ChatWidget {...defaultProps} unreadCount={5} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label');
      expect(button.getAttribute('aria-label')).toContain('5 unread messages');
    });

    it('includes connection status in aria-label', () => {
      render(<ChatWidget {...defaultProps} connectionStatus="connecting" />);
      
      const button = screen.getByRole('button');
      expect(button.getAttribute('aria-label')).toContain('Connecting to AI Copilot');
    });

    it('includes no unread messages in aria-label when count is 0', () => {
      render(<ChatWidget {...defaultProps} unreadCount={0} />);
      
      const button = screen.getByRole('button');
      expect(button.getAttribute('aria-label')).toContain('No unread messages');
    });
  });

  describe('State Variations', () => {
    it('handles open state correctly', () => {
      render(<ChatWidget {...defaultProps} isOpen={true} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('handles closed state correctly', () => {
      render(<ChatWidget {...defaultProps} isOpen={false} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('handles multiple state combinations', () => {
      render(
        <ChatWidget 
          {...defaultProps} 
          isOpen={true} 
          unreadCount={10} 
          connectionStatus="disconnected" 
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(button.querySelector('.bg-red-500')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('includes responsive classes for different screen sizes', () => {
      render(<ChatWidget {...defaultProps} />);
      
      const widget = screen.getByRole('button').closest('div');
      expect(widget).toHaveClass('md:w-16', 'md:h-16', 'lg:bottom-8', 'lg:right-8');
    });

    it('includes responsive classes for icon', () => {
      render(<ChatWidget {...defaultProps} />);
      
      const icon = screen.getByRole('button').querySelector('svg');
      expect(icon).toHaveClass('md:w-7', 'md:h-7');
    });

    it('includes responsive classes for badge', () => {
      render(<ChatWidget {...defaultProps} unreadCount={5} />);
      
      const badge = screen.getByText('5');
      expect(badge).toHaveClass('md:w-6', 'md:h-6', 'md:text-sm');
    });
  });
});
