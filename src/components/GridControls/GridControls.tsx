// ABOUTME: Grid controls component for grid configuration UI
// ABOUTME: Provides toggle, size controls, and snap settings for the grid system

import React from 'react';
import type { GridSettings } from '../../types';
import { GRID_SIZE_PRESETS } from '../../constants';
import './GridControls.css';

interface GridControlsProps {
  gridSettings: GridSettings;
  onGridEnabledChange: (enabled: boolean) => void;
  onGridSizeChange: (size: number) => void;
  onGridSnapEnabledChange: (enabled: boolean) => void;
  onGridVisibleChange: (visible: boolean) => void;
  onGridSnapDistanceChange: (distance: number) => void;
  className?: string;
}

export const GridControls: React.FC<GridControlsProps> = ({
  gridSettings,
  onGridEnabledChange,
  onGridSizeChange,
  onGridSnapEnabledChange,
  onGridVisibleChange,
  onGridSnapDistanceChange,
  className = '',
}) => {
  const {
    enabled,
    size,
    snapToGrid,
    snapDistance,
    showGrid,
  } = gridSettings;

  return (
    <div className={`grid-controls ${className}`}>
      <div className="grid-controls__header">
        <h4 className="grid-controls__title">Grid</h4>
        <label className="grid-controls__toggle">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onGridEnabledChange(e.target.checked)}
            aria-label="Enable grid system"
          />
          <span className="grid-controls__toggle-slider"></span>
        </label>
      </div>

      {enabled && (
        <div className="grid-controls__content">
          {/* Grid Visibility */}
          <div className="grid-controls__section">
            <label className="grid-controls__checkbox">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => onGridVisibleChange(e.target.checked)}
              />
              Show grid lines
            </label>
          </div>

          {/* Grid Size */}
          <div className="grid-controls__section">
            <label className="grid-controls__label">Grid Size</label>
            <div className="grid-controls__size-container">
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={size}
                onChange={(e) => onGridSizeChange(parseInt(e.target.value))}
                className="grid-controls__slider"
                aria-label="Grid size"
              />
              <span className="grid-controls__size-value">{size}px</span>
            </div>
            
            {/* Size Presets */}
            <div className="grid-controls__presets">
              {GRID_SIZE_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  className={`grid-controls__preset ${
                    size === preset.value ? 'grid-controls__preset--active' : ''
                  }`}
                  onClick={() => onGridSizeChange(preset.value)}
                  title={`${preset.name} (${preset.value}px)`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Snap to Grid */}
          <div className="grid-controls__section">
            <label className="grid-controls__checkbox">
              <input
                type="checkbox"
                checked={snapToGrid}
                onChange={(e) => onGridSnapEnabledChange(e.target.checked)}
              />
              Snap to grid
            </label>
          </div>

          {/* Snap Distance */}
          {snapToGrid && (
            <div className="grid-controls__section">
              <label className="grid-controls__label">Snap Distance</label>
              <div className="grid-controls__distance-container">
                <input
                  type="range"
                  min="1"
                  max="50"
                  step="1"
                  value={snapDistance}
                  onChange={(e) => onGridSnapDistanceChange(parseInt(e.target.value))}
                  className="grid-controls__slider grid-controls__slider--small"
                  aria-label="Snap distance"
                />
                <span className="grid-controls__distance-value">{snapDistance}px</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};