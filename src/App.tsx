// ABOUTME: Main application component that renders the Excalibox drawing interface
// ABOUTME: Orchestrates the Canvas, Toolbar, and manages global application state

import { useEffect, useRef, useState } from 'react';
import { Canvas } from './components/Canvas';
import { TopToolbar } from './components/TopToolbar';
import { PropertiesPanel } from './components/PropertiesPanel';
import { useAppStore } from './store';
import { keyboardManager } from './utils/keyboard';
import { LINE_CONFIG, ARROW_CONFIG } from './constants';
import { snapPointToGridWithDistance } from './utils/grid';
import type { Point } from './types';
import './App.css';

function App() {
  const { 
    viewport, 
    elements, 
    addElement, 
    activeTool, 
    toolOptions,
    ui,
    selectedElementIds,
    setActiveTool,
    selectElement,
    selectElements,
    clearSelection,
    undo,
    redo,
    deleteSelectedElements,
    selectAll,
    copy,
    paste,
    resetZoom,
    zoomToFit,
    setZoom,
    setPan,
    saveToHistory
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
  
  // Element dragging state
  const [isDraggingElements, setIsDraggingElements] = useState(false);
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [dragStartPositions, setDragStartPositions] = useState<Map<string, Point>>(new Map());
  
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
    
    // Apply grid snapping to end point
    const snappedPoint = ui.grid ? snapPointToGridWithDistance(point, ui.grid) : point;
    
    // Update the line while drawing
    const modifiers = keyboardManager.getModifierState();
    const endPoint = snapAngle(lineStart!, snappedPoint, modifiers.shift);
    
    const { updateElement } = useAppStore.getState();
    updateElement(currentLineId!, {
      width: endPoint.x - lineStart!.x,
      height: endPoint.y - lineStart!.y,
    });
  };

  const handleArrowDrawingMouseMove = (event: MouseEvent) => {
    const point = getCanvasPoint(event);
    if (!point) return;
    
    // Apply grid snapping to end point
    const snappedPoint = ui.grid ? snapPointToGridWithDistance(point, ui.grid) : point;
    
    // Update the arrow while drawing
    const modifiers = keyboardManager.getModifierState();
    const endPoint = snapAngle(arrowStart!, snappedPoint, modifiers.shift);
    
    const { updateElement } = useAppStore.getState();
    updateElement(currentArrowId!, {
      width: endPoint.x - arrowStart!.x,
      height: endPoint.y - arrowStart!.y,
    });
  };

  // NOTE: Removed global rectangle and circle mouse move handlers
  // These tools now use Canvas events exclusively for better coordinate handling

  // New Canvas-based handlers for better coordinate handling
  const handleRectangleDrawingCanvasMove = (point: Point) => {
    // Apply grid snapping to end point
    const snappedPoint = ui.grid ? snapPointToGridWithDistance(point, ui.grid) : point;
    
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
    
    const { updateElement } = useAppStore.getState();
    updateElement(currentRectangleId!, finalUpdate);
  };

  const handleCircleDrawingCanvasMove = (point: Point) => {
    // Apply grid snapping to end point
    const snappedPoint = ui.grid ? snapPointToGridWithDistance(point, ui.grid) : point;
    
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
    
    const { updateElement } = useAppStore.getState();
    updateElement(currentCircleId!, finalUpdate);
  };

  const handleRectangleDrawingCanvasUp = (point: Point) => {
    // Apply grid snapping to final end point
    const snappedPoint = ui.grid ? snapPointToGridWithDistance(point, ui.grid) : point;
    
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
    // Apply grid snapping to final end point
    const snappedPoint = ui.grid ? snapPointToGridWithDistance(point, ui.grid) : point;
    
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
    
    // Apply grid snapping to final end point
    const snappedPoint = ui.grid ? snapPointToGridWithDistance(point, ui.grid) : point;
    
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
    
    // Apply grid snapping to final end point
    const snappedPoint = ui.grid ? snapPointToGridWithDistance(point, ui.grid) : point;
    
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

  const completeDragSelection = () => {
    if (!dragSelectionStart || !dragSelectionEnd) return;
    
    // Calculate selection rectangle bounds
    const selectionRect = {
      x: Math.min(dragSelectionStart.x, dragSelectionEnd.x),
      y: Math.min(dragSelectionStart.y, dragSelectionEnd.y),
      width: Math.abs(dragSelectionEnd.x - dragSelectionStart.x),
      height: Math.abs(dragSelectionEnd.y - dragSelectionStart.y),
    };
    
    // Find elements that intersect with the selection rectangle
    const selectedElementIds = elements
      .filter(element => {
        // Check if element intersects with selection rectangle
        const elementRight = element.x + element.width;
        const elementBottom = element.y + element.height;
        const selectionRight = selectionRect.x + selectionRect.width;
        const selectionBottom = selectionRect.y + selectionRect.height;
        
        return !(
          element.x > selectionRight ||
          elementRight < selectionRect.x ||
          element.y > selectionBottom ||
          elementBottom < selectionRect.y
        );
      })
      .map(element => element.id);
    
    // Select the elements
    if (selectedElementIds.length > 0) {
      selectElements(selectedElementIds);
    } else {
      clearSelection();
    }
    
    // Reset drag selection state
    setIsDragSelecting(false);
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

  const handleCanvasMouseDown = (point: Point, _event: MouseEvent) => {
    // Check for space+drag panning
    if (keyboardManager.isSpacePressedNow()) {
      setIsPanning(true);
      setPanStart(point);
      panStartViewport.current = { ...viewport.pan };
      return;
    }
    
    // Check if we're clicking on an existing element (for selection)
    if (activeTool === 'select') {
      const clickedElement = elements.find(element => {
        return point.x >= element.x && 
               point.x <= element.x + element.width &&
               point.y >= element.y && 
               point.y <= element.y + element.height;
      });
      
      if (clickedElement) {
        // If clicking on a selected element, start dragging
        if (selectedElementIds.includes(clickedElement.id)) {
          setIsDraggingElements(true);
          setDragStart(point);
          
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
          // Single element selection
          selectElement(clickedElement.id);
          return;
        }
      } else {
        // Start drag selection on empty area
        const snappedPoint = ui.grid ? snapPointToGridWithDistance(point, ui.grid) : point;
        setIsDragSelecting(true);
        setDragSelectionStart(snappedPoint);
        setDragSelectionEnd(snappedPoint);
        clearSelection();
        return;
      }
    }
    
    if (activeTool === 'rectangle') {
      // Apply grid snapping to start point
      const snappedPoint = ui.grid ? snapPointToGridWithDistance(point, ui.grid) : point;
      
      // Start rectangle drawing
      setIsDrawingRectangle(true);
      setRectangleStart(snappedPoint);
      
      // Create a temporary rectangle element with minimal size
      const createdElement = addElement({
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
      // Apply grid snapping to start point
      const snappedPoint = ui.grid ? snapPointToGridWithDistance(point, ui.grid) : point;
      
      // Start circle drawing
      setIsDrawingCircle(true);
      setCircleStart(snappedPoint);
      
      // Create a temporary circle element with minimal size
      const createdElement = addElement({
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
      // Apply grid snapping to start point
      const snappedPoint = ui.grid ? snapPointToGridWithDistance(point, ui.grid) : point;
      
      // Start line drawing
      setIsDrawingLine(true);
      setLineStart(snappedPoint);
      
      // Create a temporary line element
      const createdElement = addElement({
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
        fillStyle: 'transparent', // Lines don't use fill
        roughness: toolOptions.roughness,
        opacity: toolOptions.opacity,
      });
      
      setCurrentLineId(createdElement.id);
      
      // Add global event listeners for line drawing
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    } else if (activeTool === 'arrow') {
      // Apply grid snapping to start point
      const snappedPoint = ui.grid ? snapPointToGridWithDistance(point, ui.grid) : point;
      
      // Start arrow drawing
      setIsDrawingArrow(true);
      setArrowStart(snappedPoint);
      
      // Create a temporary arrow element
      const createdElement = addElement({
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
        fillStyle: 'transparent', // Arrows don't use fill
        roughness: toolOptions.roughness,
        opacity: toolOptions.opacity,
        endArrowHead: ARROW_CONFIG.DEFAULT_ARROWHEAD, // Default triangle arrowhead at end
        startArrowHead: 'none', // No arrowhead at start by default
      });
      
      setCurrentArrowId(createdElement.id);
      
      // Add global event listeners for arrow drawing
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }
  };


  const handleCanvasMouseMove = (point: Point, event: MouseEvent) => {
    
    if (isPanning && panStart && panStartViewport.current) {
      const dx = point.x - panStart.x;
      const dy = point.y - panStart.y;
      setPan({
        x: panStartViewport.current.x - dx / viewport.zoom,
        y: panStartViewport.current.y - dy / viewport.zoom,
      });
    }
    
    // Handle rectangle drawing directly with Canvas coordinates
    if (isDrawingRectangle && rectangleStart && currentRectangleId) {
      handleRectangleDrawingCanvasMove(point);
    }
    
    // Handle circle drawing directly with Canvas coordinates
    if (isDrawingCircle && circleStart && currentCircleId) {
      handleCircleDrawingCanvasMove(point);
    }
    
    // Handle element dragging
    if (isDraggingElements && dragStart && dragStartPositions.size > 0) {
      const deltaX = point.x - dragStart.x;
      const deltaY = point.y - dragStart.y;
      
      // Apply grid snapping to drag movement if grid is enabled
      const finalDelta = ui.grid && ui.grid.snapToGrid ? {
        x: Math.round(deltaX / ui.grid.size) * ui.grid.size,
        y: Math.round(deltaY / ui.grid.size) * ui.grid.size
      } : { x: deltaX, y: deltaY };
      
      // Update all selected elements based on their initial positions
      const { updateElement } = useAppStore.getState();
      selectedElementIds.forEach(elementId => {
        const initialPosition = dragStartPositions.get(elementId);
        if (initialPosition) {
          updateElement(elementId, { 
            x: initialPosition.x + finalDelta.x,
            y: initialPosition.y + finalDelta.y
          });
        }
      });
    }
    
    // Handle drag selection
    if (isDragSelecting && dragSelectionStart) {
      const snappedPoint = ui.grid ? snapPointToGridWithDistance(point, ui.grid) : point;
      setDragSelectionEnd(snappedPoint);
    }
    
    // Delegate to global mouse move for line/arrow operations only
    // (Rectangle and circle events are handled above with Canvas coordinates)
    if (isDrawingLine || isDrawingArrow) {
      handleGlobalMouseMove(event);
    }
  };

  const handleCanvasMouseUp = (point: Point, event: MouseEvent) => {
    
    if (isPanning) {
      setIsPanning(false);
      setPanStart(null);
      panStartViewport.current = null;
    }
    
    // Handle rectangle drawing completion
    if (isDrawingRectangle && rectangleStart && currentRectangleId) {
      handleRectangleDrawingCanvasUp(point);
    }
    
    // Handle circle drawing completion
    if (isDrawingCircle && circleStart && currentCircleId) {
      handleCircleDrawingCanvasUp(point);
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
    if (isDragSelecting && dragSelectionStart && dragSelectionEnd) {
      completeDragSelection();
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
      
      const zoomDelta = event.deltaY > 0 ? -0.1 : 0.1;
      const newZoom = Math.max(0.1, Math.min(5, viewport.zoom + zoomDelta));
      setZoom(newZoom);
    }
  };

  // Set up keyboard shortcuts
  useEffect(() => {
    keyboardManager.on('setTool', setActiveTool);
    keyboardManager.on('undo', undo);
    keyboardManager.on('redo', redo);
    keyboardManager.on('delete', deleteSelectedElements);
    keyboardManager.on('selectAll', selectAll);
    keyboardManager.on('copy', copy);
    keyboardManager.on('paste', paste);
    keyboardManager.on('resetZoom', resetZoom);
    keyboardManager.on('zoomToFit', zoomToFit);

    return () => {
      keyboardManager.off('setTool');
      keyboardManager.off('undo');
      keyboardManager.off('redo');
      keyboardManager.off('delete');
      keyboardManager.off('selectAll');
      keyboardManager.off('copy');
      keyboardManager.off('paste');
      keyboardManager.off('resetZoom');
      keyboardManager.off('zoomToFit');
    };
  }, [setActiveTool, undo, redo, deleteSelectedElements, selectAll, copy, paste, resetZoom, zoomToFit]);

  return (
    <div className="excalibox-app">
      <TopToolbar />
      <PropertiesPanel />
      
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
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onWheel={handleCanvasWheel}
        />
      </main>
    </div>
  );
}

export default App;
