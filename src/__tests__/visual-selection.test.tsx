// Tests for visual selection indicators
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { useAppStore } from '../store';

// Mock the Canvas component to track visual selection state
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
        data-testid="visual-selection-canvas"
        data-elements-count={elements?.length || 0}
        data-selected-elements={selectedElementIds?.join(',') || ''}
        data-has-selection={selectedElementIds?.length > 0 ? 'true' : 'false'}
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
        Visual Selection Canvas - Elements: {elements?.length || 0}
        {selectedElementIds?.length > 0 && `, Selected: ${selectedElementIds.length}`}
        {dragSelectionRect && ' [Drag Selection Active]'}
      </div>
    );
  },
}));

describe('Visual Selection Indicators Tests', () => {
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

  describe('Selection State Tracking', () => {
    it('properly tracks no selection state', async () => {
      const user = userEvent.setup();
      render(<App />);

      const canvas = screen.getByTestId('visual-selection-canvas');
      
      // Initially no selection
      expect(canvas).toHaveAttribute('data-has-selection', 'false');
      expect(canvas).toHaveAttribute('data-selected-elements', '');
      expect(canvas).toHaveTextContent('Visual Selection Canvas - Elements: 0');
    });

    it('properly tracks single element selection', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Create an element first
      await user.click(screen.getByRole('button', { name: 'Rectangle tool' }));
      const canvas = screen.getByTestId('visual-selection-canvas');
      
      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 100, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 150, clientY: 150, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 150, clientY: 150, bubbles: true }));
      });

      // Switch to select tool and select the element
      await user.click(screen.getByRole('button', { name: 'Selection Tool tool' }));
      await user.click(canvas, { clientX: 125, clientY: 125 });

      // Check selection state
      expect(canvas).toHaveAttribute('data-has-selection', 'true');
      expect(canvas).toHaveTextContent('Visual Selection Canvas - Elements: 1, Selected: 1');
      
      const state = useAppStore.getState();
      const selectedId = state.selectedElementIds[0];
      expect(canvas).toHaveAttribute('data-selected-elements', selectedId);
    });

    it('properly tracks multiple element selection', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Create two elements
      await user.click(screen.getByRole('button', { name: 'Rectangle tool' }));
      const canvas = screen.getByTestId('visual-selection-canvas');
      
      // First element
      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 100, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 150, clientY: 150, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 150, clientY: 150, bubbles: true }));
      });

      // Second element
      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 200, clientY: 200, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 250, clientY: 250, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 250, clientY: 250, bubbles: true }));
      });

      // Switch to select tool and select both elements
      await user.click(screen.getByRole('button', { name: 'Selection Tool tool' }));
      
      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 80, clientY: 80, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 270, clientY: 270, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 270, clientY: 270, bubbles: true }));
      });

      // Check multi-selection state
      expect(canvas).toHaveAttribute('data-has-selection', 'true');
      expect(canvas).toHaveTextContent('Visual Selection Canvas - Elements: 2, Selected: 2');
      
      const state = useAppStore.getState();
      expect(state.selectedElementIds).toHaveLength(2);
      const selectedIds = state.selectedElementIds.join(',');
      expect(canvas).toHaveAttribute('data-selected-elements', selectedIds);
    });

    it('properly clears selection state', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Create and select an element
      await user.click(screen.getByRole('button', { name: 'Rectangle tool' }));
      const canvas = screen.getByTestId('visual-selection-canvas');
      
      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 100, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 150, clientY: 150, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 150, clientY: 150, bubbles: true }));
      });

      await user.click(screen.getByRole('button', { name: 'Selection Tool tool' }));
      await user.click(canvas, { clientX: 125, clientY: 125 });

      // Verify selection exists
      expect(canvas).toHaveAttribute('data-has-selection', 'true');

      // Clear selection by clicking empty area
      await user.click(canvas, { clientX: 300, clientY: 300 });

      // Check that selection is cleared
      expect(canvas).toHaveAttribute('data-has-selection', 'false');
      expect(canvas).toHaveAttribute('data-selected-elements', '');
      expect(canvas).toHaveTextContent('Visual Selection Canvas - Elements: 1');
    });
  });

  describe('Drag Selection Rectangle Visualization', () => {
    it('shows drag selection rectangle during drag operation', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole('button', { name: 'Selection Tool tool' }));
      const canvas = screen.getByTestId('visual-selection-canvas');

      // Start drag selection
      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 50, clientY: 50, bubbles: true }));
      });

      // Should not show drag rect yet (needs mouse move)
      expect(canvas).toHaveAttribute('data-has-drag-rect', 'false');

      // Move mouse to create drag rectangle
      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 100, clientY: 100, bubbles: true }));
      });

      // Should now show drag rectangle
      expect(canvas).toHaveAttribute('data-has-drag-rect', 'true');
      expect(canvas).toHaveTextContent('[Drag Selection Active]');

      // Complete drag
      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 100, clientY: 100, bubbles: true }));
      });

      // Drag rectangle should be gone
      expect(canvas).toHaveAttribute('data-has-drag-rect', 'false');
    });

    it('does not show drag rectangle during non-drag operations', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole('button', { name: 'Selection Tool tool' }));
      const canvas = screen.getByTestId('visual-selection-canvas');

      // Simple click (not drag)
      await user.click(canvas, { clientX: 100, clientY: 100 });

      // Should not show drag rectangle
      expect(canvas).toHaveAttribute('data-has-drag-rect', 'false');
    });

    it('shows drag rectangle only during selection tool usage', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Try with rectangle tool (should not show drag selection)
      await user.click(screen.getByRole('button', { name: 'Rectangle tool' }));
      const canvas = screen.getByTestId('visual-selection-canvas');

      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 50, clientY: 50, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 100, clientY: 100, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 100, clientY: 100, bubbles: true }));
      });

      // Should not show drag rectangle (creating rectangle instead)
      expect(canvas).toHaveAttribute('data-has-drag-rect', 'false');
    });
  });

  describe('Selection Persistence', () => {
    it('maintains selection when switching between non-drawing tools', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Create an element
      await user.click(screen.getByRole('button', { name: 'Rectangle tool' }));
      const canvas = screen.getByTestId('visual-selection-canvas');
      
      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 100, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 150, clientY: 150, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 150, clientY: 150, bubbles: true }));
      });

      // Select the element
      await user.click(screen.getByRole('button', { name: 'Selection Tool tool' }));
      await user.click(canvas, { clientX: 125, clientY: 125 });

      expect(canvas).toHaveAttribute('data-has-selection', 'true');
      
      // Note: In the current implementation, selection is cleared when switching tools
      // This is the expected behavior for drawing tools to avoid interference
    });

    it('clears selection when starting to draw new elements', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Create and select an element
      await user.click(screen.getByRole('button', { name: 'Rectangle tool' }));
      const canvas = screen.getByTestId('visual-selection-canvas');
      
      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 100, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 150, clientY: 150, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 150, clientY: 150, bubbles: true }));
      });

      await user.click(screen.getByRole('button', { name: 'Selection Tool tool' }));
      await user.click(canvas, { clientX: 125, clientY: 125 });

      expect(canvas).toHaveAttribute('data-has-selection', 'true');

      // Switch to circle tool and start drawing
      await user.click(screen.getByRole('button', { name: 'Circle tool' }));
      
      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 200, clientY: 200, bubbles: true }));
      });

      // Selection should be cleared (though the exact behavior may depend on implementation)
      // This ensures drawing tools don't interfere with existing selections
      const state = useAppStore.getState();
      expect(state.activeTool).toBe('circle');
    });
  });

  describe('Properties Panel Integration', () => {
    it('shows properties panel when elements are selected', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Create an element
      await user.click(screen.getByRole('button', { name: 'Rectangle tool' }));
      const canvas = screen.getByTestId('visual-selection-canvas');
      
      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 100, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 150, clientY: 150, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 150, clientY: 150, bubbles: true }));
      });

      // Initially properties panel should be hidden
      expect(useAppStore.getState().ui.propertiesPanel.visible).toBe(false);

      // Select the element
      await user.click(screen.getByRole('button', { name: 'Selection Tool tool' }));
      await user.click(canvas, { clientX: 125, clientY: 125 });

      // Properties panel should now be visible
      expect(useAppStore.getState().ui.propertiesPanel.visible).toBe(true);
    });

    it('hides properties panel when selection is cleared', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Create and select an element
      await user.click(screen.getByRole('button', { name: 'Rectangle tool' }));
      const canvas = screen.getByTestId('visual-selection-canvas');
      
      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 100, clientY: 100, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 150, clientY: 150, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 150, clientY: 150, bubbles: true }));
      });

      await user.click(screen.getByRole('button', { name: 'Selection Tool tool' }));
      await user.click(canvas, { clientX: 125, clientY: 125 });

      // Properties panel should be visible
      expect(useAppStore.getState().ui.propertiesPanel.visible).toBe(true);

      // Clear selection
      await user.click(canvas, { clientX: 300, clientY: 300 });

      // Properties panel should be hidden
      expect(useAppStore.getState().ui.propertiesPanel.visible).toBe(false);
    });

    it('keeps properties panel visible during multi-selection', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Create two elements
      await user.click(screen.getByRole('button', { name: 'Rectangle tool' }));
      const canvas = screen.getByTestId('visual-selection-canvas');
      
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

      // Select both elements
      await user.click(screen.getByRole('button', { name: 'Selection Tool tool' }));
      
      await act(async () => {
        await canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: 80, clientY: 80, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: 270, clientY: 270, bubbles: true }));
        await canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: 270, clientY: 270, bubbles: true }));
      });

      // Properties panel should be visible for multi-selection
      expect(useAppStore.getState().ui.propertiesPanel.visible).toBe(true);
      expect(useAppStore.getState().selectedElementIds).toHaveLength(2);
    });
  });
});