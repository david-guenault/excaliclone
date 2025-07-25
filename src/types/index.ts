// ABOUTME: Core TypeScript types and interfaces for Excalibox
// ABOUTME: Defines the fundamental data structures for elements, points, tools, and application state

export interface Point {
  x: number;
  y: number;
}

export interface TextEditingState {
  elementId: string | null;
  position: Point | null;
  cursorPosition: number;
}

export interface DirectTextEditingState {
  isEditing: boolean;
  elementId: string | null;
  text: string;
  cursorPosition: number;
  selectionStart: number;
  selectionEnd: number;
  cursorVisible: boolean;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type ElementType = 'rectangle' | 'circle' | 'diamond' | 'line' | 'arrow' | 'text' | 'pen' | 'image';

export type StrokeStyle = 'solid' | 'dashed' | 'dotted';
export type LineCap = 'butt' | 'round' | 'square';
export type LineJoin = 'miter' | 'round' | 'bevel';
export type FillStyle = 'solid' | 'hachure' | 'cross-hatch';
export type CornerStyle = 'sharp' | 'rounded';
export type TextAlign = 'left' | 'center' | 'right';
export type TextVerticalAlign = 'top' | 'middle' | 'bottom';
export type FontWeight = 'normal' | 'bold';
export type FontStyle = 'normal' | 'italic';
export type TextDecoration = 'none' | 'underline';

export type ArrowheadType = 'none' | 'triangle' | 'line' | 'circle';

// Resize handle types for element manipulation
export type ResizeHandleType = 
  | 'top-left' 
  | 'top-right' 
  | 'bottom-left' 
  | 'bottom-right'
  | 'start-point' 
  | 'end-point'
  | 'rotation';

export interface ResizeHandle {
  type: ResizeHandleType;
  x: number;
  y: number;
  size: number;
}

export interface StyleClipboard {
  strokeColor: string;
  backgroundColor: string;
  strokeWidth: number;
  strokeStyle: StrokeStyle;
  fillStyle: FillStyle;
  roughness: number;
  opacity: number;
  cornerStyle?: CornerStyle;
  cornerRadius?: number;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: FontWeight;
  fontStyle?: FontStyle;
  textAlign?: TextAlign;
  textVerticalAlign?: TextVerticalAlign;
  textDecoration?: TextDecoration;
  startArrowhead?: ArrowheadType;
  endArrowhead?: ArrowheadType;
}

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
  lineCap?: LineCap; // For lines, arrows, and pen strokes
  lineJoin?: LineJoin; // For lines, arrows, and pen strokes
  fillStyle: FillStyle;
  roughness: number;
  opacity: number;
  cornerStyle?: CornerStyle; // For rectangles - sharp or rounded style
  cornerRadius?: number; // For rectangles - radius value in pixels
  points?: Point[]; // For pen tool and arrows
  text?: string; // For text elements
  fontFamily?: string; // For text elements
  fontSize?: number; // For text elements
  fontWeight?: FontWeight; // For text elements
  fontStyle?: FontStyle; // For text elements
  textAlign?: TextAlign; // For text elements
  textVerticalAlign?: TextVerticalAlign; // For vertical text alignment
  textDecoration?: TextDecoration; // For text elements
  imageUrl?: string; // For image elements
  locked?: boolean; // For element locking
  zIndex?: number; // For layering
  startArrowhead?: ArrowheadType; // For arrow and line start
  endArrowhead?: ArrowheadType; // For arrow and line end
  groupId?: string; // For element grouping
}

export interface Group {
  id: string;
  elementIds: string[];
  name?: string;
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
  cornerRadius: number;
  fontFamily: string;
  fontSize: number;
  fontWeight: FontWeight;
  fontStyle: FontStyle;
  textAlign: TextAlign;
  textVerticalAlign: TextVerticalAlign;
  textDecoration: TextDecoration;
  startArrowhead: ArrowheadType;
  endArrowhead: ArrowheadType;
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
  dialogs: {
    gridDialog: boolean;
  };
}

export interface AppState {
  viewport: Viewport;
  elements: Element[];
  selectedElementIds: string[];
  groups: Group[];
  activeTool: ToolType;
  toolOptions: ToolOptions;
  theme: 'light' | 'dark';
  ui: UIState;
  history: Element[][];
  historyIndex: number;
  clipboard: Element[] | null;
  styleClipboard: StyleClipboard | null;
  recentColors: string[];
  textEditing: DirectTextEditingState;
  isSaving: boolean;
}