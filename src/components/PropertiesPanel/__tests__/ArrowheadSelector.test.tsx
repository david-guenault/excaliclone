// ABOUTME: Comprehensive tests for ArrowheadSelector and ArrowheadMenu components
// ABOUTME: Tests UI interactions, dropdown menus, arrowhead type selection, and accessibility

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ArrowheadSelector } from '../ArrowheadSelector';
import { ArrowheadMenu } from '../ArrowheadMenu';
import { ARROWHEAD_TYPES } from '../../../constants';

describe('ArrowheadSelector', () => {
  const defaultProps = {
    label: 'Début' as const,
    value: 'none' as const,
    onChange: vi.fn(),
    icon: '←' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders with correct label and icon', () => {
      render(<ArrowheadSelector {...defaultProps} />);
      
      expect(screen.getByText('Début')).toBeInTheDocument();
      expect(screen.getByText('←')).toBeInTheDocument();
    });

    it('renders with Fin label and right arrow', () => {
      render(<ArrowheadSelector {...defaultProps} label="Fin" icon="→" />);
      
      expect(screen.getByText('Fin')).toBeInTheDocument();
      expect(screen.getByText('→')).toBeInTheDocument();
    });

    it('displays current arrowhead type preview', () => {
      render(<ArrowheadSelector {...defaultProps} value="triangle" />);
      
      const triangleIcon = screen.getByText('▷');
      expect(triangleIcon).toBeInTheDocument();
    });

    it('displays circle icon for none type', () => {
      render(<ArrowheadSelector {...defaultProps} value="none" />);
      
      const circleIcon = screen.getByText('○');
      expect(circleIcon).toBeInTheDocument();
    });

    it('has proper accessibility attributes', () => {
      render(<ArrowheadSelector {...defaultProps} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Sélectionner extrémité début');
      expect(button).toHaveAttribute('title');
    });
  });

  describe('Menu Interaction', () => {
    it('opens menu when button is clicked', async () => {
      const user = userEvent.setup();
      render(<ArrowheadSelector {...defaultProps} />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      // Menu should be visible
      expect(screen.getByText('More options')).toBeInTheDocument();
    });

    it('positions menu correctly relative to button', async () => {
      const user = userEvent.setup();
      render(<ArrowheadSelector {...defaultProps} />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      const menu = screen.getByText('More options').closest('.arrowhead-menu');
      expect(menu).toBeInTheDocument();
      expect(menu).toHaveClass('arrowhead-menu');
    });

    it('closes menu when arrowhead type is selected', async () => {
      const user = userEvent.setup();
      render(<ArrowheadSelector {...defaultProps} />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      // Click on triangle option
      const triangleOption = screen.getByTitle('Flèche triangle');
      await user.click(triangleOption);
      
      // Menu should close
      await waitFor(() => {
        expect(screen.queryByText('More options')).not.toBeInTheDocument();
      });
    });

    it('calls onChange when arrowhead type is selected', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<ArrowheadSelector {...defaultProps} onChange={onChange} />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      const triangleOption = screen.getByTitle('Flèche triangle');
      await user.click(triangleOption);
      
      expect(onChange).toHaveBeenCalledWith('triangle');
    });
  });

  describe('Keyboard Interaction', () => {
    it('opens menu on Enter key', async () => {
      const user = userEvent.setup();
      render(<ArrowheadSelector {...defaultProps} />);
      
      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');
      
      expect(screen.getByText('More options')).toBeInTheDocument();
    });

    it('opens menu on Space key', async () => {
      const user = userEvent.setup();
      render(<ArrowheadSelector {...defaultProps} />);
      
      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard(' ');
      
      expect(screen.getByText('More options')).toBeInTheDocument();
    });
  });
});

describe('ArrowheadMenu', () => {
  const defaultProps = {
    isOpen: true,
    onSelect: vi.fn(),
    onClose: vi.fn(),
    position: { x: 100, y: 100 },
    currentValue: 'none' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Menu Rendering', () => {
    it('renders when isOpen is true', () => {
      render(<ArrowheadMenu {...defaultProps} />);
      
      ARROWHEAD_TYPES.forEach((type) => {
        const option = screen.getByTitle(type.label);
        expect(option).toBeInTheDocument();
      });
    });

    it('does not render when isOpen is false', () => {
      render(<ArrowheadMenu {...defaultProps} isOpen={false} />);
      
      expect(screen.queryByText('More options')).not.toBeInTheDocument();
    });

    it('positions menu correctly', () => {
      render(<ArrowheadMenu {...defaultProps} position={{ x: 200, y: 150 }} />);
      
      const menu = screen.getByText('More options').closest('.arrowhead-menu');
      expect(menu).toHaveStyle({
        left: '200px',
        top: '150px'
      });
    });

    it('highlights current arrowhead type', () => {
      render(<ArrowheadMenu {...defaultProps} currentValue="triangle" />);
      
      const triangleOption = screen.getByTitle('Flèche triangle');
      expect(triangleOption).toHaveClass('active');
    });
  });

  describe('Arrowhead Type Options', () => {
    it('renders all arrowhead types', () => {
      render(<ArrowheadMenu {...defaultProps} />);
      
      ARROWHEAD_TYPES.forEach((type) => {
        const option = screen.getByTitle(type.label);
        expect(option).toBeInTheDocument();
        
        if (type.icon) {
          expect(screen.getByText(type.icon)).toBeInTheDocument();
        }
      });
    });

    it('calls onSelect when arrowhead type is clicked', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      render(<ArrowheadMenu {...defaultProps} onSelect={onSelect} />);
      
      const triangleOption = screen.getByTitle('Flèche triangle');
      await user.click(triangleOption);
      
      expect(onSelect).toHaveBeenCalledWith('triangle');
    });

    it('handles none type selection', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      render(<ArrowheadMenu {...defaultProps} onSelect={onSelect} />);
      
      const noneOption = screen.getByTitle('Aucune');
      await user.click(noneOption);
      
      expect(onSelect).toHaveBeenCalledWith('none');
    });

    it('handles line type selection', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      render(<ArrowheadMenu {...defaultProps} onSelect={onSelect} />);
      
      const lineOption = screen.getByTitle('Flèche ligne');
      await user.click(lineOption);
      
      expect(onSelect).toHaveBeenCalledWith('line');
    });

    it('handles circle type selection', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      render(<ArrowheadMenu {...defaultProps} onSelect={onSelect} />);
      
      const circleOption = screen.getByTitle('Point/Cercle');
      await user.click(circleOption);
      
      expect(onSelect).toHaveBeenCalledWith('circle');
    });
  });

  describe('Menu Interaction', () => {
    it('closes menu when clicking outside', async () => {
      const onClose = vi.fn();
      render(
        <div>
          <div data-testid="outside">Outside</div>
          <ArrowheadMenu {...defaultProps} onClose={onClose} />
        </div>
      );
      
      const outsideElement = screen.getByTestId('outside');
      fireEvent.mouseDown(outsideElement);
      
      expect(onClose).toHaveBeenCalled();
    });

    it('does not close menu when clicking inside', async () => {
      const onClose = vi.fn();
      render(<ArrowheadMenu {...defaultProps} onClose={onClose} />);
      
      const menu = screen.getByText('More options').closest('.arrowhead-menu');
      fireEvent.mouseDown(menu!);
      
      expect(onClose).not.toHaveBeenCalled();
    });

    it('closes menu on Escape key', () => {
      const onClose = vi.fn();
      render(<ArrowheadMenu {...defaultProps} onClose={onClose} />);
      
      fireEvent.keyDown(document, { key: 'Escape' });
      
      expect(onClose).toHaveBeenCalled();
    });

    it('ignores other key presses', () => {
      const onClose = vi.fn();
      render(<ArrowheadMenu {...defaultProps} onClose={onClose} />);
      
      fireEvent.keyDown(document, { key: 'Enter' });
      
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('More Options Section', () => {
    it('renders more options button', () => {
      render(<ArrowheadMenu {...defaultProps} />);
      
      const moreButton = screen.getByText('More options');
      expect(moreButton).toBeInTheDocument();
      expect(moreButton).toBeDisabled();
    });

    it('shows dropdown arrow for more options', () => {
      render(<ArrowheadMenu {...defaultProps} />);
      
      const arrow = screen.getByText('▼');
      expect(arrow).toBeInTheDocument();
    });

    it('has proper accessibility for disabled state', () => {
      render(<ArrowheadMenu {...defaultProps} />);
      
      const moreButton = screen.getByText('More options');
      expect(moreButton).toHaveAttribute('disabled');
      expect(moreButton).toHaveAttribute('title', 'Futures options d\'extrémités');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for all options', () => {
      render(<ArrowheadMenu {...defaultProps} />);
      
      ARROWHEAD_TYPES.forEach((type) => {
        const option = screen.getByRole('button', { name: type.label });
        expect(option).toBeInTheDocument();
      });
    });

    it('supports keyboard navigation', () => {
      render(<ArrowheadMenu {...defaultProps} />);
      
      const options = screen.getAllByRole('button');
      options.forEach(option => {
        expect(option).not.toHaveAttribute('tabindex', '-1');
      });
    });
  });

  describe('Error Handling', () => {
    it('handles invalid position gracefully', () => {
      expect(() => {
        render(<ArrowheadMenu {...defaultProps} position={{ x: -1000, y: -1000 }} />);
      }).not.toThrow();
    });

    it('handles missing currentValue gracefully', () => {
      expect(() => {
        render(<ArrowheadMenu {...defaultProps} currentValue={undefined as any} />);
      }).not.toThrow();
    });
  });
});