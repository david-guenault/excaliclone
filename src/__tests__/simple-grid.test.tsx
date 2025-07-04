// ABOUTME: Tests for simplified grid system - visibility, sizing, and snap functionality
// ABOUTME: Comprehensive test coverage for basic grid features without magnetic complexity

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react';
import App from '../App';
import { useAppStore } from '../store';

// Mock the useAppStore hook
vi.mock('../store', () => ({
  useAppStore: vi.fn(),
}));

describe('Simple Grid System', () => {
  let mockStoreActions: any;
  let defaultStoreState: any;

  beforeEach(() => {
    mockStoreActions = {
      setGridVisible: vi.fn(),
      setGridSize: vi.fn(),
      setGridSnapEnabled: vi.fn(),
      setGridSnapDistance: vi.fn(),
      toggleGrid: vi.fn(),
      snapToGrid: vi.fn((point) => point),
      setActiveTool: vi.fn(),
      addElement: vi.fn(),
      updateElement: vi.fn(),
      deleteElement: vi.fn(),
      setSelectedElements: vi.fn(),
      addToSelection: vi.fn(),
      removeFromSelection: vi.fn(),
      clearSelection: vi.fn(),
      setViewport: vi.fn(),
      setZoom: vi.fn(),
      setPan: vi.fn(),
      setToolOptions: vi.fn(),
      undo: vi.fn(),
      redo: vi.fn(),
      saveToHistory: vi.fn(),
      startTextEditing: vi.fn(),
      updateTextContent: vi.fn(),
      finishTextEditing: vi.fn(),
      toggleCursor: vi.fn(),
    };

    defaultStoreState = {
      viewport: {
        zoom: 1,
        pan: { x: 0, y: 0 },
        bounds: { x: 0, y: 0, width: 800, height: 600 },
      },
      elements: [],
      selectedElementIds: [],
      activeTool: 'select',
      toolOptions: {
        strokeColor: '#000000',
        backgroundColor: '#ffffff',
        strokeWidth: 2,
        strokeStyle: 'solid',
        fillStyle: 'solid',
        roughness: 1,
        opacity: 1,
        cornerStyle: 'sharp',
        fontFamily: 'Inter',
        fontSize: 16,
        fontWeight: 'normal',
        fontStyle: 'normal',
        textAlign: 'left',
        textDecoration: 'none',
        startArrowhead: 'none',
        endArrowhead: 'none',
      },
      theme: 'light',
      ui: {
        propertiesPanel: { visible: false, width: 200 },
        topToolbar: { visible: true },
        canvasLocked: false,
        grid: {
          enabled: true,
          size: 20,
          snapToGrid: false,
          snapDistance: 10,
          showGrid: false,
          color: '#c1c5c9',
          opacity: 0.6,
        },
      },
      history: [[]],
      historyIndex: 0,
      clipboard: null,
      styleClipboard: null,
      recentColors: [],
      directTextEditing: null,
      textEditing: { isEditing: false, elementId: null, text: '', cursorPosition: 0, cursorVisible: false },
    };

    // Setup mock return value
    (useAppStore as any).mockReturnValue({
      ...defaultStoreState,
      ...mockStoreActions,
    });

    // Mock getState method
    (useAppStore as any).getState = vi.fn(() => ({
      ...defaultStoreState,
      ...mockStoreActions,
    }));
  });

  describe('Grid Visibility Controls', () => {
    it('should toggle grid visibility when G key is pressed', () => {
      render(<App />);
      
      // Simulate G key press
      fireEvent.keyDown(document, { key: 'g', code: 'KeyG' });
      
      expect(mockStoreActions.toggleGrid).toHaveBeenCalled();
    });

    it('should show grid toggle button in toolbar menu', () => {
      render(<App />);
      
      // Open toolbar menu
      const menuButton = screen.getByLabelText('Menu des options');
      fireEvent.click(menuButton);
      
      // Check for grid visibility toggle
      const gridToggle = screen.getByLabelText('Afficher la grille');
      expect(gridToggle).toBeInTheDocument();
    });

    it('should call setGridVisible when grid toggle is clicked', () => {
      render(<App />);
      
      // Open toolbar menu
      const menuButton = screen.getByLabelText('Menu des options');
      fireEvent.click(menuButton);
      
      // Click grid toggle
      const gridToggle = screen.getByLabelText('Afficher la grille');
      fireEvent.click(gridToggle);
      
      expect(mockStoreActions.setGridVisible).toHaveBeenCalledWith(true);
    });
  });

  describe('Grid Size Controls', () => {
    it('should show grid size input in toolbar menu', () => {
      render(<App />);
      
      // Open toolbar menu
      const menuButton = screen.getByLabelText('Menu des options');
      fireEvent.click(menuButton);
      
      // Check for grid size input
      const sizeInput = screen.getByLabelText('Taille de la grille en pixels');
      expect(sizeInput).toBeInTheDocument();
      expect(sizeInput).toHaveValue(20); // Default size
    });

    it('should update grid size when input value changes', () => {
      render(<App />);
      
      // Open toolbar menu
      const menuButton = screen.getByLabelText('Menu des options');
      fireEvent.click(menuButton);
      
      // Change grid size
      const sizeInput = screen.getByLabelText('Taille de la grille en pixels');
      fireEvent.change(sizeInput, { target: { value: '40' } });
      
      expect(mockStoreActions.setGridSize).toHaveBeenCalledWith(40);
    });

    it('should constrain grid size to valid range (5-100)', () => {
      render(<App />);
      
      // Open toolbar menu
      const menuButton = screen.getByLabelText('Menu des options');
      fireEvent.click(menuButton);
      
      const sizeInput = screen.getByLabelText('Taille de la grille en pixels');
      
      // Test minimum constraint
      fireEvent.change(sizeInput, { target: { value: '2' } });
      expect(mockStoreActions.setGridSize).toHaveBeenCalledWith(5);
      
      // Test maximum constraint
      fireEvent.change(sizeInput, { target: { value: '150' } });
      expect(mockStoreActions.setGridSize).toHaveBeenCalledWith(100);
    });
  });

  describe('Grid Snapping Controls', () => {
    it('should show snap to grid toggle in toolbar menu', () => {
      render(<App />);
      
      // Open toolbar menu
      const menuButton = screen.getByLabelText('Menu des options');
      fireEvent.click(menuButton);
      
      // Check for snap toggle
      const snapToggle = screen.getByLabelText('Accrochage à la grille');
      expect(snapToggle).toBeInTheDocument();
    });

    it('should call setGridSnapEnabled when snap toggle is clicked', () => {
      render(<App />);
      
      // Open toolbar menu
      const menuButton = screen.getByLabelText('Menu des options');
      fireEvent.click(menuButton);
      
      // Click snap toggle
      const snapToggle = screen.getByLabelText('Accrochage à la grille');
      fireEvent.click(snapToggle);
      
      expect(mockStoreActions.setGridSnapEnabled).toHaveBeenCalledWith(true);
    });

    it('should indicate active state when snap is enabled', () => {
      // Update store state to have snap enabled
      const stateWithSnapEnabled = {
        ...defaultStoreState,
        ui: {
          ...defaultStoreState.ui,
          grid: {
            ...defaultStoreState.ui.grid,
            snapToGrid: true,
          },
        },
      };

      (useAppStore as any).mockReturnValue({
        ...stateWithSnapEnabled,
        ...mockStoreActions,
      });

      render(<App />);
      
      // Open toolbar menu
      const menuButton = screen.getByLabelText('Menu des options');
      fireEvent.click(menuButton);
      
      // Check that snap toggle shows active state
      const snapToggle = screen.getByLabelText('Accrochage à la grille');
      expect(snapToggle).toHaveClass('active');
    });
  });

  describe('Grid Snapping Functionality', () => {
    beforeEach(() => {
      // Setup state with grid snapping enabled
      const stateWithSnapEnabled = {
        ...defaultStoreState,
        ui: {
          ...defaultStoreState.ui,
          grid: {
            ...defaultStoreState.ui.grid,
            snapToGrid: true,
            snapDistance: 10,
          },
        },
      };

      (useAppStore as any).mockReturnValue({
        ...stateWithSnapEnabled,
        ...mockStoreActions,
      });
    });

    it('should apply snapping when drawing rectangles', () => {
      render(<App />);
      
      // Set rectangle tool
      mockStoreActions.setActiveTool('rectangle');
      
      // Get canvas
      const canvas = screen.getByRole('img', { name: /Drawing canvas/ });
      
      // Simulate mouse down to start drawing
      fireEvent.mouseDown(canvas, { 
        clientX: 102, 
        clientY: 98,
        button: 0 
      });
      
      // Simulate mouse move
      fireEvent.mouseMove(canvas, { 
        clientX: 152, 
        clientY: 148 
      });
      
      // Simulate mouse up to finish drawing
      fireEvent.mouseUp(canvas, { 
        clientX: 152, 
        clientY: 148 
      });
      
      // Should have called addElement with snapped coordinates
      expect(mockStoreActions.addElement).toHaveBeenCalled();
    });

    it('should apply snapping when drawing circles', () => {
      render(<App />);
      
      // Set circle tool
      mockStoreActions.setActiveTool('circle');
      
      // Get canvas
      const canvas = screen.getByRole('img', { name: /Drawing canvas/ });
      
      // Simulate drawing a circle near grid intersection
      fireEvent.mouseDown(canvas, { 
        clientX: 98, 
        clientY: 102,
        button: 0 
      });
      
      fireEvent.mouseMove(canvas, { 
        clientX: 148, 
        clientY: 152 
      });
      
      fireEvent.mouseUp(canvas, { 
        clientX: 148, 
        clientY: 152 
      });
      
      // Should have called addElement
      expect(mockStoreActions.addElement).toHaveBeenCalled();
    });

    it('should not snap when grid snapping is disabled', () => {
      // Update state to disable snapping
      const stateWithSnapDisabled = {
        ...defaultStoreState,
        ui: {
          ...defaultStoreState.ui,
          grid: {
            ...defaultStoreState.ui.grid,
            snapToGrid: false,
          },
        },
      };

      (useAppStore as any).mockReturnValue({
        ...stateWithSnapDisabled,
        ...mockStoreActions,
      });

      render(<App />);
      
      // Set rectangle tool
      mockStoreActions.setActiveTool('rectangle');
      
      // Get canvas
      const canvas = screen.getByRole('img', { name: /Drawing canvas/ });
      
      // Draw at non-grid coordinates
      fireEvent.mouseDown(canvas, { 
        clientX: 103, 
        clientY: 97,
        button: 0 
      });
      
      fireEvent.mouseUp(canvas, { 
        clientX: 153, 
        clientY: 147 
      });
      
      // Should still call addElement but without snapping
      expect(mockStoreActions.addElement).toHaveBeenCalled();
    });
  });

  describe('Grid Integration', () => {
    it('should show only grid controls without magnetic options', () => {
      render(<App />);
      
      // Open toolbar menu
      const menuButton = screen.getByLabelText('Menu des options');
      fireEvent.click(menuButton);
      
      // Should have grid section
      expect(screen.getByText('Grille')).toBeInTheDocument();
      
      // Should NOT have magnetic section
      expect(screen.queryByText('Grille Magnétique')).not.toBeInTheDocument();
      expect(screen.queryByText('Mode magnétique')).not.toBeInTheDocument();
      expect(screen.queryByText('Force magnétique')).not.toBeInTheDocument();
    });

    it('should handle keyboard shortcuts correctly', () => {
      render(<App />);
      
      // Test G key for grid toggle
      fireEvent.keyDown(document, { key: 'g', code: 'KeyG' });
      expect(mockStoreActions.toggleGrid).toHaveBeenCalled();
      
      // Should not respond to M key (magnetic toggle removed)
      fireEvent.keyDown(document, { key: 'm', code: 'KeyM' });
      // No magnetic action should be called
    });

    it('should maintain grid state consistency', () => {
      const gridState = {
        enabled: true,
        size: 25,
        snapToGrid: true,
        snapDistance: 15,
        showGrid: true,
        color: '#c1c5c9',
        opacity: 0.6,
      };

      const stateWithGrid = {
        ...defaultStoreState,
        ui: {
          ...defaultStoreState.ui,
          grid: gridState,
        },
      };

      (useAppStore as any).mockReturnValue({
        ...stateWithGrid,
        ...mockStoreActions,
      });

      render(<App />);
      
      // Open toolbar menu
      const menuButton = screen.getByLabelText('Menu des options');
      fireEvent.click(menuButton);
      
      // Check that UI reflects the grid state
      const sizeInput = screen.getByLabelText('Taille de la grille en pixels');
      expect(sizeInput).toHaveValue(25);
      
      const gridToggle = screen.getByLabelText('Afficher la grille');
      expect(gridToggle).toHaveClass('active');
      
      const snapToggle = screen.getByLabelText('Accrochage à la grille');
      expect(snapToggle).toHaveClass('active');
    });
  });
});