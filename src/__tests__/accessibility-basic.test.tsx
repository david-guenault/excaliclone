// ABOUTME: Basic accessibility tests for core WCAG compliance
// ABOUTME: Tests implemented accessibility features in Canvas, Icons, and ColorPalette

import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Canvas } from '../components/Canvas/Canvas';
import { ColorPalette } from '../components/ColorPalette/ColorPalette';
import { IconBase } from '../components/UI/Icons/IconBase';
import { RectangleIcon } from '../components/UI/Icons/RectangleIcon';
import { CircleIcon } from '../components/UI/Icons/CircleIcon';
import { ArrowIcon } from '../components/UI/Icons/ArrowIcon';
import type { Element, Viewport } from '../types';

describe('Basic Accessibility Tests', () => {
  let mockElements: Element[];
  let mockViewport: Viewport;

  beforeEach(() => {
    mockElements = [
      {
        id: 'rect1',
        type: 'rectangle',
        x: 10,
        y: 20,
        width: 100,
        height: 50,
        angle: 0,
        strokeColor: '#000',
        backgroundColor: 'transparent',
        strokeWidth: 2,
        roughness: 1,
        opacity: 1,
      },
    ];

    mockViewport = {
      zoom: 1,
      pan: { x: 0, y: 0 },
      bounds: { x: 0, y: 0, width: 800, height: 600 },
    };
  });

  describe('Canvas Accessibility', () => {
    it('has proper ARIA role and label', () => {
      render(
        <Canvas
          width={800}
          height={600}
          elements={mockElements}
          viewport={mockViewport}
        />
      );

      const canvas = document.querySelector('canvas');
      expect(canvas).toBeInTheDocument();
      expect(canvas).toHaveAttribute('role', 'img');
      expect(canvas).toHaveAttribute('aria-label');
      expect(canvas).toHaveAttribute('tabIndex', '0');
    });

    it('is keyboard focusable', async () => {
      const user = userEvent.setup();

      render(
        <Canvas
          width={800}
          height={600}
          elements={mockElements}
          viewport={mockViewport}
        />
      );

      const canvas = document.querySelector('canvas')!;
      
      // Should be able to focus canvas with keyboard
      await user.tab();
      expect(canvas).toHaveFocus();
    });

    it('has meaningful aria-label that includes element count', () => {
      render(
        <Canvas
          width={800}
          height={600}
          elements={mockElements}
          viewport={mockViewport}
        />
      );

      const canvas = document.querySelector('canvas');
      expect(canvas).toHaveAttribute('aria-label', 'Drawing canvas with 1 elements');
    });

    it('updates aria-label when element count changes', () => {
      const { rerender } = render(
        <Canvas
          width={800}
          height={600}
          elements={[]}
          viewport={mockViewport}
        />
      );

      let canvas = document.querySelector('canvas');
      expect(canvas).toHaveAttribute('aria-label', 'Drawing canvas with 0 elements');

      rerender(
        <Canvas
          width={800}
          height={600}
          elements={mockElements}
          viewport={mockViewport}
        />
      );

      canvas = document.querySelector('canvas');
      expect(canvas).toHaveAttribute('aria-label', 'Drawing canvas with 1 elements');
    });
  });

  describe('Icon Accessibility', () => {
    it('IconBase provides proper accessibility attributes', () => {
      render(
        <IconBase aria-label="Test icon">
          <circle cx="12" cy="12" r="9" />
        </IconBase>
      );

      const svg = document.querySelector('svg');
      expect(svg).toHaveAttribute('role', 'img');
      expect(svg).toHaveAttribute('aria-label', 'Test icon');
    });

    it('IconBase defaults to img role when none specified', () => {
      render(
        <IconBase>
          <circle cx="12" cy="12" r="9" />
        </IconBase>
      );

      const svg = document.querySelector('svg');
      expect(svg).toHaveAttribute('role', 'img');
    });

    it('allows custom role override', () => {
      render(
        <IconBase role="presentation">
          <circle cx="12" cy="12" r="9" />
        </IconBase>
      );

      const svg = document.querySelector('svg');
      expect(svg).toHaveAttribute('role', 'presentation');
    });

    it('RectangleIcon has default aria-label', () => {
      render(<RectangleIcon />);

      const svg = document.querySelector('svg');
      expect(svg).toHaveAttribute('aria-label', 'Rectangle tool');
    });

    it('icons can override default aria-label', () => {
      render(<RectangleIcon aria-label="Custom rectangle label" />);

      const svg = document.querySelector('svg');
      expect(svg).toHaveAttribute('aria-label', 'Custom rectangle label');
    });

    it('all icon components render with accessibility attributes', () => {
      const icons = [RectangleIcon, CircleIcon, ArrowIcon];

      icons.forEach((IconComponent) => {
        const { container } = render(<IconComponent />);
        const svg = container.querySelector('svg');
        
        expect(svg).toHaveAttribute('role', 'img');
        // Should have either default or explicit aria-label
        expect(svg).toHaveAttribute('aria-label');
      });
    });
  });

  describe('Color Palette Accessibility', () => {
    it('renders without accessibility errors', () => {
      const mockProps = {
        selectedStrokeColor: '#000000',
        selectedBackgroundColor: 'transparent',
        onStrokeColorChange: () => {},
        onBackgroundColorChange: () => {},
        onClose: () => {},
      };

      expect(() => {
        render(<ColorPalette {...mockProps} />);
      }).not.toThrow();
    });

    it('has focusable color buttons', () => {
      const mockProps = {
        selectedStrokeColor: '#000000',
        selectedBackgroundColor: 'transparent',
        onStrokeColorChange: () => {},
        onBackgroundColorChange: () => {},
        onClose: () => {},
      };

      render(<ColorPalette {...mockProps} />);

      // Should have interactive elements
      const buttons = document.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('color buttons have proper attributes', () => {
      const mockProps = {
        selectedStrokeColor: '#000000',
        selectedBackgroundColor: 'transparent',
        onStrokeColorChange: () => {},
        onBackgroundColorChange: () => {},
        onClose: () => {},
      };

      render(<ColorPalette {...mockProps} />);

      const buttons = document.querySelectorAll('button');
      buttons.forEach(button => {
        // Buttons should be properly labeled
        expect(button).toHaveAttribute('aria-label');
      });
    });
  });

  describe('Touch and Size Accessibility', () => {
    it('icons meet minimum touch target size when sized appropriately', () => {
      render(<RectangleIcon size={44} />);

      const svg = document.querySelector('svg');
      expect(svg).toHaveAttribute('width', '44');
      expect(svg).toHaveAttribute('height', '44');
      
      // 44px is the recommended minimum touch target size
      const width = parseInt(svg?.getAttribute('width') || '0');
      const height = parseInt(svg?.getAttribute('height') || '0');
      expect(width).toBeGreaterThanOrEqual(44);
      expect(height).toBeGreaterThanOrEqual(44);
    });

    it('canvas is large enough for interaction', () => {
      render(
        <Canvas
          width={800}
          height={600}
          elements={mockElements}
          viewport={mockViewport}
        />
      );

      const canvas = document.querySelector('canvas');
      expect(canvas).toHaveAttribute('width', '800');
      expect(canvas).toHaveAttribute('height', '600');
    });
  });

  describe('Color and Contrast', () => {
    it('provides text alternatives for color information', () => {
      const mockProps = {
        selectedStrokeColor: '#ff0000',
        selectedBackgroundColor: '#00ff00',
        onStrokeColorChange: () => {},
        onBackgroundColorChange: () => {},
        onClose: () => {},
      };

      render(<ColorPalette {...mockProps} />);

      // Color buttons should have text descriptions
      const buttons = document.querySelectorAll('button[aria-label]');
      expect(buttons.length).toBeGreaterThan(0);
      
      buttons.forEach(button => {
        const label = button.getAttribute('aria-label');
        expect(label).toBeTruthy();
        expect(label?.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Component Structure', () => {
    it('components use semantic HTML where appropriate', () => {
      const mockProps = {
        selectedStrokeColor: '#000000',
        selectedBackgroundColor: 'transparent',
        onStrokeColorChange: () => {},
        onBackgroundColorChange: () => {},
        onClose: () => {},
      };

      render(<ColorPalette {...mockProps} />);

      // Should use semantic button elements for interactions
      const buttons = document.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('maintains consistent focus order', async () => {
      const user = userEvent.setup();
      
      render(
        <div>
          <button>First Button</button>
          <Canvas
            width={400}
            height={300}
            elements={[]}
            viewport={mockViewport}
          />
          <button>Last Button</button>
        </div>
      );

      // Focus should move in logical order
      await user.tab();
      expect(document.activeElement?.tagName).toBe('BUTTON');
      
      await user.tab();
      expect(document.activeElement?.tagName).toBe('CANVAS');
      
      await user.tab();
      expect(document.activeElement?.tagName).toBe('BUTTON');
    });
  });

  describe('Error Handling', () => {
    it('gracefully handles missing accessibility attributes', () => {
      // Test that components work even without full a11y support
      const { container } = render(
        <IconBase>
          <circle cx="12" cy="12" r="9" />
        </IconBase>
      );

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      // Should still have default role even without aria-label
      expect(svg).toHaveAttribute('role', 'img');
    });
  });
});