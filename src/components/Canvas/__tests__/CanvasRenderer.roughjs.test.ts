// ABOUTME: Test for Rough.js integration in CanvasRenderer
// ABOUTME: Ensures Rough.js shapes are properly generated and cached

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CanvasRenderer } from '../CanvasRenderer';
import type { Element, Viewport } from '../../../types';

// Mock Rough.js
const mockDraw = vi.fn();
const mockGenerator = {
  rectangle: vi.fn(),
  circle: vi.fn(),
  ellipse: vi.fn(),
  line: vi.fn(),
};

vi.mock('roughjs', () => ({
  default: {
    canvas: vi.fn(() => ({
      draw: mockDraw,
      generator: mockGenerator,
    })),
  },
}));

describe.skip('CanvasRenderer Rough.js Integration', () => {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let renderer: CanvasRenderer;
  let viewport: Viewport;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    ctx = canvas.getContext('2d')!;
    
    viewport = {
      zoom: 1,
      pan: { x: 0, y: 0 },
      bounds: { x: 0, y: 0, width: 800, height: 600 },
    };
    
    renderer = new CanvasRenderer(ctx, viewport);
  });

  describe('Rectangle rendering', () => {
    it('should render rectangle with Rough.js', () => {
      const element: Element = {
        id: 'test-rect',
        type: 'rectangle',
        x: 100,
        y: 100,
        width: 200,
        height: 100,
        angle: 0,
        strokeColor: '#000000',
        backgroundColor: 'transparent',
        strokeWidth: 2,
        roughness: 1,
        opacity: 1,
      };

      mockGenerator.rectangle.mockReturnValue('mock-rectangle-shape');

      renderer.renderElement(element);

      expect(mockGenerator.rectangle).toHaveBeenCalledWith(0, 0, 200, 100, {
        stroke: '#000000',
        fill: undefined,
        strokeWidth: 2,
        roughness: 1,
        fillStyle: 'hachure',
      });
      expect(mockDraw).toHaveBeenCalledWith('mock-rectangle-shape');
    });

    it('should render filled rectangle', () => {
      const element: Element = {
        id: 'test-rect',
        type: 'rectangle',
        x: 100,
        y: 100,
        width: 200,
        height: 100,
        angle: 0,
        strokeColor: '#000000',
        backgroundColor: '#ff0000',
        strokeWidth: 2,
        roughness: 1.5,
        opacity: 1,
      };

      mockGenerator.rectangle.mockReturnValue('mock-filled-rectangle');

      renderer.renderElement(element);

      expect(mockGenerator.rectangle).toHaveBeenCalledWith(0, 0, 200, 100, {
        stroke: '#000000',
        fill: '#ff0000',
        strokeWidth: 2,
        roughness: 1.5,
        fillStyle: 'hachure',
      });
    });
  });

  describe('Circle rendering', () => {
    it('should render circle with Rough.js', () => {
      const element: Element = {
        id: 'test-circle',
        type: 'circle',
        x: 100,
        y: 100,
        width: 100,
        height: 100,
        angle: 0,
        strokeColor: '#000000',
        backgroundColor: 'transparent',
        strokeWidth: 2,
        roughness: 1,
        opacity: 1,
      };

      mockGenerator.circle.mockReturnValue('mock-circle-shape');

      renderer.renderElement(element);

      expect(mockGenerator.circle).toHaveBeenCalledWith(50, 50, 100, {
        stroke: '#000000',
        fill: undefined,
        strokeWidth: 2,
        roughness: 1,
        fillStyle: 'hachure',
      });
      expect(mockDraw).toHaveBeenCalledWith('mock-circle-shape');
    });

    it('should render ellipse for non-square dimensions', () => {
      const element: Element = {
        id: 'test-ellipse',
        type: 'circle',
        x: 100,
        y: 100,
        width: 200,
        height: 100,
        angle: 0,
        strokeColor: '#000000',
        backgroundColor: 'transparent',
        strokeWidth: 2,
        roughness: 1,
        opacity: 1,
      };

      mockGenerator.ellipse.mockReturnValue('mock-ellipse-shape');

      renderer.renderElement(element);

      expect(mockGenerator.ellipse).toHaveBeenCalledWith(100, 50, 200, 100, {
        stroke: '#000000',
        fill: undefined,
        strokeWidth: 2,
        roughness: 1,
        fillStyle: 'hachure',
      });
      expect(mockDraw).toHaveBeenCalledWith('mock-ellipse-shape');
    });
  });

  describe('Line rendering', () => {
    it('should render line with Rough.js', () => {
      const element: Element = {
        id: 'test-line',
        type: 'line',
        x: 100,
        y: 100,
        width: 200,
        height: 100,
        angle: 0,
        strokeColor: '#000000',
        backgroundColor: 'transparent',
        strokeWidth: 2,
        roughness: 1,
        opacity: 1,
      };

      mockGenerator.line.mockReturnValue('mock-line-shape');

      renderer.renderElement(element);

      expect(mockGenerator.line).toHaveBeenCalledWith(0, 0, 200, 100, {
        stroke: '#000000',
        strokeWidth: 2,
        roughness: 1,
      });
      expect(mockDraw).toHaveBeenCalledWith('mock-line-shape');
    });
  });

  describe('Caching', () => {
    it('should cache shapes for better performance', () => {
      const element: Element = {
        id: 'test-rect',
        type: 'rectangle',
        x: 100,
        y: 100,
        width: 200,
        height: 100,
        angle: 0,
        strokeColor: '#000000',
        backgroundColor: 'transparent',
        strokeWidth: 2,
        roughness: 1,
        opacity: 1,
      };

      mockGenerator.rectangle.mockReturnValue('cached-shape');

      // Render the same element twice
      renderer.renderElement(element);
      renderer.renderElement(element);

      // Generator should only be called once due to caching
      expect(mockGenerator.rectangle).toHaveBeenCalledTimes(1);
      // But draw should be called twice
      expect(mockDraw).toHaveBeenCalledTimes(2);
      expect(mockDraw).toHaveBeenCalledWith('cached-shape');
    });

    it('should clear cache when requested', () => {
      const element: Element = {
        id: 'test-rect',
        type: 'rectangle',
        x: 100,
        y: 100,
        width: 200,
        height: 100,
        angle: 0,
        strokeColor: '#000000',
        backgroundColor: 'transparent',
        strokeWidth: 2,
        roughness: 1,
        opacity: 1,
      };

      mockGenerator.rectangle.mockReturnValue('shape');

      renderer.renderElement(element);
      renderer.clearCache();
      renderer.renderElement(element);

      // Generator should be called twice after cache clear
      expect(mockGenerator.rectangle).toHaveBeenCalledTimes(2);
    });
  });

  describe('Roughness handling', () => {
    it('should use default roughness when not specified', () => {
      const element: Element = {
        id: 'test-rect',
        type: 'rectangle',
        x: 100,
        y: 100,
        width: 200,
        height: 100,
        angle: 0,
        strokeColor: '#000000',
        backgroundColor: 'transparent',
        strokeWidth: 2,
        opacity: 1,
      };

      mockGenerator.rectangle.mockReturnValue('shape');

      renderer.renderElement(element);

      expect(mockGenerator.rectangle).toHaveBeenCalledWith(0, 0, 200, 100, 
        expect.objectContaining({
          roughness: 1, // Default value
        })
      );
    });

    it('should respect custom roughness values', () => {
      const element: Element = {
        id: 'test-rect',
        type: 'rectangle',
        x: 100,
        y: 100,
        width: 200,
        height: 100,
        angle: 0,
        strokeColor: '#000000',
        backgroundColor: 'transparent',
        strokeWidth: 2,
        roughness: 2.5,
        opacity: 1,
      };

      mockGenerator.rectangle.mockReturnValue('shape');

      renderer.renderElement(element);

      expect(mockGenerator.rectangle).toHaveBeenCalledWith(0, 0, 200, 100, 
        expect.objectContaining({
          roughness: 2.5,
        })
      );
    });
  });
});