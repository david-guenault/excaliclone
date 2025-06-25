// ABOUTME: Tests for App component - integration and user interactions
// ABOUTME: Comprehensive test coverage for main application component

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { useAppStore } from '../store';
import type { Element } from '../types';

// Mock the Canvas component to avoid canvas-related issues in tests
vi.mock('../components/Canvas', () => ({
  Canvas: ({ onMouseDown, onMouseMove, onMouseUp, width, height, elements, viewport }: any) => (
    <div
      data-testid="mock-canvas"
      data-width={width}
      data-height={height}
      data-elements-count={elements?.length || 0}
      data-zoom={viewport?.zoom}
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const point = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };
        onMouseDown?.(point);
      }}
    >
      Mock Canvas
    </div>
  ),
}));

describe('App Component', () => {
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

  describe('Component Rendering', () => {
    it('renders header with title "Excalibox"', () => {
      render(<App />);
      
      expect(screen.getByRole('heading', { name: 'Excalibox' })).toBeInTheDocument();
    });

    it('renders tool selector buttons (Select, Rectangle, Circle)', () => {
      render(<App />);
      
      expect(screen.getByRole('button', { name: 'Select' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Rectangle' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Circle' })).toBeInTheDocument();
    });

    it('renders Canvas component with correct props', () => {
      render(<App />);
      
      const canvas = screen.getByTestId('mock-canvas');
      expect(canvas).toBeInTheDocument();
      expect(canvas).toHaveAttribute('data-width', '800');
      expect(canvas).toHaveAttribute('data-height', '600');
      expect(canvas).toHaveAttribute('data-elements-count', '0');
      expect(canvas).toHaveAttribute('data-zoom', '1');
    });

    it('applies correct CSS classes', () => {
      render(<App />);
      
      const appContainer = screen.getByRole('heading', { name: 'Excalibox' }).closest('.excalibox-app');
      expect(appContainer).toBeInTheDocument();
      
      const header = screen.getByRole('banner');
      expect(header).toHaveClass('app-header');
      
      const main = screen.getByRole('main');
      expect(main).toHaveClass('app-main');
    });
  });

  describe('Tool Selection', () => {
    it('clicking Select button sets activeTool to "select"', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      // Initially should be 'select' tool
      const selectButton = screen.getByRole('button', { name: 'Select' });
      expect(selectButton).toHaveClass('active');
      
      // Click rectangle to change tool
      await user.click(screen.getByRole('button', { name: 'Rectangle' }));
      expect(useAppStore.getState().activeTool).toBe('rectangle');
      
      // Click select button
      await user.click(selectButton);
      expect(useAppStore.getState().activeTool).toBe('select');
    });

    it('clicking Rectangle button sets activeTool to "rectangle"', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      const rectangleButton = screen.getByRole('button', { name: 'Rectangle' });
      await user.click(rectangleButton);
      
      expect(useAppStore.getState().activeTool).toBe('rectangle');
    });

    it('clicking Circle button sets activeTool to "circle"', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      const circleButton = screen.getByRole('button', { name: 'Circle' });
      await user.click(circleButton);
      
      expect(useAppStore.getState().activeTool).toBe('circle');
    });

    it('active tool button has "active" CSS class', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      // Initially select tool should be active
      expect(screen.getByRole('button', { name: 'Select' })).toHaveClass('active');
      expect(screen.getByRole('button', { name: 'Rectangle' })).not.toHaveClass('active');
      expect(screen.getByRole('button', { name: 'Circle' })).not.toHaveClass('active');
      
      // Click rectangle
      await user.click(screen.getByRole('button', { name: 'Rectangle' }));
      
      expect(screen.getByRole('button', { name: 'Select' })).not.toHaveClass('active');
      expect(screen.getByRole('button', { name: 'Rectangle' })).toHaveClass('active');
      expect(screen.getByRole('button', { name: 'Circle' })).not.toHaveClass('active');
      
      // Click circle
      await user.click(screen.getByRole('button', { name: 'Circle' }));
      
      expect(screen.getByRole('button', { name: 'Select' })).not.toHaveClass('active');
      expect(screen.getByRole('button', { name: 'Rectangle' })).not.toHaveClass('active');
      expect(screen.getByRole('button', { name: 'Circle' })).toHaveClass('active');
    });

    it('only one button is active at a time', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      const buttons = [
        screen.getByRole('button', { name: 'Select' }),
        screen.getByRole('button', { name: 'Rectangle' }),
        screen.getByRole('button', { name: 'Circle' }),
      ];
      
      for (const button of buttons) {
        await user.click(button);
        
        // Only the clicked button should be active
        const activeButtons = buttons.filter(btn => btn.classList.contains('active'));
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
      await user.click(screen.getByRole('button', { name: 'Rectangle' }));
      
      // Click on canvas
      const canvas = screen.getByTestId('mock-canvas');
      await user.click(canvas);
      
      const state = useAppStore.getState();
      expect(state.elements).toHaveLength(1);
      expect(state.elements[0].type).toBe('rectangle');
      expect(state.elements[0].width).toBe(100);
      expect(state.elements[0].height).toBe(50);
    });

    it('handleCanvasMouseDown creates circle when circle tool active', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      // Set circle tool
      await user.click(screen.getByRole('button', { name: 'Circle' }));
      
      // Click on canvas
      const canvas = screen.getByTestId('mock-canvas');
      await user.click(canvas);
      
      const state = useAppStore.getState();
      expect(state.elements).toHaveLength(1);
      expect(state.elements[0].type).toBe('circle');
      expect(state.elements[0].width).toBe(80);
      expect(state.elements[0].height).toBe(60); // Default ellipse behavior without Shift
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
      const user = userEvent.setup();
      render(<App />);
      
      // Set rectangle tool
      await user.click(screen.getByRole('button', { name: 'Rectangle' }));
      
      // Mock click at specific position
      const canvas = screen.getByTestId('mock-canvas');
      
      // Simulate click at position (150, 200)
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        clientX: 150,
        clientY: 200,
      });
      
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
      
      canvas.dispatchEvent(clickEvent);
      
      const state = useAppStore.getState();
      const element = state.elements[0];
      
      expect(element.x).toBe(150);
      expect(element.y).toBe(200);
      expect(element.width).toBe(100);
      expect(element.height).toBe(50);
      expect(element.angle).toBe(0);
    });

    it('created elements use current toolOptions', async () => {
      const user = userEvent.setup();
      
      // Set custom tool options
      useAppStore.setState({
        toolOptions: {
          strokeColor: '#ff0000',
          backgroundColor: '#00ff00',
          strokeWidth: 5,
          roughness: 2,
          opacity: 0.7,
        },
      });
      
      render(<App />);
      
      // Set rectangle tool and create element
      await user.click(screen.getByRole('button', { name: 'Rectangle' }));
      await user.click(screen.getByTestId('mock-canvas'));
      
      const state = useAppStore.getState();
      const element = state.elements[0];
      
      expect(element.strokeColor).toBe('#ff0000');
      expect(element.backgroundColor).toBe('#00ff00');
      expect(element.strokeWidth).toBe(5);
      expect(element.roughness).toBe(2);
      expect(element.opacity).toBe(0.7);
    });

    it('mouse coordinates passed correctly to element creation', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      // Set circle tool
      await user.click(screen.getByRole('button', { name: 'Circle' }));
      
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
        const clickEvent = new MouseEvent('click', {
          bubbles: true,
          clientX: pos.clientX,
          clientY: pos.clientY,
        });
        
        canvas.dispatchEvent(clickEvent);
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
    it('uses correct store state (viewport, elements, activeTool, toolOptions)', () => {
      // Set custom store state
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
            roughness: 1,
            opacity: 1,
          },
        ],
        activeTool: 'circle' as const,
        toolOptions: {
          strokeColor: '#00ff00',
          backgroundColor: '#0000ff',
          strokeWidth: 4,
          roughness: 2,
          opacity: 0.5,
        },
      };
      
      useAppStore.setState(customState);
      
      render(<App />);
      
      // Check that canvas receives correct props
      const canvas = screen.getByTestId('mock-canvas');
      expect(canvas).toHaveAttribute('data-width', '1200');
      expect(canvas).toHaveAttribute('data-height', '900');
      expect(canvas).toHaveAttribute('data-elements-count', '1');
      expect(canvas).toHaveAttribute('data-zoom', '2.5');
      
      // Check that circle tool is active
      expect(screen.getByRole('button', { name: 'Circle' })).toHaveClass('active');
    });

    it('calls store actions correctly (addElement, setActiveTool)', async () => {
      const user = userEvent.setup();
      const addElementSpy = vi.spyOn(useAppStore.getState(), 'addElement');
      const setActiveToolSpy = vi.spyOn(useAppStore.getState(), 'setActiveTool');
      
      render(<App />);
      
      // Test setActiveTool
      await user.click(screen.getByRole('button', { name: 'Rectangle' }));
      expect(setActiveToolSpy).toHaveBeenCalledWith('rectangle');
      
      // Test addElement
      await user.click(screen.getByTestId('mock-canvas'));
      expect(addElementSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'rectangle',
          width: 100,
          height: 50,
        })
      );
    });

    it('component updates when store state changes', () => {
      const { rerender } = render(<App />);
      
      // Initially no elements
      expect(screen.getByTestId('mock-canvas')).toHaveAttribute('data-elements-count', '0');
      
      // Add element to store
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
            roughness: 1,
            opacity: 1,
          },
        ],
      });
      
      // Force re-render to check updated state
      rerender(<App />);
      
      expect(screen.getByTestId('mock-canvas')).toHaveAttribute('data-elements-count', '1');
    });

    it('handles store state changes for tool selection UI', () => {
      const { rerender } = render(<App />);
      
      // Initially select tool is active
      expect(screen.getByRole('button', { name: 'Select' })).toHaveClass('active');
      
      // Change tool via store
      useAppStore.setState({ activeTool: 'rectangle' });
      
      // Force re-render to see the change
      rerender(<App />);
      
      // UI should update to reflect store change
      expect(screen.getByRole('button', { name: 'Select' })).not.toHaveClass('active');
      expect(screen.getByRole('button', { name: 'Rectangle' })).toHaveClass('active');
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

    it('handles undefined store values gracefully', () => {
      // Set some undefined values in store but keep viewport structure
      useAppStore.setState({
        elements: [],
        viewport: {
          zoom: 1,
          pan: { x: 0, y: 0 },
          bounds: { x: 0, y: 0, width: 800, height: 600 },
        },
      });
      
      expect(() => render(<App />)).not.toThrow();
    });

    it('handles rapid tool switching without errors', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      const buttons = [
        screen.getByRole('button', { name: 'Select' }),
        screen.getByRole('button', { name: 'Rectangle' }),
        screen.getByRole('button', { name: 'Circle' }),
      ];
      
      // Rapidly click different tools
      for (let i = 0; i < 10; i++) {
        const randomButton = buttons[i % buttons.length];
        await user.click(randomButton);
      }
      
      // Should not crash
      expect(screen.getByRole('heading', { name: 'Excalibox' })).toBeInTheDocument();
    });

    it('handles multiple rapid canvas clicks without errors', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      await user.click(screen.getByRole('button', { name: 'Rectangle' }));
      
      const canvas = screen.getByTestId('mock-canvas');
      
      // Rapidly click canvas multiple times
      for (let i = 0; i < 10; i++) {
        await user.click(canvas);
      }
      
      // Should create 10 elements without crashing
      expect(useAppStore.getState().elements).toHaveLength(10);
    });
  });

  describe('Console Logging', () => {
    it('logs mouse down events to console', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const user = userEvent.setup();
      
      render(<App />);
      
      await user.click(screen.getByRole('button', { name: 'Rectangle' }));
      await user.click(screen.getByTestId('mock-canvas'));
      
      expect(consoleSpy).toHaveBeenCalledWith('Mouse down at:', expect.any(Object));
      
      consoleSpy.mockRestore();
    });
  });
});