// ABOUTME: Advanced color picker component with frequently used colors, main palette, nuances, and hex input
// ABOUTME: Modal interface based on design_examples/COLOR_PICKER_PERSONALISE.png for sophisticated color selection

import React, { useState, useEffect, useRef } from 'react';
import {
  ADVANCED_COLOR_PICKER,
  MAIN_COLOR_PALETTE,
  COLOR_KEYBOARD_SHORTCUTS,
  COLOR_FAMILIES
} from '../../constants';

interface AdvancedColorPickerProps {
  isOpen: boolean;
  currentColor: string;
  onColorSelect: (color: string) => void;
  onClose: () => void;
  position?: { x: number; y: number };
}

interface FrequentlyUsedColor {
  color: string;
  count: number;
  lastUsed: number;
}

export const AdvancedColorPicker: React.FC<AdvancedColorPickerProps> = ({
  isOpen,
  currentColor,
  onColorSelect,
  onClose,
  position = { x: 0, y: 0 }
}) => {
  const [hexInput, setHexInput] = useState('');
  const [selectedFamily, setSelectedFamily] = useState<keyof typeof COLOR_FAMILIES>('red');
  const [frequentlyUsed, setFrequentlyUsed] = useState<FrequentlyUsedColor[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);
  const hexInputRef = useRef<HTMLInputElement>(null);

  // Load frequently used colors from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(ADVANCED_COLOR_PICKER.FREQUENTLY_USED_STORAGE_KEY);
    if (stored) {
      try {
        setFrequentlyUsed(JSON.parse(stored));
      } catch (e) {
        setFrequentlyUsed([]);
      }
    }
  }, []);

  // Update hex input when current color changes
  useEffect(() => {
    if (currentColor && currentColor !== 'transparent') {
      setHexInput(currentColor.replace('#', ''));
    }
  }, [currentColor]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      if (event.key === 'Escape') {
        onClose();
        return;
      }

      // Check for color keyboard shortcuts
      const shortcutIndex = COLOR_KEYBOARD_SHORTCUTS.indexOf(event.key.toLowerCase());
      if (shortcutIndex !== -1 && shortcutIndex < MAIN_COLOR_PALETTE.length) {
        event.preventDefault();
        handleColorSelect(MAIN_COLOR_PALETTE[shortcutIndex]);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  const handleColorSelect = (color: string) => {
    // Update frequently used colors
    const newFrequentlyUsed = [...frequentlyUsed];
    const existingIndex = newFrequentlyUsed.findIndex(item => item.color === color);
    
    if (existingIndex !== -1) {
      // Update existing color
      newFrequentlyUsed[existingIndex].count++;
      newFrequentlyUsed[existingIndex].lastUsed = Date.now();
    } else {
      // Add new color
      newFrequentlyUsed.push({
        color,
        count: 1,
        lastUsed: Date.now()
      });
    }

    // Sort by count and recency, keep only top colors
    newFrequentlyUsed.sort((a, b) => {
      if (a.count !== b.count) return b.count - a.count;
      return b.lastUsed - a.lastUsed;
    });

    const trimmed = newFrequentlyUsed.slice(0, ADVANCED_COLOR_PICKER.MAX_FREQUENTLY_USED);
    setFrequentlyUsed(trimmed);
    
    // Save to localStorage
    localStorage.setItem(
      ADVANCED_COLOR_PICKER.FREQUENTLY_USED_STORAGE_KEY,
      JSON.stringify(trimmed)
    );

    onColorSelect(color);
    onClose();
  };

  const handleHexSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanHex = hexInput.replace('#', '');
    if (/^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
      handleColorSelect(`#${cleanHex}`);
    }
  };

  const isValidHex = (hex: string): boolean => {
    const cleanHex = hex.replace('#', '');
    return /^[0-9A-Fa-f]{6}$/.test(cleanHex);
  };

  const detectColorFamily = (color: string): keyof typeof COLOR_FAMILIES => {
    for (const [family, colors] of Object.entries(COLOR_FAMILIES)) {
      if (colors.includes(color)) {
        return family as keyof typeof COLOR_FAMILIES;
      }
    }
    return 'red'; // Default fallback
  };

  const handleMainPaletteClick = (color: string) => {
    const family = detectColorFamily(color);
    setSelectedFamily(family);
    handleColorSelect(color);
  };

  if (!isOpen) return null;

  return (
    <div className="advanced-color-picker-overlay">
      <div
        ref={modalRef}
        className="advanced-color-picker"
        style={{
          left: position.x,
          top: position.y,
          width: ADVANCED_COLOR_PICKER.MODAL_WIDTH,
          height: ADVANCED_COLOR_PICKER.MODAL_HEIGHT,
        }}
      >
        {/* Section 1: Frequently Used Colors */}
        <div className="advanced-color-picker__section">
          <h4 className="advanced-color-picker__title">Couleurs personnalisées les plus fréquemment utilisées</h4>
          <div className="advanced-color-picker__frequently-used">
            {frequentlyUsed.slice(0, 6).map((item, index) => (
              <button
                key={`${item.color}-${index}`}
                className="advanced-color-picker__frequent-color"
                style={{ backgroundColor: item.color }}
                onClick={() => handleColorSelect(item.color)}
                title={`${item.color} (used ${item.count} times)`}
              >
                {item.count > 1 && (
                  <span className="advanced-color-picker__usage-count">{item.count}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Section 2: Main Color Palette */}
        <div className="advanced-color-picker__section">
          <h4 className="advanced-color-picker__title">Couleurs</h4>
          <div className="advanced-color-picker__main-palette">
            {MAIN_COLOR_PALETTE.map((color, index) => (
              <button
                key={color}
                className={`advanced-color-picker__color ${currentColor === color ? 'active' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => handleMainPaletteClick(color)}
                title={`${color} (${COLOR_KEYBOARD_SHORTCUTS[index]})`}
              >
                <span className="advanced-color-picker__shortcut">
                  {COLOR_KEYBOARD_SHORTCUTS[index]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Section 3: Nuances */}
        <div className="advanced-color-picker__section">
          <h4 className="advanced-color-picker__title">Nuances</h4>
          <div className="advanced-color-picker__nuances">
            {COLOR_FAMILIES[selectedFamily].map((color, index) => (
              <button
                key={color}
                className={`advanced-color-picker__nuance ${currentColor === color ? 'active' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => handleColorSelect(color)}
                title={color}
              >
                <span className="advanced-color-picker__nuance-number">{index + 1}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Section 4: Hex Input */}
        <div className="advanced-color-picker__section">
          <h4 className="advanced-color-picker__title">Code hex</h4>
          <form onSubmit={handleHexSubmit} className="advanced-color-picker__hex-form">
            <div className="advanced-color-picker__hex-input-container">
              <span className="advanced-color-picker__hex-prefix">#</span>
              <input
                ref={hexInputRef}
                type="text"
                value={hexInput}
                onChange={(e) => setHexInput(e.target.value)}
                className={`advanced-color-picker__hex-input ${
                  isValidHex(hexInput) ? 'valid' : 'invalid'
                }`}
                placeholder="ffec99"
                maxLength={6}
              />
              {isValidHex(hexInput) && (
                <div
                  className="advanced-color-picker__hex-preview"
                  style={{ backgroundColor: `#${hexInput}` }}
                />
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};