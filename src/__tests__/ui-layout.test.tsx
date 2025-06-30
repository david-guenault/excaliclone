// ABOUTME: Integration tests for new UI layout structure
// ABOUTME: Tests toolbar, properties panel, and their interaction with the store

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { useAppStore } from '../store';
import { createActWrapper, waitForStateUpdate } from '../test/test-helpers';

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
    it('renders TopToolbar component', async () => {
      await act(async () => {
        render(<App />);
      });
      
      expect(screen.getByRole('button', { name: /selection tool/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /rectangle tool/i })).toBeInTheDocument();
    });

    it('does not render header from old layout', async () => {
      await act(async () => {
        render(<App />);
      });
      
      // Old header structure should not exist
      expect(screen.queryByRole('banner')).not.toBeInTheDocument();
      expect(screen.queryByTestId('old-header')).not.toBeInTheDocument();
    });

    it('renders Canvas with correct dimensions', async () => {
      await act(async () => {
        render(<App />);
      });
      
      const canvas = screen.getByTestId('mock-canvas');
      expect(canvas).toBeInTheDocument();
      
      // Should account for top toolbar height (64px)
      const expectedHeight = window.innerHeight - 64;
      expect(canvas).toHaveAttribute('data-height', expectedHeight.toString());
    });

    it('PropertiesPanel is hidden by default', async () => {
      await act(async () => {
        render(<App />);
      });
      
      expect(screen.queryByText(/properties/i)).not.toBeInTheDocument();
    });
  });

  describe('Tool Selection Integration', () => {
    it('clicking tool in TopToolbar updates store state', async () => {
      const user = createActWrapper();
      await act(async () => {
        render(<App />);
      });
      
      const rectangleButton = screen.getByRole('button', { name: /rectangle tool/i });
      await user.click(rectangleButton);
      await waitForStateUpdate();
      
      expect(useAppStore.getState().activeTool).toBe('rectangle');
    });

    it('active tool is reflected in TopToolbar UI', async () => {
      const user = createActWrapper();
      await act(async () => {
        render(<App />);
      });
      
      const circleButton = screen.getByRole('button', { name: /circle tool/i });
      await user.click(circleButton);
      await waitForStateUpdate();
      
      expect(circleButton).toHaveClass('top-toolbar__tool--active');
      expect(screen.getByRole('button', { name: /selection tool/i })).not.toHaveClass('top-toolbar__tool--active');
    });
  });

  describe('Properties Panel Conditional Visibility', () => {
    it('shows PropertiesPanel when element is selected', async () => {
      // Simulate element selection
      await act(async () => {
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
      });

      await act(async () => {
        render(<App />);
      });
      
      // Check that PropertiesPanel component is rendered (it has the rectangle type heading)
      expect(screen.getByText(/rectangle/)).toBeInTheDocument();
    });

    it('adjusts Canvas width when PropertiesPanel is visible', async () => {
      await act(async () => {
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
      });

      await act(async () => {
        render(<App />);
      });
      
      const canvas = screen.getByTestId('mock-canvas');
      const expectedWidth = window.innerWidth - 300; // Subtract panel width
      expect(canvas).toHaveAttribute('data-width', expectedWidth.toString());
    });

    it('hides PropertiesPanel when selection is cleared', async () => {
      // Start with an element selected
      await act(async () => {
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
      });

      const user = createActWrapper();
      await act(async () => {
        render(<App />);
      });
      
      // Verify panel is visible
      expect(screen.getByText(/rectangle/)).toBeInTheDocument();
      
      // Click close button
      const closeButton = screen.getByRole('button', { name: /clear selection/i });
      await user.click(closeButton);
      await waitForStateUpdate();
      
      // Panel should be hidden and canvas should expand
      expect(screen.queryByText(/rectangle/)).not.toBeInTheDocument();
    });
  });

  describe('Responsive Layout', () => {
    it('maintains proper spacing with different panel widths', async () => {
      await act(async () => {
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
      });

      await act(async () => {
        render(<App />);
      });
      
      const main = screen.getByRole('main');
      expect(main).toHaveStyle({
        marginTop: '64px',
        marginLeft: '350px',
      });
    });

    it('handles window resize correctly', async () => {
      await act(async () => {
        render(<App />);
      });
      
      // Simulate window resize
      await act(async () => {
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
      });
      
      await waitForStateUpdate();
      
      // Canvas should reflect new dimensions
      const canvas = screen.getByTestId('mock-canvas');
      expect(canvas).toHaveAttribute('data-width', '1200');
      expect(canvas).toHaveAttribute('data-height', '736'); // 800 - 64px toolbar
    });
  });

  describe('CSS Classes and Styling', () => {
    it('applies correct CSS classes to main elements', async () => {
      await act(async () => {
        render(<App />);
      });
      
      const main = screen.getByRole('main');
      expect(main).toHaveClass('app-main');
    });

    it('applies transition styles for smooth panel animation', async () => {
      await act(async () => {
        render(<App />);
      });
      
      const main = screen.getByRole('main');
      expect(main).toHaveStyle({
        transition: 'margin-left 0.2s ease-out',
      });
    });
  });

  describe('Store Integration', () => {
    it('updates UI state when panel visibility changes', async () => {
      await act(async () => {
        render(<App />);
      });
      
      // Simulate element creation and selection
      await act(async () => {
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
      });
      
      await act(async () => {
        const elements = useAppStore.getState().elements;
        if (elements.length > 0) {
          useAppStore.getState().selectElement(elements[0].id);
        }
      });
      
      await waitForStateUpdate();
      
      const state = useAppStore.getState();
      expect(state.ui.propertiesPanel.visible).toBe(true);
      expect(state.selectedElementIds.length).toBe(1);
    });
  });
});