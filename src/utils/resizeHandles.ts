// ABOUTME: Utilities for resize handle calculation and interaction
// ABOUTME: Handles detection of resize handle clicks and coordinate transformations

import type { Element, Point, ResizeHandle, ResizeHandleType } from '../types';

const HANDLE_SIZE = 8;

/**
 * Get resize handles for an element
 */
export function getResizeHandles(element: Element): ResizeHandle[] {
  const handles: ResizeHandle[] = [];
  const halfHandle = HANDLE_SIZE / 2;

  if (element.type === 'rectangle' || element.type === 'circle' || element.type === 'text' || element.type === 'pen') {
    // Corner handles for shapes
    handles.push(
      {
        type: 'top-left',
        x: element.x - halfHandle,
        y: element.y - halfHandle,
        size: HANDLE_SIZE,
      },
      {
        type: 'top-right',
        x: element.x + element.width - halfHandle,
        y: element.y - halfHandle,
        size: HANDLE_SIZE,
      },
      {
        type: 'bottom-right',
        x: element.x + element.width - halfHandle,
        y: element.y + element.height - halfHandle,
        size: HANDLE_SIZE,
      },
      {
        type: 'bottom-left',
        x: element.x - halfHandle,
        y: element.y + element.height - halfHandle,
        size: HANDLE_SIZE,
      }
    );
  } else if (element.type === 'line' || element.type === 'arrow') {
    // End point handles for lines/arrows
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
 * Apply resize transformation to element based on handle type and new position
 */
export function applyResize(
  element: Element, 
  handleType: ResizeHandleType, 
  currentPoint: Point, 
  startPoint: Point,
  originalBounds?: {x: number, y: number, width: number, height: number},
  snapFunction?: (point: Point) => Point
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
  
  // Calculate deltas based on snapped point
  const deltaX = snappedCurrentPoint.x - startPoint.x;
  const deltaY = snappedCurrentPoint.y - startPoint.y;

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
    // For rectangles, circles, text, and pen strokes
    const updates: Partial<Element> = {};
    
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
 * Get cursor style for resize handle
 */
export function getResizeCursor(handleType: ResizeHandleType): string {
  switch (handleType) {
    case 'top-left':
    case 'bottom-right':
      return 'nw-resize';
    case 'top-right':
    case 'bottom-left':
      return 'ne-resize';
    case 'start-point':
    case 'end-point':
      return 'move';
    default:
      return 'default';
  }
}