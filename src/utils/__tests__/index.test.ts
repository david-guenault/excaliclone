// ABOUTME: Tests for utility functions - geometric calculations and element manipulation
// ABOUTME: Comprehensive test coverage for all utility functions

import { describe, it, expect } from 'vitest';
import {
  generateId,
  distance,
  isPointInRect,
  getElementBounds,
  transformPoint,
  inverseTransformPoint,
} from '../index';
import type { Point, Rect, Element } from '../../types';

describe('Utility Functions', () => {
  describe('generateId', () => {
    it('returns a string', () => {
      const id = generateId();
      expect(typeof id).toBe('string');
    });

    it('returns different values on multiple calls', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });

    it('returns non-empty string', () => {
      const id = generateId();
      expect(id.length).toBeGreaterThan(0);
    });

    it('returns string of expected length', () => {
      const id = generateId();
      expect(id.length).toBe(9);
    });
  });

  describe('distance', () => {
    it('calculates correct distance between two points', () => {
      const p1: Point = { x: 0, y: 0 };
      const p2: Point = { x: 3, y: 4 };
      expect(distance(p1, p2)).toBe(5);
    });

    it('returns 0 for identical points', () => {
      const p1: Point = { x: 5, y: 10 };
      const p2: Point = { x: 5, y: 10 };
      expect(distance(p1, p2)).toBe(0);
    });

    it('handles negative coordinates', () => {
      const p1: Point = { x: -3, y: -4 };
      const p2: Point = { x: 0, y: 0 };
      expect(distance(p1, p2)).toBe(5);
    });

    it('returns positive number', () => {
      const p1: Point = { x: -10, y: -5 };
      const p2: Point = { x: 5, y: 10 };
      const result = distance(p1, p2);
      expect(result).toBeGreaterThan(0);
    });
  });

  describe('isPointInRect', () => {
    const rect: Rect = { x: 10, y: 20, width: 100, height: 50 };

    it('returns true for point inside rectangle', () => {
      const point: Point = { x: 50, y: 40 };
      expect(isPointInRect(point, rect)).toBe(true);
    });

    it('returns false for point outside rectangle', () => {
      const point: Point = { x: 5, y: 10 };
      expect(isPointInRect(point, rect)).toBe(false);
    });

    it('returns true for point on rectangle boundary', () => {
      const topLeft: Point = { x: 10, y: 20 };
      const bottomRight: Point = { x: 110, y: 70 };
      
      expect(isPointInRect(topLeft, rect)).toBe(true);
      expect(isPointInRect(bottomRight, rect)).toBe(true);
    });

    it('handles edge cases with zero width/height rectangles', () => {
      const zeroRect: Rect = { x: 0, y: 0, width: 0, height: 0 };
      const point: Point = { x: 0, y: 0 };
      expect(isPointInRect(point, zeroRect)).toBe(true);
    });
  });

  describe('getElementBounds', () => {
    it('returns correct Rect from Element', () => {
      const element: Element = {
        id: 'test',
        type: 'rectangle',
        x: 10,
        y: 20,
        width: 100,
        height: 50,
        angle: 0,
        strokeColor: '#000',
        backgroundColor: 'transparent',
        strokeWidth: 2,
        roughness: 1,
        opacity: 1,
      };

      const bounds = getElementBounds(element);
      expect(bounds).toEqual({
        x: 10,
        y: 20,
        width: 100,
        height: 50,
      });
    });

    it('handles all element properties correctly', () => {
      const element: Element = {
        id: 'test-circle',
        type: 'circle',
        x: 0,
        y: 0,
        width: 80,
        height: 80,
        angle: Math.PI / 4,
        strokeColor: '#ff0000',
        backgroundColor: '#00ff00',
        strokeWidth: 5,
        roughness: 2,
        opacity: 0.5,
        text: 'test text',
        points: [{ x: 0, y: 0 }, { x: 10, y: 10 }],
      };

      const bounds = getElementBounds(element);
      expect(bounds).toEqual({
        x: 0,
        y: 0,
        width: 80,
        height: 80,
      });
    });
  });

  describe('transformPoint', () => {
    it('correctly applies zoom transformation', () => {
      const point: Point = { x: 100, y: 200 };
      const zoom = 2;
      const pan: Point = { x: 0, y: 0 };
      
      const result = transformPoint(point, zoom, pan);
      expect(result).toEqual({ x: 200, y: 400 });
    });

    it('correctly applies pan transformation', () => {
      const point: Point = { x: 100, y: 200 };
      const zoom = 1;
      const pan: Point = { x: 50, y: 100 };
      
      const result = transformPoint(point, zoom, pan);
      expect(result).toEqual({ x: 50, y: 100 });
    });

    it('correctly applies combined zoom + pan', () => {
      const point: Point = { x: 100, y: 200 };
      const zoom = 2;
      const pan: Point = { x: 50, y: 100 };
      
      const result = transformPoint(point, zoom, pan);
      expect(result).toEqual({ x: 100, y: 200 });
    });

    it('handles edge cases with zero zoom', () => {
      const point: Point = { x: 100, y: 200 };
      const zoom = 0;
      const pan: Point = { x: 0, y: 0 };
      
      const result = transformPoint(point, zoom, pan);
      expect(result).toEqual({ x: 0, y: 0 });
    });

    it('handles extreme values', () => {
      const point: Point = { x: 1000000, y: -1000000 };
      const zoom = 0.001;
      const pan: Point = { x: 500000, y: -500000 };
      
      const result = transformPoint(point, zoom, pan);
      expect(result.x).toBeCloseTo(500);
      expect(result.y).toBeCloseTo(-500);
    });
  });

  describe('inverseTransformPoint', () => {
    it('correctly reverses zoom transformation', () => {
      const point: Point = { x: 200, y: 400 };
      const zoom = 2;
      const pan: Point = { x: 0, y: 0 };
      
      const result = inverseTransformPoint(point, zoom, pan);
      expect(result).toEqual({ x: 100, y: 200 });
    });

    it('correctly reverses pan transformation', () => {
      const point: Point = { x: 50, y: 100 };
      const zoom = 1;
      const pan: Point = { x: 50, y: 100 };
      
      const result = inverseTransformPoint(point, zoom, pan);
      expect(result).toEqual({ x: 100, y: 200 });
    });

    it('correctly reverses combined zoom + pan', () => {
      const point: Point = { x: 100, y: 200 };
      const zoom = 2;
      const pan: Point = { x: 50, y: 100 };
      
      const result = inverseTransformPoint(point, zoom, pan);
      expect(result).toEqual({ x: 100, y: 200 });
    });

    it('inverseTransformPoint reverses transformPoint', () => {
      const originalPoint: Point = { x: 123.456, y: 789.012 };
      const zoom = 1.5;
      const pan: Point = { x: 25.5, y: 37.8 };
      
      const transformed = transformPoint(originalPoint, zoom, pan);
      const reversed = inverseTransformPoint(transformed, zoom, pan);
      
      expect(reversed.x).toBeCloseTo(originalPoint.x);
      expect(reversed.y).toBeCloseTo(originalPoint.y);
    });

    it('handles division by zero zoom safely', () => {
      const point: Point = { x: 100, y: 200 };
      const zoom = 0;
      const pan: Point = { x: 0, y: 0 };
      
      const result = inverseTransformPoint(point, zoom, pan);
      expect(result.x).toBe(Infinity);
      expect(result.y).toBe(Infinity);
    });
  });
});