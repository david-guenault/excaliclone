// ABOUTME: Magnetic grid system utilities for intelligent element snapping
// ABOUTME: Provides magnetic field calculations, nearest point detection, and snap assistance

import type { Point, Element } from '../types';

export interface MagneticPoint {
  x: number;
  y: number;
  type: 'grid' | 'element-edge' | 'element-center' | 'element-corner';
  elementId?: string;
  strength?: number;
}

export interface MagneticConfig {
  enabled: boolean;
  strength: number;      // Magnetic attraction strength (10-50px)
  radius: number;        // Detection radius for magnetic fields (20-100px)
  gridEnabled: boolean;  // Enable grid intersection magnetism
  elementEnabled: boolean; // Enable element-to-element magnetism
}

/**
 * Calculate magnetic field strength at a given point
 * Uses inverse square law with minimum and maximum thresholds
 */
export function calculateMagneticField(
  point: Point, 
  magneticPoint: Point, 
  magneticStrength: number
): number {
  const distance = Math.sqrt(
    Math.pow(point.x - magneticPoint.x, 2) + Math.pow(point.y - magneticPoint.y, 2)
  );
  
  // No magnetic effect beyond the strength radius
  if (distance > magneticStrength) {
    return 0;
  }
  
  // Maximum effect at the center
  if (distance < 1) {
    return magneticStrength;
  }
  
  // Inverse square law with smooth falloff
  const fieldStrength = magneticStrength * (1 - (distance / magneticStrength));
  return Math.max(0, fieldStrength);
}

/**
 * Find the nearest magnetic point within the detection radius
 */
export function findNearestMagneticPoint(
  point: Point, 
  magneticPoints: MagneticPoint[], 
  magneticRadius: number
): MagneticPoint | null {
  let nearestPoint: MagneticPoint | null = null;
  let nearestDistance = Infinity;
  
  for (const magneticPoint of magneticPoints) {
    const distance = Math.sqrt(
      Math.pow(point.x - magneticPoint.x, 2) + Math.pow(point.y - magneticPoint.y, 2)
    );
    
    // Only consider points within the magnetic radius
    if (distance <= magneticRadius && distance < nearestDistance) {
      nearestDistance = distance;
      nearestPoint = magneticPoint;
    }
  }
  
  return nearestPoint;
}

/**
 * Generate grid intersection magnetic points
 */
export function generateGridMagneticPoints(
  viewport: { pan: Point; zoom: number; bounds: { x: number; y: number; width: number; height: number } },
  gridSize: number
): MagneticPoint[] {
  const points: MagneticPoint[] = [];
  
  // Calculate visible grid bounds in world coordinates
  const worldBounds = {
    left: -viewport.pan.x / viewport.zoom,
    top: -viewport.pan.y / viewport.zoom,
    right: (-viewport.pan.x + viewport.bounds.width) / viewport.zoom,
    bottom: (-viewport.pan.y + viewport.bounds.height) / viewport.zoom,
  };
  
  // Expand bounds slightly to include magnetic points just outside viewport
  const margin = 100; // pixels
  const expandedBounds = {
    left: worldBounds.left - margin,
    top: worldBounds.top - margin,
    right: worldBounds.right + margin,
    bottom: worldBounds.bottom + margin,
  };
  
  // Find the grid lines that intersect with the expanded viewport
  const startX = Math.floor(expandedBounds.left / gridSize) * gridSize;
  const endX = Math.ceil(expandedBounds.right / gridSize) * gridSize;
  const startY = Math.floor(expandedBounds.top / gridSize) * gridSize;
  const endY = Math.ceil(expandedBounds.bottom / gridSize) * gridSize;
  
  // Generate grid intersection points
  for (let x = startX; x <= endX; x += gridSize) {
    for (let y = startY; y <= endY; y += gridSize) {
      points.push({
        x,
        y,
        type: 'grid',
        strength: 1.0, // Full strength for grid points
      });
    }
  }
  
  return points;
}

/**
 * Generate magnetic points from elements (edges, centers, corners)
 */
export function generateElementMagneticPoints(
  elements: Element[],
  viewport: { pan: Point; zoom: number; bounds: { x: number; y: number; width: number; height: number } }
): MagneticPoint[] {
  const points: MagneticPoint[] = [];
  
  // Calculate visible bounds in world coordinates
  const worldBounds = {
    left: -viewport.pan.x / viewport.zoom,
    top: -viewport.pan.y / viewport.zoom,
    right: (-viewport.pan.x + viewport.bounds.width) / viewport.zoom,
    bottom: (-viewport.pan.y + viewport.bounds.height) / viewport.zoom,
  };
  
  // Expand bounds for magnetic detection
  const margin = 100;
  const expandedBounds = {
    left: worldBounds.left - margin,
    top: worldBounds.top - margin,
    right: worldBounds.right + margin,
    bottom: worldBounds.bottom + margin,
  };
  
  for (const element of elements) {
    // Skip elements completely outside the expanded viewport
    if (element.x + element.width < expandedBounds.left ||
        element.x > expandedBounds.right ||
        element.y + element.height < expandedBounds.top ||
        element.y > expandedBounds.bottom) {
      continue;
    }
    
    // Element center
    points.push({
      x: element.x + element.width / 2,
      y: element.y + element.height / 2,
      type: 'element-center',
      elementId: element.id,
      strength: 0.8, // Strong attraction to centers
    });
    
    // Element corners
    points.push(
      {
        x: element.x,
        y: element.y,
        type: 'element-corner',
        elementId: element.id,
        strength: 0.9, // Very strong attraction to corners
      },
      {
        x: element.x + element.width,
        y: element.y,
        type: 'element-corner',
        elementId: element.id,
        strength: 0.9,
      },
      {
        x: element.x,
        y: element.y + element.height,
        type: 'element-corner',
        elementId: element.id,
        strength: 0.9,
      },
      {
        x: element.x + element.width,
        y: element.y + element.height,
        type: 'element-corner',
        elementId: element.id,
        strength: 0.9,
      }
    );
    
    // Element edge midpoints
    points.push(
      // Top edge
      {
        x: element.x + element.width / 2,
        y: element.y,
        type: 'element-edge',
        elementId: element.id,
        strength: 0.7,
      },
      // Bottom edge
      {
        x: element.x + element.width / 2,
        y: element.y + element.height,
        type: 'element-edge',
        elementId: element.id,
        strength: 0.7,
      },
      // Left edge
      {
        x: element.x,
        y: element.y + element.height / 2,
        type: 'element-edge',
        elementId: element.id,
        strength: 0.7,
      },
      // Right edge
      {
        x: element.x + element.width,
        y: element.y + element.height / 2,
        type: 'element-edge',
        elementId: element.id,
        strength: 0.7,
      }
    );
  }
  
  return points;
}

/**
 * Get magnetic snap point if any magnetic field is detected
 */
export function getMagneticSnapPoint(
  point: Point,
  gridSize: number,
  magneticStrength: number,
  magneticEnabled: boolean,
  elements?: Element[],
  viewport?: { pan: Point; zoom: number; bounds: { x: number; y: number; width: number; height: number } },
  config?: Partial<MagneticConfig>
): Point | null {
  if (!magneticEnabled) {
    return null;
  }
  
  const magneticConfig: MagneticConfig = {
    enabled: true,
    strength: magneticStrength,
    radius: magneticStrength * 1.2, // Slightly larger detection radius
    gridEnabled: true,
    elementEnabled: true,
    ...config,
  };
  
  const allMagneticPoints: MagneticPoint[] = [];
  
  // Add grid magnetic points if enabled
  if (magneticConfig.gridEnabled && viewport) {
    const gridPoints = generateGridMagneticPoints(viewport, gridSize);
    allMagneticPoints.push(...gridPoints);
  }
  
  // Add element magnetic points if enabled
  if (magneticConfig.elementEnabled && elements && viewport) {
    const elementPoints = generateElementMagneticPoints(elements, viewport);
    allMagneticPoints.push(...elementPoints);
  }
  
  // Find the nearest magnetic point
  const nearestMagneticPoint = findNearestMagneticPoint(
    point, 
    allMagneticPoints, 
    magneticConfig.radius
  );
  
  if (!nearestMagneticPoint) {
    return null;
  }
  
  // Calculate the magnetic field strength
  const fieldStrength = calculateMagneticField(
    point, 
    nearestMagneticPoint, 
    magneticConfig.strength
  );
  
  // Apply magnetic attraction with point type weighting
  const pointTypeStrength = nearestMagneticPoint.strength || 1.0;
  const totalStrength = fieldStrength * pointTypeStrength;
  
  // Minimum threshold for magnetic snap
  if (totalStrength < magneticConfig.strength * 0.3) {
    return null;
  }
  
  // Return the magnetic snap point
  return {
    x: nearestMagneticPoint.x,
    y: nearestMagneticPoint.y,
  };
}

/**
 * Apply magnetic snapping to a point during drawing or moving operations
 * This is the main function called by drawing tools
 */
export function applyMagneticSnapping(
  point: Point,
  context: {
    gridSize: number;
    magneticConfig: MagneticConfig;
    elements: Element[];
    viewport: { pan: Point; zoom: number; bounds: { x: number; y: number; width: number; height: number } };
    excludeElementId?: string; // Exclude this element from magnetism (when moving)
    operation: 'drawing' | 'moving' | 'resizing';
  }
): Point {
  if (!context.magneticConfig.enabled) {
    return point;
  }
  
  // Filter out the element being moved/resized to avoid self-magnetism
  const elementsForMagnetism = context.excludeElementId 
    ? context.elements.filter(el => el.id !== context.excludeElementId)
    : context.elements;
  
  // Adjust magnetic strength based on operation type
  const adjustedConfig = { ...context.magneticConfig };
  
  switch (context.operation) {
    case 'drawing':
      // Full magnetic strength for drawing
      break;
    case 'moving':
      // Slightly reduced magnetic strength for moving to avoid jumpiness
      adjustedConfig.strength *= 0.8;
      break;
    case 'resizing':
      // Reduced magnetic strength for resizing
      adjustedConfig.strength *= 0.6;
      break;
  }
  
  const snapPoint = getMagneticSnapPoint(
    point,
    context.gridSize,
    adjustedConfig.strength,
    adjustedConfig.enabled,
    elementsForMagnetism,
    context.viewport,
    adjustedConfig
  );
  
  return snapPoint || point;
}

/**
 * Get all magnetic points near a given point for visual indicators
 */
export function getMagneticPointsNearPoint(
  point: Point,
  context: {
    gridSize: number;
    magneticConfig: MagneticConfig;
    elements: Element[];
    viewport: { pan: Point; zoom: number; bounds: { x: number; y: number; width: number; height: number } };
    excludeElementId?: string;
  }
): MagneticPoint[] {
  if (!context.magneticConfig.enabled) {
    return [];
  }
  
  const allMagneticPoints: MagneticPoint[] = [];
  
  // Add grid points
  if (context.magneticConfig.gridEnabled) {
    const gridPoints = generateGridMagneticPoints(context.viewport, context.gridSize);
    allMagneticPoints.push(...gridPoints);
  }
  
  // Add element points
  if (context.magneticConfig.elementEnabled) {
    const elementsForMagnetism = context.excludeElementId 
      ? context.elements.filter(el => el.id !== context.excludeElementId)
      : context.elements;
    
    const elementPoints = generateElementMagneticPoints(elementsForMagnetism, context.viewport);
    allMagneticPoints.push(...elementPoints);
  }
  
  // Filter points within the detection radius
  return allMagneticPoints.filter(magneticPoint => {
    const distance = Math.sqrt(
      Math.pow(point.x - magneticPoint.x, 2) + Math.pow(point.y - magneticPoint.y, 2)
    );
    return distance <= context.magneticConfig.radius;
  });
}