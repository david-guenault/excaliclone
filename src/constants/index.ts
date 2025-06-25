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
  roughness: 1,
  opacity: 1,
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
} as const;