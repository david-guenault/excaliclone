// ABOUTME: Dialog component for grid configuration and settings
// ABOUTME: Provides a dedicated interface for all grid-related controls

import React from 'react';
import { useAppStore } from '../../store';
import './GridDialog.css';

interface GridDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GridDialog: React.FC<GridDialogProps> = ({ isOpen, onClose }) => {
  const { ui, setGridVisible, setGridSize, setGridSnapEnabled } = useAppStore();

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleGridSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const size = Math.max(5, Math.min(100, parseInt(e.target.value) || 20));
    setGridSize(size);
  };

  return (
    <div className="grid-dialog-overlay" onClick={handleOverlayClick}>
      <div className="grid-dialog" role="dialog" aria-labelledby="grid-dialog-title">
        <div className="grid-dialog-header">
          <h3 id="grid-dialog-title">Configuration de la grille</h3>
          <button 
            className="grid-dialog-close"
            onClick={onClose}
            aria-label="Fermer la boîte de dialogue"
          >
            ×
          </button>
        </div>

        <div className="grid-dialog-content">
          <div className="grid-section">
            <h4>Affichage</h4>
            <label className="grid-control">
              <input
                type="checkbox"
                checked={ui.grid?.showGrid || false}
                onChange={(e) => setGridVisible(e.target.checked)}
                aria-label="Afficher la grille"
              />
              <span>Afficher la grille</span>
            </label>
          </div>

          <div className="grid-section">
            <h4>Taille</h4>
            <label className="grid-control">
              <span>Taille de la grille (pixels)</span>
              <input
                type="number"
                min="5"
                max="100"
                value={ui.grid?.size || 20}
                onChange={handleGridSizeChange}
                aria-label="Taille de la grille en pixels"
              />
            </label>
          </div>

          <div className="grid-section">
            <h4>Accrochage</h4>
            <label className="grid-control">
              <input
                type="checkbox"
                checked={ui.grid?.snapToGrid || false}
                onChange={(e) => setGridSnapEnabled(e.target.checked)}
                aria-label="Accrochage à la grille"
              />
              <span>Accrochage à la grille</span>
            </label>
          </div>
        </div>

        <div className="grid-dialog-footer">
          <button 
            className="grid-dialog-button grid-dialog-button-primary"
            onClick={onClose}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};