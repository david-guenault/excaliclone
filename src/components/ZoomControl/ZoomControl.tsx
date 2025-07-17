// ABOUTME: Bottom-left zoom control component with zoom out, percentage display, and zoom in buttons
// ABOUTME: Integrates with viewport zoom system and provides accessible UI for zoom operations

import React from 'react';
import { useAppStore } from '../../store';
import { CANVAS_CONFIG } from '../../constants';
import { Minus, Plus } from 'react-feather';
import './ZoomControl.css';

export const ZoomControl: React.FC = () => {
  const { viewport, zoomIn, zoomOut } = useAppStore();
  
  // Format zoom as percentage, handle edge cases
  const formatZoomPercentage = (zoom: number): string => {
    if (isNaN(zoom) || zoom <= 0) {
      return '100%'; // fallback for invalid values
    }
    return `${Math.round(zoom * 100)}%`;
  };

  const currentZoom = viewport?.zoom ?? 1;
  const zoomPercentage = formatZoomPercentage(currentZoom);
  
  // Check if buttons should be disabled
  const isMinZoom = currentZoom <= CANVAS_CONFIG.MIN_ZOOM;
  const isMaxZoom = currentZoom >= CANVAS_CONFIG.MAX_ZOOM;
  
  // Handle button clicks with safety checks
  const handleZoomOut = () => {
    if (zoomOut && !isMinZoom) {
      zoomOut();
    }
  };

  const handleZoomIn = () => {
    if (zoomIn && !isMaxZoom) {
      zoomIn();
    }
  };

  return (
    <div 
      className="zoom-control"
      role="region"
      aria-label="Zoom control"
    >
      <button
        className="zoom-control__button zoom-control__button--out"
        onClick={handleZoomOut}
        disabled={isMinZoom || !zoomOut}
        aria-label="Zoom out"
        title="Zoom out (Ctrl + scroll down)"
        type="button"
      >
        <Minus size={16} />
      </button>
      
      <span 
        className="zoom-control__percentage"
        aria-live="polite"
        aria-label={`Current zoom level: ${zoomPercentage}`}
      >
        {zoomPercentage}
      </span>
      
      <button
        className="zoom-control__button zoom-control__button--in"
        onClick={handleZoomIn}
        disabled={isMaxZoom || !zoomIn}
        aria-label="Zoom in"
        title="Zoom in (Ctrl + scroll up)"
        type="button"
      >
        <Plus size={16} />
      </button>
    </div>
  );
};