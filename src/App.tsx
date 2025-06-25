// ABOUTME: Main application component that renders the Excalibox drawing interface
// ABOUTME: Orchestrates the Canvas, Toolbar, and manages global application state

import { useEffect, useRef, useState } from 'react';
import { Canvas } from './components/Canvas';
import { useAppStore } from './store';
import { keyboardManager } from './utils/keyboard';
import type { Point } from './types';
import './App.css';

function App() {
  const { 
    viewport, 
    elements, 
    addElement, 
    activeTool, 
    toolOptions,
    setActiveTool,
    undo,
    redo,
    deleteSelectedElements,
    selectAll,
    copy,
    paste,
    resetZoom,
    zoomToFit,
    setZoom,
    setPan
  } = useAppStore();
  
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Point | null>(null);
  const panStartViewport = useRef<Point | null>(null);

  const handleCanvasMouseDown = (point: Point, event: MouseEvent) => {
    // Check for space+drag panning
    if (keyboardManager.isSpacePressedNow()) {
      setIsPanning(true);
      setPanStart(point);
      panStartViewport.current = { ...viewport.pan };
      return;
    }
    
    console.log('Mouse down at:', point);
    
    const modifiers = keyboardManager.getModifierState();
    
    if (activeTool === 'rectangle') {
      let width = 100;
      let height = 50;
      
      // Constrain to square with Shift
      if (modifiers.shift) {
        height = width;
      }
      
      addElement({
        type: 'rectangle',
        x: point.x,
        y: point.y,
        width,
        height,
        angle: 0,
        strokeColor: toolOptions.strokeColor,
        backgroundColor: toolOptions.backgroundColor,
        strokeWidth: toolOptions.strokeWidth,
        roughness: toolOptions.roughness,
        opacity: toolOptions.opacity,
      });
    } else if (activeTool === 'circle') {
      let width = 80;
      let height = 80;
      
      // Allow ellipse without Shift, keep circle with Shift
      if (!modifiers.shift) {
        height = 60; // Make it an ellipse by default
      }
      
      addElement({
        type: 'circle',
        x: point.x,
        y: point.y,
        width,
        height,
        angle: 0,
        strokeColor: toolOptions.strokeColor,
        backgroundColor: toolOptions.backgroundColor,
        strokeWidth: toolOptions.strokeWidth,
        roughness: toolOptions.roughness,
        opacity: toolOptions.opacity,
      });
    }
  };

  const handleCanvasMouseMove = (point: Point, event: MouseEvent) => {
    if (isPanning && panStart && panStartViewport.current) {
      const deltaX = point.x - panStart.x;
      const deltaY = point.y - panStart.y;
      
      setPan({
        x: panStartViewport.current.x + deltaX,
        y: panStartViewport.current.y + deltaY,
      });
    }
  };

  const handleCanvasMouseUp = (point: Point, event: MouseEvent) => {
    if (isPanning) {
      setIsPanning(false);
      setPanStart(null);
      panStartViewport.current = null;
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
      <header className="app-header">
        <h1>Excalibox</h1>
        <div className="tool-selector">
          <button 
            className={activeTool === 'select' ? 'active' : ''}
            onClick={() => useAppStore.getState().setActiveTool('select')}
          >
            Select
          </button>
          <button 
            className={activeTool === 'rectangle' ? 'active' : ''}
            onClick={() => useAppStore.getState().setActiveTool('rectangle')}
          >
            Rectangle
          </button>
          <button 
            className={activeTool === 'circle' ? 'active' : ''}
            onClick={() => useAppStore.getState().setActiveTool('circle')}
          >
            Circle
          </button>
        </div>
      </header>
      
      <main className="app-main">
        <Canvas
          width={viewport.bounds.width}
          height={viewport.bounds.height}
          elements={elements}
          viewport={viewport}
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
