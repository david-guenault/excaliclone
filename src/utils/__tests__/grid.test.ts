// ABOUTME: Tests for grid utilities - snapping, rendering, and calculations
// ABOUTME: Comprehensive test coverage for grid system functionality

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  snapPointToGrid,
  snapPointToGridWithDistance,
  renderGrid,
  getNearestGridPoint,
  getGridPointsInArea,
  isPointNearGrid,
  getGridMetrics,
} from '../grid';
import type { Point, GridSettings } from '../../types';

describe('Grid Utilities', () => {
  let mockGridSettings: GridSettings;
  let mockCanvas: HTMLCanvasElement;
  let mockContext: CanvasRenderingContext2D;

  beforeEach(() => {
    mockGridSettings = {
      enabled: true,
      size: 20,
      snapToGrid: true,
      snapDistance: 10,
      showGrid: true,
      color: '#c1c5c9',
      opacity: 0.6,
    };

    // Mock canvas and context
    mockCanvas = {
      width: 800,
      height: 600,
    } as HTMLCanvasElement;

    mockContext = {
      save: vi.fn(),
      restore: vi.fn(),
      scale: vi.fn(),
      translate: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      setLineDash: vi.fn(),
      canvas: mockCanvas,
      strokeStyle: '',
      globalAlpha: 0,
      lineWidth: 0,
    } as any;
  });

  describe('snapPointToGrid', () => {
    it('snaps point to nearest grid intersection', () => {
      const point: Point = { x: 23, y: 17 };
      const result = snapPointToGrid(point, mockGridSettings);
      
      expect(result).toEqual({ x: 20, y: 20 });
    });

    it('snaps to exact grid point when point is already on grid', () => {
      const point: Point = { x: 40, y: 60 };
      const result = snapPointToGrid(point, mockGridSettings);
      
      expect(result).toEqual({ x: 40, y: 60 });
    });

    it('returns original point when grid disabled', () => {
      const point: Point = { x: 23, y: 17 };
      const disabledGrid = { ...mockGridSettings, enabled: false };
      const result = snapPointToGrid(point, disabledGrid);
      
      expect(result).toEqual(point);
    });

    it('returns original point when snap disabled', () => {
      const point: Point = { x: 23, y: 17 };
      const noSnapGrid = { ...mockGridSettings, snapToGrid: false };
      const result = snapPointToGrid(point, noSnapGrid);
      
      expect(result).toEqual(point);
    });

    it('works with different grid sizes', () => {
      const point: Point = { x: 37, y: 23 };
      const largeGrid = { ...mockGridSettings, size: 50 };
      const result = snapPointToGrid(point, largeGrid);
      
      expect(result).toEqual({ x: 50, y: 0 });
    });

    it('handles negative coordinates', () => {
      const point: Point = { x: -13, y: -27 };
      const result = snapPointToGrid(point, mockGridSettings);
      
      expect(result).toEqual({ x: -20, y: -20 });
    });
  });

  describe('snapPointToGridWithDistance', () => {
    it('snaps when point is within snap distance', () => {
      const point: Point = { x: 25, y: 18 }; // 5 pixels from (20, 20)
      const result = snapPointToGridWithDistance(point, mockGridSettings);
      
      expect(result).toEqual({ x: 20, y: 20 });
    });

    it('does not snap when point is outside snap distance', () => {
      const point: Point = { x: 50, y: 50 }; // 15 pixels from nearest grid point (40,40)
      const result = snapPointToGridWithDistance(point, mockGridSettings);
      
      expect(result).toEqual(point);
    });

    it('respects snap distance setting', () => {
      const point: Point = { x: 25, y: 25 }; // ~7 pixels from (20, 20)
      const tightSnapGrid = { ...mockGridSettings, snapDistance: 5 };
      const result = snapPointToGridWithDistance(point, tightSnapGrid);
      
      expect(result).toEqual(point); // Should not snap with tight distance
    });

    it('returns original point when grid disabled', () => {
      const point: Point = { x: 21, y: 19 };
      const disabledGrid = { ...mockGridSettings, enabled: false };
      const result = snapPointToGridWithDistance(point, disabledGrid);
      
      expect(result).toEqual(point);
    });
  });

  describe('renderGrid', () => {
    const mockViewport = {
      zoom: 1,
      pan: { x: 0, y: 0 },
      bounds: { width: 800, height: 600 },
    };

    it('does not render when grid disabled', () => {
      const disabledGrid = { ...mockGridSettings, enabled: false };
      renderGrid(mockContext, disabledGrid, mockViewport);
      
      expect(mockContext.beginPath).not.toHaveBeenCalled();
    });

    it('does not render when grid not visible', () => {
      const invisibleGrid = { ...mockGridSettings, showGrid: false };
      renderGrid(mockContext, invisibleGrid, mockViewport);
      
      expect(mockContext.beginPath).not.toHaveBeenCalled();
    });

    it('renders grid lines when enabled and visible', () => {
      renderGrid(mockContext, mockGridSettings, mockViewport);
      
      expect(mockContext.save).toHaveBeenCalled();
      expect(mockContext.strokeStyle).toBe('#c1c5c9');
      expect(mockContext.globalAlpha).toBe(0.6);
      expect(mockContext.beginPath).toHaveBeenCalled();
      expect(mockContext.stroke).toHaveBeenCalled();
      expect(mockContext.restore).toHaveBeenCalled();
    });

    it('applies viewport transformations', () => {
      const zoomedViewport = {
        zoom: 2,
        pan: { x: 50, y: 30 },
        bounds: { width: 800, height: 600 },
      };
      
      renderGrid(mockContext, mockGridSettings, zoomedViewport);
      
      expect(mockContext.scale).toHaveBeenCalledWith(2, 2);
      expect(mockContext.translate).toHaveBeenCalledWith(50, 30);
      expect(mockContext.lineWidth).toBe(0.25); // 0.5 / zoom
    });

    it('optimizes grid line drawing for viewport bounds', () => {
      renderGrid(mockContext, mockGridSettings, mockViewport);
      
      // Should call moveTo and lineTo for drawing lines
      expect(mockContext.moveTo).toHaveBeenCalled();
      expect(mockContext.lineTo).toHaveBeenCalled();
      expect(mockContext.stroke).toHaveBeenCalledTimes(2); // Once for vertical, once for horizontal
    });
  });

  describe('getNearestGridPoint', () => {
    it('returns nearest grid intersection', () => {
      const point: Point = { x: 17, y: 33 };
      const result = getNearestGridPoint(point, mockGridSettings);
      
      expect(result).toEqual({ x: 20, y: 40 });
    });

    it('returns original point when grid disabled', () => {
      const point: Point = { x: 17, y: 33 };
      const disabledGrid = { ...mockGridSettings, enabled: false };
      const result = getNearestGridPoint(point, disabledGrid);
      
      expect(result).toEqual(point);
    });

    it('works with different grid sizes', () => {
      const point: Point = { x: 67, y: 23 };
      const grid30 = { ...mockGridSettings, size: 30 };
      const result = getNearestGridPoint(point, grid30);
      
      expect(result).toEqual({ x: 60, y: 30 });
    });
  });

  describe('getGridPointsInArea', () => {
    it('returns grid points within specified area', () => {
      const area = { x: 15, y: 15, width: 30, height: 30 };
      const points = getGridPointsInArea(area, mockGridSettings);
      
      expect(points).toContainEqual({ x: 20, y: 20 });
      expect(points).toContainEqual({ x: 40, y: 20 });
      expect(points).toContainEqual({ x: 20, y: 40 });
      expect(points).toContainEqual({ x: 40, y: 40 });
      expect(points.length).toBeGreaterThan(0);
    });

    it('returns empty array when grid disabled', () => {
      const area = { x: 15, y: 15, width: 30, height: 30 };
      const disabledGrid = { ...mockGridSettings, enabled: false };
      const points = getGridPointsInArea(area, disabledGrid);
      
      expect(points).toEqual([]);
    });

    it('adjusts to grid boundaries correctly', () => {
      const area = { x: 0, y: 0, width: 20, height: 20 };
      const points = getGridPointsInArea(area, mockGridSettings);
      
      expect(points).toContainEqual({ x: 0, y: 0 });
      expect(points).toContainEqual({ x: 20, y: 0 });
      expect(points).toContainEqual({ x: 0, y: 20 });
      expect(points).toContainEqual({ x: 20, y: 20 });
    });
  });

  describe('isPointNearGrid', () => {
    it('returns true when point is within snap distance of grid', () => {
      const point: Point = { x: 23, y: 17 }; // 5 pixels from (20, 20)
      const result = isPointNearGrid(point, mockGridSettings);
      
      expect(result).toBe(true);
    });

    it('returns false when point is outside snap distance', () => {
      const point: Point = { x: 50, y: 50 }; // 15 pixels from nearest grid intersection (40,40)
      const result = isPointNearGrid(point, mockGridSettings);
      
      expect(result).toBe(false);
    });

    it('returns false when grid disabled', () => {
      const point: Point = { x: 21, y: 19 }; // Very close to grid
      const disabledGrid = { ...mockGridSettings, enabled: false };
      const result = isPointNearGrid(point, disabledGrid);
      
      expect(result).toBe(false);
    });

    it('respects snap distance setting', () => {
      const point: Point = { x: 27, y: 27 }; // ~10 pixels from (20, 20)
      const tightGrid = { ...mockGridSettings, snapDistance: 5 };
      const result = isPointNearGrid(point, tightGrid);
      
      expect(result).toBe(false);
    });
  });

  describe('getGridMetrics', () => {
    it('calculates basic grid metrics', () => {
      const metrics = getGridMetrics(mockGridSettings, 1);
      
      expect(metrics.size).toBe(20);
      expect(metrics.scaledSize).toBe(20);
      expect(metrics.density).toBe('normal');
      expect(metrics.visible).toBe(true);
    });

    it('adjusts metrics for zoom level', () => {
      const metrics = getGridMetrics(mockGridSettings, 2);
      
      expect(metrics.size).toBe(20);
      expect(metrics.scaledSize).toBe(40);
      expect(metrics.density).toBe('normal');
      expect(metrics.visible).toBe(true);
    });

    it('detects dense grid at high zoom', () => {
      const metrics = getGridMetrics(mockGridSettings, 0.3);
      
      expect(metrics.scaledSize).toBe(6);
      expect(metrics.density).toBe('dense');
      expect(metrics.visible).toBe(true);
    });

    it('detects invisible grid when too small', () => {
      const metrics = getGridMetrics(mockGridSettings, 0.1);
      
      expect(metrics.scaledSize).toBe(2);
      expect(metrics.visible).toBe(false);
    });

    it('handles different grid sizes', () => {
      const largeGrid = { ...mockGridSettings, size: 50 };
      const metrics = getGridMetrics(largeGrid, 0.5);
      
      expect(metrics.size).toBe(50);
      expect(metrics.scaledSize).toBe(25);
      expect(metrics.density).toBe('normal');
      expect(metrics.visible).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('handles zero grid size gracefully', () => {
      const zeroGrid = { ...mockGridSettings, size: 0 };
      const point: Point = { x: 10, y: 10 };
      
      // Should not throw or cause division by zero
      expect(() => {
        snapPointToGrid(point, zeroGrid);
        getNearestGridPoint(point, zeroGrid);
      }).not.toThrow();
    });

    it('handles very large coordinates', () => {
      const point: Point = { x: 1000000, y: 1000000 };
      const result = snapPointToGrid(point, mockGridSettings);
      
      expect(result.x).toBe(1000000);
      expect(result.y).toBe(1000000);
    });

    it('handles fractional grid sizes', () => {
      const fractionalGrid = { ...mockGridSettings, size: 12.5 };
      const point: Point = { x: 20, y: 20 };
      const result = snapPointToGrid(point, fractionalGrid);
      
      expect(result.x).toBe(25); // Nearest multiple of 12.5
      expect(result.y).toBe(25);
    });

    it('handles extreme zoom levels', () => {
      const metrics1 = getGridMetrics(mockGridSettings, 0.01);
      const metrics2 = getGridMetrics(mockGridSettings, 100);
      
      expect(metrics1.visible).toBe(false);
      expect(metrics2.visible).toBe(true);
      expect(metrics2.scaledSize).toBe(2000);
    });
  });
});