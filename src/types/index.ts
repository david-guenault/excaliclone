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

export type ElementType = 'rectangle' | 'circle' | 'diamond' | 'line' | 'arrow' | 'text' | 'pen' | 'image';

export type StrokeStyle = 'solid' | 'dashed' | 'dotted';
export type FillStyle = 'solid' | 'hachure' | 'cross-hatch' | 'transparent';
export type CornerStyle = 'sharp' | 'rounded';
export type TextAlign = 'left' | 'center' | 'right';
export type FontWeight = 'normal' | 'bold';
export type FontStyle = 'normal' | 'italic';

export type ArrowheadType = 'triangle' | 'line' | 'dot' | 'none';

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
  strokeStyle: StrokeStyle;
  fillStyle: FillStyle;
  roughness: number;
  opacity: number;
  cornerStyle?: CornerStyle; // For rectangles/polygons
  points?: Point[]; // For pen tool and arrows
  text?: string; // For text elements
  fontFamily?: string; // For text elements
  fontSize?: number; // For text elements
  fontWeight?: FontWeight; // For text elements
  fontStyle?: FontStyle; // For text elements
  textAlign?: TextAlign; // For text elements
  imageUrl?: string; // For image elements
  locked?: boolean; // For element locking
  zIndex?: number; // For layering
  startArrowHead?: ArrowheadType; // For arrow start
  endArrowHead?: ArrowheadType; // For arrow end
}

export type ToolType = ElementType | 'select' | 'move' | 'resize' | 'lock' | 'hand' | 'eraser';

export interface ToolOptions {
  strokeColor: string;
  backgroundColor: string;
  strokeWidth: number;
  strokeStyle: StrokeStyle;
  fillStyle: FillStyle;
  roughness: number;
  opacity: number;
  cornerStyle: CornerStyle;
  fontFamily: string;
  fontSize: number;
  fontWeight: FontWeight;
  fontStyle: FontStyle;
  textAlign: TextAlign;
}

export interface Viewport {
  zoom: number;
  pan: Point;
  bounds: Rect;
}

export interface GridSettings {
  enabled: boolean;
  size: number; // Grid cell size in pixels
  snapToGrid: boolean;
  snapDistance: number; // Distance in pixels for snapping
  showGrid: boolean;
  color: string;
  opacity: number;
}

export interface UIState {
  propertiesPanel: {
    visible: boolean;
    width: number; // 250-400px
  };
  topToolbar: {
    visible: boolean;
  };
  canvasLocked: boolean;
  grid: GridSettings;
}

export interface AppState {
  viewport: Viewport;
  elements: Element[];
  selectedElementIds: string[];
  activeTool: ToolType;
  toolOptions: ToolOptions;
  theme: 'light' | 'dark';
  ui: UIState;
  history: Element[][];
  historyIndex: number;
  clipboard: Element[] | null;
  recentColors: string[];
}