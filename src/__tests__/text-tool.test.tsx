// ABOUTME: Tests for Text Tool functionality  
// ABOUTME: Tests text creation, editing interface, and text rendering

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

describe('Text Tool', () => {
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

  it('should activate text tool with T key', async () => {
    const user = userEvent.setup();
    
    await createActWrapper(async () => {
      render(<App />);
    });

    const canvas = screen.getByTestId('mock-canvas');
    
    await createActWrapper(async () => {
      await user.click(canvas);
      await user.keyboard('t');
    });

    await waitForStateUpdate();

    const { activeTool } = useAppStore.getState();
    expect(activeTool).toBe('text');
  });

  it('should create text element and show editor on canvas click', async () => {
    const user = userEvent.setup();
    
    await createActWrapper(async () => {
      render(<App />);
    });

    const canvas = screen.getByTestId('mock-canvas');
    
    // Activate text tool
    await createActWrapper(async () => {
      await user.click(canvas);
      await user.keyboard('t');
    });

    await waitForStateUpdate();

    // Click on canvas to create text
    await createActWrapper(async () => {
      const { fireEvent } = createDOMEventHelpers();
      fireEvent(canvas, 'mousedown', { clientX: 100, clientY: 100 });
    });

    await waitForStateUpdate();

    const { elements } = useAppStore.getState();
    expect(elements).toHaveLength(1);
    expect(elements[0].type).toBe('text');
    expect(elements[0].x).toBe(100);
    expect(elements[0].y).toBe(100);

    // Text editor should be visible
    const textEditor = screen.getByPlaceholderText('Tapez votre texte...');
    expect(textEditor).toBeInTheDocument();
  });

  it('should update text element as user types', async () => {
    const user = userEvent.setup();
    
    await createActWrapper(async () => {
      render(<App />);
    });

    const canvas = screen.getByTestId('mock-canvas');
    
    // Activate text tool and create text element
    await createActWrapper(async () => {
      await user.click(canvas);
      await user.keyboard('t');
    });

    await waitForStateUpdate();

    await createActWrapper(async () => {
      const { fireEvent } = createDOMEventHelpers();
      fireEvent(canvas, 'mousedown', { clientX: 100, clientY: 100 });
    });

    await waitForStateUpdate();

    // Type text
    const textEditor = screen.getByPlaceholderText('Tapez votre texte...');
    await createActWrapper(async () => {
      await user.type(textEditor, 'Hello World');
    });

    await waitForStateUpdate();

    const { elements } = useAppStore.getState();
    expect(elements[0].text).toBe('Hello World');
  });

  it('should finish editing on Enter key', async () => {
    const user = userEvent.setup();
    
    await createActWrapper(async () => {
      render(<App />);
    });

    const canvas = screen.getByTestId('mock-canvas');
    
    // Create text element
    await createActWrapper(async () => {
      await user.click(canvas);
      await user.keyboard('t');
    });

    await waitForStateUpdate();

    await createActWrapper(async () => {
      const { fireEvent } = createDOMEventHelpers();
      fireEvent(canvas, 'mousedown', { clientX: 100, clientY: 100 });
    });

    await waitForStateUpdate();

    // Type text and press Enter
    const textEditor = screen.getByPlaceholderText('Tapez votre texte...');
    await createActWrapper(async () => {
      await user.type(textEditor, 'Test text');
      await user.keyboard('{Enter}');
    });

    await waitForStateUpdate();

    // Text editor should be hidden
    expect(screen.queryByPlaceholderText('Tapez votre texte...')).not.toBeInTheDocument();
    
    // Text element should remain
    const { elements } = useAppStore.getState();
    expect(elements).toHaveLength(1);
    expect(elements[0].text).toBe('Test text');
  });

  it('should cancel editing on Escape key', async () => {
    const user = userEvent.setup();
    
    await createActWrapper(async () => {
      render(<App />);
    });

    const canvas = screen.getByTestId('mock-canvas');
    
    // Create text element
    await createActWrapper(async () => {
      await user.click(canvas);
      await user.keyboard('t');
    });

    await waitForStateUpdate();

    await createActWrapper(async () => {
      const { fireEvent } = createDOMEventHelpers();
      fireEvent(canvas, 'mousedown', { clientX: 100, clientY: 100 });
    });

    await waitForStateUpdate();

    // Type text and press Escape
    const textEditor = screen.getByPlaceholderText('Tapez votre texte...');
    await createActWrapper(async () => {
      await user.type(textEditor, 'Test text');
      await user.keyboard('{Escape}');
    });

    await waitForStateUpdate();

    // Text editor should be hidden
    expect(screen.queryByPlaceholderText('Tapez votre texte...')).not.toBeInTheDocument();
    
    // Text element should be removed
    const { elements } = useAppStore.getState();
    expect(elements).toHaveLength(0);
  });

  it('should remove empty text element when finished', async () => {
    const user = userEvent.setup();
    
    await createActWrapper(async () => {
      render(<App />);
    });

    const canvas = screen.getByTestId('mock-canvas');
    
    // Create text element
    await createActWrapper(async () => {
      await user.click(canvas);
      await user.keyboard('t');
    });

    await waitForStateUpdate();

    await createActWrapper(async () => {
      const { fireEvent } = createDOMEventHelpers();
      fireEvent(canvas, 'mousedown', { clientX: 100, clientY: 100 });
    });

    await waitForStateUpdate();

    // Press Enter without typing anything
    const textEditor = screen.getByPlaceholderText('Tapez votre texte...');
    await createActWrapper(async () => {
      await user.keyboard('{Enter}');
    });

    await waitForStateUpdate();

    // Empty text element should be removed
    const { elements } = useAppStore.getState();
    expect(elements).toHaveLength(0);
  });

  it('should apply current tool options to text elements', async () => {
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
        backgroundColor: '#ffff00',
        fontSize: 24,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fontStyle: 'italic',
        textAlign: 'center',
        opacity: 0.8,
      });
    });

    await waitForStateUpdate();

    // Activate text tool and create element
    await createActWrapper(async () => {
      await user.click(canvas);
      await user.keyboard('t');
    });

    await waitForStateUpdate();

    await createActWrapper(async () => {
      const { fireEvent } = createDOMEventHelpers();
      fireEvent(canvas, 'mousedown', { clientX: 100, clientY: 100 });
    });

    await waitForStateUpdate();

    const { elements } = useAppStore.getState();
    expect(elements).toHaveLength(1);
    
    const textElement = elements[0];
    expect(textElement.strokeColor).toBe('#ff0000');
    expect(textElement.backgroundColor).toBe('#ffff00');
    expect(textElement.fontSize).toBe(24);
    expect(textElement.fontFamily).toBe('Arial');
    expect(textElement.fontWeight).toBe('bold');
    expect(textElement.fontStyle).toBe('italic');
    expect(textElement.textAlign).toBe('center');
    expect(textElement.opacity).toBe(0.8);
  });

  it('should support multiline text', async () => {
    const user = userEvent.setup();
    
    await createActWrapper(async () => {
      render(<App />);
    });

    const canvas = screen.getByTestId('mock-canvas');
    
    // Create text element
    await createActWrapper(async () => {
      await user.click(canvas);
      await user.keyboard('t');
    });

    await waitForStateUpdate();

    await createActWrapper(async () => {
      const { fireEvent } = createDOMEventHelpers();
      fireEvent(canvas, 'mousedown', { clientX: 100, clientY: 100 });
    });

    await waitForStateUpdate();

    // Type multiline text
    const textEditor = screen.getByPlaceholderText('Tapez votre texte...');
    await createActWrapper(async () => {
      await user.type(textEditor, 'Line 1{Shift>}{Enter}{/Shift}Line 2{Shift>}{Enter}{/Shift}Line 3');
    });

    await waitForStateUpdate();

    const { elements } = useAppStore.getState();
    expect(elements[0].text).toBe('Line 1\nLine 2\nLine 3');
  });
});