// ABOUTME: Test suite for ToolbarMenu component
// ABOUTME: Tests menu functionality, grid dialog integration, and accessibility

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { cleanup, act } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import { createActWrapper } from '../../../test/test-helpers';
import { ToolbarMenu } from '../ToolbarMenu';
import { useAppStore } from '../../../store';

describe('ToolbarMenu Component', () => {
  const user = createActWrapper();

  beforeEach(() => {
    act(() => {
      useAppStore.setState({
        ui: {
          propertiesPanel: { visible: false, width: 280 },
          topToolbar: { visible: true },
          canvasLocked: false,
          grid: { 
            enabled: true, size: 20, snapToGrid: false, snapDistance: 10,
            showGrid: false, color: '#e0e0e0', opacity: 0.5 
          },
          dialogs: { gridDialog: false },
        },
      });
    });
  });

  afterEach(() => {
    cleanup();
  });

  describe('Basic Rendering', () => {
    it('should render menu trigger button', () => {
      render(<ToolbarMenu />);
      const button = screen.getByRole('button', { name: /menu des options/i });
      expect(button).toBeTruthy();
    });

    it('should have proper accessibility attributes on trigger', () => {
      render(<ToolbarMenu />);
      const button = screen.getByRole('button', { name: /menu des options/i });
      
      expect(button.getAttribute('aria-expanded')).toBe('false');
      expect(button.getAttribute('aria-haspopup')).toBe('true');
      expect(button.getAttribute('aria-label')).toBeTruthy();
    });

    it('should show menu icon in trigger button', () => {
      render(<ToolbarMenu />);
      const svg = screen.getByRole('button').querySelector('svg');
      expect(svg).toBeTruthy();
    });
  });

  describe('Menu Interaction', () => {
    it('should expand menu when trigger is clicked', async () => {
      render(<ToolbarMenu />);
      const button = screen.getByRole('button', { name: /menu des options/i });
      
      await user.click(button);
      
      expect(button.getAttribute('aria-expanded')).toBe('true');
      expect(button.classList.contains('active')).toBe(true);
    });

    it('should show grid option when menu is expanded', async () => {
      render(<ToolbarMenu />);
      const button = screen.getByRole('button', { name: /menu des options/i });
      
      await user.click(button);
      
      const gridOption = screen.getByRole('menuitem', { name: /configuration de la grille/i });
      expect(gridOption).toBeTruthy();
    });

    it('should close menu when clicking outside', async () => {
      const { container } = render(<ToolbarMenu />);
      const button = screen.getByRole('button', { name: /menu des options/i });
      
      // Open menu
      await user.click(button);
      expect(button.getAttribute('aria-expanded')).toBe('true');
      
      // Click outside
      await act(async () => {
        document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      });
      
      expect(button.getAttribute('aria-expanded')).toBe('false');
    });
  });

  describe('Grid Dialog Integration', () => {
    it('should open grid dialog when grid option is clicked', async () => {
      render(<ToolbarMenu />);
      const button = screen.getByRole('button', { name: /menu des options/i });
      
      // Open menu
      await user.click(button);
      
      // Click grid option
      const gridOption = screen.getByRole('menuitem', { name: /configuration de la grille/i });
      await user.click(gridOption);
      
      // Check if grid dialog state is updated
      const state = useAppStore.getState();
      expect(state.ui.dialogs.gridDialog).toBe(true);
    });

    it('should close menu after selecting grid option', async () => {
      render(<ToolbarMenu />);
      const button = screen.getByRole('button', { name: /menu des options/i });
      
      // Open menu
      await user.click(button);
      
      // Click grid option
      const gridOption = screen.getByRole('menuitem', { name: /configuration de la grille/i });
      await user.click(gridOption);
      
      // Menu should be closed
      expect(button.getAttribute('aria-expanded')).toBe('false');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should handle Escape key to close menu', async () => {
      render(<ToolbarMenu />);
      const button = screen.getByRole('button', { name: /menu des options/i });
      
      // Open menu
      await user.click(button);
      expect(button.getAttribute('aria-expanded')).toBe('true');
      
      // Press Escape
      await user.keyboard('{Escape}');
      
      expect(button.getAttribute('aria-expanded')).toBe('false');
    });

    it('should handle Enter key on trigger button', async () => {
      render(<ToolbarMenu />);
      const button = screen.getByRole('button', { name: /menu des options/i });
      
      button.focus();
      await user.keyboard('{Enter}');
      
      expect(button.getAttribute('aria-expanded')).toBe('true');
    });
  });

  describe('Visual States', () => {
    it('should apply active class when menu is open', async () => {
      render(<ToolbarMenu />);
      const button = screen.getByRole('button', { name: /menu des options/i });
      
      expect(button.classList.contains('active')).toBe(false);
      
      await user.click(button);
      
      expect(button.classList.contains('active')).toBe(true);
    });

    it('should show dropdown menu when expanded', async () => {
      render(<ToolbarMenu />);
      const button = screen.getByRole('button', { name: /menu des options/i });
      
      await user.click(button);
      
      const dropdown = screen.getByRole('menu');
      expect(dropdown).toBeTruthy();
      expect(dropdown.classList.contains('toolbar-menu__dropdown')).toBe(true);
    });
  });
});