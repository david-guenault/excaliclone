// ABOUTME: Tests for App component - integration and user interactions
// ABOUTME: Comprehensive test coverage for main application component

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { useAppStore } from '../store';
import { createActWrapper, waitForStateUpdate, createDOMEventHelpers } from '../test/test-helpers';
// import type { Element } from '../types'; // Unused import removed

// Mock the Canvas component to avoid canvas-related issues in tests
vi.mock('../components/Canvas', () => ({
  Canvas: ({ onMouseDown, onMouseMove, onMouseUp, width, height, elements, viewport }: any) => {
    const mockGetBoundingClientRect = () => ({
      left: 0,
      top: 0,
      width: 800,
      height: 600,
      right: 800,
      bottom: 600,
      x: 0,
      y: 0,
    });

    return (
      <div
        data-testid="mock-canvas"
        data-width={width}
        data-height={height}
        data-elements-count={elements?.length || 0}
        data-zoom={viewport?.zoom}
        onClick={(e) => {
          e.currentTarget.getBoundingClientRect = mockGetBoundingClientRect;
          const rect = e.currentTarget.getBoundingClientRect();
          const point = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          };
          onMouseDown?.(point, e);
        }}
        onMouseDown={(e) => {
          e.currentTarget.getBoundingClientRect = mockGetBoundingClientRect;
          const rect = e.currentTarget.getBoundingClientRect();
          const point = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          };
          onMouseDown?.(point, e);
        }}
        onMouseMove={(e) => {
          e.currentTarget.getBoundingClientRect = mockGetBoundingClientRect;
          const rect = e.currentTarget.getBoundingClientRect();
          const point = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          };
          onMouseMove?.(point, e);
        }}
        onMouseUp={(e) => {
          e.currentTarget.getBoundingClientRect = mockGetBoundingClientRect;
          const rect = e.currentTarget.getBoundingClientRect();
          const point = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          };
          onMouseUp?.(point, e);
        }}
      >
        Mock Canvas
      </div>
    );
  },
}));

describe('App Component', () => {
  beforeEach(async () => {
    // Reset store state before each test
    await act(async () => {
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
        strokeStyle: 'solid',
        fillStyle: 'transparent',
        roughness: 1,
        opacity: 1,
        cornerStyle: 'sharp',
        fontFamily: 'Inter',
        fontSize: 16,
        fontWeight: 'normal',
        fontStyle: 'normal',
        textAlign: 'left',
      },
      theme: 'light',
      ui: {
        propertiesPanel: {
          visible: false,
          width: 200,
        },
        topToolbar: {
          visible: true,
        },
        canvasLocked: false,
        grid: {
          enabled: true,
          size: 20,
          snapToGrid: false,
          snapDistance: 10,
          showGrid: false,
          color: '#e1e5e9',
          opacity: 0.3,
        },
      },
      history: [[]],
      historyIndex: 0,
      });
    });
  });

  describe('Component Rendering', () => {
    it('renders TopToolbar component', () => {
      render(<App />);
      
      expect(screen.getByRole('button', { name: 'Selection Tool tool' })).toBeInTheDocument();
    });

    it('renders tool selector buttons (Selection Tool, Rectangle, Circle)', () => {
      render(<App />);
      
      expect(screen.getByRole('button', { name: 'Selection Tool tool' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Rectangle tool' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Circle tool' })).toBeInTheDocument();
    });

    it('renders Canvas component with correct props', () => {
      render(<App />);
      
      const canvas = screen.getByTestId('mock-canvas');
      expect(canvas).toBeInTheDocument();
      expect(canvas).toHaveAttribute('data-elements-count', '0');
      expect(canvas).toHaveAttribute('data-zoom', '1');
      // Canvas dimensions depend on window size, so we just check they exist
      expect(canvas.getAttribute('data-width')).not.toBeNull();
      expect(canvas.getAttribute('data-height')).not.toBeNull();
    });

    it('applies correct CSS classes', () => {
      render(<App />);
      
      const appContainer = document.querySelector('.excalibox-app');
      expect(appContainer).toBeInTheDocument();
      
      const main = screen.getByRole('main');
      expect(main).toHaveClass('app-main');
    });
  });

  describe('Tool Selection', () => {
    it('clicking Selection Tool button sets activeTool to "select"', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      // Initially should be 'select' tool
      const selectButton = screen.getByRole('button', { name: 'Selection Tool tool' });
      expect(selectButton).toHaveClass('top-toolbar__tool--active');
      
      // Click rectangle to change tool
      await user.click(screen.getByRole('button', { name: 'Rectangle tool' }));
      expect(useAppStore.getState().activeTool).toBe('rectangle');
      
      // Click select button
      await user.click(selectButton);
      expect(useAppStore.getState().activeTool).toBe('select');
    });

    it('clicking Rectangle button sets activeTool to "rectangle"', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      const rectangleButton = screen.getByRole('button', { name: 'Rectangle tool' });
      await user.click(rectangleButton);
      
      expect(useAppStore.getState().activeTool).toBe('rectangle');
    });

    it('clicking Circle button sets activeTool to "circle"', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      const circleButton = screen.getByRole('button', { name: 'Circle tool' });
      await user.click(circleButton);
      
      expect(useAppStore.getState().activeTool).toBe('circle');
    });

    it('active tool button has "active" CSS class', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      // Initially select tool should be active
      expect(screen.getByRole('button', { name: 'Selection Tool tool' })).toHaveClass('top-toolbar__tool--active');
      expect(screen.getByRole('button', { name: 'Rectangle tool' })).not.toHaveClass('top-toolbar__tool--active');
      expect(screen.getByRole('button', { name: 'Circle tool' })).not.toHaveClass('top-toolbar__tool--active');
      
      // Click rectangle
      await user.click(screen.getByRole('button', { name: 'Rectangle tool' }));
      
      expect(screen.getByRole('button', { name: 'Selection Tool tool' })).not.toHaveClass('top-toolbar__tool--active');
      expect(screen.getByRole('button', { name: 'Rectangle tool' })).toHaveClass('top-toolbar__tool--active');
      expect(screen.getByRole('button', { name: 'Circle tool' })).not.toHaveClass('top-toolbar__tool--active');
      
      // Click circle
      await user.click(screen.getByRole('button', { name: 'Circle tool' }));
      
      expect(screen.getByRole('button', { name: 'Selection Tool tool' })).not.toHaveClass('top-toolbar__tool--active');
      expect(screen.getByRole('button', { name: 'Rectangle tool' })).not.toHaveClass('top-toolbar__tool--active');
      expect(screen.getByRole('button', { name: 'Circle tool' })).toHaveClass('top-toolbar__tool--active');
    });

    it('only one button is active at a time', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      const buttons = [
        screen.getByRole('button', { name: 'Selection Tool tool' }),
        screen.getByRole('button', { name: 'Rectangle tool' }),
        screen.getByRole('button', { name: 'Circle tool' }),
      ];
      
      for (const button of buttons) {
        await user.click(button);
        
        // Only the clicked button should be active
        const activeButtons = buttons.filter(btn => btn.classList.contains('top-toolbar__tool--active'));
        expect(activeButtons).toHaveLength(1);
        expect(activeButtons[0]).toBe(button);
      }
    });
  });

  describe('Canvas Mouse Interactions', () => {
    it('handleCanvasMouseDown creates rectangle when rectangle tool active', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      // Set rectangle tool
      await user.click(screen.getByRole('button', { name: 'Rectangle tool' }));
      
      // Perform drag operation to create rectangle
      const canvas = screen.getByTestId('mock-canvas');
      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 50, clientY: 50, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 150, clientY: 100, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 150, clientY: 100, bubbles: true }));
      });
      
      const state = useAppStore.getState();
      expect(state.elements).toHaveLength(1);
      expect(state.elements[0].type).toBe('rectangle');
      expect(state.elements[0].width).toBe(100); // 150 - 50
      expect(state.elements[0].height).toBe(50); // 100 - 50
    });

    it('handleCanvasMouseDown creates circle when circle tool active', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      // Set circle tool
      await user.click(screen.getByRole('button', { name: 'Circle tool' }));
      
      // Perform drag operation to create circle
      const canvas = screen.getByTestId('mock-canvas');
      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 60, clientY: 70, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 140, clientY: 130, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 140, clientY: 130, bubbles: true }));
      });
      
      const state = useAppStore.getState();
      expect(state.elements).toHaveLength(1);
      expect(state.elements[0].type).toBe('circle');
      expect(state.elements[0].width).toBe(80); // 140 - 60
      expect(state.elements[0].height).toBe(60); // 130 - 70
    });

    it('handleCanvasMouseDown does nothing when select tool active', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      // Ensure select tool is active (default)
      expect(useAppStore.getState().activeTool).toBe('select');
      
      // Click on canvas
      const canvas = screen.getByTestId('mock-canvas');
      await user.click(canvas);
      
      const state = useAppStore.getState();
      expect(state.elements).toHaveLength(0);
    });

    it('created elements have correct properties (position, size, colors)', async () => {
      const user = createActWrapper();
      const domEvents = createDOMEventHelpers();
      render(<App />);
      
      // Set rectangle tool
      await user.click(screen.getByRole('button', { name: 'Rectangle tool' }));
      
      // Mock canvas for drag operation
      const canvas = screen.getByTestId('mock-canvas');
      
      // Mock getBoundingClientRect for canvas
      vi.spyOn(HTMLDivElement.prototype, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        right: 800,
        bottom: 600,
        width: 800,
        height: 600,
        x: 0,
        y: 0,
        toJSON: vi.fn(),
      });
      
      // Perform drag operation from (150, 200) to (250, 250)
      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 150, clientY: 200, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 250, clientY: 250, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 250, clientY: 250, bubbles: true }));
      });
      
      await waitForStateUpdate();
      
      const state = useAppStore.getState();
      const element = state.elements[0];
      
      expect(element.x).toBe(150);
      expect(element.y).toBe(200);
      expect(element.width).toBe(100); // 250 - 150
      expect(element.height).toBe(50); // 250 - 200
      expect(element.angle).toBe(0);
    });

    it('created elements use current toolOptions', async () => {
      const user = createActWrapper();
      
      // Set custom tool options with proper act() wrapping
      await act(async () => {
        useAppStore.setState({
          toolOptions: {
            strokeColor: '#ff0000',
            backgroundColor: '#00ff00',
            strokeWidth: 5,
            strokeStyle: 'solid',
            fillStyle: 'solid',
            roughness: 2,
            opacity: 0.7,
            cornerStyle: 'sharp',
            fontFamily: 'Inter',
            fontSize: 16,
            fontWeight: 'normal',
            fontStyle: 'normal',
            textAlign: 'left',
          },
        });
      });
      
      render(<App />);
      
      // Set rectangle tool and create element
      await user.click(screen.getByRole('button', { name: 'Rectangle tool' }));
      await user.click(screen.getByTestId('mock-canvas'));
      
      await waitForStateUpdate();
      
      const state = useAppStore.getState();
      const element = state.elements[0];
      
      expect(element.strokeColor).toBe('#ff0000');
      expect(element.backgroundColor).toBe('#00ff00');
      expect(element.strokeWidth).toBe(5);
      expect(element.roughness).toBe(2);
      expect(element.opacity).toBe(0.7);
    });

    it('mouse coordinates passed correctly to element creation', async () => {
      const user = createActWrapper();
      const domEvents = createDOMEventHelpers();
      render(<App />);
      
      // Set circle tool
      await user.click(screen.getByRole('button', { name: 'Circle tool' }));
      
      const canvas = screen.getByTestId('mock-canvas');
      
      // Mock different click positions
      const positions = [
        { clientX: 50, clientY: 75 },
        { clientX: 300, clientY: 400 },
        { clientX: 0, clientY: 0 },
      ];
      
      vi.spyOn(HTMLDivElement.prototype, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        right: 800,
        bottom: 600,
        width: 800,
        height: 600,
        x: 0,
        y: 0,
        toJSON: vi.fn(),
      });
      
      for (const pos of positions) {
        await domEvents.fireMouseEvent(canvas, 'click', {
          clientX: pos.clientX,
          clientY: pos.clientY,
        });
        
        await waitForStateUpdate();
      }
      
      const state = useAppStore.getState();
      expect(state.elements).toHaveLength(3);
      
      expect(state.elements[0].x).toBe(50);
      expect(state.elements[0].y).toBe(75);
      expect(state.elements[1].x).toBe(300);
      expect(state.elements[1].y).toBe(400);
      expect(state.elements[2].x).toBe(0);
      expect(state.elements[2].y).toBe(0);
    });
  });

  describe('Store Integration', () => {
    it('uses correct store state (viewport, elements, activeTool, toolOptions)', async () => {
      // Set custom store state with proper act() wrapping
      await act(async () => {
        const customState = {
          viewport: {
            zoom: 2.5,
            pan: { x: 100, y: 200 },
            bounds: { x: 0, y: 0, width: 1200, height: 900 },
          },
          elements: [
            {
              id: 'test-element',
              type: 'rectangle' as const,
              x: 10,
              y: 20,
              width: 100,
              height: 50,
              angle: 0,
              strokeColor: '#ff0000',
              backgroundColor: 'transparent',
              strokeWidth: 3,
              strokeStyle: 'solid',
              fillStyle: 'transparent',
              roughness: 1,
              opacity: 1,
              cornerStyle: 'sharp',
              fontFamily: 'Inter',
              fontSize: 16,
              fontWeight: 'normal',
              fontStyle: 'normal',
              textAlign: 'left',
            },
          ],
          activeTool: 'circle' as const,
          toolOptions: {
            strokeColor: '#00ff00',
            backgroundColor: '#0000ff',
            strokeWidth: 4,
            strokeStyle: 'solid',
            fillStyle: 'solid',
            roughness: 2,
            opacity: 0.5,
            cornerStyle: 'sharp',
            fontFamily: 'Inter',
            fontSize: 16,
            fontWeight: 'normal',
            fontStyle: 'normal',
            textAlign: 'left',
          },
        };
        
        useAppStore.setState(customState);
      });
      
      render(<App />);
      
      await waitForStateUpdate();
      
      // Check that canvas receives correct props
      const canvas = screen.getByTestId('mock-canvas');
      expect(canvas).toHaveAttribute('data-elements-count', '1');
      expect(canvas).toHaveAttribute('data-zoom', '2.5');
      // Canvas dimensions depend on window size, so we just check they exist
      expect(canvas.getAttribute('data-width')).not.toBeNull();
      expect(canvas.getAttribute('data-height')).not.toBeNull();
      
      // Check that circle tool is active
      expect(screen.getByRole('button', { name: 'Circle tool' })).toHaveClass('top-toolbar__tool--active');
    });

    it('calls store actions correctly (addElement, setActiveTool)', async () => {
      const user = userEvent.setup();
      const addElementSpy = vi.spyOn(useAppStore.getState(), 'addElement');
      const setActiveToolSpy = vi.spyOn(useAppStore.getState(), 'setActiveTool');
      
      render(<App />);
      
      // Test setActiveTool
      await user.click(screen.getByRole('button', { name: 'Rectangle tool' }));
      expect(setActiveToolSpy).toHaveBeenCalledWith('rectangle');
      
      // Test addElement with drag operation
      const canvas = screen.getByTestId('mock-canvas');
      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 50, clientY: 50, bubbles: true }));
      });
      
      expect(addElementSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'rectangle',
          width: 1, // Elements start with minimal size
          height: 1,
        })
      );
    });

    it('component updates when store state changes', async () => {
      const { rerender } = render(<App />);
      
      // Initially no elements
      expect(screen.getByTestId('mock-canvas')).toHaveAttribute('data-elements-count', '0');
      
      // Add element to store with proper act() wrapping
      await act(async () => {
        useAppStore.setState({
          elements: [
            {
              id: 'new-element',
              type: 'rectangle',
              x: 0,
              y: 0,
              width: 100,
              height: 50,
              angle: 0,
              strokeColor: '#000',
              backgroundColor: 'transparent',
              strokeWidth: 2,
              strokeStyle: 'solid',
              fillStyle: 'transparent',
              roughness: 1,
              opacity: 1,
              cornerStyle: 'sharp',
              fontFamily: 'Inter',
              fontSize: 16,
              fontWeight: 'normal',
              fontStyle: 'normal',
              textAlign: 'left',
            },
          ],
        });
      });
      
      await waitForStateUpdate();
      
      expect(screen.getByTestId('mock-canvas')).toHaveAttribute('data-elements-count', '1');
    });

    it('handles store state changes for tool selection UI', async () => {
      const { rerender } = render(<App />);
      
      // Initially select tool is active
      expect(screen.getByRole('button', { name: 'Selection Tool tool' })).toHaveClass('top-toolbar__tool--active');
      
      // Change tool via store with proper act() wrapping
      await act(async () => {
        useAppStore.setState({ activeTool: 'rectangle' });
      });
      
      await waitForStateUpdate();
      
      // UI should update to reflect store change
      expect(screen.getByRole('button', { name: 'Selection Tool tool' })).not.toHaveClass('top-toolbar__tool--active');
      expect(screen.getByRole('button', { name: 'Rectangle tool' })).toHaveClass('top-toolbar__tool--active');
    });
  });

  describe('Error Handling', () => {
    it('handles missing canvas gracefully', () => {
      // Mock Canvas component to return null
      vi.doMock('../components/Canvas', () => ({
        Canvas: () => null,
      }));
      
      expect(() => render(<App />)).not.toThrow();
    });

    it('handles undefined store values gracefully', async () => {
      // Set some undefined values in store but keep viewport structure with proper act() wrapping
      await act(async () => {
        useAppStore.setState({
          elements: [],
          viewport: {
            zoom: 1,
            pan: { x: 0, y: 0 },
            bounds: { x: 0, y: 0, width: 800, height: 600 },
          },
        });
      });
      
      expect(() => render(<App />)).not.toThrow();
    });

    it('handles rapid tool switching without errors', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      const buttons = [
        screen.getByRole('button', { name: 'Selection Tool tool' }),
        screen.getByRole('button', { name: 'Rectangle tool' }),
        screen.getByRole('button', { name: 'Circle tool' }),
      ];
      
      // Rapidly click different tools
      for (let i = 0; i < 10; i++) {
        const randomButton = buttons[i % buttons.length];
        await user.click(randomButton);
      }
      
      // Should not crash
      expect(screen.getByRole('button', { name: 'Selection Tool tool' })).toBeInTheDocument();
    });

    it('handles multiple rapid canvas clicks without errors', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      await user.click(screen.getByRole('button', { name: 'Rectangle tool' }));
      
      const canvas = screen.getByTestId('mock-canvas');
      
      // Rapidly click canvas multiple times
      for (let i = 0; i < 10; i++) {
        await user.click(canvas);
      }
      
      // Should create 10 elements without crashing
      expect(useAppStore.getState().elements).toHaveLength(10);
    });
  });

  // Note: Console logging test removed as there are no console logs in the current implementation
});