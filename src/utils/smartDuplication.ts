// ABOUTME: Smart duplication utilities for intelligent element positioning
// ABOUTME: Calculates optimal placement for duplicated elements avoiding collisions

import type { Element, Point, Viewport } from '../types';

export interface DuplicationOptions {
  baseOffset?: number;
  maxAttempts?: number;
  collisionPadding?: number;
  preferredDirection?: 'right' | 'down' | 'diagonal';
}

const DEFAULT_OPTIONS: Required<DuplicationOptions> = {
  baseOffset: 20,
  maxAttempts: 8,
  collisionPadding: 10,
  preferredDirection: 'diagonal',
};

export function calculateSmartDuplicationOffset(
  elements: Element[],
  selectedElements: Element[],
  viewport: Viewport,
  options: DuplicationOptions = {}
): Point {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // Calculate bounding box of all selected elements
  const bounds = calculateSelectionBounds(selectedElements);
  if (!bounds) {
    return { x: opts.baseOffset, y: opts.baseOffset };
  }
  
  // Try different positions based on preferred direction
  for (let attempt = 0; attempt < opts.maxAttempts; attempt++) {
    const offset = calculateOffset(attempt, opts);
    
    if (isPositionValid(bounds, offset, elements, selectedElements, viewport, opts)) {
      return offset;
    }
  }
  
  // Fallback to simple offset if no valid position found
  return { x: opts.baseOffset, y: opts.baseOffset };
}

function calculateSelectionBounds(elements: Element[]): { x: number; y: number; width: number; height: number } | null {
  if (elements.length === 0) return null;
  
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  
  elements.forEach(element => {
    const left = element.x;
    const top = element.y;
    const right = element.x + element.width;
    const bottom = element.y + element.height;
    
    minX = Math.min(minX, left);
    minY = Math.min(minY, top);
    maxX = Math.max(maxX, right);
    maxY = Math.max(maxY, bottom);
  });
  
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

function calculateOffset(attempt: number, options: Required<DuplicationOptions>): Point {
  const { baseOffset, preferredDirection } = options;
  const multiplier = attempt + 1;
  
  switch (preferredDirection) {
    case 'right':
      return { x: baseOffset * multiplier, y: 0 };
    case 'down':
      return { x: 0, y: baseOffset * multiplier };
    case 'diagonal':
    default:
      // Try different diagonal patterns
      const patterns = [
        { x: baseOffset, y: baseOffset },           // Main diagonal
        { x: baseOffset * 2, y: baseOffset },       // More right
        { x: baseOffset, y: baseOffset * 2 },       // More down
        { x: baseOffset * 3, y: baseOffset },       // Further right
        { x: baseOffset, y: baseOffset * 3 },       // Further down
        { x: -baseOffset, y: baseOffset },          // Left-down
        { x: baseOffset, y: -baseOffset },          // Right-up
        { x: -baseOffset, y: -baseOffset },         // Left-up
      ];
      
      const patternIndex = attempt % patterns.length;
      const pattern = patterns[patternIndex];
      const layerMultiplier = Math.floor(attempt / patterns.length) + 1;
      
      return {
        x: pattern.x * layerMultiplier,
        y: pattern.y * layerMultiplier,
      };
  }
}

function isPositionValid(
  bounds: { x: number; y: number; width: number; height: number },
  offset: Point,
  allElements: Element[],
  selectedElements: Element[],
  viewport: Viewport,
  options: Required<DuplicationOptions>
): boolean {
  const newBounds = {
    x: bounds.x + offset.x,
    y: bounds.y + offset.y,
    width: bounds.width,
    height: bounds.height,
  };
  
  // Check if the duplicated elements would be visible in viewport
  if (!isInViewport(newBounds, viewport)) {
    return false;
  }
  
  // Check for collisions with existing elements (excluding selected ones)
  const selectedIds = new Set(selectedElements.map(el => el.id));
  const otherElements = allElements.filter(el => !selectedIds.has(el.id));
  
  return !hasCollisions(newBounds, otherElements, options.collisionPadding);
}

function isInViewport(
  bounds: { x: number; y: number; width: number; height: number },
  viewport: Viewport
): boolean {
  const viewportBounds = {
    x: viewport.pan.x,
    y: viewport.pan.y,
    width: viewport.bounds.width / viewport.zoom,
    height: viewport.bounds.height / viewport.zoom,
  };
  
  // Check if at least 50% of the duplicated selection is visible
  const visibleArea = calculateIntersectionArea(bounds, viewportBounds);
  const totalArea = bounds.width * bounds.height;
  
  return visibleArea > totalArea * 0.5;
}

function calculateIntersectionArea(
  rect1: { x: number; y: number; width: number; height: number },
  rect2: { x: number; y: number; width: number; height: number }
): number {
  const left = Math.max(rect1.x, rect2.x);
  const top = Math.max(rect1.y, rect2.y);
  const right = Math.min(rect1.x + rect1.width, rect2.x + rect2.width);
  const bottom = Math.min(rect1.y + rect1.height, rect2.y + rect2.height);
  
  if (left >= right || top >= bottom) {
    return 0;
  }
  
  return (right - left) * (bottom - top);
}

function hasCollisions(
  bounds: { x: number; y: number; width: number; height: number },
  elements: Element[],
  padding: number
): boolean {
  const paddedBounds = {
    x: bounds.x - padding,
    y: bounds.y - padding,
    width: bounds.width + 2 * padding,
    height: bounds.height + 2 * padding,
  };
  
  return elements.some(element => {
    const elementBounds = {
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
    };
    
    return rectanglesOverlap(paddedBounds, elementBounds);
  });
}

function rectanglesOverlap(
  rect1: { x: number; y: number; width: number; height: number },
  rect2: { x: number; y: number; width: number; height: number }
): boolean {
  return !(
    rect1.x >= rect2.x + rect2.width ||
    rect1.x + rect1.width <= rect2.x ||
    rect1.y >= rect2.y + rect2.height ||
    rect1.y + rect1.height <= rect2.y
  );
}

export function preserveGroupRelationships(
  elements: Element[],
  selectedElements: Element[]
): Element[] {
  const elementIds = new Set(selectedElements.map(el => el.id));
  const processedGroups = new Set<string>();
  const resultElements: Element[] = [];
  
  // Process each selected element
  selectedElements.forEach(element => {
    if (element.groupId && !processedGroups.has(element.groupId)) {
      // This element is part of a group we haven't processed yet
      processedGroups.add(element.groupId);
      
      // Get all elements in this group
      const groupElements = elements.filter(el => el.groupId === element.groupId);
      
      // Check if all group elements are selected
      const allGroupSelected = groupElements.every(el => elementIds.has(el.id));
      
      if (allGroupSelected) {
        // Include entire group
        resultElements.push(...groupElements);
      } else {
        // Only include selected elements from this group (break group relationship)
        const selectedFromGroup = groupElements.filter(el => elementIds.has(el.id));
        resultElements.push(...selectedFromGroup);
      }
    } else if (!element.groupId) {
      // Ungrouped element, include as-is
      resultElements.push(element);
    }
    // Skip grouped elements that were already processed
  });
  
  return resultElements;
}