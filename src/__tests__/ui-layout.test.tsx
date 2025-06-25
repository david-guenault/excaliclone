// ABOUTME: Integration tests for new UI layout structure
// ABOUTME: Tests toolbar, properties panel, and their interaction with the store

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { useAppStore } from '../store';

// Mock the Canvas component to avoid canvas-related issues in tests
vi.mock('../components/Canvas', () => ({
  Canvas: ({ width, height, elements }: any) => (
    <div
      data-testid="mock-canvas"
      data-width={width}
      data-height={height}
      data-elements-count={elements?.length || 0}
    >
      Mock Canvas
    </div>
  ),
}));

describe('UI Layout Integration', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAppStore.setState({
      viewport: {
        zoom: 1,
        pan: { x: 0, y: 0 },
        bounds: { x: 0, y: 0, width: 800, height: 600 },
      },
      elements: [],
      selectedElementIds: [],
      activeTool: 'select',
      toolOptions: {
        strokeColor: '#000000',
        backgroundColor: 'transparent',
        strokeWidth: 2,
        roughness: 1,
        opacity: 1,
      },
      theme: 'light',
      ui: {
        propertiesPanel: {
          visible: false,
          width: 300,
        },
        topToolbar: {
          visible: true,
        },
      },
      history: [[]],
      historyIndex: 0,
      clipboard: null,
    });
  });

  describe('Layout Structure', () => {
    it('renders TopToolbar component', () => {
      render(<App />);
      
      expect(screen.getByRole('heading', { name: 'Excalibox' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /select/i })).toBeInTheDocument();
    });

    it('does not render header from old layout', () => {
      render(<App />);
      
      // Old header structure should not exist
      expect(screen.queryByRole('banner')).not.toBeInTheDocument();
      expect(screen.queryByTestId('old-header')).not.toBeInTheDocument();
    });

    it('renders Canvas with correct dimensions', () => {
      render(<App />);
      
      const canvas = screen.getByTestId('mock-canvas');
      expect(canvas).toBeInTheDocument();
      
      // Should account for top toolbar height (64px)
      const expectedHeight = window.innerHeight - 64;
      expect(canvas).toHaveAttribute('data-height', expectedHeight.toString());
    });

    it('PropertiesPanel is hidden by default', () => {
      render(<App />);
      
      expect(screen.queryByText(/properties/i)).not.toBeInTheDocument();
    });
  });

  describe('Tool Selection Integration', () => {
    it('clicking tool in TopToolbar updates store state', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      const rectangleButton = screen.getByRole('button', { name: /rectangle/i });
      await user.click(rectangleButton);
      
      expect(useAppStore.getState().activeTool).toBe('rectangle');
    });

    it('active tool is reflected in TopToolbar UI', async () => {
      const user = userEvent.setup();
      render(<App />);
      
      const circleButton = screen.getByRole('button', { name: /circle/i });
      await user.click(circleButton);
      
      expect(circleButton).toHaveClass('active');
      expect(screen.getByRole('button', { name: /select/i })).not.toHaveClass('active');
    });
  });

  describe('Properties Panel Conditional Visibility', () => {
    it('shows PropertiesPanel when element is selected', () => {
      // Simulate element selection
      useAppStore.setState({
        elements: [{
          id: 'test-element',
          type: 'rectangle',
          x: 100,
          y: 100,
          width: 200,
          height: 100,
          angle: 0,
          strokeColor: '#000000',
          backgroundColor: 'transparent',
          strokeWidth: 2,
          roughness: 1,
          opacity: 1,
        }],
        selectedElementIds: ['test-element'],
        ui: {
          propertiesPanel: {
            visible: true,
            width: 300,
          },
          topToolbar: {
            visible: true,
          },
        },
      });

      render(<App />);
      
      expect(screen.getByText(/rectangle properties/i)).toBeInTheDocument();
    });

    it('adjusts Canvas width when PropertiesPanel is visible', () => {
      useAppStore.setState({
        elements: [{
          id: 'test-element',
          type: 'rectangle',
          x: 100,
          y: 100,
          width: 200,
          height: 100,
          angle: 0,
          strokeColor: '#000000',
          backgroundColor: 'transparent',
          strokeWidth: 2,
          roughness: 1,
          opacity: 1,
        }],
        selectedElementIds: ['test-element'],
        ui: {
          propertiesPanel: {
            visible: true,
            width: 300,
          },
          topToolbar: {
            visible: true,
          },
        },
      });

      render(<App />);
      
      const canvas = screen.getByTestId('mock-canvas');
      const expectedWidth = window.innerWidth - 300; // Subtract panel width
      expect(canvas).toHaveAttribute('data-width', expectedWidth.toString());
    });

    it('hides PropertiesPanel when selection is cleared', async () => {
      // Start with an element selected
      useAppStore.setState({
        elements: [{
          id: 'test-element',
          type: 'rectangle',
          x: 100,
          y: 100,
          width: 200,
          height: 100,
          angle: 0,
          strokeColor: '#000000',
          backgroundColor: 'transparent',
          strokeWidth: 2,
          roughness: 1,
          opacity: 1,
        }],
        selectedElementIds: ['test-element'],
        ui: {
          propertiesPanel: {
            visible: true,
            width: 300,
          },
          topToolbar: {
            visible: true,
          },
        },
      });

      const user = userEvent.setup();
      render(<App />);
      
      // Verify panel is visible
      expect(screen.getByText(/rectangle properties/i)).toBeInTheDocument();
      
      // Click close button
      const closeButton = screen.getByRole('button', { name: /clear selection/i });
      await user.click(closeButton);
      
      // Panel should be hidden and canvas should expand
      expect(screen.queryByText(/rectangle properties/i)).not.toBeInTheDocument();
    });
  });

  describe('Responsive Layout', () => {
    it('maintains proper spacing with different panel widths', () => {
      useAppStore.setState({
        elements: [{
          id: 'test-element',
          type: 'circle',
          x: 50,
          y: 50,
          width: 100,
          height: 100,
          angle: 0,
          strokeColor: '#000000',
          backgroundColor: 'transparent',
          strokeWidth: 2,
          roughness: 1,
          opacity: 1,
        }],
        selectedElementIds: ['test-element'],
        ui: {
          propertiesPanel: {
            visible: true,
            width: 350,
          },
          topToolbar: {
            visible: true,
          },
        },
      });

      render(<App />);
      
      const main = screen.getByRole('main');
      expect(main).toHaveStyle({
        marginTop: '64px',
        marginLeft: '350px',
      });
    });

    it('handles window resize correctly', () => {
      render(<App />);
      
      // Simulate window resize
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });
      
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 800,
      });
      
      // Trigger resize event
      window.dispatchEvent(new Event('resize'));
      
      // Canvas should reflect new dimensions
      const canvas = screen.getByTestId('mock-canvas');
      expect(canvas).toHaveAttribute('data-width', '1200');
      expect(canvas).toHaveAttribute('data-height', '736'); // 800 - 64px toolbar
    });
  });

  describe('CSS Classes and Styling', () => {
    it('applies correct CSS classes to main elements', () => {
      render(<App />);
      
      const app = screen.getByRole('heading', { name: 'Excalibox' }).closest('.excalibox-app');
      expect(app).toBeInTheDocument();
      
      const main = screen.getByRole('main');
      expect(main).toHaveClass('app-main');
    });

    it('applies transition styles for smooth panel animation', () => {
      render(<App />);
      
      const main = screen.getByRole('main');
      expect(main).toHaveStyle({
        transition: 'margin-left 0.2s ease-out',
      });
    });
  });

  describe('Store Integration', () => {
    it('updates UI state when panel visibility changes', () => {
      render(<App />);
      
      // Simulate element creation and selection
      useAppStore.getState().addElement({
        type: 'rectangle',
        x: 100,
        y: 100,
        width: 200,
        height: 100,
        angle: 0,
        strokeColor: '#000000',
        backgroundColor: 'transparent',
        strokeWidth: 2,
        roughness: 1,
        opacity: 1,
      });
      
      const elements = useAppStore.getState().elements;
      if (elements.length > 0) {
        useAppStore.getState().selectElement(elements[0].id);
      }
      
      const state = useAppStore.getState();
      expect(state.ui.propertiesPanel.visible).toBe(true);
      expect(state.selectedElementIds.length).toBe(1);
    });
  });
});