// ABOUTME: Comprehensive tests for modern icon-based TopToolbar component
// ABOUTME: Tests floating design, all tools, icons, tooltips, and interactions

import { describe, it, expect, beforeEach, vi, act } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TopToolbar } from '../TopToolbar';
import { useAppStore } from '../../../store';
import { createActWrapper, createDOMEventHelpers, waitForStateUpdate } from '../../../test/test-helpers';

// Mock store
const mockStore = {
  activeTool: 'select' as const,
  setActiveTool: vi.fn(),
  ui: {
    canvasLocked: false,
    propertiesPanel: { visible: false, width: 300 },
    topToolbar: { visible: true },
  },
  toggleCanvasLock: vi.fn(),
};

vi.mock('../../../store', () => ({
  useAppStore: vi.fn(() => mockStore),
}));

describe('TopToolbar - Modern Icon-Based Design', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(mockStore, {
      activeTool: 'select',
      ui: {
        canvasLocked: false,
        propertiesPanel: { visible: false, width: 300 },
        topToolbar: { visible: true },
      },
    });
  });

  describe('Component Structure and Styling', () => {
    it('renders floating toolbar with modern design classes', () => {
      render(<TopToolbar />);
      
      const toolbar = document.querySelector('.top-toolbar');
      expect(toolbar).toBeInTheDocument();
      expect(toolbar).toHaveClass('top-toolbar');
    });

    it('renders tools section and actions section', () => {
      render(<TopToolbar />);
      
      expect(document.querySelector('.top-toolbar__tools')).toBeInTheDocument();
      expect(document.querySelector('.top-toolbar__actions')).toBeInTheDocument();
    });

    it('renders visual separators in correct positions', () => {
      render(<TopToolbar />);
      
      const separators = document.querySelectorAll('.top-toolbar__separator');
      expect(separators).toHaveLength(2); // After Lock/Hand and Hand/Select
    });
  });

  describe('All Tools Rendering', () => {
    it('renders all 12 tool buttons with correct names', () => {
      render(<TopToolbar />);
      
      const expectedTools = [
        'Lock Canvas',
        'Hand Tool', 
        'Selection Tool',
        'Rectangle',
        'Diamond',
        'Circle',
        'Arrow',
        'Line',
        'Pen',
        'Text',
        'Image',
        'Eraser'
      ];
      
      expectedTools.forEach(toolName => {
        expect(screen.getByRole('button', { name: new RegExp(toolName, 'i') })).toBeInTheDocument();
      });
    });

    it('renders menu button in actions section', () => {
      render(<TopToolbar />);
      
      expect(screen.getByLabelText('Menu')).toBeInTheDocument();
    });
  });

  describe('Lock Tool Special Behavior', () => {
    it('shows lock icon when canvas is unlocked', () => {
      mockStore.ui.canvasLocked = false;
      render(<TopToolbar />);
      
      const lockButton = screen.getByRole('button', { name: /lock canvas/i });
      expect(lockButton).toHaveAttribute('title', expect.stringContaining('Lock Canvas'));
    });

    it('shows unlock icon when canvas is locked', () => {
      mockStore.ui.canvasLocked = true;
      render(<TopToolbar />);
      
      const unlockButton = screen.getByRole('button', { name: /unlock canvas/i });
      expect(unlockButton).toHaveAttribute('title', expect.stringContaining('Unlock Canvas'));
    });

    it('calls toggleCanvasLock when lock button is clicked', async () => {
      const user = createActWrapper();
      render(<TopToolbar />);
      
      const lockButton = screen.getByRole('button', { name: /lock canvas/i });
      await user.click(lockButton);
      
      expect(mockStore.toggleCanvasLock).toHaveBeenCalledTimes(1);
    });

    it('shows active state when canvas is locked', () => {
      mockStore.ui.canvasLocked = true;
      render(<TopToolbar />);
      
      const lockButton = screen.getByRole('button', { name: /unlock canvas/i });
      expect(lockButton).toHaveClass('top-toolbar__tool--active');
      expect(lockButton).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Tool Selection and Active States', () => {
    it('shows correct active tool with active class', () => {
      mockStore.activeTool = 'rectangle';
      render(<TopToolbar />);
      
      const rectangleButton = screen.getByRole('button', { name: /rectangle/i });
      expect(rectangleButton).toHaveClass('top-toolbar__tool--active');
      expect(rectangleButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('calls setActiveTool when tool button is clicked', async () => {
      const user = createActWrapper();
      render(<TopToolbar />);
      
      const circleButton = screen.getByRole('button', { name: /circle/i });
      await user.click(circleButton);
      
      expect(mockStore.setActiveTool).toHaveBeenCalledWith('circle');
    });

    it('only one regular tool is active at a time (excluding lock)', () => {
      mockStore.activeTool = 'pen';
      mockStore.ui.canvasLocked = true; // Lock can be active simultaneously
      render(<TopToolbar />);
      
      const activeTools = document.querySelectorAll('.top-toolbar__tool--active');
      const regularActiveTools = Array.from(activeTools).filter(button => 
        !button.getAttribute('aria-label')?.includes('lock')
      );
      
      expect(regularActiveTools).toHaveLength(1);
    });
  });

  describe('Tooltips and Keyboard Shortcuts', () => {
    it('displays keyboard shortcuts in tooltips for all tools', () => {
      render(<TopToolbar />);
      
      const expectedShortcuts = [
        ['Hand Tool', 'H'],
        ['Selection Tool', 'S'], 
        ['Rectangle', 'R'],
        ['Diamond', 'D'],
        ['Circle', 'C'],
        ['Arrow', 'A'],
        ['Line', 'L'],
        ['Pen', 'P'],
        ['Text', 'T'],
        ['Image', 'I'],
        ['Eraser', 'E']
      ];
      
      expectedShortcuts.forEach(([toolName, shortcut]) => {
        const button = screen.getByRole('button', { name: new RegExp(toolName, 'i') });
        expect(button).toHaveAttribute('title', expect.stringContaining(`(${shortcut})`));
      });
    });

    it('shows "More options" tooltip for menu button', () => {
      render(<TopToolbar />);
      
      const menuButton = screen.getByRole('button', { name: 'Menu des options' });
      expect(menuButton).toHaveAttribute('title', 'More options');
    });
  });

  describe('Dropdown Indicators', () => {
    it('shows dropdown chevron for selection tool', () => {
      render(<TopToolbar />);
      
      const selectionButton = screen.getByRole('button', { name: /selection tool/i });
      const dropdown = selectionButton.querySelector('.top-toolbar__tool-dropdown');
      expect(dropdown).toBeInTheDocument();
    });

    it('does not show dropdown for other tools', () => {
      render(<TopToolbar />);
      
      const rectangleButton = screen.getByRole('button', { name: /rectangle/i });
      const dropdown = rectangleButton.querySelector('.top-toolbar__tool-dropdown');
      expect(dropdown).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('provides proper aria-labels for all tools', () => {
      render(<TopToolbar />);
      
      const expectedLabels = [
        'Lock Canvas tool',
        'Hand Tool tool',
        'Selection Tool tool', 
        'Rectangle tool',
        'Diamond tool',
        'Circle tool',
        'Arrow tool',
        'Line tool',
        'Pen tool',
        'Text tool',
        'Image tool',
        'Eraser tool'
      ];
      
      expectedLabels.forEach(label => {
        expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
      });
    });

    it('sets correct aria-pressed states', () => {
      mockStore.activeTool = 'arrow';
      mockStore.ui.canvasLocked = true;
      render(<TopToolbar />);
      
      // Active tool should have aria-pressed="true"
      const arrowButton = screen.getByRole('button', { name: /arrow tool/i });
      expect(arrowButton).toHaveAttribute('aria-pressed', 'true');
      
      // Locked canvas should have aria-pressed="true"
      const lockButton = screen.getByRole('button', { name: /unlock canvas/i });
      expect(lockButton).toHaveAttribute('aria-pressed', 'true');
      
      // Inactive tools should have aria-pressed="false"
      const penButton = screen.getByRole('button', { name: /pen tool/i });
      expect(penButton).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('Icon Rendering', () => {
    it('renders SVG icons for all tools', () => {
      render(<TopToolbar />);
      
      // Check that each tool button contains an SVG icon
      const toolButtons = document.querySelectorAll('.top-toolbar__tool-icon');
      expect(toolButtons.length).toBeGreaterThanOrEqual(12);
      
      toolButtons.forEach(iconContainer => {
        expect(iconContainer.querySelector('svg')).toBeInTheDocument();
      });
    });

    it('renders menu icon in actions section', () => {
      render(<TopToolbar />);
      
      const menuButton = screen.getByRole('button', { name: 'Menu des options' });
      expect(menuButton.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('CSS Classes and Styling', () => {
    it('applies correct base classes to toolbar', () => {
      render(<TopToolbar />);
      
      const toolbar = document.querySelector('.top-toolbar');
      expect(toolbar).toHaveClass('top-toolbar');
    });

    it('applies correct classes to tool buttons', () => {
      mockStore.activeTool = 'text';
      render(<TopToolbar />);
      
      const textButton = screen.getByRole('button', { name: /text tool/i });
      expect(textButton).toHaveClass('top-toolbar__tool', 'top-toolbar__tool--active');
      
      const lineButton = screen.getByRole('button', { name: /line tool/i });
      expect(lineButton).toHaveClass('top-toolbar__tool');
      expect(lineButton).not.toHaveClass('top-toolbar__tool--active');
    });
  });

  describe('Responsive Behavior', () => {
    it('maintains all tools on smaller screens', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      render(<TopToolbar />);
      
      // All 12 tools should still be present
      const toolButtons = document.querySelectorAll('.top-toolbar__tool');
      expect(toolButtons).toHaveLength(12);
    });
  });
});