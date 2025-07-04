// ABOUTME: Dropdown menu component for toolbar with grid controls
// ABOUTME: Contains application-level settings like grid and magnetic grid options

import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../store';
import './ToolbarMenu.css';

export const ToolbarMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const { 
    ui,
    setGridVisible,
    setGridSize,
    setGridSnapEnabled,
    setGridMagneticEnabled,
    setGridMagneticStrength,
    setGridMagneticRadius,
  } = useAppStore();

  const { grid } = ui;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu on Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const handleGridSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const size = Math.max(5, Math.min(100, parseInt(e.target.value) || 20));
    setGridSize(size);
  };

  const handleMagneticStrengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const strength = Math.max(10, Math.min(50, parseInt(e.target.value) || 25));
    setGridMagneticStrength(strength);
  };

  const handleMagneticRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const radius = Math.max(20, Math.min(100, parseInt(e.target.value) || 30));
    setGridMagneticRadius(radius);
  };

  return (
    <div className="toolbar-menu" ref={menuRef}>
      <button
        ref={buttonRef}
        className={`toolbar-menu__trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Menu des options"
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Options d'affichage (grille, magnétique)"
      >
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="1"/>
          <circle cx="19" cy="12" r="1"/>
          <circle cx="5" cy="12" r="1"/>
        </svg>
      </button>

      {isOpen && (
        <div 
          className="toolbar-menu__dropdown"
          role="menu"
          aria-labelledby="toolbar-menu-button"
        >
          {/* Grid Controls Section */}
          <div className="toolbar-menu__section">
            <h4 className="toolbar-menu__title">Grille</h4>
            
            <div className="toolbar-menu__item">
              <button
                className={`toolbar-menu__toggle ${grid.showGrid ? 'active' : ''}`}
                onClick={() => setGridVisible(!grid.showGrid)}
                role="menuitem"
                aria-label="Afficher la grille"
                title="Afficher/masquer la grille (G)"
              >
                <span className="toolbar-menu__icon">⊞</span>
                <span className="toolbar-menu__label">Afficher la grille</span>
                <span className="toolbar-menu__shortcut">G</span>
              </button>
            </div>

            <div className="toolbar-menu__item">
              <label className="toolbar-menu__control">
                <span className="toolbar-menu__label">Taille de la grille</span>
                <div className="toolbar-menu__input-group">
                  <input
                    type="number"
                    className="toolbar-menu__input"
                    value={grid.size}
                    onChange={handleGridSizeChange}
                    min="5"
                    max="100"
                    aria-label="Taille de la grille en pixels"
                  />
                  <span className="toolbar-menu__unit">px</span>
                </div>
              </label>
            </div>

            <div className="toolbar-menu__item">
              <button
                className={`toolbar-menu__toggle ${grid.snapToGrid ? 'active' : ''}`}
                onClick={() => setGridSnapEnabled(!grid.snapToGrid)}
                role="menuitem"
                aria-label="Accrochage à la grille"
                title="Activer l'accrochage à la grille"
              >
                <span className="toolbar-menu__icon">⊡</span>
                <span className="toolbar-menu__label">Accrochage grille</span>
              </button>
            </div>
          </div>

          <div className="toolbar-menu__separator" />

          {/* Magnetic Grid Controls Section */}
          <div className="toolbar-menu__section">
            <h4 className="toolbar-menu__title">Grille Magnétique</h4>
            
            <div className="toolbar-menu__item">
              <button
                className={`toolbar-menu__toggle magnetic ${grid.magneticEnabled ? 'active' : ''}`}
                onClick={() => setGridMagneticEnabled(!grid.magneticEnabled)}
                role="menuitem"
                aria-label="Grille magnétique"
                title="Activer la grille magnétique (M)"
                data-testid="magnetic-toggle"
              >
                <span className="toolbar-menu__icon">🧲</span>
                <span className="toolbar-menu__label">Mode magnétique</span>
                <span className="toolbar-menu__shortcut">M</span>
                {grid.magneticEnabled && (
                  <div 
                    className="toolbar-menu__status-indicator" 
                    data-testid="magnetic-status-indicator"
                  />
                )}
              </button>
            </div>

            <div className="toolbar-menu__item">
              <label className="toolbar-menu__control">
                <span className="toolbar-menu__label">Force magnétique</span>
                <div className="toolbar-menu__slider-group">
                  <input
                    type="range"
                    className="toolbar-menu__slider"
                    value={grid.magneticStrength}
                    onChange={handleMagneticStrengthChange}
                    min="10"
                    max="50"
                    disabled={!grid.magneticEnabled}
                    aria-label="Force magnétique"
                  />
                  <span className="toolbar-menu__value">{grid.magneticStrength}px</span>
                </div>
              </label>
            </div>

            <div className="toolbar-menu__item">
              <label className="toolbar-menu__control">
                <span className="toolbar-menu__label">Rayon magnétique</span>
                <div className="toolbar-menu__slider-group">
                  <input
                    type="range"
                    className="toolbar-menu__slider"
                    value={grid.magneticRadius}
                    onChange={handleMagneticRadiusChange}
                    min="20"
                    max="100"
                    disabled={!grid.magneticEnabled}
                    aria-label="Rayon magnétique"
                  />
                  <span className="toolbar-menu__value">{grid.magneticRadius}px</span>
                </div>
              </label>
            </div>

            {grid.magneticEnabled && (
              <div className="toolbar-menu__help">
                <p>La grille magnétique attire automatiquement les éléments vers les points de grille et autres éléments pour faciliter l'alignement.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};