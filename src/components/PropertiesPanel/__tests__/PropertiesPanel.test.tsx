// ABOUTME: Tests for PropertiesPanel component with new 13-section architecture
// ABOUTME: Tests redesigned panel with dual color palettes, presets, and all new functionality

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PropertiesPanel } from '../PropertiesPanel';
import { useAppStore } from '../../../store';
import type { Element } from '../../../types';
import { 
  STROKE_COLORS,
  BACKGROUND_COLORS,
  FILL_PATTERNS,
  STROKE_WIDTH_PRESETS,
  STROKE_STYLE_PRESETS,
  ROUGHNESS_SIMPLE_PRESETS,
  CORNER_STYLE_PRESETS,
  FONT_SIZE_PRESETS
} from '../../../constants';

// Mock element for testing
const mockRectangleElement: Element = {
  id: 'test-rectangle-1',
  type: 'rectangle',
  x: 100,
  y: 150,
  width: 200,
  height: 100,
  angle: 0,
  strokeColor: '#ff0000',
  backgroundColor: '#FFFFFF', // Use a color that exists in BACKGROUND_COLORS
  strokeWidth: 2,
  strokeStyle: 'solid',
  fillStyle: 'solid',
  roughness: 1,
  opacity: 0.8,
  cornerStyle: 'sharp',
  fontFamily: 'Inter',
  fontSize: 16,
  fontWeight: 'normal',
  fontStyle: 'normal',
  textAlign: 'left',
};

const mockTextElement: Element = {
  id: 'test-text-1',
  type: 'text',
  x: 50,
  y: 75,
  width: 100,
  height: 50,
  angle: 0,
  strokeColor: '#000000',
  backgroundColor: 'transparent',
  strokeWidth: 1,
  strokeStyle: 'solid',
  fillStyle: 'transparent',
  roughness: 0,
  opacity: 1,
  fontFamily: 'Inter',
  fontSize: 16,
  fontWeight: 'normal',
  fontStyle: 'normal',
  textAlign: 'center',
  text: 'Sample text',
};

const mockArrowElement: Element = {
  id: 'test-arrow-1',
  type: 'arrow',
  x: 0,
  y: 0,
  width: 100,
  height: 50,
  angle: 0,
  strokeColor: '#000000',
  backgroundColor: 'transparent',
  strokeWidth: 2,
  strokeStyle: 'solid',
  fillStyle: 'transparent',
  roughness: 1,
  opacity: 1,
  endArrowHead: 'triangle',
  startArrowHead: 'none',
};

describe('PropertiesPanel', () => {
  const mockStoreActions = {
    clearSelection: vi.fn(),
    updateElement: vi.fn(),
    deleteElement: vi.fn(),
    duplicateElement: vi.fn(),
    bringForward: vi.fn(),
    sendBackward: vi.fn(),
    bringToFront: vi.fn(),
    sendToBack: vi.fn(),
    toggleElementLock: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset store state before each test
    useAppStore.setState({
      ui: {
        propertiesPanel: {
          visible: false,
          width: 200, // New fixed width
        },
        topToolbar: {
          visible: true,
        },
        canvasLocked: false,
        grid: {
          enabled: false,
          size: 20,
          snapToGrid: false,
          snapDistance: 10,
          showGrid: false,
          color: '#e1e5e9',
          opacity: 0.3,
        },
      },
      selectedElementIds: [],
      elements: [],
      ...mockStoreActions,
    });
  });

  describe('Visibility Logic', () => {
    it('does not render when panel is not visible', () => {
      useAppStore.setState({
        ui: { 
          ...useAppStore.getState().ui,
          propertiesPanel: { visible: false, width: 200 }
        },
        selectedElementIds: ['test-rectangle-1'],
        elements: [mockRectangleElement],
      });

      render(<PropertiesPanel />);
      
      expect(screen.queryByText('Trait')).not.toBeInTheDocument();
    });

    it('does not render when no elements are selected', () => {
      useAppStore.setState({
        ui: { 
          ...useAppStore.getState().ui,
          propertiesPanel: { visible: true, width: 200 }
        },
        selectedElementIds: [],
        elements: [mockRectangleElement],
      });

      render(<PropertiesPanel />);
      
      expect(screen.queryByText('Trait')).not.toBeInTheDocument();
    });

    it('renders when panel is visible and elements are selected', () => {
      useAppStore.setState({
        ui: { 
          ...useAppStore.getState().ui,
          propertiesPanel: { visible: true, width: 200 }
        },
        selectedElementIds: ['test-rectangle-1'],
        elements: [mockRectangleElement],
      });

      render(<PropertiesPanel />);
      
      expect(screen.getByText('rectangle')).toBeInTheDocument();
      expect(screen.getByText('Trait')).toBeInTheDocument();
    });
  });

  describe('Panel Structure', () => {
    beforeEach(() => {
      useAppStore.setState({
        ui: { 
          ...useAppStore.getState().ui,
          propertiesPanel: { visible: true, width: 200 }
        },
        selectedElementIds: ['test-rectangle-1'],
        elements: [mockRectangleElement],
      });
    });

    it('renders header with element type and close button', () => {
      render(<PropertiesPanel />);
      
      expect(screen.getByText('rectangle')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /clear selection/i })).toBeInTheDocument();
    });

    it('applies correct panel width styling', () => {
      render(<PropertiesPanel />);
      
      const panel = screen.getByText('rectangle').closest('.properties-panel');
      expect(panel).toHaveStyle({ width: '200px' });
    });

    it('calls clearSelection when close button is clicked', async () => {
      const user = userEvent.setup();
      render(<PropertiesPanel />);
      
      const closeButton = screen.getByRole('button', { name: /clear selection/i });
      await user.click(closeButton);
      
      expect(mockStoreActions.clearSelection).toHaveBeenCalledOnce();
    });
  });

  describe('Section 1: Trait (Stroke Colors)', () => {
    beforeEach(() => {
      useAppStore.setState({
        ui: { 
          ...useAppStore.getState().ui,
          propertiesPanel: { visible: true, width: 200 }
        },
        selectedElementIds: ['test-rectangle-1'],
        elements: [mockRectangleElement],
      });
    });

    it('renders stroke colors section', () => {
      render(<PropertiesPanel />);
      
      expect(screen.getByText('Trait')).toBeInTheDocument();
    });

    it('displays all stroke color swatches', () => {
      render(<PropertiesPanel />);
      
      STROKE_COLORS.forEach(color => {
        const colorButton = screen.getByLabelText(`Stroke color ${color}`);
        expect(colorButton).toBeInTheDocument();
        expect(colorButton).toHaveStyle({ backgroundColor: color });
      });
    });

    it('shows current stroke color indicator', () => {
      render(<PropertiesPanel />);
      
      const currentColorIndicator = screen.getByText('Trait').parentElement!
        .querySelector('.properties-panel__current-color');
      expect(currentColorIndicator).toHaveStyle({ 
        backgroundColor: mockRectangleElement.strokeColor 
      });
    });

    it('updates stroke color when swatch is clicked', async () => {
      const user = userEvent.setup();
      render(<PropertiesPanel />);
      
      const blackColorButton = screen.getByLabelText('Stroke color #000000');
      await user.click(blackColorButton);
      
      expect(mockStoreActions.updateElement).toHaveBeenCalledWith('test-rectangle-1', {
        strokeColor: '#000000'
      });
    });
  });

  describe('Section 2: Arrière-plan (Background Colors)', () => {
    beforeEach(() => {
      useAppStore.setState({
        ui: { 
          ...useAppStore.getState().ui,
          propertiesPanel: { visible: true, width: 200 }
        },
        selectedElementIds: ['test-rectangle-1'],
        elements: [mockRectangleElement],
      });
    });

    it('renders background colors section', () => {
      render(<PropertiesPanel />);
      
      expect(screen.getByText('Arrière-plan')).toBeInTheDocument();
    });

    it('displays all background color swatches in grid layout', () => {
      render(<PropertiesPanel />);
      
      BACKGROUND_COLORS.forEach(color => {
        const colorButton = screen.getByLabelText(`Background color ${color}`);
        expect(colorButton).toBeInTheDocument();
        expect(colorButton).toHaveStyle({ backgroundColor: color });
      });
    });

    it('shows active state for current background color', () => {
      render(<PropertiesPanel />);
      
      const currentBackgroundButton = screen.getByLabelText(`Background color ${mockRectangleElement.backgroundColor}`);
      expect(currentBackgroundButton).toHaveClass('active');
    });

    it('updates background color when swatch is clicked', async () => {
      const user = userEvent.setup();
      render(<PropertiesPanel />);
      
      const whiteColorButton = screen.getByLabelText('Background color #FFFFFF');
      await user.click(whiteColorButton);
      
      expect(mockStoreActions.updateElement).toHaveBeenCalledWith('test-rectangle-1', {
        backgroundColor: '#FFFFFF'
      });
    });
  });

  describe('Section 3: Remplissage (Fill Pattern)', () => {
    beforeEach(() => {
      useAppStore.setState({
        ui: { 
          ...useAppStore.getState().ui,
          propertiesPanel: { visible: true, width: 200 }
        },
        selectedElementIds: ['test-rectangle-1'],
        elements: [mockRectangleElement],
      });
    });

    it('renders fill pattern section', () => {
      render(<PropertiesPanel />);
      
      expect(screen.getByText('Remplissage')).toBeInTheDocument();
    });

    it('displays all fill pattern options', () => {
      render(<PropertiesPanel />);
      
      const fillSection = screen.getByText('Remplissage').parentElement!;
      
      FILL_PATTERNS.forEach(pattern => {
        const patternButton = fillSection.querySelector(`[title="${pattern.label}"]`);
        expect(patternButton).toBeInTheDocument();
        expect(patternButton).toHaveTextContent(pattern.icon);
      });
    });

    it('shows active state for current fill pattern', () => {
      render(<PropertiesPanel />);
      
      const fillSection = screen.getByText('Remplissage').parentElement!;
      const solidPatternButton = fillSection.querySelector('[title="Solid"]');
      expect(solidPatternButton).toHaveClass('active');
    });

    it('updates fill pattern when button is clicked', async () => {
      const user = userEvent.setup();
      render(<PropertiesPanel />);
      
      const fillSection = screen.getByText('Remplissage').parentElement!;
      const hachureButton = fillSection.querySelector('[title="Hachure"]') as HTMLElement;
      await user.click(hachureButton);
      
      expect(mockStoreActions.updateElement).toHaveBeenCalledWith('test-rectangle-1', {
        fillStyle: 'hachure'
      });
    });
  });

  describe('Section 4: Largeur du contour (Stroke Width)', () => {
    beforeEach(() => {
      useAppStore.setState({
        ui: { 
          ...useAppStore.getState().ui,
          propertiesPanel: { visible: true, width: 200 }
        },
        selectedElementIds: ['test-rectangle-1'],
        elements: [mockRectangleElement],
      });
    });

    it('renders stroke width section', () => {
      render(<PropertiesPanel />);
      
      expect(screen.getByText('Largeur du contour')).toBeInTheDocument();
    });

    it('displays all stroke width presets', () => {
      render(<PropertiesPanel />);
      
      STROKE_WIDTH_PRESETS.forEach(width => {
        const widthButton = screen.getByLabelText(`Stroke width ${width}px`);
        expect(widthButton).toBeInTheDocument();
        
        const preview = widthButton.querySelector('.stroke-width-preview');
        expect(preview).toHaveStyle({ height: `${width}px` });
      });
    });

    it('shows active state for current stroke width', () => {
      render(<PropertiesPanel />);
      
      const currentWidthButton = screen.getByLabelText(`Stroke width ${mockRectangleElement.strokeWidth}px`);
      expect(currentWidthButton).toHaveClass('active');
    });

    it('updates stroke width when preset is clicked', async () => {
      const user = userEvent.setup();
      render(<PropertiesPanel />);
      
      const width4Button = screen.getByLabelText('Stroke width 4px');
      await user.click(width4Button);
      
      expect(mockStoreActions.updateElement).toHaveBeenCalledWith('test-rectangle-1', {
        strokeWidth: 4
      });
    });
  });

  describe('Section 5: Style du trait (Stroke Style)', () => {
    beforeEach(() => {
      useAppStore.setState({
        ui: { 
          ...useAppStore.getState().ui,
          propertiesPanel: { visible: true, width: 200 }
        },
        selectedElementIds: ['test-rectangle-1'],
        elements: [mockRectangleElement],
      });
    });

    it('renders stroke style section', () => {
      render(<PropertiesPanel />);
      
      expect(screen.getByText('Style du trait')).toBeInTheDocument();
    });

    it('displays all stroke style presets with previews', () => {
      render(<PropertiesPanel />);
      
      const strokeStyleSection = screen.getByText('Style du trait').parentElement!;
      
      STROKE_STYLE_PRESETS.forEach(style => {
        const styleButton = strokeStyleSection.querySelector(`[title="${style.label}"]`);
        expect(styleButton).toBeInTheDocument();
        expect(styleButton).toHaveTextContent(style.preview);
      });
    });

    it('shows active state for current stroke style', () => {
      render(<PropertiesPanel />);
      
      const strokeStyleSection = screen.getByText('Style du trait').parentElement!;
      const solidStyleButton = strokeStyleSection.querySelector('[title="Solid"]');
      expect(solidStyleButton).toHaveClass('active');
    });

    it('updates stroke style when preset is clicked', async () => {
      const user = userEvent.setup();
      render(<PropertiesPanel />);
      
      const strokeStyleSection = screen.getByText('Style du trait').parentElement!;
      const dashedButton = strokeStyleSection.querySelector('[title="Dashed"]') as HTMLElement;
      await user.click(dashedButton);
      
      expect(mockStoreActions.updateElement).toHaveBeenCalledWith('test-rectangle-1', {
        strokeStyle: 'dashed'
      });
    });
  });

  describe('Section 6: Style de tracé (Roughness)', () => {
    beforeEach(() => {
      useAppStore.setState({
        ui: { 
          ...useAppStore.getState().ui,
          propertiesPanel: { visible: true, width: 200 }
        },
        selectedElementIds: ['test-rectangle-1'],
        elements: [mockRectangleElement],
      });
    });

    it('renders roughness section', () => {
      render(<PropertiesPanel />);
      
      expect(screen.getByText('Style de tracé')).toBeInTheDocument();
    });

    it('displays all roughness presets', () => {
      render(<PropertiesPanel />);
      
      ROUGHNESS_SIMPLE_PRESETS.forEach(preset => {
        const roughnessButton = screen.getByTitle(preset.name);
        expect(roughnessButton).toBeInTheDocument();
      });
    });

    it('shows active state for current roughness', () => {
      render(<PropertiesPanel />);
      
      const normalRoughnessButton = screen.getByTitle('Normal');
      expect(normalRoughnessButton).toHaveClass('active');
    });

    it('updates roughness when preset is clicked', async () => {
      const user = userEvent.setup();
      render(<PropertiesPanel />);
      
      const smoothButton = screen.getByTitle('Lisse');
      await user.click(smoothButton);
      
      expect(mockStoreActions.updateElement).toHaveBeenCalledWith('test-rectangle-1', {
        roughness: 0
      });
    });
  });

  describe('Section 7: Angles (Corner Style) - Contextual', () => {
    it('renders corner style section for rectangle elements', () => {
      useAppStore.setState({
        ui: { 
          ...useAppStore.getState().ui,
          propertiesPanel: { visible: true, width: 200 }
        },
        selectedElementIds: ['test-rectangle-1'],
        elements: [mockRectangleElement],
      });

      render(<PropertiesPanel />);
      
      expect(screen.getByText('Angles')).toBeInTheDocument();
    });

    it('does not render corner style section for non-rectangle elements', () => {
      useAppStore.setState({
        ui: { 
          ...useAppStore.getState().ui,
          propertiesPanel: { visible: true, width: 200 }
        },
        selectedElementIds: ['test-arrow-1'],
        elements: [mockArrowElement],
      });

      render(<PropertiesPanel />);
      
      expect(screen.queryByText('Angles')).not.toBeInTheDocument();
    });

    it('displays corner style options', () => {
      useAppStore.setState({
        ui: { 
          ...useAppStore.getState().ui,
          propertiesPanel: { visible: true, width: 200 }
        },
        selectedElementIds: ['test-rectangle-1'],
        elements: [mockRectangleElement],
      });

      render(<PropertiesPanel />);
      
      CORNER_STYLE_PRESETS.forEach(corner => {
        const cornerButton = screen.getByTitle(corner.label);
        expect(cornerButton).toBeInTheDocument();
        expect(cornerButton).toHaveTextContent(corner.icon);
      });
    });

    it('updates corner style when option is clicked', async () => {
      const user = userEvent.setup();
      useAppStore.setState({
        ui: { 
          ...useAppStore.getState().ui,
          propertiesPanel: { visible: true, width: 200 }
        },
        selectedElementIds: ['test-rectangle-1'],
        elements: [mockRectangleElement],
      });

      render(<PropertiesPanel />);
      
      const roundedButton = screen.getByTitle('Rounded');
      await user.click(roundedButton);
      
      expect(mockStoreActions.updateElement).toHaveBeenCalledWith('test-rectangle-1', {
        cornerStyle: 'rounded'
      });
    });
  });

  describe('Sections 8-10: Typography - Contextual for Text', () => {
    beforeEach(() => {
      useAppStore.setState({
        ui: { 
          ...useAppStore.getState().ui,
          propertiesPanel: { visible: true, width: 200 }
        },
        selectedElementIds: ['test-text-1'],
        elements: [mockTextElement],
      });
    });

    it('renders typography sections for text elements', () => {
      render(<PropertiesPanel />);
      
      expect(screen.getByText('Police')).toBeInTheDocument();
      expect(screen.getByText('Taille de la police')).toBeInTheDocument();
      expect(screen.getByText('Alignement du texte')).toBeInTheDocument();
    });

    it('does not render typography sections for non-text elements', () => {
      useAppStore.setState({
        selectedElementIds: ['test-rectangle-1'],
        elements: [mockRectangleElement],
      });

      render(<PropertiesPanel />);
      
      expect(screen.queryByText('Police')).not.toBeInTheDocument();
      expect(screen.queryByText('Taille de la police')).not.toBeInTheDocument();
      expect(screen.queryByText('Alignement du texte')).not.toBeInTheDocument();
    });

    it('displays font size presets', () => {
      render(<PropertiesPanel />);
      
      FONT_SIZE_PRESETS.forEach(size => {
        const sizeButton = screen.getByText(size.size);
        expect(sizeButton).toBeInTheDocument();
      });
    });

    it('shows text alignment options', () => {
      render(<PropertiesPanel />);
      
      expect(screen.getByText('⟵')).toBeInTheDocument(); // Left
      expect(screen.getByText('↔')).toBeInTheDocument(); // Center  
      expect(screen.getByText('⟶')).toBeInTheDocument(); // Right
    });

    it('shows text formatting options', () => {
      render(<PropertiesPanel />);
      
      expect(screen.getByText('B')).toBeInTheDocument(); // Bold
      expect(screen.getByText('I')).toBeInTheDocument(); // Italic
      expect(screen.getByText('U')).toBeInTheDocument(); // Underline
    });
  });

  describe('Section 11: Transparence (Opacity)', () => {
    beforeEach(() => {
      useAppStore.setState({
        ui: { 
          ...useAppStore.getState().ui,
          propertiesPanel: { visible: true, width: 200 }
        },
        selectedElementIds: ['test-rectangle-1'],
        elements: [mockRectangleElement],
      });
    });

    it('renders opacity section', () => {
      render(<PropertiesPanel />);
      
      expect(screen.getByText('Transparence')).toBeInTheDocument();
    });

    it('displays opacity slider with current value', () => {
      render(<PropertiesPanel />);
      
      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('type', 'range');
      expect(slider).toHaveAttribute('min', '0');
      expect(slider).toHaveAttribute('max', '100');
      expect(slider).toHaveAttribute('value', String(mockRectangleElement.opacity * 100));
    });

    it('displays opacity range labels', () => {
      render(<PropertiesPanel />);
      
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('updates opacity when slider is changed', async () => {
      render(<PropertiesPanel />);
      
      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '50' } });
      
      expect(mockStoreActions.updateElement).toHaveBeenCalledWith('test-rectangle-1', {
        opacity: 0.5
      });
    });
  });

  describe('Section 12: Disposition (Layer Management)', () => {
    beforeEach(() => {
      useAppStore.setState({
        ui: { 
          ...useAppStore.getState().ui,
          propertiesPanel: { visible: true, width: 200 }
        },
        selectedElementIds: ['test-rectangle-1'],
        elements: [mockRectangleElement],
      });
    });

    it('renders layer management section', () => {
      render(<PropertiesPanel />);
      
      expect(screen.getByText('Disposition')).toBeInTheDocument();
    });

    it('displays all layer control buttons', () => {
      render(<PropertiesPanel />);
      
      expect(screen.getByTitle('Send to back')).toBeInTheDocument();
      expect(screen.getByTitle('Send backward')).toBeInTheDocument();
      expect(screen.getByTitle('Bring forward')).toBeInTheDocument();
      expect(screen.getByTitle('Bring to front')).toBeInTheDocument();
    });

    it('calls layer actions when buttons are clicked', async () => {
      const user = userEvent.setup();
      render(<PropertiesPanel />);
      
      await user.click(screen.getByTitle('Send to back'));
      expect(mockStoreActions.sendToBack).toHaveBeenCalledWith('test-rectangle-1');
      
      await user.click(screen.getByTitle('Send backward'));
      expect(mockStoreActions.sendBackward).toHaveBeenCalledWith('test-rectangle-1');
      
      await user.click(screen.getByTitle('Bring forward'));
      expect(mockStoreActions.bringForward).toHaveBeenCalledWith('test-rectangle-1');
      
      await user.click(screen.getByTitle('Bring to front'));
      expect(mockStoreActions.bringToFront).toHaveBeenCalledWith('test-rectangle-1');
    });
  });

  describe('Section 13: Actions (Element Operations)', () => {
    beforeEach(() => {
      useAppStore.setState({
        ui: { 
          ...useAppStore.getState().ui,
          propertiesPanel: { visible: true, width: 200 }
        },
        selectedElementIds: ['test-rectangle-1'],
        elements: [mockRectangleElement],
      });
    });

    it('renders actions section', () => {
      render(<PropertiesPanel />);
      
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('displays all action buttons', () => {
      render(<PropertiesPanel />);
      
      expect(screen.getByTitle('Duplicate')).toBeInTheDocument();
      expect(screen.getByTitle('Delete')).toBeInTheDocument();
      expect(screen.getByTitle('Lock')).toBeInTheDocument();
      expect(screen.getByTitle('Link')).toBeInTheDocument();
    });

    it('calls element actions when buttons are clicked', async () => {
      const user = userEvent.setup();
      render(<PropertiesPanel />);
      
      await user.click(screen.getByTitle('Duplicate'));
      expect(mockStoreActions.duplicateElement).toHaveBeenCalledWith('test-rectangle-1');
      
      await user.click(screen.getByTitle('Delete'));
      expect(mockStoreActions.deleteElement).toHaveBeenCalledWith('test-rectangle-1');
      
      await user.click(screen.getByTitle('Lock'));
      expect(mockStoreActions.toggleElementLock).toHaveBeenCalledWith('test-rectangle-1');
    });

    it('shows correct lock/unlock icon based on element state', () => {
      useAppStore.setState({
        elements: [{ ...mockRectangleElement, locked: true }],
      });

      render(<PropertiesPanel />);
      
      expect(screen.getByTitle('Unlock')).toBeInTheDocument();
    });
  });

  describe('Multiple Element Selection', () => {
    const mockElement2: Element = {
      ...mockRectangleElement,
      id: 'test-rectangle-2',
      strokeColor: '#0000ff',
    };

    beforeEach(() => {
      useAppStore.setState({
        ui: { 
          ...useAppStore.getState().ui,
          propertiesPanel: { visible: true, width: 200 }
        },
        selectedElementIds: ['test-rectangle-1', 'test-rectangle-2'],
        elements: [mockRectangleElement, mockElement2],
      });
    });

    it('shows multiple selection header', () => {
      render(<PropertiesPanel />);
      
      expect(screen.getByText('2 elements selected')).toBeInTheDocument();
    });

    it('applies changes to all selected elements', async () => {
      const user = userEvent.setup();
      render(<PropertiesPanel />);
      
      const blackColorButton = screen.getByLabelText('Stroke color #000000');
      await user.click(blackColorButton);
      
      expect(mockStoreActions.updateElement).toHaveBeenCalledWith('test-rectangle-1', {
        strokeColor: '#000000'
      });
      expect(mockStoreActions.updateElement).toHaveBeenCalledWith('test-rectangle-2', {
        strokeColor: '#000000'
      });
    });
  });

  describe('CSS Classes and Structure', () => {
    beforeEach(() => {
      useAppStore.setState({
        ui: { 
          ...useAppStore.getState().ui,
          propertiesPanel: { visible: true, width: 200 }
        },
        selectedElementIds: ['test-rectangle-1'],
        elements: [mockRectangleElement],
      });
    });

    it('applies correct CSS classes to panel structure', () => {
      render(<PropertiesPanel />);
      
      expect(screen.getByText('rectangle').closest('.properties-panel')).toBeInTheDocument();
      expect(screen.getByText('rectangle').closest('.properties-panel__header')).toBeInTheDocument();
      expect(screen.getByText('Trait').closest('.properties-panel__content')).toBeInTheDocument();
    });

    it('applies correct section classes', () => {
      render(<PropertiesPanel />);
      
      const traitSection = screen.getByText('Trait').closest('.properties-panel__section');
      expect(traitSection).toBeInTheDocument();
      
      const backgroundSection = screen.getByText('Arrière-plan').closest('.properties-panel__section');
      expect(backgroundSection).toBeInTheDocument();
    });
  });
});