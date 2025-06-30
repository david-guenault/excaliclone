// ABOUTME: Canvas rendering engine for drawing elements with Rough.js hand-drawn style
// ABOUTME: Handles the actual drawing operations for all element types using Rough.js

import rough from 'roughjs';
import type { Element, Viewport, GridSettings, ArrowheadType, Point } from '../../types';
import { renderGrid } from '../../utils/grid';
import { ARROW_CONFIG } from '../../constants';

export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private viewport: Viewport;
  private rough: any;
  private shapeCache: Map<string, any> = new Map();

  constructor(ctx: CanvasRenderingContext2D, viewport: Viewport) {
    this.ctx = ctx;
    this.viewport = viewport;
    if (ctx && ctx.canvas) {
      this.rough = rough.canvas(ctx.canvas);
    }
  }

  updateViewport(viewport: Viewport) {
    this.viewport = viewport;
  }

  private getShapeCacheKey(element: Element): string {
    // Create a unique key based on element properties that affect shape generation
    // Include element ID to ensure each element has its own cache entry
    let key = `${element.id}-${element.type}-${element.width}-${element.height}-${element.roughness || 1}-${element.strokeWidth}-${element.strokeColor || '#000000'}-${element.strokeStyle || 'solid'}-${element.fillStyle || 'transparent'}-${element.backgroundColor || 'transparent'}`;
    
    // Include arrow-specific properties
    if (element.type === 'arrow') {
      key += `-${element.startArrowHead || 'none'}-${element.endArrowHead || 'none'}`;
    }
    
    // Include pen points for proper caching
    if (element.type === 'pen' && element.points) {
      key += `-points:${element.points.length}`;
    }
    
    return key;
  }

  private getCachedShape(element: Element, shapeGenerator: () => any): any {
    const cacheKey = this.getShapeCacheKey(element);
    
    if (!this.shapeCache.has(cacheKey)) {
      this.shapeCache.set(cacheKey, shapeGenerator());
      
      // Limit cache size to prevent memory issues
      if (this.shapeCache.size > 1000) {
        const firstKey = this.shapeCache.keys().next().value;
        this.shapeCache.delete(firstKey);
      }
    }
    
    return this.shapeCache.get(cacheKey);
  }

  clearCache() {
    this.shapeCache.clear();
  }

  clear() {
    if (this.ctx && this.ctx.canvas) {
      this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
  }

  renderElement(element: Element) {
    if (!this.ctx || !this.rough) return;
    
    // Validate element has required properties
    if (!element || !element.id || !element.type) return;
    
    this.ctx.save();
    
    // Apply viewport transformations
    this.ctx.scale(this.viewport.zoom, this.viewport.zoom);
    this.ctx.translate(-this.viewport.pan.x, -this.viewport.pan.y);
    
    // Apply element transformations
    this.ctx.translate(element.x + element.width / 2, element.y + element.height / 2);
    this.ctx.rotate(element.angle);
    this.ctx.translate(-element.width / 2, -element.height / 2);
    
    // Set global opacity for Rough.js elements
    this.ctx.globalAlpha = element.opacity;

    // Draw based on element type
    switch (element.type) {
      case 'rectangle':
        this.drawRectangle(element);
        break;
      case 'circle':
        this.drawCircle(element);
        break;
      case 'line':
        this.drawLine(element);
        break;
      case 'arrow':
        this.drawArrow(element);
        break;
      case 'text':
        this.drawText(element);
        break;
      case 'pen':
        this.drawPen(element);
        break;
    }

    this.ctx.restore();
  }

  renderElements(elements: Element[], gridSettings?: GridSettings, selectedElementIds: string[] = [], dragSelectionRect?: { start: Point; end: Point } | null) {
    this.clear();
    
    // Render grid first (background layer)
    if (gridSettings) {
      renderGrid(this.ctx, gridSettings, this.viewport);
    }
    
    // Render elements on top, filtering out invalid elements
    if (elements && Array.isArray(elements)) {
      elements.filter(Boolean).forEach(element => this.renderElement(element));
    }
    
    // Render selection indicators on top
    if (selectedElementIds.length > 0) {
      this.renderSelectionIndicators(elements, selectedElementIds);
    }
    
    // Render drag selection rectangle on top
    if (dragSelectionRect) {
      this.renderDragSelectionRect(dragSelectionRect);
    }
  }

  private drawRectangle(element: Element) {
    if (!this.rough || !this.rough.generator) return;
    
    // Only draw fill with Rough.js if there's actually a fill
    if (element.backgroundColor !== 'transparent' && element.fillStyle !== 'transparent') {
      const shape = this.getCachedShape(element, () => 
        this.rough.generator.rectangle(0, 0, element.width, element.height, {
          stroke: 'none', // No stroke from Rough.js
          fill: element.backgroundColor,
          strokeWidth: 0,
          roughness: element.roughness || 1,
          fillStyle: element.fillStyle,
        })
      );
      
      this.rough.draw(shape);
    }
    
    // Then draw stroke with native Canvas for style support
    if (element.strokeColor && element.strokeColor !== 'transparent') {
      this.ctx.save();
      
      this.ctx.strokeStyle = element.strokeColor;
      this.ctx.lineWidth = element.strokeWidth;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      
      // Apply stroke style
      if (element.strokeStyle === 'dashed') {
        this.ctx.setLineDash([element.strokeWidth * 3, element.strokeWidth * 2]);
      } else if (element.strokeStyle === 'dotted') {
        this.ctx.setLineDash([element.strokeWidth, element.strokeWidth * 1.5]);
      } else {
        this.ctx.setLineDash([]);
      }
      
      this.ctx.strokeRect(0, 0, element.width, element.height);
      this.ctx.restore();
    }
  }

  private drawCircle(element: Element) {
    if (!this.rough || !this.rough.generator) return;
    const centerX = element.width / 2;
    const centerY = element.height / 2;
    
    // Only draw fill with Rough.js if there's actually a fill
    if (element.backgroundColor !== 'transparent' && element.fillStyle !== 'transparent') {
      const shape = this.getCachedShape(element, () => {
        const options = {
          stroke: 'none', // No stroke from Rough.js
          fill: element.backgroundColor,
          strokeWidth: 0,
          roughness: element.roughness || 1,
          fillStyle: element.fillStyle,
        };
        
        // For circles/ellipses, use ellipse if width != height, otherwise circle
        if (Math.abs(element.width - element.height) < 1) {
          // Draw as circle
          const radius = element.width / 2;
          return this.rough.generator.circle(centerX, centerY, radius * 2, options);
        } else {
          // Draw as ellipse
          return this.rough.generator.ellipse(centerX, centerY, element.width, element.height, options);
        }
      });
      
      this.rough.draw(shape);
    }
    
    // Then draw stroke with native Canvas for style support
    if (element.strokeColor && element.strokeColor !== 'transparent') {
      this.ctx.save();
      
      this.ctx.strokeStyle = element.strokeColor;
      this.ctx.lineWidth = element.strokeWidth;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      
      // Apply stroke style
      if (element.strokeStyle === 'dashed') {
        this.ctx.setLineDash([element.strokeWidth * 3, element.strokeWidth * 2]);
      } else if (element.strokeStyle === 'dotted') {
        this.ctx.setLineDash([element.strokeWidth, element.strokeWidth * 1.5]);
      } else {
        this.ctx.setLineDash([]);
      }
      
      // Draw circle or ellipse stroke
      this.ctx.beginPath();
      if (Math.abs(element.width - element.height) < 1) {
        // Circle
        const radius = element.width / 2;
        this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      } else {
        // Ellipse
        this.ctx.ellipse(centerX, centerY, element.width / 2, element.height / 2, 0, 0, 2 * Math.PI);
      }
      this.ctx.stroke();
      this.ctx.restore();
    }
  }

  private drawLine(element: Element) {
    if (!this.rough || !this.rough.generator) return;
    const options: any = {
      stroke: element.strokeColor,
      strokeWidth: element.strokeWidth,
      roughness: element.roughness || 1,
    };

    // Add stroke style support
    if (element.strokeStyle === 'dashed') {
      options.strokeLineDash = [5, 5];
    } else if (element.strokeStyle === 'dotted') {
      options.strokeLineDash = [2, 3];
    }

    const shape = this.getCachedShape(element, () => 
      this.rough.generator.line(0, 0, element.width, element.height, options)
    );
    
    this.rough.draw(shape);
  }

  private drawArrow(element: Element) {
    if (!this.rough || !this.rough.generator) return;
    const options: any = {
      stroke: element.strokeColor,
      strokeWidth: element.strokeWidth,
      roughness: element.roughness || 1,
    };

    // Add stroke style support for arrows
    if (element.strokeStyle === 'dashed') {
      options.strokeLineDash = [5, 5];
    } else if (element.strokeStyle === 'dotted') {
      options.strokeLineDash = [2, 3];
    }

    // Draw main line with Rough.js (cached for performance)
    const lineShape = this.getCachedShape(element, () => 
      this.rough.generator.line(0, 0, element.width, element.height, options)
    );
    this.rough.draw(lineShape);
    
    // Draw arrowheads if specified
    const lineAngle = Math.atan2(element.height, element.width);
    
    // Draw end arrowhead
    if (element.endArrowHead && element.endArrowHead !== 'none') {
      this.drawArrowhead(
        { x: element.width, y: element.height },
        lineAngle,
        element.endArrowHead,
        element.strokeColor,
        element.strokeWidth,
        element.roughness || 1
      );
    }
    
    // Draw start arrowhead (if specified)
    if (element.startArrowHead && element.startArrowHead !== 'none') {
      this.drawArrowhead(
        { x: 0, y: 0 },
        lineAngle + Math.PI, // Reverse direction for start arrow
        element.startArrowHead,
        element.strokeColor,
        element.strokeWidth,
        element.roughness || 1
      );
    }
  }

  private drawArrowhead(
    position: { x: number; y: number },
    angle: number,
    type: ArrowheadType,
    color: string,
    strokeWidth: number,
    roughness: number
  ) {
    const headLength = ARROW_CONFIG.ARROWHEAD_SIZE * (strokeWidth / 2 + 0.5); // Scale with stroke width
    const headAngle = ARROW_CONFIG.ARROWHEAD_ANGLE;
    
    switch (type) {
      case 'triangle': {
        const base1 = {
          x: position.x - headLength * Math.cos(angle - headAngle),
          y: position.y - headLength * Math.sin(angle - headAngle)
        };
        const base2 = {
          x: position.x - headLength * Math.cos(angle + headAngle),
          y: position.y - headLength * Math.sin(angle + headAngle)
        };
        
        // Draw triangle arrowhead as filled shape
        const trianglePath = [
          [position.x, position.y],
          [base1.x, base1.y],
          [base2.x, base2.y],
          [position.x, position.y]
        ] as [number, number][];
        
        this.rough.linearPath(trianglePath, {
          stroke: color,
          fill: color,
          strokeWidth: Math.max(1, strokeWidth * 0.7),
          roughness: roughness,
          fillStyle: 'solid'
        });
        break;
      }
      
      case 'line': {
        // Simple line arrowhead
        const base1 = {
          x: position.x - headLength * Math.cos(angle - headAngle),
          y: position.y - headLength * Math.sin(angle - headAngle)
        };
        const base2 = {
          x: position.x - headLength * Math.cos(angle + headAngle),
          y: position.y - headLength * Math.sin(angle + headAngle)
        };
        
        this.rough.line(position.x, position.y, base1.x, base1.y, {
          stroke: color,
          strokeWidth: strokeWidth,
          roughness: roughness,
        });
        this.rough.line(position.x, position.y, base2.x, base2.y, {
          stroke: color,
          strokeWidth: strokeWidth,
          roughness: roughness,
        });
        break;
      }
      
      case 'dot': {
        // Dot arrowhead
        const dotRadius = headLength * 0.4;
        this.rough.circle(position.x, position.y, dotRadius * 2, {
          stroke: color,
          fill: color,
          strokeWidth: Math.max(1, strokeWidth * 0.7),
          roughness: roughness,
          fillStyle: 'solid'
        });
        break;
      }
    }
  }

  private drawText(element: Element) {
    if (!element.text) return;
    
    // Text rendering still uses regular canvas context as Rough.js doesn't have text support
    this.ctx.font = `${element.strokeWidth * 8}px Arial`;
    this.ctx.textBaseline = 'top';
    this.ctx.fillStyle = element.strokeColor;
    this.ctx.globalAlpha = element.opacity;
    
    if (element.backgroundColor !== 'transparent') {
      this.ctx.fillStyle = element.backgroundColor;
      this.ctx.fillText(element.text, 5, 5);
      this.ctx.fillStyle = element.strokeColor; // Reset to stroke color
    }
    this.ctx.fillText(element.text, 5, 5);
  }

  private drawPen(element: Element) {
    if (!element.points || element.points.length < 2) return;
    
    // Filter out invalid points and ensure we have valid coordinates
    const validPoints = element.points.filter(point => 
      point && 
      typeof point.x === 'number' && 
      typeof point.y === 'number' && 
      !isNaN(point.x) && 
      !isNaN(point.y) && 
      isFinite(point.x) && 
      isFinite(point.y)
    );
    
    if (validPoints.length < 2) return;
    
    // Use native Canvas for better stroke style control
    this.ctx.save();
    
    // Set stroke properties
    this.ctx.strokeStyle = element.strokeColor;
    this.ctx.lineWidth = element.strokeWidth;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    
    // Apply stroke style
    if (element.strokeStyle === 'dashed') {
      this.ctx.setLineDash([element.strokeWidth * 3, element.strokeWidth * 2]);
    } else if (element.strokeStyle === 'dotted') {
      this.ctx.setLineDash([element.strokeWidth, element.strokeWidth * 1.5]);
    } else {
      this.ctx.setLineDash([]);
    }
    
    // Calculate bounding box for coordinate transformation
    const minX = Math.min(...validPoints.map(p => p.x));
    const minY = Math.min(...validPoints.map(p => p.y));
    
    // Draw the path
    this.ctx.beginPath();
    
    // Move to first point (relative to element position)
    const firstPoint = validPoints[0];
    this.ctx.moveTo(firstPoint.x - minX, firstPoint.y - minY);
    
    // Draw lines to subsequent points
    for (let i = 1; i < validPoints.length; i++) {
      const point = validPoints[i];
      this.ctx.lineTo(point.x - minX, point.y - minY);
    }
    
    this.ctx.stroke();
    this.ctx.restore();
  }

  private renderSelectionIndicators(elements: Element[], selectedElementIds: string[]) {
    // Save current context state
    this.ctx.save();
    
    // Selection indicator styles
    const SELECTION_COLOR = '#007acc'; // Blue color for selection
    const SELECTION_STROKE_WIDTH = 2;
    const HANDLE_SIZE = 8;
    
    selectedElementIds.forEach(elementId => {
      const element = elements.find(el => el.id === elementId);
      if (!element) return;
      
      // Transform to element's coordinate system
      this.ctx.save();
      this.ctx.translate(element.x, element.y);
      if (element.angle) {
        this.ctx.rotate(element.angle);
      }
      
      // Draw selection outline
      this.ctx.strokeStyle = SELECTION_COLOR;
      this.ctx.lineWidth = SELECTION_STROKE_WIDTH / this.viewport.zoom;
      this.ctx.setLineDash([5 / this.viewport.zoom, 5 / this.viewport.zoom]); // Dashed line
      this.ctx.globalAlpha = 0.8;
      
      // Draw bounding box based on element type
      if (element.type === 'rectangle' || element.type === 'circle') {
        this.ctx.strokeRect(-2, -2, element.width + 4, element.height + 4);
      } else if (element.type === 'line' || element.type === 'arrow') {
        // For lines/arrows, draw a box around the line bounds
        const minX = Math.min(0, element.width) - 2;
        const minY = Math.min(0, element.height) - 2;
        const maxX = Math.max(0, element.width) + 2;
        const maxY = Math.max(0, element.height) + 2;
        this.ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
      } else if (element.type === 'pen') {
        // For pen strokes, draw a box around the stroke bounds
        this.ctx.strokeRect(-2, -2, element.width + 4, element.height + 4);
      }
      
      // Draw resize handles (small squares at corners)
      this.ctx.setLineDash([]); // Reset to solid line
      this.ctx.fillStyle = SELECTION_COLOR;
      this.ctx.globalAlpha = 1.0;
      
      const handleSize = HANDLE_SIZE / this.viewport.zoom;
      const halfHandle = handleSize / 2;
      
      if (element.type === 'rectangle' || element.type === 'circle') {
        // Corner handles
        const positions = [
          [-halfHandle, -halfHandle], // Top-left
          [element.width - halfHandle, -halfHandle], // Top-right
          [element.width - halfHandle, element.height - halfHandle], // Bottom-right
          [-halfHandle, element.height - halfHandle], // Bottom-left
        ];
        
        positions.forEach(([x, y]) => {
          this.ctx.fillRect(x, y, handleSize, handleSize);
          this.ctx.strokeRect(x, y, handleSize, handleSize);
        });
      } else if (element.type === 'line' || element.type === 'arrow') {
        // End point handles for lines/arrows
        this.ctx.fillRect(-halfHandle, -halfHandle, handleSize, handleSize);
        this.ctx.strokeRect(-halfHandle, -halfHandle, handleSize, handleSize);
        this.ctx.fillRect(element.width - halfHandle, element.height - halfHandle, handleSize, handleSize);
        this.ctx.strokeRect(element.width - halfHandle, element.height - halfHandle, handleSize, handleSize);
      } else if (element.type === 'pen') {
        // Corner handles for pen strokes (similar to rectangles)
        const positions = [
          [-halfHandle, -halfHandle], // Top-left
          [element.width - halfHandle, -halfHandle], // Top-right
          [element.width - halfHandle, element.height - halfHandle], // Bottom-right
          [-halfHandle, element.height - halfHandle], // Bottom-left
        ];
        
        positions.forEach(([x, y]) => {
          this.ctx.fillRect(x, y, handleSize, handleSize);
          this.ctx.strokeRect(x, y, handleSize, handleSize);
        });
      }
      
      this.ctx.restore();
    });
    
    // Restore context state
    this.ctx.restore();
  }

  private renderDragSelectionRect(dragSelectionRect: { start: Point; end: Point }) {
    // Save current context state
    this.ctx.save();
    
    // Calculate rectangle bounds
    const x = Math.min(dragSelectionRect.start.x, dragSelectionRect.end.x);
    const y = Math.min(dragSelectionRect.start.y, dragSelectionRect.end.y);
    const width = Math.abs(dragSelectionRect.end.x - dragSelectionRect.start.x);
    const height = Math.abs(dragSelectionRect.end.y - dragSelectionRect.start.y);
    
    // Selection rectangle styles
    this.ctx.strokeStyle = '#007acc'; // Blue color
    this.ctx.fillStyle = 'rgba(0, 122, 204, 0.1)'; // Light blue fill
    this.ctx.lineWidth = 1 / this.viewport.zoom;
    this.ctx.setLineDash([3 / this.viewport.zoom, 3 / this.viewport.zoom]); // Dashed line
    this.ctx.globalAlpha = 0.8;
    
    // Fill the rectangle with light blue
    this.ctx.fillRect(x, y, width, height);
    
    // Stroke the rectangle border
    this.ctx.strokeRect(x, y, width, height);
    
    // Restore context state
    this.ctx.restore();
  }
}