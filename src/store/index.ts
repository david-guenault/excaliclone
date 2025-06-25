// ABOUTME: Zustand store for global application state management
// ABOUTME: Centralized state for elements, tools, viewport, and UI settings

import { create } from 'zustand';
import type { AppState, Element, ToolType, Point } from '../types';
import { DEFAULT_TOOL_OPTIONS, CANVAS_CONFIG } from '../constants';
import { generateId } from '../utils';

interface AppStore extends AppState {
  // Actions
  addElement: (element: Omit<Element, 'id'>) => void;
  updateElement: (id: string, updates: Partial<Element>) => void;
  deleteElement: (id: string) => void;
  deleteSelectedElements: () => void;
  selectElement: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  setActiveTool: (tool: ToolType) => void;
  setZoom: (zoom: number) => void;
  setPan: (pan: Point) => void;
  resetZoom: () => void;
  zoomToFit: () => void;
  copy: () => void;
  paste: () => void;
  undo: () => void;
  redo: () => void;
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
  panels: {
    toolbar: true,
    sidebar: true,
  },
  history: [[]],
  historyIndex: 0,
  clipboard: null,

  // Actions
  addElement: (elementData) => {
    set((state) => {
      const element: Element = {
        ...elementData,
        id: generateId(),
      };
      
      const newElements = [...state.elements, element];
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newElements);
      
      return {
        elements: newElements,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  },

  updateElement: (id, updates) => {
    set((state) => {
      const newElements = state.elements.map((el) =>
        el.id === id ? { ...el, ...updates } : el
      );
      
      return { elements: newElements };
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
    set(() => ({
      selectedElementIds: [id],
    }));
  },

  clearSelection: () => {
    set({ selectedElementIds: [] });
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
}));