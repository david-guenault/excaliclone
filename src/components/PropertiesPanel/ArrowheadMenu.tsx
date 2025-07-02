// ABOUTME: Dropdown menu component for arrowhead type selection
// ABOUTME: 2x2 grid layout with visual previews based on design_examples/selecteur_extremites_fleches_menu.png

import React, { useEffect, useRef } from 'react';
import type { ArrowheadType } from '../../types';
import { ARROWHEAD_TYPES } from '../../constants';

interface ArrowheadMenuProps {
  isOpen: boolean;
  onSelect: (type: ArrowheadType) => void;
  onClose: () => void;
  position: { x: number; y: number };
  currentValue: ArrowheadType;
}

export const ArrowheadMenu: React.FC<ArrowheadMenuProps> = ({
  isOpen,
  onSelect,
  onClose,
  position,
  currentValue
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="arrowhead-menu-overlay">
      <div
        ref={menuRef}
        className="arrowhead-menu"
        style={{
          left: position.x,
          top: position.y,
        }}
      >
        {/* Main arrowhead options in 2x2 grid */}
        <div className="arrowhead-menu__grid">
          {ARROWHEAD_TYPES.map((arrowheadType) => (
            <button
              key={arrowheadType.type}
              className={`arrowhead-menu__option ${
                currentValue === arrowheadType.type ? 'active' : ''
              }`}
              onClick={() => onSelect(arrowheadType.type)}
              title={arrowheadType.label}
              aria-label={arrowheadType.label}
            >
              <span className="arrowhead-menu__option-icon">
                {arrowheadType.icon || '○'}
              </span>
            </button>
          ))}
        </div>

        {/* More options section (placeholder for future extensions) */}
        <div className="arrowhead-menu__more">
          <button 
            className="arrowhead-menu__more-button"
            disabled
            title="Futures options d'extrémités"
          >
            More options
            <span className="arrowhead-menu__more-arrow">▼</span>
          </button>
        </div>
      </div>
    </div>
  );
};