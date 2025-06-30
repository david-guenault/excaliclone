// ABOUTME: Tests for IconBase component - core icon functionality
// ABOUTME: Comprehensive test coverage for base icon props and rendering

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { IconBase } from '../IconBase';

describe('IconBase Component', () => {
  describe('Default Props', () => {
    it('renders with default props', () => {
      const { container } = render(
        <IconBase>
          <circle cx="12" cy="12" r="9" />
        </IconBase>
      );

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('width', '20');
      expect(svg).toHaveAttribute('height', '20');
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
      expect(svg).toHaveAttribute('fill', 'none');
      expect(svg).toHaveAttribute('stroke', 'currentColor');
      expect(svg).toHaveAttribute('stroke-width', '1.5');
      expect(svg).toHaveAttribute('stroke-linecap', 'round');
      expect(svg).toHaveAttribute('stroke-linejoin', 'round');
    });

    it('renders children correctly', () => {
      const { container } = render(
        <IconBase>
          <circle cx="12" cy="12" r="9" data-testid="test-circle" />
        </IconBase>
      );

      expect(container.querySelector('[data-testid="test-circle"]')).toBeInTheDocument();
    });
  });

  describe('Custom Props', () => {
    it('accepts custom size', () => {
      const { container } = render(
        <IconBase size={32}>
          <circle cx="12" cy="12" r="9" />
        </IconBase>
      );

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '32');
      expect(svg).toHaveAttribute('height', '32');
    });

    it('accepts custom color', () => {
      const { container } = render(
        <IconBase color="#ff0000">
          <circle cx="12" cy="12" r="9" />
        </IconBase>
      );

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('stroke', '#ff0000');
    });

    it('accepts custom strokeWidth', () => {
      const { container } = render(
        <IconBase strokeWidth={3}>
          <circle cx="12" cy="12" r="9" />
        </IconBase>
      );

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('stroke-width', '3');
    });

    it('accepts custom className', () => {
      const { container } = render(
        <IconBase className="custom-icon">
          <circle cx="12" cy="12" r="9" />
        </IconBase>
      );

      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('custom-icon');
    });

    it('accepts custom viewBox', () => {
      const { container } = render(
        <IconBase viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="18" />
        </IconBase>
      );

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('viewBox', '0 0 48 48');
    });
  });

  describe('Combined Props', () => {
    it('handles multiple custom props together', () => {
      const { container } = render(
        <IconBase
          size={24}
          color="#00ff00"
          strokeWidth={2.5}
          className="test-icon custom-class"
          viewBox="0 0 32 32"
        >
          <rect x="4" y="4" width="24" height="24" />
        </IconBase>
      );

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '24');
      expect(svg).toHaveAttribute('height', '24');
      expect(svg).toHaveAttribute('stroke', '#00ff00');
      expect(svg).toHaveAttribute('stroke-width', '2.5');
      expect(svg).toHaveClass('test-icon');
      expect(svg).toHaveClass('custom-class');
      expect(svg).toHaveAttribute('viewBox', '0 0 32 32');
    });
  });

  describe('Accessibility', () => {
    it('has proper SVG structure for screen readers', () => {
      const { container } = render(
        <IconBase>
          <circle cx="12" cy="12" r="9" />
        </IconBase>
      );

      const svg = container.querySelector('svg');
      expect(svg?.tagName).toBe('svg');
      expect(svg).toHaveAttribute('fill', 'none');
      expect(svg).toHaveAttribute('stroke-linecap', 'round');
      expect(svg).toHaveAttribute('stroke-linejoin', 'round');
    });
  });

  describe('Edge Cases', () => {
    it('handles size of 0', () => {
      const { container } = render(
        <IconBase size={0}>
          <circle cx="12" cy="12" r="9" />
        </IconBase>
      );

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '0');
      expect(svg).toHaveAttribute('height', '0');
    });

    it('handles negative strokeWidth', () => {
      const { container } = render(
        <IconBase strokeWidth={-1}>
          <circle cx="12" cy="12" r="9" />
        </IconBase>
      );

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('stroke-width', '-1');
    });

    it('handles empty children', () => {
      const { container } = render(
        <IconBase>
          {null}
        </IconBase>
      );

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg?.children).toHaveLength(0);
    });

    it('handles multiple children', () => {
      const { container } = render(
        <IconBase>
          <circle cx="12" cy="12" r="9" data-testid="circle" />
          <rect x="6" y="6" width="12" height="12" data-testid="rect" />
        </IconBase>
      );

      expect(container.querySelector('[data-testid="circle"]')).toBeInTheDocument();
      expect(container.querySelector('[data-testid="rect"]')).toBeInTheDocument();
    });
  });
});