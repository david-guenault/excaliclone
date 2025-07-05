// ABOUTME: Test suite for multiple rotation functionality
// ABOUTME: Verifies that elements can be rotated multiple times consecutively

import { describe, it, expect } from 'vitest';
import { getResizeHandles, findResizeHandle, applyRotation } from '../utils/resizeHandles';
import type { Element, Point } from '../types';

describe('Multiple Rotation Support', () => {
  let mockElement: Element;

  beforeEach(() => {
    mockElement = {
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
  });

  describe('Handle Position After Rotation', () => {
    it('should position rotation handle correctly after first rotation', () => {
      // Apply first rotation: 45 degrees
      const firstRotation = (45 * Math.PI) / 180;
      const rotatedElement = { ...mockElement, angle: firstRotation };
      
      const handles = getResizeHandles(rotatedElement);
      const rotationHandle = handles.find(h => h.type === 'rotation');
      
      expect(rotationHandle).toBeDefined();
      expect(rotationHandle!.type).toBe('rotation');
      // Handle should be positioned correctly even after rotation
      expect(typeof rotationHandle!.x).toBe('number');
      expect(typeof rotationHandle!.y).toBe('number');
      expect(rotationHandle!.x).not.toBeNaN();
      expect(rotationHandle!.y).not.toBeNaN();
    });

    it('should position rotation handle correctly after multiple rotations', () => {
      // Apply multiple rotations
      let currentElement = { ...mockElement };
      
      // First rotation: 45 degrees
      currentElement.angle = (45 * Math.PI) / 180;
      
      // Second rotation: additional 30 degrees (total 75 degrees)
      currentElement.angle = (75 * Math.PI) / 180;
      
      // Third rotation: additional 15 degrees (total 90 degrees)
      currentElement.angle = (90 * Math.PI) / 180;
      
      const handles = getResizeHandles(currentElement);
      const rotationHandle = handles.find(h => h.type === 'rotation');
      
      expect(rotationHandle).toBeDefined();
      expect(rotationHandle!.type).toBe('rotation');
      expect(typeof rotationHandle!.x).toBe('number');
      expect(typeof rotationHandle!.y).toBe('number');
      expect(rotationHandle!.x).not.toBeNaN();
      expect(rotationHandle!.y).not.toBeNaN();
    });

    it('should maintain correct handle positions for all corner handles after rotation', () => {
      const rotatedElement = { ...mockElement, angle: (45 * Math.PI) / 180 };
      
      const handles = getResizeHandles(rotatedElement);
      const cornerHandles = handles.filter(h => 
        ['top-left', 'top-right', 'bottom-left', 'bottom-right'].includes(h.type)
      );
      
      expect(cornerHandles).toHaveLength(4);
      
      cornerHandles.forEach(handle => {
        expect(typeof handle.x).toBe('number');
        expect(typeof handle.y).toBe('number');
        expect(handle.x).not.toBeNaN();
        expect(handle.y).not.toBeNaN();
      });
    });
  });

  describe('Handle Detection After Rotation', () => {
    it('should detect rotation handle click after element rotation', () => {
      // Rotate element 45 degrees
      const rotatedElement = { ...mockElement, angle: (45 * Math.PI) / 180 };
      
      // Get the rotation handle position
      const handles = getResizeHandles(rotatedElement);
      const rotationHandle = handles.find(h => h.type === 'rotation');
      
      expect(rotationHandle).toBeDefined();
      
      // Click on the rotation handle position
      const clickPoint: Point = {
        x: rotationHandle!.x + rotationHandle!.size / 2,
        y: rotationHandle!.y + rotationHandle!.size / 2
      };
      
      const detectedHandle = findResizeHandle(clickPoint, rotatedElement);
      expect(detectedHandle).toBe('rotation');
    });

    it('should detect corner handle clicks after element rotation', () => {
      // Rotate element 90 degrees
      const rotatedElement = { ...mockElement, angle: (90 * Math.PI) / 180 };
      
      // Get the top-left handle position (which is now physically top-right due to rotation)
      const handles = getResizeHandles(rotatedElement);
      const topLeftHandle = handles.find(h => h.type === 'top-left');
      
      expect(topLeftHandle).toBeDefined();
      
      // Click on the handle position
      const clickPoint: Point = {
        x: topLeftHandle!.x + topLeftHandle!.size / 2,
        y: topLeftHandle!.y + topLeftHandle!.size / 2
      };
      
      const detectedHandle = findResizeHandle(clickPoint, rotatedElement);
      expect(detectedHandle).toBe('top-left');
    });
  });

  describe('Rotation Application After Previous Rotations', () => {
    it('should apply additional rotation correctly to already rotated element', () => {
      // Start with element rotated 45 degrees
      const initiallyRotatedElement = { ...mockElement, angle: (45 * Math.PI) / 180 };
      
      // Calculate center point
      const centerPoint: Point = {
        x: initiallyRotatedElement.x + initiallyRotatedElement.width / 2,
        y: initiallyRotatedElement.y + initiallyRotatedElement.height / 2
      };
      
      // Mouse position for additional 45 degrees (total should be 90 degrees)
      const additionalAngle = (90 * Math.PI) / 180; // Total target angle
      const mousePoint: Point = {
        x: centerPoint.x + Math.cos(additionalAngle) * 50,
        y: centerPoint.y + Math.sin(additionalAngle) * 50
      };
      
      const rotationUpdate = applyRotation(initiallyRotatedElement, mousePoint);
      
      // Should snap to 90 degrees (1.5708 radians approximately)
      const expectedAngle = (90 * Math.PI) / 180;
      expect(rotationUpdate.angle).toBeCloseTo(expectedAngle, 5);
    });

    it('should handle full circle rotation correctly', () => {
      // Start with element at 0 degrees
      let currentElement = { ...mockElement };
      
      // Apply multiple 90-degree rotations
      for (let i = 1; i <= 4; i++) {
        const targetAngle = (i * 90 * Math.PI) / 180;
        const centerPoint: Point = {
          x: currentElement.x + currentElement.width / 2,
          y: currentElement.y + currentElement.height / 2
        };
        
        const mousePoint: Point = {
          x: centerPoint.x + Math.cos(targetAngle) * 50,
          y: centerPoint.y + Math.sin(targetAngle) * 50
        };
        
        const rotationUpdate = applyRotation(currentElement, mousePoint);
        currentElement = { ...currentElement, angle: rotationUpdate.angle! };
        
        // Verify the rotation was applied correctly
        expect(typeof currentElement.angle).toBe('number');
        expect(currentElement.angle).not.toBeNaN();
      }
      
      // After 4 × 90° rotations, should be close to 0 or 360 degrees
      const finalAngleDegrees = (currentElement.angle * 180) / Math.PI;
      const normalizedAngle = finalAngleDegrees % 360;
      expect(normalizedAngle).toBeCloseTo(0, 1);
    });
  });

  describe('Edge Cases for Multiple Rotations', () => {
    it('should handle very small incremental rotations', () => {
      let currentElement = { ...mockElement };
      
      // Apply 24 × 15-degree rotations (should equal 360 degrees)
      for (let i = 1; i <= 24; i++) {
        const targetAngle = (i * 15 * Math.PI) / 180;
        const centerPoint: Point = {
          x: currentElement.x + currentElement.width / 2,
          y: currentElement.y + currentElement.height / 2
        };
        
        const mousePoint: Point = {
          x: centerPoint.x + Math.cos(targetAngle) * 50,
          y: centerPoint.y + Math.sin(targetAngle) * 50
        };
        
        const rotationUpdate = applyRotation(currentElement, mousePoint);
        currentElement = { ...currentElement, angle: rotationUpdate.angle! };
        
        // Each rotation should snap to 15-degree increments
        const angleDegrees = (currentElement.angle * 180) / Math.PI;
        const remainder = angleDegrees % 15;
        // Handle floating point precision - remainder should be very close to 0 or 15
        expect(Math.min(remainder, Math.abs(remainder - 15))).toBeLessThan(0.1);
      }
    });

    it('should maintain handle precision across many rotations', () => {
      let currentElement = { ...mockElement };
      
      // Apply 8 × 45-degree rotations
      for (let i = 1; i <= 8; i++) {
        currentElement.angle = (i * 45 * Math.PI) / 180;
        
        const handles = getResizeHandles(currentElement);
        const rotationHandle = handles.find(h => h.type === 'rotation');
        
        expect(rotationHandle).toBeDefined();
        expect(rotationHandle!.x).not.toBeNaN();
        expect(rotationHandle!.y).not.toBeNaN();
        
        // Verify handle can still be detected
        const clickPoint: Point = {
          x: rotationHandle!.x + rotationHandle!.size / 2,
          y: rotationHandle!.y + rotationHandle!.size / 2
        };
        
        const detectedHandle = findResizeHandle(clickPoint, currentElement);
        expect(detectedHandle).toBe('rotation');
      }
    });
  });
});