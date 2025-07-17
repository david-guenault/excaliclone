// ABOUTME: Zustand store for global application state management
// ABOUTME: Centralized state for elements, tools, viewport, and UI settings

import { create } from 'zustand';
import type { AppState, Element, ToolType, Point, StyleClipboard, Group } from '../types';
import { DEFAULT_TOOL_OPTIONS, CANVAS_CONFIG, RECENT_COLORS_STORAGE_KEY, MAX_RECENT_COLORS, GRID_CONFIG, AUTO_SAVE_DEBOUNCE } from '../constants';
import { generateId } from '../utils';
import { saveStateToStorage, loadStateFromStorage, debouncedSave } from '../utils/autoSave';
import { SpatialIndex, spatialHitTest } from '../utils/spatialIndex';
import { calculateSmartDuplicationOffset, preserveGroupRelationships } from '../utils/smartDuplication';
import { 
  calculateAlignmentBounds,
  getElementsToAlign,
  alignElementsLeft,
  alignElementsCenter,
  alignElementsRight,
  alignElementsTop,
  alignElementsMiddle,
  alignElementsBottom,
  validateAlignment
} from '../utils/alignmentUtils';

interface AppStore extends AppState {
  // Actions
  addElement: (element: Omit<Element, 'id'>) => Element;
  addElementSilent: (element: Omit<Element, 'id'>) => Element;
  addElements: (elements: Element[]) => void;
  updateElement: (id: string, updates: Partial<Element>) => void;
  updateElementSilent: (id: string, updates: Partial<Element>) => void;
  deleteElement: (id: string) => void;
  deleteSelectedElements: () => void;
  selectElement: (id: string) => void;
  selectElements: (ids: string[]) => void;
  addToSelection: (id: string) => void;
  removeFromSelection: (id: string) => void;
  toggleSelection: (id: string) => void;
  selectAll: () => void;
  selectNext: () => void;
  selectPrevious: () => void;
  clearSelection: () => void;
  // Advanced Selection Actions
  selectByType: () => void;
  selectSimilar: () => void;
  selectAbove: () => void;
  selectBelow: () => void;
  setActiveTool: (tool: ToolType) => void;
  setZoom: (zoom: number) => void;
  setPan: (pan: Point) => void;
  resetZoom: () => void;
  zoomToFit: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  copy: () => void;
  cut: () => void;
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
  // Dialog Actions
  openGridDialog: () => void;
  closeGridDialog: () => void;
  toggleGridDialog: () => void;
  // Element Management Actions
  duplicateElement: (id: string) => void;
  duplicateSelectedElements: () => void;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  toggleElementLock: (id: string) => void;
  lockSelectedElements: () => void;
  unlockSelectedElements: () => void;
  unlockAllElements: () => void;
  isElementLocked: (id: string) => boolean;
  getLockedElementCount: () => number;
  // Group Z-order actions
  bringSelectedForward: () => void;
  sendSelectedBackward: () => void;
  bringSelectedToFront: () => void;
  sendSelectedToBack: () => void;
  // Element Grouping Actions
  groupSelectedElements: () => void;
  ungroupSelectedElements: () => void;
  getElementGroup: (elementId: string) => Group | null;
  getGroupElements: (groupId: string) => Element[];
  selectGroup: (groupId: string) => void;
  // Style Actions
  copyStyle: () => void;
  pasteStyle: () => void;
  // Alignment Actions
  alignLeft: () => void;
  alignCenter: () => void;
  alignRight: () => void;
  alignTop: () => void;
  alignMiddle: () => void;
  alignBottom: () => void;
  distributeHorizontally: () => void;
  distributeVertically: () => void;
  // History Actions
  saveToHistory: () => void;
  // Direct Text Editing Actions
  startTextEditing: (elementId: string, text: string, cursorPosition: number) => void;
  updateTextContent: (text: string, cursorPosition: number) => void;
  updateTextSelection: (text: string, cursorPosition: number, selectionStart: number, selectionEnd: number) => void;
  finishTextEditing: () => void;
  toggleCursor: () => void;
  // Save State Actions
  setSaving: (isSaving: boolean) => void;
  // Spatial Index Actions
  getSpatialIndex: () => SpatialIndex;
  rebuildSpatialIndex: () => void;
  spatialHitTest: (point: Point) => Element | null;
  // Bulk Operations with Progress
  bulkDuplicate: (elementIds: string[], onProgress?: (current: number, total: number) => void) => Promise<Element[]>;
  bulkDelete: (elementIds: string[], onProgress?: (current: number, total: number) => void) => Promise<void>;
  bulkApplyStyle: (elementIds: string[], style: Partial<Element>, onProgress?: (current: number, total: number) => void) => Promise<void>;
  bulkMove: (elementIds: string[], deltaX: number, deltaY: number, onProgress?: (current: number, total: number) => void) => Promise<void>;
}

// Initialize state with saved data if available
const initializeState = (): Partial<AppState> => {
  const defaultState: AppState = {
    viewport: {
      zoom: CANVAS_CONFIG.DEFAULT_ZOOM,
      pan: { x: 0, y: 0 },
      bounds: { x: 0, y: 0, width: 800, height: 600 },
    },
    elements: [],
    selectedElementIds: [],
    groups: [],
    activeTool: 'select',
    toolOptions: DEFAULT_TOOL_OPTIONS,
    theme: 'light',
    ui: {
      propertiesPanel: {
        visible: false,
        width: 200,
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
        showGrid: false,
        color: GRID_CONFIG.COLOR,
        opacity: GRID_CONFIG.OPACITY,
      },
      dialogs: {
        gridDialog: false,
      },
    },
    history: [[]],
    historyIndex: 0,
    clipboard: null,
    styleClipboard: null,
    recentColors: JSON.parse(localStorage.getItem(RECENT_COLORS_STORAGE_KEY) || '[]'),
    textEditing: {
      isEditing: false,
      elementId: null,
      text: '',
      cursorPosition: 0,
      selectionStart: 0,
      selectionEnd: 0,
      cursorVisible: true,
    },
    isSaving: false,
  };

  // Try to load saved state
  const savedState = loadStateFromStorage();
  if (savedState) {
    return {
      ...defaultState,
      ...savedState,
      // Don't restore UI state except grid, as it should reset on page load
      ui: {
        ...defaultState.ui,
        grid: savedState.ui?.grid || defaultState.ui.grid,
      },
      // Reset transient state
      selectedElementIds: [],
      textEditing: defaultState.textEditing,
      clipboard: null,
      styleClipboard: null,
      // Initialize history with saved elements
      history: [savedState.elements || []],
      historyIndex: 0,
    };
  }

  return defaultState;
};

export const useAppStore = create<AppStore>((set, get) => {
  // Initialize spatial index for performance optimization
  let spatialIndex = new SpatialIndex(
    { x: -10000, y: -10000, width: 20000, height: 20000 },
    10, // maxElements per node
    8   // maxDepth
  );

  // Helper function to trigger auto-save after state changes
  const triggerAutoSave = () => {
    const state = get();
    debouncedSave(state, AUTO_SAVE_DEBOUNCE);
  };

  // Helper function to update spatial index when elements change
  const updateSpatialIndex = (elements: Element[]) => {
    spatialIndex.rebuild(elements);
  };

  // Helper function for alignment operations
  const performAlignment = (
    state: AppState, 
    alignFunction: (elements: Element[], bounds: any) => Element[]
  ) => {
    if (!validateAlignment(state.selectedElementIds)) return state;
    
    const elementsToAlign = getElementsToAlign(
      state.elements,
      state.selectedElementIds,
      state.groups,
      { respectGroups: true }
    );
    
    if (!validateAlignment(elementsToAlign)) return state;
    
    const bounds = calculateAlignmentBounds(elementsToAlign);
    const alignedElements = alignFunction(elementsToAlign, bounds);
    
    // Update elements in state
    const updatedElements = state.elements.map((element) => {
      const aligned = alignedElements.find(aligned => aligned.id === element.id);
      return aligned || element;
    });
    
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(updatedElements);
    
    // Update spatial index
    updateSpatialIndex(updatedElements);
    
    return {
      elements: updatedElements,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    };
  };

  const initialState = initializeState();
  
  // Initialize spatial index with existing elements
  if (initialState.elements) {
    updateSpatialIndex(initialState.elements);
  }
  
  return {
    // Initialize with saved state or defaults
    ...initialState,

    // Actions
  addElement: (elementData) => {
    // Create element first
    const createdElement: Element = {
      // Apply provided data first, then defaults for missing properties
      ...elementData,
      // Default properties for new elements (only if not provided)
      strokeStyle: elementData.strokeStyle || 'solid',
      fillStyle: elementData.fillStyle || 'solid',
      cornerStyle: elementData.cornerStyle || 'sharp',
      fontFamily: elementData.fontFamily || 'Excalifont',
      fontSize: elementData.fontSize || 16,
      fontWeight: elementData.fontWeight || 'normal',
      fontStyle: elementData.fontStyle || 'normal',
      textAlign: elementData.textAlign || 'center',
      textVerticalAlign: elementData.textVerticalAlign || 'middle',
      locked: elementData.locked || false,
      zIndex: elementData.zIndex || 0,
      id: generateId(),
    };
    
    set((state) => {
      const newElements = [...state.elements, createdElement];
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newElements);
      
      // Update spatial index
      updateSpatialIndex(newElements);
      
      return {
        elements: newElements,
        selectedElementIds: [createdElement.id], // Auto-select the created element
        history: newHistory,
        historyIndex: newHistory.length - 1,
        ui: {
          ...state.ui,
          propertiesPanel: {
            ...state.ui.propertiesPanel,
            visible: true, // Show properties panel for the new element
          },
        },
      };
    });
    
    triggerAutoSave();
    return createdElement;
  },

  addElementSilent: (elementData) => {
    // Create element first
    const createdElement: Element = {
      // Apply provided data first, then defaults for missing properties
      ...elementData,
      // Default properties for new elements (only if not provided)
      strokeStyle: elementData.strokeStyle || 'solid',
      fillStyle: elementData.fillStyle || 'solid',
      cornerStyle: elementData.cornerStyle || 'sharp',
      fontFamily: elementData.fontFamily || 'Excalifont',
      fontSize: elementData.fontSize || 16,
      fontWeight: elementData.fontWeight || 'normal',
      fontStyle: elementData.fontStyle || 'normal',
      textAlign: elementData.textAlign || 'center',
      textVerticalAlign: elementData.textVerticalAlign || 'middle',
      locked: elementData.locked || false,
      zIndex: elementData.zIndex || 0,
      id: generateId(),
    };
    
    set((state) => {
      const newElements = [...state.elements, createdElement];
      
      // Update spatial index
      updateSpatialIndex(newElements);
      
      return {
        elements: newElements,
      };
    });
    
    return createdElement;
  },

  addElements: (elements) => {
    set((state) => {
      const newElements = [...state.elements, ...elements];
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newElements);
      
      return {
        elements: newElements,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
    triggerAutoSave();
  },

  updateElement: (id, updates) => {
    set((state) => {
      const newElements = state.elements.map((el) =>
        el.id === id ? { ...el, ...updates } : el
      );
      
      // Save to history for proper state management and canvas re-rendering
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newElements);
      
      // Update spatial index
      updateSpatialIndex(newElements);
      
      return { 
        elements: newElements,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
    triggerAutoSave();
  },

  updateElementSilent: (id, updates) => {
    set((state) => {
      const newElements = state.elements.map((el) =>
        el.id === id ? { ...el, ...updates } : el
      );
      
      // Update spatial index
      updateSpatialIndex(newElements);
      
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
      
      // Update spatial index
      updateSpatialIndex(newElements);
      
      return {
        elements: newElements,
        selectedElementIds: state.selectedElementIds.filter((selId) => selId !== id),
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
    triggerAutoSave();
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
        const newElements = state.history[newIndex];
        
        // Update spatial index
        updateSpatialIndex(newElements);
        
        return {
          elements: newElements,
          historyIndex: newIndex,
          selectedElementIds: [],
        };
      }
      return state;
    });
    triggerAutoSave();
  },

  redo: () => {
    set((state) => {
      if (state.historyIndex < state.history.length - 1) {
        const newIndex = state.historyIndex + 1;
        const newElements = state.history[newIndex];
        
        // Update spatial index
        updateSpatialIndex(newElements);
        
        return {
          elements: newElements,
          historyIndex: newIndex,
          selectedElementIds: [],
        };
      }
      return state;
    });
    triggerAutoSave();
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
    triggerAutoSave();
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

  addToSelection: (id) => {
    set((state) => {
      // Don't add if already selected or element doesn't exist
      if (state.selectedElementIds.includes(id) || 
          !state.elements.some(el => el.id === id)) {
        return state;
      }
      
      const newSelectedIds = [...state.selectedElementIds, id];
      return {
        selectedElementIds: newSelectedIds,
        ui: {
          ...state.ui,
          propertiesPanel: {
            ...state.ui.propertiesPanel,
            visible: true, // Show properties panel when adding to selection
          },
        },
      };
    });
  },

  removeFromSelection: (id) => {
    set((state) => {
      const newSelectedIds = state.selectedElementIds.filter(selId => selId !== id);
      return {
        selectedElementIds: newSelectedIds,
        ui: {
          ...state.ui,
          propertiesPanel: {
            ...state.ui.propertiesPanel,
            visible: newSelectedIds.length > 0, // Hide panel if no selection
          },
        },
      };
    });
  },

  toggleSelection: (id) => {
    set((state) => {
      // Don't toggle if element doesn't exist
      if (!state.elements.some(el => el.id === id)) {
        return state;
      }
      
      const isSelected = state.selectedElementIds.includes(id);
      const newSelectedIds = isSelected
        ? state.selectedElementIds.filter(selId => selId !== id)
        : [...state.selectedElementIds, id];
      
      return {
        selectedElementIds: newSelectedIds,
        ui: {
          ...state.ui,
          propertiesPanel: {
            ...state.ui.propertiesPanel,
            visible: newSelectedIds.length > 0, // Show/hide panel based on selection
          },
        },
      };
    });
  },

  selectNext: () => {
    set((state) => {
      if (state.elements.length === 0) return state;
      
      let nextIndex = 0;
      
      if (state.selectedElementIds.length === 1) {
        // Find current element index and select next
        const currentIndex = state.elements.findIndex(el => el.id === state.selectedElementIds[0]);
        nextIndex = (currentIndex + 1) % state.elements.length;
      } else {
        // If multiple or no selection, start from beginning
        nextIndex = 0;
      }
      
      const nextElementId = state.elements[nextIndex].id;
      
      return {
        selectedElementIds: [nextElementId],
        ui: {
          ...state.ui,
          propertiesPanel: {
            ...state.ui.propertiesPanel,
            visible: true,
          },
        },
      };
    });
  },

  selectPrevious: () => {
    set((state) => {
      if (state.elements.length === 0) return state;
      
      let prevIndex = state.elements.length - 1;
      
      if (state.selectedElementIds.length === 1) {
        // Find current element index and select previous
        const currentIndex = state.elements.findIndex(el => el.id === state.selectedElementIds[0]);
        prevIndex = currentIndex === 0 ? state.elements.length - 1 : currentIndex - 1;
      } else {
        // If multiple or no selection, start from end
        prevIndex = state.elements.length - 1;
      }
      
      const prevElementId = state.elements[prevIndex].id;
      
      return {
        selectedElementIds: [prevElementId],
        ui: {
          ...state.ui,
          propertiesPanel: {
            ...state.ui.propertiesPanel,
            visible: true,
          },
        },
      };
    });
  },

  // Advanced Selection Actions
  selectByType: () => {
    set((state) => {
      if (state.selectedElementIds.length === 0 || state.elements.length === 0) return state;
      
      // Get the type of the first selected element
      const firstSelectedElement = state.elements.find(el => 
        state.selectedElementIds.includes(el.id)
      );
      
      if (!firstSelectedElement) return state;
      
      // Select all elements of the same type
      const elementsOfSameType = state.elements
        .filter(el => el.type === firstSelectedElement.type)
        .map(el => el.id);
      
      return {
        selectedElementIds: elementsOfSameType,
        ui: {
          ...state.ui,
          propertiesPanel: {
            ...state.ui.propertiesPanel,
            visible: true,
          },
        },
      };
    });
  },

  selectSimilar: () => {
    set((state) => {
      if (state.selectedElementIds.length === 0 || state.elements.length === 0) return state;
      
      // Get the first selected element as reference
      const referenceElement = state.elements.find(el => 
        state.selectedElementIds.includes(el.id)
      );
      
      if (!referenceElement) return state;
      
      // Select elements with similar properties (type, strokeColor, backgroundColor)
      const similarElements = state.elements
        .filter(el => 
          el.type === referenceElement.type &&
          el.strokeColor === referenceElement.strokeColor &&
          el.backgroundColor === referenceElement.backgroundColor
        )
        .map(el => el.id);
      
      return {
        selectedElementIds: similarElements,
        ui: {
          ...state.ui,
          propertiesPanel: {
            ...state.ui.propertiesPanel,
            visible: true,
          },
        },
      };
    });
  },

  selectAbove: () => {
    set((state) => {
      if (state.selectedElementIds.length === 0 || state.elements.length === 0) return state;
      
      // Get the topmost selected element
      const selectedElements = state.elements.filter(el => 
        state.selectedElementIds.includes(el.id)
      );
      
      if (selectedElements.length === 0) return state;
      
      const topmostY = Math.min(...selectedElements.map(el => el.y));
      
      // Find elements above the topmost selected element
      const elementsAbove = state.elements
        .filter(el => el.y < topmostY - 10) // 10px threshold
        .sort((a, b) => b.y - a.y) // Sort by Y descending (closest to selection first)
        .slice(0, 10) // Limit to 10 elements for performance
        .map(el => el.id);
      
      if (elementsAbove.length > 0) {
        return {
          selectedElementIds: elementsAbove,
          ui: {
            ...state.ui,
            propertiesPanel: {
              ...state.ui.propertiesPanel,
              visible: true,
            },
          },
        };
      }
      
      return state;
    });
  },

  selectBelow: () => {
    set((state) => {
      if (state.selectedElementIds.length === 0 || state.elements.length === 0) return state;
      
      // Get the bottommost selected element
      const selectedElements = state.elements.filter(el => 
        state.selectedElementIds.includes(el.id)
      );
      
      if (selectedElements.length === 0) return state;
      
      const bottommostY = Math.max(...selectedElements.map(el => el.y + el.height));
      
      // Find elements below the bottommost selected element
      const elementsBelow = state.elements
        .filter(el => el.y > bottommostY + 10) // 10px threshold
        .sort((a, b) => a.y - b.y) // Sort by Y ascending (closest to selection first)
        .slice(0, 10) // Limit to 10 elements for performance
        .map(el => el.id);
      
      if (elementsBelow.length > 0) {
        return {
          selectedElementIds: elementsBelow,
          ui: {
            ...state.ui,
            propertiesPanel: {
              ...state.ui.propertiesPanel,
              visible: true,
            },
          },
        };
      }
      
      return state;
    });
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

  cut: () => {
    set((state) => {
      if (state.selectedElementIds.length === 0) return state;
      
      // Copy selected elements to clipboard
      const selectedElements = state.elements.filter((el) =>
        state.selectedElementIds.includes(el.id)
      );
      
      // Remove selected elements (same logic as deleteSelectedElements)
      const newElements = state.elements.filter(
        (el) => !state.selectedElementIds.includes(el.id)
      );
      
      // Save to history
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newElements);
      
      return {
        clipboard: selectedElements,
        elements: newElements,
        selectedElementIds: [],
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
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
    triggerAutoSave();
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
        textVerticalAlign: sourceElement.textVerticalAlign,
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
          if (state.styleClipboard!.textVerticalAlign !== undefined) {
            updatedElement.textVerticalAlign = state.styleClipboard!.textVerticalAlign;
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

  // Alignment Actions
  alignLeft: () => {
    set((state) => performAlignment(state, alignElementsLeft));
    triggerAutoSave();
  },

  alignCenter: () => {
    set((state) => performAlignment(state, alignElementsCenter));
    triggerAutoSave();
  },

  alignRight: () => {
    set((state) => performAlignment(state, alignElementsRight));
    triggerAutoSave();
  },

  alignTop: () => {
    set((state) => performAlignment(state, alignElementsTop));
    triggerAutoSave();
  },

  alignMiddle: () => {
    set((state) => performAlignment(state, alignElementsMiddle));
    triggerAutoSave();
  },

  alignBottom: () => {
    set((state) => performAlignment(state, alignElementsBottom));
    triggerAutoSave();
  },

  distributeHorizontally: () => {
    set((state) => {
      if (state.selectedElementIds.length < 3) return state;
      
      const selectedElements = state.elements.filter(el => 
        state.selectedElementIds.includes(el.id)
      ).sort((a, b) => a.x - b.x); // Sort by x position
      
      if (selectedElements.length < 3) return state;
      
      const leftmost = selectedElements[0].x;
      const rightmost = selectedElements[selectedElements.length - 1].x + selectedElements[selectedElements.length - 1].width;
      const totalSpace = rightmost - leftmost;
      const totalElementWidth = selectedElements.reduce((sum, el) => sum + el.width, 0);
      const availableSpace = totalSpace - totalElementWidth;
      const spacing = availableSpace / (selectedElements.length - 1);
      
      let currentX = leftmost;
      const updatedElements = state.elements.map((element) => {
        const selectedIndex = selectedElements.findIndex(sel => sel.id === element.id);
        if (selectedIndex !== -1) {
          if (selectedIndex === 0) {
            // Keep first element in place
            currentX = element.x + element.width + spacing;
            return element;
          } else if (selectedIndex === selectedElements.length - 1) {
            // Keep last element in place
            return element;
          } else {
            // Distribute middle elements
            const newElement = { ...element, x: currentX };
            currentX += element.width + spacing;
            return newElement;
          }
        }
        return element;
      });
      
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(updatedElements);
      
      // Update spatial index
      updateSpatialIndex(updatedElements);
      
      return {
        elements: updatedElements,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
    triggerAutoSave();
  },

  distributeVertically: () => {
    set((state) => {
      if (state.selectedElementIds.length < 3) return state;
      
      const selectedElements = state.elements.filter(el => 
        state.selectedElementIds.includes(el.id)
      ).sort((a, b) => a.y - b.y); // Sort by y position
      
      if (selectedElements.length < 3) return state;
      
      const topmost = selectedElements[0].y;
      const bottommost = selectedElements[selectedElements.length - 1].y + selectedElements[selectedElements.length - 1].height;
      const totalSpace = bottommost - topmost;
      const totalElementHeight = selectedElements.reduce((sum, el) => sum + el.height, 0);
      const availableSpace = totalSpace - totalElementHeight;
      const spacing = availableSpace / (selectedElements.length - 1);
      
      let currentY = topmost;
      const updatedElements = state.elements.map((element) => {
        const selectedIndex = selectedElements.findIndex(sel => sel.id === element.id);
        if (selectedIndex !== -1) {
          if (selectedIndex === 0) {
            // Keep first element in place
            currentY = element.y + element.height + spacing;
            return element;
          } else if (selectedIndex === selectedElements.length - 1) {
            // Keep last element in place
            return element;
          } else {
            // Distribute middle elements
            const newElement = { ...element, y: currentY };
            currentY += element.height + spacing;
            return newElement;
          }
        }
        return element;
      });
      
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(updatedElements);
      
      // Update spatial index
      updateSpatialIndex(updatedElements);
      
      return {
        elements: updatedElements,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
    triggerAutoSave();
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

  duplicateSelectedElements: () => {
    set((state) => {
      if (state.selectedElementIds.length === 0) return state;
      
      // Get selected elements with group relationship preservation
      const selectedElements = state.elements.filter(el => 
        state.selectedElementIds.includes(el.id)
      );
      
      // Preserve group relationships when duplicating
      const elementsToDuplicate = preserveGroupRelationships(state.elements, selectedElements);
      
      if (elementsToDuplicate.length === 0) return state;
      
      // Calculate smart positioning offset
      const smartOffset = calculateSmartDuplicationOffset(
        state.elements,
        elementsToDuplicate,
        state.viewport,
        {
          baseOffset: 20,
          preferredDirection: 'diagonal',
          collisionPadding: 10,
        }
      );
      
      // Create group ID mapping for preserving group relationships
      const groupIdMapping = new Map<string, string>();
      const duplicatedElements: Element[] = [];
      
      // Create duplicates with smart positioning
      elementsToDuplicate.forEach(element => {
        // Handle group relationships
        let newGroupId: string | undefined = undefined;
        if (element.groupId) {
          if (!groupIdMapping.has(element.groupId)) {
            groupIdMapping.set(element.groupId, generateId());
          }
          newGroupId = groupIdMapping.get(element.groupId);
        }
        
        const duplicated: Element = {
          ...element,
          id: generateId(),
          x: element.x + smartOffset.x,
          y: element.y + smartOffset.y,
          groupId: newGroupId,
          zIndex: (element.zIndex || 0) + 1, // Place above original
        };
        duplicatedElements.push(duplicated);
      });
      
      // Create new groups for duplicated grouped elements
      const newGroups: Group[] = [];
      groupIdMapping.forEach((newGroupId, originalGroupId) => {
        const originalGroup = state.groups.find(g => g.id === originalGroupId);
        if (originalGroup) {
          const duplicatedGroupElementIds = duplicatedElements
            .filter(el => el.groupId === newGroupId)
            .map(el => el.id);
            
          newGroups.push({
            id: newGroupId,
            elementIds: duplicatedGroupElementIds,
            name: `${originalGroup.name} Copy`,
          });
        }
      });
      
      const newElements = [...state.elements, ...duplicatedElements];
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newElements);
      
      // Update spatial index
      updateSpatialIndex(newElements);
      
      return {
        elements: newElements,
        groups: [...state.groups, ...newGroups],
        selectedElementIds: duplicatedElements.map(el => el.id),
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
    triggerAutoSave();
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

      // Update spatial index
      updateSpatialIndex(newElements);

      return { 
        elements: newElements,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
    triggerAutoSave();
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

      // Update spatial index
      updateSpatialIndex(newElements);

      return { 
        elements: newElements,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
    triggerAutoSave();
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

      // Update spatial index
      updateSpatialIndex(newElements);

      return { 
        elements: newElements,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
    triggerAutoSave();
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

      // Update spatial index
      updateSpatialIndex(newElements);

      return { 
        elements: newElements,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
    triggerAutoSave();
  },

  toggleElementLock: (id: string) => {
    set((state) => {
      const newElements = state.elements.map((el) =>
        el.id === id ? { ...el, locked: !el.locked } : el
      );
      
      // Save to history for proper state management
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newElements);
      
      // Update spatial index
      updateSpatialIndex(newElements);
      
      return { 
        elements: newElements,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
    triggerAutoSave();
  },

  lockSelectedElements: () => {
    set((state) => {
      if (state.selectedElementIds.length === 0) return state;
      
      const newElements = state.elements.map((el) =>
        state.selectedElementIds.includes(el.id) ? { ...el, locked: true } : el
      );
      
      // Save to history for proper state management
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newElements);
      
      // Update spatial index
      updateSpatialIndex(newElements);
      
      return { 
        elements: newElements,
        selectedElementIds: [], // Clear selection after locking
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
    triggerAutoSave();
  },

  unlockSelectedElements: () => {
    set((state) => {
      if (state.selectedElementIds.length === 0) return state;
      
      const newElements = state.elements.map((el) =>
        state.selectedElementIds.includes(el.id) ? { ...el, locked: false } : el
      );
      
      // Save to history for proper state management
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newElements);
      
      // Update spatial index
      updateSpatialIndex(newElements);
      
      return { 
        elements: newElements,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
    triggerAutoSave();
  },

  unlockAllElements: () => {
    set((state) => {
      const hasLockedElements = state.elements.some(el => el.locked);
      if (!hasLockedElements) return state;
      
      const newElements = state.elements.map((el) => ({ ...el, locked: false }));
      
      // Save to history for proper state management
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newElements);
      
      // Update spatial index
      updateSpatialIndex(newElements);
      
      return { 
        elements: newElements,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
    triggerAutoSave();
  },

  isElementLocked: (id: string) => {
    const { elements } = get();
    const element = elements.find(el => el.id === id);
    return element?.locked || false;
  },

  getLockedElementCount: () => {
    const { elements } = get();
    return elements.filter(el => el.locked).length;
  },

  // Group Z-order actions
  bringSelectedForward: () => {
    set((state) => {
      if (state.selectedElementIds.length === 0) return state;
      
      const newElements = [...state.elements];
      const selectedIndices = state.selectedElementIds
        .map(id => newElements.findIndex(el => el.id === id))
        .filter(index => index !== -1)
        .sort((a, b) => b - a); // Sort descending to avoid index conflicts
      
      // Move each selected element forward one position
      selectedIndices.forEach(index => {
        if (index < newElements.length - 1) {
          [newElements[index], newElements[index + 1]] = 
            [newElements[index + 1], newElements[index]];
        }
      });
      
      // Save to history for proper state management
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newElements);
      
      // Update spatial index
      updateSpatialIndex(newElements);
      
      return { 
        elements: newElements,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
    triggerAutoSave();
  },

  sendSelectedBackward: () => {
    set((state) => {
      if (state.selectedElementIds.length === 0) return state;
      
      const newElements = [...state.elements];
      const selectedIndices = state.selectedElementIds
        .map(id => newElements.findIndex(el => el.id === id))
        .filter(index => index !== -1)
        .sort((a, b) => a - b); // Sort ascending to avoid index conflicts
      
      // Move each selected element backward one position
      selectedIndices.forEach(index => {
        if (index > 0) {
          [newElements[index], newElements[index - 1]] = 
            [newElements[index - 1], newElements[index]];
        }
      });
      
      // Save to history for proper state management
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newElements);
      
      // Update spatial index
      updateSpatialIndex(newElements);
      
      return { 
        elements: newElements,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
    triggerAutoSave();
  },

  bringSelectedToFront: () => {
    set((state) => {
      if (state.selectedElementIds.length === 0) return state;
      
      const newElements = [...state.elements];
      const selectedElements: Element[] = [];
      
      // Remove selected elements from their current positions
      state.selectedElementIds.forEach(id => {
        const index = newElements.findIndex(el => el.id === id);
        if (index !== -1) {
          selectedElements.push(...newElements.splice(index, 1));
        }
      });
      
      // Add selected elements to the end (front)
      newElements.push(...selectedElements);
      
      // Save to history for proper state management
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newElements);
      
      // Update spatial index
      updateSpatialIndex(newElements);
      
      return { 
        elements: newElements,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
    triggerAutoSave();
  },

  sendSelectedToBack: () => {
    set((state) => {
      if (state.selectedElementIds.length === 0) return state;
      
      const newElements = [...state.elements];
      const selectedElements: Element[] = [];
      
      // Remove selected elements from their current positions (reverse order to maintain indices)
      const selectedIndices = state.selectedElementIds
        .map(id => newElements.findIndex(el => el.id === id))
        .filter(index => index !== -1)
        .sort((a, b) => b - a);
      
      selectedIndices.forEach(index => {
        selectedElements.unshift(...newElements.splice(index, 1));
      });
      
      // Add selected elements to the beginning (back)
      newElements.unshift(...selectedElements);
      
      // Save to history for proper state management
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newElements);
      
      // Update spatial index
      updateSpatialIndex(newElements);
      
      return { 
        elements: newElements,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
    triggerAutoSave();
  },

  // Element Grouping Actions
  groupSelectedElements: () => {
    set((state) => {
      if (state.selectedElementIds.length < 2) return state;
      
      const groupId = generateId();
      const newGroup: Group = {
        id: groupId,
        elementIds: [...state.selectedElementIds],
        name: `Group ${state.groups.length + 1}`,
      };
      
      // Add groupId to all selected elements
      const newElements = state.elements.map((el) =>
        state.selectedElementIds.includes(el.id) 
          ? { ...el, groupId }
          : el
      );
      
      // Save to history for proper state management
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newElements);
      
      // Update spatial index
      updateSpatialIndex(newElements);
      
      return {
        elements: newElements,
        groups: [...state.groups, newGroup],
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
    triggerAutoSave();
  },

  ungroupSelectedElements: () => {
    set((state) => {
      if (state.selectedElementIds.length === 0) return state;
      
      const selectedElements = state.elements.filter(el => 
        state.selectedElementIds.includes(el.id)
      );
      
      // Get unique group IDs from selected elements
      const groupIds = new Set(
        selectedElements
          .map(el => el.groupId)
          .filter(Boolean) as string[]
      );
      
      if (groupIds.size === 0) return state;
      
      // Remove groupId from all elements in these groups
      const newElements = state.elements.map((el) =>
        groupIds.has(el.groupId!) 
          ? { ...el, groupId: undefined }
          : el
      );
      
      // Remove the groups
      const newGroups = state.groups.filter(group => !groupIds.has(group.id));
      
      // Save to history for proper state management
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newElements);
      
      // Update spatial index
      updateSpatialIndex(newElements);
      
      return {
        elements: newElements,
        groups: newGroups,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
    triggerAutoSave();
  },

  getElementGroup: (elementId: string) => {
    const { elements, groups } = get();
    const element = elements.find(el => el.id === elementId);
    if (!element?.groupId) return null;
    
    return groups.find(group => group.id === element.groupId) || null;
  },

  getGroupElements: (groupId: string) => {
    const { elements } = get();
    return elements.filter(el => el.groupId === groupId);
  },

  selectGroup: (groupId: string) => {
    set((state) => {
      const group = state.groups.find(g => g.id === groupId);
      if (!group) return state;
      
      return {
        selectedElementIds: [...group.elementIds],
        activeTool: 'select',
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

  // Direct Text Editing Actions
  startTextEditing: (elementId: string, text: string, cursorPosition: number) => {
    set({
      textEditing: {
        isEditing: true,
        elementId,
        text,
        cursorPosition,
        selectionStart: cursorPosition,
        selectionEnd: cursorPosition,
        cursorVisible: true,
      },
    });
  },

  updateTextContent: (text: string, cursorPosition: number) => {
    set((state) => {
      if (!state.textEditing.isEditing || !state.textEditing.elementId) return state;

      // During editing, only update textEditing state, NOT the element
      // The element will be updated when editing finishes via finishTextEditing
      return {
        textEditing: {
          ...state.textEditing,
          text,
          cursorPosition,
          selectionStart: cursorPosition,
          selectionEnd: cursorPosition,
          cursorVisible: true, // Ensure cursor remains visible after content update
        },
      };
    });
  },

  updateTextSelection: (text: string, cursorPosition: number, selectionStart: number, selectionEnd: number) => {
    set((state) => {
      if (!state.textEditing.isEditing || !state.textEditing.elementId) return state;

      // During editing, only update textEditing state, NOT the element
      // The element will be updated when editing finishes via finishTextEditing
      return {
        textEditing: {
          ...state.textEditing,
          text,
          cursorPosition,
          selectionStart,
          selectionEnd,
          cursorVisible: true, // Ensure cursor remains visible after selection update
        },
      };
    });
  },

  finishTextEditing: () => {
    const state = get();
    if (!state.textEditing.isEditing || !state.textEditing.elementId) return;

    // Update the element with the final text using updateElement (which handles saveToHistory)
    get().updateElement(state.textEditing.elementId, { text: state.textEditing.text });

    // Reset text editing state
    set({
      textEditing: {
        isEditing: false,
        elementId: null,
        text: '',
        cursorPosition: 0,
        selectionStart: 0,
        selectionEnd: 0,
        cursorVisible: false,
      },
    });
  },

  toggleCursor: () => {
    set((state) => ({
      textEditing: {
        ...state.textEditing,
        cursorVisible: !state.textEditing.cursorVisible,
      },
    }));
  },

  // Dialog Actions
  openGridDialog: () => {
    set((state) => ({
      ui: {
        ...state.ui,
        dialogs: {
          ...state.ui.dialogs,
          gridDialog: true,
        },
      },
    }));
  },

  closeGridDialog: () => {
    set((state) => ({
      ui: {
        ...state.ui,
        dialogs: {
          ...state.ui.dialogs,
          gridDialog: false,
        },
      },
    }));
  },

  toggleGridDialog: () => {
    set((state) => ({
      ui: {
        ...state.ui,
        dialogs: {
          ...state.ui.dialogs,
          gridDialog: !state.ui.dialogs.gridDialog,
        },
      },
    }));
  },

  // Save State Actions
  setSaving: (isSaving: boolean) => {
    set({ isSaving });
  },

  // Spatial Index Actions
  getSpatialIndex: () => {
    return spatialIndex;
  },

  rebuildSpatialIndex: () => {
    const { elements } = get();
    updateSpatialIndex(elements);
  },

  spatialHitTest: (point: Point) => {
    const { elements } = get();
    return spatialHitTest(spatialIndex, point, elements);
  },

  // Bulk Operations with Progress
  bulkDuplicate: async (elementIds: string[], onProgress?: (current: number, total: number) => void): Promise<Element[]> => {
    const { elements } = get();
    const duplicatedElements: Element[] = [];
    const total = elementIds.length;
    
    for (let i = 0; i < elementIds.length; i++) {
      const element = elements.find(el => el.id === elementIds[i]);
      if (element) {
        // Create duplicate with offset
        const duplicate: Element = {
          ...element,
          id: generateId(),
          x: element.x + 20,
          y: element.y + 20,
          zIndex: element.zIndex + 1
        };
        
        duplicatedElements.push(duplicate);
        
        // Update progress
        if (onProgress) {
          onProgress(i + 1, total);
        }
        
        // Add small delay for progress visualization
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    
    // Add all duplicated elements at once
    set((state) => {
      const newElements = [...state.elements, ...duplicatedElements];
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newElements);
      
      updateSpatialIndex(newElements);
      
      return {
        elements: newElements,
        selectedElementIds: duplicatedElements.map(el => el.id),
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
    
    triggerAutoSave();
    return duplicatedElements;
  },

  bulkDelete: async (elementIds: string[], onProgress?: (current: number, total: number) => void): Promise<void> => {
    const total = elementIds.length;
    
    for (let i = 0; i < elementIds.length; i++) {
      // Update progress
      if (onProgress) {
        onProgress(i + 1, total);
      }
      
      // Add small delay for progress visualization
      await new Promise(resolve => setTimeout(resolve, 30));
    }
    
    // Delete all elements at once
    set((state) => {
      const newElements = state.elements.filter(el => !elementIds.includes(el.id));
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newElements);
      
      updateSpatialIndex(newElements);
      
      return {
        elements: newElements,
        selectedElementIds: state.selectedElementIds.filter(id => !elementIds.includes(id)),
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
    
    triggerAutoSave();
  },

  bulkApplyStyle: async (elementIds: string[], style: Partial<Element>, onProgress?: (current: number, total: number) => void): Promise<void> => {
    const total = elementIds.length;
    
    for (let i = 0; i < elementIds.length; i++) {
      // Update progress
      if (onProgress) {
        onProgress(i + 1, total);
      }
      
      // Add small delay for progress visualization
      await new Promise(resolve => setTimeout(resolve, 40));
    }
    
    // Apply style to all elements at once
    set((state) => {
      const newElements = state.elements.map(el => 
        elementIds.includes(el.id) ? { ...el, ...style } : el
      );
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newElements);
      
      updateSpatialIndex(newElements);
      
      return {
        elements: newElements,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
    
    triggerAutoSave();
  },

  bulkMove: async (elementIds: string[], deltaX: number, deltaY: number, onProgress?: (current: number, total: number) => void): Promise<void> => {
    const total = elementIds.length;
    
    for (let i = 0; i < elementIds.length; i++) {
      // Update progress
      if (onProgress) {
        onProgress(i + 1, total);
      }
      
      // Add small delay for progress visualization
      await new Promise(resolve => setTimeout(resolve, 35));
    }
    
    // Move all elements at once
    set((state) => {
      const newElements = state.elements.map(el => 
        elementIds.includes(el.id) 
          ? { ...el, x: el.x + deltaX, y: el.y + deltaY }
          : el
      );
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(newElements);
      
      updateSpatialIndex(newElements);
      
      return {
        elements: newElements,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
    
    triggerAutoSave();
  },
  };
});