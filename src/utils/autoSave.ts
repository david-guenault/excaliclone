// ABOUTME: Auto-save utility for preserving drawing state in localStorage
// ABOUTME: Provides continuous backup with debouncing to prevent data loss on page refresh

import type { AppState, Element } from '../types';
import { AUTO_SAVE_STORAGE_KEY } from '../constants';

// Expose diagnostic function globally for debugging
declare global {
  interface Window {
    diagnoseSavedData: () => void;
    clearSavedState: () => void;
  }
}

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

    const serializedData = JSON.stringify(savedState);
    
    // Check localStorage quota and data size
    const sizeInBytes = new Blob([serializedData]).size;
    const sizeInKB = (sizeInBytes / 1024).toFixed(2);
    
    // Test storage first with a temporary key to detect quota issues
    const testKey = `${AUTO_SAVE_STORAGE_KEY}_test`;
    try {
      localStorage.setItem(testKey, serializedData);
      localStorage.removeItem(testKey);
    } catch (testError) {
      if (testError instanceof DOMException && testError.name === 'QuotaExceededError') {
        console.warn('⚠️ localStorage quota will be exceeded. Trying to free space...');
        // Clear old auto-save data before saving new one
        localStorage.removeItem(AUTO_SAVE_STORAGE_KEY);
      }
    }
    
    localStorage.setItem(AUTO_SAVE_STORAGE_KEY, serializedData);
    
    // Enhanced logging with content details
    const elementsWithText = savedState.elements.filter(el => el.text);
    const elementsWithImages = savedState.elements.filter(el => el.imageUrl);
    const elementsWithRotation = savedState.elements.filter(el => el.angle && el.angle !== 0);
    
    console.log(`💾 Drawing auto-saved: ${savedState.elements.length} elements (${sizeInKB}KB)`);
    console.log(`   📝 Text elements: ${elementsWithText.length}`);
    console.log(`   🖼️ Image elements: ${elementsWithImages.length}`);
    console.log(`   🔄 Rotated elements: ${elementsWithRotation.length}`);
    
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded. Drawing too large to save automatically.');
      // Optionally show a user notification here
    } else {
      console.error('Failed to save state to localStorage:', error);
    }
  }
}

/**
 * Load the saved state from localStorage
 */
export function loadStateFromStorage(): Partial<AppState> | null {
  try {
    const saved = localStorage.getItem(AUTO_SAVE_STORAGE_KEY);
    if (!saved) {
      console.log('📂 No saved drawing found');
      return null;
    }

    const savedState: SavedState = JSON.parse(saved);
    
    // Version compatibility check
    if (savedState.version !== SAVE_FORMAT_VERSION) {
      console.warn(`Save format version mismatch. Expected ${SAVE_FORMAT_VERSION}, got ${savedState.version}`);
      // Could implement migration logic here in the future
    }

    // Enhanced logging with content verification
    const elementsWithText = savedState.elements.filter(el => el.text);
    const elementsWithImages = savedState.elements.filter(el => el.imageUrl);
    const elementsWithRotation = savedState.elements.filter(el => el.angle && el.angle !== 0);
    
    console.log(`📂 Drawing restored: ${savedState.elements.length} elements`);
    console.log(`   📝 Text elements: ${elementsWithText.length}`);
    console.log(`   🖼️ Image elements: ${elementsWithImages.length}`);
    console.log(`   🔄 Rotated elements: ${elementsWithRotation.length}`);
    
    // Detailed debugging for each type
    if (elementsWithText.length > 0) {
      console.log('📝 Text content preview:', elementsWithText.map(el => `"${el.text?.substring(0, 30)}..."`));
    }
    if (elementsWithImages.length > 0) {
      console.log('🖼️ Image URLs preview:', elementsWithImages.map(el => `${el.imageUrl?.substring(0, 50)}...`));
    }
    if (elementsWithRotation.length > 0) {
      console.log('🔄 Rotation angles:', elementsWithRotation.map(el => `${el.angle}°`));
    }
    
    // Validate and repair elements to ensure data integrity
    const repairedElements = validateAndRepairElements(savedState.elements || []);
    
    return {
      elements: repairedElements,
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
 * Validate and repair element data to ensure all properties are preserved
 */
function validateAndRepairElements(elements: any[]): Element[] {
  return elements.map(element => {
    // Ensure all required properties exist
    const repairedElement = {
      ...element,
      // Ensure angle is preserved (default to 0 if missing)
      angle: typeof element.angle === 'number' ? element.angle : 0,
      // Ensure text is preserved
      text: element.text || undefined,
      // Ensure imageUrl is preserved
      imageUrl: element.imageUrl || undefined,
      // Ensure other optional properties are preserved
      points: element.points || undefined,
      cornerStyle: element.cornerStyle || 'sharp',
      cornerRadius: element.cornerRadius || 0,
      locked: element.locked || false,
      zIndex: element.zIndex || 0,
    };
    
    return repairedElement;
  });
}

/**
 * Get diagnostic information about stored data
 */
export function diagnoseSavedData(): void {
  try {
    const saved = localStorage.getItem(AUTO_SAVE_STORAGE_KEY);
    if (!saved) {
      console.log('🔍 No saved data found in localStorage');
      return;
    }
    
    const sizeInBytes = new Blob([saved]).size;
    const sizeInKB = (sizeInBytes / 1024).toFixed(2);
    
    console.log(`🔍 Saved data size: ${sizeInKB}KB`);
    
    const savedState = JSON.parse(saved);
    console.log('🔍 Saved state structure:', {
      elementsCount: savedState.elements?.length || 0,
      hasViewport: !!savedState.viewport,
      hasToolOptions: !!savedState.toolOptions,
      hasTheme: !!savedState.theme,
      hasUI: !!savedState.ui,
      version: savedState.version
    });
    
    if (savedState.elements) {
      const analysis = {
        total: savedState.elements.length,
        withText: savedState.elements.filter((el: any) => el.text).length,
        withImages: savedState.elements.filter((el: any) => el.imageUrl).length,
        withRotation: savedState.elements.filter((el: any) => el.angle && el.angle !== 0).length,
        types: [...new Set(savedState.elements.map((el: any) => el.type))]
      };
      console.log('🔍 Elements analysis:', analysis);
    }
    
  } catch (error) {
    console.error('🔍 Error diagnosing saved data:', error);
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

// Expose debugging functions globally
if (typeof window !== 'undefined') {
  window.diagnoseSavedData = diagnoseSavedData;
  window.clearSavedState = clearSavedState;
}