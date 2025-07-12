// ABOUTME: Tests for spatial indexing system
// ABOUTME: Validates quad-tree implementation and performance optimizations

import { describe, it, expect, beforeEach } from 'vitest';
import { SpatialIndex, spatialHitTest } from '../spatialIndex';
import type { Element } from '../../types';

describe('SpatialIndex', () => {
  let spatialIndex: SpatialIndex;
  let testElements: Element[];

  beforeEach(() => {
    spatialIndex = new SpatialIndex(
      { x: 0, y: 0, width: 1000, height: 1000 },
      5, // maxElements
      4  // maxDepth
    );

    // Create test elements
    testElements = [
      {
        id: 'rect1',
        type: 'rectangle',
        x: 100,
        y: 100,
        width: 50,
        height: 50,
        angle: 0,
        strokeColor: '#000000',
        backgroundColor: 'transparent',
        strokeWidth: 2,
        roughness: 1,
        opacity: 1,
        strokeStyle: 'solid',
        fillStyle: 'solid',
        cornerStyle: 'sharp',
        fontFamily: 'Excalifont',
        fontSize: 16,
        fontWeight: 'normal',
        fontStyle: 'normal',
        textAlign: 'center',
        textVerticalAlign: 'middle',
        text: '',
        locked: false,
        zIndex: 0
      },
      {
        id: 'rect2',
        type: 'rectangle',
        x: 200,
        y: 200,
        width: 75,
        height: 75,
        angle: 0,
        strokeColor: '#ff0000',
        backgroundColor: 'transparent',
        strokeWidth: 2,
        roughness: 1,
        opacity: 1,
        strokeStyle: 'solid',
        fillStyle: 'solid',
        cornerStyle: 'sharp',
        fontFamily: 'Excalifont',
        fontSize: 16,
        fontWeight: 'normal',
        fontStyle: 'normal',
        textAlign: 'center',
        textVerticalAlign: 'middle',
        text: '',
        locked: false,
        zIndex: 1
      },
      {
        id: 'circle1',
        type: 'circle',
        x: 400,
        y: 100,
        width: 60,
        height: 60,
        angle: 0,
        strokeColor: '#00ff00',
        backgroundColor: 'transparent',
        strokeWidth: 2,
        roughness: 1,
        opacity: 1,
        strokeStyle: 'solid',
        fillStyle: 'solid',
        cornerStyle: 'sharp',
        fontFamily: 'Excalifont',
        fontSize: 16,
        fontWeight: 'normal',
        fontStyle: 'normal',
        textAlign: 'center',
        textVerticalAlign: 'middle',
        text: '',
        locked: false,
        zIndex: 2
      }
    ];
  });

  describe('Basic Operations', () => {
    it('should insert elements correctly', () => {
      testElements.forEach(element => {
        spatialIndex.insert(element);
      });

      const stats = spatialIndex.getStats();
      expect(stats.totalElements).toBe(3);
    });

    it('should remove elements correctly', () => {
      testElements.forEach(element => {
        spatialIndex.insert(element);
      });

      const removed = spatialIndex.remove(testElements[0]);
      expect(removed).toBe(true);

      const stats = spatialIndex.getStats();
      expect(stats.totalElements).toBe(2);
    });

    it('should update elements correctly', () => {
      spatialIndex.insert(testElements[0]);
      
      // Update position
      const updatedElement = { ...testElements[0], x: 500, y: 500 };
      spatialIndex.update(updatedElement);

      // Query old position - should not find element
      const oldQuery = spatialIndex.query({ x: 100, y: 100, width: 50, height: 50 });
      expect(oldQuery).toHaveLength(0);

      // Query new position - should find element
      const newQuery = spatialIndex.query({ x: 500, y: 500, width: 50, height: 50 });
      expect(newQuery).toHaveLength(1);
      expect(newQuery[0].id).toBe('rect1');
    });

    it('should clear all elements', () => {
      testElements.forEach(element => {
        spatialIndex.insert(element);
      });

      spatialIndex.clear();
      const stats = spatialIndex.getStats();
      expect(stats.totalElements).toBe(0);
    });

    it('should rebuild with new elements', () => {
      spatialIndex.rebuild(testElements);
      const stats = spatialIndex.getStats();
      expect(stats.totalElements).toBe(3);
    });
  });

  describe('Spatial Queries', () => {
    beforeEach(() => {
      testElements.forEach(element => {
        spatialIndex.insert(element);
      });
    });

    it('should query rectangular regions correctly', () => {
      // Query region that contains rect1
      const query1 = spatialIndex.query({ x: 90, y: 90, width: 70, height: 70 });
      expect(query1).toHaveLength(1);
      expect(query1[0].id).toBe('rect1');

      // Query region that contains rect2
      const query2 = spatialIndex.query({ x: 180, y: 180, width: 100, height: 100 });
      expect(query2).toHaveLength(1);
      expect(query2[0].id).toBe('rect2');

      // Query large region that contains multiple elements
      const query3 = spatialIndex.query({ x: 0, y: 0, width: 500, height: 300 });
      expect(query3.length).toBeGreaterThanOrEqual(2);
    });

    it('should query point locations correctly', () => {
      // Point inside rect1
      const query1 = spatialIndex.queryPoint({ x: 125, y: 125 });
      expect(query1).toHaveLength(1);
      expect(query1[0].id).toBe('rect1');

      // Point outside all elements
      const query2 = spatialIndex.queryPoint({ x: 50, y: 50 });
      expect(query2).toHaveLength(0);

      // Point inside circle1
      const query3 = spatialIndex.queryPoint({ x: 430, y: 130 });
      expect(query3).toHaveLength(1);
      expect(query3[0].id).toBe('circle1');
    });

    it('should query circular regions correctly', () => {
      // Small circle around rect1 center
      const query1 = spatialIndex.queryCircle({ x: 125, y: 125 }, 30);
      expect(query1).toHaveLength(1);
      expect(query1[0].id).toBe('rect1');

      // Large circle that encompasses multiple elements
      const query2 = spatialIndex.queryCircle({ x: 250, y: 150 }, 200);
      expect(query2.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Performance and Statistics', () => {
    it('should provide meaningful statistics', () => {
      testElements.forEach(element => {
        spatialIndex.insert(element);
      });

      const stats = spatialIndex.getStats();
      expect(stats.totalElements).toBe(3);
      expect(stats.totalNodes).toBeGreaterThan(0);
      expect(stats.maxDepthReached).toBeGreaterThanOrEqual(0);
      expect(stats.avgElementsPerLeaf).toBeGreaterThan(0);
    });

    it('should handle subdivision when exceeding capacity', () => {
      // Create many elements in the same region to force subdivision
      const manyElements: Element[] = [];
      for (let i = 0; i < 10; i++) {
        manyElements.push({
          ...testElements[0],
          id: `elem${i}`,
          x: 100 + i * 5,
          y: 100 + i * 5,
        });
      }

      manyElements.forEach(element => {
        spatialIndex.insert(element);
      });

      const stats = spatialIndex.getStats();
      expect(stats.totalElements).toBe(10);
      expect(stats.maxDepthReached).toBeGreaterThan(0);
    });
  });

  describe('Hit Testing', () => {
    beforeEach(() => {
      testElements.forEach(element => {
        spatialIndex.insert(element);
      });
    });

    it('should perform accurate hit testing for rectangles', () => {
      // Hit inside rect1
      const hit1 = spatialHitTest(spatialIndex, { x: 125, y: 125 }, testElements);
      expect(hit1).toBeTruthy();
      expect(hit1?.id).toBe('rect1');

      // Hit outside all elements
      const hit2 = spatialHitTest(spatialIndex, { x: 50, y: 50 }, testElements);
      expect(hit2).toBeNull();
    });

    it('should respect z-index ordering in hit testing', () => {
      // Create overlapping elements with different z-indices
      const overlappingElements: Element[] = [
        { ...testElements[0], id: 'back', x: 100, y: 100, zIndex: 0 },
        { ...testElements[1], id: 'middle', x: 110, y: 110, zIndex: 1 },
        { ...testElements[2], id: 'front', x: 120, y: 120, zIndex: 2 }
      ];

      spatialIndex.clear();
      overlappingElements.forEach(element => {
        spatialIndex.insert(element);
      });

      // Hit test in overlapping region - should return front element
      const hit = spatialHitTest(spatialIndex, { x: 130, y: 130 }, overlappingElements);
      expect(hit?.id).toBe('front');
    });

    it('should handle locked elements correctly', () => {
      // Create a locked element
      const lockedElement = { ...testElements[0], locked: true };
      spatialIndex.clear();
      spatialIndex.insert(lockedElement);

      // Hit test should not return locked elements
      const hit = spatialHitTest(spatialIndex, { x: 125, y: 125 }, [lockedElement]);
      expect(hit).toBeNull();
    });

    it('should perform accurate hit testing for circles', () => {
      // Hit inside circle1
      const hit1 = spatialHitTest(spatialIndex, { x: 430, y: 130 }, testElements);
      expect(hit1).toBeTruthy();
      expect(hit1?.id).toBe('circle1');

      // Hit on edge of circle (should miss with accurate circular hit testing)
      const hit2 = spatialHitTest(spatialIndex, { x: 470, y: 130 }, testElements);
      expect(hit2).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle elements at index boundaries', () => {
      const boundaryElement: Element = {
        ...testElements[0],
        x: 0,
        y: 0,
        width: 1000,
        height: 1000
      };

      spatialIndex.insert(boundaryElement);
      const query = spatialIndex.queryPoint({ x: 500, y: 500 });
      expect(query).toHaveLength(1);
    });

    it('should handle elements outside index boundaries', () => {
      const outsideElement: Element = {
        ...testElements[0],
        x: 1500,
        y: 1500
      };

      spatialIndex.insert(outsideElement);
      
      // Should not find element outside index bounds
      const query = spatialIndex.queryPoint({ x: 1550, y: 1550 });
      expect(query).toHaveLength(0);
    });

    it('should handle empty queries gracefully', () => {
      const query1 = spatialIndex.query({ x: 0, y: 0, width: 0, height: 0 });
      expect(query1).toHaveLength(0);

      const query2 = spatialIndex.queryPoint({ x: 5000, y: 5000 });
      expect(query2).toHaveLength(0);

      const query3 = spatialIndex.queryCircle({ x: 0, y: 0 }, 0);
      expect(query3).toHaveLength(0);
    });
  });
});