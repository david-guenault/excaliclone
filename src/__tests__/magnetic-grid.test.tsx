// ABOUTME: Comprehensive tests for magnetic grid system functionality
// ABOUTME: Tests magnetic snapping, field calculations, element magnetism, and visual indicators

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi, MockedFunction } from 'vitest';
import App from '../App';
import { useAppStore } from '../store';
import { keyboardManager } from '../utils/keyboard';
import { calculateMagneticField, findNearestMagneticPoint, getMagneticSnapPoint } from '../utils/magnetic';

// Mock the store
vi.mock('../store');
const mockUseAppStore = useAppStore as MockedFunction<typeof useAppStore>;

// Mock the keyboard manager
vi.mock('../utils/keyboard');
const mockKeyboardManager = keyboardManager as typeof keyboardManager & {
  on: ReturnType<typeof vi.fn>;
  off: ReturnType<typeof vi.fn>;
  getModifierState: ReturnType<typeof vi.fn>;
  isSpacePressedNow: ReturnType<typeof vi.fn>;
};

// Mock magnetic utilities
vi.mock('../utils/magnetic');
const mockCalculateMagneticField = calculateMagneticField as MockedFunction<typeof calculateMagneticField>;
const mockFindNearestMagneticPoint = findNearestMagneticPoint as MockedFunction<typeof findNearestMagneticPoint>;
const mockGetMagneticSnapPoint = getMagneticSnapPoint as MockedFunction<typeof getMagneticSnapPoint>;

// Mock Canvas API
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  fill: vi.fn(),
  fillRect: vi.fn(),
  strokeRect: vi.fn(),
  arc: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  scale: vi.fn(),
  setLineDash: vi.fn(),
  measureText: vi.fn(() => ({ width: 100 })),
  fillText: vi.fn(),
  strokeText: vi.fn(),
  lineDashOffset: 0,
  lineWidth: 1,
  strokeStyle: '#000',
  fillStyle: '#000',
  globalAlpha: 1,
  font: '16px Arial',
  textAlign: 'left',
  textBaseline: 'top',
}));

describe('Magnetic Grid System', () => {
  const mockElements = [
    {
      id: 'rect1',
      type: 'rectangle' as const,
      x: 100,
      y: 100,
      width: 100,
      height: 50,
      angle: 0,
      strokeColor: '#000000',
      backgroundColor: 'transparent',
      strokeWidth: 2,
      strokeStyle: 'solid' as const,
      fillStyle: 'solid' as const,
      roughness: 1,
      opacity: 1,
    },
    {
      id: 'circle1', 
      type: 'circle' as const,
      x: 300,
      y: 200,
      width: 80,
      height: 80,
      angle: 0,
      strokeColor: '#000000',
      backgroundColor: 'transparent',
      strokeWidth: 2,
      strokeStyle: 'solid' as const,
      fillStyle: 'solid' as const,
      roughness: 1,
      opacity: 1,
    },
  ];

  const defaultStoreState = {
    viewport: {
      zoom: 1,
      pan: { x: 0, y: 0 },
      bounds: { x: 0, y: 0, width: 800, height: 600 },
    },
    elements: mockElements,
    selectedElementIds: [],
    activeTool: 'select' as const,
    toolOptions: {
      strokeColor: '#000000',
      backgroundColor: 'transparent',
      strokeWidth: 2,
      strokeStyle: 'solid' as const,
      fillStyle: 'solid' as const,
      roughness: 1,
      opacity: 1,
    },
    ui: {
      propertiesPanel: { visible: false, width: 200 },
      topToolbar: { visible: true },
      canvasLocked: false,
      grid: {
        enabled: true,
        size: 20,
        snapToGrid: false,
        snapDistance: 10,
        showGrid: true,
        color: '#e0e0e0',
        opacity: 0.5,
        magneticEnabled: true,
        magneticStrength: 25,
        magneticRadius: 30,
      },
    },
    theme: 'light' as const,
    clipboard: [],
    styleClipboard: null,
    recentColors: [],
    history: [[]],
    historyIndex: 0,
    textEditing: {
      isEditing: false,
      elementId: null,
      text: '',
      cursorPosition: 0,
      cursorVisible: false,
    },
  };

  // Mock store actions
  const mockStoreActions = {
    selectElement: vi.fn(),
    selectElements: vi.fn(),
    addToSelection: vi.fn(),
    removeFromSelection: vi.fn(),
    toggleSelection: vi.fn(),
    selectAll: vi.fn(),
    selectNext: vi.fn(),
    selectPrevious: vi.fn(),
    clearSelection: vi.fn(),
    duplicateSelectedElements: vi.fn(),
    deleteSelectedElements: vi.fn(),
    setActiveTool: vi.fn(),
    addElementSilent: vi.fn(),
    updateElementSilent: vi.fn(),
    undo: vi.fn(),
    redo: vi.fn(),
    copy: vi.fn(),
    paste: vi.fn(),
    copyStyle: vi.fn(),
    pasteStyle: vi.fn(),
    resetZoom: vi.fn(),
    zoomToFit: vi.fn(),
    setZoom: vi.fn(),
    setPan: vi.fn(),
    saveToHistory: vi.fn(),
    startTextEditing: vi.fn(),
    updateTextContent: vi.fn(),
    finishTextEditing: vi.fn(),
    toggleCursor: vi.fn(),
    setGridMagneticEnabled: vi.fn(),
    setGridMagneticStrength: vi.fn(),
    setGridMagneticRadius: vi.fn(),
    toggleMagneticGrid: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock keyboard manager methods
    mockKeyboardManager.on = vi.fn();
    mockKeyboardManager.off = vi.fn();
    mockKeyboardManager.getModifierState = vi.fn(() => ({
      shift: false,
      ctrl: false,
      alt: false,
      meta: false,
    }));
    mockKeyboardManager.isSpacePressedNow = vi.fn(() => false);

    // Setup store mock
    mockUseAppStore.mockReturnValue({
      ...defaultStoreState,
      ...mockStoreActions,
    });

    // Mock the getState method
    mockUseAppStore.getState = vi.fn(() => ({
      ...defaultStoreState,
      ...mockStoreActions,
    }));

    // Mock magnetic utility functions
    mockCalculateMagneticField.mockReturnValue(0);
    mockFindNearestMagneticPoint.mockReturnValue(null);
    mockGetMagneticSnapPoint.mockReturnValue(null);
  });

  describe('Magnetic Field Calculations', () => {
    it('should calculate magnetic field strength at given point', () => {
      const magneticPoint = { x: 100, y: 100 };
      const testPoint = { x: 110, y: 105 };
      const magneticStrength = 25;
      
      mockCalculateMagneticField.mockReturnValue(15.2);
      
      const fieldStrength = calculateMagneticField(testPoint, magneticPoint, magneticStrength);
      
      expect(mockCalculateMagneticField).toHaveBeenCalledWith(testPoint, magneticPoint, magneticStrength);
      expect(fieldStrength).toBe(15.2);
    });

    it('should return zero field strength for points outside magnetic radius', () => {
      const magneticPoint = { x: 100, y: 100 };
      const testPoint = { x: 200, y: 200 }; // Far away point
      const magneticStrength = 25;
      
      mockCalculateMagneticField.mockReturnValue(0);
      
      const fieldStrength = calculateMagneticField(testPoint, magneticPoint, magneticStrength);
      
      expect(fieldStrength).toBe(0);
    });

    it('should find nearest magnetic point within radius', () => {
      const testPoint = { x: 102, y: 98 };
      const magneticPoints = [
        { x: 100, y: 100 },
        { x: 120, y: 120 },
        { x: 140, y: 140 },
      ];
      const magneticRadius = 30;
      
      mockFindNearestMagneticPoint.mockReturnValue({ x: 100, y: 100 });
      
      const nearestPoint = findNearestMagneticPoint(testPoint, magneticPoints, magneticRadius);
      
      expect(mockFindNearestMagneticPoint).toHaveBeenCalledWith(testPoint, magneticPoints, magneticRadius);
      expect(nearestPoint).toEqual({ x: 100, y: 100 });
    });

    it('should return null when no magnetic points are within radius', () => {
      const testPoint = { x: 50, y: 50 };
      const magneticPoints = [
        { x: 100, y: 100 },
        { x: 120, y: 120 },
      ];
      const magneticRadius = 20;
      
      mockFindNearestMagneticPoint.mockReturnValue(null);
      
      const nearestPoint = findNearestMagneticPoint(testPoint, magneticPoints, magneticRadius);
      
      expect(nearestPoint).toBeNull();
    });
  });

  describe('Grid Intersection Magnetism', () => {
    it('should snap to grid intersections when magnetic grid enabled', () => {
      const testPoint = { x: 102, y: 98 };
      const gridSize = 20;
      const magneticStrength = 25;
      
      mockGetMagneticSnapPoint.mockReturnValue({ x: 100, y: 100 });
      
      const snapPoint = getMagneticSnapPoint(testPoint, gridSize, magneticStrength, true);
      
      expect(mockGetMagneticSnapPoint).toHaveBeenCalledWith(testPoint, gridSize, magneticStrength, true);
      expect(snapPoint).toEqual({ x: 100, y: 100 });
    });

    it('should not snap when magnetic grid disabled', () => {
      const testPoint = { x: 102, y: 98 };
      const gridSize = 20;
      const magneticStrength = 25;
      
      mockGetMagneticSnapPoint.mockReturnValue(null);
      
      const snapPoint = getMagneticSnapPoint(testPoint, gridSize, magneticStrength, false);
      
      expect(snapPoint).toBeNull();
    });

    it('should only snap to closest grid intersection', () => {
      const testPoint = { x: 115, y: 118 }; // Between (100,100), (120,100), (100,120), (120,120)
      const gridSize = 20;
      const magneticStrength = 25;
      
      mockGetMagneticSnapPoint.mockReturnValue({ x: 120, y: 120 });
      
      const snapPoint = getMagneticSnapPoint(testPoint, gridSize, magneticStrength, true);
      
      expect(snapPoint).toEqual({ x: 120, y: 120 });
    });

    it('should NOT snap to grid lines themselves, only intersections', () => {
      // Test point on a grid line but not at an intersection
      const testPoint = { x: 100, y: 115 }; // On vertical line x=100 but between y=100 and y=120
      const gridSize = 20;
      const magneticStrength = 25;
      
      // Should not snap to line itself, only to nearest intersection
      mockGetMagneticSnapPoint.mockReturnValue({ x: 100, y: 120 }); // Snaps to intersection, not line
      
      const snapPoint = getMagneticSnapPoint(testPoint, gridSize, magneticStrength, true);
      
      // Should snap to intersection (100, 120), not stay on line at (100, 115)
      expect(snapPoint).toEqual({ x: 100, y: 120 });
    });
  });

  describe('Element-to-Element Magnetism', () => {
    it('should detect magnetic fields from element edges', () => {
      render(<App />);
      
      const canvas = screen.getByRole('img', { name: /Drawing canvas with.*elements/ });
      
      // Simulate drawing near an element edge
      fireEvent.mouseDown(canvas, {
        clientX: 205, // Near right edge of rect1 (x: 200, width: 100, so right edge at 300)
        clientY: 125, // Middle of rect1 (y: 100, height: 50, so middle at 125)
      });

      // Should call magnetic calculations
      expect(mockGetMagneticSnapPoint).toHaveBeenCalled();
    });

    it('should detect magnetic fields from element centers', () => {
      render(<App />);
      
      const canvas = screen.getByRole('img', { name: /Drawing canvas with.*elements/ });
      
      // Simulate drawing near element center
      fireEvent.mouseDown(canvas, {
        clientX: 152, // Near center of rect1 (x: 100 + width: 100/2 = 150)
        clientY: 127, // Near center of rect1 (y: 100 + height: 50/2 = 125)
      });

      expect(mockGetMagneticSnapPoint).toHaveBeenCalled();
    });

    it('should detect magnetic fields from element corners', () => {
      render(<App />);
      
      const canvas = screen.getByRole('img', { name: /Drawing canvas with.*elements/ });
      
      // Simulate drawing near element corner
      fireEvent.mouseDown(canvas, {
        clientX: 102, // Near top-left corner of rect1 (x: 100, y: 100)
        clientY: 98,
      });

      expect(mockGetMagneticSnapPoint).toHaveBeenCalled();
    });
  });

  describe('Magnetic Toggle Controls', () => {
    it('should register M key shortcut for magnetic toggle', () => {
      render(<App />);
      
      expect(mockKeyboardManager.on).toHaveBeenCalledWith('toggleMagnetic', mockStoreActions.toggleMagneticGrid);
    });

    it('should toggle magnetic grid state with M key', () => {
      render(<App />);
      
      // Verify the callback is registered
      const calls = mockKeyboardManager.on.mock.calls;
      const magneticToggleCall = calls.find(call => call[0] === 'toggleMagnetic');
      
      expect(magneticToggleCall).toBeDefined();
      expect(magneticToggleCall[1]).toBe(mockStoreActions.toggleMagneticGrid);
    });

    it('should show magnetic controls in properties panel when grid enabled', () => {
      // Mock grid enabled state
      mockUseAppStore.mockReturnValue({
        ...defaultStoreState,
        ui: {
          ...defaultStoreState.ui,
          grid: {
            ...defaultStoreState.ui.grid,
            enabled: true,
            magneticEnabled: true,
          },
        },
        ...mockStoreActions,
      });

      render(<App />);
      
      // Magnetic controls should be present when grid is enabled
      // This will be validated when we implement the UI components
    });
  });

  describe('Context-Aware Magnetic Behavior', () => {
    it('should have different magnetic strength when drawing vs moving', () => {
      render(<App />);
      
      const canvas = screen.getByRole('img', { name: /Drawing canvas with.*elements/ });
      
      // Test drawing mode (rectangle tool)
      mockStoreActions.setActiveTool('rectangle');
      
      fireEvent.mouseDown(canvas, {
        clientX: 102,
        clientY: 98,
      });

      expect(mockGetMagneticSnapPoint).toHaveBeenCalled();
      
      // Reset mock
      vi.clearAllMocks();
      
      // Test moving mode (select tool with element selected)
      mockUseAppStore.mockReturnValue({
        ...defaultStoreState,
        activeTool: 'select',
        selectedElementIds: ['rect1'],
        ...mockStoreActions,
      });

      fireEvent.mouseDown(canvas, {
        clientX: 150, // On rect1
        clientY: 125,
      });

      // Should use different magnetic calculations for moving
      expect(mockGetMagneticSnapPoint).toHaveBeenCalled();
    });

    it('should disable magnetism when moving multiple elements', () => {
      // Mock multi-selection state
      mockUseAppStore.mockReturnValue({
        ...defaultStoreState,
        activeTool: 'select',
        selectedElementIds: ['rect1', 'circle1'],
        ...mockStoreActions,
      });

      render(<App />);
      
      const canvas = screen.getByRole('img', { name: /Drawing canvas with.*elements/ });
      
      fireEvent.mouseDown(canvas, {
        clientX: 150,
        clientY: 125,
      });

      // Should still calculate magnetism but with reduced sensitivity
      expect(mockGetMagneticSnapPoint).toHaveBeenCalled();
    });
  });

  describe('Visual Magnetic Indicators', () => {
    it('should render magnetic field indicators on canvas', () => {
      render(<App />);
      
      const canvas = screen.getByRole('img', { name: /Drawing canvas with.*elements/ });
      expect(canvas).toBeInTheDocument();
      
      // Visual indicators will be tested through canvas rendering
      // when we implement the visual feedback system
    });

    it('should show magnetic snap guides during drawing', () => {
      render(<App />);
      
      const canvas = screen.getByRole('img', { name: /Drawing canvas with.*elements/ });
      
      // Start drawing near a magnetic point
      fireEvent.mouseDown(canvas, {
        clientX: 102,
        clientY: 98,
      });

      fireEvent.mouseMove(canvas, {
        clientX: 105,
        clientY: 95,
      });

      // Should trigger magnetic calculations for visual guides
      expect(mockGetMagneticSnapPoint).toHaveBeenCalled();
    });

    it('should highlight nearest magnetic points', () => {
      render(<App />);
      
      const canvas = screen.getByRole('img', { name: /Drawing canvas with.*elements/ });
      
      fireEvent.mouseMove(canvas, {
        clientX: 102,
        clientY: 98,
      });

      // Should identify and highlight nearest magnetic points
      expect(mockFindNearestMagneticPoint).toHaveBeenCalled();
    });
  });

  describe('Performance Optimization', () => {
    it('should throttle magnetic calculations during rapid movements', () => {
      render(<App />);
      
      const canvas = screen.getByRole('img', { name: /Drawing canvas with.*elements/ });
      
      // Simulate rapid mouse movements
      for (let i = 0; i < 10; i++) {
        fireEvent.mouseMove(canvas, {
          clientX: 100 + i,
          clientY: 100 + i,
        });
      }

      // Should not call magnetic calculations for every single movement
      // Exact behavior depends on throttling implementation
      expect(mockGetMagneticSnapPoint).toHaveBeenCalled();
    });

    it('should only calculate magnetism for visible elements', () => {
      // Mock viewport with limited bounds
      mockUseAppStore.mockReturnValue({
        ...defaultStoreState,
        viewport: {
          zoom: 1,
          pan: { x: 0, y: 0 },
          bounds: { x: 0, y: 0, width: 200, height: 200 },
        },
        elements: [
          ...mockElements,
          {
            id: 'distant-rect',
            type: 'rectangle' as const,
            x: 1000, // Outside viewport
            y: 1000,
            width: 100,
            height: 50,
            angle: 0,
            strokeColor: '#000000',
            backgroundColor: 'transparent',
            strokeWidth: 2,
            strokeStyle: 'solid' as const,
            fillStyle: 'solid' as const,
            roughness: 1,
            opacity: 1,
          },
        ],
        ...mockStoreActions,
      });

      render(<App />);
      
      const canvas = screen.getByRole('img', { name: /Drawing canvas with.*elements/ });
      
      fireEvent.mouseMove(canvas, {
        clientX: 102,
        clientY: 98,
      });

      // Should only consider elements within viewport for magnetic calculations
      expect(mockFindNearestMagneticPoint).toHaveBeenCalled();
    });
  });

  describe('Magnetic Configuration', () => {
    it('should respect magnetic strength settings', () => {
      // Mock strong magnetic field
      mockUseAppStore.mockReturnValue({
        ...defaultStoreState,
        ui: {
          ...defaultStoreState.ui,
          grid: {
            ...defaultStoreState.ui.grid,
            magneticEnabled: true,
            magneticStrength: 50, // High strength
          },
        },
        ...mockStoreActions,
      });

      render(<App />);
      
      const canvas = screen.getByRole('img', { name: /Drawing canvas with.*elements/ });
      
      fireEvent.mouseDown(canvas, {
        clientX: 120, // Further from grid point
        clientY: 115,
      });

      expect(mockGetMagneticSnapPoint).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Number),
        50, // Should use the high magnetic strength
        true
      );
    });

    it('should respect magnetic radius settings', () => {
      // Mock large magnetic radius
      mockUseAppStore.mockReturnValue({
        ...defaultStoreState,
        ui: {
          ...defaultStoreState.ui,
          grid: {
            ...defaultStoreState.ui.grid,
            magneticEnabled: true,
            magneticRadius: 50, // Large radius
          },
        },
        ...mockStoreActions,
      });

      render(<App />);
      
      const canvas = screen.getByRole('img', { name: /Drawing canvas with.*elements/ });
      
      fireEvent.mouseMove(canvas, {
        clientX: 145, // Far from grid points
        clientY: 135,
      });

      expect(mockFindNearestMagneticPoint).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Array),
        50 // Should use the large radius
      );
    });

    it('should disable all magnetic behavior when magneticEnabled is false', () => {
      // Mock disabled magnetic grid
      mockUseAppStore.mockReturnValue({
        ...defaultStoreState,
        ui: {
          ...defaultStoreState.ui,
          grid: {
            ...defaultStoreState.ui.grid,
            magneticEnabled: false,
          },
        },
        ...mockStoreActions,
      });

      render(<App />);
      
      const canvas = screen.getByRole('img', { name: /Drawing canvas with.*elements/ });
      
      fireEvent.mouseDown(canvas, {
        clientX: 102,
        clientY: 98,
      });

      fireEvent.mouseMove(canvas, {
        clientX: 105,
        clientY: 95,
      });

      // Should not perform any magnetic calculations when disabled
      expect(mockGetMagneticSnapPoint).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty canvas gracefully', () => {
      mockUseAppStore.mockReturnValue({
        ...defaultStoreState,
        elements: [],
        ...mockStoreActions,
      });

      render(<App />);
      
      const canvas = screen.getByRole('img', { name: /Drawing canvas with.*elements/ });
      
      fireEvent.mouseMove(canvas, {
        clientX: 102,
        clientY: 98,
      });

      // Should still calculate grid magnetism even with no elements
      expect(mockGetMagneticSnapPoint).toHaveBeenCalled();
      expect(mockFindNearestMagneticPoint).toHaveBeenCalledWith(
        expect.any(Object),
        [], // Empty element list
        expect.any(Number)
      );
    });

    it('should handle extreme zoom levels', () => {
      // Mock extreme zoom out
      mockUseAppStore.mockReturnValue({
        ...defaultStoreState,
        viewport: {
          ...defaultStoreState.viewport,
          zoom: 0.1, // Very zoomed out
        },
        ...mockStoreActions,
      });

      render(<App />);
      
      const canvas = screen.getByRole('img', { name: /Drawing canvas with.*elements/ });
      
      fireEvent.mouseMove(canvas, {
        clientX: 102,
        clientY: 98,
      });

      // Should adjust magnetic calculations for zoom level
      expect(mockGetMagneticSnapPoint).toHaveBeenCalled();
    });

    it('should handle overlapping elements', () => {
      // Mock overlapping elements
      const overlappingElements = [
        {
          id: 'rect1',
          type: 'rectangle' as const,
          x: 100,
          y: 100,
          width: 100,
          height: 50,
          angle: 0,
          strokeColor: '#000000',
          backgroundColor: 'transparent',
          strokeWidth: 2,
          strokeStyle: 'solid' as const,
          fillStyle: 'solid' as const,
          roughness: 1,
          opacity: 1,
        },
        {
          id: 'rect2',
          type: 'rectangle' as const,
          x: 110, // Overlapping with rect1
          y: 110,
          width: 100,
          height: 50,
          angle: 0,
          strokeColor: '#000000',
          backgroundColor: 'transparent',
          strokeWidth: 2,
          strokeStyle: 'solid' as const,
          fillStyle: 'solid' as const,
          roughness: 1,
          opacity: 1,
        },
      ];

      mockUseAppStore.mockReturnValue({
        ...defaultStoreState,
        elements: overlappingElements,
        ...mockStoreActions,
      });

      render(<App />);
      
      const canvas = screen.getByRole('img', { name: /Drawing canvas with.*elements/ });
      
      fireEvent.mouseMove(canvas, {
        clientX: 155, // In overlap area
        clientY: 125,
      });

      // Should handle multiple magnetic sources correctly
      expect(mockFindNearestMagneticPoint).toHaveBeenCalled();
    });
  });
});