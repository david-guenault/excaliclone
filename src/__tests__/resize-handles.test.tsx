// ABOUTME: Test for resize handle functionality
// ABOUTME: Verifies that resize handles can be detected and used to resize elements

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react';
import App from '../App';
import { useAppStore } from '../store';
import { findResizeHandle, getResizeHandles, applyResize } from '../utils/resizeHandles';

describe('Resize Handles', () => {
  beforeEach(() => {
    // Reset store state
    const store = useAppStore.getState();
    store.elements = [];
    store.selectedElementIds = [];
    store.activeTool = 'select';
  });

  describe('Handle Detection', () => {
    it('should detect resize handles for rectangles', () => {
      const rectangle = {
        id: 'rect1',
        type: 'rectangle' as const,
        x: 100,
        y: 100,
        width: 200,
        height: 100,
        angle: 0,
        strokeColor: '#000000',
        backgroundColor: 'transparent',
        strokeWidth: 2,
        strokeStyle: 'solid' as const,
        fillStyle: 'solid' as const,
        roughness: 1,
        opacity: 1,
      };

      const handles = getResizeHandles(rectangle);
      expect(handles).toHaveLength(4);
      
      const handleTypes = handles.map(h => h.type);
      expect(handleTypes).toContain('top-left');
      expect(handleTypes).toContain('top-right');
      expect(handleTypes).toContain('bottom-left');
      expect(handleTypes).toContain('bottom-right');
    });

    it('should detect resize handles for lines', () => {
      const line = {
        id: 'line1',
        type: 'line' as const,
        x: 100,
        y: 100,
        width: 200,
        height: 50,
        angle: 0,
        strokeColor: '#000000',
        backgroundColor: 'transparent',
        strokeWidth: 2,
        strokeStyle: 'solid' as const,
        fillStyle: 'solid' as const,
        roughness: 1,
        opacity: 1,
      };

      const handles = getResizeHandles(line);
      expect(handles).toHaveLength(2);
      
      const handleTypes = handles.map(h => h.type);
      expect(handleTypes).toContain('start-point');
      expect(handleTypes).toContain('end-point');
    });

    it('should find correct handle when point is over it', () => {
      const rectangle = {
        id: 'rect1',
        type: 'rectangle' as const,
        x: 100,
        y: 100,
        width: 200,
        height: 100,
        angle: 0,
        strokeColor: '#000000',
        backgroundColor: 'transparent',
        strokeWidth: 2,
        strokeStyle: 'solid' as const,
        fillStyle: 'solid' as const,
        roughness: 1,
        opacity: 1,
      };

      // Point at top-left corner
      const topLeftHandle = findResizeHandle({ x: 96, y: 96 }, rectangle);
      expect(topLeftHandle).toBe('top-left');

      // Point at bottom-right corner
      const bottomRightHandle = findResizeHandle({ x: 296, y: 196 }, rectangle);
      expect(bottomRightHandle).toBe('bottom-right');

      // Point in middle of element (no handle)
      const noHandle = findResizeHandle({ x: 200, y: 150 }, rectangle);
      expect(noHandle).toBeNull();
    });
  });

  describe('Resize Logic', () => {
    it('should resize rectangle from bottom-right handle', () => {
      const rectangle = {
        id: 'rect1',
        type: 'rectangle' as const,
        x: 100,
        y: 100,
        width: 200,
        height: 100,
        angle: 0,
        strokeColor: '#000000',
        backgroundColor: 'transparent',
        strokeWidth: 2,
        strokeStyle: 'solid' as const,
        fillStyle: 'solid' as const,
        roughness: 1,
        opacity: 1,
      };

      const startPoint = { x: 300, y: 200 }; // Bottom-right corner
      const currentPoint = { x: 350, y: 250 }; // Dragged 50px in each direction

      const updates = applyResize(rectangle, 'bottom-right', currentPoint, startPoint);
      
      expect(updates.width).toBe(250); // 200 + 50
      expect(updates.height).toBe(150); // 100 + 50
      expect(updates.x).toBeUndefined(); // Position shouldn't change
      expect(updates.y).toBeUndefined();
    });

    it('should resize rectangle from top-left handle', () => {
      const rectangle = {
        id: 'rect1',
        type: 'rectangle' as const,
        x: 100,
        y: 100,
        width: 200,
        height: 100,
        angle: 0,
        strokeColor: '#000000',
        backgroundColor: 'transparent',
        strokeWidth: 2,
        strokeStyle: 'solid' as const,
        fillStyle: 'solid' as const,
        roughness: 1,
        opacity: 1,
      };

      const startPoint = { x: 100, y: 100 }; // Top-left corner
      const currentPoint = { x: 120, y: 120 }; // Dragged 20px in each direction

      const updates = applyResize(rectangle, 'top-left', currentPoint, startPoint);
      
      expect(updates.x).toBe(120); // Position moves
      expect(updates.y).toBe(120);
      expect(updates.width).toBe(180); // Size decreases: 200 - 20
      expect(updates.height).toBe(80); // Size decreases: 100 - 20
    });

    it('should enforce minimum size', () => {
      const rectangle = {
        id: 'rect1',
        type: 'rectangle' as const,
        x: 100,
        y: 100,
        width: 50,
        height: 50,
        angle: 0,
        strokeColor: '#000000',
        backgroundColor: 'transparent',
        strokeWidth: 2,
        strokeStyle: 'solid' as const,
        fillStyle: 'solid' as const,
        roughness: 1,
        opacity: 1,
      };

      const startPoint = { x: 150, y: 150 }; // Bottom-right corner
      const currentPoint = { x: 90, y: 90 }; // Dragged way beyond minimum

      const updates = applyResize(rectangle, 'bottom-right', currentPoint, startPoint);
      
      expect(updates.width).toBe(10); // Minimum size enforced
      expect(updates.height).toBe(10);
    });

    it('should resize line endpoints', () => {
      const line = {
        id: 'line1',
        type: 'line' as const,
        x: 100,
        y: 100,
        width: 200,
        height: 50,
        angle: 0,
        strokeColor: '#000000',
        backgroundColor: 'transparent',
        strokeWidth: 2,
        strokeStyle: 'solid' as const,
        fillStyle: 'solid' as const,
        roughness: 1,
        opacity: 1,
      };

      const startPoint = { x: 100, y: 100 }; // Start point
      const currentPoint = { x: 80, y: 80 }; // Moved start point

      const updates = applyResize(line, 'start-point', currentPoint, startPoint);
      
      expect(updates.x).toBe(80); // Start point moves
      expect(updates.y).toBe(80);
      expect(updates.width).toBe(220); // Line gets longer: 200 + 20
      expect(updates.height).toBe(70); // Height increases: 50 + 20
    });
  });

  describe('Integration Test', () => {
    it('should resize rectangle when clicking and dragging handle', () => {
      render(<App />);
      
      let rectangleId: string;
      
      // Create and select a rectangle
      act(() => {
        const store = useAppStore.getState();
        const rectangle = store.addElement({
          type: 'rectangle',
          x: 100,
          y: 100,
          width: 200,
          height: 100,
          angle: 0,
          strokeColor: '#000000',
          backgroundColor: 'transparent',
          strokeWidth: 2,
          strokeStyle: 'solid',
          fillStyle: 'solid',
          roughness: 1,
          opacity: 1,
        });
        
        rectangleId = rectangle.id;
        store.selectElement(rectangle.id);
      });

      const canvas = screen.getByRole('img', { name: /canvas/i });

      // Simulate mouse down on bottom-right handle (300, 200 in world coordinates)
      act(() => {
        fireEvent.mouseDown(canvas, {
          clientX: 300,
          clientY: 200,
          button: 0,
        });
      });

      // Simulate mouse move to resize
      act(() => {
        fireEvent.mouseMove(canvas, {
          clientX: 350,
          clientY: 250,
        });
      });

      // Simulate mouse up to finish resize
      act(() => {
        fireEvent.mouseUp(canvas, {
          clientX: 350,
          clientY: 250,
        });
      });

      // Check that the element was resized
      const updatedElement = useAppStore.getState().elements.find(el => el.id === rectangleId);
      expect(updatedElement?.width).toBeGreaterThan(200); // Should be larger
      expect(updatedElement?.height).toBeGreaterThan(100); // Should be larger
    });
  });
});