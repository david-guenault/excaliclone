// ABOUTME: Main application component that renders the Excalibox drawing interface
// ABOUTME: Orchestrates the Canvas, Toolbar, and manages global application state

import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Canvas } from './components/Canvas';
import { TopToolbar } from './components/TopToolbar';
import { PropertiesPanel } from './components/PropertiesPanel';
import { ZoomControl } from './components/ZoomControl';
import { GridDialog } from './components/GridDialog';
import { SaveIndicator } from './components/SaveIndicator';
import { SnapGuides } from './components/SnapGuides';
import { LockIndicators } from './components/LockIndicators';
import { useAppStore } from './store';
import { keyboardManager } from './utils/keyboard';
import { LINE_CONFIG, ARROW_CONFIG, DEFAULT_ARROWHEADS } from './constants';
import { snapPointToGridWithDistance } from './utils/grid';
import { findResizeHandle, applyResize, applyRotation, getResizeCursor } from './utils/resizeHandles';
import { 
  getMultiSelectionBounds, 
  findMultiSelectionHandle, 
  applyMultiSelectionResize,
  applyGroupResize,
  applyGroupRotation,
  isPointInRotatedElement
} from './utils/multiSelection';
import { setSavingCallback } from './utils/autoSave';
import { snapElementPosition, generateDebugSnapGuides } from './utils/snapToObjects';
import type { Point, ResizeHandleType, Element } from './types';
import type { SnapGuide } from './utils/snapToObjects';
import './App.css';

function App() {
  const { 
    viewport, 
    elements, 
    addElementSilent,
    updateElementSilent,
    activeTool, 
    toolOptions,
    ui,
    selectedElementIds,
    setActiveTool,
    selectElement,
    selectElements,
    toggleSelection,
    clearSelection,
    undo,
    redo,
    deleteSelectedElements,
    duplicateSelectedElements,
    bringSelectedForward,
    sendSelectedBackward,
    bringSelectedToFront,
    sendSelectedToBack,
    groupSelectedElements,
    ungroupSelectedElements,
    getElementGroup,
    getGroupElements,
    lockSelectedElements,
    unlockSelectedElements,
    unlockAllElements,
    alignLeft,
    alignCenter,
    alignRight,
    alignTop,
    alignMiddle,
    alignBottom,
    selectAll,
    selectNext,
    selectPrevious,
    selectByType,
    selectSimilar,
    selectAbove,
    selectBelow,
    copy,
    cut,
    paste,
    copyStyle,
    pasteStyle,
    resetZoom,
    zoomToFit,
    setZoom,
    setPan,
    saveToHistory,
    textEditing,
    startTextEditing,
    updateTextContent,
    updateTextSelection,
    finishTextEditing,
    toggleGrid,
    closeGridDialog,
    isSaving,
    setSaving
  } = useAppStore();
  
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Point | null>(null);
  const panStartViewport = useRef<Point | null>(null);
  
  // Line drawing state
  const [isDrawingLine, setIsDrawingLine] = useState(false);
  const [lineStart, setLineStart] = useState<Point | null>(null);
  const [currentLineId, setCurrentLineId] = useState<string | null>(null);
  
  // Arrow drawing state  
  const [isDrawingArrow, setIsDrawingArrow] = useState(false);
  const [arrowStart, setArrowStart] = useState<Point | null>(null);
  const [currentArrowId, setCurrentArrowId] = useState<string | null>(null);
  
  // Rectangle drawing state
  const [isDrawingRectangle, setIsDrawingRectangle] = useState(false);
  const [rectangleStart, setRectangleStart] = useState<Point | null>(null);
  const [currentRectangleId, setCurrentRectangleId] = useState<string | null>(null);
  
  // Circle drawing state
  const [isDrawingCircle, setIsDrawingCircle] = useState(false);
  const [circleStart, setCircleStart] = useState<Point | null>(null);
  const [currentCircleId, setCurrentCircleId] = useState<string | null>(null);
  
  // Diamond drawing state
  const [isDrawingDiamond, setIsDrawingDiamond] = useState(false);
  const [diamondStart, setDiamondStart] = useState<Point | null>(null);
  const [currentDiamondId, setCurrentDiamondId] = useState<string | null>(null);
  
  
  // Drag selection state
  const [isDragSelecting, setIsDragSelecting] = useState(false);
  const [dragSelectionStart, setDragSelectionStart] = useState<Point | null>(null);
  const [dragSelectionEnd, setDragSelectionEnd] = useState<Point | null>(null);
  const [dragSelectionShiftKey, setDragSelectionShiftKey] = useState(false);
  
  // Element dragging state
  const [isDraggingElements, setIsDraggingElements] = useState(false);
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [dragStartPositions, setDragStartPositions] = useState<Map<string, Point>>(new Map());
  
  // Snap guides state
  const [snapGuides, setSnapGuides] = useState<SnapGuide[]>([]);
  
  // Pen drawing state
  const [isDrawingPen, setIsDrawingPen] = useState(false);
  const [currentPenId, setCurrentPenId] = useState<string | null>(null);
  const [penPoints, setPenPoints] = useState<Point[]>([]);
  
  // Element resizing and rotation state
  const [isResizing, setIsResizing] = useState(false);
  const [resizeElementId, setResizeElementId] = useState<string | null>(null);
  const [resizeHandle, setResizeHandle] = useState<ResizeHandleType | null>(null);
  const [resizeStartPoint, setResizeStartPoint] = useState<Point | null>(null);
  const [resizeStartBounds, setResizeStartBounds] = useState<{x: number, y: number, width: number, height: number} | null>(null);
  
  const [isRotating, setIsRotating] = useState(false);
  const [rotationElementId, setRotationElementId] = useState<string | null>(null);

  // Multi-selection group operations state
  const [isGroupResizing, setIsGroupResizing] = useState(false);
  const [isGroupRotating, setIsGroupRotating] = useState(false);
  const [groupResizeHandle, setGroupResizeHandle] = useState<string | null>(null);
  const [groupResizeStartPoint, setGroupResizeStartPoint] = useState<Point | null>(null);
  const [groupResizeStartBounds, setGroupResizeStartBounds] = useState<{x: number, y: number, width: number, height: number, center: Point} | null>(null);
  const [groupResizeStartElements, setGroupResizeStartElements] = useState<Element[]>([]);
  const [groupRotationCenter, setGroupRotationCenter] = useState<Point | null>(null);
  const [groupRotationStartAngle, setGroupRotationStartAngle] = useState<number>(0);
  const [groupRotationStartElements, setGroupRotationStartElements] = useState<Element[]>([]);
  
  // Get text editing actions
  const { toggleCursor } = useAppStore();

  // Helper function to apply grid snapping
  const applySnapping = (point: Point): Point => {
    // Use regular grid snapping if enabled
    return ui.grid ? snapPointToGridWithDistance(point, ui.grid) : point;
  };
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Utility function for angle snapping
  const snapAngle = (startPoint: Point, endPoint: Point, enableSnap: boolean): Point => {
    if (!enableSnap) return endPoint;
    
    const dx = endPoint.x - startPoint.x;
    const dy = endPoint.y - startPoint.y;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    
    // Find the nearest snap angle (0, 45, 90, 135, 180, etc.)
    const snapAngle = Math.round(angle / LINE_CONFIG.ANGLE_SNAP_INCREMENTS) * LINE_CONFIG.ANGLE_SNAP_INCREMENTS;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    const snappedDx = Math.cos(snapAngle * (Math.PI / 180)) * length;
    const snappedDy = Math.sin(snapAngle * (Math.PI / 180)) * length;
    
    return {
      x: startPoint.x + snappedDx,
      y: startPoint.y + snappedDy,
    };
  };

  // Utility function to convert global mouse position to canvas coordinates
  const getCanvasPoint = (globalEvent: MouseEvent): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: globalEvent.clientX - rect.left,
      y: globalEvent.clientY - rect.top,
    };
  };

  // Global mouse handlers for line and arrow drawing only
  const handleGlobalMouseMove = (event: MouseEvent) => {
    // Handle line drawing
    if (isDrawingLine && lineStart && currentLineId) {
      handleLineDrawingMouseMove(event);
    }
    
    // Handle arrow drawing  
    if (isDrawingArrow && arrowStart && currentArrowId) {
      handleArrowDrawingMouseMove(event);
    }
    
    // NOTE: Rectangle and circle drawing use Canvas events exclusively
  };

  const handleLineDrawingMouseMove = (event: MouseEvent) => {
    const canvasPoint = getCanvasPoint(event);
    if (!canvasPoint) return;
    
    // Transform canvas coordinates to world coordinates
    const worldPoint = {
      x: canvasPoint.x / viewport.zoom + viewport.pan.x,
      y: canvasPoint.y / viewport.zoom + viewport.pan.y,
    };
    
    // Apply grid and magnetic snapping to end point
    const snappedPoint = applySnapping(worldPoint);
    
    // Update the line while drawing
    const modifiers = keyboardManager.getModifierState();
    const endPoint = snapAngle(lineStart!, snappedPoint, modifiers.shift);
    
    const { updateElementSilent } = useAppStore.getState();
    updateElementSilent(currentLineId!, {
      width: endPoint.x - lineStart!.x,
      height: endPoint.y - lineStart!.y,
    });
  };

  const handleArrowDrawingMouseMove = (event: MouseEvent) => {
    const canvasPoint = getCanvasPoint(event);
    if (!canvasPoint) return;
    
    // Transform canvas coordinates to world coordinates
    const worldPoint = {
      x: canvasPoint.x / viewport.zoom + viewport.pan.x,
      y: canvasPoint.y / viewport.zoom + viewport.pan.y,
    };
    
    // Apply grid and magnetic snapping to end point
    const snappedPoint = applySnapping(worldPoint);
    
    // Update the arrow while drawing
    const modifiers = keyboardManager.getModifierState();
    const endPoint = snapAngle(arrowStart!, snappedPoint, modifiers.shift);
    
    const { updateElementSilent } = useAppStore.getState();
    updateElementSilent(currentArrowId!, {
      width: endPoint.x - arrowStart!.x,
      height: endPoint.y - arrowStart!.y,
    });
  };

  // NOTE: Removed global rectangle and circle mouse move handlers
  // These tools now use Canvas events exclusively for better coordinate handling

  // New Canvas-based handlers for better coordinate handling
  const handleRectangleDrawingCanvasMove = (point: Point) => {
    // Apply grid and magnetic snapping to end point
    const snappedPoint = applySnapping(point);
    
    // Calculate rectangle dimensions
    const modifiers = keyboardManager.getModifierState();
    let width = snappedPoint.x - rectangleStart!.x;
    let height = snappedPoint.y - rectangleStart!.y;
    
    // Ignore tiny movements (less than 2 pixels)
    if (Math.abs(width) < 2 && Math.abs(height) < 2) {
      return;
    }
    
    // Constrain to square with Shift
    if (modifiers.shift) {
      const size = Math.max(Math.abs(width), Math.abs(height));
      width = width >= 0 ? size : -size;
      height = height >= 0 ? size : -size;
    }
    
    const finalUpdate = {
      width: Math.abs(width),
      height: Math.abs(height),
      x: width >= 0 ? rectangleStart!.x : rectangleStart!.x + width,
      y: height >= 0 ? rectangleStart!.y : rectangleStart!.y + height,
    };
    
    const { updateElementSilent } = useAppStore.getState();
    updateElementSilent(currentRectangleId!, finalUpdate);
  };

  const handleCircleDrawingCanvasMove = (point: Point) => {
    // Apply grid and magnetic snapping to end point
    const snappedPoint = applySnapping(point);
    
    // Calculate circle dimensions
    const modifiers = keyboardManager.getModifierState();
    let width = snappedPoint.x - circleStart!.x;
    let height = snappedPoint.y - circleStart!.y;
    
    // Ignore tiny movements (less than 2 pixels)
    if (Math.abs(width) < 2 && Math.abs(height) < 2) {
      return;
    }
    
    // Constrain to circle with Shift
    if (modifiers.shift) {
      const size = Math.max(Math.abs(width), Math.abs(height));
      width = width >= 0 ? size : -size;
      height = height >= 0 ? size : -size;
    }
    
    const finalUpdate = {
      width: Math.abs(width),
      height: Math.abs(height),
      x: width >= 0 ? circleStart!.x : circleStart!.x + width,
      y: height >= 0 ? circleStart!.y : circleStart!.y + height,
    };
    
    const { updateElementSilent } = useAppStore.getState();
    updateElementSilent(currentCircleId!, finalUpdate);
  };

  const handleRectangleDrawingCanvasUp = (point: Point) => {
    // Apply grid and magnetic snapping to final end point
    const snappedPoint = applySnapping(point);
    
    // Calculate final rectangle dimensions
    const modifiers = keyboardManager.getModifierState();
    let width = snappedPoint.x - rectangleStart!.x;
    let height = snappedPoint.y - rectangleStart!.y;
    
    // Constrain to square with Shift
    if (modifiers.shift) {
      const size = Math.max(Math.abs(width), Math.abs(height));
      width = width >= 0 ? size : -size;
      height = height >= 0 ? size : -size;
    }
    
    const finalWidth = Math.abs(width);
    const finalHeight = Math.abs(height);
    const minSize = 10; // Minimum rectangle size
    
    // If the rectangle is too small, remove it
    if (finalWidth < minSize || finalHeight < minSize) {
      const { deleteElement } = useAppStore.getState();
      deleteElement(currentRectangleId!);
    } else {
      // Update final position and size
      const { updateElement, selectElements } = useAppStore.getState();
      updateElement(currentRectangleId!, {
        width: finalWidth,
        height: finalHeight,
        x: width >= 0 ? rectangleStart!.x : rectangleStart!.x + width,
        y: height >= 0 ? rectangleStart!.y : rectangleStart!.y + height,
      });
      
      // Auto-select the created rectangle
      selectElements([currentRectangleId!]);
      
      // Auto-activate selection tool for immediate manipulation
      setActiveTool('select');
    }
    
    // Reset rectangle drawing state
    setIsDrawingRectangle(false);
    setRectangleStart(null);
    setCurrentRectangleId(null);
  };

  const handleCircleDrawingCanvasUp = (point: Point) => {
    // Apply grid and magnetic snapping to final end point
    const snappedPoint = applySnapping(point);
    
    // Calculate final circle dimensions
    const modifiers = keyboardManager.getModifierState();
    let width = snappedPoint.x - circleStart!.x;
    let height = snappedPoint.y - circleStart!.y;
    
    // Constrain to circle with Shift
    if (modifiers.shift) {
      const size = Math.max(Math.abs(width), Math.abs(height));
      width = width >= 0 ? size : -size;
      height = height >= 0 ? size : -size;
    }
    
    const finalWidth = Math.abs(width);
    const finalHeight = Math.abs(height);
    const minSize = 10; // Minimum circle size
    
    // If the circle is too small, remove it
    if (finalWidth < minSize || finalHeight < minSize) {
      const { deleteElement } = useAppStore.getState();
      deleteElement(currentCircleId!);
    } else {
      // Update final position and size
      const { updateElement, selectElements } = useAppStore.getState();
      updateElement(currentCircleId!, {
        width: finalWidth,
        height: finalHeight,
        x: width >= 0 ? circleStart!.x : circleStart!.x + width,
        y: height >= 0 ? circleStart!.y : circleStart!.y + height,
      });
      
      // Auto-select the created circle
      selectElements([currentCircleId!]);
      
      // Auto-activate selection tool for immediate manipulation
      setActiveTool('select');
    }
    
    // Reset circle drawing state
    setIsDrawingCircle(false);
    setCircleStart(null);
    setCurrentCircleId(null);
  };

  const handleDiamondDrawingCanvasMove = (point: Point) => {
    // Apply grid and magnetic snapping to end point
    const snappedPoint = applySnapping(point);
    
    // Calculate diamond dimensions
    const modifiers = keyboardManager.getModifierState();
    let width = snappedPoint.x - diamondStart!.x;
    let height = snappedPoint.y - diamondStart!.y;
    
    // Ignore tiny movements (less than 2 pixels)
    if (Math.abs(width) < 2 && Math.abs(height) < 2) {
      return;
    }
    
    // Constrain to square with Shift
    if (modifiers.shift) {
      const size = Math.max(Math.abs(width), Math.abs(height));
      width = width >= 0 ? size : -size;
      height = height >= 0 ? size : -size;
    }
    
    const finalUpdate = {
      width: Math.abs(width),
      height: Math.abs(height),
      x: width >= 0 ? diamondStart!.x : diamondStart!.x + width,
      y: height >= 0 ? diamondStart!.y : diamondStart!.y + height,
    };
    
    const { updateElementSilent } = useAppStore.getState();
    updateElementSilent(currentDiamondId!, finalUpdate);
  };

  const handleDiamondDrawingCanvasUp = (point: Point) => {
    // Apply grid and magnetic snapping to final end point
    const snappedPoint = applySnapping(point);
    
    // Calculate final diamond dimensions
    const modifiers = keyboardManager.getModifierState();
    let width = snappedPoint.x - diamondStart!.x;
    let height = snappedPoint.y - diamondStart!.y;
    
    // Constrain to square with Shift
    if (modifiers.shift) {
      const size = Math.max(Math.abs(width), Math.abs(height));
      width = width >= 0 ? size : -size;
      height = height >= 0 ? size : -size;
    }
    
    const finalWidth = Math.abs(width);
    const finalHeight = Math.abs(height);
    const minSize = 10; // Minimum diamond size
    
    // If the diamond is too small, remove it
    if (finalWidth < minSize || finalHeight < minSize) {
      const { deleteElement } = useAppStore.getState();
      deleteElement(currentDiamondId!);
    } else {
      // Update final position and size
      const { updateElement, selectElements } = useAppStore.getState();
      updateElement(currentDiamondId!, {
        width: finalWidth,
        height: finalHeight,
        x: width >= 0 ? diamondStart!.x : diamondStart!.x + width,
        y: height >= 0 ? diamondStart!.y : diamondStart!.y + height,
      });
      
      // Auto-select the created diamond
      selectElements([currentDiamondId!]);
      
      // Auto-activate selection tool for immediate manipulation
      setActiveTool('select');
      
      // Save to history for undo/redo
      saveToHistory();
    }
    
    // Reset diamond drawing state
    setIsDrawingDiamond(false);
    setDiamondStart(null);
    setCurrentDiamondId(null);
  };


  const handleGlobalMouseUp = (event: MouseEvent) => {
    // Handle line drawing completion
    if (isDrawingLine && lineStart && currentLineId) {
      handleLineDrawingMouseUp(event);
    }
    
    // Handle arrow drawing completion
    if (isDrawingArrow && arrowStart && currentArrowId) {
      handleArrowDrawingMouseUp(event);
    }
    
    // NOTE: Rectangle and circle drawing use Canvas events exclusively
  };

  const handleLineDrawingMouseUp = (event: MouseEvent) => {
    const point = getCanvasPoint(event);
    if (!point) return;
    
    // Apply grid and magnetic snapping to final end point
    const snappedPoint = applySnapping(point);
    
    // Finalize the line
    const modifiers = keyboardManager.getModifierState();
    const endPoint = snapAngle(lineStart!, snappedPoint, modifiers.shift);
    
    const deltaX = endPoint.x - lineStart!.x;
    const deltaY = endPoint.y - lineStart!.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // If the line is too short, remove it
    if (distance < LINE_CONFIG.MIN_DRAG_DISTANCE) {
      const { deleteElement } = useAppStore.getState();
      deleteElement(currentLineId!);
    } else {
      // Update final position
      const { updateElement, selectElements } = useAppStore.getState();
      updateElement(currentLineId!, {
        width: deltaX,
        height: deltaY,
      });
      
      // Auto-select the created line
      selectElements([currentLineId!]);
      
      // Auto-activate selection tool for immediate manipulation
      setActiveTool('select');
    }
    
    // Reset line drawing state
    setIsDrawingLine(false);
    setLineStart(null);
    setCurrentLineId(null);
    
    // Remove global event listeners if no other drawing is active
    if (!isDrawingArrow && !isDrawingRectangle && !isDrawingCircle && !isDrawingDiamond) {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    }
  };

  const handleArrowDrawingMouseUp = (event: MouseEvent) => {
    const point = getCanvasPoint(event);
    if (!point) return;
    
    // Apply grid and magnetic snapping to final end point
    const snappedPoint = applySnapping(point);
    
    // Finalize the arrow
    const modifiers = keyboardManager.getModifierState();
    const endPoint = snapAngle(arrowStart!, snappedPoint, modifiers.shift);
    
    const deltaX = endPoint.x - arrowStart!.x;
    const deltaY = endPoint.y - arrowStart!.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // If the arrow is too short, remove it
    if (distance < ARROW_CONFIG.MIN_DRAG_DISTANCE) {
      const { deleteElement } = useAppStore.getState();
      deleteElement(currentArrowId!);
    } else {
      // Update final position
      const { updateElement, selectElements } = useAppStore.getState();
      updateElement(currentArrowId!, {
        width: deltaX,
        height: deltaY,
      });
      
      // Auto-select the created arrow
      selectElements([currentArrowId!]);
      
      // Auto-activate selection tool for immediate manipulation
      setActiveTool('select');
    }
    
    // Reset arrow drawing state
    setIsDrawingArrow(false);
    setArrowStart(null);
    setCurrentArrowId(null);
    
    // Remove global event listeners if no other drawing is active
    if (!isDrawingLine && !isDrawingRectangle && !isDrawingCircle && !isDrawingDiamond) {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    }
  };

  // NOTE: Removed global rectangle and circle mouse up handlers
  // These tools now use Canvas events exclusively for better coordinate handling

  const completeDragSelection = (endPoint?: Point) => {
    const finalEndPoint = endPoint || dragSelectionEnd;
    if (!dragSelectionStart || !finalEndPoint) return;
    
    // Calculate selection rectangle bounds
    const selectionRect = {
      x: Math.min(dragSelectionStart.x, finalEndPoint.x),
      y: Math.min(dragSelectionStart.y, finalEndPoint.y),
      width: Math.abs(finalEndPoint.x - dragSelectionStart.x),
      height: Math.abs(finalEndPoint.y - dragSelectionStart.y),
    };
    
    // Find elements that intersect with the selection rectangle
    const newSelectedElementIds = elements
      .filter(element => {
        // Check if element intersects with selection rectangle
        const elementRight = element.x + element.width;
        const elementBottom = element.y + element.height;
        const selectionRight = selectionRect.x + selectionRect.width;
        const selectionBottom = selectionRect.y + selectionRect.height;
        
        const intersects = !(
          element.x > selectionRight ||
          elementRight < selectionRect.x ||
          element.y > selectionBottom ||
          elementBottom < selectionRect.y
        );
        
        return intersects;
      })
      .map(element => element.id);
    
    // Select the elements based on modifier keys
    if (dragSelectionShiftKey) {
      // Additive selection: add new elements to existing selection
      const combinedSelection = [...new Set([...selectedElementIds, ...newSelectedElementIds])];
      selectElements(combinedSelection);
    } else {
      // Replace selection
      if (newSelectedElementIds.length > 0) {
        selectElements(newSelectedElementIds);
      } else {
        clearSelection();
      }
    }
    
    // Reset drag selection state
    setIsDragSelecting(false);
    setDragSelectionShiftKey(false);
    setDragSelectionStart(null);
    setDragSelectionEnd(null);
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCanvasMouseDown = (point: Point, event: MouseEvent) => {
    // Transform canvas coordinates to world coordinates for proper hit testing
    // Inverse transformation of: scale(zoom, zoom) -> translate(-pan.x, -pan.y)
    const worldPoint = {
      x: (point.x / viewport.zoom) + viewport.pan.x,
      y: (point.y / viewport.zoom) + viewport.pan.y,
    };
    
    console.log('🖱️ Mouse down:', { activeTool, selectedElementIds, worldPoint });
    
    // Check for space+drag panning or hand tool panning
    if (keyboardManager.isSpacePressedNow() || activeTool === 'hand') {
      console.log('🤚 Starting pan mode');
      setIsPanning(true);
      setPanStart(point);
      panStartViewport.current = { ...viewport.pan };
      return;
    }
    
    // Check for element interaction first (selection, dragging, resizing) regardless of active tool
    // This ensures selected elements can always be moved, even if tool hasn't switched to select yet
    
    // Check for multi-selection group operations first
    if (selectedElementIds.length > 1) {
      const selectedElements = elements.filter(el => selectedElementIds.includes(el.id) && !el.locked);
      const multiSelectionBounds = getMultiSelectionBounds(selectedElements);
      
      if (multiSelectionBounds) {
        const groupHandle = findMultiSelectionHandle(worldPoint, multiSelectionBounds);
        if (groupHandle) {
          if (groupHandle === 'rotation') {
            // Start group rotation
            setIsGroupRotating(true);
            setGroupRotationCenter(multiSelectionBounds.center);
            
            // Store initial rotation angle and element states
            const initialAngle = Math.atan2(
              worldPoint.y - multiSelectionBounds.center.y,
              worldPoint.x - multiSelectionBounds.center.x
            );
            setGroupRotationStartAngle(initialAngle);
            setGroupRotationStartElements(selectedElements.slice());
            
            const canvas = event.target as HTMLElement;
            canvas.style.cursor = 'grabbing';
          } else {
            // Start group resize
            setIsGroupResizing(true);
            setGroupResizeHandle(groupHandle);
            setGroupResizeStartPoint(worldPoint);
            setGroupResizeStartBounds(multiSelectionBounds);
            // Save initial state of elements
            const selectedElements = elements.filter(el => selectedElementIds.includes(el.id) && !el.locked);
            setGroupResizeStartElements(selectedElements.slice());
          }
          return;
        }
      }
    }
    
    // Check if we're clicking on a resize handle of a selected element (ONLY for single selection)
    if (selectedElementIds.length === 1) {
      for (const elementId of selectedElementIds) {
        const element = elements.find(el => el.id === elementId);
        if (!element || element.locked) continue;
        
        const handle = findResizeHandle(worldPoint, element);
        if (handle) {
          if (handle === 'rotation') {
            // Start rotation operation
            setIsRotating(true);
            setRotationElementId(elementId);
            
            // Change cursor to grabbing for rotation
            const canvas = event.target as HTMLElement;
            canvas.style.cursor = 'grabbing';
          } else {
            // Start resize operation
            setIsResizing(true);
            setResizeElementId(elementId);
            setResizeHandle(handle);
            setResizeStartPoint(worldPoint);
            setResizeStartBounds({
              x: element.x,
              y: element.y,
              width: element.width,
              height: element.height,
            });
          }
          return;
        }
      }
    }
    
    // Use spatial index for optimized hit testing
    const { spatialHitTest } = useAppStore.getState();
    const clickedElement = spatialHitTest(worldPoint);
    
    if (clickedElement) {
      // Check for modifier keys
      const isShiftClick = event.shiftKey;
      const isSelectedElement = selectedElementIds.includes(clickedElement.id);
      
      if (isShiftClick) {
        // Shift+Click: Toggle element or group in selection
        const elementGroup = getElementGroup(clickedElement.id);
        if (elementGroup) {
          // Toggle all elements in the group
          const groupElements = getGroupElements(elementGroup.id);
          const allSelected = groupElements.every(el => selectedElementIds.includes(el.id));
          if (allSelected) {
            // Remove all group elements from selection
            groupElements.forEach(el => toggleSelection(el.id));
          } else {
            // Add all group elements to selection
            groupElements.forEach(el => {
              if (!selectedElementIds.includes(el.id)) {
                toggleSelection(el.id);
              }
            });
          }
        } else {
          // Single element toggle
          toggleSelection(clickedElement.id);
        }
        return;
      } else if (isSelectedElement) {
        // If clicking on a selected element without Shift, start dragging
        setIsDraggingElements(true);
        setDragStart(worldPoint); // Use world coordinates for consistent drag calculations
        
        // Store initial positions of all selected elements for history
        const initialPositions = new Map<string, Point>();
        selectedElementIds.forEach(elementId => {
          const element = elements.find(el => el.id === elementId);
          if (element) {
            initialPositions.set(elementId, { x: element.x, y: element.y });
          }
        });
        setDragStartPositions(initialPositions);
        return;
      } else {
        // Single element selection (replace current selection)
        const elementGroup = getElementGroup(clickedElement.id);
        if (elementGroup) {
          // Select all elements in the group
          const groupElements = getGroupElements(elementGroup.id);
          selectElements(groupElements.map(el => el.id));
        } else {
          // Single element selection
          selectElement(clickedElement.id);
        }
        
        // Start dragging immediately after selection
        setIsDraggingElements(true);
        setDragStart(worldPoint);
        
        // Store initial positions of all selected elements for history
        const initialPositions = new Map<string, Point>();
        const elementsToMove = elementGroup ? 
          getGroupElements(elementGroup.id) : 
          [clickedElement];
        
        elementsToMove.forEach(element => {
          initialPositions.set(element.id, { x: element.x, y: element.y });
        });
        setDragStartPositions(initialPositions);
        return;
      }
    }
    
    // If we get here and activeTool is 'select', start drag selection
    if (activeTool === 'select') {
      // Start drag selection on empty area
      const snappedPoint = applySnapping(worldPoint);
      setIsDragSelecting(true);
      setDragSelectionStart(snappedPoint);
      setDragSelectionEnd(snappedPoint);
      setDragSelectionShiftKey(event.shiftKey); // Capture Shift key state
      
      // Only clear selection if not holding Shift (allows additive drag selection)
      if (!event.shiftKey) {
        clearSelection();
      }
      return;
    }
    
    if (activeTool === 'rectangle') {
      // Apply grid and magnetic snapping to start point
      const snappedPoint = applySnapping(worldPoint);
      
      // Start rectangle drawing
      setIsDrawingRectangle(true);
      setRectangleStart(snappedPoint);
      
      // Create a temporary rectangle element with minimal size
      const createdElement = addElementSilent({
        type: 'rectangle',
        x: snappedPoint.x,
        y: snappedPoint.y,
        width: 1, // Start with minimal size
        height: 1,
        angle: 0,
        strokeColor: toolOptions.strokeColor,
        backgroundColor: toolOptions.backgroundColor,
        strokeWidth: toolOptions.strokeWidth,
        strokeStyle: toolOptions.strokeStyle,
        fillStyle: toolOptions.fillStyle,
        roughness: toolOptions.roughness,
        opacity: toolOptions.opacity,
        cornerStyle: toolOptions.cornerStyle,
        cornerRadius: toolOptions.cornerRadius,
      });
      
      setCurrentRectangleId(createdElement.id);
      
      // NOTE: Rectangle drawing uses Canvas events only - no global listeners needed
    } else if (activeTool === 'circle') {
      // Apply grid and magnetic snapping to start point
      const snappedPoint = applySnapping(worldPoint);
      
      // Start circle drawing
      setIsDrawingCircle(true);
      setCircleStart(snappedPoint);
      
      // Create a temporary circle element with minimal size
      const createdElement = addElementSilent({
        type: 'circle',
        x: snappedPoint.x,
        y: snappedPoint.y,
        width: 1, // Start with minimal size
        height: 1,
        angle: 0,
        strokeColor: toolOptions.strokeColor,
        backgroundColor: toolOptions.backgroundColor,
        strokeWidth: toolOptions.strokeWidth,
        strokeStyle: toolOptions.strokeStyle,
        fillStyle: toolOptions.fillStyle,
        roughness: toolOptions.roughness,
        opacity: toolOptions.opacity,
      });
      
      setCurrentCircleId(createdElement.id);
      
      // NOTE: Circle drawing uses Canvas events only - no global listeners needed
    } else if (activeTool === 'diamond') {
      // Apply grid and magnetic snapping to start point
      const snappedPoint = applySnapping(worldPoint);
      
      // Start diamond drawing
      setIsDrawingDiamond(true);
      setDiamondStart(snappedPoint);
      
      // Create a temporary diamond element with minimal size
      const createdElement = addElementSilent({
        type: 'diamond',
        x: snappedPoint.x,
        y: snappedPoint.y,
        width: 1, // Start with minimal size
        height: 1,
        angle: 0,
        strokeColor: toolOptions.strokeColor,
        backgroundColor: toolOptions.backgroundColor,
        strokeWidth: toolOptions.strokeWidth,
        strokeStyle: toolOptions.strokeStyle,
        fillStyle: toolOptions.fillStyle,
        roughness: toolOptions.roughness,
        opacity: toolOptions.opacity,
      });
      
      setCurrentDiamondId(createdElement.id);
      
      // NOTE: Diamond drawing uses Canvas events only - no global listeners needed
    } else if (activeTool === 'line') {
      // Apply grid and magnetic snapping to start point
      const snappedPoint = applySnapping(worldPoint);
      
      // Start line drawing
      setIsDrawingLine(true);
      setLineStart(snappedPoint);
      
      // Create a temporary line element
      const createdElement = addElementSilent({
        type: 'line',
        x: snappedPoint.x,
        y: snappedPoint.y,
        width: 0, // Will be updated in mouse move
        height: 0, // Will be updated in mouse move
        angle: 0,
        strokeColor: toolOptions.strokeColor,
        backgroundColor: 'transparent', // Lines don't use background
        strokeWidth: toolOptions.strokeWidth,
        strokeStyle: toolOptions.strokeStyle,
        fillStyle: 'solid', // Lines use solid fill by default
        roughness: toolOptions.roughness,
        opacity: toolOptions.opacity,
        endArrowhead: DEFAULT_ARROWHEADS.LINE_END, // No arrowhead at end by default for lines
        startArrowhead: DEFAULT_ARROWHEADS.LINE_START, // No arrowhead at start by default for lines
      });
      
      setCurrentLineId(createdElement.id);
      
      // Add global event listeners for line drawing
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    } else if (activeTool === 'arrow') {
      // Apply grid and magnetic snapping to start point
      const snappedPoint = applySnapping(worldPoint);
      
      // Start arrow drawing
      setIsDrawingArrow(true);
      setArrowStart(snappedPoint);
      
      // Create a temporary arrow element
      const createdElement = addElementSilent({
        type: 'arrow',
        x: snappedPoint.x,
        y: snappedPoint.y,
        width: 0, // Will be updated in mouse move
        height: 0, // Will be updated in mouse move
        angle: 0,
        strokeColor: toolOptions.strokeColor,
        backgroundColor: 'transparent', // Arrows don't use background
        strokeWidth: toolOptions.strokeWidth,
        strokeStyle: toolOptions.strokeStyle,
        fillStyle: 'solid', // Arrows use solid fill by default
        roughness: toolOptions.roughness,
        opacity: toolOptions.opacity,
        endArrowhead: DEFAULT_ARROWHEADS.ARROW_END, // Default triangle arrowhead at end
        startArrowhead: DEFAULT_ARROWHEADS.ARROW_START, // No arrowhead at start by default
      });
      
      setCurrentArrowId(createdElement.id);
      
      // Add global event listeners for arrow drawing
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    } else if (activeTool === 'pen') {
      const snappedPoint = applySnapping(worldPoint);
      setIsDrawingPen(true);
      setPenPoints([snappedPoint]);
      
      const createdElement = addElementSilent({
        type: 'pen',
        x: snappedPoint.x,
        y: snappedPoint.y,
        width: 1,
        height: 1,
        angle: 0,
        strokeColor: toolOptions.strokeColor,
        backgroundColor: toolOptions.backgroundColor,
        strokeWidth: toolOptions.strokeWidth,
        strokeStyle: toolOptions.strokeStyle,
        fillStyle: 'solid', // Pen strokes use solid fill by default
        roughness: toolOptions.roughness,
        opacity: toolOptions.opacity,
        points: [snappedPoint],
      });
      
      setCurrentPenId(createdElement.id);
    } else if (activeTool === 'text') {
      const snappedPoint = applySnapping(worldPoint);
      
      // Create a new text element and start editing it directly
      const createdElement = addElementSilent({
        type: 'text',
        x: snappedPoint.x,
        y: snappedPoint.y,
        width: 100, // Minimum width for text
        height: toolOptions.fontSize * 1.2, // Height based on font size
        angle: 0,
        strokeColor: toolOptions.strokeColor,
        backgroundColor: toolOptions.backgroundColor,
        strokeWidth: toolOptions.strokeWidth,
        strokeStyle: toolOptions.strokeStyle,
        fillStyle: toolOptions.fillStyle,
        roughness: toolOptions.roughness,
        opacity: toolOptions.opacity,
        text: '',
        fontFamily: toolOptions.fontFamily,
        fontSize: toolOptions.fontSize,
        fontWeight: toolOptions.fontWeight,
        fontStyle: toolOptions.fontStyle,
        textAlign: toolOptions.textAlign,
        textDecoration: toolOptions.textDecoration,
      });
      
      // Start direct text editing
      startTextEditing(createdElement.id, '', 0);
    } else if (activeTool === 'image') {
      // Handle image import
      handleImageImport(worldPoint);
    } else if (activeTool === 'eraser') {
      // Handle eraser tool - delete element on click
      handleEraserClick(worldPoint);
    }
  };

  // Handle eraser tool functionality
  const handleEraserClick = (worldPoint: Point) => {
    // Find the element to erase (front-to-back search like selection)
    const clickedElement = elements
      .filter(element => !element.locked) // Skip locked elements
      .slice() // Create a copy before reversing
      .reverse() // Search from front to back (newest to oldest)
      .find(element => {
        // Use the same hit testing logic as selection
        // Special hit testing for pen strokes
        if (element.type === 'pen' && element.points && element.points.length > 1) {
          const tolerance = Math.max(element.strokeWidth * 2, 8) / viewport.zoom;
          
          for (let i = 0; i < element.points.length - 1; i++) {
            const p1 = element.points[i];
            const p2 = element.points[i + 1];
            
            const A = worldPoint.x - p1.x;
            const B = worldPoint.y - p1.y;
            const C = p2.x - p1.x;
            const D = p2.y - p1.y;
            
            const dot = A * C + B * D;
            const lenSq = C * C + D * D;
            
            if (lenSq === 0) continue;
            
            let param = dot / lenSq;
            param = Math.max(0, Math.min(1, param));
            
            const closestX = p1.x + param * C;
            const closestY = p1.y + param * D;
            
            const distance = Math.sqrt(
              (worldPoint.x - closestX) * (worldPoint.x - closestX) + 
              (worldPoint.y - closestY) * (worldPoint.y - closestY)
            );
            
            if (distance <= tolerance) {
              return true;
            }
          }
          return false;
        }
        
        // Special hit testing for lines and arrows
        if (element.type === 'line' || element.type === 'arrow') {
          const tolerance = Math.max(element.strokeWidth * 2, 12) / viewport.zoom;
          
          const startX = element.x;
          const startY = element.y;
          const endX = element.x + element.width;
          const endY = element.y + element.height;
          
          const A = worldPoint.x - startX;
          const B = worldPoint.y - startY;
          const C = endX - startX;
          const D = endY - startY;
          
          const dot = A * C + B * D;
          const lenSq = C * C + D * D;
          
          if (lenSq === 0) return Math.sqrt(A * A + B * B) <= tolerance;
          
          let param = dot / lenSq;
          param = Math.max(0, Math.min(1, param));
          
          const closestX = startX + param * C;
          const closestY = startY + param * D;
          
          const distance = Math.sqrt(
            (worldPoint.x - closestX) * (worldPoint.x - closestX) + 
            (worldPoint.y - closestY) * (worldPoint.y - closestY)
          );
          
          return distance <= tolerance;
        }
        
        // Hit testing for rectangles, circles, text, and images
        // Use rotated hit testing that accounts for element angle
        if (!isPointInRotatedElement(worldPoint, element)) return false;
        
        // Special hit testing for circles - check if really inside the ellipse
        if (element.type === 'circle') {
          // For circles, we need additional check to ensure we're inside the ellipse
          // First check if we're in the bounding box (already done above)
          // Then check if we're actually inside the ellipse
          const centerX = element.x + element.width / 2;
          const centerY = element.y + element.height / 2;
          const radiusX = element.width / 2;
          const radiusY = element.height / 2;
          
          // If the element is rotated, we need to transform the point
          if (element.angle && element.angle !== 0) {
            // Transform click point to element's local coordinate system
            const cos = Math.cos(-element.angle);
            const sin = Math.sin(-element.angle);
            const dx = worldPoint.x - centerX;
            const dy = worldPoint.y - centerY;
            const localX = dx * cos - dy * sin;
            const localY = dx * sin + dy * cos;
            
            // Check if the local point is inside the ellipse
            return (localX / radiusX) * (localX / radiusX) + (localY / radiusY) * (localY / radiusY) <= 1;
          } else {
            // Non-rotated case
            const dx = (worldPoint.x - centerX) / radiusX;
            const dy = (worldPoint.y - centerY) / radiusY;
            return dx * dx + dy * dy <= 1;
          }
        }
        
        // For rectangles, text, and images, polygon test is sufficient
        return true;
      });
    
    if (clickedElement) {
      // Delete the clicked element
      const { deleteElement } = useAppStore.getState();
      deleteElement(clickedElement.id);
      
      // Save deletion to history
      saveToHistory();
      
      // Clear selection if the deleted element was selected
      if (selectedElementIds.includes(clickedElement.id)) {
        const newSelection = selectedElementIds.filter(id => id !== clickedElement.id);
        selectElements(newSelection);
      }
    }
  };

  // Handle image import functionality
  const handleImageImport = (point: Point) => {
    // Create a file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*'; // Accept all image formats
    fileInput.style.display = 'none';
    
    fileInput.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file.');
        return;
      }
      
      // Create a FileReader to convert the image to base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        if (!imageUrl) return;
        
        // Create an Image object to get dimensions
        const img = new Image();
        img.onload = () => {
          // Calculate appropriate size (max 400px width/height, maintain aspect ratio)
          const maxSize = 400;
          let width = img.width;
          let height = img.height;
          
          if (width > maxSize || height > maxSize) {
            const ratio = Math.min(maxSize / width, maxSize / height);
            width = width * ratio;
            height = height * ratio;
          }
          
          // Apply grid snapping to insertion point
          const snappedPoint = applySnapping(point);
          
          // Create the image element
          const createdElement = addElementSilent({
            type: 'image',
            x: snappedPoint.x,
            y: snappedPoint.y,
            width,
            height,
            angle: 0,
            strokeColor: toolOptions.strokeColor,
            backgroundColor: 'transparent', // Images don't use background
            strokeWidth: 0, // Images don't use stroke by default
            strokeStyle: toolOptions.strokeStyle,
            fillStyle: 'solid',
            roughness: 0, // Images should be crisp
            opacity: toolOptions.opacity,
            imageUrl,
          });
          
          // Auto-select the created image
          selectElements([createdElement.id]);
          
          // Auto-activate selection tool for immediate manipulation
          setActiveTool('select');
        };
        img.src = imageUrl;
      };
      
      reader.readAsDataURL(file);
      
      // Clean up the file input
      document.body.removeChild(fileInput);
    };
    
    // Add to DOM and click
    document.body.appendChild(fileInput);
    fileInput.click();
  };

  // Handle diagram import functionality (Excalidraw and Draw.io)
  const handleDiagramImport = async () => {
    const { importDiagramFile } = await import('./utils/fileImport');
    
    // Create a file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.excalidraw,.drawio,.xml'; // Accept supported diagram formats
    fileInput.style.display = 'none';
    
    fileInput.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      try {
        // Import elements from the diagram file
        const importedElements = await importDiagramFile(file);
        
        if (importedElements.length === 0) {
          alert('No elements found in the diagram file.');
          return;
        }
        
        // Get center of viewport for positioning
        const centerX = (-viewport.pan.x + (windowSize.width / 2)) / viewport.zoom;
        const centerY = (-viewport.pan.y + (windowSize.height / 2)) / viewport.zoom;
        
        // Calculate bounding box of imported elements
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        importedElements.forEach(element => {
          minX = Math.min(minX, element.x);
          minY = Math.min(minY, element.y);
          maxX = Math.max(maxX, element.x + element.width);
          maxY = Math.max(maxY, element.y + element.height);
        });
        
        // Calculate offset to center the imported diagram
        const diagramCenterX = (minX + maxX) / 2;
        const diagramCenterY = (minY + maxY) / 2;
        const offsetX = centerX - diagramCenterX;
        const offsetY = centerY - diagramCenterY;
        
        // Apply offset to all imported elements
        const centeredElements = importedElements.map(element => ({
          ...element,
          x: element.x + offsetX,
          y: element.y + offsetY,
        }));
        
        // Add all elements to the store
        const { addElements } = useAppStore.getState();
        addElements(centeredElements);
        
        // Select all imported elements
        const importedIds = centeredElements.map(el => el.id);
        selectElements(importedIds);
        
        // Switch to selection tool for immediate manipulation
        setActiveTool('select');
        
        // Save to history
        saveToHistory();
        
        // Show success message
        console.log(`Successfully imported ${centeredElements.length} elements from ${file.name}`);
        
      } catch (error) {
        console.error('Import error:', error);
        alert(`Failed to import diagram: ${(error as Error).message}`);
      }
      
      // Clean up the file input
      document.body.removeChild(fileInput);
    };
    
    // Add to DOM and click
    document.body.appendChild(fileInput);
    fileInput.click();
  };


  const handleCanvasMouseMove = (point: Point, event: MouseEvent) => {
    // Transform canvas coordinates to world coordinates for consistent element manipulation
    const worldPoint = {
      x: point.x / viewport.zoom + viewport.pan.x,
      y: point.y / viewport.zoom + viewport.pan.y,
    };
    
    // Check for debug mode (Ctrl pressed) even when not dragging
    const modifiers = keyboardManager.getModifierState();
    if (modifiers.ctrl && !isDraggingElements && activeTool === 'select' && selectedElementIds.length > 0) {
      const selectedElement = elements.find(el => el.id === selectedElementIds[0]);
      if (selectedElement) {
        const otherElements = elements.filter(el => !selectedElementIds.includes(el.id));
        const debugGuides = generateDebugSnapGuides(selectedElement, otherElements, [selectedElement]);
        setSnapGuides(debugGuides);
      }
    } else if (!isDraggingElements) {
      // Clear guides when Ctrl is released and not dragging
      setSnapGuides([]);
    }
    
    // Update cursor based on hover state (only when not in a drag operation)
    if (!isPanning && !isResizing && !isRotating && !isDraggingElements && !isDragSelecting && activeTool === 'select') {
      let newCursor = 'default';
      
      // Check for multi-selection group handles first
      if (selectedElementIds.length > 1) {
        const selectedElements = elements.filter(el => selectedElementIds.includes(el.id) && !el.locked);
        const multiSelectionBounds = getMultiSelectionBounds(selectedElements);
        
        if (multiSelectionBounds) {
          const groupHandle = findMultiSelectionHandle(worldPoint, multiSelectionBounds);
          if (groupHandle) {
            if (groupHandle === 'rotation') {
              newCursor = 'grab';
            } else {
              newCursor = getResizeCursor(groupHandle as ResizeHandleType);
            }
          }
        }
      } else if (selectedElementIds.length === 1) {
        // Check single element resize handles
        for (const elementId of selectedElementIds) {
          const element = elements.find(el => el.id === elementId);
          if (!element || element.locked) continue;
          
          const handle = findResizeHandle(worldPoint, element);
          if (handle) {
            newCursor = getResizeCursor(handle);
            break;
          }
        }
      }
      
      // Set cursor on canvas
      const canvas = event.target as HTMLElement;
      canvas.style.cursor = newCursor;
    }
    
    // DEBUG: Log mouse move events
    
    if (isPanning && panStart && panStartViewport.current) {
      const dx = point.x - panStart.x;
      const dy = point.y - panStart.y;
      setPan({
        x: panStartViewport.current.x - dx / viewport.zoom,
        y: panStartViewport.current.y - dy / viewport.zoom,
      });
    }
    
    // Handle group resize
    if (isGroupResizing && groupResizeStartPoint && groupResizeHandle && groupResizeStartBounds && groupResizeStartElements.length > 0) {
      // Don't use snapping for multi-selection resize to avoid jerky behavior
      const newBounds = applyMultiSelectionResize(
        groupResizeStartBounds,
        groupResizeHandle,
        groupResizeStartPoint,
        worldPoint
      );
      
      // Use the original elements state, not current elements
      const updates = applyGroupResize(groupResizeStartElements, groupResizeStartBounds, newBounds);
      
      selectedElementIds.forEach((elementId, index) => {
        if (updates[index]) {
          updateElementSilent(elementId, updates[index]);
        }
      });
    }
    
    // Handle group rotation
    if (isGroupRotating && groupRotationCenter && groupRotationStartElements.length > 0) {
      const currentAngle = Math.atan2(
        worldPoint.y - groupRotationCenter.y,
        worldPoint.x - groupRotationCenter.x
      );
      
      // Calculate delta angle from start
      let deltaAngle = currentAngle - groupRotationStartAngle;
      
      // Apply rotation snapping (15-degree increments)
      const snapIncrement = Math.PI / 12; // 15 degrees
      deltaAngle = Math.round(deltaAngle / snapIncrement) * snapIncrement;
      
      // Apply rotation to all elements based on their initial state
      const updates = applyGroupRotation(groupRotationStartElements, groupRotationCenter, deltaAngle);
      
      selectedElementIds.forEach((elementId, index) => {
        if (updates[index]) {
          updateElementSilent(elementId, updates[index]);
        }
      });
    }
    
    // Handle element resizing
    if (isResizing && resizeElementId && resizeHandle && resizeStartPoint && resizeStartBounds) {
      const element = elements.find(el => el.id === resizeElementId);
      if (element) {
        const modifiers = keyboardManager.getModifierState();
        const resizeUpdates = applyResize(
          element, 
          resizeHandle, 
          worldPoint, 
          resizeStartPoint, 
          resizeStartBounds,
          applySnapping, // Pass the snapping function
          modifiers.ctrl // Pass CTRL key state for proportional resizing
        );
        updateElementSilent(resizeElementId, resizeUpdates);
      }
    }
    
    // Handle element rotation
    if (isRotating && rotationElementId) {
      const element = elements.find(el => el.id === rotationElementId);
      if (element) {
        const rotationUpdates = applyRotation(element, worldPoint);
        updateElementSilent(rotationElementId, rotationUpdates);
      }
    }
    
    // Handle rectangle drawing with world coordinates
    if (isDrawingRectangle && rectangleStart && currentRectangleId) {
      handleRectangleDrawingCanvasMove(worldPoint);
    }
    
    // Handle circle drawing with world coordinates
    if (isDrawingCircle && circleStart && currentCircleId) {
      handleCircleDrawingCanvasMove(worldPoint);
    }
    
    // Handle diamond drawing with world coordinates
    if (isDrawingDiamond && diamondStart && currentDiamondId) {
      handleDiamondDrawingCanvasMove(worldPoint);
    }
    
    
    // Handle pen drawing
    if (isDrawingPen && currentPenId) {
      const snappedPoint = applySnapping(worldPoint);
      const newPoints = [...penPoints, snappedPoint];
      setPenPoints(newPoints);
      
      // Calculate bounding box for pen stroke
      const minX = Math.min(...newPoints.map(p => p.x));
      const minY = Math.min(...newPoints.map(p => p.y));
      const maxX = Math.max(...newPoints.map(p => p.x));
      const maxY = Math.max(...newPoints.map(p => p.y));
      
      // Update the pen element with new points and bounding box
      updateElementSilent(currentPenId, { 
        x: minX,
        y: minY,
        width: Math.max(maxX - minX, 1),
        height: Math.max(maxY - minY, 1),
        points: newPoints,
      });
    }
    
    // Handle element dragging
    if (isDraggingElements && dragStart && dragStartPositions.size > 0) {
      // Get the primary element being dragged (first selected element)
      const primaryElementId = selectedElementIds[0];
      const primaryElement = elements.find(el => el.id === primaryElementId);
      
      if (primaryElement) {
        // Calculate where the primary element would be without snapping
        const initialPosition = dragStartPositions.get(primaryElementId);
        if (initialPosition) {
          const deltaX = worldPoint.x - dragStart.x;
          const deltaY = worldPoint.y - dragStart.y;
          
          // Create a temporary element at the new position for snap calculation
          const tempElement = {
            ...primaryElement,
            x: initialPosition.x + deltaX,
            y: initialPosition.y + deltaY
          };
          
          // Get all other elements (excluding selected ones)
          const otherElements = elements.filter(el => !selectedElementIds.includes(el.id));
          
          // Check if Ctrl is pressed for debug mode
          const modifiers = keyboardManager.getModifierState();
          
          let finalDelta;
          let guidesToShow: SnapGuide[] = [];
          
          if (modifiers.ctrl) {
            // Ctrl pressed: activate snap AND show debug guides
            const snapResult = snapElementPosition(tempElement, otherElements);
            
            if (snapResult.snapped) {
              // Use snap result
              finalDelta = {
                x: snapResult.element.x - initialPosition.x,
                y: snapResult.element.y - initialPosition.y
              };
              guidesToShow = snapResult.guides;
            } else {
              // No snap found, use current position
              finalDelta = {
                x: deltaX,
                y: deltaY
              };
            }
            
            // Add all debug guides to show snap possibilities
            const debugGuides = generateDebugSnapGuides(tempElement, otherElements, [tempElement]);
            guidesToShow = [...guidesToShow, ...debugGuides];
          } else {
            // Normal mode: no snap, free movement
            finalDelta = {
              x: deltaX,
              y: deltaY
            };
            guidesToShow = [];
          }
          
          setSnapGuides(guidesToShow);
          
          // Update all selected elements based on their initial positions
          const { updateElementSilent } = useAppStore.getState();
          selectedElementIds.forEach(elementId => {
            const elementInitialPosition = dragStartPositions.get(elementId);
            if (elementInitialPosition) {
              updateElementSilent(elementId, { 
                x: elementInitialPosition.x + finalDelta.x,
                y: elementInitialPosition.y + finalDelta.y
              });
            }
          });
        }
      }
    }
    
    // Handle drag selection
    if (isDragSelecting && dragSelectionStart) {
      const snappedPoint = applySnapping(worldPoint);
      setDragSelectionEnd(snappedPoint);
    }
    
    // Delegate to global mouse move for line/arrow operations only
    // (Rectangle and circle events are handled above with Canvas coordinates)
    if (isDrawingLine || isDrawingArrow) {
      handleGlobalMouseMove(event);
    }
  };

  const handleCanvasMouseUp = (point: Point, event: MouseEvent) => {
    // Transform canvas coordinates to world coordinates for consistent element manipulation
    const worldPoint = {
      x: point.x / viewport.zoom + viewport.pan.x,
      y: point.y / viewport.zoom + viewport.pan.y,
    };
    
    if (isPanning) {
      setIsPanning(false);
      setPanStart(null);
      panStartViewport.current = null;
    }
    
    // Handle group resize completion
    if (isGroupResizing) {
      // Save the resized group to history
      saveToHistory();
      setIsGroupResizing(false);
      setGroupResizeHandle(null);
      setGroupResizeStartPoint(null);
      setGroupResizeStartBounds(null);
      setGroupResizeStartElements([]);
      
      // Reset cursor
      const canvas = event.target as HTMLElement;
      canvas.style.cursor = 'default';
    }
    
    // Handle group rotation completion
    if (isGroupRotating) {
      // Save the rotated group to history
      saveToHistory();
      setIsGroupRotating(false);
      setGroupRotationCenter(null);
      setGroupRotationStartAngle(0);
      setGroupRotationStartElements([]);
      
      // Reset cursor
      const canvas = event.target as HTMLElement;
      canvas.style.cursor = 'default';
    }
    
    // Handle element resizing completion
    if (isResizing) {
      // Element has already been updated by updateElementSilent during mousemove
      // Just trigger save to history and reset state
      saveToHistory();
      setIsResizing(false);
      setResizeElementId(null);
      setResizeHandle(null);
      setResizeStartPoint(null);
      setResizeStartBounds(null);
      
      // Reset cursor
      const canvas = event.target as HTMLElement;
      canvas.style.cursor = 'default';
    }
    
    // Handle element rotation completion
    if (isRotating) {
      // Element has already been updated by updateElementSilent during mousemove
      // Just trigger save to history and reset state
      saveToHistory();
      setIsRotating(false);
      setRotationElementId(null);
      
      // Reset cursor
      const canvas = event.target as HTMLElement;
      canvas.style.cursor = 'default';
    }
    
    // Handle rectangle drawing completion
    if (isDrawingRectangle && rectangleStart && currentRectangleId) {
      handleRectangleDrawingCanvasUp(worldPoint);
    }
    
    // Handle circle drawing completion
    if (isDrawingCircle && circleStart && currentCircleId) {
      handleCircleDrawingCanvasUp(worldPoint);
    }
    
    // Handle diamond drawing completion
    if (isDrawingDiamond && diamondStart && currentDiamondId) {
      handleDiamondDrawingCanvasUp(worldPoint);
    }
    
    
    // Handle pen drawing completion
    if (isDrawingPen && currentPenId) {
      // Save final pen drawing to history
      saveToHistory();
      
      // Auto-select the created pen drawing
      const { selectElements } = useAppStore.getState();
      selectElements([currentPenId]);
      
      // Auto-activate selection tool for immediate manipulation
      setActiveTool('select');
      
      setIsDrawingPen(false);
      setCurrentPenId(null);
      setPenPoints([]);
    }
    
    // Handle element dragging completion
    if (isDraggingElements) {
      // Save the moved elements to history
      saveToHistory();
      
      setIsDraggingElements(false);
      setDragStart(null);
      setDragStartPositions(new Map());
      
      // Clear snap guides when dragging ends
      setSnapGuides([]);
    }
    
    // Handle drag selection completion
    if (isDragSelecting && dragSelectionStart) {
      completeDragSelection(worldPoint);
    }
    
    // Delegate to global mouse up for line/arrow operations only
    // (Rectangle and circle events are handled above with Canvas coordinates)
    if (isDrawingLine || isDrawingArrow) {
      handleGlobalMouseUp(event);
    }
  };

  const handleCanvasWheel = (event: WheelEvent) => {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // Get mouse position relative to canvas
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      
      // Convert mouse position to world coordinates before zoom
      const worldPointBefore = {
        x: mouseX / viewport.zoom + viewport.pan.x,
        y: mouseY / viewport.zoom + viewport.pan.y
      };
      
      // Calculate new zoom level
      const zoomDelta = event.deltaY > 0 ? -0.1 : 0.1;
      const newZoom = Math.max(0.1, Math.min(5, viewport.zoom + zoomDelta));
      
      // Convert the same mouse position to world coordinates after zoom
      const worldPointAfter = {
        x: mouseX / newZoom + viewport.pan.x,
        y: mouseY / newZoom + viewport.pan.y
      };
      
      // Calculate the difference and adjust pan to keep the point under cursor fixed
      const panDelta = {
        x: worldPointBefore.x - worldPointAfter.x,
        y: worldPointBefore.y - worldPointAfter.y
      };
      
      // Apply zoom and adjusted pan
      setZoom(newZoom);
      setPan({
        x: viewport.pan.x + panDelta.x,
        y: viewport.pan.y + panDelta.y
      });
    }
  };

  // Double-click handler for text editing
  const handleCanvasDoubleClick = (point: Point) => {
    // Don't handle double-click if already in text editing mode
    if (textEditing.isEditing) return;
    
    // Transform canvas coordinates to world coordinates (same as handleCanvasMouseDown)
    const worldPoint = {
      x: (point.x / viewport.zoom) + viewport.pan.x,
      y: (point.y / viewport.zoom) + viewport.pan.y,
    };
    
    // Find element at the clicked position (front-to-back search)
    const hitElement = elements
      .filter((el) => !el.locked) // Skip locked elements
      .slice() // Prevent array mutation
      .reverse() // Search from front to back (newest to oldest)
      .find((element) => {
        // Hit test for different element types using rotation-aware testing
        switch (element.type) {
          case 'rectangle':
          case 'text':
          case 'image':
          case 'circle':
            return isPointInRotatedElement(worldPoint, element);
          case 'line':
          case 'arrow': {
            // Simple line hit test with tolerance
            const tolerance = Math.max(element.strokeWidth * 2, 10);
            const lineStart = { x: element.x, y: element.y };
            const lineEnd = { x: element.x + element.width, y: element.y + element.height };
            return pointToLineDistance(worldPoint, lineStart, lineEnd) <= tolerance;
          }
          case 'pen': {
            // Check if click is near any segment of the pen stroke
            if (!element.points || element.points.length < 2) return false;
            const tolerance = Math.max(element.strokeWidth * 2, 8) / viewport.zoom;
            
            for (let i = 0; i < element.points.length - 1; i++) {
              const p1 = element.points[i];
              const p2 = element.points[i + 1];
              const distance = pointToLineDistance(worldPoint, p1, p2);
              if (distance <= tolerance) return true;
            }
            return false;
          }
          default:
            return false;
        }
      });

    if (hitElement) {
      // Select the element first
      selectElements([hitElement.id]);
      
      // Start direct text editing within the shape
      flushSync(() => {
        startTextEditing(hitElement.id, hitElement.text || '', hitElement.text ? hitElement.text.length : 0);
      });
      
      // Auto-activate selection tool for consistency
      setActiveTool('select');
    }
  };

  // Helper function to calculate distance from point to line
  const pointToLineDistance = (point: Point, lineStart: Point, lineEnd: Point): number => {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    
    if (lenSq === 0) return Math.sqrt(A * A + B * B);
    
    const param = dot / lenSq;
    
    let xx: number, yy: number;
    
    if (param < 0) {
      xx = lineStart.x;
      yy = lineStart.y;
    } else if (param > 1) {
      xx = lineEnd.x;
      yy = lineEnd.y;
    } else {
      xx = lineStart.x + param * C;
      yy = lineStart.y + param * D;
    }
    
    const dx = point.x - xx;
    const dy = point.y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Handle cursor blinking for direct text editing
  useEffect(() => {
    let interval: number | null = null;
    let timeout: number | null = null;
    
    if (textEditing.isEditing) {
      // Ensure cursor is visible initially (it starts as true from startTextEditing)
      // Start blinking after a delay so cursor is visible immediately for 500ms
      timeout = setTimeout(() => {
        if (textEditing.isEditing) { // Check if still editing after delay
          // Toggle cursor visibility every 500ms
          interval = setInterval(() => {
            toggleCursor();
          }, 500);
        }
      }, 500); // Wait 500ms before starting the blink cycle
    }
    
    return () => {
      if (interval) clearInterval(interval);
      if (timeout) clearTimeout(timeout);
    };
  }, [textEditing.isEditing, toggleCursor]);

  // Helper function to finish text editing and activate selection tool
  const finishTextEditingAndActivateSelect = () => {
    finishTextEditing();
    // Auto-activate selection tool for immediate manipulation
    setActiveTool('select');
  };

  // Helper function to calculate line information for vertical navigation
  const calculateLineInfo = (text: string, cursorPosition: number) => {
    const lines = text.split('\n');
    let charCount = 0;
    let currentLine = 0;
    let positionInLine = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const lineLength = lines[i].length;
      if (cursorPosition <= charCount + lineLength) {
        currentLine = i;
        positionInLine = cursorPosition - charCount;
        break;
      }
      charCount += lineLength + 1; // +1 for the newline character
    }
    
    return {
      lines,
      currentLine,
      positionInLine,
      lineStarts: lines.reduce((acc, _, index) => {
        if (index === 0) {
          acc.push(0);
        } else {
          acc.push(acc[index - 1] + lines[index - 1].length + 1);
        }
        return acc;
      }, [] as number[])
    };
  };

  // Helper functions for word navigation
  const findWordStart = (text: string, position: number): number => {
    if (position <= 0) return 0;
    
    let pos = position;
    
    // Check if we're already at the beginning of a word
    const isAtWordStart = (pos === 0 || /\s/.test(text[pos - 1])) && pos < text.length && !/\s/.test(text[pos]);
    
    if (isAtWordStart) {
      // We're at word start, go to previous word start
      pos--;
      // Skip whitespace backwards
      while (pos >= 0 && /\s/.test(text[pos])) {
        pos--;
      }
      // Skip the word backwards
      while (pos >= 0 && !/\s/.test(text[pos])) {
        pos--;
      }
      return Math.max(0, pos + 1);
    } else {
      // We're not at word start, go to start of current word
      // If we're in a word, go to its beginning
      while (pos > 0 && !/\s/.test(text[pos - 1])) {
        pos--;
      }
      return pos;
    }
  };

  const findWordEnd = (text: string, position: number): number => {
    if (position >= text.length) return text.length;
    
    let pos = position;
    
    // Skip current word if we're in it
    while (pos < text.length && !/\s/.test(text[pos])) {
      pos++;
    }
    
    // Skip whitespace to find next word
    while (pos < text.length && /\s/.test(text[pos])) {
      pos++;
    }
    
    // Return the start of the next word
    return pos;
  };

  // Handle keyboard input for direct text editing
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!textEditing.isEditing || !textEditing.elementId) return;
      
      const currentText = textEditing.text;
      const cursorPos = textEditing.cursorPosition;
      const selStart = textEditing.selectionStart;
      const selEnd = textEditing.selectionEnd;
      const hasSelection = selStart !== selEnd;
      
      // Prevent default behavior for text editing keys
      if (event.key === 'Escape') {
        event.preventDefault();
        finishTextEditingAndActivateSelect();
      } else if (event.key === 'Enter') {
        event.preventDefault();
        if (event.shiftKey) {
          // Shift+Enter: Add line break at cursor position
          if (hasSelection) {
            // Replace selection with line break
            const newText = currentText.slice(0, selStart) + '\n' + currentText.slice(selEnd);
            updateTextContent(newText, selStart + 1);
          } else {
            const newText = currentText.slice(0, cursorPos) + '\n' + currentText.slice(cursorPos);
            updateTextContent(newText, cursorPos + 1);
          }
        } else {
          // Enter: Finish text editing
          finishTextEditingAndActivateSelect();
        }
      } else if (event.key === 'Backspace') {
        event.preventDefault();
        if (hasSelection) {
          // Delete selected text
          const newText = currentText.slice(0, selStart) + currentText.slice(selEnd);
          updateTextContent(newText, selStart);
        } else if (cursorPos > 0) {
          const newText = currentText.slice(0, cursorPos - 1) + currentText.slice(cursorPos);
          updateTextContent(newText, cursorPos - 1);
        }
      } else if (event.key === 'Delete') {
        event.preventDefault();
        if (hasSelection) {
          // Delete selected text
          const newText = currentText.slice(0, selStart) + currentText.slice(selEnd);
          updateTextContent(newText, selStart);
        } else if (cursorPos < currentText.length) {
          const newText = currentText.slice(0, cursorPos) + currentText.slice(cursorPos + 1);
          updateTextContent(newText, cursorPos);
        }
      } else if (event.key === 'Home') {
        event.preventDefault();
        if (event.shiftKey) {
          // Select from current position to beginning
          updateTextSelection(currentText, 0, 0, selEnd);
        } else {
          // Move cursor to beginning
          updateTextContent(currentText, 0);
        }
      } else if (event.key === 'End') {
        event.preventDefault();
        const textLength = currentText.length;
        if (event.shiftKey) {
          // Select from current position to end
          updateTextSelection(currentText, textLength, selStart, textLength);
        } else {
          // Move cursor to end
          updateTextContent(currentText, textLength);
        }
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        if (event.ctrlKey && event.shiftKey) {
          // CTRL+SHIFT+Left: Select to previous word start
          const wordStart = findWordStart(currentText, cursorPos);
          updateTextSelection(currentText, wordStart, selStart, wordStart);
        } else if (event.ctrlKey) {
          // CTRL+Left: Move to previous word start
          const wordStart = findWordStart(currentText, cursorPos);
          updateTextContent(currentText, wordStart);
        } else if (event.shiftKey) {
          // SHIFT+Left: Extend selection to the left
          const newSelEnd = Math.max(0, selEnd - 1);
          updateTextSelection(currentText, newSelEnd, selStart, newSelEnd);
        } else {
          // Move cursor left
          if (hasSelection) {
            // Move to start of selection
            updateTextContent(currentText, selStart);
          } else {
            updateTextContent(currentText, Math.max(0, cursorPos - 1));
          }
        }
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        if (event.ctrlKey && event.shiftKey) {
          // CTRL+SHIFT+Right: Select to next word end
          const wordEnd = findWordEnd(currentText, cursorPos);
          updateTextSelection(currentText, wordEnd, selStart, wordEnd);
        } else if (event.ctrlKey) {
          // CTRL+Right: Move to next word end
          const wordEnd = findWordEnd(currentText, cursorPos);
          updateTextContent(currentText, wordEnd);
        } else if (event.shiftKey) {
          // SHIFT+Right: Extend selection to the right
          const newSelEnd = Math.min(currentText.length, selEnd + 1);
          updateTextSelection(currentText, newSelEnd, selStart, newSelEnd);
        } else {
          // Move cursor right
          if (hasSelection) {
            // Move to end of selection
            updateTextContent(currentText, selEnd);
          } else {
            updateTextContent(currentText, Math.min(currentText.length, cursorPos + 1));
          }
        }
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        const lineInfo = calculateLineInfo(currentText, cursorPos);
        
        if (lineInfo.currentLine > 0) {
          // Move to previous line
          const prevLine = lineInfo.lines[lineInfo.currentLine - 1];
          const newPosInLine = Math.min(lineInfo.positionInLine, prevLine.length);
          const newCursorPos = lineInfo.lineStarts[lineInfo.currentLine - 1] + newPosInLine;
          
          if (event.shiftKey) {
            // Extend selection upward
            updateTextSelection(currentText, newCursorPos, selStart, newCursorPos);
          } else {
            // Move cursor up
            if (hasSelection) {
              updateTextContent(currentText, selStart);
            } else {
              updateTextContent(currentText, newCursorPos);
            }
          }
        } else if (event.shiftKey) {
          // Already at first line, extend selection to beginning
          updateTextSelection(currentText, 0, selStart, 0);
        } else if (!hasSelection) {
          // Move to beginning of current line
          updateTextContent(currentText, lineInfo.lineStarts[lineInfo.currentLine]);
        } else {
          updateTextContent(currentText, selStart);
        }
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        const lineInfo = calculateLineInfo(currentText, cursorPos);
        
        if (lineInfo.currentLine < lineInfo.lines.length - 1) {
          // Move to next line
          const nextLine = lineInfo.lines[lineInfo.currentLine + 1];
          const newPosInLine = Math.min(lineInfo.positionInLine, nextLine.length);
          const newCursorPos = lineInfo.lineStarts[lineInfo.currentLine + 1] + newPosInLine;
          
          if (event.shiftKey) {
            // Extend selection downward
            updateTextSelection(currentText, newCursorPos, selStart, newCursorPos);
          } else {
            // Move cursor down
            if (hasSelection) {
              updateTextContent(currentText, selEnd);
            } else {
              updateTextContent(currentText, newCursorPos);
            }
          }
        } else if (event.shiftKey) {
          // Already at last line, extend selection to end
          updateTextSelection(currentText, currentText.length, selStart, currentText.length);
        } else if (!hasSelection) {
          // Move to end of current line
          const currentLineLength = lineInfo.lines[lineInfo.currentLine].length;
          const endOfLine = lineInfo.lineStarts[lineInfo.currentLine] + currentLineLength;
          updateTextContent(currentText, endOfLine);
        } else {
          updateTextContent(currentText, selEnd);
        }
      } else if (event.key === 'a' && event.ctrlKey) {
        event.preventDefault();
        // Select all text
        updateTextSelection(currentText, currentText.length, 0, currentText.length);
      } else if (event.key === 'c' && event.ctrlKey) {
        event.preventDefault();
        event.stopPropagation();
        // Copy selected text to clipboard
        if (hasSelection) {
          const selectedText = currentText.slice(selStart, selEnd);
          navigator.clipboard.writeText(selectedText).catch(console.error);
        }
      } else if (event.key === 'x' && event.ctrlKey) {
        event.preventDefault();
        event.stopPropagation();
        // Cut selected text to clipboard
        if (hasSelection) {
          const selectedText = currentText.slice(selStart, selEnd);
          navigator.clipboard.writeText(selectedText).catch(console.error);
          // Remove the selected text
          const newText = currentText.slice(0, selStart) + currentText.slice(selEnd);
          updateTextContent(newText, selStart);
        }
      // Note: Paste handling moved to separate paste event listener to avoid clipboard permission issues
      } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        // Regular character input
        event.preventDefault();
        if (hasSelection) {
          // Replace selected text with new character
          const newText = currentText.slice(0, selStart) + event.key + currentText.slice(selEnd);
          updateTextContent(newText, selStart + 1);
        } else {
          const newText = currentText.slice(0, cursorPos) + event.key + currentText.slice(cursorPos);
          updateTextContent(newText, cursorPos + 1);
        }
      }
    };

    // Handle clicks outside to finish editing
    const handleClickOutside = (event: MouseEvent) => {
      if (!textEditing.isEditing) return;
      
      const target = event.target as HTMLElement;
      
      // Don't finish editing if clicking on UI elements (buttons, panels, toolbars)
      if (target.closest('.top-toolbar') || 
          target.closest('.properties-panel') || 
          target.closest('.zoom-control') ||
          target.closest('button') ||
          target.closest('[role="button"]') ||
          target.closest('.modal') ||
          target.closest('.dialog')) {
        return;
      }
      
      // Finish editing for ANY click outside the canvas OR inside the canvas
      // This provides standard editor behavior where clicking anywhere finishes editing
      finishTextEditingAndActivateSelect();
    };

    document.addEventListener('keydown', handleKeyDown, true); // Use capture phase
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [textEditing, updateTextContent, updateTextSelection, finishTextEditing, setActiveTool]);

  // Sync text editing state with keyboard manager
  useEffect(() => {
    keyboardManager.setTextEditingActive(textEditing.isEditing);
  }, [textEditing.isEditing]);



  // Handle clipboard paste events like Excalidraw
  useEffect(() => {
    const handlePaste = async (event: ClipboardEvent) => {
      // Always prevent default and stop propagation to avoid browser's native paste UI
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      
      // Handle text editing paste without navigator.clipboard API
      if (textEditing.isEditing && textEditing.elementId) {
        const clipboardData = event.clipboardData;
        if (!clipboardData) return;
        
        const pastedText = clipboardData.getData('text/plain');
        if (!pastedText) return;
        
        const currentText = textEditing.text;
        const cursorPos = textEditing.cursorPosition;
        const selStart = textEditing.selectionStart;
        const selEnd = textEditing.selectionEnd;
        const hasSelection = selStart !== selEnd;
        
        if (hasSelection) {
          // Replace selected text with clipboard content
          const newText = currentText.slice(0, selStart) + pastedText + currentText.slice(selEnd);
          updateTextContent(newText, selStart + pastedText.length);
        } else {
          // Insert clipboard content at cursor position
          const newText = currentText.slice(0, cursorPos) + pastedText + currentText.slice(cursorPos);
          updateTextContent(newText, cursorPos + pastedText.length);
        }
        return;
      }
      
      const clipboardData = event.clipboardData;
      if (!clipboardData) {
        return;
      }
      
      // Check for image data first
      const items = Array.from(clipboardData.items);
      const imageItem = items.find(item => item.type.startsWith('image/'));
      
      if (imageItem) {
        const file = imageItem.getAsFile();
        if (!file) return;
        
        // Use FileReader to create persistent data URL instead of temporary blob URL
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          if (!imageUrl) return;
          
          const img = new Image();
          img.onload = () => {
            
            const centerX = viewport.pan.x + (windowSize.width / viewport.zoom) / 2;
            const centerY = viewport.pan.y + (windowSize.height / viewport.zoom) / 2;
            
            const MAX_SIZE = 400;
            let width = img.width;
            let height = img.height;
            
            if (width > MAX_SIZE || height > MAX_SIZE) {
              const aspectRatio = width / height;
              if (width > height) {
                width = MAX_SIZE;
                height = MAX_SIZE / aspectRatio;
              } else {
                height = MAX_SIZE;
                width = MAX_SIZE * aspectRatio;
              }
            }
            
            const imageElement = addElementSilent({
              type: 'image',
              x: centerX - width / 2,
              y: centerY - height / 2,
              width: width,
              height: height,
              angle: 0,
              strokeColor: toolOptions.strokeColor,
              backgroundColor: 'transparent',
              strokeWidth: toolOptions.strokeWidth,
              strokeStyle: toolOptions.strokeStyle,
              fillStyle: toolOptions.fillStyle,
              roughness: toolOptions.roughness,
              opacity: toolOptions.opacity,
              imageUrl: imageUrl,
            });
            
            selectElements([imageElement.id]);
            setActiveTool('select');
            saveToHistory();
            
            // Clear clipboard items to prevent sticking
            try {
              navigator.clipboard.writeText('');
            } catch (e) {
            }
          };
          
          img.onerror = () => {
            console.error('Failed to load pasted image');
          };
          
          img.src = imageUrl;
        };
        
        reader.onerror = () => {
          console.error('Failed to read pasted image file');
        };
        
        reader.readAsDataURL(file);
      } else {
        // No image found, trigger regular paste
        paste();
      }
    };
    
    // Use passive: false like Excalidraw to allow preventDefault
    document.addEventListener('paste', handlePaste, { passive: false });
    
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [textEditing.isEditing, viewport, windowSize, toolOptions, addElementSilent, selectElements, setActiveTool, saveToHistory, paste]);

  // Set up keyboard shortcuts
  useEffect(() => {
    keyboardManager.on('setTool', setActiveTool);
    keyboardManager.on('undo', undo);
    keyboardManager.on('redo', redo);
    keyboardManager.on('delete', deleteSelectedElements);
    keyboardManager.on('duplicate', duplicateSelectedElements);
    keyboardManager.on('bringSelectedForward', bringSelectedForward);
    keyboardManager.on('sendSelectedBackward', sendSelectedBackward);
    keyboardManager.on('bringSelectedToFront', bringSelectedToFront);
    keyboardManager.on('sendSelectedToBack', sendSelectedToBack);
    keyboardManager.on('groupSelectedElements', groupSelectedElements);
    keyboardManager.on('ungroupSelectedElements', ungroupSelectedElements);
    keyboardManager.on('lockSelectedElements', lockSelectedElements);
    keyboardManager.on('unlockSelectedElements', unlockSelectedElements);
    keyboardManager.on('unlockAllElements', unlockAllElements);
    keyboardManager.on('alignLeft', alignLeft);
    keyboardManager.on('alignCenter', alignCenter);
    keyboardManager.on('alignRight', alignRight);
    keyboardManager.on('alignTop', alignTop);
    keyboardManager.on('alignMiddle', alignMiddle);
    keyboardManager.on('alignBottom', alignBottom);
    keyboardManager.on('selectAll', selectAll);
    keyboardManager.on('selectNext', selectNext);
    keyboardManager.on('selectPrevious', selectPrevious);
    keyboardManager.on('selectByType', selectByType);
    keyboardManager.on('selectSimilar', selectSimilar);
    keyboardManager.on('selectAbove', selectAbove);
    keyboardManager.on('selectBelow', selectBelow);
    keyboardManager.on('copy', copy);
    keyboardManager.on('cut', cut);
    keyboardManager.on('paste', paste);
    // Note: paste also handled by clipboard event listener for CTRL+V
    keyboardManager.on('copyStyle', copyStyle);
    keyboardManager.on('pasteStyle', pasteStyle);
    keyboardManager.on('resetZoom', resetZoom);
    keyboardManager.on('zoomToFit', zoomToFit);
    keyboardManager.on('toggleGrid', toggleGrid);

    return () => {
      keyboardManager.off('setTool');
      keyboardManager.off('undo');
      keyboardManager.off('redo');
      keyboardManager.off('delete');
      keyboardManager.off('duplicate');
      keyboardManager.off('bringSelectedForward');
      keyboardManager.off('sendSelectedBackward');
      keyboardManager.off('bringSelectedToFront');
      keyboardManager.off('sendSelectedToBack');
      keyboardManager.off('groupSelectedElements');
      keyboardManager.off('ungroupSelectedElements');
      keyboardManager.off('lockSelectedElements');
      keyboardManager.off('unlockSelectedElements');
      keyboardManager.off('unlockAllElements');
      keyboardManager.off('alignLeft');
      keyboardManager.off('alignCenter');
      keyboardManager.off('alignRight');
      keyboardManager.off('alignTop');
      keyboardManager.off('alignMiddle');
      keyboardManager.off('alignBottom');
      keyboardManager.off('selectAll');
      keyboardManager.off('selectNext');
      keyboardManager.off('selectPrevious');
      keyboardManager.off('selectByType');
      keyboardManager.off('selectSimilar');
      keyboardManager.off('selectAbove');
      keyboardManager.off('selectBelow');
      keyboardManager.off('copy');
      keyboardManager.off('cut');
      keyboardManager.off('paste');
      // Note: paste also handled by clipboard event listener for CTRL+V
      keyboardManager.off('copyStyle');
      keyboardManager.off('pasteStyle');
      keyboardManager.off('resetZoom');
      keyboardManager.off('zoomToFit');
      keyboardManager.off('toggleGrid');
    };
  }, [setActiveTool, undo, redo, deleteSelectedElements, duplicateSelectedElements, selectAll, selectNext, selectPrevious, copy, copyStyle, pasteStyle, resetZoom, zoomToFit, toggleGrid]);

  // Connect auto-save with saving indicator
  useEffect(() => {
    setSavingCallback(setSaving);
    
    // Cleanup on unmount
    return () => {
      setSavingCallback(() => {});
    };
  }, [setSaving]);

  return (
    <div className="excalibox-app">
      <TopToolbar onImportDiagram={handleDiagramImport} />
      <PropertiesPanel />
      <ZoomControl />
      
      {/* Save indicator */}
      <SaveIndicator isSaving={isSaving} />
      
      {/* Snap guides */}
      <SnapGuides guides={snapGuides} viewport={viewport} />
      
      {/* Lock indicators */}
      <LockIndicators 
        elements={elements} 
        viewport={viewport} 
        selectedElementIds={selectedElementIds}
      />
      
      {/* Grid Configuration Dialog */}
      <GridDialog 
        isOpen={ui.dialogs.gridDialog}
        onClose={closeGridDialog}
      />
      
      <main 
        className="app-main"
        data-tool={activeTool}
        data-panning={isPanning ? 'true' : undefined}
        style={{
          // Remove marginLeft - properties panel is now absolute overlay
          width: '100%',
          height: `${windowSize.height}px`
        }}
      >
        <Canvas
          ref={canvasRef}
          width={windowSize.width} // Full width - panel is overlay
          height={windowSize.height}
          elements={elements}
          viewport={viewport}
          gridSettings={ui.grid}
          selectedElementIds={selectedElementIds}
          dragSelectionRect={
            isDragSelecting && dragSelectionStart && dragSelectionEnd 
              ? { start: dragSelectionStart, end: dragSelectionEnd }
              : null
          }
          textEditing={textEditing.isEditing ? textEditing : null}
          isRotating={isRotating || isGroupRotating}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onDoubleClick={handleCanvasDoubleClick}
          onWheel={handleCanvasWheel}
        />
        
      </main>
      
    </div>
  );
}

export default App;
