// ABOUTME: File import utilities for Excalidraw and Draw.io diagram formats
// ABOUTME: Provides parsing and conversion functionality for external diagram files

import type { Element } from '../types';

// Excalidraw format interfaces
export interface ExcalidrawElement {
  id: string;
  type: 'rectangle' | 'ellipse' | 'diamond' | 'line' | 'arrow' | 'text' | 'draw' | 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  strokeColor: string;
  backgroundColor: string;
  fillStyle: 'hachure' | 'cross-hatch' | 'solid';
  strokeWidth: number;
  strokeStyle: 'solid' | 'dashed' | 'dotted';
  roughness: number;
  opacity: number;
  points?: [number, number][];
  text?: string;
  fontSize?: number;
  fontFamily?: number; // Excalidraw uses font IDs
  textAlign?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  startArrowhead?: 'arrow' | 'triangle' | 'circle' | null;
  endArrowhead?: 'arrow' | 'triangle' | 'circle' | null;
  seed?: number;
  versionNonce?: number;
  isDeleted?: boolean;
  link?: string;
  locked?: boolean;
  customData?: any;
}

export interface ExcalidrawFile {
  type: string;
  version: number;
  source: string;
  elements: ExcalidrawElement[];
  appState: {
    gridSize: number | null;
    viewBackgroundColor: string;
    currentItemStrokeColor: string;
    currentItemBackgroundColor: string;
    currentItemFillStyle: string;
    currentItemStrokeWidth: number;
    currentItemStrokeStyle: string;
    currentItemRoughness: number;
    currentItemOpacity: number;
    currentItemFontFamily: number;
    currentItemFontSize: number;
    currentItemTextAlign: string;
    currentItemArrowhead: string;
    currentItemStartArrowhead: string;
    currentItemEndArrowhead: string;
    scrollX: number;
    scrollY: number;
    zoom: number;
    currentItemRoundness: string;
    gridStep: number;
    gridModeEnabled: boolean;
    [key: string]: any;
  };
  files?: { [id: string]: any };
}

// Draw.io format interfaces
export interface DrawioGeometry {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  relative?: string;
  as?: string;
}

export interface DrawioStyle {
  [key: string]: string | number;
}

export interface DrawioCell {
  id: string;
  value?: string;
  style?: string;
  vertex?: string;
  edge?: string;
  parent?: string;
  source?: string;
  target?: string;
  geometry?: DrawioGeometry;
  children?: DrawioCell[];
}

export interface DrawioRoot {
  mxCell: DrawioCell[];
}

export interface DrawioFile {
  mxfile: {
    host?: string;
    modified?: string;
    agent?: string;
    version?: string;
    etag?: string;
    type?: string;
    diagram: {
      id?: string;
      name?: string;
      mxGraphModel: {
        dx?: number;
        dy?: number;
        grid?: number;
        gridSize?: number;
        guides?: number;
        tooltips?: number;
        connect?: number;
        arrows?: number;
        fold?: number;
        page?: number;
        pageScale?: number;
        pageWidth?: number;
        pageHeight?: number;
        math?: number;
        shadow?: number;
        background?: string;
        root: DrawioRoot;
      };
    };
  };
}

// Font family mapping from Excalidraw IDs to actual font names
const EXCALIDRAW_FONT_FAMILIES = {
  1: 'Virgil', // Hand-drawn style
  2: 'Helvetica', // Modern sans-serif
  3: 'Cascadia', // Monospace
  4: 'excalifont' // Custom font
};

// Color mapping utilities
function normalizeColor(color: string): string {
  if (!color || color === 'transparent') return '#000000';
  if (color.startsWith('#')) return color;
  if (color.startsWith('rgb')) {
    // Convert rgb(a) to hex
    const matches = color.match(/\d+/g);
    if (matches && matches.length >= 3) {
      const r = parseInt(matches[0]).toString(16).padStart(2, '0');
      const g = parseInt(matches[1]).toString(16).padStart(2, '0');
      const b = parseInt(matches[2]).toString(16).padStart(2, '0');
      return `#${r}${g}${b}`;
    }
  }
  return color.startsWith('#') ? color : '#000000';
}

// Generate unique ID for imported elements
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Convert Excalidraw element to Excalibox element
function convertExcalidrawElement(excElement: ExcalidrawElement): Element | null {
  try {
    // Map element types
    let type: Element['type'];
    switch (excElement.type) {
      case 'rectangle':
        type = 'rectangle';
        break;
      case 'ellipse':
        type = 'circle';
        break;
      case 'diamond':
        type = 'diamond';
        break;
      case 'line':
        type = 'line';
        break;
      case 'arrow':
        type = 'arrow';
        break;
      case 'text':
        type = 'text';
        break;
      case 'draw':
        type = 'pen';
        break;
      case 'image':
        type = 'image';
        break;
      default:
        console.warn(`Unsupported Excalidraw element type: ${excElement.type}`);
        return null;
    }

    // Map arrowhead types
    function mapArrowhead(arrowhead: string | null | undefined): Element['startArrowhead'] {
      switch (arrowhead) {
        case 'arrow':
        case 'triangle':
          return 'triangle';
        case 'circle':
          return 'circle';
        default:
          return 'none';
      }
    }

    // Create Excalibox element
    const element: Element = {
      id: generateId(),
      type,
      x: excElement.x,
      y: excElement.y,
      width: excElement.width,
      height: excElement.height,
      angle: excElement.angle || 0,
      strokeColor: normalizeColor(excElement.strokeColor),
      backgroundColor: normalizeColor(excElement.backgroundColor),
      strokeWidth: excElement.strokeWidth || 1,
      strokeStyle: excElement.strokeStyle || 'solid',
      fillStyle: excElement.fillStyle || 'solid',
      roughness: excElement.roughness || 1,
      opacity: excElement.opacity ?? 1,
    };

    // Add type-specific properties
    if (type === 'text' && excElement.text) {
      element.text = excElement.text;
      element.fontSize = excElement.fontSize || 16;
      element.fontFamily = EXCALIDRAW_FONT_FAMILIES[excElement.fontFamily as keyof typeof EXCALIDRAW_FONT_FAMILIES] || 'excalifont';
      element.textAlign = excElement.textAlign || 'left';
      element.textVerticalAlign = excElement.verticalAlign || 'top';
    }

    if ((type === 'line' || type === 'arrow') && excElement.points) {
      element.points = excElement.points.map(([x, y]) => ({ x, y }));
    }

    if (type === 'pen' && excElement.points) {
      element.points = excElement.points.map(([x, y]) => ({ x, y }));
    }

    if (type === 'arrow') {
      element.startArrowhead = mapArrowhead(excElement.startArrowhead);
      element.endArrowhead = mapArrowhead(excElement.endArrowhead);
    }

    return element;
  } catch (error) {
    console.error('Error converting Excalidraw element:', error);
    return null;
  }
}

// Parse Draw.io style string
function parseDrawioStyle(styleString: string): DrawioStyle {
  const style: DrawioStyle = {};
  if (!styleString) return style;

  const pairs = styleString.split(';');
  for (const pair of pairs) {
    const [key, value] = pair.split('=');
    if (key && value !== undefined) {
      style[key] = value;
    }
  }
  return style;
}

// Convert Draw.io cell to Excalibox element
function convertDrawioCell(cell: DrawioCell): Element | null {
  try {
    if (!cell.vertex || !cell.geometry) return null;

    const style = parseDrawioStyle(cell.style || '');
    const geo = cell.geometry;

    // Determine element type based on style
    let type: Element['type'] = 'rectangle';
    if (style.ellipse) {
      type = 'circle';
    } else if (style.rhombus) {
      type = 'diamond';
    } else if (cell.value && cell.value.trim()) {
      type = 'text';
    }

    const element: Element = {
      id: generateId(),
      type,
      x: geo.x || 0,
      y: geo.y || 0,
      width: geo.width || 100,
      height: geo.height || 50,
      angle: 0,
      strokeColor: normalizeColor(style.strokeColor as string || '#000000'),
      backgroundColor: normalizeColor(style.fillColor as string || 'transparent'),
      strokeWidth: parseInt(style.strokeWidth as string) || 1,
      strokeStyle: 'solid',
      fillStyle: 'solid',
      roughness: 1,
      opacity: 1,
    };

    // Add text content if present
    if (cell.value && cell.value.trim()) {
      element.text = cell.value.trim();
      element.fontSize = parseInt(style.fontSize as string) || 12;
      element.fontFamily = style.fontFamily as string || 'excalifont';
      element.textAlign = 'center';
      element.textVerticalAlign = 'middle';
    }

    return element;
  } catch (error) {
    console.error('Error converting Draw.io cell:', error);
    return null;
  }
}

// Main import functions
export async function importExcalidrawFile(file: File): Promise<Element[]> {
  try {
    const text = await file.text();
    const data: ExcalidrawFile = JSON.parse(text);

    if (!data.elements || !Array.isArray(data.elements)) {
      throw new Error('Invalid Excalidraw file format');
    }

    const elements: Element[] = [];
    for (const excElement of data.elements) {
      if (excElement.isDeleted) continue;
      
      const element = convertExcalidrawElement(excElement);
      if (element) {
        elements.push(element);
      }
    }

    return elements;
  } catch (error) {
    console.error('Error importing Excalidraw file:', error);
    throw new Error('Failed to import Excalidraw file: ' + (error as Error).message);
  }
}

export async function importDrawioFile(file: File): Promise<Element[]> {
  try {
    const text = await file.text();
    
    // Parse XML
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, 'text/xml');
    
    // Check for parsing errors
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      throw new Error('Invalid XML format');
    }

    // Find the root element
    const rootElement = xmlDoc.querySelector('root');
    if (!rootElement) {
      throw new Error('Invalid Draw.io file format - no root element found');
    }

    const elements: Element[] = [];
    const cells = rootElement.querySelectorAll('mxCell');

    for (const cellNode of Array.from(cells)) {
      const cell: DrawioCell = {
        id: cellNode.getAttribute('id') || '',
        value: cellNode.getAttribute('value') || '',
        style: cellNode.getAttribute('style') || '',
        vertex: cellNode.getAttribute('vertex') || '',
        parent: cellNode.getAttribute('parent') || '',
      };

      // Parse geometry
      const geometryNode = cellNode.querySelector('mxGeometry');
      if (geometryNode) {
        cell.geometry = {
          x: parseFloat(geometryNode.getAttribute('x') || '0'),
          y: parseFloat(geometryNode.getAttribute('y') || '0'),
          width: parseFloat(geometryNode.getAttribute('width') || '100'),
          height: parseFloat(geometryNode.getAttribute('height') || '50'),
        };
      }

      const element = convertDrawioCell(cell);
      if (element) {
        elements.push(element);
      }
    }

    return elements;
  } catch (error) {
    console.error('Error importing Draw.io file:', error);
    throw new Error('Failed to import Draw.io file: ' + (error as Error).message);
  }
}

// File type detection
export function detectFileType(file: File): 'excalidraw' | 'drawio' | 'unknown' {
  const extension = file.name.toLowerCase().split('.').pop();
  
  if (extension === 'excalidraw') {
    return 'excalidraw';
  }
  
  if (extension === 'drawio' || extension === 'xml') {
    return 'drawio';
  }
  
  return 'unknown';
}

// Main import function that handles both formats
export async function importDiagramFile(file: File): Promise<Element[]> {
  const fileType = detectFileType(file);
  
  switch (fileType) {
    case 'excalidraw':
      return await importExcalidrawFile(file);
    case 'drawio':
      return await importDrawioFile(file);
    default:
      throw new Error(`Unsupported file format. Supported formats: .excalidraw, .drawio, .xml`);
  }
}