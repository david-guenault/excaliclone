// ABOUTME: Zustand store for global application state management
// ABOUTME: Centralized state for elements, tools, viewport, and UI settings

import { create } from 'zustand';
import type { AppState, Element, ToolType, Point, StyleClipboard, DoubleClickTextEditingState } from '../types';
import { DEFAULT_TOOL_OPTIONS, CANVAS_CONFIG, RECENT_COLORS_STORAGE_KEY, MAX_RECENT_COLORS, GRID_CONFIG } from '../constants';
import { generateId } from '../utils';

interface AppStore extends AppState {
  // Actions
  addElement: (element: Omit<Element, 'id'>) => Element;
  addElementSilent: (element: Omit<Element, 'id'>) => Element;
  updateElement: (id: string, updates: Partial<Element>) => void;
  updateElementSilent: (id: string, updates: Partial<Element>) => void;
  deleteElement: (id: string) => void;
  deleteSelectedElements: () => void;
  selectElement: (id: string) => void;
  selectElements: (ids: string[]) => void;
  selectAll: () => void;
  clearSelection: () => void;
  setActiveTool: (tool: ToolType) => void;
  setZoom: (zoom: number) => void;
  setPan: (pan: Point) => void;
  resetZoom: () => void;
  zoomToFit: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  copy: () => void;
  paste: () => void;
  undo: () => void;
  redo: () => void;
  // UI Actions
  setPropertiesPanelVisible: (visible: boolean) => void;
  setPropertiesPanelWidth: (width: number) => void;
  setTopToolbarVisible: (visible: boolean) => void;
  setCanvasLocked: (locked: boolean) => void;
  toggleCanvasLock: () => void;
  // Color Actions
  setStrokeColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  addRecentColor: (color: string) => void;
  clearRecentColors: () => void;
  // Grid Actions
  setGridEnabled: (enabled: boolean) => void;
  setGridSize: (size: number) => void;
  setGridSnapEnabled: (enabled: boolean) => void;
  setGridVisible: (visible: boolean) => void;
  setGridSnapDistance: (distance: number) => void;
  toggleGrid: () => void;
  snapToGrid: (point: Point) => Point;
  // Element Management Actions
  duplicateElement: (id: string) => void;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  toggleElementLock: (id: string) => void;
  // Style Actions
  copyStyle: () => void;
  pasteStyle: () => void;
  // History Actions
  saveToHistory: () => void;
  // Double-Click Text Editing Actions
  startDoubleClickTextEditing: (elementId: string, position: Point, initialText: string) => void;
  endDoubleClickTextEditing: () => void;
  saveDoubleClickTextEdit: (text: string) => void;
  cancelDoubleClickTextEdit: () => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  // Initial state
  viewport: {
    zoom: CANVAS_CONFIG.DEFAULT_ZOOM,
    pan: { x: 0, y: 0 },
    bounds: { x: 0, y: 0, width: 800, height: 600 },
  },
  elements: [],
  selectedElementIds: [],
  activeTool: 'select',
  toolOptions: DEFAULT_TOOL_OPTIONS,
  theme: 'light',
  ui: {
    propertiesPanel: {
      visible: false, // Hidden by default, shows when elements selected
      width: 200, // Fixed width from new design
    },
    topToolbar: {
      visible: true,
    },
    canvasLocked: false,
    grid: {
      enabled: true,
      size: GRID_CONFIG.DEFAULT_SIZE,
      snapToGrid: false,
      snapDistance: GRID_CONFIG.DEFAULT_SNAP_DISTANCE,
      showGrid: false, // Hidden by default, can be toggled
      color: GRID_CONFIG.COLOR,
      opacity: GRID_CONFIG.OPACITY,
    },
  },
  history: [[]],
  historyIndex: 0,
  clipboard: null,
  styleClipboard: null,
  recentColors: JSON.parse(localStorage.getItem(RECENT_COLORS_STORAGE_KEY) || '[]'),
  doubleClickTextEditing: {
    isEditing: false,
    elementId: null,
    position: null,
    initialText: '',
  },

  // Actions
  addElement: (elementData) => {
    let createdElement: Element;
    
    // Create element first
    createdElement = {
      // Apply provided data first, then defaults for missing properties
      ...elementData,
      // Default properties for new elements (only if not provided)
      strokeStyle: elementData.strokeStyle || 'solid',
      fillStyle: elementData.fillStyle || 'solid',
      cornerStyle: elementData.cornerStyle || 'sharp',
      fontFamily: elementData.fontFamily || 'Inter',
      fontSize: elementData.fontSize || 16,
      fontWeight: elementData.fontWeight || 'normal',
      fontStyle: elementData.fontStyle || 'normal',
      textAlign: elementData.textAlign || 'left',
      locked: elementData.locked || false,
      zIndex: elementData.zIndex || 0,
      id: generateId(),
    };
    
    set((state) => {
      const newElements = [...state.elements, createdElement];
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newElements);
      
      return {
        elements: newElements,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
    
    return createdElement;
  },

  addElementSilent: (elementData) => {
    let createdElement: Element;
    
    // Create element first
    createdElement = {
      // Apply provided data first, then defaults for missing properties
      ...elementData,
      // Default properties for new elements (only if not provided)
      strokeStyle: elementData.strokeStyle || 'solid',
      fillStyle: elementData.fillStyle || 'solid',
      cornerStyle: elementData.cornerStyle || 'sharp',
      fontFamily: elementData.fontFamily || 'Inter',
      fontSize: elementData.fontSize || 16,
      fontWeight: elementData.fontWeight || 'normal',
      fontStyle: elementData.fontStyle || 'normal',
      textAlign: elementData.textAlign || 'left',
      locked: elementData.locked || false,
      zIndex: elementData.zIndex || 0,
      id: generateId(),
    };
    
    set((state) => {
      const newElements = [...state.elements, createdElement];
      
      return {
        elements: newElements,
      };
    });
    
    return createdElement;
  },

  updateElement: (id, updates) => {
    set((state) => {
      const newElements = state.elements.map((el) =>
        el.id === id ? { ...el, ...updates } : el
      );
      
      // Save to history for proper state management and canvas re-rendering
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newElements);
      
      return { 
        elements: newElements,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  },

  updateElementSilent: (id, updates) => {
    set((state) => {
      const newElements = state.elements.map((el) =>
        el.id === id ? { ...el, ...updates } : el
      );
      
      return { 
        elements: newElements,
      };
    });
  },

  deleteElement: (id) => {
    set((state) => {
      const newElements = state.elements.filter((el) => el.id !== id);
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newElements);
      
      return {
        elements: newElements,
        selectedElementIds: state.selectedElementIds.filter((selId) => selId !== id),
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  },

  selectElement: (id) => {
    set((state) => ({
      selectedElementIds: [id],
      ui: {
        ...state.ui,
        propertiesPanel: {
          ...state.ui.propertiesPanel,
          visible: true, // Show properties panel when element selected
        },
      },
    }));
  },

  clearSelection: () => {
    set((state) => ({ 
      selectedElementIds: [],
      ui: {
        ...state.ui,
        propertiesPanel: {
          ...state.ui.propertiesPanel,
          visible: false, // Hide properties panel when no selection
        },
      },
    }));
  },

  setActiveTool: (tool) => {
    set({ activeTool: tool });
  },

  setZoom: (zoom) => {
    set((state) => ({
      viewport: { ...state.viewport, zoom },
    }));
  },

  setPan: (pan) => {
    set((state) => ({
      viewport: { ...state.viewport, pan },
    }));
  },

  undo: () => {
    set((state) => {
      if (state.historyIndex > 0) {
        const newIndex = state.historyIndex - 1;
        return {
          elements: state.history[newIndex],
          historyIndex: newIndex,
          selectedElementIds: [],
        };
      }
      return state;
    });
  },

  redo: () => {
    set((state) => {
      if (state.historyIndex < state.history.length - 1) {
        const newIndex = state.historyIndex + 1;
        return {
          elements: state.history[newIndex],
          historyIndex: newIndex,
          selectedElementIds: [],
        };
      }
      return state;
    });
  },

  deleteSelectedElements: () => {
    set((state) => {
      if (state.selectedElementIds.length === 0) return state;
      
      const newElements = state.elements.filter(
        (el) => !state.selectedElementIds.includes(el.id)
      );
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newElements);
      
      return {
        elements: newElements,
        selectedElementIds: [],
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  },

  selectAll: () => {
    set((state) => ({
      selectedElementIds: state.elements.map((el) => el.id),
      ui: {
        ...state.ui,
        propertiesPanel: {
          ...state.ui.propertiesPanel,
          visible: state.elements.length > 0, // Show if elements exist
        },
      },
    }));
  },

  selectElements: (ids) => {
    set((state) => ({
      selectedElementIds: ids.filter(id => 
        state.elements.some(el => el.id === id)
      ), // Only select IDs that actually exist
      ui: {
        ...state.ui,
        propertiesPanel: {
          ...state.ui.propertiesPanel,
          visible: ids.length > 0, // Show properties panel if elements selected
        },
      },
    }));
  },

  resetZoom: () => {
    set((state) => ({
      viewport: { 
        ...state.viewport, 
        zoom: CANVAS_CONFIG.DEFAULT_ZOOM,
        pan: { x: 0, y: 0 }
      },
    }));
  },

  zoomToFit: () => {
    set((state) => {
      if (state.elements.length === 0) return state;
      
      // Calculate bounds of all elements
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      
      state.elements.forEach((el) => {
        minX = Math.min(minX, el.x);
        minY = Math.min(minY, el.y);
        maxX = Math.max(maxX, el.x + el.width);
        maxY = Math.max(maxY, el.y + el.height);
      });
      
      const contentWidth = maxX - minX;
      const contentHeight = maxY - minY;
      const { bounds } = state.viewport;
      
      const scaleX = bounds.width / (contentWidth + 100); // Add padding
      const scaleY = bounds.height / (contentHeight + 100);
      const zoom = Math.min(scaleX, scaleY, CANVAS_CONFIG.MAX_ZOOM);
      
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      const pan = {
        x: bounds.width / 2 - centerX * zoom,
        y: bounds.height / 2 - centerY * zoom,
      };
      
      return {
        viewport: { ...state.viewport, zoom, pan },
      };
    });
  },

  zoomIn: () => {
    set((state) => {
      const currentZoom = state.viewport.zoom;
      const newZoom = Math.min(currentZoom + 0.1, CANVAS_CONFIG.MAX_ZOOM);
      return {
        viewport: { ...state.viewport, zoom: newZoom },
      };
    });
  },

  zoomOut: () => {
    set((state) => {
      const currentZoom = state.viewport.zoom;
      const newZoom = Math.max(currentZoom - 0.1, CANVAS_CONFIG.MIN_ZOOM);
      return {
        viewport: { ...state.viewport, zoom: newZoom },
      };
    });
  },

  copy: () => {
    set((state) => {
      if (state.selectedElementIds.length === 0) return state;
      
      const selectedElements = state.elements.filter((el) =>
        state.selectedElementIds.includes(el.id)
      );
      
      return { clipboard: selectedElements };
    });
  },

  paste: () => {
    set((state) => {
      if (!state.clipboard || state.clipboard.length === 0) return state;
      
      const newElements = state.clipboard.map((el) => ({
        ...el,
        id: generateId(),
        x: el.x + 20, // Offset pasted elements
        y: el.y + 20,
      }));
      
      const allElements = [...state.elements, ...newElements];
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(allElements);
      
      return {
        elements: allElements,
        selectedElementIds: newElements.map((el) => el.id),
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  },

  // Style Actions
  copyStyle: () => {
    set((state) => {
      if (state.selectedElementIds.length === 0) return state;
      
      // Get the first selected element's style properties
      const sourceElement = state.elements.find((el) =>
        state.selectedElementIds.includes(el.id)
      );
      
      if (!sourceElement) return state;
      
      const styleClipboard: StyleClipboard = {
        strokeColor: sourceElement.strokeColor,
        backgroundColor: sourceElement.backgroundColor,
        strokeWidth: sourceElement.strokeWidth,
        strokeStyle: sourceElement.strokeStyle,
        fillStyle: sourceElement.fillStyle,
        roughness: sourceElement.roughness,
        opacity: sourceElement.opacity,
        cornerStyle: sourceElement.cornerStyle,
        fontFamily: sourceElement.fontFamily,
        fontSize: sourceElement.fontSize,
        fontWeight: sourceElement.fontWeight,
        fontStyle: sourceElement.fontStyle,
        textAlign: sourceElement.textAlign,
        textDecoration: sourceElement.textDecoration,
        startArrowhead: sourceElement.startArrowhead,
        endArrowhead: sourceElement.endArrowhead,
      };
      
      return { styleClipboard };
    });
  },

  pasteStyle: () => {
    set((state) => {
      if (!state.styleClipboard || state.selectedElementIds.length === 0) return state;
      
      const updatedElements = state.elements.map((element) => {
        if (state.selectedElementIds.includes(element.id)) {
          const updatedElement = { ...element };
          
          // Apply style properties from clipboard
          updatedElement.strokeColor = state.styleClipboard!.strokeColor;
          updatedElement.backgroundColor = state.styleClipboard!.backgroundColor;
          updatedElement.strokeWidth = state.styleClipboard!.strokeWidth;
          updatedElement.strokeStyle = state.styleClipboard!.strokeStyle;
          updatedElement.fillStyle = state.styleClipboard!.fillStyle;
          updatedElement.roughness = state.styleClipboard!.roughness;
          updatedElement.opacity = state.styleClipboard!.opacity;
          
          // Apply conditional properties (only if they exist in clipboard)
          if (state.styleClipboard!.cornerStyle !== undefined) {
            updatedElement.cornerStyle = state.styleClipboard!.cornerStyle;
          }
          if (state.styleClipboard!.fontFamily !== undefined) {
            updatedElement.fontFamily = state.styleClipboard!.fontFamily;
          }
          if (state.styleClipboard!.fontSize !== undefined) {
            updatedElement.fontSize = state.styleClipboard!.fontSize;
          }
          if (state.styleClipboard!.fontWeight !== undefined) {
            updatedElement.fontWeight = state.styleClipboard!.fontWeight;
          }
          if (state.styleClipboard!.fontStyle !== undefined) {
            updatedElement.fontStyle = state.styleClipboard!.fontStyle;
          }
          if (state.styleClipboard!.textAlign !== undefined) {
            updatedElement.textAlign = state.styleClipboard!.textAlign;
          }
          if (state.styleClipboard!.textDecoration !== undefined) {
            updatedElement.textDecoration = state.styleClipboard!.textDecoration;
          }
          if (state.styleClipboard!.startArrowhead !== undefined) {
            updatedElement.startArrowhead = state.styleClipboard!.startArrowhead;
          }
          if (state.styleClipboard!.endArrowhead !== undefined) {
            updatedElement.endArrowhead = state.styleClipboard!.endArrowhead;
          }
          
          return updatedElement;
        }
        return element;
      });
      
      // Save to history
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(updatedElements);
      
      return {
        elements: updatedElements,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  },

  // UI Actions
  setPropertiesPanelVisible: (visible: boolean) => {
    set((state) => ({
      ui: {
        ...state.ui,
        propertiesPanel: {
          ...state.ui.propertiesPanel,
          visible,
        },
      },
    }));
  },

  setPropertiesPanelWidth: (width: number) => {
    set((state) => ({
      ui: {
        ...state.ui,
        propertiesPanel: {
          ...state.ui.propertiesPanel,
          width: Math.max(250, Math.min(400, width)),
        },
      },
    }));
  },

  setTopToolbarVisible: (visible: boolean) => {
    set((state) => ({
      ui: {
        ...state.ui,
        topToolbar: {
          ...state.ui.topToolbar,
          visible,
        },
      },
    }));
  },

  setCanvasLocked: (locked: boolean) => {
    set((state) => ({
      ui: {
        ...state.ui,
        canvasLocked: locked,
      },
    }));
  },

  toggleCanvasLock: () => {
    set((state) => ({
      ui: {
        ...state.ui,
        canvasLocked: !state.ui.canvasLocked,
      },
    }));
  },

  // Color Actions
  setStrokeColor: (color: string) => {
    set((state) => ({
      toolOptions: {
        ...state.toolOptions,
        strokeColor: color,
      },
    }));
  },

  setBackgroundColor: (color: string) => {
    set((state) => ({
      toolOptions: {
        ...state.toolOptions,
        backgroundColor: color,
      },
    }));
  },

  addRecentColor: (color: string) => {
    set((state) => {
      const newRecentColors = [
        color,
        ...state.recentColors.filter(c => c !== color)
      ].slice(0, MAX_RECENT_COLORS);
      
      // Persist to localStorage
      localStorage.setItem(RECENT_COLORS_STORAGE_KEY, JSON.stringify(newRecentColors));
      
      return { recentColors: newRecentColors };
    });
  },

  clearRecentColors: () => {
    set(() => {
      localStorage.removeItem(RECENT_COLORS_STORAGE_KEY);
      return { recentColors: [] };
    });
  },

  // Grid Actions
  setGridEnabled: (enabled: boolean) => {
    set((state) => ({
      ui: {
        ...state.ui,
        grid: {
          ...state.ui.grid,
          enabled,
        },
      },
    }));
  },

  setGridSize: (size: number) => {
    set((state) => ({
      ui: {
        ...state.ui,
        grid: {
          ...state.ui.grid,
          size: Math.max(GRID_CONFIG.MIN_SIZE, Math.min(GRID_CONFIG.MAX_SIZE, size)),
        },
      },
    }));
  },

  setGridSnapEnabled: (snapToGrid: boolean) => {
    set((state) => ({
      ui: {
        ...state.ui,
        grid: {
          ...state.ui.grid,
          snapToGrid,
        },
      },
    }));
  },

  setGridVisible: (showGrid: boolean) => {
    set((state) => ({
      ui: {
        ...state.ui,
        grid: {
          ...state.ui.grid,
          showGrid,
        },
      },
    }));
  },

  setGridSnapDistance: (snapDistance: number) => {
    set((state) => ({
      ui: {
        ...state.ui,
        grid: {
          ...state.ui.grid,
          snapDistance: Math.max(1, Math.min(50, snapDistance)),
        },
      },
    }));
  },

  toggleGrid: () => {
    set((state) => ({
      ui: {
        ...state.ui,
        grid: {
          ...state.ui.grid,
          showGrid: !state.ui.grid.showGrid,
        },
      },
    }));
  },

  snapToGrid: (point: Point) => {
    const { ui: { grid } } = get();
    return grid.snapToGrid 
      ? {
          x: Math.round(point.x / grid.size) * grid.size,
          y: Math.round(point.y / grid.size) * grid.size,
        }
      : point;
  },

  // Element Management Actions
  duplicateElement: (id: string) => {
    set((state) => {
      const element = state.elements.find(el => el.id === id);
      if (!element) return state;

      const duplicated: Element = {
        ...element,
        id: generateId(),
        x: element.x + 20,
        y: element.y + 20,
      };

      const newElements = [...state.elements, duplicated];
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newElements);

      return {
        elements: newElements,
        selectedElementIds: [duplicated.id],
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  },

  bringForward: (id: string) => {
    set((state) => {
      const elementIndex = state.elements.findIndex(el => el.id === id);
      if (elementIndex === -1 || elementIndex === state.elements.length - 1) return state;

      const newElements = [...state.elements];
      [newElements[elementIndex], newElements[elementIndex + 1]] = 
        [newElements[elementIndex + 1], newElements[elementIndex]];

      // Save to history for proper state management
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newElements);

      return { 
        elements: newElements,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  },

  sendBackward: (id: string) => {
    set((state) => {
      const elementIndex = state.elements.findIndex(el => el.id === id);
      if (elementIndex === -1 || elementIndex === 0) return state;

      const newElements = [...state.elements];
      [newElements[elementIndex], newElements[elementIndex - 1]] = 
        [newElements[elementIndex - 1], newElements[elementIndex]];

      // Save to history for proper state management
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newElements);

      return { 
        elements: newElements,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  },

  bringToFront: (id: string) => {
    set((state) => {
      const elementIndex = state.elements.findIndex(el => el.id === id);
      if (elementIndex === -1) return state;

      const newElements = [...state.elements];
      const [element] = newElements.splice(elementIndex, 1);
      newElements.push(element);

      // Save to history for proper state management
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newElements);

      return { 
        elements: newElements,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  },

  sendToBack: (id: string) => {
    set((state) => {
      const elementIndex = state.elements.findIndex(el => el.id === id);
      if (elementIndex === -1) return state;

      const newElements = [...state.elements];
      const [element] = newElements.splice(elementIndex, 1);
      newElements.unshift(element);

      // Save to history for proper state management
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newElements);

      return { 
        elements: newElements,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  },

  toggleElementLock: (id: string) => {
    set((state) => {
      const newElements = state.elements.map((el) =>
        el.id === id ? { ...el, locked: !el.locked } : el
      );
      
      // Save to history for proper state management
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newElements);
      
      return { 
        elements: newElements,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  },

  saveToHistory: () => {
    set((state) => {
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push([...state.elements]);
      
      return {
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  },

  // Double-Click Text Editing Actions
  startDoubleClickTextEditing: (elementId: string, position: Point, initialText: string) => {
    set({
      doubleClickTextEditing: {
        isEditing: true,
        elementId,
        position,
        initialText,
      },
    });
  },

  endDoubleClickTextEditing: () => {
    set({
      doubleClickTextEditing: {
        isEditing: false,
        elementId: null,
        position: null,
        initialText: '',
      },
    });
  },

  saveDoubleClickTextEdit: (text: string) => {
    set((state) => {
      if (!state.doubleClickTextEditing.elementId) return state;

      const newElements = state.elements.map((el) =>
        el.id === state.doubleClickTextEditing.elementId 
          ? { ...el, text }
          : el
      );

      // Save to history for proper state management
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newElements);

      return {
        elements: newElements,
        history: newHistory,
        historyIndex: newHistory.length - 1,
        doubleClickTextEditing: {
          isEditing: false,
          elementId: null,
          position: null,
          initialText: '',
        },
      };
    });
  },

  cancelDoubleClickTextEdit: () => {
    set({
      doubleClickTextEditing: {
        isEditing: false,
        elementId: null,
        position: null,
        initialText: '',
      },
    });
  },
}));