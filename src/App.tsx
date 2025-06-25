// ABOUTME: Main application component that renders the Excalibox drawing interface
// ABOUTME: Orchestrates the Canvas, Toolbar, and manages global application state

import { Canvas } from './components/Canvas';
import { useAppStore } from './store';
import type { Point } from './types';
import './App.css';

function App() {
  const { viewport, elements, addElement, activeTool, toolOptions } = useAppStore();

  const handleCanvasMouseDown = (point: Point) => {
    console.log('Mouse down at:', point);
    
    if (activeTool === 'rectangle') {
      addElement({
        type: 'rectangle',
        x: point.x,
        y: point.y,
        width: 100,
        height: 50,
        angle: 0,
        strokeColor: toolOptions.strokeColor,
        backgroundColor: toolOptions.backgroundColor,
        strokeWidth: toolOptions.strokeWidth,
        roughness: toolOptions.roughness,
        opacity: toolOptions.opacity,
      });
    } else if (activeTool === 'circle') {
      addElement({
        type: 'circle',
        x: point.x,
        y: point.y,
        width: 80,
        height: 80,
        angle: 0,
        strokeColor: toolOptions.strokeColor,
        backgroundColor: toolOptions.backgroundColor,
        strokeWidth: toolOptions.strokeWidth,
        roughness: toolOptions.roughness,
        opacity: toolOptions.opacity,
      });
    }
  };

  const handleCanvasMouseMove = (_point: Point) => {
    // Handle drawing preview, drag operations, etc.
  };

  const handleCanvasMouseUp = (_point: Point) => {
    // Handle end of drawing operations
  };

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
        />
      </main>
    </div>
  );
}

export default App;
