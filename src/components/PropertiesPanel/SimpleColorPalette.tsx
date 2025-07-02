// ABOUTME: Simple color palette for properties panel with 6 elements per row
// ABOUTME: 5 predefined colors + 1 current color element with advanced color picker access

import React, { useState, useRef } from 'react';
import { AdvancedColorPicker } from './AdvancedColorPicker';
import './AdvancedColorPicker.css';

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
  const [showAdvancedPicker, setShowAdvancedPicker] = useState(false);
  const [pickerPosition, setPickerPosition] = useState({ x: 0, y: 0 });
  const currentButtonRef = useRef<HTMLButtonElement>(null);

  const handleAdvancedPickerOpen = () => {
    if (currentButtonRef.current) {
      const rect = currentButtonRef.current.getBoundingClientRect();
      setPickerPosition({
        x: rect.right + 8, // Position to the right of the button
        y: rect.top
      });
    }
    setShowAdvancedPicker(true);
  };

  const handleAdvancedPickerClose = () => {
    setShowAdvancedPicker(false);
  };

  const handleAdvancedColorSelect = (color: string) => {
    onColorChange(color);
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
        
        {/* 6th element: current color + advanced color picker */}
        <div className="simple-color-palette__current-wrapper">
          <button
            ref={currentButtonRef}
            className="simple-color-palette__current"
            style={{ 
              backgroundColor: isTransparent(currentColor) ? '#ffffff' : currentColor,
              border: isTransparent(currentColor) ? '1px dashed #ccc' : 'none'
            }}
            onClick={handleAdvancedPickerOpen}
            aria-label="Open advanced color picker"
            title={`Current: ${currentColor}`}
          >
            {isTransparent(currentColor) && (
              <span style={{ fontSize: '10px', color: '#666' }}>∅</span>
            )}
          </button>
        </div>
      </div>
      
      {/* Advanced Color Picker Modal */}
      <AdvancedColorPicker
        isOpen={showAdvancedPicker}
        currentColor={currentColor}
        onColorSelect={handleAdvancedColorSelect}
        onClose={handleAdvancedPickerClose}
        position={pickerPosition}
      />
    </div>
  );
};