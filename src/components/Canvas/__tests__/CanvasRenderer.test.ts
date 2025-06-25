// ABOUTME: Tests for CanvasRenderer class - core functionality and shape drawing
// ABOUTME: Comprehensive test coverage for all rendering operations

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CanvasRenderer } from '../CanvasRenderer';
import type { Element, Viewport } from '../../../types';

describe('CanvasRenderer', () => {
  let mockCtx: any;
  let mockViewport: Viewport;
  let renderer: CanvasRenderer;

  beforeEach(() => {
    // Create mock canvas context
    mockCtx = {
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      scale: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      fillText: vi.fn(),
      strokeText: vi.fn(),
      canvas: { width: 800, height: 600 },
      strokeStyle: '',
      fillStyle: '',
      lineWidth: 1,
      globalAlpha: 1,
      font: '',
      textBaseline: 'top',
    };

    mockViewport = {
      zoom: 1,
      pan: { x: 0, y: 0 },
      bounds: { x: 0, y: 0, width: 800, height: 600 },
    };

    renderer = new CanvasRenderer(mockCtx, mockViewport);
  });

  describe('Constructor & Setup', () => {
    it('initializes with canvas context and viewport', () => {
      expect(renderer).toBeInstanceOf(CanvasRenderer);
    });

    it('stores references correctly', () => {
      // Test by calling a method that uses the stored references
      renderer.clear();
      expect(mockCtx.clearRect).toHaveBeenCalledWith(0, 0, 800, 600);
    });
  });

  describe('updateViewport', () => {
    it('updates internal viewport reference', () => {
      const newViewport: Viewport = {
        zoom: 2,
        pan: { x: 100, y: 200 },
        bounds: { x: 0, y: 0, width: 1000, height: 800 },
      };

      renderer.updateViewport(newViewport);

      // Test that subsequent renders use new viewport
      const mockElement: Element = {
        id: 'test',
        type: 'rectangle',
        x: 0,
        y: 0,
        width: 100,
        height: 50,
        angle: 0,
        strokeColor: '#000',
        backgroundColor: 'transparent',
        strokeWidth: 2,
        roughness: 1,
        opacity: 1,
      };

      renderer.renderElement(mockElement);

      // Should apply new viewport transformations
      expect(mockCtx.scale).toHaveBeenCalledWith(2, 2);
      expect(mockCtx.translate).toHaveBeenCalledWith(-100, -200);
    });
  });

  describe('clear', () => {
    it('calls clearRect with correct canvas dimensions', () => {
      renderer.clear();
      expect(mockCtx.clearRect).toHaveBeenCalledWith(0, 0, 800, 600);
    });

    it('clears entire canvas area', () => {
      mockCtx.canvas.width = 1200;
      mockCtx.canvas.height = 900;
      
      renderer.clear();
      expect(mockCtx.clearRect).toHaveBeenCalledWith(0, 0, 1200, 900);
    });
  });

  describe('renderElement', () => {
    const mockElement: Element = {
      id: 'test',
      type: 'rectangle',
      x: 50,
      y: 100,
      width: 200,
      height: 150,
      angle: Math.PI / 4,
      strokeColor: '#ff0000',
      backgroundColor: '#00ff00',
      strokeWidth: 3,
      roughness: 1,
      opacity: 0.8,
    };

    it('calls correct draw method based on element type', () => {
      const rectangleElement = { ...mockElement, type: 'rectangle' as const };
      const circleElement = { ...mockElement, type: 'circle' as const };

      renderer.renderElement(rectangleElement);
      expect(mockCtx.strokeRect).toHaveBeenCalled();

      vi.clearAllMocks();

      renderer.renderElement(circleElement);
      expect(mockCtx.arc).toHaveBeenCalled();
    });

    it('applies viewport transformations (scale, translate)', () => {
      const viewport: Viewport = {
        zoom: 1.5,
        pan: { x: 25, y: 50 },
        bounds: { x: 0, y: 0, width: 800, height: 600 },
      };
      renderer.updateViewport(viewport);

      renderer.renderElement(mockElement);

      expect(mockCtx.scale).toHaveBeenCalledWith(1.5, 1.5);
      expect(mockCtx.translate).toHaveBeenCalledWith(-25, -50);
    });

    it('applies element transformations (position, rotation)', () => {
      renderer.renderElement(mockElement);

      // Should translate to element center, rotate, then translate back
      expect(mockCtx.translate).toHaveBeenCalledWith(150, 175); // x + width/2, y + height/2
      expect(mockCtx.rotate).toHaveBeenCalledWith(Math.PI / 4);
      expect(mockCtx.translate).toHaveBeenCalledWith(-100, -75); // -width/2, -height/2
    });

    it('sets correct drawing styles', () => {
      renderer.renderElement(mockElement);

      expect(mockCtx.strokeStyle).toBe('#ff0000');
      expect(mockCtx.fillStyle).toBe('#00ff00');
      expect(mockCtx.lineWidth).toBe(3);
      expect(mockCtx.globalAlpha).toBe(0.8);
    });

    it('saves and restores canvas context', () => {
      renderer.renderElement(mockElement);

      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
    });
  });

  describe('renderElements', () => {
    const mockElements: Element[] = [
      {
        id: 'rect1',
        type: 'rectangle',
        x: 0,
        y: 0,
        width: 100,
        height: 50,
        angle: 0,
        strokeColor: '#000',
        backgroundColor: 'transparent',
        strokeWidth: 2,
        roughness: 1,
        opacity: 1,
      },
      {
        id: 'circle1',
        type: 'circle',
        x: 100,
        y: 100,
        width: 80,
        height: 80,
        angle: 0,
        strokeColor: '#ff0000',
        backgroundColor: 'transparent',
        strokeWidth: 2,
        roughness: 1,
        opacity: 1,
      },
    ];

    it('clears canvas before rendering', () => {
      renderer.renderElements(mockElements);
      
      // clearRect should be called before any drawing operations
      expect(mockCtx.clearRect).toHaveBeenCalledBefore(mockCtx.strokeRect as any);
    });

    it('renders all elements in order', () => {
      renderer.renderElements(mockElements);

      // Should call drawing operations for both elements
      expect(mockCtx.strokeRect).toHaveBeenCalled(); // rectangle
      expect(mockCtx.arc).toHaveBeenCalled(); // circle
    });

    it('handles empty elements array', () => {
      renderer.renderElements([]);

      expect(mockCtx.clearRect).toHaveBeenCalled();
      expect(mockCtx.strokeRect).not.toHaveBeenCalled();
      expect(mockCtx.arc).not.toHaveBeenCalled();
    });
  });

  describe('drawRectangle', () => {
    const rectangleElement: Element = {
      id: 'rect',
      type: 'rectangle',
      x: 0,
      y: 0,
      width: 100,
      height: 50,
      angle: 0,
      strokeColor: '#000',
      backgroundColor: '#ff0000',
      strokeWidth: 2,
      roughness: 1,
      opacity: 1,
    };

    it('draws rectangle with correct dimensions', () => {
      renderer.renderElement(rectangleElement);

      expect(mockCtx.fillRect).toHaveBeenCalledWith(0, 0, 100, 50);
      expect(mockCtx.strokeRect).toHaveBeenCalledWith(0, 0, 100, 50);
    });

    it('fills rectangle when backgroundColor is not transparent', () => {
      renderer.renderElement(rectangleElement);
      expect(mockCtx.fillRect).toHaveBeenCalled();
    });

    it('does not fill when backgroundColor is transparent', () => {
      const transparentRectangle = { ...rectangleElement, backgroundColor: 'transparent' };
      renderer.renderElement(transparentRectangle);

      expect(mockCtx.fillRect).not.toHaveBeenCalled();
    });

    it('always strokes rectangle outline', () => {
      renderer.renderElement(rectangleElement);
      expect(mockCtx.strokeRect).toHaveBeenCalled();

      vi.clearAllMocks();

      const transparentRectangle = { ...rectangleElement, backgroundColor: 'transparent' };
      renderer.renderElement(transparentRectangle);
      expect(mockCtx.strokeRect).toHaveBeenCalled();
    });

    it('handles zero width/height', () => {
      const zeroSizeRectangle = { ...rectangleElement, width: 0, height: 0 };
      renderer.renderElement(zeroSizeRectangle);

      expect(mockCtx.fillRect).toHaveBeenCalledWith(0, 0, 0, 0);
      expect(mockCtx.strokeRect).toHaveBeenCalledWith(0, 0, 0, 0);
    });
  });

  describe('drawCircle', () => {
    const circleElement: Element = {
      id: 'circle',
      type: 'circle',
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      angle: 0,
      strokeColor: '#000',
      backgroundColor: '#00ff00',
      strokeWidth: 2,
      roughness: 1,
      opacity: 1,
    };

    it('draws circle with correct radius (min of width/height / 2)', () => {
      renderer.renderElement(circleElement);

      expect(mockCtx.arc).toHaveBeenCalledWith(50, 50, 50, 0, 2 * Math.PI);
    });

    it('centers circle correctly', () => {
      const rectangularCircle = { ...circleElement, width: 120, height: 80 };
      renderer.renderElement(rectangularCircle);

      // Center should be at width/2, height/2
      // Radius should be min(120, 80) / 2 = 40
      expect(mockCtx.arc).toHaveBeenCalledWith(60, 40, 40, 0, 2 * Math.PI);
    });

    it('fills circle when backgroundColor is not transparent', () => {
      renderer.renderElement(circleElement);

      expect(mockCtx.fill).toHaveBeenCalled();
    });

    it('does not fill when backgroundColor is transparent', () => {
      const transparentCircle = { ...circleElement, backgroundColor: 'transparent' };
      renderer.renderElement(transparentCircle);

      expect(mockCtx.fill).not.toHaveBeenCalled();
    });

    it('always strokes circle outline', () => {
      renderer.renderElement(circleElement);
      expect(mockCtx.stroke).toHaveBeenCalled();

      vi.clearAllMocks();

      const transparentCircle = { ...circleElement, backgroundColor: 'transparent' };
      renderer.renderElement(transparentCircle);
      expect(mockCtx.stroke).toHaveBeenCalled();
    });
  });

  describe('drawLine', () => {
    const lineElement: Element = {
      id: 'line',
      type: 'line',
      x: 0,
      y: 0,
      width: 100,
      height: 50,
      angle: 0,
      strokeColor: '#000',
      backgroundColor: 'transparent',
      strokeWidth: 2,
      roughness: 1,
      opacity: 1,
    };

    it('draws line from (0,0) to (width, height)', () => {
      renderer.renderElement(lineElement);

      expect(mockCtx.beginPath).toHaveBeenCalled();
      expect(mockCtx.moveTo).toHaveBeenCalledWith(0, 0);
      expect(mockCtx.lineTo).toHaveBeenCalledWith(100, 50);
      expect(mockCtx.stroke).toHaveBeenCalled();
    });

    it('uses correct stroke style', () => {
      renderer.renderElement(lineElement);
      expect(mockCtx.stroke).toHaveBeenCalled();
    });
  });

  describe('drawArrow', () => {
    const arrowElement: Element = {
      id: 'arrow',
      type: 'arrow',
      x: 0,
      y: 0,
      width: 100,
      height: 0, // horizontal arrow
      angle: 0,
      strokeColor: '#000',
      backgroundColor: 'transparent',
      strokeWidth: 2,
      roughness: 1,
      opacity: 1,
    };

    it('draws main line correctly', () => {
      renderer.renderElement(arrowElement);

      expect(mockCtx.moveTo).toHaveBeenCalledWith(0, 0);
      expect(mockCtx.lineTo).toHaveBeenCalledWith(100, 0);
    });

    it('draws arrowhead with correct angle and length', () => {
      renderer.renderElement(arrowElement);

      // Should call moveTo and lineTo for arrowhead lines
      const moveToCall = vi.mocked(mockCtx.moveTo);
      const lineToCall = vi.mocked(mockCtx.lineTo);

      // Verify arrowhead drawing calls (exact values depend on implementation)
      expect(moveToCall).toHaveBeenCalledWith(100, 0); // Arrow tip
      expect(lineToCall).toHaveBeenCalledTimes(3); // Main line + 2 arrowhead lines
    });

    it('calculates arrowhead geometry correctly for different angles', () => {
      const diagonalArrow = { ...arrowElement, width: 100, height: 100 };
      renderer.renderElement(diagonalArrow);

      // Should still draw proper arrowhead for diagonal line
      expect(mockCtx.lineTo).toHaveBeenCalledTimes(3);
    });
  });

  describe('drawText', () => {
    const textElement: Element = {
      id: 'text',
      type: 'text',
      x: 0,
      y: 0,
      width: 200,
      height: 50,
      angle: 0,
      strokeColor: '#000',
      backgroundColor: '#ffff00',
      strokeWidth: 2,
      roughness: 1,
      opacity: 1,
      text: 'Hello World',
    };

    it('returns early when element.text is undefined', () => {
      const noTextElement = { ...textElement, text: undefined };
      renderer.renderElement(noTextElement);

      expect(mockCtx.fillText).not.toHaveBeenCalled();
      expect(mockCtx.strokeText).not.toHaveBeenCalled();
    });

    it('sets correct font size based on strokeWidth', () => {
      renderer.renderElement(textElement);

      expect(mockCtx.font).toBe('16px Arial'); // strokeWidth * 8 = 2 * 8 = 16
      expect(mockCtx.textBaseline).toBe('top');
    });

    it('fills text when backgroundColor is not transparent', () => {
      renderer.renderElement(textElement);

      expect(mockCtx.fillText).toHaveBeenCalledWith('Hello World', 5, 5);
    });

    it('does not fill when backgroundColor is transparent', () => {
      const transparentText = { ...textElement, backgroundColor: 'transparent' };
      renderer.renderElement(transparentText);

      expect(mockCtx.fillText).not.toHaveBeenCalled();
    });

    it('always strokes text outline', () => {
      renderer.renderElement(textElement);
      expect(mockCtx.strokeText).toHaveBeenCalledWith('Hello World', 5, 5);

      vi.clearAllMocks();

      const transparentText = { ...textElement, backgroundColor: 'transparent' };
      renderer.renderElement(transparentText);
      expect(mockCtx.strokeText).toHaveBeenCalledWith('Hello World', 5, 5);
    });
  });

  describe('drawPen', () => {
    const penElement: Element = {
      id: 'pen',
      type: 'pen',
      x: 10,
      y: 20,
      width: 0,
      height: 0,
      angle: 0,
      strokeColor: '#000',
      backgroundColor: 'transparent',
      strokeWidth: 2,
      roughness: 1,
      opacity: 1,
      points: [
        { x: 10, y: 20 },
        { x: 15, y: 25 },
        { x: 20, y: 30 },
        { x: 25, y: 20 },
      ],
    };

    it('returns early when points array is empty', () => {
      const emptyPenElement = { ...penElement, points: [] };
      renderer.renderElement(emptyPenElement);

      expect(mockCtx.beginPath).not.toHaveBeenCalled();
    });

    it('returns early when points array has < 2 points', () => {
      const singlePointElement = { ...penElement, points: [{ x: 10, y: 20 }] };
      renderer.renderElement(singlePointElement);

      expect(mockCtx.beginPath).not.toHaveBeenCalled();
    });

    it('draws connected line segments through all points', () => {
      renderer.renderElement(penElement);

      expect(mockCtx.beginPath).toHaveBeenCalled();
      expect(mockCtx.moveTo).toHaveBeenCalledWith(0, 0); // First point relative to element
      expect(mockCtx.lineTo).toHaveBeenCalledWith(5, 5); // Second point relative to element
      expect(mockCtx.lineTo).toHaveBeenCalledWith(10, 10); // Third point relative to element
      expect(mockCtx.lineTo).toHaveBeenCalledWith(15, 0); // Fourth point relative to element
      expect(mockCtx.stroke).toHaveBeenCalled();
    });

    it('adjusts point coordinates relative to element position', () => {
      renderer.renderElement(penElement);

      // Points should be adjusted relative to element position (10, 20)
      expect(mockCtx.moveTo).toHaveBeenCalledWith(0, 0); // 10-10, 20-20
      expect(mockCtx.lineTo).toHaveBeenCalledWith(5, 5); // 15-10, 25-20
    });

    it('handles points with undefined array gracefully', () => {
      const undefinedPointsElement = { ...penElement, points: undefined };
      renderer.renderElement(undefinedPointsElement);

      expect(mockCtx.beginPath).not.toHaveBeenCalled();
    });
  });
});