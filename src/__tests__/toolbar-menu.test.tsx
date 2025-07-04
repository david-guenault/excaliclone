// ABOUTME: Tests for toolbar menu with grid controls
// ABOUTME: Validates grid and magnetic grid controls in the toolbar dropdown menu

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ToolbarMenu } from '../components/TopToolbar/ToolbarMenu';
import { useAppStore } from '../store';

// Mock the store
vi.mock('../store', () => ({
  useAppStore: vi.fn(),
}));

const mockUseAppStore = useAppStore as any;

describe('Toolbar Menu Grid Controls', () => {
  const mockSetGridVisible = vi.fn();
  const mockSetGridSize = vi.fn();
  const mockSetGridSnapEnabled = vi.fn();
  const mockSetGridMagneticEnabled = vi.fn();
  const mockSetGridMagneticStrength = vi.fn();
  const mockSetGridMagneticRadius = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    const mockStore = {
      ui: {
        grid: {
          enabled: true,
          size: 20,
          snapToGrid: false,
          snapDistance: 10,
          showGrid: false,
          color: '#e1e5e9',
          opacity: 0.3,
          magneticEnabled: false,
          magneticStrength: 25,
          magneticRadius: 30,
        },
      },
      setGridVisible: mockSetGridVisible,
      setGridSize: mockSetGridSize,
      setGridSnapEnabled: mockSetGridSnapEnabled,
      setGridMagneticEnabled: mockSetGridMagneticEnabled,
      setGridMagneticStrength: mockSetGridMagneticStrength,
      setGridMagneticRadius: mockSetGridMagneticRadius,
    };

    mockUseAppStore.mockReturnValue(mockStore);
  });

  describe('Menu Toggle', () => {
    it('should render menu trigger button', () => {
      render(<ToolbarMenu />);
      
      const triggerButton = screen.getByLabelText(/menu des options/i);
      expect(triggerButton).toBeInTheDocument();
    });

    it('should open menu when trigger is clicked', async () => {
      render(<ToolbarMenu />);
      
      const triggerButton = screen.getByLabelText(/menu des options/i);
      fireEvent.click(triggerButton);
      
      await waitFor(() => {
        expect(screen.getByText('Grille')).toBeInTheDocument();
        expect(screen.getByText('Grille Magnétique')).toBeInTheDocument();
      });
    });

    it('should close menu when clicking outside', async () => {
      render(
        <div>
          <ToolbarMenu />
          <div data-testid="outside">Outside element</div>
        </div>
      );
      
      const triggerButton = screen.getByLabelText(/menu des options/i);
      fireEvent.click(triggerButton);
      
      // Wait for menu to open
      await waitFor(() => {
        expect(screen.getByText('Grille')).toBeInTheDocument();
      });
      
      // Click outside
      const outsideElement = screen.getByTestId('outside');
      fireEvent.mouseDown(outsideElement);
      
      await waitFor(() => {
        expect(screen.queryByText('Grille')).not.toBeInTheDocument();
      });
    });

    it('should close menu when pressing Escape', async () => {
      render(<ToolbarMenu />);
      
      const triggerButton = screen.getByLabelText(/menu des options/i);
      fireEvent.click(triggerButton);
      
      // Wait for menu to open
      await waitFor(() => {
        expect(screen.getByText('Grille')).toBeInTheDocument();
      });
      
      // Press Escape
      fireEvent.keyDown(document, { key: 'Escape' });
      
      await waitFor(() => {
        expect(screen.queryByText('Grille')).not.toBeInTheDocument();
      });
    });
  });

  describe('Grid Controls in Menu', () => {
    beforeEach(async () => {
      render(<ToolbarMenu />);
      const triggerButton = screen.getByLabelText(/menu des options/i);
      fireEvent.click(triggerButton);
      
      // Wait for menu to open
      await waitFor(() => {
        expect(screen.getByText('Grille')).toBeInTheDocument();
      });
    });

    it('should render grid controls section', () => {
      expect(screen.getByText('Grille')).toBeInTheDocument();
      expect(screen.getByLabelText(/afficher la grille/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/taille de la grille/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/accrochage à la grille/i)).toBeInTheDocument();
    });

    it('should toggle grid visibility', async () => {
      const gridToggle = screen.getByLabelText(/afficher la grille/i);
      fireEvent.click(gridToggle);
      
      await waitFor(() => {
        expect(mockSetGridVisible).toHaveBeenCalledWith(true);
      });
    });

    it('should update grid size', async () => {
      const gridSizeInput = screen.getByLabelText(/taille de la grille/i);
      fireEvent.change(gridSizeInput, { target: { value: '30' } });
      
      await waitFor(() => {
        expect(mockSetGridSize).toHaveBeenCalledWith(30);
      });
    });

    it('should toggle snap to grid', async () => {
      const snapToggle = screen.getByLabelText(/accrochage à la grille/i);
      fireEvent.click(snapToggle);
      
      await waitFor(() => {
        expect(mockSetGridSnapEnabled).toHaveBeenCalledWith(true);
      });
    });

    it('should display keyboard shortcuts', () => {
      expect(screen.getByText('G')).toBeInTheDocument(); // Grid toggle shortcut
    });
  });

  describe('Magnetic Grid Controls in Menu', () => {
    beforeEach(async () => {
      render(<ToolbarMenu />);
      const triggerButton = screen.getByLabelText(/menu des options/i);
      fireEvent.click(triggerButton);
      
      // Wait for menu to open
      await waitFor(() => {
        expect(screen.getByText('Grille Magnétique')).toBeInTheDocument();
      });
    });

    it('should render magnetic grid controls section', () => {
      expect(screen.getByText('Grille Magnétique')).toBeInTheDocument();
      expect(screen.getByLabelText(/grille magnétique/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/force magnétique/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/rayon magnétique/i)).toBeInTheDocument();
    });

    it('should toggle magnetic grid', async () => {
      const magneticToggle = screen.getByLabelText(/grille magnétique/i);
      fireEvent.click(magneticToggle);
      
      await waitFor(() => {
        expect(mockSetGridMagneticEnabled).toHaveBeenCalledWith(true);
      });
    });

    it('should update magnetic strength', async () => {
      const strengthSlider = screen.getByLabelText(/force magnétique/i);
      fireEvent.change(strengthSlider, { target: { value: '40' } });
      
      await waitFor(() => {
        expect(mockSetGridMagneticStrength).toHaveBeenCalledWith(40);
      });
    });

    it('should update magnetic radius', async () => {
      const radiusSlider = screen.getByLabelText(/rayon magnétique/i);
      fireEvent.change(radiusSlider, { target: { value: '50' } });
      
      await waitFor(() => {
        expect(mockSetGridMagneticRadius).toHaveBeenCalledWith(50);
      });
    });

    it('should display magnetic icon', () => {
      expect(screen.getByText('🧲')).toBeInTheDocument();
    });

    it('should display M keyboard shortcut', () => {
      expect(screen.getByText('M')).toBeInTheDocument(); // Magnetic toggle shortcut
    });

    it('should disable magnetic controls when magnetic is disabled', () => {
      const strengthSlider = screen.getByLabelText(/force magnétique/i);
      const radiusSlider = screen.getByLabelText(/rayon magnétique/i);
      
      expect(strengthSlider).toBeDisabled();
      expect(radiusSlider).toBeDisabled();
    });

    it('should show help text when magnetic is enabled', async () => {
      // Enable magnetic mode
      mockUseAppStore.mockReturnValue({
        ...mockUseAppStore(),
        ui: {
          grid: {
            ...mockUseAppStore().ui.grid,
            magneticEnabled: true,
          },
        },
      });
      
      // Re-render component
      render(<ToolbarMenu />);
      const triggerButton = screen.getByLabelText(/menu des options/i);
      fireEvent.click(triggerButton);
      
      await waitFor(() => {
        expect(screen.getByText(/attire automatiquement/i)).toBeInTheDocument();
      });
    });

    it('should show magnetic status indicator when enabled', async () => {
      // Enable magnetic mode
      mockUseAppStore.mockReturnValue({
        ...mockUseAppStore(),
        ui: {
          grid: {
            ...mockUseAppStore().ui.grid,
            magneticEnabled: true,
          },
        },
      });
      
      render(<ToolbarMenu />);
      const triggerButton = screen.getByLabelText(/menu des options/i);
      fireEvent.click(triggerButton);
      
      await waitFor(() => {
        const statusIndicator = screen.getByTestId('magnetic-status-indicator');
        expect(statusIndicator).toBeInTheDocument();
      });
    });
  });

  describe('Value Constraints', () => {
    beforeEach(async () => {
      render(<ToolbarMenu />);
      const triggerButton = screen.getByLabelText(/menu des options/i);
      fireEvent.click(triggerButton);
      
      await waitFor(() => {
        expect(screen.getByText('Grille')).toBeInTheDocument();
      });
    });

    it('should constrain grid size to valid range', async () => {
      const gridSizeInput = screen.getByLabelText(/taille de la grille/i);
      
      // Test minimum constraint
      fireEvent.change(gridSizeInput, { target: { value: '3' } });
      await waitFor(() => {
        expect(mockSetGridSize).toHaveBeenCalledWith(5);
      });
      
      // Test maximum constraint
      fireEvent.change(gridSizeInput, { target: { value: '150' } });
      await waitFor(() => {
        expect(mockSetGridSize).toHaveBeenCalledWith(100);
      });
    });

    it('should constrain magnetic strength to valid range', async () => {
      const strengthSlider = screen.getByLabelText(/force magnétique/i);
      
      // Test minimum constraint
      fireEvent.change(strengthSlider, { target: { value: '5' } });
      await waitFor(() => {
        expect(mockSetGridMagneticStrength).toHaveBeenCalledWith(10);
      });
      
      // Test maximum constraint
      fireEvent.change(strengthSlider, { target: { value: '60' } });
      await waitFor(() => {
        expect(mockSetGridMagneticStrength).toHaveBeenCalledWith(50);
      });
    });

    it('should constrain magnetic radius to valid range', async () => {
      const radiusSlider = screen.getByLabelText(/rayon magnétique/i);
      
      // Test minimum constraint
      fireEvent.change(radiusSlider, { target: { value: '15' } });
      await waitFor(() => {
        expect(mockSetGridMagneticRadius).toHaveBeenCalledWith(20);
      });
      
      // Test maximum constraint
      fireEvent.change(radiusSlider, { target: { value: '120' } });
      await waitFor(() => {
        expect(mockSetGridMagneticRadius).toHaveBeenCalledWith(100);
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', async () => {
      render(<ToolbarMenu />);
      
      const triggerButton = screen.getByLabelText(/menu des options/i);
      expect(triggerButton).toHaveAttribute('aria-expanded', 'false');
      expect(triggerButton).toHaveAttribute('aria-haspopup', 'true');
      
      fireEvent.click(triggerButton);
      
      await waitFor(() => {
        expect(triggerButton).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });
    });

    it('should have proper labels for all controls', async () => {
      render(<ToolbarMenu />);
      const triggerButton = screen.getByLabelText(/menu des options/i);
      fireEvent.click(triggerButton);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/afficher la grille/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/taille de la grille/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/accrochage à la grille/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/grille magnétique/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/force magnétique/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/rayon magnétique/i)).toBeInTheDocument();
      });
    });
  });
});