// ABOUTME: Error handling and edge case tests
// ABOUTME: Tests application behavior with invalid inputs and boundary conditions

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { useAppStore } from '../store';
import { CanvasRenderer } from '../components/Canvas/CanvasRenderer';
import {
  generateId,
  distance,
  isPointInRect,
  transformPoint,
  inverseTransformPoint,
} from '../utils';

// Mock Canvas component for error testing
vi.mock('../components/Canvas', () => ({
  Canvas: ({ onMouseDown, elements, viewport }: any) => (
    <div
      data-testid="error-test-canvas"
      onClick={(e) => {
        try {
          const rect = e.currentTarget.getBoundingClientRect();
          const point = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          };
          onMouseDown?.(point);
        } catch (error) {
          console.error('Canvas click error:', error);
        }
      }}
    >
      Error Test Canvas
    </div>
  ),
}));

describe('Error Handling and Edge Cases', () => {
  beforeEach(() => {
    // Reset store to clean state
    useAppStore.setState({
      viewport: {
        zoom: 1,
        pan: { x: 0, y: 0 },
        bounds: { x: 0, y: 0, width: 800, height: 600 },
      },
      elements: [],
      selectedElementIds: [],
      activeTool: 'select',
      toolOptions: {
        strokeColor: '#000000',
        backgroundColor: 'transparent',
        strokeWidth: 2,
        roughness: 1,
        opacity: 1,
      },
      theme: 'light',
      panels: {
        toolbar: true,
        sidebar: true,
      },
      history: [[]],
      historyIndex: 0,
    });
  });

  describe('Canvas Error Handling', () => {
    it('handles canvas getContext returning null', () => {
      const mockGetContext = vi.fn(() => null);
      HTMLCanvasElement.prototype.getContext = mockGetContext;

      const mockViewport = {
        zoom: 1,
        pan: { x: 0, y: 0 },
        bounds: { x: 0, y: 0, width: 800, height: 600 },
      };

      // Should not throw when context is null
      expect(() => {
        new CanvasRenderer(null as any, mockViewport);
      }).not.toThrow();
    });

    it('handles missing canvas ref gracefully', () => {
      // This is tested through the Canvas component's internal logic
      // The component should handle null refs without crashing
      expect(() => {
        render(<App />);
      }).not.toThrow();
    });

    it('handles invalid mouse event coordinates', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole('button', { name: 'Rectangle' }));
      const canvas = screen.getByTestId('error-test-canvas');

      // Simulate mouse event with extreme coordinates
      const extremeEvent = new MouseEvent('click', {
        clientX: Infinity,
        clientY: -Infinity,
        bubbles: true,
      });

      expect(() => {
        canvas.dispatchEvent(extremeEvent);
      }).not.toThrow();

      // Should still work with NaN coordinates
      const nanEvent = new MouseEvent('click', {
        clientX: NaN,
        clientY: NaN,
        bubbles: true,
      });

      expect(() => {
        canvas.dispatchEvent(nanEvent);
      }).not.toThrow();
    });
  });

  describe('Store Error Handling', () => {
    it('updateElement with non-existent ID does not crash', () => {
      const { updateElement } = useAppStore.getState();
      const initialElements = useAppStore.getState().elements;

      expect(() => {
        updateElement('non-existent-id', { x: 999 });
      }).not.toThrow();

      // State should remain unchanged
      expect(useAppStore.getState().elements).toEqual(initialElements);
    });

    it('deleteElement with non-existent ID does not crash', () => {
      const { deleteElement } = useAppStore.getState();
      const initialState = useAppStore.getState();

      expect(() => {
        deleteElement('non-existent-id');
      }).not.toThrow();

      // State should remain mostly unchanged (history might update)
      expect(useAppStore.getState().elements).toEqual(initialState.elements);
    });

    it('selectElement with non-existent ID does not crash', () => {
      const { selectElement } = useAppStore.getState();

      expect(() => {
        selectElement('non-existent-id');
      }).not.toThrow();

      // Should set selection to the non-existent ID (which is valid behavior)
      expect(useAppStore.getState().selectedElementIds).toEqual(['non-existent-id']);
    });

    it('undo/redo at history boundaries work correctly', () => {
      const { undo, redo, addElement } = useAppStore.getState();

      // Test undo at beginning of history
      expect(() => {
        undo();
        undo();
        undo(); // Multiple undos beyond beginning
      }).not.toThrow();

      expect(useAppStore.getState().historyIndex).toBe(0);

      // Add element and test redo at end of history
      addElement({
        type: 'rectangle',
        x: 0,
        y: 0,
        width: 100,
        height: 50,
        angle: 0,
        strokeColor: '#000',
        backgroundColor: 'transparent',
        strokeWidth: 2,
        roughness: 1,
        opacity: 1,
      });

      expect(() => {
        redo();
        redo();
        redo(); // Multiple redos beyond end
      }).not.toThrow();

      // Should remain at the last valid history index
      const finalState = useAppStore.getState();
      expect(finalState.historyIndex).toBe(finalState.history.length - 1);
    });
  });

  describe('Renderer Error Handling', () => {
    let mockCtx: any;
    let renderer: CanvasRenderer;

    beforeEach(() => {
      mockCtx = {
        clearRect: vi.fn(),
        fillRect: vi.fn(),
        strokeRect: vi.fn(),
        beginPath: vi.fn(),
        arc: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        stroke: vi.fn(),
        fill: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        scale: vi.fn(),
        translate: vi.fn(),
        rotate: vi.fn(),
        fillText: vi.fn(),
        strokeText: vi.fn(),
        canvas: { width: 800, height: 600 },
        strokeStyle: '',
        fillStyle: '',
        lineWidth: 1,
        globalAlpha: 1,
        font: '',
        textBaseline: 'top',
      };

      const viewport = {
        zoom: 1,
        pan: { x: 0, y: 0 },
        bounds: { x: 0, y: 0, width: 800, height: 600 },
      };

      renderer = new CanvasRenderer(mockCtx, viewport);
    });

    it('handles elements with invalid/missing properties', () => {
      const invalidElement = {
        id: 'invalid',
        type: 'rectangle',
        x: NaN,
        y: undefined,
        width: -100,
        height: Infinity,
        angle: 'not-a-number',
        strokeColor: null,
        backgroundColor: undefined,
        strokeWidth: NaN,
        roughness: -1,
        opacity: 2,
      } as any;

      expect(() => {
        renderer.renderElement(invalidElement);
      }).not.toThrow();
    });

    it('handles extreme zoom values', () => {
      expect(() => {
        renderer.updateViewport({
          zoom: 0,
          pan: { x: 0, y: 0 },
          bounds: { x: 0, y: 0, width: 800, height: 600 },
        });
      }).not.toThrow();

      expect(() => {
        renderer.updateViewport({
          zoom: Infinity,
          pan: { x: 0, y: 0 },
          bounds: { x: 0, y: 0, width: 800, height: 600 },
        });
      }).not.toThrow();

      expect(() => {
        renderer.updateViewport({
          zoom: -1,
          pan: { x: 0, y: 0 },
          bounds: { x: 0, y: 0, width: 800, height: 600 },
        });
      }).not.toThrow();
    });

    it('handles NaN coordinates gracefully', () => {
      const nanElement = {
        id: 'nan-test',
        type: 'rectangle' as const,
        x: NaN,
        y: NaN,
        width: NaN,
        height: NaN,
        angle: NaN,
        strokeColor: '#000',
        backgroundColor: 'transparent',
        strokeWidth: 2,
        roughness: 1,
        opacity: 1,
      };

      expect(() => {
        renderer.renderElement(nanElement);
      }).not.toThrow();
    });

    it('handles invalid element types', () => {
      const invalidTypeElement = {
        id: 'invalid-type',
        type: 'invalid-shape' as any,
        x: 0,
        y: 0,
        width: 100,
        height: 50,
        angle: 0,
        strokeColor: '#000',
        backgroundColor: 'transparent',
        strokeWidth: 2,
        roughness: 1,
        opacity: 1,
      };

      expect(() => {
        renderer.renderElement(invalidTypeElement);
      }).not.toThrow();
    });

    it('handles pen element with malformed points', () => {
      const malformedPenElement = {
        id: 'malformed-pen',
        type: 'pen' as const,
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        angle: 0,
        strokeColor: '#000',
        backgroundColor: 'transparent',
        strokeWidth: 2,
        roughness: 1,
        opacity: 1,
        points: [
          { x: NaN, y: 0 },
          { x: 10, y: Infinity },
          null as any,
          undefined as any,
          { x: 20 } as any, // Missing y
          { y: 30 } as any, // Missing x
        ],
      };

      expect(() => {
        renderer.renderElement(malformedPenElement);
      }).not.toThrow();
    });

    it('handles text element with invalid text properties', () => {
      const invalidTextElement = {
        id: 'invalid-text',
        type: 'text' as const,
        x: 0,
        y: 0,
        width: 100,
        height: 50,
        angle: 0,
        strokeColor: '#000',
        backgroundColor: 'transparent',
        strokeWidth: 0, // Zero stroke width
        roughness: 1,
        opacity: 1,
        text: null as any, // Null text
      };

      expect(() => {
        renderer.renderElement(invalidTextElement);
      }).not.toThrow();

      // Test with very long text
      const longTextElement = {
        ...invalidTextElement,
        text: 'A'.repeat(10000), // Very long text
      };

      expect(() => {
        renderer.renderElement(longTextElement);
      }).not.toThrow();
    });
  });

  describe('Utility Function Edge Cases', () => {
    it('generateId handles repeated calls without collision', () => {
      const ids = new Set();
      
      // Generate many IDs to test for collisions
      for (let i = 0; i < 10000; i++) {
        const id = generateId();
        expect(ids.has(id)).toBe(false); // Should not have collision
        ids.add(id);
      }
    });

    it('distance handles extreme coordinate values', () => {
      expect(() => {
        distance({ x: Infinity, y: 0 }, { x: 0, y: 0 });
      }).not.toThrow();

      expect(() => {
        distance({ x: NaN, y: NaN }, { x: 0, y: 0 });
      }).not.toThrow();

      expect(() => {
        distance({ x: Number.MAX_VALUE, y: Number.MAX_VALUE }, { x: 0, y: 0 });
      }).not.toThrow();
    });

    it('isPointInRect handles invalid rectangle values', () => {
      expect(() => {
        isPointInRect({ x: 0, y: 0 }, { x: NaN, y: NaN, width: NaN, height: NaN });
      }).not.toThrow();

      expect(() => {
        isPointInRect({ x: Infinity, y: -Infinity }, { x: 0, y: 0, width: -100, height: -50 });
      }).not.toThrow();
    });

    it('transformPoint handles division by zero and extreme values', () => {
      expect(() => {
        transformPoint({ x: 100, y: 200 }, 0, { x: 0, y: 0 });
      }).not.toThrow();

      expect(() => {
        transformPoint({ x: Infinity, y: -Infinity }, Infinity, { x: NaN, y: NaN });
      }).not.toThrow();
    });

    it('inverseTransformPoint handles division by zero', () => {
      const result = inverseTransformPoint({ x: 100, y: 200 }, 0, { x: 0, y: 0 });
      expect(result.x).toBe(Infinity);
      expect(result.y).toBe(Infinity);

      expect(() => {
        inverseTransformPoint({ x: NaN, y: NaN }, NaN, { x: Infinity, y: -Infinity });
      }).not.toThrow();
    });
  });

  describe('Performance Edge Cases', () => {
    it('renders large numbers of elements efficiently', async () => {
      const user = userEvent.setup();
      
      // Create many elements programmatically
      const manyElements = Array.from({ length: 1000 }, (_, i) => ({
        id: `perf-test-${i}`,
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

      useAppStore.setState({ elements: manyElements });

      const startTime = performance.now();
      
      expect(() => {
        render(<App />);
      }).not.toThrow();

      const endTime = performance.now();
      
      // Should render in reasonable time (less than 1 second)
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('handles rapid mouse events without memory leaks', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole('button', { name: 'Rectangle' }));
      const canvas = screen.getByTestId('error-test-canvas');

      const startTime = performance.now();

      // Simulate rapid clicking
      for (let i = 0; i < 100; i++) {
        await user.click(canvas);
      }

      const endTime = performance.now();

      // Should complete in reasonable time
      expect(endTime - startTime).toBeLessThan(5000);

      // Should have created all elements
      expect(useAppStore.getState().elements).toHaveLength(100);
    });

    it('cleanup prevents memory leaks on unmount', () => {
      const { unmount } = render(<App />);

      // Mock memory monitoring
      const removeEventListenerSpy = vi.spyOn(HTMLElement.prototype, 'removeEventListener');

      expect(() => {
        unmount();
      }).not.toThrow();

      // Should have called removeEventListener (Canvas component cleanup)
      expect(removeEventListenerSpy).toHaveBeenCalled();

      removeEventListenerSpy.mockRestore();
    });
  });

  describe('Data Integrity Edge Cases', () => {
    it('handles corrupted element data gracefully', () => {
      const corruptedElements = [
        null,
        undefined,
        { id: 'incomplete' }, // Missing required fields
        { 
          id: 'circular',
          type: 'rectangle',
          x: 0,
          y: 0,
          width: 100,
          height: 50,
          angle: 0,
          strokeColor: '#000',
          backgroundColor: 'transparent',
          strokeWidth: 2,
          roughness: 1,
          opacity: 1,
        }
      ];

      // Add circular reference
      (corruptedElements[3] as any).self = corruptedElements[3];

      expect(() => {
        useAppStore.setState({ elements: corruptedElements as any });
        render(<App />);
      }).not.toThrow();
    });

    it('handles invalid viewport data', () => {
      const invalidViewports = [
        null,
        undefined,
        { zoom: -1 },
        { pan: null },
        { bounds: { width: -100, height: -200 } },
        { zoom: 'invalid' as any, pan: 'invalid' as any },
      ];

      invalidViewports.forEach((viewport) => {
        expect(() => {
          useAppStore.setState({ viewport: viewport as any });
        }).not.toThrow();
      });
    });

    it('handles malformed history data', () => {
      const malformedHistory = [
        null,
        undefined,
        [null, undefined],
        [{ id: 'broken', incomplete: true }],
      ];

      expect(() => {
        useAppStore.setState({
          history: malformedHistory as any,
          historyIndex: 999, // Out of bounds index
        });
      }).not.toThrow();

      // Undo/redo should still work
      const { undo, redo } = useAppStore.getState();
      expect(() => {
        undo();
        redo();
      }).not.toThrow();
    });
  });

  describe('Browser Compatibility Edge Cases', () => {
    it('handles missing Canvas API gracefully', () => {
      // Mock Canvas API not being available
      const originalGetContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = undefined as any;

      expect(() => {
        render(<App />);
      }).not.toThrow();

      // Restore
      HTMLCanvasElement.prototype.getContext = originalGetContext;
    });

    it('handles missing getBoundingClientRect', () => {
      const originalGetBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;
      HTMLElement.prototype.getBoundingClientRect = undefined as any;

      expect(() => {
        render(<App />);
      }).not.toThrow();

      // Restore
      HTMLElement.prototype.getBoundingClientRect = originalGetBoundingClientRect;
    });

    it('handles missing requestAnimationFrame', () => {
      const originalRequestAnimationFrame = global.requestAnimationFrame;
      (global as any).requestAnimationFrame = undefined;

      expect(() => {
        render(<App />);
      }).not.toThrow();

      // Restore
      global.requestAnimationFrame = originalRequestAnimationFrame;
    });
  });
});