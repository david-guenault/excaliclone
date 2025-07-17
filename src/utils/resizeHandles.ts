// ABOUTME: Utilities for resize handle calculation and interaction
// ABOUTME: Handles detection of resize handle clicks and coordinate transformations

import type { Element, Point, ResizeHandle, ResizeHandleType } from '../types';

const HANDLE_SIZE = 8;


/**
 * Transform a point from local element coordinates to world coordinates
 */
function transformPoint(localX: number, localY: number, element: Element): Point {
  const centerX = element.x + element.width / 2;
  const centerY = element.y + element.height / 2;
  
  // Translate to element center, rotate, then translate back to world coordinates
  const cos = Math.cos(element.angle);
  const sin = Math.sin(element.angle);
  
  // Point relative to element center
  const relativeX = localX - element.width / 2;
  const relativeY = localY - element.height / 2;
  
  // Rotate around element center
  const rotatedX = relativeX * cos - relativeY * sin;
  const rotatedY = relativeX * sin + relativeY * cos;
  
  // Translate back to world coordinates
  return {
    x: centerX + rotatedX,
    y: centerY + rotatedY
  };
}

/**
 * Get resize handles for an element
 */
export function getResizeHandles(element: Element): ResizeHandle[] {
  const handles: ResizeHandle[] = [];
  const halfHandle = HANDLE_SIZE / 2;

  if (element.type === 'rectangle' || element.type === 'circle' || element.type === 'text' || element.type === 'pen' || element.type === 'image') {
    // Corner handles for shapes (in local coordinates, then transformed)
    const localHandles = [
      { type: 'top-left' as const, x: -halfHandle, y: -halfHandle },
      { type: 'top-right' as const, x: element.width - halfHandle, y: -halfHandle },
      { type: 'bottom-right' as const, x: element.width - halfHandle, y: element.height - halfHandle },
      { type: 'bottom-left' as const, x: -halfHandle, y: element.height - halfHandle },
    ];
    
    localHandles.forEach(({ type, x, y }) => {
      const worldPos = transformPoint(x, y, element);
      handles.push({
        type,
        x: worldPos.x,
        y: worldPos.y,
        size: HANDLE_SIZE,
      });
    });

    // Add rotation handle for non-line elements (in local coordinates)
    const rotationDistance = 20; // Distance from top edge
    const rotationLocalX = element.width / 2 - halfHandle;
    const rotationLocalY = -rotationDistance - halfHandle;
    const rotationWorldPos = transformPoint(rotationLocalX, rotationLocalY, element);
    
    handles.push({
      type: 'rotation',
      x: rotationWorldPos.x,
      y: rotationWorldPos.y,
      size: HANDLE_SIZE,
    });
  } else if (element.type === 'line' || element.type === 'arrow') {
    // End point handles for lines/arrows (these don't need rotation since they're at line endpoints)
    handles.push(
      {
        type: 'start-point',
        x: element.x - halfHandle,
        y: element.y - halfHandle,
        size: HANDLE_SIZE,
      },
      {
        type: 'end-point',
        x: element.x + element.width - halfHandle,
        y: element.y + element.height - halfHandle,
        size: HANDLE_SIZE,
      }
    );

    // Add rotation handle for lines/arrows at the midpoint
    const rotationDistance = 15;
    const midX = element.x + element.width / 2;
    const midY = element.y + element.height / 2;
    // Calculate perpendicular offset
    const length = Math.sqrt(element.width * element.width + element.height * element.height);
    if (length > 0) {
      const offsetX = (-element.height / length) * rotationDistance;
      const offsetY = (element.width / length) * rotationDistance;
      
      handles.push({
        type: 'rotation',
        x: midX + offsetX - halfHandle,
        y: midY + offsetY - halfHandle,
        size: HANDLE_SIZE,
      });
    }
  }

  return handles;
}

/**
 * Check if a point is inside a resize handle
 */
export function isPointInHandle(point: Point, handle: ResizeHandle): boolean {
  const tolerance = 2; // Extra tolerance for easier clicking
  return (
    point.x >= handle.x - tolerance &&
    point.x <= handle.x + handle.size + tolerance &&
    point.y >= handle.y - tolerance &&
    point.y <= handle.y + handle.size + tolerance
  );
}

/**
 * Find which resize handle (if any) a point is over
 */
export function findResizeHandle(point: Point, element: Element): ResizeHandleType | null {
  const handles = getResizeHandles(element);
  
  for (const handle of handles) {
    if (isPointInHandle(point, handle)) {
      return handle.type;
    }
  }
  
  return null;
}

/**
 * Transform point from world coordinates to local element coordinates
 */
function worldToLocal(worldPoint: Point, element: Element): Point {
  const centerX = element.x + element.width / 2;
  const centerY = element.y + element.height / 2;
  
  // Translate to element center (origin)
  const translatedX = worldPoint.x - centerX;
  const translatedY = worldPoint.y - centerY;
  
  // Rotate by negative element angle to get local coordinates
  const cos = Math.cos(-element.angle);
  const sin = Math.sin(-element.angle);
  
  const localX = translatedX * cos - translatedY * sin;
  const localY = translatedX * sin + translatedY * cos;
  
  // Translate back relative to element origin (not center)
  return {
    x: localX + centerX,
    y: localY + centerY
  };
}

/**
 * Apply resize transformation to element based on handle type and new position
 */
export function applyResize(
  element: Element, 
  handleType: ResizeHandleType, 
  currentPoint: Point, 
  startPoint: Point,
  originalBounds?: {x: number, y: number, width: number, height: number},
  snapFunction?: (point: Point) => Point,
  ctrlPressed?: boolean
): Partial<Element> {
  // Use original bounds if provided, otherwise use current element bounds
  const bounds = originalBounds || {
    x: element.x,
    y: element.y,
    width: element.width,
    height: element.height
  };

  // Apply snapping to the current point if snap function is provided
  const snappedCurrentPoint = snapFunction ? snapFunction(currentPoint) : currentPoint;
  
  // Calculate deltas in world space first
  let deltaX = snappedCurrentPoint.x - startPoint.x;
  let deltaY = snappedCurrentPoint.y - startPoint.y;
  
  // For rotated elements, transform deltas to local coordinate space
  // Exception: for images, skip coordinate transformation to allow more direct control
  if (element.angle && element.angle !== 0 && element.type !== 'image') {
    const cos = Math.cos(-element.angle);
    const sin = Math.sin(-element.angle);
    
    const localDeltaX = deltaX * cos - deltaY * sin;
    const localDeltaY = deltaX * sin + deltaY * cos;
    
    deltaX = localDeltaX;
    deltaY = localDeltaY;
  }
  // For images: use deltaX and deltaY directly without transformation
  // This allows independent width/height control even when rotated
  

  if (element.type === 'line' || element.type === 'arrow') {
    // For lines and arrows, just move the endpoints
    if (handleType === 'start-point') {
      return {
        x: bounds.x + deltaX,
        y: bounds.y + deltaY,
        width: bounds.width - deltaX,
        height: bounds.height - deltaY,
      };
    } else if (handleType === 'end-point') {
      return {
        width: bounds.width + deltaX,
        height: bounds.height + deltaY,
      };
    }
  } else {
    // For rectangles, circles, text, pen strokes, and images
    const updates: Partial<Element> = {};
    
    if (ctrlPressed) {
      // Proportional resizing when CTRL is held
      const originalAspectRatio = bounds.width / bounds.height;
      
      switch (handleType) {
        case 'top-left': {
          // Use the larger of the two deltas to maintain aspect ratio
          const avgDelta = (Math.abs(deltaX) + Math.abs(deltaY)) / 2;
          const proportionalDeltaX = Math.sign(deltaX) * avgDelta;
          const proportionalDeltaY = proportionalDeltaX / originalAspectRatio;
          
          updates.x = bounds.x + proportionalDeltaX;
          updates.y = bounds.y + proportionalDeltaY;
          updates.width = bounds.width - proportionalDeltaX;
          updates.height = bounds.height - proportionalDeltaY;
          break;
        }
        
        case 'top-right': {
          const avgDelta = (Math.abs(deltaX) + Math.abs(deltaY)) / 2;
          const proportionalDeltaX = Math.sign(deltaX) * avgDelta;
          const proportionalDeltaY = -proportionalDeltaX / originalAspectRatio;
          
          updates.y = bounds.y + proportionalDeltaY;
          updates.width = bounds.width + proportionalDeltaX;
          updates.height = bounds.height - proportionalDeltaY;
          break;
        }
        
        case 'bottom-right': {
          const avgDelta = (Math.abs(deltaX) + Math.abs(deltaY)) / 2;
          const proportionalDeltaX = Math.sign(deltaX) * avgDelta;
          const proportionalDeltaY = proportionalDeltaX / originalAspectRatio;
          
          updates.width = bounds.width + proportionalDeltaX;
          updates.height = bounds.height + proportionalDeltaY;
          break;
        }
        
        case 'bottom-left': {
          const avgDelta = (Math.abs(deltaX) + Math.abs(deltaY)) / 2;
          const proportionalDeltaX = -Math.sign(deltaX) * avgDelta;
          const proportionalDeltaY = -proportionalDeltaX / originalAspectRatio;
          
          updates.x = bounds.x - proportionalDeltaX;
          updates.width = bounds.width + proportionalDeltaX;
          updates.height = bounds.height + proportionalDeltaY;
          break;
        }
      }
    } else {
      // Normal resizing (existing behavior)
      switch (handleType) {
        case 'top-left':
          updates.x = bounds.x + deltaX;
          updates.y = bounds.y + deltaY;
          updates.width = bounds.width - deltaX;
          updates.height = bounds.height - deltaY;
          break;
          
        case 'top-right':
          updates.y = bounds.y + deltaY;
          updates.width = bounds.width + deltaX;
          updates.height = bounds.height - deltaY;
          break;
          
        case 'bottom-right':
          updates.width = bounds.width + deltaX;
          updates.height = bounds.height + deltaY;
          break;
          
        case 'bottom-left':
          updates.x = bounds.x + deltaX;
          updates.width = bounds.width - deltaX;
          updates.height = bounds.height + deltaY;
          break;
      }
    }
    
    // Ensure minimum size
    const minSize = 10;
    if (updates.width !== undefined && updates.width < minSize) {
      if (handleType === 'top-left' || handleType === 'bottom-left') {
        updates.x = bounds.x + bounds.width - minSize;
      }
      updates.width = minSize;
    }
    
    if (updates.height !== undefined && updates.height < minSize) {
      if (handleType === 'top-left' || handleType === 'top-right') {
        updates.y = bounds.y + bounds.height - minSize;
      }
      updates.height = minSize;
    }
    
    return updates;
  }
  
  return {};
}

/**
 * Apply rotation to an element based on mouse position
 */
export function applyRotation(
  element: Element,
  currentPoint: Point,
  centerPoint?: Point
): Partial<Element> {
  // Calculate the center of rotation (element center if not provided)
  const center = centerPoint || {
    x: element.x + element.width / 2,
    y: element.y + element.height / 2
  };

  // Calculate angle from center to current mouse position
  const deltaX = currentPoint.x - center.x;
  const deltaY = currentPoint.y - center.y;
  const angle = Math.atan2(deltaY, deltaX);

  // Convert to degrees and normalize
  let angleDegrees = (angle * 180) / Math.PI;
  
  // Snap to 15-degree increments for easier alignment
  const snapIncrement = 15;
  angleDegrees = Math.round(angleDegrees / snapIncrement) * snapIncrement;
  
  // Convert back to radians
  const angleRadians = (angleDegrees * Math.PI) / 180;

  return {
    angle: angleRadians
  };
}

/**
 * Get cursor style for resize handle
 */
export function getResizeCursor(handleType: ResizeHandleType): string {
  switch (handleType) {
    case 'top-left':
      return 'nw-resize';
    case 'top-right':
      return 'ne-resize';
    case 'bottom-right':
      return 'se-resize';
    case 'bottom-left':
      return 'sw-resize';
    case 'start-point':
    case 'end-point':
      return 'move';
    case 'rotation':
      return 'grab';
    default:
      return 'default';
  }
}