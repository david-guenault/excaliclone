// ABOUTME: Utilities for multi-selection operations like group resize and rotation
// ABOUTME: Handles bounding box calculations and transformations for multiple elements

import type { Element, Point } from '../types';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  center: Point;
}

/**
 * Calculate the bounding box that encompasses all selected elements
 */
export function getMultiSelectionBounds(elements: Element[]): BoundingBox | null {
  if (elements.length === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  elements.forEach(element => {
    // For rotated elements, we need to consider all four corners
    if (element.angle && element.angle !== 0) {
      const corners = getElementCorners(element);
      corners.forEach(corner => {
        minX = Math.min(minX, corner.x);
        minY = Math.min(minY, corner.y);
        maxX = Math.max(maxX, corner.x);
        maxY = Math.max(maxY, corner.y);
      });
    } else {
      // For non-rotated elements, use simple bounds
      minX = Math.min(minX, element.x);
      minY = Math.min(minY, element.y);
      maxX = Math.max(maxX, element.x + element.width);
      maxY = Math.max(maxY, element.y + element.height);
    }
  });

  const width = maxX - minX;
  const height = maxY - minY;

  return {
    x: minX,
    y: minY,
    width,
    height,
    center: {
      x: minX + width / 2,
      y: minY + height / 2,
    },
  };
}

/**
 * Get the four corners of an element, accounting for rotation
 */
function getElementCorners(element: Element): Point[] {
  const { x, y, width, height, angle } = element;
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  // Define corners relative to center
  const corners = [
    { x: -width / 2, y: -height / 2 }, // top-left
    { x: width / 2, y: -height / 2 },  // top-right
    { x: width / 2, y: height / 2 },   // bottom-right
    { x: -width / 2, y: height / 2 },  // bottom-left
  ];

  // Apply rotation and translate to world coordinates
  const cos = Math.cos(angle || 0);
  const sin = Math.sin(angle || 0);

  return corners.map(corner => ({
    x: centerX + corner.x * cos - corner.y * sin,
    y: centerY + corner.x * sin + corner.y * cos,
  }));
}

/**
 * Apply group resize transformation to multiple elements
 */
export function applyGroupResize(
  elements: Element[],
  originalBounds: BoundingBox,
  newBounds: BoundingBox
): Partial<Element>[] {
  // Calculate scale factors for proportional resizing
  const scaleX = newBounds.width / originalBounds.width;
  const scaleY = newBounds.height / originalBounds.height;
  
  // Calculate position offset
  const offsetX = newBounds.x - originalBounds.x;
  const offsetY = newBounds.y - originalBounds.y;

  return elements.map(element => {
    // Calculate relative position within the original bounds
    const relativeX = (element.x - originalBounds.x) / originalBounds.width;
    const relativeY = (element.y - originalBounds.y) / originalBounds.height;
    const relativeWidth = element.width / originalBounds.width;
    const relativeHeight = element.height / originalBounds.height;

    // Apply scaling and positioning
    const newX = newBounds.x + relativeX * newBounds.width;
    const newY = newBounds.y + relativeY * newBounds.height;
    const newWidth = relativeWidth * newBounds.width;
    const newHeight = relativeHeight * newBounds.height;

    return {
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
    };
  });
}

/**
 * Apply group rotation transformation to multiple elements
 */
export function applyGroupRotation(
  elements: Element[],
  centerPoint: Point,
  deltaAngle: number
): Partial<Element>[] {
  const cos = Math.cos(deltaAngle);
  const sin = Math.sin(deltaAngle);

  return elements.map(element => {
    // Calculate element center
    const elementCenterX = element.x + element.width / 2;
    const elementCenterY = element.y + element.height / 2;

    // Translate to rotation center
    const translatedX = elementCenterX - centerPoint.x;
    const translatedY = elementCenterY - centerPoint.y;

    // Apply rotation
    const rotatedX = translatedX * cos - translatedY * sin;
    const rotatedY = translatedX * sin + translatedY * cos;

    // Translate back and adjust for element size
    const newCenterX = centerPoint.x + rotatedX;
    const newCenterY = centerPoint.y + rotatedY;
    const newX = newCenterX - element.width / 2;
    const newY = newCenterY - element.height / 2;

    // Add rotation to element's existing rotation
    const newAngle = (element.angle || 0) + deltaAngle;

    return {
      x: newX,
      y: newY,
      angle: newAngle,
    };
  });
}

/**
 * Check if a point is within the multi-selection bounds
 */
export function isPointInMultiSelectionBounds(
  point: Point,
  bounds: BoundingBox,
  tolerance: number = 5
): boolean {
  return (
    point.x >= bounds.x - tolerance &&
    point.x <= bounds.x + bounds.width + tolerance &&
    point.y >= bounds.y - tolerance &&
    point.y <= bounds.y + bounds.height + tolerance
  );
}

/**
 * Generate resize handles for multi-selection bounds
 */
export function getMultiSelectionHandles(bounds: BoundingBox) {
  const handleSize = 8;
  const { x, y, width, height } = bounds;

  return [
    // Corner handles
    {
      type: 'top-left' as const,
      x: x - handleSize / 2,
      y: y - handleSize / 2,
      size: handleSize,
    },
    {
      type: 'top-right' as const,
      x: x + width - handleSize / 2,
      y: y - handleSize / 2,
      size: handleSize,
    },
    {
      type: 'bottom-right' as const,
      x: x + width - handleSize / 2,
      y: y + height - handleSize / 2,
      size: handleSize,
    },
    {
      type: 'bottom-left' as const,
      x: x - handleSize / 2,
      y: y + height - handleSize / 2,
      size: handleSize,
    },
    // Rotation handle (above the selection)
    {
      type: 'rotation' as const,
      x: x + width / 2 - handleSize / 2,
      y: y - 30 - handleSize / 2,
      size: handleSize,
    },
  ];
}

/**
 * Find which multi-selection handle (if any) a point is over
 */
export function findMultiSelectionHandle(
  point: Point,
  bounds: BoundingBox
): string | null {
  const handles = getMultiSelectionHandles(bounds);
  
  for (const handle of handles) {
    const distance = Math.sqrt(
      Math.pow(point.x - (handle.x + handle.size / 2), 2) +
      Math.pow(point.y - (handle.y + handle.size / 2), 2)
    );
    
    if (distance <= handle.size / 2 + 3) { // 3px tolerance
      return handle.type;
    }
  }
  
  return null;
}

/**
 * Apply resize to multi-selection bounds based on handle type and movement
 */
export function applyMultiSelectionResize(
  originalBounds: BoundingBox,
  handleType: string,
  startPoint: Point,
  currentPoint: Point
): BoundingBox {
  let deltaX = currentPoint.x - startPoint.x;
  let deltaY = currentPoint.y - startPoint.y;
  
  // Apply smooth sensitivity scaling without threshold
  const RESIZE_SENSITIVITY = 0.7; // More responsive but still controlled
  deltaX *= RESIZE_SENSITIVITY;
  deltaY *= RESIZE_SENSITIVITY;

  const newBounds = { ...originalBounds };

  switch (handleType) {
    case 'top-left':
      newBounds.x = originalBounds.x + deltaX;
      newBounds.y = originalBounds.y + deltaY;
      newBounds.width = originalBounds.width - deltaX;
      newBounds.height = originalBounds.height - deltaY;
      break;

    case 'top-right':
      newBounds.y = originalBounds.y + deltaY;
      newBounds.width = originalBounds.width + deltaX;
      newBounds.height = originalBounds.height - deltaY;
      break;

    case 'bottom-right':
      newBounds.width = originalBounds.width + deltaX;
      newBounds.height = originalBounds.height + deltaY;
      break;

    case 'bottom-left':
      newBounds.x = originalBounds.x + deltaX;
      newBounds.width = originalBounds.width - deltaX;
      newBounds.height = originalBounds.height + deltaY;
      break;
  }

  // Ensure minimum size
  const minSize = 20;
  if (newBounds.width < minSize) {
    if (handleType.includes('left')) {
      newBounds.x = originalBounds.x + originalBounds.width - minSize;
    }
    newBounds.width = minSize;
  }
  
  if (newBounds.height < minSize) {
    if (handleType.includes('top')) {
      newBounds.y = originalBounds.y + originalBounds.height - minSize;
    }
    newBounds.height = minSize;
  }

  // Update center
  newBounds.center = {
    x: newBounds.x + newBounds.width / 2,
    y: newBounds.y + newBounds.height / 2,
  };

  return newBounds;
}