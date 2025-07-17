// ABOUTME: Modern Excalidraw-style icon-based toolbar component
// ABOUTME: Floating toolbar with icons, tooltips, and modern design

import React from 'react';
import { useAppStore } from '../../store';
import type { ToolType } from '../../types';
import { KEYBOARD_SHORTCUTS } from '../../constants';
import {
  Lock,
  Unlock,
  Move,
  MousePointer,
  Square,
  Circle,
  ArrowUpRight,
  Minus,
  Edit3,
  Type,
  Image,
  Trash2,
  Menu,
  ChevronDown,
} from 'react-feather';
import { ToolbarMenu } from './ToolbarMenu';
import { DrawingWeightIndicator } from '../DrawingWeightIndicator';
import './TopToolbar.css';

interface ToolDefinition {
  type: ToolType;
  name: string;
  shortcut: string;
  icon: React.ReactNode;
  hasDropdown?: boolean;
}

interface TopToolbarProps {
  onImportDiagram?: () => void;
}

export const TopToolbar: React.FC<TopToolbarProps> = ({ onImportDiagram }) => {
  const { 
    activeTool, 
    setActiveTool, 
    ui, 
    toggleCanvasLock 
  } = useAppStore();

  const tools: ToolDefinition[] = [
    {
      type: 'lock',
      name: ui.canvasLocked ? 'Unlock Canvas' : 'Lock Canvas',
      shortcut: KEYBOARD_SHORTCUTS.LOCK,
      icon: ui.canvasLocked ? <Unlock size={20} /> : <Lock size={20} />,
    },
    {
      type: 'hand',
      name: 'Hand Tool',
      shortcut: KEYBOARD_SHORTCUTS.HAND.toUpperCase(),
      icon: <Move size={20} />,
    },
    {
      type: 'select',
      name: 'Selection Tool',
      shortcut: KEYBOARD_SHORTCUTS.SELECT.toUpperCase(),
      icon: <MousePointer size={20} />,
      hasDropdown: true,
    },
    {
      type: 'rectangle',
      name: 'Rectangle',
      shortcut: KEYBOARD_SHORTCUTS.RECTANGLE.toUpperCase(),
      icon: <Square size={20} />,
    },
    {
      type: 'diamond',
      name: 'Diamond',
      shortcut: KEYBOARD_SHORTCUTS.DIAMOND.toUpperCase(),
      icon: <Square size={20} style={{ transform: 'rotate(45deg)' }} />,
    },
    {
      type: 'circle',
      name: 'Circle',
      shortcut: KEYBOARD_SHORTCUTS.CIRCLE.toUpperCase(),
      icon: <Circle size={20} />,
    },
    {
      type: 'arrow',
      name: 'Arrow',
      shortcut: KEYBOARD_SHORTCUTS.ARROW.toUpperCase(),
      icon: <ArrowUpRight size={20} />,
    },
    {
      type: 'line',
      name: 'Line',
      shortcut: KEYBOARD_SHORTCUTS.LINE.toUpperCase(),
      icon: <Minus size={20} />,
    },
    {
      type: 'pen',
      name: 'Pen',
      shortcut: KEYBOARD_SHORTCUTS.PEN.toUpperCase(),
      icon: <Edit3 size={20} />,
    },
    {
      type: 'text',
      name: 'Text',
      shortcut: KEYBOARD_SHORTCUTS.TEXT.toUpperCase(),
      icon: <Type size={20} />,
    },
    {
      type: 'image',
      name: 'Image',
      shortcut: KEYBOARD_SHORTCUTS.IMAGE.toUpperCase(),
      icon: <Image size={20} />,
    },
    {
      type: 'eraser',
      name: 'Eraser',
      shortcut: KEYBOARD_SHORTCUTS.ERASER.toUpperCase(),
      icon: <Trash2 size={20} />,
    },
  ];

  const handleToolClick = (tool: ToolDefinition) => {
    if (tool.type === 'lock') {
      toggleCanvasLock();
    } else {
      setActiveTool(tool.type);
    }
  };

  return (
    <div className="top-toolbar">
      <div className="top-toolbar__tools">
        {tools.map((tool, index) => (
          <React.Fragment key={tool.type}>
            <button
              className={`top-toolbar__tool ${
                (tool.type === 'lock' && ui.canvasLocked) || 
                (tool.type !== 'lock' && activeTool === tool.type) 
                  ? 'top-toolbar__tool--active' 
                  : ''
              }`}
              onClick={() => handleToolClick(tool)}
              title={`${tool.name} (${tool.shortcut})`}
              aria-label={`${tool.name} tool`}
              aria-pressed={
                tool.type === 'lock' 
                  ? ui.canvasLocked 
                  : activeTool === tool.type
              }
            >
              <span className="top-toolbar__tool-icon">
                {tool.icon}
              </span>
              {tool.hasDropdown && (
                <span className="top-toolbar__tool-dropdown">
                  <ChevronDown size={12} />
                </span>
              )}
            </button>
            
            {/* Add visual separators */}
            {(index === 1 || index === 2) && (
              <div className="top-toolbar__separator" />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="top-toolbar__actions">
        <DrawingWeightIndicator />
        <ToolbarMenu onImportDiagram={onImportDiagram} />
      </div>
    </div>
  );
};