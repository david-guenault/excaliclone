// ABOUTME: Core TypeScript types and interfaces for Excalibox
// ABOUTME: Defines the fundamental data structures for elements, points, tools, and application state

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type ElementType = 'rectangle' | 'circle' | 'line' | 'arrow' | 'text' | 'pen';

export interface Element {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  strokeColor: string;
  backgroundColor: string;
  strokeWidth: number;
  roughness: number;
  opacity: number;
  points?: Point[]; // For pen tool
  text?: string; // For text elements
}

export type ToolType = ElementType | 'select' | 'move' | 'resize';

export interface ToolOptions {
  strokeColor: string;
  backgroundColor: string;
  strokeWidth: number;
  roughness: number;
  opacity: number;
}

export interface Viewport {
  zoom: number;
  pan: Point;
  bounds: Rect;
}

export interface AppState {
  viewport: Viewport;
  elements: Element[];
  selectedElementIds: string[];
  activeTool: ToolType;
  toolOptions: ToolOptions;
  theme: 'light' | 'dark';
  panels: {
    toolbar: boolean;
    sidebar: boolean;
  };
  history: Element[][];
  historyIndex: number;
}