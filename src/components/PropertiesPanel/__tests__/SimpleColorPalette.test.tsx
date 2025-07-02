// ABOUTME: Tests for SimpleColorPalette component
// ABOUTME: Covers 6-element layout, color selection, and color picker functionality

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SimpleColorPalette } from '../SimpleColorPalette';

describe('SimpleColorPalette', () => {
  const mockColors = ['#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00'] as const;
  const mockOnColorChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders label correctly', () => {
      render(
        <SimpleColorPalette
          label="Test Palette"
          predefinedColors={mockColors}
          currentColor="#000000"
          onColorChange={mockOnColorChange}
        />
      );
      
      expect(screen.getByText('Test Palette')).toBeInTheDocument();
    });

    it('renders all predefined color swatches', () => {
      render(
        <SimpleColorPalette
          label="Test Palette"
          predefinedColors={mockColors}
          currentColor="#000000"
          onColorChange={mockOnColorChange}
        />
      );
      
      // Should have 5 predefined colors + 1 current color element = 6 total
      const colorButtons = screen.getAllByRole('button');
      expect(colorButtons).toHaveLength(6);
    });

    it('renders current color element', () => {
      render(
        <SimpleColorPalette
          label="Test Palette"
          predefinedColors={mockColors}
          currentColor="#000000"
          onColorChange={mockOnColorChange}
        />
      );
      
      const currentColorButton = screen.getByLabelText('Open advanced color picker');
      expect(currentColorButton).toBeInTheDocument();
    });

    it('handles transparent color display', () => {
      render(
        <SimpleColorPalette
          label="Test Palette"
          predefinedColors={['transparent', '#ff0000', '#00ff00', '#0000ff', '#ffff00'] as const}
          currentColor="transparent"
          onColorChange={mockOnColorChange}
        />
      );
      
      // Should render transparent indicator
      expect(screen.getByText('∅')).toBeInTheDocument();
    });
  });

  describe('Color Selection', () => {
    it('calls onColorChange when predefined color is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <SimpleColorPalette
          label="Test Palette"
          predefinedColors={mockColors}
          currentColor="#000000"
          onColorChange={mockOnColorChange}
        />
      );
      
      const redColorButton = screen.getByLabelText('Select #ff0000 color');
      await user.click(redColorButton);
      
      expect(mockOnColorChange).toHaveBeenCalledWith('#ff0000');
    });

    it('highlights active color', () => {
      render(
        <SimpleColorPalette
          label="Test Palette"
          predefinedColors={mockColors}
          currentColor="#ff0000"
          onColorChange={mockOnColorChange}
        />
      );
      
      const activeButton = screen.getByLabelText('Select #ff0000 color');
      expect(activeButton).toHaveClass('active');
    });
  });

  describe('Color Picker', () => {
    it('opens color picker when current color button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <SimpleColorPalette
          label="Test Palette"
          predefinedColors={mockColors}
          currentColor="#000000"
          onColorChange={mockOnColorChange}
        />
      );
      
      const currentColorButton = screen.getByLabelText('Open advanced color picker');
      await user.click(currentColorButton);
      
      expect(screen.getByDisplayValue('#000000')).toBeInTheDocument();
    });

    it('applies custom color when apply button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <SimpleColorPalette
          label="Test Palette"
          predefinedColors={mockColors}
          currentColor="#000000"
          onColorChange={mockOnColorChange}
        />
      );
      
      const currentColorButton = screen.getByLabelText('Open advanced color picker');
      await user.click(currentColorButton);
      
      const hexInput = screen.getByDisplayValue('#000000');
      await user.clear(hexInput);
      await user.type(hexInput, '#ff6600');
      
      const applyButton = screen.getByTitle('Apply color');
      await user.click(applyButton);
      
      expect(mockOnColorChange).toHaveBeenCalledWith('#ff6600');
    });

    it('cancels color picker when cancel button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <SimpleColorPalette
          label="Test Palette"
          predefinedColors={mockColors}
          currentColor="#000000"
          onColorChange={mockOnColorChange}
        />
      );
      
      const currentColorButton = screen.getByLabelText('Open advanced color picker');
      await user.click(currentColorButton);
      
      const cancelButton = screen.getByTitle('Cancel');
      await user.click(cancelButton);
      
      expect(screen.queryByDisplayValue('#000000')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('provides proper aria labels for color buttons', () => {
      render(
        <SimpleColorPalette
          label="Test Palette"
          predefinedColors={mockColors}
          currentColor="#000000"
          onColorChange={mockOnColorChange}
        />
      );
      
      expect(screen.getByLabelText('Select #000000 color')).toBeInTheDocument();
      expect(screen.getByLabelText('Select #ff0000 color')).toBeInTheDocument();
      expect(screen.getByLabelText('Open advanced color picker')).toBeInTheDocument();
    });
  });
});