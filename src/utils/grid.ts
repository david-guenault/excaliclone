// ABOUTME: Grid utilities for snapping and rendering
// ABOUTME: Grid calculations, snap-to-grid functionality, and visual grid rendering

import type { Point, GridSettings } from '../types';

/**
 * Snaps a point to the nearest grid intersection
 */
export function snapPointToGrid(point: Point, gridSettings: GridSettings): Point {
  if (!gridSettings.enabled || !gridSettings.snapToGrid) {
    return point;
  }

  const { size } = gridSettings;
  return {
    x: Math.round(point.x / size) * size,
    y: Math.round(point.y / size) * size,
  };
}

/**
 * Snaps a point to grid if close enough (within snap distance)
 */
export function snapPointToGridWithDistance(point: Point, gridSettings: GridSettings): Point {
  if (!gridSettings.enabled || !gridSettings.snapToGrid) {
    return point;
  }

  const { size, snapDistance } = gridSettings;
  const snappedPoint = snapPointToGrid(point, gridSettings);
  
  // Check if point is close enough to snap
  const distance = Math.sqrt(
    Math.pow(point.x - snappedPoint.x, 2) + Math.pow(point.y - snappedPoint.y, 2)
  );
  
  return distance <= snapDistance ? snappedPoint : point;
}

/**
 * Renders grid lines on a canvas context
 */
export function renderGrid(
  ctx: CanvasRenderingContext2D,
  gridSettings: GridSettings,
  viewport: { zoom: number; pan: Point; bounds: { width: number; height: number } }
): void {
  if (!gridSettings.enabled || !gridSettings.showGrid) {
    return;
  }

  const { size, color, opacity } = gridSettings;
  const { zoom, pan } = viewport;

  // Save context state
  ctx.save();

  // Create a fixed grid that extends beyond the visible area
  // Use large fixed bounds centered on world origin (0,0), not viewport center
  const gridExtent = 10000; // Large fixed extent in world coordinates
  
  const startX = Math.floor(-gridExtent / size) * size;
  const endX = Math.ceil(gridExtent / size) * size;
  const startY = Math.floor(-gridExtent / size) * size;
  const endY = Math.ceil(gridExtent / size) * size;

  // Apply the same viewport transformations as elements
  ctx.scale(zoom, zoom);
  ctx.translate(-pan.x, -pan.y);

  // Set grid line style with improved visibility
  ctx.strokeStyle = color;
  ctx.globalAlpha = Math.max(0.4, opacity); // Ensure minimum visibility
  ctx.lineWidth = 1 / zoom; // Scale line width with zoom like elements
  ctx.setLineDash([]);

  // Draw vertical lines in world coordinates (same system as elements)
  ctx.beginPath();
  for (let x = startX; x <= endX; x += size) {
    ctx.moveTo(x, startY);
    ctx.lineTo(x, endY);
  }
  ctx.stroke();

  // Draw horizontal lines in world coordinates (same system as elements)
  ctx.beginPath();
  for (let y = startY; y <= endY; y += size) {
    ctx.moveTo(startX, y);
    ctx.lineTo(endX, y);
  }
  ctx.stroke();

  // Restore context state
  ctx.restore();
}

/**
 * Gets the nearest grid point to a given point
 */
export function getNearestGridPoint(point: Point, gridSettings: GridSettings): Point {
  if (!gridSettings.enabled) {
    return point;
  }

  const { size } = gridSettings;
  return {
    x: Math.round(point.x / size) * size,
    y: Math.round(point.y / size) * size,
  };
}

/**
 * Gets all grid points within a rectangular area
 */
export function getGridPointsInArea(
  area: { x: number; y: number; width: number; height: number },
  gridSettings: GridSettings
): Point[] {
  if (!gridSettings.enabled) {
    return [];
  }

  const { size } = gridSettings;
  const points: Point[] = [];

  const startX = Math.floor(area.x / size) * size;
  const endX = Math.ceil((area.x + area.width) / size) * size;
  const startY = Math.floor(area.y / size) * size;
  const endY = Math.ceil((area.y + area.height) / size) * size;

  for (let x = startX; x <= endX; x += size) {
    for (let y = startY; y <= endY; y += size) {
      points.push({ x, y });
    }
  }

  return points;
}

/**
 * Checks if a point is close to a grid intersection
 */
export function isPointNearGrid(point: Point, gridSettings: GridSettings): boolean {
  if (!gridSettings.enabled) {
    return false;
  }

  const nearestGrid = getNearestGridPoint(point, gridSettings);
  const distance = Math.sqrt(
    Math.pow(point.x - nearestGrid.x, 2) + Math.pow(point.y - nearestGrid.y, 2)
  );

  return distance <= gridSettings.snapDistance;
}

/**
 * Calculates grid metrics for display purposes
 */
export function getGridMetrics(gridSettings: GridSettings, zoom: number) {
  const { size } = gridSettings;
  const scaledSize = size * zoom;
  
  return {
    size,
    scaledSize,
    density: scaledSize > 10 ? 'normal' : 'dense',
    visible: scaledSize >= 4, // Hide grid when too small
  };
}