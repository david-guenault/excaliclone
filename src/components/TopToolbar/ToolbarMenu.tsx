// ABOUTME: Dropdown menu component for toolbar with grid controls
// ABOUTME: Contains application-level settings like grid visibility and snapping options

import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../store';
import './ToolbarMenu.css';

export const ToolbarMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const { 
    openGridDialog,
  } = useAppStore();

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

  const handleGridClick = () => {
    setIsOpen(false); // Close menu first
    openGridDialog(); // Then open dialog
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
        title="Menu des options"
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
          {/* Grid Menu Item */}
          <div className="toolbar-menu__section">
            <div className="toolbar-menu__item">
              <button
                className="toolbar-menu__action"
                onClick={handleGridClick}
                role="menuitem"
                aria-label="Configuration de la grille"
                title="Ouvrir les paramètres de grille"
              >
                <span className="toolbar-menu__icon">⊞</span>
                <span className="toolbar-menu__label">Grille...</span>
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};