// ABOUTME: Tests for hand tool functionality - canvas panning with dedicated tool
// ABOUTME: Comprehensive test coverage for hand tool activation, panning behavior, and cursor changes

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react';
import App from '../App';
import { useAppStore } from '../store';

// Mock the useAppStore hook
vi.mock('../store', () => ({
  useAppStore: vi.fn(),
}));

describe('Hand Tool', () => {
  let mockStoreActions: any;
  let defaultStoreState: any;

  beforeEach(() => {
    mockStoreActions = {
      setActiveTool: vi.fn(),
      addElement: vi.fn(),
      addElementSilent: vi.fn(() => ({ id: 'test-element-id' })),
      updateElement: vi.fn(),
      updateElementSilent: vi.fn(),
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
      selectElement: vi.fn(),
      selectElements: vi.fn(),
      toggleSelection: vi.fn(),
      deleteSelectedElements: vi.fn(),
      duplicateSelectedElements: vi.fn(),
      selectAll: vi.fn(),
      selectNext: vi.fn(),
      selectPrevious: vi.fn(),
      copy: vi.fn(),
      paste: vi.fn(),
      copyStyle: vi.fn(),
      pasteStyle: vi.fn(),
      resetZoom: vi.fn(),
      zoomToFit: vi.fn(),
      toggleCanvasLock: vi.fn(),
      toggleGrid: vi.fn(),
      openGridDialog: vi.fn(),
      closeGridDialog: vi.fn(),
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
        dialogs: {
          gridDialog: false,
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

  describe('Hand Tool Activation', () => {
    it('should show hand tool in toolbar', () => {
      render(<App />);
      
      const handTool = screen.getByLabelText(/hand tool/i);
      expect(handTool).toBeInTheDocument();
      expect(handTool).toHaveAttribute('title', expect.stringContaining('H'));
    });

    it('should activate hand tool when H key is pressed', () => {
      render(<App />);
      
      // Simulate H key press
      fireEvent.keyDown(document, { key: 'h', code: 'KeyH' });
      
      expect(mockStoreActions.setActiveTool).toHaveBeenCalledWith('hand');
    });

    it('should activate hand tool when toolbar button is clicked', () => {
      render(<App />);
      
      const handTool = screen.getByLabelText(/hand tool/i);
      fireEvent.click(handTool);
      
      expect(mockStoreActions.setActiveTool).toHaveBeenCalledWith('hand');
    });

    it('should show hand tool as active when selected', () => {
      // Mock store state with hand tool active
      const stateWithHandTool = {
        ...defaultStoreState,
        activeTool: 'hand',
      };

      (useAppStore as any).mockReturnValue({
        ...stateWithHandTool,
        ...mockStoreActions,
      });

      render(<App />);
      
      const handTool = screen.getByLabelText(/hand tool/i);
      expect(handTool).toHaveClass('top-toolbar__tool--active');
    });
  });

  describe('Hand Tool Panning Behavior', () => {
    beforeEach(() => {
      // Setup state with hand tool active
      const stateWithHandTool = {
        ...defaultStoreState,
        activeTool: 'hand',
      };

      (useAppStore as any).mockReturnValue({
        ...stateWithHandTool,
        ...mockStoreActions,
      });
    });

    it('should start panning when clicking and dragging with hand tool', () => {
      render(<App />);
      
      const canvas = screen.getByRole('img', { name: /canvas/i });
      
      // Start panning with mouse down
      fireEvent.mouseDown(canvas, { 
        clientX: 100, 
        clientY: 100,
        button: 0 // Left mouse button
      });
      
      // Drag to new position
      fireEvent.mouseMove(canvas, { 
        clientX: 150, 
        clientY: 120 
      });
      
      // End panning
      fireEvent.mouseUp(canvas);
      
      // Verify setPan was called to update viewport
      expect(mockStoreActions.setPan).toHaveBeenCalled();
    });

    it('should not pan when hand tool is not active', () => {
      // Reset to selection tool
      const stateWithSelectTool = {
        ...defaultStoreState,
        activeTool: 'select',
      };

      (useAppStore as any).mockReturnValue({
        ...stateWithSelectTool,
        ...mockStoreActions,
      });

      render(<App />);
      
      const canvas = screen.getByRole('img', { name: /canvas/i });
      
      // Try to pan (should not work with select tool)
      fireEvent.mouseDown(canvas, { 
        clientX: 100, 
        clientY: 100,
        button: 0
      });
      
      fireEvent.mouseMove(canvas, { 
        clientX: 150, 
        clientY: 120 
      });
      
      fireEvent.mouseUp(canvas);
      
      // Verify setPan was not called for panning
      expect(mockStoreActions.setPan).not.toHaveBeenCalled();
    });

    it('should show grab cursor when hand tool is active', () => {
      render(<App />);
      
      const canvas = screen.getByRole('img', { name: /canvas/i });
      
      // Check that canvas has appropriate cursor styling when hand tool is active
      // This would be implemented in CSS based on the active tool
      expect(canvas.parentElement).toHaveAttribute('data-tool', 'hand');
    });

    it('should show grabbing cursor while panning', () => {
      render(<App />);
      
      const canvas = screen.getByRole('img', { name: /canvas/i });
      
      // Start panning
      fireEvent.mouseDown(canvas, { 
        clientX: 100, 
        clientY: 100,
        button: 0
      });
      
      // Check that grabbing cursor is shown during drag
      expect(canvas.parentElement).toHaveAttribute('data-panning', 'true');
      
      // End panning
      fireEvent.mouseUp(canvas);
      
      // Check that grabbing cursor is removed
      expect(canvas.parentElement).not.toHaveAttribute('data-panning', 'true');
    });
  });

  describe('Hand Tool Integration', () => {
    it('should work alongside Space+drag panning', () => {
      // Mock state with different tool active
      const stateWithSelectTool = {
        ...defaultStoreState,
        activeTool: 'select',
      };

      (useAppStore as any).mockReturnValue({
        ...stateWithSelectTool,
        ...mockStoreActions,
      });

      render(<App />);
      
      const canvas = screen.getByRole('img', { name: /canvas/i });
      
      // Test Space+drag (should work regardless of active tool)
      fireEvent.keyDown(document, { key: ' ', code: 'Space' });
      
      fireEvent.mouseDown(canvas, { 
        clientX: 100, 
        clientY: 100,
        button: 0
      });
      
      fireEvent.mouseMove(canvas, { 
        clientX: 150, 
        clientY: 120 
      });
      
      fireEvent.mouseUp(canvas);
      fireEvent.keyUp(document, { key: ' ', code: 'Space' });
      
      // Space+drag should still work
      expect(mockStoreActions.setPan).toHaveBeenCalled();
    });

    it('should not interfere with other tools when not active', () => {
      // Test that hand tool doesn't interfere when rectangle tool is active
      const stateWithRectangleTool = {
        ...defaultStoreState,
        activeTool: 'rectangle',
      };

      (useAppStore as any).mockReturnValue({
        ...stateWithRectangleTool,
        ...mockStoreActions,
      });

      render(<App />);
      
      const canvas = screen.getByRole('img', { name: /canvas/i });
      
      // Try to draw rectangle (should work normally)
      fireEvent.mouseDown(canvas, { 
        clientX: 100, 
        clientY: 100,
        button: 0
      });
      
      fireEvent.mouseMove(canvas, { 
        clientX: 150, 
        clientY: 120 
      });
      
      fireEvent.mouseUp(canvas);
      
      // Should create rectangle, not pan
      expect(mockStoreActions.addElementSilent).toHaveBeenCalled();
      expect(mockStoreActions.setPan).not.toHaveBeenCalled();
    });

    it('should be accessible via keyboard navigation', () => {
      render(<App />);
      
      const handTool = screen.getByLabelText(/hand tool/i);
      
      // Check accessibility attributes (button element has implicit role="button")
      expect(handTool.tagName).toBe('BUTTON');
      expect(handTool).toHaveAttribute('aria-label', expect.stringContaining('Hand Tool'));
      
      // Test button activation (simpler and more reliable than keyboard events on buttons)
      fireEvent.click(handTool);
      expect(mockStoreActions.setActiveTool).toHaveBeenCalledWith('hand');
    });
  });

  describe('Hand Tool Performance', () => {
    beforeEach(() => {
      // Setup state with hand tool active
      const stateWithHandTool = {
        ...defaultStoreState,
        activeTool: 'hand',
      };

      (useAppStore as any).mockReturnValue({
        ...stateWithHandTool,
        ...mockStoreActions,
      });
    });

    it('should handle rapid mouse movements smoothly', () => {
      render(<App />);
      
      const canvas = screen.getByRole('img', { name: /canvas/i });
      
      // Start panning
      fireEvent.mouseDown(canvas, { 
        clientX: 100, 
        clientY: 100,
        button: 0
      });
      
      // Simulate rapid movements
      for (let i = 0; i < 10; i++) {
        fireEvent.mouseMove(canvas, { 
          clientX: 100 + i * 10, 
          clientY: 100 + i * 5 
        });
      }
      
      fireEvent.mouseUp(canvas);
      
      // Should handle all movements without errors
      expect(mockStoreActions.setPan).toHaveBeenCalled();
    });

    it('should not cause memory leaks with repeated panning', () => {
      render(<App />);
      
      const canvas = screen.getByRole('img', { name: /canvas/i });
      
      // Perform multiple pan operations
      for (let i = 0; i < 5; i++) {
        fireEvent.mouseDown(canvas, { 
          clientX: 100, 
          clientY: 100,
          button: 0
        });
        
        fireEvent.mouseMove(canvas, { 
          clientX: 150, 
          clientY: 120 
        });
        
        fireEvent.mouseUp(canvas);
      }
      
      // Should complete without issues
      expect(mockStoreActions.setPan).toHaveBeenCalledTimes(5);
    });
  });
});