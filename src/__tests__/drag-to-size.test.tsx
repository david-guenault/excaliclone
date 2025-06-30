// Tests for new drag-to-size functionality
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { useAppStore } from '../store';

// Mock the Canvas component
vi.mock('../components/Canvas', () => ({
  Canvas: ({ onMouseDown, onMouseMove, onMouseUp, elements }: any) => {
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
        data-testid="drag-size-canvas"
        data-elements-count={elements?.length || 0}
        style={{ width: '800px', height: '600px' }}
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
        Drag Size Canvas - Elements: {elements?.length || 0}
      </div>
    );
  },
}));

describe('Drag-to-Size Tests', () => {
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
          enabled: false,
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

  describe('Rectangle Drag-to-Size', () => {
    it('creates properly sized rectangle with drag operation', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole('button', { name: 'Rectangle tool' }));
      const canvas = screen.getByTestId('drag-size-canvas');

      // Drag from (100,100) to (200,150) - creates 100x50 rectangle
      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 100, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 200, clientY: 150, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 200, clientY: 150, bubbles: true }));
      });

      const state = useAppStore.getState();
      expect(state.elements).toHaveLength(1);
      
      const rectangle = state.elements[0];
      expect(rectangle.type).toBe('rectangle');
      expect(rectangle.x).toBe(100);
      expect(rectangle.y).toBe(100);
      expect(rectangle.width).toBe(100);
      expect(rectangle.height).toBe(50);
    });

    it('handles negative drag directions correctly', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole('button', { name: 'Rectangle tool' }));
      const canvas = screen.getByTestId('drag-size-canvas');

      // Drag from (200,150) to (100,100) - negative direction
      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 200, clientY: 150, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 100, clientY: 100, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 100, clientY: 100, bubbles: true }));
      });

      const state = useAppStore.getState();
      expect(state.elements).toHaveLength(1);
      
      const rectangle = state.elements[0];
      expect(rectangle.type).toBe('rectangle');
      expect(rectangle.x).toBe(100); // Corrected to top-left corner
      expect(rectangle.y).toBe(100);
      expect(rectangle.width).toBe(100); // Always positive
      expect(rectangle.height).toBe(50); // Always positive
    });

    it('deletes rectangle if too small (below minimum size)', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole('button', { name: 'Rectangle tool' }));
      const canvas = screen.getByTestId('drag-size-canvas');

      // Create very small rectangle (5x5 - below 10px minimum)
      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 100, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 105, clientY: 105, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 105, clientY: 105, bubbles: true }));
      });

      const state = useAppStore.getState();
      expect(state.elements).toHaveLength(0); // Element should be deleted
    });

    it('keeps rectangle if meets minimum size requirements', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole('button', { name: 'Rectangle tool' }));
      const canvas = screen.getByTestId('drag-size-canvas');

      // Create rectangle at minimum size (15x15 - above 10px minimum)
      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 100, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 115, clientY: 115, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 115, clientY: 115, bubbles: true }));
      });

      const state = useAppStore.getState();
      expect(state.elements).toHaveLength(1);
      
      const rectangle = state.elements[0];
      expect(rectangle.width).toBe(15);
      expect(rectangle.height).toBe(15);
    });

    it('updates element in real-time during drag', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole('button', { name: 'Rectangle tool' }));
      const canvas = screen.getByTestId('drag-size-canvas');

      // Start drag
      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 100, bubbles: true }));
      });

      // Initial element should be created with minimal size
      let state = useAppStore.getState();
      expect(state.elements).toHaveLength(1);
      expect(state.elements[0].width).toBe(1);
      expect(state.elements[0].height).toBe(1);

      // Move mouse - should update element size
      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 150, clientY: 130, bubbles: true }));
      });

      state = useAppStore.getState();
      expect(state.elements).toHaveLength(1);
      expect(state.elements[0].width).toBe(50);
      expect(state.elements[0].height).toBe(30);

      // Finish drag
      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 150, clientY: 130, bubbles: true }));
      });

      state = useAppStore.getState();
      expect(state.elements).toHaveLength(1);
      expect(state.elements[0].width).toBe(50);
      expect(state.elements[0].height).toBe(30);
    });
  });

  describe('Circle Drag-to-Size', () => {
    it('creates properly sized circle with drag operation', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole('button', { name: 'Circle tool' }));
      const canvas = screen.getByTestId('drag-size-canvas');

      // Drag from (100,100) to (180,160) - creates 80x60 ellipse
      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 100, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 180, clientY: 160, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 180, clientY: 160, bubbles: true }));
      });

      const state = useAppStore.getState();
      expect(state.elements).toHaveLength(1);
      
      const circle = state.elements[0];
      expect(circle.type).toBe('circle');
      expect(circle.x).toBe(100);
      expect(circle.y).toBe(100);
      expect(circle.width).toBe(80);
      expect(circle.height).toBe(60);
    });

    it('handles negative drag directions for circles', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole('button', { name: 'Circle tool' }));
      const canvas = screen.getByTestId('drag-size-canvas');

      // Drag from (180,160) to (100,100) - negative direction
      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 180, clientY: 160, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 100, clientY: 100, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 100, clientY: 100, bubbles: true }));
      });

      const state = useAppStore.getState();
      expect(state.elements).toHaveLength(1);
      
      const circle = state.elements[0];
      expect(circle.type).toBe('circle');
      expect(circle.x).toBe(100); // Corrected position
      expect(circle.y).toBe(100);
      expect(circle.width).toBe(80); // Always positive
      expect(circle.height).toBe(60); // Always positive
    });

    it('deletes circle if too small', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole('button', { name: 'Circle tool' }));
      const canvas = screen.getByTestId('drag-size-canvas');

      // Create very small circle (3x8 - below 10px minimum)
      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 100, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 103, clientY: 108, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 103, clientY: 108, bubbles: true }));
      });

      const state = useAppStore.getState();
      expect(state.elements).toHaveLength(0); // Element should be deleted
    });
  });

  describe('Tool State Management', () => {
    it('maintains tool selection after creating element', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole('button', { name: 'Rectangle tool' }));
      
      // Verify tool is active
      expect(useAppStore.getState().activeTool).toBe('rectangle');

      const canvas = screen.getByTestId('drag-size-canvas');

      // Create rectangle
      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 100, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 150, clientY: 150, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 150, clientY: 150, bubbles: true }));
      });

      // Tool should remain active for continued use
      expect(useAppStore.getState().activeTool).toBe('rectangle');
    });

    it('can create multiple elements in sequence', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole('button', { name: 'Rectangle tool' }));
      const canvas = screen.getByTestId('drag-size-canvas');

      // Create first rectangle
      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 100, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 150, clientY: 150, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 150, clientY: 150, bubbles: true }));
      });

      // Create second rectangle
      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 200, clientY: 200, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 280, clientY: 260, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 280, clientY: 260, bubbles: true }));
      });

      const state = useAppStore.getState();
      expect(state.elements).toHaveLength(2);
      expect(state.elements[0].type).toBe('rectangle');
      expect(state.elements[1].type).toBe('rectangle');
    });
  });

  describe('History Management', () => {
    it('adds to history when element is successfully created', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole('button', { name: 'Rectangle tool' }));
      const canvas = screen.getByTestId('drag-size-canvas');

      const initialState = useAppStore.getState();
      expect(initialState.history).toHaveLength(1);
      expect(initialState.historyIndex).toBe(0);

      // Create rectangle successfully
      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 100, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 150, clientY: 150, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 150, clientY: 150, bubbles: true }));
      });

      const finalState = useAppStore.getState();
      expect(finalState.history).toHaveLength(2);
      expect(finalState.historyIndex).toBe(1);
      expect(finalState.history[1]).toHaveLength(1); // One element in latest history
    });

    it('does not pollute history when element is deleted for being too small', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole('button', { name: 'Rectangle tool' }));
      const canvas = screen.getByTestId('drag-size-canvas');

      const initialHistoryLength = useAppStore.getState().history.length;

      // Create rectangle that will be deleted (too small)
      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 100, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 103, clientY: 103, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 103, clientY: 103, bubbles: true }));
      });

      const finalState = useAppStore.getState();
      expect(finalState.elements).toHaveLength(0); // Element deleted
      // History should include both creation and deletion
      expect(finalState.history.length).toBeGreaterThan(initialHistoryLength);
    });
  });
});