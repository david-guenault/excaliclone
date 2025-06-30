// ABOUTME: Simple color palette for properties panel with 6 elements per row
// ABOUTME: 5 predefined colors + 1 current color element with color picker access

import React, { useState } from 'react';

interface SimpleColorPaletteProps {
  label: string;
  predefinedColors: readonly string[];
  currentColor: string;
  onColorChange: (color: string) => void;
  className?: string;
}

export const SimpleColorPalette: React.FC<SimpleColorPaletteProps> = ({
  label,
  predefinedColors,
  currentColor,
  onColorChange,
  className = '',
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customColor, setCustomColor] = useState(currentColor);

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomColor(e.target.value);
  };

  const handleCustomColorSubmit = () => {
    onColorChange(customColor);
    setShowColorPicker(false);
  };

  const handleCustomColorKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCustomColorSubmit();
    } else if (e.key === 'Escape') {
      setShowColorPicker(false);
      setCustomColor(currentColor);
    }
  };

  const isTransparent = (color: string) => color === 'transparent';

  return (
    <div className={`simple-color-palette ${className}`}>
      <h4 className="properties-panel__section-title">{label}</h4>
      <div className="simple-color-palette__row">
        {/* 5 predefined colors */}
        {predefinedColors.map((color) => (
          <button
            key={color}
            className={`simple-color-palette__swatch ${
              currentColor === color ? 'active' : ''
            }`}
            style={{ 
              backgroundColor: isTransparent(color) ? '#ffffff' : color,
              border: isTransparent(color) ? '1px dashed #ccc' : 'none'
            }}
            onClick={() => onColorChange(color)}
            aria-label={`Select ${color} color`}
            title={color}
          >
            {isTransparent(color) && (
              <span style={{ fontSize: '10px', color: '#666' }}>∅</span>
            )}
          </button>
        ))}
        
        {/* 6th element: current color + color picker */}
        <div className="simple-color-palette__current-wrapper">
          <button
            className="simple-color-palette__current"
            style={{ 
              backgroundColor: isTransparent(currentColor) ? '#ffffff' : currentColor,
              border: isTransparent(currentColor) ? '1px dashed #ccc' : 'none'
            }}
            onClick={() => setShowColorPicker(!showColorPicker)}
            aria-label="Open color picker"
            title={`Current: ${currentColor}`}
          >
            {isTransparent(currentColor) && (
              <span style={{ fontSize: '10px', color: '#666' }}>∅</span>
            )}
          </button>
          
          {showColorPicker && (
            <div className="simple-color-palette__picker">
              <input
                type="color"
                value={isTransparent(customColor) ? '#000000' : customColor}
                onChange={handleCustomColorChange}
                className="simple-color-palette__color-input"
              />
              <input
                type="text"
                value={customColor}
                onChange={handleCustomColorChange}
                onKeyDown={handleCustomColorKeyPress}
                placeholder="#ffffff"
                className="simple-color-palette__hex-input"
                autoFocus
              />
              <div className="simple-color-palette__picker-buttons">
                <button
                  onClick={handleCustomColorSubmit}
                  className="simple-color-palette__picker-apply"
                  title="Apply color"
                >
                  ✓
                </button>
                <button
                  onClick={() => {
                    setShowColorPicker(false);
                    setCustomColor(currentColor);
                  }}
                  className="simple-color-palette__picker-cancel"
                  title="Cancel"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};