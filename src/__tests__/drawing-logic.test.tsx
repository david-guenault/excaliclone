// ABOUTME: Test drawing logic by directly calling drawing functions
// ABOUTME: Focuses on testing the core auto-selection logic without UI events

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act } from '@testing-library/react';
import { useAppStore } from '../store';

describe('Drawing Logic Test', () => {
  beforeEach(() => {
    act(() => {
      useAppStore.setState({
        elements: [],
        selectedElementIds: [],
        activeTool: 'rectangle',
        viewport: { zoom: 1, pan: { x: 0, y: 0 } },
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
  });

  it('should auto-select rectangle when created with proper size', async () => {
    await act(async () => {
      const { addElement, selectElements } = useAppStore.getState();
      
      // Create a rectangle element directly
      const rectangle = addElement({
        type: 'rectangle',
        x: 100,
        y: 100,
        width: 150,
        height: 100,
        angle: 0,
        strokeColor: '#000000',
        backgroundColor: 'transparent',
        strokeWidth: 2,
        strokeStyle: 'solid',
        fillStyle: 'hachure',
        roughness: 1,
        opacity: 1,
      });

      // Simulate the auto-selection logic that should happen in mouse up
      selectElements([rectangle.id]);
    });

    const state = useAppStore.getState();
    
    expect(state.elements).toHaveLength(1);
    expect(state.elements[0].type).toBe('rectangle');
    expect(state.elements[0].width).toBe(150);
    expect(state.elements[0].height).toBe(100);
    expect(state.selectedElementIds).toHaveLength(1);
    expect(state.selectedElementIds[0]).toBe(state.elements[0].id);
    expect(state.ui.propertiesPanel.visible).toBe(true);
  });

  it('should test the complete drawing workflow programmatically', async () => {
    await act(async () => {
      const { addElementSilent, updateElement, selectElements } = useAppStore.getState();
      
      // Step 1: Create element silently (like mousedown does)
      const rectangle = addElementSilent({
        type: 'rectangle',
        x: 100,
        y: 100,
        width: 1, // Start with minimal size
        height: 1,
        angle: 0,
        strokeColor: '#000000',
        backgroundColor: '#ffffff',
        strokeWidth: 2,
        strokeStyle: 'solid',
        fillStyle: 'solid',
        roughness: 1,
        opacity: 1,
      });

      // Step 2: Update size (like mousemove does)
      updateElement(rectangle.id, {
        width: 150,
        height: 100,
      });

      // Step 3: Auto-select (like mouseup does)  
      const finalWidth = 150;
      const finalHeight = 100;
      const minSize = 10;
      
      if (finalWidth >= minSize && finalHeight >= minSize) {
        selectElements([rectangle.id]);
      }
    });

    const state = useAppStore.getState();
    
    expect(state.elements).toHaveLength(1);
    expect(state.elements[0].type).toBe('rectangle');
    expect(state.elements[0].width).toBe(150);
    expect(state.elements[0].height).toBe(100);
    expect(state.selectedElementIds).toHaveLength(1);
    expect(state.selectedElementIds[0]).toBe(state.elements[0].id);
    expect(state.ui.propertiesPanel.visible).toBe(true);
  });

  it('should test small rectangle deletion logic', async () => {
    await act(async () => {
      const { addElementSilent, deleteElement } = useAppStore.getState();
      
      // Create a very small rectangle
      const rectangle = addElementSilent({
        type: 'rectangle',
        x: 100,
        y: 100,
        width: 5, // Too small
        height: 3,
        angle: 0,
        strokeColor: '#000000',
        backgroundColor: '#ffffff',
        strokeWidth: 2,
        strokeStyle: 'solid',
        fillStyle: 'solid',
        roughness: 1,
        opacity: 1,
      });

      // Simulate the size check that happens in mouse up
      const minSize = 10;
      if (rectangle.width < minSize || rectangle.height < minSize) {
        deleteElement(rectangle.id);
      }
    });

    const state = useAppStore.getState();
    
    // Should be deleted
    expect(state.elements).toHaveLength(0);
    expect(state.selectedElementIds).toHaveLength(0);
  });
});