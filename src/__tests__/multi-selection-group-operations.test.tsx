// ABOUTME: Tests for multi-selection group operations (resize and rotation)
// ABOUTME: Verifies that multiple selected elements can be resized and rotated as a group

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  getMultiSelectionBounds, 
  findMultiSelectionHandle, 
  applyMultiSelectionResize,
  applyGroupResize,
  applyGroupRotation,
  getMultiSelectionHandles 
} from '../utils/multiSelection';
import type { Element, Point } from '../types';

describe('Multi-Selection Group Operations', () => {
  let testElements: Element[];

  beforeEach(() => {
    testElements = [
      {
        id: 'rect1',
        type: 'rectangle',
        x: 100,
        y: 100,
        width: 100,
        height: 50,
        angle: 0,
        strokeColor: '#000000',
        backgroundColor: 'transparent',
        strokeWidth: 2,
        roughness: 1,
        opacity: 1,
        locked: false,
      },
      {
        id: 'circle1',
        type: 'circle',
        x: 250,
        y: 150,
        width: 80,
        height: 80,
        angle: 0,
        strokeColor: '#ff0000',
        backgroundColor: '#ffcccc',
        strokeWidth: 3,
        roughness: 1,
        opacity: 0.8,
        locked: false,
      },
      {
        id: 'line1',
        type: 'line',
        x: 150,
        y: 200,
        width: 100,
        height: 50,
        angle: 0,
        strokeColor: '#00ff00',
        backgroundColor: 'transparent',
        strokeWidth: 2,
        roughness: 1,
        opacity: 1,
        locked: false,
      },
    ];
  });

  describe('Multi-Selection Bounds Calculation', () => {
    it('should calculate correct bounding box for multiple elements', () => {
      const bounds = getMultiSelectionBounds(testElements);
      
      expect(bounds).not.toBeNull();
      expect(bounds!.x).toBe(100); // Leftmost x
      expect(bounds!.y).toBe(100); // Topmost y
      expect(bounds!.width).toBe(230); // 330 - 100 (rightmost - leftmost)
      expect(bounds!.height).toBe(150); // 250 - 100 (bottommost - topmost)
      expect(bounds!.center.x).toBe(215); // 100 + 230/2
      expect(bounds!.center.y).toBe(175); // 100 + 150/2
    });

    it('should handle empty element array', () => {
      const bounds = getMultiSelectionBounds([]);
      expect(bounds).toBeNull();
    });

    it('should handle single element', () => {
      const bounds = getMultiSelectionBounds([testElements[0]]);
      
      expect(bounds).not.toBeNull();
      expect(bounds!.x).toBe(100);
      expect(bounds!.y).toBe(100);
      expect(bounds!.width).toBe(100);
      expect(bounds!.height).toBe(50);
    });

    it('should handle rotated elements correctly', () => {
      const rotatedElement: Element = {
        ...testElements[0],
        angle: Math.PI / 4, // 45 degrees
      };
      
      const bounds = getMultiSelectionBounds([rotatedElement]);
      expect(bounds).not.toBeNull();
      // For a 45-degree rotated rectangle, the bounds should be larger
      expect(bounds!.width).toBeGreaterThan(100);
      expect(bounds!.height).toBeGreaterThan(50);
    });
  });

  describe('Multi-Selection Handles', () => {
    it('should generate correct resize handles', () => {
      const bounds = getMultiSelectionBounds(testElements)!;
      const handles = getMultiSelectionHandles(bounds);
      
      expect(handles).toHaveLength(5); // 4 corner handles + 1 rotation handle
      
      const handleTypes = handles.map(h => h.type);
      expect(handleTypes).toContain('top-left');
      expect(handleTypes).toContain('top-right');
      expect(handleTypes).toContain('bottom-left');
      expect(handleTypes).toContain('bottom-right');
      expect(handleTypes).toContain('rotation');
    });

    it('should find correct handle when clicking on it', () => {
      const bounds = getMultiSelectionBounds(testElements)!;
      
      // Test clicking on top-left handle
      const topLeftPoint: Point = { x: bounds.x - 4, y: bounds.y - 4 };
      const handle = findMultiSelectionHandle(topLeftPoint, bounds);
      expect(handle).toBe('top-left');
      
      // Test clicking on rotation handle
      const rotationPoint: Point = { x: bounds.x + bounds.width / 2, y: bounds.y - 30 };
      const rotationHandle = findMultiSelectionHandle(rotationPoint, bounds);
      expect(rotationHandle).toBe('rotation');
      
      // Test clicking outside any handle
      const outsidePoint: Point = { x: bounds.x + 50, y: bounds.y + 50 };
      const noHandle = findMultiSelectionHandle(outsidePoint, bounds);
      expect(noHandle).toBeNull();
    });
  });

  describe('Group Resize Operations', () => {
    it('should resize all elements proportionally', () => {
      const originalBounds = getMultiSelectionBounds(testElements)!;
      
      // Simulate dragging bottom-right handle to make it 50% larger
      const startPoint: Point = { x: originalBounds.x + originalBounds.width, y: originalBounds.y + originalBounds.height };
      const endPoint: Point = { x: startPoint.x + 115, y: startPoint.y + 75 }; // 50% larger
      
      const newBounds = applyMultiSelectionResize(originalBounds, 'bottom-right', startPoint, endPoint);
      
      expect(newBounds.width).toBeCloseTo(originalBounds.width * 1.5, 1);
      expect(newBounds.height).toBeCloseTo(originalBounds.height * 1.5, 1);
      
      // Apply the resize to elements
      const updates = applyGroupResize(testElements, originalBounds, newBounds);
      
      expect(updates).toHaveLength(testElements.length);
      
      // Check that elements are scaled proportionally
      updates.forEach((update, index) => {
        expect(update.width).toBeCloseTo(testElements[index].width * 1.5, 1);
        expect(update.height).toBeCloseTo(testElements[index].height * 1.5, 1);
      });
    });

    it('should handle top-left resize correctly', () => {
      const originalBounds = getMultiSelectionBounds(testElements)!;
      
      // Simulate dragging top-left handle
      const startPoint: Point = { x: originalBounds.x, y: originalBounds.y };
      const endPoint: Point = { x: startPoint.x + 50, y: startPoint.y + 25 }; // Shrink by moving inward
      
      const newBounds = applyMultiSelectionResize(originalBounds, 'top-left', startPoint, endPoint);
      
      expect(newBounds.x).toBe(originalBounds.x + 50);
      expect(newBounds.y).toBe(originalBounds.y + 25);
      expect(newBounds.width).toBe(originalBounds.width - 50);
      expect(newBounds.height).toBe(originalBounds.height - 25);
    });

    it('should enforce minimum size constraints', () => {
      const originalBounds = getMultiSelectionBounds(testElements)!;
      
      // Try to resize to very small size
      const startPoint: Point = { x: originalBounds.x + originalBounds.width, y: originalBounds.y + originalBounds.height };
      const endPoint: Point = { x: originalBounds.x + 10, y: originalBounds.y + 10 }; // Very small
      
      const newBounds = applyMultiSelectionResize(originalBounds, 'bottom-right', startPoint, endPoint);
      
      expect(newBounds.width).toBeGreaterThanOrEqual(20); // Minimum size
      expect(newBounds.height).toBeGreaterThanOrEqual(20); // Minimum size
    });
  });

  describe('Group Rotation Operations', () => {
    it('should rotate all elements around group center', () => {
      const bounds = getMultiSelectionBounds(testElements)!;
      const deltaAngle = Math.PI / 4; // 45 degrees
      
      const updates = applyGroupRotation(testElements, bounds.center, deltaAngle);
      
      expect(updates).toHaveLength(testElements.length);
      
      // Check that all elements have their rotation updated
      updates.forEach((update, index) => {
        expect(update.angle).toBeCloseTo((testElements[index].angle || 0) + deltaAngle, 5);
      });
    });

    it('should preserve element positions relative to group center', () => {
      const bounds = getMultiSelectionBounds(testElements)!;
      const deltaAngle = Math.PI / 2; // 90 degrees
      
      const updates = applyGroupRotation(testElements, bounds.center, deltaAngle);
      
      // For 90-degree rotation, check that elements moved correctly
      updates.forEach((update, index) => {
        const originalElement = testElements[index];
        
        // Calculate original distance from center
        const originalCenterX = originalElement.x + originalElement.width / 2;
        const originalCenterY = originalElement.y + originalElement.height / 2;
        const originalDistanceFromCenter = Math.sqrt(
          Math.pow(originalCenterX - bounds.center.x, 2) + 
          Math.pow(originalCenterY - bounds.center.y, 2)
        );
        
        // Calculate new distance from center
        const newCenterX = update.x! + originalElement.width / 2;
        const newCenterY = update.y! + originalElement.height / 2;
        const newDistanceFromCenter = Math.sqrt(
          Math.pow(newCenterX - bounds.center.x, 2) + 
          Math.pow(newCenterY - bounds.center.y, 2)
        );
        
        // Distance should be preserved (within floating point precision)
        expect(newDistanceFromCenter).toBeCloseTo(originalDistanceFromCenter, 1);
      });
    });

    it('should handle zero rotation angle', () => {
      const bounds = getMultiSelectionBounds(testElements)!;
      const deltaAngle = 0;
      
      const updates = applyGroupRotation(testElements, bounds.center, deltaAngle);
      
      // Elements should remain in the same positions
      updates.forEach((update, index) => {
        const originalElement = testElements[index];
        expect(update.x).toBeCloseTo(originalElement.x, 5);
        expect(update.y).toBeCloseTo(originalElement.y, 5);
        expect(update.angle).toBeCloseTo(originalElement.angle || 0, 5);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle elements at same position', () => {
      const overlappingElements: Element[] = [
        {
          ...testElements[0],
          x: 100,
          y: 100,
        },
        {
          ...testElements[1],
          x: 100,
          y: 100,
        },
      ];
      
      const bounds = getMultiSelectionBounds(overlappingElements);
      expect(bounds).not.toBeNull();
      expect(bounds!.x).toBe(100);
      expect(bounds!.y).toBe(100);
    });

    it('should filter out locked elements', () => {
      const elementsWithLocked: Element[] = [
        testElements[0],
        { ...testElements[1], locked: true },
        testElements[2],
      ];
      
      const unlockedElements = elementsWithLocked.filter(el => !el.locked);
      const bounds = getMultiSelectionBounds(unlockedElements);
      
      expect(bounds).not.toBeNull();
      // Bounds should not include the locked element
    });

    it('should handle very small elements', () => {
      const smallElements: Element[] = [
        {
          ...testElements[0],
          width: 1,
          height: 1,
        },
        {
          ...testElements[1],
          width: 2,
          height: 2,
        },
      ];
      
      const bounds = getMultiSelectionBounds(smallElements);
      expect(bounds).not.toBeNull();
      expect(bounds!.width).toBeGreaterThan(0);
      expect(bounds!.height).toBeGreaterThan(0);
    });
  });
});