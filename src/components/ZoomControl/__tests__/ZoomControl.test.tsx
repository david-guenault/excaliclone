// ABOUTME: Tests for ZoomControl component covering all zoom interactions and accessibility
// ABOUTME: Tests button states, percentage display, integration with viewport, and keyboard support

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ZoomControl } from '../ZoomControl';
import { useAppStore } from '../../../store';
import { act } from '@testing-library/react';

// Mock the store
vi.mock('../../../store', () => ({
  useAppStore: vi.fn(),
}));

const mockUseAppStore = useAppStore as unknown as vi.MockedFunction<typeof useAppStore>;

describe('ZoomControl', () => {
  const mockZoomIn = vi.fn();
  const mockZoomOut = vi.fn();
  
  const defaultStoreState = {
    viewport: {
      zoom: 1,
      pan: { x: 0, y: 0 },
      bounds: { x: 0, y: 0, width: 800, height: 600 },
    },
    zoomIn: mockZoomIn,
    zoomOut: mockZoomOut,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAppStore.mockReturnValue(defaultStoreState);
  });

  describe('Component Rendering', () => {
    it('renders zoom control with all elements', () => {
      render(<ZoomControl />);
      
      expect(screen.getByRole('button', { name: /zoom out/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /zoom in/i })).toBeInTheDocument();
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('displays correct zoom percentage', () => {
      mockUseAppStore.mockReturnValue({
        ...defaultStoreState,
        viewport: { ...defaultStoreState.viewport, zoom: 1.5 },
      });

      render(<ZoomControl />);
      
      expect(screen.getByText('150%')).toBeInTheDocument();
    });

    it('formats zoom percentage correctly for various zoom levels', () => {
      const testCases = [
        { zoom: 0.1, expected: '10%' },
        { zoom: 0.5, expected: '50%' },
        { zoom: 1, expected: '100%' },
        { zoom: 1.25, expected: '125%' },
        { zoom: 2.5, expected: '250%' },
        { zoom: 5, expected: '500%' },
      ];

      testCases.forEach(({ zoom, expected }) => {
        mockUseAppStore.mockReturnValue({
          ...defaultStoreState,
          viewport: { ...defaultStoreState.viewport, zoom },
        });

        const { rerender } = render(<ZoomControl />);
        expect(screen.getByText(expected)).toBeInTheDocument();
        rerender(<div />);
      });
    });
  });

  describe('Button Interactions', () => {
    it('calls zoomIn when zoom in button is clicked', async () => {
      const user = userEvent.setup();
      render(<ZoomControl />);
      
      const zoomInButton = screen.getByRole('button', { name: /zoom in/i });
      await user.click(zoomInButton);
      
      expect(mockZoomIn).toHaveBeenCalledTimes(1);
    });

    it('calls zoomOut when zoom out button is clicked', async () => {
      const user = userEvent.setup();
      render(<ZoomControl />);
      
      const zoomOutButton = screen.getByRole('button', { name: /zoom out/i });
      await user.click(zoomOutButton);
      
      expect(mockZoomOut).toHaveBeenCalledTimes(1);
    });

    it('supports multiple rapid clicks', async () => {
      const user = userEvent.setup();
      render(<ZoomControl />);
      
      const zoomInButton = screen.getByRole('button', { name: /zoom in/i });
      
      await act(async () => {
        await user.click(zoomInButton);
        await user.click(zoomInButton);
        await user.click(zoomInButton);
      });
      
      expect(mockZoomIn).toHaveBeenCalledTimes(3);
    });
  });

  describe('Button States', () => {
    it('disables zoom out button at minimum zoom', () => {
      mockUseAppStore.mockReturnValue({
        ...defaultStoreState,
        viewport: { ...defaultStoreState.viewport, zoom: 0.1 }, // minimum zoom
      });

      render(<ZoomControl />);
      
      const zoomOutButton = screen.getByRole('button', { name: /zoom out/i });
      expect(zoomOutButton).toBeDisabled();
    });

    it('disables zoom in button at maximum zoom', () => {
      mockUseAppStore.mockReturnValue({
        ...defaultStoreState,
        viewport: { ...defaultStoreState.viewport, zoom: 5 }, // maximum zoom
      });

      render(<ZoomControl />);
      
      const zoomInButton = screen.getByRole('button', { name: /zoom in/i });
      expect(zoomInButton).toBeDisabled();
    });

    it('enables both buttons at normal zoom levels', () => {
      mockUseAppStore.mockReturnValue({
        ...defaultStoreState,
        viewport: { ...defaultStoreState.viewport, zoom: 1.5 },
      });

      render(<ZoomControl />);
      
      const zoomOutButton = screen.getByRole('button', { name: /zoom out/i });
      const zoomInButton = screen.getByRole('button', { name: /zoom in/i });
      
      expect(zoomOutButton).toBeEnabled();
      expect(zoomInButton).toBeEnabled();
    });

    it('handles edge cases near min/max zoom', () => {
      // Test just above minimum
      mockUseAppStore.mockReturnValue({
        ...defaultStoreState,
        viewport: { ...defaultStoreState.viewport, zoom: 0.11 },
      });

      const { rerender } = render(<ZoomControl />);
      expect(screen.getByRole('button', { name: /zoom out/i })).toBeEnabled();

      // Test just below maximum
      mockUseAppStore.mockReturnValue({
        ...defaultStoreState,
        viewport: { ...defaultStoreState.viewport, zoom: 4.9 },
      });

      rerender(<ZoomControl />);
      expect(screen.getByRole('button', { name: /zoom in/i })).toBeEnabled();
    });
  });

  describe('Visual Design', () => {
    it('applies correct CSS classes for styling', () => {
      render(<ZoomControl />);
      
      const container = screen.getByRole('region', { name: /zoom control/i });
      expect(container).toHaveClass('zoom-control');
    });

    it('applies proper button styling', () => {
      render(<ZoomControl />);
      
      const zoomOutButton = screen.getByRole('button', { name: /zoom out/i });
      const zoomInButton = screen.getByRole('button', { name: /zoom in/i });
      
      expect(zoomOutButton).toHaveClass('zoom-control__button');
      expect(zoomInButton).toHaveClass('zoom-control__button');
    });

    it('applies proper percentage display styling', () => {
      render(<ZoomControl />);
      
      const percentageDisplay = screen.getByText('100%');
      expect(percentageDisplay).toHaveClass('zoom-control__percentage');
    });
  });

  describe('Accessibility', () => {
    it('provides proper ARIA labels for screen readers', () => {
      render(<ZoomControl />);
      
      expect(screen.getByRole('button', { name: /zoom out/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /zoom in/i })).toBeInTheDocument();
      expect(screen.getByRole('region', { name: /zoom control/i })).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<ZoomControl />);
      
      const zoomOutButton = screen.getByRole('button', { name: /zoom out/i });
      const zoomInButton = screen.getByRole('button', { name: /zoom in/i });
      
      // Tab navigation
      await user.tab();
      expect(zoomOutButton).toHaveFocus();
      
      await user.tab();
      expect(zoomInButton).toHaveFocus();
    });

    it('supports keyboard activation', async () => {
      const user = userEvent.setup();
      render(<ZoomControl />);
      
      const zoomInButton = screen.getByRole('button', { name: /zoom in/i });
      zoomInButton.focus();
      
      await user.keyboard('{Enter}');
      expect(mockZoomIn).toHaveBeenCalledTimes(1);
      
      await user.keyboard(' '); // Spacebar
      expect(mockZoomIn).toHaveBeenCalledTimes(2);
    });

    it('announces zoom level changes to screen readers', () => {
      mockUseAppStore.mockReturnValue({
        ...defaultStoreState,
        viewport: { ...defaultStoreState.viewport, zoom: 1.25 },
      });

      render(<ZoomControl />);
      
      const percentageDisplay = screen.getByText('125%');
      expect(percentageDisplay).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Error Handling', () => {
    it('handles invalid zoom values gracefully', () => {
      mockUseAppStore.mockReturnValue({
        ...defaultStoreState,
        viewport: { ...defaultStoreState.viewport, zoom: NaN },
      });

      expect(() => render(<ZoomControl />)).not.toThrow();
      expect(screen.getByText('100%')).toBeInTheDocument(); // fallback value
    });

    it('handles missing store functions gracefully', () => {
      mockUseAppStore.mockReturnValue({
        ...defaultStoreState,
        zoomIn: undefined,
        zoomOut: undefined,
      });

      expect(() => render(<ZoomControl />)).not.toThrow();
      
      const zoomInButton = screen.getByRole('button', { name: /zoom in/i });
      const zoomOutButton = screen.getByRole('button', { name: /zoom out/i });
      
      expect(zoomInButton).toBeDisabled();
      expect(zoomOutButton).toBeDisabled();
    });
  });

  describe('Performance', () => {
    it('only re-renders when zoom level changes', () => {
      const { rerender } = render(<ZoomControl />);
      
      // Render with same zoom level
      mockUseAppStore.mockReturnValue({
        ...defaultStoreState,
        viewport: { ...defaultStoreState.viewport, zoom: 1 },
      });
      
      rerender(<ZoomControl />);
      expect(screen.getByText('100%')).toBeInTheDocument();
      
      // Change zoom level
      mockUseAppStore.mockReturnValue({
        ...defaultStoreState,
        viewport: { ...defaultStoreState.viewport, zoom: 1.5 },
      });
      
      rerender(<ZoomControl />);
      expect(screen.getByText('150%')).toBeInTheDocument();
    });
  });
});