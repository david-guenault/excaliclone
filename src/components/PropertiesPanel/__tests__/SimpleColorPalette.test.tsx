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
      
      // Should render transparent indicator - use getAllByText since current color also shows ∅
      const transparentIndicators = screen.getAllByText('∅');
      expect(transparentIndicators.length).toBeGreaterThan(0);
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
      
      expect(screen.getByPlaceholderText('ffec99')).toBeInTheDocument();
    });

    it('applies custom color when submitting hex input', async () => {
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
      
      // Look for hex input field
      const hexInput = screen.getByPlaceholderText('ffec99');
      await user.clear(hexInput);
      await user.type(hexInput, '1a2b3c');
      
      // Submit the hex input (pressing Enter)
      await user.keyboard('{Enter}');
      
      // Color should be applied and picker closed
      expect(mockOnColorChange).toHaveBeenCalledWith('#1a2b3c');
      expect(screen.queryByPlaceholderText('ffec99')).not.toBeInTheDocument();
    });

    it('closes color picker when clicking outside', async () => {
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
      
      // Verify picker is open
      expect(screen.getByPlaceholderText('ffec99')).toBeInTheDocument();
      
      // Click outside the picker (on the document body)
      await user.click(document.body);
      
      // Picker should be closed
      expect(screen.queryByPlaceholderText('ffec99')).not.toBeInTheDocument();
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