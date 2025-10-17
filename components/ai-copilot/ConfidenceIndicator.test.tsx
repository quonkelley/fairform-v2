/**
 * Tests for ConfidenceIndicator component (Story 13.32)
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  ConfidenceIndicator,
  getConfidenceLevel,
  getConfidenceDescription,
} from './ConfidenceIndicator';

describe('ConfidenceIndicator', () => {
  describe('getConfidenceLevel', () => {
    it('returns "high" for confidence >= 0.8', () => {
      expect(getConfidenceLevel(0.8)).toBe('high');
      expect(getConfidenceLevel(0.9)).toBe('high');
      expect(getConfidenceLevel(1.0)).toBe('high');
    });

    it('returns "medium" for confidence 0.7-0.79', () => {
      expect(getConfidenceLevel(0.7)).toBe('medium');
      expect(getConfidenceLevel(0.75)).toBe('medium');
      expect(getConfidenceLevel(0.79)).toBe('medium');
    });

    it('returns "low" for confidence < 0.7', () => {
      expect(getConfidenceLevel(0.69)).toBe('low');
      expect(getConfidenceLevel(0.5)).toBe('low');
      expect(getConfidenceLevel(0.0)).toBe('low');
    });

    it('returns "high" when confidence is undefined', () => {
      expect(getConfidenceLevel(undefined)).toBe('high');
    });
  });

  describe('getConfidenceDescription', () => {
    it('returns correct description for high confidence', () => {
      expect(getConfidenceDescription('high')).toBe('High confidence');
    });

    it('returns correct description for medium confidence', () => {
      expect(getConfidenceDescription('medium')).toBe(
        'Moderate confidence - please verify'
      );
    });

    it('returns correct description for low confidence', () => {
      expect(getConfidenceDescription('low')).toBe(
        'Low confidence - may need correction'
      );
    });
  });

  describe('Component rendering', () => {
    it('renders green checkmark for high confidence', () => {
      render(<ConfidenceIndicator confidence={0.9} />);

      const indicator = screen.getByRole('img');
      expect(indicator).toHaveAttribute(
        'aria-label',
        expect.stringContaining('High confidence')
      );
      expect(indicator).toHaveAttribute('aria-label', expect.stringContaining('90%'));
    });

    it('renders gray question mark for medium confidence', () => {
      render(<ConfidenceIndicator confidence={0.75} />);

      const indicator = screen.getByRole('img');
      expect(indicator).toHaveAttribute(
        'aria-label',
        expect.stringContaining('Moderate confidence')
      );
      expect(indicator).toHaveAttribute('aria-label', expect.stringContaining('75%'));
    });

    it('renders amber warning for low confidence', () => {
      render(<ConfidenceIndicator confidence={0.6} />);

      const indicator = screen.getByRole('img');
      expect(indicator).toHaveAttribute(
        'aria-label',
        expect.stringContaining('Low confidence')
      );
      expect(indicator).toHaveAttribute('aria-label', expect.stringContaining('60%'));
    });

    it('shows confidence percentage when showLabel is true', () => {
      render(<ConfidenceIndicator confidence={0.85} showLabel={true} />);

      expect(screen.getByText('85%')).toBeInTheDocument();
    });

    it('hides confidence percentage by default', () => {
      render(<ConfidenceIndicator confidence={0.85} />);

      expect(screen.queryByText('85%')).not.toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <ConfidenceIndicator confidence={0.9} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('handles undefined confidence gracefully', () => {
      render(<ConfidenceIndicator />);

      const indicator = screen.getByRole('img');
      expect(indicator).toHaveAttribute(
        'aria-label',
        expect.stringContaining('High confidence')
      );
    });
  });
});
