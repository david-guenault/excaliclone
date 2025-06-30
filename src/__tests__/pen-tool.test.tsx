// ABOUTME: Tests for Pen Tool functionality  
// ABOUTME: Tests pen drawing interactions, point collection, and freehand drawing

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { useAppStore } from '../store';
import { createActWrapper, createDOMEventHelpers, waitForStateUpdate } from '../test/test-helpers';

// Mock the Canvas component to avoid canvas-related issues in tests
vi.mock('../components/Canvas', () => {
  const React = require('react');
  
  // Create Canvas component with proper ref forwarding
  const Canvas = React.forwardRef((
    { onMouseDown, onMouseMove, onMouseUp, width, height, elements, viewport }: any,
    forwardedRef: any
  ) => {
    const internalRef = React.useRef(null);
    
    React.useEffect(() => {
      const element = internalRef.current;
      if (!element) return;
      
      const handleMouseDown = (e: MouseEvent) => {
        const rect = element.getBoundingClientRect();
        const point = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };
        onMouseDown?.(point, e);
      };
      
      const handleMouseMove = (e: MouseEvent) => {
        const rect = element.getBoundingClientRect();
        const point = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };
        onMouseMove?.(point, e);
      };
      
      const handleMouseUp = (e: MouseEvent) => {
        const rect = element.getBoundingClientRect();
        const point = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };
        onMouseUp?.(point, e);
      };
      
      // Add event listeners
      element.addEventListener('mousedown', handleMouseDown);
      element.addEventListener('mousemove', handleMouseMove);
      element.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        element.removeEventListener('mousedown', handleMouseDown);
        element.removeEventListener('mousemove', handleMouseMove);
        element.removeEventListener('mouseup', handleMouseUp);
      };
    }, [onMouseDown, onMouseMove, onMouseUp]);
    
    const setRefs = React.useCallback((node: any) => {
      internalRef.current = node;
      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    }, [forwardedRef]);
    
    return React.createElement('canvas', {
      ref: setRefs,
      'data-testid': 'mock-canvas',
      'data-width': width,
      'data-height': height,
      'data-elements-count': elements?.length || 0,
      'data-zoom': viewport?.zoom,
      width: width || 800,
      height: height || 600,
    });
  });
  
  Canvas.displayName = 'MockCanvas';
  
  return { Canvas };
});

describe('Pen Tool', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAppStore.setState({
      viewport: {
        zoom: 1,
        pan: { x: 0, y: 0 },
        bounds: { x: 0, y: 0, width: 800, height: 600 },
      },
      elements: [],
      selectedElementIds: [],
      activeTool: 'select',
      ui: {
        propertiesPanelVisible: false,
        grid: null,
      },
      history: [[]],
      historyIndex: 0,
    });
  });

  it('should activate pen tool with P key', async () => {
    const user = userEvent.setup();
    
    await createActWrapper(async () => {
      render(<App />);
    });

    const canvas = screen.getByTestId('mock-canvas');
    
    await createActWrapper(async () => {
      await user.click(canvas); // Focus canvas
      await user.keyboard('p'); // Activate pen tool
    });

    await waitForStateUpdate();

    const { activeTool } = useAppStore.getState();
    expect(activeTool).toBe('pen');
  });

  it('should create pen element on mouse down', async () => {
    const user = userEvent.setup();
    
    await createActWrapper(async () => {
      render(<App />);
    });

    const canvas = screen.getByTestId('mock-canvas');
    
    // Activate pen tool
    await createActWrapper(async () => {
      await user.click(canvas);
      await user.keyboard('p');
    });

    await waitForStateUpdate();

    // Start drawing pen stroke
    await createActWrapper(async () => {
      const { fireEvent } = createDOMEventHelpers();
      fireEvent(canvas, 'mousedown', { clientX: 100, clientY: 100 });
    });

    await waitForStateUpdate();

    const { elements } = useAppStore.getState();
    expect(elements).toHaveLength(1);
    expect(elements[0].type).toBe('pen');
    expect(elements[0].points).toEqual([{ x: 100, y: 100 }]);
  });

  it('should collect points during mouse move', async () => {
    const user = userEvent.setup();
    
    await createActWrapper(async () => {
      render(<App />);
    });

    const canvas = screen.getByTestId('mock-canvas');
    
    // Activate pen tool
    await createActWrapper(async () => {
      await user.click(canvas);
      await user.keyboard('p');
    });

    await waitForStateUpdate();

    // Start drawing pen stroke
    await createActWrapper(async () => {
      const { fireEvent } = createDOMEventHelpers();
      fireEvent(canvas, 'mousedown', { clientX: 100, clientY: 100 });
      fireEvent(canvas, 'mousemove', { clientX: 110, clientY: 105 });
      fireEvent(canvas, 'mousemove', { clientX: 120, clientY: 110 });
    });

    await waitForStateUpdate();

    const { elements } = useAppStore.getState();
    expect(elements).toHaveLength(1);
    expect(elements[0].type).toBe('pen');
    expect(elements[0].points).toHaveLength(3);
    expect(elements[0].points).toEqual([
      { x: 100, y: 100 },
      { x: 110, y: 105 },
      { x: 120, y: 110 }
    ]);
  });

  it('should finish pen stroke on mouse up', async () => {
    const user = userEvent.setup();
    
    await createActWrapper(async () => {
      render(<App />);
    });

    const canvas = screen.getByTestId('mock-canvas');
    
    // Activate pen tool
    await createActWrapper(async () => {
      await user.click(canvas);
      await user.keyboard('p');
    });

    await waitForStateUpdate();

    // Draw complete pen stroke
    await createActWrapper(async () => {
      const { fireEvent } = createDOMEventHelpers();
      fireEvent(canvas, 'mousedown', { clientX: 100, clientY: 100 });
      fireEvent(canvas, 'mousemove', { clientX: 110, clientY: 105 });
      fireEvent(canvas, 'mouseup', { clientX: 120, clientY: 110 });
    });

    await waitForStateUpdate();

    const { elements } = useAppStore.getState();
    expect(elements).toHaveLength(1);
    expect(elements[0].type).toBe('pen');
    expect(elements[0].points).toHaveLength(2); // Initial point + one move point (mouseup doesn't add point)
  });

  it('should update element dimensions based on points', async () => {
    const user = userEvent.setup();
    
    await createActWrapper(async () => {
      render(<App />);
    });

    const canvas = screen.getByTestId('mock-canvas');
    
    // Activate pen tool
    await createActWrapper(async () => {
      await user.click(canvas);
      await user.keyboard('p');
    });

    await waitForStateUpdate();

    // Draw pen stroke with significant width/height
    await createActWrapper(async () => {
      const { fireEvent } = createDOMEventHelpers();
      fireEvent(canvas, 'mousedown', { clientX: 100, clientY: 100 });
      fireEvent(canvas, 'mousemove', { clientX: 200, clientY: 150 });
    });

    await waitForStateUpdate();

    const { elements } = useAppStore.getState();
    expect(elements).toHaveLength(1);
    
    const penElement = elements[0];
    expect(penElement.width).toBe(100); // 200 - 100
    expect(penElement.height).toBe(50); // 150 - 100
  });

  it('should support grid snapping for pen strokes', async () => {
    const user = userEvent.setup();
    
    await createActWrapper(async () => {
      render(<App />);
    });

    const canvas = screen.getByTestId('mock-canvas');
    
    // Enable grid
    await createActWrapper(async () => {
      await user.click(canvas);
      await user.keyboard('g'); // Toggle grid
    });

    await waitForStateUpdate();

    // Activate pen tool
    await createActWrapper(async () => {
      await user.keyboard('p');
    });

    await waitForStateUpdate();

    // Draw pen stroke (should snap to grid)
    await createActWrapper(async () => {
      const { fireEvent } = createDOMEventHelpers();
      fireEvent(canvas, 'mousedown', { clientX: 103, clientY: 107 }); // Should snap to grid
    });

    await waitForStateUpdate();

    const { elements } = useAppStore.getState();
    expect(elements).toHaveLength(1);
    
    const penElement = elements[0];
    // Should snap to nearest grid point (assuming 20px grid)
    expect(penElement.points?.[0].x).toBe(100); // Snapped from 103 to 100
    expect(penElement.points?.[0].y).toBe(100); // Snapped from 107 to 100
  });

  it('should apply current tool options to pen elements', async () => {
    const user = userEvent.setup();
    
    await createActWrapper(async () => {
      render(<App />);
    });

    const canvas = screen.getByTestId('mock-canvas');
    
    // Set custom tool options
    await createActWrapper(async () => {
      const { setToolOptions } = useAppStore.getState();
      setToolOptions({
        strokeColor: '#ff0000',
        strokeWidth: 5,
        roughness: 2,
        opacity: 0.8,
      });
    });

    await waitForStateUpdate();

    // Activate pen tool
    await createActWrapper(async () => {
      await user.click(canvas);
      await user.keyboard('p');
    });

    await waitForStateUpdate();

    // Create pen element
    await createActWrapper(async () => {
      const { fireEvent } = createDOMEventHelpers();
      fireEvent(canvas, 'mousedown', { clientX: 100, clientY: 100 });
    });

    await waitForStateUpdate();

    const { elements } = useAppStore.getState();
    expect(elements).toHaveLength(1);
    
    const penElement = elements[0];
    expect(penElement.strokeColor).toBe('#ff0000');
    expect(penElement.strokeWidth).toBe(5);
    expect(penElement.roughness).toBe(2);
    expect(penElement.opacity).toBe(0.8);
    expect(penElement.fillStyle).toBe('transparent'); // Pen strokes don't have fill
  });
});