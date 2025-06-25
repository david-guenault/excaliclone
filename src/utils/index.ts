// ABOUTME: Utility functions for geometric calculations and element manipulation
// ABOUTME: Common helper functions used throughout the application

import type { Point, Rect, Element } from '../types';

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const distance = (p1: Point, p2: Point): number => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

export const isPointInRect = (point: Point, rect: Rect): boolean => {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
};

export const getElementBounds = (element: Element): Rect => {
  return {
    x: element.x,
    y: element.y,
    width: element.width,
    height: element.height,
  };
};

export const transformPoint = (point: Point, zoom: number, pan: Point): Point => {
  return {
    x: (point.x - pan.x) * zoom,
    y: (point.y - pan.y) * zoom,
  };
};

export const inverseTransformPoint = (point: Point, zoom: number, pan: Point): Point => {
  return {
    x: point.x / zoom + pan.x,
    y: point.y / zoom + pan.y,
  };
};