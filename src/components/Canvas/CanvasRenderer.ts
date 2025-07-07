// ABOUTME: Canvas rendering engine for drawing elements with Rough.js hand-drawn style
// ABOUTME: Handles the actual drawing operations for all element types using Rough.js

import rough from 'roughjs';
import type { Element, Viewport, GridSettings, ArrowheadType, Point, DirectTextEditingState } from '../../types';
import { renderGrid } from '../../utils/grid';
import { ARROW_CONFIG, ARROWHEAD_CONFIG } from '../../constants';
import { getMultiSelectionBounds, getMultiSelectionHandles } from '../../utils/multiSelection';

export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private viewport: Viewport;
  private rough: any;
  private shapeCache: Map<string, any> = new Map();
  private useRoughJs: boolean = true; // ENABLED: Hand-drawn style with Rough.js for all shapes

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
    let key = `${element.id}-${element.type}-${element.width}-${element.height}-${element.roughness || 1}-${element.strokeWidth}-${element.strokeColor || '#000000'}-${element.strokeStyle || 'solid'}-${element.fillStyle || 'solid'}-${element.backgroundColor || 'transparent'}`;
    
    // Include corner properties for rectangles
    if (element.type === 'rectangle') {
      key += `-${element.cornerStyle || 'sharp'}-${element.cornerRadius || 0}`;
    }
    
    // Include arrowhead properties for arrows and lines
    if (element.type === 'arrow' || element.type === 'line') {
      key += `-${element.startArrowhead || 'none'}-${element.endArrowhead || 'none'}`;
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

  renderElement(element: Element, textEditing?: DirectTextEditingState | null) {
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

    // Determine if this element is being edited
    const isBeingEdited = textEditing && textEditing.elementId === element.id;
    const editingInfo = isBeingEdited ? {
      text: textEditing.text,
      cursorPosition: textEditing.cursorPosition,
      selectionStart: textEditing.selectionStart,
      selectionEnd: textEditing.selectionEnd,
      cursorVisible: textEditing.cursorVisible
    } : undefined;

    // Draw based on element type
    switch (element.type) {
      case 'rectangle':
        this.drawRectangle(element, editingInfo);
        break;
      case 'circle':
        this.drawCircle(element, editingInfo);
        break;
      case 'line':
        this.drawLine(element, editingInfo);
        break;
      case 'arrow':
        this.drawArrow(element, editingInfo);
        break;
      case 'text':
        this.drawText(element);
        break;
      case 'pen':
        this.drawPen(element);
        break;
      case 'image':
        this.drawImage(element);
        break;
    }

    this.ctx.restore();
  }

  renderElements(elements: Element[], gridSettings?: GridSettings, selectedElementIds: string[] = [], dragSelectionRect?: { start: Point; end: Point } | null, textEditing?: DirectTextEditingState | null) {
    this.clear();
    
    // Render grid first (background layer)
    if (gridSettings) {
      renderGrid(this.ctx, gridSettings, this.viewport);
    }
    
    // Render elements on top, filtering out invalid elements
    if (elements && Array.isArray(elements)) {
      elements.filter(Boolean).forEach(element => this.renderElement(element, textEditing));
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

  private drawRectangle(element: Element, textEditing?: { cursorPosition: number; selectionStart: number; selectionEnd: number; cursorVisible: boolean }) {
    const hasRoundedCorners = element.cornerStyle === 'rounded' && element.cornerRadius && element.cornerRadius > 0;
    
    if (this.useRoughJs) {
      // Use Rough.js for both sharp and rounded corners to maintain hand-drawn style
      if (!this.rough || !this.rough.generator) return;
      
      const options: any = {
        roughness: element.roughness || 1,
      };

      if (element.backgroundColor !== 'transparent') {
        options.fill = element.backgroundColor;
        options.fillStyle = element.fillStyle;
      } else {
        options.fill = undefined;
        options.fillStyle = element.fillStyle;
      }

      if (element.strokeColor && element.strokeColor !== 'transparent') {
        options.stroke = element.strokeColor;
        options.strokeWidth = element.strokeWidth;
        
        if (element.strokeStyle === 'dashed') {
          options.strokeLineDash = [element.strokeWidth * 3, element.strokeWidth * 2];
        } else if (element.strokeStyle === 'dotted') {
          options.strokeLineDash = [element.strokeWidth, element.strokeWidth * 1.5];
        }
      } else {
        options.stroke = 'none';
      }

      let shape;
      if (hasRoundedCorners) {
        // Create rounded rectangle path for Rough.js
        const radius = Math.min(element.cornerRadius!, element.width / 2, element.height / 2);
        const pathData = this.createRoundedRectPath(0, 0, element.width, element.height, radius);
        shape = this.getCachedShape(element, () => 
          this.rough.generator.path(pathData, options)
        );
      } else {
        // Regular rectangle
        shape = this.getCachedShape(element, () => 
          this.rough.generator.rectangle(0, 0, element.width, element.height, options)
        );
      }
      
      this.rough.draw(shape);
    } else {
      // Canvas native fallback (not used when Rough.js is enabled)
      this.ctx.save();
      
      // Set stroke style
      if (element.strokeColor && element.strokeColor !== 'transparent') {
        this.ctx.strokeStyle = element.strokeColor;
        this.ctx.lineWidth = element.strokeWidth;
        
        if (element.strokeStyle === 'dashed') {
          this.ctx.setLineDash([element.strokeWidth * 3, element.strokeWidth * 2]);
        } else if (element.strokeStyle === 'dotted') {
          this.ctx.setLineDash([element.strokeWidth, element.strokeWidth * 1.5]);
        } else {
          this.ctx.setLineDash([]);
        }
      }
      
      // Draw rounded rectangle if needed
      if (hasRoundedCorners) {
        const radius = Math.min(element.cornerRadius!, element.width / 2, element.height / 2);
        this.drawRoundedRect(0, 0, element.width, element.height, radius);
      } else {
        // Draw regular rectangle
        this.ctx.beginPath();
        this.ctx.rect(0, 0, element.width, element.height);
      }
      
      // Fill rectangle
      if (element.backgroundColor !== 'transparent') {
        this.ctx.fillStyle = element.backgroundColor;
        this.ctx.fill();
      }
      
      // Stroke rectangle  
      if (element.strokeColor && element.strokeColor !== 'transparent') {
        this.ctx.stroke();
      }
      
      this.ctx.restore();
    }
    
    // Draw text if present
    if (element.text && element.text.trim() !== '') {
      this.drawTextInShape(element, textEditing);
    }
  }

  private createRoundedRectPath(x: number, y: number, width: number, height: number, radius: number): string {
    // Create SVG path string for rounded rectangle
    return `M ${x + radius} ${y} ` +
           `L ${x + width - radius} ${y} ` +
           `Q ${x + width} ${y} ${x + width} ${y + radius} ` +
           `L ${x + width} ${y + height - radius} ` +
           `Q ${x + width} ${y + height} ${x + width - radius} ${y + height} ` +
           `L ${x + radius} ${y + height} ` +
           `Q ${x} ${y + height} ${x} ${y + height - radius} ` +
           `L ${x} ${y + radius} ` +
           `Q ${x} ${y} ${x + radius} ${y} Z`;
  }

  private drawRoundedRect(x: number, y: number, width: number, height: number, radius: number) {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
  }

  private drawCircle(element: Element, textEditing?: { cursorPosition: number; selectionStart: number; selectionEnd: number; cursorVisible: boolean }) {
    const centerX = element.width / 2;
    const centerY = element.height / 2;
    
    if (this.useRoughJs) {
      // Original Rough.js implementation
      if (!this.rough || !this.rough.generator) return;
      
      const options: any = {
        roughness: element.roughness || 1,
      };

      if (element.backgroundColor !== 'transparent') {
        options.fill = element.backgroundColor;
        options.fillStyle = element.fillStyle;
      } else {
        options.fill = undefined;
        options.fillStyle = element.fillStyle;
      }

      if (element.strokeColor && element.strokeColor !== 'transparent') {
        options.stroke = element.strokeColor;
        options.strokeWidth = element.strokeWidth;
        
        if (element.strokeStyle === 'dashed') {
          options.strokeLineDash = [element.strokeWidth * 3, element.strokeWidth * 2];
        } else if (element.strokeStyle === 'dotted') {
          options.strokeLineDash = [element.strokeWidth, element.strokeWidth * 1.5];
        }
      } else {
        options.stroke = 'none';
      }

      const shape = this.getCachedShape(element, () => {
        if (Math.abs(element.width - element.height) < 1) {
          const radius = element.width / 2;
          return this.rough.generator.circle(centerX, centerY, radius * 2, options);
        } else {
          return this.rough.generator.ellipse(centerX, centerY, element.width, element.height, options);
        }
      });
      
      this.rough.draw(shape);
    } else {
      // Canvas native fallback (not used when Rough.js is enabled)
      this.ctx.save();
      
      // Set stroke style
      if (element.strokeColor && element.strokeColor !== 'transparent') {
        this.ctx.strokeStyle = element.strokeColor;
        this.ctx.lineWidth = element.strokeWidth;
        
        if (element.strokeStyle === 'dashed') {
          this.ctx.setLineDash([element.strokeWidth * 3, element.strokeWidth * 2]);
        } else if (element.strokeStyle === 'dotted') {
          this.ctx.setLineDash([element.strokeWidth, element.strokeWidth * 1.5]);
        } else {
          this.ctx.setLineDash([]);
        }
      }
      
      this.ctx.beginPath();
      if (Math.abs(element.width - element.height) < 1) {
        // Draw as circle
        const radius = element.width / 2;
        this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      } else {
        // Draw as ellipse
        this.ctx.ellipse(centerX, centerY, element.width / 2, element.height / 2, 0, 0, 2 * Math.PI);
      }
      
      // Fill circle
      if (element.backgroundColor !== 'transparent') {
        this.ctx.fillStyle = element.backgroundColor;
        this.ctx.fill();
      }
      
      // Stroke circle
      if (element.strokeColor && element.strokeColor !== 'transparent') {
        this.ctx.stroke();
      }
      
      this.ctx.restore();
    }
    
    // Draw text if present
    if (element.text && element.text.trim() !== '') {
      this.drawTextInShape(element, textEditing);
    }
  }

  private drawLine(element: Element, textEditing?: { cursorPosition: number; selectionStart: number; selectionEnd: number; cursorVisible: boolean }) {
    if (!this.rough || !this.rough.generator) return;
    
    // Use Rough.js for line rendering
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
    
    // Draw arrowheads if specified for lines
    const lineAngle = Math.atan2(element.height, element.width);
    
    // Draw end arrowhead
    if (element.endArrowhead && element.endArrowhead !== 'none') {
      this.drawArrowhead(
        { x: element.width, y: element.height },
        lineAngle,
        element.endArrowhead,
        element.strokeColor,
        element.strokeWidth,
        element.roughness || 1
      );
    }
    
    // Draw start arrowhead (if specified)
    if (element.startArrowhead && element.startArrowhead !== 'none') {
      this.drawArrowhead(
        { x: 0, y: 0 },
        lineAngle + Math.PI, // Reverse direction for start arrow
        element.startArrowhead,
        element.strokeColor,
        element.strokeWidth,
        element.roughness || 1
      );
    }
    
    // Draw text label if present
    if (element.text && element.text.trim() !== '') {
      this.drawTextOnLine(element);
    }
  }

  private drawArrow(element: Element, textEditing?: { cursorPosition: number; selectionStart: number; selectionEnd: number; cursorVisible: boolean }) {
    if (!this.rough || !this.rough.generator) return;
    
    // Use Rough.js for arrow line rendering
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
    if (element.endArrowhead && element.endArrowhead !== 'none') {
      this.drawArrowhead(
        { x: element.width, y: element.height },
        lineAngle,
        element.endArrowhead,
        element.strokeColor,
        element.strokeWidth,
        element.roughness || 1
      );
    }
    
    // Draw start arrowhead (if specified)
    if (element.startArrowhead && element.startArrowhead !== 'none') {
      this.drawArrowhead(
        { x: 0, y: 0 },
        lineAngle + Math.PI, // Reverse direction for start arrow
        element.startArrowhead,
        element.strokeColor,
        element.strokeWidth,
        element.roughness || 1
      );
    }
    
    // Draw text label if present
    if (element.text && element.text.trim() !== '') {
      this.drawTextOnLine(element);
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
    const headLength = ARROWHEAD_CONFIG.DEFAULT_SIZE * (strokeWidth * ARROWHEAD_CONFIG.SIZE_MULTIPLIER / 2 + 0.5); // Scale with stroke width
    const headAngle = ARROWHEAD_CONFIG.ANGLE;
    
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
      
      case 'circle': {
        // Circle arrowhead
        const circleRadius = headLength * 0.4;
        this.rough.circle(position.x, position.y, circleRadius * 2, {
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
    
    this.ctx.save();
    
    // Set font properties
    const fontSize = element.fontSize || 16;
    const fontFamily = element.fontFamily || 'Excalifont';
    const fontWeight = element.fontWeight || 'normal';
    const fontStyle = element.fontStyle || 'normal';
    const textAlign = element.textAlign || 'left';
    const textDecoration = element.textDecoration || 'none';
    
    this.ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
    this.ctx.textBaseline = 'top';
    this.ctx.fillStyle = element.strokeColor;
    this.ctx.globalAlpha = element.opacity;
    
    // Calculate text dimensions for background and alignment
    const lines = element.text.split('\n');
    const lineHeight = fontSize * 1.2;
    const maxLineWidth = Math.max(...lines.map(line => this.ctx.measureText(line).width));
    const padding = 4;
    
    // Draw background if specified
    if (element.backgroundColor !== 'transparent') {
      this.ctx.fillStyle = element.backgroundColor;
      this.ctx.fillRect(0, 0, maxLineWidth + (padding * 2), lines.length * lineHeight + (padding * 2));
    }
    
    // Set text color
    this.ctx.fillStyle = element.strokeColor;
    
    // Draw each line with proper alignment
    lines.forEach((line, index) => {
      if (!line && index < lines.length - 1) {
        // Allow empty lines except for the last one
        return;
      }
      
      const y = padding + (index * lineHeight);
      let x = padding; // Default for left alignment
      
      // Calculate X position based on alignment
      const lineWidth = this.ctx.measureText(line).width;
      
      if (textAlign === 'center') {
        x = padding + (maxLineWidth / 2) - (lineWidth / 2);
      } else if (textAlign === 'right') {
        x = padding + maxLineWidth - lineWidth;
      }
      
      // Draw the text
      this.ctx.fillText(line, x, y);
      
      // Draw underline if specified
      if (textDecoration === 'underline') {
        const underlineY = y + fontSize * 0.9; // Position underline below text
        const underlineThickness = Math.max(1, fontSize * 0.05);
        
        this.ctx.save();
        this.ctx.strokeStyle = element.strokeColor;
        this.ctx.lineWidth = underlineThickness;
        this.ctx.beginPath();
        this.ctx.moveTo(x, underlineY);
        this.ctx.lineTo(x + lineWidth, underlineY);
        this.ctx.stroke();
        this.ctx.restore();
      }
    });
    
    this.ctx.restore();
  }

  private drawPen(element: Element) {
    if (!this.rough || !this.rough.generator) return;
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
    
    // Convert points to relative coordinates
    const relativePoints = validPoints.map(point => ({
      x: point.x - element.x,
      y: point.y - element.y
    }));
    
    // Rough.js options for pen strokes
    const options: any = {
      stroke: element.strokeColor,
      strokeWidth: element.strokeWidth,
      roughness: element.roughness || 1,
      fill: 'none'
    };

    // Add stroke style support
    if (element.strokeStyle === 'dashed') {
      options.strokeLineDash = [element.strokeWidth * 3, element.strokeWidth * 2];
    } else if (element.strokeStyle === 'dotted') {
      options.strokeLineDash = [element.strokeWidth, element.strokeWidth * 1.5];
    }

    // For line caps and joins, use Canvas native rendering
    if (element.lineCap && element.lineCap !== 'butt' || element.lineJoin && element.lineJoin !== 'miter') {
      this.ctx.save();
      
      // Set stroke properties including caps and joins
      this.ctx.strokeStyle = element.strokeColor;
      this.ctx.lineWidth = element.strokeWidth;
      this.ctx.lineCap = element.lineCap || 'round';
      this.ctx.lineJoin = element.lineJoin || 'round';
      
      // Apply stroke style
      if (element.strokeStyle === 'dashed') {
        this.ctx.setLineDash([element.strokeWidth * 3, element.strokeWidth * 2]);
      } else if (element.strokeStyle === 'dotted') {
        this.ctx.setLineDash([element.strokeWidth, element.strokeWidth * 1.5]);
      } else {
        this.ctx.setLineDash([]);
      }
      
      // Draw the complete path
      this.ctx.beginPath();
      const firstPoint = relativePoints[0];
      this.ctx.moveTo(firstPoint.x, firstPoint.y);
      
      for (let i = 1; i < relativePoints.length; i++) {
        const point = relativePoints[i];
        this.ctx.lineTo(point.x, point.y);
      }
      
      this.ctx.stroke();
      this.ctx.restore();
    } else {
      // Draw multiple connected line segments with Rough.js for better rough effect
      // This gives each segment its own rough variation
      for (let i = 0; i < relativePoints.length - 1; i++) {
        const start = relativePoints[i];
        const end = relativePoints[i + 1];
        
        // Use individual lines instead of linearPath for better rough effects
        const lineShape = this.rough.generator.line(
          start.x, start.y,
          end.x, end.y,
          options
        );
        
        this.rough.draw(lineShape);
      }
    }
  }

  private renderSelectionIndicators(elements: Element[], selectedElementIds: string[]) {
    // Save current context state
    this.ctx.save();
    
    // Apply viewport transformations JUST LIKE in renderElement
    this.ctx.scale(this.viewport.zoom, this.viewport.zoom);
    this.ctx.translate(-this.viewport.pan.x, -this.viewport.pan.y);
    
    // Selection indicator styles
    const SELECTION_COLOR = '#007acc'; // Blue color for selection
    const SELECTION_STROKE_WIDTH = 2;
    const HANDLE_SIZE = 8;
    
    // Handle multi-selection group indicators
    if (selectedElementIds.length > 1) {
      this.renderMultiSelectionIndicators(elements, selectedElementIds, SELECTION_COLOR, HANDLE_SIZE);
      // For multi-selection, only show group indicators, not individual ones
      this.ctx.restore();
      return;
    }
    
    // Single selection: show individual indicators
    selectedElementIds.forEach(elementId => {
      const element = elements.find(el => el.id === elementId);
      if (!element) return;
      
      // Apply element transformations EXACTLY LIKE in renderElement
      this.ctx.save();
      this.ctx.translate(element.x + element.width / 2, element.y + element.height / 2);
      this.ctx.rotate(element.angle);
      this.ctx.translate(-element.width / 2, -element.height / 2);
      
      // Draw selection outline
      this.ctx.strokeStyle = SELECTION_COLOR;
      this.ctx.lineWidth = SELECTION_STROKE_WIDTH / this.viewport.zoom; // Scale with zoom like original
      this.ctx.setLineDash([5 / this.viewport.zoom, 5 / this.viewport.zoom]); // Scale with zoom like original
      this.ctx.globalAlpha = 0.8;
      
      // Draw bounding box (back to original element-space coordinates)
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
      } else if (element.type === 'text') {
        // For text elements, use simple bounding box
        this.ctx.strokeRect(-2, -2, element.width + 4, element.height + 4);
      } else if (element.type === 'image') {
        // For image elements, use simple bounding box
        this.ctx.strokeRect(-2, -2, element.width + 4, element.height + 4);
      }
      
      // Draw resize handles (back to original element-space coordinates)
      this.ctx.setLineDash([]); // Reset to solid line
      this.ctx.fillStyle = SELECTION_COLOR;
      this.ctx.globalAlpha = 1.0;
      
      const handleSize = HANDLE_SIZE / this.viewport.zoom; // Scale with zoom like original
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

        // Rotation handle above the element
        const rotationDistance = 20 / this.viewport.zoom;
        const rotationX = element.width / 2 - halfHandle;
        const rotationY = -rotationDistance - halfHandle;
        
        // Draw connection line to rotation handle
        this.ctx.strokeStyle = SELECTION_COLOR;
        this.ctx.lineWidth = 1 / this.viewport.zoom;
        this.ctx.setLineDash([]);
        this.ctx.beginPath();
        this.ctx.moveTo(element.width / 2, -2);
        this.ctx.lineTo(element.width / 2, rotationY + halfHandle);
        this.ctx.stroke();
        
        // Draw rotation handle as a circle
        this.ctx.fillStyle = '#ffffff';
        this.ctx.strokeStyle = SELECTION_COLOR;
        this.ctx.beginPath();
        this.ctx.arc(rotationX + halfHandle, rotationY + halfHandle, halfHandle, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Draw rotation icon inside the circle
        this.ctx.strokeStyle = SELECTION_COLOR;
        this.ctx.lineWidth = 1.5 / this.viewport.zoom;
        const iconRadius = halfHandle * 0.6;
        this.ctx.beginPath();
        this.ctx.arc(rotationX + halfHandle, rotationY + halfHandle, iconRadius, 0, 1.5 * Math.PI);
        this.ctx.stroke();
        // Arrow tip
        const arrowSize = 2 / this.viewport.zoom;
        this.ctx.beginPath();
        this.ctx.moveTo(rotationX + halfHandle - iconRadius, rotationY + halfHandle - arrowSize);
        this.ctx.lineTo(rotationX + halfHandle - iconRadius + arrowSize, rotationY + halfHandle);
        this.ctx.lineTo(rotationX + halfHandle - iconRadius, rotationY + halfHandle + arrowSize);
        this.ctx.stroke();

      } else if (element.type === 'line' || element.type === 'arrow') {
        // End point handles for lines/arrows
        this.ctx.fillRect(-halfHandle, -halfHandle, handleSize, handleSize);
        this.ctx.strokeRect(-halfHandle, -halfHandle, handleSize, handleSize);
        this.ctx.fillRect(element.width - halfHandle, element.height - halfHandle, handleSize, handleSize);
        this.ctx.strokeRect(element.width - halfHandle, element.height - halfHandle, handleSize, handleSize);

        // Rotation handle perpendicular to the line
        const rotationDistance = 15 / this.viewport.zoom;
        const midX = element.width / 2;
        const midY = element.height / 2;
        const length = Math.sqrt(element.width * element.width + element.height * element.height);
        const offsetX = (-element.height / length) * rotationDistance;
        const offsetY = (element.width / length) * rotationDistance;
        const rotationX = midX + offsetX - halfHandle;
        const rotationY = midY + offsetY - halfHandle;
        
        // Draw connection line to rotation handle
        this.ctx.strokeStyle = SELECTION_COLOR;
        this.ctx.lineWidth = 1 / this.viewport.zoom;
        this.ctx.setLineDash([]);
        this.ctx.beginPath();
        this.ctx.moveTo(midX, midY);
        this.ctx.lineTo(rotationX + halfHandle, rotationY + halfHandle);
        this.ctx.stroke();
        
        // Draw rotation handle as a circle
        this.ctx.fillStyle = '#ffffff';
        this.ctx.strokeStyle = SELECTION_COLOR;
        this.ctx.beginPath();
        this.ctx.arc(rotationX + halfHandle, rotationY + halfHandle, halfHandle, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.stroke();

      } else if (element.type === 'pen') {
        // Corner handles for pen strokes
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

        // Rotation handle above the element
        const rotationDistance = 20 / this.viewport.zoom;
        const rotationX = element.width / 2 - halfHandle;
        const rotationY = -rotationDistance - halfHandle;
        
        // Draw connection line to rotation handle
        this.ctx.strokeStyle = SELECTION_COLOR;
        this.ctx.lineWidth = 1 / this.viewport.zoom;
        this.ctx.setLineDash([]);
        this.ctx.beginPath();
        this.ctx.moveTo(element.width / 2, -2);
        this.ctx.lineTo(element.width / 2, rotationY + halfHandle);
        this.ctx.stroke();
        
        // Draw rotation handle as a circle
        this.ctx.fillStyle = '#ffffff';
        this.ctx.strokeStyle = SELECTION_COLOR;
        this.ctx.beginPath();
        this.ctx.arc(rotationX + halfHandle, rotationY + halfHandle, halfHandle, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.stroke();

      } else if (element.type === 'text' || element.type === 'image') {
        // Corner handles for text and image elements
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

        // Rotation handle above the element
        const rotationDistance = 20 / this.viewport.zoom;
        const rotationX = element.width / 2 - halfHandle;
        const rotationY = -rotationDistance - halfHandle;
        
        // Draw connection line to rotation handle
        this.ctx.strokeStyle = SELECTION_COLOR;
        this.ctx.lineWidth = 1 / this.viewport.zoom;
        this.ctx.setLineDash([]);
        this.ctx.beginPath();
        this.ctx.moveTo(element.width / 2, -2);
        this.ctx.lineTo(element.width / 2, rotationY + halfHandle);
        this.ctx.stroke();
        
        // Draw rotation handle as a circle
        this.ctx.fillStyle = '#ffffff';
        this.ctx.strokeStyle = SELECTION_COLOR;
        this.ctx.beginPath();
        this.ctx.arc(rotationX + halfHandle, rotationY + halfHandle, halfHandle, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.stroke();
      }
      
      this.ctx.restore(); // Restore element transformations
    });
    
    // Restore context state
    this.ctx.restore();
  }

  private renderMultiSelectionIndicators(elements: Element[], selectedElementIds: string[], SELECTION_COLOR: string, HANDLE_SIZE: number) {
    const selectedElements = elements.filter(el => selectedElementIds.includes(el.id) && !el.locked);
    const bounds = getMultiSelectionBounds(selectedElements);
    
    if (!bounds) return;
    
    // Draw group selection outline
    this.ctx.save();
    this.ctx.strokeStyle = SELECTION_COLOR;
    this.ctx.lineWidth = 2 / this.viewport.zoom;
    this.ctx.setLineDash([8 / this.viewport.zoom, 4 / this.viewport.zoom]); // Different dash pattern for group
    this.ctx.globalAlpha = 0.6;
    
    // Draw group bounding box
    this.ctx.strokeRect(bounds.x - 5, bounds.y - 5, bounds.width + 10, bounds.height + 10);
    
    this.ctx.restore();
    
    // Draw group resize handles
    const handles = getMultiSelectionHandles(bounds);
    
    this.ctx.save();
    this.ctx.fillStyle = '#ffffff';
    this.ctx.strokeStyle = SELECTION_COLOR;
    this.ctx.lineWidth = 2 / this.viewport.zoom;
    this.ctx.setLineDash([]);
    this.ctx.globalAlpha = 1;
    
    handles.forEach(handle => {
      if (handle.type === 'rotation') {
        // Draw connection line to rotation handle
        this.ctx.strokeStyle = SELECTION_COLOR;
        this.ctx.lineWidth = 1 / this.viewport.zoom;
        this.ctx.beginPath();
        this.ctx.moveTo(bounds.x + bounds.width / 2, bounds.y - 5);
        this.ctx.lineTo(handle.x + handle.size / 2, handle.y + handle.size / 2);
        this.ctx.stroke();
        
        // Draw rotation handle as a circle
        this.ctx.fillStyle = '#ffffff';
        this.ctx.strokeStyle = SELECTION_COLOR;
        this.ctx.lineWidth = 2 / this.viewport.zoom;
        this.ctx.beginPath();
        this.ctx.arc(handle.x + handle.size / 2, handle.y + handle.size / 2, handle.size / 2, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.stroke();
      } else {
        // Draw corner resize handles as squares
        this.ctx.fillStyle = '#ffffff';
        this.ctx.strokeStyle = SELECTION_COLOR;
        this.ctx.lineWidth = 2 / this.viewport.zoom;
        this.ctx.fillRect(handle.x, handle.y, handle.size, handle.size);
        this.ctx.strokeRect(handle.x, handle.y, handle.size, handle.size);
      }
    });
    
    this.ctx.restore();
  }

  private renderDragSelectionRect(dragSelectionRect: { start: Point; end: Point }) {
    // Save current context state
    this.ctx.save();
    
    // Apply viewport transformations since dragSelectionRect coordinates are in world space
    this.ctx.scale(this.viewport.zoom, this.viewport.zoom);
    this.ctx.translate(-this.viewport.pan.x, -this.viewport.pan.y);
    
    // Calculate rectangle bounds in world coordinates
    const x = Math.min(dragSelectionRect.start.x, dragSelectionRect.end.x);
    const y = Math.min(dragSelectionRect.start.y, dragSelectionRect.end.y);
    const width = Math.abs(dragSelectionRect.end.x - dragSelectionRect.start.x);
    const height = Math.abs(dragSelectionRect.end.y - dragSelectionRect.start.y);
    
    // Enhanced selection rectangle styles with modern appearance
    const baseStrokeColor = '#0066cc'; // Slightly darker blue for better visibility
    const fillColor = 'rgba(0, 102, 204, 0.08)'; // More subtle fill
    const borderColor = 'rgba(0, 102, 204, 0.6)'; // Semi-transparent border
    
    // Scale-aware line width (minimum 1px on screen)
    const lineWidth = Math.max(1 / this.viewport.zoom, 0.5);
    
    // Animated dashed border using time-based offset
    const dashLength = 4 / this.viewport.zoom;
    const time = Date.now() * 0.003; // Slow animation
    const dashOffset = (time * dashLength) % (dashLength * 2);
    
    // First pass: Fill with subtle background
    this.ctx.fillStyle = fillColor;
    this.ctx.globalAlpha = 1;
    this.ctx.fillRect(x, y, width, height);
    
    // Second pass: Animated dashed border
    this.ctx.strokeStyle = baseStrokeColor;
    this.ctx.lineWidth = lineWidth;
    this.ctx.setLineDash([dashLength, dashLength]);
    this.ctx.lineDashOffset = -dashOffset; // Animate the dash pattern
    this.ctx.globalAlpha = 0.8;
    this.ctx.strokeRect(x, y, width, height);
    
    // Third pass: Corner indicators for better visual feedback
    if (width > 10 / this.viewport.zoom && height > 10 / this.viewport.zoom) {
      const cornerSize = Math.min(8 / this.viewport.zoom, Math.min(width, height) / 4);
      this.ctx.strokeStyle = baseStrokeColor;
      this.ctx.lineWidth = lineWidth * 1.5;
      this.ctx.setLineDash([]); // Solid lines for corners
      this.ctx.globalAlpha = 0.9;
      
      // Draw corner indicators (L-shaped marks at each corner)
      const corners = [
        { x: x, y: y }, // Top-left
        { x: x + width, y: y }, // Top-right
        { x: x, y: y + height }, // Bottom-left
        { x: x + width, y: y + height }, // Bottom-right
      ];
      
      corners.forEach((corner, index) => {
        this.ctx.beginPath();
        // Draw L-shaped corner indicator
        if (index === 0) { // Top-left
          this.ctx.moveTo(corner.x, corner.y + cornerSize);
          this.ctx.lineTo(corner.x, corner.y);
          this.ctx.lineTo(corner.x + cornerSize, corner.y);
        } else if (index === 1) { // Top-right
          this.ctx.moveTo(corner.x - cornerSize, corner.y);
          this.ctx.lineTo(corner.x, corner.y);
          this.ctx.lineTo(corner.x, corner.y + cornerSize);
        } else if (index === 2) { // Bottom-left
          this.ctx.moveTo(corner.x, corner.y - cornerSize);
          this.ctx.lineTo(corner.x, corner.y);
          this.ctx.lineTo(corner.x + cornerSize, corner.y);
        } else { // Bottom-right
          this.ctx.moveTo(corner.x - cornerSize, corner.y);
          this.ctx.lineTo(corner.x, corner.y);
          this.ctx.lineTo(corner.x, corner.y - cornerSize);
        }
        this.ctx.stroke();
      });
    }
    
    // Restore context state
    this.ctx.restore();
  }

  private renderTextCursor(elements: Element[], textEditing: TextEditingState) {
    const element = elements.find(el => el.id === textEditing.elementId);
    if (!element) return;
    
    // Handle cursor rendering for different element types
    if (element.type === 'text') {
      this.renderTextElementCursor(element, textEditing);
    } else {
      // For other element types (rectangle, circle, line, arrow), render cursor in element center
      this.renderInlineTextCursor(element, textEditing);
    }
  }

  private renderTextElementCursor(element: Element, textEditing: TextEditingState) {
    // Save current context state
    this.ctx.save();
    
    // Apply viewport transformations
    this.ctx.scale(this.viewport.zoom, this.viewport.zoom);
    this.ctx.translate(-this.viewport.pan.x, -this.viewport.pan.y);
    
    // Apply element transformations
    this.ctx.translate(element.x + element.width / 2, element.y + element.height / 2);
    this.ctx.rotate(element.angle);
    this.ctx.translate(-element.width / 2, -element.height / 2);
    
    // Set font properties to calculate cursor position
    const fontSize = element.fontSize || 16;
    const fontFamily = element.fontFamily || 'Excalifont';
    const fontWeight = element.fontWeight || 'normal';
    const fontStyle = element.fontStyle || 'normal';
    
    this.ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
    this.ctx.textBaseline = 'top';
    
    // Calculate cursor position
    const text = element.text || '';
    const lines = text.split('\n');
    const lineHeight = fontSize * 1.2;
    
    // Find which line the cursor is on
    let currentLine = 0;
    let charCount = 0;
    const padding = 4;
    let cursorX = padding;
    let cursorY = padding;
    
    for (let i = 0; i < lines.length; i++) {
      if (charCount + lines[i].length >= textEditing.cursorPosition) {
        currentLine = i;
        const charIndexInLine = textEditing.cursorPosition - charCount;
        const textBeforeCursor = lines[i].substring(0, charIndexInLine);
        
        // Calculate X position based on text alignment (same logic as drawText)
        const textAlign = element.textAlign || 'left';
        const maxLineWidth = Math.max(...lines.map(line => this.ctx.measureText(line).width));
        const lineWidth = this.ctx.measureText(lines[i]).width;
        const textBeforeCursorWidth = this.ctx.measureText(textBeforeCursor).width;
        
        if (textAlign === 'center') {
          const lineStartX = padding + (maxLineWidth / 2) - (lineWidth / 2);
          cursorX = lineStartX + textBeforeCursorWidth;
        } else if (textAlign === 'right') {
          const lineStartX = padding + maxLineWidth - lineWidth;
          cursorX = lineStartX + textBeforeCursorWidth;
        } else {
          cursorX = padding + textBeforeCursorWidth;
        }
        
        cursorY = padding + (currentLine * lineHeight);
        break;
      }
      charCount += lines[i].length + 1; // +1 for newline character
    }
    
    // Draw blinking cursor
    const time = Date.now();
    const blink = Math.floor(time / 500) % 2; // Blink every 500ms
    
    if (blink === 0) {
      this.ctx.strokeStyle = element.strokeColor || '#000000';
      this.ctx.lineWidth = 1 / this.viewport.zoom;
      this.ctx.setLineDash([]);
      
      this.ctx.beginPath();
      this.ctx.moveTo(cursorX, cursorY);
      this.ctx.lineTo(cursorX, cursorY + lineHeight);
      this.ctx.stroke();
    }
    
    // Restore context state
    this.ctx.restore();
  }

  private renderInlineTextCursor(element: Element, textEditing: TextEditingState) {
    // Save current context state
    this.ctx.save();
    
    // Apply viewport transformations
    this.ctx.scale(this.viewport.zoom, this.viewport.zoom);
    this.ctx.translate(-this.viewport.pan.x, -this.viewport.pan.y);
    
    // Calculate text position based on element type
    let textX: number, textY: number;
    
    switch (element.type) {
      case 'rectangle':
      case 'circle':
        // Center of shape
        textX = element.x + element.width / 2;
        textY = element.y + element.height / 2;
        break;
      case 'line':
      case 'arrow':
        // Midpoint of line/arrow
        textX = element.x + element.width / 2;
        textY = element.y + element.height / 2;
        break;
      default:
        textX = element.x;
        textY = element.y;
    }
    
    // Set font properties
    const fontSize = element.fontSize || 16;
    const fontFamily = element.fontFamily || 'Excalifont';
    const fontWeight = element.fontWeight || 'normal';
    const fontStyle = element.fontStyle || 'normal';
    
    this.ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
    this.ctx.textBaseline = 'middle';
    this.ctx.textAlign = 'center';
    
    // Calculate cursor position based on text content and cursor position
    const text = element.text || '';
    const lines = text.split('\n');
    const lineHeight = fontSize * 1.2;
    
    // Find which line the cursor is on
    let currentLine = 0;
    let charCount = 0;
    let cursorX = textX;
    let cursorY = textY;
    
    for (let i = 0; i < lines.length; i++) {
      if (charCount + lines[i].length >= textEditing.cursorPosition) {
        currentLine = i;
        const charIndexInLine = textEditing.cursorPosition - charCount;
        const textBeforeCursor = lines[i].substring(0, charIndexInLine);
        
        // Calculate cursor position within the line
        const lineWidth = this.ctx.measureText(lines[i]).width;
        const textBeforeCursorWidth = this.ctx.measureText(textBeforeCursor).width;
        
        // Position cursor relative to center-aligned text
        cursorX = textX - (lineWidth / 2) + textBeforeCursorWidth;
        cursorY = textY - ((lines.length - 1) * lineHeight / 2) + (currentLine * lineHeight);
        break;
      }
      charCount += lines[i].length + 1; // +1 for newline character
    }
    
    // Draw blinking cursor
    const time = Date.now();
    const blink = Math.floor(time / 500) % 2; // Blink every 500ms
    
    if (blink === 0) {
      this.ctx.strokeStyle = element.strokeColor || '#000000';
      this.ctx.lineWidth = 2 / this.viewport.zoom; // Slightly thicker for visibility
      this.ctx.setLineDash([]);
      
      this.ctx.beginPath();
      this.ctx.moveTo(cursorX, cursorY - lineHeight / 2);
      this.ctx.lineTo(cursorX, cursorY + lineHeight / 2);
      this.ctx.stroke();
    }
    
    // Restore context state
    this.ctx.restore();
  }

  private drawTextInShape(element: Element, textEditing?: { text: string; cursorPosition: number; selectionStart: number; selectionEnd: number; cursorVisible: boolean }) {
    // Don't return early if text is empty but we're editing - we need to show the cursor
    if ((!element.text || element.text.trim() === '') && !textEditing) return;
    
    this.ctx.save();
    
    // Set text properties
    const fontSize = element.fontSize || 16;
    const fontFamily = element.fontFamily || 'Excalifont';
    const fontWeight = element.fontWeight || 'normal';
    const fontStyle = element.fontStyle || 'normal';
    
    this.ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
    this.ctx.fillStyle = element.strokeColor || '#000000';
    this.ctx.textBaseline = 'middle';
    
    // Calculate available space for text
    const padding = 8; // Padding inside the shape
    let maxWidth: number;
    let centerX: number;
    let centerY: number;
    
    if (element.type === 'rectangle') {
      maxWidth = Math.max(element.width - (padding * 2), 20); // Minimum 20px width
      centerX = element.width / 2;
      centerY = element.height / 2;
    } else if (element.type === 'circle') {
      // For circles, use inscribed rectangle (width and height reduced by ~30%)
      const inscribedSize = Math.min(element.width, element.height) * 0.7;
      maxWidth = Math.max(inscribedSize - (padding * 2), 20);
      centerX = element.width / 2;
      centerY = element.height / 2;
    } else {
      // For lines and arrows, use a reasonable width
      maxWidth = Math.max(Math.min(element.width, 200) - (padding * 2), 20);
      centerX = element.width / 2;
      centerY = element.height / 2;
    }
    
    // Break text into lines with automatic word wrapping
    // Use editing text if available, otherwise use element text
    const text = (textEditing?.text !== undefined) ? textEditing.text : (element.text || '');
    const lines = this.wrapTextToLines(text, maxWidth);
    const lineHeight = fontSize * 1.2;
    const totalTextHeight = lines.length * lineHeight;
    
    // Set text alignment based on element property
    const textAlign = element.textAlign || 'center';
    const textVerticalAlign = element.textVerticalAlign || 'middle';
    this.ctx.textAlign = textAlign;
    
    // Calculate starting Y position based on vertical alignment
    let startY: number;
    switch (textVerticalAlign) {
      case 'top':
        startY = (lineHeight / 2); // Start from top with half line height padding
        break;
      case 'bottom':
        startY = element.height - totalTextHeight + (lineHeight / 2); // Start from bottom minus text height
        break;
      case 'middle':
      default:
        startY = centerY - (totalTextHeight / 2) + (lineHeight / 2); // Center vertically (existing behavior)
        break;
    }
    
    // Draw selection background first if there's a selection
    if (textEditing && textEditing.selectionStart !== textEditing.selectionEnd) {
      const selStart = Math.min(textEditing.selectionStart, textEditing.selectionEnd);
      const selEnd = Math.max(textEditing.selectionStart, textEditing.selectionEnd);
      
      let charCount = 0;
      lines.forEach((line, index) => {
        const y = startY + (index * lineHeight);
        const lineStart = charCount;
        const lineEnd = charCount + line.length;
        
        // Check if this line has any selected text
        if (selEnd > lineStart && selStart < lineEnd) {
          const selStartInLine = Math.max(0, selStart - lineStart);
          const selEndInLine = Math.min(line.length, selEnd - lineStart);
          
          // Measure text to get selection bounds
          const textBeforeSelection = line.slice(0, selStartInLine);
          const selectedText = line.slice(selStartInLine, selEndInLine);
          
          const textMetrics = this.ctx.measureText(textBeforeSelection);
          const selectedMetrics = this.ctx.measureText(selectedText);
          const lineMetrics = this.ctx.measureText(line);
          
          // Calculate selection bounds based on alignment
          let selectionStartX: number;
          let selectionWidth = selectedMetrics.width;
          
          if (textAlign === 'left') {
            selectionStartX = padding + textMetrics.width;
          } else if (textAlign === 'right') {
            selectionStartX = element.width - padding - lineMetrics.width + textMetrics.width;
          } else {
            selectionStartX = centerX - lineMetrics.width / 2 + textMetrics.width;
          }
          
          // Draw selection background
          this.ctx.fillStyle = 'rgba(0, 120, 255, 0.3)'; // Blue selection background
          this.ctx.fillRect(
            selectionStartX,
            y - fontSize / 2,
            selectionWidth,
            fontSize
          );
        }
        
        charCount += line.length;
        if (index < lines.length - 1) {
          charCount += 1; // For the newline character
        }
      });
    }

    // Reset fill style for text
    this.ctx.fillStyle = element.strokeColor || '#000000';

    // Draw each line and cursor if editing
    let charCount = 0;
    lines.forEach((line, index) => {
      const y = startY + (index * lineHeight);
      
      // Calculate X position based on text alignment
      let textX: number;
      if (textAlign === 'left') {
        textX = padding; // Left aligned with padding
      } else if (textAlign === 'right') {
        textX = element.width - padding; // Right aligned with padding
      } else {
        textX = centerX; // Center aligned
      }
      
      this.ctx.fillText(line, textX, y);
      
      // Draw cursor if this element is being edited
      if (textEditing && textEditing.cursorVisible) {
        const lineStart = charCount;
        const lineEnd = charCount + line.length;
        
        // Check if cursor is in this line
        if (textEditing.cursorPosition >= lineStart && textEditing.cursorPosition <= lineEnd) {
          const cursorPosInLine = textEditing.cursorPosition - lineStart;
          
          // Measure text up to cursor position
          const textToCursor = line.slice(0, cursorPosInLine);
          const textMetrics = this.ctx.measureText(textToCursor);
          const lineMetrics = this.ctx.measureText(line);
          
          // Calculate cursor X position based on alignment
          let cursorX: number;
          if (textAlign === 'left') {
            cursorX = padding + textMetrics.width;
          } else if (textAlign === 'right') {
            cursorX = element.width - padding - lineMetrics.width + textMetrics.width;
          } else {
            cursorX = centerX - lineMetrics.width / 2 + textMetrics.width;
          }
          
          // Draw cursor line
          this.ctx.strokeStyle = element.strokeColor || '#000000';
          this.ctx.lineWidth = 1;
          this.ctx.beginPath();
          this.ctx.moveTo(cursorX, y - fontSize / 2);
          this.ctx.lineTo(cursorX, y + fontSize / 2);
          this.ctx.stroke();
        }
      }
      
      // Draw underline decoration if specified
      if (element.textDecoration === 'underline') {
        const textMetrics = this.ctx.measureText(line);
        const underlineY = y + fontSize * 0.3; // Position underline below text baseline
        
        // Calculate underline position based on text alignment
        let underlineStartX: number;
        let underlineEndX: number;
        
        if (textAlign === 'left') {
          underlineStartX = padding;
          underlineEndX = padding + textMetrics.width;
        } else if (textAlign === 'right') {
          underlineStartX = element.width - padding - textMetrics.width;
          underlineEndX = element.width - padding;
        } else {
          // Center alignment
          underlineStartX = centerX - textMetrics.width / 2;
          underlineEndX = centerX + textMetrics.width / 2;
        }
        
        this.ctx.strokeStyle = element.strokeColor || '#000000';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(underlineStartX, underlineY);
        this.ctx.lineTo(underlineEndX, underlineY);
        this.ctx.stroke();
      }
      
      // Add line length plus newline character (except for last line)
      charCount += line.length;
      if (index < lines.length - 1) {
        charCount += 1; // For the newline character
      }
    });
    
    this.ctx.restore();
  }

  // Helper function to wrap text into lines that fit within maxWidth
  private wrapTextToLines(text: string, maxWidth: number): string[] {
    // First split by explicit line breaks (\n)
    const paragraphs = text.split('\n');
    const lines: string[] = [];
    
    for (const paragraph of paragraphs) {
      if (paragraph === '') {
        // Empty line from explicit line break
        lines.push('');
        continue;
      }
      
      // For each paragraph, wrap words within maxWidth
      const words = paragraph.split(' ');
      let currentLine = '';
      
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = this.ctx.measureText(testLine).width;
        
        if (testWidth <= maxWidth || currentLine === '') {
          // Word fits on current line, or it's the first word
          currentLine = testLine;
        } else {
          // Word doesn't fit, start new line
          if (currentLine) {
            lines.push(currentLine);
          }
          currentLine = word;
        }
      }
      
      // Add the last line of this paragraph if it has content
      if (currentLine) {
        lines.push(currentLine);
      }
    }
    
    // Handle case where no lines were added (empty text)
    if (lines.length === 0) {
      lines.push('');
    }
    
    return lines;
  }

  private drawTextOnLine(element: Element) {
    if (!element.text || element.text.trim() === '') return;
    
    this.ctx.save();
    
    // Set text properties
    const fontSize = element.fontSize || 14; // Slightly smaller for line labels
    const fontFamily = element.fontFamily || 'Excalifont';
    const fontWeight = element.fontWeight || 'normal';
    const fontStyle = element.fontStyle || 'normal';
    
    this.ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
    this.ctx.fillStyle = element.strokeColor || '#000000';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    // Calculate midpoint of line
    const midX = element.width / 2;
    const midY = element.height / 2;
    
    // Calculate line angle for text rotation
    const lineAngle = Math.atan2(element.height, element.width);
    
    // Position text slightly above the line
    const offset = fontSize / 2 + 5; // 5px additional offset
    const offsetX = -Math.sin(lineAngle) * offset;
    const offsetY = Math.cos(lineAngle) * offset;
    
    const textX = midX + offsetX;
    const textY = midY + offsetY;
    
    // Add background rectangle for better readability
    const textMetrics = this.ctx.measureText(element.text);
    const padding = 4;
    const bgWidth = textMetrics.width + padding * 2;
    const bgHeight = fontSize + padding * 2;
    
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    this.ctx.fillRect(
      textX - bgWidth / 2,
      textY - bgHeight / 2,
      bgWidth,
      bgHeight
    );
    
    // Draw text
    this.ctx.fillStyle = element.strokeColor || '#000000';
    this.ctx.fillText(element.text, textX, textY);
    
    // Draw text decoration if specified
    if (element.textDecoration === 'underline') {
      const underlineY = textY + fontSize * 0.3; // Position underline below text baseline
      
      this.ctx.strokeStyle = element.strokeColor || '#000000';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(textX - textMetrics.width / 2, underlineY);
      this.ctx.lineTo(textX + textMetrics.width / 2, underlineY);
      this.ctx.stroke();
    }
    
    this.ctx.restore();
  }

  private drawImage(element: Element) {
    if (!element.imageUrl) return;
    
    // Check if image is already cached
    const cacheKey = `image-${element.imageUrl}`;
    let imageElement = this.shapeCache.get(cacheKey);
    
    if (!imageElement) {
      // Create new image element
      imageElement = new Image();
      imageElement.onload = () => {
        // Force a re-render when the image loads
        // This will cause the canvas to update and show the actual image instead of placeholder
        if (this.ctx && this.ctx.canvas) {
          const event = new CustomEvent('imageLoaded');
          this.ctx.canvas.dispatchEvent(event);
        }
      };
      imageElement.src = element.imageUrl;
      
      // Cache the image element
      this.shapeCache.set(cacheKey, imageElement);
    }
    
    // Draw the image if it's loaded
    if (imageElement.complete && imageElement.naturalHeight !== 0) {
      this.ctx.save();
      
      // Apply opacity
      this.ctx.globalAlpha = element.opacity;
      
      // Draw the image
      this.ctx.drawImage(
        imageElement,
        0,
        0,
        element.width,
        element.height
      );
      
      this.ctx.restore();
    } else {
      // Image not loaded yet, draw a placeholder rectangle
      this.ctx.save();
      
      // Draw placeholder background
      this.ctx.fillStyle = '#f0f0f0';
      this.ctx.fillRect(0, 0, element.width, element.height);
      
      // Draw border
      this.ctx.strokeStyle = '#ccc';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(0, 0, element.width, element.height);
      
      // Draw loading indicator
      this.ctx.fillStyle = '#999';
      this.ctx.font = '14px Inter';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('Loading...', element.width / 2, element.height / 2);
      
      this.ctx.restore();
      
      // Set up load event listener to redraw when image loads
      if (!imageElement.onload) {
        imageElement.onload = () => {
          // Force a redraw when image loads
          // This will be handled by the main render loop
          this.shapeCache.set(cacheKey, imageElement);
        };
      }
    }
  }
}