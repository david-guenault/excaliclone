// ABOUTME: Tests for ColorPalette component
// ABOUTME: Tests color selection, tabs, recent colors, and custom color input

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ColorPalette } from '../ColorPalette';
import type { ColorPaletteProps } from '../ColorPalette';

const defaultProps: ColorPaletteProps = {
  selectedStrokeColor: '#000000',
  selectedBackgroundColor: 'transparent',
  onStrokeColorChange: vi.fn(),
  onBackgroundColorChange: vi.fn(),
  recentColors: [],
  onAddRecentColor: vi.fn(),
};

describe('ColorPalette', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders tabs for stroke and background colors', () => {
      render(<ColorPalette {...defaultProps} />);
      
      expect(screen.getByText('Stroke')).toBeInTheDocument();
      expect(screen.getByText('Fill')).toBeInTheDocument();
    });

    it('renders current color preview', () => {
      render(<ColorPalette {...defaultProps} />);
      
      expect(screen.getByText('Current')).toBeInTheDocument();
    });

    it('renders main color grid', () => {
      render(<ColorPalette {...defaultProps} />);
      
      expect(screen.getByText('Colors')).toBeInTheDocument();
      
      // Should have multiple color buttons
      const colorButtons = screen.getAllByRole('button');
      expect(colorButtons.length).toBeGreaterThan(10);
    });

    it('renders custom color button', () => {
      render(<ColorPalette {...defaultProps} />);
      
      expect(screen.getByText('+ Custom')).toBeInTheDocument();
    });
  });

  describe('Tab Switching', () => {
    it('starts with stroke tab active', () => {
      render(<ColorPalette {...defaultProps} />);
      
      const strokeTab = screen.getByLabelText('Select stroke color');
      expect(strokeTab).toHaveClass('color-palette__tab--active');
    });

    it('switches to background tab when clicked', async () => {
      const user = userEvent.setup();
      render(<ColorPalette {...defaultProps} />);
      
      const fillTab = screen.getByLabelText('Select background color');
      await user.click(fillTab);
      
      expect(fillTab).toHaveClass('color-palette__tab--active');
    });

    it('shows different colors for background tab', async () => {
      const user = userEvent.setup();
      render(<ColorPalette {...defaultProps} />);
      
      // Click background tab
      const fillTab = screen.getByLabelText('Select background color');
      await user.click(fillTab);
      
      // Should show transparent option in background colors
      expect(screen.getByLabelText('Select Transparent color')).toBeInTheDocument();
    });
  });

  describe('Color Selection', () => {
    it('calls onStrokeColorChange when stroke color is selected', async () => {
      const user = userEvent.setup();
      const mockOnStrokeColorChange = vi.fn();
      
      render(
        <ColorPalette 
          {...defaultProps} 
          onStrokeColorChange={mockOnStrokeColorChange} 
        />
      );
      
      // Find and click a red color button (assuming red is in the palette)
      const redButton = screen.getByLabelText(/red/i);
      await user.click(redButton);
      
      expect(mockOnStrokeColorChange).toHaveBeenCalledWith(expect.stringMatching(/#[0-9a-f]{6}/i));
    });

    it('calls onBackgroundColorChange when background color is selected', async () => {
      const user = userEvent.setup();
      const mockOnBackgroundColorChange = vi.fn();
      
      render(
        <ColorPalette 
          {...defaultProps} 
          onBackgroundColorChange={mockOnBackgroundColorChange} 
        />
      );
      
      // Switch to background tab
      const fillTab = screen.getByLabelText('Select background color');
      await user.click(fillTab);
      
      // Click transparent color
      const transparentButton = screen.getByLabelText('Select Transparent color');
      await user.click(transparentButton);
      
      expect(mockOnBackgroundColorChange).toHaveBeenCalledWith('transparent');
    });

    it('shows selected color as active', () => {
      render(
        <ColorPalette 
          {...defaultProps} 
          selectedStrokeColor="#c92a2a" // Red color
        />
      );
      
      // Find the red button and check if it has selected class
      const buttons = screen.getAllByRole('button');
      const selectedButton = buttons.find(button => 
        button.classList.contains('color-button--selected')
      );
      expect(selectedButton).toBeInTheDocument();
    });
  });

  describe('Recent Colors', () => {
    it('renders recent colors section when provided', () => {
      const recentColors = ['#ff0000', '#00ff00', '#0000ff'];
      
      render(
        <ColorPalette 
          {...defaultProps} 
          recentColors={recentColors} 
        />
      );
      
      expect(screen.getByText('Recent')).toBeInTheDocument();
    });

    it('does not render recent colors section when empty', () => {
      render(<ColorPalette {...defaultProps} recentColors={[]} />);
      
      expect(screen.queryByText('Recent')).not.toBeInTheDocument();
    });

    it('calls onAddRecentColor when recent color is selected', async () => {
      const user = userEvent.setup();
      const mockOnAddRecentColor = vi.fn();
      const recentColors = ['#ff0000'];
      
      render(
        <ColorPalette 
          {...defaultProps} 
          recentColors={recentColors}
          onAddRecentColor={mockOnAddRecentColor} 
        />
      );
      
      // Click on the recent color
      const recentButton = screen.getByLabelText('Select Recent Color 1 color');
      await user.click(recentButton);
      
      expect(mockOnAddRecentColor).toHaveBeenCalledWith('#ff0000');
    });
  });

  describe('Custom Color Input', () => {
    it('shows custom input when custom button is clicked', async () => {
      const user = userEvent.setup();
      render(<ColorPalette {...defaultProps} />);
      
      const customButton = screen.getByText('+ Custom');
      await user.click(customButton);
      
      expect(screen.getByPlaceholderText('#ffffff')).toBeInTheDocument();
      expect(screen.getByLabelText('Apply custom color')).toBeInTheDocument();
      expect(screen.getByLabelText('Cancel custom color')).toBeInTheDocument();
    });

    it('applies valid hex color when submitted', async () => {
      const user = userEvent.setup();
      const mockOnStrokeColorChange = vi.fn();
      
      render(
        <ColorPalette 
          {...defaultProps} 
          onStrokeColorChange={mockOnStrokeColorChange} 
        />
      );
      
      // Open custom input
      const customButton = screen.getByText('+ Custom');
      await user.click(customButton);
      
      // Enter valid hex color
      const input = screen.getByPlaceholderText('#ffffff');
      await user.type(input, '#123456');
      
      // Click apply button
      const applyButton = screen.getByLabelText('Apply custom color');
      await user.click(applyButton);
      
      expect(mockOnStrokeColorChange).toHaveBeenCalledWith('#123456');
    });

    it('applies custom color on Enter key press', async () => {
      const user = userEvent.setup();
      const mockOnStrokeColorChange = vi.fn();
      
      render(
        <ColorPalette 
          {...defaultProps} 
          onStrokeColorChange={mockOnStrokeColorChange} 
        />
      );
      
      // Open custom input
      const customButton = screen.getByText('+ Custom');
      await user.click(customButton);
      
      // Enter valid hex color and press Enter
      const input = screen.getByPlaceholderText('#ffffff');
      await user.type(input, '#789abc{enter}');
      
      expect(mockOnStrokeColorChange).toHaveBeenCalledWith('#789abc');
    });

    it('cancels custom input on Escape key press', async () => {
      const user = userEvent.setup();
      render(<ColorPalette {...defaultProps} />);
      
      // Open custom input
      const customButton = screen.getByText('+ Custom');
      await user.click(customButton);
      
      // Press Escape
      const input = screen.getByPlaceholderText('#ffffff');
      await user.type(input, '{escape}');
      
      // Should go back to custom button
      expect(screen.getByText('+ Custom')).toBeInTheDocument();
      expect(screen.queryByPlaceholderText('#ffffff')).not.toBeInTheDocument();
    });

    it('disables apply button for invalid hex colors', async () => {
      const user = userEvent.setup();
      render(<ColorPalette {...defaultProps} />);
      
      // Open custom input
      const customButton = screen.getByText('+ Custom');
      await user.click(customButton);
      
      // Enter invalid hex color
      const input = screen.getByPlaceholderText('#ffffff');
      await user.type(input, 'invalid');
      
      const applyButton = screen.getByLabelText('Apply custom color');
      expect(applyButton).toBeDisabled();
    });

    it('cancels custom input when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<ColorPalette {...defaultProps} />);
      
      // Open custom input
      const customButton = screen.getByText('+ Custom');
      await user.click(customButton);
      
      // Click cancel
      const cancelButton = screen.getByLabelText('Cancel custom color');
      await user.click(cancelButton);
      
      // Should go back to custom button
      expect(screen.getByText('+ Custom')).toBeInTheDocument();
      expect(screen.queryByPlaceholderText('#ffffff')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('provides proper aria labels for tab buttons', () => {
      render(<ColorPalette {...defaultProps} />);
      
      expect(screen.getByLabelText('Select stroke color')).toBeInTheDocument();
      expect(screen.getByLabelText('Select background color')).toBeInTheDocument();
    });

    it('provides proper aria labels for color buttons', () => {
      render(<ColorPalette {...defaultProps} />);
      
      // Should have multiple color buttons with descriptive labels
      const colorButtons = screen.getAllByLabelText(/Select .* color/);
      expect(colorButtons.length).toBeGreaterThan(5);
    });

    it('provides proper aria labels for custom input controls', async () => {
      const user = userEvent.setup();
      render(<ColorPalette {...defaultProps} />);
      
      // Open custom input
      const customButton = screen.getByText('+ Custom');
      await user.click(customButton);
      
      expect(screen.getByLabelText('Enter hex color code')).toBeInTheDocument();
      expect(screen.getByLabelText('Apply custom color')).toBeInTheDocument();
      expect(screen.getByLabelText('Cancel custom color')).toBeInTheDocument();
    });
  });

  describe('CSS Classes', () => {
    it('applies correct base class', () => {
      const { container } = render(<ColorPalette {...defaultProps} />);
      
      expect(container.querySelector('.color-palette')).toBeInTheDocument();
    });

    it('applies custom className when provided', () => {
      const { container } = render(
        <ColorPalette {...defaultProps} className="custom-class" />
      );
      
      const palette = container.querySelector('.color-palette');
      expect(palette).toHaveClass('custom-class');
    });
  });
});