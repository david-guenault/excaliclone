// Tests for new drag-selection functionality
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { useAppStore } from '../store';

// Mock the Canvas component
vi.mock('../components/Canvas', () => ({
  Canvas: ({ onMouseDown, onMouseMove, onMouseUp, elements, selectedElementIds, dragSelectionRect }: any) => {
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
        data-testid="drag-selection-canvas"
        data-elements-count={elements?.length || 0}
        data-selected-count={selectedElementIds?.length || 0}
        data-has-drag-rect={dragSelectionRect ? 'true' : 'false'}
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
        Drag Selection Canvas - Elements: {elements?.length || 0}, Selected: {selectedElementIds?.length || 0}
        {dragSelectionRect && ' [Drag Rect Active]'}
      </div>
    );
  },
}));

describe('Drag Selection Tests', () => {
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

  describe('Single Element Selection', () => {
    it('can select an element by clicking on it', async () => {
      const user = userEvent.setup();
      render(<App />);

      // First create an element
      await user.click(screen.getByRole('button', { name: 'Rectangle tool' }));
      const canvas = screen.getByTestId('drag-selection-canvas');
      
      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 100, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 150, clientY: 150, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 150, clientY: 150, bubbles: true }));
      });

      // Switch to select tool
      await user.click(screen.getByRole('button', { name: 'Selection Tool tool' }));
      
      // Click on the element to select it (click at center: 125, 125)
      await user.click(canvas, { clientX: 125, clientY: 125 });

      const state = useAppStore.getState();
      expect(state.selectedElementIds).toHaveLength(1);
      expect(state.selectedElementIds[0]).toBe(state.elements[0].id);
      expect(canvas).toHaveAttribute('data-selected-count', '1');
    });

    it('shows properties panel when element is selected', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Create an element and select it
      await user.click(screen.getByRole('button', { name: 'Rectangle tool' }));
      const canvas = screen.getByTestId('drag-selection-canvas');
      
      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 100, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 150, clientY: 150, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 150, clientY: 150, bubbles: true }));
      });

      await user.click(screen.getByRole('button', { name: 'Selection Tool tool' }));
      await user.click(canvas, { clientX: 125, clientY: 125 });

      const state = useAppStore.getState();
      expect(state.ui.propertiesPanel.visible).toBe(true);
    });

    it('clears selection when clicking on empty area', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Create and select an element
      await user.click(screen.getByRole('button', { name: 'Rectangle tool' }));
      const canvas = screen.getByTestId('drag-selection-canvas');
      
      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 100, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 150, clientY: 150, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 150, clientY: 150, bubbles: true }));
      });

      await user.click(screen.getByRole('button', { name: 'Selection Tool tool' }));
      await user.click(canvas, { clientX: 125, clientY: 125 });

      // Verify element is selected
      expect(useAppStore.getState().selectedElementIds).toHaveLength(1);

      // Click on empty area
      await user.click(canvas, { clientX: 300, clientY: 300 });

      const state = useAppStore.getState();
      expect(state.selectedElementIds).toHaveLength(0);
      expect(state.ui.propertiesPanel.visible).toBe(false);
    });
  });

  describe('Drag Selection Rectangle', () => {
    it('creates drag selection rectangle on empty area drag', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole('button', { name: 'Selection Tool tool' }));
      const canvas = screen.getByTestId('drag-selection-canvas');

      // Start drag on empty area
      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 50, clientY: 50, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 100, clientY: 100, bubbles: true }));
      });

      // Should show drag rectangle is active
      expect(canvas).toHaveAttribute('data-has-drag-rect', 'true');
    });

    it('selects multiple elements with drag selection', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Create two rectangles
      await user.click(screen.getByRole('button', { name: 'Rectangle tool' }));
      const canvas = screen.getByTestId('drag-selection-canvas');
      
      // First rectangle at (100,100) to (150,150)
      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 100, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 150, clientY: 150, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 150, clientY: 150, bubbles: true }));
      });

      // Second rectangle at (200,200) to (250,250)
      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 200, clientY: 200, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 250, clientY: 250, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 250, clientY: 250, bubbles: true }));
      });

      // Switch to select tool
      await user.click(screen.getByRole('button', { name: 'Selection Tool tool' }));

      // Drag to select both rectangles (from 80,80 to 270,270)
      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 80, clientY: 80, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 270, clientY: 270, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 270, clientY: 270, bubbles: true }));
      });

      const state = useAppStore.getState();
      expect(state.selectedElementIds).toHaveLength(2);
      expect(canvas).toHaveAttribute('data-selected-count', '2');
    });

    it('selects only intersecting elements', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Create two rectangles
      await user.click(screen.getByRole('button', { name: 'Rectangle tool' }));
      const canvas = screen.getByTestId('drag-selection-canvas');
      
      // First rectangle at (100,100) to (150,150)
      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 100, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 150, clientY: 150, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 150, clientY: 150, bubbles: true }));
      });

      // Second rectangle at (300,300) to (350,350) - far away
      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 300, clientY: 300, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 350, clientY: 350, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 350, clientY: 350, bubbles: true }));
      });

      // Switch to select tool
      await user.click(screen.getByRole('button', { name: 'Selection Tool tool' }));

      // Drag to select only the first rectangle (from 80,80 to 170,170)
      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 80, clientY: 80, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 170, clientY: 170, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 170, clientY: 170, bubbles: true }));
      });

      const state = useAppStore.getState();
      expect(state.selectedElementIds).toHaveLength(1);
    });

    it('clears selection when drag selection finds no elements', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Create and select an element first
      await user.click(screen.getByRole('button', { name: 'Rectangle tool' }));
      const canvas = screen.getByTestId('drag-selection-canvas');
      
      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 100, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 150, clientY: 150, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 150, clientY: 150, bubbles: true }));
      });

      await user.click(screen.getByRole('button', { name: 'Selection Tool tool' }));
      await user.click(canvas, { clientX: 125, clientY: 125 }); // Select the element

      expect(useAppStore.getState().selectedElementIds).toHaveLength(1);

      // Now drag in empty area where no elements exist
      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 400, clientY: 400, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 500, clientY: 500, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 500, clientY: 500, bubbles: true }));
      });

      const state = useAppStore.getState();
      expect(state.selectedElementIds).toHaveLength(0);
    });
  });

  describe('Mixed Selection Scenarios', () => {
    it('can switch between single and multi-selection', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Create two rectangles
      await user.click(screen.getByRole('button', { name: 'Rectangle tool' }));
      const canvas = screen.getByTestId('drag-selection-canvas');
      
      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 100, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 150, clientY: 150, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 150, clientY: 150, bubbles: true }));
      });

      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 200, clientY: 200, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 250, clientY: 250, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 250, clientY: 250, bubbles: true }));
      });

      await user.click(screen.getByRole('button', { name: 'Selection Tool tool' }));

      // Start with single selection
      await user.click(canvas, { clientX: 125, clientY: 125 });
      expect(useAppStore.getState().selectedElementIds).toHaveLength(1);

      // Switch to multi-selection
      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 80, clientY: 80, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 270, clientY: 270, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 270, clientY: 270, bubbles: true }));
      });
      expect(useAppStore.getState().selectedElementIds).toHaveLength(2);

      // Back to single selection
      await user.click(canvas, { clientX: 125, clientY: 125 });
      expect(useAppStore.getState().selectedElementIds).toHaveLength(1);
    });
  });
});