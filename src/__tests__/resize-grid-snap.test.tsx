// ABOUTME: Test to verify resize handles work with grid snapping
// ABOUTME: Ensures that resize operations snap to grid when magnetic grid is enabled

import { describe, it, expect } from 'vitest';
import { applyResize } from '../utils/resizeHandles';

describe('Resize Grid Snapping', () => {
  // Mock snap function that snaps to 20px grid
  const snapToGrid20 = (point: { x: number; y: number }) => ({
    x: Math.round(point.x / 20) * 20,
    y: Math.round(point.y / 20) * 20,
  });

  it('should snap resize to grid when snap function is provided', () => {
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

    // Drag bottom-right handle from (300, 200) to (317, 213) - should snap to (320, 220)
    const startPoint = { x: 300, y: 200 };
    const currentPoint = { x: 317, y: 213 }; // Close to grid point 320, 220
    
    const updates = applyResize(
      rectangle, 
      'bottom-right', 
      currentPoint, 
      startPoint, 
      originalBounds,
      snapToGrid20
    );
    
    // Should snap to 320, 220 which means +20, +20 from start point
    expect(updates.width).toBe(220); // 200 + 20
    expect(updates.height).toBe(120); // 100 + 20
  });

  it('should snap resize to grid for top-left handle', () => {
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

    // Drag top-left handle from (100, 100) to (83, 87) - should snap to (80, 80)
    const startPoint = { x: 100, y: 100 };
    const currentPoint = { x: 83, y: 87 }; // Close to grid point 80, 80
    
    const updates = applyResize(
      rectangle, 
      'top-left', 
      currentPoint, 
      startPoint, 
      originalBounds,
      snapToGrid20
    );
    
    // Should snap to 80, 80 which means -20, -20 from start point
    expect(updates.x).toBe(80); // 100 - 20
    expect(updates.y).toBe(80); // 100 - 20  
    expect(updates.width).toBe(220); // 200 + 20 (opposite direction)
    expect(updates.height).toBe(120); // 100 + 20 (opposite direction)
  });

  it('should work without snapping when no snap function provided', () => {
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

    // Drag to an off-grid position
    const startPoint = { x: 300, y: 200 };
    const currentPoint = { x: 317, y: 213 }; // Off-grid position
    
    const updates = applyResize(
      rectangle, 
      'bottom-right', 
      currentPoint, 
      startPoint, 
      originalBounds
      // No snap function provided
    );
    
    // Should use exact position without snapping
    expect(updates.width).toBe(217); // 200 + 17
    expect(updates.height).toBe(113); // 100 + 13
  });

  it('should snap line endpoints to grid', () => {
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

    const originalBounds = {
      x: line.x,
      y: line.y,
      width: line.width,
      height: line.height,
    };

    // Drag start point from (100, 100) to (87, 113) - should snap to (80, 120)
    const startPoint = { x: 100, y: 100 };
    const currentPoint = { x: 87, y: 113 }; // Close to grid point 80, 120
    
    const updates = applyResize(
      line, 
      'start-point', 
      currentPoint, 
      startPoint, 
      originalBounds,
      snapToGrid20
    );
    
    // Should snap to 80, 120 which means -20, +20 from start point
    expect(updates.x).toBe(80); // 100 - 20
    expect(updates.y).toBe(120); // 100 + 20
    expect(updates.width).toBe(220); // 200 + 20 (line gets longer)
    expect(updates.height).toBe(30); // 50 - 20 (line height adjusts)
  });

  it('should handle grid snapping with minimum size constraints', () => {
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

    const originalBounds = {
      x: rectangle.x,
      y: rectangle.y,
      width: rectangle.width,
      height: rectangle.height,
    };

    // Try to resize to make it very small, but grid snapping prevents going below minimum
    const startPoint = { x: 150, y: 150 }; // Bottom-right corner
    const currentPoint = { x: 97, y: 97 }; // Would snap to 100, 100 (same as top-left)
    
    const updates = applyResize(
      rectangle, 
      'bottom-right', 
      currentPoint, 
      startPoint, 
      originalBounds,
      snapToGrid20
    );
    
    // Should enforce minimum size despite snapping
    expect(updates.width).toBe(10); // Minimum size
    expect(updates.height).toBe(10); // Minimum size
  });

  it('should work with different grid sizes', () => {
    // Mock snap function for 50px grid
    const snapToGrid50 = (point: { x: number; y: number }) => ({
      x: Math.round(point.x / 50) * 50,
      y: Math.round(point.y / 50) * 50,
    });

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

    // Drag to position that should snap to 50px grid
    const startPoint = { x: 300, y: 200 };
    const currentPoint = { x: 333, y: 238 }; // Should snap to 350, 250
    
    const updates = applyResize(
      rectangle, 
      'bottom-right', 
      currentPoint, 
      startPoint, 
      originalBounds,
      snapToGrid50
    );
    
    // Should snap to 350, 250 which means +50, +50 from start point
    expect(updates.width).toBe(250); // 200 + 50
    expect(updates.height).toBe(150); // 100 + 50
  });
});