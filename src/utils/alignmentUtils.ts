// ABOUTME: Advanced alignment utilities with group awareness and smart positioning
// ABOUTME: Provides enhanced alignment algorithms for complex element arrangements

import type { Element, Group, Point } from '../types';

export interface AlignmentOptions {
  respectGroups?: boolean;
  preserveRelativePositions?: boolean;
  alignToSelection?: boolean;
  alignToCanvas?: boolean;
}

const DEFAULT_OPTIONS: Required<AlignmentOptions> = {
  respectGroups: true,
  preserveRelativePositions: false,
  alignToSelection: true,
  alignToCanvas: false,
};

export interface AlignmentBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
  centerX: number;
  centerY: number;
  width: number;
  height: number;
}

export function calculateAlignmentBounds(elements: Element[]): AlignmentBounds {
  if (elements.length === 0) {
    return {
      left: 0, right: 0, top: 0, bottom: 0,
      centerX: 0, centerY: 0, width: 0, height: 0
    };
  }

  const left = Math.min(...elements.map(el => el.x));
  const right = Math.max(...elements.map(el => el.x + el.width));
  const top = Math.min(...elements.map(el => el.y));
  const bottom = Math.max(...elements.map(el => el.y + el.height));

  return {
    left,
    right,
    top,
    bottom,
    centerX: (left + right) / 2,
    centerY: (top + bottom) / 2,
    width: right - left,
    height: bottom - top,
  };
}

export function getElementsToAlign(
  allElements: Element[],
  selectedElementIds: string[],
  groups: Group[],
  options: AlignmentOptions = {}
): Element[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  if (!opts.respectGroups) {
    return allElements.filter(el => selectedElementIds.includes(el.id));
  }

  // Collect all elements including group relationships
  const result = new Set<string>();
  const processedGroups = new Set<string>();

  selectedElementIds.forEach(elementId => {
    const element = allElements.find(el => el.id === elementId);
    if (!element) return;

    if (element.groupId && !processedGroups.has(element.groupId)) {
      // Include entire group
      processedGroups.add(element.groupId);
      const group = groups.find(g => g.id === element.groupId);
      if (group) {
        group.elementIds.forEach(id => result.add(id));
      }
    } else if (!element.groupId) {
      // Include individual element
      result.add(elementId);
    }
  });

  return allElements.filter(el => result.has(el.id));
}

export function alignElementsLeft(
  elements: Element[],
  bounds: AlignmentBounds,
  options: AlignmentOptions = {}
): Element[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const targetX = bounds.left;

  return elements.map(element => {
    if (opts.preserveRelativePositions) {
      // Maintain relative spacing within groups
      const offset = element.x - bounds.left;
      return { ...element, x: targetX + offset };
    } else {
      // Align all to same X position
      return { ...element, x: targetX };
    }
  });
}

export function alignElementsRight(
  elements: Element[],
  bounds: AlignmentBounds,
  options: AlignmentOptions = {}
): Element[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const targetX = bounds.right;

  return elements.map(element => {
    if (opts.preserveRelativePositions) {
      const offset = (element.x + element.width) - bounds.right;
      return { ...element, x: targetX - element.width + offset };
    } else {
      return { ...element, x: targetX - element.width };
    }
  });
}

export function alignElementsCenter(
  elements: Element[],
  bounds: AlignmentBounds,
  options: AlignmentOptions = {}
): Element[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const targetX = bounds.centerX;

  return elements.map(element => {
    if (opts.preserveRelativePositions) {
      const elementCenterX = element.x + element.width / 2;
      const offset = elementCenterX - bounds.centerX;
      return { ...element, x: targetX - element.width / 2 + offset };
    } else {
      return { ...element, x: targetX - element.width / 2 };
    }
  });
}

export function alignElementsTop(
  elements: Element[],
  bounds: AlignmentBounds,
  options: AlignmentOptions = {}
): Element[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const targetY = bounds.top;

  return elements.map(element => {
    if (opts.preserveRelativePositions) {
      const offset = element.y - bounds.top;
      return { ...element, y: targetY + offset };
    } else {
      return { ...element, y: targetY };
    }
  });
}

export function alignElementsBottom(
  elements: Element[],
  bounds: AlignmentBounds,
  options: AlignmentOptions = {}
): Element[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const targetY = bounds.bottom;

  return elements.map(element => {
    if (opts.preserveRelativePositions) {
      const offset = (element.y + element.height) - bounds.bottom;
      return { ...element, y: targetY - element.height + offset };
    } else {
      return { ...element, y: targetY - element.height };
    }
  });
}

export function alignElementsMiddle(
  elements: Element[],
  bounds: AlignmentBounds,
  options: AlignmentOptions = {}
): Element[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const targetY = bounds.centerY;

  return elements.map(element => {
    if (opts.preserveRelativePositions) {
      const elementCenterY = element.y + element.height / 2;
      const offset = elementCenterY - bounds.centerY;
      return { ...element, y: targetY - element.height / 2 + offset };
    } else {
      return { ...element, y: targetY - element.height / 2 };
    }
  });
}

export function validateAlignment(elements: Element[]): boolean {
  return elements.length >= 2;
}

export function getAlignmentPreview(
  elements: Element[],
  alignmentType: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom',
  bounds: AlignmentBounds,
  options: AlignmentOptions = {}
): Element[] {
  switch (alignmentType) {
    case 'left':
      return alignElementsLeft(elements, bounds, options);
    case 'center':
      return alignElementsCenter(elements, bounds, options);
    case 'right':
      return alignElementsRight(elements, bounds, options);
    case 'top':
      return alignElementsTop(elements, bounds, options);
    case 'middle':
      return alignElementsMiddle(elements, bounds, options);
    case 'bottom':
      return alignElementsBottom(elements, bounds, options);
    default:
      return elements;
  }
}