// ABOUTME: Visual snap guides component for showing alignment helpers
// ABOUTME: Renders horizontal and vertical guides when elements snap to each other

import React from 'react';
import type { SnapGuide } from '../utils/snapToObjects';

interface SnapGuidesProps {
  guides: SnapGuide[];
  viewport: {
    zoom: number;
    pan: { x: number; y: number };
    bounds: { x: number; y: number; width: number; height: number };
  };
}

export const SnapGuides: React.FC<SnapGuidesProps> = ({ guides, viewport }) => {
  if (guides.length === 0) return null;

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 999,
      }}
    >
      {guides.map((guide, index) => {
        const color = guide.snapType === 'center' ? '#8B5CF6' : 
                     guide.snapType === 'edge' ? '#10B981' : '#F59E0B';

        if (guide.type === 'horizontal') {
          // Transform world Y coordinate to screen coordinate
          const screenY = (guide.position - viewport.pan.y) * viewport.zoom;
          
          return (
            <line
              key={`h-${index}`}
              x1={0}
              y1={screenY}
              x2={viewport.bounds.width}
              y2={screenY}
              stroke={color}
              strokeWidth={1}
              strokeDasharray="4,4"
              opacity={0.8}
            />
          );
        } else {
          // Transform world X coordinate to screen coordinate
          const screenX = (guide.position - viewport.pan.x) * viewport.zoom;
          
          return (
            <line
              key={`v-${index}`}
              x1={screenX}
              y1={0}
              x2={screenX}
              y2={viewport.bounds.height}
              stroke={color}
              strokeWidth={1}
              strokeDasharray="4,4"
              opacity={0.8}
            />
          );
        }
      })}
    </svg>
  );
};