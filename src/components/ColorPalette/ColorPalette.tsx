// ABOUTME: Color palette component for selecting stroke and background colors  
// ABOUTME: Excalidraw-style color picker with recent colors and custom color input

import React, { useState } from 'react';
import type { ColorDefinition } from '../../constants/colors';
import { 
  MAIN_COLORS, 
  BACKGROUND_COLORS, 
  DEFAULT_COLORS,
  isValidHexColor,
  getContrastColor 
} from '../../constants/colors';
import './ColorPalette.css';

export interface ColorPaletteProps {
  selectedStrokeColor: string;
  selectedBackgroundColor: string;
  onStrokeColorChange: (color: string) => void;
  onBackgroundColorChange: (color: string) => void;
  recentColors?: string[];
  onAddRecentColor?: (color: string) => void;
  className?: string;
}

interface ColorButtonProps {
  color: ColorDefinition | { name: string; value: string };
  isSelected: boolean;
  onClick: () => void;
  size?: 'small' | 'medium' | 'large';
  showBorder?: boolean;
}

const ColorButton: React.FC<ColorButtonProps> = ({ 
  color, 
  isSelected, 
  onClick, 
  size = 'medium',
  showBorder = true 
}) => {
  const isTransparent = color.value === 'transparent';
  
  return (
    <button
      className={`color-button color-button--${size} ${isSelected ? 'color-button--selected' : ''}`}
      onClick={onClick}
      title={color.name}
      aria-label={`Select ${color.name} color`}
      style={{
        backgroundColor: isTransparent ? '#ffffff' : color.value,
        border: showBorder ? `2px solid ${isSelected ? '#3b82f6' : '#e5e7eb'}` : 'none',
        color: isTransparent ? '#6b7280' : getContrastColor(color.value),
      }}
    >
      {isTransparent && (
        <div className="color-button__transparent-pattern" />
      )}
      {isSelected && <div className="color-button__check">✓</div>}
    </button>
  );
};

export const ColorPalette: React.FC<ColorPaletteProps> = ({
  selectedStrokeColor,
  selectedBackgroundColor,
  onStrokeColorChange,
  onBackgroundColorChange,
  recentColors = [],
  onAddRecentColor,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'stroke' | 'background'>('stroke');
  const [customColor, setCustomColor] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const activeColor = activeTab === 'stroke' ? selectedStrokeColor : selectedBackgroundColor;
  const availableColors = activeTab === 'stroke' ? MAIN_COLORS : BACKGROUND_COLORS;

  const handleColorSelect = (color: string) => {
    if (activeTab === 'stroke') {
      onStrokeColorChange(color);
    } else {
      onBackgroundColorChange(color);
    }
    
    if (onAddRecentColor && color !== DEFAULT_COLORS.stroke && color !== DEFAULT_COLORS.background) {
      onAddRecentColor(color);
    }
  };

  const handleCustomColorSubmit = () => {
    if (isValidHexColor(customColor)) {
      handleColorSelect(customColor);
      setCustomColor('');
      setShowCustomInput(false);
    }
  };

  const handleCustomColorKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCustomColorSubmit();
    } else if (e.key === 'Escape') {
      setCustomColor('');
      setShowCustomInput(false);
    }
  };

  return (
    <div className={`color-palette ${className}`}>
      {/* Color Type Tabs */}
      <div className="color-palette__tabs">
        <button
          className={`color-palette__tab ${activeTab === 'stroke' ? 'color-palette__tab--active' : ''}`}
          onClick={() => setActiveTab('stroke')}
          aria-label="Select stroke color"
        >
          <div className="color-palette__tab-icon color-palette__tab-icon--stroke" />
          Stroke
        </button>
        <button
          className={`color-palette__tab ${activeTab === 'background' ? 'color-palette__tab--active' : ''}`}
          onClick={() => setActiveTab('background')}
          aria-label="Select background color"
        >
          <div className="color-palette__tab-icon color-palette__tab-icon--background" />
          Fill
        </button>
      </div>

      {/* Current Color Preview */}
      <div className="color-palette__current">
        <div className="color-palette__current-label">Current</div>
        <ColorButton
          color={{ name: 'Current Color', value: activeColor }}
          isSelected={false}
          onClick={() => {}}
          size="large"
          showBorder={true}
        />
      </div>

      {/* Main Color Grid */}
      <div className="color-palette__grid">
        <div className="color-palette__section-title">Colors</div>
        <div className="color-palette__colors">
          {availableColors.map((color) => (
            <ColorButton
              key={`${color.name}-${color.value}`}
              color={color}
              isSelected={activeColor === color.value}
              onClick={() => handleColorSelect(color.value)}
              size="medium"
            />
          ))}
        </div>
      </div>

      {/* Recent Colors */}
      {recentColors.length > 0 && (
        <div className="color-palette__recent">
          <div className="color-palette__section-title">Recent</div>
          <div className="color-palette__colors color-palette__colors--recent">
            {recentColors.map((color, index) => (
              <ColorButton
                key={`recent-${color}-${index}`}
                color={{ name: `Recent Color ${index + 1}`, value: color }}
                isSelected={activeColor === color}
                onClick={() => handleColorSelect(color)}
                size="small"
              />
            ))}
          </div>
        </div>
      )}

      {/* Custom Color Input */}
      <div className="color-palette__custom">
        {!showCustomInput ? (
          <button
            className="color-palette__custom-button"
            onClick={() => setShowCustomInput(true)}
            aria-label="Add custom color"
          >
            + Custom
          </button>
        ) : (
          <div className="color-palette__custom-input">
            <input
              type="text"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              onKeyDown={handleCustomColorKeyPress}
              placeholder="#ffffff"
              className="color-palette__hex-input"
              aria-label="Enter hex color code"
              autoFocus
            />
            <button
              className="color-palette__custom-submit"
              onClick={handleCustomColorSubmit}
              disabled={!isValidHexColor(customColor)}
              aria-label="Apply custom color"
            >
              ✓
            </button>
            <button
              className="color-palette__custom-cancel"
              onClick={() => {
                setCustomColor('');
                setShowCustomInput(false);
              }}
              aria-label="Cancel custom color"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
};