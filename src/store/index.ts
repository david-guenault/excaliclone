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
  selectElement: (id: string) => void;
  clearSelection: () => void;
  setActiveTool: (tool: ToolType) => void;
  setZoom: (zoom: number) => void;
  setPan: (pan: Point) => void;
  undo: () => void;
  redo: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
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
}));