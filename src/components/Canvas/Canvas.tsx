// ABOUTME: Main canvas component for drawing and rendering elements
// ABOUTME: Handles canvas setup, event management, and element rendering

import React, { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import type { Point, Element, Viewport, GridSettings, DirectTextEditingState } from '../../types';
import { CanvasRenderer } from './CanvasRenderer';
import './Canvas.css';

interface CanvasProps {
  width: number;
  height: number;
  elements: Element[];
  viewport: Viewport;
  gridSettings?: GridSettings;
  selectedElementIds?: string[];
  dragSelectionRect?: { start: Point; end: Point } | null;
  textEditing?: DirectTextEditingState | null;
  onMouseDown?: (point: Point, event: MouseEvent) => void;
  onMouseMove?: (point: Point, event: MouseEvent) => void;
  onMouseUp?: (point: Point, event: MouseEvent) => void;
  onDoubleClick?: (point: Point, event: MouseEvent) => void;
  onWheel?: (event: WheelEvent) => void;
}

export const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(({
  width,
  height,
  elements,
  viewport,
  gridSettings,
  selectedElementIds = [],
  dragSelectionRect = null,
  textEditing = null,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onDoubleClick,
  onWheel,
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);

  // Expose the canvas element to the parent
  useImperativeHandle(ref, () => canvasRef.current!, []);

  const getCanvasPoint = useCallback((event: MouseEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const point = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    
    
    return point;
  }, []);

  const handleMouseDown = useCallback((event: MouseEvent) => {
    const point = getCanvasPoint(event);
    onMouseDown?.(point, event);
  }, [getCanvasPoint, onMouseDown]);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    const point = getCanvasPoint(event);
    onMouseMove?.(point, event);
  }, [getCanvasPoint, onMouseMove]);

  const handleMouseUp = useCallback((event: MouseEvent) => {
    const point = getCanvasPoint(event);
    onMouseUp?.(point, event);
  }, [getCanvasPoint, onMouseUp]);

  const handleDoubleClick = useCallback((event: MouseEvent) => {
    const point = getCanvasPoint(event);
    onDoubleClick?.(point, event);
  }, [getCanvasPoint, onDoubleClick]);

  const handleWheel = useCallback((event: WheelEvent) => {
    onWheel?.(event);
  }, [onWheel]);

  // Initialize renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    rendererRef.current = new CanvasRenderer(ctx, viewport);
  }, [viewport]);

  // Render elements when they change
  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;

    renderer.updateViewport(viewport);
    renderer.renderElements(elements, gridSettings, selectedElementIds, dragSelectionRect, textEditing);
  }, [elements, viewport, gridSettings, selectedElementIds, dragSelectionRect, textEditing]);

  // Animation loop for blinking cursor when text editing is active
  useEffect(() => {
    if (!textEditing) return;

    const animate = () => {
      const renderer = rendererRef.current;
      if (renderer) {
        renderer.updateViewport(viewport);
        renderer.renderElements(elements, gridSettings, selectedElementIds, dragSelectionRect, textEditing);
      }
    };

    // Start animation loop for cursor blinking
    const intervalId = setInterval(animate, 100); // Update every 100ms for smooth blinking

    return () => {
      clearInterval(intervalId);
    };
  }, [textEditing, elements, viewport, gridSettings, selectedElementIds, dragSelectionRect]);

  // Event handlers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('dblclick', handleDoubleClick);
    canvas.addEventListener('wheel', handleWheel);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('dblclick', handleDoubleClick);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp, handleDoubleClick, handleWheel]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="excalibox-canvas"
      role="img"
      aria-label={`Drawing canvas with ${elements.length} elements`}
      tabIndex={0}
    />
  );
});