// ABOUTME: Test suite for rotation controls functionality  
// ABOUTME: Verifies rotation handle detection, interaction, and visual feedback

import { describe, it, expect, vi } from 'vitest';
import { getResizeHandles, findResizeHandle, applyRotation, getResizeCursor } from '../utils/resizeHandles';
import type { Element, Point } from '../types';

describe('Rotation Controls', () => {
  const mockElement: Element = {
    id: 'test-element',
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
  };

  describe('Rotation Handle Generation', () => {
    it('should include rotation handle for rectangle elements', () => {
      const handles = getResizeHandles(mockElement);
      const rotationHandle = handles.find(h => h.type === 'rotation');
      
      expect(rotationHandle).toBeDefined();
      expect(rotationHandle?.type).toBe('rotation');
      // Should be positioned above the element center
      expect(rotationHandle?.x).toBe(mockElement.x + mockElement.width / 2 - 4); // halfHandle = 4
      expect(rotationHandle?.y).toBe(mockElement.y - 20 - 4); // rotationDistance = 20
    });

    it('should include rotation handle for circle elements', () => {
      const circleElement = { ...mockElement, type: 'circle' as const };
      const handles = getResizeHandles(circleElement);
      const rotationHandle = handles.find(h => h.type === 'rotation');
      
      expect(rotationHandle).toBeDefined();
      expect(rotationHandle?.type).toBe('rotation');
    });

    it('should include rotation handle for text elements', () => {
      const textElement = { ...mockElement, type: 'text' as const };
      const handles = getResizeHandles(textElement);
      const rotationHandle = handles.find(h => h.type === 'rotation');
      
      expect(rotationHandle).toBeDefined();
      expect(rotationHandle?.type).toBe('rotation');
    });

    it('should include rotation handle for line elements', () => {
      const lineElement = { ...mockElement, type: 'line' as const };
      const handles = getResizeHandles(lineElement);
      const rotationHandle = handles.find(h => h.type === 'rotation');
      
      expect(rotationHandle).toBeDefined();
      expect(rotationHandle?.type).toBe('rotation');
      // Should be positioned perpendicular to the line
    });

    it('should include rotation handle for arrow elements', () => {
      const arrowElement = { ...mockElement, type: 'arrow' as const };
      const handles = getResizeHandles(arrowElement);
      const rotationHandle = handles.find(h => h.type === 'rotation');
      
      expect(rotationHandle).toBeDefined();
      expect(rotationHandle?.type).toBe('rotation');
    });
  });

  describe('Rotation Handle Detection', () => {
    it('should detect click on rotation handle', () => {
      // Position above the element center where rotation handle should be
      const clickPoint: Point = { 
        x: mockElement.x + mockElement.width / 2, 
        y: mockElement.y - 20 
      };
      
      const handleType = findResizeHandle(clickPoint, mockElement);
      expect(handleType).toBe('rotation');
    });

    it('should not detect rotation handle when clicking far away', () => {
      const clickPoint: Point = { 
        x: mockElement.x + mockElement.width / 2, 
        y: mockElement.y - 50 // Too far above
      };
      
      const handleType = findResizeHandle(clickPoint, mockElement);
      expect(handleType).toBeNull();
    });

    it('should prefer rotation handle over resize handles when overlapping', () => {
      // Click near rotation handle position
      const clickPoint: Point = { 
        x: mockElement.x + mockElement.width / 2, 
        y: mockElement.y - 18 
      };
      
      const handleType = findResizeHandle(clickPoint, mockElement);
      expect(handleType).toBe('rotation');
    });
  });

  describe('Rotation Cursor', () => {
    it('should return grab cursor for rotation handle', () => {
      const cursor = getResizeCursor('rotation');
      expect(cursor).toBe('grab');
    });

    it('should return appropriate cursors for other handles', () => {
      expect(getResizeCursor('top-left')).toBe('nw-resize');
      expect(getResizeCursor('bottom-right')).toBe('nw-resize');
      expect(getResizeCursor('top-right')).toBe('ne-resize');
      expect(getResizeCursor('bottom-left')).toBe('ne-resize');
    });
  });

  describe('Rotation Application', () => {
    it('should calculate rotation angle from mouse position', () => {
      const centerPoint: Point = { 
        x: mockElement.x + mockElement.width / 2, 
        y: mockElement.y + mockElement.height / 2 
      };
      
      // Mouse directly to the right of center (0 degrees)
      const mousePoint: Point = { 
        x: centerPoint.x + 50, 
        y: centerPoint.y 
      };
      
      const rotationUpdate = applyRotation(mockElement, mousePoint);
      expect(rotationUpdate.angle).toBe(0); // 0 degrees in radians
    });

    it('should snap rotation to 15-degree increments', () => {
      const centerPoint: Point = { 
        x: mockElement.x + mockElement.width / 2, 
        y: mockElement.y + mockElement.height / 2 
      };
      
      // Mouse at approximately 20 degrees (should snap to 15)
      const angle20Deg = (20 * Math.PI) / 180;
      const mousePoint: Point = { 
        x: centerPoint.x + Math.cos(angle20Deg) * 50, 
        y: centerPoint.y + Math.sin(angle20Deg) * 50 
      };
      
      const rotationUpdate = applyRotation(mockElement, mousePoint);
      const expectedAngle = (15 * Math.PI) / 180; // 15 degrees in radians
      expect(rotationUpdate.angle).toBeCloseTo(expectedAngle, 5);
    });

    it('should handle negative angles correctly', () => {
      const centerPoint: Point = { 
        x: mockElement.x + mockElement.width / 2, 
        y: mockElement.y + mockElement.height / 2 
      };
      
      // Mouse above center (-90 degrees)
      const mousePoint: Point = { 
        x: centerPoint.x, 
        y: centerPoint.y - 50 
      };
      
      const rotationUpdate = applyRotation(mockElement, mousePoint);
      const expectedAngle = (-90 * Math.PI) / 180; // -90 degrees in radians
      expect(rotationUpdate.angle).toBeCloseTo(expectedAngle, 5);
    });

    it('should use element center when no center point provided', () => {
      const mousePoint: Point = { 
        x: mockElement.x + mockElement.width / 2 + 50, 
        y: mockElement.y + mockElement.height / 2 
      };
      
      const rotationUpdate = applyRotation(mockElement, mousePoint);
      expect(rotationUpdate.angle).toBe(0); // Should use element center
    });
  });

  describe('Edge Cases', () => {
    it('should handle elements with zero width or height', () => {
      const zeroSizeElement = { ...mockElement, width: 0, height: 0 };
      const handles = getResizeHandles(zeroSizeElement);
      const rotationHandle = handles.find(h => h.type === 'rotation');
      
      expect(rotationHandle).toBeDefined();
      // Should not crash and should provide valid coordinates
    });

    it('should handle very small elements', () => {
      const smallElement = { ...mockElement, width: 5, height: 5 };
      const handles = getResizeHandles(smallElement);
      const rotationHandle = handles.find(h => h.type === 'rotation');
      
      expect(rotationHandle).toBeDefined();
      expect(rotationHandle?.size).toBe(8); // Should maintain minimum handle size
    });

    it('should handle rotated elements', () => {
      const rotatedElement = { ...mockElement, angle: Math.PI / 4 }; // 45 degrees
      const mousePoint: Point = { 
        x: rotatedElement.x + rotatedElement.width / 2 + 50, 
        y: rotatedElement.y + rotatedElement.height / 2 
      };
      
      const rotationUpdate = applyRotation(rotatedElement, mousePoint);
      expect(typeof rotationUpdate.angle).toBe('number');
      expect(rotationUpdate.angle).not.toBeNaN();
    });
  });
});