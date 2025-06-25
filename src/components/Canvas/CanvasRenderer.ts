// ABOUTME: Canvas rendering engine for drawing elements with 2D context
// ABOUTME: Handles the actual drawing operations for all element types

import type { Element, Viewport } from '../../types';

export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private viewport: Viewport;

  constructor(ctx: CanvasRenderingContext2D, viewport: Viewport) {
    this.ctx = ctx;
    this.viewport = viewport;
  }

  updateViewport(viewport: Viewport) {
    this.viewport = viewport;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  renderElement(element: Element) {
    this.ctx.save();
    
    // Apply viewport transformations
    this.ctx.scale(this.viewport.zoom, this.viewport.zoom);
    this.ctx.translate(-this.viewport.pan.x, -this.viewport.pan.y);
    
    // Apply element transformations
    this.ctx.translate(element.x + element.width / 2, element.y + element.height / 2);
    this.ctx.rotate(element.angle);
    this.ctx.translate(-element.width / 2, -element.height / 2);
    
    // Set drawing styles
    this.ctx.strokeStyle = element.strokeColor;
    this.ctx.fillStyle = element.backgroundColor;
    this.ctx.lineWidth = element.strokeWidth;
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

  renderElements(elements: Element[]) {
    this.clear();
    elements.forEach(element => this.renderElement(element));
  }

  private drawRectangle(element: Element) {
    if (element.backgroundColor !== 'transparent') {
      this.ctx.fillRect(0, 0, element.width, element.height);
    }
    this.ctx.strokeRect(0, 0, element.width, element.height);
  }

  private drawCircle(element: Element) {
    const centerX = element.width / 2;
    const centerY = element.height / 2;
    const radius = Math.min(element.width, element.height) / 2;

    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    
    if (element.backgroundColor !== 'transparent') {
      this.ctx.fill();
    }
    this.ctx.stroke();
  }

  private drawLine(element: Element) {
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(element.width, element.height);
    this.ctx.stroke();
  }

  private drawArrow(element: Element) {
    const headLength = 10;
    const headAngle = Math.PI / 6;
    
    // Draw main line
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(element.width, element.height);
    this.ctx.stroke();
    
    // Draw arrowhead
    const angle = Math.atan2(element.height, element.width);
    
    this.ctx.beginPath();
    this.ctx.moveTo(element.width, element.height);
    this.ctx.lineTo(
      element.width - headLength * Math.cos(angle - headAngle),
      element.height - headLength * Math.sin(angle - headAngle)
    );
    this.ctx.moveTo(element.width, element.height);
    this.ctx.lineTo(
      element.width - headLength * Math.cos(angle + headAngle),
      element.height - headLength * Math.sin(angle + headAngle)
    );
    this.ctx.stroke();
  }

  private drawText(element: Element) {
    if (!element.text) return;
    
    this.ctx.font = `${element.strokeWidth * 8}px Arial`;
    this.ctx.textBaseline = 'top';
    
    if (element.backgroundColor !== 'transparent') {
      this.ctx.fillText(element.text, 5, 5);
    }
    this.ctx.strokeText(element.text, 5, 5);
  }

  private drawPen(element: Element) {
    if (!element.points || element.points.length < 2) return;
    
    this.ctx.beginPath();
    this.ctx.moveTo(element.points[0].x - element.x, element.points[0].y - element.y);
    
    for (let i = 1; i < element.points.length; i++) {
      this.ctx.lineTo(element.points[i].x - element.x, element.points[i].y - element.y);
    }
    
    this.ctx.stroke();
  }
}