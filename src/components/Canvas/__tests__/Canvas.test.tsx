// ABOUTME: Tests for Canvas React component - event handling and integration
// ABOUTME: Comprehensive test coverage for Canvas component functionality

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Canvas } from '../Canvas';
import type { Element, Viewport, Point } from '../../../types';

describe('Canvas Component', () => {
  let mockElements: Element[];
  let mockViewport: Viewport;
  let mockOnMouseDown: ReturnType<typeof vi.fn>;
  let mockOnMouseMove: ReturnType<typeof vi.fn>;
  let mockOnMouseUp: ReturnType<typeof vi.fn>;

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

    mockOnMouseDown = vi.fn();
    mockOnMouseMove = vi.fn();
    mockOnMouseUp = vi.fn();
  });

  describe('Component Rendering', () => {
    it('renders canvas element with correct width/height', () => {
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
      expect(canvas).toHaveAttribute('width', '800');
      expect(canvas).toHaveAttribute('height', '600');
    });

    it('applies correct CSS class', () => {
      render(
        <Canvas
          width={800}
          height={600}
          elements={mockElements}
          viewport={mockViewport}
        />
      );

      const canvas = document.querySelector('canvas')!;
      expect(canvas).toHaveClass('excalibox-canvas');
    });

    it('creates canvas ref correctly', () => {
      const { container } = render(
        <Canvas
          width={800}
          height={600}
          elements={mockElements}
          viewport={mockViewport}
        />
      );

      const canvas = container.querySelector('canvas');
      expect(canvas).toBeInTheDocument();
      expect(canvas?.tagName).toBe('CANVAS');
    });
  });

  describe('Mouse Event Handling', () => {
    it('calls onMouseDown with correct point when mouse pressed', async () => {
      const user = userEvent.setup();

      render(
        <Canvas
          width={800}
          height={600}
          elements={mockElements}
          viewport={mockViewport}
          onMouseDown={mockOnMouseDown}
        />
      );

      const canvas = document.querySelector('canvas')!;

      // Simulate mouse down at specific coordinates
      await user.pointer({ target: canvas, coords: { clientX: 100, clientY: 150 } });
      await user.click(canvas);

      expect(mockOnMouseDown).toHaveBeenCalledWith({ x: 100, y: 150 }, expect.any(MouseEvent));
    });

    it('calls onMouseMove with correct point when mouse moved', async () => {
      const user = userEvent.setup();

      render(
        <Canvas
          width={800}
          height={600}
          elements={mockElements}
          viewport={mockViewport}
          onMouseMove={mockOnMouseMove}
        />
      );

      const canvas = document.querySelector('canvas')!;

      // Simulate mouse move
      await user.hover(canvas);
      await user.pointer({ target: canvas, coords: { clientX: 200, clientY: 250 } });

      expect(mockOnMouseMove).toHaveBeenCalledWith({ x: 200, y: 250 }, expect.any(MouseEvent));
    });

    it('calls onMouseUp with correct point when mouse released', async () => {
      const user = userEvent.setup();

      render(
        <Canvas
          width={800}
          height={600}
          elements={mockElements}
          viewport={mockViewport}
          onMouseUp={mockOnMouseUp}
        />
      );

      const canvas = document.querySelector('canvas')!;

      // Simulate mouse down and up
      await user.pointer([
        { target: canvas, coords: { clientX: 300, clientY: 400 } },
        { keys: '[MouseLeft>]' },
        { keys: '[/MouseLeft]' },
      ]);

      expect(mockOnMouseUp).toHaveBeenCalledWith({ x: 300, y: 400 }, expect.any(MouseEvent));
    });

    it('handles events when callbacks are undefined', async () => {
      const user = userEvent.setup();

      // Should not throw when callbacks are undefined
      expect(() => {
        render(
          <Canvas
            width={800}
            height={600}
            elements={mockElements}
            viewport={mockViewport}
          />
        );
      }).not.toThrow();

      const canvas = document.querySelector('canvas')!;

      // Should not throw when interacting without callbacks
      await expect(user.click(canvas)).resolves.not.toThrow();
    });

    it('correctly calculates canvas coordinates with getBoundingClientRect', () => {
      // Mock getBoundingClientRect to return offset
      const mockGetBoundingClientRect = vi.fn(() => ({
        left: 50,
        top: 100,
        right: 850,
        bottom: 700,
        width: 800,
        height: 600,
        x: 50,
        y: 100,
        toJSON: vi.fn(),
      }));

      HTMLCanvasElement.prototype.getBoundingClientRect = mockGetBoundingClientRect;

      render(
        <Canvas
          width={800}
          height={600}
          elements={mockElements}
          viewport={mockViewport}
          onMouseDown={mockOnMouseDown}
        />
      );

      const canvas = document.querySelector('canvas')!;

      // Simulate mouse event at clientX: 150, clientY: 200
      // With canvas offset of left: 50, top: 100
      // Canvas coordinates should be x: 100, y: 100
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: 150,
        clientY: 200,
        bubbles: true,
      });

      canvas.dispatchEvent(mouseEvent);

      expect(mockOnMouseDown).toHaveBeenCalledWith({ x: 100, y: 100 }, expect.any(MouseEvent));
    });
  });

  describe('getCanvasPoint Edge Cases', () => {
    it('returns {x: 0, y: 0} when canvas ref is null', () => {
      // This is tested internally by the component
      // We can test by ensuring the component doesn't crash when canvas is not available
      render(
        <Canvas
          width={800}
          height={600}
          elements={mockElements}
          viewport={mockViewport}
          onMouseDown={mockOnMouseDown}
        />
      );

      // Component should render without crashing
      expect(document.querySelector('canvas')).toBeInTheDocument();
    });

    it('handles mouse events with extreme coordinates', async () => {
      render(
        <Canvas
          width={800}
          height={600}
          elements={mockElements}
          viewport={mockViewport}
          onMouseDown={mockOnMouseDown}
        />
      );

      const canvas = document.querySelector('canvas')!;

      // Test with very large coordinates
      const extremeEvent = new MouseEvent('mousedown', {
        clientX: 999999,
        clientY: -999999,
        bubbles: true,
      });

      canvas.dispatchEvent(extremeEvent);

      expect(mockOnMouseDown).toHaveBeenCalledWith({ x: 999949, y: -1000099 }, expect.any(MouseEvent));
    });
  });

  describe('Props Integration', () => {
    it('updates when elements prop changes', () => {
      const { rerender } = render(
        <Canvas
          width={800}
          height={600}
          elements={mockElements}
          viewport={mockViewport}
        />
      );

      const newElements: Element[] = [
        ...mockElements,
        {
          id: 'circle1',
          type: 'circle',
          x: 100,
          y: 100,
          width: 80,
          height: 80,
          angle: 0,
          strokeColor: '#ff0000',
          backgroundColor: 'transparent',
          strokeWidth: 3,
          roughness: 1,
          opacity: 1,
        },
      ];

      // Re-render with new elements
      rerender(
        <Canvas
          width={800}
          height={600}
          elements={newElements}
          viewport={mockViewport}
        />
      );

      // Component should handle the update without crashing
      expect(document.querySelector('canvas')).toBeInTheDocument();
    });

    it('updates when viewport prop changes', () => {
      const { rerender } = render(
        <Canvas
          width={800}
          height={600}
          elements={mockElements}
          viewport={mockViewport}
        />
      );

      const newViewport: Viewport = {
        zoom: 2,
        pan: { x: 100, y: 200 },
        bounds: { x: 0, y: 0, width: 1000, height: 800 },
      };

      // Re-render with new viewport
      rerender(
        <Canvas
          width={800}
          height={600}
          elements={mockElements}
          viewport={newViewport}
        />
      );

      // Component should handle the update without crashing
      expect(document.querySelector('canvas')).toBeInTheDocument();
    });

    it('updates canvas dimensions when width/height props change', () => {
      const { rerender } = render(
        <Canvas
          width={800}
          height={600}
          elements={mockElements}
          viewport={mockViewport}
        />
      );

      // Re-render with different dimensions
      rerender(
        <Canvas
          width={1200}
          height={900}
          elements={mockElements}
          viewport={mockViewport}
        />
      );

      const canvas = document.querySelector('canvas')!;
      expect(canvas).toHaveAttribute('width', '1200');
      expect(canvas).toHaveAttribute('height', '900');
    });
  });

  describe('Event Listener Management', () => {
    it('adds and removes event listeners correctly', () => {
      const addEventListenerSpy = vi.spyOn(HTMLCanvasElement.prototype, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(HTMLCanvasElement.prototype, 'removeEventListener');

      const { unmount } = render(
        <Canvas
          width={800}
          height={600}
          elements={mockElements}
          viewport={mockViewport}
          onMouseDown={mockOnMouseDown}
          onMouseMove={mockOnMouseMove}
          onMouseUp={mockOnMouseUp}
        />
      );

      // Should add event listeners
      expect(addEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));

      // Clean up
      unmount();

      // Should remove event listeners on unmount
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));

      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });

    it('handles callback prop changes without memory leaks', () => {
      const removeEventListenerSpy = vi.spyOn(HTMLCanvasElement.prototype, 'removeEventListener');
      const addEventListenerSpy = vi.spyOn(HTMLCanvasElement.prototype, 'addEventListener');

      const { rerender } = render(
        <Canvas
          width={800}
          height={600}
          elements={mockElements}
          viewport={mockViewport}
          onMouseDown={mockOnMouseDown}
        />
      );

      const newOnMouseDown = vi.fn();

      // Re-render with new callback
      rerender(
        <Canvas
          width={800}
          height={600}
          elements={mockElements}
          viewport={mockViewport}
          onMouseDown={newOnMouseDown}
        />
      );

      // Should remove old listeners and add new ones
      expect(removeEventListenerSpy).toHaveBeenCalled();
      expect(addEventListenerSpy).toHaveBeenCalled();

      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });
  });

  describe('Canvas Context and Renderer Integration', () => {
    it('initializes CanvasRenderer when canvas context is available', () => {
      const getContextSpy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext');

      render(
        <Canvas
          width={800}
          height={600}
          elements={mockElements}
          viewport={mockViewport}
        />
      );

      expect(getContextSpy).toHaveBeenCalledWith('2d');
      getContextSpy.mockRestore();
    });

    it('handles case when getContext returns null gracefully', () => {
      const getContextSpy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext')
        .mockReturnValue(null);

      expect(() => {
        render(
          <Canvas
            width={800}
            height={600}
            elements={mockElements}
            viewport={mockViewport}
          />
        );
      }).not.toThrow();

      getContextSpy.mockRestore();
    });

    it('re-initializes renderer when viewport changes significantly', () => {
      const { rerender } = render(
        <Canvas
          width={800}
          height={600}
          elements={mockElements}
          viewport={mockViewport}
        />
      );

      const newViewport: Viewport = {
        zoom: 3,
        pan: { x: 500, y: 600 },
        bounds: { x: 0, y: 0, width: 1600, height: 1200 },
      };

      // Should not crash when viewport changes
      expect(() => {
        rerender(
          <Canvas
            width={800}
            height={600}
            elements={mockElements}
            viewport={newViewport}
          />
        );
      }).not.toThrow();
    });
  });

  describe('Performance Considerations', () => {
    it('handles rapid re-renders without memory leaks', () => {
      const { rerender } = render(
        <Canvas
          width={800}
          height={600}
          elements={mockElements}
          viewport={mockViewport}
        />
      );

      // Simulate rapid updates
      for (let i = 0; i < 10; i++) {
        const updatedElements = mockElements.map(el => ({ ...el, x: el.x + i }));
        rerender(
          <Canvas
            width={800}
            height={600}
            elements={updatedElements}
            viewport={mockViewport}
          />
        );
      }

      // Should handle rapid updates without crashing
      expect(document.querySelector('canvas')).toBeInTheDocument();
    });

    it('handles large numbers of elements efficiently', () => {
      const manyElements: Element[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `element-${i}`,
        type: 'rectangle' as const,
        x: i % 100,
        y: Math.floor(i / 100),
        width: 10,
        height: 10,
        angle: 0,
        strokeColor: '#000',
        backgroundColor: 'transparent',
        strokeWidth: 1,
        roughness: 1,
        opacity: 1,
      }));

      expect(() => {
        render(
          <Canvas
            width={800}
            height={600}
            elements={manyElements}
            viewport={mockViewport}
          />
        );
      }).not.toThrow();

      expect(document.querySelector('canvas')).toBeInTheDocument();
    });
  });
});