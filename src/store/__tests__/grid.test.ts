// ABOUTME: Tests for grid-related store actions and state management
// ABOUTME: Comprehensive test coverage for grid state in Zustand store

import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '../index';
import { GRID_CONFIG } from '../../constants';

describe('Grid Store Actions', () => {
  beforeEach(() => {
    // Reset store to initial state
    useAppStore.setState({
      ui: {
        propertiesPanel: {
          visible: false,
          width: 300,
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
      },
    });
  });

  describe('setGridEnabled', () => {
    it('updates grid enabled state', () => {
      const store = useAppStore.getState();
      
      // Initially enabled
      expect(store.ui.grid.enabled).toBe(true);
      
      // Disable grid
      store.setGridEnabled(false);
      expect(useAppStore.getState().ui.grid.enabled).toBe(false);
      
      // Re-enable grid
      store.setGridEnabled(true);
      expect(useAppStore.getState().ui.grid.enabled).toBe(true);
    });

    it('preserves other grid settings when toggling enabled state', () => {
      const store = useAppStore.getState();
      
      // Set custom grid settings
      store.setGridSize(40);
      store.setGridSnapEnabled(true);
      store.setGridVisible(true);
      
      const beforeDisable = useAppStore.getState().ui.grid;
      
      // Disable grid
      store.setGridEnabled(false);
      const afterDisable = useAppStore.getState().ui.grid;
      
      // Only enabled should change
      expect(afterDisable.enabled).toBe(false);
      expect(afterDisable.size).toBe(beforeDisable.size);
      expect(afterDisable.snapToGrid).toBe(beforeDisable.snapToGrid);
      expect(afterDisable.showGrid).toBe(beforeDisable.showGrid);
    });
  });

  describe('setGridSize', () => {
    it('updates grid size within valid range', () => {
      const store = useAppStore.getState();
      
      // Set normal size
      store.setGridSize(30);
      expect(useAppStore.getState().ui.grid.size).toBe(30);
      
      // Set minimum size
      store.setGridSize(GRID_CONFIG.MIN_SIZE);
      expect(useAppStore.getState().ui.grid.size).toBe(GRID_CONFIG.MIN_SIZE);
      
      // Set maximum size
      store.setGridSize(GRID_CONFIG.MAX_SIZE);
      expect(useAppStore.getState().ui.grid.size).toBe(GRID_CONFIG.MAX_SIZE);
    });

    it('clamps grid size to valid range', () => {
      const store = useAppStore.getState();
      
      // Size below minimum should be clamped
      store.setGridSize(GRID_CONFIG.MIN_SIZE - 10);
      expect(useAppStore.getState().ui.grid.size).toBe(GRID_CONFIG.MIN_SIZE);
      
      // Size above maximum should be clamped
      store.setGridSize(GRID_CONFIG.MAX_SIZE + 50);
      expect(useAppStore.getState().ui.grid.size).toBe(GRID_CONFIG.MAX_SIZE);
    });

    it('preserves other grid settings when changing size', () => {
      const store = useAppStore.getState();
      
      // Set up initial state
      store.setGridSnapEnabled(true);
      store.setGridVisible(true);
      
      const beforeSizeChange = useAppStore.getState().ui.grid;
      
      // Change size
      store.setGridSize(50);
      const afterSizeChange = useAppStore.getState().ui.grid;
      
      // Only size should change
      expect(afterSizeChange.size).toBe(50);
      expect(afterSizeChange.enabled).toBe(beforeSizeChange.enabled);
      expect(afterSizeChange.snapToGrid).toBe(beforeSizeChange.snapToGrid);
      expect(afterSizeChange.showGrid).toBe(beforeSizeChange.showGrid);
    });
  });

  describe('setGridSnapEnabled', () => {
    it('updates snap to grid state', () => {
      const store = useAppStore.getState();
      
      // Initially disabled
      expect(store.ui.grid.snapToGrid).toBe(false);
      
      // Enable snap
      store.setGridSnapEnabled(true);
      expect(useAppStore.getState().ui.grid.snapToGrid).toBe(true);
      
      // Disable snap
      store.setGridSnapEnabled(false);
      expect(useAppStore.getState().ui.grid.snapToGrid).toBe(false);
    });

    it('preserves other grid settings when toggling snap state', () => {
      const store = useAppStore.getState();
      
      // Set custom settings
      store.setGridSize(25);
      store.setGridVisible(true);
      
      const beforeSnapChange = useAppStore.getState().ui.grid;
      
      // Toggle snap
      store.setGridSnapEnabled(true);
      const afterSnapChange = useAppStore.getState().ui.grid;
      
      // Only snapToGrid should change
      expect(afterSnapChange.snapToGrid).toBe(true);
      expect(afterSnapChange.size).toBe(beforeSnapChange.size);
      expect(afterSnapChange.enabled).toBe(beforeSnapChange.enabled);
      expect(afterSnapChange.showGrid).toBe(beforeSnapChange.showGrid);
    });
  });

  describe('setGridVisible', () => {
    it('updates grid visibility state', () => {
      const store = useAppStore.getState();
      
      // Initially hidden
      expect(store.ui.grid.showGrid).toBe(false);
      
      // Show grid
      store.setGridVisible(true);
      expect(useAppStore.getState().ui.grid.showGrid).toBe(true);
      
      // Hide grid
      store.setGridVisible(false);
      expect(useAppStore.getState().ui.grid.showGrid).toBe(false);
    });
  });

  describe('setGridSnapDistance', () => {
    it('updates snap distance within valid range', () => {
      const store = useAppStore.getState();
      
      // Set normal distance
      store.setGridSnapDistance(15);
      expect(useAppStore.getState().ui.grid.snapDistance).toBe(15);
      
      // Set minimum distance
      store.setGridSnapDistance(1);
      expect(useAppStore.getState().ui.grid.snapDistance).toBe(1);
      
      // Set maximum distance
      store.setGridSnapDistance(50);
      expect(useAppStore.getState().ui.grid.snapDistance).toBe(50);
    });

    it('clamps snap distance to valid range', () => {
      const store = useAppStore.getState();
      
      // Distance below minimum should be clamped to 1
      store.setGridSnapDistance(0);
      expect(useAppStore.getState().ui.grid.snapDistance).toBe(1);
      
      store.setGridSnapDistance(-5);
      expect(useAppStore.getState().ui.grid.snapDistance).toBe(1);
      
      // Distance above maximum should be clamped to 50
      store.setGridSnapDistance(100);
      expect(useAppStore.getState().ui.grid.snapDistance).toBe(50);
    });
  });

  describe('toggleGrid', () => {
    it('toggles grid visibility', () => {
      const store = useAppStore.getState();
      
      // Initially hidden
      expect(store.ui.grid.showGrid).toBe(false);
      
      // Toggle to show
      store.toggleGrid();
      expect(useAppStore.getState().ui.grid.showGrid).toBe(true);
      
      // Toggle to hide
      store.toggleGrid();
      expect(useAppStore.getState().ui.grid.showGrid).toBe(false);
    });

    it('preserves other grid settings when toggling visibility', () => {
      const store = useAppStore.getState();
      
      // Set custom settings
      store.setGridSize(40);
      store.setGridSnapEnabled(true);
      
      const beforeToggle = useAppStore.getState().ui.grid;
      
      // Toggle visibility
      store.toggleGrid();
      const afterToggle = useAppStore.getState().ui.grid;
      
      // Only showGrid should change
      expect(afterToggle.showGrid).toBe(!beforeToggle.showGrid);
      expect(afterToggle.size).toBe(beforeToggle.size);
      expect(afterToggle.enabled).toBe(beforeToggle.enabled);
      expect(afterToggle.snapToGrid).toBe(beforeToggle.snapToGrid);
    });
  });

  describe('snapToGrid', () => {
    beforeEach(() => {
      const store = useAppStore.getState();
      store.setGridSize(20);
      store.setGridSnapEnabled(true);
    });

    it('snaps point to grid when snap is enabled', () => {
      const store = useAppStore.getState();
      const point = { x: 23, y: 17 };
      
      const snapped = store.snapToGrid(point);
      expect(snapped).toEqual({ x: 20, y: 20 });
    });

    it('returns original point when snap is disabled', () => {
      const store = useAppStore.getState();
      store.setGridSnapEnabled(false);
      
      const point = { x: 23, y: 17 };
      const snapped = store.snapToGrid(point);
      
      expect(snapped).toEqual(point);
    });

    it('snaps to different grid sizes correctly', () => {
      const store = useAppStore.getState();
      
      // Test with 10px grid
      store.setGridSize(10);
      let point = { x: 23, y: 17 };
      let snapped = store.snapToGrid(point);
      expect(snapped).toEqual({ x: 20, y: 20 });
      
      // Test with 50px grid
      store.setGridSize(50);
      point = { x: 73, y: 27 };
      snapped = store.snapToGrid(point);
      expect(snapped).toEqual({ x: 50, y: 50 });
    });

    it('handles negative coordinates', () => {
      const store = useAppStore.getState();
      const point = { x: -13, y: -27 };
      
      const snapped = store.snapToGrid(point);
      expect(snapped).toEqual({ x: -20, y: -20 });
    });

    it('handles zero coordinates', () => {
      const store = useAppStore.getState();
      const point = { x: 0, y: 0 };
      
      const snapped = store.snapToGrid(point);
      expect(snapped).toEqual({ x: 0, y: 0 });
    });
  });

  describe('Grid State Integration', () => {
    it('maintains consistent state through multiple operations', () => {
      const store = useAppStore.getState();
      
      // Perform multiple grid operations
      store.setGridSize(30);
      store.setGridSnapEnabled(true);
      store.setGridVisible(true);
      store.setGridSnapDistance(15);
      
      const finalState = useAppStore.getState().ui.grid;
      
      expect(finalState).toEqual({
        enabled: true,
        size: 30,
        snapToGrid: true,
        snapDistance: 15,
        showGrid: true,
        color: GRID_CONFIG.COLOR,
        opacity: GRID_CONFIG.OPACITY,
      });
    });

    it('works independently of other UI state', () => {
      const store = useAppStore.getState();
      
      // Change other UI state
      store.setPropertiesPanelVisible(true);
      store.setCanvasLocked(true);
      
      // Change grid state
      store.setGridSize(40);
      store.setGridVisible(true);
      
      const finalState = useAppStore.getState();
      
      // Grid state should be updated
      expect(finalState.ui.grid.size).toBe(40);
      expect(finalState.ui.grid.showGrid).toBe(true);
      
      // Other UI state should be preserved
      expect(finalState.ui.propertiesPanel.visible).toBe(true);
      expect(finalState.ui.canvasLocked).toBe(true);
    });

    it('preserves grid settings through store reset operations', () => {
      const store = useAppStore.getState();
      
      // Set custom grid configuration
      store.setGridSize(35);
      store.setGridSnapEnabled(true);
      store.setGridVisible(true);
      store.setGridSnapDistance(8);
      
      const gridState = useAppStore.getState().ui.grid;
      
      // Grid state should be preserved even with other operations
      store.clearSelection(); // This shouldn't affect grid
      store.setActiveTool('rectangle'); // This shouldn't affect grid
      
      const finalGridState = useAppStore.getState().ui.grid;
      expect(finalGridState).toEqual(gridState);
    });
  });
});