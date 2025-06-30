// ABOUTME: Modern Excalidraw-style icon-based toolbar component
// ABOUTME: Floating toolbar with icons, tooltips, and modern design

import React from 'react';
import { useAppStore } from '../../store';
import type { ToolType } from '../../types';
import { KEYBOARD_SHORTCUTS } from '../../constants';
import {
  LockIcon,
  UnlockIcon,
  HandIcon,
  SelectionIcon,
  RectangleIcon,
  DiamondIcon,
  CircleIcon,
  ArrowIcon,
  LineIcon,
  PenIcon,
  TextIcon,
  ImageIcon,
  EraserIcon,
  MenuIcon,
  ChevronDownIcon,
} from '../UI/Icons';
import './TopToolbar.css';

interface ToolDefinition {
  type: ToolType;
  name: string;
  shortcut: string;
  icon: React.ReactNode;
  hasDropdown?: boolean;
}

export const TopToolbar: React.FC = () => {
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
      icon: ui.canvasLocked ? <UnlockIcon /> : <LockIcon />,
    },
    {
      type: 'hand',
      name: 'Hand Tool',
      shortcut: KEYBOARD_SHORTCUTS.HAND.toUpperCase(),
      icon: <HandIcon />,
    },
    {
      type: 'select',
      name: 'Selection Tool',
      shortcut: KEYBOARD_SHORTCUTS.SELECT.toUpperCase(),
      icon: <SelectionIcon />,
      hasDropdown: true,
    },
    {
      type: 'rectangle',
      name: 'Rectangle',
      shortcut: KEYBOARD_SHORTCUTS.RECTANGLE.toUpperCase(),
      icon: <RectangleIcon />,
    },
    {
      type: 'diamond',
      name: 'Diamond',
      shortcut: KEYBOARD_SHORTCUTS.DIAMOND.toUpperCase(),
      icon: <DiamondIcon />,
    },
    {
      type: 'circle',
      name: 'Circle',
      shortcut: KEYBOARD_SHORTCUTS.CIRCLE.toUpperCase(),
      icon: <CircleIcon />,
    },
    {
      type: 'arrow',
      name: 'Arrow',
      shortcut: KEYBOARD_SHORTCUTS.ARROW.toUpperCase(),
      icon: <ArrowIcon />,
    },
    {
      type: 'line',
      name: 'Line',
      shortcut: KEYBOARD_SHORTCUTS.LINE.toUpperCase(),
      icon: <LineIcon />,
    },
    {
      type: 'pen',
      name: 'Pen',
      shortcut: KEYBOARD_SHORTCUTS.PEN.toUpperCase(),
      icon: <PenIcon />,
    },
    {
      type: 'text',
      name: 'Text',
      shortcut: KEYBOARD_SHORTCUTS.TEXT.toUpperCase(),
      icon: <TextIcon />,
    },
    {
      type: 'image',
      name: 'Image',
      shortcut: KEYBOARD_SHORTCUTS.IMAGE.toUpperCase(),
      icon: <ImageIcon />,
    },
    {
      type: 'eraser',
      name: 'Eraser',
      shortcut: KEYBOARD_SHORTCUTS.ERASER.toUpperCase(),
      icon: <EraserIcon />,
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
                  <ChevronDownIcon size={12} />
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
        <button
          className="top-toolbar__menu"
          title="More options"
          aria-label="Menu"
        >
          <MenuIcon />
        </button>
      </div>
    </div>
  );
};