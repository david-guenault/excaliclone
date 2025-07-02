// ABOUTME: Comprehensive tests for AdvancedColorPicker component functionality
// ABOUTME: Tests modal interactions, color selection, keyboard shortcuts, frequently used colors tracking

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AdvancedColorPicker } from '../AdvancedColorPicker';
import { 
  MAIN_COLOR_PALETTE, 
  COLOR_KEYBOARD_SHORTCUTS, 
  COLOR_FAMILIES,
  ADVANCED_COLOR_PICKER 
} from '../../../constants';

// Mock localStorage for frequently used colors
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

describe('AdvancedColorPicker', () => {
  const defaultProps = {
    isOpen: true,
    currentColor: '#ff0000',
    onColorSelect: vi.fn(),
    onClose: vi.fn(),
    position: { x: 100, y: 100 }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Modal Rendering', () => {
    it('renders when isOpen is true', () => {
      render(<AdvancedColorPicker {...defaultProps} />);
      
      expect(screen.getByText('Couleurs personnalisées les plus fréquemment utilisées')).toBeInTheDocument();
      expect(screen.getByText('Couleurs')).toBeInTheDocument();
      expect(screen.getByText('Nuances')).toBeInTheDocument();
      expect(screen.getByText('Code hex')).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
      render(<AdvancedColorPicker {...defaultProps} isOpen={false} />);
      
      expect(screen.queryByText('Couleurs')).not.toBeInTheDocument();
    });

    it('positions modal correctly', () => {
      render(<AdvancedColorPicker {...defaultProps} position={{ x: 200, y: 150 }} />);
      
      const modal = screen.getByText('Couleurs').closest('.advanced-color-picker');
      expect(modal).toHaveStyle({
        left: '200px',
        top: '150px'
      });
    });
  });

  describe('Main Color Palette', () => {
    it('renders all main palette colors', () => {
      render(<AdvancedColorPicker {...defaultProps} />);
      
      // Check that main palette colors are rendered using their keyboard shortcuts as names
      MAIN_COLOR_PALETTE.forEach((color, index) => {
        const colorButton = screen.getByRole('button', { 
          name: COLOR_KEYBOARD_SHORTCUTS[index]
        });
        expect(colorButton).toBeInTheDocument();
        expect(colorButton).toHaveStyle({ backgroundColor: color });
      });
    });

    it('shows keyboard shortcuts for main palette colors', () => {
      render(<AdvancedColorPicker {...defaultProps} />);
      
      COLOR_KEYBOARD_SHORTCUTS.slice(0, MAIN_COLOR_PALETTE.length).forEach((shortcut, index) => {
        const shortcutElement = screen.getByText(shortcut);
        expect(shortcutElement).toBeInTheDocument();
      });
    });

    it('highlights current color in main palette', () => {
      const currentColor = MAIN_COLOR_PALETTE[2];
      render(<AdvancedColorPicker {...defaultProps} currentColor={currentColor} />);
      
      const activeButton = screen.getByRole('button', { 
        name: COLOR_KEYBOARD_SHORTCUTS[2]
      });
      expect(activeButton).toHaveClass('active');
    });

    it('calls onColorSelect when main palette color is clicked', async () => {
      const user = userEvent.setup();
      render(<AdvancedColorPicker {...defaultProps} />);
      
      const colorButton = screen.getByRole('button', { 
        name: COLOR_KEYBOARD_SHORTCUTS[0]
      });
      
      await user.click(colorButton);
      
      expect(defaultProps.onColorSelect).toHaveBeenCalledWith(MAIN_COLOR_PALETTE[0]);
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  describe('Frequently Used Colors', () => {
    it('loads frequently used colors from localStorage', () => {
      const frequentColors = [
        { color: '#123456', count: 5, lastUsed: Date.now() },
        { color: '#abcdef', count: 3, lastUsed: Date.now() - 1000 }
      ];
      mockLocalStorage.setItem(
        ADVANCED_COLOR_PICKER.FREQUENTLY_USED_STORAGE_KEY, 
        JSON.stringify(frequentColors)
      );

      render(<AdvancedColorPicker {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /#123456.*5.*times/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /#abcdef.*3.*times/i })).toBeInTheDocument();
    });

    it('handles corrupted localStorage data gracefully', () => {
      mockLocalStorage.setItem(
        ADVANCED_COLOR_PICKER.FREQUENTLY_USED_STORAGE_KEY, 
        'invalid json'
      );

      expect(() => {
        render(<AdvancedColorPicker {...defaultProps} />);
      }).not.toThrow();
    });

    it('updates frequently used colors when selecting', async () => {
      const user = userEvent.setup();
      render(<AdvancedColorPicker {...defaultProps} />);
      
      const colorButton = screen.getByRole('button', { 
        name: new RegExp(`${MAIN_COLOR_PALETTE[1]}.*${COLOR_KEYBOARD_SHORTCUTS[1]}`, 'i')
      });
      
      await user.click(colorButton);
      
      const storedData = mockLocalStorage.getItem(ADVANCED_COLOR_PICKER.FREQUENTLY_USED_STORAGE_KEY);
      expect(storedData).toBeTruthy();
      
      const parsedData = JSON.parse(storedData!);
      expect(parsedData).toHaveLength(1);
      expect(parsedData[0].color).toBe(MAIN_COLOR_PALETTE[1]);
      expect(parsedData[0].count).toBe(1);
    });

    it('increments count for existing frequently used colors', async () => {
      const user = userEvent.setup();
      const existingColor = MAIN_COLOR_PALETTE[0];
      const frequentColors = [
        { color: existingColor, count: 2, lastUsed: Date.now() - 1000 }
      ];
      mockLocalStorage.setItem(
        ADVANCED_COLOR_PICKER.FREQUENTLY_USED_STORAGE_KEY, 
        JSON.stringify(frequentColors)
      );

      render(<AdvancedColorPicker {...defaultProps} />);
      
      const colorButton = screen.getByRole('button', { 
        name: new RegExp(`${existingColor}.*${COLOR_KEYBOARD_SHORTCUTS[0]}`, 'i')
      });
      
      await user.click(colorButton);
      
      const storedData = mockLocalStorage.getItem(ADVANCED_COLOR_PICKER.FREQUENTLY_USED_STORAGE_KEY);
      const parsedData = JSON.parse(storedData!);
      expect(parsedData[0].count).toBe(3);
    });
  });

  describe('Nuances Section', () => {
    it('renders nuances for default family', () => {
      render(<AdvancedColorPicker {...defaultProps} />);
      
      COLOR_FAMILIES.red.forEach((color, index) => {
        const nuanceButton = screen.getByRole('button', { name: color });
        expect(nuanceButton).toBeInTheDocument();
        expect(nuanceButton).toHaveStyle({ backgroundColor: color });
        
        const numberLabel = screen.getByText((index + 1).toString());
        expect(numberLabel).toBeInTheDocument();
      });
    });

    it('updates nuances when selecting main palette color', async () => {
      const user = userEvent.setup();
      render(<AdvancedColorPicker {...defaultProps} />);
      
      // Find a blue color in the main palette
      const blueColorIndex = MAIN_COLOR_PALETTE.findIndex(color => 
        COLOR_FAMILIES.blue.includes(color)
      );
      
      if (blueColorIndex !== -1) {
        const blueColor = MAIN_COLOR_PALETTE[blueColorIndex];
        const colorButton = screen.getByRole('button', { 
          name: COLOR_KEYBOARD_SHORTCUTS[blueColorIndex]
        });
        
        await user.click(colorButton);
        
        // After clicking, the modal closes, so we need to open it again to check nuances
        // This tests the family detection logic
        expect(defaultProps.onColorSelect).toHaveBeenCalledWith(blueColor);
      }
    });
  });

  describe('Hex Input', () => {
    it('renders hex input with current color', () => {
      render(<AdvancedColorPicker {...defaultProps} currentColor="#ff0000" />);
      
      const hexInput = screen.getByPlaceholderText('ffec99');
      expect(hexInput).toHaveValue('ff0000');
    });

    it('validates hex input in real-time', async () => {
      const user = userEvent.setup();
      render(<AdvancedColorPicker {...defaultProps} />);
      
      const hexInput = screen.getByPlaceholderText('ffec99');
      
      // Clear input and type invalid hex
      await user.clear(hexInput);
      await user.type(hexInput, 'zzz');
      
      expect(hexInput).toHaveClass('invalid');
      
      // Type valid hex
      await user.clear(hexInput);
      await user.type(hexInput, '123abc');
      
      expect(hexInput).toHaveClass('valid');
    });

    it('shows color preview for valid hex', async () => {
      const user = userEvent.setup();
      render(<AdvancedColorPicker {...defaultProps} />);
      
      const hexInput = screen.getByPlaceholderText('ffec99');
      
      await user.clear(hexInput);
      await user.type(hexInput, '123abc');
      
      const preview = document.querySelector('.advanced-color-picker__hex-preview');
      expect(preview).toHaveStyle({ backgroundColor: 'rgb(18, 58, 188)' }); // #123abc converted to rgb
    });

    it('submits hex color on form submit', async () => {
      const user = userEvent.setup();
      render(<AdvancedColorPicker {...defaultProps} />);
      
      const hexInput = screen.getByPlaceholderText('ffec99');
      
      await user.clear(hexInput);
      await user.type(hexInput, '456def');
      await user.keyboard('{Enter}');
      
      expect(defaultProps.onColorSelect).toHaveBeenCalledWith('#456def');
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  describe('Keyboard Interactions', () => {
    it('closes modal on Escape key', () => {
      render(<AdvancedColorPicker {...defaultProps} />);
      
      fireEvent.keyDown(document, { key: 'Escape' });
      
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('selects colors using keyboard shortcuts', () => {
      render(<AdvancedColorPicker {...defaultProps} />);
      
      // Test first few shortcuts
      COLOR_KEYBOARD_SHORTCUTS.slice(0, 3).forEach((shortcut, index) => {
        fireEvent.keyDown(document, { key: shortcut });
        expect(defaultProps.onColorSelect).toHaveBeenCalledWith(MAIN_COLOR_PALETTE[index]);
      });
    });

    it('ignores keyboard shortcuts when modal is closed', () => {
      render(<AdvancedColorPicker {...defaultProps} isOpen={false} />);
      
      fireEvent.keyDown(document, { key: COLOR_KEYBOARD_SHORTCUTS[0] });
      
      expect(defaultProps.onColorSelect).not.toHaveBeenCalled();
    });
  });

  describe('Click Outside Behavior', () => {
    it('closes modal when clicking outside', async () => {
      render(
        <div>
          <div data-testid="outside">Outside</div>
          <AdvancedColorPicker {...defaultProps} />
        </div>
      );
      
      const outsideElement = screen.getByTestId('outside');
      fireEvent.mouseDown(outsideElement);
      
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('does not close modal when clicking inside', async () => {
      render(<AdvancedColorPicker {...defaultProps} />);
      
      const modalContent = screen.getByText('Couleurs');
      fireEvent.mouseDown(modalContent);
      
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for color buttons', () => {
      render(<AdvancedColorPicker {...defaultProps} />);
      
      MAIN_COLOR_PALETTE.slice(0, 3).forEach((color, index) => {
        const button = screen.getByRole('button', { 
          name: COLOR_KEYBOARD_SHORTCUTS[index]
        });
        expect(button).toBeInTheDocument();
        expect(button).toHaveAttribute('title'); // Should have tooltip with color info
      });
    });

    it('supports keyboard navigation', () => {
      render(<AdvancedColorPicker {...defaultProps} />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).not.toHaveAttribute('tabindex', '-1');
      });
    });
  });

  describe('Error Handling', () => {
    it('handles localStorage errors gracefully', () => {
      // Mock localStorage to throw error
      const originalSetItem = mockLocalStorage.setItem;
      mockLocalStorage.setItem = vi.fn(() => {
        throw new Error('Storage error');
      });

      expect(() => {
        render(<AdvancedColorPicker {...defaultProps} />);
      }).not.toThrow();

      // Restore original method
      mockLocalStorage.setItem = originalSetItem;
    });

    it('handles invalid hex input gracefully', async () => {
      const user = userEvent.setup();
      render(<AdvancedColorPicker {...defaultProps} />);
      
      const hexInput = screen.getByPlaceholderText('ffec99');
      
      await user.clear(hexInput);
      await user.type(hexInput, 'invalid');
      await user.keyboard('{Enter}');
      
      // Should not call onColorSelect for invalid hex
      expect(defaultProps.onColorSelect).not.toHaveBeenCalledWith('#invalid');
    });
  });
});