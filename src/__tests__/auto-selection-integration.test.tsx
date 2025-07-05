// ABOUTME: Integration test for auto-selection in the actual app workflow
// ABOUTME: Tests the complete drawing workflow to ensure elements are auto-selected

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

describe('Auto-Selection Integration Test', () => {
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

  it('should auto-select rectangle after drawing completion', async () => {
    const { container } = render(<App />);
    const canvas = container.querySelector('canvas');
    
    if (!canvas) {
      throw new Error('Canvas not found');
    }

    // Step 1: Select rectangle tool
    useAppStore.getState().setActiveTool('rectangle');
    
    // Step 2: Simulate drawing a rectangle
    // Mouse down to start drawing
    fireEvent.mouseDown(canvas, {
      clientX: 100,
      clientY: 100,
      bubbles: true,
    });

    // Mouse move to create size
    fireEvent.mouseMove(canvas, {
      clientX: 200,
      clientY: 150,
      bubbles: true,
    });

    // Mouse up to finish drawing
    fireEvent.mouseUp(canvas, {
      clientX: 200,
      clientY: 150,
      bubbles: true,
    });

    // Step 3: Check that rectangle was created and auto-selected
    const state = useAppStore.getState();
    
    // Should have created one element
    expect(state.elements).toHaveLength(1);
    expect(state.elements[0].type).toBe('rectangle');
    
    // Should have auto-selected the rectangle
    expect(state.selectedElementIds).toHaveLength(1);
    expect(state.selectedElementIds[0]).toBe(state.elements[0].id);
    
    // Properties panel should be visible
    expect(state.ui.propertiesPanel.visible).toBe(true);
  });

  it('should auto-select circle after drawing completion', async () => {
    const { container } = render(<App />);
    const canvas = container.querySelector('canvas');
    
    if (!canvas) {
      throw new Error('Canvas not found');
    }

    // Step 1: Select circle tool
    useAppStore.getState().setActiveTool('circle');
    
    // Step 2: Simulate drawing a circle
    fireEvent.mouseDown(canvas, {
      clientX: 150,
      clientY: 150,
      bubbles: true,
    });

    fireEvent.mouseMove(canvas, {
      clientX: 200,
      clientY: 200,
      bubbles: true,
    });

    fireEvent.mouseUp(canvas, {
      clientX: 200,
      clientY: 200,
      bubbles: true,
    });

    // Step 3: Check auto-selection
    const state = useAppStore.getState();
    
    expect(state.elements).toHaveLength(1);
    expect(state.elements[0].type).toBe('circle');
    expect(state.selectedElementIds).toHaveLength(1);
    expect(state.selectedElementIds[0]).toBe(state.elements[0].id);
    expect(state.ui.propertiesPanel.visible).toBe(true);
  });

  it('should replace selection when creating multiple elements', async () => {
    const { container } = render(<App />);
    const canvas = container.querySelector('canvas');
    
    if (!canvas) {
      throw new Error('Canvas not found');
    }

    // Create first rectangle
    useAppStore.getState().setActiveTool('rectangle');
    
    fireEvent.mouseDown(canvas, { clientX: 50, clientY: 50 });
    fireEvent.mouseMove(canvas, { clientX: 100, clientY: 100 });
    fireEvent.mouseUp(canvas, { clientX: 100, clientY: 100 });
    
    let state = useAppStore.getState();
    const firstElementId = state.elements[0].id;
    expect(state.selectedElementIds).toEqual([firstElementId]);

    // Create second circle (should replace selection)
    useAppStore.getState().setActiveTool('circle');
    
    fireEvent.mouseDown(canvas, { clientX: 150, clientY: 150 });
    fireEvent.mouseMove(canvas, { clientX: 200, clientY: 200 });
    fireEvent.mouseUp(canvas, { clientX: 200, clientY: 200 });
    
    state = useAppStore.getState();
    const secondElementId = state.elements[1].id;
    
    // Should have both elements but only second one selected
    expect(state.elements).toHaveLength(2);
    expect(state.selectedElementIds).toEqual([secondElementId]);
    expect(state.selectedElementIds).not.toContain(firstElementId);
  });

  it('should work with line tool', async () => {
    const { container } = render(<App />);
    const canvas = container.querySelector('canvas');
    
    if (!canvas) {
      throw new Error('Canvas not found');
    }

    useAppStore.getState().setActiveTool('line');
    
    fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(canvas, { clientX: 200, clientY: 150 });
    fireEvent.mouseUp(canvas, { clientX: 200, clientY: 150 });
    
    const state = useAppStore.getState();
    
    expect(state.elements).toHaveLength(1);
    expect(state.elements[0].type).toBe('line');
    expect(state.selectedElementIds).toHaveLength(1);
    expect(state.selectedElementIds[0]).toBe(state.elements[0].id);
  });

  it('should work with arrow tool', async () => {
    const { container } = render(<App />);
    const canvas = container.querySelector('canvas');
    
    if (!canvas) {
      throw new Error('Canvas not found');
    }

    useAppStore.getState().setActiveTool('arrow');
    
    fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(canvas, { clientX: 200, clientY: 150 });
    fireEvent.mouseUp(canvas, { clientX: 200, clientY: 150 });
    
    const state = useAppStore.getState();
    
    expect(state.elements).toHaveLength(1);
    expect(state.elements[0].type).toBe('arrow');
    expect(state.selectedElementIds).toHaveLength(1);
    expect(state.selectedElementIds[0]).toBe(state.elements[0].id);
  });

  it('should not auto-select if drawing is too small (element gets deleted)', async () => {
    const { container } = render(<App />);
    const canvas = container.querySelector('canvas');
    
    if (!canvas) {
      throw new Error('Canvas not found');
    }

    useAppStore.getState().setActiveTool('rectangle');
    
    // Draw a very small rectangle (should be deleted)
    fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(canvas, { clientX: 102, clientY: 102 }); // Only 2px
    fireEvent.mouseUp(canvas, { clientX: 102, clientY: 102 });
    
    const state = useAppStore.getState();
    
    // Should have no elements (deleted due to small size)
    expect(state.elements).toHaveLength(0);
    expect(state.selectedElementIds).toHaveLength(0);
    expect(state.ui.propertiesPanel.visible).toBe(false);
  });
});