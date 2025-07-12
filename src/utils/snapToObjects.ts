// ABOUTME: Advanced snap-to-objects system for precise element alignment
// ABOUTME: Provides snapping to centers, edges, and corners of other elements with visual feedback

import type { Element, Point } from '../types';

export interface SnapResult {
  point: Point;
  snapped: boolean;
  snapType: 'center' | 'edge' | 'corner' | 'none';
  snapElement?: Element;
  snapDirection?: 'horizontal' | 'vertical' | 'both';
}

export interface SnapGuide {
  type: 'horizontal' | 'vertical';
  position: number;
  element: Element;
  snapType: 'center' | 'edge' | 'corner';
}

// Snap distance threshold in world coordinates
const SNAP_THRESHOLD = 10;

/**
 * Calculate snap points for an element (center, edges, corners)
 */
function getElementSnapPoints(element: Element): { center: Point; edges: Point[]; corners: Point[] } {
  const center = {
    x: element.x + element.width / 2,
    y: element.y + element.height / 2
  };

  const corners = [
    { x: element.x, y: element.y }, // top-left
    { x: element.x + element.width, y: element.y }, // top-right
    { x: element.x + element.width, y: element.y + element.height }, // bottom-right
    { x: element.x, y: element.y + element.height } // bottom-left
  ];

  const edges = [
    { x: center.x, y: element.y }, // top edge center
    { x: element.x + element.width, y: center.y }, // right edge center
    { x: center.x, y: element.y + element.height }, // bottom edge center
    { x: element.x, y: center.y } // left edge center
  ];

  return { center, edges, corners };
}

/**
 * Find the best snap position for a point against all other elements
 */
export function snapToObjects(
  targetPoint: Point,
  allElements: Element[],
  excludeElements: Element[] = [],
  snapDistance: number = SNAP_THRESHOLD
): SnapResult {
  let bestSnap: SnapResult = {
    point: targetPoint,
    snapped: false,
    snapType: 'none'
  };

  let closestDistance = snapDistance;

  // Filter out excluded elements (e.g., the element being moved)
  const candidateElements = allElements.filter(el => 
    !excludeElements.some(excluded => excluded.id === el.id)
  );

  for (const element of candidateElements) {
    const snapPoints = getElementSnapPoints(element);
    
    // Check edge snapping - snap to full edges, not just edge centers
    // Top and bottom edges (horizontal alignment)
    const topEdgeDistance = Math.abs(targetPoint.y - element.y);
    const bottomEdgeDistance = Math.abs(targetPoint.y - (element.y + element.height));
    
    if (topEdgeDistance < closestDistance) {
      closestDistance = topEdgeDistance;
      bestSnap = {
        point: { x: targetPoint.x, y: element.y },
        snapped: true,
        snapType: 'edge',
        snapElement: element,
        snapDirection: 'horizontal'
      };
    }
    
    if (bottomEdgeDistance < closestDistance) {
      closestDistance = bottomEdgeDistance;
      bestSnap = {
        point: { x: targetPoint.x, y: element.y + element.height },
        snapped: true,
        snapType: 'edge',
        snapElement: element,
        snapDirection: 'horizontal'
      };
    }
    
    // Left and right edges (vertical alignment)
    const leftEdgeDistance = Math.abs(targetPoint.x - element.x);
    const rightEdgeDistance = Math.abs(targetPoint.x - (element.x + element.width));
    
    if (leftEdgeDistance < closestDistance) {
      closestDistance = leftEdgeDistance;
      bestSnap = {
        point: { x: element.x, y: targetPoint.y },
        snapped: true,
        snapType: 'edge',
        snapElement: element,
        snapDirection: 'vertical'
      };
    }
    
    if (rightEdgeDistance < closestDistance) {
      closestDistance = rightEdgeDistance;
      bestSnap = {
        point: { x: element.x + element.width, y: targetPoint.y },
        snapped: true,
        snapType: 'edge',
        snapElement: element,
        snapDirection: 'vertical'
      };
    }

    // Check center snapping
    const centerDistance = Math.sqrt(
      Math.pow(targetPoint.x - snapPoints.center.x, 2) + 
      Math.pow(targetPoint.y - snapPoints.center.y, 2)
    );

    if (centerDistance < closestDistance) {
      closestDistance = centerDistance;
      bestSnap = {
        point: snapPoints.center,
        snapped: true,
        snapType: 'center',
        snapElement: element,
        snapDirection: 'both'
      };
    }

    // Check corner snapping
    for (const corner of snapPoints.corners) {
      const cornerDistance = Math.sqrt(
        Math.pow(targetPoint.x - corner.x, 2) + 
        Math.pow(targetPoint.y - corner.y, 2)
      );

      if (cornerDistance < closestDistance) {
        closestDistance = cornerDistance;
        bestSnap = {
          point: corner,
          snapped: true,
          snapType: 'corner',
          snapElement: element,
          snapDirection: 'both'
        };
      }
    }
  }

  return bestSnap;
}

/**
 * Generate snap guides for visual feedback
 */
export function generateSnapGuides(
  snapResult: SnapResult,
  viewportBounds: { x: number; y: number; width: number; height: number }
): SnapGuide[] {
  if (!snapResult.snapped || !snapResult.snapElement || snapResult.snapType === 'none') return [];

  const guides: SnapGuide[] = [];
  const element = snapResult.snapElement;

  if (snapResult.snapDirection === 'horizontal' || snapResult.snapDirection === 'both') {
    guides.push({
      type: 'horizontal',
      position: snapResult.point.y,
      element,
      snapType: snapResult.snapType as 'center' | 'edge' | 'corner'
    });
  }

  if (snapResult.snapDirection === 'vertical' || snapResult.snapDirection === 'both') {
    guides.push({
      type: 'vertical',
      position: snapResult.point.x,
      element,
      snapType: snapResult.snapType as 'center' | 'edge' | 'corner'
    });
  }

  return guides;
}

/**
 * Generate debug snap guides showing all possible snap points
 */
export function generateDebugSnapGuides(
  targetElement: Element,
  allElements: Element[],
  excludeElements: Element[] = []
): SnapGuide[] {
  const guides: SnapGuide[] = [];
  
  // Filter out excluded elements
  const candidateElements = allElements.filter(el => 
    !excludeElements.some(excluded => excluded.id === el.id)
  );

  for (const element of candidateElements) {
    const snapPoints = getElementSnapPoints(element);
    
    // Add center guides (purple)
    guides.push({
      type: 'horizontal',
      position: snapPoints.center.y,
      element,
      snapType: 'center'
    });
    
    guides.push({
      type: 'vertical',
      position: snapPoints.center.x,
      element,
      snapType: 'center'
    });
    
    // Add edge guides (green)
    // Top and bottom edges
    guides.push({
      type: 'horizontal',
      position: element.y,
      element,
      snapType: 'edge'
    });
    
    guides.push({
      type: 'horizontal',
      position: element.y + element.height,
      element,
      snapType: 'edge'
    });
    
    // Left and right edges  
    guides.push({
      type: 'vertical',
      position: element.x,
      element,
      snapType: 'edge'
    });
    
    guides.push({
      type: 'vertical',
      position: element.x + element.width,
      element,
      snapType: 'edge'
    });
    
    // Add corner guides (orange) - only show a few key ones to avoid clutter
    for (const corner of snapPoints.corners) {
      guides.push({
        type: 'horizontal',
        position: corner.y,
        element,
        snapType: 'corner'
      });
      
      guides.push({
        type: 'vertical',
        position: corner.x,
        element,
        snapType: 'corner'
      });
    }
  }

  return guides;
}

/**
 * Snap an element's position using its center point
 */
export function snapElementPosition(
  element: Element,
  allElements: Element[],
  snapDistance: number = SNAP_THRESHOLD
): { element: Element; guides: SnapGuide[]; snapped: boolean } {
  const elementCenter = {
    x: element.x + element.width / 2,
    y: element.y + element.height / 2
  };

  const snapResult = snapToObjects(elementCenter, allElements, [element], snapDistance);

  if (snapResult.snapped) {
    const snappedElement = {
      ...element,
      x: snapResult.point.x - element.width / 2,
      y: snapResult.point.y - element.height / 2
    };

    const guides = generateSnapGuides(snapResult, {
      x: 0, y: 0, width: 1000, height: 1000
    });

    return {
      element: snappedElement,
      guides,
      snapped: true
    };
  }

  return {
    element,
    guides: [],
    snapped: false
  };
}