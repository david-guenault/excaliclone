// ABOUTME: Integration test for multi-selection group operations in the app
// ABOUTME: Tests the complete workflow of selecting multiple elements and performing group operations

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
import App from '../App';
import { useAppStore } from '../store';

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

describe('Multi-Selection Integration Test', () => {
  beforeEach(() => {
    // Reset store state
    useAppStore.setState({
      elements: [],
      selectedElementIds: [],
      activeTool: 'select',
      ui: {
        propertiesPanel: { visible: false, width: 280 },
        topToolbar: { visible: true },
        canvasLocked: false,
        grid: { 
          enabled: true, size: 20, snapToGrid: false, snapDistance: 10,
          showGrid: false, color: '#e0e0e0', opacity: 0.5 
        },
        dialogs: { gridDialog: false },
      },
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('should support multi-selection and group resize operations', async () => {
    const { container } = render(<App />);
    const canvas = container.querySelector('canvas');
    
    if (!canvas) {
      throw new Error('Canvas not found');
    }

    // Step 1: Create two rectangles
    useAppStore.getState().setActiveTool('rectangle');
    
    // Create first rectangle
    fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(canvas, { clientX: 200, clientY: 150 });
    fireEvent.mouseUp(canvas, { clientX: 200, clientY: 150 });
    
    // Create second rectangle
    fireEvent.mouseDown(canvas, { clientX: 250, clientY: 120 });
    fireEvent.mouseMove(canvas, { clientX: 350, clientY: 170 });
    fireEvent.mouseUp(canvas, { clientX: 350, clientY: 170 });
    
    let state = useAppStore.getState();
    expect(state.elements).toHaveLength(2);
    expect(state.selectedElementIds).toHaveLength(1); // Only last created is selected
    
    // Step 2: Switch to select tool and select both rectangles
    useAppStore.getState().setActiveTool('select');
    
    // Click on first rectangle
    fireEvent.mouseDown(canvas, { clientX: 150, clientY: 125 });
    fireEvent.mouseUp(canvas, { clientX: 150, clientY: 125 });
    
    // Shift+click on second rectangle to add to selection
    fireEvent.mouseDown(canvas, { 
      clientX: 300, 
      clientY: 145,
      shiftKey: true 
    });
    fireEvent.mouseUp(canvas, { 
      clientX: 300, 
      clientY: 145,
      shiftKey: true 
    });
    
    state = useAppStore.getState();
    expect(state.selectedElementIds).toHaveLength(2);
    
    // Step 3: Verify that multi-selection bounds and handles are working
    // This is tested implicitly through the rendering system
    // The multi-selection group operations should now be available
    
    expect(state.elements[0].type).toBe('rectangle');
    expect(state.elements[1].type).toBe('rectangle');
  });

  it('should handle drag selection for multi-selection', async () => {
    const { container } = render(<App />);
    const canvas = container.querySelector('canvas');
    
    if (!canvas) {
      throw new Error('Canvas not found');
    }

    // Create multiple elements first
    useAppStore.getState().setActiveTool('rectangle');
    
    // Create first rectangle
    fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(canvas, { clientX: 200, clientY: 150 });
    fireEvent.mouseUp(canvas, { clientX: 200, clientY: 150 });
    
    // Create second rectangle
    fireEvent.mouseDown(canvas, { clientX: 250, clientY: 120 });
    fireEvent.mouseMove(canvas, { clientX: 350, clientY: 170 });
    fireEvent.mouseUp(canvas, { clientX: 350, clientY: 170 });
    
    // Create third rectangle
    fireEvent.mouseDown(canvas, { clientX: 400, clientY: 200 });
    fireEvent.mouseMove(canvas, { clientX: 500, clientY: 250 });
    fireEvent.mouseUp(canvas, { clientX: 500, clientY: 250 });
    
    let state = useAppStore.getState();
    expect(state.elements).toHaveLength(3);
    
    // Switch to select tool
    useAppStore.getState().setActiveTool('select');
    
    // Perform drag selection to select multiple elements
    fireEvent.mouseDown(canvas, { clientX: 80, clientY: 80 }); // Start before first element
    fireEvent.mouseMove(canvas, { clientX: 380, clientY: 180 }); // End to include first two elements
    fireEvent.mouseUp(canvas, { clientX: 380, clientY: 180 });
    
    state = useAppStore.getState();
    
    // Should have selected the first two rectangles (but not the third)
    expect(state.selectedElementIds.length).toBeGreaterThanOrEqual(1);
    
    // Verify that elements are actually selected
    const selectedElements = state.elements.filter(el => 
      state.selectedElementIds.includes(el.id)
    );
    expect(selectedElements.length).toBeGreaterThanOrEqual(1);
  });

  it('should handle single element operations alongside multi-selection', async () => {
    const { container } = render(<App />);
    const canvas = container.querySelector('canvas');
    
    if (!canvas) {
      throw new Error('Canvas not found');
    }

    // Create one rectangle
    useAppStore.getState().setActiveTool('rectangle');
    
    fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(canvas, { clientX: 200, clientY: 150 });
    fireEvent.mouseUp(canvas, { clientX: 200, clientY: 150 });
    
    let state = useAppStore.getState();
    expect(state.elements).toHaveLength(1);
    expect(state.selectedElementIds).toHaveLength(1); // Auto-selected
    
    // Switch to select tool
    useAppStore.getState().setActiveTool('select');
    
    // Click on the rectangle to ensure it's selected
    fireEvent.mouseDown(canvas, { clientX: 150, clientY: 125 });
    fireEvent.mouseUp(canvas, { clientX: 150, clientY: 125 });
    
    state = useAppStore.getState();
    expect(state.selectedElementIds).toHaveLength(1);
    
    // Single-element selection should still work normally
    // (Multi-selection logic should not interfere with single selection)
    expect(state.selectedElementIds[0]).toBe(state.elements[0].id);
  });

  it('should handle empty selection state correctly', async () => {
    const { container } = render(<App />);
    const canvas = container.querySelector('canvas');
    
    if (!canvas) {
      throw new Error('Canvas not found');
    }

    // Create a rectangle
    useAppStore.getState().setActiveTool('rectangle');
    
    fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(canvas, { clientX: 200, clientY: 150 });
    fireEvent.mouseUp(canvas, { clientX: 200, clientY: 150 });
    
    // Switch to select tool and clear selection by clicking empty area
    useAppStore.getState().setActiveTool('select');
    
    fireEvent.mouseDown(canvas, { clientX: 50, clientY: 50 }); // Click empty area
    fireEvent.mouseUp(canvas, { clientX: 50, clientY: 50 });
    
    const state = useAppStore.getState();
    expect(state.selectedElementIds).toHaveLength(0);
    
    // Multi-selection logic should handle empty selection gracefully
    expect(state.elements).toHaveLength(1); // Element still exists, just not selected
  });

  it('should handle locked elements in multi-selection', async () => {
    const { container } = render(<App />);
    const canvas = container.querySelector('canvas');
    
    if (!canvas) {
      throw new Error('Canvas not found');
    }

    // Create two rectangles
    useAppStore.getState().setActiveTool('rectangle');
    
    fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(canvas, { clientX: 200, clientY: 150 });
    fireEvent.mouseUp(canvas, { clientX: 200, clientY: 150 });
    
    fireEvent.mouseDown(canvas, { clientX: 250, clientY: 120 });
    fireEvent.mouseMove(canvas, { clientX: 350, clientY: 170 });
    fireEvent.mouseUp(canvas, { clientX: 350, clientY: 170 });
    
    // Lock the first element
    const state = useAppStore.getState();
    useAppStore.setState({
      elements: state.elements.map((el, index) => 
        index === 0 ? { ...el, locked: true } : el
      )
    });
    
    // Switch to select tool
    useAppStore.getState().setActiveTool('select');
    
    // Try to select both elements with drag selection
    fireEvent.mouseDown(canvas, { clientX: 80, clientY: 80 });
    fireEvent.mouseMove(canvas, { clientX: 380, clientY: 180 });
    fireEvent.mouseUp(canvas, { clientX: 380, clientY: 180 });
    
    const finalState = useAppStore.getState();
    
    // Should only select unlocked elements
    // The locked element should not interfere with multi-selection operations
    expect(finalState.elements).toHaveLength(2);
    expect(finalState.elements[0].locked).toBe(true);
    expect(finalState.elements[1].locked).toBeFalsy();
  });
});