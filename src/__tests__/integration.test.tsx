// ABOUTME: Integration tests for end-to-end drawing workflow
// ABOUTME: Tests complete user workflows from tool selection to element creation and rendering

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { useAppStore } from '../store';

// Mock the Canvas component
vi.mock('../components/Canvas', () => ({
  Canvas: ({ onMouseDown, elements, viewport }: any) => (
    <div
      data-testid="integration-canvas"
      data-elements-count={elements?.length || 0}
      data-zoom={viewport?.zoom || 1}
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const point = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };
        onMouseDown?.(point);
      }}
    >
      Integration Canvas - Elements: {elements?.length || 0}
    </div>
  ),
}));

describe('Integration Tests - Drawing Workflow', () => {
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

  describe('Rectangle Drawing Workflow', () => {
    it('complete rectangle drawing workflow: select tool → click canvas → rectangle appears', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Step 1: Select rectangle tool
      const rectangleButton = screen.getByRole('button', { name: 'Rectangle' });
      await user.click(rectangleButton);

      // Verify tool is selected
      expect(rectangleButton).toHaveClass('active');
      expect(useAppStore.getState().activeTool).toBe('rectangle');

      // Step 2: Click on canvas
      const canvas = screen.getByTestId('integration-canvas');
      expect(canvas).toHaveAttribute('data-elements-count', '0');

      await user.click(canvas);

      // Step 3: Rectangle appears
      const state = useAppStore.getState();
      expect(state.elements).toHaveLength(1);
      expect(state.elements[0].type).toBe('rectangle');

      // Canvas should reflect the new element
      expect(canvas).toHaveAttribute('data-elements-count', '1');
    });

    it('rectangle has correct position, size, and styling', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole('button', { name: 'Rectangle' }));
      await user.click(screen.getByTestId('integration-canvas'));

      const state = useAppStore.getState();
      const rectangle = state.elements[0];

      expect(rectangle).toMatchObject({
        type: 'rectangle',
        width: 100,
        height: 50,
        angle: 0,
        strokeColor: '#000000',
        backgroundColor: 'transparent',
        strokeWidth: 2,
        roughness: 1,
        opacity: 1,
      });
      expect(rectangle.id).toBeDefined();
      expect(typeof rectangle.x).toBe('number');
      expect(typeof rectangle.y).toBe('number');
    });

    it('rectangle is added to store elements array', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole('button', { name: 'Rectangle' }));
      await user.click(screen.getByTestId('integration-canvas'));

      const state = useAppStore.getState();
      expect(state.elements).toHaveLength(1);
      expect(state.elements[0].type).toBe('rectangle');
    });

    it('rectangle is rendered on canvas', async () => {
      const user = userEvent.setup();
      render(<App />);

      const canvas = screen.getByTestId('integration-canvas');
      expect(canvas).toHaveTextContent('Elements: 0');

      await user.click(screen.getByRole('button', { name: 'Rectangle' }));
      await user.click(canvas);

      expect(canvas).toHaveTextContent('Elements: 1');
    });

    it('history is updated correctly for rectangle creation', async () => {
      const user = userEvent.setup();
      render(<App />);

      const initialState = useAppStore.getState();
      expect(initialState.history).toHaveLength(1);
      expect(initialState.historyIndex).toBe(0);

      await user.click(screen.getByRole('button', { name: 'Rectangle' }));
      await user.click(screen.getByTestId('integration-canvas'));

      const finalState = useAppStore.getState();
      expect(finalState.history).toHaveLength(2);
      expect(finalState.historyIndex).toBe(1);
      expect(finalState.history[1]).toHaveLength(1);
    });
  });

  describe('Circle Drawing Workflow', () => {
    it('complete circle drawing workflow: select tool → click canvas → circle appears', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Step 1: Select circle tool
      const circleButton = screen.getByRole('button', { name: 'Circle' });
      await user.click(circleButton);

      // Verify tool is selected
      expect(circleButton).toHaveClass('active');
      expect(useAppStore.getState().activeTool).toBe('circle');

      // Step 2: Click on canvas
      const canvas = screen.getByTestId('integration-canvas');
      expect(canvas).toHaveAttribute('data-elements-count', '0');

      await user.click(canvas);

      // Step 3: Circle appears
      const state = useAppStore.getState();
      expect(state.elements).toHaveLength(1);
      expect(state.elements[0].type).toBe('circle');

      // Canvas should reflect the new element
      expect(canvas).toHaveAttribute('data-elements-count', '1');
    });

    it('circle has correct position, size, and styling', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole('button', { name: 'Circle' }));
      await user.click(screen.getByTestId('integration-canvas'));

      const state = useAppStore.getState();
      const circle = state.elements[0];

      expect(circle).toMatchObject({
        type: 'circle',
        width: 80,
        height: 80,
        angle: 0,
        strokeColor: '#000000',
        backgroundColor: 'transparent',
        strokeWidth: 2,
        roughness: 1,
        opacity: 1,
      });
      expect(circle.id).toBeDefined();
      expect(typeof circle.x).toBe('number');
      expect(typeof circle.y).toBe('number');
    });

    it('circle is added to store elements array', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole('button', { name: 'Circle' }));
      await user.click(screen.getByTestId('integration-canvas'));

      const state = useAppStore.getState();
      expect(state.elements).toHaveLength(1);
      expect(state.elements[0].type).toBe('circle');
    });

    it('circle is rendered on canvas', async () => {
      const user = userEvent.setup();
      render(<App />);

      const canvas = screen.getByTestId('integration-canvas');
      expect(canvas).toHaveTextContent('Elements: 0');

      await user.click(screen.getByRole('button', { name: 'Circle' }));
      await user.click(canvas);

      expect(canvas).toHaveTextContent('Elements: 1');
    });

    it('history is updated correctly for circle creation', async () => {
      const user = userEvent.setup();
      render(<App />);

      const initialState = useAppStore.getState();
      expect(initialState.history).toHaveLength(1);
      expect(initialState.historyIndex).toBe(0);

      await user.click(screen.getByRole('button', { name: 'Circle' }));
      await user.click(screen.getByTestId('integration-canvas'));

      const finalState = useAppStore.getState();
      expect(finalState.history).toHaveLength(2);
      expect(finalState.historyIndex).toBe(1);
      expect(finalState.history[1]).toHaveLength(1);
    });
  });

  describe('Multiple Elements', () => {
    it('can create multiple rectangles', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole('button', { name: 'Rectangle' }));
      const canvas = screen.getByTestId('integration-canvas');

      // Create 3 rectangles
      await user.click(canvas);
      await user.click(canvas);
      await user.click(canvas);

      const state = useAppStore.getState();
      expect(state.elements).toHaveLength(3);
      expect(state.elements.every(el => el.type === 'rectangle')).toBe(true);
      expect(canvas).toHaveTextContent('Elements: 3');
    });

    it('can create multiple circles', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole('button', { name: 'Circle' }));
      const canvas = screen.getByTestId('integration-canvas');

      // Create 3 circles
      await user.click(canvas);
      await user.click(canvas);
      await user.click(canvas);

      const state = useAppStore.getState();
      expect(state.elements).toHaveLength(3);
      expect(state.elements.every(el => el.type === 'circle')).toBe(true);
      expect(canvas).toHaveTextContent('Elements: 3');
    });

    it('can mix rectangle and circle creation', async () => {
      const user = userEvent.setup();
      render(<App />);

      const canvas = screen.getByTestId('integration-canvas');

      // Create rectangle
      await user.click(screen.getByRole('button', { name: 'Rectangle' }));
      await user.click(canvas);

      // Create circle
      await user.click(screen.getByRole('button', { name: 'Circle' }));
      await user.click(canvas);

      // Create another rectangle
      await user.click(screen.getByRole('button', { name: 'Rectangle' }));
      await user.click(canvas);

      const state = useAppStore.getState();
      expect(state.elements).toHaveLength(3);
      expect(state.elements[0].type).toBe('rectangle');
      expect(state.elements[1].type).toBe('circle');
      expect(state.elements[2].type).toBe('rectangle');
      expect(canvas).toHaveTextContent('Elements: 3');
    });

    it('all elements render correctly', async () => {
      const user = userEvent.setup();
      render(<App />);

      const canvas = screen.getByTestId('integration-canvas');

      // Create mixed elements
      await user.click(screen.getByRole('button', { name: 'Rectangle' }));
      await user.click(canvas);
      await user.click(screen.getByRole('button', { name: 'Circle' }));
      await user.click(canvas);

      // All elements should be rendered
      expect(canvas).toHaveAttribute('data-elements-count', '2');
      expect(canvas).toHaveTextContent('Elements: 2');
    });

    it('elements maintain correct z-order (creation order)', async () => {
      const user = userEvent.setup();
      render(<App />);

      const canvas = screen.getByTestId('integration-canvas');

      // Create elements in specific order
      await user.click(screen.getByRole('button', { name: 'Rectangle' }));
      await user.click(canvas);
      
      await user.click(screen.getByRole('button', { name: 'Circle' }));
      await user.click(canvas);

      const state = useAppStore.getState();
      
      // Elements should be in creation order
      expect(state.elements[0].type).toBe('rectangle');
      expect(state.elements[1].type).toBe('circle');
      
      // First element should have been created before second
      expect(state.elements[0].id).not.toBe(state.elements[1].id);
    });
  });

  describe('Tool Switching', () => {
    it('can switch between tools and create different elements', async () => {
      const user = userEvent.setup();
      render(<App />);

      const canvas = screen.getByTestId('integration-canvas');

      // Start with rectangle
      await user.click(screen.getByRole('button', { name: 'Rectangle' }));
      expect(useAppStore.getState().activeTool).toBe('rectangle');
      await user.click(canvas);

      // Switch to circle
      await user.click(screen.getByRole('button', { name: 'Circle' }));
      expect(useAppStore.getState().activeTool).toBe('circle');
      await user.click(canvas);

      // Switch to select (should not create elements)
      await user.click(screen.getByRole('button', { name: 'Select' }));
      expect(useAppStore.getState().activeTool).toBe('select');
      await user.click(canvas);

      // Should have created 2 elements (not 3)
      const state = useAppStore.getState();
      expect(state.elements).toHaveLength(2);
      expect(state.elements[0].type).toBe('rectangle');
      expect(state.elements[1].type).toBe('circle');
    });

    it('tool state persists correctly during workflow', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Select rectangle tool
      await user.click(screen.getByRole('button', { name: 'Rectangle' }));
      expect(useAppStore.getState().activeTool).toBe('rectangle');
      expect(screen.getByRole('button', { name: 'Rectangle' })).toHaveClass('active');

      // Create element - tool should remain selected
      await user.click(screen.getByTestId('integration-canvas'));
      expect(useAppStore.getState().activeTool).toBe('rectangle');
      expect(screen.getByRole('button', { name: 'Rectangle' })).toHaveClass('active');

      // Create another element - tool should still be selected
      await user.click(screen.getByTestId('integration-canvas'));
      expect(useAppStore.getState().activeTool).toBe('rectangle');
      expect(screen.getByRole('button', { name: 'Rectangle' })).toHaveClass('active');
    });

    it('UI reflects current tool selection throughout workflow', async () => {
      const user = userEvent.setup();
      render(<App />);

      const selectBtn = screen.getByRole('button', { name: 'Select' });
      const rectangleBtn = screen.getByRole('button', { name: 'Rectangle' });
      const circleBtn = screen.getByRole('button', { name: 'Circle' });

      // Initially select tool should be active
      expect(selectBtn).toHaveClass('active');
      expect(rectangleBtn).not.toHaveClass('active');
      expect(circleBtn).not.toHaveClass('active');

      // Switch to rectangle
      await user.click(rectangleBtn);
      expect(selectBtn).not.toHaveClass('active');
      expect(rectangleBtn).toHaveClass('active');
      expect(circleBtn).not.toHaveClass('active');

      // Switch to circle
      await user.click(circleBtn);
      expect(selectBtn).not.toHaveClass('active');
      expect(rectangleBtn).not.toHaveClass('active');
      expect(circleBtn).toHaveClass('active');

      // Back to select
      await user.click(selectBtn);
      expect(selectBtn).toHaveClass('active');
      expect(rectangleBtn).not.toHaveClass('active');
      expect(circleBtn).not.toHaveClass('active');
    });
  });

  describe('Complex Workflows', () => {
    it('complete multi-element drawing session', async () => {
      const user = userEvent.setup();
      render(<App />);

      const canvas = screen.getByTestId('integration-canvas');

      // Complex workflow: create various elements, switch tools multiple times
      
      // Create 2 rectangles
      await user.click(screen.getByRole('button', { name: 'Rectangle' }));
      await user.click(canvas);
      await user.click(canvas);

      // Switch to circle and create 1 circle
      await user.click(screen.getByRole('button', { name: 'Circle' }));
      await user.click(canvas);

      // Switch back to rectangle and create 1 more
      await user.click(screen.getByRole('button', { name: 'Rectangle' }));
      await user.click(canvas);

      // Switch to select mode
      await user.click(screen.getByRole('button', { name: 'Select' }));
      await user.click(canvas); // Should not create element

      // Final verification
      const state = useAppStore.getState();
      expect(state.elements).toHaveLength(4);
      expect(state.elements[0].type).toBe('rectangle');
      expect(state.elements[1].type).toBe('rectangle');
      expect(state.elements[2].type).toBe('circle');
      expect(state.elements[3].type).toBe('rectangle');
      expect(state.activeTool).toBe('select');
      expect(canvas).toHaveTextContent('Elements: 4');
    });

    it('workflow with history tracking', async () => {
      const user = userEvent.setup();
      render(<App />);

      const canvas = screen.getByTestId('integration-canvas');

      // Track history through multiple operations
      let state = useAppStore.getState();
      expect(state.history).toHaveLength(1);
      expect(state.historyIndex).toBe(0);

      // Create rectangle
      await user.click(screen.getByRole('button', { name: 'Rectangle' }));
      await user.click(canvas);

      state = useAppStore.getState();
      expect(state.history).toHaveLength(2);
      expect(state.historyIndex).toBe(1);

      // Create circle
      await user.click(screen.getByRole('button', { name: 'Circle' }));
      await user.click(canvas);

      state = useAppStore.getState();
      expect(state.history).toHaveLength(3);
      expect(state.historyIndex).toBe(2);
      expect(state.elements).toHaveLength(2);
    });

    it('performance with rapid element creation', async () => {
      const user = userEvent.setup();
      render(<App />);

      const canvas = screen.getByTestId('integration-canvas');
      await user.click(screen.getByRole('button', { name: 'Rectangle' }));

      // Rapidly create many elements
      const startTime = performance.now();
      for (let i = 0; i < 20; i++) {
        await user.click(canvas);
      }
      const endTime = performance.now();

      // Should complete in reasonable time (less than 2 seconds)
      expect(endTime - startTime).toBeLessThan(2000);

      // All elements should be created
      const state = useAppStore.getState();
      expect(state.elements).toHaveLength(20);
      expect(canvas).toHaveTextContent('Elements: 20');
    });
  });
});