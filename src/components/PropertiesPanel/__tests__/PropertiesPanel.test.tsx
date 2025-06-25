// ABOUTME: Tests for PropertiesPanel component  
// ABOUTME: Validates conditional visibility, element properties display, and interactions

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PropertiesPanel } from '../PropertiesPanel';
import { useAppStore } from '../../../store';
import type { Element } from '../../../types';

const mockElement: Element = {
  id: 'test-element-1',
  type: 'rectangle',
  x: 100,
  y: 150,
  width: 200,
  height: 100,
  angle: 0,
  strokeColor: '#ff0000',
  backgroundColor: '#00ff00',
  strokeWidth: 3,
  roughness: 1,
  opacity: 0.8,
};

const mockElement2: Element = {
  id: 'test-element-2',
  type: 'circle',
  x: 300,
  y: 200,
  width: 80,
  height: 80,
  angle: 0,
  strokeColor: '#0000ff',
  backgroundColor: 'transparent',
  strokeWidth: 2,
  roughness: 1,
  opacity: 1,
};

describe('PropertiesPanel', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAppStore.setState({
      ui: {
        propertiesPanel: {
          visible: false,
          width: 300,
        },
        topToolbar: {
          visible: true,
        },
      },
      selectedElementIds: [],
      elements: [],
      clearSelection: vi.fn(),
      setPropertiesPanelWidth: vi.fn(),
    });
  });

  describe('Visibility Logic', () => {
    it('does not render when panel is not visible', () => {
      useAppStore.setState({
        ui: { propertiesPanel: { visible: false, width: 300 }, topToolbar: { visible: true } },
        selectedElementIds: ['test-element-1'],
        elements: [mockElement],
      });

      render(<PropertiesPanel />);
      
      expect(screen.queryByText(/properties/i)).not.toBeInTheDocument();
    });

    it('does not render when no elements are selected', () => {
      useAppStore.setState({
        ui: { propertiesPanel: { visible: true, width: 300 }, topToolbar: { visible: true } },
        selectedElementIds: [],
        elements: [mockElement],
      });

      render(<PropertiesPanel />);
      
      expect(screen.queryByText(/properties/i)).not.toBeInTheDocument();
    });

    it('renders when panel is visible and elements are selected', () => {
      useAppStore.setState({
        ui: { propertiesPanel: { visible: true, width: 300 }, topToolbar: { visible: true } },
        selectedElementIds: ['test-element-1'],
        elements: [mockElement],
      });

      render(<PropertiesPanel />);
      
      expect(screen.getByText(/rectangle properties/i)).toBeInTheDocument();
    });
  });

  describe('Single Element Selection', () => {
    beforeEach(() => {
      useAppStore.setState({
        ui: { propertiesPanel: { visible: true, width: 300 }, topToolbar: { visible: true } },
        selectedElementIds: ['test-element-1'],
        elements: [mockElement],
      });
    });

    it('displays element type in header', () => {
      render(<PropertiesPanel />);
      
      expect(screen.getByText('rectangle properties')).toBeInTheDocument();
    });

    it('shows element position properties', () => {
      render(<PropertiesPanel />);
      
      expect(screen.getByText('Position')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument(); // X position
      expect(screen.getByText('150')).toBeInTheDocument(); // Y position
    });

    it('shows element size properties', () => {
      render(<PropertiesPanel />);
      
      expect(screen.getByText('Size')).toBeInTheDocument();
      expect(screen.getByText('200')).toBeInTheDocument(); // Width
      expect(screen.getByText('100')).toBeInTheDocument(); // Height
    });

    it('displays style properties', () => {
      render(<PropertiesPanel />);
      
      expect(screen.getByText('Style')).toBeInTheDocument();
      expect(screen.getByText('#ff0000')).toBeInTheDocument(); // Stroke color
      expect(screen.getByText('#00ff00')).toBeInTheDocument(); // Background color
      expect(screen.getByText('3px')).toBeInTheDocument(); // Stroke width
      expect(screen.getByText('80%')).toBeInTheDocument(); // Opacity
    });

    it('shows color swatches for colors', () => {
      render(<PropertiesPanel />);
      
      const colorSwatches = screen.getAllByRole('generic').filter(el => 
        el.classList.contains('properties-panel__color-swatch')
      );
      
      expect(colorSwatches.length).toBeGreaterThan(0);
    });

    it('handles transparent background color correctly', () => {
      useAppStore.setState({
        ui: { propertiesPanel: { visible: true, width: 300 }, topToolbar: { visible: true } },
        selectedElementIds: ['test-element-2'],
        elements: [mockElement2],
      });

      render(<PropertiesPanel />);
      
      expect(screen.getByText('transparent')).toBeInTheDocument();
    });
  });

  describe('Multiple Element Selection', () => {
    beforeEach(() => {
      useAppStore.setState({
        ui: { propertiesPanel: { visible: true, width: 300 }, topToolbar: { visible: true } },
        selectedElementIds: ['test-element-1', 'test-element-2'],
        elements: [mockElement, mockElement2],
      });
    });

    it('shows multiple selection header', () => {
      render(<PropertiesPanel />);
      
      expect(screen.getByText('2 elements selected')).toBeInTheDocument();
    });

    it('displays list of selected elements', () => {
      render(<PropertiesPanel />);
      
      expect(screen.getByText('rectangle 1')).toBeInTheDocument();
      expect(screen.getByText('circle 2')).toBeInTheDocument();
    });

    it('shows multiple selection message', () => {
      render(<PropertiesPanel />);
      
      expect(screen.getByText('Multiple elements selected')).toBeInTheDocument();
    });
  });

  describe('Panel Interactions', () => {
    beforeEach(() => {
      useAppStore.setState({
        ui: { propertiesPanel: { visible: true, width: 300 }, topToolbar: { visible: true } },
        selectedElementIds: ['test-element-1'],
        elements: [mockElement],
      });
    });

    it('has close button that calls clearSelection', async () => {
      const clearSelectionMock = vi.fn();
      useAppStore.setState({ clearSelection: clearSelectionMock });

      const user = userEvent.setup();
      render(<PropertiesPanel />);
      
      const closeButton = screen.getByRole('button', { name: /clear selection/i });
      await user.click(closeButton);
      
      expect(clearSelectionMock).toHaveBeenCalled();
    });

    it('renders with correct panel width', () => {
      useAppStore.setState({
        ui: { propertiesPanel: { visible: true, width: 350 }, topToolbar: { visible: true } },
      });

      render(<PropertiesPanel />);
      
      const panel = screen.getByText(/rectangle properties/i).closest('.properties-panel');
      expect(panel).toHaveStyle({ width: '350px' });
    });

    it('has resize handle for width adjustment', () => {
      render(<PropertiesPanel />);
      
      const resizeHandle = document.querySelector('.properties-panel__resize-handle');
      expect(resizeHandle).toBeInTheDocument();
    });
  });

  describe('CSS Classes and Structure', () => {
    beforeEach(() => {
      useAppStore.setState({
        ui: { propertiesPanel: { visible: true, width: 300 }, topToolbar: { visible: true } },
        selectedElementIds: ['test-element-1'],
        elements: [mockElement],
      });
    });

    it('has correct CSS structure', () => {
      render(<PropertiesPanel />);
      
      const panel = screen.getByText(/rectangle properties/i).closest('.properties-panel');
      expect(panel).toBeInTheDocument();
      
      const header = panel?.querySelector('.properties-panel__header');
      expect(header).toBeInTheDocument();
      
      const content = panel?.querySelector('.properties-panel__content');
      expect(content).toBeInTheDocument();
    });

    it('applies correct section classes', () => {
      render(<PropertiesPanel />);
      
      const sections = document.querySelectorAll('.properties-panel__section');
      expect(sections.length).toBeGreaterThan(0);
      
      const sectionTitles = document.querySelectorAll('.properties-panel__section-title');
      expect(sectionTitles.length).toBeGreaterThan(0);
    });
  });

  describe('Panel Resize Functionality', () => {
    it('calls setPropertiesPanelWidth during resize interaction', () => {
      const setPropertiesPanelWidthMock = vi.fn();
      useAppStore.setState({
        ui: { propertiesPanel: { visible: true, width: 300 }, topToolbar: { visible: true } },
        selectedElementIds: ['test-element-1'],
        elements: [mockElement],
        setPropertiesPanelWidth: setPropertiesPanelWidthMock,
      });

      render(<PropertiesPanel />);
      
      const resizeHandle = document.querySelector('.properties-panel__resize-handle') as HTMLElement;
      expect(resizeHandle).toBeInTheDocument();
      
      // Simulate mouse events for resize
      const mouseDownEvent = new MouseEvent('mousedown', { 
        clientX: 300,
        bubbles: true 
      });
      
      resizeHandle.dispatchEvent(mouseDownEvent);
      
      // Simulate mouse move
      const mouseMoveEvent = new MouseEvent('mousemove', { 
        clientX: 350,
        bubbles: true 
      });
      
      document.dispatchEvent(mouseMoveEvent);
      
      expect(setPropertiesPanelWidthMock).toHaveBeenCalled();
    });
  });
});