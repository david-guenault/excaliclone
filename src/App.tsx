// ABOUTME: Main application component that renders the Excalibox drawing interface
// ABOUTME: Orchestrates the Canvas, Toolbar, and manages global application state

import { useEffect, useRef, useState } from 'react';
import { Canvas } from './components/Canvas';
import { TopToolbar } from './components/TopToolbar';
import { PropertiesPanel } from './components/PropertiesPanel';
import { ZoomControl } from './components/ZoomControl';
import { GridDialog } from './components/GridDialog';
import { useAppStore } from './store';
import { keyboardManager } from './utils/keyboard';
import { LINE_CONFIG, ARROW_CONFIG, DEFAULT_ARROWHEADS } from './constants';
import { snapPointToGridWithDistance } from './utils/grid';
import type { Point } from './types';
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
    selectAll,
    selectNext,
    selectPrevious,
    copy,
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
    finishTextEditing,
    toggleGrid,
    closeGridDialog
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
  
  // Drag selection state
  const [isDragSelecting, setIsDragSelecting] = useState(false);
  const [dragSelectionStart, setDragSelectionStart] = useState<Point | null>(null);
  const [dragSelectionEnd, setDragSelectionEnd] = useState<Point | null>(null);
  const [dragSelectionShiftKey, setDragSelectionShiftKey] = useState(false);
  
  // Element dragging state
  const [isDraggingElements, setIsDraggingElements] = useState(false);
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [dragStartPositions, setDragStartPositions] = useState<Map<string, Point>>(new Map());
  
  // Pen drawing state
  const [isDrawingPen, setIsDrawingPen] = useState(false);
  const [currentPenId, setCurrentPenId] = useState<string | null>(null);
  const [penPoints, setPenPoints] = useState<Point[]>([]);
  
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
    const point = getCanvasPoint(event);
    if (!point) return;
    
    // Apply grid and magnetic snapping to end point
    const snappedPoint = applySnapping(point);
    
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
    const point = getCanvasPoint(event);
    if (!point) return;
    
    // Apply grid and magnetic snapping to end point
    const snappedPoint = applySnapping(point);
    
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
      const { updateElement } = useAppStore.getState();
      updateElement(currentRectangleId!, {
        width: finalWidth,
        height: finalHeight,
        x: width >= 0 ? rectangleStart!.x : rectangleStart!.x + width,
        y: height >= 0 ? rectangleStart!.y : rectangleStart!.y + height,
      });
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
      const { updateElement } = useAppStore.getState();
      updateElement(currentCircleId!, {
        width: finalWidth,
        height: finalHeight,
        x: width >= 0 ? circleStart!.x : circleStart!.x + width,
        y: height >= 0 ? circleStart!.y : circleStart!.y + height,
      });
    }
    
    // Reset circle drawing state
    setIsDrawingCircle(false);
    setCircleStart(null);
    setCurrentCircleId(null);
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
      const { updateElement } = useAppStore.getState();
      updateElement(currentLineId!, {
        width: deltaX,
        height: deltaY,
      });
    }
    
    // Reset line drawing state
    setIsDrawingLine(false);
    setLineStart(null);
    setCurrentLineId(null);
    
    // Remove global event listeners if no other drawing is active
    if (!isDrawingArrow && !isDrawingRectangle && !isDrawingCircle) {
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
      const { updateElement } = useAppStore.getState();
      updateElement(currentArrowId!, {
        width: deltaX,
        height: deltaY,
      });
    }
    
    // Reset arrow drawing state
    setIsDrawingArrow(false);
    setArrowStart(null);
    setCurrentArrowId(null);
    
    // Remove global event listeners if no other drawing is active
    if (!isDrawingLine && !isDrawingRectangle && !isDrawingCircle) {
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
    
    
    
    // Check for space+drag panning
    if (keyboardManager.isSpacePressedNow()) {
      setIsPanning(true);
      setPanStart(point);
      panStartViewport.current = { ...viewport.pan };
      return;
    }
    
    // Check if we're clicking on an existing element (for selection)
    if (activeTool === 'select') {
      const clickedElement = elements
        .filter(element => !element.locked) // Skip locked elements
        .slice() // Create a copy before reversing to avoid mutating the original array
        .reverse() // Search from front to back (newest to oldest)
        .find(element => {
        // Special hit testing for pen strokes
        if (element.type === 'pen' && element.points && element.points.length > 1) {
          // Check if click is near any segment of the pen stroke
          const tolerance = Math.max(element.strokeWidth * 2, 8) / viewport.zoom; // Scale tolerance by zoom
          
          for (let i = 0; i < element.points.length - 1; i++) {
            const p1 = element.points[i];
            const p2 = element.points[i + 1];
            
            // Calculate distance from point to line segment
            const A = worldPoint.x - p1.x;
            const B = worldPoint.y - p1.y;
            const C = p2.x - p1.x;
            const D = p2.y - p1.y;
            
            const dot = A * C + B * D;
            const lenSq = C * C + D * D;
            
            if (lenSq === 0) continue; // p1 and p2 are the same point
            
            let param = dot / lenSq;
            param = Math.max(0, Math.min(1, param)); // Clamp to segment
            
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
        
        // Special hit testing for lines and arrows (linear elements)
        if (element.type === 'line' || element.type === 'arrow') {
          const tolerance = Math.max(element.strokeWidth * 2, 12) / viewport.zoom; // Generous tolerance for lines/arrows
          
          // For lines and arrows, we need to check distance to the actual line, not the bounding box
          const startX = element.x;
          const startY = element.y;
          const endX = element.x + element.width;
          const endY = element.y + element.height;
          
          // Calculate distance from click point to line segment
          const A = worldPoint.x - startX;
          const B = worldPoint.y - startY;
          const C = endX - startX;
          const D = endY - startY;
          
          const dot = A * C + B * D;
          const lenSq = C * C + D * D;
          
          if (lenSq === 0) {
            // Start and end points are the same (degenerate line)
            const distance = Math.sqrt(A * A + B * B);
            return distance <= tolerance;
          }
          
          let param = dot / lenSq;
          param = Math.max(0, Math.min(1, param)); // Clamp to segment
          
          const closestX = startX + param * C;
          const closestY = startY + param * D;
          
          const distance = Math.sqrt(
            (worldPoint.x - closestX) * (worldPoint.x - closestX) + 
            (worldPoint.y - closestY) * (worldPoint.y - closestY)
          );
          
          return distance <= tolerance;
        }
        
        // Standard bounding box hit testing for other elements
        return worldPoint.x >= element.x && 
               worldPoint.x <= element.x + element.width &&
               worldPoint.y >= element.y && 
               worldPoint.y <= element.y + element.height;
      });
      
      if (clickedElement) {
        // Check for modifier keys
        const isShiftClick = event.shiftKey;
        const isSelectedElement = selectedElementIds.includes(clickedElement.id);
        
        if (isShiftClick) {
          // Shift+Click: Toggle element in selection
          toggleSelection(clickedElement.id);
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
          selectElement(clickedElement.id);
          return;
        }
      } else {
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
    }
  };


  const handleCanvasMouseMove = (point: Point, event: MouseEvent) => {
    // Transform canvas coordinates to world coordinates for consistent element manipulation
    const worldPoint = {
      x: point.x / viewport.zoom + viewport.pan.x,
      y: point.y / viewport.zoom + viewport.pan.y,
    };
    
    // DEBUG: Log mouse move events
    
    if (isPanning && panStart && panStartViewport.current) {
      const dx = point.x - panStart.x;
      const dy = point.y - panStart.y;
      setPan({
        x: panStartViewport.current.x - dx / viewport.zoom,
        y: panStartViewport.current.y - dy / viewport.zoom,
      });
    }
    
    // Handle rectangle drawing with world coordinates
    if (isDrawingRectangle && rectangleStart && currentRectangleId) {
      handleRectangleDrawingCanvasMove(worldPoint);
    }
    
    // Handle circle drawing with world coordinates
    if (isDrawingCircle && circleStart && currentCircleId) {
      handleCircleDrawingCanvasMove(worldPoint);
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
      // Apply grid and magnetic snapping to drag movement
      const snappedTargetPoint = applySnapping(worldPoint);
      const finalDelta = {
        x: snappedTargetPoint.x - dragStart.x,
        y: snappedTargetPoint.y - dragStart.y
      };
      
      // Update all selected elements based on their initial positions
      const { updateElementSilent } = useAppStore.getState();
      selectedElementIds.forEach(elementId => {
        const initialPosition = dragStartPositions.get(elementId);
        if (initialPosition) {
          updateElementSilent(elementId, { 
            x: initialPosition.x + finalDelta.x,
            y: initialPosition.y + finalDelta.y
          });
        }
      });
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
    
    // Handle rectangle drawing completion
    if (isDrawingRectangle && rectangleStart && currentRectangleId) {
      handleRectangleDrawingCanvasUp(worldPoint);
    }
    
    // Handle circle drawing completion
    if (isDrawingCircle && circleStart && currentCircleId) {
      handleCircleDrawingCanvasUp(worldPoint);
    }
    
    // Handle pen drawing completion
    if (isDrawingPen && currentPenId) {
      // Save final pen drawing to history
      saveToHistory();
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
    
    // Transform canvas coordinates to world coordinates
    const worldPoint = {
      x: (point.x - viewport.pan.x) / viewport.zoom,
      y: (point.y - viewport.pan.y) / viewport.zoom,
    };
    
    // Find element at the clicked position (front-to-back search)
    const hitElement = elements
      .filter((el) => !el.locked) // Skip locked elements
      .slice() // Prevent array mutation
      .reverse() // Search from front to back (newest to oldest)
      .find((element) => {
        // Hit test for different element types
        switch (element.type) {
          case 'rectangle':
            return (
              worldPoint.x >= element.x &&
              worldPoint.x <= element.x + element.width &&
              worldPoint.y >= element.y &&
              worldPoint.y <= element.y + element.height
            );
          case 'circle': {
            const centerX = element.x + element.width / 2;
            const centerY = element.y + element.height / 2;
            const radiusX = element.width / 2;
            const radiusY = element.height / 2;
            const dx = (worldPoint.x - centerX) / radiusX;
            const dy = (worldPoint.y - centerY) / radiusY;
            return dx * dx + dy * dy <= 1;
          }
          case 'line':
          case 'arrow': {
            // Simple line hit test with tolerance
            const tolerance = Math.max(element.strokeWidth * 2, 10);
            const lineStart = { x: element.x, y: element.y };
            const lineEnd = { x: element.x + element.width, y: element.y + element.height };
            const distance = pointToLineDistance(worldPoint, lineStart, lineEnd);
            return distance <= tolerance;
          }
          default:
            return false;
        }
      });

    if (hitElement) {

      // Start direct text editing within the shape
      startTextEditing(hitElement.id, hitElement.text || '', hitElement.text ? hitElement.text.length : 0);
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
    
    if (textEditing.isEditing) {
      // Toggle cursor visibility every 500ms
      interval = setInterval(() => {
        toggleCursor();
      }, 500);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [textEditing.isEditing, toggleCursor]);

  // Handle keyboard input for direct text editing
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!textEditing.isEditing || !textEditing.elementId) return;
      
      const currentText = textEditing.text;
      const cursorPos = textEditing.cursorPosition;
      
      // Prevent default behavior for text editing keys
      if (event.key === 'Escape') {
        event.preventDefault();
        finishTextEditing();
      } else if (event.key === 'Enter') {
        event.preventDefault();
        // Add line break at cursor position
        const newText = currentText.slice(0, cursorPos) + '\n' + currentText.slice(cursorPos);
        updateTextContent(newText, cursorPos + 1);
      } else if (event.key === 'Backspace') {
        event.preventDefault();
        if (cursorPos > 0) {
          const newText = currentText.slice(0, cursorPos - 1) + currentText.slice(cursorPos);
          updateTextContent(newText, cursorPos - 1);
        }
      } else if (event.key === 'Delete') {
        event.preventDefault();
        if (cursorPos < currentText.length) {
          const newText = currentText.slice(0, cursorPos) + currentText.slice(cursorPos + 1);
          updateTextContent(newText, cursorPos);
        }
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        updateTextContent(currentText, Math.max(0, cursorPos - 1));
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        updateTextContent(currentText, Math.min(currentText.length, cursorPos + 1));
      } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        // Regular character input
        event.preventDefault();
        const newText = currentText.slice(0, cursorPos) + event.key + currentText.slice(cursorPos);
        updateTextContent(newText, cursorPos + 1);
      }
    };

    // Handle clicks outside to finish editing
    const handleClickOutside = (event: MouseEvent) => {
      if (!textEditing.isEditing) return;
      
      const canvas = canvasRef.current;
      if (canvas && !canvas.contains(event.target as Node)) {
        finishTextEditing();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [textEditing, updateTextContent, finishTextEditing]);

  // Set up keyboard shortcuts
  useEffect(() => {
    keyboardManager.on('setTool', setActiveTool);
    keyboardManager.on('undo', undo);
    keyboardManager.on('redo', redo);
    keyboardManager.on('delete', deleteSelectedElements);
    keyboardManager.on('duplicate', duplicateSelectedElements);
    keyboardManager.on('selectAll', selectAll);
    keyboardManager.on('selectNext', selectNext);
    keyboardManager.on('selectPrevious', selectPrevious);
    keyboardManager.on('copy', copy);
    keyboardManager.on('paste', paste);
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
      keyboardManager.off('selectAll');
      keyboardManager.off('selectNext');
      keyboardManager.off('selectPrevious');
      keyboardManager.off('copy');
      keyboardManager.off('paste');
      keyboardManager.off('copyStyle');
      keyboardManager.off('pasteStyle');
      keyboardManager.off('resetZoom');
      keyboardManager.off('zoomToFit');
      keyboardManager.off('toggleGrid');
    };
  }, [setActiveTool, undo, redo, deleteSelectedElements, duplicateSelectedElements, selectAll, selectNext, selectPrevious, copy, paste, copyStyle, pasteStyle, resetZoom, zoomToFit, toggleGrid]);

  return (
    <div className="excalibox-app">
      <TopToolbar />
      <PropertiesPanel />
      <ZoomControl />
      
      {/* Grid Configuration Dialog */}
      <GridDialog 
        isOpen={ui.dialogs.gridDialog}
        onClose={closeGridDialog}
      />
      
      <main 
        className="app-main"
        style={{
          marginTop: '64px', // Account for top toolbar
          // Remove marginLeft - properties panel is now absolute overlay
          width: '100%',
          height: `${windowSize.height - 64}px`
        }}
      >
        <Canvas
          ref={canvasRef}
          width={windowSize.width} // Full width - panel is overlay
          height={windowSize.height - 64}
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
