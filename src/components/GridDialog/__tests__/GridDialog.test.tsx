// ABOUTME: Tests for GridDialog component functionality
// ABOUTME: Tests dialog opening, closing, and grid controls

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GridDialog } from '../GridDialog';
import { useAppStore } from '../../../store';

// Mock the useAppStore hook
vi.mock('../../../store', () => ({
  useAppStore: vi.fn(),
}));

describe('GridDialog', () => {
  let mockStoreActions: any;
  let defaultStoreState: any;

  beforeEach(() => {
    mockStoreActions = {
      setGridVisible: vi.fn(),
      setGridSize: vi.fn(),
      setGridSnapEnabled: vi.fn(),
    };

    defaultStoreState = {
      ui: {
        grid: {
          enabled: true,
          size: 20,
          snapToGrid: false,
          snapDistance: 10,
          showGrid: false,
          color: '#c1c5c9',
          opacity: 0.6,
        },
      },
    };

    (useAppStore as any).mockReturnValue({
      ...defaultStoreState,
      ...mockStoreActions,
    });
  });

  it('should render when open', () => {
    render(<GridDialog isOpen={true} onClose={vi.fn()} />);
    
    expect(screen.getByText('Configuration de la grille')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<GridDialog isOpen={false} onClose={vi.fn()} />);
    
    expect(screen.queryByText('Configuration de la grille')).not.toBeInTheDocument();
  });

  it('should close when clicking the close button', () => {
    const onClose = vi.fn();
    render(<GridDialog isOpen={true} onClose={onClose} />);
    
    const closeButton = screen.getByLabelText('Fermer la boîte de dialogue');
    fireEvent.click(closeButton);
    
    expect(onClose).toHaveBeenCalled();
  });

  it('should close when clicking the overlay', () => {
    const onClose = vi.fn();
    render(<GridDialog isOpen={true} onClose={onClose} />);
    
    const overlay = screen.getByRole('dialog').parentElement;
    fireEvent.click(overlay!);
    
    expect(onClose).toHaveBeenCalled();
  });

  it('should not close when clicking inside the dialog', () => {
    const onClose = vi.fn();
    render(<GridDialog isOpen={true} onClose={onClose} />);
    
    const dialog = screen.getByRole('dialog');
    fireEvent.click(dialog);
    
    expect(onClose).not.toHaveBeenCalled();
  });

  it('should toggle grid visibility', () => {
    render(<GridDialog isOpen={true} onClose={vi.fn()} />);
    
    const visibilityCheckbox = screen.getByLabelText('Afficher la grille');
    fireEvent.click(visibilityCheckbox);
    
    expect(mockStoreActions.setGridVisible).toHaveBeenCalledWith(true);
  });

  it('should update grid size', () => {
    render(<GridDialog isOpen={true} onClose={vi.fn()} />);
    
    const sizeInput = screen.getByLabelText('Taille de la grille en pixels');
    fireEvent.change(sizeInput, { target: { value: '30' } });
    
    expect(mockStoreActions.setGridSize).toHaveBeenCalledWith(30);
  });

  it('should constrain grid size to valid range', () => {
    render(<GridDialog isOpen={true} onClose={vi.fn()} />);
    
    const sizeInput = screen.getByLabelText('Taille de la grille en pixels');
    
    // Test minimum constraint
    fireEvent.change(sizeInput, { target: { value: '2' } });
    expect(mockStoreActions.setGridSize).toHaveBeenCalledWith(5);
    
    // Test maximum constraint  
    fireEvent.change(sizeInput, { target: { value: '150' } });
    expect(mockStoreActions.setGridSize).toHaveBeenCalledWith(100);
  });

  it('should toggle snap to grid', () => {
    render(<GridDialog isOpen={true} onClose={vi.fn()} />);
    
    const snapCheckbox = screen.getByLabelText('Accrochage à la grille');
    fireEvent.click(snapCheckbox);
    
    expect(mockStoreActions.setGridSnapEnabled).toHaveBeenCalledWith(true);
  });

  it('should display current grid settings', () => {
    const stateWithCustomGrid = {
      ...defaultStoreState,
      ui: {
        grid: {
          enabled: true,
          size: 25,
          snapToGrid: true,
          snapDistance: 15,
          showGrid: true,
          color: '#c1c5c9',
          opacity: 0.6,
        },
      },
    };

    (useAppStore as any).mockReturnValue({
      ...stateWithCustomGrid,
      ...mockStoreActions,
    });

    render(<GridDialog isOpen={true} onClose={vi.fn()} />);
    
    const sizeInput = screen.getByLabelText('Taille de la grille en pixels');
    expect(sizeInput).toHaveValue(25);
    
    const visibilityCheckbox = screen.getByLabelText('Afficher la grille');
    expect(visibilityCheckbox).toBeChecked();
    
    const snapCheckbox = screen.getByLabelText('Accrochage à la grille');
    expect(snapCheckbox).toBeChecked();
  });
});