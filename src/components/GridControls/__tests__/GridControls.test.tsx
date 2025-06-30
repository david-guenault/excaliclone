// ABOUTME: Tests for GridControls component - UI interactions and configuration
// ABOUTME: Comprehensive test coverage for grid control interface

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GridControls } from '../GridControls';
import type { GridSettings } from '../../../types';

describe('GridControls Component', () => {
  let mockGridSettings: GridSettings;
  let mockCallbacks: {
    onGridEnabledChange: ReturnType<typeof vi.fn>;
    onGridSizeChange: ReturnType<typeof vi.fn>;
    onGridSnapEnabledChange: ReturnType<typeof vi.fn>;
    onGridVisibleChange: ReturnType<typeof vi.fn>;
    onGridSnapDistanceChange: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockGridSettings = {
      enabled: true,
      size: 20,
      snapToGrid: false,
      snapDistance: 10,
      showGrid: true,
      color: '#e1e5e9',
      opacity: 0.3,
    };

    mockCallbacks = {
      onGridEnabledChange: vi.fn(),
      onGridSizeChange: vi.fn(),
      onGridSnapEnabledChange: vi.fn(),
      onGridVisibleChange: vi.fn(),
      onGridSnapDistanceChange: vi.fn(),
    };
  });

  describe('Basic Rendering', () => {
    it('renders grid controls with header', () => {
      render(<GridControls gridSettings={mockGridSettings} {...mockCallbacks} />);
      
      expect(screen.getByText('Grid')).toBeInTheDocument();
      expect(screen.getByLabelText('Enable grid system')).toBeInTheDocument();
    });

    it('shows enabled toggle as checked when grid is enabled', () => {
      render(<GridControls gridSettings={mockGridSettings} {...mockCallbacks} />);
      
      const enableToggle = screen.getByLabelText('Enable grid system');
      expect(enableToggle).toBeChecked();
    });

    it('shows enabled toggle as unchecked when grid is disabled', () => {
      const disabledGrid = { ...mockGridSettings, enabled: false };
      render(<GridControls gridSettings={disabledGrid} {...mockCallbacks} />);
      
      const enableToggle = screen.getByLabelText('Enable grid system');
      expect(enableToggle).not.toBeChecked();
    });

    it('applies custom className', () => {
      const { container } = render(
        <GridControls 
          gridSettings={mockGridSettings} 
          className="custom-class" 
          {...mockCallbacks} 
        />
      );
      
      expect(container.firstChild).toHaveClass('grid-controls', 'custom-class');
    });
  });

  describe('Grid Enable/Disable', () => {
    it('calls onGridEnabledChange when toggle is clicked', async () => {
      const user = userEvent.setup();
      render(<GridControls gridSettings={mockGridSettings} {...mockCallbacks} />);
      
      const enableToggle = screen.getByLabelText('Enable grid system');
      await user.click(enableToggle);
      
      expect(mockCallbacks.onGridEnabledChange).toHaveBeenCalledWith(false);
    });

    it('hides grid content when disabled', () => {
      const disabledGrid = { ...mockGridSettings, enabled: false };
      render(<GridControls gridSettings={disabledGrid} {...mockCallbacks} />);
      
      expect(screen.queryByText('Grid Size')).not.toBeInTheDocument();
      expect(screen.queryByText('Show grid lines')).not.toBeInTheDocument();
    });

    it('shows grid content when enabled', () => {
      render(<GridControls gridSettings={mockGridSettings} {...mockCallbacks} />);
      
      expect(screen.getByText('Grid Size')).toBeInTheDocument();
      expect(screen.getByText('Show grid lines')).toBeInTheDocument();
      expect(screen.getByText('Snap to grid')).toBeInTheDocument();
    });
  });

  describe('Grid Visibility', () => {
    it('shows grid visibility checkbox as checked when grid is visible', () => {
      render(<GridControls gridSettings={mockGridSettings} {...mockCallbacks} />);
      
      const visibilityCheckbox = screen.getByLabelText('Show grid lines');
      expect(visibilityCheckbox).toBeChecked();
    });

    it('shows grid visibility checkbox as unchecked when grid is hidden', () => {
      const hiddenGrid = { ...mockGridSettings, showGrid: false };
      render(<GridControls gridSettings={hiddenGrid} {...mockCallbacks} />);
      
      const visibilityCheckbox = screen.getByLabelText('Show grid lines');
      expect(visibilityCheckbox).not.toBeChecked();
    });

    it('calls onGridVisibleChange when visibility checkbox is clicked', async () => {
      const user = userEvent.setup();
      render(<GridControls gridSettings={mockGridSettings} {...mockCallbacks} />);
      
      const visibilityCheckbox = screen.getByLabelText('Show grid lines');
      await user.click(visibilityCheckbox);
      
      expect(mockCallbacks.onGridVisibleChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Grid Size Controls', () => {
    it('displays current grid size', () => {
      render(<GridControls gridSettings={mockGridSettings} {...mockCallbacks} />);
      
      expect(screen.getByText('20px')).toBeInTheDocument();
    });

    it('shows grid size slider with correct value', () => {
      render(<GridControls gridSettings={mockGridSettings} {...mockCallbacks} />);
      
      const sizeSlider = screen.getByLabelText('Grid size');
      expect(sizeSlider).toHaveValue('20');
    });

    it('calls onGridSizeChange when slider is moved', () => {
      render(<GridControls gridSettings={mockGridSettings} {...mockCallbacks} />);
      
      const sizeSlider = screen.getByLabelText('Grid size') as HTMLInputElement;
      fireEvent.change(sizeSlider, { target: { value: '40' } });
      
      expect(mockCallbacks.onGridSizeChange).toHaveBeenCalledWith(40);
    });

    it('renders grid size presets', () => {
      render(<GridControls gridSettings={mockGridSettings} {...mockCallbacks} />);
      
      expect(screen.getByText('Fine')).toBeInTheDocument();
      expect(screen.getByText('Normal')).toBeInTheDocument();
      expect(screen.getByText('Coarse')).toBeInTheDocument();
      expect(screen.getByText('Large')).toBeInTheDocument();
    });

    it('highlights active preset', () => {
      render(<GridControls gridSettings={mockGridSettings} {...mockCallbacks} />);
      
      const normalPreset = screen.getByText('Normal');
      expect(normalPreset).toHaveClass('grid-controls__preset--active');
    });

    it('calls onGridSizeChange when preset is clicked', async () => {
      const user = userEvent.setup();
      render(<GridControls gridSettings={mockGridSettings} {...mockCallbacks} />);
      
      const coarsePreset = screen.getByText('Coarse');
      await user.click(coarsePreset);
      
      expect(mockCallbacks.onGridSizeChange).toHaveBeenCalledWith(40);
    });

    it('updates size display when different size is set', () => {
      const largeGrid = { ...mockGridSettings, size: 50 };
      render(<GridControls gridSettings={largeGrid} {...mockCallbacks} />);
      
      expect(screen.getByText('50px')).toBeInTheDocument();
    });
  });

  describe('Snap to Grid Controls', () => {
    it('shows snap checkbox as unchecked when snap is disabled', () => {
      render(<GridControls gridSettings={mockGridSettings} {...mockCallbacks} />);
      
      const snapCheckbox = screen.getByLabelText('Snap to grid');
      expect(snapCheckbox).not.toBeChecked();
    });

    it('shows snap checkbox as checked when snap is enabled', () => {
      const snapGrid = { ...mockGridSettings, snapToGrid: true };
      render(<GridControls gridSettings={snapGrid} {...mockCallbacks} />);
      
      const snapCheckbox = screen.getByLabelText('Snap to grid');
      expect(snapCheckbox).toBeChecked();
    });

    it('calls onGridSnapEnabledChange when snap checkbox is clicked', async () => {
      const user = userEvent.setup();
      render(<GridControls gridSettings={mockGridSettings} {...mockCallbacks} />);
      
      const snapCheckbox = screen.getByLabelText('Snap to grid');
      await user.click(snapCheckbox);
      
      expect(mockCallbacks.onGridSnapEnabledChange).toHaveBeenCalledWith(true);
    });

    it('hides snap distance controls when snap is disabled', () => {
      render(<GridControls gridSettings={mockGridSettings} {...mockCallbacks} />);
      
      expect(screen.queryByText('Snap Distance')).not.toBeInTheDocument();
    });

    it('shows snap distance controls when snap is enabled', () => {
      const snapGrid = { ...mockGridSettings, snapToGrid: true };
      render(<GridControls gridSettings={snapGrid} {...mockCallbacks} />);
      
      expect(screen.getByText('Snap Distance')).toBeInTheDocument();
      expect(screen.getByText('10px')).toBeInTheDocument();
    });
  });

  describe('Snap Distance Controls', () => {
    beforeEach(() => {
      mockGridSettings.snapToGrid = true; // Enable snap to show distance controls
    });

    it('displays current snap distance', () => {
      render(<GridControls gridSettings={mockGridSettings} {...mockCallbacks} />);
      
      expect(screen.getByText('10px')).toBeInTheDocument();
    });

    it('shows snap distance slider with correct value', () => {
      render(<GridControls gridSettings={mockGridSettings} {...mockCallbacks} />);
      
      const distanceSlider = screen.getByLabelText('Snap distance');
      expect(distanceSlider).toHaveValue('10');
    });

    it('calls onGridSnapDistanceChange when distance slider is moved', () => {
      render(<GridControls gridSettings={mockGridSettings} {...mockCallbacks} />);
      
      const distanceSlider = screen.getByLabelText('Snap distance') as HTMLInputElement;
      fireEvent.change(distanceSlider, { target: { value: '15' } });
      
      expect(mockCallbacks.onGridSnapDistanceChange).toHaveBeenCalledWith(15);
    });

    it('updates distance display when different distance is set', () => {
      const tightSnapGrid = { ...mockGridSettings, snapDistance: 5 };
      render(<GridControls gridSettings={tightSnapGrid} {...mockCallbacks} />);
      
      expect(screen.getByText('5px')).toBeInTheDocument();
    });
  });

  describe('Integration Behavior', () => {
    it('maintains all settings when grid is toggled off and on', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <GridControls gridSettings={mockGridSettings} {...mockCallbacks} />
      );
      
      // Toggle off
      const enableToggle = screen.getByLabelText('Enable grid system');
      await user.click(enableToggle);
      
      // Re-render with disabled grid
      const disabledGrid = { ...mockGridSettings, enabled: false };
      rerender(<GridControls gridSettings={disabledGrid} {...mockCallbacks} />);
      
      // Grid content should be hidden
      expect(screen.queryByText('Grid Size')).not.toBeInTheDocument();
      
      // Toggle back on
      await user.click(enableToggle);
      
      // Re-render with enabled grid
      rerender(<GridControls gridSettings={mockGridSettings} {...mockCallbacks} />);
      
      // Grid content should be visible again
      expect(screen.getByText('Grid Size')).toBeInTheDocument();
    });

    it('responds to external grid settings changes', () => {
      const { rerender } = render(
        <GridControls gridSettings={mockGridSettings} {...mockCallbacks} />
      );
      
      // Change settings externally
      const newSettings = { ...mockGridSettings, size: 40, snapToGrid: true };
      rerender(<GridControls gridSettings={newSettings} {...mockCallbacks} />);
      
      // UI should reflect new settings
      expect(screen.getByText('40px')).toBeInTheDocument();
      expect(screen.getByLabelText('Snap to grid')).toBeChecked();
      expect(screen.getByText('Snap Distance')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for form controls', () => {
      render(<GridControls gridSettings={mockGridSettings} {...mockCallbacks} />);
      
      expect(screen.getByLabelText('Enable grid system')).toBeInTheDocument();
      expect(screen.getByLabelText('Grid size')).toBeInTheDocument();
    });

    it('has proper labels for checkboxes', () => {
      render(<GridControls gridSettings={mockGridSettings} {...mockCallbacks} />);
      
      expect(screen.getByLabelText('Show grid lines')).toBeInTheDocument();
      expect(screen.getByLabelText('Snap to grid')).toBeInTheDocument();
    });

    it('provides title attributes for preset buttons', () => {
      render(<GridControls gridSettings={mockGridSettings} {...mockCallbacks} />);
      
      const normalPreset = screen.getByText('Normal');
      expect(normalPreset).toHaveAttribute('title', 'Normal (20px)');
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<GridControls gridSettings={mockGridSettings} {...mockCallbacks} />);
      
      // Tab through controls
      await user.tab();
      expect(screen.getByLabelText('Enable grid system')).toHaveFocus();
      
      await user.tab();
      expect(screen.getByLabelText('Show grid lines')).toHaveFocus();
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined gridSettings gracefully', () => {
      const undefinedSettings = undefined as any;
      
      expect(() => {
        render(<GridControls gridSettings={undefinedSettings} {...mockCallbacks} />);
      }).toThrow(); // Should throw as gridSettings is required
    });

    it('handles missing callback functions', () => {
      const incompleteCallbacks = {
        onGridEnabledChange: vi.fn(),
        onGridSizeChange: vi.fn(),
        onGridSnapEnabledChange: vi.fn(),
        onGridVisibleChange: vi.fn(),
        // Missing onGridSnapDistanceChange
      } as any;
      
      expect(() => {
        render(<GridControls gridSettings={mockGridSettings} {...incompleteCallbacks} />);
      }).not.toThrow();
    });

    it('handles extreme grid size values', () => {
      const extremeGrid = { ...mockGridSettings, size: 1 };
      render(<GridControls gridSettings={extremeGrid} {...mockCallbacks} />);
      
      expect(screen.getByText('1px')).toBeInTheDocument();
    });

    it('handles extreme snap distance values', () => {
      const extremeSnapGrid = { ...mockGridSettings, snapToGrid: true, snapDistance: 50 };
      render(<GridControls gridSettings={extremeSnapGrid} {...mockCallbacks} />);
      
      expect(screen.getByText('50px')).toBeInTheDocument();
    });
  });
});