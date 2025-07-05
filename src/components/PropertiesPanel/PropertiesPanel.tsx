// ABOUTME: Redesigned properties panel based on design_examples/properties1.png + properties2.png
// ABOUTME: Fixed 200px width with dual color palettes and preset-only controls

import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store';
import { 
  PROPERTIES_PANEL_CONFIG,
  PANEL_STROKE_COLORS,
  PANEL_BACKGROUND_COLORS, 
  FILL_PATTERNS,
  STROKE_WIDTH_PRESETS,
  STROKE_STYLE_PRESETS,
  ROUGHNESS_SIMPLE_PRESETS,
  CORNER_STYLE_PRESETS,
  FONT_SIZE_PRESETS,
  FONT_FAMILY_PRESETS,
  SYSTEM_FONTS,
  FONT_WEIGHT_PRESETS,
  FONT_STYLE_PRESETS,
  TEXT_DECORATION_PRESETS,
  DEFAULT_ARROWHEADS,
  ARROWHEAD_TYPES
} from '../../constants';
import type { StrokeStyle, FillStyle, CornerStyle, TextAlign, FontWeight, FontStyle, TextDecoration, ArrowheadType } from '../../types';
import { SimpleColorPalette } from './SimpleColorPalette';
import { fontManager } from '../../utils/fontManager';
import './PropertiesPanel.css';
import './SimpleColorPalette.css';

export const PropertiesPanel: React.FC = () => {
  const { 
    ui, 
    selectedElementIds, 
    elements,
    clearSelection,
    updateElement,
    deleteElement,
    duplicateElement,
    bringForward,
    sendBackward,
    bringToFront,
    sendToBack,
    toggleElementLock,
    copyStyle,
    pasteStyle
  } = useAppStore();

  // Font management state
  const [availableFonts, setAvailableFonts] = useState<Array<{name: string, value: string, isCustom: boolean}>>([]);
  const [fontsLoading, setFontsLoading] = useState(false);

  // Load available fonts on component mount
  useEffect(() => {
    const loadFonts = async () => {
      setFontsLoading(true);
      try {
        // Load custom fonts manifest
        await fontManager.loadManifest();
        
        // Get system fonts
        const systemFonts = FONT_FAMILY_PRESETS.map(font => ({
          name: font.name,
          value: font.value,
          isCustom: false
        }));
        
        // Get custom fonts
        const customFontFamilies = fontManager.getAvailableFontFamilies();
        const customFonts = customFontFamilies.map(family => {
          const details = fontManager.getFontDetails(family);
          return {
            name: details?.displayName || family,
            value: family,
            isCustom: true
          };
        });
        
        // Combine system and custom fonts
        setAvailableFonts([...systemFonts, ...customFonts]);
        
        // Preload regular variants of custom fonts for better performance
        await fontManager.preloadRegularVariants();
      } catch (error) {
        console.warn('Error loading fonts:', error);
        // Fallback to system fonts only
        setAvailableFonts(FONT_FAMILY_PRESETS.map(font => ({
          name: font.name,
          value: font.value,
          isCustom: false
        })));
      } finally {
        setFontsLoading(false);
      }
    };
    
    loadFonts();
  }, []);

  const selectedElements = elements.filter(el => 
    selectedElementIds.includes(el.id)
  );

  if (!ui.propertiesPanel.visible || selectedElements.length === 0) {
    return null;
  }

  const isMultipleSelection = selectedElements.length > 1;
  const singleElement = selectedElements[0];

  // Helper function to update element properties
  const updateElementProperty = (property: string, value: any) => {
    if (isMultipleSelection) {
      selectedElementIds.forEach(id => {
        updateElement(id, { [property]: value });
      });
    } else if (singleElement) {
      updateElement(singleElement.id, { [property]: value });
    }
  };

  // Helper function to get current value for multi-selection
  const getCurrentValue = (property: string) => {
    if (isMultipleSelection) {
      const values = selectedElements.map(el => el[property as keyof typeof el]);
      const firstValue = values[0];
      return values.every(v => v === firstValue) ? firstValue : 'mixed';
    }
    return singleElement ? singleElement[property as keyof typeof singleElement] : undefined;
  };

  // Font change handler with lazy loading
  const handleFontFamilyChange = async (fontFamily: string) => {
    const customFont = availableFonts.find(font => font.value === fontFamily && font.isCustom);
    
    if (customFont) {
      // Ensure the font is loaded before applying
      const loaded = await fontManager.ensureFontLoaded(fontFamily);
      if (!loaded) {
        console.warn(`Failed to load font: ${fontFamily}`);
        return;
      }
    }
    
    // Apply the font to selected elements
    updateElementProperty('fontFamily', fontFamily);
  };

  return (
    <div 
      className="properties-panel"
      style={{ width: PROPERTIES_PANEL_CONFIG.WIDTH }}
    >
      {/* Header */}
      <div className="properties-panel__header">
        <h3 className="properties-panel__title">
          {isMultipleSelection 
            ? `${selectedElements.length} elements selected`
            : `${singleElement?.type || 'Element'}`
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
        {/* 1. Trait (Stroke Colors) */}
        <SimpleColorPalette
          label="Trait"
          predefinedColors={PANEL_STROKE_COLORS}
          currentColor={getCurrentValue('strokeColor') as string || '#000000'}
          onColorChange={(color) => updateElementProperty('strokeColor', color)}
        />

        {/* 2. Arrière-plan (Background Colors) */}
        <SimpleColorPalette
          label="Arrière-plan"
          predefinedColors={PANEL_BACKGROUND_COLORS}
          currentColor={getCurrentValue('backgroundColor') as string || 'transparent'}
          onColorChange={(color) => updateElementProperty('backgroundColor', color)}
        />

        {/* 3. Remplissage (Fill Pattern) */}
        <div className="properties-panel__section">
          <h4 className="properties-panel__section-title">Remplissage</h4>
          <div className="properties-panel__preset-row">
            {FILL_PATTERNS.map((pattern) => (
              <button
                key={pattern.type}
                className={`properties-panel__preset-button ${
                  getCurrentValue('fillStyle') === pattern.type ? 'active' : ''
                }`}
                onClick={() => updateElementProperty('fillStyle', pattern.type)}
                title={pattern.label}
              >
                <span className="pattern-icon">{pattern.icon}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 4. Largeur du contour (Stroke Width) */}
        <div className="properties-panel__section">
          <h4 className="properties-panel__section-title">Largeur du contour</h4>
          <div className="properties-panel__preset-row">
            {STROKE_WIDTH_PRESETS.map((width) => (
              <button
                key={width}
                className={`properties-panel__stroke-width-button ${
                  getCurrentValue('strokeWidth') === width ? 'active' : ''
                }`}
                onClick={() => updateElementProperty('strokeWidth', width)}
                aria-label={`Stroke width ${width}px`}
              >
                <div 
                  className="stroke-width-preview" 
                  style={{ height: `${width}px` }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* 5. Style du trait (Stroke Style) */}
        <div className="properties-panel__section">
          <h4 className="properties-panel__section-title">Style du trait</h4>
          <div className="properties-panel__preset-row">
            {STROKE_STYLE_PRESETS.map((style) => (
              <button
                key={style.type}
                className={`properties-panel__preset-button ${
                  getCurrentValue('strokeStyle') === style.type ? 'active' : ''
                }`}
                onClick={() => updateElementProperty('strokeStyle', style.type)}
                title={style.label}
              >
                <span className="stroke-style-preview">{style.preview}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 5. Extrémités (Arrowheads) - Contextual for lines and arrows */}
        {(singleElement?.type === 'line' || singleElement?.type === 'arrow' || 
          (isMultipleSelection && selectedElements.some(el => ['line', 'arrow'].includes(el.type)))) && (
          <div className="properties-panel__section">
            <h4 className="properties-panel__section-title">Extrémités</h4>
            <div className="properties-panel__arrowhead-row">
              <div className="properties-panel__arrowhead-group">
                <span className="properties-panel__arrowhead-label">Début</span>
                <div className="properties-panel__preset-row">
                  {ARROWHEAD_TYPES.map((arrowhead) => (
                    <button
                      key={`start-${arrowhead.type}`}
                      className={`properties-panel__preset-button ${
                        (getCurrentValue('startArrowhead') || 'none') === arrowhead.type ? 'active' : ''
                      }`}
                      onClick={() => updateElementProperty('startArrowhead', arrowhead.type)}
                      title={`Début: ${arrowhead.label}`}
                    >
                      <span className="arrowhead-preview arrowhead-start">
                        {arrowhead.icon || '○'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="properties-panel__arrowhead-group">
                <span className="properties-panel__arrowhead-label">Fin</span>
                <div className="properties-panel__preset-row">
                  {ARROWHEAD_TYPES.map((arrowhead) => (
                    <button
                      key={`end-${arrowhead.type}`}
                      className={`properties-panel__preset-button ${
                        (getCurrentValue('endArrowhead') || 'none') === arrowhead.type ? 'active' : ''
                      }`}
                      onClick={() => updateElementProperty('endArrowhead', arrowhead.type)}
                      title={`Fin: ${arrowhead.label}`}
                    >
                      <span className="arrowhead-preview arrowhead-end">
                        {arrowhead.icon || '○'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. Style de tracé (Roughness) */}
        <div className="properties-panel__section">
          <h4 className="properties-panel__section-title">Style de tracé</h4>
          <div className="properties-panel__opacity-slider">
            <span className="opacity-label">Lisse</span>
            <input
              type="range"
              min="0"
              max="3"
              step="0.1"
              value={getCurrentValue('roughness') as number || 1}
              onChange={(e) => updateElementProperty('roughness', parseFloat(e.target.value))}
              className="properties-panel__slider"
            />
            <span className="opacity-label">Rugueux</span>
          </div>
          <div className="properties-panel__value-display">
            Rugosité: {((getCurrentValue('roughness') as number) || 1).toFixed(1)}
          </div>
        </div>

        {/* 7. Angles (Corner Style) - Contextual for rectangles */}
        {(singleElement?.type === 'rectangle' || isMultipleSelection) && (
          <div className="properties-panel__section">
            <h4 className="properties-panel__section-title">Angles</h4>
            <div className="properties-panel__preset-row">
              {CORNER_STYLE_PRESETS.map((corner) => (
                <button
                  key={corner.type}
                  className={`properties-panel__preset-button ${
                    getCurrentValue('cornerStyle') === corner.type ? 'active' : ''
                  }`}
                  onClick={() => updateElementProperty('cornerStyle', corner.type)}
                  title={corner.label}
                >
                  <span className="corner-icon">{corner.icon}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 8-10. Typography sections - Contextual for elements with text */}
        {(singleElement && (singleElement.type === 'text' || singleElement.text) || 
          (isMultipleSelection && selectedElements.some(el => el.type === 'text' || el.text))) && (
          <>
            {/* 8. Famille de police */}
            <div className="properties-panel__section">
              <h4 className="properties-panel__section-title">
                Famille de police
                {fontsLoading && <span className="loading-indicator"> ⟳</span>}
              </h4>
              <select 
                className="properties-panel__select"
                value={getCurrentValue('fontFamily')}
                onChange={(e) => handleFontFamilyChange(e.target.value)}
                disabled={fontsLoading}
              >
                <optgroup label="Fontes Système">
                  {availableFonts.filter(font => !font.isCustom).map((font) => (
                    <option
                      key={font.name}
                      value={font.value}
                      style={{ fontFamily: font.value }}
                    >
                      {font.name}
                    </option>
                  ))}
                </optgroup>
                
                {availableFonts.filter(font => font.isCustom).length > 0 && (
                  <optgroup label="Fontes Personnalisées">
                    {availableFonts.filter(font => font.isCustom).map((font) => (
                      <option
                        key={font.name}
                        value={font.value}
                        style={{ fontFamily: font.value }}
                      >
                        {font.name}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            {/* 8b. Style de police */}
            <div className="properties-panel__section">
              <h4 className="properties-panel__section-title">Style de police</h4>
              <div className="properties-panel__preset-row">
                <button 
                  className={`properties-panel__preset-button ${
                    getCurrentValue('fontWeight') === 'bold' ? 'active' : ''
                  }`}
                  onClick={() => updateElementProperty('fontWeight', 
                    getCurrentValue('fontWeight') === 'bold' ? 'normal' : 'bold'
                  )}
                  title="Gras"
                >
                  <strong>B</strong>
                </button>
                <button 
                  className={`properties-panel__preset-button ${
                    getCurrentValue('fontStyle') === 'italic' ? 'active' : ''
                  }`}
                  onClick={() => updateElementProperty('fontStyle', 
                    getCurrentValue('fontStyle') === 'italic' ? 'normal' : 'italic'
                  )}
                  title="Italique"
                >
                  <em>I</em>
                </button>
                <button 
                  className={`properties-panel__preset-button ${
                    getCurrentValue('textDecoration') === 'underline' ? 'active' : ''
                  }`}
                  onClick={() => updateElementProperty('textDecoration', 
                    getCurrentValue('textDecoration') === 'underline' ? 'none' : 'underline'
                  )}
                  title="Souligné"
                >
                  <u>U</u>
                </button>
              </div>
            </div>

            {/* 9. Taille de la police (Font Size) */}
            <div className="properties-panel__section">
              <h4 className="properties-panel__section-title">Taille de la police</h4>
              <div className="properties-panel__preset-row">
                {FONT_SIZE_PRESETS.map((size) => (
                  <button
                    key={size.size}
                    className={`properties-panel__preset-button ${
                      getCurrentValue('fontSize') === size.value ? 'active' : ''
                    }`}
                    onClick={() => updateElementProperty('fontSize', size.value)}
                  >
                    {size.size}
                  </button>
                ))}
              </div>
            </div>

            {/* 10. Alignement du texte (Text Alignment) */}
            <div className="properties-panel__section">
              <h4 className="properties-panel__section-title">Alignement du texte</h4>
              <div className="properties-panel__preset-row">
                {(['left', 'center', 'right'] as TextAlign[]).map((align) => (
                  <button
                    key={align}
                    className={`properties-panel__preset-button ${
                      getCurrentValue('textAlign') === align ? 'active' : ''
                    }`}
                    onClick={() => updateElementProperty('textAlign', align)}
                    title={`Aligner à ${align === 'left' ? 'gauche' : align === 'center' ? 'centre' : 'droite'}`}
                  >
                    {align === 'left' && '⟵'}
                    {align === 'center' && '↔'}
                    {align === 'right' && '⟶'}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* 11. Transparence (Opacity) */}
        <div className="properties-panel__section">
          <h4 className="properties-panel__section-title">Transparence</h4>
          <div className="properties-panel__opacity-slider">
            <span className="opacity-label">0</span>
            <input
              type="range"
              min="0"
              max="100"
              value={(getCurrentValue('opacity') as number) * 100}
              onChange={(e) => updateElementProperty('opacity', parseFloat(e.target.value) / 100)}
              className="properties-panel__slider"
            />
            <span className="opacity-label">100</span>
          </div>
        </div>

        {/* 12. Disposition (Layer Management) */}
        <div className="properties-panel__section">
          <h4 className="properties-panel__section-title">Disposition</h4>
          <div className="properties-panel__preset-row">
            <button 
              className="properties-panel__layer-button"
              onClick={() => isMultipleSelection ? 
                selectedElementIds.forEach(sendToBack) : 
                sendToBack(singleElement.id)
              }
              title="Send to back"
            >
              ⬇
            </button>
            <button 
              className="properties-panel__layer-button"
              onClick={() => isMultipleSelection ? 
                selectedElementIds.forEach(sendBackward) : 
                sendBackward(singleElement.id)
              }
              title="Send backward"
            >
              ↓
            </button>
            <button 
              className="properties-panel__layer-button"
              onClick={() => isMultipleSelection ? 
                selectedElementIds.forEach(bringForward) : 
                bringForward(singleElement.id)
              }
              title="Bring forward"
            >
              ↑
            </button>
            <button 
              className="properties-panel__layer-button"
              onClick={() => isMultipleSelection ? 
                selectedElementIds.forEach(bringToFront) : 
                bringToFront(singleElement.id)
              }
              title="Bring to front"
            >
              ⬆
            </button>
          </div>
        </div>

        {/* 13. Actions (Element Operations) */}
        <div className="properties-panel__section">
          <h4 className="properties-panel__section-title">Actions</h4>
          <div className="properties-panel__preset-row">
            <button 
              className="properties-panel__action-button"
              onClick={copyStyle}
              title="Copy Style (Ctrl+Shift+C)"
            >
              🎨
            </button>
            <button 
              className="properties-panel__action-button"
              onClick={pasteStyle}
              title="Paste Style (Ctrl+Shift+V)"
            >
              🖌️
            </button>
            <button 
              className="properties-panel__action-button"
              onClick={() => isMultipleSelection ? 
                selectedElementIds.forEach(duplicateElement) : 
                duplicateElement(singleElement.id)
              }
              title="Duplicate"
            >
              📋
            </button>
            <button 
              className="properties-panel__action-button"
              onClick={() => isMultipleSelection ? 
                selectedElementIds.forEach(deleteElement) : 
                deleteElement(singleElement.id)
              }
              title="Delete"
            >
              🗑️
            </button>
            <button 
              className="properties-panel__action-button"
              onClick={() => isMultipleSelection ? 
                selectedElementIds.forEach(toggleElementLock) : 
                toggleElementLock(singleElement.id)
              }
              title={getCurrentValue('locked') ? 'Unlock' : 'Lock'}
            >
              {getCurrentValue('locked') ? '🔓' : '🔒'}
            </button>
            <button 
              className="properties-panel__action-button"
              title="Link"
            >
              🔗
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};