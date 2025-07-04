// ABOUTME: Test to verify resize sensitivity is reasonable and controllable
// ABOUTME: Ensures that small mouse movements don't cause extreme size changes

import { describe, it, expect } from 'vitest';
import { applyResize } from '../utils/resizeHandles';

describe('Resize Sensitivity', () => {
  it('should have reasonable resize sensitivity for small movements', () => {
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

    const originalBounds = {
      x: rectangle.x,
      y: rectangle.y,
      width: rectangle.width,
      height: rectangle.height,
    };

    // Simulate a small 5px movement
    const startPoint = { x: 300, y: 200 }; // Bottom-right corner
    const currentPoint = { x: 305, y: 205 }; // 5px movement

    const updates = applyResize(rectangle, 'bottom-right', currentPoint, startPoint, originalBounds);
    
    // Should increase size by exactly 5px in each direction
    expect(updates.width).toBe(205); // 200 + 5
    expect(updates.height).toBe(105); // 100 + 5
    
    // Position shouldn't change for bottom-right resize
    expect(updates.x).toBeUndefined();
    expect(updates.y).toBeUndefined();
  });

  it('should handle larger movements proportionally', () => {
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

    const originalBounds = {
      x: rectangle.x,
      y: rectangle.y,
      width: rectangle.width,
      height: rectangle.height,
    };

    // Simulate a 50px movement
    const startPoint = { x: 300, y: 200 }; // Bottom-right corner
    const currentPoint = { x: 350, y: 250 }; // 50px movement

    const updates = applyResize(rectangle, 'bottom-right', currentPoint, startPoint, originalBounds);
    
    // Should increase size by exactly 50px in each direction
    expect(updates.width).toBe(250); // 200 + 50
    expect(updates.height).toBe(150); // 100 + 50
  });

  it('should work correctly with negative movements (shrinking)', () => {
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

    const originalBounds = {
      x: rectangle.x,
      y: rectangle.y,
      width: rectangle.width,
      height: rectangle.height,
    };

    // Simulate moving inward (shrinking)
    const startPoint = { x: 300, y: 200 }; // Bottom-right corner
    const currentPoint = { x: 280, y: 180 }; // 20px inward movement

    const updates = applyResize(rectangle, 'bottom-right', currentPoint, startPoint, originalBounds);
    
    // Should decrease size by exactly 20px in each direction
    expect(updates.width).toBe(180); // 200 - 20
    expect(updates.height).toBe(80); // 100 - 20
  });

  it('should maintain consistent behavior with original bounds', () => {
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

    const originalBounds = {
      x: 100,
      y: 100,
      width: 200,
      height: 100,
    };

    // Modify the rectangle as if it's being resized
    const modifiedRectangle = {
      ...rectangle,
      width: 250, // Already modified
      height: 150, // Already modified
    };

    const startPoint = { x: 300, y: 200 }; // Bottom-right corner of original
    const currentPoint = { x: 320, y: 220 }; // 20px more movement

    // Using original bounds should give consistent results
    const updates = applyResize(modifiedRectangle, 'bottom-right', currentPoint, startPoint, originalBounds);
    
    // Should be based on original bounds, not modified element
    expect(updates.width).toBe(220); // 200 + 20 (from original)
    expect(updates.height).toBe(120); // 100 + 20 (from original)
  });

  it('should work correctly for top-left handle with position changes', () => {
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

    const originalBounds = {
      x: rectangle.x,
      y: rectangle.y,
      width: rectangle.width,
      height: rectangle.height,
    };

    // Move top-left handle 10px down and right (shrinking)
    const startPoint = { x: 100, y: 100 }; // Top-left corner
    const currentPoint = { x: 110, y: 110 }; // 10px movement

    const updates = applyResize(rectangle, 'top-left', currentPoint, startPoint, originalBounds);
    
    // Position should move
    expect(updates.x).toBe(110); // 100 + 10
    expect(updates.y).toBe(110); // 100 + 10
    
    // Size should decrease
    expect(updates.width).toBe(190); // 200 - 10
    expect(updates.height).toBe(90); // 100 - 10
  });
});