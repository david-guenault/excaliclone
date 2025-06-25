// ABOUTME: Left side properties panel for element styling and manipulation
// ABOUTME: Conditionally visible based on element selection state

import React from 'react';
import { useAppStore } from '../../store';
import './PropertiesPanel.css';

export const PropertiesPanel: React.FC = () => {
  const { 
    ui, 
    selectedElementIds, 
    elements,
    setPropertiesPanelWidth,
    clearSelection 
  } = useAppStore();

  const selectedElements = elements.filter(el => 
    selectedElementIds.includes(el.id)
  );

  if (!ui.propertiesPanel.visible || selectedElements.length === 0) {
    return null;
  }

  const handlePanelResize = (e: React.MouseEvent) => {
    e.preventDefault();
    
    const startX = e.clientX;
    const startWidth = ui.propertiesPanel.width;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const newWidth = startWidth + deltaX;
      setPropertiesPanelWidth(newWidth);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const isMultipleSelection = selectedElements.length > 1;
  const singleElement = selectedElements[0];

  return (
    <div 
      className="properties-panel"
      style={{ width: ui.propertiesPanel.width }}
    >
      <div className="properties-panel__header">
        <h3 className="properties-panel__title">
          {isMultipleSelection 
            ? `${selectedElements.length} elements selected`
            : `${singleElement?.type || 'Element'} properties`
          }
        </h3>
        <button
          className="properties-panel__close"
          onClick={clearSelection}
          aria-label="Clear selection"
        >
          ×
        </button>
      </div>

      <div className="properties-panel__content">
        {isMultipleSelection ? (
          <div className="properties-panel__multi-selection">
            <p>Multiple elements selected</p>
            <div className="properties-panel__element-list">
              {selectedElements.map((element, index) => (
                <div key={element.id} className="properties-panel__element-item">
                  {element.type} {index + 1}
                </div>
              ))}
            </div>
          </div>
        ) : singleElement ? (
          <div className="properties-panel__single-selection">
            <div className="properties-panel__section">
              <h4 className="properties-panel__section-title">Position</h4>
              <div className="properties-panel__field-group">
                <div className="properties-panel__field">
                  <label>X</label>
                  <span>{Math.round(singleElement.x)}</span>
                </div>
                <div className="properties-panel__field">
                  <label>Y</label>
                  <span>{Math.round(singleElement.y)}</span>
                </div>
              </div>
            </div>

            <div className="properties-panel__section">
              <h4 className="properties-panel__section-title">Size</h4>
              <div className="properties-panel__field-group">
                <div className="properties-panel__field">
                  <label>Width</label>
                  <span>{Math.round(singleElement.width)}</span>
                </div>
                <div className="properties-panel__field">
                  <label>Height</label>
                  <span>{Math.round(singleElement.height)}</span>
                </div>
              </div>
            </div>

            <div className="properties-panel__section">
              <h4 className="properties-panel__section-title">Style</h4>
              <div className="properties-panel__field">
                <label>Stroke Color</label>
                <div className="properties-panel__color-preview">
                  <div 
                    className="properties-panel__color-swatch"
                    style={{ backgroundColor: singleElement.strokeColor }}
                  />
                  <span>{singleElement.strokeColor}</span>
                </div>
              </div>
              
              <div className="properties-panel__field">
                <label>Background</label>
                <div className="properties-panel__color-preview">
                  <div 
                    className="properties-panel__color-swatch"
                    style={{ 
                      backgroundColor: singleElement.backgroundColor === 'transparent' 
                        ? '#ffffff' 
                        : singleElement.backgroundColor,
                      border: singleElement.backgroundColor === 'transparent'
                        ? '1px solid #ccc'
                        : 'none'
                    }}
                  />
                  <span>{singleElement.backgroundColor}</span>
                </div>
              </div>
              
              <div className="properties-panel__field">
                <label>Stroke Width</label>
                <span>{singleElement.strokeWidth}px</span>
              </div>
              
              <div className="properties-panel__field">
                <label>Opacity</label>
                <span>{Math.round(singleElement.opacity * 100)}%</span>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div 
        className="properties-panel__resize-handle"
        onMouseDown={handlePanelResize}
      />
    </div>
  );
};