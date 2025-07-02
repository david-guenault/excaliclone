// ABOUTME: Arrowhead selector component for start/end arrowhead selection
// ABOUTME: Displays current arrowhead type and opens dropdown menu on click

import React, { useState, useRef } from 'react';
import type { ArrowheadType } from '../../types';
import { ARROWHEAD_TYPES } from '../../constants';
import { ArrowheadMenu } from './ArrowheadMenu';

interface ArrowheadSelectorProps {
  label: 'Début' | 'Fin';
  value: ArrowheadType;
  onChange: (type: ArrowheadType) => void;
  icon: '←' | '→';
}

export const ArrowheadSelector: React.FC<ArrowheadSelectorProps> = ({
  label,
  value,
  onChange,
  icon
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const currentArrowhead = ARROWHEAD_TYPES.find(type => type.type === value) || ARROWHEAD_TYPES[0];

  const handleButtonClick = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        x: rect.left,
        y: rect.bottom + 4 // Position below the button with small gap
      });
    }
    setShowMenu(true);
  };

  const handleMenuSelect = (type: ArrowheadType) => {
    onChange(type);
    setShowMenu(false);
  };

  const handleMenuClose = () => {
    setShowMenu(false);
  };

  return (
    <div className="arrowhead-selector">
      <span className="arrowhead-selector__label">{label}</span>
      <button
        ref={buttonRef}
        className="arrowhead-selector__button"
        onClick={handleButtonClick}
        title={`${label}: ${currentArrowhead.label}`}
        aria-label={`Sélectionner extrémité ${label.toLowerCase()}`}
      >
        <span className="arrowhead-selector__direction">{icon}</span>
        <span className="arrowhead-selector__preview">
          {currentArrowhead.icon || '○'}
        </span>
      </button>
      
      <ArrowheadMenu
        isOpen={showMenu}
        onSelect={handleMenuSelect}
        onClose={handleMenuClose}
        position={menuPosition}
        currentValue={value}
      />
    </div>
  );
};