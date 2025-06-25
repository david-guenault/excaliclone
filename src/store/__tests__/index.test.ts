// ABOUTME: Tests for Zustand store - element management and application state
// ABOUTME: Comprehensive test coverage for all store actions and state management

import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '../index';
import type { Element, ToolType } from '../../types';

describe('Zustand Store', () => {
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

  describe('Initial State', () => {
    it('has correct default viewport settings', () => {
      const state = useAppStore.getState();
      expect(state.viewport).toEqual({
        zoom: 1,
        pan: { x: 0, y: 0 },
        bounds: { x: 0, y: 0, width: 800, height: 600 },
      });
    });

    it('starts with empty elements array', () => {
      const state = useAppStore.getState();
      expect(state.elements).toEqual([]);
    });

    it('has correct default tool selection', () => {
      const state = useAppStore.getState();
      expect(state.activeTool).toBe('select');
      expect(state.toolOptions).toEqual({
        strokeColor: '#000000',
        backgroundColor: 'transparent',
        strokeWidth: 2,
        roughness: 1,
        opacity: 1,
      });
    });

    it('history initialized correctly', () => {
      const state = useAppStore.getState();
      expect(state.history).toEqual([[]]);
      expect(state.historyIndex).toBe(0);
    });
  });

  describe('addElement', () => {
    const mockElement = {
      type: 'rectangle' as const,
      x: 10,
      y: 20,
      width: 100,
      height: 50,
      angle: 0,
      strokeColor: '#ff0000',
      backgroundColor: 'transparent',
      strokeWidth: 2,
      roughness: 1,
      opacity: 1,
    };

    it('adds element to elements array', () => {
      const { addElement } = useAppStore.getState();
      addElement(mockElement);
      
      const state = useAppStore.getState();
      expect(state.elements).toHaveLength(1);
      expect(state.elements[0]).toMatchObject(mockElement);
    });

    it('generates unique ID for element', () => {
      const { addElement } = useAppStore.getState();
      addElement(mockElement);
      addElement(mockElement);
      
      const state = useAppStore.getState();
      expect(state.elements).toHaveLength(2);
      expect(state.elements[0].id).toBeDefined();
      expect(state.elements[1].id).toBeDefined();
      expect(state.elements[0].id).not.toBe(state.elements[1].id);
    });

    it('updates history correctly', () => {
      const { addElement } = useAppStore.getState();
      addElement(mockElement);
      
      const state = useAppStore.getState();
      expect(state.history).toHaveLength(2);
      expect(state.history[1]).toHaveLength(1);
      expect(state.historyIndex).toBe(1);
    });

    it('preserves existing elements', () => {
      const { addElement } = useAppStore.getState();
      addElement(mockElement);
      addElement({ ...mockElement, x: 50 });
      
      const state = useAppStore.getState();
      expect(state.elements).toHaveLength(2);
      expect(state.elements[0].x).toBe(10);
      expect(state.elements[1].x).toBe(50);
    });
  });

  describe('updateElement', () => {
    let elementId: string;

    beforeEach(() => {
      const { addElement } = useAppStore.getState();
      addElement({
        type: 'rectangle',
        x: 10,
        y: 20,
        width: 100,
        height: 50,
        angle: 0,
        strokeColor: '#000000',
        backgroundColor: 'transparent',
        strokeWidth: 2,
        roughness: 1,
        opacity: 1,
      });
      elementId = useAppStore.getState().elements[0].id;
    });

    it('updates existing element by ID', () => {
      const { updateElement } = useAppStore.getState();
      updateElement(elementId, { x: 50, strokeColor: '#ff0000' });
      
      const state = useAppStore.getState();
      const element = state.elements[0];
      expect(element.x).toBe(50);
      expect(element.strokeColor).toBe('#ff0000');
    });

    it('leaves other elements unchanged', () => {
      const { addElement, updateElement } = useAppStore.getState();
      addElement({
        type: 'circle',
        x: 100,
        y: 100,
        width: 80,
        height: 80,
        angle: 0,
        strokeColor: '#00ff00',
        backgroundColor: 'transparent',
        strokeWidth: 3,
        roughness: 1,
        opacity: 1,
      });
      
      const secondElementId = useAppStore.getState().elements[1].id;
      updateElement(elementId, { x: 50 });
      
      const state = useAppStore.getState();
      expect(state.elements[0].x).toBe(50);
      expect(state.elements[1].x).toBe(100); // unchanged
    });

    it('handles non-existent ID gracefully', () => {
      const { updateElement } = useAppStore.getState();
      const initialState = useAppStore.getState();
      
      updateElement('non-existent-id', { x: 999 });
      
      const finalState = useAppStore.getState();
      expect(finalState.elements).toEqual(initialState.elements);
    });

    it('updates only provided properties', () => {
      const { updateElement } = useAppStore.getState();
      const originalElement = useAppStore.getState().elements[0];
      
      updateElement(elementId, { x: 50 });
      
      const updatedElement = useAppStore.getState().elements[0];
      expect(updatedElement.x).toBe(50);
      expect(updatedElement.y).toBe(originalElement.y);
      expect(updatedElement.width).toBe(originalElement.width);
      expect(updatedElement.strokeColor).toBe(originalElement.strokeColor);
    });
  });

  describe('deleteElement', () => {
    let elementId: string;

    beforeEach(() => {
      const { addElement } = useAppStore.getState();
      addElement({
        type: 'rectangle',
        x: 10,
        y: 20,
        width: 100,
        height: 50,
        angle: 0,
        strokeColor: '#000000',
        backgroundColor: 'transparent',
        strokeWidth: 2,
        roughness: 1,
        opacity: 1,
      });
      elementId = useAppStore.getState().elements[0].id;
    });

    it('removes element from elements array', () => {
      const { deleteElement } = useAppStore.getState();
      deleteElement(elementId);
      
      const state = useAppStore.getState();
      expect(state.elements).toHaveLength(0);
    });

    it('updates history correctly', () => {
      const { deleteElement } = useAppStore.getState();
      deleteElement(elementId);
      
      const state = useAppStore.getState();
      expect(state.history).toHaveLength(3); // initial, add, delete
      expect(state.history[2]).toHaveLength(0);
      expect(state.historyIndex).toBe(2);
    });

    it('removes from selectedElementIds if selected', () => {
      const { selectElement, deleteElement } = useAppStore.getState();
      selectElement(elementId);
      
      expect(useAppStore.getState().selectedElementIds).toContain(elementId);
      
      deleteElement(elementId);
      
      const state = useAppStore.getState();
      expect(state.selectedElementIds).not.toContain(elementId);
    });

    it('handles non-existent ID gracefully', () => {
      const { deleteElement } = useAppStore.getState();
      const initialState = useAppStore.getState();
      
      deleteElement('non-existent-id');
      
      const finalState = useAppStore.getState();
      expect(finalState.elements).toEqual(initialState.elements);
    });
  });

  describe('selectElement and clearSelection', () => {
    let elementId: string;

    beforeEach(() => {
      const { addElement } = useAppStore.getState();
      addElement({
        type: 'rectangle',
        x: 10,
        y: 20,
        width: 100,
        height: 50,
        angle: 0,
        strokeColor: '#000000',
        backgroundColor: 'transparent',
        strokeWidth: 2,
        roughness: 1,
        opacity: 1,
      });
      elementId = useAppStore.getState().elements[0].id;
    });

    it('selectElement sets selectedElementIds to single element', () => {
      const { selectElement } = useAppStore.getState();
      selectElement(elementId);
      
      const state = useAppStore.getState();
      expect(state.selectedElementIds).toEqual([elementId]);
    });

    it('clearSelection empties selectedElementIds', () => {
      const { selectElement, clearSelection } = useAppStore.getState();
      selectElement(elementId);
      clearSelection();
      
      const state = useAppStore.getState();
      expect(state.selectedElementIds).toEqual([]);
    });

    it('selectElement replaces previous selection', () => {
      const { addElement, selectElement } = useAppStore.getState();
      addElement({
        type: 'circle',
        x: 100,
        y: 100,
        width: 80,
        height: 80,
        angle: 0,
        strokeColor: '#000000',
        backgroundColor: 'transparent',
        strokeWidth: 2,
        roughness: 1,
        opacity: 1,
      });
      
      const secondElementId = useAppStore.getState().elements[1].id;
      
      selectElement(elementId);
      expect(useAppStore.getState().selectedElementIds).toEqual([elementId]);
      
      selectElement(secondElementId);
      expect(useAppStore.getState().selectedElementIds).toEqual([secondElementId]);
    });
  });

  describe('setActiveTool', () => {
    it('updates activeTool state', () => {
      const { setActiveTool } = useAppStore.getState();
      setActiveTool('rectangle');
      
      const state = useAppStore.getState();
      expect(state.activeTool).toBe('rectangle');
    });

    it('accepts all valid ToolType values', () => {
      const { setActiveTool } = useAppStore.getState();
      const validTools: ToolType[] = ['select', 'rectangle', 'circle', 'line', 'arrow', 'text', 'pen', 'move', 'resize'];
      
      validTools.forEach(tool => {
        setActiveTool(tool);
        expect(useAppStore.getState().activeTool).toBe(tool);
      });
    });

    it('previous tool state is replaced', () => {
      const { setActiveTool } = useAppStore.getState();
      setActiveTool('rectangle');
      setActiveTool('circle');
      
      const state = useAppStore.getState();
      expect(state.activeTool).toBe('circle');
    });
  });

  describe('setZoom', () => {
    it('updates viewport zoom value', () => {
      const { setZoom } = useAppStore.getState();
      setZoom(2.5);
      
      const state = useAppStore.getState();
      expect(state.viewport.zoom).toBe(2.5);
    });

    it('preserves other viewport properties', () => {
      const { setZoom } = useAppStore.getState();
      const originalPan = useAppStore.getState().viewport.pan;
      const originalBounds = useAppStore.getState().viewport.bounds;
      
      setZoom(1.5);
      
      const state = useAppStore.getState();
      expect(state.viewport.pan).toEqual(originalPan);
      expect(state.viewport.bounds).toEqual(originalBounds);
    });

    it('handles edge cases with very small/large zoom values', () => {
      const { setZoom } = useAppStore.getState();
      
      setZoom(0.001);
      expect(useAppStore.getState().viewport.zoom).toBe(0.001);
      
      setZoom(1000);
      expect(useAppStore.getState().viewport.zoom).toBe(1000);
    });
  });

  describe('setPan', () => {
    it('updates viewport pan coordinates', () => {
      const { setPan } = useAppStore.getState();
      const newPan = { x: 100, y: 200 };
      setPan(newPan);
      
      const state = useAppStore.getState();
      expect(state.viewport.pan).toEqual(newPan);
    });

    it('preserves other viewport properties', () => {
      const { setPan } = useAppStore.getState();
      const originalZoom = useAppStore.getState().viewport.zoom;
      const originalBounds = useAppStore.getState().viewport.bounds;
      
      setPan({ x: 50, y: 75 });
      
      const state = useAppStore.getState();
      expect(state.viewport.zoom).toBe(originalZoom);
      expect(state.viewport.bounds).toEqual(originalBounds);
    });

    it('handles negative coordinates', () => {
      const { setPan } = useAppStore.getState();
      const negativePan = { x: -100, y: -200 };
      setPan(negativePan);
      
      const state = useAppStore.getState();
      expect(state.viewport.pan).toEqual(negativePan);
    });
  });

  describe('undo', () => {
    it('reverts to previous history state', () => {
      const { addElement, undo } = useAppStore.getState();
      
      // Add an element
      addElement({
        type: 'rectangle',
        x: 10,
        y: 20,
        width: 100,
        height: 50,
        angle: 0,
        strokeColor: '#000000',
        backgroundColor: 'transparent',
        strokeWidth: 2,
        roughness: 1,
        opacity: 1,
      });
      
      expect(useAppStore.getState().elements).toHaveLength(1);
      
      undo();
      
      const state = useAppStore.getState();
      expect(state.elements).toHaveLength(0);
    });

    it('decrements historyIndex', () => {
      const { addElement, undo } = useAppStore.getState();
      
      addElement({
        type: 'rectangle',
        x: 10,
        y: 20,
        width: 100,
        height: 50,
        angle: 0,
        strokeColor: '#000000',
        backgroundColor: 'transparent',
        strokeWidth: 2,
        roughness: 1,
        opacity: 1,
      });
      
      expect(useAppStore.getState().historyIndex).toBe(1);
      
      undo();
      
      expect(useAppStore.getState().historyIndex).toBe(0);
    });

    it('clears selection', () => {
      const { addElement, selectElement, undo } = useAppStore.getState();
      
      addElement({
        type: 'rectangle',
        x: 10,
        y: 20,
        width: 100,
        height: 50,
        angle: 0,
        strokeColor: '#000000',
        backgroundColor: 'transparent',
        strokeWidth: 2,
        roughness: 1,
        opacity: 1,
      });
      
      const elementId = useAppStore.getState().elements[0].id;
      selectElement(elementId);
      
      expect(useAppStore.getState().selectedElementIds).toHaveLength(1);
      
      undo();
      
      expect(useAppStore.getState().selectedElementIds).toHaveLength(0);
    });

    it('does nothing when at beginning of history', () => {
      const { undo } = useAppStore.getState();
      const initialState = useAppStore.getState();
      
      undo();
      
      const finalState = useAppStore.getState();
      expect(finalState.historyIndex).toBe(initialState.historyIndex);
      expect(finalState.elements).toEqual(initialState.elements);
    });
  });

  describe('redo', () => {
    it('advances to next history state', () => {
      const { addElement, undo, redo } = useAppStore.getState();
      
      // Add element, then undo, then redo
      addElement({
        type: 'rectangle',
        x: 10,
        y: 20,
        width: 100,
        height: 50,
        angle: 0,
        strokeColor: '#000000',
        backgroundColor: 'transparent',
        strokeWidth: 2,
        roughness: 1,
        opacity: 1,
      });
      
      undo();
      expect(useAppStore.getState().elements).toHaveLength(0);
      
      redo();
      expect(useAppStore.getState().elements).toHaveLength(1);
    });

    it('increments historyIndex', () => {
      const { addElement, undo, redo } = useAppStore.getState();
      
      addElement({
        type: 'rectangle',
        x: 10,
        y: 20,
        width: 100,
        height: 50,
        angle: 0,
        strokeColor: '#000000',
        backgroundColor: 'transparent',
        strokeWidth: 2,
        roughness: 1,
        opacity: 1,
      });
      
      undo();
      expect(useAppStore.getState().historyIndex).toBe(0);
      
      redo();
      expect(useAppStore.getState().historyIndex).toBe(1);
    });

    it('clears selection', () => {
      const { addElement, selectElement, undo, redo } = useAppStore.getState();
      
      addElement({
        type: 'rectangle',
        x: 10,
        y: 20,
        width: 100,
        height: 50,
        angle: 0,
        strokeColor: '#000000',
        backgroundColor: 'transparent',
        strokeWidth: 2,
        roughness: 1,
        opacity: 1,
      });
      
      const elementId = useAppStore.getState().elements[0].id;
      selectElement(elementId);
      undo();
      
      // Select something else
      useAppStore.setState({ selectedElementIds: ['some-other-id'] });
      
      redo();
      expect(useAppStore.getState().selectedElementIds).toHaveLength(0);
    });

    it('does nothing when at end of history', () => {
      const { addElement, redo } = useAppStore.getState();
      
      addElement({
        type: 'rectangle',
        x: 10,
        y: 20,
        width: 100,
        height: 50,
        angle: 0,
        strokeColor: '#000000',
        backgroundColor: 'transparent',
        strokeWidth: 2,
        roughness: 1,
        opacity: 1,
      });
      
      const stateBeforeRedo = useAppStore.getState();
      redo();
      const stateAfterRedo = useAppStore.getState();
      
      expect(stateAfterRedo.historyIndex).toBe(stateBeforeRedo.historyIndex);
      expect(stateAfterRedo.elements).toEqual(stateBeforeRedo.elements);
    });

    it('updates elements array correctly', () => {
      const { addElement, undo, redo } = useAppStore.getState();
      
      const element1 = {
        type: 'rectangle' as const,
        x: 10,
        y: 20,
        width: 100,
        height: 50,
        angle: 0,
        strokeColor: '#000000',
        backgroundColor: 'transparent',
        strokeWidth: 2,
        roughness: 1,
        opacity: 1,
      };
      
      const element2 = {
        type: 'circle' as const,
        x: 100,
        y: 100,
        width: 80,
        height: 80,
        angle: 0,
        strokeColor: '#ff0000',
        backgroundColor: 'transparent',
        strokeWidth: 3,
        roughness: 1,
        opacity: 1,
      };
      
      addElement(element1);
      addElement(element2);
      
      expect(useAppStore.getState().elements).toHaveLength(2);
      
      undo(); // Should have 1 element
      expect(useAppStore.getState().elements).toHaveLength(1);
      
      redo(); // Should have 2 elements again
      const finalState = useAppStore.getState();
      expect(finalState.elements).toHaveLength(2);
      expect(finalState.elements[0]).toMatchObject(element1);
      expect(finalState.elements[1]).toMatchObject(element2);
    });
  });
});