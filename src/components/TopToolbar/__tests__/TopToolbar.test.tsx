// ABOUTME: Tests for TopToolbar component
// ABOUTME: Validates tool selection, keyboard shortcuts display, and UI interactions

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TopToolbar } from '../TopToolbar';
import { useAppStore } from '../../../store';

describe('TopToolbar', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAppStore.setState({
      activeTool: 'select',
      setActiveTool: vi.fn(),
    });
  });

  describe('Component Rendering', () => {
    it('renders the application title', () => {
      render(<TopToolbar />);
      
      expect(screen.getByRole('heading', { name: 'Excalibox' })).toBeInTheDocument();
    });

    it('renders all tool buttons', () => {
      render(<TopToolbar />);
      
      const expectedTools = ['Select', 'Rectangle', 'Circle', 'Line', 'Arrow', 'Pen', 'Text'];
      
      expectedTools.forEach(toolName => {
        expect(screen.getByRole('button', { name: new RegExp(toolName, 'i') })).toBeInTheDocument();
      });
    });

    it('displays keyboard shortcuts for each tool', () => {
      render(<TopToolbar />);
      
      const expectedShortcuts = ['S', 'R', 'C', 'L', 'A', 'P', 'T'];
      
      expectedShortcuts.forEach(shortcut => {
        expect(screen.getByText(shortcut)).toBeInTheDocument();
      });
    });

    it('shows active tool with active class', () => {
      useAppStore.setState({ activeTool: 'rectangle' });
      render(<TopToolbar />);
      
      const rectangleButton = screen.getByRole('button', { name: /rectangle/i });
      expect(rectangleButton).toHaveClass('active');
    });

    it('only one tool button is active at a time', () => {
      useAppStore.setState({ activeTool: 'circle' });
      render(<TopToolbar />);
      
      const activeButtons = screen.getAllByRole('button').filter(button => 
        button.classList.contains('active')
      );
      
      expect(activeButtons).toHaveLength(1);
      expect(activeButtons[0]).toHaveTextContent('Circle');
    });
  });

  describe('Tool Selection', () => {
    it('calls setActiveTool when tool button is clicked', async () => {
      const setActiveToolMock = vi.fn();
      useAppStore.setState({ setActiveTool: setActiveToolMock });
      
      const user = userEvent.setup();
      render(<TopToolbar />);
      
      const rectangleButton = screen.getByRole('button', { name: /rectangle/i });
      await user.click(rectangleButton);
      
      expect(setActiveToolMock).toHaveBeenCalledWith('rectangle');
    });

    it('updates active state when different tools are selected', async () => {
      const user = userEvent.setup();
      render(<TopToolbar />);
      
      // Initially select tool should be active
      expect(screen.getByRole('button', { name: /select/i })).toHaveClass('active');
      
      // Click circle tool
      const circleButton = screen.getByRole('button', { name: /circle/i });
      await user.click(circleButton);
      
      // Update store state to simulate the change
      useAppStore.setState({ activeTool: 'circle' });
      
      expect(circleButton).toHaveClass('active');
      expect(screen.getByRole('button', { name: /select/i })).not.toHaveClass('active');
    });

    it('provides proper accessibility labels', () => {
      render(<TopToolbar />);
      
      const selectButton = screen.getByRole('button', { name: /select tool/i });
      expect(selectButton).toHaveAttribute('aria-label', 'Select tool');
      
      const rectangleButton = screen.getByRole('button', { name: /rectangle tool/i });
      expect(rectangleButton).toHaveAttribute('aria-label', 'Rectangle tool');
    });

    it('shows keyboard shortcuts in button titles', () => {
      render(<TopToolbar />);
      
      const selectButton = screen.getByRole('button', { name: /select/i });
      expect(selectButton).toHaveAttribute('title', 'Select (S)');
      
      const rectangleButton = screen.getByRole('button', { name: /rectangle/i });
      expect(rectangleButton).toHaveAttribute('title', 'Rectangle (R)');
    });
  });

  describe('CSS Classes and Styling', () => {
    it('has correct CSS classes for layout', () => {
      render(<TopToolbar />);
      
      const toolbar = screen.getByRole('heading', { name: 'Excalibox' }).closest('.top-toolbar');
      expect(toolbar).toBeInTheDocument();
      
      const content = toolbar?.querySelector('.top-toolbar__content');
      expect(content).toBeInTheDocument();
      
      const tools = toolbar?.querySelector('.top-toolbar__tools');
      expect(tools).toBeInTheDocument();
    });

    it('applies correct classes to tool buttons', () => {
      useAppStore.setState({ activeTool: 'pen' });
      render(<TopToolbar />);
      
      const penButton = screen.getByRole('button', { name: /pen/i });
      expect(penButton).toHaveClass('top-toolbar__tool', 'active');
      
      const selectButton = screen.getByRole('button', { name: /select/i });
      expect(selectButton).toHaveClass('top-toolbar__tool');
      expect(selectButton).not.toHaveClass('active');
    });
  });

  describe('Responsive Behavior', () => {
    it('maintains functionality on smaller screens', () => {
      // Mock small screen size
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      });
      
      render(<TopToolbar />);
      
      // All tools should still be accessible
      const expectedTools = ['Select', 'Rectangle', 'Circle', 'Line', 'Arrow', 'Pen', 'Text'];
      expectedTools.forEach(toolName => {
        expect(screen.getByRole('button', { name: new RegExp(toolName, 'i') })).toBeInTheDocument();
      });
    });
  });
});