// ABOUTME: Top horizontal toolbar component for tool selection
// ABOUTME: Replaces the old header layout with a clean horizontal tool palette

import React from 'react';
import { useAppStore } from '../../store';
import type { ToolType } from '../../types';
import './TopToolbar.css';

export const TopToolbar: React.FC = () => {
  const { activeTool, setActiveTool } = useAppStore();

  const tools: Array<{ type: ToolType; name: string; shortcut: string }> = [
    { type: 'select', name: 'Select', shortcut: 'S' },
    { type: 'rectangle', name: 'Rectangle', shortcut: 'R' },
    { type: 'circle', name: 'Circle', shortcut: 'C' },
    { type: 'line', name: 'Line', shortcut: 'L' },
    { type: 'arrow', name: 'Arrow', shortcut: 'A' },
    { type: 'pen', name: 'Pen', shortcut: 'P' },
    { type: 'text', name: 'Text', shortcut: 'T' },
  ];

  return (
    <div className="top-toolbar">
      <div className="top-toolbar__content">
        <div className="top-toolbar__brand">
          <h1 className="top-toolbar__title">Excalibox</h1>
        </div>
        
        <div className="top-toolbar__tools">
          {tools.map((tool) => (
            <button
              key={tool.type}
              className={`top-toolbar__tool ${activeTool === tool.type ? 'active' : ''}`}
              onClick={() => setActiveTool(tool.type)}
              title={`${tool.name} (${tool.shortcut})`}
              aria-label={`${tool.name} tool`}
            >
              <span className="top-toolbar__tool-name">{tool.name}</span>
              <span className="top-toolbar__tool-shortcut">{tool.shortcut}</span>
            </button>
          ))}
        </div>

        <div className="top-toolbar__actions">
          {/* Future: Undo/Redo buttons, Export, etc. */}
        </div>
      </div>
    </div>
  );
};