// ABOUTME: Test suite for automatic selection of newly created elements
// ABOUTME: Verifies that elements are automatically selected after creation for better UX

import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '../store';
import type { Element } from '../types';

describe('Auto-Selection on Element Creation', () => {
  let store: ReturnType<typeof useAppStore>;

  beforeEach(() => {
    // Reset store state
    store = useAppStore.getState();
    store.clearSelection();
    // Clear all elements
    useAppStore.setState({ elements: [], selectedElementIds: [] });
  });

  describe('addElement Function', () => {
    it('should automatically select a newly created rectangle', () => {
      const initialState = useAppStore.getState();
      expect(initialState.selectedElementIds).toHaveLength(0);
      expect(initialState.ui.propertiesPanel.visible).toBe(false);

      // Create a rectangle
      const rectangleData = {
        type: 'rectangle' as const,
        x: 100,
        y: 100,
        width: 200,
        height: 100,
        angle: 0,
        strokeColor: '#000000',
        backgroundColor: 'transparent',
        strokeWidth: 2,
        roughness: 1,
        opacity: 1,
      };

      const createdElement = store.addElement(rectangleData);
      const newState = useAppStore.getState();

      // Verify element was created and automatically selected
      expect(newState.elements).toHaveLength(1);
      expect(newState.selectedElementIds).toHaveLength(1);
      expect(newState.selectedElementIds[0]).toBe(createdElement.id);
      expect(newState.ui.propertiesPanel.visible).toBe(true);
    });

    it('should automatically select a newly created circle', () => {
      const circleData = {
        type: 'circle' as const,
        x: 150,
        y: 150,
        width: 100,
        height: 100,
        angle: 0,
        strokeColor: '#ff0000',
        backgroundColor: '#ffcccc',
        strokeWidth: 3,
        roughness: 1,
        opacity: 0.8,
      };

      const createdElement = store.addElement(circleData);
      const newState = useAppStore.getState();

      expect(newState.selectedElementIds).toEqual([createdElement.id]);
      expect(newState.ui.propertiesPanel.visible).toBe(true);
    });

    it('should replace previous selection when creating new element', () => {
      // First, create and verify selection of first element
      const firstElement = store.addElement({
        type: 'rectangle' as const,
        x: 100, y: 100, width: 100, height: 100,
        angle: 0, strokeColor: '#000000', backgroundColor: 'transparent',
        strokeWidth: 2, roughness: 1, opacity: 1,
      });

      let state = useAppStore.getState();
      expect(state.selectedElementIds).toEqual([firstElement.id]);

      // Create second element
      const secondElement = store.addElement({
        type: 'circle' as const,
        x: 200, y: 200, width: 50, height: 50,
        angle: 0, strokeColor: '#ff0000', backgroundColor: 'transparent',
        strokeWidth: 1, roughness: 1, opacity: 1,
      });

      state = useAppStore.getState();
      
      // Should now only have second element selected
      expect(state.selectedElementIds).toEqual([secondElement.id]);
      expect(state.selectedElementIds).not.toContain(firstElement.id);
      expect(state.ui.propertiesPanel.visible).toBe(true);
    });

    it('should work for all element types', () => {
      const elementTypes = [
        { type: 'rectangle' as const },
        { type: 'circle' as const },
        { type: 'diamond' as const },
        { type: 'line' as const },
        { type: 'arrow' as const },
        { type: 'text' as const },
      ];

      elementTypes.forEach((elementType, index) => {
        const elementData = {
          ...elementType,
          x: index * 50,
          y: index * 50,
          width: 50,
          height: 50,
          angle: 0,
          strokeColor: '#000000',
          backgroundColor: 'transparent',
          strokeWidth: 2,
          roughness: 1,
          opacity: 1,
        };

        const createdElement = store.addElement(elementData);
        const state = useAppStore.getState();

        expect(state.selectedElementIds).toEqual([createdElement.id]);
        expect(state.ui.propertiesPanel.visible).toBe(true);
      });
    });
  });

  describe('addElementSilent Function', () => {
    it('should NOT automatically select element when using addElementSilent', () => {
      const initialState = useAppStore.getState();
      expect(initialState.selectedElementIds).toHaveLength(0);

      // Create element silently (for batch operations, undo/redo, etc.)
      const elementData = {
        type: 'rectangle' as const,
        x: 100, y: 100, width: 100, height: 100,
        angle: 0, strokeColor: '#000000', backgroundColor: 'transparent',
        strokeWidth: 2, roughness: 1, opacity: 1,
      };

      store.addElementSilent(elementData);
      const newState = useAppStore.getState();

      // Element should be created but NOT selected
      expect(newState.elements).toHaveLength(1);
      expect(newState.selectedElementIds).toHaveLength(0);
      // Properties panel should remain hidden
      expect(newState.ui.propertiesPanel.visible).toBe(false);
    });
  });

  describe('User Experience Flow', () => {
    it('should provide smooth workflow: create -> automatically selected -> ready for editing', () => {
      // User creates a rectangle
      const rectangleData = {
        type: 'rectangle' as const,
        x: 100, y: 100, width: 200, height: 100,
        angle: 0, strokeColor: '#000000', backgroundColor: 'transparent',
        strokeWidth: 2, roughness: 1, opacity: 1,
      };

      const createdElement = store.addElement(rectangleData);
      
      // Step 1: Element is created and automatically selected
      let state = useAppStore.getState();
      expect(state.selectedElementIds).toEqual([createdElement.id]);
      expect(state.ui.propertiesPanel.visible).toBe(true);

      // Step 2: User can immediately modify properties without additional clicks
      store.updateElement(createdElement.id, { strokeColor: '#ff0000' });
      
      state = useAppStore.getState();
      const updatedElement = state.elements.find(el => el.id === createdElement.id);
      expect(updatedElement?.strokeColor).toBe('#ff0000');
      
      // Element should still be selected
      expect(state.selectedElementIds).toEqual([createdElement.id]);

      // Step 3: User creates another element
      const circleData = {
        type: 'circle' as const,
        x: 300, y: 300, width: 100, height: 100,
        angle: 0, strokeColor: '#00ff00', backgroundColor: 'transparent',
        strokeWidth: 2, roughness: 1, opacity: 1,
      };

      const secondElement = store.addElement(circleData);

      // New element becomes selected, ready for immediate editing
      state = useAppStore.getState();
      expect(state.selectedElementIds).toEqual([secondElement.id]);
      expect(state.ui.propertiesPanel.visible).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid element creation correctly', () => {
      const elements = [];
      
      // Create multiple elements rapidly
      for (let i = 0; i < 5; i++) {
        const element = store.addElement({
          type: 'rectangle' as const,
          x: i * 50, y: i * 50, width: 50, height: 50,
          angle: 0, strokeColor: '#000000', backgroundColor: 'transparent',
          strokeWidth: 2, roughness: 1, opacity: 1,
        });
        elements.push(element);
      }

      const state = useAppStore.getState();
      
      // Should have all elements created
      expect(state.elements).toHaveLength(5);
      
      // Only the last element should be selected
      expect(state.selectedElementIds).toHaveLength(1);
      expect(state.selectedElementIds[0]).toBe(elements[4].id);
      expect(state.ui.propertiesPanel.visible).toBe(true);
    });

    it('should handle auto-selection consistently', () => {
      // Start with clean state
      const initialState = useAppStore.getState();
      const initialElementCount = initialState.elements.length;
      
      // Create an element (auto-selected)
      const element1 = store.addElement({
        type: 'rectangle' as const,
        x: 100, y: 100, width: 100, height: 100,
        angle: 0, strokeColor: '#000000', backgroundColor: 'transparent',
        strokeWidth: 2, roughness: 1, opacity: 1,
      });

      let state = useAppStore.getState();
      expect(state.selectedElementIds).toEqual([element1.id]);
      expect(state.elements).toHaveLength(initialElementCount + 1);
      
      // Create another element, should replace selection
      const element2 = store.addElement({
        type: 'circle' as const,
        x: 200, y: 200, width: 100, height: 100,
        angle: 0, strokeColor: '#ff0000', backgroundColor: 'transparent',
        strokeWidth: 2, roughness: 1, opacity: 1,
      });

      state = useAppStore.getState();
      expect(state.selectedElementIds).toEqual([element2.id]);
      expect(state.elements).toHaveLength(initialElementCount + 2);
      expect(state.ui.propertiesPanel.visible).toBe(true);
    });
  });
});