// ABOUTME: Application constants and default values
// ABOUTME: Centralized configuration for colors, sizes, and default settings

export const CANVAS_CONFIG = {
  DEFAULT_ZOOM: 1,
  MIN_ZOOM: 0.1,
  MAX_ZOOM: 5,
  ZOOM_STEP: 0.1,
} as const;

export const DEFAULT_TOOL_OPTIONS = {
  strokeColor: '#000000',
  backgroundColor: 'transparent',
  strokeWidth: 2,
  strokeStyle: 'solid' as const,
  fillStyle: 'transparent' as const,
  roughness: 1,
  opacity: 1,
  cornerStyle: 'sharp' as const,
  fontFamily: 'Inter',
  fontSize: 16,
  fontWeight: 'normal' as const,
  fontStyle: 'normal' as const,
  textAlign: 'left' as const,
} as const;

export const COLORS = {
  PRIMARY: '#5f5f5f',
  SECONDARY: '#f0f0f0',
  ACCENT: '#007acc',
  BACKGROUND: '#ffffff',
  CANVAS: '#fafafa',
} as const;

export const ELEMENT_DEFAULTS = {
  MIN_SIZE: 10,
  DEFAULT_WIDTH: 100,
  DEFAULT_HEIGHT: 100,
  LINE_MIN_LENGTH: 20,
  LINE_DEFAULT_LENGTH: 120,
} as const;

export const ROUGHNESS_LEVELS = {
  PRECISE: 0,
  SMOOTH: 0.5,
  NORMAL: 1,
  ROUGH: 1.5,
  VERY_ROUGH: 2,
  EXTREME: 3,
} as const;

export const ROUGHNESS_PRESETS = [
  { name: 'Precise', value: ROUGHNESS_LEVELS.PRECISE },
  { name: 'Smooth', value: ROUGHNESS_LEVELS.SMOOTH },
  { name: 'Normal', value: ROUGHNESS_LEVELS.NORMAL },
  { name: 'Rough', value: ROUGHNESS_LEVELS.ROUGH },
  { name: 'Very Rough', value: ROUGHNESS_LEVELS.VERY_ROUGH },
  { name: 'Extreme', value: ROUGHNESS_LEVELS.EXTREME },
] as const;

export const KEYBOARD_SHORTCUTS = {
  // Tool shortcuts
  LOCK: '1',
  HAND: 'h',
  SELECT: 's',
  RECTANGLE: 'r',
  DIAMOND: 'd',
  CIRCLE: 'c',
  ARROW: 'a',
  LINE: 'l',
  PEN: 'p',
  TEXT: 't',
  IMAGE: 'i',
  ERASER: 'e',
  
  // Action shortcuts
  UNDO: 'z',
  REDO: 'y',
  COPY: 'c',
  PASTE: 'v',
  DELETE: 'Delete',
  SELECT_ALL: 'a',
  
  // Grid shortcuts
  TOGGLE_GRID: 'g',
} as const;

export const TOOLBAR_CONFIG = {
  HEIGHT: 44,
  TOOL_SIZE: 32,
  TOOL_ICON_SIZE: 20,
  BORDER_RADIUS: 12,
  TOOL_BORDER_RADIUS: 6,
  SHADOW: '0 2px 8px rgba(0,0,0,0.1)',
  BACKGROUND: '#f8f9fa',
  TOOL_PADDING: 6,
  TOOL_GAP: 4,
} as const;

// Grid System Constants
export const GRID_CONFIG = {
  DEFAULT_SIZE: 20,
  MIN_SIZE: 5,
  MAX_SIZE: 100,
  DEFAULT_SNAP_DISTANCE: 10,
  COLOR: '#e1e5e9',
  OPACITY: 0.3,
} as const;

export const GRID_SIZE_PRESETS = [
  { name: 'Fine', value: 10 },
  { name: 'Normal', value: 20 },
  { name: 'Coarse', value: 40 },
  { name: 'Large', value: 80 },
] as const;

// Properties Panel Constants (based on design_examples/properties1.png + properties2.png)
export const PROPERTIES_PANEL_CONFIG = {
  WIDTH: 280, // Further increased width to ensure 6 color elements fit with all borders and spacing
  ACCENT_COLOR: '#8B5CF6', // Purple accent color
} as const;

// Stroke Colors (Trait) - from properties1.png
export const STROKE_COLORS = [
  '#000000', // Black
  '#EF4444', // Red
  '#10B981', // Green  
  '#3B82F6', // Blue
  '#F59E0B', // Orange
] as const;

// Background Colors (Arrière-plan) - from properties1.png
export const BACKGROUND_COLORS = [
  '#FFFFFF', // White
  '#FECACA', // Light Pink
  '#A7F3D0', // Light Mint
  '#DBEAFE', // Light Blue
  '#FEF3C7', // Light Yellow
  '#F3F4F6', // Light Gray
] as const;

// Fill Patterns (Remplissage)
export const FILL_PATTERNS = [
  { type: 'hachure' as const, icon: '▦', label: 'Hachure' },
  { type: 'cross-hatch' as const, icon: '▩', label: 'Cross-hatch' },
  { type: 'solid' as const, icon: '█', label: 'Solid' },
] as const;

// Stroke Width Presets (Largeur du contour)
export const STROKE_WIDTH_PRESETS = [1, 2, 4] as const;

// Stroke Style Presets (Style du trait)
export const STROKE_STYLE_PRESETS = [
  { type: 'solid' as const, preview: '━━━━━', label: 'Solid' },
  { type: 'dashed' as const, preview: '┅┅┅┅┅', label: 'Dashed' },
  { type: 'dotted' as const, preview: '·····', label: 'Dotted' },
] as const;

// Roughness Presets simplified (Style de tracé)
export const ROUGHNESS_SIMPLE_PRESETS = [
  { name: 'Lisse', value: 0 },
  { name: 'Normal', value: 1 },
  { name: 'Rugueux', value: 2 },
] as const;

// Corner Style Presets (Angles)
export const CORNER_STYLE_PRESETS = [
  { type: 'sharp' as const, icon: '⬜', label: 'Sharp' },
  { type: 'rounded' as const, icon: '▢', label: 'Rounded' },
] as const;

// Font Size Presets (Taille de la police)
export const FONT_SIZE_PRESETS = [
  { size: 'S', value: 12 },
  { size: 'M', value: 16 },
  { size: 'L', value: 24 },
  { size: 'XL', value: 32 },
] as const;

// Recent Colors Storage
export const RECENT_COLORS_STORAGE_KEY = 'excalibox-recent-colors';

// Line Drawing Constants
export const LINE_CONFIG = {
  ANGLE_SNAP_THRESHOLD: 15, // degrees
  ANGLE_SNAP_INCREMENTS: 45, // snap to 45-degree increments
  MIN_DRAG_DISTANCE: 5, // minimum distance to register a drag
} as const;

// Arrow Drawing Constants
export const ARROW_CONFIG = {
  ANGLE_SNAP_THRESHOLD: 15, // degrees
  ANGLE_SNAP_INCREMENTS: 45, // snap to 45-degree increments
  MIN_DRAG_DISTANCE: 5, // minimum distance to register a drag
  ARROWHEAD_SIZE: 12, // arrowhead size in pixels
  ARROWHEAD_ANGLE: Math.PI / 6, // 30 degrees in radians
  DEFAULT_ARROWHEAD: 'triangle' as const,
} as const;
export const MAX_RECENT_COLORS = 12;

// Properties Panel Color Palettes (5 predefined + 1 current/picker)
export const PANEL_STROKE_COLORS = [
  '#000000', // Black
  '#c92a2a', // Red  
  '#2b8a3e', // Green
  '#1864ab', // Blue
  '#e67700', // Orange
] as const;

export const PANEL_BACKGROUND_COLORS = [
  'transparent', // Transparent
  '#ffffff',     // White
  '#f1f3f5',     // Light Gray
  '#d0ebff',     // Light Blue
  '#fff3bf',     // Light Yellow
] as const;

// Re-export color constants
export * from './colors';