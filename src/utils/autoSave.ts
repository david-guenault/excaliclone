// ABOUTME: Auto-save utility for preserving drawing state in localStorage
// ABOUTME: Provides continuous backup with debouncing to prevent data loss on page refresh

import type { AppState, Element } from '../types';
import { AUTO_SAVE_STORAGE_KEY } from '../constants';

// Define what parts of the state should be saved
interface SavedState {
  elements: Element[];
  viewport: AppState['viewport'];
  toolOptions: AppState['toolOptions'];
  theme: AppState['theme'];
  ui: Pick<AppState['ui'], 'grid'>;
  version: string; // For future compatibility
}

// Version for compatibility checking
const SAVE_FORMAT_VERSION = '1.0.0';

/**
 * Save the current state to localStorage
 */
export function saveStateToStorage(state: Partial<AppState>): void {
  try {
    const savedState: SavedState = {
      elements: state.elements || [],
      viewport: state.viewport || {
        zoom: 1,
        pan: { x: 0, y: 0 },
        bounds: { x: 0, y: 0, width: 800, height: 600 }
      },
      toolOptions: state.toolOptions || {} as AppState['toolOptions'],
      theme: state.theme || 'light',
      ui: {
        grid: state.ui?.grid || {
          enabled: true,
          size: 20,
          snapToGrid: false,
          snapDistance: 10,
          showGrid: false,
          color: '#e5e7eb',
          opacity: 0.5
        }
      },
      version: SAVE_FORMAT_VERSION
    };

    localStorage.setItem(AUTO_SAVE_STORAGE_KEY, JSON.stringify(savedState));
    console.log(`💾 Drawing auto-saved: ${state.elements?.length || 0} elements`);
  } catch (error) {
    console.error('Failed to save state to localStorage:', error);
  }
}

/**
 * Load the saved state from localStorage
 */
export function loadStateFromStorage(): Partial<AppState> | null {
  try {
    const saved = localStorage.getItem(AUTO_SAVE_STORAGE_KEY);
    if (!saved) {
      return null;
    }

    const savedState: SavedState = JSON.parse(saved);
    
    // Version compatibility check
    if (savedState.version !== SAVE_FORMAT_VERSION) {
      console.warn(`Save format version mismatch. Expected ${SAVE_FORMAT_VERSION}, got ${savedState.version}`);
      // Could implement migration logic here in the future
    }

    console.log(`📂 Drawing restored: ${savedState.elements.length} elements`);
    
    return {
      elements: savedState.elements,
      viewport: savedState.viewport,
      toolOptions: savedState.toolOptions,
      theme: savedState.theme,
      ui: {
        ...{} as AppState['ui'], // Default UI state will be merged
        grid: savedState.ui.grid
      }
    };
  } catch (error) {
    console.error('Failed to load state from localStorage:', error);
    return null;
  }
}

/**
 * Clear the saved state from localStorage
 */
export function clearSavedState(): void {
  try {
    localStorage.removeItem(AUTO_SAVE_STORAGE_KEY);
    console.log('🗑️ Saved drawing cleared');
  } catch (error) {
    console.error('Failed to clear saved state:', error);
  }
}

/**
 * Check if there's a saved state available
 */
export function hasSavedState(): boolean {
  try {
    return localStorage.getItem(AUTO_SAVE_STORAGE_KEY) !== null;
  } catch (error) {
    return false;
  }
}

/**
 * Debounced save function to prevent excessive writes
 */
let saveTimeout: number | null = null;

export function debouncedSave(state: Partial<AppState>, delay: number = 500): void {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  
  saveTimeout = setTimeout(() => {
    saveStateToStorage(state);
    saveTimeout = null;
  }, delay);
}