// ABOUTME: Visual indicators for locked elements showing lock icons on canvas
// ABOUTME: Renders lock icons positioned over locked elements with viewport transformation

import React from 'react';
import type { Element, Viewport } from '../types';

interface LockIndicatorsProps {
  elements: Element[];
  viewport: Viewport;
  selectedElementIds: string[];
}

export const LockIndicators: React.FC<LockIndicatorsProps> = ({
  elements,
  viewport,
  selectedElementIds,
}) => {
  const lockedElements = elements.filter(el => el.locked);

  if (lockedElements.length === 0) return null;

  const getElementBounds = (element: Element) => {
    // Get element center position
    const centerX = element.x + element.width / 2;
    const centerY = element.y + element.height / 2;

    // Apply viewport transformation
    const screenX = (centerX - viewport.pan.x) * viewport.zoom;
    const screenY = (centerY - viewport.pan.y) * viewport.zoom;

    return { x: screenX, y: screenY };
  };

  const isVisible = (element: Element) => {
    const bounds = getElementBounds(element);
    const margin = 50; // Extra margin for partially visible elements
    
    return (
      bounds.x >= -margin &&
      bounds.y >= -margin &&
      bounds.x <= viewport.bounds.width + margin &&
      bounds.y <= viewport.bounds.height + margin
    );
  };

  return (
    <div className="lock-indicators">
      {lockedElements
        .filter(isVisible)
        .map((element) => {
          const bounds = getElementBounds(element);
          const isSelected = selectedElementIds.includes(element.id);
          const iconSize = Math.max(16, Math.min(24, 20 * viewport.zoom));
          
          return (
            <div
              key={`lock-${element.id}`}
              className={`lock-indicator ${isSelected ? 'selected' : ''}`}
              style={{
                position: 'absolute',
                left: bounds.x - iconSize / 2,
                top: bounds.y - iconSize / 2,
                width: iconSize,
                height: iconSize,
                pointerEvents: 'none',
                zIndex: 1000,
              }}
            >
              <LockIcon 
                size={iconSize} 
                isSelected={isSelected}
                opacity={viewport.zoom < 0.5 ? 0.6 : 0.8}
              />
            </div>
          );
        })}
      
      <style>{`
        .lock-indicators {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .lock-indicator {
          transition: all 0.2s ease;
        }

        .lock-indicator.selected {
          transform: scale(1.2);
        }
      `}</style>
    </div>
  );
};

interface LockIconProps {
  size: number;
  isSelected: boolean;
  opacity: number;
}

const LockIcon: React.FC<LockIconProps> = ({ size, isSelected, opacity }) => {
  const strokeColor = isSelected ? '#8b5cf6' : '#ef4444';
  const fillColor = isSelected ? '#f3f4f6' : '#ffffff';
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
        opacity,
      }}
    >
      {/* Background circle for better visibility */}
      <circle
        cx="12"
        cy="12"
        r="11"
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth="1"
      />
      
      {/* Lock icon */}
      <path
        d="M8 11V7a4 4 0 0 1 8 0v4"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <rect
        x="6"
        y="11"
        width="12"
        height="7"
        rx="2"
        fill={strokeColor}
        opacity="0.8"
      />
      <circle
        cx="12"
        cy="15"
        r="1.5"
        fill={fillColor}
      />
    </svg>
  );
};