// ABOUTME: Excalidraw-compatible color palette based on Open Colors
// ABOUTME: Standard color definitions for stroke, background, and UI elements

export interface ColorDefinition {
  name: string;
  value: string;
  lightness: 'light' | 'medium' | 'dark';
}

// Main stroke colors (darker shades for visibility) - Open Colors shade 7-9
export const STROKE_COLORS: ColorDefinition[] = [
  { name: 'Black', value: '#000000', lightness: 'dark' },
  { name: 'Dark Gray', value: '#495057', lightness: 'dark' },
  { name: 'Red', value: '#c92a2a', lightness: 'dark' },
  { name: 'Pink', value: '#a61e4d', lightness: 'dark' },
  { name: 'Grape', value: '#862e9c', lightness: 'dark' },
  { name: 'Violet', value: '#5f3dc4', lightness: 'dark' },
  { name: 'Indigo', value: '#364fc7', lightness: 'dark' },
  { name: 'Blue', value: '#1864ab', lightness: 'dark' },
  { name: 'Cyan', value: '#0b7285', lightness: 'dark' },
  { name: 'Teal', value: '#087f5b', lightness: 'dark' },
  { name: 'Green', value: '#2b8a3e', lightness: 'dark' },
  { name: 'Lime', value: '#5c940d', lightness: 'dark' },
  { name: 'Yellow', value: '#e67700', lightness: 'medium' },
  { name: 'Orange', value: '#d9480f', lightness: 'dark' },
];

// Background fill colors (lighter shades) - Open Colors shade 1-4
export const BACKGROUND_COLORS: ColorDefinition[] = [
  { name: 'Transparent', value: 'transparent', lightness: 'light' },
  { name: 'White', value: '#ffffff', lightness: 'light' },
  { name: 'Light Gray', value: '#f1f3f5', lightness: 'light' },
  { name: 'Light Red', value: '#ffe3e3', lightness: 'light' },
  { name: 'Light Pink', value: '#ffdeeb', lightness: 'light' },
  { name: 'Light Grape', value: '#f3d9fa', lightness: 'light' },
  { name: 'Light Violet', value: '#e5dbff', lightness: 'light' },
  { name: 'Light Indigo', value: '#dbe4ff', lightness: 'light' },
  { name: 'Light Blue', value: '#d0ebff', lightness: 'light' },
  { name: 'Light Cyan', value: '#c5f6fa', lightness: 'light' },
  { name: 'Light Teal', value: '#c3fae8', lightness: 'light' },
  { name: 'Light Green', value: '#d3f9d8', lightness: 'light' },
  { name: 'Light Lime', value: '#e9fac8', lightness: 'light' },
  { name: 'Light Yellow', value: '#fff3bf', lightness: 'light' },
  { name: 'Light Orange', value: '#ffe8cc', lightness: 'light' },
];

// Default colors for new elements
export const DEFAULT_COLORS = {
  stroke: STROKE_COLORS[0].value, // Black
  background: BACKGROUND_COLORS[0].value, // Transparent
};

// Excalidraw standard color groups for UI
export const COLOR_GROUPS = {
  grayscale: [
    STROKE_COLORS[0], // Black
    STROKE_COLORS[1], // Dark Gray
    { name: 'Gray', value: '#868e96', lightness: 'medium' as const },
    { name: 'Light Gray', value: '#ced4da', lightness: 'light' as const },
    { name: 'White', value: '#ffffff', lightness: 'light' as const },
  ],
  warm: [
    STROKE_COLORS[2], // Red
    STROKE_COLORS[13], // Orange  
    STROKE_COLORS[12], // Yellow
    STROKE_COLORS[3], // Pink
  ],
  cool: [
    STROKE_COLORS[7], // Blue
    STROKE_COLORS[8], // Cyan
    STROKE_COLORS[9], // Teal
    STROKE_COLORS[10], // Green
  ],
  vibrant: [
    STROKE_COLORS[4], // Grape
    STROKE_COLORS[5], // Violet
    STROKE_COLORS[6], // Indigo
    STROKE_COLORS[11], // Lime
  ],
};

// Color palette for the main UI (used in toolbar and properties panel)
export const MAIN_COLORS = [
  STROKE_COLORS[0], // Black
  STROKE_COLORS[1], // Dark Gray  
  STROKE_COLORS[2], // Red
  STROKE_COLORS[13], // Orange
  STROKE_COLORS[12], // Yellow
  STROKE_COLORS[10], // Green
  STROKE_COLORS[7], // Blue
  STROKE_COLORS[6], // Indigo
  STROKE_COLORS[5], // Violet
  STROKE_COLORS[3], // Pink
];

// Recent colors storage key
export const RECENT_COLORS_STORAGE_KEY = 'excalibox-recent-colors';
export const MAX_RECENT_COLORS = 8;

// Color utilities
export const isValidHexColor = (color: string): boolean => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};

export const getContrastColor = (hexColor: string): string => {
  // Remove # if present
  const hex = hexColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black or white based on luminance
  return luminance > 0.5 ? '#000000' : '#ffffff';
};