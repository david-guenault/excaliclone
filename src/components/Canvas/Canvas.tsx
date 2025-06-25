// ABOUTME: Main canvas component for drawing and rendering elements
// ABOUTME: Handles canvas setup, event management, and element rendering

import React, { useRef, useEffect, useCallback } from 'react';
import type { Point, Element, Viewport } from '../../types';
import { CanvasRenderer } from './CanvasRenderer';
import './Canvas.css';

interface CanvasProps {
  width: number;
  height: number;
  elements: Element[];
  viewport: Viewport;
  onMouseDown?: (point: Point, event: MouseEvent) => void;
  onMouseMove?: (point: Point, event: MouseEvent) => void;
  onMouseUp?: (point: Point, event: MouseEvent) => void;
  onWheel?: (event: WheelEvent) => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  width,
  height,
  elements,
  viewport,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onWheel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);

  const getCanvasPoint = useCallback((event: MouseEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
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
    renderer.renderElements(elements);
  }, [elements, viewport]);

  // Event handlers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp, handleWheel]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="excalibox-canvas"
    />
  );
};