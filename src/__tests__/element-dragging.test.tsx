// Tests for element dragging functionality
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { useAppStore } from '../store';

// Mock the Canvas component to track element dragging
vi.mock('../components/Canvas', () => ({
  Canvas: ({ onMouseDown, onMouseMove, onMouseUp, elements, selectedElementIds }: any) => {
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
        data-testid="dragging-canvas"
        data-elements-count={elements?.length || 0}
        data-selected-count={selectedElementIds?.length || 0}
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
        Dragging Canvas - Elements: {elements?.length || 0}, Selected: {selectedElementIds?.length || 0}
      </div>
    );
  },
}));

describe('Element Dragging Tests', () => {
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

  describe('Basic Element Dragging', () => {
    it('can drag a selected element to a new position', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Create an element first
      await user.click(screen.getByRole('button', { name: 'Rectangle tool' }));
      const canvas = screen.getByTestId('dragging-canvas');
      
      // Create rectangle at (100,100) to (150,150)
      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 100, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 150, clientY: 150, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 150, clientY: 150, bubbles: true }));
      });

      // Switch to select tool
      await user.click(screen.getByRole('button', { name: 'Selection Tool tool' }));
      
      // Select the element by clicking on it (center at 125, 125)
      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 125, clientY: 125, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 125, clientY: 125, bubbles: true }));
      });

      // Verify element is selected
      let state = useAppStore.getState();
      expect(state.selectedElementIds).toHaveLength(1);
      
      const originalElement = state.elements[0];
      expect(originalElement.x).toBe(100);
      expect(originalElement.y).toBe(100);

      // Now drag the selected element from center (125,125) to (200,200)
      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 125, clientY: 125, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 200, clientY: 200, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 200, clientY: 200, bubbles: true }));
      });

      // Check if element moved
      state = useAppStore.getState();
      const movedElement = state.elements[0];
      
      // Element should have moved by delta (75, 75)
      expect(movedElement.x).toBe(175); // 100 + (200-125)
      expect(movedElement.y).toBe(175); // 100 + (200-125)
    });

    it('maintains element selection after dragging', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Create and select an element
      await user.click(screen.getByRole('button', { name: 'Rectangle tool' }));
      const canvas = screen.getByTestId('dragging-canvas');
      
      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 100, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 150, clientY: 150, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 150, clientY: 150, bubbles: true }));
      });

      await user.click(screen.getByRole('button', { name: 'Selection Tool tool' }));
      
      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 125, clientY: 125, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 125, clientY: 125, bubbles: true }));
      });

      // Drag the element
      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 125, clientY: 125, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 180, clientY: 180, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 180, clientY: 180, bubbles: true }));
      });

      // Element should still be selected
      const state = useAppStore.getState();
      expect(state.selectedElementIds).toHaveLength(1);
    });

    it('can drag multiple selected elements together', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Create two elements
      await user.click(screen.getByRole('button', { name: 'Rectangle tool' }));
      const canvas = screen.getByTestId('dragging-canvas');
      
      // First element at (100,100)
      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 100, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 150, clientY: 150, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 150, clientY: 150, bubbles: true }));
      });

      // Second element at (200,200)
      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 200, clientY: 200, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 250, clientY: 250, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 250, clientY: 250, bubbles: true }));
      });

      // Switch to select tool and manually select both elements using the store
      await user.click(screen.getByRole('button', { name: 'Selection Tool tool' }));
      
      // Get both element IDs and select them manually (since mock drag selection may not work perfectly)
      let state = useAppStore.getState();
      const elementIds = state.elements.map(el => el.id);
      
      // Manually select both elements for this test
      await act(async () => {
        useAppStore.getState().selectElements(elementIds);
      });
      
      state = useAppStore.getState();
      expect(state.selectedElementIds).toHaveLength(2);

      const originalElements = [...state.elements];

      // Drag one of the selected elements - both should move
      // Click on the first element (at 125, 125) and drag to 175, 175
      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 125, clientY: 125, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 175, clientY: 175, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 175, clientY: 175, bubbles: true }));
      });

      state = useAppStore.getState();
      
      // Both elements should have moved by the same delta (50, 50)
      expect(state.elements[0].x).toBe(originalElements[0].x + 50);
      expect(state.elements[0].y).toBe(originalElements[0].y + 50);
      expect(state.elements[1].x).toBe(originalElements[1].x + 50);
      expect(state.elements[1].y).toBe(originalElements[1].y + 50);
    });

    it('does not drag unselected elements', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Create two elements
      await user.click(screen.getByRole('button', { name: 'Rectangle tool' }));
      const canvas = screen.getByTestId('dragging-canvas');
      
      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 100, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 150, clientY: 150, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 150, clientY: 150, bubbles: true }));
      });

      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 300, clientY: 300, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 350, clientY: 350, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 350, clientY: 350, bubbles: true }));
      });

      // Switch to select tool and select only the first element
      await user.click(screen.getByRole('button', { name: 'Selection Tool tool' }));
      
      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 125, clientY: 125, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 125, clientY: 125, bubbles: true }));
      });

      let state = useAppStore.getState();
      expect(state.selectedElementIds).toHaveLength(1);

      const originalSecondElement = { ...state.elements[1] };

      // Drag the selected element
      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 125, clientY: 125, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 175, clientY: 175, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 175, clientY: 175, bubbles: true }));
      });

      state = useAppStore.getState();
      
      // First element should have moved
      expect(state.elements[0].x).toBe(150); // 100 + 50
      expect(state.elements[0].y).toBe(150); // 100 + 50
      
      // Second element should not have moved
      expect(state.elements[1].x).toBe(originalSecondElement.x);
      expect(state.elements[1].y).toBe(originalSecondElement.y);
    });
  });
});